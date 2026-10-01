/**
 * Utility for resolving backend API URL and WebSocket URL dynamically
 * based on current browser location (supports localhost, LAN IP, and mobile devices).
 */

export function getApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    // If frontend is running on Vite dev server (port 5173), target backend port 3001 on same hostname
    if (port === '5173') {
      return `${protocol}//${hostname}:3001`;
    }
    // If served directly from backend (port 3001) or production build
    if (port) {
      return `${protocol}//${hostname}:${port}`;
    }
    return `${protocol}//${hostname}`;
  }

  return 'http://localhost:3001';
}

export function getWsUrl(apiUrl) {
  const target = apiUrl || getApiUrl();
  try {
    const url = new URL(target);
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${url.host}`;
  } catch {
    return target.replace(/^http/, 'ws');
  }
}
