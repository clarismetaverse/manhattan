import React, { useState, useEffect } from 'react';
import { Pin, Briefcase } from 'lucide-react';
import { fetchPortfolioProjects, type PortfolioProject } from '@/services/portfolioApi';

export default function PROView() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const portfolioProjects = await fetchPortfolioProjects();
        setProjects(portfolioProjects);
      } catch (error) {
        console.error('Failed to load portfolio projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const pinnedProjects = projects.slice(0, 2);
  const editorialProjects = projects.slice(2);

  if (loading) {
    return (
      <>
        <div className="mt-6">
          <div className="text-xs mb-2 flex items-center gap-1 text-muted-foreground">
            <Pin className="w-3 h-3" /> Pinned Collabs
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-36 rounded-xl bg-muted animate-pulse" />
            <div className="h-36 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
        <div className="mt-6">
          <div className="text-xs mb-2 flex items-center gap-1 text-muted-foreground">
            <Briefcase className="w-3 h-3" /> Editorial / Marketing Projects
          </div>
          <div className="grid gap-4">
            <div className="h-40 rounded-2xl bg-muted animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mt-6">
        <div className="text-xs mb-2 flex items-center gap-1 text-muted-foreground">
          <Pin className="w-3 h-3" /> Pinned Collabs
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pinnedProjects.length > 0 ? (
            pinnedProjects.map((project) => (
              <div 
                key={project.id}
                className="h-36 rounded-xl bg-background shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <img 
                  src={project.Cover.url} 
                  alt="Portfolio project"
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <>
              <div className="h-36 rounded-xl bg-muted/50" />
              <div className="h-36 rounded-xl bg-muted/50" />
            </>
          )}
        </div>
      </div>
      <div className="mt-6">
        <div className="text-xs mb-2 flex items-center gap-1 text-muted-foreground">
          <Briefcase className="w-3 h-3" /> Editorial / Marketing Projects
        </div>
        <div className="grid gap-4">
          {editorialProjects.length > 0 ? (
            editorialProjects.map((project) => (
              <div 
                key={project.id}
                className="h-40 rounded-2xl bg-background shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative"
              >
                <img 
                  src={project.Hero.url} 
                  alt="Editorial project"
                  className="w-full h-full object-cover"
                />
                {project.Deliverables && (
                  <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground">
                    {project.Deliverables}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-40 rounded-2xl bg-muted/50" />
          )}
        </div>
      </div>
    </>
  );
}

