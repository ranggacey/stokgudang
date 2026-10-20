'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ItemForm from '@/components/ItemForm';
import { ChevronRightIcon } from '@/components/icons';

export default function TambahBarangPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/items');
        const d = await r.json();
        setCategories(d.categories || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="animate-fade-up max-w-2xl">
      <Link href="/admin/barang"
        className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-400 hover:text-slate-700 transition mb-5">
        <ChevronRightIcon className="w-4 h-4 rotate-180" />
        Kembali ke daftar barang
      </Link>

      <div className="mb-5">
        <p className="text-[11px] font-extrabold tracking-[0.25em] text-amber-600 uppercase">Panel Admin</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">Tambah Barang</h1>
        <p className="text-sm text-slate-500 mt-1.5">Isi detail barang baru. Setelah tersimpan, kamu kembali ke daftar barang.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-7 shadow-sm">
        <ItemForm mode="add" categories={categories} />
      </div>
    </div>
  );
}
