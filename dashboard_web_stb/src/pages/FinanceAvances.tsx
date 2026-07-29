import { useEffect, useState } from 'react';
import { Wallet, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FinanceAvances = () => {
  const { user } = useAuth();
  const [avances, setAvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/avances/pending').catch(() => null);
        setAvances(res?.data?.data || []);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
        toast.error('Erreur lors du chargement des avances');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/finance/avances/${id}/decision`, { decision });
      setAvances(avances.map((a) => (a._id === id ? { ...a, status: decision } : a)));
      toast.success(`Avance ${decision === 'APPROVED' ? 'approuvée' : 'refusée'}`);
    } catch (err: any) {
      toast.error('Erreur lors de la décision');
    }
  };

  const statusColors: Record<string, string> = {
    PENDING_MANAGER: '#F59E0B',
    APPROVED_BY_MANAGER: '#2962FF',
    PENDING_RH: '#8B5CF6',
    APPROVED_BY_RH: '#10B981',
    REJECTED: '#EF4444',
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

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
          Gestion des Avances
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Validation des avances employés</p>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(41,98,255,0.04)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employé</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motif</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {avances.map((a: any, i: number) => (
                <tr key={a._id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {a.employeeId?.prenom} {a.employeeId?.nom}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{a.type}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {a.montant?.toLocaleString('fr-FR')} TND
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.motif || '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: `${statusColors[a.status] || '#6B7280'}15`,
                      color: statusColors[a.status] || '#6B7280',
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    {a.status === 'PENDING_MANAGER' || a.status === 'PENDING_RH' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDecision(a._id, 'APPROVED')}
                          style={{ padding: '4px 10px', borderRadius: '8px', border: 'none', background: '#10B981', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />Approuver
                        </button>
                        <button
                          onClick={() => handleDecision(a._id, 'REJECTED')}
                          style={{ padding: '4px 10px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <XCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />Refuser
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {avances.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucune avance en attente
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

export default FinanceAvances;