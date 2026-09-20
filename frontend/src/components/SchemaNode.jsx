import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Database, Link, MapPin, Hash, CheckSquare, Type, Calendar, List, Box, GitGraph } from 'lucide-react';
import './SchemaNode.css';

const getIcon = (type) => {
  switch (type) {
    case 'String':   return <Type size={12} color="var(--text-subtle)" />;
    case 'Number':   return <Hash size={12} color="var(--text-subtle)" />;
    case 'Boolean':  return <CheckSquare size={12} color="var(--text-subtle)" />;
    case 'ObjectId': return <Link size={12} color="var(--accent-blue)" />;
    case 'Date':     return <Calendar size={12} color="var(--text-subtle)" />;
    case 'Array':    return <List size={12} color="var(--text-subtle)" />;
    case 'Object':   return <Box size={12} color="var(--text-subtle)" />;
    case 'GeoPoint':
    case 'Address':  return <MapPin size={12} color="var(--text-subtle)" />;
    default:         return <Database size={12} color="var(--text-subtle)" />;
  }
};

const relColor = (type) => {
  const map = {
    'one-to-one':   '#60a5fa',
    'one-to-many':  '#3fb950',
    'many-to-one':  '#d29922',
    'many-to-many': '#bc8cff',
  };
  return map[type] || 'var(--accent-blue)';
};

const SchemaNode = ({ data }) => {
  const { collectionName, fields = [], relationships = [] } = data;
  const relCount = relationships.length;

  return (
    <div className="schema-node">
      {/* Header */}
      <div className="schema-node__header">
        <div className="schema-node__title-group">
          <Database size={14} color="var(--accent-blue)" />
          <h3 className="schema-node__name">{collectionName}</h3>
        </div>
        {relCount > 0 && (
          <div className="schema-node__rel-badge">
            <GitGraph size={10} />
            {relCount}
          </div>
        )}
      </div>

      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'var(--accent-blue)', width: '10px', height: '10px', left: '-5px', border: '2px solid var(--bg-dark)' }}
      />

      {/* Fields */}
      <div className="schema-node__fields">
        {fields.map((field, index) => (
          <div
            key={index}
            className="schema-node__field"
            style={{
              borderBottom: index < fields.length - 1 ? '1px solid rgba(48,54,61,0.6)' : 'none',
              background: field.isUnique
                ? 'rgba(210,153,34,0.04)'
                : field.fieldType === 'ObjectId'
                ? 'rgba(56,139,253,0.04)'
                : 'transparent',
            }}
          >
            <div className="schema-node__field-left">
              {field.isUnique ? <Key size={11} color="var(--accent-amber)" title="Unique" /> : getIcon(field.fieldType)}
              <span
                className="schema-node__field-name"
                style={{ color: field.isRequired ? 'var(--text-main)' : 'var(--text-muted)' }}
              >
                {field.fieldName}
                {field.isRequired && <span className="schema-node__field-required">*</span>}
              </span>
            </div>
            <div className="schema-node__field-right">
              <span
                className="schema-node__field-type"
                style={{ color: field.fieldType === 'ObjectId' ? 'var(--accent-blue)' : 'var(--text-subtle)' }}
              >
                {field.referenceTo ? `→ ${field.referenceTo}` : field.fieldType}
              </span>
              {field.isIndexed && !field.isUnique && (
                <span className="schema-node__field-indexed" title="Indexed">⚡</span>
              )}
            </div>
            {field.fieldType === 'ObjectId' && (
              <Handle
                type="source"
                position={Position.Right}
                id={field.fieldName}
                style={{ background: 'var(--accent-blue)', width: '9px', height: '9px', right: '-5px', top: '50%', border: '2px solid var(--bg-dark)' }}
              />
            )}
          </div>
        ))}
        {fields.length === 0 && (
          <div className="schema-node__empty">No fields defined</div>
        )}
      </div>

      {/* Relationships */}
      {relationships.length > 0 && (
        <div className="schema-node__rels">
          {relationships.map((rel, i) => (
            <div key={rel._id || i} className="schema-node__rel-row">
              <span
                className="schema-node__rel-type"
                style={{ color: relColor(rel.type), background: `${relColor(rel.type)}18` }}
              >
                {rel.type === 'one-to-one' ? '1:1' : rel.type === 'one-to-many' ? '1:N' : rel.type === 'many-to-one' ? 'N:1' : 'M:N'}
              </span>
              <span className="schema-node__rel-target">→ {rel.toCollection}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`rel-${rel._id || i}`}
                style={{ background: relColor(rel.type), width: '9px', height: '9px', right: '-5px', top: '50%', border: '2px solid var(--bg-dark)', opacity: 0.9 }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemaNode;
