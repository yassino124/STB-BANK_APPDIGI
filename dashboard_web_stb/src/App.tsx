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
import Recrutement from './pages/Recrutement';
import Settings from './pages/Settings';
import Employee360 from './pages/Employee360';
import EmployeeFinancials from './pages/EmployeeFinancials';
import Requests from './pages/Requests';
import Departments from './pages/Departments';
import Branches from './pages/Branches';
import Analytics from './pages/Analytics';
import SecurityCenter from './pages/SecurityCenter';
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
import ITDashboard from './pages/ITDashboard';
import FinancePayroll from './pages/FinancePayroll';
import FinanceBudgets from './pages/FinanceBudgets';
import FinanceAvances from './pages/FinanceAvances';
import Attendance from './pages/Attendance';

const RH_ROLES = ['RH', 'ADMIN', 'SUPER_ADMIN'];
const AGENCE_ROLES = ['AGENCE', 'ADMIN', 'SUPER_ADMIN'];
const FINANCE_ROLES = ['FINANCE', 'ADMIN', 'SUPER_ADMIN'];
const MANAGER_ROLES = ['MANAGER', 'RH', 'ADMIN', 'SUPER_ADMIN'];
const ALL_STAFF = ['RH', 'AGENCE', 'FINANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN', 'IT'];
const ADMIN_ONLY = ['ADMIN', 'SUPER_ADMIN', 'IT'];  // IT can see security + audit too

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            {/* ── RH Portal ─────────────────────────────────────────── */}
            <Route index element={<ProtectedRoute allowedRoles={RH_ROLES}><Dashboard /></ProtectedRoute>} />
            <Route path="employees" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Employees /></ProtectedRoute>} />
            <Route path="employees/:id/360" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Employee360 /></ProtectedRoute>} />
            <Route path="employees/new" element={<ProtectedRoute allowedRoles={RH_ROLES}><NewEmployee /></ProtectedRoute>} />
            <Route path="recrutement" element={<ProtectedRoute allowedRoles={RH_ROLES}><Recrutement /></ProtectedRoute>} />
            <Route path="departments" element={<ProtectedRoute allowedRoles={RH_ROLES}><Departments /></ProtectedRoute>} />
            <Route path="branches" element={<ProtectedRoute allowedRoles={RH_ROLES}><Branches /></ProtectedRoute>} />
            <Route path="audit" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><Audit /></ProtectedRoute>} />
            <Route path="documents" element={<ProtectedRoute allowedRoles={[...RH_ROLES, ...FINANCE_ROLES]}><Documents /></ProtectedRoute>} />
            <Route path="requests" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Requests /></ProtectedRoute>} />
            <Route path="amicale" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Amicale /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={ALL_STAFF}><Attendance /></ProtectedRoute>} />
            <Route path="team-calendar" element={<ProtectedRoute allowedRoles={ALL_STAFF}><TeamCalendar /></ProtectedRoute>} />

            {/* ── Shared (RH + Agence) ──────────────────────────────── */}
            <Route path="security-center" element={<ProtectedRoute allowedRoles={ALL_STAFF}><SecurityCenter /></ProtectedRoute>} />
            <Route path="it-dashboard" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ITDashboard /></ProtectedRoute>} />
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
            <Route path="employees/:id/financials" element={<ProtectedRoute allowedRoles={ALL_STAFF}><EmployeeFinancials /></ProtectedRoute>} />
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
