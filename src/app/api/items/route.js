import dbConnect from '@/lib/db';
import Item from '@/models/Item';

// GET /api/items — publik: daftar barang (search, filter kategori, sort)
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const sort = searchParams.get('sort') || 'name_asc';
  const status = searchParams.get('status') || ''; // all | available | low | empty

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;

  const sortMap = {
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    stock_asc: { stock: 1 },
    stock_desc: { stock: -1 },
    newest: { createdAt: -1 },
  };

  let items = await Item.find(filter)
    .sort(sortMap[sort] || sortMap.name_asc)
    .lean();

  // filter status butuh perbandingan stock vs minStock (di JS biar akurat)
  if (status === 'empty') items = items.filter((i) => i.stock === 0);
  else if (status === 'low') items = items.filter((i) => i.stock > 0 && i.stock <= i.minStock);
  else if (status === 'available') items = items.filter((i) => i.stock > i.minStock);

  const categories = await Item.distinct('category');

  return Response.json({ items, categories: categories.sort() });
}
