import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../store/slices/projectSlice';
import GlassCard from '../components/GlassCard';
import { Trash2, Plus, Terminal, Database } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items: projects, isLoading, error, searchQuery } = useSelector((state) => state.projects);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      alert("Please enter a project name first!");
      return;
    }
    dispatch(createProject({ projectName: newProjectName }));
    setNewProjectName('');
  };

  const handleDeleteProject = (id) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      dispatch(deleteProject(id));
    }
  };

  const renderForm = (isInline) => (
    <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: isInline ? 'flex-start' : 'center', marginTop: isInline ? '0' : '20px' }}>
      <input 
        type="text" 
        placeholder="New Project Name..." 
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        style={{
          flex: isInline ? 1 : 'none',
          width: isInline ? 'auto' : '300px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid var(--border-glass)',
          padding: '12px 16px',
          borderRadius: '8px',
          color: 'var(--text-main)',
          outline: 'none'
        }}
      />
      <button 
        type="submit" 
        disabled={isLoading}
        style={{
          background: 'transparent',
          color: 'var(--accent-neon)',
          border: '1px solid var(--accent-neon)',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          opacity: isLoading ? 0.5 : 1
        }}
      >
        <Plus size={18} /> {isLoading ? 'Forging...' : 'Initialize'}
      </button>
    </form>
  );

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <Terminal size={28} color="var(--accent-neon)" /> 
            Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Manage your API environments.</p>
        </div>
      </div>

      {isLoading && projects.length === 0 && <p style={{ color: 'var(--accent-neon)' }}>Loading architecture...</p>}
      {error && <div style={{ color: '#ff4d4d', padding: '15px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px', marginBottom: '20px' }}>Error: {error}</div>}

      {/* Show inline form at top ONLY if they already have projects */}
      {projects.length > 0 && (
        <GlassCard style={{ marginBottom: '40px', padding: '20px' }}>
          {renderForm(true)}
        </GlassCard>
      )}

      {/* Empty State */}
      {!isLoading && !error && projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-glass)', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}>
          <Database size={48} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>No Environments Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 20px 0' }}>Initialize your first project below to begin forging APIs.</p>
          
          {renderForm(false)}
        </div>
      )}

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {projects
          .filter(project => {
            const name = project.name || project.projectName || '';
            const query = searchQuery || '';
            return name.toLowerCase().includes(query.toLowerCase());
          })
          .map((project) => (
          <GlassCard key={project._id || project.id} style={{ position: 'relative' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--accent-neon)', paddingRight: '30px' }}>{project.name || project.projectName}</h3>
            
            <button 
              onClick={() => handleDeleteProject(project._id || project.id)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              title="Terminate Project"
            >
              <Trash2 size={18} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 5px 0' }}>API Key</p>
              <div style={{ 
                fontFamily: 'monospace', 
                background: 'rgba(0,0,0,0.3)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                ••••••••••••••••••••••••••••
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '4px 10px', 
                background: 'rgba(0, 240, 255, 0.1)', 
                color: 'var(--accent-neon)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '20px',
                fontWeight: 600
              }}>
                Active Status
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
