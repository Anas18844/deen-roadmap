import { LEVEL_WORDS } from '@/lib/levels';

// Level badge: a shield with the level number. `lit` adds the glow/flame behind it.
export default function Shield({ level, state, size = 72 }: { level: number; state: 'earned' | 'placement' | 'open' | 'locked'; size?: number }) {
  return (
    <span className={`shield shield--${state}`} style={{ width: size, height: size * 1.15 }} title={`المستوى ${LEVEL_WORDS[level] ?? level}`}>
      {state === 'earned' && <span className="shield__flame" aria-hidden="true" />}
      <svg viewBox="0 0 64 74" aria-hidden="true">
        <path className="shield__body" d="M32 2 60 12v22c0 18-12 31-28 38C16 65 4 52 4 34V12Z" />
        <path className="shield__rim" d="M32 8 54 16v18c0 14-9 25-22 31C19 59 10 48 10 34V16Z" />
      </svg>
      <span className="shield__num">{state === 'locked' ? '🔒' : level}</span>
    </span>
  );
}
