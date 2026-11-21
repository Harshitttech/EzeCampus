import React, { useState } from 'react';
import { Bookmark, Check, Heart, ShoppingBag } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { formatINR, validateProfileDraft, type ProfileDraft } from '../utils/campusLogic';

export const ProfilePage: React.FC = () => {
  const {
    account,
    isDemoMode,
    isAdmin,
    updateProfile,
    accommodations,
    opportunities,
    marketplaceItems,
    favouriteAccommodationIds,
    bookmarkedOpportunityIds,
    toggleFavouriteAccommodation,
    toggleBookmarkOpportunity,
    setRoute,
  } = useCampus();

  const [draft, setDraft] = useState<ProfileDraft>({
    displayName: account.displayName,
    phone: account.phone || '',
    college: account.college,
    branch: account.branch,
    year: account.year,
    city: account.city,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const savedStays = accommodations.filter((a) => favouriteAccommodationIds.has(a.id));
  const savedOpps = opportunities.filter((o) => bookmarkedOpportunityIds.has(o.id));
  const myListings = marketplaceItems.filter((m) => m.sellerUid === account.uid);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfileDraft(draft);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await updateProfile(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Student Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your academic details, saved Bhilai stays, bookmarked opportunities, and active marketplace listings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editable Profile Form */}
        <form
          onSubmit={(e) => void handleSave(e)}
          noValidate
          className="lg:col-span-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Account & Campus Details
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isDemoMode ? 'Demo Session' : isAdmin ? 'Admin Role' : 'Student Role'}
            </span>
          </div>

          <div>
            <label htmlFor="prof-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Full Name
            </label>
            <input
              id="prof-name"
              type="text"
              value={draft.displayName}
              onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.displayName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-email" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Email (Read-Only)
              </label>
              <input
                id="prof-email"
                type="email"
                value={account.email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-sm text-slate-500"
              />
            </div>

            <div>
              <label htmlFor="prof-phone" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Phone Number (Private)
              </label>
              <input
                id="prof-phone"
                type="tel"
                value={draft.phone}
                onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="prof-college" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              College / University
            </label>
            <input
              id="prof-college"
              type="text"
              value={draft.college}
              onChange={(e) => setDraft((p) => ({ ...p, college: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
            {errors.college && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.college}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="prof-branch" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Branch / Stream
              </label>
              <input
                id="prof-branch"
                type="text"
                value={draft.branch}
                onChange={(e) => setDraft((p) => ({ ...p, branch: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
            <div>
              <label htmlFor="prof-year" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Academic Year
              </label>
              <select
                id="prof-year"
                value={draft.year}
                onChange={(e) => setDraft((p) => ({ ...p, year: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="prof-city" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Current City
            </label>
            <input
              id="prof-city"
              type="text"
              value={draft.city}
              onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
            {errors.city && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.city}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            <Check className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* Saved Items & Activity */}
        <div className="lg:col-span-6 space-y-6">
          <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600" />
                Saved Accommodations ({savedStays.length})
              </h2>
              <button
                type="button"
                onClick={() => setRoute('accommodation')}
                className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Explore more
              </button>
            </div>
            {savedStays.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No saved PGs or hostels yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {savedStays.map((s) => (
                  <div key={s.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {s.locality} · <span className="font-mono tabular-nums">{formatINR(s.rent)}/mo</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleFavouriteAccommodation(s.id)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Bookmarked Opportunities ({savedOpps.length})
              </h2>
              <button
                type="button"
                onClick={() => setRoute('campus-hub')}
                className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Open Hub
              </button>
            </div>
            {savedOpps.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No bookmarked events or internships yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {savedOpps.map((o) => (
                  <div key={o.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{o.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {o.category} · Deadline <span className="font-mono tabular-nums">{o.deadline}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleBookmarkOpportunity(o.id)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                My Marketplace Listings ({myListings.length})
              </h2>
              <button
                type="button"
                onClick={() => setRoute('marketplace')}
                className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Manage listings
              </button>
            </div>
            {myListings.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have not posted any marketplace items yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {myListings.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-slate-900 dark:text-white">{m.title}</span>
                    <span className="font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400">
                      {formatINR(m.price)} · {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
