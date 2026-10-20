'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BoxIcon, SearchIcon, PlusIcon, MinusIcon, AdjustIcon,
  EditIcon, TrashIcon, CloseIcon, AlertIcon, ArrowUpIcon, ArrowDownIcon,
} from '@/components/icons';
import { stockStatus, StatusBadge } from '@/components/badges';
import ItemForm from '@/components/ItemForm';

const SORTS = [
  { v: 'name_asc', label: 'Nama A–Z' },
  { v: 'name_desc', label: 'Nama Z–A' },
  { v: 'stock_desc', label: 'Stok terbanyak' },
  { v: 'stock_asc', label: 'Stok tersedikit' },
];


function Stepper({ value, onChange }) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setText(String(value)); }, [value, focused]);
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="nb-chip w-12 h-12 rounded-2xl bg-[#FFBEFB] text-[#241F31] font-black text-xl">−</button>
      <input
        type="number" min="0" value={text}
        onFocus={(e) => { setFocused(true); e.target.select(); }}
        onBlur={() => { setFocused(false); setText(String(value)); }}
        onChange={(e) => {
          const t = e.target.value.replace(/[^0-9]/g, '');
          setText(t);
          onChange(t === '' ? 0 : parseInt(t, 10));
        }}
        className="nb-input w-24 text-center text-2xl font-black tabular-nums py-2.5"
      />
      <button type="button" onClick={() => onChange(value + 1)}
        className="nb-chip w-12 h-12 rounded-2xl bg-[#FFF4BF] text-[#241F31] font-black text-xl">+</button>
    </div>
  );
}

const TRX_TONE = {
  in: { chipBg: 'bg-white', chipOn: 'bg-[#FFF4BF] shadow-[4px_4px_0_#241F31]', panel: 'bg-[#FFF4BF]', badge: 'bg-[#241F31] text-[#FFF4BF]', arrow: 'text-[#241F31]', btn: 'bg-[#FFF4BF] text-[#241F31]', label: 'Simpan Barang Masuk' },
  out: { chipBg: 'bg-white', chipOn: 'bg-[#FFBEFB] shadow-[4px_4px_0_#241F31]', panel: 'bg-[#FFBEFB]', badge: 'bg-[#241F31] text-[#FFBEFB]', arrow: 'text-[#241F31]', btn: 'bg-[#FFBEFB] text-[#241F31]', label: 'Simpan Barang Keluar' },
  adjust: { chipBg: 'bg-white', chipOn: 'bg-[#DC95FF] shadow-[4px_4px_0_#241F31]', panel: 'bg-[#DC95FF]', badge: 'bg-[#241F31] text-[#DC95FF]', arrow: 'text-[#241F31]', btn: 'bg-[#DC95FF] text-[#241F31]', label: 'Simpan Hasil Opname' },
};

