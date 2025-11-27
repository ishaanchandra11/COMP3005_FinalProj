import { create } from 'zustand';
import api from './api';

export interface User {
  userId: number;
  email: string;
  role: 'member' | 'trainer' | 'admin';
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'O';
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// Helper function to safely get user from localStorage
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const useAuth = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user, profile } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...user, profile }));
      set({ user: { ...user, profile }, token, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data || error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', data);
      const { token, user, member } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...user, profile: member }));
      set({ user: { ...user, profile: member }, token, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      // Set user from localStorage immediately to avoid null state
      const storedUser = getStoredUser();
      if (storedUser) {
        set({ user: storedUser, token, isLoading: false });
      }
      
      // Then refresh from API to ensure data is up to date
      set({ isLoading: true });
      try {
        const response = await api.get('/auth/me');
        const { user, profile } = response.data;
        const updatedUser = { ...user, profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser, token, isLoading: false });
      } catch (error) {
        // Only clear auth if token is invalid (401), otherwise keep stored user
        if (error instanceof Error && 'response' in error && (error as any).response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, isLoading: false });
        } else {
          // Keep stored user if it's not an auth error
          set({ isLoading: false });
        }
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

