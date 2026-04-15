import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const TOKEN_KEY = "doceditor_token";

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: loadToken(),
  setToken: (token) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore storage failures
    }
    set({ token });
  },
  logout: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    set({ token: null });
  },
}));

