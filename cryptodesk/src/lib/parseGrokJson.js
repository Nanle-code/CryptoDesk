export function parseGrokJson(raw, fallback = {}) {
  if (!raw) return fallback;
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, '').trim());
  } catch {
    return fallback;
  }
}
