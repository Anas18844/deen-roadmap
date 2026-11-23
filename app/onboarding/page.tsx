import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/data';
import OnboardingForm from './OnboardingForm';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const profile = await getProfile();
  const { data: levels } = await supabase.from('levels').select('number, title').eq('is_published', true).order('number');

  return (
    <div className="uform-overlay" style={{ position: 'static', minHeight: '100vh', paddingTop: '90px' }}>
      <div className="uform-card">
        <div className="uform-header">
          <h2 className="uform-title">أهلاً وسهلاً</h2>
          <p className="uform-subtitle">أكمل بياناتك لتبدأ رحلتك في طلب العلم</p>
        </div>
        <OnboardingForm
          defaultName={profile?.full_name ?? ''}
          email={profile?.email ?? ''}
          levels={(levels ?? []).filter((l) => l.number >= 2)}
        />
      </div>
    </div>
  );
}
