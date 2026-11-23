import { getStats } from '@/lib/admin';
import StudentsTable from './StudentsTable';

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ inactive?: string }> }) {
  const { inactive } = await searchParams;
  const { students, levels } = await getStats();
  return <StudentsTable students={students} levels={levels.map((l) => ({ number: l.level_number, title: l.title }))} initialInactive={!!inactive} />;
}
