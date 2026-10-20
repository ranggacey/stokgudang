'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BoxIcon, ArrowUpIcon, ArrowDownIcon, AlertIcon, ChevronRightIcon } from '@/components/icons';
import { stockStatus, StatusBadge, TypeBadge } from '@/components/badges';

export default function BarangDetail({ params }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const r = await fetch(`/api/admin/items/${params.id}`);
      if (!r.ok) { router.push('/admin/barang'); return; }
      setData(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const { item, history } = data;
  const st = stockStatus(item);

  return (
    <div className="animate-fade-up">
      <Link href="/admin/barang" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 mb-4">
        ← Kembali ke daftar barang
      </Link>

      {/* info barang */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 mb-5">
        <div className="flex items-start gap-4">
          {item.image ? (
            <img src={item.image} alt={item.name}
              className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-slate-100" />
          ) : (
            <span className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <BoxIcon className="w-7 h-7" />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold">{item.name}</h1>
              <StatusBadge status={st} />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">{item.sku}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Stok saat ini', value: `${item.stock} ${item.unit}`, big: true },
            { label: 'Stok minimum', value: `${item.minStock} ${item.unit}` },
            { label: 'Kategori', value: item.category },
            { label: 'Lokasi rak', value: item.location || '—' },
          ].map((f) => (
            <div key={f.label} className="bg-slate-50 rounded-2xl p-3.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">{f.label}</p>
              <p className={`font-extrabold mt-1 tabular-nums ${f.big ? 'text-2xl' : ''}`}>{f.value}</p>
            </div>
          ))}
        </div>
        {st !== 'ok' && (
          <div className={`mt-4 rounded-2xl p-4 flex items-center gap-3 ${st === 'empty' ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertIcon className={`w-6 h-6 flex-shrink-0 ${st === 'empty' ? 'text-red-500' : 'text-amber-500'}`} />
            <p className={`text-sm font-bold ${st === 'empty' ? 'text-red-800' : 'text-amber-800'}`}>
              {st === 'empty' ? 'Stok habis. Segera restock barang ini.' : `Stok menipis (minimum ${item.minStock} ${item.unit}). Pertimbangkan restock.`}
            </p>
          </div>
        )}
      </div>

      {/* riwayat */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6">
        <h2 className="font-extrabold text-lg mb-4">Riwayat Pergerakan Stok</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 font-semibold text-center py-8">Belum ada transaksi untuk barang ini.</p>
        ) : (
          <div className="space-y-2">
            {history.map((t) => (
              <div key={t._id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'in' ? 'bg-emerald-100 text-emerald-700' : t.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t.type === 'in' ? <ArrowUpIcon className="w-4 h-4" /> : t.type === 'out' ? <ArrowDownIcon className="w-4 h-4" /> : <AlertIcon className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-semibold">
                    {new Date(t.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {t.note ? ` · ${t.note}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 font-bold tabular-nums mt-0.5">
                    Stok: {t.stockBefore} → {t.stockAfter}
                  </p>
                </div>
                <TypeBadge type={t.type} />
                <span className="text-sm font-extrabold tabular-nums whitespace-nowrap">
                  {t.type === 'out' ? '−' : t.type === 'in' ? '+' : '→'}{t.qty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
