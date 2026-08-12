import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, AlertTriangle, X, Send,
  Bot, User as UserIcon, CheckCircle, XCircle, ChevronRight,
  BarChart2, Shield, Banknote, FileText, Calendar, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';


// ── Types ──────────────────────────────────────────────────────────────────
interface PendingAction {
  type: string;
  label: string;
  payload: Record<string, unknown>;
  humanSummary: string;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  data?: { label: string; value: string; badge?: string }[];
  timestamp: Date;
}

// ── Rolling insights ────────────────────────────────────────────────────────
const INSIGHTS = [
  { type: 'positive', icon: <TrendingUp size={15} />, text: 'Masse salariale stable (+0.5% vs mois précédent).' },
  { type: 'warning',  icon: <AlertTriangle size={15} />, text: '12 demandes de congés nécessitent votre attention avant vendredi.' },
  { type: 'neutral',  icon: <Sparkles size={15} />, text: 'Générez le rapport de clôture RH en un clic.' },
];

// ── Role metadata ───────────────────────────────────────────────────────────
const ROLE_META: Record<string, { label: string; color: string; gradient: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: '#F59E0B', gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
  ADMIN:       { label: 'Admin',       color: '#EF4444', gradient: 'linear-gradient(135deg,#EF4444,#B91C1C)' },
  IT:          { label: 'IT',          color: '#0EA5E9', gradient: 'linear-gradient(135deg,#0EA5E9,#6366F1)' },
  RH:          { label: 'RH',          color: '#10B981', gradient: 'linear-gradient(135deg,#10B981,#059669)' },
  AGENCE:      { label: 'Agence',      color: '#0288D1', gradient: 'linear-gradient(135deg,#0288D1,#0369A1)' },
  FINANCE:     { label: 'Finance',     color: '#8B5CF6', gradient: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' },
  MANAGER:     { label: 'Manager',     color: '#7C3AED', gradient: 'linear-gradient(135deg,#7C3AED,#5B21B6)' },
};

// ── Quick actions per role ──────────────────────────────────────────────────
const QUICK_ACTIONS: Record<string, { icon: React.ReactNode; label: string; message: string }[]> = {
  RH: [
    { icon: <FileText size={13} />,  label: 'Congés en attente',     message: 'Montre-moi les demandes de congé en attente' },
    { icon: <BarChart2 size={13} />, label: 'Masse salariale',        message: 'Génère le rapport de masse salariale ce mois' },
    { icon: <Calendar size={13} />,  label: 'Absences du jour',       message: "Quelles absences sont enregistrées aujourd'hui ?" },
  ],
  FINANCE: [
    { icon: <Banknote size={13} />,  label: 'Liste des primes',       message: 'Donne-moi la liste des primes du mois' },
    { icon: <TrendingUp size={13} />,label: 'Crédits en cours',       message: 'Quels crédits collaborateurs sont en cours ?' },
    { icon: <FileText size={13} />,  label: 'Avances impayées',       message: 'Quelles avances sur salaire sont impayées ?' },
  ],
  AGENCE: [
    { icon: <Banknote size={13} />,  label: 'Comptes actifs',         message: 'Combien de comptes bancaires sont actifs ?' },
    { icon: <Shield size={13} />,    label: 'Alertes sécurité',       message: "Y a-t-il des alertes de sécurité récentes ?" },
    { icon: <TrendingUp size={13} />,label: 'Crédits agence',         message: 'Montre-moi les dossiers de crédit en cours' },
  ],
  ADMIN: [
    { icon: <Shield size={13} />,    label: 'Alertes fraude',         message: "Y a-t-il des alertes de fraude actives ?" },
    { icon: <BarChart2 size={13} />, label: 'Résumé global',          message: 'Génère un résumé du tableau de bord global' },
    { icon: <FileText size={13} />,  label: "Audit d'aujourd'hui",    message: "Quels événements d'audit ont eu lieu aujourd'hui ?" },
  ],
  DEFAULT: [
    { icon: <Sparkles size={13} />,  label: 'Mon équipe',             message: 'Donne-moi un résumé de mon équipe' },
    { icon: <Calendar size={13} />,  label: 'Congés équipe',          message: 'Qui est en congé cette semaine dans mon équipe ?' },
    { icon: <FileText size={13} />,  label: 'Mes demandes',           message: 'Quelles sont mes demandes en cours ?' },
  ],
};

// ── Simulated bot responses ─────────────────────────────────────────────────
const BOT_REPLIES: Record<string, { text: string; data?: { label: string; value: string; badge?: string }[] }> = {
  default: { text: 'Je suis votre copilote IA STB. Posez-moi une question ou utilisez les actions rapides ci-dessus.' },
  congé: {
    text: 'Voici les demandes de congé en attente de validation :',
    data: [
      { label: 'Ahmed Ben Ali',    value: '5 jours — 15 au 19 Août 2026',  badge: 'En attente' },
      { label: 'Sonia Trabelsi',   value: '3 jours — 18 au 20 Août 2026',  badge: 'En attente' },
      { label: 'Yassine Ouertani', value: '10 jours — 20 au 31 Août 2026', badge: 'Urgent' },
    ],
  },
  prime: {
    text: "Voici la liste des primes du mois d'Août 2026 :",
    data: [
      { label: 'Prime Performance', value: '1 200 TND', badge: 'Validée' },
      { label: 'Prime Ancienneté',  value: '450 TND',   badge: 'Validée' },
      { label: 'Prime Astreinte',   value: '300 TND',   badge: 'En attente' },
    ],
  },
  crédit: {
    text: 'Voici les dossiers de crédit en cours :',
    data: [
      { label: 'Dossier #CR-2024-001', value: 'Montant : 25 000 TND — Taux : 7.5%', badge: 'Actif' },
      { label: 'Dossier #CR-2024-002', value: 'Montant : 12 000 TND — Taux : 6.8%', badge: 'Actif' },
      { label: 'Dossier #CR-2024-003', value: 'Montant : 50 000 TND — Taux : 8.2%', badge: 'Révision' },
    ],
  },
  fraude: {
    text: 'Alertes de fraude détectées ce mois :',
    data: [
      { label: 'Transaction suspecte #TXN-8821', value: 'Montant : 18 500 TND — IP: 192.168.1.54', badge: 'Haute' },
      { label: 'Connexion anormale #LOG-0432',   value: 'Heure : 03:42 — Localisation: Inconnue',   badge: 'Moyenne' },
    ],
  },
  absence: {
    text: "Absences enregistrées aujourd'hui :",
    data: [
      { label: 'Rami Gharbi',  value: 'Congé maladie',     badge: 'Justifiée' },
      { label: 'Amira Hamdi',  value: 'Congé annuel',      badge: 'Justifiée' },
      { label: 'Karim Msoudi', value: 'Sans justificatif', badge: 'Injustifiée' },
    ],
  },
};

function getBotReply(msg: string): typeof BOT_REPLIES[string] {
  const lower = msg.toLowerCase();
  if (lower.includes('congé') || lower.includes('demande')) return BOT_REPLIES['congé'];
  if (lower.includes('prime') || lower.includes('bonus'))   return BOT_REPLIES['prime'];
  if (lower.includes('crédit') || lower.includes('credit')) return BOT_REPLIES['crédit'];
  if (lower.includes('fraude') || lower.includes('alerte')) return BOT_REPLIES['fraude'];
  if (lower.includes('absence') || lower.includes('absent'))return BOT_REPLIES['absence'];
  return BOT_REPLIES['default'];
}

// ── Badge colors ────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  'En attente':  'rgba(245,158,11,0.15)',
  'Urgent':      'rgba(239,68,68,0.15)',
  'Validée':     'rgba(16,185,129,0.15)',
  'Actif':       'rgba(16,185,129,0.15)',
  'Révision':    'rgba(245,158,11,0.15)',
  'Justifiée':   'rgba(16,185,129,0.15)',
  'Injustifiée': 'rgba(239,68,68,0.15)',
  'Haute':       'rgba(239,68,68,0.15)',
  'Moyenne':     'rgba(245,158,11,0.15)',
};
const BADGE_TEXT: Record<string, string> = {
  'En attente':  '#F59E0B',
  'Urgent':      '#EF4444',
  'Validée':     '#10B981',
  'Actif':       '#10B981',
  'Révision':    '#F59E0B',
  'Justifiée':   '#10B981',
  'Injustifiée': '#EF4444',
  'Haute':       '#EF4444',
  'Moyenne':     '#F59E0B',
};

