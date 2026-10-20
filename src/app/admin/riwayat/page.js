'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, ArrowUpIcon, ArrowDownIcon, AlertIcon, HistoryIcon } from '@/components/icons';
import { TypeBadge } from '@/components/badges';

const TYPE_FILTERS = [
  { v: '', label: 'Semua' },
  { v: 'in', label: 'Masuk' },
  { v: 'out', label: 'Keluar' },
  { v: 'adjust', label: 'Penyesuaian' },
];

export default function RiwayatPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [q, type, sort]);

  async function fetchData() {
    setLoading(true);
    try {
      const p = new URLSearchParams({ q, type, sort, limit: 100 });
      const r = await fetch(`/api/admin/transactions?${p}`);
      const d = await r.json();
      setTransactions(d.transactions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-5">
        <p className="text-[11px] font-extrabold tracking-[0.25em] text-amber-600 uppercase">Panel Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black mt-1">Riwayat Transaksi</h1>
        <p className="text-sm font-semibold text-[#241F31]/60 mt-1.5">Semua pergerakan stok tercatat di sini dan tidak bisa diubah</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#241F31]/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / kode barang..."
            className="nb-input w-full pl-12 pr-4 py-3 text-sm font-bold shadow-[4px_4px_0_#241F31]" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="nb-input px-4 py-3 text-sm font-extrabold outline-none cursor-pointer">
          <option value="newest">Terbaru dulu</option>
          <option value="oldest">Terlama dulu</option>
        </select>
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        {TYPE_FILTERS.map((f) => (
          <button key={f.v} onClick={() => setType(f.v)}
            className={`nb-chip px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap ${
              type === f.v ? 'bg-[#241F31] text-white' : 'bg-white text-[#241F31]'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 rounded-full border-4 border-[#DC95FF] border-t-[#8C56D4] animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="nb-card p-12 text-center">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-[#DC95FF] border-[3px] border-[#241F31] items-center justify-center mb-3">
            <HistoryIcon className="w-7 h-7 text-[#241F31]" />
          </span>
          <p className="font-extrabold">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="nb-card overflow-hidden">
          <div className="divide-y-2 divide-[#241F31]/10">
            {transactions.map((t) => (
              <div key={t._id} className="flex items-center gap-3 p-4">
                <span className={`w-10 h-10 rounded-2xl border-[2.5px] border-[#241F31] flex items-center justify-center flex-shrink-0 ${t.type === 'in' ? 'bg-[#FFF4BF] text-[#241F31]' : t.type === 'out' ? 'bg-[#FFBEFB] text-[#241F31]' : 'bg-[#DC95FF] text-[#241F31]'}`}>
                  {t.type === 'in' ? <ArrowUpIcon className="w-4 h-4" /> : t.type === 'out' ? <ArrowDownIcon className="w-4 h-4" /> : <AlertIcon className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm truncate">{t.itemName}</p>
                  <p className="text-xs text-slate-400 font-mono">{t.itemSku}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(t.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {t.note ? ` · ${t.note}` : ''} · oleh {t.createdBy}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <TypeBadge type={t.type} />
                  <p className="text-sm font-extrabold tabular-nums mt-1">
                    {t.type === 'out' ? '−' : t.type === 'in' ? '+' : ''}{t.qty}
                    <span className="text-xs text-slate-400 font-bold"> ({t.stockBefore}→{t.stockAfter})</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
