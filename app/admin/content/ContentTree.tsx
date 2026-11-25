'use client';

import { useState, useTransition } from 'react';
import ActionButton from '@/components/ActionButton';
import BookUpload from '@/components/admin/BookUpload';
import AudioUpload from '@/components/admin/AudioUpload';
import Sortable from '@/components/admin/Sortable';
import Processing, { STEPS, withMinDuration } from '@/components/admin/Processing';
import {
  saveSiteAudio,
  reorder,
  deleteRow, importPlaylist, moveRow, refreshDurations, saveItem, saveLevel, saveSection, saveTrack, togglePublished,
} from '../actions';

export interface CItem { id: string; kind: 'video' | 'book'; title: string; url: string; storage_path: string | null; file_size: number | null; duration_seconds: number | null; pages: number | null; points: number; points_is_manual: boolean; sort: number; is_published: boolean }
export interface CSection { id: string; parent_id: string | null; title: string; description: string | null; intro_audio_url: string | null; sort: number; is_published: boolean; items: CItem[] }
export interface CTrack { id: string; title: string; description: string | null; accent: string; intro_audio_url: string | null; sort: number; is_published: boolean; sections: CSection[] }
export interface CLevel { id: string; number: number; title: string; subtitle: string | null; intro_audio_url: string | null; is_published: boolean; tracks: CTrack[] }

type Result = { ok: true; message?: string } | { ok: false; error: string };
const bySort = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;

/** Small form that posts to a server action and shows its result. */
function MiniForm({ action, children, submit = 'حفظ', steps = STEPS.save }: { action: (f: FormData) => Promise<Result>; children: React.ReactNode; submit?: string; steps?: string[] }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const formEl = e.currentTarget;
        start(async () => {
          const r = await withMinDuration(action(fd), steps.length > 1 ? 1500 : 500);
          setMsg(r.ok ? { ok: true, text: r.message ?? 'تم' } : { ok: false, text: r.error });
          if (r.ok && !fd.get('id')) formEl.reset();
        });
      }}
    >
      {children}
      <button className="btn btn--sm" disabled={pending}>{pending ? '…' : submit}</button>
      {pending && <Processing steps={steps} />}
      {!pending && msg && <span className={msg.ok ? 'badge' : 'badge badge--red'}>{msg.text}</span>}
    </form>
  );
}

function RowTools({ table, id, published, canMove = true, canDelete = true }: { table: string; id: string; published: boolean; canMove?: boolean; canDelete?: boolean }) {
  return (
    <span className="row-actions" onClick={(e) => e.stopPropagation()}>
      {canMove && <ActionButton action={moveRow.bind(null, table, id, -1)} className="btn btn--ghost btn--sm">↑</ActionButton>}
      {canMove && <ActionButton action={moveRow.bind(null, table, id, 1)} className="btn btn--ghost btn--sm">↓</ActionButton>}
      <ActionButton action={togglePublished.bind(null, table, id, !published)} className="btn btn--ghost btn--sm">
        {published ? 'إخفاء' : 'نشر'}
      </ActionButton>
      {canDelete && <ActionButton action={deleteRow.bind(null, table, id)} className="btn btn--danger btn--sm" confirm="حذف نهائي؟">حذف</ActionButton>}
    </span>
  );
}

function ItemsEditor({ section }: { section: CSection }) {
  return (
    <>
      <Sortable
        items={[...section.items].sort(bySort)}
        onSave={(ids) => reorder('items', ids)}
        render={(i, handle) => (
        <div className={`item ${i.is_published ? '' : 'hidden-item'}`}>
          {handle}
          <a className="item__title" href={i.storage_path ? `/books/${i.id}` : i.url} target="_blank" rel="noopener noreferrer">{i.kind === 'book' ? '📘' : '▶'} {i.title}</a>
          {i.kind === 'book' && (i.storage_path
            ? <span className="badge">PDF مرفوع{i.file_size ? ` · ${(i.file_size / 1048576).toFixed(1)} م` : ''}</span>
            : <span className="badge badge--blue">لينك Drive</span>)}
          <span className="item__meta">
            {i.kind === 'video' ? (i.duration_seconds ? `${Math.round(i.duration_seconds / 60)} د` : 'بدون مدة') : i.pages ? `${i.pages} ص` : 'بدون صفحات'}
            {' · '}{i.points} نقطة{i.points_is_manual ? ' (يدوي)' : ''}
          </span>
          <details>
            <summary className="btn btn--ghost btn--sm">تعديل</summary>
            <MiniForm action={saveItem} steps={STEPS.video}>
              <input type="hidden" name="id" value={i.id} />
              <input name="title" defaultValue={i.title} placeholder="العنوان" style={{ minWidth: 220 }} />
              <input name="url" defaultValue={i.url} placeholder="اللينك" dir="ltr" style={{ minWidth: 240 }} />
              {i.kind === 'book' && <input name="pages" type="number" defaultValue={i.pages ?? ''} placeholder="عدد الصفحات" style={{ width: 120 }} />}
              <input name="points" type="number" defaultValue={i.points_is_manual ? i.points : ''} placeholder="نقاط يدوية (اختياري)" style={{ width: 160 }} />
            </MiniForm>
            {i.kind === 'book' && <BookUpload itemId={i.id} />}
          </details>
          <RowTools table="items" id={i.id} published={i.is_published} canMove={false} />
        </div>
        )}
      />
      <MiniForm action={saveItem} submit="إضافة درس" steps={STEPS.video}>
        <input type="hidden" name="section_id" value={section.id} />
        <input name="url" required placeholder="لينك فيديو يوتيوب" dir="ltr" style={{ minWidth: 260 }} />
        <input name="title" placeholder="العنوان (للفيديو يُجلب تلقائيًا)" style={{ minWidth: 220 }} />
        <input name="pages" type="number" placeholder="صفحات الكتاب" style={{ width: 120 }} />
      </MiniForm>
      <BookUpload sectionId={section.id} />
    </>
  );
}

