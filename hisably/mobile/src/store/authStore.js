import { create } from 'zustand';
import { api, setAuthToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@hisably_auth';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        const { user, session } = JSON.parse(stored);
        setAuthToken(session.access_token);
        set({ user, session, loading: false });
        return;
      }
    } catch (_) {}
    set({ loading: false });
  },

  sendOtp: async (phone) => {
    const res = await api.sendOtp(phone);
    return res;
  },

  verifyOtp: async (phone, otp) => {
    const result = await api.verifyOtp(phone, otp);
    const user = { id: result.user_id, phone: result.phone || `+91${phone}` };
    const session = { access_token: result.token };
    setAuthToken(result.token);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, session }));
    set({ user, session });
  },

  loginDemo: async () => {
    setAuthToken('demo-token');
    const user = { id: 'demo', email: 'demo@hisably.in' };
    const session = { access_token: 'demo-token' };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, session }));
    set({ user, session });
  },

  logout: async () => {
    setAuthToken(null);
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ user: null, session: null });
  },
}));
