'use client';

import { useMemo, useState } from 'react';
import { TEMPLATES, fillTemplate, waMessageLink, type MessageVars } from '@/lib/messages';

/** Personal WhatsApp message: pick a template, edit freely, open the chat with the text ready. */
export default function WhatsAppComposer({ phone, vars, defaultKey = 'free' }: { phone: string; vars: MessageVars; defaultKey?: string }) {
  const initial = TEMPLATES.find((t) => t.key === defaultKey) ?? TEMPLATES[TEMPLATES.length - 1];
  const [key, setKey] = useState(initial.key as string);
  const [text, setText] = useState(fillTemplate(initial.text, vars));
  const link = useMemo(() => waMessageLink(phone, text), [phone, text]);

  return (
    <div className="wa-composer">
      <div className="wa-composer__templates" role="group" aria-label="قوالب الرسائل">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`chip ${key === t.key ? 'chip--on' : ''}`}
            onClick={() => {
              setKey(t.key);
              setText(fillTemplate(t.text, vars));
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      <a className="btn btn--sm wa-btn" href={link} target="_blank" rel="noopener noreferrer">فتح المحادثة على واتساب</a>
    </div>
  );
}
