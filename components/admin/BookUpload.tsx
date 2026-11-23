'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createBookUpload, saveUploadedBook } from '@/app/admin/actions';

const MAX = 50 * 1024 * 1024;

/** Upload a PDF straight to Storage, then save it as a new lesson (sectionId) or as the file of an existing one (itemId). */
export default function BookUpload({ sectionId, itemId }: { sectionId?: string; itemId?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState('');
  const [state, setState] = useState<{ busy: boolean; msg?: string; ok?: boolean }>({ busy: false });

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return setState({ busy: false, ok: false, msg: 'اختر ملف PDF أولًا.' });
    if (file.type !== 'application/pdf') return setState({ busy: false, ok: false, msg: 'الملف لازم يكون PDF.' });
    if (file.size > MAX) return setState({ busy: false, ok: false, msg: 'الحد الأقصى للملف 50 ميجا — اضغطه أو اتركه على Drive.' });
    if (!itemId && !title.trim()) return setState({ busy: false, ok: false, msg: 'اكتب عنوان الكتاب.' });

    setState({ busy: true, msg: `جارٍ رفع ${(file.size / 1048576).toFixed(1)} ميجا…` });
    const ticket = await createBookUpload(file.name);
    if (!ticket.ok) return setState({ busy: false, ok: false, msg: ticket.error });
    const { error } = await createClient().storage.from('books').uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: 'application/pdf' });
    if (error) return setState({ busy: false, ok: false, msg: 'تعذّر رفع الملف، حاول مرة أخرى.' });

    const fd = new FormData();
    if (itemId) fd.set('id', itemId);
    if (sectionId) fd.set('section_id', sectionId);
    fd.set('storage_path', ticket.path);
    fd.set('file_size', String(file.size));
    if (title.trim()) fd.set('title', title.trim());
    if (pages) fd.set('pages', pages);
    const r = await saveUploadedBook(fd);
    setState({ busy: false, ok: r.ok, msg: r.ok ? r.message ?? 'تم' : r.error });
    if (r.ok) {
      setTitle('');
      setPages('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <form className="inline-form" onSubmit={upload}>
      <input ref={fileRef} type="file" accept="application/pdf" aria-label="ملف الكتاب PDF" />
      {!itemId && <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الكتاب" style={{ minWidth: 200 }} />}
      <input value={pages} onChange={(e) => setPages(e.target.value)} type="number" placeholder="عدد الصفحات" style={{ width: 120 }} />
      <button className="btn btn--gold btn--sm" disabled={state.busy}>{state.busy ? '…' : itemId ? 'استبدال الملف' : 'رفع كتاب PDF'}</button>
      {state.msg && <span className={state.ok === false ? 'badge badge--red' : 'badge'}>{state.msg}</span>}
    </form>
  );
}
