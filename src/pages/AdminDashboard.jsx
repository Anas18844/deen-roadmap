import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
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

  return (
    <div className="admin">
      <div className="admin__header">
        <div className="container">
          <h1 className="admin__title">لوحة المستخدمين</h1>
          {!loading && !error && (
            <span className="admin__count">
              {users.length} مستخدم مسجّل
            </span>
          )}
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="admin__loading">
            <span className="auth-loading__spinner" />
            <p>جارٍ تحميل البيانات…</p>
          </div>
        )}

        {error && (
          <div className="admin__error">{error}</div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="admin__empty">لا يوجد مستخدمون مسجّلون بعد.</div>
        )}

        {!loading && !error && users.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
