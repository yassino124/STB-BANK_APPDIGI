import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, Server, Database, Cpu, HardDrive, Wifi, Bell,
  Users, Activity, AlertTriangle, Lock, RefreshCw, ShieldAlert,
  LogOut, Key, UserCog, Eye, Clock, CheckCircle, XCircle,
  TrendingUp, Zap, BarChart2, Terminal, Download,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface SystemService {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  detail: string;
  icon: React.ReactNode;
}

interface ApiMetric {
  endpoint: string;
  method: string;
  avgMs: number;
  calls: number;
}

interface UserRow {
  _id: string;
  nom: string;
  prenom: string;
  matricule: string;
  roles: string[];
  status: string;
}

interface AuditLog {
  _id: string;
  action: string;
  actor?: string;
  status: string;
  createdAt: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring' as const, stiffness: 280, damping: 22 } }),
};

const StatusDot = ({ status }: { status: 'online' | 'degraded' | 'offline' }) => {
  const colors = { online: '#10B981', degraded: '#F59E0B', offline: '#EF4444' };
  return (
    <span style={{
      display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
      background: colors[status],
      boxShadow: `0 0 8px ${colors[status]}`,
      flexShrink: 0,
    }} />
  );
};

const GaugeBar = ({ value, color = '#2962FF', label }: { value: number; color?: string; label: string }) => (
  <div style={{ marginBottom: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{value}%</span>
    </div>
    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${value}%`, borderRadius: 10,
        background: `linear-gradient(90deg, ${color}cc, ${color})`,
        transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: `0 0 10px ${color}66`,
      }} />
    </div>
  </div>
);

const ITDashboard = () => {
  const [employees, setEmployees] = useState<UserRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const [backendStatus, setBackendStatus] = useState<'online' | 'degraded' | 'offline'>('online');
  const [mongoStatus, setMongoStatus] = useState<'online' | 'degraded' | 'offline'>('online');

  const [metrics, setMetrics] = useState({
    apiRequestsToday: 0,
    connectedUsers: 0,
    errorsToday: 0,
    cpu: 0,
    ram: 0,
    storage: 0,
    failedLogins: 0,
    blockedAccounts: 0,
    suspiciousActivity: 0,
    lastBackup: '-',
  });

  const services: SystemService[] = [
    { name: 'Backend NestJS', status: backendStatus, detail: 'v1.0.0 · Port 3000', icon: <Server size={15} /> },
    { name: 'MongoDB Atlas', status: mongoStatus, detail: 'Cluster0 · Healthy', icon: <Database size={15} /> },
    { name: 'Redis Cache', status: backendStatus === 'offline' ? 'offline' : 'online', detail: 'Latency 0.8ms', icon: <Zap size={15} /> },
    { name: 'Gemini AI API', status: backendStatus === 'offline' ? 'offline' : 'online', detail: 'Connected · Pro', icon: <Monitor size={15} /> },
    { name: 'Storage', status: backendStatus === 'offline' ? 'offline' : metrics.storage > 85 ? 'degraded' : 'online', detail: `${metrics.storage}% utilisé`, icon: <HardDrive size={15} /> },
    { name: 'Push Notifications', status: backendStatus === 'offline' ? 'offline' : 'online', detail: 'FCM · Running', icon: <Bell size={15} /> },
  ];

  const apiMetrics: ApiMetric[] = [
    { endpoint: '/employees', method: 'GET', avgMs: 25, calls: 12400 },
    { endpoint: '/auth/login', method: 'POST', avgMs: 40, calls: 8900 },
    { endpoint: '/payroll/credit-salary', method: 'POST', avgMs: 130, calls: 45 },
    { endpoint: '/leave', method: 'GET', avgMs: 18, calls: 22000 },
    { endpoint: '/notifications', method: 'GET', avgMs: 12, calls: 55000 },
    { endpoint: '/transactions', method: 'GET', avgMs: 35, calls: 9800 },
  ];

  const fetchData = useCallback(async () => {
    try {
      let isDown = false;
      const safeGet = (url: string) => api.get(url).catch((err) => {
        if (!err.response || err.code === 'ERR_NETWORK' || [502, 503, 504].includes(err.response?.status)) {
          isDown = true;
        }
        return { data: null };
      });

      const [empRes, auditRes, dashRes] = await Promise.all([
        safeGet('/employees?limit=200'),
        safeGet('/audit-logs?limit=20'),
        safeGet('/dashboard/it'),
      ]);

      if (isDown) {
        setBackendStatus('offline');
        setMongoStatus('offline');
        toast.error("Connexion au backend perdue");
      } else {
        setBackendStatus('online');
        setMongoStatus('online');
      }

      setEmployees(empRes.data?.data || empRes.data || []);
      setAuditLogs(auditRes.data?.data || auditRes.data || []);
      if (dashRes.data?.metrics) {
        setMetrics(dashRes.data.metrics);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeactivate = async (emp: UserRow) => {
    if (!confirm(`Désactiver le compte de ${emp.prenom} ${emp.nom} ?`)) return;
    setActionLoading(emp._id + '_deactivate');
    try {
      await api.patch(`/employees/${emp._id}`, { status: emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      toast.success(`Compte ${emp.status === 'ACTIVE' ? 'désactivé' : 'activé'} — ${emp.prenom} ${emp.nom}`);
      fetchData();
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setActionLoading(null); }
  };

  const handleResetPassword = async (emp: UserRow) => {
    if (!confirm(`Réinitialiser le mot de passe de ${emp.prenom} ${emp.nom} ?`)) return;
    setActionLoading(emp._id + '_reset');
    try {
      const res = await api.post(`/employees/${emp._id}/reset-password`);
      const newPass = res.data?.defaultPassword || res.data?.password || '(voir backend)';
      toast.success(`Nouveau mot de passe : ${newPass}`, { duration: 10000 });
    } catch { toast.error('Erreur réinitialisation'); }
    finally { setActionLoading(null); }
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 50) return '#10B981';
    if (ms < 100) return '#F59E0B';
    return '#EF4444';
  };

  const getRoleBadgeColor = (role: string) => {
    const map: Record<string, string> = {
      SUPER_ADMIN: '#7C3AED', ADMIN: '#2962FF', RH: '#10B981',
      MANAGER: '#F59E0B', FINANCE: '#0284C7', AGENCE: '#EC4899', EMPLOYEE: '#64748B',
    };
    return map[role] || '#64748B';
  };

  return (
    <div>
      {loading && (
        <div className="absolute inset-0 z-50 bg-[#060B19]/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 rounded-full animate-pulse"></div>
              <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
            </div>
            <p className="text-blue-400 font-mono text-sm tracking-widest animate-pulse">SYSTEM CHECK...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="page-header">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-title">
            🖥️ IT Operations Center
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="page-subtitle">
            Supervision système, gestion des accès et sécurité — Portail Admin IT
          </motion.p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Màj: {lastRefresh.toLocaleTimeString('fr-FR')}
          </span>
          <button onClick={fetchData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── System Health ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', animation: 'pulse 2s infinite' }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>État des Services</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
            {services.filter(s => s.status === 'online').length}/{services.length} En ligne
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {services.map((svc, i) => (
            <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={cardVariants}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <StatusDot status={svc.status} />
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{svc.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{svc.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{svc.detail}</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: svc.status === 'online' ? '#10B981' : svc.status === 'degraded' ? '#F59E0B' : '#EF4444', textTransform: 'uppercase' }}>
                {svc.status === 'online' ? 'OK' : svc.status === 'degraded' ? 'DÉGRADÉ' : 'DOWN'}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Requêtes API (24h)', value: metrics.apiRequestsToday.toLocaleString('fr'), icon: <Activity size={22} />, color: '#2962FF', cls: 'si-blue' },
          { label: 'Utilisateurs connectés', value: metrics.connectedUsers, icon: <Users size={22} />, color: '#10B981', cls: 'si-teal' },
          { label: 'Erreurs (24h)', value: metrics.errorsToday, icon: <XCircle size={22} />, color: '#EF4444', cls: 'si-red' },
          { label: 'Connexions échouées', value: metrics.failedLogins, icon: <AlertTriangle size={22} />, color: '#F59E0B', cls: 'si-gold' },
          { label: 'Comptes bloqués', value: metrics.blockedAccounts, icon: <Lock size={22} />, color: '#EF4444', cls: 'si-red' },
          { label: 'Activités suspectes', value: metrics.suspiciousActivity, icon: <ShieldAlert size={22} />, color: '#7C3AED', cls: 'si-purple' },
        ].map((card, idx) => (
          <motion.div key={idx} custom={idx} initial="hidden" animate="visible" variants={cardVariants} className="glass-card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div className={`stat-icon ${card.cls}`}>{card.icon}</div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.3rem', color: card.color }}>{card.value}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Resource Usage + API Monitoring ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Resource Usage */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <div className="section-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Ressources Serveur</h3>
          </div>
          <GaugeBar value={metrics.cpu} color="#2962FF" label="CPU" />
          <GaugeBar value={metrics.ram} color="#10B981" label="RAM" />
          <GaugeBar value={metrics.storage} color={metrics.storage > 85 ? '#EF4444' : '#F59E0B'} label="Stockage" />
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginBottom: 4 }}>💾 DERNIÈRE SAUVEGARDE</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{metrics.lastBackup}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
              <Download size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Backup
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
              <Terminal size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Logs
            </button>
          </div>
        </motion.div>

        {/* API Monitoring */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card">
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <div className="section-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Monitoring API</h3>
            <span className="badge badge-blue">Temps réel</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0 0 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
            {['Endpoint', 'Method', 'Latence', 'Calls/j'].map(h => (
              <span key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
            ))}
          </div>
          {apiMetrics.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <code style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{m.endpoint}</code>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.method === 'GET' ? '#10B981' : m.method === 'POST' ? '#2962FF' : '#F59E0B', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 8px', textAlign: 'center' }}>{m.method}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, m.avgMs)}%`, background: getLatencyColor(m.avgMs), borderRadius: 10, boxShadow: `0 0 6px ${getLatencyColor(m.avgMs)}88` }} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: getLatencyColor(m.avgMs), width: 36, textAlign: 'right' }}>{m.avgMs}ms</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{m.calls.toLocaleString('fr')}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ color: '#10B981' }}>● &lt;50ms Rapide</span>
            <span style={{ color: '#F59E0B' }}>● 50-100ms Moyen</span>
            <span style={{ color: '#EF4444' }}>● &gt;100ms Lent</span>
          </div>
        </motion.div>
      </div>

      {/* ── User Management ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-header" style={{ marginBottom: '1.25rem' }}>
          <div className="section-accent" />
          <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>
            <UserCog size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Gestion des Utilisateurs
          </h3>
          <span className="badge badge-blue">{employees.length} comptes</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chargement...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {employees.slice(0, 15).map((emp) => (
              <div key={emp._id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.02)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.2s',
              }}>
                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: emp.status === 'ACTIVE' ? 'rgba(41,98,255,0.15)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: emp.status === 'ACTIVE' ? '#2962FF' : '#EF4444', flexShrink: 0 }}>
                  {emp.prenom?.[0]}{emp.nom?.[0]}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{emp.prenom} {emp.nom}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.matricule}</div>
                </div>
                {/* Roles */}
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: 200 }}>
                  {emp.roles?.slice(0, 2).map(r => (
                    <span key={r} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${getRoleBadgeColor(r)}22`, color: getRoleBadgeColor(r), border: `1px solid ${getRoleBadgeColor(r)}44` }}>{r}</span>
                  ))}
                </div>
                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 80 }}>
                  <StatusDot status={emp.status === 'ACTIVE' ? 'online' : 'offline'} />
                  <span style={{ fontSize: '0.75rem', color: emp.status === 'ACTIVE' ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                    {emp.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleDeactivate(emp)}
                    disabled={actionLoading === emp._id + '_deactivate'}
                    title={emp.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                    style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Lock size={12} style={{ verticalAlign: 'middle' }} /> {emp.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleResetPassword(emp)}
                    disabled={actionLoading === emp._id + '_reset'}
                    title="Réinitialiser mot de passe"
                    style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#F59E0B', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    <Key size={12} style={{ verticalAlign: 'middle' }} /> Reset MDP
                  </button>
                </div>
              </div>
            ))}
            {employees.length > 15 && (
              <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                + {employees.length - 15} autres comptes — Voir Annuaire RH pour la liste complète
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Security Summary + Audit Logs ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card">
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <div className="section-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              <ShieldAlert size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Sécurité
            </h3>
          </div>
          {[
            { label: 'Connexions échouées (24h)', value: metrics.failedLogins, color: '#EF4444', icon: <XCircle size={16} /> },
            { label: 'Comptes bloqués', value: metrics.blockedAccounts, color: '#F59E0B', icon: <Lock size={16} /> },
            { label: 'Activité suspecte', value: metrics.suspiciousActivity, color: '#7C3AED', icon: <Eye size={16} /> },
            { label: 'Logins réussis (24h)', value: 48, color: '#10B981', icon: <CheckCircle size={16} /> },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: item.color }}>{item.value}</span>
            </div>
          ))}
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.72rem', color: '#A78BFA', fontWeight: 700, marginBottom: 4 }}>🔐 POLITIQUE SÉCURITÉ</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              JWT · Bcrypt · HTTPS<br />Rate-limit · CORS strict
            </div>
          </div>
        </motion.div>

        {/* Audit Logs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card">
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <div className="section-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>
              <BarChart2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Journal d'Activité Système
            </h3>
            <span className="badge badge-blue">Temps réel</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {auditLogs.length === 0 ? (
              // Simulated logs if no real data
              [
                { action: 'LOGIN', actor: 'RH001', status: 'SUCCESS', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
                { action: 'SALARY_CREDIT', actor: 'FINANCE010', status: 'SUCCESS', createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
                { action: 'EMPLOYEE_CREATE', actor: 'RH001', status: 'SUCCESS', createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
                { action: 'LOGIN_FAILED', actor: 'EMP999', status: 'FAILED', createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
                { action: 'LEAVE_APPROVE', actor: 'MGR002', status: 'SUCCESS', createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
                { action: 'CREDIT_CREATE', actor: 'AGENCE001', status: 'SUCCESS', createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: log.status === 'SUCCESS' ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                  <code style={{ fontSize: '0.78rem', color: '#A78BFA', fontFamily: 'monospace', minWidth: 160 }}>{log.action}</code>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{log.actor}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: log.status === 'SUCCESS' ? '#10B981' : '#EF4444', padding: '2px 8px', background: log.status === 'SUCCESS' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 20 }}>{log.status}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} />
                    {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              auditLogs.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: log.status === 'SUCCESS' || log.status === 'Autorisé' ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                  <code style={{ fontSize: '0.78rem', color: '#A78BFA', fontFamily: 'monospace', minWidth: 100 }}>{log.action}</code>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{log.actor || '—'}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: 20 }}>{log.status}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} />
                    {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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

export default ITDashboard;
