import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';

const SAMPLE = [
  { name: 'Kardus Packing Besar', sku: 'KRD-001', category: 'Packing', unit: 'pcs', location: 'A-01', minStock: 20, stock: 145 },
  { name: 'Lakban Bening', sku: 'LKB-002', category: 'Packing', unit: 'pcs', location: 'A-02', minStock: 30, stock: 88 },
  { name: 'Bubble Wrap', sku: 'BBW-003', category: 'Packing', unit: 'meter', location: 'A-03', minStock: 50, stock: 32 },
  { name: 'Tali Strapping', sku: 'STR-011', category: 'Packing', unit: 'roll', location: 'A-04', minStock: 15, stock: 0 },
  { name: 'Kertas A4 80gsm', sku: 'KRT-004', category: 'ATK', unit: 'rim', location: 'B-01', minStock: 10, stock: 24 },
  { name: 'Tinta Printer Hitam', sku: 'TNT-005', category: 'ATK', unit: 'pcs', location: 'B-02', minStock: 5, stock: 3 },
  { name: 'Sarung Tangan Kerja', sku: 'SRG-006', category: 'Safety', unit: 'pasang', location: 'C-01', minStock: 24, stock: 60 },
  { name: 'Masker Debu', sku: 'MSK-007', category: 'Safety', unit: 'box', location: 'C-02', minStock: 10, stock: 18 },
  { name: 'Oli Mesin 1L', sku: 'OLI-008', category: 'Maintenance', unit: 'liter', location: 'D-01', minStock: 8, stock: 12 },
  { name: 'Baut M8', sku: 'BUT-009', category: 'Sparepart', unit: 'pcs', location: 'D-02', minStock: 100, stock: 450 },
  { name: 'Lampu LED 10W', sku: 'LMP-012', category: 'Maintenance', unit: 'pcs', location: 'D-03', minStock: 12, stock: 9 },
  { name: 'Pallet Kayu', sku: 'PLT-010', category: 'Logistik', unit: 'pcs', location: 'E-01', minStock: 10, stock: 35 },
];

// GET /api/init — inisialisasi sekali: buat admin + data contoh.
// Idempotent: hanya jalan untuk koleksi yang masih kosong.
export async function GET() {
  await dbConnect();

  let adminCreated = false;
  if ((await User.countDocuments()) === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', passwordHash, name: 'Admin Gudang', role: 'admin' });
    adminCreated = true;
  }

  let seeded = 0;
  if ((await Item.countDocuments()) === 0) {
    for (const d of SAMPLE) {
      const item = await Item.create({ ...d });
      if (d.stock > 0) {
        await Transaction.create({
          item: item._id, itemName: item.name, itemSku: item.sku,
          type: 'in', qty: d.stock, stockBefore: 0, stockAfter: d.stock,
          note: 'Stok awal', createdBy: 'admin',
        });
      }
    }
    seeded = SAMPLE.length;
  }

  return Response.json({ ok: true, adminCreated, seeded });
}
