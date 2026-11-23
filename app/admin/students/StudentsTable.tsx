'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { StudentStat } from '@/lib/admin';

const INACTIVE_DAYS = 14;

export default function StudentsTable({
  students,
  levels,
  initialInactive,
}: {
  students: StudentStat[];
  levels: { number: number; title: string }[];
  initialInactive: boolean;
}) {
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');
  const [gov, setGov] = useState('');
  const [entry, setEntry] = useState('');
  const [inactive, setInactive] = useState(initialInactive);
  const [sort, setSort] = useState<'points' | 'level' | 'inactive' | 'name'>('level');

  const govs = useMemo(() => [...new Set(students.map((s) => s.governorate).filter(Boolean))].sort() as string[], [students]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = students.filter(
      (s) =>
        (!needle || `${s.full_name} ${s.email}`.toLowerCase().includes(needle)) &&
        (!level || s.current_level === Number(level)) &&
        (!gov || s.governorate === gov) &&
        (!entry || s.entry_type === entry) &&
        (!inactive || (s.inactive_days ?? 0) >= INACTIVE_DAYS),
    );
    const by: Record<typeof sort, (a: StudentStat, b: StudentStat) => number> = {
      points: (a, b) => b.total_points - a.total_points,
      level: (a, b) => b.current_level - a.current_level || b.level_pct - a.level_pct,
      inactive: (a, b) => (b.inactive_days ?? 0) - (a.inactive_days ?? 0),
      name: (a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? '', 'ar'),
    };
    return list.sort(by[sort]);
  }, [students, q, level, gov, entry, inactive, sort]);

  return (
    <div>
      <div className="toolbar">
        <input placeholder="بحث بالاسم أو البريد" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">كل المستويات</option>
          {levels.map((l) => <option key={l.number} value={l.number}>{l.title}</option>)}
        </select>
        <select value={gov} onChange={(e) => setGov(e.target.value)}>
          <option value="">كل المحافظات</option>
          {govs.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={entry} onChange={(e) => setEntry(e.target.value)}>
          <option value="">جديد وقديم</option>
          <option value="new">جديد</option>
          <option value="returning">قديم</option>
        </select>
        <label><input type="checkbox" checked={inactive} onChange={(e) => setInactive(e.target.checked)} /> متوقف {INACTIVE_DAYS}+ يوم</label>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="level">ترتيب: المستوى</option>
          <option value="points">ترتيب: النقاط</option>
          <option value="inactive">ترتيب: الأطول توقفًا</option>
          <option value="name">ترتيب: الاسم</option>
        </select>
        <span className="muted">{rows.length} طالب</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>الاسم</th><th>المحافظة</th><th>النوع</th><th>المستوى</th><th>الإنجاز</th><th>النقاط</th><th>🔥</th><th>آخر نشاط</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.user_id}>
                <td>
                  <Link href={`/admin/students/${s.user_id}`}>{s.full_name ?? s.email}</Link>
                  {s.has_pending_placement && <span className="badge badge--gold" style={{ marginInlineStart: 6 }}>طلب مستوى</span>}
                </td>
                <td>{s.governorate ?? '—'}</td>
                <td>{s.entry_type === 'returning' ? <span className="badge badge--blue">قديم</span> : <span className="badge">جديد</span>}</td>
                <td>{s.current_level}</td>
                <td>{s.level_pct}%</td>
                <td>{s.total_points}</td>
                <td>{s.streak}</td>
                <td>
                  {(s.inactive_days ?? 0) >= INACTIVE_DAYS ? (
                    <span className="badge badge--red">منذ {s.inactive_days} يوم</span>
                  ) : s.inactive_days === 0 ? 'اليوم' : `منذ ${s.inactive_days ?? '—'} يوم`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
