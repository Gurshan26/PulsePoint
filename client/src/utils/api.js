export async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      message = await res.text();
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) return res.text();
  return res.json();
}

export function downloadUrl(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
