import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactFlow, Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchSchemas } from '../store/slices/schemaSlice';
import SchemaNode from '../components/SchemaNode';
import GlassCard from '../components/GlassCard';
import { ChevronDown, Sparkles } from 'lucide-react';

const nodeTypes = {
  customSchemaNode: SchemaNode,
};

const VisualStudio = () => {
  const dispatch = useDispatch();
  
  const { items: projects } = useSelector((state) => state.projects);
  const { items: schemas, isLoading } = useSelector((state) => state.schemas);
  
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchSchemas(selectedProjectId));
    }
  }, [selectedProjectId, dispatch]);

  // Generate nodes and edges when schemas change
  useEffect(() => {
    if (schemas.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes = [];
    const newEdges = [];

    // Simple auto-layout algorithm for nodes
    schemas.forEach((schema, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      
      newNodes.push({
        id: schema.collectionName, // Node ID is the collection name
        type: 'customSchemaNode',
        position: { x: col * 350 + 50, y: row * 300 + 50 },
        data: { 
          collectionName: schema.collectionName, 
          fields: schema.fields 
        }
      });

      // Find relationships
      schema.fields.forEach(field => {
        if (field.fieldType === 'ObjectId' && field.referenceTo) {
          newEdges.push({
            id: `e-${schema.collectionName}-${field.referenceTo}`,
            source: schema.collectionName,
            target: field.referenceTo,
            sourceHandle: field.fieldName, // Connects from the specific field handle
            animated: true,
            style: { stroke: 'var(--accent-neon)', strokeWidth: 2 }
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [schemas]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Bar for Project Selection */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
          <Sparkles size={28} color="var(--accent-neon)" />
          <h1 style={{ margin: 0 }}>Visual Database Designer</h1>
        </div>

        <GlassCard style={{ padding: '10px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Project Context:</label>
            <div style={{ position: 'relative', width: '250px' }}>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
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
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Canvas Area */}
      <GlassCard style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
        {!selectedProjectId ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Please select a project to visualize its schema.</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#fff" gap={16} opacity={0.05} />
            <Controls />
            <MiniMap 
              nodeColor={() => 'var(--accent-neon)'}
              maskColor="rgba(0, 0, 0, 0.7)"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }} 
            />
          </ReactFlow>
        )}
      </GlassCard>
    </div>
  );
};

export default VisualStudio;
