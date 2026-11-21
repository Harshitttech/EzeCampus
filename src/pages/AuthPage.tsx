import React from 'react';
import { ArrowLeft, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export const AuthPage: React.FC = () => {
  const {
    setRoute,
    signInWithGoogle,
    enterDemoStudent,
    authLoading,
    authError,
    firebaseUser,
    isAdmin,
  } = useCampus();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={() => setRoute('landing')}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to EzeCampus Home
        </button>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-lg bg-indigo-700 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Sign in to EzeCampus
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                One Platform. Every Campus Need.
              </p>
            </div>
          </div>

          {firebaseUser ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 text-sm">
                <p className="font-medium text-slate-900 dark:text-white">
                  Signed in as {firebaseUser.displayName || firebaseUser.email}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Role: {isAdmin ? 'Verified Administrator' : 'Student'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoute('dashboard')}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                {authLoading ? 'Opening Google Sign-In...' : 'Continue with Google (Firebase Auth)'}
              </button>

              {authError && (
                <div
                  role="alert"
                  className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-700 dark:text-rose-300 leading-relaxed"
                >
                  {authError}
                </div>
              )}

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    Or explore immediately
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={enterDemoStudent}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-medium transition-colors"
              >
                Explore as Demo Student (Bhilai)
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    Firebase Authentication uses Google Sign-In by default to sync profiles,
                    favourites, roommate requests, and marketplace listings in Cloud Firestore.
                  </span>
                </p>
                <p>
                  Administrative moderation requires signing in with a verified administrator
                  account. Normal students cannot access admin controls.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
