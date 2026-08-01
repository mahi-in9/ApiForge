import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchSchemas } from '../store/slices/schemaSlice';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import {
  Play, ChevronDown, Copy, Check, Clock, Terminal,
  Layers, Plus, Minus, FileJson, Send, Code2, Zap
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_COLORS = {
  GET:    { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
  POST:   { text: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)' },
  PUT:    { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  PATCH:  { text: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)' },
  DELETE: { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
};

const statusClass = (code) => {
  if (!code) return '';
  if (code < 200) return 'status-1xx';
  if (code < 300) return 'status-2xx';
  if (code < 400) return 'status-3xx';
  if (code < 500) return 'status-4xx';
  return 'status-5xx';
};

const DEFAULT_BODY = '{\n  \n}';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatJSON = (data) => {
  try { return JSON.stringify(data, null, 2); } catch { return String(data); }
};

const syntaxHighlight = (json) => {
  if (typeof json !== 'string') json = formatJSON(json);
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = 'color: #c084fc'; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'color: #60a5fa' : 'color: #4ade80'; // key vs string
      } else if (/true|false/.test(match)) {
        cls = 'color: #f59e0b';
      } else if (/null/.test(match)) {
        cls = 'color: #f87171';
      }
      return `<span style="${cls}">${match}</span>`;
    });
};

const buildURL = (baseUri, projectId, collection, docId, queryParams) => {
  let url = `${baseUri}/api/data/${projectId}/${collection}`;
  if (docId.trim()) url += `/${docId.trim()}`;
  const qp = queryParams.filter(p => p.key.trim());
  if (qp.length > 0) {
    url += '?' + qp.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
  }
  return url;
};

const buildCurl = (method, url, apiKey, body) => {
  let cmd = `curl -X ${method} '${url}' \\\n  -H 'Authorization: Bearer ${apiKey}' \\\n  -H 'Content-Type: application/json'`;
  if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim() && body.trim() !== '{}') {
    cmd += ` \\\n  -d '${body.trim()}'`;
  }
  return cmd;
};

const buildFetch = (method, url, apiKey, body) => {
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  return `fetch('${url}', {
  method: '${method}',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json',
  },${hasBody ? `\n  body: JSON.stringify(${body.trim()}),` : ''}
})
  .then(res => res.json())
  .then(console.log);`;
};

