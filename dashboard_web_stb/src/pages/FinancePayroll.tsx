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
        const res = await api.get('/finance/payroll').catch(() => null);
        setPayrolls(res?.data?.data || []);
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
    if (filterMonth && p.month !== parseInt(filterMonth)) return false;
    if (filterYear && p.year !== parseInt(filterYear)) return false;
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
              {filteredPayrolls.map((p: any, i: number) => (
                <tr key={p._id || i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {p.employeeId?.prenom} {p.employeeId?.nom}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {monthNames[p.month] || p.month}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{p.year}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {p.salaireBase?.toLocaleString('fr-FR')} TND
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {p.salaireNet?.toLocaleString('fr-FR')} TND
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: `${statusColors[p.status] || '#6B7280'}15`,
                      color: statusColors[p.status] || '#6B7280',
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2962FF',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
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