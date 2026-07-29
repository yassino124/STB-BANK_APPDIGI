import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import NewEmployee from './pages/NewEmployee';
import Audit from './pages/Audit';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import EmployeeFinancials from './pages/EmployeeFinancials';
import Requests from './pages/Requests';
import Departments from './pages/Departments';
import Branches from './pages/Branches';
import Analytics from './pages/Analytics';
import RiskAlerts from './pages/RiskAlerts';
import FraudDetection from './pages/FraudDetection';
import Reports from './pages/Reports';
import Investments from './pages/Investments';
import Budgets from './pages/Budgets';
import Messages from './pages/Messages';
import Conversations from './pages/Conversations';
import Notifications from './pages/Notifications';
import Amicale from './pages/Amicale';
import Primes from './pages/Primes';
import Tickets from './pages/Tickets';
import AgenceDashboard from './pages/AgenceDashboard';
import AgenceAccounts from './pages/AgenceAccounts';
import AgenceCards from './pages/AgenceCards';
import AgenceCredits from './pages/AgenceCredits';
import TeamCalendar from './pages/TeamCalendar';
import DirectorDashboard from './pages/DirectorDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import FinancePayroll from './pages/FinancePayroll';
import FinanceBudgets from './pages/FinanceBudgets';
import FinanceAvances from './pages/FinanceAvances';
import Attendance from './pages/Attendance';

const RH_ROLES = ['RH', 'ADMIN', 'SUPER_ADMIN'];
const AGENCE_ROLES = ['AGENCE', 'ADMIN', 'SUPER_ADMIN'];
const FINANCE_ROLES = ['FINANCE', 'ADMIN', 'SUPER_ADMIN'];
const MANAGER_ROLES = ['MANAGER', 'RH', 'ADMIN', 'SUPER_ADMIN'];
const ALL_STAFF = ['RH', 'AGENCE', 'FINANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            {/* ── RH Portal ─────────────────────────────────────────── */}
            <Route index element={<ProtectedRoute allowedRoles={RH_ROLES}><Dashboard /></ProtectedRoute>} />
            <Route path="employees" element={<ProtectedRoute allowedRoles={RH_ROLES}><Employees /></ProtectedRoute>} />
            <Route path="employees/new" element={<ProtectedRoute allowedRoles={RH_ROLES}><NewEmployee /></ProtectedRoute>} />
            <Route path="departments" element={<ProtectedRoute allowedRoles={RH_ROLES}><Departments /></ProtectedRoute>} />
            <Route path="branches" element={<ProtectedRoute allowedRoles={RH_ROLES}><Branches /></ProtectedRoute>} />
            <Route path="audit" element={<ProtectedRoute allowedRoles={RH_ROLES}><Audit /></ProtectedRoute>} />
            <Route path="documents" element={<ProtectedRoute allowedRoles={RH_ROLES}><Documents /></ProtectedRoute>} />
            <Route path="requests" element={<ProtectedRoute allowedRoles={RH_ROLES}><Requests /></ProtectedRoute>} />
            <Route path="amicale" element={<ProtectedRoute allowedRoles={RH_ROLES}><Amicale /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={RH_ROLES}><Attendance /></ProtectedRoute>} />
            <Route path="team-calendar" element={<ProtectedRoute allowedRoles={RH_ROLES}><TeamCalendar /></ProtectedRoute>} />

            {/* ── Shared (RH + Agence) ──────────────────────────────── */}
            <Route path="risk-alerts" element={<ProtectedRoute allowedRoles={[...RH_ROLES, ...AGENCE_ROLES]}><RiskAlerts /></ProtectedRoute>} />
            <Route path="fraud-detection" element={<ProtectedRoute allowedRoles={[...RH_ROLES, ...AGENCE_ROLES]}><FraudDetection /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Analytics /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Reports /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Settings /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Notifications /></ProtectedRoute>} />
            <Route path="messages" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Messages /></ProtectedRoute>} />
            <Route path="conversations" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Conversations /></ProtectedRoute>} />
            <Route path="tickets" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Tickets /></ProtectedRoute>} />
            <Route path="investments" element={<ProtectedRoute allowedRoles={[...RH_ROLES, ...FINANCE_ROLES]}><Investments /></ProtectedRoute>} />
            <Route path="budgets" element={<ProtectedRoute allowedRoles={[...RH_ROLES, ...FINANCE_ROLES]}><Budgets /></ProtectedRoute>} />

            {/* ── Agence Portal ────────────────────────────────────── */}
            <Route path="agence" element={<ProtectedRoute allowedRoles={AGENCE_ROLES}><AgenceDashboard /></ProtectedRoute>} />
            <Route path="agence/accounts" element={<ProtectedRoute allowedRoles={AGENCE_ROLES}><AgenceAccounts /></ProtectedRoute>} />
            <Route path="agence/cards" element={<ProtectedRoute allowedRoles={AGENCE_ROLES}><AgenceCards /></ProtectedRoute>} />

            {/* ── Finance Portal ───────────────────────────────────── */}
            <Route path="finance" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FinanceDashboard /></ProtectedRoute>} />
            <Route path="finance/payroll" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FinancePayroll /></ProtectedRoute>} />
            <Route path="primes" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><Primes /></ProtectedRoute>} />
            <Route path="finance/credits" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><AgenceCredits /></ProtectedRoute>} />
            <Route path="finance/credits/:id" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><AgenceCredits /></ProtectedRoute>} />
            <Route path="employees/:id/financials" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><EmployeeFinancials /></ProtectedRoute>} />
            <Route path="finance/budgets" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FinanceBudgets /></ProtectedRoute>} />
            <Route path="finance/avances" element={<ProtectedRoute allowedRoles={FINANCE_ROLES}><FinanceAvances /></ProtectedRoute>} />

            {/* ── Manager / Director Portal ─────────────────────────── */}
            <Route path="director" element={<ProtectedRoute allowedRoles={MANAGER_ROLES}><DirectorDashboard /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(18,18,28,0.95)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
