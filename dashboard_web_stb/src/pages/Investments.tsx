import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, DollarSign, Percent, Briefcase, Plus, X,
  ArrowUpRight, Star, Target, Clock, CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface Investment {
  _id: string;
  name: string;
  amount: number;
  returns: number;
  roi: number;
  status: string;
  startDate: string;
  type: string;
}

const FALLBACK_INVESTMENTS: Investment[] = [
  { _id: '1', name: 'Fonds STB Croissance', amount: 250000, returns: 31250, roi: 12.5, status: 'ACTIVE', startDate: '2024-01-15', type: 'FOND' },
  { _id: '2', name: 'Obligations Gouvernementales', amount: 500000, returns: 37500, roi: 7.5, status: 'ACTIVE', startDate: '2024-02-01', type: 'OBLIGATION' },
  { _id: '3', name: 'Plan Retraite Premium', amount: 180000, returns: 16200, roi: 9.0, status: 'ACTIVE', startDate: '2023-11-10', type: 'RETRAITE' },
  { _id: '4', name: 'Actions Tech BVMT', amount: 95000, returns: -4750, roi: -5.0, status: 'REVIEW', startDate: '2024-03-20', type: 'ACTION' },
  { _id: '5', name: 'Immobilier Commercial', amount: 750000, returns: 82500, roi: 11.0, status: 'ACTIVE', startDate: '2023-08-05', type: 'IMMOBILIER' },
];

const GROWTH_DATA = [
  { month: 'Jan', value: 1550000 }, { month: 'Fév', value: 1620000 },
  { month: 'Mar', value: 1580000 }, { month: 'Avr', value: 1710000 },
  { month: 'Mai', value: 1780000 }, { month: 'Jun', value: 1750000 },
  { month: 'Jul', value: 1890000 }, { month: 'Aoû', value: 1950000 },
  { month: 'Sep', value: 1920000 }, { month: 'Oct', value: 2080000 },
  { month: 'Nov', value: 2150000 }, { month: 'Déc', value: 2340000 },
];

const typeColors: Record<string, string> = {
  FOND: '#2962FF', OBLIGATION: '#10B981', RETRAITE: '#8B5CF6',
  ACTION: '#F59E0B', IMMOBILIER: '#EC4899',
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' } }),
};

const tooltipStyle = {
  contentStyle: { backgroundColor: '#0A1121', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' },
  labelStyle: { color: '#F8FAFC', fontWeight: 700 },
  itemStyle: { color: '#94A3B8' },
};

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', type: 'FOND', duration: '' });

  useEffect(() => { fetchInvestments(); }, []);

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/investments');
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : FALLBACK_INVESTMENTS;
      setInvestments(data);
    } catch { setInvestments(FALLBACK_INVESTMENTS); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.amount) { toast.error('Veuillez remplir tous les champs'); return; }
    try {
      await api.post('/investments', { ...form, amount: parseFloat(form.amount) });
      toast.success('Plan d\'investissement créé avec succès');
      setShowModal(false);
      fetchInvestments();
    } catch { toast.error('Erreur lors de la création'); }
  };

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalReturns = investments.reduce((s, i) => s + i.returns, 0);
  const avgROI = investments.length ? investments.reduce((s, i) => s + i.roi, 0) / investments.length : 0;
  const activePlans = investments.filter(i => i.status === 'ACTIVE').length;

  const kpis = [
    { label: 'Total Investi', value: `${(totalInvested / 1_000_000).toFixed(2)}M TND`, icon: DollarSign, color: '#2962FF', bg: 'rgba(41,98,255,0.12)' },
    { label: 'Rendements', value: `+${(totalReturns / 1000).toFixed(1)}k TND`, icon: TrendingUp, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'ROI Moyen', value: `${avgROI.toFixed(1)}%`, icon: Percent, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Plans Actifs', value: String(activePlans), icon: Briefcase, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investissements <span style={{ color: '#10B981' }}>Portfolio</span></h1>
          <p className="page-subtitle">Gestion et suivi de vos placements financiers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nouveau Plan
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10B981', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement du portfolio...</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.label} className="glass-card stat-card" custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ background: kpi.bg, borderRadius: 12, padding: 10 }}>
                    <kpi.icon size={22} style={{ color: kpi.color }} />
                  </div>
                  <ArrowUpRight size={16} style={{ color: kpi.color }} />
                </div>
                <p style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.value}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>{kpi.label}</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${kpi.color}, transparent)`, borderRadius: '0 0 var(--r-xl) var(--r-xl)' }} />
              </motion.div>
            ))}
          </div>

          {/* Growth Chart */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <div className="section-accent" style={{ height: 22, background: 'linear-gradient(to bottom, #10B981, #059669)' }} />
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>Croissance du Portfolio</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Valeur cumulée sur 12 mois</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={GROWTH_DATA} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1_000_000).toFixed(1)}M`} />
                <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v.toLocaleString('fr-TN')} TND`, 'Valeur']} />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fill="url(#growthGrad)" dot={false} activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Investments Table */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <div className="section-header">
              <div className="section-accent" style={{ height: 22 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>Plans d'Investissement</h3>
            </div>
            <div className="table-wrap">
              <table className="stb-table">
                <thead>
                  <tr>
                    <th>Plan</th><th>Type</th><th>Montant Investi</th><th>Rendement</th><th>ROI</th><th>Statut</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv, i) => (
                    <motion.tr key={inv._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${typeColors[inv.type] || '#2962FF'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={16} style={{ color: typeColors[inv.type] || '#2962FF' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inv.name}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="chip chip-blue">{inv.type}</span></td>
                      <td><span style={{ fontWeight: 700 }}>{inv.amount.toLocaleString('fr-TN')} TND</span></td>
                      <td>
                        <span style={{ fontWeight: 700, color: inv.returns >= 0 ? '#10B981' : '#EF4444' }}>
                          {inv.returns >= 0 ? '+' : ''}{inv.returns.toLocaleString('fr-TN')} TND
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: inv.roi >= 0 ? '#10B981' : '#EF4444' }}>
                          {inv.roi >= 0 ? <ArrowUpRight size={14} /> : null}{inv.roi}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${inv.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'}`}>
                          {inv.status === 'ACTIVE' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(inv.startDate).toLocaleDateString('fr-TN')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>Nouveau Plan</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Créer un plan d'investissement</p>
                </div>
                <button className="btn-icon btn" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="form-group">
                <label className="form-label">Nom du Plan</label>
                <input className="form-input" placeholder="Ex: Fonds STB Croissance" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Montant (TND)</label>
                <input className="form-input" type="number" placeholder="100000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="FOND">Fond</option>
                    <option value="OBLIGATION">Obligation</option>
                    <option value="ACTION">Action</option>
                    <option value="RETRAITE">Retraite</option>
                    <option value="IMMOBILIER">Immobilier</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Durée (mois)</label>
                  <input className="form-input" type="number" placeholder="12" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Annuler</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate}><Target size={16} /> Créer le Plan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Investments;
