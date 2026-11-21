import React, { useMemo, useState } from 'react';
import { Clock, MapPin, Search } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { ServiceCategory } from '../types';
import { filterLocalServices } from '../utils/campusLogic';
import { MediaImage } from '../components/MediaImage';

const SERVICE_CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Food & Mess',
  'Study Space',
  'Printing',
  'Stationery',
  'Laundry',
  'Medical',
  'Transport',
];

export const LocalServicesPage: React.FC = () => {
  const { localServices } = useCampus();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | ServiceCategory>('All');

  const filtered = useMemo(
    () => filterLocalServices(localServices, query, category),
    [localServices, query, category]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Local Services — Bhilai Student Essentials
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Curated directory of messes, 24x7 study libraries, printing shops, stationery marts, laundry, pharmacies, and campus e-rickshaw routes. Sample entries are clearly marked as demo data.
        </p>
      </div>

      {/* Filters */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="relative">
          <label htmlFor="srv-search" className="sr-only">
            Search Bhilai local services
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="srv-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mess, thesis printing, laundry, pharmacy, Smriti Nagar..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SERVICE_CATEGORIES.map((cat) => (
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

      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
        Showing {filtered.length} local services in Bhilai
      </p>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-display font-semibold text-base text-slate-900 dark:text-white">
            No local services matched
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try switching categories or clearing your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((srv) => (
            <article
              key={srv.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              {srv.imageUrl && (
                <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
                  <MediaImage
                    src={srv.imageUrl}
                    alt={srv.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                  {srv.category} · {srv.distanceToCampus}
                  {srv.isDemo ? ' · Demo Listing' : ''}
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {srv.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {srv.description}
                </p>

                <div className="mt-auto pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{srv.locality}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{srv.timings}</span>
                  </p>
                  <p className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 pt-1">
                    {srv.priceRange}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
