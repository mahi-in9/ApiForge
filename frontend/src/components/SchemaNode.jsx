import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Database, Link, MapPin, Hash, CheckSquare, Type, Calendar, List, Box, GitGraph } from 'lucide-react';

// ─── Field type icon map ──────────────────────────────────────────────────────
const getIcon = (type) => {
  switch (type) {
    case 'String':   return <Type size={13} color="var(--text-muted)" />;
    case 'Number':   return <Hash size={13} color="var(--text-muted)" />;
    case 'Boolean':  return <CheckSquare size={13} color="var(--text-muted)" />;
    case 'ObjectId': return <Link size={13} color="var(--accent-neon)" />;
    case 'Date':     return <Calendar size={13} color="var(--text-muted)" />;
    case 'Array':    return <List size={13} color="var(--text-muted)" />;
    case 'Object':   return <Box size={13} color="var(--text-muted)" />;
    case 'GeoPoint':
    case 'Address':  return <MapPin size={13} color="var(--text-muted)" />;
    default:         return <Database size={13} color="var(--text-muted)" />;
  }
};

// ─── Relationship type color map ──────────────────────────────────────────────
const relColor = (type) => {
  const map = {
    'one-to-one':   '#60a5fa',
    'one-to-many':  '#4ade80',
    'many-to-one':  '#f59e0b',
    'many-to-many': '#c084fc',
  };
  return map[type] || 'var(--accent-neon)';
};

// ─── SchemaNode ───────────────────────────────────────────────────────────────
const SchemaNode = ({ data }) => {
  const { collectionName, fields = [], relationships = [] } = data;
  const relCount = relationships.length;

  return (
    <div
      style={{
        width: '300px',
        background: 'var(--bg-card)',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,240,255,0.05)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,240,255,0.12), rgba(138,43,226,0.06))',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={15} color="var(--accent-neon)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
            {collectionName}
          </h3>
        </div>

        {/* Relationship count badge */}
        {relCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0,240,255,0.1)',
            border: '1px solid rgba(0,240,255,0.2)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 8px',
            fontSize: '0.7rem',
            color: 'var(--accent-neon)',
            fontWeight: 600,
          }}>
            <GitGraph size={11} />
            {relCount}
          </div>
        )}
      </div>

      {/* Target handle (incoming connections) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: 'var(--accent-neon)',
          width: '12px',
          height: '12px',
          left: '-6px',
          border: '2px solid rgba(0,0,0,0.5)',
        }}
      />

      {/* Fields list */}
      <div style={{ padding: '6px 0' }}>
        {fields.map((field, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 16px',
              borderBottom: index < fields.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none',
              background: field.isUnique ? 'rgba(245,158,11,0.04)' : field.fieldType === 'ObjectId' ? 'rgba(0,240,255,0.03)' : 'transparent',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {field.isUnique ? (
                <Key size={12} color="#f59e0b" title="Unique" />
              ) : (
                getIcon(field.fieldType)
              )}
              <span style={{
                color: field.isRequired ? '#fff' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
              }}>
                {field.fieldName}
                {field.isRequired && <span style={{ color: 'var(--accent-red)', marginLeft: '2px' }}>*</span>}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '0.72rem',
                color: field.fieldType === 'ObjectId' ? 'var(--accent-neon)' : 'var(--text-subtle)',
                fontFamily: 'var(--font-mono)',
              }}>
                {field.referenceTo ? `→ ${field.referenceTo}` : field.fieldType}
              </span>
              {field.isIndexed && !field.isUnique && (
                <span style={{ fontSize: '0.65rem', color: '#f59e0b' }} title="Indexed">⚡</span>
              )}
            </div>

            {/* Per-field source handle for ObjectId fields */}
            {field.fieldType === 'ObjectId' && (
              <Handle
                type="source"
                position={Position.Right}
                id={field.fieldName}
                style={{
                  background: 'var(--accent-neon)',
                  width: '10px',
                  height: '10px',
                  right: '-5px',
                  top: `${50}%`,
                  border: '2px solid rgba(0,0,0,0.5)',
                }}
              />
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div style={{ padding: '12px 16px', color: 'var(--text-subtle)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            No fields defined
          </div>
        )}
      </div>

      {/* Relationships section (compact) */}
      {relationships.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border-glass)',
          padding: '8px 0',
          background: 'rgba(0,0,0,0.1)',
        }}>
          {relationships.map((rel, i) => (
            <div key={rel._id || i} style={{
              padding: '4px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: relColor(rel.type),
                fontFamily: 'var(--font-mono)',
                padding: '1px 5px',
                background: `${relColor(rel.type)}18`,
                borderRadius: '3px',
              }}>
                {rel.type === 'one-to-one' ? '1:1' : rel.type === 'one-to-many' ? '1:N' : rel.type === 'many-to-one' ? 'N:1' : 'M:N'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                → {rel.toCollection}
              </span>
              {/* Relationship source handle */}
              <Handle
                type="source"
                position={Position.Right}
                id={`rel-${rel._id || i}`}
                style={{
                  background: relColor(rel.type),
                  width: '10px',
                  height: '10px',
                  right: '-5px',
                  top: '50%',
                  border: '2px solid rgba(0,0,0,0.5)',
                  opacity: 0.85,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaNode;
