import { createClient } from '@/lib/supabase/server';
import BulkMessages, { type Recipient } from './BulkMessages';

export default async function MessagesPage() {
  const supabase = await createClient();
  const [{ data: analytics }, { data: phones }] = await Promise.all([
    supabase.rpc('admin_analytics', { p_days: 30 }),
    supabase.from('profiles').select('id, whatsapp').not('whatsapp', 'is', null),
  ]);
  const phoneOf = new Map((phones ?? []).map((p) => [p.id, p.whatsapp as string]));
  const atRisk = ((analytics as { at_risk?: { id: string; full_name: string; level: number; idle: number; next_item: string | null }[] })?.at_risk ?? []);
  const recipients: Recipient[] = atRisk.map((s) => ({
    id: s.id, name: s.full_name, phone: phoneOf.get(s.id) ?? null, days: s.idle, lesson: s.next_item, level: s.level,
  }));

  return (
    <div className="adm-stack">
      <header className="adm__head">
        <div>
          <h1 className="adm__title">رسائل المتابعة</h1>
          <p className="adm__sub">
            الطلبة المتوقفون منذ 7 أيام أو أكثر. اكتب الرسالة مرة واحدة، وتتخصص تلقائيًا لكل طالب باسمه ودرسه.
            واتساب لا يسمح بالإرسال الجماعي التلقائي، فاضغط «إرسال» لكل طالب وتفتح المحادثة والرسالة جاهزة.
          </p>
        </div>
      </header>
      <BulkMessages recipients={recipients} />
    </div>
  );
}
