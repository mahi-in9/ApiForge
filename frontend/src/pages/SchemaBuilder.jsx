import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchSchemas, createSchema, deleteSchema } from '../store/slices/schemaSlice';
import GlassCard from '../components/GlassCard';
import { Database, Plus, Trash2, Code, ChevronDown, Check } from 'lucide-react';

const SchemaBuilder = () => {
  const dispatch = useDispatch();
  
  // State from Redux
  const { items: projects, isLoading: projectsLoading } = useSelector((state) => state.projects);
  const { items: schemas, isLoading: schemasLoading, error: schemasError } = useSelector((state) => state.schemas);
  
  // Local state for UI
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [fields, setFields] = useState([{ 
    fieldName: '', 
    fieldType: 'String', 
    isRequired: false, 
    isUnique: false, 
    isIndexed: false, 
    defaultValue: '', 
    referenceTo: '',
    enumValues: '',
    minLength: '',
    maxLength: '',
    min: '',
    max: ''
  }]);
  const [isCopied, setIsCopied] = useState('');

  // Fetch projects on mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Fetch schemas when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchSchemas(selectedProjectId));
    }
  }, [selectedProjectId, dispatch]);

  const handleAddField = () => {
    setFields([...fields, { 
      fieldName: '', 
      fieldType: 'String', 
      isRequired: false, 
      isUnique: false, 
      isIndexed: false, 
      defaultValue: '', 
      referenceTo: '',
      enumValues: '',
      minLength: '',
      maxLength: '',
      min: '',
      max: ''
    }]);
  };

  const handleRemoveField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return alert('Please select a project first.');
    if (!collectionName.trim()) return alert('Please enter a collection name.');
    
    // Basic validation to ensure field names aren't empty
    const hasEmptyField = fields.some(f => !f.fieldName.trim());
    if (hasEmptyField) return alert('All fields must have a name.');

      // Parse Enum values for strings
      const payloadFields = fields.map(f => {
        let parsedEnum = [];
        if (f.fieldType === 'String' && f.enumValues) {
          parsedEnum = f.enumValues.split(',').map(s => s.trim()).filter(s => s);
        }
        return {
          ...f,
          enumValues: parsedEnum,
          minLength: f.minLength === '' ? null : Number(f.minLength),
          maxLength: f.maxLength === '' ? null : Number(f.maxLength),
          min: f.min === '' ? null : Number(f.min),
          max: f.max === '' ? null : Number(f.max),
        };
      });

      const result = await dispatch(createSchema({
        projectId: selectedProjectId,
        collectionName,
        fields: payloadFields
      })).unwrap();

    if (!result.error) {
      // Reset form on success
      setCollectionName('');
      setFields([{ 
        fieldName: '', 
        fieldType: 'String', 
        isRequired: false, 
        isUnique: false, 
        isIndexed: false, 
        defaultValue: '', 
        referenceTo: '',
        enumValues: '',
        minLength: '',
        maxLength: '',
        min: '',
        max: ''
      }]);
    }
  };

  const handleDelete = (schemaId) => {
    if (window.confirm('Are you sure you want to delete this schema? Data will remain, but the dynamic endpoint will fail validation.')) {
      dispatch(deleteSchema(schemaId));
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(''), 2000);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', color: 'var(--text-main)' }}>
        <Database size={28} color="var(--accent-neon)" />
        <h1 style={{ margin: 0 }}>Schema Builder</h1>
      </div>

      {/* Project Selector */}
      <GlassCard style={{ marginBottom: '30px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <label style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Target Environment:</label>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                appearance: 'none',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Select a Project</option>
              {projects.map(p => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.projectName || p.name}</option>
              ))}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '14px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
          {projectsLoading && <span style={{ color: 'var(--accent-neon)', fontSize: '0.9rem' }}>Loading...</span>}
        </div>
      </GlassCard>

      {/* Main Content Area - Only show if a project is selected */}
      {selectedProjectId ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* LEFT COLUMN: Create Schema Form */}
          <GlassCard style={{ padding: '30px' }}>
            <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={20} color="var(--accent-neon)" />
              Define New Collection
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g., users, products, orders"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-glass)',
                    padding: '12px',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                  required
                />
                <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Only lowercase letters, numbers, and underscores allowed.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Schema Fields</label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    style={{
                      background: 'rgba(0, 240, 255, 0.1)',
                      color: 'var(--accent-neon)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Plus size={14} /> Add Field
                  </button>
                </div>

                {/* Dynamic Fields List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {fields.map((field, index) => (
                    <div key={index} style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border-glass)' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="fieldName"
                        value={field.fieldName}
                        onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                        style={{ flex: 2, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none' }}
                        required
                      />
                      
                      <select
                        value={field.fieldType}
                        onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}
                        style={{ flex: 1.5, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="String">String</option>
                        <option value="Number">Number</option>
                        <option value="Boolean">Boolean</option>
                        <option value="Date">Date</option>
                        <option value="Array">Array</option>
                        <option value="Object">Object</option>
                        <option value="GeoPoint">Coordinates (GeoPoint)</option>
                        <option value="Address">Address</option>
                        <option value="ObjectId">Relationship (ObjectId)</option>
                      </select>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => handleFieldChange(index, 'isRequired', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        Req
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.isUnique}
                          onChange={(e) => handleFieldChange(index, 'isUnique', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        Unique
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.isIndexed}
                          onChange={(e) => handleFieldChange(index, 'isIndexed', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        Index
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        disabled={fields.length === 1}
                        style={{ background: 'transparent', border: 'none', color: fields.length === 1 ? 'rgba(255,255,255,0.1)' : '#ff4d4d', cursor: fields.length === 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {/* Extended options based on field type */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingLeft: '15px', borderLeft: '2px solid rgba(0, 240, 255, 0.3)', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Default Value"
                        value={field.defaultValue}
                        onChange={(e) => handleFieldChange(index, 'defaultValue', e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '150px' }}
                      />
                      
                      {field.fieldType === 'ObjectId' && (
                         <input
                           type="text"
                           placeholder="Target Collection (e.g. users)"
                           value={field.referenceTo}
                           onChange={(e) => handleFieldChange(index, 'referenceTo', e.target.value.toLowerCase())}
                           style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-neon)', padding: '6px', borderRadius: '4px', color: 'var(--accent-neon)', outline: 'none', fontSize: '0.8rem', width: '200px' }}
                           required
                         />
                      )}

                      {field.fieldType === 'String' && (
                        <>
                          <input
                            type="text"
                            placeholder="Enum (comma separated)"
                            value={field.enumValues}
                            onChange={(e) => handleFieldChange(index, 'enumValues', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '180px' }}
                          />
                          <input
                            type="number"
                            placeholder="Min Length"
                            value={field.minLength}
                            onChange={(e) => handleFieldChange(index, 'minLength', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '100px' }}
                          />
                          <input
                            type="number"
                            placeholder="Max Length"
                            value={field.maxLength}
                            onChange={(e) => handleFieldChange(index, 'maxLength', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '100px' }}
                          />
                        </>
                      )}

                      {field.fieldType === 'Number' && (
                        <>
                          <input
                            type="number"
                            placeholder="Min Value"
                            value={field.min}
                            onChange={(e) => handleFieldChange(index, 'min', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '100px' }}
                          />
                          <input
                            type="number"
                            placeholder="Max Value"
                            value={field.max}
                            onChange={(e) => handleFieldChange(index, 'max', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '100px' }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              </div>

              {schemasError && (
                <div style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '15px' }}>
                  {schemasError}
                </div>
              )}

              <button
                type="submit"
                disabled={schemasLoading}
                style={{
                  width: '100%',
                  background: 'var(--accent-neon)',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: schemasLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: schemasLoading ? 0.7 : 1,
                  marginTop: '10px'
                }}
              >
                {schemasLoading ? 'Forging Schema...' : 'Initialize Schema'}
              </button>
            </form>
          </GlassCard>

          {/* RIGHT COLUMN: Existing Schemas & API Endpoints */}
          <div>
            <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code size={20} color="var(--accent-neon)" />
              Active Collections
            </h2>

            {schemasLoading && schemas.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading schemas...</p>
            ) : schemas.length === 0 ? (
              <GlassCard style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>No collections defined for this project yet.</p>
              </GlassCard>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {schemas.map(schema => {
                  const endpointUrl = `https://apiforge.com/api/data/${selectedProjectId}/${schema.collectionName}`;
                  
                  return (
                    <GlassCard key={schema._id} style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>/{schema.collectionName}</h3>
                        <button
                          onClick={() => handleDelete(schema._id)}
                          style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                          title="Delete Schema"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {/* Endpoint info */}
                      <div style={{ marginBottom: '15px', background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--accent-neon)', fontWeight: 'bold', textTransform: 'uppercase' }}>REST Endpoint</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <code style={{ color: 'var(--text-muted)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                            /api/data/{selectedProjectId}/{schema.collectionName}
                          </code>
                          <button 
                            onClick={() => copyToClipboard(endpointUrl, schema._id)}
                            style={{ background: 'transparent', border: 'none', color: isCopied === schema._id ? '#4ade80' : 'var(--text-main)', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            {isCopied === schema._id ? <Check size={14} /> : 'COPY URL'}
                          </button>
                        </div>
                      </div>

                      {/* Fields overview */}
                      <div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Schema Shape:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {schema.fields.map((f, i) => (
                            <span key={i} style={{ 
                              background: 'rgba(255,255,255,0.05)', 
                              border: '1px solid var(--border-glass)', 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem', 
                              color: f.isRequired || f.isUnique || f.isIndexed ? '#fff' : 'var(--text-muted)'
                            }}>
                              <span style={{ color: 'var(--accent-neon)' }}>{f.fieldName}</span>: {f.fieldType} {f.isRequired && '*'} {f.isUnique && '🔑'} {f.isIndexed && !f.isUnique && '⚡'} {f.referenceTo && ` 🔗 -> ${f.referenceTo}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-glass)', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>
            Select a project from the dropdown above to begin building schemas.
          </p>
        </div>
      )}
    </div>
  );
};

export default SchemaBuilder;
