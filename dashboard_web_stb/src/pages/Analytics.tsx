import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  Activity, TrendingUp, Users, ShieldAlert, ArrowUpRight,
  ArrowDownRight, Calendar, DollarSign, CreditCard, Building, Briefcase, Zap
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: ['#3B82F6', '#60A5FA', '#93C5FD'],
  success: ['#10B981', '#34D399', '#6EE7B7'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D'],
  danger: ['#EF4444', '#F87171', '#FCA5A5'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
  pie: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
};

const tooltipStyle = {
  contentStyle: { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' },
  itemStyle: { fontSize: '1rem', fontWeight: 700 },
  labelStyle: { color: '#94A3B8', marginBottom: '0.5rem', fontWeight: 600 }
};

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Determine allowed tabs based on roles
  const canSeeHR = user?.roles?.some((r: string) => ['RH', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(r));
  const canSeeFinance = user?.roles?.some((r: string) => ['FINANCE', 'ADMIN', 'SUPER_ADMIN'].includes(r));
  const canSeeAgency = user?.roles?.some((r: string) => ['AGENCE', 'ADMIN', 'SUPER_ADMIN'].includes(r));
  
  const [activeTab, setActiveTab] = useState<'HR' | 'FINANCE' | 'AGENCE'>(
    canSeeHR ? 'HR' : canSeeFinance ? 'FINANCE' : 'AGENCE'
  );

  const [data, setData] = useState({
    hr: { headcount: 0, turnover: 0, leaveTrends: [] as any[], salaryDist: [] as any[], skillsRadar: [] as any[], salaryVsExperience: [] as any[] },
    finance: { payrollTotal: 0, creditExposure: 0, advancesTotal: 0, financialRisk: [] as any[] },
    agency: { totalAccounts: 0, totalCards: 0, transactionsTrend: [] as any[], customerActivity: [] as any[], activityHeatmap: [] as any[] }
  });

  useEffect(() => { fetchAnalytics(); }, [activeTab]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/advanced-analytics');
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>{title}</p>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{value}</h3>
        </div>
        <div style={{ padding: '0.75rem', background: `rgba(${color}, 0.1)`, borderRadius: '12px', color: `rgb(${color})` }}>
          <Icon size={24} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.85rem' }}>
        <span style={{ color: trend > 0 ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {Math.abs(trend)}%
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</span>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '60px', height: '60px', border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: '#3B82F6', fontWeight: 600, letterSpacing: '2px' }}>GÉNÉRATION DES ANALYTIQUES...</div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none' }} />
      
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff' }}>
            <div style={{ padding: '0.8rem', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(59,130,246,0.4)' }}>
              <Activity size={32} color="#fff" />
            </div>
            Advanced Analytics
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '1.1rem', paddingLeft: '4.5rem' }}>
            Tableaux de bord analytiques complets et dynamiques
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {canSeeHR && (
            <button onClick={() => setActiveTab('HR')} style={{ padding: '0.75rem 1.5rem', background: activeTab === 'HR' ? 'rgba(59,130,246,0.15)' : 'transparent', color: activeTab === 'HR' ? '#60A5FA' : 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <Users size={18} /> HR Analytics
            </button>
          )}
          {canSeeFinance && (
            <button onClick={() => setActiveTab('FINANCE')} style={{ padding: '0.75rem 1.5rem', background: activeTab === 'FINANCE' ? 'rgba(16,185,129,0.15)' : 'transparent', color: activeTab === 'FINANCE' ? '#34D399' : 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <DollarSign size={18} /> Finance
            </button>
          )}
          {canSeeAgency && (
            <button onClick={() => setActiveTab('AGENCE')} style={{ padding: '0.75rem 1.5rem', background: activeTab === 'AGENCE' ? 'rgba(139,92,246,0.15)' : 'transparent', color: activeTab === 'AGENCE' ? '#A78BFA' : 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
              <Building size={18} /> Agence
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ===================== HR ANALYTICS ===================== */}
        {activeTab === 'HR' && (
          <motion.div key="hr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <StatCard title="Effectif Total" value={data.hr.headcount} subtitle="vs mois précédent" icon={Users} color="59, 130, 246" trend={2.4} />
              <StatCard title="Turnover Rate" value={`${data.hr.turnover}%`} subtitle="Moyenne annuelle" icon={TrendingUp} color="245, 158, 11" trend={-0.5} />
              <StatCard title="Nouvelles Recrues" value="45" subtitle="Ce trimestre" icon={Briefcase} color="16, 185, 129" trend={12.5} />
              <StatCard title="Taux d'absentéisme" value="1.8%" subtitle="vs mois précédent" icon={Calendar} color="239, 68, 68" trend={0.2} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar color="#60A5FA" /> Tendances des Congés & Absences
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.hr.leaveTrends}>
                      <defs>
                        <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSick" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                      <YAxis stroke="rgba(255,255,255,0.3)" />
                      <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} labelStyle={tooltipStyle.labelStyle} />
                      <Area type="monotone" dataKey="leaves" name="Congés Payés" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorLeaves)" style={{ filter: 'drop-shadow(0 4px 8px rgba(59,130,246,0.5))' }} activeDot={{ r: 8, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="sickness" name="Maladie" stroke="#EF4444" strokeWidth={4} fillOpacity={1} fill="url(#colorSick)" style={{ filter: 'drop-shadow(0 4px 8px rgba(239,68,68,0.5))' }} activeDot={{ r: 8, fill: '#EF4444', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <DollarSign color="#10B981" /> Distribution Salaires
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.hr.salaryDist} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={5} dataKey="value" stroke="rgba(15,23,42,0.8)" strokeWidth={2}>
                        {data.hr.salaryDist.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} style={{ filter: `drop-shadow(0 0 10px ${COLORS.pie[index % COLORS.pie.length]}80)` }} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} labelStyle={tooltipStyle.labelStyle} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Zap color="#8B5CF6" /> Compétences &amp; Performance
                </h3>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.hr.skillsRadar}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar name="Équipe A" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                      <Radar name="Équipe B" dataKey="B" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                      <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                      <Legend verticalAlign="bottom" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Briefcase color="#F59E0B" /> Salaire vs Expérience (Années)
                </h3>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" dataKey="experience" name="Expérience" unit=" ans" stroke="rgba(255,255,255,0.3)" />
                      <YAxis type="number" dataKey="salary" name="Salaire" unit=" TND" stroke="rgba(255,255,255,0.3)" />
                      <ZAxis type="category" dataKey="role" name="Rôle" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                      <Scatter name="Collaborateurs" data={data.hr.salaryVsExperience} fill="#F59E0B">
                        {data.hr.salaryVsExperience?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== FINANCE ANALYTICS ===================== */}
        {activeTab === 'FINANCE' && (
          <motion.div key="finance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <StatCard title="Masse Salariale Mensuelle" value={`${(data.finance.payrollTotal / 1000000).toFixed(2)}M TND`} subtitle="vs mois précédent" icon={DollarSign} color="16, 185, 129" trend={1.2} />
              <StatCard title="Exposition Crédits" value={`${(data.finance.creditExposure / 1000000).toFixed(2)}M TND`} subtitle="Total Encours" icon={Briefcase} color="59, 130, 246" trend={4.5} />
              <StatCard title="Total Avances" value={`${(data.finance.advancesTotal / 1000).toFixed(0)}K TND`} subtitle="Ce mois" icon={Zap} color="245, 158, 11" trend={-2.1} />
              <StatCard title="Risque Financier (NPL)" value="2.4%" subtitle="Taux de créances douteuses" icon={ShieldAlert} color="239, 68, 68" trend={-0.3} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Activity color="#34D399" /> Évolution du Risque et des Remboursements
                </h3>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.finance.financialRisk}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" />
                      <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} labelStyle={tooltipStyle.labelStyle} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="repayments" name="Remboursements (TND)" fill="url(#colorLeaves)" radius={[6, 6, 0, 0]} barSize={40} />
                      <Line yAxisId="right" type="monotone" dataKey="riskScore" name="Score de Risque" stroke="#EF4444" strokeWidth={4} dot={{ r: 5, fill: '#0F111A', strokeWidth: 2, stroke: '#EF4444' }} activeDot={{ r: 8, fill: '#EF4444', stroke: '#fff', strokeWidth: 2 }} style={{ filter: 'drop-shadow(0 4px 8px rgba(239,68,68,0.5))' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== AGENCY ANALYTICS ===================== */}
        {activeTab === 'AGENCE' && (
          <motion.div key="agency" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <StatCard title="Comptes Actifs" value={data.agency.totalAccounts.toLocaleString()} subtitle="Clients de l'agence" icon={Users} color="139, 92, 246" trend={3.8} />
              <StatCard title="Cartes Émises" value={data.agency.totalCards.toLocaleString()} subtitle="Total circulation" icon={CreditCard} color="59, 130, 246" trend={5.2} />
              <StatCard title="Nouvelles Demandes" value="142" subtitle="Ce mois" icon={Activity} color="16, 185, 129" trend={15.0} />
              <StatCard title="Alertes Fraude" value="12" subtitle="En cours d'investigation" icon={ShieldAlert} color="239, 68, 68" trend={-10.0} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <TrendingUp color="#A78BFA" /> Volume des Transactions
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.agency.transactionsTrend}>
                      <defs>
                        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                      <YAxis stroke="rgba(255,255,255,0.3)" />
                      <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} labelStyle={tooltipStyle.labelStyle} />
                      <Area type="monotone" dataKey="volume" name="Transactions" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorTx)" style={{ filter: 'drop-shadow(0 4px 8px rgba(139,92,246,0.5))' }} activeDot={{ r: 8, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users color="#60A5FA" /> Statut Clients
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.agency.customerActivity} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.6)" fontWeight={600} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                      <Bar dataKey="value" name="Clients" radius={[0, 8, 8, 0]} barSize={24}>
                        {data.agency.customerActivity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(180deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Activity color="#EF4444" /> Carte Thermique: Activité Hebdomadaire
                </h3>
                
                {/* Custom Heatmap Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowX: 'auto', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '40px' }}>
                    {['8h', '10h', '12h', '14h', '16h', '18h'].map(h => (
                      <div key={h} style={{ width: '40px', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{h}</div>
                    ))}
                  </div>
                  
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <div style={{ width: '36px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{day}</div>
                      {['8h', '10h', '12h', '14h', '16h', '18h'].map(hour => {
                        const cell = data.agency.activityHeatmap?.find((c: any) => c.day === day && c.hour === hour);
                        const val = cell?.value ?? 0;
                        const opacity = val / 100; // Assuming max is ~100
                        const bgColor = val > 75 ? `rgba(239, 68, 68, ${opacity})` // Red (High)
                                      : val > 40 ? `rgba(245, 158, 11, ${opacity})` // Orange (Medium)
                                      : `rgba(59, 130, 246, ${Math.max(opacity, 0.1)})`; // Blue (Low)
                        
                        return (
                          <div
                            key={`${day}-${hour}`}
                            title={`${val} transactions`}
                            style={{
                              width: '40px', height: '40px', borderRadius: '6px',
                              background: bgColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.65rem', color: opacity > 0.4 ? '#fff' : 'rgba(255,255,255,0.3)',
                              fontWeight: 700,
                              cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.boxShadow = `0 4px 12px ${bgColor}`;
                              e.currentTarget.style.zIndex = '10';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.zIndex = '1';
                            }}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    <span>Activité Faible</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(59, 130, 246, 0.3)' }} />
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(245, 158, 11, 0.6)' }} />
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239, 68, 68, 0.9)' }} />
                    </div>
                    <span>Activité Élevée</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;
