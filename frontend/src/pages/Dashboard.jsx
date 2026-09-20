import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../store/slices/projectSlice';
import GlassCard from '../components/GlassCard';
import { Trash2, Plus, Terminal, Database, Eye, EyeOff, Copy, Check } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items: projects, isLoading, error, searchQuery } = useSelector((state) => state.projects);
  const [newProjectName, setNewProjectName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copiedKeys, setCopiedKeys] = useState({});

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

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

  const toggleReveal = (id) => setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleCopy = async (id, apiKey) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeys((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setCopiedKeys((prev) => ({ ...prev, [id]: false })), 2000);
    } catch {
      alert('Could not copy automatically. Please reveal and copy manually.');
    }
  };

  const renderForm = (isInline) => (
    <form
      onSubmit={handleCreateProject}
      className={`project-form${isInline ? '' : ' project-form--centered'}`}
    >
      <input
        type="text"
        placeholder="New Project Name..."
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        className="project-form__input"
        style={{ width: isInline ? 'auto' : '300px', flex: isInline ? 1 : 'none' }}
      />
      <button
        type="submit"
        disabled={isLoading || !newProjectName.trim()}
        className="project-form__btn"
      >
        <Plus size={16} /> {isLoading ? 'Forging...' : 'Initialize'}
      </button>
    </form>
  );

  const filteredProjects = projects.filter((project) => {
    const name = project.projectName || project.name || '';
    const query = searchQuery || '';
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">
            <Terminal size={24} color="var(--accent-blue)" />
            Command Center
          </h1>
          <p className="dashboard__subtitle">Manage your API environments.</p>
        </div>
      </div>

      {isLoading && projects.length === 0 && (
        <p className="dashboard__loading">Loading architecture...</p>
      )}
      {error && <div className="dashboard__error">Error: {error}</div>}

      {projects.length > 0 && (
        <GlassCard style={{ marginBottom: '32px', padding: '18px' }}>
          {renderForm(true)}
        </GlassCard>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="dashboard__empty">
          <Database size={44} color="var(--text-subtle)" />
          <h3 className="dashboard__empty-title">No Environments Found</h3>
          <p className="dashboard__empty-desc">Initialize your first project below to begin forging APIs.</p>
          {renderForm(false)}
        </div>
      )}

      <div className="projects-grid">
        {filteredProjects.map((project) => {
          const id = project._id || project.id;
          const name = project.projectName || project.name;
          const apiKey = project.apiKey || '';
          const isRevealed = revealedKeys[id];
          const isCopied = copiedKeys[id];

          return (
            <GlassCard key={id} style={{ position: 'relative' }}>
              <div className="project-card__header">
                <h3 className="project-card__name">{name}</h3>
                <button
                  onClick={() => handleDeleteProject(id)}
                  disabled={isLoading}
                  className="project-card__delete"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <p className="project-card__api-label">API Key</p>
                <div className="project-card__api-row">
                  {/* letter-spacing is dynamic: changes based on isRevealed state at runtime */}
                  <span
                    className="project-card__api-value"
                    style={{ letterSpacing: isRevealed ? '0.02em' : '0.18em' }}
                  >
                    {isRevealed ? apiKey : '••••••••••••••••••••••••••••••••'}
                  </span>
                  <button
                    onClick={() => toggleReveal(id)}
                    title={isRevealed ? 'Hide' : 'Reveal'}
                    className="project-card__icon-btn"
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleCopy(id, apiKey)}
                    title={isCopied ? 'Copied!' : 'Copy'}
                    className={`project-card__icon-btn${isCopied ? ' project-card__icon-btn--copied' : ''}`}
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                {isCopied && <p className="project-card__copied-msg">✓ Copied to clipboard</p>}
              </div>

              <div className="project-card__footer">
                <span className={`project-card__badge ${project.isActive ? 'project-card__badge--active' : 'project-card__badge--inactive'}`}>
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
