'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Providers from '@/components/Providers';
import {
  HomeIcon, BoxIcon, HistoryIcon, LogoutIcon, MenuIcon, CloseIcon, LockIcon,
} from '@/components/icons';

const NAV = [
  { name: 'Dashboard', href: '/admin', Icon: HomeIcon },
  { name: 'Barang', href: '/admin/barang', Icon: BoxIcon },
  { name: 'Riwayat', href: '/admin/riwayat', Icon: HistoryIcon },
];

function Shell({ children, session }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const nav = (onNav) => (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100">
        <span className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0">
          <BoxIcon className="w-6 h-6" />
        </span>
        <div className="leading-tight">
          <p className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase">Admin</p>
          <p className="font-extrabold">Stok Gudang</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ name, href, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 mb-3">
          <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
            {(session?.user?.name || 'A').charAt(0).toUpperCase()}
          </span>
          <p className="text-sm font-bold truncate">{session?.user?.name || 'Admin'}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <LogoutIcon className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* header mobile */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 md:hidden">
        <div className="px-4 h-16 flex items-center gap-3">
          <button onClick={() => setOpen(true)} aria-label="Buka menu"
            className="p-2 -ml-2 rounded-full text-slate-600 hover:bg-slate-100">
            <MenuIcon className="w-6 h-6" />
          </button>
          <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
            <BoxIcon className="w-5 h-5" />
          </span>
          <span className="font-extrabold">Admin Gudang</span>
        </div>
      </header>

      {/* sidebar mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={() => setOpen(false)} aria-label="Tutup menu"
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 z-10">
            <CloseIcon className="w-5 h-5" />
          </button>
          {nav(() => setOpen(false))}
        </aside>
      </div>

      {/* sidebar desktop */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 z-30">
        {nav()}
      </aside>

      <main className="md:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Providers>
      <Gate>{children}</Gate>
    </Providers>
  );
}

function Gate({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  // belum login → halaman polos (form login), tanpa sidebar
  if (!session) {
    return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  return <Shell session={session}>{children}</Shell>;
}
