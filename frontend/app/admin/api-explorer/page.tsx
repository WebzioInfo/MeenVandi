"use client";
import React, { useState } from 'react';
import axios from 'axios';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const DEFAULT_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const presets = [
  { label: 'Health', method: 'GET', path: '/' },
  { label: 'Swagger', method: 'GET', path: '/api' },
  // Auth
  { label: 'Auth: Register', method: 'POST', path: '/auth/register', sampleBody: '{"email":"test@example.com","password":"password","name":"Test User"}' },
  { label: 'Auth: Login', method: 'POST', path: '/auth/login', sampleBody: '{"email":"test@example.com","password":"password"}' },
  { label: 'Auth: Logout (if implemented)', method: 'POST', path: '/auth/logout' },

  // Users
  { label: 'Users: List', method: 'GET', path: '/users' },
  { label: 'Users: Get by ID', method: 'GET', path: '/users/{id}' },
  { label: 'Users: Create', method: 'POST', path: '/users', sampleBody: '{"name":"Alice","email":"alice@example.com","password":"password"}' },

  // Vehicles
  { label: 'Vehicles: List', method: 'GET', path: '/vehicles' },
  { label: 'Vehicles: Get by ID', method: 'GET', path: '/vehicles/{id}' },
  { label: 'Vehicles: Online', method: 'GET', path: '/vehicles/online' },
  { label: 'Vehicles: Nearby', method: 'GET', path: '/vehicles/nearby?lat=12.9&lng=80.2&radius=5' },
  { label: 'Vehicles: Update Location', method: 'PATCH', path: '/vehicles/{id}/location', sampleBody: '{"lat":12.9,"lng":80.2}' },

  // Stops
  { label: 'Stops: List', method: 'GET', path: '/stops' },
  { label: 'Stops: Request', method: 'POST', path: '/stops/request', sampleBody: '{"user_id":"{userId}","lat":12.9,"lng":80.2}' },
  { label: 'Stops: By Vehicle', method: 'GET', path: '/stops/vehicle/{vehicleId}' },

  // Orders
  { label: 'Orders: List', method: 'GET', path: '/orders' },
  { label: 'Orders: Get by ID', method: 'GET', path: '/orders/{id}' },
  { label: 'Orders: Create', method: 'POST', path: '/orders', sampleBody: '{"user_id":"{userId}","items":[],"total_amount":100}' },
  { label: 'Orders: By Vehicle', method: 'GET', path: '/orders/vehicle/{vehicleId}' },
  { label: 'Orders: By User', method: 'GET', path: '/orders/user/{userId}' },

  // Payments
  { label: 'Payments: List', method: 'GET', path: '/payments' },
  { label: 'Payments: Create', method: 'POST', path: '/payments', sampleBody: '{"order_id":"{orderId}","amount":100}' },

  // Routes
  { label: 'Routes: List', method: 'GET', path: '/routes' },
  { label: 'Routes: Get by ID', method: 'GET', path: '/routes/{id}' },

  // Tracking
  { label: 'Tracking: latest (example)', method: 'GET', path: '/tracking' },

  // Notifications
  { label: 'Notifications: List', method: 'GET', path: '/notifications' },

  // Inventory
  { label: 'Inventory: List', method: 'GET', path: '/inventory' },
  { label: 'Inventory: By Vehicle', method: 'GET', path: '/inventory/vehicle/{vehicleId}' },
];

export default function ApiExplorerPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE);
  const [method, setMethod] = useState<Method>('GET');
  const [path, setPath] = useState('/');
  const [headersText, setHeadersText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(preset: any) {
    setMethod(preset.method as Method);
    setPath(preset.path || '/');
    setBodyText(preset.sampleBody || '');
  }

  async function send() {
    setLoading(true);
    setResponse(null);
    setError(null);

    // parse headers text: each line Key: Value
    const headers: Record<string, string> = {};
    headersText.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key) headers[key] = val;
      }
    });

    try {
      const axiosInstance = axios.create({
        baseURL: baseUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      const url = path.startsWith('/') ? path : `/${path}`;

      let parsedBody: any = undefined;
      if (bodyText && bodyText.trim() !== '') {
        try {
          parsedBody = JSON.parse(bodyText);
        } catch (e) {
          // if not JSON, send as raw string
          parsedBody = bodyText;
        }
      }

      const res = await axiosInstance.request({
        url,
        method,
        data: parsedBody,
      });

      setResponse({ status: res.status, headers: res.headers, data: res.data });
    } catch (err: any) {
      if (err.response) {
        setResponse({ status: err.response.status, headers: err.response.headers, data: err.response.data });
      } else {
        setError(err.message || String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">API Explorer</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Base URL</label>
            <input className="mt-1 block w-full rounded-md border px-3 py-2" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />

            <div className="flex items-center gap-2 mt-3">
              <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="rounded-md border px-2 py-2">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
              </select>
              <input className="flex-1 rounded-md border px-3 py-2" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/users or /orders/123" />
              <button onClick={send} disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded-md">
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Headers (Key: Value per line)</label>
              <textarea rows={3} className="mt-1 block w-full rounded-md border px-3 py-2" value={headersText} onChange={(e) => setHeadersText(e.target.value)} />
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Body (JSON or raw)</label>
              <textarea rows={8} className="mt-1 block w-full rounded-md border px-3 py-2 font-mono text-sm" value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Presets</label>
            <div className="mt-2 space-y-2">
              {presets.map((p) => (
                <button key={p.label} onClick={() => applyPreset(p)} className="w-full text-left rounded-md border px-3 py-2 hover:bg-gray-100">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm font-medium">{p.label}</div>
                      <div className="text-xs text-gray-500">{p.method} {p.path}</div>
                    </div>
                    <div className="text-xs text-gray-400">Use</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Response</h2>
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}
          {response ? (
            <div className="rounded-md border bg-white p-4">
              <div className="mb-2 font-mono text-sm">Status: {response.status}</div>
              <div className="mb-2">
                <div className="font-semibold">Headers</div>
                <pre className="text-xs mt-1 bg-gray-50 p-2 rounded">{JSON.stringify(response.headers, null, 2)}</pre>
              </div>
              <div>
                <div className="font-semibold">Body</div>
                <pre className="mt-1 bg-gray-50 p-2 rounded text-sm">{typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white border rounded text-sm text-gray-500">No response yet — send a request.</div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          Note: This explorer sends requests from the browser. For cookie-based auth the backend must allow credentials and the frontend should run from a permitted origin.
        </div>
      </div>
    </div>
  );
}
