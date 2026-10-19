import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';

// GET /api/items/[id] — publik: detail barang + info stok
export async function GET(req, { params }) {
  await dbConnect();
  const item = await Item.findById(params.id).lean();
  if (!item) return Response.json({ message: 'Barang tidak ditemukan' }, { status: 404 });
  return Response.json({ item });
}
