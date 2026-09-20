import React from 'react';
import { EdgeLabelRenderer, BaseEdge, getBezierPath } from '@xyflow/react';
import './EdgeLabel.css';

const REL_TYPE_CONFIG = {
  'one-to-one':   { label: '1:1', color: '#60a5fa' },
  'one-to-many':  { label: '1:N', color: '#3fb950' },
  'many-to-one':  { label: 'N:1', color: '#d29922' },
  'many-to-many': { label: 'M:N', color: '#bc8cff' },
};

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
  const cfg = REL_TYPE_CONFIG[relType] || { label: '→', color: 'var(--accent-blue)' };
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
          className="edge-label-badge nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            background: `${cfg.color}22`,
            border: `1px solid ${cfg.color}55`,
            color: cfg.color,
          }}
          title={relType}
        >
          {displayLabel}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default RelationshipEdge;
