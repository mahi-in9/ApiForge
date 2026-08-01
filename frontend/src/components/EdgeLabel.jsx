import React from 'react';
import { EdgeLabelRenderer, BaseEdge, getStraightPath, getBezierPath } from '@xyflow/react';

const REL_TYPE_CONFIG = {
  'one-to-one':   { label: '1:1', color: '#60a5fa' },
  'one-to-many':  { label: '1:N', color: '#4ade80' },
  'many-to-one':  { label: 'N:1', color: '#f59e0b' },
  'many-to-many': { label: 'M:N', color: '#c084fc' },
};

/**
 * RelationshipEdge — custom React Flow edge with a labeled badge
 * showing the relationship type (1:1 / 1:N / M:N etc.).
 */
const RelationshipEdge = ({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const relType = data.relationType || 'one-to-many';
  const cfg = REL_TYPE_CONFIG[relType] || { label: '→', color: 'var(--accent-neon)' };
  const displayLabel = data.label || cfg.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: cfg.color,
          strokeWidth: 2,
          strokeDasharray: relType === 'many-to-many' ? '6 3' : undefined,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            padding: '3px 8px',
            background: `${cfg.color}22`,
            border: `1px solid ${cfg.color}55`,
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: cfg.color,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            cursor: 'default',
            whiteSpace: 'nowrap',
          }}
          className="nodrag nopan"
          title={relType}
        >
          {displayLabel}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default RelationshipEdge;
