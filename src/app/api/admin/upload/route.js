import { createHash } from 'crypto';
import { requireAdmin } from '@/lib/admin';

// POST /api/admin/upload — upload foto barang ke Cloudinary
// body: FormData { file }
// balikan: { url }
export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    return Response.json({ message: 'Upload belum dikonfigurasi' }, { status: 500 });
  }

  const fd = await req.formData();
  const file = fd.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ message: 'File tidak ditemukan' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return Response.json({ message: 'File harus berupa gambar' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ message: 'Ukuran gambar maksimal 5MB' }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'stokgudang/barang';
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest('hex');

  const out = new FormData();
  out.append('file', file);
  out.append('api_key', key);
  out.append('timestamp', String(timestamp));
  out.append('folder', folder);
  out.append('signature', signature);

  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: out,
  });
  const d = await r.json();
  if (!r.ok) {
    return Response.json({ message: d?.error?.message || 'Gagal mengupload gambar' }, { status: 502 });
  }
  return Response.json({ url: d.secure_url });
}
