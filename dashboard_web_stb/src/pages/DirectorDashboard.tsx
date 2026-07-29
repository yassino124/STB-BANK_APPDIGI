import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, AlertTriangle, Target, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface DepartmentKPIs {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  departmentBudget: number;
  actualExpenses: number;
  budgetUtilization: number;
  absenteeismRate: number;
  averageSalary: number;
  pendingRequests: number;
  avgProductivity: number;
}

interface EmployeeData {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  salary: number;
  status: string;
}

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DepartmentKPIs>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveToday: 0,
    departmentBudget: 0,
    actualExpenses: 0,
    budgetUtilization: 0,
    absenteeismRate: 0,
    averageSalary: 0,
    pendingRequests: 0,
    avgProductivity: 85,
  });
  const [teamMembers, setTeamMembers] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch team members (subordinates)
      const employeesRes = await api.get('/employees/my-team').catch(() => ({ data: [] }));
      const employees = employeesRes.data?.data || employeesRes.data || [];
      setTeamMembers(employees);

      // Fetch leaves for today
      const today = new Date().toISOString().split('T')[0];
      const leavesRes = await api.get(`/leave?date=${today}`).catch(() => ({ data: [] }));
      const todayLeaves = leavesRes.data?.data || leavesRes.data || [];

      // Fetch budget data
      const budgetsRes = await api.get('/budgets/department').catch(() => ({ data: { total: 0, spent: 0 } }));
      const budgetData = budgetsRes.data || {};

      // Fetch pending requests
      const requestsRes = await api.get('/leave?status=PENDING_N1,PENDING_N2').catch(() => ({ data: [] }));
      const pendingRequests = requestsRes.data?.data || requestsRes.data || [];

      // Calculate KPIs
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter((e: EmployeeData) => e.status === 'active').length;
      const onLeaveToday = todayLeaves.length;
      const totalSalary = employees.reduce((sum: number, e: EmployeeData) => sum + (e.salary || 0), 0);
      const averageSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

      // Calculate absenteeism rate (simplified: leaves today / total employees)
      const absenteeismRate = totalEmployees > 0 ? (onLeaveToday / totalEmployees) * 100 : 0;

      // Budget calculations
      const departmentBudget = budgetData.total || totalSalary * 1.3; // Estimate if not available
      const actualExpenses = budgetData.spent || totalSalary;
      const budgetUtilization = departmentBudget > 0 ? (actualExpenses / departmentBudget) * 100 : 0;

      setKpis({
        totalEmployees,
        activeEmployees,
        onLeaveToday,
        departmentBudget,
        actualExpenses,
        budgetUtilization,
        absenteeismRate,
        averageSalary,
        pendingRequests: pendingRequests.length,
        avgProductivity: 85 + Math.random() * 10, // Mock productivity
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
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

  const getBudgetStatus = () => {
    if (kpis.budgetUtilization > 90) return { color: '#EF4444', label: 'Critique', icon: AlertTriangle };
    if (kpis.budgetUtilization > 75) return { color: '#F59E0B', label: 'Attention', icon: TrendingUp };
    return { color: '#10B981', label: 'Bon', icon: Award };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            👔 Tableau de Bord Directeur
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Vue d'ensemble de votre département • KPIs & Performance
          </p>
        </div>
        <div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Primary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kpi-card"
          style={{
            background: 'linear-gradient(135deg, rgba(41,98,255,0.15) 0%, rgba(41,98,255,0.05) 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid rgba(41,98,255,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(41,98,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} color="#2962FF" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={14} /> +5%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2962FF', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              {kpis.totalEmployees}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Employés</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {kpis.activeEmployees} actifs • {kpis.onLeaveToday} en congé
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="kpi-card"
          style={{
            background: `linear-gradient(135deg, rgba(${budgetStatus.color === '#10B981' ? '16,185,129' : budgetStatus.color === '#F59E0B' ? '245,158,11' : '239,68,68'},0.15) 0%, rgba(${budgetStatus.color === '#10B981' ? '16,185,129' : budgetStatus.color === '#F59E0B' ? '245,158,11' : '239,68,68'},0.05) 100%)`,
            borderRadius: '16px',
            padding: '1.5rem',
            border: `2px solid ${budgetStatus.color}40`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${budgetStatus.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <budgetStatus.icon size={28} color={budgetStatus.color} />
            </div>
            <div style={{ fontSize: '0.75rem', color: budgetStatus.color, fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '6px', background: `${budgetStatus.color}20` }}>
              {budgetStatus.label}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: budgetStatus.color, fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              {kpis.budgetUtilization.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Utilisation Budget</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {kpis.actualExpenses.toLocaleString()} / {kpis.departmentBudget.toLocaleString()} TND
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="kpi-card"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid rgba(245,158,11,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={28} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '0.75rem', color: kpis.absenteeismRate < 5 ? '#10B981' : '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {kpis.absenteeismRate < 5 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {kpis.absenteeismRate < 5 ? 'Bon' : 'Élevé'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              {kpis.absenteeismRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Taux d'Absentéisme</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {kpis.onLeaveToday} employés absents aujourd'hui
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="kpi-card"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '2px solid rgba(139,92,246,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={28} color="#8B5CF6" />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={14} /> +2.5%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8B5CF6', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              {kpis.avgProductivity.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Productivité Moyenne</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {kpis.pendingRequests} demandes en attente
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <DollarSign size={20} color="#10B981" />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Salaire Moyen</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>
            {kpis.averageSalary.toLocaleString()} TND
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Target size={20} color="#2962FF" />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Budget Restant</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2962FF' }}>
            {(kpis.departmentBudget - kpis.actualExpenses).toLocaleString()} TND
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={20} color="#F59E0B" />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Demandes Pending</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>
            {kpis.pendingRequests}
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            💰 Suivi Budget Départemental
          </h3>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: budgetStatus.color }}>
            {kpis.budgetUtilization.toFixed(1)}% utilisé
          </div>
        </div>
        
        <div style={{ position: 'relative', width: '100%', height: '40px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(kpis.budgetUtilization, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: kpis.budgetUtilization > 90 ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)' : kpis.budgetUtilization > 75 ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
              {kpis.actualExpenses.toLocaleString()} TND
            </span>
          </motion.div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>0 TND</span>
          <span style={{ fontWeight: 700 }}>Budget Total: {kpis.departmentBudget.toLocaleString()} TND</span>
        </div>
      </div>

      {/* Team Members Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#2962FF" /> Membres de l'Équipe ({teamMembers.length})
        </h3>

        {teamMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Aucun membre d'équipe trouvé</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Employé</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Poste</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Département</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Salaire</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.slice(0, 10).map((member, i) => (
                  <tr key={member._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.02)')} onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2962FF 0%, #1E3A8A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {member.firstName} {member.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{member.position || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{member.department || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>
                      {member.salary ? `${member.salary.toLocaleString()} TND` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: member.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: member.status === 'active' ? '#10B981' : '#EF4444',
                      }}>
                        {member.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;
