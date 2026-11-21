export type UserRole = 'student' | 'admin';

export type AppRoute =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'accommodation'
  | 'roommates'
  | 'marketplace'
  | 'campus-hub'
  | 'local-services'
  | 'assistant'
  | 'profile'
  | 'admin';

export interface UserAccount {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  college: string;
  branch: string;
  year: string;
  city: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type FoodPreference = 'veg' | 'non-veg' | 'eggetarian' | 'flexible';
export type SleepSchedule = 'early-bird' | 'moderate' | 'night-owl';
export type StudyHabit = 'silent' | 'ambient' | 'group';
export type CleanlinessLevel = 'strict' | 'tidy' | 'relaxed';
export type LifestylePreference = 'quiet' | 'balanced' | 'social';

export interface RoommatePreferences {
  budgetMax: number;
  foodPreference: FoodPreference;
  sleepSchedule: SleepSchedule;
  studyHabit: StudyHabit;
  cleanliness: CleanlinessLevel;
  lifestyle: LifestylePreference;
}

export interface RoommateProfile extends RoommatePreferences {
  uid: string;
  displayName: string;
  college: string;
  branch: string;
  year: string;
  city: string;
  bio: string;
  isActive: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoommateRequestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface RoommateRequest {
  id: string;
  senderUid: string;
  senderName: string;
  receiverUid: string;
  receiverName: string;
  message: string;
  compatibilityScore: number;
  status: RoommateRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type AccommodationType = 'PG' | 'Hostel' | 'Rental Room';
export type RoomType = 'Single' | 'Double Sharing' | 'Triple Sharing' | '1RK Studio';
export type GenderPreference = 'Boys' | 'Girls' | 'Co-ed';

export interface Accommodation {
  id: string;
  title: string;
  type: AccommodationType;
  locality: string;
  address: string;
  rent: number;
  deposit: number;
  roomType: RoomType;
  genderPreference: GenderPreference;
  amenities: string[];
  description: string;
  ownerName: string;
  distanceToCampus: string;
  imageUrl: string;
  status: 'active' | 'archived';
  isDemo: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type MarketplaceCategory = 'Books' | 'Electronics' | 'Furniture' | 'Stationery';
export type ItemCondition = 'Like New' | 'Good' | 'Fair';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: MarketplaceCategory;
  price: number;
  condition: ItemCondition;
  description: string;
  locality: string;
  sellerUid: string;
  sellerName: string;
  sellerCollege: string;
  imageUrl: string;
  status: 'available' | 'sold' | 'removed';
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityCategory =
  | 'Event'
  | 'Hackathon'
  | 'Coding Competition'
  | 'Internship'
  | 'Workshop'
  | 'Scholarship'
  | 'Club';

export interface CampusOpportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  organizer: string;
  deadline: string;
  reward: string;
  location: string;
  registrationUrl: string;
  description: string;
  status: 'active' | 'archived';
  isDemo: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategory =
  | 'Food & Mess'
  | 'Stationery'
  | 'Printing'
  | 'Laundry'
  | 'Medical'
  | 'Transport'
  | 'Study Space';

export interface LocalService {
  id: string;
  name: string;
  category: ServiceCategory;
  locality: string;
  timings: string;
  priceRange: string;
  distanceToCampus: string;
  description: string;
  imageUrl?: string;
  status: 'active' | 'archived';
  isDemo: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'roommate' | 'marketplace' | 'campus' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  senderUid: string;
  senderName: string;
  targetType: 'accommodation' | 'marketplace';
  targetId: string;
  targetTitle: string;
  message: string;
  status: 'sent' | 'reviewed';
  createdAt: string;
}

export interface ContentReport {
  id: string;
  reporterUid: string;
  targetType: 'accommodation' | 'marketplace' | 'opportunity' | 'service' | 'profile';
  targetId: string;
  targetTitle: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  error?: boolean;
}
