import { useEffect, useState } from 'react';
import { TrendingUp, CreditCard, Shield, AlertTriangle, Wallet, Users, Banknote, RefreshCw, Activity, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 260, damping: 20 } }),
};

const AgenceDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentAccounts, setRecentAccounts] = useState<any[]>([]);
  const [aiFraudAlerts, setAiFraudAlerts] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, cardsRes, creditsRes, alertsRes] = await Promise.all([
        api.get('/accounts/all').catch(() => null),
        api.get('/cards/all').catch(() => null),
        api.get('/credits/all').catch(() => null),
        api.get('/risk-alerts/pending').catch(() => null),
      ]);

      const accs = accRes?.data?.data || accRes?.data || [];
      const cds = cardsRes?.data?.data || cardsRes?.data || [];
      const crs = creditsRes?.data?.data || creditsRes?.data || [];
      const alts = alertsRes?.data?.data || alertsRes?.data || [];

      setAccounts(Array.isArray(accs) ? accs : []);
      setCards(Array.isArray(cds) ? cds : []);
      setCredits(Array.isArray(crs) ? crs : []);
      setAlerts(Array.isArray(alts) ? alts : []);

      // Most recent 5 accounts
      const sorted = [...(Array.isArray(accs) ? accs : [])].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentAccounts(sorted.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(a => a.status === 'ACTIVE').length,
    frozenAccounts: accounts.filter(a => a.status === 'FROZEN').length,
    totalBalance: accounts.reduce((sum, a) => sum + (a.solde || 0), 0),
    totalCards: cards.length,
    activeCards: cards.filter(c => c.status === 'ACTIVE').length,
    pendingCards: cards.filter(c => c.status === 'PENDING').length,
    totalCredits: credits.length,
    activeCredits: credits.filter(c => c.status === 'ACTIVE').length,
    lateCredits: credits.filter(c => c.status === 'LATE').length,
    totalRemaining: credits.reduce((sum, c) => sum + (c.montantRestant || 0), 0),
    totalAlerts: alerts.length,
  };

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(41,98,255,0.15)', borderTopColor: '#2962FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-title">
            Dashboard Agence
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="page-subtitle">
            Vue financière et opérationnelle — {user?.matricule}
          </motion.p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '0.6rem 1.25rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
            <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }`}</style>
            <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 700 }}>Systèmes Actifs</span>
          </motion.div>
          <button
            onClick={fetchData}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'rgba(41,98,255,0.1)', border: '1px solid rgba(41,98,255,0.2)', borderRadius: '10px', color: '#2962FF', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Comptes Actifs', value: stats.activeAccounts, sub: `${stats.totalAccounts} total`, color: '#2962FF', icon: Users },
          { label: 'Cartes Actives', value: stats.activeCards, sub: stats.pendingCards > 0 ? `${stats.pendingCards} en attente` : 'Tout actif', color: '#10B981', icon: CreditCard, urgent: stats.pendingCards > 0 },
          { label: 'Crédits Actifs', value: stats.activeCredits, sub: stats.lateCredits > 0 ? `⚠️ ${stats.lateCredits} en retard` : 'Aucun retard', color: '#8B5CF6', icon: Banknote, urgent: stats.lateCredits > 0 },
          { label: 'Alertes Fraude', value: stats.totalAlerts, sub: 'À traiter', color: '#EF4444', icon: AlertTriangle, urgent: stats.totalAlerts > 0 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.04, y: -4 }}
            style={{
              background: `${stat.color}10`,
              border: `1px solid ${stat.color}30`,
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              minWidth: '160px',
              flex: 1,
              boxShadow: stat.urgent ? `0 4px 20px ${stat.color}30` : `0 4px 14px ${stat.color}15`,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</p>
              <stat.icon size={16} color={stat.color} />
            </div>
            <p style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: stat.urgent ? stat.color : 'var(--text-muted)', fontWeight: stat.urgent ? 700 : 500 }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Fraud Alerts */}
      {aiFraudAlerts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {aiFraudAlerts.map((fraud, i) => (
            <motion.div
              key={fraud.id || i}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', delay: i * 0.1 }}
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(185,28,28,0.2))',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1rem',
                display: 'flex', gap: '1.5rem', alignItems: 'center',
                boxShadow: '0 10px 30px rgba(239,68,68,0.2), inset 0 0 20px rgba(239,68,68,0.1)'
              }}
            >
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid rgba(239,68,68,0.5)', position: 'relative'
              }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #EF4444', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                <Bot size={32} color="#EF4444" />
                <style>{`@keyframes ping { 75%,100%{transform:scale(1.5);opacity:0} }`}</style>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, color: '#EF4444', fontSize: '1.1rem', fontWeight: 800 }}>🚨 ALERTE FRAUDE IA</h3>
                  <span style={{ padding: '0.2rem 0.5rem', background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, borderRadius: '6px' }}>{fraud.severity} SEVERITY</span>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '0.95rem' }}>
                  <strong style={{ color: '#FCA5A5' }}>{fraud.employeeName}</strong> : {fraud.description}
                </p>
                <div style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--stb-electric)', fontSize: '0.8rem', fontWeight: 600 }}>
                  💡 Action Recommandée : {fraud.recommendedAction}
                </div>
              </div>
              <div>
                <button className="btn btn-primary" style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                  Bloquer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Solde Total Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, rgba(41,98,255,0.15) 0%, rgba(139,92,246,0.15) 100%)',
          border: '1px solid rgba(41,98,255,0.25)',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(41,98,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={26} color="#2962FF" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solde Total Géré</p>
            <p style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
              {stats.totalBalance.toLocaleString('fr-TN')} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>TND</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6' }}>{(stats.totalRemaining / 1000).toFixed(1)}K</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crédits restants</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#EF4444' }}>{stats.frozenAccounts}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comptes bloqués</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{stats.pendingCards}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cartes en attente</p>
          </div>
        </div>
      </motion.div>

      {/* Bottom Grid: Recent Accounts + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent Accounts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(20px)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} color="#2962FF" /> Derniers Comptes
            </h3>
            <button onClick={() => navigate('/agence/accounts')} style={{ background: 'none', border: 'none', color: '#2962FF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Voir tout →
            </button>
          </div>
          {recentAccounts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Aucun compte disponible</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentAccounts.map((acc: any, i: number) => (
                <motion.div key={acc._id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(41,98,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(41,98,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2962FF', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      {acc.employeeId?.prenom?.[0]}{acc.employeeId?.nom?.[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {acc.employeeId?.prenom} {acc.employeeId?.nom}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{acc.employeeId?.matricule}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{acc.solde?.toLocaleString('fr-TN')} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TND</span></p>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, background: acc.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: acc.status === 'ACTIVE' ? '#10B981' : '#EF4444' }}>
                      {acc.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Alerts + Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(20px)' }}
        >
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color="#EF4444" /> Alertes & Actions Rapides
          </h3>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Comptes', icon: Users, color: '#2962FF', path: '/agence/accounts' },
              { label: 'Cartes', icon: CreditCard, color: '#F59E0B', path: '/agence/cards' },
              { label: 'Crédits', icon: Banknote, color: '#8B5CF6', path: '/finance/credits' },
              { label: 'Alertes', icon: AlertTriangle, color: '#EF4444', path: '/risk-alerts' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '12px', border: `1px solid ${action.color}25`, background: `${action.color}08`, color: action.color, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = `${action.color}18`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${action.color}08`)}
              >
                <action.icon size={15} /> {action.label}
              </button>
            ))}
          </div>

          {/* Alerts List */}
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              <Shield size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Aucune alerte fraude active</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {alerts.slice(0, 3).map((alert: any, i: number) => (
                <div key={i} style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: alert?.severity === 'HIGH' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${alert?.severity === 'HIGH' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{alert?.title ?? 'Alerte'}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '999px', fontWeight: 700, background: alert?.severity === 'HIGH' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: alert?.severity === 'HIGH' ? '#EF4444' : '#F59E0B' }}>
                      {alert?.severity ?? 'MEDIUM'}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{alert?.message ?? ''}</p>
                </div>
              ))}
              {alerts.length > 3 && (
                <button onClick={() => navigate('/risk-alerts')} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '0.5rem' }}>
                  +{alerts.length - 3} autres alertes →
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgenceDashboard;