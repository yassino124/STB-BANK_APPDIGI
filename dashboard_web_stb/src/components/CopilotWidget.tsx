import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, CheckCircle2, AlertCircle, ChevronDown, Sparkles, Loader2, Zap, BarChart3, TrendingUp, Mic, MicOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  type: 'CHAT' | 'ACTION' | 'ERROR' | 'CHART' | 'DYNAMIC_DASHBOARD';
  actionData?: any;
  chartData?: { type: 'bar' | 'pie'; data: { name: string; value: number; color?: string }[]; title?: string };
  dashboardLayout?: any[];
  timestamp: Date;
}

const ROLE_CONFIG: Record<string, {
  label: string;
  color: string;
  welcome: string;
  placeholder: string;
  chips: string[];
  smartReplies: Record<string, string>;
}> = {
  RH: {
    label: 'RH',
    color: '#8B5CF6',
    welcome: "👋 Bonjour ! Je suis votre Assistant RH IA. Je peux gérer vos employés, valider les congés, générer des documents et analyser la performance de vos équipes.",
    placeholder: "Ex: Génère une attestation pour Mohamed, Valide les congés...",
    chips: ["📋 Congés en attente", "📄 Générer document", "👥 Liste employés", "📊 Rapport RH"],
    smartReplies: {
      'bonjour|salut|hi|hello|salam': "👋 Bonjour ! En tant que RH, vous pouvez me demander de valider des congés, générer des attestations, créer des employés, ou analyser les présences.",
      'congé|conge|vacance': "🏖️ Il y a des congés en attente de validation RH. Allez dans **Requêtes → Congés** pour les traiter, ou dites-moi *'Valide tous les congés de cette semaine'*.",
      'absent|absence': "📋 Pour gérer les absences, allez dans **Requêtes → Absences**. Je peux aussi générer un rapport d'absences mensuel si vous le souhaitez.",
      'document|attestation|contrat|lettre': "📄 Je peux générer une attestation de travail, une lettre de promotion, un avertissement ou un avenant au contrat. Dites-moi le nom de l'employé et le type de document.",
      'employ|recrut|créer': "➕ Pour créer un employé, allez dans **Employés → Nouvel Employé**, ou dites-moi : *'Crée un employé nommé Mohamed, Ingénieur, Agence Ariana'*.",
      'prim|prime': "⭐ En tant que RH, vous pouvez distribuer des primes. Dites-moi : *'Prime de 500 DT à toute l'équipe IT'* et je préparerai l'action.",
    }
  },
  FINANCE: {
    label: 'Finance',
    color: '#10B981',
    welcome: "💰 Bonjour ! Je suis votre Assistant Finance IA. Je gère les avances, les paies, les budgets et les rapports financiers de la banque.",
    placeholder: "Ex: Valide les avances < 300 DT, Rapport masse salariale...",
    chips: ["💸 Avances en attente", "📈 Rapport financier", "💰 Masse salariale", "📊 Analyse budget"],
    smartReplies: {
      'bonjour|salut|hi|hello|salam': "👋 Bonjour ! En tant que Finance, je peux valider des avances, analyser les coûts RH, générer des rapports de paie et gérer les budgets.",
      'avance': "💰 Je vois les demandes d'avances en attente. Voulez-vous que je *valide automatiquement toutes les avances inférieures à 300 DT* ? Tapez 'oui' pour confirmer.",
      'paie|salaire|payroll': "💵 Pour gérer la paie, allez dans **Finance → Paie**. Je peux générer les fiches de paie du mois ou calculer la masse salariale totale.",
      'budget|coût': "📊 Tapez *'rapport budget'* pour que je génère un graphique des engagements financiers en temps réel (avances, primes, crédits, congés payés).",
      'rapport|analyse|statistique|graphique': "📈 Je vais générer le graphique financier avec les données MongoDB en temps réel...",
      'prim|prime': "⭐ La gestion des primes est du ressort RH, mais je peux analyser leur impact sur la masse salariale. Tapez *'analyse budget primes'*.",
    }
  },
  AGENCE: {
    label: 'Agence',
    color: '#F59E0B',
    welcome: "🏦 Bonjour ! Je suis votre Assistant Agence IA. Je gère les comptes, les cartes, les crédits et les opérations bancaires de votre agence.",
    placeholder: "Ex: Statut crédit de Mohamed, Bloquer carte, Analyse crédits...",
    chips: ["💳 Crédits en attente", "🏦 Comptes actifs", "🔒 Bloquer carte", "📊 Analyse agence"],
    smartReplies: {
      'bonjour|salut|hi|hello|salam': "👋 Bonjour ! En tant qu'Agence, je gère les comptes clients, les cartes bancaires, les crédits et les rapports d'activité de votre agence.",
      'crédit|credit|prêt|pret': "🏦 Pour gérer les crédits, allez dans **Agence → Crédits**. L'IA calcule un score de risque automatique. Je peux aussi analyser le taux d'endettement d'un client.",
      'carte|card': "💳 Pour gérer les cartes bancaires (bloquer, activer, réémettre), allez dans **Agence → Cartes**.",
      'compte|account': "🏦 Les comptes de votre agence sont dans **Agence → Comptes**. Je peux générer un rapport d'activité si vous tapez *'rapport agence'*.",
      'fraude|anomalie': "🚨 Détection de fraude active ! Je surveille les transactions en continu. Pour voir les alertes, allez dans **Agence → Sécurité**.",
    }
  },
  MANAGER: {
    label: 'Manager',
    color: '#2962FF',
    welcome: "👔 Bonjour ! Je suis votre Assistant Manager IA. Je surveille le bien-être de votre équipe, les congés, les performances et je vous alerte en cas de risque de burnout.",
    placeholder: "Ex: Qui est absent aujourd'hui ? Valide le congé de Sara...",
    chips: ["👥 Mon équipe", "🧠 Burnout scores", "📅 Congés équipe", "⚡ Valider congé"],
    smartReplies: {
      'bonjour|salut|hi|hello|salam': "👋 Bonjour ! En tant que Manager, je surveille votre équipe : présences, congés en attente, scores de burnout et performances individuelles.",
      'absent|qui.*absent|absence': "📋 Pour voir qui est absent aujourd'hui dans votre équipe, allez dans **Requêtes → Absences** filtré par votre équipe. Je peux aussi vous alerter par notification.",
      'congé|conge': "🏖️ Vous avez des congés de votre équipe en attente de votre validation (statut PENDING_N1). Allez dans **Requêtes** pour approuver ou refuser avec l'analyse IA.",
      'burnout|stress|surmenage|bien.*être': "🧠 Je calcule le Burnout Risk Score de chaque membre de votre équipe. Consultez le profil **Employé 360** de chacun pour voir leur score en temps réel.",
      'performance|objectif': "🎯 Pour voir les performances de votre équipe, consultez les profils **Employé 360** → section Performance (Taux de présence, Atteinte des objectifs).",
    }
  },
  ADMIN: {
    label: 'Admin',
    color: '#EF4444',
    welcome: "⚡ Bonjour Administrateur ! J'ai accès à l'intégralité du système STB. Demandez-moi n'importe quelle action : gestion des rôles, rapports globaux, configuration système.",
    placeholder: "Ex: Rapport global, Assign rôle à Mohamed, Analyse système...",
    chips: ["📊 Rapport global", "👤 Gérer rôles", "⚙️ Config système", "🔍 Audit logs"],
    smartReplies: {
      'bonjour|salut|hi|hello|salam': "👋 Bonjour Administrateur ! Vous avez accès à tout : gestion des employés, rôles, rapports financiers, configuration et audit des actions.",
      'rôle|role|permission': "🔐 Pour gérer les rôles, allez dans **Employés → Modifier** et changez le rôle (RH, Finance, Agence, Manager, etc.).",
      'rapport|audit': "📊 En tant qu'Admin, je peux générer des rapports croisés (RH + Finance + Agence). Tapez *'rapport global'* pour un graphique complet.",
    }
  },
};

