import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  APP_IMAGES,
  DEFAULT_GUEST_ACCOUNT,
  DEMO_ACCOMMODATIONS,
  DEMO_LOCAL_SERVICES,
  DEMO_MARKETPLACE_ITEMS,
  DEMO_NOTIFICATIONS,
  DEMO_OPPORTUNITIES,
  DEMO_REPORTS,
  DEMO_ROOMMATE_PROFILES,
  DEMO_USERS_DIRECTORY,
} from '../data/demoData';
import type {
  Accommodation,
  AppRoute,
  CampusOpportunity,
  ContentReport,
  Inquiry,
  LocalService,
  MarketplaceItem,
  RoommatePreferences,
  RoommateProfile,
  RoommateRequest,
  UserAccount,
  UserNotification,
} from '../types';
import { canAccessAdmin, type MarketplaceDraft, type ProfileDraft } from '../utils/campusLogic';

interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'error' | 'info';
}

interface CampusContextValue {
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  authReady: boolean;
  firebaseUser: FirebaseUser | null;
  account: UserAccount;
  isDemoMode: boolean;
  isAdmin: boolean;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  enterDemoStudent: () => void;
  logout: () => Promise<void>;
  // Data
  accommodations: Accommodation[];
  marketplaceItems: MarketplaceItem[];
  opportunities: CampusOpportunity[];
  localServices: LocalService[];
  roommateProfiles: RoommateProfile[];
  roommateRequests: RoommateRequest[];
  notifications: UserNotification[];
  inquiries: Inquiry[];
  reports: ContentReport[];
  usersDirectory: UserAccount[];
  favouriteAccommodationIds: Set<string>;
  bookmarkedOpportunityIds: Set<string>;
  myPreferences: RoommatePreferences;
  // Actions
  updatePreferences: (prefs: RoommatePreferences) => Promise<void>;
  updateProfile: (draft: ProfileDraft) => Promise<void>;
  toggleFavouriteAccommodation: (accId: string) => Promise<void>;
  toggleBookmarkOpportunity: (oppId: string) => Promise<void>;
  sendInquiry: (
    targetType: 'accommodation' | 'marketplace',
    targetId: string,
    targetTitle: string,
    message: string
  ) => Promise<void>;
  sendRoommateRequest: (
    receiver: RoommateProfile,
    compatibilityScore: number,
    message: string
  ) => Promise<void>;
  updateRoommateRequestStatus: (
    requestId: string,
    status: 'accepted' | 'declined' | 'withdrawn'
  ) => Promise<void>;
  createMarketplaceItem: (draft: MarketplaceDraft) => Promise<void>;
  updateMarketplaceItem: (
    itemId: string,
    draft: MarketplaceDraft,
    status: 'available' | 'sold'
  ) => Promise<void>;
  deleteMarketplaceItem: (itemId: string) => Promise<void>;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  submitContentReport: (
    targetType: ContentReport['targetType'],
    targetId: string,
    targetTitle: string,
    reason: string
  ) => Promise<void>;
  // Admin actions (RBAC enforced)
  adminCreateAccommodation: (item: Omit<Accommodation, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'isDemo' | 'status'>) => Promise<void>;
  adminToggleAccommodationStatus: (id: string) => Promise<void>;
  adminDeleteMarketplaceItem: (id: string) => Promise<void>;
  adminCreateOpportunity: (item: Omit<CampusOpportunity, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'isDemo' | 'status'>) => Promise<void>;
  adminDeleteOpportunity: (id: string) => Promise<void>;
  adminCreateLocalService: (item: Omit<LocalService, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'isDemo' | 'status'>) => Promise<void>;
  adminDeleteLocalService: (id: string) => Promise<void>;
  adminResolveReport: (reportId: string, status: 'resolved' | 'dismissed') => Promise<void>;
  adminUpdateUserRole: (uid: string, role: 'student' | 'admin') => Promise<void>;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  focusedAccommodationId: string | null;
  openAccommodationDetail: (id: string) => void;
  clearFocusedAccommodation: () => void;
}