// ─────────────────────────────────────────────────────────────────────────────
const AIAssistantWidget: React.FC = () => {
  const { isFinance, isIT, isAdmin, isAgence, isManager, primaryRole, user } = useAuth();
  const pureIT = isIT && !isAdmin;

  const [currentInsight, setCurrentInsight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: "Bonjour ! Je suis votre copilote IA STB. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const quickActions =
    isAdmin   ? QUICK_ACTIONS.ADMIN :
    isFinance ? QUICK_ACTIONS.FINANCE :
    isAgence  ? QUICK_ACTIONS.AGENCE :
    isManager ? QUICK_ACTIONS.DEFAULT :
    QUICK_ACTIONS.RH;

  const roleMeta = ROLE_META[primaryRole] ?? ROLE_META['RH'];
  const copilotLabel = pureIT ? 'STB IT Copilot' : isFinance ? 'STB Finance Copilot' : isAgence ? 'STB Agence Copilot' : 'STB RH Copilot';

  useEffect(() => {
    const t = setInterval(() => setCurrentInsight(p => (p + 1) % INSIGHTS.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, pendingAction]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `user-${Date.now()}-${Math.random()}`, role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let replyMsg = '';
      
      // Intent 1: Create Employee
      if (/(ajouter|creer|créer|zidni)\s+.*(employé|employee|collaborateur)/i.test(text)) {
        const res = await api.post('/employees', {
          nom: 'Nouveau',
          prenom: 'Collaborateur',
          email: `nouveau.${Date.now()}@stb.com.tn`,
          cin: Math.floor(10000000 + Math.random() * 90000000).toString(),
          dateNaissance: '1990-01-01',
          phone: '+21699999999',
          departement: 'IT',
          poste: 'Agent',
          dateEmbauche: new Date().toISOString()
        });
        const emp = res.data?.employee || res.data;
        replyMsg = `✅ **Mission accomplie !** J'ai créé un nouvel employé. Son matricule officiel est **${emp.matricule}**.`;
      }
      // Intent 2: Validate Leave
      else if (/(valider|valed|approuver|accepter)\s+.*(congé|conge|leave)/i.test(text)) {
        const nameMatch = text.match(/(valider|valed|approuver|accepter)\s+.*(congé|conge|leave)\s+(de\s+|l)?([a-zA-Z0-9]+)/i);
        const targetName = nameMatch && nameMatch[4] ? nameMatch[4] : '';
        
        const leavesRes = await api.get('/leave/all');
        const leaves = leavesRes.data?.data || leavesRes.data || [];
        const targetLeave = leaves.find((l: any) => 
          l.employee?.prenom?.toLowerCase().includes(targetName.toLowerCase()) && 
          (l.status === 'PENDING' || l.status === 'PENDING_RH')
        );
        
        if (targetLeave) {
           await api.patch(`/leave/${targetLeave._id}/handle-rh`, { action: 'APPROVE' });
           replyMsg = `✅ **Action validée !** Le congé de **${targetLeave.employee.prenom} ${targetLeave.employee.nom}** a été approuvé avec succès.`;
        } else {
           replyMsg = `❌ Je n'ai trouvé aucun congé en attente pour le nom "${targetName}".`;
        }
      }
      // Intent 3: Validate Advance
      else if (/(valider|valed|approuver|accepter)\s+.*(avance|credit)/i.test(text)) {
        const nameMatch = text.match(/(valider|valed|approuver|accepter)\s+.*(avance|credit)\s+(de\s+|l)?([a-zA-Z0-9]+)/i);
        const targetName = nameMatch && nameMatch[4] ? nameMatch[4] : '';
        
        const avancesRes = await api.get('/avances');
        const avances = avancesRes.data?.data || avancesRes.data || [];
        const targetAvance = avances.find((a: any) => 
          a.employee?.prenom?.toLowerCase().includes(targetName.toLowerCase()) && 
          a.statut === 'EN_ATTENTE'
        );
        
        if (targetAvance) {
           await api.patch(`/avances/${targetAvance._id}/statut`, { statut: 'APPROUVE' });
           replyMsg = `✅ **Exécuté !** L'avance sur salaire de **${targetAvance.employee.prenom} ${targetAvance.employee.nom}** a été validée.`;
        } else {
           replyMsg = `❌ Je n'ai trouvé aucune demande d'avance en attente pour "${targetName}".`;
        }
      }
      // Default: Fallback to simulated response
      else {
        const reply = getBotReply(text);
        const botMsg: Message = { id: `bot-${Date.now()}-${Math.random()}`, role: 'bot', text: reply.text, data: reply.data, timestamp: new Date() };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // Add success response
      const botMsg: Message = { id: `bot-${Date.now()}-${Math.random()}`, role: 'bot', text: replyMsg, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      console.error("Erreur Agent:", error.response?.data || error);
      const errMsg: Message = { id: `bot-err-${Date.now()}-${Math.random()}`, role: 'bot', text: `❌ Erreur : ${error.response?.data?.message || 'Action impossible'}.`, timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const confirmAction = (confirmed: boolean) => {
    const botMsg: Message = {
      id: `bot-confirm-${Date.now()}-${Math.random()}`,
      role: 'bot',
      text: confirmed && pendingAction
        ? `✅ Action confirmée : ${pendingAction.humanSummary}. Votre demande a été soumise avec succès.`
        : '❌ Action annulée.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMsg]);
    setPendingAction(null);
  };

  return (
    <>
      {/* ── Banner widget ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(13,38,107,0.45) 0%, rgba(10,17,33,0.85) 100%)',
          backdropFilter: 'blur(22px)',
          border: '1px solid rgba(41,98,255,0.3)',
          borderRadius: 'var(--r-xl)',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.08)',
          marginBottom: '2rem',
        }}
      >
        <motion.div animate={{ rotate: 360, scale: [1,1.2,1] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: '-50%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(41,98,255,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
        <motion.div animate={{ rotate: -360, scale: [1,1.5,1] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--stb-electric), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(41,98,255,0.5)', position: 'relative' }}>
            <Sparkles size={26} color="#fff" />
            <motion.div animate={{ scale: [1,1.5,1], opacity: [0.5,0,0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)' }} />
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {copilotLabel}
            <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem', borderRadius: '99px', background: roleMeta.gradient, color: '#fff', fontWeight: 700 }}>{roleMeta.label}</span>
            <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem' }}>AI Powered</span>
          </h3>
          <div style={{ height: '22px', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div key={currentInsight} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'absolute', width: '100%' }}>
                <span style={{ color: INSIGHTS[currentInsight].type === 'positive' ? 'var(--success)' : INSIGHTS[currentInsight].type === 'warning' ? 'var(--warning)' : 'var(--stb-blue-300)', display: 'flex' }}>
                  {INSIGHTS[currentInsight].icon}
                </span>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {INSIGHTS[currentInsight].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{ padding: '0.6rem 1.4rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', background: 'linear-gradient(135deg, var(--stb-electric), var(--purple))', boxShadow: '0 4px 18px rgba(41,98,255,0.45)', transition: 'transform 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Zap size={15} /> Copilot Chat
          </button>
        </div>
      </motion.div>

      {/* ── Copilot Chat Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', background: 'rgba(6,13,26,0.6)', backdropFilter: 'blur(8px)', padding: '1.5rem' }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{ width: '100%', maxWidth: '480px', height: '680px', display: 'flex', flexDirection: 'column', background: 'rgba(14,16,30,0.97)', border: '1px solid rgba(41,98,255,0.25)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, rgba(13,38,107,0.65), rgba(124,58,237,0.3))', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--stb-electric), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(41,98,255,0.4)' }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {copilotLabel}
                    <span style={{ fontSize: '0.58rem', padding: '0.1rem 0.45rem', borderRadius: '99px', background: roleMeta.gradient, color: '#fff', fontWeight: 700 }}>{roleMeta.label}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>
                    {user?.prenom ? `Bonjour, ${user.prenom} · ` : ''}IA en ligne
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginLeft: '6px', verticalAlign: 'middle', boxShadow: '0 0 6px #10B981' }} />
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
                  <X size={16} />
                </button>
              </div>

              {/* Quick Actions */}
              <div style={{ padding: '0.65rem 1rem', display: 'flex', gap: '0.45rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {quickActions.map((qa, i) => (
                  <button key={i} onClick={() => sendMessage(qa.message)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', borderRadius: '99px', border: '1px solid rgba(41,98,255,0.25)', background: 'rgba(41,98,255,0.08)', color: 'var(--stb-blue-300)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(41,98,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(41,98,255,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(41,98,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(41,98,255,0.25)'; }}>
                    {qa.icon} {qa.label}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: msg.role === 'user' ? roleMeta.gradient : 'linear-gradient(135deg,var(--stb-electric),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      {msg.role === 'user' ? <UserIcon size={14} color="#fff" /> : <Bot size={14} color="#fff" />}
                    </div>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ padding: '0.65rem 0.9rem', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? roleMeta.gradient : 'rgba(255,255,255,0.05)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', fontSize: '0.875rem', color: '#fff', lineHeight: 1.55, boxShadow: msg.role === 'user' ? '0 4px 14px rgba(41,98,255,0.3)' : '0 2px 8px rgba(0,0,0,0.2)' }}>
                        {msg.text}
                      </div>
                      {msg.data && msg.data.length > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {msg.data.map((row, ri) => (
                            <motion.div key={ri} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ri * 0.08 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', gap: '0.75rem' }}>
                              <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>{row.label}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>{row.value}</div>
                              </div>
                              {row.badge && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.18rem 0.5rem', borderRadius: '99px', background: BADGE_COLORS[row.badge] ?? 'rgba(41,98,255,0.15)', color: BADGE_TEXT[row.badge] ?? 'var(--stb-blue-300)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                  {row.badge}
                                </span>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--stb-electric),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={14} color="#fff" />
                    </div>
                    <div style={{ padding: '0.65rem 1rem', borderRadius: '4px 16px 16px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--stb-electric)' }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Human-Friendly Confirmation Box */}
                {pendingAction && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(41,98,255,0.1)', border: '1px solid rgba(41,98,255,0.35)', borderRadius: '14px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <ChevronRight size={13} color="var(--stb-electric)" />
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--stb-electric)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Confirmation requise</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#fff', margin: '0 0 0.875rem', lineHeight: 1.55 }}>
                      {pendingAction.humanSummary}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => confirmAction(true)} style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform 0.15s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                        <CheckCircle size={14} /> Confirmer
                      </button>
                      <button onClick={() => confirmAction(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
                        <XCircle size={14} /> Annuler
                      </button>
                    </div>
                  </motion.div>
                )}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                    placeholder="Posez votre question..."
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.65rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(41,98,255,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    style={{ width: '42px', height: '42px', borderRadius: '12px', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', background: input.trim() ? 'linear-gradient(135deg, var(--stb-electric), var(--purple))' : 'rgba(255,255,255,0.07)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: input.trim() ? '0 4px 14px rgba(41,98,255,0.4)' : 'none', transition: 'all 0.25s' }}
                    onMouseEnter={e => input.trim() && (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
                  STB AI Copilot · Données simulées à des fins de démonstration
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantWidget;

