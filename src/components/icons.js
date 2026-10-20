function Base({ className = '', children, strokeWidth = 1.8 }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function BoxIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M3.5 8L12 3.5 20.5 8v8L12 20.5 3.5 16V8z" />
      <path d="M3.5 8L12 12.5 20.5 8M12 12.5V20.5" />
    </Base>
  );
}

export function SearchIcon({ className = '' }) {
  return (
    <Base className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Base>
  );
}

export function CameraIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4 8h3l2-2.5h6L17 8h3a1.5 1.5 0 011.5 1.5V18a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 18V9.5A1.5 1.5 0 014 8z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </Base>
  );
}

export function PlusIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function MinusIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M5 12h14" />
    </Base>
  );
}

export function AdjustIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4 7.5h9M17.5 7.5H20M4 16.5h3M11.5 16.5H20" />
      <circle cx="15" cy="7.5" r="2.2" />
      <circle cx="9" cy="16.5" r="2.2" />
    </Base>
  );
}

export function HomeIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
    </Base>
  );
}

export function LogoutIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M10 12h11M18 8.5L21.5 12 18 15.5" />
    </Base>
  );
}

export function ChevronRightIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M9 5l7 7-7 7" />
    </Base>
  );
}

export function AlertIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M12 4L2.8 19.5h18.4L12 4z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </Base>
  );
}

export function CheckIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4.5 12.5l5 5 10-11" />
    </Base>
  );
}

export function TrashIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4.5 6.5h15M9.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6M7 6.5l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
      <path d="M10 10.5v6M14 10.5v6" />
    </Base>
  );
}

export function EditIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />
    </Base>
  );
}

export function HistoryIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4.5 12a7.5 7.5 0 1 1 2.2 5.3M4.5 12H2.8M4.5 12l-1.7-2" />
      <path d="M12 7.5V12l3 2" />
    </Base>
  );
}

export function MenuIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  );
}

export function CloseIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function ArrowUpIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Base>
  );
}

export function ArrowDownIcon({ className = '' }) {
  return (
    <Base className={className}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Base>
  );
}

export function LockIcon({ className = '' }) {
  return (
    <Base className={className}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Base>
  );
}

export function UserIcon({ className = '' }) {
  return (
    <Base className={className}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Base>
  );
}
