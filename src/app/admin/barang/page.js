'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BoxIcon, SearchIcon, PlusIcon, MinusIcon, AdjustIcon,
  EditIcon, TrashIcon, CloseIcon, AlertIcon, CameraIcon,
} from '@/components/icons';
import { stockStatus, StatusBadge } from '@/components/badges';

const SORTS = [
  { v: 'name_asc', label: 'Nama A–Z' },
  { v: 'name_desc', label: 'Nama Z–A' },
  { v: 'stock_desc', label: 'Stok terbanyak' },
  { v: 'stock_asc', label: 'Stok tersedikit' },
];

const UNITS = ['pcs', 'box', 'dus', 'kg', 'liter', 'meter', 'pak', 'set'];

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xl hover:bg-slate-200 active:scale-95 transition">−</button>
      <input
        type="number" min="0" value={value}
        onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
        className="w-24 text-center text-2xl font-extrabold tabular-nums border border-slate-200 rounded-2xl py-2.5 outline-none focus:border-amber-500"
      />
      <button type="button" onClick={() => onChange(value + 1)}
        className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xl hover:bg-slate-200 active:scale-95 transition">+</button>
    </div>
  );
}

function Modal({ onClose, children, title }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-5 flex items-center justify-between border-b border-slate-100 z-10">
          <h3 className="font-extrabold text-xl">{title}</h3>
          <button onClick={onClose} aria-label="Tutup" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: '', sku: '', category: '', unit: 'pcs', location: '', minStock: 0, initialStock: 0, image: '' };

