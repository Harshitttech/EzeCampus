import React, { useState } from 'react';
import { Lock, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { APP_IMAGES } from '../data/demoData';
import type {
  AccommodationType,
  GenderPreference,
  OpportunityCategory,
  RoomType,
  ServiceCategory,
} from '../types';
import { formatINR } from '../utils/campusLogic';

type AdminTab = 'users' | 'accommodations' | 'marketplace' | 'events' | 'services' | 'reports';

export const AdminPage: React.FC = () => {
  const {
    isAdmin,
    setRoute,
    usersDirectory,
    accommodations,
    marketplaceItems,
    opportunities,
    localServices,
    reports,
    adminCreateAccommodation,
    adminToggleAccommodationStatus,
    adminDeleteMarketplaceItem,
    adminCreateOpportunity,
    adminDeleteOpportunity,
    adminCreateLocalService,
    adminDeleteLocalService,
    adminResolveReport,
    adminUpdateUserRole,
  } = useCampus();

  const [tab, setTab] = useState<AdminTab>('users');

  // Quick-add forms for admin tabs
  const [newAccTitle, setNewAccTitle] = useState('');
  const [newAccLocality, setNewAccLocality] = useState('Smriti Nagar, Bhilai');
  const [newAccRent, setNewAccRent] = useState(6500);
  const [newAccType, setNewAccType] = useState<AccommodationType>('PG');
  const [newAccRoom, setNewAccRoom] = useState<RoomType>('Double Sharing');
  const [newAccGender, setNewAccGender] = useState<GenderPreference>('Co-ed');

  const [newOppTitle, setNewOppTitle] = useState('');
  const [newOppCat, setNewOppCat] = useState<OpportunityCategory>('Hackathon');
  const [newOppOrganizer, setNewOppOrganizer] = useState('');
  const [newOppDeadline, setNewOppDeadline] = useState('2026-12-28');

  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState<ServiceCategory>('Study Space');
  const [newSrvLocality, setNewSrvLocality] = useState('Nehru Nagar, Bhilai');
  const [newSrvTimings, setNewSrvTimings] = useState('8:00 AM – 10:00 PM');

  // Strict RBAC Gate: Normal students cannot access admin functionality
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Administrator Access Restricted
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Role-based access control is enabled. Normal student accounts and demo sessions cannot
            access user management, catalog moderation, or reported content queues.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRoute('dashboard')}
              className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold"
            >
              Return to Dashboard
            </button>
            <button
              type="button"
              onClick={() => setRoute('auth')}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Admin Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openReportsCount = reports.filter((r) => r.status === 'open').length;

  const handleAddAccommodation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccTitle.trim().length < 3) return;
    await adminCreateAccommodation({
      title: newAccTitle.trim(),
      type: newAccType,
      locality: newAccLocality.trim(),
      address: `${newAccLocality.trim()}, Chhattisgarh`,
      rent: Number(newAccRent),
      deposit: Number(newAccRent),
      roomType: newAccRoom,
      genderPreference: newAccGender,
      amenities: ['Wi-Fi', 'RO Water', 'Power Backup'],
      description: 'Admin-added student residence listing in Bhilai.',
      ownerName: 'Campus Partner',
      distanceToCampus: '2.0 km from campus corridor',
      imageUrl: APP_IMAGES.pgRoom,
    });
    setNewAccTitle('');
  };

  const handleAddOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOppTitle.trim().length < 3 || newOppOrganizer.trim().length < 2) return;
    await adminCreateOpportunity({
      title: newOppTitle.trim(),
      category: newOppCat,
      organizer: newOppOrganizer.trim(),
      deadline: newOppDeadline,
      reward: 'Certificates & Merit Recognition',
      location: 'Bhilai, Chhattisgarh',
      registrationUrl: 'https://example.org/campus-event',
      description: 'Published via EzeCampus Admin Hub.',
    });
    setNewOppTitle('');
    setNewOppOrganizer('');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSrvName.trim().length < 2) return;
    await adminCreateLocalService({
      name: newSrvName.trim(),
      category: newSrvCat,
      locality: newSrvLocality.trim(),
      timings: newSrvTimings.trim(),
      priceRange: 'Student-friendly pricing',
      distanceToCampus: 'Near Bhilai campus hub',
      description: 'Added by EzeCampus administration.',
    });
    setNewSrvName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Operations Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified Administrator RBAC Session · Platform Moderation & Catalog Control
          </p>
        </div>
      </div>

      {/* Platform Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Users', value: usersDirectory.length },
          { label: 'Stays', value: accommodations.length },
          { label: 'Marketplace', value: marketplaceItems.length },
          { label: 'Opportunities', value: opportunities.length },
          { label: 'Services', value: localServices.length },
          { label: 'Open Reports', value: openReportsCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(
          [
            ['users', 'Users'],
            ['accommodations', 'Accommodations'],
            ['marketplace', 'Marketplace Moderation'],
            ['events', 'Campus Events'],
            ['services', 'Local Services'],
            ['reports', `Reported Content (${openReportsCount})`],
          ] as Array<[AdminTab, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === id
                ? 'bg-indigo-700 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'users' && (
        <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">College</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersDirectory.map((u) => (
                <tr key={u.uid}>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{u.displayName}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.college}</td>
                  <td className="py-3 px-4 capitalize font-medium text-indigo-700 dark:text-indigo-400">{u.role}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => void adminUpdateUserRole(u.uid, u.role === 'admin' ? 'student' : 'admin')}
                      className="text-xs font-medium text-slate-700 dark:text-slate-200 hover:underline"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'accommodations' && (
        <div className="space-y-5">
          <form
            onSubmit={(e) => void handleAddAccommodation(e)}
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <label htmlFor="adm-acc-title" className="block text-xs text-slate-500 mb-1">Property Name</label>
              <input
                id="adm-acc-title"
                type="text"
                value={newAccTitle}
                onChange={(e) => setNewAccTitle(e.target.value)}
                placeholder="New Bhilai PG name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-acc-loc" className="block text-xs text-slate-500 mb-1">Locality</label>
              <input
                id="adm-acc-loc"
                type="text"
                value={newAccLocality}
                onChange={(e) => setNewAccLocality(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-acc-rent" className="block text-xs text-slate-500 mb-1">Rent (₹)</label>
              <input
                id="adm-acc-rent"
                type="number"
                value={newAccRent}
                onChange={(e) => setNewAccRent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="adm-acc-type" className="block text-xs text-slate-500 mb-1">Type</label>
              <select
                id="adm-acc-type"
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as AccommodationType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Rental Room">Rental Room</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Stay
            </button>
          </form>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {accommodations.map((a) => (
              <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {a.locality} · <span className="font-mono tabular-nums">{formatINR(a.rent)}/mo</span> · Status: {a.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void adminToggleAccommodationStatus(a.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  {a.status === 'active' ? 'Archive' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'marketplace' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {marketplaceItems.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm text-slate-900 dark:text-white">{m.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {m.category} · <span className="font-mono tabular-nums">{formatINR(m.price)}</span> · Seller: {m.sellerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void adminDeleteMarketplaceItem(m.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'events' && (
        <div className="space-y-5">
          <form
            onSubmit={(e) => void handleAddOpportunity(e)}
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <label htmlFor="adm-opp-title" className="block text-xs text-slate-500 mb-1">Opportunity Title</label>
              <input
                id="adm-opp-title"
                type="text"
                value={newOppTitle}
                onChange={(e) => setNewOppTitle(e.target.value)}
                placeholder="e.g. Winter AI Bootcamp"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-opp-org" className="block text-xs text-slate-500 mb-1">Organizer</label>
              <input
                id="adm-opp-org"
                type="text"
                value={newOppOrganizer}
                onChange={(e) => setNewOppOrganizer(e.target.value)}
                placeholder="College / Club"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-opp-cat" className="block text-xs text-slate-500 mb-1">Category</label>
              <select
                id="adm-opp-cat"
                value={newOppCat}
                onChange={(e) => setNewOppCat(e.target.value as OpportunityCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Internship">Internship</option>
                <option value="Event">Event</option>
                <option value="Workshop">Workshop</option>
                <option value="Scholarship">Scholarship</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Publish
            </button>
          </form>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {opportunities.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{o.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {o.category} · {o.organizer} · Deadline {o.deadline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void adminDeleteOpportunity(o.id)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="space-y-5">
          <form
            onSubmit={(e) => void handleAddService(e)}
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <label htmlFor="adm-srv-name" className="block text-xs text-slate-500 mb-1">Service Name</label>
              <input
                id="adm-srv-name"
                type="text"
                value={newSrvName}
                onChange={(e) => setNewSrvName(e.target.value)}
                placeholder="e.g. Bhilai Book Depot"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-srv-cat" className="block text-xs text-slate-500 mb-1">Category</label>
              <select
                id="adm-srv-cat"
                value={newSrvCat}
                onChange={(e) => setNewSrvCat(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="Food & Mess">Food & Mess</option>
                <option value="Study Space">Study Space</option>
                <option value="Printing">Printing</option>
                <option value="Stationery">Stationery</option>
                <option value="Laundry">Laundry</option>
                <option value="Medical">Medical</option>
                <option value="Transport">Transport</option>
              </select>
            </div>
            <div>
              <label htmlFor="adm-srv-loc" className="block text-xs text-slate-500 mb-1">Locality</label>
              <input
                id="adm-srv-loc"
                type="text"
                value={newSrvLocality}
                onChange={(e) => setNewSrvLocality(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </form>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {localServices.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {s.category} · {s.locality} · {s.timings}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void adminDeleteLocalService(s.id)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {reports.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No content reports in queue.</p>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {rep.targetType} · Status: <span className="font-semibold text-slate-900 dark:text-white">{rep.status}</span>
                  </p>
                  <p className="font-medium text-sm text-slate-900 dark:text-white mt-0.5">{rep.targetTitle}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rep.reason}</p>
                </div>
                {rep.status === 'open' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void adminResolveReport(rep.id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => void adminResolveReport(rep.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
