'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { BoxIcon, LockIcon, UserIcon, AlertIcon, CheckIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons';
import { stockStatus, StatusBadge, TypeBadge, TYPE_LABEL } from '@/components/badges';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    // trim: toleran spasi nyasar dari keyboard HP
    const res = await signIn('credentials', {
      username: username.trim(),
      password: password.trim(),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Username atau password salah. Cek lagi pelan-pelan ya.');
    } else {
      window.location.href = '/admin';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* dekorasi */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="text-center mb-8">
          <span className="inline-flex w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
            <BoxIcon className="w-8 h-8" />
          </span>
          <p className="text-[11px] font-extrabold tracking-[0.25em] text-amber-400 uppercase">Stok Gudang</p>
          <h1 className="text-2xl font-extrabold text-white mt-1">Panel Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Masuk untuk mengelola gudang</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-2xl px-4 py-3">
              {error}
            </div>
          )}
          <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Username</label>
          <div className="relative mb-4">
            <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={username} onChange={(e) => setUsername(e.target.value)} autoFocus
              placeholder="username" autoComplete="username"
              autoCapitalize="off" autoCorrect="off" spellCheck={false}
              className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
            />
          </div>
          <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
          <div className="relative mb-6">
            <LockIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className="w-full border border-slate-200 rounded-2xl pl-12 pr-14 py-3.5 text-sm font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 hover:text-slate-600">
              {showPw ? 'SEMBUNYI' : 'LIHAT'}
            </button>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white font-extrabold rounded-2xl py-4 hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-60 shadow-lg"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
        <p className="text-center mt-6">
          <Link href="/" className="text-slate-400 text-sm font-bold hover:text-amber-400 transition-colors">
            ← Lihat halaman publik
          </Link>
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const r = await fetch('/api/admin/stats');
      setStats(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
      </div>
    );
  }
  if (!stats) return <p className="text-slate-500 font-bold">Gagal memuat data.</p>;

  return (
    <div className="animate-fade-up">
      <div className="mb-7">
        <p className="text-[11px] font-extrabold tracking-[0.25em] text-amber-600 uppercase">Panel Admin</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1.5">Ringkasan kondisi gudang hari ini</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Jenis barang', value: stats.totalItems, icon: <BoxIcon className="w-6 h-6" />, tile: 'bg-slate-900 text-amber-400', ring: 'hover:shadow-slate-900/10' },
          { label: 'Total stok', value: stats.totalStock, icon: <CheckIcon className="w-6 h-6" />, tile: 'bg-emerald-500 text-white', ring: 'hover:shadow-emerald-500/20' },
          { label: 'Menipis', value: stats.lowCount, icon: <AlertIcon className="w-6 h-6" />, tile: 'bg-amber-400 text-slate-900', ring: 'hover:shadow-amber-400/30' },
          { label: 'Habis', value: stats.emptyCount, icon: <AlertIcon className="w-6 h-6" />, tile: 'bg-red-500 text-white', ring: 'hover:shadow-red-500/20' },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-3.5 shadow-sm transition-shadow hover:shadow-lg ${s.ring}`}>
            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${s.tile}`}>{s.icon}</span>
            <div>
              <p className="text-2xl font-extrabold tabular-nums leading-none">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* perlu perhatian */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertIcon className="w-5 h-5" />
            </span>
            Perlu Perhatian
          </h2>
          <Link href="/admin/barang" className="text-xs font-extrabold text-amber-600 hover:text-amber-700">
            Kelola barang →
          </Link>
        </div>
        {stats.attention.length === 0 ? (
          <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-4">
            <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckIcon className="w-5 h-5" />
            </span>
            <p className="text-sm font-bold text-emerald-800">Semua stok aman, tidak ada yang menipis atau habis.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.attention.map((item) => {
              const st = stockStatus(item);
              return (
                <Link key={item._id} href={`/admin/barang/${item._id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${st === 'empty' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    <BoxIcon className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                  </div>
                  <span className="text-sm font-extrabold tabular-nums">{item.stock} <span className="text-xs font-bold text-slate-400">{item.unit}</span></span>
                  <StatusBadge status={st} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* transaksi terakhir */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg">Transaksi Terakhir</h2>
          <Link href="/admin/riwayat" className="text-xs font-extrabold text-amber-600 hover:text-amber-700">
            Semua riwayat →
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-slate-400 font-semibold text-center py-6">Belum ada transaksi.</p>
        ) : (
          <div className="space-y-2">
            {stats.recent.map((t) => (
              <div key={t._id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'in' ? 'bg-emerald-100 text-emerald-700' : t.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t.type === 'in' ? <ArrowUpIcon className="w-4 h-4" /> : t.type === 'out' ? <ArrowDownIcon className="w-4 h-4" /> : <AlertIcon className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{t.itemName}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(t.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {t.note ? ` · ${t.note}` : ''}
                  </p>
                </div>
                <TypeBadge type={t.type} />
                <span className="text-sm font-extrabold tabular-nums whitespace-nowrap">
                  {t.type === 'out' ? '−' : '+'}{t.qty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session ? <Dashboard /> : <LoginForm />;
}