export default function BarangPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [status, setStatus] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const [trxItem, setTrxItem] = useState(null);
  const [trxType, setTrxType] = useState('in');
  const [trxQty, setTrxQty] = useState(1);
  const [trxNote, setTrxNote] = useState('');
  const [trxError, setTrxError] = useState('');
  const [trxLoading, setTrxLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { setPage(1); }, [q, category, sort, status]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [q, category, sort, status]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function fetchItems() {
    setLoading(true);
    try {
      const p = new URLSearchParams({ q, category, sort, status });
      const r = await fetch(`/api/items?${p}`);
      const d = await r.json();
      setItems(d.items || []);
      setCategories(d.categories || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setImageFile(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name, sku: item.sku, category: item.category,
      unit: item.unit, location: item.location || '', minStock: item.minStock,
      image: item.image || '', initialStock: 0,
    });
    setFormErrors({});
    setImageFile(null);
    setShowForm(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormErrors({});
    try {
      let imageUrl = form.image || '';
      if (imageFile) {
        setImageUploading(true);
        const fd = new FormData();
        fd.append('file', imageFile);
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const ud = await up.json();
        setImageUploading(false);
        if (!up.ok) {
          setFormErrors({ _global: ud.message || 'Gagal mengupload foto' });
          return;
        }
        imageUrl = ud.url;
      }
      const url = editing ? `/api/admin/items/${editing._id}` : '/api/admin/items';
      const r = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, minStock: Number(form.minStock), image: imageUrl }),
      });
      const d = await r.json();
      if (!r.ok) {
        setFormErrors(d.errors || {});
        if (d.message && !d.errors) setFormErrors({ _global: d.message });
        return;
      }
      if (!editing && Number(form.initialStock) > 0 && d.item?._id) {
        await fetch('/api/admin/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: d.item._id, type: 'in', qty: Number(form.initialStock), note: 'Stok awal' }),
        });
      }
      setShowForm(false);
      setToast(editing ? 'Barang diperbarui' : `Barang ditambahkan${Number(form.initialStock) > 0 ? ` dengan stok awal ${form.initialStock}` : ''}.`);
      fetchItems();
    } catch (e) {
      setFormErrors({ _global: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
      setFormLoading(false);
      setImageUploading(false);
    }
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

  const inputCls = 'w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition';
  const labelCls = 'block text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-1.5';

  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.25em] text-amber-600 uppercase">Panel Admin</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">Barang</h1>
          <p className="text-sm text-slate-500 mt-1.5">{items.length} jenis barang</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-extrabold hover:bg-slate-800 active:scale-95 transition">
          <PlusIcon className="w-4 h-4" />
          Tambah Barang
        </button>
      </div>

      {/* filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / kode..."
            className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-amber-500 bg-white" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500">
          <option value="">Semua kategori</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold outline-none focus:border-amber-500">
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
      </div>

      {/* daftar */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <BoxIcon className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-500">Belum ada barang</p>
          <button onClick={openAdd} className="mt-4 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-extrabold">
            Tambah barang pertama
          </button>
        </div>
      ) : (
        <>
          {/* mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {pageItems.map((item) => {
              const st = stockStatus(item);
              return (
                <div key={item._id} className="bg-white rounded-3xl border border-slate-100 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name}
                        className="w-11 h-11 rounded-2xl object-cover flex-shrink-0 border border-slate-100" />
                    ) : (
                      <span className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                        <BoxIcon className="w-5 h-5" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{item.sku} · {item.category}</p>
                    </div>
                    <StatusBadge status={st} />
                  </div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs text-slate-400 font-bold">Stok</span>
                    <span className="text-xl font-extrabold tabular-nums">{item.stock} <span className="text-xs text-slate-400">{item.unit}</span></span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <button onClick={() => openTrx(item, 'in')}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-extrabold active:scale-95 transition">
                      <PlusIcon className="w-4 h-4" /> Masuk
                    </button>
                    <button onClick={() => openTrx(item, 'out')}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-red-100 text-red-700 text-xs font-extrabold active:scale-95 transition">
                      <MinusIcon className="w-4 h-4" /> Keluar
                    </button>
                    <button onClick={() => openTrx(item, 'adjust')}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-extrabold active:scale-95 transition">
                      <AdjustIcon className="w-4 h-4" /> Opname
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/barang/${item._id}`}
                      className="flex-1 text-center py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-extrabold">
                      Detail & Riwayat
                    </Link>
                    <button onClick={() => openEdit(item)} aria-label="Edit"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteItem(item)} aria-label="Hapus"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* desktop table */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide">Barang</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide">Kategori</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide text-right">Stok</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageItems.map((item) => {
                  const st = stockStatus(item);
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-100" />
                          ) : (
                            <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                              <BoxIcon className="w-4 h-4" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <Link href={`/admin/barang/${item._id}`} className="font-extrabold hover:text-amber-600 transition-colors">{item.name}</Link>
                            <p className="text-xs text-slate-400 font-mono">{item.sku}{item.location ? ` · Rak ${item.location}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-semibold">{item.category}</td>
                      <td className="px-5 py-4 text-right font-extrabold tabular-nums">{item.stock} <span className="text-xs text-slate-400 font-bold">{item.unit}</span></td>
                      <td className="px-5 py-4"><StatusBadge status={st} /></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openTrx(item, 'in')} title="Barang masuk"
                            className="p-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"><PlusIcon className="w-4 h-4" /></button>
                          <button onClick={() => openTrx(item, 'out')} title="Barang keluar"
                            className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition"><MinusIcon className="w-4 h-4" /></button>
                          <button onClick={() => openTrx(item, 'adjust')} title="Opname / penyesuaian"
                            className="p-2 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition"><AdjustIcon className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(item)} title="Edit"
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"><EditIcon className="w-4 h-4" /></button>
                          <button onClick={() => deleteItem(item)} title="Hapus"
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"><TrashIcon className="w-4 h-4" /></button>
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
              <p className="text-xs font-bold text-slate-400">
                {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, items.length)} dari {items.length} barang
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-extrabold text-slate-600 disabled:opacity-40 hover:border-slate-300 transition">
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-extrabold transition ${
                      p === safePage ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-extrabold text-slate-600 disabled:opacity-40 hover:border-slate-300 transition">
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* modal tambah/edit */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editing ? 'Edit Barang' : 'Tambah Barang'}>
          <form onSubmit={submitForm} className="space-y-5">
            {formErrors._global && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl px-4 py-3">{formErrors._global}</div>
            )}
            {/* info barang */}
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-amber-600 uppercase mb-3">Info barang</p>
              <div className="space-y-4">
                {/* foto barang */}
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-amber-400 transition">
                    {(imageFile || form.image) ? (
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : form.image}
                        alt="Foto barang"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400 flex flex-col items-center gap-1">
                        <CameraIcon className="w-6 h-6" />
                        <span className="text-[9px] font-extrabold uppercase tracking-wide">Foto</span>
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold">Foto barang <span className="text-slate-400 font-semibold">(opsional)</span></p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">JPG/PNG, maks 5MB. Muncul di katalog publik.</p>
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition">
                        {imageFile || form.image ? 'Ganti foto' : 'Pilih foto'}
                      </button>
                      {(imageFile || form.image) && (
                        <button type="button" onClick={() => { setImageFile(null); setForm({ ...form, image: '' }); }}
                          className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-extrabold hover:bg-red-100 transition">
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <label className={labelCls}>Nama barang *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="cth: Kardus Packing Besar" className={inputCls} />
                  {formErrors.name && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Kode / SKU *</label>
                    <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="cth: KRD-001" className={`${inputCls} font-mono uppercase`} />
                    {formErrors.sku && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.sku}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Kategori *</label>
                    <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="cth: Packing" list="catlist" className={inputCls} />
                    <datalist id="catlist">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                    {formErrors.category && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.category}</p>}
                  </div>
                </div>
              </div>
            </div>
            {/* stok & lokasi */}
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-amber-600 uppercase mb-3">Stok & lokasi</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Satuan</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Lokasi rak</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="cth: A-12" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stok minimum</label>
                  <input type="number" min="0" value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                    className={inputCls} />
                  {formErrors.minStock && <p className="text-red-600 text-xs font-bold mt-1">{formErrors.minStock}</p>}
                </div>
              </div>
            </div>
            {!editing && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-emerald-900">Stok awal</p>
                    <p className="text-xs text-emerald-700/80 font-semibold mt-0.5">Otomatis tercatat sebagai transaksi masuk</p>
                  </div>
                  <Stepper value={form.initialStock} onChange={(v) => setForm({ ...form, initialStock: v })} />
                </div>
              </div>
            )}
            <button type="submit" disabled={formLoading}
              className="w-full bg-slate-900 text-white font-extrabold rounded-2xl py-4 hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-60 shadow-lg">
              {formLoading ? (imageUploading ? 'Mengupload foto...' : 'Menyimpan...') : editing ? 'Simpan Perubahan' : 'Tambah Barang'}
            </button>
          </form>
        </Modal>
      )}

      {/* modal transaksi */}
      {trxItem && (
        <Modal onClose={() => setTrxItem(null)} title="Catat Pergerakan Stok">
          <div className="flex items-center gap-3 mb-5 p-4 bg-slate-50 rounded-2xl">
            <span className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <BoxIcon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="font-extrabold truncate">{trxItem.name}</p>
              <p className="text-xs text-slate-400">Stok saat ini: <b className="text-slate-700 tabular-nums">{trxItem.stock} {trxItem.unit}</b></p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { v: 'in', label: 'Masuk', cls: 'bg-emerald-100 text-emerald-700', active: 'bg-emerald-500 text-white' },
              { v: 'out', label: 'Keluar', cls: 'bg-red-100 text-red-700', active: 'bg-red-500 text-white' },
              { v: 'adjust', label: 'Opname', cls: 'bg-amber-100 text-amber-700', active: 'bg-amber-500 text-white' },
            ].map((t) => (
              <button key={t.v} type="button" onClick={() => { setTrxType(t.v); setTrxQty(t.v === 'adjust' ? trxItem.stock : 1); setTrxError(''); }}
                className={`py-3 rounded-2xl text-sm font-extrabold transition ${trxType === t.v ? t.active : t.cls}`}>
                {t.label}
              </button>
            ))}
          </div>

          <label className={labelCls}>
            {trxType === 'adjust' ? 'Hasil hitungan fisik (stok opname)' : 'Jumlah'}
          </label>
          <div className="mb-4"><Stepper value={trxQty} onChange={setTrxQty} /></div>

          <label className={labelCls}>Keterangan (opsional)</label>
          <input value={trxNote} onChange={(e) => setTrxNote(e.target.value)}
            placeholder={trxType === 'in' ? 'cth: dari supplier PT Maju' : trxType === 'out' ? 'cth: untuk divisi operasional' : 'cth: selisih hitung rak'}
            className={`${inputCls} mb-4`} />

          {trxPreview() && (
            <div className="flex items-center justify-center gap-3 bg-slate-900 text-white rounded-2xl py-4 mb-4 font-extrabold tabular-nums">
              <span className="text-slate-400">{trxPreview().from}</span>
              <span className="text-amber-400">→</span>
              <span className="text-xl">{trxPreview().to}</span>
              <span className="text-xs text-slate-400">{trxItem.unit}</span>
            </div>
          )}

          {trxError && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl px-4 py-3 flex items-center gap-2">
              <AlertIcon className="w-5 h-5 flex-shrink-0" /> {trxError}
            </div>
          )}

          <button onClick={submitTrx} disabled={trxLoading}
            className="w-full bg-slate-900 text-white font-extrabold rounded-2xl py-4 hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-60">
            {trxLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
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
