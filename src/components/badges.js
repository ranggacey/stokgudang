// Status stok: Tersedia / Menipis / Habis — dipakai di publik & admin
export function stockStatus(item) {
  if (item.stock === 0) return 'empty';
  if (item.stock <= item.minStock) return 'low';
  return 'ok';
}

export const STATUS_LABEL = { ok: 'Tersedia', low: 'Menipis', empty: 'Habis' };

export function StatusBadge({ status, className = '' }) {
  const styles = {
    ok: 'bg-emerald-100 text-emerald-700',
    low: 'bg-amber-100 text-amber-700',
    empty: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${styles[status]} ${className}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export const TYPE_LABEL = { in: 'Masuk', out: 'Keluar', adjust: 'Penyesuaian' };

export function TypeBadge({ type, className = '' }) {
  const styles = {
    in: 'bg-emerald-100 text-emerald-700',
    out: 'bg-red-100 text-red-700',
    adjust: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${styles[type]} ${className}`}>
      {TYPE_LABEL[type]}
    </span>
  );
}
