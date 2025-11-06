export function unwrap(data) {
  if (data && typeof data === 'object' && 'status' in data && 'data' in data) {
    return data.data;
  }
  return data;
}

export async function fetchJson(input, init) {
  const res = await fetch(input, init);
  const raw = await res.json();
  if (!res.ok) {
    const msg = raw?.message || raw?.error?.code || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return unwrap(raw);
}
