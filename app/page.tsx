import Link from 'next/link';
import { getDashboard, getProfile, levelName } from '@/lib/data';
import ProgressBar from '@/components/ProgressBar';
import Shield from '@/components/Shield';
import PlacementRetry from '@/components/PlacementRetry';
import Intro from '@/components/Intro';
import { createClient } from '@/lib/supabase/server';

const NUMS = ['', '١', '٢', '٣', '٤', '٥', '٦'];

export default async function Home({ searchParams }: { searchParams: Promise<{ invite?: string }> }) {
  const { invite } = await searchParams;
  const supabase = await createClient();
  const [profile, { data: voices }] = await Promise.all([
    getProfile(),
    supabase.from('site_audio').select('key, title, url').order('sort'),
  ]);
  const signedIn = !!profile?.onboarded_at;

  // ── Visitors (and admins who never filled the student form): intro + the levels ahead ──
  if (!signedIn) {
    const { data: levels } = await supabase.rpc('public_levels');
    return (
      <main className="landing">
        <Intro voices={voices ?? []} signedIn={false} />
        <section id="levels" className="levels-section">
          <div className="container">
            <h2 className="section-title">تمهيد خريطة الدين كاملة</h2>
            <p className="levels-section__desc">رحلة متدرجة عبر {(levels ?? []).length} مستويات لفهم الدين والسير فيه</p>
            <div className="levels-grid">
              {(levels ?? []).map((l: { number: number; title: string }) => (
                <div key={l.number} className="level-card">
                  <span className="level-card__number">{NUMS[l.number] ?? l.number}</span>
                  <span className="level-card__name">{l.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="start-cta">
          <div className="container center">
            {profile ? (
              <Link className="btn" href="/admin">لوحة المتابعة</Link>
            ) : (
              <>
                <h2 className="section-title">جاهز تبدأ؟</h2>
                <p className="muted" style={{ marginBottom: '1.2rem' }}>سجّل حسابك، وابدأ من المستوى الأول خطوة بخطوة.</p>
                <Link className="hero__cta start-cta__btn" href="/signup">ابدأ رحلتك <span className="hero__cta-arrow">←</span></Link>
                <p style={{ marginTop: '1rem' }}><Link href="/login">عندي حساب بالفعل</Link></p>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  // ── Students: intro, then their level map, then what's next ──
  const d = await getDashboard();
  const current = d.levels.find((l) => l.number === d.current_level);
  const firstName = (profile?.full_name ?? '').split(' ')[0];

  return (
    <main className="landing">
      <Intro voices={voices ?? []} signedIn />

      <section className="section-block" id="levels">
        <div className="container stack">
          <h2 className="section-title">خريطة المستويات</h2>
          <div className="level-map">
            {d.levels.map((l) => {
              const state = l.status === 'locked' ? 'locked' : l.via === 'earned' ? 'earned' : l.via === 'placement' ? 'placement' : 'open';
              const body = (
                <>
                  <Shield level={l.number} state={state} />
                  <span className="level-tile__name">{l.title}</span>
                  {l.status === 'locked' ? (
                    <span className="muted">يُفتح بعد إنجاز 70% من المستوى السابق</span>
                  ) : l.via === 'placement' ? (
                    <>
                      <ProgressBar pct={100} label={l.title} />
                      <span className="muted">أنجزته مسبقًا ✓</span>
                    </>
                  ) : (
                    <>
                      <ProgressBar pct={l.pct ?? 0} label={l.title} />
                      <span className="muted">{l.done} من {l.total} · {l.pct ?? 0}%</span>
                    </>
                  )}
                </>
              );
              return l.status === 'locked' ? (
                <div key={l.number} className="level-tile level-tile--locked">{body}</div>
              ) : (
                <Link key={l.number} href={`/levels/${l.number}`} className="level-tile">{body}</Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-block section-block--alt" id="next">
        <div className="container stack">
          <header>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>السلام عليكم{firstName ? `، ${firstName}` : ''}</h2>
            <p className="muted">أنت الآن في {levelName(d.current_level)}{current?.pct != null && current.via !== 'placement' ? ` — أنجزت ${current.pct}%` : ''}</p>
          </header>

          {invite === 'sent' && <p className="alert alert--ok">تم إرسال طلب الانضمام للأستاذ محمد، وسيصلك القبول هنا.</p>}
          {invite === 'invalid' && <p className="alert">رابط الدعوة غير صالح أو انتهى. تواصل مع الأستاذ محمد.</p>}
          {(d.private_requests ?? []).map((r) => (
            <p key={r.level} className={r.status === 'rejected' ? 'alert' : 'alert alert--info'}>
              {r.status === 'pending' ? `طلب انضمامك إلى ${r.level} قيد المراجعة عند الأستاذ محمد.` : `لم تتم الموافقة على انضمامك إلى ${r.level}.`}
            </p>
          ))}
          {d.placement?.status === 'pending' && (
            <p className="alert alert--info">
              طلبك للانتقال إلى {levelName(d.placement.requested_level)} قيد المراجعة عند الأستاذ محمد. ابدأ من المستوى الأول حتى تتم الموافقة.
            </p>
          )}
          {d.placement?.status === 'rejected' && (
            <div className="alert">
              لم تتم الموافقة على طلب الانتقال إلى {levelName(d.placement.requested_level)}. يمكنك المتابعة من مستواك الحالي أو إرسال طلب جديد.
              <PlacementRetry levels={d.levels.filter((l) => l.number >= 2).map((l) => ({ number: l.number, title: l.title }))} />
            </div>
          )}

          {d.ready_level && (
            <section className="continue continue--note">
              <div>
                <div className="continue__kicker">أنهيت {d.ready_level.title} بالكامل</div>
                <div className="continue__title">راجع مدونتك وسلّم المستوى</div>
              </div>
              <Link className="btn" href={`/levels/${d.ready_level.number}/journal`}>راجع وسلّم ←</Link>
            </section>
          )}

          {d.next && (
            <section className="continue">
              <div>
                <div className="continue__kicker">عليك الدور · {d.next.section_title}</div>
                <div className="continue__title">{d.next.title}</div>
              </div>
              <Link className="btn" href={`/levels/${d.next.level}/${d.next.track_id}#item-${d.next.item_id}`}>تابع ←</Link>
            </section>
          )}

          {d.pending_note && (
            <section className="continue continue--note">
              <div>
                <div className="continue__kicker">أنهيت دروس هذا القسم</div>
                <div className="continue__title">اكتب ما استفدته من: {d.pending_note.title}</div>
              </div>
              <Link className="btn" href={`/levels/${d.pending_note.level}/${d.pending_note.track_id}#note-${d.pending_note.section_id}`}>اكتب الآن ←</Link>
            </section>
          )}

          {!d.next && !d.pending_note && !d.ready_level && (
            <p className="alert alert--ok">أتممت كل ما هو متاح لك الآن — بارك الله فيك. انتظر المستوى التالي.</p>
          )}

          <section className="stats">
            <div className="stat"><span className="stat__value">{d.current_level}</span><span className="stat__label">المستوى الحالي</span></div>
            <div className="stat"><span className="stat__value">{d.total_points}</span><span className="stat__label">نقاطك</span></div>
            <div className="stat"><span className="stat__value">{d.streak} 🔥</span><span className="stat__label">أيام متتالية</span></div>
            <div className="stat"><span className="stat__value">{d.levels.filter((l) => l.via === 'earned').length}</span><span className="stat__label">دروع حصلت عليها</span></div>
          </section>
        </div>
      </section>
    </main>
  );
}
