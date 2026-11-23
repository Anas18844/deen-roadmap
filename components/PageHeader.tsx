import Link from 'next/link';

export default function PageHeader({
  title,
  subtitle,
  backTo = '/',
  backLabel = 'الرئيسية',
  children,
}: {
  title: string;
  subtitle?: string | null;
  backTo?: string;
  backLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-header">
      <div className="page-header__bg" aria-hidden="true" />
      <div className="container">
        <Link href={backTo} className="page-header__back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          {backLabel}
        </Link>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
