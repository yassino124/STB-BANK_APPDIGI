import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserPlus, Shield, Settings, LogOut, FileText,
  Building2, MapPin, BarChart3, AlertTriangle, ShieldCheck, FileBarChart,
  TrendingUp, Wallet, MessageSquare, UsersRound, Gift, Headphones, ChevronLeft, Menu,
  Banknote, CreditCard, Calendar, CalendarDays, Target, Monitor, Bell, ShieldAlert, GitMerge, Network
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
      { to: '/organigramme', icon: Network, label: 'Organigramme (N+1)' },
    ],
  },
  {
    label: 'Gestion RH',
    items: [
      { to: '/requests', icon: FileText, label: 'Demandes & Congés' },
      { to: '/recrutement', icon: UserPlus, label: 'Recrutement IA' },
      { to: '/documents', icon: FileText, label: 'Documents & Paie' },
      { to: '/attendance', icon: Calendar, label: 'Présence' },
      { to: '/team-calendar', icon: CalendarDays, label: 'Calendrier Équipe' },
      { to: '/amicale', icon: Gift, label: 'Amicale & Avantages' },
    ],
  },
  {
    label: 'Sécurité & Fraude',
    items: [
      { to: '/security-center', icon: ShieldAlert, label: 'Security Center' },
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
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/rules', icon: GitMerge, label: 'Moteur de Règles' },
      { to: '/audit', icon: Shield, label: 'Audit Logs' },
      { to: '/settings', icon: Settings, label: 'Paramètres' },
    ],
  },
];

// ADMIN / SUPER_ADMIN gets IT Dashboard (replaces security section for RH)
const adminExtraGroups = [
  {
    label: 'IT & Sécurité',
    items: [
      { to: '/it-dashboard', icon: Monitor, label: 'IT Dashboard' },
      { to: '/security-center', icon: ShieldAlert, label: 'Security Center' },
      { to: '/audit', icon: Shield, label: 'Audit Logs' },
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
    label: 'Collaborateurs',
    items: [
      { to: '/employees', icon: Users, label: 'Annuaire Collaborateurs' },
    ],
  },
  {
    label: 'Bancaire',
    items: [
      { to: '/agence/accounts', icon: Banknote, label: 'Comptes Bancaires' },
      { to: '/agence/cards', icon: CreditCard, label: 'Gestion des Cartes' },
      { to: '/agence/credits', icon: TrendingUp, label: 'Crédits' },
    ],
  },
  {
    label: 'Surveillance',
    items: [
      { to: '/security-center', icon: ShieldAlert, label: 'Security Center' },
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
    label: 'Collaborateurs',
    items: [
      { to: '/employees', icon: Users, label: 'Annuaire Collaborateurs' },
    ],
  },
  {
    label: 'Gestion Financière',
    items: [
      { to: '/finance/payroll', icon: FileText, label: 'Fiches de Paie' },
      { to: '/documents', icon: FileText, label: 'Documents RH' },
      { to: '/primes', icon: Gift, label: 'Primes & Bonus' },
      { to: '/finance/credits', icon: TrendingUp, label: 'Crédits Collab' },
      { to: '/finance/avances', icon: TrendingUp, label: 'Avances Salaire' },
      { to: '/investments', icon: TrendingUp, label: 'Investissements' },
    ],
  },
  {
    label: 'Sécurité & Surviellance',
    items: [
      { to: '/security-center', icon: ShieldAlert, label: 'Security Center' },
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
    label: 'Collaborateurs',
    items: [
      { to: '/employees', icon: Users, label: 'Annuaire Collaborateurs' },
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
    label: 'Sécurité',
    items: [
      { to: '/security-center', icon: ShieldAlert, label: 'Security Center' },
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

// ── IT Portal nav (only IT role users) ─────────────────────────
const itNavGroups = [
  {
    label: 'IT Operations',
    items: [
      { to: '/it-dashboard', icon: Monitor, label: 'IT Dashboard' },
    ],
  },
  {
    label: 'Gestion Système',
    items: [
      { to: '/audit', icon: Shield, label: 'Audit & Logs' },
      { to: '/security-center', icon: ShieldAlert, label: 'Security Center' },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/tickets', icon: Headphones, label: 'Support Tickets' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
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
  const { user, logout, isAgence, isFinance, isManager, isRH, isAdmin, isIT } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Pure IT user = has IT role but is NOT also RH/AGENCE/FINANCE etc.
  const pureIT = isIT && !isRH && !isAgence && !isFinance;
  // Pure admin = ADMIN/SUPER_ADMIN but without any specific portal role
  const pureAdmin = isAdmin && !isRH && !isAgence && !isFinance && !isManager && !pureIT;

  // Route to the right portal
  const baseGroups = pureIT ? itNavGroups
    : isAgence ? agenceNavGroups
    : isFinance ? financeNavGroups
    : isManager && !isRH ? directionNavGroups
    : rhNavGroups;

  // Only pure admins (no other role) get the IT extra section injected
  const navGroups = pureAdmin
    ? [...baseGroups.filter(g => g.label !== 'Administration'), ...adminExtraGroups, { label: 'Administration', items: [{ to: '/settings', icon: Settings, label: 'Paramètres' }] }]
    : baseGroups;

  const roleLabel = pureIT ? 'Portail IT' : isAgence ? 'Portail Agence' : isFinance ? 'Portail Finance' : isManager && !isRH ? 'Portail Direction' : 'Portail RH';
  const roleBadge = pureIT ? '#0EA5E9' : isAgence ? '#0288D1' : isFinance ? '#065F46' : isManager && !isRH ? '#7C3AED' : '#1E3A8A';

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
          width: '46px', height: '46px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(41,98,255,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          flexShrink: 0,
          overflow: 'hidden',
          background: 'transparent',
        }}>
          <img src="/stb_logo.png" alt="STB" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const parent = img.parentElement;
              if (parent && !parent.querySelector('span')) {
                parent.style.background = 'linear-gradient(135deg, #0d266b, #2962FF)';
                const span = document.createElement('span');
                span.style.cssText = 'font-size:0.85rem;font-weight:900;color:#fff;letter-spacing:-0.5px;font-family:system-ui';
                span.textContent = 'STB';
                parent.appendChild(span);
              }
            }} />
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
                 {pureIT ? '🖥️ STB IT Portal' : isAgence ? 'STB Agence' : isFinance ? 'STB Finance' : (isManager && !isRH) ? 'STB Direction' : 'STB Portal RH'}
               </div>
               <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                 {pureIT ? 'IT Operations Center' : isAgence ? 'Finance & Opérations' : isFinance ? 'Portail Finance' : (isManager && !isRH) ? 'Portail Direction' : 'Enterprise Edition'}
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

        <Link 
          to={user?._id ? `/employees/${user._id}/360` : '#'}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: collapsed ? '0.6rem 0' : '0.75rem',
            background: 'rgba(13,71,161,0.12)',
            border: '1px solid var(--border-blue)',
            borderRadius: 'var(--r-md)',
            marginBottom: '0.5rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(13,71,161,0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(13,71,161,0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--stb-blue-700), var(--stb-electric))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.75rem', color: '#fff', boxShadow: '0 4px 10px rgba(41,98,255,0.3)' }}>
            {user?.matricule?.charAt(0) ?? 'A'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.matricule ?? 'Admin'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--stb-electric)', fontWeight: 600 }}>
                  Mon Profil 360
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

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