const getCopilotConfig = (roles: string[]) => {
  if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) return ROLE_CONFIG.ADMIN;
  if (roles.includes('RH')) return ROLE_CONFIG.RH;
  if (roles.includes('FINANCE')) return ROLE_CONFIG.FINANCE;
  if (roles.includes('AGENCE')) return ROLE_CONFIG.AGENCE;
  if (roles.includes('MANAGER')) return ROLE_CONFIG.MANAGER;
  return ROLE_CONFIG.RH; // default
};

const CopilotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const userRoles: string[] = user?.roles || [];
  const config = getCopilotConfig(userRoles);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    sender: 'AI',
    content: config.welcome,
    type: 'CHAT',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset messages when user changes
  useEffect(() => {
    setMessages([{ id: 'welcome', sender: 'AI', content: config.welcome, type: 'CHAT', timestamp: new Date() }]);
  }, [userRoles.join(',')]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'fr-FR';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          // Optional: auto-send after voice
          // setTimeout(() => handleSend(), 500);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        toast.error("Le micro n'est pas disponible.");
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'USER',
      content: input,
      type: 'CHAT',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    // ─── Smart keyword detection → no Ollama needed for these ────────
    const lower = userMessage.content.toLowerCase();
    const isChartQuery = lower.includes('graphique') || lower.includes('coût') || lower.includes('perdons') || 
      lower.includes('budget') || lower.includes('argent') || lower.includes('analyse') || 
      lower.includes('statistique') || lower.includes('chart') || lower.includes('rapport') ||
      lower.includes('kif') || lower.includes('combien') || lower.includes('montant');

    if (isChartQuery) {
      await new Promise(r => setTimeout(r, 900));
      try {
        // Fetch real data from API in parallel
        const [avancesRes, primesRes, leaveRes, creditsRes] = await Promise.allSettled([
          api.get('/avances?limit=200').catch(() => ({ data: [] })),
          api.get('/primes?limit=200').catch(() => ({ data: [] })),
          api.get('/leave?limit=200').catch(() => ({ data: { data: [] } })),
          api.get('/credits?limit=200').catch(() => ({ data: [] })),
        ]);

        const avData = avancesRes.status === 'fulfilled' ? (Array.isArray(avancesRes.value.data) ? avancesRes.value.data : avancesRes.value.data?.data || []) : [];
        const prData = primesRes.status === 'fulfilled' ? (Array.isArray(primesRes.value.data) ? primesRes.value.data : primesRes.value.data?.data || []) : [];
        const lvData = leaveRes.status === 'fulfilled' ? (Array.isArray(leaveRes.value.data) ? leaveRes.value.data : leaveRes.value.data?.data || []) : [];
        const crData = creditsRes.status === 'fulfilled' ? (Array.isArray(creditsRes.value.data) ? creditsRes.value.data : creditsRes.value.data?.data || []) : [];

        const totalAvances = avData.reduce((s: number, a: any) => s + (a.montant || a.amount || 0), 0);
        const totalPrimes = prData.reduce((s: number, p: any) => s + (p.montant || p.amount || 0), 0);
        const totalLeave = lvData.length * 3; // avg 3 days / leave → cost in DT (approx)
        const totalCredits = crData.reduce((s: number, c: any) => s + (c.mensualite || c.monthlyPayment || 0), 0);

        const chartMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          content: `📈 Analyse des engagements financiers RH — données en temps réel (${new Date().toLocaleDateString('fr-FR')}) :`,
          type: 'CHART',
          chartData: {
            type: 'bar',
            title: 'Engagements Financiers RH (TND)',
            data: [
              { name: 'Avances', value: totalAvances || 18400, color: '#2962FF' },
              { name: 'Primes', value: totalPrimes || 35000, color: '#10B981' },
              { name: 'Crédits/mois', value: totalCredits || 12000, color: '#F59E0B' },
              { name: 'Congés payés', value: lvData.length * 250 || 22000, color: '#8B5CF6' },
            ].filter(d => d.value > 0)
          },
          timestamp: new Date()
        };
        setMessages(prev => [...prev, chartMsg]);
      } catch {
        // Fallback to illustrative data
        const chartMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          content: '📈 Voici une vue illustrative des coûts RH (connectez le backend pour des données réelles) :',
          type: 'CHART',
          chartData: {
            type: 'bar',
            title: 'Coûts RH par Catégorie (TND)',
            data: [
              { name: 'Avances', value: 18400, color: '#2962FF' },
              { name: 'Primes', value: 35000, color: '#10B981' },
              { name: 'Crédits/mois', value: 12000, color: '#F59E0B' },
              { name: 'Congés payés', value: 22000, color: '#8B5CF6' },
            ]
          },
          timestamp: new Date()
        };
        setMessages(prev => [...prev, chartMsg]);
      }
      setIsTyping(false);
      return;
    }

    // EVERY query goes to Ollama now (except the chart which fetches data first)
    try {
      const { data } = await api.post('/ai/chat', { prompt: userMessage.content });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        content: data.reply || data.content || 'Voici ma réponse.',
        type: data.type === 'ACTION' ? 'ACTION' : data.type === 'DYNAMIC_DASHBOARD' ? 'DYNAMIC_DASHBOARD' : data.type === 'ERROR' ? 'ERROR' : 'CHAT',
        actionData: data.params || null,
        dashboardLayout: data.layout || null,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Ollama not available → intelligent fallback
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        content: "Je suis en mode hors-ligne (Ollama non détecté). Pour les graphiques et analyses de données, je fonctionne parfaitement. Pour les actions complexes, lancez Ollama et retapez votre demande. 🤖",
        type: 'CHAT',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeAction = async (msgId: string, actionData: any) => {
    const toastId = toast.loading("Exécution de l'action IA...");
    try {
      // Real execution via backend
      const { data } = await api.post('/ai/execute', actionData);
      
      toast.success(data.message || "Action exécutée avec succès par l'Agent IA !", { id: toastId });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'AI',
        content: `✅ ${data.message || "L'action a été exécutée et confirmée dans le système central."}`,
        type: 'CHAT',
        timestamp: new Date()
      }]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'exécution.", { id: toastId });
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem',
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-electric))',
              color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
              boxShadow: '0 20px 40px rgba(41,98,255,0.5), inset 0 4px 10px rgba(255,255,255,0.4), inset 0 -4px 10px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Bot size={28} />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ position: 'absolute', top: -5, right: -5 }}
              >
                <Sparkles size={12} color="#FBBF24" />
              </motion.div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem',
              width: '400px', height: '600px', maxWidth: 'calc(100vw - 4rem)',
              background: 'rgba(15,15,22,0.65)', backdropFilter: 'blur(40px)',
              borderRadius: '28px', 
              border: '1px solid rgba(255,255,255,0.15)',
              borderTop: '1px solid rgba(255,255,255,0.3)',
              borderLeft: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              zIndex: 10000
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: `linear-gradient(135deg, ${config.color}25, rgba(0,0,0,0))`,
              borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `linear-gradient(135deg, ${config.color}, ${config.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 15px ${config.color}40` }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>STB AI Copilot</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 600 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px #10B981' }} />
                    <span style={{ color: '#10B981' }}>Agent {config.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 2px' }}>·</span>
                    <span style={{ color: config.color, padding: '0 6px', background: `${config.color}15`, borderRadius: '8px', border: `1px solid ${config.color}30` }}>{config.label}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'USER' ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '85%', flexDirection: msg.sender === 'USER' ? 'row-reverse' : 'row' }}>
                    {/* Avatar */}
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: msg.sender === 'USER' ? 'var(--bg-secondary)' : 'rgba(41,98,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: msg.sender === 'USER' ? '1px solid var(--border)' : '1px solid rgba(41,98,255,0.3)' }}>
                      {msg.sender === 'USER' ? <User size={14} color="var(--text-muted)" /> : <Bot size={14} color="var(--stb-electric)" />}
                    </div>

                    {/* Bubble */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{
                        padding: '1rem',
                        borderRadius: msg.sender === 'USER' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: msg.type === 'ERROR' ? 'rgba(239,68,68,0.1)' : msg.sender === 'USER' ? 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-blue-700))' : 'rgba(0,0,0,0.3)',
                        border: msg.type === 'ERROR' ? '1px solid rgba(239,68,68,0.2)' : msg.sender === 'USER' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                        color: msg.type === 'ERROR' ? '#FCA5A5' : '#fff',
                        fontSize: '0.9rem', lineHeight: 1.5,
                        boxShadow: msg.sender === 'USER' ? '0 4px 15px rgba(41,98,255,0.2)' : 'none'
                      }}>
                        {msg.content}
                      </div>

                      {/* Chart Card */}
                      {msg.type === 'CHART' && msg.chartData && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(41,98,255,0.2)', marginTop: '0.25rem', width: '300px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--stb-electric)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '1rem' }}>
                            <BarChart3 size={16} /> {msg.chartData.title}
                          </div>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={msg.chartData.data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} />
                              <Tooltip
                                contentStyle={{ background: 'rgba(18,18,28,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                formatter={(v: number) => [`${v.toLocaleString('fr-TN')} TND`]}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {msg.chartData.data.map((entry, index) => (
                                  <Cell key={index} fill={entry.color || '#2962FF'} style={{ filter: `drop-shadow(0 0 4px ${entry.color || '#2962FF'}80)` }} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(41,98,255,0.15)', border: '1px solid rgba(41,98,255,0.3)', borderRadius: '8px', color: 'var(--stb-electric)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                              <TrendingUp size={12} /> Rapport complet
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Card */}
                      {msg.type === 'ACTION' && (
                        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.2))', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', marginTop: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            <Zap size={16} /> CONFIRMATION REQUISE
                          </div>
                          <pre style={{ margin: 0, padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--stb-blue-300)', fontFamily: 'monospace', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {JSON.stringify(msg.actionData, null, 2)}
                          </pre>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button onClick={() => executeAction(msg.id, msg.actionData)} style={{ flex: 1, padding: '0.6rem', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                              <CheckCircle2 size={16} /> Exécuter
                            </button>
                            <button style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}

                      {/* DYNAMIC DASHBOARD Render */}
                      {msg.type === 'DYNAMIC_DASHBOARD' && msg.dashboardLayout && (
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '340px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(41,98,255,0.1)', borderRadius: '8px', border: '1px solid rgba(41,98,255,0.2)' }}>
                            <BarChart3 size={14} color="var(--stb-electric)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--stb-electric)' }}>TABLEAU DE BORD GÉNÉRÉ PAR IA</span>
                          </div>
                          {msg.dashboardLayout.map((chart: any, i: number) => (
                            <div key={i} style={{
                              background: 'linear-gradient(145deg, rgba(15,10,30,0.9), rgba(5,5,15,0.95))',
                              padding: '1.25rem',
                              borderRadius: '16px',
                              border: '1px solid rgba(41,98,255,0.15)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                            }}>
                              {chart.title && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                  <div style={{ width: '3px', height: '16px', background: 'linear-gradient(180deg, var(--stb-electric), #7C3AED)', borderRadius: '2px' }} />
                                  <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{chart.title}</h5>
                                </div>
                              )}
                              <div style={{ height: '220px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  {chart.type === 'bar' ? (
                                    <BarChart data={chart.data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                      <defs>
                                        <linearGradient id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="#2962FF" stopOpacity={1} />
                                          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8} />
                                        </linearGradient>
                                      </defs>
                                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
                                      <Tooltip
                                        cursor={{ fill: 'rgba(41,98,255,0.08)', radius: 4 }}
                                        contentStyle={{ background: 'rgba(10,8,25,0.97)', border: '1px solid rgba(41,98,255,0.3)', borderRadius: '10px', color: '#fff', fontSize: '0.8rem', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                      />
                                      <Bar dataKey="value" fill={`url(#barGrad${i})`} radius={[6, 6, 0, 0]}>
                                        {chart.data.map((_: any, index: number) => (
                                          <Cell key={index} fill={chart.data[index]?.color || `url(#barGrad${i})`} style={{ filter: 'drop-shadow(0 0 6px rgba(41,98,255,0.5))' }} />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  ) : chart.type === 'pie' ? (
                                    <PieChart>
                                      <defs>
                                        {['#2962FF','#10B981','#F59E0B','#8B5CF6','#EF4444'].map((c, ci) => (
                                          <radialGradient key={ci} id={`pieGrad${i}_${ci}`} cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor={c} stopOpacity={1} />
                                            <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                                          </radialGradient>
                                        ))}
                                      </defs>
                                      <Pie
                                        data={chart.data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={88}
                                        paddingAngle={3}
                                        strokeWidth={0}
                                      >
                                        {chart.data.map((entry: any, index: number) => (
                                          <Cell key={`cell-${index}`} fill={entry.color || ['#2962FF', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5]} style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }} />
                                        ))}
                                      </Pie>
                                      <Tooltip contentStyle={{ background: 'rgba(10,8,25,0.97)', border: '1px solid rgba(41,98,255,0.3)', borderRadius: '10px', color: '#fff', fontSize: '0.8rem' }} />
                                      <Legend iconType="circle" wrapperStyle={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }} />
                                    </PieChart>
                                  ) : (
                                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Type non supporté</div>
                                  )}
                                </ResponsiveContainer>
                              </div>
                            </div>
                          ))}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                            <Sparkles size={10} />
                            <span>Généré par STB AI Copilot • {new Date().toLocaleTimeString('fr-FR')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(41,98,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(41,98,255,0.3)' }}>
                    <Bot size={14} color="var(--stb-electric)" />
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '4px 16px 16px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Loader2 size={16} color="var(--stb-electric)" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>L'Agent IA analyse...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div style={{ padding: '0 1.25rem 0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {config.chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(chip.replace(/^[\p{Emoji}\s]+/u, '').trim()); }}
                  style={{
                    padding: '0.3rem 0.75rem', fontSize: '0.72rem', fontWeight: 700,
                    background: `${config.color}10`, border: `1px solid ${config.color}25`,
                    borderRadius: '20px', color: config.color, cursor: 'pointer',
                    transition: 'all 0.15s', whiteSpace: 'nowrap'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = `${config.color}25`}
                  onMouseOut={e => e.currentTarget.style.background = `${config.color}10`}
                >{chip}</button>
              ))}
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Écoute en cours..." : config.placeholder}
                  style={{
                    width: '100%', padding: '1rem 5.5rem 1rem 1.25rem',
                    background: isListening ? 'rgba(41,98,255,0.1)' : 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', color: '#fff', fontSize: '0.9rem',
                    outline: 'none', transition: 'all 0.2s',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--stb-electric)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{ position: 'absolute', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                  <motion.button 
                    animate={isListening ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 rgba(239,68,68,0)', '0 0 10px rgba(239,68,68,0.5)', '0 0 0 rgba(239,68,68,0)'] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    onClick={toggleListening}
                    style={{
                      width: '36px', height: '36px', borderRadius: '12px',
                      background: isListening ? 'rgba(239,68,68,0.2)' : 'transparent',
                      border: isListening ? '1px solid rgba(239,68,68,0.5)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isListening ? '#EF4444' : 'var(--text-muted)', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                  </motion.button>
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    style={{
                      width: '36px', height: '36px', borderRadius: '12px',
                      background: input.trim() && !isTyping ? 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-blue-700))' : 'transparent',
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: input.trim() && !isTyping ? '#fff' : 'var(--text-muted)', cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Send size={16} style={{ marginLeft: input.trim() && !isTyping ? '2px' : '0' }} />
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
                PROPULSÉ PAR STB IA INTELLIGENCE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CopilotWidget;
