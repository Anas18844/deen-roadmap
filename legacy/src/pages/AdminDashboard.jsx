import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch {
        setError('حدث خطأ أثناء جلب البيانات من Firestore.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return '—';
    try {
      return ts.toDate().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  /* حساب إحصائيات بسيطة */
  const govCount = users.reduce((acc, u) => {
    if (u.governorate) acc[u.governorate] = (acc[u.governorate] || 0) + 1;
    return acc;
  }, {});
  const topGov = Object.entries(govCount).sort((a, b) => b[1] - a[1])[0];
  const avgAge = users.length
    ? Math.round(users.reduce((s, u) => s + (Number(u.age) || 0), 0) / users.length)
    : null;

  return (
    <div className="admin">

      {/* ── Header ── */}
      <div className="admin__header">
        <div className="admin__header-inner container">
          <div className="admin__header-text">
            <h1 className="admin__title">لوحة المستخدمين</h1>
            <p className="admin__subtitle">بيانات المسجّلين في خريطة الطريق</p>
          </div>
          <Link to="/" className="admin__back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            العودة للرئيسية
          </Link>
        </div>
      </div>

      <div className="container">

        {/* ── Stat Cards ── */}
        {!loading && !error && users.length > 0 && (
          <div className="admin__stats">
            <div className="admin__stat">
              <span className="admin__stat-value">{users.length}</span>
              <span className="admin__stat-label">إجمالي المستخدمين</span>
            </div>
            {avgAge && (
              <div className="admin__stat">
                <span className="admin__stat-value">{avgAge}</span>
                <span className="admin__stat-label">متوسط العمر</span>
              </div>
            )}
            {topGov && (
              <div className="admin__stat">
                <span className="admin__stat-value admin__stat-value--sm">{topGov[0]}</span>
                <span className="admin__stat-label">أكثر محافظة</span>
              </div>
            )}
            <div className="admin__stat">
              <span className="admin__stat-value">
                {users.filter(u => u.previousCourses?.trim()).length}
              </span>
              <span className="admin__stat-label">لديهم خبرة سابقة</span>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="admin__loading">
            <span className="auth-loading__spinner" />
            <p>جارٍ تحميل البيانات…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="admin__error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && users.length === 0 && (
          <div className="admin__empty">لا يوجد مستخدمون مسجّلون بعد.</div>
        )}

        {/* ── Table (desktop) / Cards (mobile) ── */}
        {!loading && !error && users.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>المحافظة</th>
                    <th>العمر</th>
                    <th>الدورات السابقة</th>
                    <th>تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td className="admin__num">{i + 1}</td>
                      <td className="admin__name">{u.name || '—'}</td>
                      <td className="admin__email">{u.email || '—'}</td>
                      <td>{u.governorate || '—'}</td>
                      <td className="admin__center">{u.age || '—'}</td>
                      <td className="admin__courses">{u.previousCourses || '—'}</td>
                      <td className="admin__date">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="admin__cards">
              {users.map((u, i) => (
                <div className="admin__card" key={u.id}>
                  <div className="admin__card-top">
                    <span className="admin__card-num">{i + 1}</span>
                    <span className="admin__card-name">{u.name || '—'}</span>
                    <span className="admin__card-date">{formatDate(u.createdAt)}</span>
                  </div>
                  <div className="admin__card-body">
                    <div className="admin__card-row">
                      <span className="admin__card-key">البريد</span>
                      <span className="admin__card-val admin__card-val--ltr">{u.email || '—'}</span>
                    </div>
                    <div className="admin__card-row">
                      <span className="admin__card-key">المحافظة</span>
                      <span className="admin__card-val">{u.governorate || '—'}</span>
                    </div>
                    <div className="admin__card-row">
                      <span className="admin__card-key">العمر</span>
                      <span className="admin__card-val">{u.age || '—'}</span>
                    </div>
                    {u.previousCourses?.trim() && (
                      <div className="admin__card-row admin__card-row--col">
                        <span className="admin__card-key">الدورات السابقة</span>
                        <span className="admin__card-val">{u.previousCourses}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
