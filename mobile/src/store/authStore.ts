import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, UserOut } from '../api/auth';

interface AuthState {
    token: string | null;
    user: UserOut | null;
    isLoading: boolean;
    hydrated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hydrate: () => Promise<void>;
    setUser: (user: UserOut) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: null,
    user: null,
    isLoading: false,
    hydrated: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await authApi.login(email, password);
            const { access_token, user } = res.data;
            await AsyncStorage.setItem('token', access_token);
            set({ token: access_token, user, isLoading: false });
        } catch (e) {
            set({ isLoading: false });
            throw e;
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true });
        try {
            const res = await authApi.register(name, email, password);
            const { access_token, user } = res.data;
            await AsyncStorage.setItem('token', access_token);
            set({ token: access_token, user, isLoading: false });
        } catch (e) {
            set({ isLoading: false });
            throw e;
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        set({ token: null, user: null });
    },

    hydrate: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                set({ token });
                const res = await authApi.me();
                set({ user: res.data, hydrated: true });
            } else {
                set({ hydrated: true });
            }
        } catch {
            await AsyncStorage.removeItem('token');
            set({ token: null, user: null, hydrated: true });
        }
    },

    setUser: (user) => set({ user }),
}));
