import { Platform } from 'react-native';

// ============================================================================
// IMPORTANT: To run on a PHYSICAL PHONE, set this to your computer's local IP.
// Find it with `ifconfig` (Mac/Linux) or `ipconfig` (Windows) — looks like
// 192.168.x.x. Your phone and computer must be on the same WiFi network.
// Example: const LAN_IP = '192.168.1.42';
// Leave as null to use emulator defaults (10.0.2.2 for Android emulator).
// ============================================================================
const LAN_IP = '192.168.29.169';

// Public ngrok tunnel — reachable from a physical phone with no firewall changes.
// Set to null to fall back to LAN_IP / emulator defaults below.
const NGROK_URL = 'https://washbasin-relenting-monologue.ngrok-free.dev';

const API_BASE = NGROK_URL
  ? NGROK_URL
  : LAN_IP
    ? `http://${LAN_IP}:8000`
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:8000'
      : 'http://localhost:8000';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const request = async (path, options = {}) => {
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  if (!options.headers?.['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
};

export const api = {
  sendOtp: (phone) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (phone, otp) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),

  getInvoices: (page = 1, perPage = 20) =>
    request(`/invoice/list?page=${page}&per_page=${perPage}`),

  uploadInvoice: async (fileUri, fileName) => {
    const form = new FormData();
    const type = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    form.append('file', { uri: fileUri, name: fileName, type });
    return request('/invoice/upload', { method: 'POST', body: form });
  },

  uploadGstr2b: async (fileUri, fileName) => {
    const form = new FormData();
    form.append('file', { uri: fileUri, name: fileName, type: 'text/csv' });
    return request('/gstr2b/upload', { method: 'POST', body: form });
  },

  getMismatches: () => request('/gstr2b/mismatches'),
  getItcSummary: () => request('/itc/summary'),
  getRiskScore: () => request('/risk/score'),
  getTasks: () => request('/tasks/list'),
  markTaskDone: (taskId, proofType, cashNote) =>
    request('/tasks/done', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, proof_type: proofType, cash_note: cashNote }),
    }),
  getSuppliers: () => request('/supplier/list'),
  sendSupplierMessage: (supplierId, channel, message, invoiceId) =>
    request('/supplier/message', {
      method: 'POST',
      body: JSON.stringify({
        supplier_id: supplierId,
        channel,
        edited_message: message,
        related_invoice_id: invoiceId,
      }),
    }),
  chatQuery: (query) =>
    request('/chatbot/query', { method: 'POST', body: JSON.stringify({ query }) }),
  getAnalytics: (month) => request(`/analytics/monthly${month ? `?month=${month}` : ''}`),
  getInvoiceDetail: (invoiceId) => request(`/invoice/detail?invoice_id=${invoiceId}`),
  health: () => request('/health'),
};
