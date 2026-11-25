const isHosted = (url: string) => url.includes('/storage/v1/object/public/audio/');

/** Voice note: plays inline when the file is hosted on the site, otherwise opens the link. */
export default function AudioNote({ url, label, badge = 'تنبيهات قبل البداية' }: { url: string; label: string; badge?: string }) {
  if (isHosted(url)) {
    return (
      <div className="voice-note voice-note--player">
        <div className="voice-note__icon" aria-hidden="true">🎙</div>
        <div className="voice-note__info">
          <span className="voice-note__badge">{badge}</span>
          <span className="voice-note__label">{label}</span>
          <audio controls preload="none" src={url} className="voice-note__audio">
            <a href={url}>تشغيل الصوتية</a>
          </audio>
        </div>
      </div>
    );
  }
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
