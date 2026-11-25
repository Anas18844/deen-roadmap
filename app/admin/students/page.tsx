import { getStats } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';
import StudentsTable from './StudentsTable';
import AddStudentForm from './AddStudentForm';

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ inactive?: string }> }) {
  const { inactive } = await searchParams;
  const { students, levels } = await getStats();
  const supabase = await createClient();
  const { data: phones } = await supabase.from('profiles').select('id, whatsapp').not('whatsapp', 'is', null);
  const phoneOf = Object.fromEntries((phones ?? []).map((p) => [p.id, p.whatsapp as string]));
  return (
    <div className="adm-stack">
      <header className="adm__head"><div><h1 className="adm__title">الطلبة</h1><p className="adm__sub">ابحث وصفِّ حسب المستوى والمحافظة ومدة التوقف.</p></div></header>
      <AddStudentForm levels={levels.filter((l) => l.level_number <= 3).map((l) => ({ number: l.level_number, title: l.title }))} />
      <StudentsTable phones={phoneOf} students={students} levels={levels.map((l) => ({ number: l.level_number, title: l.title }))} initialInactive={!!inactive} />
    </div>
  );
}
