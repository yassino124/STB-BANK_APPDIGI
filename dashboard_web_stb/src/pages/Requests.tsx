import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Check, X, RefreshCw, Clock, AlertCircle, CheckCircle, XCircle, Sparkles, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface RequestEntry {
  _id: string;
  employeeId: { _id: string; nom: string; prenom: string; matricule: string; avatar?: string };
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
  NAISSANCE: 'Congé Naissance',
  DECES: 'Congé Décès',
  PELERINAGE: 'Congé Pèlerinage',
  SANS_SOLDE: 'Congé Sans Solde',
  // Absences
  ABSENCE: 'Absence',
  RETARD: 'Retard',
  DELEGATION: 'Délégation',
  MISSION: 'Mission',
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
  NAISSANCE: '👶', DECES: '🕊️', PELERINAGE: '🕌', SANS_SOLDE: '💸',
  ABSENCE: '📋', RETARD: '⏰', DELEGATION: '🔄', MISSION: '✈️',
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

const Requests = ({ typeFilter }: { typeFilter?: string }) => {
  const { isManager, isFinance, isRH } = useAuth();
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('EN_ATTENTE');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CONGE' | 'ABSENCE'>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newCount, setNewCount] = useState(0);

  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, any>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  const analyzeRequest = async (req: RequestEntry) => {
    if (expandedReq === req._id) {
      setExpandedReq(null);
      return;
    }
    setExpandedReq(req._id);
    
    if (aiAnalysis[req._id]) return; // Already analyzed

    setAiLoading(prev => ({ ...prev, [req._id]: true }));
    try {
      const type = ['CREDIT', 'PRÊT'].some(t => req.type.toUpperCase().includes(t)) ? 'CREDIT' : 'LEAVE';
      
      const { data } = await api.post('/ai/approval-summary', { 
        type, 
        contextData: {
          employeeId: req.employeeId?._id || req.employeeId,
          employeeName: req.employeeId ? `${req.employeeId.prenom} ${req.employeeId.nom}` : 'Inconnu',
          leaveType: req.type,
          status: req.status,
          date: req.createdAt,
          // We pass whatever we have on the request, backend could fetch more if needed
        } 
      });
      
      if (data) {
        setAiAnalysis(prev => ({ ...prev, [req._id]: data }));
      } else {
        throw new Error("No data returned from AI");
      }
    } catch (error) {
      toast.error("Erreur lors de l'analyse IA");
    } finally {
      setAiLoading(prev => ({ ...prev, [req._id]: false }));
    }
  };

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let merged: RequestEntry[] = [];

      if (isManager && !isRH && !isFinance) {
        // Manager: fetch congés en attente de son équipe + absences
        const [congesRes, absencesRes] = await Promise.all([
          api.get('/leave/my-team').catch(() => ({ data: { data: [] } })),
          api.get('/absences/my-team').catch(() => ({ data: [] })),
        ]);

        console.log('🔍 Manager Leaves Response:', congesRes);
        console.log('🔍 Manager Absences Response:', absencesRes);

        // Map leave statuses: PENDING_MANAGER/PENDING_RH → EN_ATTENTE, APPROVED → APPROUVE, REJECTED → REFUSE
        const congesData = (congesRes.data.data || congesRes.data || []).map((c: any) => {
          const dbStatus = c.status || c.statut;
          let mappedStatus = 'EN_ATTENTE';
          if (dbStatus === 'APPROVED') mappedStatus = 'APPROUVE';
          else if (dbStatus === 'REJECTED') mappedStatus = 'REFUSE';
          else if (dbStatus === 'CANCELLED') mappedStatus = 'ANNULE';
          else if (dbStatus === 'PENDING_MANAGER' || dbStatus === 'PENDING_RH') mappedStatus = 'EN_ATTENTE';
          
          return {
            _id: c._id,
            employeeId: c.employeeId,
            type: c.type || 'CONGE',
            status: mappedStatus,
            startDate: c.dateDebut || c.startDate,
            endDate: c.dateFin || c.endDate,
            motif: c.motif,
            createdAt: c.createdAt,
            payload: { startDate: c.dateDebut || c.startDate, endDate: c.dateFin || c.endDate, motif: c.motif, type: c.type, dbStatus },
          };
        });

        const absencesData = (absencesRes.data.data || absencesRes.data || []).map((a: any) => {
          const dbStatus = a.status;
          let mappedStatus = 'EN_ATTENTE';
          if (dbStatus === 'APPROVED') mappedStatus = 'APPROUVE';
          else if (dbStatus === 'REJECTED') mappedStatus = 'REFUSE';
          else if (dbStatus === 'CANCELLED') mappedStatus = 'ANNULE';
          // PENDING_N1 and APPROVED_N1 both show as EN_ATTENTE for manager
          return {
            _id: a._id,
            employeeId: a.employeeId,
            type: a.type || 'ABSENCE',
            status: mappedStatus,
            startDate: a.dateDebut,
            endDate: a.dateFin,
            motif: a.motif,
            createdAt: a.createdAt,
            payload: { startDate: a.dateDebut, endDate: a.dateFin, nombreHeures: a.nombreHeures, motif: a.motif, type: a.type, dbStatus },
          };
        });

        merged = [...congesData, ...absencesData];
      } else if (isRH) {
        // RH: fetch ALL pending requests (congés, avances, primes, credits, absences)
        // Note: Leave status uses PENDING_MANAGER/PENDING_RH in DB, not EN_ATTENTE
        const [congesRes, avancesRes, primesRes, creditsRes, absencesRes] = await Promise.all([
          api.get('/leave/all').catch(() => ({ data: { data: [] } })), // Fetch ALL, filter client-side
          api.get('/avances').catch(() => ({ data: { data: [] } })),
          api.get('/primes/all').catch(() => ({ data: [] })),
          api.get('/credits/all').catch(() => ({ data: [] })),
          api.get('/absences/all').catch(() => ({ data: [] })),
        ]);

        console.log('🔍 RH Leaves Response:', congesRes);
        console.log('🔍 RH Avances Response:', avancesRes);

        // Map leave statuses: PENDING_MANAGER/PENDING_RH → EN_ATTENTE, APPROVED → APPROUVE, REJECTED → REFUSE
        const congesData = (congesRes.data.data || congesRes.data || []).map((c: any) => {
          const dbStatus = c.status || c.statut;
          let mappedStatus = 'EN_ATTENTE';
          if (dbStatus === 'APPROVED') mappedStatus = 'APPROUVE';
          else if (dbStatus === 'REJECTED') mappedStatus = 'REFUSE';
          else if (dbStatus === 'CANCELLED') mappedStatus = 'ANNULE';
          else if (dbStatus === 'PENDING_MANAGER' || dbStatus === 'PENDING_RH') mappedStatus = 'EN_ATTENTE';
          
          return {
            _id: c._id,
            employeeId: c.employeeId,
            type: c.type || 'CONGE',
            status: mappedStatus,
            startDate: c.dateDebut || c.startDate,
            endDate: c.dateFin || c.endDate,
            motif: c.motif,
            createdAt: c.createdAt,
            payload: { startDate: c.dateDebut || c.startDate, endDate: c.dateFin || c.endDate, motif: c.motif, type: c.type, dbStatus },
          };
        });

        // Absences: APPROVED_N1 = waiting for RH → show as EN_ATTENTE for RH
        const absencesData = (absencesRes.data.data || absencesRes.data || []).map((a: any) => {
          const dbStatus = a.status;
          let mappedStatus = 'EN_ATTENTE';
          if (dbStatus === 'APPROVED') mappedStatus = 'APPROUVE';
          else if (dbStatus === 'REJECTED') mappedStatus = 'REFUSE';
          else if (dbStatus === 'CANCELLED') mappedStatus = 'ANNULE';
          else if (dbStatus === 'PENDING_N1') mappedStatus = 'EN_ATTENTE'; // Still with manager
          else if (dbStatus === 'APPROVED_N1') mappedStatus = 'EN_ATTENTE'; // Arrived at RH
          return {
            _id: a._id,
            employeeId: a.employeeId,
            type: a.type || 'ABSENCE',
            status: mappedStatus,
            startDate: a.dateDebut,
            endDate: a.dateFin,
            motif: a.motif,
            createdAt: a.createdAt,
            payload: { startDate: a.dateDebut, endDate: a.dateFin, nombreHeures: a.nombreHeures, motif: a.motif, type: a.type, dbStatus },
          };
        });

        const avancesData = (avancesRes.data.data || avancesRes.data || []).map((a: any) => ({
          _id: a._id,
          employeeId: a.employee || a.employeeId,
          type: a.type || 'AVANCE',
          status: a.statut || a.status,
          amount: a.montant,
          motif: a.motif,
          createdAt: a.createdAt,
          payload: { amount: a.montant, motif: a.motif, type: a.type },
        }));

        const primesData = (primesRes.data.data || primesRes.data || []).map((p: any) => ({
          _id: p._id,
          employeeId: p.employeeId,
          type: p.type || 'PERFORMANCE',
          status: p.status === 'PENDING' ? 'EN_ATTENTE' : (p.status === 'APPROVED' ? 'APPROUVE' : 'REFUSE'),
          amount: p.montant,
          motif: p.description,
          createdAt: p.createdAt,
          payload: { amount: p.montant, motif: p.description, type: p.type },
        }));

        const creditsData = (creditsRes.data.data || creditsRes.data || []).map((c: any) => ({
          _id: c._id,
          employeeId: c.employeeId || c.employee,
          type: 'CREDIT',
          status: c.statut || (c.isApproved ? 'APPROUVE' : (c.isRejected ? 'REFUSE' : 'EN_ATTENTE')),
          amount: c.montantInitial || c.montant,
          createdAt: c.createdAt,
          payload: { amount: c.montantInitial || c.montant, aiScore: c.aiScore || c.score },
        }));

        merged = [...congesData, ...absencesData, ...avancesData, ...primesData, ...creditsData];
        
        console.log('🔍 RH Total Merged Requests:', merged.length, 'By Status:', {
          pending: merged.filter(r => r.status === 'EN_ATTENTE').length,
          approved: merged.filter(r => r.status === 'APPROUVE').length,
          rejected: merged.filter(r => r.status === 'REFUSE').length,
        });

      } else if (isFinance) {
        // Finance: fetch avances, primes, credits uniquement
        const [avancesRes, primesRes, creditsRes] = await Promise.all([
          api.get('/avances').catch(() => ({ data: { data: [] } })),
          api.get('/primes/all').catch(() => ({ data: [] })),
          api.get('/credits/all').catch(() => ({ data: [] }))
        ]);

        const avancesData = (avancesRes.data.data || avancesRes.data || []).map((a: any) => ({
          _id: a._id,
          employeeId: a.employee || a.employeeId,
          type: a.type || 'AVANCE',
          status: a.statut || a.status,
          amount: a.montant,
          motif: a.motif,
          createdAt: a.createdAt,
          payload: { amount: a.montant, motif: a.motif, type: a.type },
        }));

        const primesData = (primesRes.data.data || primesRes.data || []).map((p: any) => ({
          _id: p._id,
          employeeId: p.employeeId,
          type: p.type || 'PERFORMANCE',
          status: p.status === 'PENDING' ? 'EN_ATTENTE' : (p.status === 'APPROVED' ? 'APPROUVE' : 'REFUSE'),
          amount: p.montant,
          motif: p.description,
          createdAt: p.createdAt,
          payload: { amount: p.montant, motif: p.description, type: p.type },
        }));

        const creditsData = (creditsRes.data.data || creditsRes.data || []).map((c: any) => ({
          _id: c._id,
          employeeId: c.employeeId || c.employee,
          type: 'CREDIT',
          status: c.statut || (c.isApproved ? 'APPROUVE' : (c.isRejected ? 'REFUSE' : 'EN_ATTENTE')),
          amount: c.montantInitial || c.montant,
          createdAt: c.createdAt,
          payload: { amount: c.montantInitial || c.montant, aiScore: c.aiScore || c.score },
        }));

        merged = [...avancesData, ...primesData, ...creditsData];
      }

      if (typeFilter) {
        merged = merged.filter(r => {
          const t = r.type.toUpperCase();
          if (typeFilter === 'CREDIT') return t === 'CREDIT';
          if (typeFilter === 'AVANCE') return ['AVANCE', 'SALAIRE', 'PRIME', 'PRIME_AID'].includes(t);
          return t === typeFilter;
        });
      }

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
      const t = (type || '').toUpperCase();
      const isConge = ['CONGE', 'LEAVE', 'REPOS', 'MALADIE', 'MARIAGE', 'NAISSANCE', 'DECES', 'PELERINAGE', 'SANS_SOLDE'].includes(t);
      const isAbsence = ['ABSENCE', 'RETARD', 'DELEGATION', 'MISSION'].includes(t);
      const isAvance = ['AVANCE', 'ADVANCE', 'SALAIRE', 'PRIME', 'PRIME_AID'].includes(t);
      const isPrime = ['PERFORMANCE', 'AID'].includes(t);

      if (isManager && !isRH && isConge) {
        // Manager (NOT RH) approves leave via dedicated endpoint
        if (status === 'APPROUVE') {
          await api.post(`/leave/${id}/manager-approve`);
        } else {
          await api.post(`/leave/${id}/manager-reject`, { reason: 'Refusé par le manager' });
        }
      } else if (isRH && isConge) {
        // RH approves leave via RH endpoint
        const decision = status === 'APPROUVE' ? 'APPROVED' : 'REJECTED';
        await api.patch(`/leave/${id}/handle-rh`, { decision, commentaire: status === 'APPROUVE' ? 'Approuvé par RH' : 'Refusé par RH' });
      } else if (isRH && isAbsence) {
        // RH approves absence via RH endpoint
        const decision = status === 'APPROUVE' ? 'APPROVED' : 'REJECTED';
        await api.patch(`/absences/${id}/handle-rh`, { decision, commentaire: status === 'APPROUVE' ? 'Approuvé par RH' : 'Refusé par RH' });
      } else if (isManager && !isRH && isAbsence) {
        await api.patch(`/absences/${id}/handle-manager`, { decision: status === 'APPROUVE' ? 'APPROVED' : 'REJECTED' });
      } else if (isAvance) {
        await api.patch(`/avances/${id}/status`, { statut: status });
      } else if (isPrime) {
        const decision = status === 'APPROUVE' ? 'APPROVED' : 'REJECTED';
        await api.patch(`/primes/${id}/handle`, { decision });
      } else if (t === 'CREDIT') {
        const decision = status === 'APPROUVE' ? 'APPROVED' : 'REJECTED';
        await api.patch(`/credits/${id}/decision`, { decision });
      } else if (isConge) {
        // RH approves
        await api.patch(`/leave/${id}/status`, { statut: status });
      } else {
        await api.patch(`/requests/${id}/status`, { status });
      }

      toast.success(
        status === 'APPROUVE'
          ? '✅ Demande approuvée — le collaborateur sera notifié'
          : '❌ Demande refusée',
        { duration: 4000 }
      );
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error('Erreur de mise à jour');
      fetchRequests();
    } finally {
      setUpdating(null);
    }
  };

  const ABSENCE_TYPES = ['ABSENCE', 'RETARD', 'DELEGATION', 'MISSION'];
  const CONGE_TYPES = ['CONGE', 'LEAVE', 'REPOS', 'MALADIE', 'MARIAGE', 'NAISSANCE', 'DECES', 'PELERINAGE', 'SANS_SOLDE'];

  const filteredRequests = requests.filter(r => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    if (categoryFilter === 'CONGE') return CONGE_TYPES.includes(r.type.toUpperCase());
    if (categoryFilter === 'ABSENCE') return ABSENCE_TYPES.includes(r.type.toUpperCase());
    return true;
  });
  const pendingCount = requests.filter(r => r.status === 'EN_ATTENTE').length;
  const pendingCongesCount = requests.filter(r => r.status === 'EN_ATTENTE' && CONGE_TYPES.includes(r.type.toUpperCase())).length;
  const pendingAbsencesCount = requests.filter(r => r.status === 'EN_ATTENTE' && ABSENCE_TYPES.includes(r.type.toUpperCase())).length;

  // Header text differs by role
  const headerTitle = isManager && !isFinance ? 'Demandes de mon équipe' : 'Contrôle des Demandes';
  const headerSub = isManager && !isFinance
    ? 'Congés et absences en attente de votre validation — temps réel'
    : 'Avances, Crédits, Primes — validation Finance en temps réel';

  const getDetails = (req: RequestEntry) => {
    const payload = req.payload || {};
    const t = req.type.toUpperCase();
    if (req.type === 'CHEQUIER') {
      return (
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Type de chéquier : </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{payload.chqType === 'CERTIFIE' ? 'Certifié' : `${payload.chqType} pages`}</span>
        </div>
      );
    }
    // Congés — show date range
    if (['CONGE', 'LEAVE', 'REPOS', 'MALADIE', 'MARIAGE', 'NAISSANCE', 'DECES', 'PELERINAGE', 'SANS_SOLDE'].includes(t)) {
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
    // Absences — show hours
    if (['ABSENCE', 'RETARD', 'DELEGATION', 'MISSION'].includes(t)) {
      const start = payload.startDate || req.startDate;
      const heures = payload.nombreHeures;
      const dateStr = start ? format(new Date(start), 'dd/MM/yy') : '';
      if (heures) return `${heures}h • ${dateStr}`;
      if (start && req.endDate) {
        return `Du ${format(new Date(start), 'dd/MM/yy')} au ${format(new Date(req.endDate), 'dd/MM/yy')}`;
      }
      return payload.motif || 'Absence';
    }
    if (['AVANCE', 'PRIME', 'CREDIT', 'PERFORMANCE', 'AID'].includes(t)) {
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
            {headerTitle}
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {headerSub}
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

      {/* Filter Tabs — Status */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
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

      {/* Filter Tabs — Category (Congés / Absences) */}
      {(isManager || isRH) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '0.25rem' }}>Catégorie :</span>
          {(['ALL', 'CONGE', 'ABSENCE'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '0.35rem 1rem', borderRadius: '8px',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                background: categoryFilter === cat ? (cat === 'CONGE' ? '#10B98120' : cat === 'ABSENCE' ? '#F59E0B20' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.04)',
                color: categoryFilter === cat ? (cat === 'CONGE' ? '#10B981' : cat === 'ABSENCE' ? '#F59E0B' : 'var(--text-primary)') : 'var(--text-muted)',
                border: categoryFilter === cat ? `1px solid ${cat === 'CONGE' ? '#10B98140' : cat === 'ABSENCE' ? '#F59E0B40' : 'rgba(255,255,255,0.12)'}` : '1px solid transparent',
              }}
            >
              {cat === 'ALL' ? `🗂️ Tout (${requests.length})` :
               cat === 'CONGE' ? `🏖️ Congés (${requests.filter(r => ['CONGE','LEAVE','REPOS','MALADIE','MARIAGE','NAISSANCE','DECES','PELERINAGE','SANS_SOLDE'].includes(r.type.toUpperCase())).length})` :
               `📋 Absences (${requests.filter(r => ['ABSENCE','RETARD','DELEGATION','MISSION'].includes(r.type.toUpperCase())).length})`}
            </button>
          ))}
        </div>
      )}

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
                      <React.Fragment key={req._id}>
                        <motion.tr
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
                              width: 40, height: 40, borderRadius: '50%',
                              background: avatarColor, display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.85rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                              overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)',
                              position: 'relative',
                            }}>
                              {req.employeeId?._id ? (
                                <img
                                  src={req.employeeId.avatar?.startsWith('data:')
                                    ? req.employeeId.avatar
                                    : `/api/v1/employees/${req.employeeId._id}/avatar`}
                                  alt={`${req.employeeId?.prenom} ${req.employeeId?.nom}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent && !parent.querySelector('span')) {
                                      const span = document.createElement('span');
                                      span.style.cssText = 'font-size:0.85rem;font-weight:800;color:#fff';
                                      span.textContent = `${req.employeeId?.prenom?.[0] || '?'}${req.employeeId?.nom?.[0] || ''}`;
                                      parent.appendChild(span);
                                    }
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                                  {(req.employeeId?.prenom?.[0] || '?')}{(req.employeeId?.nom?.[0] || '')}
                                </span>
                              )}
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
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
                            {/* Workflow stage badge for absences */}
                            {['ABSENCE','RETARD','DELEGATION','MISSION'].includes(req.type.toUpperCase()) && req.status === 'EN_ATTENTE' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600,
                                background: req.payload?.dbStatus === 'APPROVED_N1' ? 'rgba(41,98,255,0.12)' : 'rgba(245,158,11,0.12)',
                                color: req.payload?.dbStatus === 'APPROVED_N1' ? '#2962FF' : '#F59E0B',
                                border: `1px solid ${req.payload?.dbStatus === 'APPROVED_N1' ? 'rgba(41,98,255,0.3)' : 'rgba(245,158,11,0.3)'}`,
                              }}>
                                {req.payload?.dbStatus === 'APPROVED_N1' ? '✅ Managers validés • Attente RH' : '⏳ En attente des managers'}
                              </span>
                            )}
                            {/* Workflow stage badge for congés */}
                            {['CONGE','LEAVE','REPOS','MALADIE','MARIAGE','NAISSANCE','DECES','PELERINAGE','SANS_SOLDE'].includes(req.type.toUpperCase()) && req.status === 'EN_ATTENTE' && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600,
                                background: req.payload?.dbStatus === 'PENDING_RH' ? 'rgba(41,98,255,0.12)' : 'rgba(245,158,11,0.12)',
                                color: req.payload?.dbStatus === 'PENDING_RH' ? '#2962FF' : '#F59E0B',
                                border: `1px solid ${req.payload?.dbStatus === 'PENDING_RH' ? 'rgba(41,98,255,0.3)' : 'rgba(245,158,11,0.3)'}`,
                              }}>
                                {req.payload?.dbStatus === 'PENDING_RH' ? '✅ Managers validés • Attente RH' : '⏳ En attente des managers'}
                              </span>
                            )}
                          </div>
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
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => analyzeRequest(req)}
                              title="Analyse IA (STB Copilot)"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.4rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(41,98,255,0.3)',
                                background: expandedReq === req._id ? 'var(--stb-blue-600)' : 'rgba(41,98,255,0.1)', color: expandedReq === req._id ? '#fff' : 'var(--stb-electric)',
                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                              }}
                            >
                              <Sparkles size={14} /> {expandedReq === req._id ? 'Fermer' : 'Analyse IA'}
                            </button>
                            
                            {req.status === 'EN_ATTENTE' && (
                            (() => {
                              const t = req.type.toUpperCase();
                              const isAbsenceType = ['ABSENCE', 'RETARD', 'DELEGATION', 'MISSION'].includes(t);
                              const isCongeType = ['CONGE', 'LEAVE', 'REPOS', 'MALADIE', 'MARIAGE', 'NAISSANCE', 'DECES', 'PELERINAGE', 'SANS_SOLDE'].includes(t);
                              const isAbsenceWaitingManagers = isAbsenceType && req.payload?.dbStatus === 'PENDING_N1';
                              const isAbsenceReadyForRH = isAbsenceType && req.payload?.dbStatus === 'APPROVED_N1';
                              const isCongeWaitingManagers = isCongeType && req.payload?.dbStatus === 'PENDING_MANAGER';
                              const isCongeReadyForRH = isCongeType && req.payload?.dbStatus === 'PENDING_RH';

                              // RH cannot approve absence still at manager level
                              if (isRH && isAbsenceWaitingManagers) return null;
                              if (isRH && isCongeWaitingManagers) return null;

                              let canApprove = false;
                              if ((isCongeType || isAbsenceType) && isManager && !isRH) canApprove = true;
                              if (isRH && isCongeReadyForRH) canApprove = true;
                              if (isRH && isAbsenceReadyForRH) canApprove = true;
                              if (['AVANCE', 'ADVANCE', 'SALAIRE', 'PRIME', 'PRIME_AID', 'PERFORMANCE', 'AID', 'CREDIT'].includes(t) && isFinance) canApprove = true;

                              if (!canApprove) return null;
                                
                                return (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.15, background: 'rgba(16,185,129,0.25)' }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => updateStatus(req._id, 'APPROUVE', req.type)}
                                      disabled={isUpdating}
                                      title="Approuver"
                                      style={{
                                        width: 32, height: 32, borderRadius: '8px', border: 'none',
                                        background: 'rgba(16,185,129,0.12)', color: '#10B981',
                                        cursor: isUpdating ? 'wait' : 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
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
                                        width: 32, height: 32, borderRadius: '8px', border: 'none',
                                        background: 'rgba(239,68,68,0.12)', color: '#EF4444',
                                        cursor: isUpdating ? 'wait' : 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                      }}
                                    >
                                      <X size={16} />
                                    </motion.button>
                                  </>
                                );
                              })()
                            )}
                          </div>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded AI Analysis Row */}
                      <AnimatePresence>
                        {expandedReq === req._id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden', background: 'rgba(41,98,255,0.03)' }}
                          >
                            <td colSpan={6} style={{ padding: 0 }}>
                              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                                  <div style={{ padding: '1rem', background: 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-electric))', borderRadius: '16px', boxShadow: '0 8px 20px rgba(41,98,255,0.3)' }}>
                                    <BrainCircuit size={28} color="#fff" />
                                  </div>
                                  
                                  {aiLoading[req._id] ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, color: 'var(--stb-blue-300)', fontWeight: 600 }}>
                                      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> STB Copilot analyse la demande...
                                    </div>
                                  ) : aiAnalysis[req._id] ? (
                                    <div style={{ flex: 1 }}>
                                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Recommandation IA (Decision Support)
                                      </h4>
                                      <p style={{ margin: '0 0 1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        {aiAnalysis[req._id].summary}
                                      </p>
                                      
                                      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        {aiAnalysis[req._id].metrics.map((m: any, i: number) => (
                                          <div key={i} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{m.label}</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.status === 'success' ? '#10B981' : m.status === 'warning' ? '#F59E0B' : '#EF4444' }}>{m.value}</div>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: aiAnalysis[req._id].recommendation === 'APPROVE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '12px', border: aiAnalysis[req._id].recommendation === 'APPROVE' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                                        <div style={{ padding: '0.5rem', background: aiAnalysis[req._id].recommendation === 'APPROVE' ? '#10B981' : '#EF4444', borderRadius: '50%', color: '#fff' }}>
                                          {aiAnalysis[req._id].recommendation === 'APPROVE' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: aiAnalysis[req._id].recommendation === 'APPROVE' ? '#10B981' : '#EF4444' }}>
                                            Verdict: {aiAnalysis[req._id].recommendation === 'APPROVE' ? 'Approbation recommandée' : 'Refus recommandé'} (Risque {aiAnalysis[req._id].riskLevel})
                                          </div>
                                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{aiAnalysis[req._id].reason}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                      </React.Fragment>
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
