import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Send, Trash2, X } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import type { ItemCondition, MarketplaceCategory, MarketplaceItem } from '../types';
import {
  filterMarketplaceItems,
  formatINR,
  validateMarketplaceDraft,
  type MarketplaceDraft,
} from '../utils/campusLogic';
import { MediaImage } from '../components/MediaImage';

const CATEGORIES: Array<'All' | MarketplaceCategory> = [
  'All',
  'Books',
  'Electronics',
  'Furniture',
  'Stationery',
];
const CONDITIONS: Array<'All' | ItemCondition> = ['All', 'Like New', 'Good', 'Fair'];

const EMPTY_DRAFT: MarketplaceDraft = {
  title: '',
  category: 'Books',
  price: 0,
  condition: 'Good',
  locality: 'Smriti Nagar, Bhilai',
  description: '',
};

export const MarketplacePage: React.FC = () => {
  const {
    account,
    marketplaceItems,
    createMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem,
    sendInquiry,
  } = useCampus();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | MarketplaceCategory>('All');
  const [condition, setCondition] = useState<'All' | ItemCondition>('All');
  const [maxPrice, setMaxPrice] = useState(10000);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);
  const [draft, setDraft] = useState<MarketplaceDraft>(EMPTY_DRAFT);
  const [draftStatus, setDraftStatus] = useState<'available' | 'sold'>('available');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [sellerMessage, setSellerMessage] = useState('');
  const [sellerMsgError, setSellerMsgError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filterMarketplaceItems(marketplaceItems, {
        query,
        category,
        condition,
        maxPrice,
      }),
    [marketplaceItems, query, category, condition, maxPrice]
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setDraft(EMPTY_DRAFT);
    setDraftStatus('available');
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (item: MarketplaceItem) => {
    setEditingItem(item);
    setDraft({
      title: item.title,
      category: item.category,
      price: item.price,
      condition: item.condition,
      locality: item.locality,
      description: item.description,
    });
    setDraftStatus(item.status === 'sold' ? 'sold' : 'available');
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateMarketplaceDraft(draft);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editingItem) {
      await updateMarketplaceItem(editingItem.id, draft, draftStatus);
    } else {
      await createMarketplaceItem(draft);
    }
    setFormOpen(false);
    setEditingItem(null);
    setDraft(EMPTY_DRAFT);
  };

  const handleContactSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (sellerMessage.trim().length < 5) {
      setSellerMsgError('Please write a message of at least 5 characters.');
      return;
    }
    setSellerMsgError(null);
    await sendInquiry('marketplace', selectedItem.id, selectedItem.title, sellerMessage.trim());
    setSellerMessage('');
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Marketplace
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Buy and sell used textbooks, electronics, room furniture, and drafting stationery across Bhilai colleges.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Sell an Item
        </button>
      </div>

      {/* Filters */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative">
            <label htmlFor="mkt-search" className="sr-only">
              Search marketplace
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="mkt-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, calculator, study table, locality..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="mkt-cond" className="sr-only">
              Filter by condition
            </label>
            <select
              id="mkt-cond"
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'All' | ItemCondition)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Conditions' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex flex-col justify-center">
            <label htmlFor="mkt-price" className="text-xs text-slate-600 dark:text-slate-400">
              Max Price:{' '}
              <span className="font-mono tabular-nums font-semibold text-indigo-700 dark:text-indigo-400">
                {formatINR(maxPrice)}
              </span>
            </label>
            <input
              id="mkt-price"
              type="range"
              min={300}
              max={10000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-700"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-display font-semibold text-base text-slate-900 dark:text-white">
            No items match your current filter
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Clear filters or post your own used textbooks and gadgets for fellow students.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isOwner = item.sellerUid === account.uid;
            return (
              <article
                key={item.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                  <MediaImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.category} · {item.condition} · {item.status === 'sold' ? 'Sold' : 'Available'}
                    {item.isDemo ? ' · Demo Listing' : ''}
                  </p>
                  <h2 className="mt-1 font-display font-semibold text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Seller: {item.sellerName} ({item.sellerCollege}) · {item.locality}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-white">
                      {formatINR(item.price)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isOwner ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            aria-label={`Edit ${item.title}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteMarketplaceItem(item.id)}
                            aria-label={`Delete ${item.title}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setSellerMessage('');
                            setSellerMsgError(null);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors"
                        >
                          Contact Seller
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-form-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="listing-form-title" className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                {editingItem ? 'Edit Marketplace Listing' : 'Post an Item for Sale'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close listing form"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSaveListing(e)} noValidate className="space-y-4">
              <div>
                <label htmlFor="item-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Title
                </label>
                <input
                  id="item-title"
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Data Structures & Algorithms Book"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="item-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="item-category"
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, category: e.target.value as MarketplaceCategory }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="Books">Books</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Stationery">Stationery</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="item-condition" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Condition
                  </label>
                  <select
                    id="item-condition"
                    value={draft.condition}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, condition: e.target.value as ItemCondition }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="item-price" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    id="item-price"
                    type="number"
                    min={0}
                    max={500000}
                    value={draft.price}
                    onChange={(e) => setDraft((p) => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono tabular-nums"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="item-locality" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bhilai Pickup Locality
                  </label>
                  <input
                    id="item-locality"
                    type="text"
                    value={draft.locality}
                    onChange={(e) => setDraft((p) => ({ ...p, locality: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  />
                  {formErrors.locality && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.locality}</p>
                  )}
                </div>
              </div>

              {editingItem && (
                <div>
                  <label htmlFor="item-status" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Listing Status
                  </label>
                  <select
                    id="item-status"
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value as 'available' | 'sold')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Marked as Sold</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="item-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  id="item-desc"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe edition, age, accessories included, and campus pickup timing..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.description}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold"
                >
                  {editingItem ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="seller-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 id="seller-modal-title" className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                Contact {selectedItem.sellerName}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close contact seller dialog"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {selectedItem.title} ·{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                {formatINR(selectedItem.price)}
              </span>{' '}
              · {selectedItem.locality}
            </p>
            <form onSubmit={(e) => void handleContactSeller(e)} className="space-y-3">
              <label htmlFor="seller-msg" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Your Message
              </label>
              <textarea
                id="seller-msg"
                rows={3}
                value={sellerMessage}
                onChange={(e) => setSellerMessage(e.target.value)}
                placeholder="Ask about availability, campus meetup location, or price negotiation..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
              />
              {sellerMsgError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{sellerMsgError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
