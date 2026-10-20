import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';
import { requireAdmin } from '@/lib/admin';

// PUT /api/admin/items/[id] — edit barang (stok TIDAK bisa diubah langsung)
export async function PUT(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const data = await req.json();
  if (data.stock !== undefined) {
    return Response.json({ message: 'Stok hanya bisa diubah lewat transaksi' }, { status: 400 });
  }

  const update = {};
  if (data.name !== undefined) update.name = String(data.name).trim();
  if (data.sku !== undefined) update.sku = String(data.sku).trim().toUpperCase();
  if (data.category !== undefined) update.category = String(data.category).trim();
  if (data.unit !== undefined) update.unit = String(data.unit).trim();
  if (data.location !== undefined) update.location = String(data.location).trim();
  if (data.image !== undefined) update.image = String(data.image).trim();
  if (data.minStock !== undefined) {
    const n = Number(data.minStock);
    if (!Number.isInteger(n) || n < 0) {
      return Response.json({ message: 'Stok minimum harus bilangan bulat ≥ 0' }, { status: 400 });
    }
    update.minStock = n;
  }
  if (!update.name) return Response.json({ message: 'Nama barang wajib diisi' }, { status: 400 });

  try {
    const item = await Item.findByIdAndUpdate(params.id, update, { new: true, runValidators: true });
    if (!item) return Response.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
    return Response.json({ item });
  } catch (e) {
    if (e.code === 11000) {
      return Response.json({ message: 'Kode/SKU sudah dipakai barang lain' }, { status: 400 });
    }
    throw e;
  }
}

// DELETE /api/admin/items/[id] — hapus barang, hanya jika stok 0
export async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const item = await Item.findById(params.id);
  if (!item) return Response.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
  if (item.stock > 0) {
    return Response.json({ message: `Tidak bisa dihapus: stok masih ${item.stock}. Keluarkan dulu lewat transaksi.` }, { status: 400 });
  }
  await Item.findByIdAndDelete(params.id);
  // riwayat transaksi tetap tersimpan (ada snapshot nama & SKU)
  return Response.json({ ok: true });
}

// GET /api/admin/items/[id] — detail + riwayat transaksi (audit trail)
export async function GET(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const item = await Item.findById(params.id).lean();
  if (!item) return Response.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
  const history = await Transaction.find({ item: params.id }).sort({ createdAt: -1 }).limit(100).lean();
  return Response.json({ item, history });
}
