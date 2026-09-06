/**
 * DealFlow360 API Client
 * Centralized fetch client for backend communication with auth token injection.
 */

const BASE_URL = '/api/v1';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = {
  getToken() {
    return localStorage.getItem('dealflow_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('dealflow_token', token);
    } else {
      localStorage.removeItem('dealflow_token');
    }
  },

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = this.getHeaders(options.headers);
    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const res = await fetch(url, config);

      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        // Token invalid or expired
        this.setToken(null);
        localStorage.removeItem('dealflow_user');
        window.location.hash = '#/login';
        throw new ApiError('Session expired. Please sign in again.', 401, null);
      }

      if (res.status === 204) {
        return null;
      }

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const errorMsg = data?.detail || data?.message || `Request failed with status ${res.status}`;
        throw new ApiError(errorMsg, res.status, data);
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network connection failed', 0, null);
    }
  },

  get(endpoint, params) {
    let url = endpoint;
    if (params) {
      const search = new URLSearchParams(params).toString();
      if (search) url += `?${search}`;
    }
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async downloadFile(endpoint, filename) {
    const url = `${BASE_URL}${endpoint}`;
    const token = this.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Download failed with status ${res.status}`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