const buildAxios = (method, url, apiKey, body) => {
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  return `import axios from 'axios';

const response = await axios.${method.toLowerCase()}('${url}'${hasBody ? `, ${body.trim()}` : ''}, {
  headers: { 'Authorization': 'Bearer ${apiKey}' }
});
console.log(response.data);`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MethodBadge = ({ method, selected, onClick }) => {
  const cfg = METHOD_COLORS[method];
  return (
    <button
      onClick={() => onClick(method)}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${selected ? cfg.border : 'var(--border-glass)'}`,
        background: selected ? cfg.bg : 'transparent',
        color: selected ? cfg.text : 'var(--text-muted)',
        fontSize: '0.8rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        letterSpacing: '0.04em',
      }}
    >
      {method}
    </button>
  );
};

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        background: 'none', border: 'none',
        color: copied ? 'var(--accent-green)' : 'var(--text-muted)',
        cursor: 'pointer', fontSize: '0.78rem', padding: '4px 8px',
        borderRadius: 'var(--radius-sm)', transition: 'color 0.2s',
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : label}
    </button>
  );
};

const QueryParamRow = ({ param, index, onChange, onRemove }) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <input
      className="input-glass"
      placeholder="key"
      value={param.key}
      onChange={e => onChange(index, 'key', e.target.value)}
      style={{ flex: 1, fontSize: '0.82rem' }}
    />
    <input
      className="input-glass"
      placeholder="value"
      value={param.value}
      onChange={e => onChange(index, 'value', e.target.value)}
      style={{ flex: 2, fontSize: '0.82rem' }}
    />
    <button
      onClick={() => onRemove(index)}
      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}
    >
      <Minus size={14} />
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ApiPlayground = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items: projects, isLoading: projectsLoading } = useSelector(s => s.projects);
  const { items: schemas } = useSelector(s => s.schemas);

  // Request state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [method, setMethod] = useState('GET');
  const [docId, setDocId] = useState('');
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [activeTab, setActiveTab] = useState('body'); // 'body' | 'headers' | 'snippets'
  const [activeSnippet, setActiveSnippet] = useState('curl');

  // Response state
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [showHeaders, setShowHeaders] = useState(false);

  const abortRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchSchemas(selectedProjectId));
      setSelectedCollection('');
    }
  }, [selectedProjectId, dispatch]);

  // When method changes to GET/DELETE, switch away from body tab
  useEffect(() => {
    if (['GET', 'DELETE'].includes(method) && activeTab === 'body') {
      setActiveTab('headers');
    }
  }, [method]);

  const selectedProject = projects.find(p => p._id === selectedProjectId || p.id === selectedProjectId);
  const apiKey = selectedProject?.apiKey || '';
  const baseUri = import.meta.env.VITE_SERVER_URI || 'http://localhost:5000';
  const url = selectedProjectId && selectedCollection
    ? buildURL(baseUri, selectedProjectId, selectedCollection, docId, queryParams)
    : '';

  const handleAddParam = () => setQueryParams(prev => [...prev, { key: '', value: '' }]);
  const handleRemoveParam = (i) => setQueryParams(prev => prev.filter((_, idx) => idx !== i));
  const handleParamChange = (i, field, val) => {
    setQueryParams(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };

  const handleSend = useCallback(async () => {
    if (!url) return toast.error('Please select a project and collection first');
    if (!apiKey) return toast.error('No API key found for this project');

    setIsLoading(true);
    setResponse(null);
    setResponseTime(null);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const start = performance.now();
    try {
      const opts = {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: abortRef.current.signal,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        try {
          opts.body = JSON.stringify(JSON.parse(body));
        } catch {
          return toast.error('Invalid JSON in request body');
        }
      }

      const res = await fetch(url, opts);
      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);

      let data;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const headersObj = {};
      res.headers.forEach((v, k) => { headersObj[k] = v; });

      setResponse({ status: res.status, statusText: res.statusText, data, headers: headersObj });
    } catch (err) {
      if (err.name === 'AbortError') return;
      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);
      setResponse({ status: 0, statusText: 'Network Error', data: { error: err.message }, headers: {} });
      toast.error(`Request failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [url, apiKey, method, body, toast]);

  // Keyboard shortcut: Ctrl+Enter to send
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter') handleSend();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSend]);

  const formattedResponse = response ? formatJSON(response.data) : '';
  const snippets = url ? {
    curl:  buildCurl(method, url, apiKey, body),
    fetch: buildFetch(method, url, apiKey, body),
    axios: buildAxios(method, url, apiKey, body),
  } : {};

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Terminal size={28} color="var(--accent-neon)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            API Playground
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Test your generated endpoints in real-time · Press{' '}
            <kbd style={{ padding: '1px 5px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-neon)' }}>
              Ctrl+↵
            </kbd>{' '}
            to send
          </p>
        </div>
      </div>

      {/* Main two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1, minHeight: 0 }}>

        {/* ── LEFT PANEL: Request Builder ── */}
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} color="var(--accent-neon)" /> Request
          </h2>

          {/* Project selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Project
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="input-glass"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ cursor: 'pointer', paddingRight: '36px' }}
              >
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>{p.projectName || p.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
            {selectedProject && (
              <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={11} color="var(--accent-green)" />
                API key loaded automatically
              </p>
            )}
          </div>

          {/* Collection selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Collection
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="input-glass"
                value={selectedCollection}
                onChange={e => setSelectedCollection(e.target.value)}
                disabled={!selectedProjectId}
                style={{ cursor: selectedProjectId ? 'pointer' : 'not-allowed', opacity: !selectedProjectId ? 0.5 : 1, paddingRight: '36px' }}
              >
                <option value="">Select a collection...</option>
                {schemas.map(s => (
                  <option key={s._id} value={s.collectionName}>{s.collectionName}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Method selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Method
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {METHODS.map(m => (
                <MethodBadge key={m} method={m} selected={method === m} onClick={setMethod} />
              ))}
            </div>
          </div>

          {/* Document ID (optional) */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Document ID <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(optional — for single-doc operations)</span>
            </label>
            <input
              className="input-glass"
              placeholder="e.g. 507f1f77bcf86cd799439011"
              value={docId}
              onChange={e => setDocId(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
            />
          </div>

          {/* URL preview */}
          {url && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
            }}>
              <code style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', flex: 1 }}>
                <span style={{ color: METHOD_COLORS[method]?.text }}>{method}</span>{' '}
                {url}
              </code>
              <CopyButton text={url} label="" />
            </div>
          )}

          {/* Tabs: Query Params / Body / Snippets */}
          <div>
            <div style={{ display: 'flex', gap: '2px', marginBottom: '14px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              {[
                { id: 'params', label: 'Params' },
                { id: 'body', label: 'Body', disabled: ['GET','DELETE'].includes(method) },
                { id: 'snippets', label: 'Code', disabled: !url },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  style={{
                    flex: 1,
                    padding: '7px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-main)' : tab.disabled ? 'var(--text-subtle)' : 'var(--text-muted)',
                    cursor: tab.disabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Query Params */}
            {activeTab === 'params' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {queryParams.map((p, i) => (
                  <QueryParamRow key={i} param={p} index={i} onChange={handleParamChange} onRemove={handleRemoveParam} />
                ))}
                <button
                  onClick={handleAddParam}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--accent-neon)', cursor: 'pointer', fontSize: '0.82rem', padding: '4px 0' }}
                >
                  <Plus size={14} /> Add Parameter
                </button>
              </div>
            )}

            {/* Body */}
            {activeTab === 'body' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>JSON Body</span>
                  <CopyButton text={body} />
                </div>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={10}
                  spellCheck={false}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.83rem',
                    lineHeight: 1.7,
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,240,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-glass)'}
                />
              </div>
            )}

            {/* Code Snippets */}
            {activeTab === 'snippets' && (
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {['curl', 'fetch', 'axios'].map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSnippet(s)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${activeSnippet === s ? 'rgba(0,240,255,0.4)' : 'var(--border-glass)'}`,
                        background: activeSnippet === s ? 'var(--accent-neon-dim)' : 'transparent',
                        color: activeSnippet === s ? 'var(--accent-neon)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-main)',
                    overflowX: 'auto',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}>
                    {snippets[activeSnippet] || ''}
                  </pre>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <CopyButton text={snippets[activeSnippet] || ''} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={isLoading || !selectedProjectId || !selectedCollection}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.95rem',
              padding: '13px',
              opacity: (isLoading || !selectedProjectId || !selectedCollection) ? 0.6 : 1,
              cursor: (isLoading || !selectedProjectId || !selectedCollection) ? 'not-allowed' : 'pointer',
              gap: '10px',
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} />
                Sending...
              </>
            ) : (
              <>
                <Play size={17} />
                Send Request
              </>
            )}
          </button>
        </GlassCard>

        {/* ── RIGHT PANEL: Response Viewer ── */}
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileJson size={16} color="var(--accent-neon)" /> Response
            </h2>
            {response && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Status badge */}
                <span
                  className={statusClass(response.status)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid',
                  }}
                >
                  {response.status} {response.statusText}
                </span>

                {/* Response time */}
                {responseTime !== null && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    {responseTime}ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid rgba(0,240,255,0.15)',
                borderTopColor: 'var(--accent-neon)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Sending request...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !response && (
            <EmptyState
              icon={<Terminal size={32} color="var(--accent-neon)" />}
              title="No response yet"
              description="Configure your request on the left and click Send Request to see the response here."
            />
          )}

          {/* Response content */}
          {!isLoading && response && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: 0 }}>

              {/* Headers toggle */}
              <div>
                <button
                  onClick={() => setShowHeaders(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: '0.8rem', padding: '0',
                    marginBottom: showHeaders ? '8px' : '0',
                  }}
                >
                  <ChevronDown size={14} style={{ transform: showHeaders ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  Response Headers ({Object.keys(response.headers).length})
                </button>
                {showHeaders && (
                  <div className="code-block" style={{ fontSize: '0.75rem' }}>
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k}><span style={{ color: '#60a5fa' }}>{k}</span>: {v}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Response body */}
              <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Response Body</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <CopyButton text={formattedResponse} label="Copy Response" />
                    <CopyButton text={snippets.curl || ''} label="Copy cURL" />
                  </div>
                </div>

                <pre
                  dangerouslySetInnerHTML={{ __html: syntaxHighlight(formattedResponse) }}
                  style={{
                    margin: 0,
                    padding: '16px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1.75,
                    overflowY: 'auto',
                    maxHeight: '460px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                />
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default ApiPlayground;
