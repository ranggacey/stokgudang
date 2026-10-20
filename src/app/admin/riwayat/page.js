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
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">Riwayat Transaksi</h1>
        <p className="text-sm text-slate-500 mt-1.5">Semua pergerakan stok tercatat di sini dan tidak bisa diubah</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / kode barang..."
            className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-amber-500 bg-white" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500">
          <option value="newest">Terbaru dulu</option>
          <option value="oldest">Terlama dulu</option>
        </select>
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        {TYPE_FILTERS.map((f) => (
          <button key={f.v} onClick={() => setType(f.v)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
              type === f.v ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <HistoryIcon className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-500">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {transactions.map((t) => (
              <div key={t._id} className="flex items-center gap-3 p-4">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${t.type === 'in' ? 'bg-emerald-100 text-emerald-700' : t.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
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
