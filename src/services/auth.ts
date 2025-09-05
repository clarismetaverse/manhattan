const XANO_BASE_URL = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';

export interface XanoUser {
  id: number;
  email: string;
  name?: string;
  // add other fields returned by Xano if needed
}

export const fetchCurrentUser = async (token: string): Promise<XanoUser | null> => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name
    };
  } catch (error) {
    console.error('Error fetching current user', error);
    return null;
  }
};
