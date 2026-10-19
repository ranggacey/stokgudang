import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET /api/init — buat akun admin pertama. Hanya jalan jika belum ada user sama sekali.
// Dipanggil sekali setelah deploy, aman dibiarkan (idempotent).
export async function GET() {
  await dbConnect();
  const count = await User.countDocuments();
  if (count > 0) {
    return Response.json({ ok: true, message: 'Admin sudah ada' });
  }
  const passwordHash = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', passwordHash, name: 'Admin Gudang', role: 'admin' });
  return Response.json({ ok: true, message: 'Akun admin dibuat (admin / admin123)' });
}
