import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/data';
import Shield from '@/components/Shield';
import PrintButton from '@/components/PrintButton';

export default async function CertificatePage({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n);
  const supabase = await createClient();
  const profile = await getProfile();
  const { data: level } = await supabase.from('levels').select('id, title').eq('number', n).single();
  if (!level || !profile) notFound();

  // Only levels completed by effort get a certificate.
  const { data: completion } = await supabase
    .from('level_completions')
    .select('completed_at, via')
    .eq('level_id', level.id)
    .eq('via', 'earned')
    .maybeSingle();
  if (!completion) notFound();

  const date = new Date(completion.completed_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="page">
      <div className="cert">
        <Shield level={n} state="earned" size={90} />
        <p className="muted" style={{ marginTop: '1rem' }}>خريطة الطريق</p>
        <h1 className="cert__title">شهادة إتمام</h1>
        <p>يُشهد بأن</p>
        <p className="cert__name">{profile.full_name}</p>
        <p>قد أتمّ دروس <strong>{level.title}</strong> وكتب مدونته، بتاريخ {date}.</p>
        <p className="muted" style={{ marginTop: '1.5rem' }}>نسأل الله أن ينفع به ويجعله في ميزان حسناته.</p>
      </div>
      <p className="center no-print" style={{ marginBottom: '2rem' }}>
        <PrintButton />
      </p>
    </main>
  );
}
