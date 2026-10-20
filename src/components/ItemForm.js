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
        className="nb-chip w-12 h-12 rounded-2xl bg-white text-[#241F31] font-black text-xl">+</button>
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

  const inputCls = 'nb-input w-full px-4 py-3 text-sm font-bold transition';
  const labelCls = 'block text-xs font-extrabold text-[#241F31]/60 uppercase tracking-[0.18em] mb-1.5';

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
        <div className="bg-[#FFBEFB] border-[3px] border-[#241F31] text-[#241F31] text-sm font-bold rounded-2xl px-4 py-3">{errors._global}</div>
      )}
      {/* info barang */}
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.18em] text-[#8C56D4] uppercase mb-3">Info barang</p>
        <div className="space-y-4">
          {/* foto barang */}
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-3xl bg-[#DC95FF] border-[3px] border-dashed border-[#241F31] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[4px_4px_0_#241F31]">
              {(imageFile || form.image) ? (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : form.image}
                  alt="Foto barang"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#241F31] flex flex-col items-center gap-1">
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
                  className="nb-chip px-3.5 py-2 rounded-xl bg-[#241F31] text-white text-xs font-extrabold">
                  {imageFile || form.image ? 'Ganti foto' : 'Pilih foto'}
                </button>
                {(imageFile || form.image) && (
                  <button type="button" onClick={() => { setImageFile(null); setForm({ ...form, image: '' }); }}
                    className="nb-chip px-3.5 py-2 rounded-xl bg-[#FFBEFB] text-[#241F31] text-xs font-extrabold">
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
        <p className="text-[11px] font-extrabold tracking-[0.18em] text-[#8C56D4] uppercase mb-3">Stok & lokasi</p>
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
        <div className="bg-[#FFF4BF] border-[3px] border-[#241F31] rounded-3xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-[#241F31]">Stok awal</p>
              <p className="text-xs text-[#241F31]/60 font-semibold mt-0.5">Otomatis tercatat sebagai transaksi masuk</p>
            </div>
            <Stepper value={form.initialStock} onChange={(v) => setForm({ ...form, initialStock: v })} />
          </div>
        </div>
      )}
      <button type="submit" disabled={loading}
        className="nb-btn w-full bg-[#8C56D4] text-white font-black rounded-2xl py-4 disabled:opacity-60">
        {loading ? (uploading ? 'Mengupload foto...' : 'Menyimpan...') : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Barang'}
      </button>
    </form>
  );
}
