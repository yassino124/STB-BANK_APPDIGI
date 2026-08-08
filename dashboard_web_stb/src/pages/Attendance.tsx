import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, AlertTriangle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [teamSize, setTeamSize] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [absencesRes, employeesRes] = await Promise.all([
          api.get('/absences/my-team').catch(() => null),
          api.get('/employees?limit=100').catch(() => null)
        ]);
        
        setAttendance(absencesRes?.data?.data || absencesRes?.data || []);
        
        // Calculate team size
        const allEmp = employeesRes?.data?.data || employeesRes?.data || [];
        const myTeam = allEmp.filter((e: any) => {
          const mid = e.managerId?._id || e.managerId;
          const did = e.directorId?._id || e.directorId;
          const cid = e.centralDirectorId?._id || e.centralDirectorId;
          const userId = user?.sub?.toString() || (user as any)?._id?.toString() || (user as any)?.id?.toString();
          return userId && ((mid && mid.toString() === userId) || (did && did.toString() === userId) || (cid && cid.toString() === userId));
        });
        setTeamSize(myTeam.length);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
        toast.error('Erreur lors du chargement du planning');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthNames = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const filteredAttendance = filterMonth
    ? attendance.filter((a: any) => a.month === parseInt(filterMonth))
    : attendance;

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Planning & Présence
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vue calendrier des absences et taux d\'absentéisme</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            <option value="">Tous les mois</option>
            {monthNames.map((m, i) => i > 0 && <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Absences ce mois', value: attendance.filter((a: any) => a.status === 'ABSENT').length, icon: Calendar, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Retards ce mois', value: attendance.filter((a: any) => a.status === 'LATE').length, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Employés actifs', value: Math.max(0, teamSize - attendance.filter((a: any) => a.status === 'ABSENT').length), icon: Users, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Alertes', value: attendance.filter((a: any) => a.alert).length, icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(41,98,255,0.04)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employé</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Département</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jours Absents</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jours Retard</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solde Congés</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((a: any, i: number) => (
                <tr key={a._id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {a.employeeId?.prenom} {a.employeeId?.nom}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{a.employeeId?.poste || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{a.absentDays || 0}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{a.lateDays || 0}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-primary)' }}>{a.leaveBalance || 0} j</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: a.alert ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: a.alert ? '#EF4444' : '#10B981',
                    }}>
                      {a.alert ? 'Alerte' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucune donnée de présence
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;