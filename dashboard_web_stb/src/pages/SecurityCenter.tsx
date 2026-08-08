import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle, Search, Activity, Fingerprint, Lock, ShieldAlert, Monitor, User } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SecurityAlert {
  _id: string;
  type: string;
  riskScore?: number;
  severity?: string;
  factors?: string[];
  description?: string;
  status: string;
  createdAt: string;
  employeeId?: { nom: string; prenom: string; matricule: string };
}

// Dynamically fetched now

const SecurityCenter = () => {
  const { isIT, isFinance, isRH, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'IT' | 'FINANCE' | 'ANALYTICS'>(
    isIT ? 'IT' : isFinance ? 'FINANCE' : 'ANALYTICS'
  );
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  // Fetch logic based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'IT' || activeTab === 'FINANCE') {
          const endpoint = activeTab === 'IT' ? '/fraud-detections' : '/risk-alerts';
          const [alertsRes, summaryRes] = await Promise.all([
            api.get(endpoint),
            api.get(`${endpoint}/summary`)
          ]);
          setAlerts(alertsRes.data?.data || alertsRes.data || []);
          setSummary(summaryRes.data || null);
        } else if (activeTab === 'ANALYTICS') {
          const [fraudRes, riskRes] = await Promise.all([
            api.get('/fraud-detections/monthly'),
            api.get('/risk-alerts/monthly')
          ]);
          
          const fraudData = fraudRes.data || [];
          const riskData = riskRes.data || [];
          
          // Merge data by month
          const merged = fraudData.map((fd: any) => {
            const rd = riskData.find((r: any) => r.month === fd.month && r.year === fd.year);
            return {
              month: fd.month,
              fraudes: fd.total || 0,
              alertes: rd?.total || 0
            };
          });
          setAnalyticsData(merged);
        }
      } catch (err) {
        console.error('Error fetching security data', err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchData();
  }, [activeTab]);

  const getRiskLevel = (score: number) => {
    if (score >= 85) return { label: 'CRITIQUE', color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'rgba(239,68,68,0.3)' };
    if (score >= 70) return { label: 'ÉLEVÉ', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' };
    if (score >= 40) return { label: 'MOYEN', color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'rgba(245,158,11,0.3)' };
    return { label: 'FAIBLE', color: 'var(--stb-blue-400)', bg: 'var(--stb-blue-100)', border: 'var(--border-blue)' };
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'rgba(239,68,68,0.3)', label: 'CRITIQUE' };
      case 'HIGH': return { color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: 'ÉLEVÉ' };
      case 'MEDIUM': return { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'rgba(245,158,11,0.3)', label: 'MOYEN' };
      default: return { color: 'var(--stb-blue-400)', bg: 'var(--stb-blue-100)', border: 'var(--border-blue)', label: 'FAIBLE' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Header ── */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(10,17,33,0.9) 100%)',
        borderColor: 'rgba(124,58,237,0.2)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon si-purple" style={{ width: 56, height: 56, borderRadius: 16 }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>Security & Risk Center</h1>
            <p className="page-subtitle">Plateforme unifiée de surveillance des menaces, fraudes et risques</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          {(isIT || isAdmin) && (
            <button onClick={() => setActiveTab('IT')} className={`btn ${activeTab === 'IT' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 1rem', background: activeTab === 'IT' ? '' : 'transparent', border: 'none', boxShadow: 'none' }}>
              <Monitor size={16} /> IT Ops
            </button>
          )}
          {(isFinance || isAdmin) && (
            <button onClick={() => setActiveTab('FINANCE')} className={`btn ${activeTab === 'FINANCE' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 1rem', background: activeTab === 'FINANCE' ? '' : 'transparent', border: 'none', boxShadow: 'none' }}>
              <AlertTriangle size={16} /> Risk
            </button>
          )}
          {(isRH || isAdmin) && (
            <button onClick={() => setActiveTab('ANALYTICS')} className={`btn ${activeTab === 'ANALYTICS' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 1rem', background: activeTab === 'ANALYTICS' ? '' : 'transparent', border: 'none', boxShadow: 'none' }}>
              <Activity size={16} /> Analytics
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="glass-card-sm" style={{ height: 100, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
          <div className="glass-card" style={{ height: 400, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:0.9} }`}</style>
        </div>
      ) : (
        <>
          {/* ── IT Operations View (Fraud/Security) ── */}
          {activeTab === 'IT' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div className="glass-card-sm"><div className="stat-icon si-blue" style={{marginBottom:12}}><Shield size={20}/></div><p style={{color:'var(--text-secondary)'}}>Total Fraudes</p><h3 style={{fontSize:'2rem', margin:0}}>{summary?.total || 0}</h3></div>
                <div className="glass-card-sm"><div className="stat-icon si-red" style={{marginBottom:12}}><Lock size={20}/></div><p style={{color:'var(--text-secondary)'}}>Risque Élevé</p><h3 style={{fontSize:'2rem', margin:0}}>{summary?.highRisk || 0}</h3></div>
                <div className="glass-card-sm"><div className="stat-icon si-gold" style={{marginBottom:12}}><User size={20}/></div><p style={{color:'var(--text-secondary)'}}>En Investigation</p><h3 style={{fontSize:'2rem', margin:0}}>{summary?.investigating || 0}</h3></div>
                <div className="glass-card-sm"><div className="stat-icon si-green" style={{marginBottom:12}}><CheckCircle size={20}/></div><p style={{color:'var(--text-secondary)'}}>Confirmées</p><h3 style={{fontSize:'2rem', margin:0, color:'var(--success)'}}>{summary?.confirmed || 0}</h3></div>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: 0 }}><Fingerprint size={20} color="var(--stb-blue-400)" /> Détections de Fraude</h2>
                </div>
                <div style={{ padding: '1rem' }}>
                  {alerts.length > 0 ? alerts.map(a => {
                    const risk = getRiskLevel(a.riskScore || 0);
                    return (
                      <div key={a._id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                        <div style={{ background: risk.bg, color: risk.color, padding: '0.5rem 1rem', borderRadius: 12, border: `1px solid ${risk.border}`, textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{a.riskScore}</div><div style={{ fontSize: '0.65rem' }}>SCORE</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {a.type}
                            <span className="badge" style={{ background: risk.bg, color: risk.color }}>{risk.label}</span>
                          </h4>
                          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <span><Clock size={12} style={{marginRight:4}}/> {new Date(a.createdAt).toLocaleString('fr-FR')}</span>
                            {a.employeeId && <span><User size={12} style={{marginRight:4}}/> {a.employeeId.matricule} - {a.employeeId.nom}</span>}
                          </div>
                        </div>
                        <button className="btn btn-secondary btn-sm">Investiguer</button>
                      </div>
                    )
                  }) : <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune alerte récente</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Finance View (Risk Alerts) ── */}
          {activeTab === 'FINANCE' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                  <p style={{color:'var(--text-secondary)'}}>Total Alertes</p>
                  <h3 style={{fontSize:'2.5rem', margin:0, color:'var(--danger)'}}>{summary?.total || 0}</h3>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                  <p style={{color:'var(--text-secondary)'}}>Alertes Ouvertes</p>
                  <h3 style={{fontSize:'2.5rem', margin:0, color:'var(--warning)'}}>{summary?.open || 0}</h3>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
                  <p style={{color:'var(--text-secondary)'}}>Alertes Résolues</p>
                  <h3 style={{fontSize:'2.5rem', margin:0, color:'var(--success)'}}>{summary?.resolved || 0}</h3>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: 0 }}><AlertTriangle size={20} color="var(--warning)" /> Alertes Opérationnelles</h2>
                </div>
                <div style={{ padding: '1rem' }}>
                  {alerts.length > 0 ? alerts.map(a => {
                    const sev = getSeverityStyle(a.severity || 'LOW');
                    return (
                      <div key={a._id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'flex-start' }}>
                        <div style={{ background: sev.bg, padding: '0.5rem', borderRadius: 8 }}><AlertTriangle color={sev.color} size={20}/></div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{a.type} <span className="badge" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span></h4>
                          <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{a.description}</p>
                          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <span><Clock size={12} style={{marginRight:4}}/> {new Date(a.createdAt).toLocaleString('fr-FR')}</span>
                            {a.employeeId && <span><User size={12} style={{marginRight:4}}/> {a.employeeId.nom}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  }) : <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune alerte</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Direction / RH Analytics ── */}
          {activeTab === 'ANALYTICS' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: '0 0 1.5rem' }}><Activity size={20} color="var(--stb-blue-400)" /> Tendances des Risques (6 derniers mois)</h2>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAlertes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFraudes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="alertes" name="Alertes Risque" stroke="var(--warning)" fillOpacity={1} fill="url(#colorAlertes)" />
                      <Area type="monotone" dataKey="fraudes" name="Fraudes Confirmées" stroke="var(--danger)" fillOpacity={1} fill="url(#colorFraudes)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default SecurityCenter;
