import { useEffect, useState } from 'react';
import { TrendingUp, CreditCard, FileText, Shield, AlertTriangle, Clock, Users, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AgenceDashboard = () => {
  
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCredits, setPendingCredits] = useState<any[]>([]);
  const [pendingCards, setPendingCards] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, creditsRes, cardsRes, alertsRes] = await Promise.all([
          api.get('/dashboard/stats').catch(() => null),
          api.get('/credits/pending').catch(() => null),
          api.get('/cards/pending').catch(() => null),
          api.get('/risk-alerts/pending').catch(() => null),
        ]);

        setStats(statsRes?.data?.data || { totalTransactions: 0, flaggedTransactions: 0, pendingCredits: 0, activeCards: 0, totalCreditVolume: 0 });
        setPendingCredits(creditsRes?.data?.data || []);
        setPendingCards(cardsRes?.data?.data || []);
        setAlerts(alertsRes?.data?.data || []);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
        toast.error('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          Dashboard Agence — {user?.matricule}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vue financière et opérationnelle</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Transactions', value: stats?.totalTransactions ?? 0, icon: TrendingUp, color: '#2962FF', bg: 'rgba(41,98,255,0.1)' },
          { label: 'Alertes Fraude', value: stats?.flaggedTransactions ?? 0, icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Crédits en attente', value: stats?.pendingCredits ?? pendingCredits.length, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Cartes actives', value: stats?.activeCards ?? pendingCards.length, icon: CreditCard, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} color={stat.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString('fr-FR') : stat.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            <Banknote size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#2962FF' }} />
            Demandes de Crédit en attente
          </h3>
          {pendingCredits.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Aucune demande en attente</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Matricule</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Montant</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score IA</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCredits.slice(0, 5).map((credit: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--text-primary)' }}>{credit?.employeeId?.matricule ?? '—'}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>{credit?.montant?.toLocaleString('fr-FR')} TND</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: (credit?.aiScore ?? 0) > 70 ? 'rgba(16,185,129,0.1)' : (credit?.aiScore ?? 0) > 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: (credit?.aiScore ?? 0) > 70 ? '#10B981' : (credit?.aiScore ?? 0) > 40 ? '#F59E0B' : '#EF4444' }}>
                          {credit?.aiScore ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button style={{ padding: '4px 10px', borderRadius: '8px', border: 'none', background: '#10B981', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Approuver</button>
                          <button style={{ padding: '4px 10px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Refuser</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            <Shield size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#EF4444' }} />
            Alertes Récentes
          </h3>
          {alerts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Aucune alerte en attente</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {alerts.slice(0, 5).map((alert: any, i: number) => (
                <div key={i} style={{ padding: '0.75rem', borderRadius: '10px', background: alert?.severity === 'HIGH' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${alert?.severity === 'HIGH' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{alert?.title ?? 'Alerte'}</span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px', background: alert?.severity === 'HIGH' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: alert?.severity === 'HIGH' ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>
                      {alert?.severity ?? 'MEDIUM'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{alert?.message ?? ''}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgenceDashboard;