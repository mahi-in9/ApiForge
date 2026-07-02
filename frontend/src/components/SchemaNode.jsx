import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Database, Link, MapPin, Hash, CheckSquare, Type, Calendar, List, Box } from 'lucide-react';
import GlassCard from './GlassCard';

const getIcon = (type) => {
  switch (type) {
    case 'String': return <Type size={14} color="var(--text-muted)" />;
    case 'Number': return <Hash size={14} color="var(--text-muted)" />;
    case 'Boolean': return <CheckSquare size={14} color="var(--text-muted)" />;
    case 'ObjectId': return <Link size={14} color="var(--accent-neon)" />;
    case 'Date': return <Calendar size={14} color="var(--text-muted)" />;
    case 'Array': return <List size={14} color="var(--text-muted)" />;
    case 'Object': return <Box size={14} color="var(--text-muted)" />;
    case 'GeoPoint': 
    case 'Address': return <MapPin size={14} color="var(--text-muted)" />;
    default: return <Database size={14} color="var(--text-muted)" />;
  }
};

const SchemaNode = ({ data }) => {
  return (
    <GlassCard style={{ width: '280px', padding: 0, overflow: 'visible', border: '1px solid rgba(0, 240, 255, 0.4)' }}>
      {/* Node Header */}
      <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <Database size={16} color="var(--accent-neon)" />
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{data.collectionName}</h3>
      </div>
      
      {/* Target Handle (Left) - for incoming relationships */}
      <Handle type="target" position={Position.Left} style={{ background: 'var(--accent-neon)', width: '10px', height: '10px', left: '-5px' }} />

      {/* Fields List */}
      <div style={{ padding: '8px 0' }}>
        {data.fields.map((field, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '6px 16px',
            background: field.isUnique ? 'rgba(255,255,255,0.03)' : 'transparent'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {field.isUnique && <Key size={12} color="#f59e0b" title="Unique Key" />}
              {!field.isUnique && getIcon(field.fieldType)}
              <span style={{ color: field.isRequired ? '#fff' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                {field.fieldName}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: field.fieldType === 'ObjectId' ? 'var(--accent-neon)' : 'var(--text-muted)' }}>
                {field.fieldType}
              </span>
            </div>

            {/* Source Handle (Right) - for outgoing relationships (only on ObjectId fields) */}
            {field.fieldType === 'ObjectId' && (
              <Handle 
                type="source" 
                position={Position.Right} 
                id={field.fieldName}
                style={{ background: 'var(--accent-neon)', width: '10px', height: '10px', right: '-5px', top: `${45 + (index * 30)}px` }} 
              />
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default SchemaNode;
