/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchSchemas, createSchema, updateSchema, deleteSchema } from '../store/slices/schemaSlice';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import RelationshipPanel from '../components/RelationshipPanel';
import EmptyState from '../components/EmptyState';
import { SkeletonList, SkeletonCard } from '../components/SkeletonCard';
import { Database, Plus, Trash2, Pencil, Copy, ChevronDown, Key } from 'lucide-react';

const fieldTypes = ['String', 'Number', 'Boolean', 'Date', 'Array', 'Object', 'ObjectId', 'GeoPoint', 'Address'];

const initialField = {
  fieldName: '',
  fieldType: 'String',
  required: false,
  unique: false,
  index: false,
  defaultValue: '',
  enumValues: '',
  minLength: '',
  maxLength: '',
  min: '',
  max: '',
  targetCollection: ''
};

export default function SchemaBuilder() {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { items: projects, loading: projectsLoading } = useSelector(state => state.projects);
  const { items: schemas, loading: schemasLoading, error: schemasError } = useSelector(state => state.schemas);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [editingSchema, setEditingSchema] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const [fields, setFields] = useState([{ ...initialField }]);

  const serverUri = import.meta.env.VITE_SERVER_URI || 'http://localhost:5000';

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchSchemas(selectedProjectId));
      resetForm();
    }
  }, [selectedProjectId, dispatch]);

  function resetForm() {
    setEditingSchema(null);
    setCollectionName('');
    setFields([{ ...initialField }]);
  };

  const handleAddField = () => {
    setFields([...fields, { ...initialField }]);
  };

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleEditClick = (schema) => {
    setEditingSchema(schema);
    setCollectionName(schema.collectionName);
    setFields(schema.fields && schema.fields.length > 0 ? schema.fields : [{ ...initialField }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      showToast('Collection name is required', 'error');
      return;
    }

    const payload = {
      collectionName: collectionName.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      fields: fields.filter(f => f.fieldName.trim()),
      projectId: selectedProjectId
    };

    try {
      if (editingSchema) {
        await dispatch(updateSchema({ apiSchemaId: editingSchema._id, ...payload })).unwrap();
        showToast('Collection updated!', 'success');
      } else {
        await dispatch(createSchema(payload)).unwrap();
        showToast('Collection created successfully!', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err || 'Failed to save collection', 'error');
    }
  };

  const handleDelete = async (schemaId) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await dispatch(deleteSchema(schemaId)).unwrap();
        showToast('Collection deleted', 'success');
        if (editingSchema && editingSchema._id === schemaId) {
          resetForm();
        }
      } catch (err) {
        showToast(err || 'Failed to delete collection', 'error');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Endpoint copied to clipboard!', 'success');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project Selector */}
      <div className="p-6 pb-2">
        {projectsLoading ? (
          <SkeletonCard />
        ) : (
          <GlassCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Database className="w-6 h-6 text-(--accent-neon)" />
              <h2 className="text-xl font-bold text-(--text-main)">Schema Builder</h2>
            </div>
            <div className="w-64">
              <select
                className="input-glass w-full"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                placeholder="select a project"
              >
                <option value="" className='text-white'>Select a Project...</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id} className="" >{p.projectName}</option>
                ))}

              </select>
            </div>
          </GlassCard>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden p-6 pt-4 gap-6">
        {!selectedProjectId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<Database />}
              title="No Project Selected"
              description="Please select a project from the dropdown above to start building schemas."
            />
          </div>
        ) : (
          <>
            {/* LEFT COLUMN */}
            <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar animate-fade-up">
              <GlassCard className="p-6 relative">
                {editingSchema && (
                  <div className="absolute top-6 right-6 flex items-center gap-4">
                    <span className="text-sm text-(--accent-purple) font-semibold">Editing: {editingSchema.collectionName}</span>
                    <button type="button" onClick={resetForm} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                      Cancel Edit
                    </button>
                  </div>
                )}

                <h3 className="text-xl font-bold text-(--text-main) mb-6">
                  {editingSchema ? 'Update Collection' : 'Define New Collection'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-medium text-(--text-muted) mb-2">Collection Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. users, blog_posts"
                      className="input-glass w-full text-lg"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-(--text-muted)">Fields</label>
                    {fields.map((field, index) => (
                      <div key={index} className="bg-(--bg-dark)/50 border border-(--border-glass) rounded-xl p-4 space-y-4 relative group">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="Field Name"
                              required
                              className="input-glass w-full"
                              value={field.fieldName}
                              onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                            />
                          </div>
                          <div className="col-span-3">
                            <div className="relative">
                              <select
                                className="input-glass w-full appearance-none pr-8"
                                value={field.fieldType}
                                onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}
                              >
                                {fieldTypes.map(ft => (
                                  <option key={ft} value={ft}>{ft}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-(--text-muted) absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                          <div className="col-span-4 flex items-center gap-4 text-sm text-(--text-muted)">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-(--accent-neon) transition-colors">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                className="accent-(--accent-neon)"
                              />
                              Required
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-(--accent-neon) transition-colors">
                              <input
                                type="checkbox"
                                checked={field.unique}
                                onChange={(e) => handleFieldChange(index, 'unique', e.target.checked)}
                                className="accent-(--accent-neon)"
                              />
                              Unique
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-(--accent-neon) transition-colors">
                              <input
                                type="checkbox"
                                checked={field.index}
                                onChange={(e) => handleFieldChange(index, 'index', e.target.checked)}
                                className="accent-(--accent-neon)"
                              />
                              Indexed
                            </label>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveField(index)}
                              className="p-2 text-(--text-muted) hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded properties section */}
                        <div className="pl-4 border-l-2 border-(--accent-neon)/30 space-y-3 pt-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <input
                                type="text"
                                placeholder="Default Value (optional)"
                                className="input-glass w-full text-sm"
                                value={field.defaultValue}
                                onChange={(e) => handleFieldChange(index, 'defaultValue', e.target.value)}
                              />
                            </div>
                            {field.fieldType === 'String' && (
                              <div>
                                <input
                                  type="text"
                                  placeholder="Enum values (comma separated)"
                                  className="input-glass w-full text-sm"
                                  value={field.enumValues}
                                  onChange={(e) => handleFieldChange(index, 'enumValues', e.target.value)}
                                />
                              </div>
                            )}
                            {field.fieldType === 'String' && (
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder="Min Length"
                                  className="input-glass w-full text-sm"
                                  value={field.minLength}
                                  onChange={(e) => handleFieldChange(index, 'minLength', e.target.value)}
                                />
                                <input
                                  type="number"
                                  placeholder="Max Length"
                                  className="input-glass w-full text-sm"
                                  value={field.maxLength}
                                  onChange={(e) => handleFieldChange(index, 'maxLength', e.target.value)}
                                />
                              </div>
                            )}
                            {field.fieldType === 'Number' && (
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  className="input-glass w-full text-sm"
                                  value={field.min}
                                  onChange={(e) => handleFieldChange(index, 'min', e.target.value)}
                                />
                                <input
                                  type="number"
                                  placeholder="Max"
                                  className="input-glass w-full text-sm"
                                  value={field.max}
                                  onChange={(e) => handleFieldChange(index, 'max', e.target.value)}
                                />
                              </div>
                            )}
                            {field.fieldType === 'ObjectId' && (
                              <div>
                                <input
                                  type="text"
                                  placeholder="Target Collection Name"
                                  className="input-glass w-full text-sm"
                                  value={field.targetCollection}
                                  onChange={(e) => handleFieldChange(index, 'targetCollection', e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddField}
                      className="btn-glass w-full flex items-center justify-center gap-2 py-3 mt-4"
                    >
                      <Plus className="w-5 h-5" />
                      Add Field
                    </button>
                  </div>

                  <button type="submit" className="btn-primary w-full py-4 text-lg mt-4">
                    {editingSchema ? 'Update Schema' : 'Initialize Schema'}
                  </button>
                </form>
              </GlassCard>

              {/* Relationship Panel shown only when a schema is selected or created */}
              {(editingSchema || schemas.length > 0) && (
                <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  <RelationshipPanel
                    schema={editingSchema || (schemas.length > 0 ? schemas[0] : null)}
                    allSchemas={schemas}
                  />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-(--text-main)">Active Collections</h3>
                <span className="px-3 py-1 bg-(--bg-card) border border-(--border-glass) rounded-full text-sm text-(--accent-neon)">
                  {schemas.length} Collections
                </span>
              </div>

              {schemasLoading ? (
                <SkeletonList count={3} />
              ) : schemas.length === 0 ? (
                <EmptyState
                  icon={<Database className="w-12 h-12" />}
                  title="No collections yet"
                  description="Define your first collection to generate REST APIs instantly."
                />
              ) : (
                schemas.map((schema, index) => {
                  const endpoint = `${serverUri}/api/data/${selectedProjectId}/${schema.collectionName}`;
                  return (
                    <GlassCard key={schema._id} className="p-5 animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-(--text-main) capitalize flex items-center gap-2">
                            <Database className="w-5 h-5 text-(--accent-purple)" />
                            {schema.collectionName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(schema)}
                            className="p-2 text-(--text-muted) hover:text-(--accent-neon) hover:bg-(--accent-neon)/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schema._id)}
                            className="p-2 text-(--text-muted) hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-(--bg-dark)/60 border border-(--border-glass) rounded-lg p-3 mb-4 flex items-center justify-between group">
                        <div className="truncate text-sm font-mono text-(--text-muted) mr-4">
                          <span className="text-(--accent-neon)">Endpoint:</span> {endpoint}
                        </div>
                        <button
                          onClick={() => copyToClipboard(endpoint)}
                          className="p-1.5 text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-card) rounded-md transition-colors shrink-0"
                          title="Copy Endpoint"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-2">Fields</p>
                          <div className="flex flex-wrap gap-2">
                            {schema.fields?.map((f, i) => (
                              <span key={i} className="px-2.5 py-1 text-xs rounded-md bg-(--bg-card) border border-(--border-glass) text-(--text-main) flex items-center gap-1.5">
                                {f.fieldName}
                                <span className="text-(--text-muted)">:</span>
                                <span className="text-(--accent-purple)">{f.fieldType}</span>
                                {f.required && <span className="text-red-400" title="Required">*</span>}
                                {f.unique && <Key className="w-3 h-3 text-yellow-500" title="Unique" />}
                              </span>
                            ))}
                          </div>
                        </div>

                        {schema.relationships && schema.relationships.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-2">Relationships</p>
                            <div className="flex flex-wrap gap-2">
                              {schema.relationships.map((rel, i) => (
                                <span key={i} className="px-2.5 py-1 text-xs rounded-md bg-(--accent-neon)/10 border border-(--accent-neon)/30 text-(--accent-neon)">
                                  {rel.type} → {rel.toCollection}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-2">Auto-Generated Methods</p>
                          <div className="flex flex-wrap gap-2">
                            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(method => (
                              <span key={method} className={`px-2 py-0.5 text-[10px] font-bold rounded ${method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                method === 'POST' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                    method === 'PATCH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                      'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
