import React, { useEffect, useMemo, useState } from 'react';
import {
  Flag,
  Heart,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { Accommodation, GenderPreference, RoomType } from '../types';
import { filterAccommodations, formatINR } from '../utils/campusLogic';
import { MediaImage } from '../components/MediaImage';

const AMENITY_OPTIONS = ['Wi-Fi', 'AC', '3-Time Mess', 'Power Backup', 'Laundry', 'Study Desk', 'CCTV'];
const ROOM_TYPES: Array<'All' | RoomType> = ['All', 'Single', 'Double Sharing', 'Triple Sharing', '1RK Studio'];
const GENDER_OPTIONS: Array<'All' | GenderPreference> = ['All', 'Boys', 'Girls', 'Co-ed'];

export const AccommodationPage: React.FC = () => {
  const {
    accommodations,
    favouriteAccommodationIds,
    toggleFavouriteAccommodation,
    sendInquiry,
    submitContentReport,
    focusedAccommodationId,
    clearFocusedAccommodation,
  } = useCampus();

  const [query, setQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState(12000);
  const [roomType, setRoomType] = useState<'All' | RoomType>('All');
  const [gender, setGender] = useState<'All' | GenderPreference>('All');
  const [requiredAmenities, setRequiredAmenities] = useState<string[]>([]);
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  const [selectedStay, setSelectedStay] = useState<Accommodation | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    if (!focusedAccommodationId) return;
    const match = accommodations.find((a) => a.id === focusedAccommodationId);
    if (match) {
      setSelectedStay(match);
    }
    clearFocusedAccommodation();
  }, [focusedAccommodationId, accommodations, clearFocusedAccommodation]);

  const filtered = useMemo(
    () =>
      filterAccommodations(accommodations, {
        query,
        maxBudget,
        roomType,
        gender,
        requiredAmenities,
        favouritesOnly,
        favouriteIds: favouriteAccommodationIds,
      }),
    [accommodations, query, maxBudget, roomType, gender, requiredAmenities, favouritesOnly, favouriteAccommodationIds]
  );

  const toggleAmenity = (amenity: string) => {
    setRequiredAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setQuery('');
    setMaxBudget(12000);
    setRoomType('All');
    setGender('All');
    setRequiredAmenities([]);
    setFavouritesOnly(false);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay) return;
    const trimmed = inquiryMessage.trim();
    if (trimmed.length < 5) {
      setInquiryError('Please enter at least 5 characters with your move-in date or question.');
      return;
    }
    setInquiryError(null);
    setSubmittingInquiry(true);
    try {
      await sendInquiry('accommodation', selectedStay.id, selectedStay.title, trimmed);
      setInquiryMessage('');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay || reportReason.trim().length < 5) return;
    await submitContentReport('accommodation', selectedStay.id, selectedStay.title, reportReason.trim());
    setReportReason('');
    setShowReportBox(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Accommodation Finder — Bhilai
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Discover student PGs, hostels, and rental rooms near BIT Durg, IIT Bhilai, Rungta RCET, and SSTC. Sample listings are clearly labeled as demo data.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFavouritesOnly((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap shrink-0 ${
            favouritesOnly
              ? 'bg-indigo-700 border-indigo-700 text-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${favouritesOnly ? 'fill-white' : ''}`} />
          Saved Favourites ({favouriteAccommodationIds.size})
        </button>
      </div>

      {/* Filter Bar */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label htmlFor="acc-search" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Search locality, PG name, or college
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="acc-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Smriti Nagar, Junwani, IIT Bhilai..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="acc-budget" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Max Monthly Budget:{' '}
              <span className="font-mono tabular-nums font-semibold text-indigo-700 dark:text-indigo-400">
                {formatINR(maxBudget)}
              </span>
            </label>
            <input
              id="acc-budget"
              type="range"
              min={4000}
              max={15000}
              step={500}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-indigo-700 mt-2"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="acc-room-type" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Room Type
            </label>
            <select
              id="acc-room-type"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as 'All' | RoomType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {ROOM_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="acc-gender" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Preference
            </label>
            <select
              id="acc-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'All' | GenderPreference)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Amenities:
            </span>
            {AMENITY_OPTIONS.map((amenity) => {
              const active = requiredAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-slate-500 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            Reset filters
          </button>
        </div>
      </section>

      {/* Results Header */}
      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
        Showing {filtered.length} of {accommodations.filter((a) => a.status === 'active').length} active Bhilai listings
      </p>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-display font-semibold text-base text-slate-900 dark:text-white">
            No matching accommodations found
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try increasing your monthly budget filter or clearing selected amenities.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((stay) => {
            const isFav = favouriteAccommodationIds.has(stay.id);
            return (
              <article
                key={stay.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
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
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stay.type} · {stay.roomType} · {stay.genderPreference}
                    {stay.isDemo ? ' · Demo Listing' : ''}
                  </p>
                  <h2 className="mt-1 font-display font-semibold text-base text-slate-900 dark:text-white">
                    {stay.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{stay.locality}</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {stay.amenities.join(' · ')}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-mono tabular-nums text-base font-bold text-slate-900 dark:text-white">
                        {formatINR(stay.rent)}
                        <span className="font-sans text-xs font-normal text-slate-500">/month</span>
                      </p>
                      <p className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                        Deposit {formatINR(stay.deposit)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStay(stay);
                        setInquiryMessage('');
                        setInquiryError(null);
                        setShowReportBox(false);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Property Details & Contact Owner Modal */}
      {selectedStay && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stay-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="aspect-[16/9] relative bg-slate-100 dark:bg-slate-800">
              <MediaImage
                src={selectedStay.imageUrl}
                alt={selectedStay.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedStay(null)}
                aria-label="Close property details"
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStay.type} · {selectedStay.roomType} · {selectedStay.genderPreference}
                    {selectedStay.isDemo ? ' · Demo Data (Sample Bhilai Property)' : ''}
                  </p>
                  <h2 id="stay-modal-title" className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                    {selectedStay.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {selectedStay.address}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono tabular-nums text-xl font-bold text-indigo-700 dark:text-indigo-400">
                    {formatINR(selectedStay.rent)}/mo
                  </p>
                  <p className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                    Security deposit: {formatINR(selectedStay.deposit)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedStay.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm py-4 border-y border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Campus Proximity</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {selectedStay.distanceToCampus}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Property Owner</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {selectedStay.ownerName}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Included Facilities</p>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {selectedStay.amenities.join(' · ')}
                  </p>
                </div>
              </div>

              {/* Contact Owner Form */}
              <form onSubmit={(e) => void handleSendInquiry(e)} className="space-y-3">
                <label htmlFor="owner-inquiry" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Contact Property Owner
                </label>
                <textarea
                  id="owner-inquiry"
                  rows={3}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Share your college name, expected move-in month, and preferred visit time..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {inquiryError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{inquiryError}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void toggleFavouriteAccommodation(selectedStay.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          favouriteAccommodationIds.has(selectedStay.id)
                            ? 'fill-rose-600 text-rose-600'
                            : ''
                        }`}
                      />
                      {favouriteAccommodationIds.has(selectedStay.id) ? 'Saved' : 'Save Property'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReportBox((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Report listing
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Inquiry
                  </button>
                </div>
              </form>

              {showReportBox && (
                <form
                  onSubmit={(e) => void handleReportSubmit(e)}
                  className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <label htmlFor="report-stay-reason" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Reason for reporting this listing
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="report-stay-reason"
                      type="text"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Outdated rent, incorrect locality, etc."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
