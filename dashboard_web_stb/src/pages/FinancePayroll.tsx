import { useEffect, useState } from 'react';
import { FileText, Download, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FinancePayroll = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/payroll/all').catch(() => null);
        setPayrolls(res?.data?.data || res?.data || []);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
        toast.error('Erreur lors du chargement des fiches de paie');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPayrolls = payrolls.filter((p: any) => {
    if (filterMonth && p.mois !== parseInt(filterMonth)) return false;
    if (filterYear && p.annee !== parseInt(filterYear)) return false;
    return true;
  });

  const monthNames = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const statusColors: Record<string, string> = {
    DRAFT: '#F59E0B',
    GENERATED: '#2962FF',
    APPROVED: '#10B981',
    PAID: '#8B5CF6',
  };

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
            Gestion de la Paie
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fiches de paie mensuelles</p>
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
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            <option value="">Toutes les années</option>
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={() => { setFilterMonth(''); setFilterYear(''); }}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Réinitialiser
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(41,98,255,0.04)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employé</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mois</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Année</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salaire Brut</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salaire Net</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.map((p: any, i: number) => {
                const emp = p.employeeId || {};
                const role = emp.roles?.[0] || 'EMPLOYEE';
                return (
                <tr key={p._id || i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar avatar-md" style={{ border: '2px solid var(--border-blue)', overflow: 'hidden', position: 'relative', background: 'var(--stb-blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {emp.avatar ? (
                          <img
                            src={emp.avatar.startsWith('data:') ? emp.avatar : `/api/v1/employees/${emp._id}/avatar`}
                            alt={emp.prenom}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('span')) {
                                const span = document.createElement('span');
                                span.style.cssText = 'font-size:0.85rem;font-weight:800;color:#fff';
                                const mat = emp.matricule || 'AD';
                                span.textContent = mat.slice(0, 2).toUpperCase();
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                            {(emp.matricule || 'EM').slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {emp.prenom} {emp.nom}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--stb-blue-400)', fontWeight: 600 }}>
                          {role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {monthNames[p.mois] || p.mois}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{p.annee}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {p.salaireBrut?.toLocaleString('fr-FR')} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TND</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 800 }}>
                    {p.salaireNet?.toLocaleString('fr-FR')} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TND</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: `${statusColors[p.status] || '#6B7280'}15`,
                      color: statusColors[p.status] || '#6B7280',
                      border: `1px solid ${statusColors[p.status] || '#6B7280'}40`,
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(41,98,255,0.3)',
                        background: 'linear-gradient(135deg, rgba(41,98,255,0.1), rgba(41,98,255,0.2))',
                        color: 'var(--stb-blue-400)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Download size={14} /> PDF
                    </motion.button>
                  </td>
                </tr>
                );
              })}
              {filteredPayrolls.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucune fiche de paie trouvée
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

export default FinancePayroll;