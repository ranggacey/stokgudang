import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';
import { requireAdmin } from '@/lib/admin';

// POST /api/admin/transactions — catat pergerakan stok (atomik, tervalidasi)
// body: { itemId, type: 'in'|'out'|'adjust', qty, note }
// - in:     stok += qty
// - out:    stok -= qty (ditolak jika qty > stok)
// - adjust: stok diset = qty (opname; selisih tercatat otomatis)
export async function POST(req) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const { itemId, type, qty, note } = await req.json();

  if (!['in', 'out', 'adjust'].includes(type)) {
    return Response.json({ message: 'Tipe transaksi tidak valid' }, { status: 400 });
  }
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 0) {
    return Response.json({ message: 'Jumlah harus bilangan bulat ≥ 0' }, { status: 400 });
  }
  if ((type === 'in' || type === 'out') && n < 1) {
    return Response.json({ message: 'Jumlah masuk/keluar minimal 1' }, { status: 400 });
  }

  const item = await Item.findById(itemId);
  if (!item) return Response.json({ message: 'Barang tidak ditemukan' }, { status: 404 });

  const stockBefore = item.stock;
  let stockAfter;

  if (type === 'in') {
    stockAfter = stockBefore + n;
  } else if (type === 'out') {
    if (n > stockBefore) {
      return Response.json(
        { message: `Stok tidak cukup. Sisa ${stockBefore} ${item.unit}, diminta ${n}.` },
        { status: 400 }
      );
    }
    stockAfter = stockBefore - n;
  } else {
    // adjust: hasil opname fisik
    stockAfter = n;
  }

  // Update atomik: hanya berhasil jika stok saat ini masih sama (cegah race)
  const updated = await Item.findOneAndUpdate(
    { _id: itemId, stock: stockBefore },
    { $set: { stock: stockAfter } },
    { new: true }
  );
  if (!updated) {
    return Response.json(
      { message: 'Stok berubah saat diproses (transaksi lain bersamaan). Coba lagi.' },
      { status: 409 }
    );
  }

  const trx = await Transaction.create({
    item: item._id,
    itemName: item.name,
    itemSku: item.sku,
    type,
    qty: n,
    stockBefore,
    stockAfter,
    note: String(note || '').trim(),
    createdBy: session.user?.username || 'admin',
  });

  return Response.json({ transaction: trx, item: updated }, { status: 201 });
}

// GET /api/admin/transactions — riwayat (filter: type, itemId, q, sort)
export async function GET(req) {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || '';
  const itemId = searchParams.get('itemId') || '';
  const q = (searchParams.get('q') || '').trim();
  const sort = searchParams.get('sort') || 'newest';
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);

  const filter = {};
  if (type && ['in', 'out', 'adjust'].includes(type)) filter.type = type;
  if (itemId) filter.item = itemId;
  if (q) filter.$or = [{ itemName: { $regex: q, $options: 'i' } }, { itemSku: { $regex: q, $options: 'i' } }];

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
    .limit(limit)
    .lean();

  return Response.json({ transactions });
}
