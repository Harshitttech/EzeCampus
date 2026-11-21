import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  calculateRoommateCompatibility,
  canAccessAdmin,
  filterAccommodations,
  filterLocalServices,
  filterMarketplaceItems,
  filterOpportunities,
  formatINR,
  rankRoommates,
  sanitizeExternalUrl,
  validateMarketplaceDraft,
  validateProfileDraft,
} from './campusLogic';
import {
  DEMO_ACCOMMODATIONS,
  DEMO_LOCAL_SERVICES,
  DEMO_MARKETPLACE_ITEMS,
  DEMO_OPPORTUNITIES,
  DEMO_ROOMMATE_PROFILES,
} from '../data/demoData';

test('calculateRoommateCompatibility returns 100 for identical preferences', () => {
  const prefs = {
    budgetMax: 6500,
    foodPreference: 'veg' as const,
    sleepSchedule: 'early-bird' as const,
    studyHabit: 'silent' as const,
    cleanliness: 'strict' as const,
    lifestyle: 'quiet' as const,
  };
  const result = calculateRoommateCompatibility(prefs, prefs);
  assert.equal(result.score, 100);
  assert.equal(result.highlights.length, 3);
});

test('calculateRoommateCompatibility lowers score for opposite habits and wide budget gap', () => {
  const me = {
    budgetMax: 4500,
    foodPreference: 'veg' as const,
    sleepSchedule: 'early-bird' as const,
    studyHabit: 'silent' as const,
    cleanliness: 'strict' as const,
    lifestyle: 'quiet' as const,
  };
  const opposite = {
    budgetMax: 11000,
    foodPreference: 'non-veg' as const,
    sleepSchedule: 'night-owl' as const,
    studyHabit: 'group' as const,
    cleanliness: 'relaxed' as const,
    lifestyle: 'social' as const,
  };
  const result = calculateRoommateCompatibility(me, opposite);
  assert.ok(result.score < 40, `Expected score < 40, got ${result.score}`);
});

test('rankRoommates sorts candidates descending by compatibility and excludes self', () => {
  const me = {
    budgetMax: 7000,
    foodPreference: 'veg' as const,
    sleepSchedule: 'night-owl' as const,
    studyHabit: 'silent' as const,
    cleanliness: 'tidy' as const,
    lifestyle: 'quiet' as const,
  };
  const ranked = rankRoommates(me, DEMO_ROOMMATE_PROFILES, 'demo-student-2');
  assert.equal(ranked.some((r) => r.uid === 'demo-student-2'), false);
  assert.equal(ranked[0].uid, 'demo-student-1');
  for (let i = 1; i < ranked.length; i++) {
    assert.ok(ranked[i - 1].compatibility.score >= ranked[i].compatibility.score);
  }
});

test('filterAccommodations filters by locality, budget, amenities, and favourites', () => {
  const byLocality = filterAccommodations(DEMO_ACCOMMODATIONS, {
    query: 'Smriti Nagar',
    maxBudget: 7500,
    roomType: 'All',
    gender: 'All',
    requiredAmenities: ['Wi-Fi', '3-Time Mess'],
  });
  assert.equal(byLocality.length, 1);
  assert.equal(byLocality[0].id, 'acc-smriti-01');

  const favsOnly = filterAccommodations(DEMO_ACCOMMODATIONS, {
    query: '',
    maxBudget: 15000,
    roomType: 'All',
    gender: 'All',
    requiredAmenities: [],
    favouritesOnly: true,
    favouriteIds: new Set(['acc-nehru-02']),
  });
  assert.equal(favsOnly.length, 1);
  assert.equal(favsOnly[0].id, 'acc-nehru-02');
});

test('filterMarketplaceItems, filterOpportunities, and filterLocalServices work accurately', () => {
  const electronics = filterMarketplaceItems(DEMO_MARKETPLACE_ITEMS, {
    query: 'Casio',
    category: 'Electronics',
    condition: 'Like New',
    maxPrice: 1200,
  });
  assert.equal(electronics.length, 1);
  assert.equal(electronics[0].id, 'mkt-02');

  const internships = filterOpportunities(
    DEMO_OPPORTUNITIES,
    '',
    'Internship',
    false,
    new Set()
  );
  assert.equal(internships.length, 2);

  const studySpaces = filterLocalServices(DEMO_LOCAL_SERVICES, '', 'Study Space');
  assert.equal(studySpaces.length, 2);
});

test('validateMarketplaceDraft catches invalid fields and accepts valid listings', () => {
  const bad = validateMarketplaceDraft({
    title: 'A',
    category: 'Books',
    price: -50,
    condition: 'Good',
    locality: 'B',
    description: 'Too short',
  });
  assert.ok(bad.title);
  assert.ok(bad.price);
  assert.ok(bad.locality);
  assert.ok(bad.description);

  const good = validateMarketplaceDraft({
    title: 'Data Structures Textbook',
    category: 'Books',
    price: 350,
    condition: 'Good',
    locality: 'Smriti Nagar, Bhilai',
    description: 'Clean second-hand textbook with solved exercise notes.',
  });
  assert.equal(Object.keys(good).length, 0);
});

test('validateProfileDraft enforces schema bounds', () => {
  const invalid = validateProfileDraft({
    displayName: 'A',
    phone: '1234567890123456789012345',
    college: 'X',
    branch: 'CSE',
    year: '2nd',
    city: 'B',
  });
  assert.ok(invalid.displayName);
  assert.ok(invalid.phone);
  assert.ok(invalid.college);
  assert.ok(invalid.city);
});

test('canAccessAdmin enforces strict RBAC and email verification', () => {
  assert.equal(canAccessAdmin('student', 'student@college.edu', true), false);
  assert.equal(canAccessAdmin('admin', 'admin@ezecampus.in', false), false);
  assert.equal(canAccessAdmin('student', BOOTSTRAPPED_ADMIN_EMAIL, false), false);
  assert.equal(canAccessAdmin('student', BOOTSTRAPPED_ADMIN_EMAIL, true), true);
  assert.equal(canAccessAdmin('admin', 'ops@ezecampus.in', true), true);
});

test('formatINR and sanitizeExternalUrl protect formatting and URL schemes', () => {
  assert.equal(formatINR(6500), '₹6,500');
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeExternalUrl('data:text/html,hi'), null);
  assert.equal(sanitizeExternalUrl('https://example.org/event'), 'https://example.org/event');
});
