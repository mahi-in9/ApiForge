import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addRelationship, deleteRelationship } from '../store/slices/schemaSlice';
import { useToast } from '../context/ToastContext';
import { GitGraph, Plus, Trash2, ChevronDown, ChevronRight, Info } from 'lucide-react';
import './RelationshipPanel.css';

const RELATIONSHIP_TYPES = [
  { value: 'one-to-one',   label: '1:1 — One to One',   desc: 'e.g. User → Profile' },
  { value: 'one-to-many',  label: '1:N — One to Many',   desc: 'e.g. User → Orders' },
  { value: 'many-to-one',  label: 'N:1 — Many to One',   desc: 'e.g. Orders → User' },
  { value: 'many-to-many', label: 'M:N — Many to Many',  desc: 'e.g. Products ↔ Tags' },
];

const DELETE_STRATEGIES = [
  { value: 'restrict',  label: 'Restrict',  desc: 'Block deletion if related records exist' },
  { value: 'cascade',   label: 'Cascade',   desc: 'Delete all related records automatically' },
  { value: 'set-null',  label: 'Set Null',  desc: 'Set the foreign key to null on related records' },
];

const EMPTY_FORM = { name: '', type: 'one-to-many', fromField: '', toCollection: '', toField: '', onDelete: 'restrict', label: '' };

const RelationshipTypeTag = ({ type }) => {
  const map = {
    'one-to-one':   { label: '1:1', color: '#60a5fa' },
    'one-to-many':  { label: '1:N', color: '#3fb950' },
    'many-to-one':  { label: 'N:1', color: '#d29922' },
    'many-to-many': { label: 'M:N', color: '#bc8cff' },
  };
  const cfg = map[type] || { label: '?', color: 'var(--text-muted)' };
  return (
    <span
      className="rel-type-tag"
      style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}44`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

const DeleteStrategyBadge = ({ strategy }) => {
  const map = {
    restrict:  { color: 'var(--accent-red)',   label: 'RESTRICT' },
    cascade:   { color: 'var(--accent-amber)',  label: 'CASCADE' },
    'set-null':{ color: 'var(--text-muted)',    label: 'SET NULL' },
  };
  const cfg = map[strategy] || { color: 'var(--text-muted)', label: strategy };
  return <span className="rel-strategy-badge" style={{ color: cfg.color }}>{cfg.label}</span>;
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
        relationship: { ...form, populatePath: form.name.trim().toLowerCase().replace(/\s+/g, '_') },
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
    <div className="rel-panel">
      <button type="button" onClick={() => setIsOpen(v => !v)} className="rel-panel__toggle">
        <div className="rel-panel__toggle-left">
          <GitGraph size={16} color="var(--accent-blue)" />
          <span className="rel-panel__label">Relationships</span>
          {relationships.length > 0 && (
            <span className="rel-panel__count">{relationships.length}</span>
          )}
        </div>
        {isOpen
          ? <ChevronDown size={15} color="var(--text-muted)" />
          : <ChevronRight size={15} color="var(--text-muted)" />
        }
      </button>

      {isOpen && (
        <div className="rel-panel__body">
          <div className="rel-panel__info">
            <Info size={13} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              Relationships link collections and power the{' '}
              <code>?populate=</code>{' '}query parameter in generated APIs.
              Deletion strategies control what happens to related records when a parent is deleted.
            </span>
          </div>

          {relationships.length > 0 && (
            <div className="rel-list">
              {relationships.map(rel => (
                <div key={rel._id} className="rel-item">
                  <div className="rel-item__info">
                    <RelationshipTypeTag type={rel.type} />
                    <span className="rel-item__name">{rel.name}</span>
                    <span className="rel-item__path">{rel.fromField} → {rel.toCollection}</span>
                    <DeleteStrategyBadge strategy={rel.onDelete} />
                  </div>
                  <button
                    type="button"
                    className="rel-item__delete"
                    onClick={() => handleDelete(rel._id, rel.name)}
                    title="Remove relationship"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showForm ? (
            <form onSubmit={handleSubmit} className="rel-form">
              <div className="rel-form__grid">
                <div className="rel-form__field">
                  <label>Relationship Name *</label>
                  <input
                    className="input-glass"
                    placeholder="e.g. user_orders"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                    required
                  />
                </div>
                <div className="rel-form__field">
                  <label>Relationship Type *</label>
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
                  <p className="rel-form__hint">{RELATIONSHIP_TYPES.find(t => t.value === form.type)?.desc}</p>
                </div>
                <div className="rel-form__field">
                  <label>Source Field (in this collection) *</label>
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
                <div className="rel-form__field">
                  <label>Target Collection *</label>
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
                    <p className="rel-form__hint rel-form__hint--error">No other collections in this project yet.</p>
                  )}
                </div>
                <div className="rel-form__field">
                  <label>On Delete Strategy</label>
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
                  <p className="rel-form__hint">{DELETE_STRATEGIES.find(s => s.value === form.onDelete)?.desc}</p>
                </div>
                <div className="rel-form__field">
                  <label>Display Label (optional)</label>
                  <input
                    className="input-glass"
                    placeholder="e.g. Has many orders"
                    value={form.label}
                    onChange={e => handleChange('label', e.target.value)}
                  />
                </div>
              </div>
              <div className="rel-form__actions">
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
            <button type="button" onClick={() => setShowForm(true)} className="btn-glass rel-add-btn">
              <Plus size={15} /> Add Relationship
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RelationshipPanel;