function SectionNode({ s, all }: { s: CSection; all: CSection[] }) {
  const children = all.filter((c) => c.parent_id === s.id).sort(bySort);
  const count = s.items.length + children.reduce((n, c) => n + c.items.length, 0);
  return (
    <details className={s.is_published ? '' : 'hidden-item'}>
      <summary>
        {s.parent_id ? '↳ ' : ''}{s.title} <span className="muted">({count} درس){s.items.length > 0 && ' · لها مدونة'}</span>
        <RowTools table="sections" id={s.id} published={s.is_published} canDelete={count === 0} />
      </summary>
      <MiniForm action={saveSection}>
        <input type="hidden" name="id" value={s.id} />
        <input name="title" defaultValue={s.title} style={{ minWidth: 220 }} />
        <input name="description" defaultValue={s.description ?? ''} placeholder="وصف" style={{ minWidth: 260 }} />
        <input name="intro_audio_url" defaultValue={s.intro_audio_url ?? ''} placeholder="لينك التنبيه الصوتي" dir="ltr" />
      </MiniForm>
      <AudioUpload table="sections" id={s.id} />
      <div className="items"><ItemsEditor section={s} /></div>
      {children.map((c) => <SectionNode key={c.id} s={c} all={all} />)}
      {!s.parent_id && (
        <MiniForm action={saveSection} submit="إضافة قسم فرعي">
          <input type="hidden" name="track_id" value={(all.find((x) => x.id === s.id) as CSection & { track_id?: string })?.track_id ?? ''} />
          <input type="hidden" name="parent_id" value={s.id} />
          <input name="title" required placeholder="عنوان القسم الفرعي" />
        </MiniForm>
      )}
    </details>
  );
}

