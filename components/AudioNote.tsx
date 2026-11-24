export default function AudioNote({ url, label, badge = 'تنبيهات قبل البداية' }: { url: string; label: string; badge?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="voice-note">
      <div className="voice-note__icon" aria-hidden="true">🎙</div>
      <div className="voice-note__info">
        <span className="voice-note__badge">{badge}</span>
        <span className="voice-note__label">{label}</span>
      </div>
    </a>
  );
}
