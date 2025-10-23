import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import Cookies from 'js-cookie';
import { User } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  ready: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      ready: false,

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          });
          console.log(response.data.data)
          // Handle different response structures
          const responseData = response.data.data
          const user = responseData.user;
          const accessToken = responseData.accessToken || responseData.token;
          
          if (!user || !accessToken) {
            throw new Error('Invalid response from server');
          }
          
          // Set cookies
          Cookies.set('auth_token', accessToken, COOKIE_CONFIG);
          Cookies.set('user_data', JSON.stringify(user), COOKIE_CONFIG);
          
          set({ 
            user, 
            token: accessToken, 
            loading: false,
            isAuthenticated: true 
          });
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error: any) {
          set({ loading: false, isAuthenticated: false });
          get().clearAuth();
          throw new Error(
            error.response?.data?.message || 
            error.response?.data?.error || 
            'Login failed'
          );
        }
      },

      register: async (userData: any) => {
        set({ loading: true });
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData);
          
          const responseData = response.data.data || response.data;
          const user = responseData.user;
          const accessToken = responseData.accessToken || responseData.token;
          
          if (!user || !accessToken) {
            throw new Error('Invalid response from server');
          }
          
          // Set cookies
          Cookies.set('auth_token', accessToken, COOKIE_CONFIG);
          Cookies.set('user_data', JSON.stringify(user), COOKIE_CONFIG);
          
          set({ 
            user, 
            token: accessToken, 
            loading: false,
            isAuthenticated: true 
          });
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error: any) {
          set({ loading: false, isAuthenticated: false });
          get().clearAuth();
          throw new Error(
            error.response?.data?.message || 
            error.response?.data?.error || 
            'Registration failed'
          );
        }
      },

      logout: () => {
        // Clear cookies
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          ready: true 
        });
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('auth-storage');
      },

      initialize: () => {
        set({ loading: true });
        
        const tokenFromCookie = Cookies.get('auth_token');
        const userFromCookie = Cookies.get('user_data');

        if (tokenFromCookie && userFromCookie && userFromCookie !== 'undefined') {
          try {
            const user = JSON.parse(userFromCookie);
            set({ 
              user, 
              token: tokenFromCookie, 
              isAuthenticated: true,
              loading: false,
              ready: true
            });
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromCookie}`;
          } catch (error) {
            console.error('Error parsing user data from cookie:', error);
            get().clearAuth();
            set({ loading: false, ready: true });
          }
        } else {
          // Fallback to persisted state
          const { token } = get();
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            set({ isAuthenticated: true });
          }
          set({ loading: false, ready: true });
        }
      },

      updateUser: (user: User) => {
        set({ user });
        Cookies.set('user_data', JSON.stringify(user), COOKIE_CONFIG);
      },

      clearAuth: () => {
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          ready: true
        });
        delete axios.defaults.headers.common['Authorization'];
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);