const CampusContext = createContext<CampusContextValue | null>(null);

const STORAGE_KEYS = {
  theme: 'ezecampus_theme',
  favourites: 'ezecampus_demo_favs',
  bookmarks: 'ezecampus_demo_bookmarks',
  preferences: 'ezecampus_demo_prefs',
  marketplace: 'ezecampus_demo_marketplace',
  requests: 'ezecampus_demo_requests',
  profile: 'ezecampus_demo_profile',
};

const DEFAULT_PREFERENCES: RoommatePreferences = {
  budgetMax: 7000,
  foodPreference: 'veg',
  sleepSchedule: 'night-owl',
  studyHabit: 'silent',
  cleanliness: 'tidy',
  lifestyle: 'quiet',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function makeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return 'dashboard';
    return 'landing';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = readStorage<string>(STORAGE_KEYS.theme, 'light');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [account, setAccount] = useState<UserAccount>(() =>
    readStorage<UserAccount>(STORAGE_KEYS.profile, DEFAULT_GUEST_ACCOUNT)
  );

  const [accommodations, setAccommodations] = useState<Accommodation[]>(DEMO_ACCOMMODATIONS);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(() =>
    readStorage<MarketplaceItem[]>(STORAGE_KEYS.marketplace, DEMO_MARKETPLACE_ITEMS)
  );
  const [opportunities, setOpportunities] = useState<CampusOpportunity[]>(DEMO_OPPORTUNITIES);
  const [localServices, setLocalServices] = useState<LocalService[]>(DEMO_LOCAL_SERVICES);
  const [roommateProfiles, setRoommateProfiles] = useState<RoommateProfile[]>(DEMO_ROOMMATE_PROFILES);
  const [roommateRequests, setRoommateRequests] = useState<RoommateRequest[]>(() =>
    readStorage<RoommateRequest[]>(STORAGE_KEYS.requests, [])
  );
  const [notifications, setNotifications] = useState<UserNotification[]>(DEMO_NOTIFICATIONS);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reports, setReports] = useState<ContentReport[]>(DEMO_REPORTS);
  const [usersDirectory, setUsersDirectory] = useState<UserAccount[]>(DEMO_USERS_DIRECTORY);

  const [favouriteAccommodationIds, setFavouriteAccommodationIds] = useState<Set<string>>(
    () => new Set(readStorage<string[]>(STORAGE_KEYS.favourites, ['acc-smriti-01']))
  );
  const [bookmarkedOpportunityIds, setBookmarkedOpportunityIds] = useState<Set<string>>(
    () => new Set(readStorage<string[]>(STORAGE_KEYS.bookmarks, ['opp-01', 'opp-02']))
  );
  const [myPreferences, setMyPreferences] = useState<RoommatePreferences>(() =>
    readStorage<RoommatePreferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES)
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [focusedAccommodationId, setFocusedAccommodationId] = useState<string | null>(null);

  const openAccommodationDetail = useCallback((id: string) => {
    setFocusedAccommodationId(id);
    setRoute('accommodation');
  }, []);

  const clearFocusedAccommodation = useCallback(() => {
    setFocusedAccommodationId(null);
  }, []);

  const pushToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = makeDocId('toast');
    setToasts((prev) => [...prev.slice(-1), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const isDemoMode = !firebaseUser;
  const isAdmin = useMemo(
    () => canAccessAdmin(account.role, firebaseUser?.email, firebaseUser?.emailVerified),
    [account.role, firebaseUser]
  );

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as Partial<UserAccount>;
            const resolvedRole = canAccessAdmin(data.role, user.email, user.emailVerified)
              ? 'admin'
              : 'student';
            setAccount({
              uid: user.uid,
              displayName: data.displayName || user.displayName || 'Student',
              email: data.email || user.email || '',
              phone: data.phone || '',
              college: data.college || 'BIT Durg / Bhilai Campus',
              branch: data.branch || 'Computer Science & Engineering',
              year: data.year || '2nd Year',
              city: data.city || 'Bhilai, Chhattisgarh',
              role: resolvedRole,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } else {
            const initialRole = canAccessAdmin(undefined, user.email, user.emailVerified)
              ? 'admin'
              : 'student';
            const freshAccount: UserAccount = {
              uid: user.uid,
              displayName: (user.displayName || 'Bhilai Student').slice(0, 80),
              email: user.email || '',
              phone: '',
              college: 'BIT Durg / Bhilai Campus',
              branch: 'Computer Science & Engineering',
              year: '2nd Year',
              city: 'Bhilai, Chhattisgarh',
              role: initialRole,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            if (user.emailVerified) {
              await setDoc(userRef, {
                uid: freshAccount.uid,
                displayName: freshAccount.displayName,
                email: freshAccount.email,
                phone: freshAccount.phone,
                college: freshAccount.college,
                branch: freshAccount.branch,
                year: freshAccount.year,
                city: freshAccount.city,
                role: initialRole,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            setAccount(freshAccount);
          }
        } catch (err) {
          console.error('User profile bootstrap note:', err);
          setAccount({
            uid: user.uid,
            displayName: user.displayName || 'Bhilai Student',
            email: user.email || '',
            phone: '',
            college: 'BIT Durg / Bhilai Campus',
            branch: 'Computer Science & Engineering',
            year: '2nd Year',
            city: 'Bhilai, Chhattisgarh',
            role: canAccessAdmin(undefined, user.email, user.emailVerified) ? 'admin' : 'student',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setAccount(readStorage<UserAccount>(STORAGE_KEYS.profile, DEFAULT_GUEST_ACCOUNT));
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore real-time subscriptions when authenticated
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const unsubs: Array<() => void> = [];

    // Marketplace items (merge Firestore live listings with demo data)
    const mktQ = query(collection(db, 'marketplaceItems'), where('status', 'in', ['available', 'sold']));
    unsubs.push(
      onSnapshot(
        mktQ,
        (snap) => {
          const liveItems: MarketplaceItem[] = snap.docs.map((d) => {
            const raw = d.data();
            return {
              id: d.id,
              title: String(raw.title ?? ''),
              category: raw.category,
              price: Number(raw.price ?? 0),
              condition: raw.condition,
              description: String(raw.description ?? ''),
              locality: String(raw.locality ?? 'Bhilai'),
              sellerUid: String(raw.sellerUid ?? ''),
              sellerName: String(raw.sellerName ?? 'Student'),
              sellerCollege: String(raw.sellerCollege ?? 'Bhilai Campus'),
              imageUrl: String(raw.imageUrl || APP_IMAGES.marketplace),
              status: raw.status,
              isDemo: Boolean(raw.isDemo),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });
          const liveIds = new Set(liveItems.map((i) => i.id));
          setMarketplaceItems([...liveItems, ...DEMO_MARKETPLACE_ITEMS.filter((d) => !liveIds.has(d.id))]);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'marketplaceItems')
      )
    );

    // User Favourites
    const favQ = query(
      collection(db, 'users', firebaseUser.uid, 'favourites'),
      where('userId', '==', firebaseUser.uid)
    );
    unsubs.push(
      onSnapshot(
        favQ,
        (snap) => {
          const accSet = new Set<string>();
          const oppSet = new Set<string>();
          snap.docs.forEach((d) => {
            const raw = d.data();
            if (raw.targetType === 'accommodation') accSet.add(String(raw.targetId));
            if (raw.targetType === 'opportunity') oppSet.add(String(raw.targetId));
          });
          setFavouriteAccommodationIds(accSet);
          setBookmarkedOpportunityIds(oppSet);
        },
        (err) =>
          handleFirestoreError(err, OperationType.LIST, `users/${firebaseUser.uid}/favourites`)
      )
    );

    // Roommate Requests sent by user
    const sentReqQ = query(
      collection(db, 'roommateRequests'),
      where('senderUid', '==', firebaseUser.uid)
    );
    unsubs.push(
      onSnapshot(
        sentReqQ,
        (snap) => {
          const liveReqs: RoommateRequest[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              senderUid: String(r.senderUid),
              senderName: String(r.senderName),
              receiverUid: String(r.receiverUid),
              receiverName: String(r.receiverName),
              message: String(r.message),
              compatibilityScore: Number(r.compatibilityScore ?? 0),
              status: r.status,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });
          setRoommateRequests((prev) => {
            const received = prev.filter((item) => item.receiverUid === firebaseUser.uid);
            return [...liveReqs, ...received];
          });
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'roommateRequests')
      )
    );

    // Public active roommate profiles
    const profQ = query(collection(db, 'roommateProfiles'), where('isActive', '==', true));
    unsubs.push(
      onSnapshot(
        profQ,
        (snap) => {
          const liveProfiles: RoommateProfile[] = snap.docs.map((d) => {
            const r = d.data();
            return {
              uid: d.id,
              displayName: String(r.displayName ?? 'Student'),
              college: String(r.college ?? 'Bhilai Campus'),
              branch: String(r.branch ?? ''),
              year: String(r.year ?? ''),
              city: String(r.city ?? 'Bhilai'),
              budgetMax: Number(r.budgetMax ?? 6500),
              foodPreference: r.foodPreference,
              sleepSchedule: r.sleepSchedule,
              studyHabit: r.studyHabit,
              cleanliness: r.cleanliness,
              lifestyle: r.lifestyle,
              bio: String(r.bio ?? ''),
              isActive: Boolean(r.isActive),
              isDemo: Boolean(r.isDemo),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });
          const liveIds = new Set(liveProfiles.map((p) => p.uid));
          setRoommateProfiles([
            ...liveProfiles,
            ...DEMO_ROOMMATE_PROFILES.filter((p) => !liveIds.has(p.uid)),
          ]);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'roommateProfiles')
      )
    );

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [authReady, firebaseUser]);

  const signInWithGoogle = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      pushToast('Signed in with Google successfully.', 'success');
      setRoute('dashboard');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Google sign-in popup was closed or blocked.';
      setAuthError(msg);
      pushToast('Could not complete Google sign-in. You can continue in Demo Student mode.', 'error');
    } finally {
      setAuthLoading(false);
    }
  }, [pushToast]);

  const enterDemoStudent = useCallback(() => {
    setRoute('dashboard');
    pushToast('Exploring EzeCampus in Demo Student mode (Bhilai dataset).', 'info');
  }, [pushToast]);

  const logout = useCallback(async () => {
    if (firebaseUser) {
      await signOut(auth);
    }
    setRoute('landing');
    pushToast('Signed out of EzeCampus.', 'info');
  }, [firebaseUser, pushToast]);

  const updatePreferences = useCallback(
    async (prefs: RoommatePreferences) => {
      setMyPreferences(prefs);
      window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs));
      if (firebaseUser && firebaseUser.emailVerified) {
        const path = `roommateProfiles/${firebaseUser.uid}`;
        try {
          const ref = doc(db, 'roommateProfiles', firebaseUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            await updateDoc(ref, {
              ...prefs,
              displayName: account.displayName,
              college: account.college,
              branch: account.branch,
              year: account.year,
              city: account.city,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(ref, {
              uid: firebaseUser.uid,
              displayName: account.displayName,
              college: account.college,
              branch: account.branch,
              year: account.year,
              city: account.city,
              ...prefs,
              bio: 'Looking for a compatible student roommate in Bhilai.',
              isActive: true,
              isDemo: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
      pushToast('Roommate preferences saved and compatibility recalculated.', 'success');
    },
    [account, firebaseUser, pushToast]
  );

  const updateProfile = useCallback(
    async (draft: ProfileDraft) => {
      const updated: UserAccount = {
        ...account,
        displayName: draft.displayName.trim(),
        phone: draft.phone.trim(),
        college: draft.college.trim(),
        branch: draft.branch.trim(),
        year: draft.year.trim(),
        city: draft.city.trim(),
        updatedAt: new Date().toISOString(),
      };
      setAccount(updated);
      if (firebaseUser && firebaseUser.emailVerified) {
        const path = `users/${firebaseUser.uid}`;
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            displayName: updated.displayName,
            phone: updated.phone ?? '',
            college: updated.college,
            branch: updated.branch,
            year: updated.year,
            city: updated.city,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      } else {
        window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(updated));
      }
      pushToast('Student profile updated.', 'success');
    },
    [account, firebaseUser, pushToast]
  );

  const toggleFavouriteAccommodation = useCallback(
    async (accId: string) => {
      const exists = favouriteAccommodationIds.has(accId);
      const next = new Set(favouriteAccommodationIds);
      if (exists) next.delete(accId);
      else next.add(accId);
      setFavouriteAccommodationIds(next);

      if (firebaseUser && firebaseUser.emailVerified) {
        const favDocId = `acc-${accId}`;
        const path = `users/${firebaseUser.uid}/favourites/${favDocId}`;
        try {
          if (exists) {
            await deleteDoc(doc(db, 'users', firebaseUser.uid, 'favourites', favDocId));
          } else {
            await setDoc(doc(db, 'users', firebaseUser.uid, 'favourites', favDocId), {
              userId: firebaseUser.uid,
              targetId: accId,
              targetType: 'accommodation',
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      } else {
        window.localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify(Array.from(next)));
      }

      pushToast(
        exists ? 'Removed property from saved favourites.' : 'Saved property to your favourites.',
        'success'
      );
    },
    [favouriteAccommodationIds, firebaseUser, pushToast]
  );

  const toggleBookmarkOpportunity = useCallback(
    async (oppId: string) => {
      const exists = bookmarkedOpportunityIds.has(oppId);
      const next = new Set(bookmarkedOpportunityIds);
      if (exists) next.delete(oppId);
      else next.add(oppId);
      setBookmarkedOpportunityIds(next);

      if (firebaseUser && firebaseUser.emailVerified) {
        const favDocId = `opp-${oppId}`;
        const path = `users/${firebaseUser.uid}/favourites/${favDocId}`;
        try {
          if (exists) {
            await deleteDoc(doc(db, 'users', firebaseUser.uid, 'favourites', favDocId));
          } else {
            await setDoc(doc(db, 'users', firebaseUser.uid, 'favourites', favDocId), {
              userId: firebaseUser.uid,
              targetId: oppId,
              targetType: 'opportunity',
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      } else {
        window.localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(Array.from(next)));
      }

      pushToast(
        exists ? 'Removed opportunity bookmark.' : 'Opportunity bookmarked to your profile.',
        'success'
      );
    },
    [bookmarkedOpportunityIds, firebaseUser, pushToast]
  );

  const sendInquiry = useCallback(
    async (
      targetType: 'accommodation' | 'marketplace',
      targetId: string,
      targetTitle: string,
      message: string
    ) => {
      const id = makeDocId('inq');
      const newInquiry: Inquiry = {
        id,
        senderUid: account.uid,
        senderName: account.displayName,
        targetType,
        targetId,
        targetTitle,
        message: message.trim().slice(0, 500),
        status: 'sent',
        createdAt: new Date().toISOString(),
      };
      setInquiries((prev) => [newInquiry, ...prev]);

      if (firebaseUser && firebaseUser.emailVerified) {
        const path = `inquiries/${id}`;
        try {
          await setDoc(doc(db, 'inquiries', id), {
            senderUid: firebaseUser.uid,
            senderName: account.displayName.slice(0, 80),
            targetType,
            targetId,
            targetTitle: targetTitle.slice(0, 120),
            message: newInquiry.message,
            status: 'sent',
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      setNotifications((prev) => [
        {
          id: makeDocId('notif'),
          userId: account.uid,
          title: targetType === 'accommodation' ? 'Property Inquiry Sent' : 'Seller Message Sent',
          message: `Your message regarding "${targetTitle}" has been recorded.`,
          category: targetType === 'accommodation' ? 'system' : 'marketplace',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      pushToast(`Inquiry sent for ${targetTitle}.`, 'success');
    },
    [account, firebaseUser, pushToast]
  );

  const sendRoommateRequest = useCallback(
    async (receiver: RoommateProfile, compatibilityScore: number, message: string) => {
      const id = makeDocId('rmreq');
      const now = new Date().toISOString();
      const newReq: RoommateRequest = {
        id,
        senderUid: account.uid,
        senderName: account.displayName,
        receiverUid: receiver.uid,
        receiverName: receiver.displayName,
        message: message.trim().slice(0, 400),
        compatibilityScore,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      setRoommateRequests((prev) => {
        const next = [newReq, ...prev];
        if (!firebaseUser) {
          window.localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(next));
        }
        return next;
      });

      if (firebaseUser && firebaseUser.emailVerified) {
        const path = `roommateRequests/${id}`;
        try {
          await setDoc(doc(db, 'roommateRequests', id), {
            senderUid: firebaseUser.uid,
            senderName: account.displayName.slice(0, 80),
            receiverUid: receiver.uid,
            receiverName: receiver.displayName.slice(0, 80),
            message: newReq.message,
            compatibilityScore,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      setNotifications((prev) => [
        {
          id: makeDocId('notif'),
          userId: account.uid,
          title: 'Roommate Request Sent',
          message: `Invited ${receiver.displayName} (${compatibilityScore}% match) to connect.`,
          category: 'roommate',
          read: false,
          createdAt: now,
        },
        ...prev,
      ]);
      pushToast(`Roommate request sent to ${receiver.displayName}.`, 'success');
    },
    [account, firebaseUser, pushToast]
  );

  const updateRoommateRequestStatus = useCallback(
    async (requestId: string, status: 'accepted' | 'declined' | 'withdrawn') => {
      setRoommateRequests((prev) => {
        const next = prev.map((r) =>
          r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
        );
        if (!firebaseUser) {
          window.localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(next));
        }
        return next;
      });

      if (firebaseUser && firebaseUser.emailVerified) {
        const path = `roommateRequests/${requestId}`;
        try {
          await updateDoc(doc(db, 'roommateRequests', requestId), {
            status,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }

      pushToast(`Roommate request marked as ${status}.`, 'info');
    },
    [firebaseUser, pushToast]
  );

  const createMarketplaceItem = useCallback(
    async (draft: MarketplaceDraft) => {
      const id = makeDocId('mkt');
      const now = new Date().toISOString();
      const item: MarketplaceItem = {
        id,
        title: draft.title.trim(),
        category: draft.category,
        price: Number(draft.price),
        condition: draft.condition,
        description: draft.description.trim(),
        locality: draft.locality.trim(),
        sellerUid: account.uid,
        sellerName: account.displayName,
        sellerCollege: account.college,
        imageUrl: draft.category === 'Furniture' ? APP_IMAGES.pgRoom : APP_IMAGES.marketplace,
        status: 'available',
        isDemo: isDemoMode,
        createdAt: now,
        updatedAt: now,
      };

      setMarketplaceItems((prev) => {
        const next = [item, ...prev];
        if (!firebaseUser) {
          window.localStorage.setItem(STORAGE_KEYS.marketplace, JSON.stringify(next));
        }
        return next;
      });

      if (firebaseUser && firebaseUser.emailVerified) {
        const path = `marketplaceItems/${id}`;
        try {
          await setDoc(doc(db, 'marketplaceItems', id), {
            title: item.title,
            category: item.category,
            price: item.price,
            condition: item.condition,
            description: item.description,
            locality: item.locality,
            sellerUid: firebaseUser.uid,
            sellerName: account.displayName.slice(0, 80),
            sellerCollege: account.college.slice(0, 120),
            imageUrl: item.imageUrl,
            status: 'available',
            isDemo: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
      pushToast(`Listed "${item.title}" in the Student Marketplace.`, 'success');
    },
    [account, firebaseUser, isDemoMode, pushToast]
  );

  const updateMarketplaceItem = useCallback(
    async (itemId: string, draft: MarketplaceDraft, status: 'available' | 'sold') => {
      setMarketplaceItems((prev) => {
        const next = prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                title: draft.title.trim(),
                category: draft.category,
                price: Number(draft.price),
                condition: draft.condition,
                description: draft.description.trim(),
                locality: draft.locality.trim(),
                status,
                updatedAt: new Date().toISOString(),
              }
            : item
        );
        if (!firebaseUser) {
          window.localStorage.setItem(STORAGE_KEYS.marketplace, JSON.stringify(next));
        }
        return next;
      });

      if (firebaseUser && firebaseUser.emailVerified && !itemId.startsWith('mkt-0')) {
        const path = `marketplaceItems/${itemId}`;
        try {
          await updateDoc(doc(db, 'marketplaceItems', itemId), {
            title: draft.title.trim(),
            category: draft.category,
            price: Number(draft.price),
            condition: draft.condition,
            description: draft.description.trim(),
            locality: draft.locality.trim(),
            status,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }
      pushToast('Marketplace listing updated.', 'success');
    },
    [firebaseUser, pushToast]
  );

  const deleteMarketplaceItem = useCallback(
    async (itemId: string) => {
      setMarketplaceItems((prev) => {
        const next = prev.filter((item) => item.id !== itemId);
        if (!firebaseUser) {
          window.localStorage.setItem(STORAGE_KEYS.marketplace, JSON.stringify(next));
        }
        return next;
      });

      if (firebaseUser && firebaseUser.emailVerified && !itemId.startsWith('mkt-0')) {
        const path = `marketplaceItems/${itemId}`;
        try {
          await deleteDoc(doc(db, 'marketplaceItems', itemId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
      pushToast('Listing deleted.', 'info');
    },
    [firebaseUser, pushToast]
  );

  const markNotificationRead = useCallback(async (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    pushToast('All notifications marked as read.', 'info');
  }, [pushToast]);

  const submitContentReport = useCallback(
    async (
      targetType: ContentReport['targetType'],
      targetId: string,
      targetTitle: string,
      reason: string
    ) => {
      const id = makeDocId('rep');
      const now = new Date().toISOString();
      const newReport: ContentReport = {
        id,
        reporterUid: account.uid,
        targetType,
        targetId,
        targetTitle,
        reason: reason.trim().slice(0, 400),
        status: 'open',
        createdAt: now,
        updatedAt: now,
      };
      setReports((prev) => [newReport, ...prev]);

      if (firebaseUser && firebaseUser.emailVerified) {
        const path = `reports/${id}`;
        try {
          await setDoc(doc(db, 'reports', id), {
            reporterUid: firebaseUser.uid,
            targetType,
            targetId,
            targetTitle: targetTitle.slice(0, 120),
            reason: newReport.reason,
            status: 'open',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
      pushToast('Report submitted for administrator moderation.', 'info');
    },
    [account.uid, firebaseUser, pushToast]
  );

  // Admin actions — strictly gated by RBAC check
  const requireAdmin = useCallback(() => {
    if (!isAdmin) {
      pushToast('Administrator privileges required for this action.', 'error');
      return false;
    }
    return true;
  }, [isAdmin, pushToast]);

  const adminCreateAccommodation: CampusContextValue['adminCreateAccommodation'] = useCallback(
    async (item) => {
      if (!requireAdmin()) return;
      const id = makeDocId('acc');
      const now = new Date().toISOString();
      const created: Accommodation = {
        ...item,
        id,
        status: 'active',
        isDemo: false,
        createdBy: account.uid,
        createdAt: now,
        updatedAt: now,
      };
      setAccommodations((prev) => [created, ...prev]);
      if (firebaseUser) {
        const path = `accommodations/${id}`;
        try {
          await setDoc(doc(db, 'accommodations', id), {
            ...item,
            status: 'active',
            isDemo: false,
            createdBy: firebaseUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
      pushToast(`Added accommodation "${item.title}".`, 'success');
    },
    [account.uid, firebaseUser, pushToast, requireAdmin]
  );

  const adminToggleAccommodationStatus = useCallback(
    async (id: string) => {
      if (!requireAdmin()) return;
      setAccommodations((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: a.status === 'active' ? 'archived' : 'active' } : a
        )
      );
      pushToast('Accommodation listing status updated.', 'info');
    },
    [pushToast, requireAdmin]
  );

  const adminDeleteMarketplaceItem = useCallback(
    async (id: string) => {
      if (!requireAdmin()) return;
      await deleteMarketplaceItem(id);
    },
    [deleteMarketplaceItem, requireAdmin]
  );

  const adminCreateOpportunity: CampusContextValue['adminCreateOpportunity'] = useCallback(
    async (item) => {
      if (!requireAdmin()) return;
      const id = makeDocId('opp');
      const now = new Date().toISOString();
      setOpportunities((prev) => [
        {
          ...item,
          id,
          status: 'active',
          isDemo: false,
          createdBy: account.uid,
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]);
      pushToast(`Published campus opportunity "${item.title}".`, 'success');
    },
    [account.uid, pushToast, requireAdmin]
  );

  const adminDeleteOpportunity = useCallback(
    async (id: string) => {
      if (!requireAdmin()) return;
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      pushToast('Removed campus opportunity.', 'info');
    },
    [pushToast, requireAdmin]
  );

  const adminCreateLocalService: CampusContextValue['adminCreateLocalService'] = useCallback(
    async (item) => {
      if (!requireAdmin()) return;
      const id = makeDocId('srv');
      const now = new Date().toISOString();
      setLocalServices((prev) => [
        {
          ...item,
          id,
          status: 'active',
          isDemo: false,
          createdBy: account.uid,
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]);
      pushToast(`Added local service "${item.name}".`, 'success');
    },
    [account.uid, pushToast, requireAdmin]
  );

  const adminDeleteLocalService = useCallback(
    async (id: string) => {
      if (!requireAdmin()) return;
      setLocalServices((prev) => prev.filter((s) => s.id !== id));
      pushToast('Removed local service.', 'info');
    },
    [pushToast, requireAdmin]
  );

  const adminResolveReport = useCallback(
    async (reportId: string, status: 'resolved' | 'dismissed') => {
      if (!requireAdmin()) return;
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status, updatedAt: new Date().toISOString() } : r))
      );
      pushToast(`Report marked as ${status}.`, 'success');
    },
    [pushToast, requireAdmin]
  );

  const adminUpdateUserRole = useCallback(
    async (uid: string, role: 'student' | 'admin') => {
      if (!requireAdmin()) return;
      setUsersDirectory((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
      pushToast(`Updated account role to ${role}.`, 'info');
    },
    [pushToast, requireAdmin]
  );

  const value: CampusContextValue = {
    route,
    setRoute,
    theme,
    toggleTheme,
    authReady,
    firebaseUser,
    account,
    isDemoMode,
    isAdmin,
    authLoading,
    authError,
    signInWithGoogle,
    enterDemoStudent,
    logout,
    accommodations,
    marketplaceItems,
    opportunities,
    localServices,
    roommateProfiles,
    roommateRequests,
    notifications,
    inquiries,
    reports,
    usersDirectory,
    favouriteAccommodationIds,
    bookmarkedOpportunityIds,
    myPreferences,
    updatePreferences,
    updateProfile,
    toggleFavouriteAccommodation,
    toggleBookmarkOpportunity,
    sendInquiry,
    sendRoommateRequest,
    updateRoommateRequestStatus,
    createMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem,
    markNotificationRead,
    markAllNotificationsRead,
    submitContentReport,
    adminCreateAccommodation,
    adminToggleAccommodationStatus,
    adminDeleteMarketplaceItem,
    adminCreateOpportunity,
    adminDeleteOpportunity,
    adminCreateLocalService,
    adminDeleteLocalService,
    adminResolveReport,
    adminUpdateUserRole,
    toasts,
    dismissToast,
    focusedAccommodationId,
    openAccommodationDetail,
    clearFocusedAccommodation,
  };

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
};

export function useCampus(): CampusContextValue {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used inside CampusProvider');
  return ctx;
}
