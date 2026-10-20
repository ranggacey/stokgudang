'use client';

import { useState, useEffect } from 'react';
import { BoxIcon, SearchIcon } from '@/components/icons';
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

const STATUS_TONE = {
  ok: 'border-l-emerald-400',
  low: 'border-l-amber-400',
  empty: 'border-l-red-400',
};

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

  const statCards = [
    { label: 'Jenis barang', value: counts.total, icon: <BoxIcon className="w-5 h-5" />, tile: 'bg-slate-900 text-amber-400' },
    { label: 'Tersedia', value: counts.ok, icon: <BoxIcon className="w-5 h-5" />, tile: 'bg-emerald-500 text-white' },
    { label: 'Menipis', value: counts.low, icon: <BoxIcon className="w-5 h-5" />, tile: 'bg-amber-400 text-slate-900' },
    { label: 'Habis', value: counts.empty, icon: <BoxIcon className="w-5 h-5" />, tile: 'bg-red-500 text-white' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] bg-amber-500/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-32 w-[420px] h-[420px] bg-amber-400/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-24 sm:pt-14 sm:pb-28">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40">
              <BoxIcon className="w-7 h-7" />
            </span>
            <p className="text-[11px] font-extrabold tracking-[0.28em] text-amber-400 uppercase">Gudang · Real-time</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.05] mt-5 max-w-xl">
            Stok Gudang,<br />
            <span className="text-amber-400">terpantau</span> setiap saat.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-md leading-relaxed">
            Cek ketersediaan barang secara langsung. Data diperbarui otomatis setiap ada barang masuk atau keluar.
          </p>
        </div>
        {/* search mengambang */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative max-w-xl">
              <SearchIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama barang atau kode..."
                className="w-full bg-white rounded-2xl pl-13 pr-5 py-4 text-slate-900 text-[15px] font-semibold placeholder:text-slate-400 placeholder:font-medium outline-none shadow-xl shadow-slate-900/10 border border-slate-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition"
                style={{ paddingLeft: '3.25rem' }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        {/* ===== STATS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7 animate-fade-up">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-3xl border border-slate-100 p-4 flex items-center gap-3.5 shadow-sm">
              <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.tile}`}>{s.icon}</span>
              <div>
                <p className="text-2xl font-extrabold tabular-nums leading-none">{s.value}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== FILTER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-6">
          <div className="flex gap-2.5 flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500 cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.v} value={s.v}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.v}
                onClick={() => setStatus(f.v)}
                className={`px-4 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  status === f.v
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== LIST ===== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 animate-pulse">
                <div className="h-4 bg-slate-100 rounded-full w-2/3 mb-3" />
                <div className="h-3 bg-slate-100 rounded-full w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-14 text-center">
            <span className="inline-flex w-16 h-16 rounded-3xl bg-slate-100 text-slate-300 items-center justify-center mb-4">
              <BoxIcon className="w-8 h-8" />
            </span>
            <p className="font-extrabold text-slate-600">Tidak ada barang yang cocok</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci atau filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {items.map((item) => {
              const st = stockStatus(item);
              const isEmpty = st === 'empty';
              return (
                <div
                  key={item._id}
                  className={`group bg-white rounded-3xl border border-slate-100 border-l-4 ${STATUS_TONE[st]} p-5 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 ${
                    isEmpty ? 'opacity-80' : ''
                  }`}
                >
                  <span className={`w-13 h-13 p-3.5 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isEmpty ? 'bg-slate-100 text-slate-400' : st === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-amber-400'
                  }`}>
                    <BoxIcon className="w-6 h-6" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold truncate text-[15px]">{item.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sku} · {item.category}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className={`text-xl font-extrabold tabular-nums ${isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>
                        {item.stock}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{item.unit}</span>
                      <span className="ml-auto"><StatusBadge status={st} /></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="text-center mt-12 pb-4">
          <p className="text-xs text-slate-400 font-semibold">Data stok diperbarui otomatis oleh admin gudang</p>
        </footer>
      </main>
    </div>
  );
}
