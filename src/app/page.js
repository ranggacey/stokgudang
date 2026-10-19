'use client';

import { useState, useEffect } from 'react';
import { BoxIcon, SearchIcon, ChevronRightIcon } from '@/components/icons';
import { stockStatus, StatusBadge } from '@/components/badges';

const SORTS = [
  { v: 'name_asc', label: 'Nama A–Z' },
  { v: 'name_desc', label: 'Nama Z–A' },
  { v: 'stock_desc', label: 'Stok terbanyak' },
  { v: 'stock_asc', label: 'Stok tersedikit' },
];

const STATUS_FILTERS = [
  { v: '', label: 'Semua' },
  { v: 'available', label: 'Tersedia' },
  { v: 'low', label: 'Menipis' },
  { v: 'empty', label: 'Habis' },
];

export default function PublicCatalog() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [q, category, sort, status]);

  async function fetchItems() {
    setLoading(true);
    try {
      const p = new URLSearchParams({ q, category, sort, status });
      const r = await fetch(`/api/items?${p}`);
      const d = await r.json();
      setItems(d.items || []);
      setCategories(d.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const counts = {
    total: items.length,
    ok: items.filter((i) => stockStatus(i) === 'ok').length,
    low: items.filter((i) => stockStatus(i) === 'low').length,
    empty: items.filter((i) => stockStatus(i) === 'empty').length,
  };

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center">
              <BoxIcon className="w-6 h-6" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.2em] text-amber-400 uppercase">Gudang</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Stok Gudang</h1>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-2 max-w-lg">
            Cek ketersediaan barang secara real-time. Data diperbarui setiap ada barang masuk atau keluar.
          </p>

          {/* search */}
          <div className="relative mt-6 max-w-xl">
            <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama barang atau kode..."
              className="w-full bg-white/10 border border-white/15 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-400 outline-none focus:border-amber-400 focus:bg-white/15 transition-colors"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-0 py-6">
        {/* ringkasan */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 animate-fade-up">
          {[
            { label: 'Jenis barang', value: counts.total, cls: 'bg-white' },
            { label: 'Tersedia', value: counts.ok, cls: 'bg-emerald-50' },
            { label: 'Menipis', value: counts.low, cls: 'bg-amber-50' },
            { label: 'Habis', value: counts.empty, cls: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.cls} rounded-2xl border border-slate-100 p-3 sm:p-4 text-center`}>
              <p className="text-xl sm:text-2xl font-extrabold tabular-nums">{s.value}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* filter */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500"
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500"
          >
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>{s.label}</option>
            ))}
          </select>
          <div className="flex gap-1.5 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.v}
                onClick={() => setStatus(f.v)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                  status === f.v ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* daftar */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <BoxIcon className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="font-bold text-slate-500">Tidak ada barang yang cocok</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci atau filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const st = stockStatus(item);
              const isEmpty = st === 'empty';
              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl border p-5 flex items-center gap-4 transition-shadow hover:shadow-md ${
                    isEmpty ? 'border-slate-200 opacity-75' : 'border-slate-100'
                  }`}
                >
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isEmpty ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <BoxIcon className="w-6 h-6" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold truncate">{item.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{item.sku} · {item.category}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-lg font-extrabold tabular-nums ${isEmpty ? 'text-slate-400' : ''}`}>
                        {item.stock}
                      </span>
                      <span className="text-xs text-slate-400">{item.unit}</span>
                      <StatusBadge status={st} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="text-center text-xs text-slate-400 mt-10 pb-6">
          Data stok diperbarui otomatis oleh admin gudang
        </footer>
      </main>
    </div>
  );
}