function Modal({ onClose, children, title, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-[#241F31]/60" onClick={onClose} />
      <div className={`relative bg-[#FFF9E3] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} border-[3px] border-[#241F31] rounded-3xl shadow-[8px_8px_0_#241F31] max-h-[94vh] overflow-y-auto animate-pop-in`}>
        <div className="sticky top-0 bg-[#FFF4BF] px-6 py-4 flex items-center justify-between border-b-[3px] border-[#241F31] z-10">
          <h3 className="font-black text-xl">{title}</h3>
          <button onClick={onClose} aria-label="Tutup" className="nb-chip p-1.5 rounded-lg bg-white text-[#241F31]">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}


export default function BarangPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [status, setStatus] = useState('');

  const [editing, setEditing] = useState(null);

  const [trxItem, setTrxItem] = useState(null);
  const [trxType, setTrxType] = useState('in');
  const [trxQty, setTrxQty] = useState(1);
  const [trxNote, setTrxNote] = useState('');
  const [trxError, setTrxError] = useState('');
  const [trxLoading, setTrxLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;


  useEffect(() => { setPage(1); }, [q, category, sort, status]);

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('barang_toast');
      if (msg) { setToast(msg); sessionStorage.removeItem('barang_toast'); }
    } catch {}
    const t = setTimeout(fetchItems, 120);
    return () => clearTimeout(t);
  }, [q, category, sort, status]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const abortRef = useRef(null);
  async function fetchItems() {
    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    if (items.length === 0) setLoading(true);
    try {
      const p = new URLSearchParams({ q, category, sort, status });
      const r = await fetch(`/api/items?${p}`, { signal: ctl.signal });
      const d = await r.json();
      setItems(d.items || []);
      setCategories(d.categories || []);
    } catch (e) { if (e.name !== 'AbortError') console.error(e); }
    finally { setLoading(false); }
  }

  async function deleteItem(item) {
    if (item.stock > 0) {
      setToast(`Tidak bisa dihapus: stok masih ${item.stock}. Keluarkan dulu lewat transaksi.`);
      return;
    }
    if (!confirm(`Hapus "${item.name}"?`)) return;
    const r = await fetch(`/api/admin/items/${item._id}`, { method: 'DELETE' });
    const d = await r.json();
    if (!r.ok) { setToast(d.message || 'Gagal menghapus'); return; }
    setToast('Barang dihapus');
    fetchItems();
  }

  function openTrx(item, type) {
    setTrxItem(item);
    setTrxType(type);
    setTrxQty(type === 'adjust' ? item.stock : 1);
    setTrxNote('');
    setTrxError('');
  }

  function trxPreview() {
    if (!trxItem) return null;
    if (trxType === 'in') return { from: trxItem.stock, to: trxItem.stock + trxQty };
    if (trxType === 'out') return { from: trxItem.stock, to: trxItem.stock - trxQty };
    return { from: trxItem.stock, to: trxQty };
  }

  async function submitTrx() {
    setTrxError('');
    if (trxType === 'out' && trxQty > trxItem.stock) {
      setTrxError(`Stok tidak cukup. Sisa ${trxItem.stock} ${trxItem.unit}.`);
      return;
    }
    setTrxLoading(true);
    try {
      const r = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: trxItem._id, type: trxType, qty: trxQty, note: trxNote }),
      });
      const d = await r.json();
      if (!r.ok) { setTrxError(d.message || 'Gagal menyimpan'); return; }
      setTrxItem(null);
      const label = trxType === 'in' ? 'masuk' : trxType === 'out' ? 'keluar' : 'disesuaikan';
      setToast(`Stok ${d.item.name} ${label}: ${d.transaction.stockBefore} → ${d.transaction.stockAfter}`);
      fetchItems();
    } catch (e) {
      setTrxError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setTrxLoading(false);
    }
  }

  const inputCls = 'nb-input w-full px-4 py-3 text-sm font-bold transition';
  const labelCls = 'block text-xs font-extrabold text-[#241F31]/60 uppercase tracking-[0.18em] mb-1.5';

  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.25em] text-[#8C56D4] uppercase">Panel Admin</p>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">Barang</h1>
          <p className="text-sm font-semibold text-[#241F31]/60 mt-1.5">{items.length} jenis barang</p>
        </div>
        <Link href="/admin/barang/tambah"
          className="nb-btn inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#DC95FF] text-[#241F31] text-sm font-black">
          <PlusIcon className="w-4 h-4" />
          Tambah Barang
        </Link>
      </div>

      {/* filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#241F31]/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / kode..."
            className="nb-input w-full pl-12 pr-4 py-3 text-sm font-bold shadow-[4px_4px_0_#241F31]" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="nb-input px-4 py-3 text-sm font-extrabold outline-none cursor-pointer">
          <option value="">Semua kategori</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="nb-input px-4 py-3 text-sm font-extrabold outline-none cursor-pointer">
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
      </div>

      {/* daftar */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 rounded-full border-4 border-[#DC95FF] border-t-[#8C56D4] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="nb-card p-12 text-center">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-[#DC95FF] border-[3px] border-[#241F31] items-center justify-center mb-3">
            <BoxIcon className="w-7 h-7 text-[#241F31]" />
          </span>
          <p className="font-extrabold">Belum ada barang</p>
          <Link href="/admin/barang/tambah" className="nb-btn mt-4 inline-block px-5 py-2.5 rounded-2xl bg-[#FFF4BF] text-[#241F31] text-sm font-extrabold">
            Tambah barang pertama
          </Link>
        </div>
      ) : (
        <>
          {/* mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {pageItems.map((item) => {
              const st = stockStatus(item);
              return (
                <div key={item._id} className="nb-card-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name}
                        className="w-11 h-11 rounded-2xl object-cover flex-shrink-0 border-[2.5px] border-[#241F31]" />
                    ) : (
                      <span className="w-11 h-11 rounded-2xl bg-[#DC95FF] text-[#241F31] border-[2.5px] border-[#241F31] flex items-center justify-center flex-shrink-0">
                        <BoxIcon className="w-5 h-5" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold truncate">{item.name}</p>
                      <p className="text-xs text-[#241F31]/50 font-mono">{item.sku} · {item.category}</p>
                    </div>
                    <StatusBadge status={st} />
                  </div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs text-slate-400 font-bold">Stok</span>
                    <span className="text-xl font-extrabold tabular-nums">{item.stock} <span className="text-xs text-slate-400">{item.unit}</span></span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <button onClick={() => openTrx(item, 'in')}
                      className="nb-chip flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#FFF4BF] text-[#241F31] text-xs font-extrabold">
                      <PlusIcon className="w-4 h-4" /> Masuk
                    </button>
                    <button onClick={() => openTrx(item, 'out')}
                      className="nb-chip flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#FFBEFB] text-[#241F31] text-xs font-extrabold">
                      <MinusIcon className="w-4 h-4" /> Keluar
                    </button>
                    <button onClick={() => openTrx(item, 'adjust')}
                      className="nb-chip flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#DC95FF] text-[#241F31] text-xs font-extrabold">
                      <AdjustIcon className="w-4 h-4" /> Opname
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/barang/${item._id}`}
                      className="nb-chip flex-1 text-center py-2 rounded-xl bg-white text-[#241F31] text-xs font-extrabold">
                      Detail & Riwayat
                    </Link>
                    <button onClick={() => setEditing(item)} aria-label="Edit"
                      className="nb-chip p-2 rounded-xl bg-white text-[#241F31]"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem(item)} aria-label="Hapus"
                      className="nb-chip p-2 rounded-xl bg-[#FFBEFB] text-[#241F31]"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* desktop table */}
          <div className="hidden md:block nb-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FFF4BF] border-b-[3px] border-[#241F31] text-left">
                  <th className="px-5 py-3.5 text-xs font-black text-[#241F31] uppercase tracking-[0.15em]">Barang</th>
                  <th className="px-5 py-3.5 text-xs font-black text-[#241F31] uppercase tracking-[0.15em]">Kategori</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide text-right">Stok</th>
                  <th className="px-5 py-3.5 text-xs font-black text-[#241F31] uppercase tracking-[0.15em]">Status</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#241F31]/10">
                {pageItems.map((item) => {
                  const st = stockStatus(item);
                  return (
                    <tr key={item._id} className="hover:bg-[#FFF9E3]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border-[2.5px] border-[#241F31]" />
                          ) : (
                            <span className="w-10 h-10 rounded-xl bg-[#DC95FF] text-[#241F31] border-[2.5px] border-[#241F31] flex items-center justify-center flex-shrink-0">
                              <BoxIcon className="w-4 h-4" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <Link href={`/admin/barang/${item._id}`} className="font-extrabold hover:text-[#8C56D4] transition-colors">{item.name}</Link>
                            <p className="text-xs text-[#241F31]/50 font-mono">{item.sku}{item.location ? ` · Rak ${item.location}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#241F31]/70 font-bold">{item.category}</td>
                      <td className="px-5 py-4 text-right font-extrabold tabular-nums">{item.stock} <span className="text-xs text-slate-400 font-bold">{item.unit}</span></td>
                      <td className="px-5 py-4"><StatusBadge status={st} /></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openTrx(item, 'in')} title="Barang masuk"
                            className="nb-chip p-2 rounded-xl bg-[#FFF4BF] text-[#241F31]"><PlusIcon className="w-4 h-4" /></button>
                          <button onClick={() => openTrx(item, 'out')} title="Barang keluar"
                            className="nb-chip p-2 rounded-xl bg-[#FFBEFB] text-[#241F31]"><MinusIcon className="w-4 h-4" /></button>
                          <button onClick={() => openTrx(item, 'adjust')} title="Opname / penyesuaian"
                            className="nb-chip p-2 rounded-xl bg-[#DC95FF] text-[#241F31]"><AdjustIcon className="w-4 h-4" /></button>
                          <button onClick={() => setEditing(item)} title="Edit"
                            className="nb-chip p-2 rounded-xl bg-white text-[#241F31]"><EditIcon className="w-4 h-4" /></button>
                          <button onClick={() => deleteItem(item)} title="Hapus"
                            className="nb-chip p-2 rounded-xl bg-white text-[#241F31]"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs font-extrabold text-[#241F31]/50">
                {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, items.length)} dari {items.length} barang
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1}
                  className="nb-chip px-3.5 py-2.5 rounded-xl bg-white text-sm font-extrabold text-[#241F31] disabled:opacity-40">
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`nb-chip w-10 h-10 rounded-xl text-sm font-extrabold ${
                      p === safePage ? 'bg-[#241F31] text-white' : 'bg-white text-[#241F31]'
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages}
                  className="nb-chip px-3.5 py-2.5 rounded-xl bg-white text-sm font-extrabold text-[#241F31] disabled:opacity-40">
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* modal edit barang */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title="Edit Barang">
          <ItemForm
            mode="edit"
            itemId={editing._id}
            categories={categories}
            initial={{
              name: editing.name, sku: editing.sku, category: editing.category,
              unit: editing.unit, location: editing.location || '', minStock: editing.minStock,
              image: editing.image || '', initialStock: 0,
            }}
            onDone={() => { setEditing(null); setToast('Barang diperbarui'); fetchItems(); }}
          />
        </Modal>
      )}

      {/* modal transaksi — landscape */}
      {trxItem && (
        <Modal wide onClose={() => setTrxItem(null)} title="Catat Pergerakan Stok">
          <div className="grid sm:grid-cols-[1fr_1.2fr] gap-6">
            {/* kiri: item + tipe */}
            <div>
              <div className="flex items-center gap-3 mb-5 p-4 bg-white border-[3px] border-[#241F31] rounded-2xl">
                {trxItem.image ? (
                  <img src={trxItem.image} alt={trxItem.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border-[2.5px] border-[#241F31]" />
                ) : (
                  <span className="w-12 h-12 rounded-xl bg-[#DC95FF] text-[#241F31] border-[2.5px] border-[#241F31] flex items-center justify-center flex-shrink-0">
                    <BoxIcon className="w-6 h-6" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-extrabold truncate">{trxItem.name}</p>
                  <p className="text-xs font-bold text-[#241F31]/50">Stok saat ini: <b className="text-[#241F31] tabular-nums">{trxItem.stock} {trxItem.unit}</b></p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-1 gap-2.5">
                {[
                  { v: 'in', label: 'Masuk', desc: 'Tambah stok', Icon: ArrowUpIcon },
                  { v: 'out', label: 'Keluar', desc: 'Kurangi stok', Icon: ArrowDownIcon },
                  { v: 'adjust', label: 'Opname', desc: 'Hasil hitung', Icon: AdjustIcon },
                ].map((t) => {
                  const on = trxType === t.v;
                  return (
                    <button key={t.v} type="button" onClick={() => { setTrxType(t.v); setTrxQty(t.v === 'adjust' ? trxItem.stock : 1); setTrxError(''); }}
                      className={`nb-chip rounded-2xl sm:rounded-xl py-3.5 px-3 sm:py-3 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-[#241F31] ${on ? TRX_TONE[t.v].chipOn : TRX_TONE[t.v].chipBg}`}>
                      <t.Icon className="w-6 h-6 flex-shrink-0" />
                      <span className="text-center sm:text-left">
                        <span className="block text-sm font-black leading-none">{t.label}</span>
                        <span className="block text-[10px] font-bold opacity-60 mt-0.5">{t.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* kanan: jumlah + preview + aksi */}
            <div>
              <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#241F31]/50 mb-3">
                {trxType === 'adjust' ? 'Hasil hitungan fisik' : trxType === 'in' ? 'Jumlah masuk' : 'Jumlah keluar'}
              </p>
              <div className="flex justify-center"><Stepper value={trxQty} onChange={setTrxQty} /></div>
              {trxType !== 'adjust' ? (
                <div className="flex justify-center gap-2 mt-3.5 mb-5">
                  {[5, 10, 50, 100].map((n) => (
                    <button key={n} type="button" onClick={() => setTrxQty((q) => q + n)}
                      className="nb-chip px-4 py-1.5 rounded-full bg-white text-xs font-extrabold">
                      +{n}
                    </button>
                  ))}
                </div>
              ) : <div className="mb-5" />}

              {(() => {
                const pv = trxPreview();
                if (!pv) return null;
                const diff = pv.to - pv.from;
                const diffLabel = diff > 0 ? `+${diff}` : diff < 0 ? `\u2212${Math.abs(diff)}` : '0';
                return (
                  <div className={`flex items-center justify-between rounded-2xl border-[3px] border-[#241F31] px-6 py-3.5 mb-5 ${TRX_TONE[trxType].panel}`}>
                    <div className="text-center">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#241F31]/50 mb-0.5">Sebelum</p>
                      <p className="text-2xl font-black tabular-nums text-[#241F31]/60">{pv.from}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-black tabular-nums border-[2.5px] border-[#241F31] ${TRX_TONE[trxType].badge}`}>{diffLabel}</span>
                      <span className={`text-xl leading-none font-black ${TRX_TONE[trxType].arrow}`}>→</span>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#241F31]/50 mb-0.5">Sesudah</p>
                      <p className="text-3xl font-black tabular-nums text-[#241F31]">{pv.to} <span className="text-sm font-bold text-[#241F31]/50">{trxItem.unit}</span></p>
                    </div>
                  </div>
                );
              })()}

              <label className={labelCls}>Keterangan (opsional)</label>
              <input value={trxNote} onChange={(e) => setTrxNote(e.target.value)}
                placeholder={trxType === 'in' ? 'cth: dari supplier PT Maju' : trxType === 'out' ? 'cth: untuk divisi operasional' : 'cth: selisih hitung rak'}
                className={`${inputCls} mb-4`} />

              {trxError && (
                <div className="mb-4 bg-[#FFBEFB] border-[3px] border-[#241F31] text-[#241F31] text-sm font-bold rounded-2xl px-4 py-3 flex items-center gap-2">
                  <AlertIcon className="w-5 h-5 flex-shrink-0" /> {trxError}
                </div>
              )}

              <button onClick={submitTrx} disabled={trxLoading}
                className={`nb-btn w-full font-black rounded-2xl py-4 disabled:opacity-60 ${TRX_TONE[trxType].btn}`}>
                {trxLoading ? 'Menyimpan...' : TRX_TONE[trxType].label}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md">
          <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 shadow-xl animate-pop-in">
            <p className="text-sm font-bold text-center">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
