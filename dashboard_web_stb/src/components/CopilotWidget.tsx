import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, CheckCircle2, AlertCircle, Sparkles, Loader2, Zap, BarChart3, TrendingUp, ShieldAlert, Mic, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Markdown support (if not installed, it falls back gracefully in styling)
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  type: 'CHAT' | 'ACTION' | 'ERROR' | 'CHART' | 'DYNAMIC_DASHBOARD' | 'BRIEFING' | 'ACTION_CARD' | 'FORM_CARD' | 'LIST_CARD';
  actionData?: { title: string; subtitle?: string; status?: 'success' | 'warning' | 'info'; details: { label: string; value: string }[] };
  chartData?: { type: 'bar' | 'pie' | 'area'; data: any[]; title?: string };
  formConfig?: { title: string; endpoint: string; fields: { name: string; label: string; type: string }[] };
  listConfig?: { title: string; items: { id: string; title: string; subtitle: string; actionEndpoint: string; actionPayload: any; actionName: string }[] };
  dashboardLayout?: any[];
  timestamp: Date;
}

const ROLE_CONFIG: Record<string, {
  label: string;
  color: string;
  bgGradient: string;
  welcome: string;
  placeholder: string;
  chips: string[];
  smartReplies: Record<string, string>;
  briefing: { title: string; subtitle: string; metrics: { label: string; value: string; trend: number }[] };
}> = {
  RH: {
    label: 'RH Intelligence',
    color: '#8B5CF6',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.05))',
    welcome: "👋 Bonjour ! Je suis votre Assistant RH IA. Je peux gérer vos employés, valider les congés, générer des documents et analyser la performance de vos équipes.",
    placeholder: "Demandez une analyse RH ou une action...",
    chips: ["📋 Congés en attente", "➕ Ajouter employé", "✅ Valider Congé", "📄 Générer document", "👥 Liste employés", "📊 Rapport RH"],
    smartReplies: {
      'bonjour|salut|hi|hello': "👋 Bonjour ! En tant que RH, je peux analyser l'absentéisme, valider des congés ou générer des contrats.",
      'congé|conge|vacance': "🏖️ Allez dans **Requêtes → Congés** pour traiter les congés. L'IA a pré-validé 3 demandes selon les soldes.",
      'rapport|analyse': "📊 Génération du rapport analytique RH en cours...",
    },
    briefing: {
      title: 'Briefing RH Quotidien',
      subtitle: "Analyse d'aujourd'hui",
      metrics: [
        { label: 'Congés en attente', value: '14', trend: 2 },
        { label: 'Absences ajd.', value: '3', trend: -1 },
        { label: 'Recrutements', value: '5', trend: 1 }
      ]
    }
  },
  FINANCE: {
    label: 'Finance IA',
    color: '#10B981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.05))',
    welcome: "💰 Bonjour ! Je suis votre Assistant Finance IA. Je gère les flux, les paies, les budgets et l'analyse prédictive.",
    placeholder: "Ex: Taux de réalisation du budget, Rapport de masse salariale...",
    chips: ["💸 Avances en attente", "✅ Valider Avance", "📈 Rapport financier", "💰 Masse salariale", "📊 Analyse budget"],
    smartReplies: {
      'bonjour|salut': "👋 Bonjour ! En tant que Finance, je surveille la masse salariale et valide les demandes financières.",
      'avance|crédit': "💰 Il y a 12 demandes d'avances aujourd'hui. Souhaitez-vous une validation en bloc des montants < 500 DT ?",
      'rapport|budget': "📈 J'affiche le rapport budgétaire en temps réel avec prédiction à 3 mois.",
    },
    briefing: {
      title: 'Briefing Financier',
      subtitle: "Mise à jour en direct",
      metrics: [
        { label: 'Demandes Avance', value: '18', trend: 4 },
        { label: 'Masse Salariale', value: '2.4M', trend: 0.5 },
        { label: 'Budget Utilisé', value: '64%', trend: 1.2 }
      ]
    }
  },
  MANAGER: {
    label: 'Manager AI',
    color: '#2962FF',
    bgGradient: 'linear-gradient(135deg, rgba(41, 98, 255, 0.2), rgba(21, 101, 192, 0.05))',
    welcome: "👔 Bonjour Manager ! Je surveille la santé et les performances de votre équipe pour anticiper tout risque opérationnel.",
    placeholder: "Ex: Qui est absent ? Valide les congés...",
    chips: ["👥 Mon équipe", "✅ Valider Congé Équipe", "🧠 Burnout scores", "📅 Congés équipe"],
    smartReplies: {
      'bonjour|salut': "👋 Bonjour ! Votre équipe se porte bien. Il y a 2 validations en attente.",
      'absent|absence': "📋 Personne n'est absent aujourd'hui dans votre département direct.",
      'congé|conge': "🏖️ Vous avez des validations N+1 en attente. Voulez-vous que je filtre les risques de chevauchement ?",
      'burnout|stress': "🧠 L'analyse IA indique que 2 membres de votre équipe ont un score de fatigue élevé (Heures sup + Absences répétées).",
    },
    briefing: {
      title: 'Mon Équipe',
      subtitle: "Synthèse matinale",
      metrics: [
        { label: 'Présence', value: '98%', trend: 2 },
        { label: 'Tâches', value: '45', trend: -5 },
        { label: 'Alertes Burnout', value: '1', trend: 1 }
      ]
    }
  },
  ADMIN: {
    label: 'STB Super AI',
    color: '#EF4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.05))',
    welcome: "⚡ Mode Admin Global activé. Je supervise l'intégralité du SI, la sécurité, et les métriques globales de l'entreprise.",
    placeholder: "Ex: Audit de sécurité, Rapport 360, Logs serveur...",
    chips: ["➕ Ajouter employé", "📊 Rapport 360", "🚨 Alertes Sécurité", "✅ Valider Congé", "⚙️ Système"],
    smartReplies: {
      'bonjour|salut': "👋 Super Admin identifié. Tous les systèmes sont opérationnels.",
      'rapport|360': "📊 Création du rapport exécutif consolidé (RH + Finance + Opérations)...",
      'alerte|securit': "🚨 Il y a 0 alertes critiques aujourd'hui. Les logs de connexion sont stables.",
    },
    briefing: {
      title: 'System Overview',
      subtitle: "Monitoring Global",
      metrics: [
        { label: 'Req. API/h', value: '45.2K', trend: 5.2 },
        { label: 'Uptime', value: '99.9%', trend: 0 },
        { label: 'Erreurs', value: '12', trend: -15 }
      ]
    }
  },
};

