import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addRelationship, deleteRelationship } from '../store/slices/schemaSlice';
import { useToast } from '../context/ToastContext';
import { GitGraph, Plus, Trash2, ChevronDown, ChevronRight, Info } from 'lucide-react';

const RELATIONSHIP_TYPES = [
  { value: 'one-to-one',  label: '1:1 — One to One',   desc: 'e.g. User → Profile' },
  { value: 'one-to-many', label: '1:N — One to Many',   desc: 'e.g. User → Orders' },
  { value: 'many-to-one', label: 'N:1 — Many to One',   desc: 'e.g. Orders → User' },
  { value: 'many-to-many',label: 'M:N — Many to Many',  desc: 'e.g. Products ↔ Tags' },
];

const DELETE_STRATEGIES = [
  { value: 'restrict',  label: 'Restrict',  desc: 'Block deletion if related records exist' },
  { value: 'cascade',   label: 'Cascade',   desc: 'Delete all related records automatically' },
  { value: 'set-null',  label: 'Set Null',  desc: 'Set the foreign key to null on related records' },
];

const EMPTY_FORM = {
  name: '',
  type: 'one-to-many',
  fromField: '',
  toCollection: '',
  toField: '',
  onDelete: 'restrict',
  label: '',
};

const RelationshipTypeTag = ({ type }) => {
  const map = {
    'one-to-one':  { label: '1:1', color: '#60a5fa' },
    'one-to-many': { label: '1:N', color: '#4ade80' },
    'many-to-one': { label: 'N:1', color: '#f59e0b' },
    'many-to-many':{ label: 'M:N', color: '#c084fc' },
  };
  const cfg = map[type] || { label: '?', color: 'var(--text-muted)' };
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      background: `${cfg.color}18`,
      border: `1px solid ${cfg.color}44`,
      color: cfg.color,
      fontSize: '0.75rem',
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
    }}>
      {cfg.label}
    </span>
  );
};

const DeleteStrategyBadge = ({ strategy }) => {
  const map = {
    restrict: { color: '#f87171', label: 'RESTRICT' },
    cascade:  { color: '#f59e0b', label: 'CASCADE' },
    'set-null':{ color: '#8b949e', label: 'SET NULL' },
  };
  const cfg = map[strategy] || { color: 'var(--text-muted)', label: strategy };
  return (
    <span style={{
      fontSize: '0.7rem',
      fontWeight: 700,
      color: cfg.color,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.05em',
    }}>
      {cfg.label}
    </span>
  );
};

const RelationshipPanel = ({ schema, allSchemas }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationships = schema?.relationships || [];
  const fields = schema?.fields || [];

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Relationship name is required');
    if (!form.fromField) return toast.error('Please select a source field');
    if (!form.toCollection) return toast.error('Please select a target collection');

    setIsSubmitting(true);
    try {
      await dispatch(addRelationship({
        apiSchemaId: schema._id,
        relationship: {
          ...form,
          populatePath: form.name.trim().toLowerCase().replace(/\s+/g, '_'),
        },
      })).unwrap();
      toast.success(`Relationship '${form.name}' added successfully`);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      toast.error(err || 'Failed to add relationship');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (relId, relName) => {
    if (!window.confirm(`Remove relationship '${relName}'?`)) return;
    try {
      await dispatch(deleteRelationship({ apiSchemaId: schema._id, relId })).unwrap();
      toast.success(`Relationship '${relName}' removed`);
    } catch (err) {
      toast.error(err || 'Failed to remove relationship');
    }
  };

  const otherSchemas = allSchemas.filter(s => s._id !== schema._id);

  return (
    <div style={{ marginTop: '24px', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          background: 'rgba(0,240,255,0.04)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-main)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GitGraph size={18} color="var(--accent-neon)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Relationships</span>
          {relationships.length > 0 && (
            <span style={{
              background: 'var(--accent-neon-dim)',
              color: 'var(--accent-neon)',
              borderRadius: 'var(--radius-full)',
              padding: '1px 8px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {relationships.length}
            </span>
          )}
        </div>
        {isOpen ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
      </button>

      {isOpen && (
        <div style={{ padding: '16px 20px' }}>
          {/* Info banner */}
          <div style={{
            display: 'flex', gap: '8px', alignItems: 'flex-start',
            padding: '10px 14px',
            background: 'rgba(0,240,255,0.04)',
            border: '1px solid rgba(0,240,255,0.15)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}>
            <Info size={14} color="var(--accent-neon)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              Relationships link collections and power the{' '}
              <code style={{ color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)' }}>?populate=</code>
              {' '}query parameter in generated APIs.{' '}
              Deletion strategies control what happens to related records when a parent is deleted.
            </span>
          </div>

          {/* Existing relationships */}
          {relationships.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {relationships.map(rel => (
                <div
                  key={rel._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <RelationshipTypeTag type={rel.type} />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{rel.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {rel.fromField} → {rel.toCollection}
                    </span>
                    <DeleteStrategyBadge strategy={rel.onDelete} />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(rel._id, rel.name)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    title="Remove relationship"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add relationship form */}
          {showForm ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Relationship name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Relationship Name *
                  </label>
                  <input
                    className="input-glass"
                    placeholder="e.g. user_orders"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Relationship Type *
                  </label>
                  <select
                    className="input-glass"
                    value={form.type}
                    onChange={e => handleChange('type', e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {RELATIONSHIP_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {RELATIONSHIP_TYPES.find(t => t.value === form.type)?.desc}
                  </p>
                </div>

                {/* From field */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Source Field (in this collection) *
                  </label>
                  <select
                    className="input-glass"
                    value={form.fromField}
                    onChange={e => handleChange('fromField', e.target.value)}
                    required
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select a field...</option>
                    {fields.map(f => (
                      <option key={f.fieldName} value={f.fieldName}>{f.fieldName} ({f.fieldType})</option>
                    ))}
                  </select>
                </div>

                {/* Target collection */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Target Collection *
                  </label>
                  <select
                    className="input-glass"
                    value={form.toCollection}
                    onChange={e => handleChange('toCollection', e.target.value)}
                    required
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select collection...</option>
                    {otherSchemas.map(s => (
                      <option key={s._id} value={s.collectionName}>{s.collectionName}</option>
                    ))}
                  </select>
                  {otherSchemas.length === 0 && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--accent-red)' }}>
                      No other collections in this project yet.
                    </p>
                  )}
                </div>

                {/* On Delete */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    On Delete Strategy
                  </label>
                  <select
                    className="input-glass"
                    value={form.onDelete}
                    onChange={e => handleChange('onDelete', e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {DELETE_STRATEGIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {DELETE_STRATEGIES.find(s => s.value === form.onDelete)?.desc}
                  </p>
                </div>

                {/* Optional label */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Display Label (optional)
                  </label>
                  <input
                    className="input-glass"
                    placeholder="e.g. Has many orders"
                    value={form.label}
                    onChange={e => handleChange('label', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || otherSchemas.length === 0}
                  style={{ opacity: (isSubmitting || otherSchemas.length === 0) ? 0.6 : 1 }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Relationship'}
                </button>
                <button
                  type="button"
                  className="btn-glass"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-glass"
              style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
            >
              <Plus size={16} /> Add Relationship
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RelationshipPanel;
