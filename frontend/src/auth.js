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

  async login(email, password, role) {
    const data = await api.post('/auth/login', { email, password });
    if (data.access_token) {
      api.setToken(data.access_token);
      // Fetch user profile
      try {
        const user = await api.get('/auth/me');
        // Store selected role alongside profile
        user.selected_role = role || user.role;
        this.setUser(user);
        return { success: true, user };
      } catch {
        // Fallback user profile if me endpoint has delay
        const fallbackUser = { email, full_name: email.split('@')[0], role: role || 'SalesRep', selected_role: role || 'SalesRep' };
        this.setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }
    }
    throw new Error('Authentication failed: No access token received');
  },

  async signup({ full_name, email, password, role }) {
    const data = await api.post('/auth/signup', { full_name, email, password, role });
    return data;
  },

  logout() {
    api.setToken(null);
    this.setUser(null);
    window.location.hash = '#/login';
  },
};