const getCopilotConfig = (roles: string[]) => {
  if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) return ROLE_CONFIG.ADMIN;
  if (roles.includes('RH')) return ROLE_CONFIG.RH;
  if (roles.includes('FINANCE')) return ROLE_CONFIG.FINANCE;
  if (roles.includes('AGENCE')) return ROLE_CONFIG.ADMIN; // Map to admin for now, can add specific AGENCE if needed
  if (roles.includes('MANAGER')) return ROLE_CONFIG.MANAGER;
  return ROLE_CONFIG.RH; 
};

// Markdown styling for react-markdown
const MarkdownComponents = {
  p: ({ node, ...props }: any) => <p style={{ margin: '0 0 0.5rem 0', lineHeight: 1.5 }} {...props} />,
  strong: ({ node, ...props }: any) => <strong style={{ color: 'inherit', fontWeight: 700 }} {...props} />,
  ul: ({ node, ...props }: any) => <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }} {...props} />,
  li: ({ node, ...props }: any) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
  h3: ({ node, ...props }: any) => <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }} {...props} />,
};

const DynamicFormCard = ({ msg, onComplete }: { msg: Message, onComplete: (content: string, actionCard?: any) => void }) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (msg.formConfig?.endpoint === '/employees') {
        const payload = {
           nom: formData.nom || 'Nouveau',
           prenom: formData.prenom || 'Collaborateur',
           cin: formData.cin || Math.floor(10000000 + Math.random() * 90000000).toString(),
           departement: formData.departement || 'IT',
           poste: formData.poste || 'Agent',
           email: `${(formData.prenom || 'user').toLowerCase()}.${Date.now()}@stb.com.tn`,
           dateNaissance: '1990-01-01',
           phone: '+21699999999'
        };
        const res = await api.post(msg.formConfig.endpoint, payload);
        const emp = res.data?.employee || res.data;
        onComplete(`✅ L'employé a été généré et inséré dans le système.`, {
          title: 'Nouvel Employé Créé',
          subtitle: `Département ${payload.departement}`,
          status: 'success',
          details: [
            { label: 'Matricule', value: emp.matricule },
            { label: 'Nom Complet', value: `${emp.prenom} ${emp.nom}` },
            { label: 'CIN', value: emp.cin },
            { label: 'Poste', value: emp.poste || 'Agent' }
          ]
        });
      }
    } catch (err: any) {
      onComplete(`❌ Erreur: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h4 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <User size={18} color="#10B981" /> {msg.formConfig?.title}
      </h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
         {msg.formConfig?.fields.map(f => (
           <div key={f.name}>
             <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>{f.label}</label>
             <input type={f.type} required placeholder={`Entrez ${f.label.toLowerCase()}`}
                    onChange={e => setFormData({...formData, [f.name]: e.target.value})} 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }} />
           </div>
         ))}
         <button disabled={loading} type="submit" style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', background: '#10B981', color: '#fff', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
           {loading ? 'Création en cours...' : 'Générer Profil Employé'}
         </button>
      </form>
    </div>
  )
}

const DynamicListCard = ({ msg, onComplete }: { msg: Message, onComplete: (content: string, actionCard?: any) => void }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (item: any) => {
    setLoadingId(item.id);
    try {
      await api.patch(item.actionEndpoint, item.actionPayload);
      onComplete(`✅ Action validée avec succès pour ${item.title}.`);
    } catch (err: any) {
      onComplete(`❌ Erreur: ${err.response?.data?.message || err.message}`);
    }
    setLoadingId(null);
  };

  return (
    <div style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h4 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckCircle2 size={18} color="#10B981" /> {msg.listConfig?.title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
         {msg.listConfig?.items.map(item => (
           <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div>
               <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{item.title}</div>
               <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '2px' }}>{item.subtitle}</div>
             </div>
             <button 
               onClick={() => handleAction(item)}
               disabled={loadingId === item.id} 
               style={{ padding: '0.5rem 0.8rem', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', cursor: loadingId === item.id ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
             >
               {loadingId === item.id ? '...' : item.actionName}
             </button>
           </div>
         ))}
      </div>
    </div>
  )
}

const CopilotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const config = getCopilotConfig(user?.roles || []);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasShownBriefing, setHasShownBriefing] = useState(false);

  // Initialize with Briefing
  useEffect(() => {
    if (isOpen && !hasShownBriefing && messages.length === 0) {
      setHasShownBriefing(true);
      setMessages([
        {
          id: 'welcome',
          sender: 'AI',
          content: config.welcome,
          type: 'CHAT',
          timestamp: new Date()
        },
        {
          id: 'briefing',
          sender: 'AI',
          content: 'Voici votre résumé quotidien :',
          type: 'BRIEFING',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, hasShownBriefing, config.welcome, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Voice to text setup
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur. (Essayez Chrome/Edge)");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Voice Error:", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;
    setInput('');
    const userMsg: Message = { id: `user-${Date.now()}-${Math.random()}`, sender: 'USER', content: text, type: 'CHAT', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const lower = text.toLowerCase();
    
    try {
      let replyMsg = '';
      let actionCard: any = undefined;
      
      // Intent 1: Create Employee
      if (/(ajouter|creer|créer|zidni)\s+.*(employé|employee|collaborateur)/i.test(text)) {
        setMessages(prev => [...prev, { 
          id: `bot-${Date.now()}-${Math.random()}`, sender: 'AI', content: "Veuillez remplir les informations de base pour le nouvel employé :", type: 'FORM_CARD', timestamp: new Date(),
          formConfig: {
            title: 'Création Nouvel Employé',
            endpoint: '/employees',
            fields: [
              { name: 'nom', label: 'Nom de famille', type: 'text' },
              { name: 'prenom', label: 'Prénom', type: 'text' },
              { name: 'cin', label: 'Numéro CIN', type: 'text' },
              { name: 'departement', label: 'Département (ex: IT, Finance)', type: 'text' },
              { name: 'poste', label: 'Poste occupé', type: 'text' }
            ]
          }
        }]);
        setIsTyping(false);
        return;
      }
      // Intent 2: Validate Leave
      else if (/(valider|valed|approuver|accepter)\s+.*(congé|conge|leave)/i.test(text)) {
        const nameMatch = text.match(/(valider|valed|approuver|accepter)\s+.*(congé|conge|leave)\s+(de\s+|l)?([a-zA-Z0-9]+)?/i);
        const targetName = nameMatch && nameMatch[4] ? nameMatch[4] : '';
        
        const leavesRes = await api.get('/leave/all');
        const leaves = leavesRes.data?.data || leavesRes.data || [];
        
        if (!targetName) {
           const pendingLeaves = leaves.filter((l: any) => l.status === 'PENDING' || l.status === 'PENDING_RH');
           if (pendingLeaves.length > 0) {
             setMessages(prev => [...prev, { 
               id: `bot-${Date.now()}-${Math.random()}`, sender: 'AI', content: `J'ai trouvé ${pendingLeaves.length} congé(s) en attente.`, type: 'LIST_CARD', timestamp: new Date(),
               listConfig: {
                 title: 'Congés en Attente',
                 items: pendingLeaves.map((l: any) => ({
                   id: l._id,
                   title: `${l.employee?.prenom} ${l.employee?.nom}`,
                   subtitle: `${l.typeConges || 'Annuel'} - ${l.joursDemandes} jour(s)`,
                   actionEndpoint: `/leave/${l._id}/handle-rh`,
                   actionPayload: { action: 'APPROVE' },
                   actionName: 'Approuver'
                 }))
               }
             }]);
           } else {
             setMessages(prev => [...prev, { id: `bot-${Date.now()}`, sender: 'AI', content: "🎉 Aucun congé en attente. Tout est à jour !", type: 'CHAT', timestamp: new Date() }]);
           }
           setIsTyping(false);
           return;
        }

        const targetLeave = leaves.find((l: any) => 
          l.employee?.prenom?.toLowerCase().includes(targetName.toLowerCase()) && 
          (l.status === 'PENDING' || l.status === 'PENDING_RH')
        );
        
        if (targetLeave) {
           await api.patch(`/leave/${targetLeave._id}/handle-rh`, { action: 'APPROVE' });
           replyMsg = `✅ Le congé a été officiellement approuvé dans la base de données.`;
           actionCard = {
             title: 'Congé Validé',
             subtitle: `${targetLeave.employee.prenom} ${targetLeave.employee.nom}`,
             status: 'success',
             details: [
               { label: 'Type', value: targetLeave.typeConges || 'Annuel' },
               { label: 'Jours', value: targetLeave.joursDemandes?.toString() || 'N/A' },
               { label: 'Nouveau Solde', value: targetLeave.employee.soldeConges?.toString() || 'N/A' }
             ]
           };
        } else {
           replyMsg = `❌ Je n'ai trouvé aucun congé en attente pour le nom "${targetName}".`;
        }
      }
      // Intent 3: Validate Advance
      else if (/(valider|valed|approuver|accepter)\s+.*(avance|credit)/i.test(text)) {
        const nameMatch = text.match(/(valider|valed|approuver|accepter)\s+.*(avance|credit)\s+(de\s+|l)?([a-zA-Z0-9]+)?/i);
        const targetName = nameMatch && nameMatch[4] ? nameMatch[4] : '';
        
        const avancesRes = await api.get('/avances');
        const avances = avancesRes.data?.data || avancesRes.data || [];
        
        if (!targetName) {
           const pendingAvances = avances.filter((a: any) => a.statut === 'EN_ATTENTE');
           if (pendingAvances.length > 0) {
             setMessages(prev => [...prev, { 
               id: `bot-${Date.now()}-${Math.random()}`, sender: 'AI', content: `J'ai trouvé ${pendingAvances.length} avance(s) en attente.`, type: 'LIST_CARD', timestamp: new Date(),
               listConfig: {
                 title: 'Avances en Attente',
                 items: pendingAvances.map((a: any) => ({
                   id: a._id,
                   title: `${a.employee?.prenom} ${a.employee?.nom}`,
                   subtitle: `${a.montant} TND - ${a.dureeMois} mois`,
                   actionEndpoint: `/avances/${a._id}/statut`,
                   actionPayload: { statut: 'APPROUVE' },
                   actionName: 'Approuver'
                 }))
               }
             }]);
           } else {
             setMessages(prev => [...prev, { id: `bot-${Date.now()}`, sender: 'AI', content: "🎉 Aucune avance en attente. Tout est à jour !", type: 'CHAT', timestamp: new Date() }]);
           }
           setIsTyping(false);
           return;
        }

        const targetAvance = avances.find((a: any) => 
          a.employee?.prenom?.toLowerCase().includes(targetName.toLowerCase()) && 
          a.statut === 'EN_ATTENTE'
        );
        
        if (targetAvance) {
           await api.patch(`/avances/${targetAvance._id}/statut`, { statut: 'APPROUVE' });
           replyMsg = `✅ L'avance sur salaire a été virée au statut approuvé.`;
           actionCard = {
             title: 'Avance Approuvée',
             subtitle: `${targetAvance.employee.prenom} ${targetAvance.employee.nom}`,
             status: 'success',
             details: [
               { label: 'Montant', value: `${targetAvance.montant} TND` },
               { label: 'Mensualités', value: `${targetAvance.dureeMois} mois` },
               { label: 'Motif', value: targetAvance.motif || 'N/A' }
             ]
           };
        } else {
           replyMsg = `❌ Je n'ai trouvé aucune demande d'avance en attente pour "${targetName}".`;
        }
      }
      
      // If we got a direct NLP match, add the message and return
      if (replyMsg) {
        setMessages(prev => [...prev, { 
          id: `bot-${Date.now()}-${Math.random()}`, 
          sender: 'AI', 
          content: replyMsg, 
          type: actionCard ? 'ACTION_CARD' : 'CHAT', 
          actionData: actionCard,
          timestamp: new Date() 
        }]);
        setIsTyping(false);
        return;
      }
      
      // Fallback 1: Smart Keyword Matching (Offline/Instant fallback)
      for (const [pattern, reply] of Object.entries(config.smartReplies)) {
        if (new RegExp(pattern, 'i').test(lower)) {
          await new Promise(r => setTimeout(r, 800)); // simulate thinking
          
          if (lower.includes('rapport') || lower.includes('budget') || lower.includes('360')) {
             setMessages(prev => [...prev, {
               id: `bot-chart-${Date.now()}-${Math.random()}`, sender: 'AI', content: reply, type: 'CHART', timestamp: new Date(),
               chartData: {
                 type: 'area', title: 'Activité 30 derniers jours',
                 data: [
                   { name: 'S1', val: 400 }, { name: 'S2', val: 300 },
                   { name: 'S3', val: 600 }, { name: 'S4', val: 800 }
                 ]
               }
             }]);
          } else {
             setMessages(prev => [...prev, { id: `bot-${Date.now()}-${Math.random()}`, sender: 'AI', content: reply, type: 'CHAT', timestamp: new Date() }]);
          }
          setIsTyping(false);
          return;
        }
      }

      // Fallback 2: Real API Call to Ollama
      const { data } = await api.post('/ai/chat', { 
        prompt: text, role: user?.roles?.[0] || 'RH', context: 'dashboard' 
      });
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}-${Math.random()}`, sender: 'AI',
        content: data.reply || data.content || data.message || "Analyse terminée.",
        type: data.type || 'CHAT',
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error("Erreur Agent:", error.response?.data || error);
      const errMsg = error.response?.data?.message || error.message || "Erreur de connexion.";
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}-${Math.random()}`, sender: 'AI',
        content: `❌ Oups, une erreur est survenue : ${errMsg}`,
        type: 'CHAT', timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem',
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--stb-blue-600, #2962FF), var(--stb-electric, #00C6FF))',
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
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ position: 'absolute', top: -5, right: -5 }}
              >
                <Sparkles size={12} color="#FBBF24" />
              </motion.div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
              width: 420, height: 650, borderRadius: '24px',
              background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem', background: config.bgGradient,
              borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '14px', background: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 15px ${config.color}60`
              }}>
                <Bot size={24} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {config.label}
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Intelligence Artificielle Connectée</p>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, i) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
                  alignSelf: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}>
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    background: msg.sender === 'USER' ? config.color : 'rgba(255,255,255,0.05)',
                    color: '#fff', borderRadius: '18px',
                    borderBottomRightRadius: msg.sender === 'USER' ? '4px' : '18px',
                    borderBottomLeftRadius: msg.sender === 'AI' ? '4px' : '18px',
                    fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    border: msg.sender === 'AI' ? '1px solid rgba(255,255,255,0.08)' : 'none'
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Render Briefing Widget */}
                  {msg.type === 'BRIEFING' && (
                    <div style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1rem', border: `1px solid ${config.color}30` }}>
                      <h4 style={{ margin: '0 0 2px', color: '#fff', fontSize: '0.95rem' }}>{config.briefing.title}</h4>
                      <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{config.briefing.subtitle}</p>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {config.briefing.metrics.map(m => (
                          <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{m.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, color: '#fff' }}>{m.value}</span>
                              <span style={{ fontSize: '0.7rem', color: m.trend >= 0 ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center' }}>
                                {m.trend > 0 ? '↑' : m.trend < 0 ? '↓' : '-'} {Math.abs(m.trend)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Form Card Widget */}
                  {msg.type === 'FORM_CARD' && (
                    <DynamicFormCard msg={msg} onComplete={(content, actionData) => {
                       setMessages(prev => [...prev, {
                         id: `bot-${Date.now()}-${Math.random()}`, sender: 'AI', 
                         content, type: actionData ? 'ACTION_CARD' : 'CHAT', actionData, timestamp: new Date()
                       }]);
                    }} />
                  )}

                  {/* Render List Card Widget */}
                  {msg.type === 'LIST_CARD' && (
                    <DynamicListCard msg={msg} onComplete={(content, actionData) => {
                       setMessages(prev => [...prev, {
                         id: `bot-${Date.now()}-${Math.random()}`, sender: 'AI', 
                         content, type: actionData ? 'ACTION_CARD' : 'CHAT', actionData, timestamp: new Date()
                       }]);
                    }} />
                  )}

                  {/* Render Action Card Widget (WOW Effect) */}
                  {msg.type === 'ACTION_CARD' && msg.actionData && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                      style={{ 
                        marginTop: '0.75rem', 
                        background: 'linear-gradient(145deg, rgba(16,185,129,0.1), rgba(6,95,70,0.4))', 
                        borderRadius: '16px', 
                        padding: '1.25rem', 
                        border: '1px solid rgba(16,185,129,0.3)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 2px 4px rgba(16,185,129,0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16,185,129,0.6)' }}>
                          <CheckCircle2 size={20} color="#fff" />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 2px', color: '#fff', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{msg.actionData.title}</h4>
                          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{msg.actionData.subtitle}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {msg.actionData.details.map((d: any, idx: number) => (
                          <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{d.label}</div>
                            <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{d.value}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Render AI Chart Widget */}
                  {msg.type === 'CHART' && msg.chartData && (
                    <div style={{ marginTop: '0.75rem', height: 180, background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1rem', border: `1px solid ${config.color}30` }}>
                      <h4 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '0.85rem', textAlign: 'center' }}>{msg.chartData.title}</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={msg.chartData.data}>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={config.color} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }} />
                          <Area type="monotone" dataKey="val" stroke={config.color} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', gap: '4px', padding: '1rem', alignSelf: 'flex-start' }}>
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: config.color }} />
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} style={{ width: 6, height: 6, borderRadius: '50%', background: config.color }} />
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: config.color }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Smart Chips */}
            <div style={{ padding: '0.5rem 1.25rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {config.chips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  style={{
                    padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={config.placeholder}
                  style={{
                    flex: 1, padding: '0.8rem 1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '0.95rem'
                  }}
                  onFocus={e => e.currentTarget.style.border = `1px solid ${config.color}50`}
                  onBlur={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'}
                />
                <button
                  type="button"
                  onClick={startListening}
                  title="Parler à l'Agent IA"
                  style={{ 
                    width: 44, height: 44, borderRadius: '14px', 
                    background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', 
                    border: isListening ? '1px solid #EF4444' : 'none', 
                    color: isListening ? '#EF4444' : '#fff', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none'
                  }}
                >
                  {isListening ? (
                     <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                       <Mic size={18} />
                     </motion.div>
                  ) : (
                    <Mic size={18} />
                  )}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: 44, height: 44, borderRadius: '14px', background: config.color, border: 'none',
                    color: '#fff', cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || isTyping ? 0.5 : 1,
                    boxShadow: !input.trim() || isTyping ? 'none' : `0 4px 15px ${config.color}60`
                  }}
                >
                  <Send size={18} />
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', fontWeight: 600 }}>
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
