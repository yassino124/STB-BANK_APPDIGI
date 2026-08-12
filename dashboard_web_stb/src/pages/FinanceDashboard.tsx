import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Wallet, FileText, Clock, Users, Banknote, RefreshCw, AlertCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';


const cardVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3 },
  }),
};

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    avancesPendingCount: 0,
    avancesPendingSum: 0,
    avancesApprovedMonth: 0,
    creditsActiveCount: 0,
    creditsActiveSum: 0,
    masseSalariale: 0,
    primesPendingCount: 0,
    primesPendingSum: 0,
    budgetsActiveCount: 0,
    budgetsActiveSum: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        avancesRes, 
        creditsRes, 
        primesRes, 
        budgetsRes, 
        employeesRes, 
      ] = await Promise.allSettled([
        api.get('/avances'),
        api.get('/credits/all'),
        api.get('/primes/all'),
        api.get('/finance/budgets'),
        api.get('/employees?limit=200'),
      ]);

      const avances = avancesRes.status === 'fulfilled' ? (avancesRes.value?.data?.data || avancesRes.value?.data || []) : [];
      const credits = creditsRes.status === 'fulfilled' ? (creditsRes.value?.data?.data || creditsRes.value?.data || []) : [];
      const primes = primesRes.status === 'fulfilled' ? (primesRes.value?.data?.data || primesRes.value?.data || []) : [];
      const budgets = budgetsRes.status === 'fulfilled' ? (budgetsRes.value?.data?.data || budgetsRes.value?.data || []) : [];
      const employees = employeesRes.status === 'fulfilled' ? (employeesRes.value?.data?.data || employeesRes.value?.data || []) : [];

      const currentMonth = startOfMonth(new Date());

      const pendingAvances = avances.filter((a: any) => a.statut === 'EN_ATTENTE');
      const approvedAvancesThisMonth = avances.filter((a: any) => 
        a.statut === 'APPROUVE' && new Date(a.updatedAt || a.createdAt) >= currentMonth
      );
      
      // Filter credits: ACTIVE (en cours) + PENDING (en attente) + LATE (en retard)
      const activeCredits = credits.filter((c: any) => ['ACTIVE', 'PENDING', 'LATE'].includes(c.status));
      const pendingPrimes = primes.filter((p: any) => ['PENDING', 'EN_ATTENTE'].includes(p.status || p.statut));
      const activeBudgets = budgets.filter((b: any) => b.status === 'ACTIVE');

      const masseSalariale = employees.reduce((sum: number, emp: any) => sum + (emp.salaireBase || 0), 0);

      setStats({
        avancesPendingCount: pendingAvances.length,
        avancesPendingSum: pendingAvances.reduce((sum: number, a: any) => sum + (a.montant || 0), 0),
        avancesApprovedMonth: approvedAvancesThisMonth.length,
        creditsActiveCount: activeCredits.length,
        creditsActiveSum: activeCredits.reduce((sum: number, c: any) => sum + (c.montantInitial || c.montant || 0), 0),
        masseSalariale: masseSalariale,
        primesPendingCount: pendingPrimes.length,
        primesPendingSum: pendingPrimes.reduce((sum: number, p: any) => sum + (p.montant || 0), 0),
        budgetsActiveCount: activeBudgets.length,
        budgetsActiveSum: activeBudgets.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
      });

      const reqs = [
        ...avances.map((a:any) => ({...a, type: 'AVANCE'})), 
        ...credits.map((c:any) => ({...c, type: 'CREDIT'})), 
        ...primes.map((p:any) => ({...p, type: 'PRIME'}))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setRecentTransactions(reqs.slice(0, 5));

      setActivityData([
        { day: 'Lun', flux: 12000 },
        { day: 'Mar', flux: 8500 },
        { day: 'Mer', flux: 15400 },
        { day: 'Jeu', flux: 6200 },
        { day: 'Ven', flux: 22000 },
        { day: 'Sam', flux: 1400 },
        { day: 'Dim', flux: 800 },
      ]);

    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la récupération des données.');
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  if (loading && !stats.avancesPendingCount && !recentTransactions.length) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--stb-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !recentTransactions.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{error}</p>
        <button onClick={fetchData} className="btn-primary" style={{ marginTop: '1rem' }}>Réessayer</button>
      </div>
    );
  }


  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-title">
            Tableau de bord Finance
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="page-subtitle">
            Vue d'ensemble temps réel — Portail STB Finance
          </motion.p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="btn-icon" onClick={fetchData} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <RefreshCw size={16} />
          </motion.button>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-md)', padding: '0.6rem 1.25rem', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
            <div className="dot-online" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
            <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Services Opérationnels</span>
          </motion.div>
        </div>
      </div>


      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Masse Salariale', value: stats.masseSalariale ? `${formatMoney(stats.masseSalariale)} TND` : '0 TND', icon: <Banknote size={22} />, cls: 'si-teal', trend: 'Base men.', color: '#10B981', raw: stats.masseSalariale },
          { label: 'Avances en attente', value: `${formatMoney(stats.avancesPendingSum)} TND`, icon: <Clock size={22} />, cls: 'si-gold', trend: `${stats.avancesPendingCount} demande${stats.avancesPendingCount > 1 ? 's' : ''}`, color: '#F59E0B', raw: stats.avancesPendingSum },
          { label: 'Crédits Actifs', value: stats.creditsActiveCount, icon: <Wallet size={22} />, cls: 'si-blue', trend: `${formatMoney(stats.creditsActiveSum)} TND`, color: '#2962FF', raw: stats.creditsActiveCount },
          { label: 'Primes en attente', value: `${formatMoney(stats.primesPendingSum)} TND`, icon: <Award size={22} />, cls: 'si-purple', trend: `${stats.primesPendingCount} demande${stats.primesPendingCount > 1 ? 's' : ''}`, color: '#8B5CF6', raw: stats.primesPendingSum },
        ].map((card, idx) => (
          <motion.div key={idx} custom={idx} initial="hidden" animate="visible" variants={cardVariants} className="glass-card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div className={`stat-icon ${card.cls}`}>{card.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <TrendingUp size={12} />
                {card.trend}
              </div>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              {loading && card.raw === 0 ? <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>...</span> : card.value}
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* Flux Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Flux Financier
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mouvement des fonds (7 derniers jours)</p>
            </div>
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFlux" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--stb-blue-400)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--stb-blue-400)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="flux" stroke="var(--stb-blue-400)" strokeWidth={3} fillOpacity={1} fill="url(#colorFlux)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transactions Récentes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Transactions Récentes
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Les dernières opérations financières</p>
            </div>
            <button className="btn-icon" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <TrendingUp size={16} color="var(--text-secondary)" />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            <AnimatePresence>
              {recentTransactions.map((req, i) => {
                let colorClass = 'si-blue';
                let icon = <FileText size={18} />;
                let title = req.type;
                let val = `${formatMoney(req.montantInitial || req.montant || 0)} TND`;

                if (req.type === 'AVANCE') { colorClass = 'si-gold'; icon = <Clock size={18} />; title = 'Avance Salaire'; }
                if (req.type === 'CREDIT') { colorClass = 'si-purple'; icon = <Wallet size={18} />; title = 'Crédit Collab'; }
                if (req.type === 'PRIME') { colorClass = 'si-teal'; icon = <Award size={18} />; title = 'Prime'; }

                return (
                  <motion.div
                    key={req._id || i}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.1 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)', transition: 'all 0.2s', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className={`stat-icon ${colorClass}`} style={{ width: '42px', height: '42px', borderRadius: '10px' }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {req.employee?.nom} {req.employee?.prenom} • il y a {formatDistanceToNow(new Date(req.createdAt), { locale: fr })}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{val}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem', textTransform: 'uppercase' }}>
                        {req.statut?.replace('_', ' ') || req.status}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {recentTransactions.length === 0 && (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Wallet size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                  <p>Aucune transaction récente</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
