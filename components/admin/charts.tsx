// Lightweight server-rendered SVG charts for the admin dashboard (no chart library).

export function Delta({ now, prev, suffix = '' }: { now: number; prev: number; suffix?: string }) {
  const d = now - prev;
  if (prev === 0 && now === 0) return <span className="delta delta--flat">لا تغيير</span>;
  const cls = d > 0 ? 'delta--up' : d < 0 ? 'delta--down' : 'delta--flat';
  const sign = d > 0 ? '▲' : d < 0 ? '▼' : '■';
  return (
    <span className={`delta ${cls}`} title="مقارنة بالأسبوع السابق">
      {sign} {Math.abs(d)}{suffix} عن الأسبوع السابق
    </span>
  );
}

/** Two-series daily chart: active students (area) and completed lessons (line). */
export function ActivityChart({ data }: { data: { day: string; active: number; items: number }[] }) {
  const W = 720;
  const H = 220;
  const P = { t: 16, r: 12, b: 28, l: 36 };
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;
  const maxA = Math.max(4, ...data.map((d) => d.active));
  const maxI = Math.max(4, ...data.map((d) => d.items));
  const x = (i: number) => P.l + (data.length <= 1 ? iw / 2 : (i * iw) / (data.length - 1));
  const ya = (v: number) => P.t + ih - (v / maxA) * ih;
  const yi = (v: number) => P.t + ih - (v / maxI) * ih;
  const area = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${ya(d.active)}`).join(' ') + ` L${x(data.length - 1)},${P.t + ih} L${x(0)},${P.t + ih} Z`;
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${yi(d.items)}`).join(' ');
  const ticks = data.map((d, i) => ({ i, d })).filter(({ i }) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1);

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="منحنى النشاط اليومي">
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={P.l} x2={W - P.r} y1={P.t + ih * (1 - f)} y2={P.t + ih * (1 - f)} className="chart__grid" />
            <text x={P.l - 6} y={P.t + ih * (1 - f) + 4} className="chart__axis" textAnchor="end">{Math.round(maxA * f)}</text>
          </g>
        ))}
        <path d={area} className="chart__area" />
        <path d={line} className="chart__line" />
        {ticks.map(({ i, d }) => (
          <text key={i} x={x(i)} y={H - 8} className="chart__axis" textAnchor="middle">
            {new Date(d.day).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' })}
          </text>
        ))}
        {data.map((d, i) => (
          <rect key={i} x={x(i) - iw / data.length / 2} y={P.t} width={iw / data.length} height={ih} className="chart__hit">
            <title>{`${new Date(d.day).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}\n${d.active} طالب نشط · ${d.items} درس`}</title>
          </rect>
        ))}
      </svg>
      <figcaption className="chart__legend">
        <span><i className="swatch swatch--area" /> طلبة نشطون</span>
        <span><i className="swatch swatch--line" /> دروس أُنجزت</span>
      </figcaption>
    </figure>
  );
}

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const BANDS = ['12–3 ص', '3–6 ص', '6–9 ص', '9–12 ظ', '12–3 م', '3–6 م', '6–9 م', '9–12 م'];

/** Weekday × 3-hour band heat grid of completed lessons (last 90 days). */
export function Heatmap({ cells }: { cells: { dow: number; hour: number; n: number }[] }) {
  const grid = Array.from({ length: 7 }, () => Array(8).fill(0) as number[]);
  for (const c of cells) grid[c.dow][Math.floor(c.hour / 3)] += c.n;
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="heat" role="table" aria-label="أوقات المذاكرة">
      <div className="heat__row heat__row--head" role="row">
        <span />
        {BANDS.map((b) => <span key={b} className="heat__band">{b}</span>)}
      </div>
      {grid.map((row, d) => (
        <div key={d} className="heat__row" role="row">
          <span className="heat__day">{DAYS[d]}</span>
          {row.map((n, h) => (
            <span key={h} className="heat__cell" style={{ ['--v' as string]: n / max }} title={`${DAYS[d]} ${BANDS[h]}: ${n} درس`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function HBars({ rows, max }: { rows: { label: string; n: number }[]; max?: number }) {
  const m = max ?? Math.max(1, ...rows.map((r) => r.n));
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="hbars__label">{r.label}</span>
          <span className="hbars__track"><span className="hbars__fill" style={{ width: `${(100 * r.n) / m}%` }} /></span>
          <span className="hbars__n">{r.n}</span>
        </li>
      ))}
    </ul>
  );
}

export interface RoadStation { number: number; title: string; here: number; reached: number; earned: number; avg_pct: number }

/** The roadmap itself: levels as stations on one path, with how many students stand at each and how many crossed. */
export function Road({ stations, total }: { stations: RoadStation[]; total: number }) {
  return (
    <ol className="road">
      {stations.map((s, i) => {
        const next = stations[i + 1];
        const crossed = s.reached ? Math.round((100 * (next?.reached ?? s.earned)) / s.reached) : 0;
        return (
          <li key={s.number} className="road__stop">
            <div className="road__marker" style={{ ['--fill' as string]: total ? s.here / total : 0 }}>
              <span className="road__num">{s.number}</span>
            </div>
            <div className="road__body">
              <strong className="road__title">{s.title}</strong>
              <span className="road__here"><b>{s.here}</b> طالب الآن</span>
              <span className="road__meta">متوسط الإنجاز {s.avg_pct}%</span>
              <span className="road__meta">{next ? `عبر للمستوى التالي ${crossed}%` : `أتمّه ${s.earned}`}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
