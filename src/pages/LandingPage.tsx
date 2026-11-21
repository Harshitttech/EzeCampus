import React from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  GraduationCap,
  MapPin,
  MessageSquareText,
  Moon,
  ShoppingBag,
  Sun,
  Users,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { APP_IMAGES } from '../data/demoData';
import { MediaImage } from '../components/MediaImage';

export const LandingPage: React.FC = () => {
  const { setRoute, theme, toggleTheme, accommodations, marketplaceItems, opportunities, localServices } =
    useCampus();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Strict 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setRoute('landing')}
            className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </span>
            EzeCampus
          </button>

          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <button
              type="button"
              onClick={() => setRoute('accommodation')}
              className="hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              Accommodation
            </button>
            <button
              type="button"
              onClick={() => setRoute('roommates')}
              className="hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              Roommates
            </button>
            <button
              type="button"
              onClick={() => setRoute('marketplace')}
              className="hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              Marketplace
            </button>
            <button
              type="button"
              onClick={() => setRoute('campus-hub')}
              className="hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              Campus Hub
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setRoute('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
            >
              Open Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3">
              One Platform. Every Campus Need. · Bhilai Demonstration Edition
            </p>
            <h1
              className="font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-2xl"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.6rem)', textWrap: 'balance' }}
            >
              Settle into college life without juggling six fragmented apps.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              EzeCampus brings PG and hostel discovery, compatibility-scored roommate matching, a
              verified student buy-and-sell marketplace, hackathons and internships, Bhilai local
              essentials, and an AI campus guide into one workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setRoute('dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Explore Student Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRoute('auth')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Sign In with Google
              </button>
            </div>

            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              Includes realistic Bhilai demo listings (Smriti Nagar, Nehru Nagar, Junwani, Civic
              Centre) clearly labeled as demonstration data.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
              <MediaImage
                src={APP_IMAGES.hero}
                alt="Modern Indian university campus innovation courtyard at golden hour"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-column quantitative proof strip below hero split */}
        <div className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {accommodations.length}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Bhilai PGs, hostels & rooms (demo)
            </p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {marketplaceItems.length}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Student marketplace listings in INR
            </p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {opportunities.length}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Hackathons, internships & scholarships
            </p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {localServices.length}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Nearby Bhilai student services
            </p>
          </div>
        </div>
      </section>

      {/* Core Modules Asymmetric Bento */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Built for relocating students from day one on campus
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              Every module is connected to your student profile, saved favourites, and real-time
              preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-3">
                  <Building2 className="w-4 h-4" />
                  <span>01. Accommodation Finder</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                  Compare PGs, hostels & single rooms around Bhilai
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Filter by monthly budget in INR, room sharing type, mess meals, AC, and proximity
                  to BIT Durg, IIT Bhilai, Rungta RCET, and SSTC Junwani.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoute('accommodation')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  Browse Bhilai stays
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-3">
                  <Users className="w-4 h-4" />
                  <span>02. AI Roommate Matching</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                  Weighted compatibility across six daily living factors
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Match on budget range, vegetarian or flexible dining, sleep schedules, study
                  environment, cleanliness, and social rhythm — then send and manage requests.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoute('roommates')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  Calculate my matches
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>03. Student Marketplace</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Buy & sell textbooks, calculators & desks
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Post second-hand semester essentials with full edit, sold status, and direct
                  student inquiries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoute('marketplace')}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Open marketplace
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-3">
                  <CalendarDays className="w-4 h-4" />
                  <span>04. Campus Hub & Local Services</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Opportunities & daily Bhilai essentials
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Bookmark hackathons, internships, and scholarships alongside nearby messes,
                  printing shops, libraries, and pharmacies.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setRoute('campus-hub')}
                  className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  Campus Hub
                </button>
                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setRoute('local-services')}
                  className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  Local Services
                </button>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-3">
                  <MessageSquareText className="w-4 h-4" />
                  <span>05. AI Campus Assistant</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Instant guidance for campus relocation
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ask about Bhilai localities, PG checklists, compatible roommates, or upcoming
                  student hackathons.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoute('assistant')}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Chat with AI Assistant
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display font-semibold text-slate-900 dark:text-white">
              EzeCampus
            </span>
            <span aria-hidden="true">·</span>
            <span>Bhilai Campus Demo Ecosystem</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Bhilai, Chhattisgarh
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoute('auth')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Account Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
