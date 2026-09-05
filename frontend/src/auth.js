/**
 * DealFlow360 Authentication Service
 */
import { api } from './api.js';

export const auth = {
  getUser() {
    try {
      const user = localStorage.getItem('dealflow_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('dealflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dealflow_user');
    }
  },

  isAuthenticated() {
    return !!api.getToken();
  },

  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data.access_token) {
      api.setToken(data.access_token);
      // Fetch user profile
      try {
        const user = await api.get('/auth/me');
        this.setUser(user);
        return { success: true, user };
      } catch {
        // Fallback user profile if me endpoint has delay
        const fallbackUser = { email, full_name: 'Eleanor Vance', role: 'Sales Director' };
        this.setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }
    }
    throw new Error('Authentication failed: No access token received');
  },

  logout() {
    api.setToken(null);
    this.setUser(null);
    window.location.hash = '#/login';
  },
};
