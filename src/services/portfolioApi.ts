interface PortfolioProject {
  id: number;
  created_at: number;
  production_id: number;
  user_turbo_id: number;
  Team: any[];
  Shooting_Location: number;
  Deliverables: string;
  Cover: {
    access: string;
    path: string;
    name: string;
    type: string;
    size: number;
    mime: string;
    meta: {
      width: number;
      height: number;
    };
    url: string;
  };
  Hero: {
    access: string;
    path: string;
    name: string;
    type: string;
    size: number;
    mime: string;
    meta: {
      width: number;
      height: number;
    };
    url: string;
  };
  KPIs: {
    KPI: string;
    KPIValue: number;
  };
  Work_Body: Array<{
    access: string;
    path: string;
    name: string;
    type: string;
    size: number;
    mime: string;
    meta: {
      width: number;
      height: number;
    };
    url: string;
  }>;
}

export const fetchPortfolioProjects = async (): Promise<PortfolioProject[]> => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/portfolio', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio projects');
  }

  return response.json();
};

export type { PortfolioProject };