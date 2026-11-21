import React, { useState } from 'react';
import {
  Bell,
  Building2,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  Moon,
  ShieldCheck,
  ShoppingBag,
  Sun,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { AppRoute } from '../types';

interface NavItem {
  id: AppRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accommodation', label: 'Accommodation', icon: Building2 },
  { id: 'roommates', label: 'Roommate Match', icon: Users },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'campus-hub', label: 'Campus Hub', icon: CalendarDays },
  { id: 'local-services', label: 'Local Services', icon: MapPin },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquareText },
];

const ROUTE_TITLES: Record<AppRoute, string> = {
  landing: 'Home',
  auth: 'Sign In',
  dashboard: 'Student Dashboard',
  accommodation: 'Accommodation Finder',
  roommates: 'AI Roommate Matching',
  marketplace: 'Student Marketplace',
  'campus-hub': 'Campus Hub',
  'local-services': 'Local Services',
  assistant: 'AI Campus Assistant',
  profile: 'Student Profile',
  admin: 'Admin Dashboard',
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    route,
    setRoute,
    theme,
    toggleTheme,
    account,
    isDemoMode,
    isAdmin,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
  } = useCampus();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigate = (target: AppRoute) => {
    setRoute(target);
    setMobileNavOpen(false);
    setNotifOpen(false);
  };

  const renderSidebarLinks = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => navigate('landing')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </span>
          <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            EzeCampus
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const active = route === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button
            type="button"
            onClick={() => navigate('profile')}
            aria-current={route === 'profile' ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              route === 'profile'
                ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
            }`}
          >
            <UserCircle2 className="w-4 h-4 shrink-0" />
            <span>Student Profile</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('admin')}
              aria-current={route === 'admin' ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                route === 'admin'
                  ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {account.displayName}
          </p>
          <p className="truncate">{account.college}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isDemoMode ? 'Demo Student Session · Bhilai' : isAdmin ? 'Verified Administrator' : 'Verified Student'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <button
              type="button"
              onClick={() => navigate('auth')}
              className="flex-1 px-3 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium transition-colors whitespace-nowrap"
            >
              Sign In with Google
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void logout()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30">
        {renderSidebarLinks()}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-xl z-10">
            {renderSidebarLinks()}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Contextual Workspace Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400">EzeCampus</span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700" aria-hidden="true">/</span>
              <span className="font-display font-semibold text-slate-900 dark:text-white truncate">
                {ROUTE_TITLES[route]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-expanded={notifOpen}
                className="relative p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded bg-indigo-700 text-white text-[10px] font-mono tabular-nums font-semibold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => void markAllNotificationsRead()}
                        className="text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => void markNotificationRead(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                            n.read ? 'opacity-70' : 'bg-indigo-50/40 dark:bg-indigo-950/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('assistant')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              Ask Campus AI
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
