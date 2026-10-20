'use client';

import { useState, useEffect, useRef } from 'react';
import { BoxIcon, SearchIcon } from '@/components/icons';
import { stockStatus, StatusBadge } from '@/components/badges';

const SORTS = [
  { v: 'name_asc', label: 'Nama A–Z' },
  { v: 'name_desc', label: 'Nama Z–A' },
  { v: 'stock_desc', label: 'Stok terbanyak' },
  { v: 'stock_asc', label: 'Stok tersedikit' },
];

const STATUS_FILTERS = [
  { v: '', label: 'Semua', bg: '#fff' },
  { v: 'available', label: 'Tersedia', bg: '#FFF4BF' },
  { v: 'low', label: 'Menipis', bg: '#DC95FF' },
  { v: 'empty', label: 'Habis', bg: '#FFBEFB' },
];

const STATUS_TILE = {
  ok: 'bg-[#FFF4BF]',
  low: 'bg-[#DC95FF]',
  empty: 'bg-[#FFBEFB]',
};

export default function PublicCatalog() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [status, setStatus] = useState('');
  const abortRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(fetchItems, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, sort, status]);

  async function fetchItems() {
    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const p = new URLSearchParams({ q, category, sort, status });
      const r = await fetch(`/api/items?${p}`, { signal: ctl.signal });
      const d = await r.json();
      setItems(d.items || []);
      setCategories(d.categories || []);
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
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
    { label: 'Jenis barang', value: counts.total, icon: <BoxIcon className="w-6 h-6" />, bg: 'bg-white' },
    { label: 'Tersedia', value: counts.ok, icon: <BoxIcon className="w-6 h-6" />, bg: 'bg-[#FFF4BF]' },
    { label: 'Menipis', value: counts.low, icon: <BoxIcon className="w-6 h-6" />, bg: 'bg-[#DC95FF]' },
    { label: 'Habis', value: counts.empty, icon: <BoxIcon className="w-6 h-6" />, bg: 'bg-[#FFBEFB]' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9E3] text-[#241F31]">
      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden bg-[#8C56D4] border-b-[3px] border-[#241F31] text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFBEFB] rounded-full border-[3px] border-[#241F31]" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-[#DC95FF] rounded-full border-[3px] border-[#241F31] opacity-80" />
        <div className="absolute top-10 right-1/4 w-16 h-16 bg-[#FFF4BF] rotate-12 border-[3px] border-[#241F31] rounded-2xl hidden sm:block" />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#FFF4BF] text-[#241F31] border-[3px] border-[#241F31] shadow-[4px_4px_0_#241F31] flex items-center justify-center">
              <BoxIcon className="w-7 h-7" />
            </span>
            <p className="text-[11px] font-extrabold tracking-[0.28em] text-[#FFF4BF] uppercase">Gudang · Real-time</p>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black leading-[1.02] mt-5 max-w-xl drop-shadow-[3px_3px_0_rgba(36,31,49,0.45)]">
            Stok Gudang,<br />
            <span className="bg-[#FFF4BF] text-[#241F31] px-3 rounded-xl border-[3px] border-[#241F31] inline-block mt-2 -rotate-1">terpantau</span> setiap saat.
          </h1>
          <p className="text-white/90 text-sm sm:text-base mt-4 max-w-md leading-relaxed font-semibold">
            Cek ketersediaan barang secara langsung. Data diperbarui otomatis setiap ada barang masuk atau keluar.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-8">
        {/* search mengambang */}
        <div className="relative z-10 -mt-7 mb-7 max-w-xl">
          <SearchIcon className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-[#241F31]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama barang atau kode..."
            className="nb-input w-full pr-5 py-4 text-[#241F31] text-[15px] font-bold placeholder:text-[#241F31]/40 shadow-[5px_5px_0_#241F31]"
            style={{ paddingLeft: '3.5rem' }}
          />
        </div>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 animate-fade-up">
          {statCards.map((s) => (
            <div key={s.label} className={`nb-card-sm p-4 flex items-center gap-3.5 ${s.bg}`}>
              <span className="w-12 h-12 rounded-2xl bg-[#241F31] text-[#FFF4BF] border-[2.5px] border-[#241F31] flex items-center justify-center flex-shrink-0">{s.icon}</span>
              <div>
                <p className="text-2xl font-black tabular-nums leading-none">{s.value}</p>
                <p className="text-[11px] font-extrabold uppercase tracking-wide mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== FILTER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex gap-3 flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="nb-input flex-1 sm:flex-none px-4 py-3 text-sm font-extrabold outline-none cursor-pointer"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="nb-input flex-1 sm:flex-none px-4 py-3 text-sm font-extrabold outline-none cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.v} value={s.v}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.v}
                onClick={() => setStatus(f.v)}
                style={status === f.v ? undefined : { background: f.bg }}
                className={`nb-chip px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  status === f.v ? 'bg-[#241F31] text-white' : 'text-[#241F31]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== LIST ===== */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="nb-card p-5 animate-pulse">
                <div className="h-4 bg-[#FFF4BF] border-2 border-[#241F31]/10 rounded-full w-2/3 mb-3" />
                <div className="h-3 bg-[#FFBEFB]/60 rounded-full w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="nb-card p-14 text-center bg-white">
            <span className="inline-flex w-16 h-16 rounded-2xl bg-[#DC95FF] border-[3px] border-[#241F31] shadow-[4px_4px_0_#241F31] text-[#241F31] items-center justify-center mb-4">
              <BoxIcon className="w-8 h-8" />
            </span>
            <p className="font-extrabold text-lg">Tidak ada barang yang cocok</p>
            <p className="text-sm font-semibold opacity-60 mt-1">Coba ubah kata kunci atau filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const st = stockStatus(item);
              const isEmpty = st === 'empty';
              return (
                <div
                  key={item._id}
                  className={`nb-card p-5 flex items-center gap-4 transition-transform hover:-translate-y-1 ${isEmpty ? 'opacity-80' : ''}`}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border-[3px] border-[#241F31]" />
                  ) : (
                    <span className={`w-16 h-16 rounded-2xl border-[3px] border-[#241F31] flex items-center justify-center flex-shrink-0 ${STATUS_TILE[st]}`}>
                      <BoxIcon className="w-7 h-7" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold truncate text-[15px]">{item.name}</h3>
                    <p className="text-[11px] opacity-50 font-mono mt-0.5">{item.sku} · {item.category}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="text-xl font-black tabular-nums">{item.stock}</span>
                      <span className="text-xs opacity-50 font-bold">{item.unit}</span>
                      <span className="ml-auto"><StatusBadge status={st} /></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="text-center mt-12 pb-4">
          <p className="text-xs font-bold opacity-50">Data stok diperbarui otomatis oleh admin gudang</p>
        </footer>
      </main>
    </div>
  );
}
