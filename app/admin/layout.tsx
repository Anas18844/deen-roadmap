import { createClient } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';
import '../styles/admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { count } = await supabase.from('placement_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending');
  return (
    <div className="adm">
      <AdminNav pending={count ?? 0} />
      <main className="adm__main">{children}</main>
    </div>
  );
}
