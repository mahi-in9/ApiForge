import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../store/slices/projectSlice';
import GlassCard from '../components/GlassCard';
import { Trash2, Plus, Terminal, Database, Eye, EyeOff, Copy, Check } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items: projects, isLoading, error, searchQuery } = useSelector((state) => state.projects);
  const [newProjectName, setNewProjectName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState({});  // { [projectId]: boolean }
  const [copiedKeys, setCopiedKeys] = useState({});       // { [projectId]: boolean }

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    dispatch(createProject({ projectName: newProjectName }));
    setNewProjectName('');
  };

  const handleDeleteProject = (id) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      dispatch(deleteProject(id));
    }
  };

  const toggleReveal = (id) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (id, apiKey) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeys((prev) => ({ ...prev, [id]: true }));
      // Reset the "Copied!" checkmark after 2 seconds
      setTimeout(() => {
        setCopiedKeys((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch {
      alert('Could not copy automatically. Please reveal and copy manually.');
    }
  };

  const renderForm = (isInline) => (
    <form
      onSubmit={handleCreateProject}
      style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        justifyContent: isInline ? 'flex-start' : 'center',
        marginTop: isInline ? '0' : '20px',
      }}
    >
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
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !newProjectName.trim()}
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
          opacity: isLoading || !newProjectName.trim() ? 0.5 : 1,
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <Plus size={18} /> {isLoading ? 'Forging...' : 'Initialize'}
      </button>
    </form>
  );

  const filteredProjects = projects.filter((project) => {
    const name = project.projectName || project.name || '';
    const query = searchQuery || '';
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
            <Terminal size={28} color="var(--accent-neon)" />
            Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Manage your API environments.</p>
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && projects.length === 0 && (
        <p style={{ color: 'var(--accent-neon)' }}>Loading architecture...</p>
      )}
      {error && (
        <div style={{ color: '#ff4d4d', padding: '15px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {/* Inline create form — shown at top when projects already exist */}
      {projects.length > 0 && (
        <GlassCard style={{ marginBottom: '40px', padding: '20px' }}>
          {renderForm(true)}
        </GlassCard>
      )}

      {/* Empty state */}
      {!isLoading && !error && projects.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            border: '1px dashed var(--border-glass)',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.1)',
          }}
        >
          <Database size={48} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>No Environments Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
            Initialize your first project below to begin forging APIs.
          </p>
          {renderForm(false)}
        </div>
      )}

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredProjects.map((project) => {
          const id = project._id || project.id;
          const name = project.projectName || project.name;
          const apiKey = project.apiKey || '';
          const isRevealed = revealedKeys[id];
          const isCopied = copiedKeys[id];

          return (
            <GlassCard key={id} style={{ position: 'relative' }}>
              {/* Project name + delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--accent-neon)', paddingRight: '10px', wordBreak: 'break-word' }}>
                  {name}
                </h3>
                <button
                  onClick={() => handleDeleteProject(id)}
                  disabled={isLoading}
                  style={{
                    flexShrink: 0,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.color = '#ff4d4d'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title="Terminate Project"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* API Key section */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>API Key</p>

                {/* Key display row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'monospace',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: isRevealed ? '0.02em' : '0.2em',
                    }}
                  >
                    {isRevealed ? apiKey : '••••••••••••••••••••••••••••••••'}
                  </span>

                  {/* Reveal / Hide toggle */}
                  <button
                    onClick={() => toggleReveal(id)}
                    title={isRevealed ? 'Hide API Key' : 'Reveal API Key'}
                    style={{
                      flexShrink: 0,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-neon)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(id, apiKey)}
                    title={isCopied ? 'Copied!' : 'Copy API Key'}
                    style={{
                      flexShrink: 0,
                      background: 'transparent',
                      border: 'none',
                      color: isCopied ? '#4ade80' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => { if (!isCopied) e.currentTarget.style.color = 'var(--accent-neon)'; }}
                    onMouseLeave={(e) => { if (!isCopied) e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {isCopied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>

                {/* "Copied!" confirmation label */}
                {isCopied && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#4ade80' }}>
                    ✓ Copied to clipboard
                  </p>
                )}
              </div>

              {/* Status badge */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    background: project.isActive
                      ? 'rgba(0, 240, 255, 0.1)'
                      : 'rgba(255, 77, 77, 0.1)',
                    color: project.isActive ? 'var(--accent-neon)' : '#ff4d4d',
                    border: `1px solid ${project.isActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,77,77,0.2)'}`,
                    borderRadius: '20px',
                    fontWeight: 600,
                  }}
                >
                  {project.isActive ? '● Active' : '● Inactive'}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
