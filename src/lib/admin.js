import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return { error: Response.json({ message: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}
