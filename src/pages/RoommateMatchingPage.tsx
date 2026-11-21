import React, { useMemo, useState } from 'react';
import { Check, Send, Sliders, UserPlus, X } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type {
  CleanlinessLevel,
  FoodPreference,
  LifestylePreference,
  RoommatePreferences,
  RoommateProfile,
  SleepSchedule,
  StudyHabit,
} from '../types';
import { formatINR, rankRoommates } from '../utils/campusLogic';

export const RoommateMatchingPage: React.FC = () => {
  const {
    account,
    myPreferences,
    updatePreferences,
    roommateProfiles,
    roommateRequests,
    sendRoommateRequest,
    updateRoommateRequestStatus,
  } = useCampus();

  const [tab, setTab] = useState<'discover' | 'requests'>('discover');
  const [draftPrefs, setDraftPrefs] = useState<RoommatePreferences>(myPreferences);
  const [inviteTarget, setInviteTarget] = useState<(RoommateProfile & { score: number }) | null>(null);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const rankedMatches = useMemo(
    () => rankRoommates(draftPrefs, roommateProfiles, account.uid),
    [draftPrefs, roommateProfiles, account.uid]
  );

  const existingRequestFor = (targetUid: string) =>
    roommateRequests.find(
      (r) =>
        (r.senderUid === account.uid && r.receiverUid === targetUid) ||
        (r.receiverUid === account.uid && r.senderUid === targetUid)
    );

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences(draftPrefs);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTarget) return;
    if (inviteMsg.trim().length < 5) {
      setInviteError('Write a brief introduction (at least 5 characters) before sending.');
      return;
    }
    setInviteError(null);
    await sendRoommateRequest(inviteTarget, inviteTarget.score, inviteMsg.trim());
    setInviteTarget(null);
    setInviteMsg('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Roommate Matching
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Tune your budget and living habits to rank compatible students across Bhilai campuses.
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setTab('discover')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === 'discover'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Matches ({rankedMatches.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('requests')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Requests ({roommateRequests.length})
          </button>
        </div>
      </div>

      {tab === 'discover' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Preferences Editor */}
          <form
            onSubmit={(e) => void handleSavePreferences(e)}
            className="lg:col-span-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 lg:sticky lg:top-24"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              <h2 className="font-display font-semibold text-base text-slate-900 dark:text-white">
                Your Living Preferences
              </h2>
            </div>

            <div>
              <label htmlFor="pref-budget" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Monthly Rent Budget:{' '}
                <span className="font-mono tabular-nums font-semibold text-indigo-700 dark:text-indigo-400">
                  {formatINR(draftPrefs.budgetMax)}
                </span>
              </label>
              <input
                id="pref-budget"
                type="range"
                min={3500}
                max={12000}
                step={500}
                value={draftPrefs.budgetMax}
                onChange={(e) =>
                  setDraftPrefs((prev) => ({ ...prev, budgetMax: Number(e.target.value) }))
                }
                className="w-full accent-indigo-700"
              />
            </div>

            <div>
              <label htmlFor="pref-food" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Food Preference
              </label>
              <select
                id="pref-food"
                value={draftPrefs.foodPreference}
                onChange={(e) =>
                  setDraftPrefs((prev) => ({
                    ...prev,
                    foodPreference: e.target.value as FoodPreference,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="veg">Vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-sleep" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Sleeping Schedule
              </label>
              <select
                id="pref-sleep"
                value={draftPrefs.sleepSchedule}
                onChange={(e) =>
                  setDraftPrefs((prev) => ({
                    ...prev,
                    sleepSchedule: e.target.value as SleepSchedule,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="early-bird">Early Bird (Before 11 PM)</option>
                <option value="moderate">Moderate (11 PM – 12:30 AM)</option>
                <option value="night-owl">Night Owl (After 12:30 AM)</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-study" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Study Habits
              </label>
              <select
                id="pref-study"
                value={draftPrefs.studyHabit}
                onChange={(e) =>
                  setDraftPrefs((prev) => ({
                    ...prev,
                    studyHabit: e.target.value as StudyHabit,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="silent">Silent Solo Focus</option>
                <option value="ambient">Light Ambient / Headphones</option>
                <option value="group">Collaborative / Group Study</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-clean" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Cleanliness Standard
              </label>
              <select
                id="pref-clean"
                value={draftPrefs.cleanliness}
                onChange={(e) =>
                  setDraftPrefs((prev) => ({
                    ...prev,
                    cleanliness: e.target.value as CleanlinessLevel,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="strict">Strict & Spotless</option>
                <option value="tidy">Tidy & Organized</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-life" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Lifestyle Pace
              </label>
              <select
                id="pref-life"
                value={draftPrefs.lifestyle}
                onChange={(e) =>
                  setDraftPrefs((prev) => ({
                    ...prev,
                    lifestyle: e.target.value as LifestylePreference,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="quiet">Quiet & Private</option>
                <option value="balanced">Balanced</option>
                <option value="social">Social & Outgoing</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Preferences
            </button>
          </form>

          {/* Ranked Match Cards */}
          <div className="lg:col-span-8 space-y-4">
            {rankedMatches.map((candidate) => {
              const req = existingRequestFor(candidate.uid);
              const { score, breakdown, highlights } = candidate.compatibility;

              return (
                <article
                  key={candidate.uid}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {candidate.college} · {candidate.branch}
                        {candidate.isDemo ? ' · Demo Profile' : ''}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-white">
                        {candidate.displayName}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {candidate.bio}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="font-mono tabular-nums text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                        {score}%
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Compatibility</p>
                    </div>
                  </div>

                  {/* Factor breakdown bar */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Budget</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900 dark:text-white">
                        {formatINR(candidate.budgetMax)} ({breakdown.budget}/25)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Food</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {candidate.foodPreference}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Sleep</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {candidate.sleepSchedule.replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Study</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {candidate.studyHabit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Cleanliness</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {candidate.cleanliness}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Lifestyle</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">
                        {candidate.lifestyle}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {highlights.length > 0
                        ? `Strong alignment: ${highlights.join(' · ')}`
                        : 'Moderate alignment across core living habits'}
                    </p>

                    {req ? (
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 capitalize">
                        Request {req.status}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setInviteTarget({ ...candidate, score });
                          setInviteMsg(
                            `Hi ${candidate.displayName.split(' ')[0]}, we have a ${score}% match on EzeCampus! Are you still looking for a roommate in Bhilai?`
                          );
                          setInviteError(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Send Roommate Request
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        /* Requests Management Tab */
        <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Your Roommate Requests
          </h2>
          {roommateRequests.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                No roommate requests yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Explore compatibility matches and send an introduction to connect.
              </p>
              <button
                type="button"
                onClick={() => setTab('discover')}
                className="mt-4 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold"
              >
                Browse Matches
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {roommateRequests.map((req) => {
                const isSender = req.senderUid === account.uid;
                return (
                  <div
                    key={req.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isSender ? `Sent to ${req.receiverName}` : `Received from ${req.senderName}`} ·{' '}
                        <span className="font-mono tabular-nums">{req.compatibilityScore}% match</span> · Status:{' '}
                        <span className="font-semibold capitalize text-slate-900 dark:text-white">
                          {req.status}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{req.message}</p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isSender ? (
                          <button
                            type="button"
                            onClick={() => void updateRoommateRequestStatus(req.id, 'withdrawn')}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            Withdraw Request
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => void updateRoommateRequestStatus(req.id, 'accepted')}
                              className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => void updateRoommateRequestStatus(req.id, 'declined')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Send Request Modal */}
      {inviteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="invite-modal-title" className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                Connect with {inviteTarget.displayName}
              </h2>
              <button
                type="button"
                onClick={() => setInviteTarget(null)}
                aria-label="Close request modal"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {inviteTarget.college} · Compatibility Score:{' '}
              <span className="font-mono tabular-nums font-semibold text-indigo-700 dark:text-indigo-400">
                {inviteTarget.score}%
              </span>
            </p>
            <form onSubmit={(e) => void handleSendInvite(e)} className="space-y-3">
              <label htmlFor="invite-msg" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Introductory Message
              </label>
              <textarea
                id="invite-msg"
                rows={4}
                value={inviteMsg}
                onChange={(e) => setInviteMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
              {inviteError && <p className="text-xs text-rose-600 dark:text-rose-400">{inviteError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
