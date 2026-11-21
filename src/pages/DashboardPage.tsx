import React, { useMemo } from 'react';
import {
  ArrowRight,
  Bookmark,
  Building2,
  CalendarDays,
  Heart,
  MessageSquareText,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { formatINR, rankRoommates } from '../utils/campusLogic';
import { MediaImage } from '../components/MediaImage';

export const DashboardPage: React.FC = () => {
  const {
    account,
    isDemoMode,
    setRoute,
    accommodations,
    marketplaceItems,
    opportunities,
    roommateProfiles,
    myPreferences,
    favouriteAccommodationIds,
    bookmarkedOpportunityIds,
    notifications,
    markNotificationRead,
    toggleFavouriteAccommodation,
    toggleBookmarkOpportunity,
    openAccommodationDetail,
  } = useCampus();

  const topMatches = useMemo(
    () => rankRoommates(myPreferences, roommateProfiles, account.uid).slice(0, 3),
    [myPreferences, roommateProfiles, account.uid]
  );

  const recommendedStays = useMemo(
    () =>
      accommodations
        .filter((a) => a.status === 'active')
        .sort((a, b) => Math.abs(a.rent - myPreferences.budgetMax) - Math.abs(b.rent - myPreferences.budgetMax))
        .slice(0, 3),
    [accommodations, myPreferences.budgetMax]
  );

  const recentListings = useMemo(
    () => marketplaceItems.filter((m) => m.status === 'available').slice(0, 3),
    [marketplaceItems]
  );

  const upcomingEvents = useMemo(
    () =>
      opportunities
        .filter((o) => o.status === 'active' && o.category !== 'Internship')
        .slice(0, 3),
    [opportunities]
  );

  const recommendedInternships = useMemo(
    () =>
      opportunities
        .filter((o) => o.status === 'active' && o.category === 'Internship')
        .slice(0, 2),
    [opportunities]
  );

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-8">
      {/* Welcome & Student Profile Summary */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
              {account.college} · {account.branch} · {account.year}
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {account.displayName.split(' ')[0]}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
              {account.city} · Target rent up to{' '}
              <span className="font-mono tabular-nums font-medium text-slate-900 dark:text-white">
                {formatINR(myPreferences.budgetMax)}/mo
              </span>
              {isDemoMode ? ' · Demo student dataset active' : ' · Synced with Cloud Firestore'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setRoute('accommodation')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5" />
              Find PG / Hostel
            </button>
            <button
              type="button"
              onClick={() => setRoute('roommates')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" />
              Match Roommates
            </button>
            <button
              type="button"
              onClick={() => setRoute('marketplace')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Sell Item
            </button>
            <button
              type="button"
              onClick={() => setRoute('assistant')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              AI Assistant
            </button>
          </div>
        </div>

        {/* 4-column summary metrics */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Saved Accommodations</p>
            <p className="mt-1 font-mono tabular-nums text-2xl font-semibold text-slate-900 dark:text-white">
              {favouriteAccommodationIds.size}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Highest Roommate Match</p>
            <p className="mt-1 font-mono tabular-nums text-2xl font-semibold text-indigo-700 dark:text-indigo-400">
              {topMatches[0] ? `${topMatches[0].compatibility.score}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bookmarked Opportunities</p>
            <p className="mt-1 font-mono tabular-nums text-2xl font-semibold text-slate-900 dark:text-white">
              {bookmarkedOpportunityIds.size}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unread Notifications</p>
            <p className="mt-1 font-mono tabular-nums text-2xl font-semibold text-slate-900 dark:text-white">
              {unreadNotifications.length}
            </p>
          </div>
        </div>
      </section>

      {/* Recommended Accommodation */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Recommended Stays Around Bhilai
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matched to your {formatINR(myPreferences.budgetMax)} monthly budget · Demo Listings
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRoute('accommodation')}
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:underline whitespace-nowrap"
          >
            View all {accommodations.length}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendedStays.map((stay) => {
            const isFav = favouriteAccommodationIds.has(stay.id);
            return (
              <article
                key={stay.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-800">
                  <MediaImage
                    src={stay.imageUrl}
                    alt={stay.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => void toggleFavouriteAccommodation(stay.id)}
                    aria-label={isFav ? `Remove ${stay.title} from favourites` : `Save ${stay.title} to favourites`}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 shadow-sm hover:scale-105 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`}
                    />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stay.type} · {stay.roomType} · {stay.genderPreference}
                  </p>
                  <h3 className="mt-1 font-display font-semibold text-base text-slate-900 dark:text-white">
                    {stay.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stay.locality}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatINR(stay.rent)}
                      <span className="font-sans text-xs font-normal text-slate-500">/mo</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => openAccommodationDetail(stay.id)}
                      className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                    >
                      Inspect details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Two-column middle row: Suggested Roommates & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Suggested Roommates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by budget, food, sleep, study & cleanliness compatibility
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRoute('roommates')}
              className="text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              Open Matcher
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topMatches.map((m) => (
              <div key={m.uid} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {m.displayName}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      · {m.college}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Budget {formatINR(m.budgetMax)} · {m.foodPreference} · {m.sleepSchedule} · {m.studyHabit} study
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono tabular-nums text-base font-bold text-indigo-700 dark:text-indigo-400">
                    {m.compatibility.score}%
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">match</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Recent Notifications
            </h2>
            <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
              {unreadNotifications.length} unread
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.slice(0, 4).map((notif) => (
              <div key={notif.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    type="button"
                    onClick={() => void markNotificationRead(notif.id)}
                    className="text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom 3-part row: Marketplace, Upcoming Events & Internships */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Recent Marketplace Listings
            </h2>
            <button
              type="button"
              onClick={() => setRoute('marketplace')}
              className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Browse all
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentListings.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.category} · {item.condition} · {item.locality}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                  {formatINR(item.price)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Upcoming Events & Recommended Internships
            </h2>
            <button
              type="button"
              onClick={() => setRoute('campus-hub')}
              className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Open Campus Hub
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...recommendedInternships, ...upcomingEvents].slice(0, 4).map((opp) => {
              const saved = bookmarkedOpportunityIds.has(opp.id);
              return (
                <div key={opp.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                      {opp.category} · Deadline {opp.deadline}
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                      {opp.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {opp.organizer} · {opp.reward}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void toggleBookmarkOpportunity(opp.id)}
                    aria-label={saved ? `Remove bookmark for ${opp.title}` : `Bookmark ${opp.title}`}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${saved ? 'fill-indigo-700 text-indigo-700 dark:fill-indigo-400 dark:text-indigo-400' : ''}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
