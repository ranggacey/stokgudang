// Status stok: Tersedia / Menipis / Habis — dipakai di publik & admin
export function stockStatus(item) {
  if (item.stock === 0) return 'empty';
  if (item.stock <= item.minStock) return 'low';
  return 'ok';
}

export const STATUS_LABEL = { ok: 'Tersedia', low: 'Menipis', empty: 'Habis' };

export function StatusBadge({ status, className = '' }) {
  const styles = {
    ok: 'bg-[#FFF4BF] text-[#241F31]',
    low: 'bg-[#DC95FF] text-[#241F31]',
    empty: 'bg-[#FFBEFB] text-[#241F31]',
  };
  return (
    <span className={`nb-badge inline-flex items-center px-3 py-1 text-xs font-extrabold ${styles[status]} ${className}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export const TYPE_LABEL = { in: 'Masuk', out: 'Keluar', adjust: 'Penyesuaian' };

export function TypeBadge({ type, className = '' }) {
  const styles = {
    in: 'bg-[#FFF4BF] text-[#241F31]',
    out: 'bg-[#FFBEFB] text-[#241F31]',
    adjust: 'bg-[#DC95FF] text-[#241F31]',
  };
  return (
    <span className={`nb-badge inline-flex items-center px-3 py-1 text-xs font-extrabold ${styles[type]} ${className}`}>
      {TYPE_LABEL[type]}
    </span>
  );
}
