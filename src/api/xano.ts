const XANO_BASE_URL = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';

export async function getCurrentUser() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No auth token. Please log in.');
  }

  const res = await fetch(`${XANO_BASE_URL}/user_turbo`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Xano error: ${res.status}`);
  }

  return res.json();
}
