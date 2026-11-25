'use client';

import { useState } from 'react';

export default function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      onClick={() => {
        navigator.clipboard.writeText(`${window.location.origin}${path}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? 'تم النسخ ✓' : 'نسخ الرابط'}
    </button>
  );
}
