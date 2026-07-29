import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface FraudDetection {
  _id: string;
  type: string;
  riskScore: number;
  factors: string[];
  details: any;
  status: string;
  createdAt: string;
  employeeId?: { nom: string; prenom: string; matricule: string };
}

const FraudDetection = () => {
  const [detections, setDetections] = useState<FraudDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async () => {
    try {
      const res = await api.get('/fraud-detections');
      setDetections(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/fraud-detections/${id}/status`, { status });
      fetchDetections();
    } catch (e) {
      console.error(e);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 85) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (score >= 70) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="text-red-400" size={16} />;
      case 'INVESTIGATING': return <Clock className="text-yellow-400" size={16} />;
      case 'DISMISSED': return <XCircle className="text-emerald-400" size={16} />;
      default: return <Shield className="text-slate-400" size={16} />;
    }
  };

  const filtered = detections.filter((d) =>
    d.type.toLowerCase().includes(filter.toLowerCase()) ||
    d.factors.some((f) => f.toLowerCase().includes(filter.toLowerCase()))
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
          <h1 className="text-3xl font-bold text-white">Fraud Detection</h1>
          <p className="text-slate-400 mt-1">Monitor and investigate suspicious activities</p>
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
              <p className="text-slate-400 text-sm">Total Detections</p>
              <p className="text-2xl font-bold text-white">{detections.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="text-orange-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">High Risk</p>
              <p className="text-2xl font-bold text-white">{detections.filter((d) => d.riskScore >= 70).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="text-yellow-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Investigating</p>
              <p className="text-2xl font-bold text-white">{detections.filter((d) => d.status === 'INVESTIGATING').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Confirmed</p>
              <p className="text-2xl font-bold text-white">{detections.filter((d) => d.status === 'CONFIRMED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search detections..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Detections List */}
      <div className="space-y-3">
        {filtered.map((detection, i) => (
          <motion.div
            key={detection._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-slate-800/50 border rounded-xl p-5 ${getRiskColor(detection.riskScore)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getStatusIcon(detection.status)}
                <div>
                  <h3 className="text-white font-semibold">Risk Score: {detection.riskScore}/100</h3>
                  <p className="text-slate-400 text-sm mt-1">Type: {detection.type}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {detection.factors.map((factor, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                        {factor}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>{new Date(detection.createdAt).toLocaleString()}</span>
                    {detection.employeeId && (
                      <span>Employee: {detection.employeeId.prenom} {detection.employeeId.nom}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {detection.status === 'INVESTIGATING' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(detection._id, 'CONFIRMED')}
                      className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(detection._id, 'DISMISSED')}
                      className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition"
                    >
                      Dismiss
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

export default FraudDetection;
