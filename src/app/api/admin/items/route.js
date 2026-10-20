import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import { requireAdmin } from '@/lib/admin';

function validate(data, isCreate) {
  const errors = {};
  if (isCreate || data.name !== undefined) {
    if (!data.name || !String(data.name).trim()) errors.name = 'Nama barang wajib diisi';
  }
  if (isCreate || data.sku !== undefined) {
    if (!data.sku || !String(data.sku).trim()) errors.sku = 'Kode/SKU wajib diisi';
  }
  if (isCreate || data.category !== undefined) {
    if (!data.category || !String(data.category).trim()) errors.category = 'Kategori wajib diisi';
  }
  if (data.minStock !== undefined) {
    const n = Number(data.minStock);
    if (!Number.isInteger(n) || n < 0) errors.minStock = 'Stok minimum harus bilangan bulat ≥ 0';
  }
  return errors;
}

// POST /api/admin/items — tambah barang (stok awal via transaksi terpisah agar tercatat)
export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const data = await req.json();
  const errors = validate(data, true);
  if (Object.keys(errors).length) return Response.json({ message: 'Validasi gagal', errors }, { status: 400 });

  try {
    const item = await Item.create({
      name: String(data.name).trim(),
      sku: String(data.sku).trim().toUpperCase(),
      category: String(data.category).trim(),
      unit: String(data.unit || 'pcs').trim(),
      location: String(data.location || '').trim(),
      minStock: Number(data.minStock || 0),
      image: data.image ? String(data.image).trim() : '',
      stock: 0,
    });
    return Response.json({ item }, { status: 201 });
  } catch (e) {
    if (e.code === 11000) {
      return Response.json({ message: 'Kode/SKU sudah dipakai barang lain', errors: { sku: 'Kode/SKU sudah dipakai' } }, { status: 400 });
    }
    throw e;
  }
}
