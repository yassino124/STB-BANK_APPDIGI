import { useEffect, useState } from 'react';
import { Shield, Monitor, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditEntry {
  _id: string;
  employeeId: any;
  action: string;
  ip: string | null;
  deviceUUID: string | null;
  success: boolean;
  createdAt: string;
  metadata?: any;
}

const ACTION_LABELS: Record<string, string> = {
  ACTIVATION_REQUESTED: 'Activation demandée',
  OTP_VERIFIED: 'OTP vérifié',
  PASSWORD_SET: 'Mot de passe créé',
  PIN_SET: 'PIN créé',
  BIOMETRICS_ENABLED: 'Biométrie activée',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGIN_FAILED: 'Connexion échouée',
  BIOMETRIC_LOGIN: 'Connexion biométrique',
  PIN_LOGIN: 'Connexion PIN',
  LOGOUT: 'Déconnexion',
  TOKEN_REFRESHED: 'Token renouvelé',
  PASSWORD_RESET_REQUESTED: 'Réinitialisation mot de passe',
  PASSWORD_RESET: 'Mot de passe réinitialisé',
  DEVICE_CHANGED: 'Appareil changé',
  ACCOUNT_LOCKED: 'Compte verrouillé',
};

const getActionColor = (action: string, success: boolean) => {
  if (!success) return 'var(--danger)';
  if (action.includes('FAILED') || action.includes('LOCKED')) return 'var(--danger)';
  if (action.includes('LOGOUT')) return 'var(--warning)';
  if (action.includes('LOGIN') || action.includes('VERIFIED')) return 'var(--success)';
  return 'var(--stb-blue-400)';
};

const Audit = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit/my-logs?limit=50');
      setLogs(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Erreur audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit & Sécurité</h1>
          <p className="page-subtitle">Traçabilité complète des actions système et accès.</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary">
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total événements (24h)', value: logs.length, icon: <Shield size={22} />, cls: 'si-blue' },
          { label: 'Connexions réussies', value: logs.filter(l => l.success).length, icon: <CheckCircle size={22} />, cls: 'si-green' },
          { label: 'Alertes de sécurité', value: logs.filter(l => !l.success).length, icon: <XCircle size={22} />, cls: 'si-red' },
        ].map((s, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="glass-card stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.2rem' }}>{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={18} color="var(--stb-blue-400)" />
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Journal d'activité système</h3>
        </div>
        <div className="table-wrap">
          <table className="stb-table">
            <thead>
              <tr>
                <th>Action Technique</th>
                <th>Statut</th>
                <th>Empreinte Appareil</th>
                <th>Adresse IP</th>
                <th>Horodatage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chargement des logs sécurisés...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontWeight: 600 }}>Aucun événement enregistré.</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getActionColor(log.action, log.success), flexShrink: 0, boxShadow: `0 0 6px ${getActionColor(log.action, log.success)}` }}></span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{ACTION_LABELS[log.action] || log.action}</span>
                      </div>
                    </td>
                    <td>
                      {log.success
                        ? <span className="badge badge-active">Autorisé</span>
                        : <span className="badge badge-inactive">Bloqué</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                        <Monitor size={14} />
                        {log.deviceUUID ? <span style={{ fontFamily: 'monospace' }}>{log.deviceUUID.slice(0, 12)}...</span> : '—'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{log.ip || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm', { locale: fr })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audit;
