'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon } from '@/components/icons';

const UNITS = ['pcs', 'box', 'dus', 'kg', 'liter', 'meter', 'pak', 'set'];

const EMPTY_FORM = { name: '', sku: '', category: '', unit: 'pcs', location: '', minStock: 0, initialStock: 0, image: '' };

function Stepper({ value, onChange }) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setText(String(value)); }, [value, focused]);
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xl hover:bg-slate-200 active:scale-95 transition">−</button>
      <input
        type="number" min="0" value={text}
        onFocus={(e) => { setFocused(true); e.target.select(); }}
        onBlur={() => { setFocused(false); setText(String(value)); }}
        onChange={(e) => {
          const t = e.target.value.replace(/[^0-9]/g, '');
          setText(t);
          onChange(t === '' ? 0 : parseInt(t, 10));
        }}
        className="w-24 text-center text-2xl font-extrabold tabular-nums border border-slate-200 rounded-2xl py-2.5 outline-none focus:border-amber-500"
      />
      <button type="button" onClick={() => onChange(value + 1)}
        className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xl hover:bg-slate-200 active:scale-95 transition">+</button>
    </div>
  );
}

// mode: 'add' | 'edit'. edit butuh itemId + onDone (tutup modal & refresh daftar).
export default function ItemForm({ initial, categories = [], mode = 'add', itemId, onDone }) {
  const router = useRouter();
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const inputCls = 'w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition';
  const labelCls = 'block text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-1.5';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      let imageUrl = form.image || '';
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', imageFile);
        const up = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const ud = await up.json();
        setUploading(false);
        if (!up.ok) {
          setErrors({ _global: ud.message || 'Gagal mengupload foto' });
          return;
        }
        imageUrl = ud.url;
      }
      const url = mode === 'edit' ? `/api/admin/items/${itemId}` : '/api/admin/items';
      const r = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, minStock: Number(form.minStock), image: imageUrl }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErrors(d.errors || {});
        if (d.message && !d.errors) setErrors({ _global: d.message });
        return;
      }
      if (mode === 'add') {
        if (Number(form.initialStock) > 0 && d.item?._id) {
          await fetch('/api/admin/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: d.item._id, type: 'in', qty: Number(form.initialStock), note: 'Stok awal' }),
          });
        }
        try {
          sessionStorage.setItem(
            'barang_toast',
            `Barang ditambahkan${Number(form.initialStock) > 0 ? ` dengan stok awal ${form.initialStock}` : ''}.`
          );
        } catch {}
        router.push('/admin/barang');
        router.refresh();
      } else {
        onDone?.();
      }
    } catch (err) {
      setErrors({ _global: 'Terjadi kesalahan. Coba lagi.' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors._global && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl px-4 py-3">{errors._global}</div>
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
            {errors.name && <p className="text-red-600 text-xs font-bold mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kode / SKU *</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="cth: KRD-001" className={`${inputCls} font-mono uppercase`} />
              {errors.sku && <p className="text-red-600 text-xs font-bold mt-1">{errors.sku}</p>}
            </div>
            <div>
              <label className={labelCls}>Kategori *</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="cth: Packing" list="catlist" className={inputCls} />
              <datalist id="catlist">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              {errors.category && <p className="text-red-600 text-xs font-bold mt-1">{errors.category}</p>}
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
            <input type="number" min="0" value={form.minStock === '' ? '' : form.minStock}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const t = e.target.value;
                setForm({ ...form, minStock: t === '' ? '' : Math.max(0, Math.floor(Number(t) || 0)) });
              }}
              placeholder="0"
              className={inputCls} />
            {errors.minStock && <p className="text-red-600 text-xs font-bold mt-1">{errors.minStock}</p>}
          </div>
        </div>
      </div>
      {mode === 'add' && (
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
      <button type="submit" disabled={loading}
        className="w-full bg-slate-900 text-white font-extrabold rounded-2xl py-4 hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-60 shadow-lg">
        {loading ? (uploading ? 'Mengupload foto...' : 'Menyimpan...') : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Barang'}
      </button>
    </form>
  );
}
