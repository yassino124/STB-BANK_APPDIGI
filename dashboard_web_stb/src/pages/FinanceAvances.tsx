import { useEffect, useState } from 'react';
import { Wallet, CheckCircle, XCircle, Clock, RefreshCw, TrendingUp, Users, DollarSign, AlertCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FinanceAvances = () => {
  const { user } = useAuth();
  const [avances, setAvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/avances');
      const data = res?.data?.data || res?.data || [];
      setAvances(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erreur de chargement');
      toast.error('Erreur lors du chargement des avances');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, decision: 'APPROUVE' | 'REFUSE') => {
    try {
      await api.patch(`/avances/${id}/status`, { statut: decision });
      toast.success(`Avance ${decision === 'APPROUVE' ? 'approuvée' : 'refusée'} avec succès!`);
      fetchData(); // Reload data
    } catch (err: any) {
      toast.error('Erreur lors de la décision');
    }
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    EN_ATTENTE: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: '#F59E0B' },
    APPROUVE: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: '#10B981' },
    REFUSE: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: '#EF4444' },
    DEBITEE: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: '#8B5CF6' },
  };

  const statusLabels: Record<string, string> = {
    EN_ATTENTE: 'En attente',
    APPROUVE: 'Approuvé',
    REFUSE: 'Refusé',
    DEBITEE: 'Débité',
  };

  const filteredAvances = avances.filter((a) => {
    const matchesFilter = filter === 'ALL' || a.statut === filter;
    const matchesSearch = !searchTerm || 
      `${a.employee?.prenom} ${a.employee?.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employee?.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: avances.length,
    pending: avances.filter((a) => a.statut === 'EN_ATTENTE').length,
    approved: avances.filter((a) => a.statut === 'APPROUVE').length,
    refused: avances.filter((a) => a.statut === 'REFUSE').length,
    totalAmount: avances.reduce((sum, a) => sum + (a.montant || 0), 0),
    pendingAmount: avances.filter((a) => a.statut === 'EN_ATTENTE').reduce((sum, a) => sum + (a.montant || 0), 0),
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid rgba(41, 98, 255, 0.1)', 
            borderTopColor: '#2962FF', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chargement des avances...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertCircle size={64} style={{ color: '#EF4444', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Erreur de chargement
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2962FF',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Gestion des Avances
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Validation et suivi des demandes d'avances salariales
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', background: 'rgba(41,98,255,0.1)',
              border: '1px solid rgba(41,98,255,0.2)', borderRadius: '10px',
              color: '#2962FF', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'En attente', value: stats.pending, color: '#F59E0B', urgent: stats.pending > 0 },
          { label: 'Approuvées', value: stats.approved, color: '#10B981', urgent: false },
          { label: 'Refusées',   value: stats.refused,   color: '#EF4444', urgent: false },
          { label: 'Total',      value: stats.total,     color: '#2962FF', urgent: false },
        ].map(stat => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05, y: -5 }}
            animate={stat.urgent ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: stat.urgent ? Infinity : 0, duration: stat.urgent ? 2 : 0.2 }}
            style={{
              background: `${stat.color}10`,
              border: `1px solid ${stat.color}30`,
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              minWidth: '120px',
              boxShadow: `0 4px 14px ${stat.color}15`,
              cursor: 'pointer'
            }}
          >
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: stat.color }}>{stat.value}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['EN_ATTENTE', 'APPROUVE', 'REFUSE', 'ALL'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
              background: filter === f ? '#2962FF' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              boxShadow: filter === f ? '0 4px 14px rgba(41,98,255,0.3)' : 'none',
            }}
          >
            {f === 'EN_ATTENTE' ? `⏳ En attente${stats.pending > 0 ? ` (${stats.pending})` : ''}` :
             f === 'APPROUVE' ? '✅ Approuvées' :
             f === 'REFUSE'   ? '❌ Refusées' : '📋 Toutes'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
      }}>
        {filteredAvances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Wallet size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600 }}>Aucune demande d'avance {filter === 'EN_ATTENTE' ? 'en attente' : filter === 'APPROUVE' ? 'approuvée' : filter === 'REFUSE' ? 'refusée' : ''}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Collaborateur', 'Type', 'Montant', 'Statut', 'Actions'].map((h, i) => (
                    <th key={h} style={{
                      padding: '1rem 1.25rem', textAlign: i === 4 ? 'right' : 'left',
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '1px', color: 'var(--text-muted)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredAvances.map((a, idx) => {
                    const avatarColor = 'var(--stb-blue)';
                    return (
                      <motion.tr
                        key={a._id}
                        initial={{ opacity: 0, x: -20, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.15s',
                          originX: 0
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Collaborateur */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {(() => {
                              const COLORS = ['#2962FF','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4'];
                              const bgColor = COLORS[(a.employee?.nom?.charCodeAt(0) || 0) % COLORS.length];
                              return (
                                <div style={{
                                  width: 40, height: 40, borderRadius: '50%',
                                  background: bgColor, display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.85rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                                  overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)',
                                  position: 'relative',
                                }}>
                                  {a.employee?._id ? (
                                    <img
                                      src={a.employee?.avatar?.startsWith('data:')
                                        ? a.employee.avatar
                                        : `/api/v1/employees/${a.employee._id}/avatar`}
                                      alt={`${a.employee?.prenom} ${a.employee?.nom}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent && !parent.querySelector('span')) {
                                          const span = document.createElement('span');
                                          span.style.cssText = 'font-size:0.85rem;font-weight:800;color:#fff;text-transform:uppercase';
                                          span.textContent = `${a.employee?.prenom?.[0] || '?'}${a.employee?.nom?.[0] || ''}`;
                                          parent.appendChild(span);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                                      {(a.employee?.prenom?.[0] || '?')}{(a.employee?.nom?.[0] || '')}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            <div>
                              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                {a.employee?.prenom} {a.employee?.nom}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {a.employee?.matricule}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>💰</span>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              Avance Salaire
                            </span>
                          </div>
                        </td>

                        {/* Montant */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {a.montant?.toLocaleString('fr-TN')} <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>TND</span>
                          </span>
                        </td>

                        {/* Statut */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                            background: statusColors[a.statut]?.bg || 'rgba(255,255,255,0.1)',
                            border: `1px solid ${statusColors[a.statut]?.border || 'rgba(255,255,255,0.2)'}`,
                            color: statusColors[a.statut]?.text || '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                          }}>
                            {a.statut === 'EN_ATTENTE' && <Clock size={12} />}
                            {a.statut === 'APPROUVE' && <CheckCircle size={12} />}
                            {a.statut === 'REFUSE' && <XCircle size={12} />}
                            {statusLabels[a.statut] || a.statut}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          {a.statut === 'EN_ATTENTE' ? (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleDecision(a._id, 'APPROUVE')}
                                style={{
                                  padding: '0.4rem 0.75rem', background: 'rgba(16,185,129,0.1)',
                                  border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px',
                                  color: '#10B981', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                }}
                              >
                                <CheckCircle size={14} /> Approuver
                              </button>
                              <button
                                onClick={() => handleDecision(a._id, 'REFUSE')}
                                style={{
                                  padding: '0.4rem 0.75rem', background: 'rgba(239,68,68,0.1)',
                                  border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px',
                                  color: '#EF4444', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                }}
                              >
                                <XCircle size={14} /> Refuser
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600,
                                display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'not-allowed'
                              }}
                            >
                              <Eye size={12} /> Traitée
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceAvances;