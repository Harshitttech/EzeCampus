import type {
  Accommodation,
  CampusOpportunity,
  GenderPreference,
  ItemCondition,
  LocalService,
  MarketplaceCategory,
  MarketplaceItem,
  OpportunityCategory,
  RoomType,
  RoommatePreferences,
  RoommateProfile,
  ServiceCategory,
  UserRole,
} from '../types';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'harshitkumar810271@gmail.com';

export interface CompatibilityResult {
  score: number;
  breakdown: {
    budget: number;
    food: number;
    sleep: number;
    study: number;
    cleanliness: number;
    lifestyle: number;
  };
  highlights: string[];
}

export function calculateRoommateCompatibility(
  me: RoommatePreferences,
  candidate: RoommatePreferences
): CompatibilityResult {
  const highlights: string[] = [];

  // Budget compatibility (weight: 25)
  const budgetDiff = Math.abs(me.budgetMax - candidate.budgetMax);
  let budget = 25;
  if (budgetDiff <= 500) {
    budget = 25;
    highlights.push('Matching monthly budget');
  } else if (budgetDiff <= 1500) {
    budget = 20;
    highlights.push('Close budget range');
  } else if (budgetDiff <= 3000) {
    budget = 13;
  } else {
    budget = 6;
  }

  // Food preference (weight: 15)
  let food = 6;
  if (me.foodPreference === candidate.foodPreference) {
    food = 15;
    highlights.push(`Shared ${me.foodPreference} food preference`);
  } else if (me.foodPreference === 'flexible' || candidate.foodPreference === 'flexible') {
    food = 13;
    highlights.push('Flexible dining habits');
  } else if (
    (me.foodPreference === 'veg' && candidate.foodPreference === 'eggetarian') ||
    (me.foodPreference === 'eggetarian' && candidate.foodPreference === 'veg') ||
    (me.foodPreference === 'eggetarian' && candidate.foodPreference === 'non-veg') ||
    (me.foodPreference === 'non-veg' && candidate.foodPreference === 'eggetarian')
  ) {
    food = 10;
  }

  // Sleep schedule (weight: 20)
  const sleepOrder = { 'early-bird': 0, moderate: 1, 'night-owl': 2 } as const;
  const sleepGap = Math.abs(sleepOrder[me.sleepSchedule] - sleepOrder[candidate.sleepSchedule]);
  let sleep = 6;
  if (sleepGap === 0) {
    sleep = 20;
    highlights.push('Same sleep rhythm');
  } else if (sleepGap === 1) {
    sleep = 13;
  }

  // Study habit (weight: 15)
  let study = 6;
  if (me.studyHabit === candidate.studyHabit) {
    study = 15;
    highlights.push('Aligned study environment');
  } else if (me.studyHabit === 'ambient' || candidate.studyHabit === 'ambient') {
    study = 11;
  }

  // Cleanliness (weight: 15)
  const cleanOrder = { strict: 0, tidy: 1, relaxed: 2 } as const;
  const cleanGap = Math.abs(cleanOrder[me.cleanliness] - cleanOrder[candidate.cleanliness]);
  let cleanliness = 5;
  if (cleanGap === 0) {
    cleanliness = 15;
    highlights.push('Matching room cleanliness');
  } else if (cleanGap === 1) {
    cleanliness = 10;
  }

  // Lifestyle (weight: 10)
  const lifeOrder = { quiet: 0, balanced: 1, social: 2 } as const;
  const lifeGap = Math.abs(lifeOrder[me.lifestyle] - lifeOrder[candidate.lifestyle]);
  let lifestyle = 3;
  if (lifeGap === 0) {
    lifestyle = 10;
    highlights.push('Compatible social pace');
  } else if (lifeGap === 1) {
    lifestyle = 7;
  }

  const score = Math.min(100, Math.max(0, Math.round(budget + food + sleep + study + cleanliness + lifestyle)));

  return {
    score,
    breakdown: { budget, food, sleep, study, cleanliness, lifestyle },
    highlights: highlights.slice(0, 3),
  };
}

export function rankRoommates(
  me: RoommatePreferences,
  profiles: RoommateProfile[],
  currentUid?: string
): Array<RoommateProfile & { compatibility: CompatibilityResult }> {
  return profiles
    .filter((p) => p.isActive && p.uid !== currentUid)
    .map((profile) => ({
      ...profile,
      compatibility: calculateRoommateCompatibility(me, profile),
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}

export interface AccommodationFilters {
  query: string;
  maxBudget: number;
  roomType: 'All' | RoomType;
  gender: 'All' | GenderPreference;
  requiredAmenities: string[];
  favouritesOnly?: boolean;
  favouriteIds?: Set<string>;
}

export function filterAccommodations(
  items: Accommodation[],
  filters: AccommodationFilters
): Accommodation[] {
  const q = filters.query.trim().toLowerCase();
  return items.filter((item) => {
    if (item.status !== 'active') return false;
    if (item.rent > filters.maxBudget) return false;
    if (filters.roomType !== 'All' && item.roomType !== filters.roomType) return false;
    if (filters.gender !== 'All' && item.genderPreference !== filters.gender) return false;
    if (filters.favouritesOnly && filters.favouriteIds && !filters.favouriteIds.has(item.id)) {
      return false;
    }
    if (
      filters.requiredAmenities.length > 0 &&
      !filters.requiredAmenities.every((amenity) => item.amenities.includes(amenity))
    ) {
      return false;
    }
    if (q) {
      const haystack = `${item.title} ${item.locality} ${item.address} ${item.type} ${item.distanceToCampus}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export interface MarketplaceFilters {
  query: string;
  category: 'All' | MarketplaceCategory;
  condition: 'All' | ItemCondition;
  maxPrice: number;
}

export function filterMarketplaceItems(
  items: MarketplaceItem[],
  filters: MarketplaceFilters
): MarketplaceItem[] {
  const q = filters.query.trim().toLowerCase();
  return items.filter((item) => {
    if (item.status === 'removed') return false;
    if (filters.category !== 'All' && item.category !== filters.category) return false;
    if (filters.condition !== 'All' && item.condition !== filters.condition) return false;
    if (item.price > filters.maxPrice) return false;
    if (q) {
      const haystack = `${item.title} ${item.description} ${item.locality} ${item.sellerName} ${item.sellerCollege}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function filterOpportunities(
  items: CampusOpportunity[],
  query: string,
  category: 'All' | OpportunityCategory,
  bookmarkedOnly: boolean,
  bookmarkedIds: Set<string>
): CampusOpportunity[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (item.status !== 'active') return false;
    if (category !== 'All' && item.category !== category) return false;
    if (bookmarkedOnly && !bookmarkedIds.has(item.id)) return false;
    if (q) {
      const haystack = `${item.title} ${item.organizer} ${item.location} ${item.description} ${item.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function filterLocalServices(
  items: LocalService[],
  query: string,
  category: 'All' | ServiceCategory
): LocalService[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (item.status !== 'active') return false;
    if (category !== 'All' && item.category !== category) return false;
    if (q) {
      const haystack = `${item.name} ${item.locality} ${item.description} ${item.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export interface MarketplaceDraft {
  title: string;
  category: MarketplaceCategory;
  price: number;
  condition: ItemCondition;
  locality: string;
  description: string;
}

export function validateMarketplaceDraft(draft: MarketplaceDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = draft.title.trim();
  const locality = draft.locality.trim();
  const description = draft.description.trim();

  if (title.length < 3 || title.length > 120) {
    errors.title = 'Title must be between 3 and 120 characters.';
  }
  if (!Number.isFinite(draft.price) || draft.price < 0 || draft.price > 500000) {
    errors.price = 'Price must be between ₹0 and ₹5,00,000.';
  }
  if (locality.length < 2 || locality.length > 80) {
    errors.locality = 'Enter a Bhilai locality (2–80 characters).';
  }
  if (description.length < 10 || description.length > 600) {
    errors.description = 'Description must be between 10 and 600 characters.';
  }
  return errors;
}

export interface ProfileDraft {
  displayName: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  city: string;
}

export function validateProfileDraft(draft: ProfileDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.displayName.trim().length < 2 || draft.displayName.trim().length > 80) {
    errors.displayName = 'Name must be between 2 and 80 characters.';
  }
  if (draft.phone.trim().length > 20) {
    errors.phone = 'Phone number cannot exceed 20 characters.';
  }
  if (draft.college.trim().length < 2 || draft.college.trim().length > 120) {
    errors.college = 'Enter your college or university name.';
  }
  if (draft.branch.trim().length > 80) {
    errors.branch = 'Branch name cannot exceed 80 characters.';
  }
  if (draft.city.trim().length < 2 || draft.city.trim().length > 60) {
    errors.city = 'City must be between 2 and 60 characters.';
  }
  return errors;
}

export function canAccessAdmin(
  role: UserRole | null | undefined,
  email?: string | null,
  emailVerified?: boolean
): boolean {
  if (role === 'admin' && emailVerified === true) {
    return true;
  }
  if (
    email &&
    email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
    emailVerified === true
  ) {
    return true;
  }
  return false;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sanitizeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}
