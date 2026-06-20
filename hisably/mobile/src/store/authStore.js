import { create } from 'zustand';
import { api, setAuthToken, setAuthErrorHandler } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@hisably_auth';
const ONBOARDED_KEY = '@hisably_onboarded';

function getInitials(name) {
  if (!name) return 'U';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  onboarded: false,

  initialize: async () => {
    // Let the API layer force a logout if any request is rejected with 401
    // (e.g. a token signed with a rotated/old JWT secret).
    setAuthErrorHandler(() => get().logout());
    try {
      const [stored, onboarded] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(ONBOARDED_KEY),
      ]);
      if (stored) {
        const { user, session } = JSON.parse(stored);
        setAuthToken(session.access_token);
        set({ user, session, loading: false, onboarded: !!onboarded });

        // Validate the cached token in the background. If it is stale, the
        // health-protected probe returns 401 and the auth-error handler logs out.
        api.getInvoiceSummary?.().catch(() => {});
        return;
      }
      set({ loading: false, onboarded: !!onboarded });
    } catch (_) {
      set({ loading: false });
    }
  },

  setOnboarded: async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    set({ onboarded: true });
  },

  sendOtp: async (phone) => {
    const res = await api.sendOtp(phone);
    return res;
  },

  verifyOtp: async (phone, otp, name) => {
    const result = await api.verifyOtp(phone, otp);
    const user = {
      id: result.user_id,
      phone: result.phone || `+91${phone}`,
      name: name || '',
      initials: getInitials(name),
    };
    const session = { access_token: result.token };
    setAuthToken(result.token);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, session }));
    set({ user, session });
  },

  updateUser: async (updates) => {
    const state = get();
    const user = { ...state.user, ...updates };
    if (updates.name) {
      user.initials = getInitials(updates.name);
    }
    const session = state.session;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, session }));
    set({ user });
  },

  loginDemo: async () => {
    setAuthToken('demo-token');
    const user = { id: 'demo', email: 'demo@hisably.in', name: 'Demo User', initials: 'DU' };
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
