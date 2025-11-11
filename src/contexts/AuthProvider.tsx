import React, { useEffect, useState, ReactNode } from 'react';
import { fetchCurrentUser, type XanoUser } from '@/services/auth';
import { AuthContext, type AuthContextType } from './AuthContext';

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
      } else {
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
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

      // Extract auth token from various possible fields
      const authToken = data.authToken || data.token || data.access_token;

      if (!authToken) {
        throw new Error('Invalid response from server');
      }

      // Store auth token locally
      localStorage.setItem('auth_token', authToken);

      // Try to get user profile from the login response first
      let profile: XanoUser | null = null;
      if (data.user) {
        profile = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name
        };
      } else {
        // Fall back to fetching the profile from Xano
        profile = await fetchCurrentUser(authToken);
      }

      if (profile) {
        localStorage.setItem('user_data', JSON.stringify(profile));
        setUser(profile);
        return true;
      }

      throw new Error('Failed to fetch user profile');
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