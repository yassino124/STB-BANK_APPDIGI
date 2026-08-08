import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle, Search, Activity, Fingerprint } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface FraudAlert {
  _id: string;
  type: string;
  riskScore: number;
  factors: string[];
  details: any;
  status: string;
  createdAt: string;
  employeeId?: { nom: string; prenom: string; matricule: string };
}

const mockDetections: FraudAlert[] = [
  {
    _id: 'f1',
    type: 'Connexion Suspecte',
    riskScore: 92,
    factors: ['IP Inhabituelle (Russie)', 'Heure anormale (03:15 AM)', 'Nouvel appareil'],
    details: { device: 'Windows 11, Chrome', ip: '185.12.4.55' },
    status: 'INVESTIGATING',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    employeeId: { nom: 'Ben Ali', prenom: 'Sami', matricule: 'FI005' }
  },
  {
    _id: 'f2',
    type: 'Retrait Multiple DAB',
    riskScore: 78,
    factors: ['3 retraits en 10 minutes', 'Montant maximum atteint'],
    details: { amount: '4500 TND', location: 'Tunis Centre' },
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    employeeId: { nom: 'Trabelsi', prenom: 'Mona', matricule: 'AG012' }
  },
  {
    _id: 'f3',
    type: 'Virement Haut Risque',
    riskScore: 85,
    factors: ['Nouveau bénéficiaire étranger', 'Montant inhabituel'],
    details: { amount: '120,000 TND', destination: 'Iles Caïmans' },
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    employeeId: { nom: 'Kallel', prenom: 'Karim', matricule: 'FI002' }
  },
  {
    _id: 'f4',
    type: 'Brute Force Détecté',
    riskScore: 45,
    factors: ['5 tentatives échouées', 'Même adresse IP'],
    details: { ip: '197.0.0.12' },
    status: 'DISMISSED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  }
];

const FraudDetection = () => {
  const [detections, setDetections] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchDetections(); }, []);

  const fetchDetections = async () => {
    try {
      const res = await api.get('/fraud-detections');
      if (res.data && res.data.length > 0) {
        setDetections(res.data);
      } else {
        setDetections(mockDetections);
      }
    } catch {
      setDetections(mockDetections);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/fraud-detections/${id}/status`, { status });
      fetchDetections();
    } catch {
      setDetections(prev => prev.map(d => d._id === id ? { ...d, status } : d));
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 85) return { label: 'CRITIQUE', color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'rgba(239,68,68,0.3)' };
    if (score >= 70) return { label: 'ÉLEVÉ', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' };
    if (score >= 40) return { label: 'MOYEN', color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'rgba(245,158,11,0.3)' };
    return { label: 'FAIBLE', color: 'var(--stb-blue-400)', bg: 'var(--stb-blue-100)', border: 'var(--border-blue)' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <span className="badge badge-inactive">✘ Fraude Confirmée</span>;
      case 'INVESTIGATING': return <span className="badge badge-pending">⏳ En Investigation</span>;
      case 'DISMISSED': return <span className="badge badge-active">✓ Fausse Alerte</span>;
      default: return <span className="badge badge-blue">⚠ En Attente</span>;
    }
  };

  const filtered = detections.filter(d =>
    d.type.toLowerCase().includes(filter.toLowerCase()) ||
    d.factors.some(f => f.toLowerCase().includes(filter.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ height: 80, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="glass-card-sm" style={{ height: 100, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
        <div className="glass-card" style={{ height: 400, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:0.9} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(10,17,33,0.9) 100%)',
        borderColor: 'rgba(239,68,68,0.2)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon si-red" style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.15)' }}>
            <Shield size={28} color="var(--danger)" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>Détection de Fraude</h1>
            <p className="page-subtitle">Surveillance IA en temps réel des activités suspectes</p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 999,
        }}>
          <Activity size={16} color="var(--success)" style={{ animation: 'pulse 2s infinite' }} />
          <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>Protection IA Active</span>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Alertes', value: detections.length, icon: <Shield size={24}/>, cls: 'si-blue' },
          { label: 'Haut Risque', value: detections.filter(d => d.riskScore >= 70).length, icon: <AlertTriangle size={24}/>, cls: 'si-red' },
          { label: 'En Investigation', value: detections.filter(d => d.status === 'INVESTIGATING' || d.status === 'PENDING').length, icon: <Clock size={24}/>, cls: 'si-gold' },
          { label: 'Traitées', value: detections.filter(d => d.status === 'CONFIRMED' || d.status === 'DISMISSED').length, icon: <CheckCircle size={24}/>, cls: 'si-green' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card stat-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</p>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            <Fingerprint size={20} color="var(--stb-blue-400)" />
            Journal des détections
          </h2>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 38, height: 42, margin: 0 }}
            />
          </div>
        </div>

        {/* Rows */}
        <AnimatePresence>
          {filtered.map(d => {
            const risk = getRiskLevel(d.riskScore);
            return (
              <motion.div key={d._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Score badge */}
                <div style={{
                  minWidth: 72, padding: '0.75rem 0.5rem', borderRadius: 16, textAlign: 'center', flexShrink: 0,
                  background: risk.bg, border: `1px solid ${risk.border}`, color: risk.color,
                }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>{d.riskScore}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4, opacity: 0.8 }}>Score</div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{d.type}</span>
                    {getStatusBadge(d.status)}
                    <span className="badge" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>{risk.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      {new Date(d.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {d.employeeId && (
                      <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.06)', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {d.employeeId.matricule} — {d.employeeId.nom} {d.employeeId.prenom}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {d.factors.map((f, i) => (
                      <span key={i} style={{
                        padding: '0.2rem 0.65rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 500,
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                        color: 'rgba(252,165,165,0.9)', display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <AlertTriangle size={11} /> {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <select value={d.status} onChange={e => handleStatusUpdate(d._id, e.target.value)}
                    className="form-input" style={{ width: 'auto', height: 42, margin: 0, fontSize: '0.82rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
                    <option value="PENDING">En attente</option>
                    <option value="INVESTIGATING">En investigation</option>
                    <option value="CONFIRMED">Fraude confirmée</option>
                    <option value="DISMISSED">Fausse alerte</option>
                  </select>
                  <button className="btn btn-secondary btn-sm">Détails</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem' }}>Aucune alerte trouvée</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FraudDetection;