export default function ContentTree({ levels, missingDurations, storage, voices }: { levels: CLevel[]; missingDurations: number; storage: { bytes: number; files: number; limit_bytes: number } | null; voices: { key: string; title: string; url: string | null }[] }) {
  return (
    <div className="stack">
      <header className="adm__head"><div><h1 className="adm__title">المحتوى والكتب</h1><p className="adm__sub">أضف الدروس والكتب، أو عدّلها، أو أخفها عن الطلبة.</p></div></header>
      
      <div className="alert alert--info">
        لإضافة فيديو: الصق لينك يوتيوب واضغط «إضافة درس» — العنوان والمدة والنقاط تُحسب تلقائيًا. للكتاب: لينك Drive + العنوان + عدد الصفحات.
        كل سلسلة فيها دروس لها خانة مدونة (300 حرف) يكتبها الطالب بعد إنهاء دروسها.
        «إخفاء» يخفي العنصر عن الطلبة مع الحفاظ على تقدّمهم؛ الحذف متاح فقط للمستوى أو المسار أو القسم الفارغ.
      </div>
      <div className="panel">
        <strong>صوتيات الصفحة الرئيسية</strong>
        <p className="muted">تظهر لكل الطلبة أعلى الصفحة الرئيسية.</p>
        {voices.map((v) => (
          <MiniForm key={v.key} action={saveSiteAudio}>
            <input type="hidden" name="key" value={v.key} />
            <input name="title" defaultValue={v.title} style={{ minWidth: 200 }} />
            <input name="url" defaultValue={v.url ?? ''} placeholder="لينك الصوتية" dir="ltr" style={{ minWidth: 280 }} />
            <AudioUpload table="site_audio" id={v.key} />
          </MiniForm>
        ))}
      </div>
      {storage && (
        <div className="panel">
          <strong>مساحة الكتب المرفوعة:</strong> {(storage.bytes / 1048576).toFixed(0)} ميجا من {(storage.limit_bytes / 1048576).toFixed(0)} ميجا ({storage.files} ملف)
          <div className="meter"><span style={{ width: `${Math.min(100, (100 * storage.bytes) / storage.limit_bytes)}%` }} /></div>
          <span className="muted">الكتب الكبيرة جدًا يمكن تركها كلينك Drive. الكتاب المرفوع لا يفتحه إلا طالب وصل لمستواه.</span>
        </div>
      )}
      {missingDurations > 0 && (
        <div className="toolbar">
          <span>{missingDurations} فيديو بدون مدة (النقاط فيها = 1 مؤقتًا)</span>
          <ActionButton action={refreshDurations} className="btn btn--gold btn--sm">جلب المدة من يوتيوب</ActionButton>
        </div>
      )}
      <div className="tree">
        {levels.map((l) => (
          <details key={l.id} className={l.is_published ? '' : 'hidden-item'}>
            <summary>
              {l.title} <span className="muted">({l.tracks.length} مسار)</span>
              <RowTools table="levels" id={l.id} published={l.is_published} canMove={false} canDelete={l.tracks.length === 0} />
            </summary>
            <MiniForm action={saveLevel}>
              <input type="hidden" name="id" value={l.id} />
              <input name="number" type="number" defaultValue={l.number} style={{ width: 70 }} />
              <input name="title" defaultValue={l.title} />
              <input name="subtitle" defaultValue={l.subtitle ?? ''} placeholder="وصف المستوى" style={{ minWidth: 300 }} />
              <input name="intro_audio_url" defaultValue={l.intro_audio_url ?? ''} placeholder="لينك صوتية المستوى" dir="ltr" />
            </MiniForm>
            <AudioUpload table="levels" id={l.id} />
            {[...l.tracks].sort(bySort).map((t) => {
              const sections = t.sections.map((s) => ({ ...s, track_id: t.id }));
              return (
                <details key={t.id} className={t.is_published ? '' : 'hidden-item'}>
                  <summary>
                    {t.title} <span className="muted">({t.sections.filter((s) => !s.parent_id).length} قسم)</span>
                    <RowTools table="tracks" id={t.id} published={t.is_published} canDelete={t.sections.length === 0} />
                  </summary>
                  <MiniForm action={saveTrack}>
                    <input type="hidden" name="id" value={t.id} />
                    <input name="title" defaultValue={t.title} />
                    <input name="description" defaultValue={t.description ?? ''} placeholder="وصف" style={{ minWidth: 300 }} />
                    <select name="accent" defaultValue={t.accent}>
                      <option value="green">أخضر</option><option value="gold">ذهبي</option><option value="blue">أزرق</option>
                    </select>
                    <input name="intro_audio_url" defaultValue={t.intro_audio_url ?? ''} placeholder="لينك التنبيه الصوتي" dir="ltr" />
                  </MiniForm>
                  <AudioUpload table="tracks" id={t.id} />
                  <Sortable
                    items={sections.filter((s) => !s.parent_id).sort(bySort)}
                    onSave={(ids) => reorder('sections', ids)}
                    render={(s, handle) => <div className="sortable__section">{handle}<SectionNode s={s} all={sections} /></div>}
                  />
                  <MiniForm action={saveSection} submit="إضافة قسم">
                    <input type="hidden" name="track_id" value={t.id} />
                    <input name="title" required placeholder="عنوان القسم الجديد" />
                  </MiniForm>
                  <MiniForm action={importPlaylist} submit="استيراد قائمة تشغيل" steps={STEPS.playlist}>
                    <input type="hidden" name="track_id" value={t.id} />
                    <input name="url" required placeholder="لينك playlist من يوتيوب" dir="ltr" style={{ minWidth: 260 }} />
                    <input name="title" placeholder="اسم القسم (اختياري)" />
                  </MiniForm>
                </details>
              );
            })}
            <MiniForm action={saveTrack} submit="إضافة مسار">
              <input type="hidden" name="level_id" value={l.id} />
              <input name="title" required placeholder="عنوان المسار" />
            </MiniForm>
          </details>
        ))}
      </div>
      <MiniForm action={saveLevel} submit="إضافة مستوى">
        <input name="number" type="number" required placeholder="رقم" style={{ width: 70 }} />
        <input name="title" required placeholder="مثال: المستوى الخامس" />
      </MiniForm>
    </div>
  );
}
