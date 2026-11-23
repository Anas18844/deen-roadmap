'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'نظرة عامة' },
  { href: '/admin/students', label: 'الطلبة' },
  { href: '/admin/placements', label: 'طلبات المستوى', badge: 'placements' },
  { href: '/admin/notes', label: 'المدونات' },
  { href: '/admin/content', label: 'المحتوى والكتب' },
  { href: '/admin/snapshots', label: 'السجل الأسبوعي' },
] as const;

export default function AdminNav({ pending }: { pending: number }) {
  const path = usePathname();
  return (
    <aside className="adm__side" aria-label="أقسام لوحة المتابعة">
      <div className="adm__brand">لوحة المتابعة</div>
      {LINKS.map((l) => {
        const active = l.href === '/admin' ? path === '/admin' : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className="adm__link" aria-current={active ? 'page' : undefined}>
            {l.label}
            {'badge' in l && pending > 0 && <span className="adm__count">{pending}</span>}
          </Link>
        );
      })}
      <div className="adm__foot">الأرقام تتحدث تلقائيًا كل ساعة</div>
    </aside>
  );
}
