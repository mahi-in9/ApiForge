import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchSchemas, updateSchema } from '../store/slices/schemaSlice';
import SchemaNode from '../components/SchemaNode';
import RelationshipEdge from '../components/EdgeLabel';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  Sparkles, Database, GitGraph, X, BookOpen, Layers, Info, Zap,
  Link as LinkIcon, Hash, Type, Calendar, List, Box, CheckSquare, MapPin, ChevronDown
} from 'lucide-react';

const nodeTypes = { customSchemaNode: SchemaNode };
const edgeTypes = { relationshipEdge: RelationshipEdge };

export default function VisualStudio() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const { items: projects, loading: projectsLoading } = useSelector(state => state.projects);
  const { items: schemas, loading: schemasLoading } = useSelector(state => state.schemas);
  
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Panels toggling state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // React Flow state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchSchemas(selectedProjectId));
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedProjectId, dispatch]);

  useEffect(() => {
    if (schemas && schemas.length > 0) {
      // Build nodes
      const initialNodes = schemas.map((schema, index) => {
        // Fallback grid position if no nodePosition saved
        const x = schema.nodePosition?.x ?? (index % 3) * 380 + 80;
        const y = schema.nodePosition?.y ?? Math.floor(index / 3) * 320 + 80;
        
        return {
          id: schema._id,
          type: 'customSchemaNode',
          position: { x, y },
          data: { 
            collectionName: schema.collectionName,
            fields: schema.fields || [],
            relationships: schema.relationships || []
          }
        };
      });

      // Build edges
      const initialEdges = [];
      schemas.forEach(schema => {
        // Advanced relationships
        if (schema.relationships) {
          schema.relationships.forEach((rel) => {
            const targetSchema = schemas.find(s => s.collectionName === rel.toCollection);
            if (targetSchema) {
              initialEdges.push({
                id: `rel-${rel._id || Math.random().toString(36)}`,
                source: schema._id,
                target: targetSchema._id,
                type: 'relationshipEdge',
                data: { relationType: rel.type, label: rel.label || undefined }
              });
            }
          });
        }
        
        // Legacy ObjectId references
        if (schema.fields) {
          schema.fields.forEach(field => {
            if (field.fieldType === 'ObjectId' && field.targetCollection) {
              const targetSchema = schemas.find(s => s.collectionName === field.targetCollection);
              if (targetSchema) {
                initialEdges.push({
                  id: `legacy-${schema._id}-${field.fieldName}`,
                  source: schema._id,
                  target: targetSchema._id,
                  type: 'default',
                  animated: true,
                  style: { stroke: 'var(--accent-neon)' }
                });
              }
            }
          });
        }
      });
      
      setNodes(initialNodes);
      setEdges(initialEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [schemas]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeDragStop = useCallback(
    async (event, node) => {
      // Find corresponding schema using node.id which is the schema._id
      const schema = schemas.find(s => s._id === node.id);
      if (schema) {
        try {
          await dispatch(updateSchema({
            apiSchemaId: schema._id,
            nodePosition: { x: node.position.x, y: node.position.y }
          })).unwrap();
        } catch (error) {
          console.error("Failed to update node position", error);
        }
      }
    },
    [dispatch, schemas]
  );

  const handleAutoLayout = () => {
    const arrangedNodes = nodes.map((node, index) => {
      return {
        ...node,
        position: {
          x: (index % 3) * 380 + 80,
          y: Math.floor(index / 3) * 320 + 80
        }
      };
    });
    setNodes(arrangedNodes);
    
    // Auto-save new positions
    arrangedNodes.forEach(node => {
      dispatch(updateSchema({
        apiSchemaId: node.id,
        nodePosition: { x: node.position.x, y: node.position.y }
      }));
    });
    showToast('Auto layout applied', 'success');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-(--border-glass) flex items-center justify-between shrink-0 bg-(--bg-dark)/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Sparkles className="w-6 h-6 text-(--accent-neon)" />
          <h2 className="text-xl font-bold text-(--text-main)">Visual Schema Designer</h2>
          
          <div className="flex ml-4 gap-2">
            <button 
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className={`p-2 rounded-lg border transition-colors ${showLeftPanel ? 'bg-(--accent-neon)/10 border-(--accent-neon)/30 text-(--accent-neon)' : 'bg-(--bg-card) border-(--border-glass) text-(--text-muted) hover:text-(--text-main)'}`}
              title="Toggle Feature Overview"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-lg border transition-colors ${showRightPanel ? 'bg-(--accent-neon)/10 border-(--accent-neon)/30 text-(--accent-neon)' : 'bg-(--bg-card) border-(--border-glass) text-(--text-muted) hover:text-(--text-main)'}`}
              title="Toggle Schema Guide"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="w-64">
          <select
            className="input-glass w-full"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select a Project...</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel */}
        <div className={`transition-all duration-300 ease-in-out shrink-0 border-r border-(--border-glass) bg-(--bg-dark)/80 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col ${showLeftPanel ? 'w-[260px] opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}`}>
          <div className="p-4 flex items-center justify-between border-b border-(--border-glass)">
            <h3 className="font-bold text-(--text-main) flex items-center gap-2">
              <Info className="w-4 h-4 text-(--accent-neon)" />
              Feature Overview
            </h3>
            <button onClick={() => setShowLeftPanel(false)} className="text-(--text-muted) hover:text-(--text-main)">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-6 flex-1">
            <section>
              <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">Field Types</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><Type className="w-4 h-4 text-gray-400" /> <span>String</span></li>
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><Hash className="w-4 h-4 text-blue-400" /> <span>Number</span></li>
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><CheckSquare className="w-4 h-4 text-green-400" /> <span>Boolean</span></li>
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><Calendar className="w-4 h-4 text-yellow-400" /> <span>Date</span></li>
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><List className="w-4 h-4 text-purple-400" /> <span>Array</span></li>
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><Box className="w-4 h-4 text-pink-400" /> <span>Object</span></li>
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><LinkIcon className="w-4 h-4 text-(--accent-neon)" /> <span>ObjectId</span></li>
                <li className="flex items-center gap-3 text-sm text-(--text-main)"><MapPin className="w-4 h-4 text-red-400" /> <span>GeoPoint</span></li>
              </ul>
            </section>
            
            <section>
              <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">Relationship Types</h4>
              <div className="space-y-2">
                <div className="p-2 bg-(--bg-card) border border-(--border-glass) rounded text-sm">
                  <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 1:1</div>
                  <span className="text-xs text-(--text-muted)">User → Profile</span>
                </div>
                <div className="p-2 bg-(--bg-card) border border-(--border-glass) rounded text-sm">
                  <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 1:N</div>
                  <span className="text-xs text-(--text-muted)">User → Posts</span>
                </div>
                <div className="p-2 bg-(--bg-card) border border-(--border-glass) rounded text-sm">
                  <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> N:1</div>
                  <span className="text-xs text-(--text-muted)">Comments → Post</span>
                </div>
                <div className="p-2 bg-(--bg-card) border border-(--border-glass) rounded text-sm">
                  <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> M:N</div>
                  <span className="text-xs text-(--text-muted)">Students ↔ Courses</span>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">Quick Actions</h4>
              <button 
                onClick={handleAutoLayout}
                className="w-full btn-glass py-2 flex items-center justify-center gap-2 text-sm"
              >
                <GitGraph className="w-4 h-4" />
                Auto Layout
              </button>
            </section>
          </div>
          
          <div className="p-4 border-t border-(--border-glass)">
            <a href="/docs" className="text-sm text-(--accent-neon) hover:underline flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learn More
            </a>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 relative bg-(--bg-dark)">
          {!selectedProjectId ? (
            <div className="absolute inset-0 flex items-center justify-center bg-(--bg-dark)/50 z-10">
              <EmptyState 
                icon={<Database />}
                title="No Project Selected"
                description="Select a project from the top dropdown to view its schema architecture."
              />
            </div>
          ) : schemas.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-(--bg-dark)/50 z-10">
              <div className="p-8 border-2 border-dashed border-(--border-glass) rounded-2xl flex flex-col items-center max-w-md text-center bg-(--bg-card)/50 backdrop-blur-sm">
                <Database className="w-12 h-12 text-(--accent-purple) mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-(--text-main) mb-2">No collections yet</h3>
                <p className="text-(--text-muted) mb-6">Create one in Schema Builder to get started.</p>
                <a href="/schemas" className="btn-primary py-2 px-6">Go to Schema Builder</a>
              </div>
            </div>
          ) : null}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            style={{ background: 'var(--bg-dark)' }}
          >
            <Background color="var(--border-glass)" gap={16} size={1} />
            <Controls className="bg-(--bg-card) border border-(--border-glass) fill-(--text-main)" />
            <MiniMap 
              nodeColor="var(--accent-neon)" 
              maskColor="rgba(0, 0, 0, 0.7)"
              className="bg-(--bg-card) border border-(--border-glass)"
            />
            {schemas.length > 0 && (
              <Panel position="top-center" className="bg-(--bg-card)/80 backdrop-blur-md border border-(--border-glass) rounded-full px-4 py-1.5 text-sm font-medium text-(--text-main)">
                {schemas.length} Collection{schemas.length !== 1 ? 's' : ''}
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right Panel */}
        <div className={`transition-all duration-300 ease-in-out shrink-0 border-l border-(--border-glass) bg-(--bg-dark)/80 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col ${showRightPanel ? 'w-[280px] opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}`}>
          <div className="p-4 flex items-center justify-between border-b border-(--border-glass)">
            <h3 className="font-bold text-(--text-main) flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-(--accent-neon)" />
              Schema Guide
            </h3>
            <button onClick={() => setShowRightPanel(false)} className="text-(--text-muted) hover:text-(--text-main)">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-6">
            <section>
              <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">How Relationships Work</h4>
              <p className="text-sm text-(--text-main) leading-relaxed">
                Define relationships to automatically generate Mongoose <code className="bg-(--bg-card) px-1 rounded text-(--accent-purple)">populate()</code> queries. 
                Using the <code className="bg-(--bg-card) px-1 rounded">fromField</code> mapping to <code className="bg-(--bg-card) px-1 rounded">toCollection</code> allows for deep nested fetching via your REST APIs.
              </p>
            </section>
            
            <section>
              <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">Validation</h4>
              <ul className="space-y-2 text-sm text-(--text-main)">
                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-(--accent-neon) shrink-0"></div> Required constraints</li>
                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-(--accent-neon) shrink-0"></div> Strict type checking</li>
                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-(--accent-neon) shrink-0"></div> Enum matching</li>
                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-(--accent-neon) shrink-0"></div> Min/Max ranges</li>
                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-(--accent-neon) shrink-0"></div> Foreign key integrity</li>
              </ul>
            </section>

            <section>
              <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">Supported Features</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-(--text-main)">
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-green-400" /> Auto indexes</div>
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-green-400" /> Unique rules</div>
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-green-400" /> Enum validate</div>
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-green-400" /> Cascade del</div>
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-green-400" /> Populates</div>
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-green-400" /> Set Null</div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">API Query Examples</h4>
              <div className="space-y-3">
                <div className="bg-(--bg-card) p-3 rounded-lg border border-(--border-glass) overflow-hidden text-xs">
                  <div className="text-(--text-muted) mb-1">Populate relations</div>
                  <code className="text-green-400 whitespace-pre-wrap break-all">GET /api/data/{"{projectId}"}/{"{collection}"}?populate=user</code>
                </div>
                <div className="bg-(--bg-card) p-3 rounded-lg border border-(--border-glass) overflow-hidden text-xs">
                  <div className="text-(--text-muted) mb-1">Pagination & Sorting</div>
                  <code className="text-blue-400 whitespace-pre-wrap break-all">GET /api/data/{"{projectId}"}/{"{collection}"}?page=1&limit=10&sort=createdAt:desc</code>
                </div>
              </div>
            </section>
          </div>
        </div>
        
      </div>
    </div>
  );
}
