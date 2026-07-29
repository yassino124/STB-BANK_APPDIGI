import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Wallet, TrendingDown, AlertCircle, Plus, X,
  ShoppingCart, Home, Car, Utensils, Plane, HeartPulse,
  Cpu, GraduationCap, MoreHorizontal, CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Budget {
  _id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
}

const FALLBACK_BUDGETS: Budget[] = [
  { _id: '1', category: 'Alimentation', allocated: 45000, spent: 32400, period: 'MONTHLY' },
  { _id: '2', category: 'Logement', allocated: 120000, spent: 118000, period: 'MONTHLY' },
  { _id: '3', category: 'Transport', allocated: 30000, spent: 18700, period: 'MONTHLY' },
  { _id: '4', category: 'Santé', allocated: 25000, spent: 9800, period: 'MONTHLY' },
  { _id: '5', category: 'Technologie', allocated: 20000, spent: 21500, period: 'MONTHLY' },
  { _id: '6', category: 'Formation', allocated: 15000, spent: 7200, period: 'MONTHLY' },
  { _id: '7', category: 'Voyages', allocated: 50000, spent: 14300, period: 'MONTHLY' },
  { _id: '8', category: 'Loisirs', allocated: 18000, spent: 11600, period: 'MONTHLY' },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Alimentation: Utensils, Logement: Home, Transport: Car, Santé: HeartPulse,
  Technologie: Cpu, Formation: GraduationCap, Voyages: Plane, Loisirs: ShoppingCart,
};

const COLORS = ['#2962FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#00BFA5', '#F97316'];

const cardVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' } }),
};

const tooltipStyle = {
  contentStyle: { backgroundColor: '#0A1121', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' },
  labelStyle: { color: '#F8FAFC', fontWeight: 700 },
  itemStyle: { color: '#94A3B8' },
};

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', allocated: '', period: 'MONTHLY' });

  useEffect(() => { fetchBudgets(); }, []);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : FALLBACK_BUDGETS;
      setBudgets(data);
    } catch { setBudgets(FALLBACK_BUDGETS); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.category || !form.allocated) { toast.error('Veuillez remplir tous les champs'); return; }
    try {
      await api.post('/budgets', { ...form, allocated: parseFloat(form.allocated) });
      toast.success('Budget créé avec succès !');
      setShowModal(false);
      fetchBudgets();
    } catch { toast.error('Erreur lors de la création'); }
  };

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const utilization = totalAllocated ? (totalSpent / totalAllocated) * 100 : 0;

  const pieData = budgets.map((b, i) => ({ name: b.category, value: b.allocated, color: COLORS[i % COLORS.length] }));

  const getStatusColor = (spent: number, allocated: number) => {
    const pct = (spent / allocated) * 100;
    if (pct >= 100) return '#EF4444';
    if (pct >= 80) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des <span style={{ color: '#F59E0B' }}>Budgets</span></h1>
          <p className="page-subtitle">Planification et suivi budgétaire par catégorie</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nouveau Budget
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#F59E0B', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement des budgets...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Budget Total', value: `${(totalAllocated / 1000).toFixed(0)}k TND`, icon: Wallet, color: '#2962FF', bg: 'rgba(41,98,255,0.12)' },
              { label: 'Total Dépensé', value: `${(totalSpent / 1000).toFixed(0)}k TND`, icon: TrendingDown, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
              { label: 'Restant', value: `${(totalRemaining / 1000).toFixed(0)}k TND`, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
              { label: 'Utilisation', value: `${utilization.toFixed(1)}%`, icon: AlertCircle, color: utilization > 90 ? '#EF4444' : '#F59E0B', bg: utilization > 90 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)' },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} className="glass-card stat-card" custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ background: kpi.bg, borderRadius: 12, padding: 10 }}><kpi.icon size={22} style={{ color: kpi.color }} /></div>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `conic-gradient(${kpi.color} ${utilization * 3.6}deg, rgba(255,255,255,0.05) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card)' }} />
                  </div>
                </div>
                <p style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.value}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>{kpi.label}</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${kpi.color}, transparent)`, borderRadius: '0 0 var(--r-xl) var(--r-xl)' }} />
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Budget Progress Bars */}
            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="section-header">
                <div className="section-accent" style={{ height: 22, background: 'linear-gradient(to bottom, #F59E0B, #D97706)' }} />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>Budgets par Catégorie</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{budgets.length} catégories actives</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {budgets.map((budget, i) => {
                  const pct = Math.min((budget.spent / budget.allocated) * 100, 100);
                  const statusColor = getStatusColor(budget.spent, budget.allocated);
                  const Icon = CATEGORY_ICONS[budget.category] || MoreHorizontal;
                  return (
                    <motion.div key={budget._id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${COLORS[i % COLORS.length]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={16} style={{ color: COLORS[i % COLORS.length] }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{budget.category}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{budget.period}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                            <span style={{ color: statusColor }}>{budget.spent.toLocaleString('fr-TN')}</span>
                            <span style={{ color: 'var(--text-muted)' }}> / {budget.allocated.toLocaleString('fr-TN')}</span>
                          </p>
                          <p style={{ fontSize: '0.75rem', color: statusColor, fontWeight: 700 }}>{pct.toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="progress-bar" style={{ height: 8 }}>
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: 'easeOut' }}
                          style={{ background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${statusColor})` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="section-header">
                <div className="section-accent" style={{ height: 22, background: 'linear-gradient(to bottom, #8B5CF6, #7C3AED)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>Répartition</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v.toLocaleString('fr-TN')} TND`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i] }} />
                      <span style={{ fontSize: '0.8rem' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS[i] }}>
                      {((item.value / totalAllocated) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" style={{ width: '100%', maxWidth: 440, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>Nouveau Budget</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Définir un plafond budgétaire</p>
                </div>
                <button className="btn-icon btn" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <input className="form-input" placeholder="Ex: Alimentation" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Montant Alloué (TND)</label>
                <input className="form-input" type="number" placeholder="50000" value={form.allocated} onChange={e => setForm({ ...form, allocated: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Période</label>
                <select className="form-input" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                  <option value="MONTHLY">Mensuel</option>
                  <option value="QUARTERLY">Trimestriel</option>
                  <option value="YEARLY">Annuel</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate}><Plus size={16} /> Créer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Budgets;
