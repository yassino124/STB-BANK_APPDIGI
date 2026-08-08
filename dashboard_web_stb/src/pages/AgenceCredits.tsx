import { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, XCircle, ArrowRight, Wallet, FileText, RefreshCw, AlertTriangle, X, Calendar, DollarSign, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Credit {
  _id: string;
  employeeId: { matricule: string; nom: string; prenom: string; poste: string };
  title: string;
  type: string;
  montantInitial: number;
  montantRestant: number;
  mensualite: number;
  tauxInteret: number;
  dateDebut: string;
  dateFin: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, any> = {
  ACTIVE: { bg: 'rgba(16,185,129,0.15)', text: '#10B981', border: 'rgba(16,185,129,0.3)' },
  LATE: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', border: 'rgba(239,68,68,0.3)' },
  CLOSED: { bg: 'rgba(100,116,139,0.15)', text: '#64748B', border: 'rgba(100,116,139,0.3)' },
  PENDING: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Actif',
  LATE: 'En retard',
  CLOSED: 'Clôturé',
  PENDING: 'En attente',
};

const CreditsPage = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'LATE' | 'CLOSED' | 'PENDING'>('ALL');
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [amortization, setAmortization] = useState<any[]>([]);
  const [loadingAmortization, setLoadingAmortization] = useState(false);

  const filteredCredits = credits.filter(c => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const stats = {
    active: credits.filter(c => c.status === 'ACTIVE').length,
    late: credits.filter(c => c.status === 'LATE').length,
    montantRestantTotal: credits.filter(c => c.status === 'ACTIVE' || c.status === 'LATE').reduce((sum, c) => sum + (c.montantRestant || 0), 0),
    mensualitesTotal: credits.filter(c => c.status === 'ACTIVE' || c.status === 'LATE').reduce((sum, c) => sum + (c.mensualite || 0), 0),
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/credits/all').catch(() => null);
      setCredits(res?.data?.data || res?.data || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCredit) {
      setLoadingAmortization(true);
      api.get(`/credits/${selectedCredit._id}/amortization-table`)
        .then(res => setAmortization(res.data?.tableau || res.data?.data || []))
        .catch(err => {
          console.error('Erreur chargement amortization:', err);
          setAmortization([]);
        })
        .finally(() => setLoadingAmortization(false));
    } else {
      setAmortization([]);
    }
  }, [selectedCredit]);

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/credits/${id}/decision`, { decision });
      toast.success(`Demande ${decision === 'APPROVED' ? 'approuvée' : 'refusée'}`);
      setCredits(credits.map(c => c._id === id ? { ...c, status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED' } : c));
    } catch {
      toast.error('Erreur lors du traitement');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Suivi des Crédits
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gestion et suivi des remboursements de crédits collaborateurs
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
          { label: 'Crédits Actifs', value: stats.active, color: '#10B981', urgent: false },
          { label: 'En Retard', value: stats.late, color: '#EF4444', urgent: stats.late > 0 },
          { label: 'Montant Restant', value: `${(stats.montantRestantTotal / 1000).toFixed(1)}K`, color: '#2962FF', urgent: false },
          { label: 'Mensualités', value: `${(stats.mensualitesTotal / 1000).toFixed(1)}K`, color: '#F59E0B', urgent: false },
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
              minWidth: '130px',
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
        {(['ACTIVE', 'LATE', 'CLOSED', 'PENDING', 'ALL'] as const).map(f => (
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
            {f === 'ACTIVE' ? `✅ Actifs (${stats.active})` :
             f === 'LATE' ? `⚠️ En retard${stats.late > 0 ? ` (${stats.late})` : ''}` :
             f === 'CLOSED'   ? '🔒 Clôturés' :
             f === 'PENDING' ? '⏳ En attente' : '📋 Tous'}
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
        {filteredCredits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Wallet size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600 }}>Aucun crédit {filter === 'ACTIVE' ? 'actif' : filter === 'LATE' ? 'en retard' : filter === 'CLOSED' ? 'clôturé' : ''}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Collaborateur', 'Détails Crédit', 'Progression', 'Mensualité', 'Statut', 'Actions'].map((h, i) => (
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
                  {filteredCredits.map((credit, idx) => {
                    const avatarColor = 'var(--stb-blue)';
                    const progress = credit.montantInitial > 0 ? ((credit.montantInitial - credit.montantRestant) / credit.montantInitial) * 100 : 0;

                    return (
                      <motion.tr
                        key={credit._id}
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
                              {(credit.employeeId?.prenom?.[0] || '?')}{(credit.employeeId?.nom?.[0] || '')}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                {credit.employeeId?.nom} {credit.employeeId?.prenom}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {credit.employeeId?.matricule} • {credit.employeeId?.poste}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Détails Crédit */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {credit.title || 'Crédit STB'}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                              {credit.type || 'PERSONNEL'}
                            </span>
                            <span>Taux: {credit.tauxInteret ?? 0}%</span>
                          </p>
                        </td>

                        {/* Progression */}
                        <td style={{ padding: '1rem 1.25rem', minWidth: '180px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Remboursé</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, progress))}%`, background: credit.status === 'LATE' ? '#EF4444' : '#10B981', borderRadius: '3px' }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Reste: <span style={{color: 'var(--text-primary)', fontWeight: 600}}>{credit.montantRestant?.toLocaleString('fr-TN')} TND</span></span>
                            <span>/ {credit.montantInitial?.toLocaleString('fr-TN')} TND</span>
                          </div>
                        </td>

                        {/* Mensualité */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {credit.mensualite?.toLocaleString('fr-TN')} TND
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                            / mois
                          </span>
                        </td>

                        {/* Statut */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                            background: statusColors[credit.status]?.bg || 'rgba(255,255,255,0.1)',
                            border: `1px solid ${statusColors[credit.status]?.border || 'rgba(255,255,255,0.2)'}`,
                            color: statusColors[credit.status]?.text || '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                          }}>
                            {credit.status === 'LATE' && <AlertTriangle size={12} />}
                            {credit.status === 'ACTIVE' && <CheckCircle size={12} />}
                            {credit.status === 'CLOSED' && <CheckCircle size={12} />}
                            {credit.status === 'PENDING' && <Clock size={12} />}
                            {statusLabels[credit.status] || credit.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button onClick={() => setSelectedCredit(credit)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                              background: 'transparent', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            Détails <ArrowRight size={12} />
                          </button>
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

      {/* MODAL DÉTAILS CRÉDIT */}
      <AnimatePresence>
        {selectedCredit && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedCredit(null)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 998
              }}
            />
            {/* Outer fixed wrapper: centers the modal with flexbox, no manual transform needed */}
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem',
              pointerEvents: 'none' // clicks pass through to the backdrop except on the card itself
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{
                  width: '100%',
                  maxWidth: '950px',
                  maxHeight: '85vh',
                  background: '#12121A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden', // clips everything to the rounded corners
                  pointerEvents: 'auto'
                }}
              >
              {/* Header + stat cards: fixed, doesn't scroll */}
              <div style={{ padding: '2rem 2rem 1rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Détails du Crédit</h2>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>{selectedCredit.employeeId?.prenom} {selectedCredit.employeeId?.nom} - {selectedCredit.employeeId?.matricule}</p>
                  </div>
                  <button onClick={() => setSelectedCredit(null)} style={{
                    background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff',
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(41,98,255,0.1)', border: '1px solid rgba(41,98,255,0.2)', padding: '0.85rem 1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#2962FF' }}>
                      <DollarSign size={15} /> <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Montant Initial</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{selectedCredit.montantInitial?.toLocaleString('fr-TN')} TND</div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.85rem 1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#10B981' }}>
                      <Wallet size={15} /> <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Reste à Payer</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{selectedCredit.montantRestant?.toLocaleString('fr-TN')} TND</div>
                  </div>
                  <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '0.85rem 1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#8B5CF6' }}>
                      <Calendar size={15} /> <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Mensualité</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{selectedCredit.mensualite?.toLocaleString('fr-TN')} TND</div>
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.85rem 1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#F59E0B' }}>
                      <Percent size={15} /> <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Taux d'Intérêt</span>
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{selectedCredit.tauxInteret}%</div>
                  </div>
                </div>
              </div>

              {/* Body: only this part scrolls, both directions handled cleanly and clipped by the parent's overflow:hidden */}
              <div style={{ padding: '0 2rem 2rem', overflowY: 'auto', overflowX: 'hidden' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: '0.5rem 0 1rem' }}>Tableau d'Amortissement</h3>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                  {loadingAmortization ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement de l'échéancier...</div>
                  ) : amortization.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun échéancier disponible.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            {['N°', 'Mois', 'Mensualité', 'Capital', 'Intérêts', 'Reste', 'Statut'].map(h => (
                              <th key={h} style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {amortization.map((a, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '0.75rem 1rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.mois}</td>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(a.dateEcheance || a.date).toLocaleDateString('fr-TN', { month: 'short', year: 'numeric' })}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.mensualite?.toLocaleString('fr-TN')}</td>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{(a.capital || a.partieCapital)?.toLocaleString('fr-TN')}</td>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{(a.interets || a.partieInteret)?.toLocaleString('fr-TN')}</td>
                              <td style={{ padding: '0.75rem 1rem', color: '#fff', whiteSpace: 'nowrap' }}>{(a.soldeRestant || a.capitalRestant)?.toLocaleString('fr-TN')}</td>
                              <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                                  background: (a.isPaid || a.estPaye) ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: (a.isPaid || a.estPaye) ? '#10B981' : '#F59E0B'
                                }}>
                                  {(a.isPaid || a.estPaye) ? 'Payé' : 'En attente'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreditsPage;