import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface User {
  sub: string;
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
  primaryRole: string;
  defaultPath: string;
}

const ALLOWED_ROLES = ['RH', 'ADMIN', 'SUPER_ADMIN', 'AGENCE', 'MANAGER', 'FINANCE'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getDefaultPath = (roles: string[]): string => {
  if (roles.includes('RH') || roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) return '/';
  if (roles.includes('AGENCE')) return '/agence';
  if (roles.includes('FINANCE')) return '/finance';
  if (roles.includes('MANAGER')) return '/director';
  return '/';
};

const getPrimaryRole = (roles: string[]): string => {
  if (roles.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('RH')) return 'RH';
  if (roles.includes('AGENCE')) return 'AGENCE';
  if (roles.includes('FINANCE')) return 'FINANCE';
  if (roles.includes('MANAGER')) return 'MANAGER';
  return 'EMPLOYEE';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('stb_rh_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data.data || res.data;
          const roles = userData?.roles || [];
          if (ALLOWED_ROLES.some((r) => roles.includes(r))) {
            setUser({ ...userData, roles });
          } else {
            toast.error('Accès refusé. Rôle non autorisé pour le portail web.');
            logout();
          }
        } catch (error) {
          console.error('Auth check error:', error);
          logout();
        }
      }
      setIsLoading(false);
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
        toast.success(`Bienvenue, ${employee.prenom} ${employee.nom} 👋`);
        // Role-based redirect
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
    setUser(null);
    navigate('/login');
  };

  const roles = user?.roles ?? [];
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
      isRH, isAgence, isFinance, isManager, isAdmin,
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
