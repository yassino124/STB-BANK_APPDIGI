import { useEffect, useState } from 'react';
import { TrendingUp, Wallet, FileText, AlertTriangle, Clock, Users, Banknote, CreditCard, PieChart, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, AreaChart, Area
} from 'recharts';

const PIE_COLORS = ['#2962FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const FinanceDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, payrollRes, budgetRes] = await Promise.all([
          api.get('/finance/dashboard/stats').catch(() => null),
          api.get('/finance/payroll').catch(() => null),
          api.get('/finance/budgets').catch(() => null),
        ]);

        setStats(statsRes?.data?.data || { totalPayrolls: 0, totalPayrollAmount: 0, pendingPayrolls: 0, activeBudgets: 0, totalBudgetAmount: 0, activeInvestments: 0 });
        setPayrollData(payrollRes?.data?.data || []);
        setBudgetData(budgetRes?.data?.data || []);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
        toast.error('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Fiches de Paie', value: stats?.totalPayrolls ?? 0, sub: 'ce mois', icon: FileText, color: '#2962FF', bg: 'rgba(41,98,255,0.1)' },
    { label: 'Masse Salariale', value: `${(stats?.totalPayrollAmount ?? 0).toLocaleString('fr-FR')} TND`, sub: 'total', icon: Banknote, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'En Attente', value: stats?.pendingPayrolls ?? 0, sub: 'à valider', icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Budgets Actifs', value: stats?.activeBudgets ?? 0, sub: 'en cours', icon: Wallet, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Investissements', value: stats?.activeInvestments ?? 0, sub: 'actifs', icon: TrendingUp, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
          Dashboard Finance
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vue d'ensemble financière — {user?.matricule}</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={20} color={card.color} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{card.sub}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Payroll Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            <BarChart3 size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#2962FF' }} />
            Masse Salariale (6 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[
              { month: 'Fév', salaire: 3800000, bonus: 420000 },
              { month: 'Mar', salaire: 3900000, bonus: 380000 },
              { month: 'Avr', salaire: 4100000, bonus: 450000 },
              { month: 'Mai', salaire: 4000000, bonus: 410000 },
              { month: 'Jun', salaire: 4200000, bonus: 480000 },
              { month: 'Jul', salaire: stats?.totalPayrollAmount ?? 4200000, bonus: 460000 },
            ]}>
              <defs>
                <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2962FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2962FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(6,13,26,0.95)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: '#fff' }} />
              <Area type="monotone" dataKey="salaire" stroke="#2962FF" strokeWidth={2} fill="url(#salGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Budget Allocation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            <PieChart size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#10B981' }} />
            Répartition des Budgets
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RePieChart>
              <Pie data={budgetData.length > 0 ? budgetData : [
                { name: 'Opérations', value: 40 },
                { name: 'RH', value: 25 },
                { name: 'IT', value: 20 },
                { name: 'Marketing', value: 15 },
              ]} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {budgetData.length > 0 ? budgetData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />) : 
                  [0,1,2,3].map((i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(6,13,26,0.95)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: '#fff' }} />
            </RePieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Payroll Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
          <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#2962FF' }} />
          Dernières Fiches de Paie
        </h3>
        {payrollData.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Aucune fiche de paie récente</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employé</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mois</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brut</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.slice(0, 5).map((p: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{p?.employeeId?.prenom} {p?.employeeId?.nom}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p?.month ?? '—'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 600 }}>{p?.grossAmount?.toLocaleString('fr-FR')} TND</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 700 }}>{p?.netAmount?.toLocaleString('fr-FR')} TND</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: p?.status === 'PAID' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: p?.status === 'PAID' ? '#10B981' : '#F59E0B' }}>
                        {p?.status ?? 'EN_ATTENTE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FinanceDashboard;
