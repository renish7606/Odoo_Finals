/**
 * DealFlow360 Frontend Application Bootstrap
 */
import { Router } from './router.js';
import { auth } from './auth.js';
import { api } from './api.js';

function bootstrap() {
  api.setToken(null);
  auth.setUser(null);
  if (window.location.hash !== '#/login') {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/login`);
  }
  const router = new Router();
  router.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
