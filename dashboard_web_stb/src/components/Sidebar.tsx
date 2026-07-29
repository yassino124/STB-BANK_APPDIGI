import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserPlus, Shield, Settings, LogOut, FileText,
  Building2, MapPin, BarChart3, AlertTriangle, ShieldCheck, FileBarChart,
  TrendingUp, Wallet, MessageSquare, UsersRound, Gift, Headphones, ChevronLeft, Menu,
  Banknote, CreditCard, Calendar, CalendarDays, Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const rhNavGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    ],
  },
  {
    label: 'Collaborateurs',
    items: [
      { to: '/employees', icon: Users, label: 'Annuaire RH' },
      { to: '/employees/new', icon: UserPlus, label: 'Nouveau collaborateur' },
      { to: '/departments', icon: Building2, label: 'Départements' },
      { to: '/branches', icon: MapPin, label: 'Agences' },
    ],
  },
  {
    label: 'Gestion RH',
    items: [
      { to: '/requests', icon: FileText, label: 'Demandes & Congés' },
      { to: '/documents', icon: FileText, label: 'Documents & Paie' },
      { to: '/attendance', icon: Calendar, label: 'Présence' },
      { to: '/team-calendar', icon: CalendarDays, label: 'Calendrier Équipe' },
      { to: '/amicale', icon: Gift, label: 'Amicale & Avantages' },
    ],
  },
  {
    label: 'Sécurité',
    items: [
      { to: '/risk-alerts', icon: AlertTriangle, label: 'Alertes Risque' },
      { to: '/fraud-detection', icon: ShieldCheck, label: 'Fraude' },
    ],
  },
  {
    label: 'Rapports',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/reports', icon: FileBarChart, label: 'Rapports' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/tickets', icon: Headphones, label: 'Support Tickets' },
      { to: '/messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/audit', icon: Shield, label: 'Audit Logs' },
      { to: '/settings', icon: Settings, label: 'Paramètres' },
    ],
  },
];

const agenceNavGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/agence', icon: LayoutDashboard, label: 'Tableau de bord' },
    ],
  },
  {
    label: 'Bancaire',
    items: [
      { to: '/agence/accounts', icon: Banknote, label: 'Comptes Bancaires' },
      { to: '/agence/cards', icon: CreditCard, label: 'Gestion des Cartes' },
    ],
  },
  {
    label: 'Surveillance',
    items: [
      { to: '/risk-alerts', icon: AlertTriangle, label: 'Alertes Fraude' },
      { to: '/fraud-detection', icon: ShieldCheck, label: 'Détection Fraude' },
    ],
  },
  {
    label: 'Rapports',
    items: [
      { to: '/reports', icon: FileBarChart, label: 'Rapports' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/settings', icon: Settings, label: 'Paramètres' },
    ],
  },
];

const financeNavGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/finance', icon: LayoutDashboard, label: 'Tableau de bord' },
    ],
  },
  {
    label: 'Gestion Financière',
    items: [
      { to: '/finance/payroll', icon: FileText, label: 'Fiches de Paie' },
      { to: '/primes', icon: Gift, label: 'Primes & Bonus' },
      { to: '/finance/budgets', icon: Wallet, label: 'Budgets' },
      { to: '/finance/credits', icon: TrendingUp, label: 'Crédits Collab' },
      { to: '/finance/avances', icon: TrendingUp, label: 'Avances Salaire' },
      { to: '/investments', icon: TrendingUp, label: 'Investissements' },
    ],
  },
  {
    label: 'Rapports',
    items: [
      { to: '/reports', icon: FileBarChart, label: 'Rapports' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/settings', icon: Settings, label: 'Paramètres' },
    ],
  },
];

const directionNavGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/director', icon: LayoutDashboard, label: 'Mon Dashboard' },
    ],
  },
  {
    label: 'Mon Équipe',
    items: [
      { to: '/requests', icon: FileText, label: 'Demandes en attente' },
      { to: '/team-calendar', icon: CalendarDays, label: 'Calendrier Équipe' },
      { to: '/attendance', icon: Calendar, label: 'Absences Équipe' },
    ],
  },
  {
    label: 'Rapports',
    items: [
      { to: '/reports', icon: FileBarChart, label: 'Rapports' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/settings', icon: Settings, label: 'Paramètres' },
    ],
  },
];

const Sidebar = () => {
  const { user, logout, isAgence, isFinance, isManager, isRH } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = isAgence ? agenceNavGroups
    : isFinance ? financeNavGroups
    : isManager && !isRH ? directionNavGroups
    : rhNavGroups;

  const roleLabel = isAgence ? 'Portail Agence' : isFinance ? 'Portail Finance' : isManager && !isRH ? 'Portail Direction' : 'Portail RH';
  const roleBadge = isAgence ? '#0288D1' : isFinance ? '#065F46' : isManager && !isRH ? '#7C3AED' : '#1E3A8A';

  const sidebarWidth = collapsed ? 72 : 268;

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        width: sidebarWidth,
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 20,
        position: 'relative',
      }}
    >
      <div style={{
        padding: collapsed ? '1.5rem 0' : '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border)',
        minHeight: '80px',
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--stb-blue-700), var(--stb-electric))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(41,98,255,0.4)',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <img src="/stb_logo.png" alt="STB" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                 {isAgence ? 'STB Agence' : isFinance ? 'STB Finance' : (isManager && !isRH) ? 'STB Direction' : 'STB Portal RH'}
               </div>
               <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                 {isAgence ? 'Finance & Opérations' : isFinance ? 'Portail Finance' : (isManager && !isRH) ? 'Portail Direction' : 'Enterprise Edition'}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1rem 0.75rem' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '1.25rem' }}>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    padding: '0 0.5rem', marginBottom: '0.5rem',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {group.label}
                </motion.div>
              )}
            </AnimatePresence>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={collapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem 0' : '0.7rem 0.875rem',
                  borderRadius: 'var(--r-md)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--stb-blue-600), var(--stb-electric))'
                    : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  transition: 'all 0.2s',
                  marginBottom: '0.2rem',
                  boxShadow: isActive ? '0 4px 14px rgba(41,98,255,0.3)' : 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  textDecoration: 'none',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  if (!el.style.background.includes('gradient'))
                    el.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  if (!el.style.background.includes('gradient'))
                    el.style.background = 'transparent';
                }}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '0.75rem' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.6rem', padding: collapsed ? '0.75rem 0' : '0.75rem',
            width: '100%', borderRadius: 'var(--r-md)',
            color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)', transition: 'all 0.2s',
          }}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: collapsed ? '0.6rem 0' : '0.75rem',
          background: 'rgba(13,71,161,0.12)',
          border: '1px solid var(--border-blue)',
          borderRadius: 'var(--r-md)',
          marginBottom: '0.5rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
          overflow: 'hidden',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--stb-blue-700), var(--stb-electric))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
            {user?.matricule?.charAt(0) ?? 'A'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{user?.matricule ?? 'Admin'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {roleLabel}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.6rem', padding: collapsed ? '0.75rem 0' : '0.75rem',
            width: '100%', borderRadius: 'var(--r-md)',
            color: 'var(--danger)', background: 'var(--danger-bg)',
            border: '1px solid rgba(239,68,68,0.2)', transition: 'all 0.2s',
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;