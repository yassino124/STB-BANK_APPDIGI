import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { socketService } from '../api/socket';

interface User {
  sub: string;
  _id?: string;
  matricule: string;
  prenom?: string;
  nom?: string;
  poste?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (matricule: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isRH: boolean;
  isAgence: boolean;
  isFinance: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isIT: boolean;
  primaryRole: string;
  defaultPath: string;
}

const ALLOWED_ROLES = ['RH', 'ADMIN', 'SUPER_ADMIN', 'AGENCE', 'MANAGER', 'FINANCE', 'IT'];
const CACHED_USER_KEY = 'stb_rh_user_cache';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getDefaultPath = (roles: string[]): string => {
  const hasRH = roles.includes('RH') || roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  const hasIT = roles.includes('IT');
  // Pure IT (no RH/ADMIN mix) → IT portal
  if (hasIT && !hasRH) return '/it-dashboard';
  // RH / ADMIN / SUPER_ADMIN → RH portal
  if (hasRH) return '/';
  if (roles.includes('AGENCE')) return '/agence';
  if (roles.includes('FINANCE')) return '/finance';
  if (roles.includes('MANAGER')) return '/director';
  return '/';
};

const getPrimaryRole = (roles: string[]): string => {
  if (roles.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('IT')) return 'IT';
  if (roles.includes('RH')) return 'RH';
  if (roles.includes('AGENCE')) return 'AGENCE';
  if (roles.includes('FINANCE')) return 'FINANCE';
  if (roles.includes('MANAGER')) return 'MANAGER';
  return 'EMPLOYEE';
};

// Get user from sessionStorage instantly (synchronous, no flash)
const getCachedUser = (): User | null => {
  try {
    const cached = sessionStorage.getItem(CACHED_USER_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hasToken = !!localStorage.getItem('stb_rh_token');
  const cachedUser = getCachedUser();

  // ✅ Initialize from cache IMMEDIATELY — no loading flash on page reload
  const [user, setUser] = useState<User | null>(hasToken ? cachedUser : null);
  // Only show loading spinner if we have a token but NO cached user yet
  const [isLoading, setIsLoading] = useState(hasToken && !cachedUser);
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const checkAuth = async () => {
      const tok = localStorage.getItem('stb_rh_token');
      if (!tok) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const userData = res.data.data || res.data;
        const roles = userData?.roles || [];
        if (ALLOWED_ROLES.some((r) => roles.includes(r))) {
          const u: User = {
            ...userData,
            sub: userData._id || userData.sub,
            roles,
          };
          setUser(u);
          // ✅ Update cache with fresh data from server
          sessionStorage.setItem(CACHED_USER_KEY, JSON.stringify(u));
          socketService.connect(tok); // Connect to realtime socket
        } else {
          toast.error('Accès refusé. Rôle non autorisé pour le portail web.');
          logout();
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        // Only force logout on 401 (expired token), not network errors
        if (error?.response?.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter.');
          logout();
        }
        // else: keep showing cached data (offline / server down scenario)
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (matricule: string, password: string) => {
    try {
      const res = await api.post('/auth/login/web', { matricule, password });
      const responseData = res.data.data || res.data;
      const { accessToken, employee } = responseData;
      const roles: string[] = employee?.roles || [];

      if (ALLOWED_ROLES.some((r) => roles.includes(r))) {
        localStorage.setItem('stb_rh_token', accessToken);
        const u: User = {
          sub: employee._id,
          matricule: employee.matricule,
          prenom: employee.prenom,
          nom: employee.nom,
          poste: employee.poste,
          roles,
        };
        setUser(u);
        // ✅ Cache immediately on login
        sessionStorage.setItem(CACHED_USER_KEY, JSON.stringify(u));
        socketService.connect(accessToken); // Connect to realtime socket
        toast.success(`Bienvenue, ${employee.prenom} ${employee.nom} 👋`);
        navigate(getDefaultPath(roles), { replace: true });
      } else {
        toast.error('Accès refusé. Ce portail est réservé aux gestionnaires.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('stb_rh_token');
    sessionStorage.removeItem(CACHED_USER_KEY);
    setUser(null);
    socketService.disconnect(); // Disconnect socket on logout
    navigate('/login');
  };

  const roles = user?.roles ?? [];
  const isIT = roles.includes('IT');
  const isRH = roles.includes('RH') || roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  const isAgence = roles.includes('AGENCE');
  const isFinance = roles.includes('FINANCE');
  const isManager = roles.includes('MANAGER');
  const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  const primaryRole = getPrimaryRole(roles);
  const defaultPath = getDefaultPath(roles);

  return (
    <AuthContext.Provider value={{
      user, login, logout, isLoading,
      isRH, isAgence, isFinance, isManager, isAdmin, isIT,
      primaryRole, defaultPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
