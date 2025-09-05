import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchCurrentUser, type XanoUser } from '@/services/auth';

interface AuthContextType {
  user: XanoUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<XanoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount and fetch user profile
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    const loadUser = async () => {
      const profile = await fetchCurrentUser(token);
      if (profile) {
        setUser(profile);
        localStorage.setItem('user_data', JSON.stringify(profile));
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Collect device info (you can enhance this based on your needs)
      const deviceInfo = {
        email,
        password,
        os: navigator.platform || "",
        os_version: navigator.userAgent || "",
        app_version: "1.0.0",
        version_code: "100",
        device_brand_name: navigator.vendor || "",
        device_model_name: navigator.userAgent.split(' ')[0] || ""
      };

      const response = await fetch('https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/user_login_Upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceInfo)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Store auth token and fetch user profile from Xano
      if (data.authToken || data.token || data.access_token) {
        const authToken = data.authToken || data.token || data.access_token;
        localStorage.setItem('auth_token', authToken);

        const profile = await fetchCurrentUser(authToken);
        if (profile) {
          localStorage.setItem('user_data', JSON.stringify(profile));
          setUser(profile);
          return true;
        }

        throw new Error('Failed to fetch user profile');
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};