import { getStats } from '@/lib/admin';
import StudentsTable from './StudentsTable';

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ inactive?: string }> }) {
  const { inactive } = await searchParams;
  const { students, levels } = await getStats();
  return (
    <div className="adm-stack">
      <header className="adm__head"><div><h1 className="adm__title">الطلبة</h1><p className="adm__sub">ابحث وصفِّ حسب المستوى والمحافظة ومدة التوقف.</p></div></header>
      <StudentsTable students={students} levels={levels.map((l) => ({ number: l.level_number, title: l.title }))} initialInactive={!!inactive} />
    </div>
  );
}
