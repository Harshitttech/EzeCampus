import React, { useMemo, useState } from 'react';
import { Bookmark, CalendarDays, ExternalLink, MapPin, Search } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { OpportunityCategory } from '../types';
import { filterOpportunities, sanitizeExternalUrl } from '../utils/campusLogic';

const CATEGORIES: Array<'All' | OpportunityCategory> = [
  'All',
  'Hackathon',
  'Internship',
  'Coding Competition',
  'Scholarship',
  'Workshop',
  'Event',
  'Club',
];

export const CampusHubPage: React.FC = () => {
  const { opportunities, bookmarkedOpportunityIds, toggleBookmarkOpportunity } = useCampus();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | OpportunityCategory>('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const filtered = useMemo(
    () =>
      filterOpportunities(
        opportunities,
        query,
        category,
        bookmarkedOnly,
        bookmarkedOpportunityIds
      ),
    [opportunities, query, category, bookmarkedOnly, bookmarkedOpportunityIds]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campus Hub — Opportunities & Events
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track hackathons, internships, coding competitions, workshops, scholarships, and student clubs across Bhilai and Chhattisgarh.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBookmarkedOnly((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap shrink-0 ${
            bookmarkedOnly
              ? 'bg-indigo-700 border-indigo-700 text-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarkedOnly ? 'fill-white' : ''}`} />
          Bookmarked ({bookmarkedOpportunityIds.size})
        </button>
      </div>

      {/* Filters */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="relative">
          <label htmlFor="hub-search" className="sr-only">
            Search campus opportunities
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="hub-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons, internships, scholarships, organizers..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Opportunities List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-display font-semibold text-base text-slate-900 dark:text-white">
            No opportunities found
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reset your category filter or search query to view all campus opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((opp) => {
            const bookmarked = bookmarkedOpportunityIds.has(opp.id);
            const safeHref = sanitizeExternalUrl(opp.registrationUrl);
            return (
              <article
                key={opp.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                        {opp.category} · Deadline{' '}
                        <span className="font-mono tabular-nums">{opp.deadline}</span>
                        {opp.isDemo ? ' · Demo Opportunity' : ''}
                      </p>
                      <h2 className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-white">
                        {opp.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => void toggleBookmarkOpportunity(opp.id)}
                      aria-label={bookmarked ? `Remove bookmark for ${opp.title}` : `Bookmark ${opp.title}`}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          bookmarked ? 'fill-indigo-700 text-indigo-700 dark:fill-indigo-400 dark:text-indigo-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span>Organizer: {opp.organizer}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{opp.location}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {opp.reward}
                  </span>

                  {safeHref && (
                    <a
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      Registration Info
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
