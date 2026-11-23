export default function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className="pbar" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="pbar__fill" style={{ width: `${v}%` }} />
    </div>
  );
}
