import { useEffect, useState } from 'react';
import { FileText, Download, Filter, BarChart3, PieChart, TrendingUp, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface ReportData {
  leaves?: any[];
  absences?: any[];
  avances?: any[];
  payroll?: any[];
  budgets?: any[];
  summary?: {
    totalLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    pendingLeaves: number;
    totalAbsences: number;
    totalAvances: number;
    totalPayroll: number;
    totalBudget: number;
  };
}

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string>('rh_monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (reportType === 'rh_monthly') {
          // RH Monthly Report: Leaves + Absences + Avances
          const [leavesRes, absencesRes, avancesRes] = await Promise.all([
            api.get(`/leave?month=${selectedMonth}`).catch(() => ({ data: [] })),
            api.get(`/absence?month=${selectedMonth}`).catch(() => ({ data: [] })),
            api.get(`/avances?month=${selectedMonth}`).catch(() => ({ data: [] })),
          ]);
          
          const leaves = leavesRes.data?.data || leavesRes.data || [];
          const absences = absencesRes.data?.data || absencesRes.data || [];
          const avances = avancesRes.data?.data || avancesRes.data || [];
          
          setReportData({
            leaves,
            absences,
            avances,
            summary: {
              totalLeaves: leaves.length,
              approvedLeaves: leaves.filter((l: any) => l.status === 'APPROVED').length,
              rejectedLeaves: leaves.filter((l: any) => l.status === 'REJECTED').length,
              pendingLeaves: leaves.filter((l: any) => l.status?.includes('PENDING')).length,
              totalAbsences: absences.length,
              totalAvances: avances.reduce((sum: number, a: any) => sum + (a.montant || 0), 0),
              totalPayroll: 0,
              totalBudget: 0,
            },
          });
        } else if (reportType === 'finance_monthly') {
          // Finance Monthly Report: Payroll + Budgets + Avances
          const [payrollRes, budgetsRes, avancesRes] = await Promise.all([
            api.get(`/payroll?month=${selectedMonth}`).catch(() => ({ data: [] })),
            api.get(`/budgets`).catch(() => ({ data: [] })),
            api.get(`/avances?month=${selectedMonth}`).catch(() => ({ data: [] })),
          ]);
          
          const payroll = payrollRes.data?.data || payrollRes.data || [];
          const budgets = budgetsRes.data?.data || budgetsRes.data || [];
          const avances = avancesRes.data?.data || avancesRes.data || [];
          
          setReportData({
            payroll,
            budgets,
            avances,
            summary: {
              totalLeaves: 0,
              approvedLeaves: 0,
              rejectedLeaves: 0,
              pendingLeaves: 0,
              totalAbsences: 0,
              totalAvances: avances.reduce((sum: number, a: any) => sum + (a.montant || 0), 0),
              totalPayroll: payroll.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0),
              totalBudget: budgets.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
            },
          });
        }
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
        toast.error('Erreur lors du chargement des rapports');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reportType, selectedMonth]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      toast.loading(`Génération du rapport ${format.toUpperCase()}...`);
      
      let exportData: any = {};
      
      if (reportType === 'rh_monthly') {
        exportData = {
          title: `Rapport RH Mensuel - ${selectedMonth}`,
          month: selectedMonth,
          summary: reportData.summary,
          leaves: reportData.leaves || [],
          absences: reportData.absences || [],
          avances: reportData.avances || [],
        };
      } else if (reportType === 'finance_monthly') {
        exportData = {
          title: `Rapport Finance Mensuel - ${selectedMonth}`,
          month: selectedMonth,
          summary: reportData.summary,
          payroll: reportData.payroll || [],
          budgets: reportData.budgets || [],
          avances: reportData.avances || [],
        };
      }
      
      if (format === 'excel') {
        // Generate CSV
        let csvContent = `${exportData.title}\nPériode: ${selectedMonth}\n\n`;
        
        if (reportType === 'rh_monthly') {
          csvContent += 'RÉSUMÉ\n';
          csvContent += `Total Congés,${exportData.summary?.totalLeaves || 0}\n`;
          csvContent += `Approuvés,${exportData.summary?.approvedLeaves || 0}\n`;
          csvContent += `Rejetés,${exportData.summary?.rejectedLeaves || 0}\n`;
          csvContent += `En Attente,${exportData.summary?.pendingLeaves || 0}\n`;
          csvContent += `Total Absences,${exportData.summary?.totalAbsences || 0}\n`;
          csvContent += `Total Avances,${exportData.summary?.totalAvances || 0} TND\n\n`;
          
          if (exportData.leaves?.length > 0) {
            csvContent += 'CONGÉS\n';
            csvContent += 'Employé,Type,Début,Fin,Jours,Statut\n';
            exportData.leaves.forEach((l: any) => {
              csvContent += `"${l.employeeId?.firstName || ''} ${l.employeeId?.lastName || ''}","${l.type || ''}","${new Date(l.startDate).toLocaleDateString('fr-TN')}","${new Date(l.endDate).toLocaleDateString('fr-TN')}",${l.days || 0},"${l.status || ''}"\n`;
            });
          }
        } else if (reportType === 'finance_monthly') {
          csvContent += 'RÉSUMÉ\n';
          csvContent += `Masse Salariale,${exportData.summary?.totalPayroll || 0} TND\n`;
          csvContent += `Budget Total,${exportData.summary?.totalBudget || 0} TND\n`;
          csvContent += `Avances Payées,${exportData.summary?.totalAvances || 0} TND\n\n`;
          
          if (exportData.payroll?.length > 0) {
            csvContent += 'PAIE\n';
            csvContent += 'Employé,Salaire Brut,CNSS,Impôts,Net\n';
            exportData.payroll.forEach((p: any) => {
              csvContent += `"${p.employeeId?.firstName || ''} ${p.employeeId?.lastName || ''}",${p.grossSalary || 0},${p.cnss || 0},${p.tax || 0},${p.netSalary || 0}\n`;
            });
          }
        }
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rapport_${reportType}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.dismiss();
        toast.success('Rapport Excel généré');
      } else if (format === 'pdf') {
        window.print();
        toast.dismiss();
        toast.success('Rapport PDF généré');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error('Erreur lors de l\'export');
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          button, select, input { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            📊 Rapports Mensuels
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {reportType === 'rh_monthly' ? 'Rapport RH: Congés, Absences & Avances' : 'Rapport Finance: Paie, Budgets & Avances'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="rh_monthly">📋 Rapport RH</option>
            <option value="finance_monthly">💰 Rapport Finance</option>
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          />
          <button
            onClick={() => handleExport('pdf')}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}
          >
            <Download size={16} /> PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
          >
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {reportType === 'rh_monthly' ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(41,98,255,0.1) 0%, rgba(41,98,255,0.05) 100%)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(41,98,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(41,98,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={22} color="#2962FF" />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2962FF', fontFamily: 'var(--font-display)' }}>
                    {reportData.summary?.totalLeaves || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Congés</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#10B981' }}>✓ {reportData.summary?.approvedLeaves || 0}</span>
                <span style={{ color: '#F59E0B' }}>⏳ {reportData.summary?.pendingLeaves || 0}</span>
                <span style={{ color: '#EF4444' }}>✗ {reportData.summary?.rejectedLeaves || 0}</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} color="#F59E0B" />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-display)' }}>
                    {reportData.summary?.totalAbsences || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Absences</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(200,160,92,0.1) 0%, rgba(200,160,92,0.05) 100%)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(200,160,92,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(200,160,92,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={22} color="#C8A05C" />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#C8A05C', fontFamily: 'var(--font-display)' }}>
                    {(reportData.summary?.totalAvances || 0).toLocaleString()} TND
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Avances</div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={22} color="#10B981" />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-display)' }}>
                    {(reportData.summary?.totalPayroll || 0).toLocaleString()} TND
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Masse Salariale</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={22} color="#8B5CF6" />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8B5CF6', fontFamily: 'var(--font-display)' }}>
                    {(reportData.summary?.totalBudget || 0).toLocaleString()} TND
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Budget Total</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, rgba(200,160,92,0.1) 0%, rgba(200,160,92,0.05) 100%)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(200,160,92,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(200,160,92,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={22} color="#C8A05C" />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#C8A05C', fontFamily: 'var(--font-display)' }}>
                    {(reportData.summary?.totalAvances || 0).toLocaleString()} TND
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avances Payées</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Data Tables */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Empty State */}
        {((reportType === 'rh_monthly' && (!reportData.leaves || reportData.leaves.length === 0) && (!reportData.absences || reportData.absences.length === 0)) ||
          (reportType === 'finance_monthly' && (!reportData.payroll || reportData.payroll.length === 0))) && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Aucune donnée disponible pour ce mois</p>
          </div>
        )}
        
        {/* RH Tables */}
        {reportType === 'rh_monthly' && reportData.leaves && reportData.leaves.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#2962FF" /> Congés du mois
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Employé</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Début</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Fin</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Jours</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.leaves.map((leave: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {leave.employeeId?.firstName || ''} {leave.employeeId?.lastName || ''}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{leave.type || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {leave.startDate ? new Date(leave.startDate).toLocaleDateString('fr-TN') : '-'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {leave.endDate ? new Date(leave.endDate).toLocaleDateString('fr-TN') : '-'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600, textAlign: 'center' }}>{leave.days || 0}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: leave.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : leave.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: leave.status === 'APPROVED' ? '#10B981' : leave.status === 'REJECTED' ? '#EF4444' : '#F59E0B',
                        }}>
                          {leave.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Finance Tables */}
        {reportType === 'finance_monthly' && reportData.payroll && reportData.payroll.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="#10B981" /> Paie du mois
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Employé</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Brut</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>CNSS</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Impôts</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.payroll.map((pay: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {pay.employeeId?.firstName || ''} {pay.employeeId?.lastName || ''}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{(pay.grossSalary || 0).toLocaleString()} TND</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#EF4444', textAlign: 'right' }}>-{(pay.cnss || 0).toLocaleString()} TND</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#EF4444', textAlign: 'right' }}>-{(pay.tax || 0).toLocaleString()} TND</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#10B981', textAlign: 'right', fontWeight: 700 }}>
                        {(pay.netSalary || 0).toLocaleString()} TND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
