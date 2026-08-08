import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin, Activity, User, Search, Fingerprint, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

interface RiskAlert {
  _id: string;
  type: string;
  severity: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
  employeeId?: { nom: string; prenom: string; matricule: string };
}

const mockAlerts: RiskAlert[] = [
  {
    _id: 'r1',
    type: 'Accès Non Autorisé',
    severity: 'HIGH',
    description: 'Tentative d\'accès au serveur DB principal depuis une IP externe non whitelistée.',
    location: 'Zone Serveurs (Tunis)',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    employeeId: { nom: 'Inconnu', prenom: '', matricule: 'EXT-01' }
  },
  {
    _id: 'r2',
    type: 'Plafond Dépassé',
    severity: 'MEDIUM',
    description: 'Dépassement du plafond de crédit mensuel autorisé par 43%.',
    location: 'Agence Les Berges du Lac',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    employeeId: { nom: 'Ben Youssef', prenom: 'Amine', matricule: 'FI012' }
  },
  {
    _id: 'r3',
    type: 'Anomalie Réseau',
    severity: 'CRITICAL',
    description: 'Trafic sortant massif détecté (possible exfiltration de données).',
    location: 'Datacenter Principal',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    _id: 'r4',
    type: 'Conflit d\'Intérêts',
    severity: 'LOW',
    description: 'Validation d\'un dossier de crédit par un agent avec lien familial avec le client.',
    location: 'Département Crédits',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    employeeId: { nom: 'Gharbi', prenom: 'Salma', matricule: 'RH003' }
  }
];

const RiskAlerts = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/risk-alerts');
      if (res.data && res.data.length > 0) {
        setAlerts(res.data);
      } else {
        setAlerts(mockAlerts);
      }
    } catch {
      setAlerts(mockAlerts);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const getSeverityStyle = (severity: string): { color: string; bg: string; border: string; label: string } => {
    switch (severity) {
      case 'CRITICAL': return { color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'rgba(239,68,68,0.3)', label: 'CRITIQUE' };
      case 'HIGH': return { color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: 'ÉLEVÉ' };
      case 'MEDIUM': return { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'rgba(245,158,11,0.3)', label: 'MOYEN' };
      default: return { color: 'var(--stb-blue-400)', bg: 'var(--stb-blue-100)', border: 'var(--border-blue)', label: 'FAIBLE' };
    }
  };

  const filtered = alerts.filter(a =>
    a.type.toLowerCase().includes(filter.toLowerCase()) ||
    a.description.toLowerCase().includes(filter.toLowerCase())
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
        background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(10,17,33,0.9) 100%)',
        borderColor: 'rgba(249,115,22,0.2)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon" style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(249,115,22,0.15)' }}>
            <AlertTriangle size={28} color="#F97316" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>Alertes & Risques</h1>
            <p className="page-subtitle">Surveillance des menaces et risques opérationnels en temps réel</p>
          </div>
        </div>
        <button onClick={fetchAlerts} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Alertes', value: alerts.length, icon: <Activity size={24}/>, cls: 'si-blue' },
          { label: 'Critiques', value: alerts.filter(a => a.severity === 'CRITICAL').length, icon: <AlertTriangle size={24}/>, cls: 'si-red' },
          { label: 'Actives', value: alerts.filter(a => a.status === 'ACTIVE').length, icon: <AlertTriangle size={24}/>, cls: 'si-gold' },
          { label: 'Résolues (24h)', value: alerts.filter(a => a.status === 'RESOLVED').length, icon: <CheckCircle size={24}/>, cls: 'si-green' },
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
          background: 'rgba(0,0,0,0.2)',
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            <Fingerprint size={20} color="#F97316" />
            Flux d'alertes
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
          {filtered.map(a => {
            const sev = getSeverityStyle(a.severity);
            const isActive = a.status === 'ACTIVE';
            return (
              <motion.div key={a._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0.65 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  transition: 'background 0.2s',
                  borderLeft: isActive ? `3px solid ${sev.color}` : '3px solid transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Severity icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: sev.bg, border: `1px solid ${sev.border}`,
                }}>
                  <AlertTriangle size={22} color={sev.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{a.type}</span>
                    <span className="badge" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>{sev.label}</span>
                    {isActive
                      ? <span className="badge badge-inactive" style={{ animation: 'pulse 2s infinite' }}>⚡ ACTIVE</span>
                      : <span className="badge badge-active">✓ RÉSOLUE</span>
                    }
                    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>{a.description}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      {new Date(a.createdAt).toLocaleString('fr-FR')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {a.location}
                    </span>
                    {a.employeeId && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.06)', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        <User size={11} /> {a.employeeId.matricule} ({a.employeeId.nom})
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm">Détails</button>
                  {isActive && <button className="btn btn-primary btn-sm">Prendre en charge</button>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem' }}>Aucune alerte trouvée</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RiskAlerts;
