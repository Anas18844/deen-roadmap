'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { completeItem, saveNote, uncompleteItem } from '@/app/actions';
import { NOTE_MIN, noteLength } from '@/lib/notes';
import ProgressBar from '@/components/ProgressBar';
import AudioNote from '@/components/AudioNote';
import Shield from '@/components/Shield';
import { levelName } from '@/lib/levels';
import { youtubeId } from '@/lib/youtube';

export interface ViewItem {
  id: string;
  kind: 'video' | 'book';
  title: string;
  full_title: string | null;
  url: string;
  storage_path?: string | null;
  duration_seconds: number | null;
  pages: number | null;
  points: number;
}
export interface ViewSection {
  id: string;
  title: string;
  description: string | null;
  introAudioUrl: string | null;
  items: ViewItem[];
  children: { id: string; title: string; items: ViewItem[] }[];
}

const fmtDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h} س ${m} د` : `${m} د`;
};

export default function TrackView({
  level,
  sections,
  introAudioUrl,
  doneIds,
  notes,
  levelClosed,
  placed = false,
  exams = {},
}: {
  level: number;
  sections: ViewSection[];
  introAudioUrl: string | null;
  doneIds: string[];
  notes: Record<string, string>;
  levelClosed: boolean;
  placed?: boolean;
  exams?: Record<string, { id: string; title: string; best: string | null }>;
}) {
  const [done, setDone] = useState(() => new Set(doneIds));
  const [saved, setSaved] = useState(notes);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [player, setPlayer] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<number | null>(null);
  const [, start] = useTransition();

  useEffect(() => setDone(new Set(doneIds)), [doneIds]);

  function toggle(itemId: string) {
    const wasDone = done.has(itemId);
    if (wasDone && levelClosed) return;
    setBusy(itemId);
    setError('');
    setDone((prev) => {
      const next = new Set(prev);
      if (wasDone) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    start(async () => {
      const r = wasDone ? await uncompleteItem(itemId) : await completeItem(itemId);
      setBusy(null);
      if (!r.ok) {
        setError(r.error ?? '');
        setDone((prev) => {
          const next = new Set(prev);
          if (wasDone) next.add(itemId);
          else next.delete(itemId);
          return next;
        });
      } else if ('level_completed' in r && r.level_completed) {
        setCelebrate(r.level_number);
      } else if ('next_unlocked' in r && r.next_unlocked) {
        setUnlocked(r.level_number + 1);
      }
    });
  }

  return (
    <section className="section-block">
      <div className="container stack">
        {introAudioUrl && <AudioNote url={introAudioUrl} label="استمع قبل البداية" />}
        {error && <p className="alert">{error}</p>}

        {sections.map((s) => {
          const allItems = [...s.items, ...s.children.flatMap((c) => c.items)];
          const doneCount = placed ? allItems.length : allItems.filter((i) => done.has(i.id)).length;
          const finished = allItems.length > 0 && doneCount === allItems.length;
          let counter = 0;
          const examLink = (sectionId: string, items: ViewItem[]) => {
            const ex = exams[sectionId];
            if (!ex) return null;
            const ready = placed || items.every((i) => done.has(i.id));
            return (
              <div className="exam-link">
                {ready ? (
                  <Link className="btn btn--gold btn--sm" href={`/exams/${ex.id}`}>📝 {ex.title}</Link>
                ) : (
                  <span className="muted">📝 {ex.title} — يُفتح بعد إنهاء دروس السلسلة</span>
                )}
                {ex.best && <span className="badge">أفضل نتيجة: {ex.best}</span>}
              </div>
            );
          };
          const renderItems = (items: ViewItem[]) => (
            <div className="items">
              {items.map((i) => {
                counter += 1;
                const on = placed || done.has(i.id);
                const vid = i.kind === 'video' ? youtubeId(i.url) : null;
                const playing = player === i.id;
                return (
                  <div key={i.id} id={`item-${i.id}`} className={`item ${on ? 'item--done' : ''} ${playing ? 'item--playing' : ''}`}>
                    <span className="item__num">{counter}</span>
                    {vid ? (
                      <button className="item__title item__title--btn" onClick={() => setPlayer(playing ? null : i.id)} title={i.full_title ?? i.title} aria-expanded={playing}>
                        {playing ? '⏸ ' : '▶ '}{i.title}
                      </button>
                    ) : (
                      <a className="item__title" href={i.storage_path ? `/books/${i.id}` : i.url} target="_blank" rel="noopener noreferrer" title={i.full_title ?? i.title}>
                        {i.kind === 'book' ? '📘 ' : '🔗 '}{i.title}
                      </a>
                    )}
                    <span className="item__meta">
                      {i.kind === 'video' && i.duration_seconds ? fmtDuration(i.duration_seconds) : i.pages ? `${i.pages} صفحة` : ''}
                      {' · '}{i.points} نقطة
                    </span>
                    {placed ? (
                      <span className="done-btn done-btn--on" title="محسوب لك ضمن ما أنجزته مسبقًا">أُنجز مسبقًا ✓</span>
                    ) : (
                    <button
                      className={`done-btn ${on ? 'done-btn--on' : ''}`}
                      onClick={() => toggle(i.id)}
                      disabled={busy === i.id || (on && levelClosed)}
                      aria-pressed={on}
                    >
                      {on ? 'خلّصته ✓' : 'خلّصته؟'}
                    </button>
                    )}
                    {playing && vid && (
                      <div className="item__player">
                        <div className="item__frame">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0`}
                            title={i.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <a href={i.url} target="_blank" rel="noopener noreferrer" className="muted">مشاهدة على يوتيوب ↗</a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );

          const closed = placed || (finished && !!saved[s.id]);
          return (
            <details key={s.id} className="card section-card" id={`section-${s.id}`} open={!closed}>
              <summary className="section-card__head">
                <h2 className="card__title">{s.title}</h2>
                {closed && <span className="badge">{placed ? 'أُنجز مسبقًا ✓' : 'أنهيته وكتبت مدونته ✓'}</span>}
              </summary>
              {s.description && <p className="section-block__intro" style={{ marginBottom: '0.6rem' }}>{s.description}</p>}
              {s.introAudioUrl && <AudioNote url={s.introAudioUrl} label={`استمع قبل البداية في ${s.title}`} />}
              <div className="section-progress">
                <ProgressBar pct={allItems.length ? (100 * doneCount) / allItems.length : 0} />
                <span className="muted">{doneCount} / {allItems.length}</span>
              </div>
              {s.items.length > 0 && renderItems(s.items)}
              {s.children.map((c) => (
                <details key={c.id} className="subsection" open={c.items.some((i) => !done.has(i.id))}>
                  <summary className="subsection__title">
                    {c.title} <span className="muted">({c.items.filter((i) => done.has(i.id)).length}/{c.items.length})</span>
                  </summary>
                  {renderItems(c.items)}
                  {examLink(c.id, c.items)}
                </details>
              ))}
              {examLink(s.id, allItems)}
              {finished && !placed && (
                <NoteBox
                  sectionId={s.id}
                  title={s.title}
                  initial={saved[s.id]}
                  onSaved={(body, completedLevel) => {
                    setSaved((p) => ({ ...p, [s.id]: body }));
                    if (completedLevel) setCelebrate(completedLevel);
                  }}
                />
              )}
            </details>
          );
        })}

        <p className="center">
          <Link className="btn btn--ghost" href={`/levels/${level}/journal`}>مدونة المستوى كاملة</Link>
        </p>
      </div>

      {unlocked && (
        <div className="toast" role="status">
          🎉 أنجزت 70% من هذا المستوى، وفُتح لك {levelName(unlocked)}!
          <Link className="btn btn--sm" href={`/levels/${unlocked}`}>افتحه</Link>
          <button className="btn btn--ghost btn--sm" onClick={() => setUnlocked(null)}>لاحقًا</button>
        </div>
      )}

      {celebrate && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal celebrate">
            <Shield level={celebrate} state="earned" size={120} />
            <h2 className="celebrate__title">مبارك! أتممت {levelName(celebrate)}</h2>
            <p>حصلت على درع المستوى، وفُتح لك المستوى التالي. نسأل الله أن ينفعك بما تعلمت.</p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn btn--gold" href={`/certificates/${celebrate}`}>شهادتك</Link>
              <Link className="btn" href="/">إلى الرئيسية</Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function NoteBox({
  sectionId,
  title,
  initial,
  onSaved,
}: {
  sectionId: string;
  title: string;
  initial?: string;
  onSaved: (body: string, completedLevel: number | null) => void;
}) {
  const draftKey = `note-draft:${sectionId}`;
  const [editing, setEditing] = useState(!initial);
  const [body, setBody] = useState(initial ?? '');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const len = useMemo(() => noteLength(body), [body]);

  useEffect(() => {
    if (initial) return;
    try {
      const d = localStorage.getItem(draftKey);
      if (d) setBody(d);
    } catch {}
  }, [draftKey, initial]);

  function change(v: string) {
    setBody(v);
    try {
      localStorage.setItem(draftKey, v);
    } catch {}
  }

  function submit() {
    setError('');
    start(async () => {
      const r = await saveNote(sectionId, body);
      if (!r.ok) return setError(r.error);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      setEditing(false);
      onSaved(body.trim(), r.level_completed ? r.level_number : null);
    });
  }

  if (!editing) {
    return (
      <div className="note note--saved" id={`note-${sectionId}`}>
        <div className="note__title">ما استفدته من هذا القسم ✓</div>
        <p className="note__body">{body}</p>
        <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)} style={{ marginTop: '0.6rem' }}>تعديل</button>
      </div>
    );
  }

  return (
    <div className="note" id={`note-${sectionId}`}>
      <div className="note__title">أنهيت «{title}» — ماذا استفدت منه؟</div>
      <p className="muted" style={{ marginBottom: '0.5rem' }}>
        اكتب بتفصيل ما فهمته وما ستعمل به. {NOTE_MIN} حرف على الأقل، ولا يُغلق المستوى إلا بكتابة مدونة كل قسم.
      </p>
      <textarea value={body} onChange={(e) => change(e.target.value)} placeholder="استفدت من هذا القسم…" />
      <div className="note__bar">
        <span className={`note__count ${len >= NOTE_MIN ? 'note__count--ok' : ''}`}>{len} / {NOTE_MIN} حرف</span>
        <button className="btn btn--gold" onClick={submit} disabled={pending || len < NOTE_MIN}>
          {pending ? 'جارٍ الحفظ…' : 'حفظ المدونة'}
        </button>
      </div>
      {error && <p className="alert" style={{ marginTop: '0.6rem' }}>{error}</p>}
    </div>
  );
}
