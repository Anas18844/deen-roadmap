'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createAudioUpload, setAudio } from '@/app/admin/actions';
import Processing, { STEPS, withMinDuration } from './Processing';

/** Upload a voice note file and attach it to a level / track / section / home-page slot. */
export default function AudioUpload({ table, id }: { table: 'levels' | 'tracks' | 'sections' | 'site_audio'; id: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{ busy: boolean; ok?: boolean; msg?: string }>({ busy: false });

  async function onPick() {
    const file = ref.current?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) return setState({ busy: false, ok: false, msg: 'اختر ملفًا صوتيًا (mp3 أو m4a…)' });
    if (file.size > 50 * 1024 * 1024) return setState({ busy: false, ok: false, msg: 'الحد الأقصى 50 ميجا' });
    setState({ busy: true, msg: 'جارٍ الرفع…' });
    const started = Date.now();
    const t = await createAudioUpload(file.name);
    if (!t.ok) return setState({ busy: false, ok: false, msg: t.error });
    const { error } = await createClient().storage.from('audio').uploadToSignedUrl(t.path, t.token, file, { contentType: file.type });
    if (error) return setState({ busy: false, ok: false, msg: 'تعذّر الرفع، حاول مرة أخرى' });
    const r = await withMinDuration(setAudio(table, id, t.path), Math.max(0, 1800 - (Date.now() - started)));
    setState({ busy: false, ok: r.ok, msg: r.ok ? 'تم رفع الصوتية ✓' : r.error });
    if (ref.current) ref.current.value = '';
  }

  return (
    <span className="row-actions">
      <label className="btn btn--ghost btn--sm" style={{ cursor: 'pointer' }}>
        {state.busy ? '…' : '🎙 رفع صوتية'}
        <input ref={ref} type="file" accept="audio/*" hidden onChange={onPick} disabled={state.busy} />
      </label>
      {state.busy && <Processing steps={STEPS.audio} />}
      {!state.busy && state.msg && <span className={state.ok === false ? 'badge badge--red' : 'badge'}>{state.msg}</span>}
    </span>
  );
}
