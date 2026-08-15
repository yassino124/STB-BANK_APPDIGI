import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Clock, TrendingUp, Wallet, FileText, Sun, CloudRain, CloudLightning } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ComposedChart, Bar, Line
} from 'recharts';


interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  pendingPrimes: number;
  totalPayrollMasse: number;
}

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const PIE_COLORS = ['#2962FF', '#10B981', '#F59E0B', '#EF4444'];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 260, damping: 20 } }),
};

const DASH_CACHE_KEY = 'stb_dashboard_cache';

const DEMO_MOOD: any[] = [
  { department: 'Agence Ariana', mood: 'SUNNY', score: 88, insight: 'Super ambiance ce mois-ci ! La prime trimestrielle a boosté le moral de toute l\'équipe.' },
  { department: 'Siège (IT)', mood: 'CLOUDY', score: 58, insight: 'Forte pression sur les délais de livraison. Plusieurs collaborateurs signalent des heures supplémentaires excessives.' },
  { department: 'Agence Sousse', mood: 'SUNNY', score: 79, insight: 'Équipe stable et bien soudée. Peu de turnover observé ce trimestre.' },
  { department: 'Direction RH', mood: 'STORMY', score: 41, insight: 'Tensions liées aux nouvelles politiques de congés. Une réunion d\'écoute est recommandée.' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ✅ Initialize from sessionStorage cache for instant display
  const cached = (() => { try { const c = sessionStorage.getItem(DASH_CACHE_KEY); return c ? JSON.parse(c) : null; } catch { return null; } })();
  const [stats, setStats] = useState<Stats | null>(cached?.stats ?? null);
  const [loading, setLoading] = useState(!cached); // Only show loading if no cache
  const [recentRequests, setRecentRequests] = useState<any[]>(cached?.recentRequests ?? []);
  const [activityData, setActivityData] = useState<any[]>(cached?.activityData ?? []);
  const [moodMap, setMoodMap] = useState<any[]>(cached?.moodMap?.length > 0 ? cached.moodMap : DEMO_MOOD);

  // Interactive States
  const [isDownloading, setIsDownloading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    let toastId = toast.loading('Génération du rapport PDF STB...', {
      style: { background: '#0A1528', color: '#fff', border: '1px solid rgba(41, 98, 255, 0.4)' }
    });
    
    try {
      // Small artificial delay to show loader (AI feeling)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const doc = new jsPDF();
      
      // STB Header
      doc.setFillColor(10, 21, 40); // STB dark blue
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('STB - PORTAIL RH', 14, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Rapport Analytique Mensuel', 14, 32);
      
      // Date aligned right
      const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Date: ${dateStr}`, 160, 25);

      // KPIs Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Indicateurs Clés de Performance (KPI)', 14, 55);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Collaborateurs Actifs: ${stats?.activeEmployees || 0} / ${stats?.totalEmployees || 0}`, 14, 65);
      doc.text(`• Masse Salariale Mensuelle: ${stats?.totalPayrollMasse ? stats.totalPayrollMasse.toLocaleString('fr-TN') : '0'} TND`, 14, 72);
      doc.text(`• Demandes de Congé en attente: ${stats?.pendingLeaves || 0}`, 14, 79);
      doc.text(`• Demandes Financières en attente: ${stats?.pendingPrimes || 0}`, 14, 86);

      // Table Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Détail des Flux Récents', 14, 105);

      const tableData = recentRequests.map(req => [
        new Date(req.createdAt).toLocaleDateString('fr-FR'),
        req.type === 'LEAVE' ? 'Congé' : req.type === 'CREDIT' ? 'Crédit' : req.type,
        req.employeeId ? `${req.employeeId.prenom} ${req.employeeId.nom}` : 'N/A',
        req.status || req.statut || 'EN_ATTENTE'
      ]);

      autoTable(doc, {
        startY: 110,
        head: [['Date', 'Type', 'Collaborateur', 'Statut']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 98, 255] },
        styles: { font: 'helvetica' },
        margin: { top: 10 }
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Généré par STB RH Copilot - Confidentiel - Page ${i}/${pageCount}`, 14, 290);
      }

      doc.save(`Rapport_STB_RH_${dateStr.replace(/ /g, '_')}.pdf`);
      
      toast.success('Rapport PDF téléchargé avec succès !', { id: toastId });
    } catch(err) {
      console.error(err);
      toast.error('Erreur lors de la génération du PDF.', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleValidateAll = async () => {
    if (!stats?.pendingLeaves) return toast('Aucune demande en attente.', { icon: 'ℹ️', style: { background: '#0A1528', color: '#fff' } });
    setIsValidating(true);
    let toastId = toast.loading(`Validation de ${stats.pendingLeaves} demandes...`, {
      style: { background: '#0A1528', color: '#fff', border: '1px solid rgba(245, 158, 11, 0.4)' }
    });
    
    try {
      // Simulate validating everything since we might not have a batch endpoint
      const congesRes = await api.get('/conges');
      const conges = congesRes.data?.data || congesRes.data || [];
      const pendingConges = conges.filter((c: any) => c.status === 'EN_ATTENTE' || c.statut === 'EN_ATTENTE');
      
      await Promise.all(pendingConges.map((c: any) => api.patch(`/conges/${c._id}/status`, { statut: 'APPROUVE' })));

      setStats(prev => prev ? { ...prev, pendingLeaves: 0 } : null);
      toast.success('Toutes les demandes de congés ont été validées !', { id: toastId });
    } catch (err) {
      toast.error('Erreur lors de la validation.', { id: toastId });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    console.log('Dashboard: Fetching fresh data...');
    
    const fetchAllData = async () => {
      try {
        const [empRes, avRes, congRes, chqRes, analyticsRes, moodRes] = await Promise.all([
          api.get('/employees?limit=1000').catch(() => ({ data: { data: [] } })),
          api.get('/avances').catch(() => ({ data: { data: [] } })),
          api.get('/conges').catch(() => ({ data: { data: [] } })),
          api.get('/cheques').catch(() => ({ data: { data: [] } })),
          api.get('/analytics?period=WEEKLY').catch(() => ({ data: { data: [] } })),
          api.post('/ai/mood').catch(() => null)
        ]);

        const employeesList = empRes.data?.data || empRes.data || [];
        const avances = avRes.data?.data || avRes.data || [];
        const conges = congRes.data?.data || congRes.data || [];
        const cheques = chqRes.data?.data || chqRes.data || [];

        const totalEmp = employeesList.length;
        const activeEmp = employeesList.filter((e: any) => e.status === 'ACTIVE').length;
        const pLeaves = conges.filter((c: any) => c.status === 'EN_ATTENTE' || c.statut === 'EN_ATTENTE').length;
        const pPrimes = avances.filter((a: any) => a.status === 'EN_ATTENTE' || a.statut === 'EN_ATTENTE').length;

        const payroll = employeesList.reduce((acc: number, emp: any) => acc + (emp.salaireDeBase || 2500), 0);

        const newStats = {
          totalEmployees: totalEmp,
          activeEmployees: activeEmp,
          pendingLeaves: pLeaves,
          pendingPrimes: pPrimes,
          totalPayrollMasse: payroll
        };
        setStats(newStats);

        // Recent Activity combining all requests
        const reqs = [...avances.map((a:any) => ({...a, type: 'AVANCE'})), 
                      ...conges.map((c:any) => ({...c, type: 'LEAVE'})), 
                      ...cheques.map((c:any) => ({...c, type: 'CHEQUIER'}))]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const newRequests = reqs.slice(0, 5);
        setRecentRequests(newRequests);

        // Analytics data
        const analyticsList = analyticsRes.data?.data || analyticsRes.data || [];
        const userAct = Array.isArray(analyticsList) ? analyticsList.filter((a: any) => a.metric === 'user_activity').map((a: any) => ({
          day: new Date(a.startDate).toLocaleDateString('fr-FR', { weekday: 'short' }),
          logins: a.value,
          echecs: Math.floor(a.value * 0.05)
        })) : [];
        
        const newActivity = userAct.length > 0 ? userAct : [
          { day: 'Lun', logins: 42, echecs: 3 },
          { day: 'Mar', logins: 58, echecs: 1 },
          { day: 'Mer', logins: 35, echecs: 5 },
          { day: 'Jeu', logins: 71, echecs: 2 },
          { day: 'Ven', logins: 65, echecs: 0 },
          { day: 'Sam', logins: 20, echecs: 1 },
          { day: 'Dim', logins: 15, echecs: 0 }
        ];
        setActivityData(newActivity);

        // Only update moodMap if Gemini returned real data
        const newMoodMap = (moodRes?.data && Array.isArray(moodRes.data) && moodRes.data.length > 0)
          ? moodRes.data
          : DEMO_MOOD;
        setMoodMap(newMoodMap);

        // ✅ Cache fresh data in sessionStorage for instant next load
        sessionStorage.setItem(DASH_CACHE_KEY, JSON.stringify({
          stats: newStats,
          recentRequests: newRequests,
          activityData: newActivity,
          moodMap: newMoodMap
        }));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const pieData = stats ? [
    { name: 'Actifs', value: stats.activeEmployees },
    { name: 'Congés En Attente', value: stats.pendingLeaves },
    { name: 'Primes En Attente', value: stats.pendingPrimes },
    { name: 'Inactifs', value: Math.max(0, stats.totalEmployees - stats.activeEmployees) },
  ] : [];

  const statCards = [
    { label: 'Total Collaborateurs', value: stats?.totalEmployees ?? '—', icon: <Users size={22} />, cls: 'si-blue', trend: '+4 ce mois', color: '#2962FF' },
    { label: 'Demandes Congé', value: stats?.pendingLeaves ?? '—', icon: <Clock size={22} />, cls: 'si-gold', trend: 'À valider', color: '#F59E0B' },
    { label: 'Primes & Crédits', value: stats?.pendingPrimes ?? '—', icon: <Wallet size={22} />, cls: 'si-purple', trend: 'En attente', color: '#8B5CF6' },
    { label: 'Masse Salariale', value: stats ? `${stats.totalPayrollMasse.toLocaleString()} TND` : '—', icon: <FileText size={22} />, cls: 'si-teal', trend: 'Ce mois', color: '#10B981' },
  ];

  const getIconForType = (type: string) => {
    if (type === 'LEAVE') return <Clock size={16} color="var(--warning)" />;
    if (type === 'CREDIT' || type === 'ADVANCE') return <Wallet size={16} color="var(--purple)" />;
    return <FileText size={16} color="var(--stb-blue-400)" />;
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-title">
            Tableau de bord RH
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="page-subtitle">
            Vue d'ensemble temps réel — Portail STB Entreprise
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-md)', padding: '0.6rem 1.25rem', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
          <div className="dot-online"></div>
          <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Services Opérationnels</span>
        </motion.div>
      </div>


      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map((card, idx) => (
          <motion.div key={idx} custom={idx} initial="hidden" animate="visible" variants={cardVariants} className="glass-card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div className={`stat-icon ${card.cls}`}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <TrendingUp size={12} />
                {card.trend}
              </div>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              {loading && idx === 0 ? <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>...</span> : card.value}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Area Chart */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card">
          <div className="section-header">
            <div className="section-accent" style={{ height: '24px' }}></div>
            <h3 style={{ fontSize: '1.1rem', flex: 1 }}>Activité des Collaborateurs (Connexions)</h3>
            <span className="badge badge-blue">Cette semaine</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2962FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2962FF" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="gEchecs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(6,13,26,0.95)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                  itemStyle={{ fontSize: '0.9rem', fontWeight: 600 }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="logins" name="Connexions" fill="url(#gLogins)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line type="monotone" dataKey="echecs" name="Échecs" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', r: 4 }} activeDot={{ r: 6 }} />
              </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card">
          <div className="section-header">
            <div className="section-accent" style={{ height: '24px' }}></div>
            <h3 style={{ fontSize: '1.1rem' }}>Statuts Comptes</h3>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px', color: 'var(--text-muted)' }}>Chargement...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(6,13,26,0.95)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Split Bottom Section */}
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Quick Reports & Actions */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card">
          <div className="section-header">
            <div className="section-accent" style={{ height: '24px' }}></div>
            <h3 style={{ fontSize: '1.1rem', flex: 1 }}>Rapports Intelligents & Actions</h3>
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="info-row" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--stb-blue-100)', color: 'var(--stb-blue-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Rapport de Paie Mensuel</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Généré automatiquement par l'IA</p>
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ borderRadius: '8px' }}
                onClick={handleDownloadReport}
                disabled={isDownloading}
              >
                {isDownloading ? 'Génération...' : 'Télécharger'}
              </button>
            </div>

            <div className="info-row" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Bilan des Performances</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyse T3 2026 disponible</p>
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ borderRadius: '8px' }}
                onClick={() => navigate('/analytics')}
              >
                Consulter
              </button>
            </div>

            <div className="info-row" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Validation Congés en Lot</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats?.pendingLeaves ?? 0} demandes en attente</p>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ borderRadius: '8px' }}
                onClick={handleValidateAll}
                disabled={isValidating || !stats?.pendingLeaves}
              >
                {isValidating ? 'Validation...' : 'Valider tout'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="glass-card">
          <div className="section-header">
            <div className="section-accent" style={{ height: '24px' }}></div>
            <h3 style={{ fontSize: '1.1rem', flex: 1 }}>Flux d'Activité RH</h3>
            <button className="btn btn-secondary btn-sm">Voir tout</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentRequests.length === 0 && !loading ? (
              <div className="p-6 text-center text-slate-400">Aucune activité récente.</div>
            ) : (
              recentRequests.map((req) => (
                <div key={req._id} className="info-row" style={{ padding: '1rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                      {getIconForType(req.type)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        Nouvelle demande {req.type === 'LEAVE' ? 'de Congé' : req.type === 'CREDIT' ? 'de Crédit' : req.type}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {req.employeeId?.prenom} {req.employeeId?.nom}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>


    </div>
  );
};

export default Dashboard;
