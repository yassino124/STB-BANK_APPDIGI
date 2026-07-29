import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface RiskAlert {
  _id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  employeeId?: { nom: string; prenom: string; matricule: string };
}

const RiskAlerts = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/risk-alerts');
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/risk-alerts/${id}/status`, { status });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'LOW': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle className="text-red-400" size={16} />;
      case 'ACKNOWLEDGED': return <Eye className="text-yellow-400" size={16} />;
      case 'RESOLVED': return <CheckCircle className="text-emerald-400" size={16} />;
      case 'FALSE_POSITIVE': return <XCircle className="text-slate-400" size={16} />;
      default: return <Clock className="text-slate-400" size={16} />;
    }
  };

  const filtered = alerts.filter((a) =>
    a.title.toLowerCase().includes(filter.toLowerCase()) ||
    a.type.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Risk Alerts</h1>
          <p className="text-slate-400 mt-1">Monitor and manage risk alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="text-blue-400" size={20} />
          <span className="text-slate-400">{alerts.filter((a) => a.status === 'OPEN').length} Open</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Alerts</p>
              <p className="text-2xl font-bold text-white">{alerts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="text-orange-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Open</p>
              <p className="text-2xl font-bold text-white">{alerts.filter((a) => a.status === 'OPEN').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-white">{alerts.filter((a) => a.status === 'RESOLVED').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Eye className="text-yellow-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Acknowledged</p>
              <p className="text-2xl font-bold text-white">{alerts.filter((a) => a.status === 'ACKNOWLEDGED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search alerts..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map((alert, i) => (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-slate-800/50 border rounded-xl p-5 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getStatusIcon(alert.status)}
                <div>
                  <h3 className="text-white font-semibold">{alert.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>Type: {alert.type}</span>
                    <span>Severity: {alert.severity}</span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    {alert.employeeId && (
                      <span>Employee: {alert.employeeId.prenom} {alert.employeeId.nom}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {alert.status === 'OPEN' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(alert._id, 'ACKNOWLEDGED')}
                      className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/20 transition"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(alert._id, 'RESOLVED')}
                      className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition"
                    >
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RiskAlerts;
