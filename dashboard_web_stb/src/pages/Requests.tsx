import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Check, X, RefreshCw, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface RequestEntry {
  _id: string;
  employeeId: { _id: string; nom: string; prenom: string; matricule: string };
  type: string;
  status: string;
  motif?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  documentType?: string;
  cardTier?: string;
  createdAt: string;
  payload?: any;
}

const TYPE_LABELS: Record<string, string> = {
  // Congés
  CONGE: 'Congé',
  LEAVE: 'Congé',
  REPOS: 'Congé Repos',
  MALADIE: 'Congé Maladie',
  MARIAGE: 'Congé Mariage',
  // Avances
  AVANCE: 'Avance sur salaire',
  ADVANCE: 'Avance sur salaire',
  SALAIRE: 'Avance sur Salaire',
  PRIME: 'Avance sur Prime',
  PRIME_AID: 'Avance Prime Aïd',
  PERFORMANCE: 'Prime de Rendement',
  AID: 'Prime Aïd',
  // Autres
  CREDIT: 'Crédit',
  DOCUMENT: 'Document administratif',
  CARTE: 'Carte bancaire',
  CARD: 'Carte bancaire',
  CHEQUIER: 'Chéquier',
};

const TYPE_ICONS: Record<string, string> = {
  CONGE: '🏖️', LEAVE: '🏖️', REPOS: '🏖️', MALADIE: '🤒', MARIAGE: '💍',
  AVANCE: '💰', ADVANCE: '💰', SALAIRE: '💰', PRIME: '⭐', PRIME_AID: '🌙', PERFORMANCE: '⭐', AID: '🌙',
  CREDIT: '🏦',
  DOCUMENT: '📄',
  CARTE: '💳', CARD: '💳',
  CHEQUIER: '📑',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  EN_ATTENTE: { label: 'En attente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={12} /> },
  APPROUVE:   { label: 'Approuvée', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={12} /> },
  REFUSE:     { label: 'Refusée',   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: <XCircle size={12} /> },
  ANNULE:     { label: 'Annulée',   color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', icon: <XCircle size={12} /> },
};

const AVATARS_COLORS = ['#2962FF','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4'];

const Requests = () => {
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('EN_ATTENTE');
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newCount, setNewCount] = useState(0);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [avancesRes, congesRes, chqRes, primesRes] = await Promise.all([
        api.get('/avances'),
        api.get('/conges'),
        api.get('/cheques'),
        api.get('/primes/all')
      ]);

      // Transform avances
      const avancesData = (avancesRes.data.data || avancesRes.data || []).map((a: any) => ({
        _id: a._id,
        employeeId: a.employee || a.employeeId, // Support both field names
        type: a.type || 'AVANCE',
        status: a.statut,
        amount: a.montant,
        motif: a.motif,
        createdAt: a.createdAt,
        payload: { amount: a.montant, motif: a.motif, type: a.type },
      }));

      // Transform congés
      const congesData = (congesRes.data.data || congesRes.data || []).map((c: any) => ({
        _id: c._id,
        employeeId: c.employee || c.employeeId, // Support both field names
        type: c.type || 'CONGE',
        status: c.status || c.statut, // Support both status/statut
        startDate: c.startDate || c.dateDebut,
        endDate: c.endDate || c.dateFin,
        motif: c.motif,
        createdAt: c.createdAt,
        payload: { 
          startDate: c.startDate || c.dateDebut, 
          endDate: c.endDate || c.dateFin, 
          motif: c.motif, 
          type: c.type 
        },
      }));

      // Transform chèques
      const chequesData = (chqRes.data.data || chqRes.data || []).map((c: any) => ({
        _id: c._id,
        employeeId: c.employeeId,
        type: 'CHEQUIER',
        status: c.status,
        payload: { chqType: c.type },
        createdAt: c.createdAt,
      }));
      
      // Transform primes
      const primesData = (primesRes.data.data || primesRes.data || []).map((p: any) => ({
        _id: p._id,
        employeeId: p.employeeId,
        type: p.type,
        status: p.status === 'PENDING' ? 'EN_ATTENTE' : (p.status === 'APPROVED' ? 'APPROUVE' : 'REFUSE'),
        amount: p.montant,
        motif: p.description,
        createdAt: p.createdAt,
        payload: { amount: p.montant, motif: p.description, type: p.type },
      }));

      const merged = [...avancesData, ...congesData, ...chequesData, ...primesData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRequests(prev => {
        const prevPending = prev.filter(r => r.status === 'EN_ATTENTE').length;
        const newPending = merged.filter(r => r.status === 'EN_ATTENTE').length;
        if (newPending > prevPending && silent) {
          setNewCount(n => n + (newPending - prevPending));
          toast('🔔 Nouvelle demande reçue !', { duration: 3000 });
        }
        return merged;
      });
      setLastUpdated(new Date());
    } catch (err) {
      if (!silent) toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    // Auto-refresh every 15 seconds for real-time updates
    const interval = setInterval(() => fetchRequests(true), 15000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const updateStatus = async (id: string, status: string, type?: string) => {
    setUpdating(id);
    try {
      if (type === 'CHEQUIER') {
        await api.put(`/cheques/${id}/status`, { status });
      } else if (type === 'PERFORMANCE' || type === 'AID') {
        const decision = status === 'APPROUVE' ? 'APPROVED' : 'REJECTED';
        await api.patch(`/primes/${id}/handle`, { decision });
      } else if (type === 'AVANCE' || type === 'SALAIRE' || type === 'PRIME' || type === 'PRIME_AID') {
        await api.patch(`/avances/${id}/status`, { statut: status });
      } else if (type === 'CONGE' || type === 'REPOS' || type === 'MALADIE' || type === 'MARIAGE' || type === 'NAISSANCE' || type === 'DECES' || type === 'PELERINAGE' || type === 'SANS_SOLDE') {
        await api.patch(`/conges/${id}/status`, { statut: status });
      } else {
        // Fallback to generic requests
        await api.patch(`/requests/${id}/status`, { status });
      }
      toast.success(
        status === 'APPROUVE'
          ? '✅ Demande approuvée — le collaborateur sera notifié'
          : '❌ Demande refusée',
        { duration: 4000 }
      );
      // Optimistic update
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      toast.error('Erreur de mise à jour');
      fetchRequests();
    } finally {
      setUpdating(null);
    }
  };

  const filteredRequests = requests.filter(r => filter === 'ALL' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'EN_ATTENTE').length;

  const getDetails = (req: RequestEntry) => {
    const payload = req.payload || {};
    if (req.type === 'CHEQUIER') {
      return (
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Type de chéquier : </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{payload.chqType === 'CERTIFIE' ? 'Certifié' : `${payload.chqType} pages`}</span>
        </div>
      );
    }
    if (req.type === 'CONGE' || req.type === 'LEAVE') {
      const start = payload.startDate || req.startDate;
      const end = payload.endDate || req.endDate;
      if (start && end) {
        const startD = new Date(start);
        const endD = new Date(end);
        const days = Math.ceil(Math.abs(endD.getTime() - startD.getTime()) / 86400000) || 1;
        return `Du ${format(startD, 'dd/MM/yy')} au ${format(endD, 'dd/MM/yy')} • ${days} jour${days > 1 ? 's' : ''}`;
      }
      return payload.motif || 'Congé';
    }
    if (req.type === 'AVANCE' || req.type === 'PRIME' || req.type === 'CREDIT' || req.type === 'PERFORMANCE' || req.type === 'AID') {
        const amount = payload.amount || req.amount;
      if (amount) return `${Number(amount).toLocaleString('fr-TN')} TND`;
    }
    return payload.motif || payload.type || req.type;
  };

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Contrôle des Demandes
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Validation des requêtes collaborateurs en temps réel
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            MAJ: {formatDistanceToNow(lastUpdated, { locale: fr, addSuffix: true })}
          </span>
          <button
            onClick={() => { setNewCount(0); fetchRequests(); }}
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
          { label: 'En attente', value: requests.filter(r => r.status === 'EN_ATTENTE').length, color: '#F59E0B', urgent: pendingCount > 0 },
          { label: 'Approuvées', value: requests.filter(r => r.status === 'APPROUVE').length, color: '#10B981', urgent: false },
          { label: 'Refusées',   value: requests.filter(r => r.status === 'REFUSE').length,   color: '#EF4444', urgent: false },
          { label: 'Total',      value: requests.length,                                        color: '#2962FF', urgent: false },
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
        {newCount > 0 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <AlertCircle size={16} color="#EF4444" />
            <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.85rem' }}>{newCount} nouvelle{newCount > 1 ? 's' : ''} demande{newCount > 1 ? 's' : ''}</span>
          </motion.div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['EN_ATTENTE', 'APPROUVE', 'REFUSE', 'ALL'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setNewCount(0); }}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
              background: filter === f ? '#2962FF' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              boxShadow: filter === f ? '0 4px 14px rgba(41,98,255,0.3)' : 'none',
            }}
          >
            {f === 'EN_ATTENTE' ? `⏳ En attente${pendingCount > 0 ? ` (${pendingCount})` : ''}` :
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
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(41,98,255,0.3)', borderTop: '3px solid #2962FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chargement des demandes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600 }}>Aucune demande {filter === 'EN_ATTENTE' ? 'en attente' : filter === 'APPROUVE' ? 'approuvée' : filter === 'REFUSE' ? 'refusée' : ''}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Collaborateur', 'Type', 'Détails', 'Statut', 'Date', 'Actions'].map((h, i) => (
                    <th key={h} style={{
                      padding: '1rem 1.25rem', textAlign: i === 5 ? 'right' : 'left',
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '1px', color: 'var(--text-muted)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredRequests.map((req, idx) => {
                    const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG['EN_ATTENTE'];
                    const avatarColor = AVATARS_COLORS[(req.employeeId?.nom?.charCodeAt(0) || 0) % AVATARS_COLORS.length];
                    const isUpdating = updating === req._id;
                    return (
                      <motion.tr
                        key={req._id}
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
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%',
                              background: avatarColor, display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                            }}>
                              {(req.employeeId?.prenom?.[0] || '?')}{(req.employeeId?.nom?.[0] || '')}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                {req.employeeId?.prenom} {req.employeeId?.nom}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {req.employeeId?.matricule}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>{TYPE_ICONS[req.type] || '📋'}</span>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              {TYPE_LABELS[req.type] || req.type}
                            </span>
                          </div>
                        </td>

                        {/* Détails */}
                        <td style={{ padding: '1rem 1.25rem', maxWidth: '200px' }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {getDetails(req)}
                          </p>
                          {req.payload?.motif && (
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              "{req.payload.motif}"
                            </p>
                          )}
                        </td>

                        {/* Statut */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.3rem 0.75rem', borderRadius: '20px',
                            background: statusCfg.bg, color: statusCfg.color,
                            fontSize: '0.75rem', fontWeight: 700,
                            border: `1px solid ${statusCfg.color}30`,
                          }}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <div>{format(new Date(req.createdAt), 'dd MMM yyyy', { locale: fr })}</div>
                          <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                            {formatDistanceToNow(new Date(req.createdAt), { locale: fr, addSuffix: true })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          {req.status === 'EN_ATTENTE' && (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <motion.button
                                whileHover={{ scale: 1.15, background: 'rgba(16,185,129,0.25)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateStatus(req._id, 'APPROUVE', req.type)}
                                disabled={isUpdating}
                                title="Approuver"
                                style={{
                                  width: 36, height: 36, borderRadius: '10px', border: 'none',
                                  background: 'rgba(16,185,129,0.12)', color: '#10B981',
                                  cursor: isUpdating ? 'wait' : 'pointer', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  transition: 'opacity 0.2s', opacity: isUpdating ? 0.5 : 1,
                                }}
                              >
                                {isUpdating ? '⏳' : <Check size={16} />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, background: 'rgba(239,68,68,0.25)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateStatus(req._id, 'REFUSE', req.type)}
                                disabled={isUpdating}
                                title="Refuser"
                                style={{
                                  width: 36, height: 36, borderRadius: '10px', border: 'none',
                                  background: 'rgba(239,68,68,0.12)', color: '#EF4444',
                                  cursor: isUpdating ? 'wait' : 'pointer', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  transition: 'opacity 0.2s', opacity: isUpdating ? 0.5 : 1,
                                }}
                              >
                                <X size={16} />
                              </motion.button>
                            </div>
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Requests;
