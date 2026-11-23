import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page">
      <div className="container" style={{ paddingBlock: '1.5rem 3rem' }}>
        <h1 className="section-title" style={{ marginBottom: 0 }}>لوحة المتابعة</h1>
        <nav className="admin-nav">
          <Link href="/admin">نظرة عامة</Link>
          <Link href="/admin/students">الطلبة</Link>
          <Link href="/admin/placements">طلبات المستوى</Link>
          <Link href="/admin/notes">المدونات</Link>
          <Link href="/admin/content">المحتوى</Link>
          <Link href="/admin/snapshots">السجل الأسبوعي</Link>
        </nav>
        {children}
      </div>
    </main>
  );
}
