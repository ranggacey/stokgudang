import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';
import { requireAdmin } from '@/lib/admin';

// GET /api/admin/stats — statistik dashboard
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await dbConnect();

  const items = await Item.find({}).lean();
  const totalItems = items.length;
  const totalStock = items.reduce((s, i) => s + i.stock, 0);
  const empty = items.filter((i) => i.stock === 0);
  const low = items.filter((i) => i.stock > 0 && i.stock <= i.minStock);
  const attention = [...empty, ...low].sort((a, b) => a.stock - b.stock).slice(0, 10);

  const recent = await Transaction.find({}).sort({ createdAt: -1 }).limit(5).lean();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await Transaction.countDocuments({ createdAt: { $gte: today } });

  return Response.json({
    totalItems,
    totalStock,
    emptyCount: empty.length,
    lowCount: low.length,
    todayCount,
    attention,
    recent,
  });
}
