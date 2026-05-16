const SOSO_BASE = 'https://openapi.sosovalue.com/openapi/v1';

export function unwrapData(res) {
  if (res == null) return null;
  if (res.code === 0 && res.data !== undefined) return res.data;
  if (Array.isArray(res)) return res;
  return res.data ?? res;
}

export async function sosoFetch(apiKey, path, params = {}) {
  const url = new URL(SOSO_BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), {
    headers: { 'x-soso-api-key': apiKey },
  });
  if (!res.ok) throw new Error(`SoSoValue ${res.status}: ${(await res.text()).slice(0, 120)}`);
  return res.json();
}

export function apiProof(endpoint) {
  return `Live · ${endpoint} · ${new Date().toISOString().slice(11, 19)} UTC`;
}
