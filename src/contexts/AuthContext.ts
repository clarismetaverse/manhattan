import { createContext } from 'react';
import type { XanoUser } from '@/services/auth';

export interface AuthContextType {
  user: XanoUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
