import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../store/slices/projectSlice';
import { fetchSchemas } from '../store/slices/schemaSlice';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import { Play, ChevronDown, Copy, Check, Clock, Terminal, Plus, Minus, FileJson, Send, Zap } from 'lucide-react';
import './ApiPlayground.css';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_COLORS = {
  GET:    { text: '#3fb950', bg: 'rgba(63,185,80,0.1)',   border: 'rgba(63,185,80,0.3)' },
  POST:   { text: '#388bfd', bg: 'rgba(56,139,253,0.1)',  border: 'rgba(56,139,253,0.3)' },
  PUT:    { text: '#d29922', bg: 'rgba(210,153,34,0.1)',  border: 'rgba(210,153,34,0.3)' },
  PATCH:  { text: '#bc8cff', bg: 'rgba(188,140,255,0.1)', border: 'rgba(188,140,255,0.3)' },
  DELETE: { text: '#f85149', bg: 'rgba(248,81,73,0.1)',  border: 'rgba(248,81,73,0.3)' },
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
const formatJSON = (data) => { try { return JSON.stringify(data, null, 2); } catch { return String(data); } };

const syntaxHighlight = (json) => {
  if (typeof json !== 'string') json = formatJSON(json);
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = 'color: #bc8cff';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'color: #388bfd' : 'color: #3fb950';
      } else if (/true|false/.test(match)) {
        cls = 'color: #d29922';
      } else if (/null/.test(match)) {
        cls = 'color: #f85149';
      }
      return `<span style="${cls}">${match}</span>`;
    });
};

const buildURL = (baseUri, projectId, collection, docId, queryParams) => {
  let url = `${baseUri}/api/data/${projectId}/${collection}`;
  if (docId.trim()) url += `/${docId.trim()}`;
  const qp = queryParams.filter(p => p.key.trim());
  if (qp.length > 0) url += '?' + qp.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
  return url;
};

const buildCurl = (method, url, apiKey, body) => {
  let cmd = `curl -X ${method} '${url}' \\\n  -H 'Authorization: Bearer ${apiKey}' \\\n  -H 'Content-Type: application/json'`;
  if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim() && body.trim() !== '{}') cmd += ` \\\n  -d '${body.trim()}'`;
  return cmd;
};

const buildFetch = (method, url, apiKey, body) => {
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  return `fetch('${url}', {\n  method: '${method}',\n  headers: {\n    'Authorization': 'Bearer ${apiKey}',\n    'Content-Type': 'application/json',\n  },${hasBody ? `\n  body: JSON.stringify(${body.trim()}),` : ''}\n})\n  .then(res => res.json())\n  .then(console.log);`;
};

const buildAxios = (method, url, apiKey, body) => {
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  return `import axios from 'axios';\n\nconst response = await axios.${method.toLowerCase()}('${url}'${hasBody ? `, ${body.trim()}` : ''}, {\n  headers: { 'Authorization': 'Bearer ${apiKey}' }\n});\nconsole.log(response.data);`;
};

const MethodBadge = ({ method, selected, onClick }) => {
  const cfg = METHOD_COLORS[method];
  return (
    <button
      onClick={() => onClick(method)}
      className="method-badge"
      style={{
        border: `1px solid ${selected ? cfg.border : 'var(--border)'}`,
        background: selected ? cfg.bg : 'transparent',
        color: selected ? cfg.text : 'var(--text-muted)',
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
    <button onClick={handleCopy} className={`copy-btn ${copied ? 'copy-btn--copied' : 'copy-btn--default'}`}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  );
};

const QueryParamRow = ({ param, index, onChange, onRemove }) => (
  <div className="playground__param-row">
    <input className="input-glass" placeholder="key" value={param.key}
      onChange={e => onChange(index, 'key', e.target.value)} style={{ flex: 1, fontSize: '0.8rem' }} />
    <input className="input-glass" placeholder="value" value={param.value}
      onChange={e => onChange(index, 'value', e.target.value)} style={{ flex: 2, fontSize: '0.8rem' }} />
    <button onClick={() => onRemove(index)} className="playground__param-remove">
      <Minus size={13} />
    </button>
  </div>
);

const ApiPlayground = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items: projects } = useSelector(s => s.projects);
  const { items: schemas } = useSelector(s => s.schemas);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [method, setMethod] = useState('GET');
  const [docId, setDocId] = useState('');
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [activeTab, setActiveTab] = useState('body');
  const [activeSnippet, setActiveSnippet] = useState('curl');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);
  useEffect(() => {
    if (selectedProjectId) { dispatch(fetchSchemas(selectedProjectId)); setSelectedCollection(''); }
  }, [selectedProjectId, dispatch]);
  useEffect(() => {
    if (['GET', 'DELETE'].includes(method) && activeTab === 'body') setActiveTab('params');
  }, [method]);

  const selectedProject = projects.find(p => p._id === selectedProjectId || p.id === selectedProjectId);
  const apiKey = selectedProject?.apiKey || '';
  const baseUri = import.meta.env.VITE_SERVER_URI || 'http://localhost:5000';
  const url = selectedProjectId && selectedCollection
    ? buildURL(baseUri, selectedProjectId, selectedCollection, docId, queryParams) : '';

  const handleAddParam = () => setQueryParams(prev => [...prev, { key: '', value: '' }]);
  const handleRemoveParam = (i) => setQueryParams(prev => prev.filter((_, idx) => idx !== i));
  const handleParamChange = (i, field, val) => setQueryParams(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const handleSend = useCallback(async () => {
    if (!url) return toast.error('Please select a project and collection first');
    if (!apiKey) return toast.error('No API key found for this project');
    setIsLoading(true); setResponse(null); setResponseTime(null);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const start = performance.now();
    try {
      const opts = { method, headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, signal: abortRef.current.signal };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        try { opts.body = JSON.stringify(JSON.parse(body)); } catch { return toast.error('Invalid JSON in request body'); }
      }
      const res = await fetch(url, opts);
      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);
      let data;
      const ct = res.headers.get('content-type') || '';
      data = ct.includes('application/json') ? await res.json() : await res.text();
      const headersObj = {};
      res.headers.forEach((v, k) => { headersObj[k] = v; });
      setResponse({ status: res.status, statusText: res.statusText, data, headers: headersObj });
    } catch (err) {
      if (err.name === 'AbortError') return;
      setResponseTime(Math.round(performance.now() - start));
      setResponse({ status: 0, statusText: 'Network Error', data: { error: err.message }, headers: {} });
      toast.error(`Request failed: ${err.message}`);
    } finally { setIsLoading(false); }
  }, [url, apiKey, method, body, toast]);

  useEffect(() => {
    const handler = (e) => { if (e.ctrlKey && e.key === 'Enter') handleSend(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSend]);

  const formattedResponse = response ? formatJSON(response.data) : '';
  const snippets = url ? { curl: buildCurl(method, url, apiKey, body), fetch: buildFetch(method, url, apiKey, body), axios: buildAxios(method, url, apiKey, body) } : {};

  return (
    <div className="playground">
      <div className="playground__header">
        <Terminal size={26} color="var(--accent-blue)" />
        <div>
          <h1 className="playground__title">API Playground</h1>
          <p className="playground__subtitle">
            Test your generated endpoints in real-time · Press{' '}
            <kbd className="playground__kbd">Ctrl+↵</kbd> to send
          </p>
        </div>
      </div>

      <div className="playground__layout">
        {/* LEFT PANEL */}
        <GlassCard className="playground__panel">
          <h2 className="playground__panel-title"><Send size={15} color="var(--accent-blue)" /> Request</h2>

          <div className="playground__field">
            <label>Project</label>
            <div className="playground__select-wrap">
              <select className="input-glass" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} style={{ cursor: 'pointer', paddingRight: '34px' }}>
                <option value="">Select a project...</option>
                {projects.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.projectName || p.name}</option>)}
              </select>
              <ChevronDown size={14} className="playground__select-icon" />
            </div>
            {selectedProject && (
              <p className="playground__api-loaded"><Zap size={10} color="var(--accent-green)" /> API key loaded automatically</p>
            )}
          </div>

          <div className="playground__field">
            <label>Collection</label>
            <div className="playground__select-wrap">
              <select className="input-glass" value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}
                disabled={!selectedProjectId} style={{ cursor: selectedProjectId ? 'pointer' : 'not-allowed', opacity: !selectedProjectId ? 0.5 : 1, paddingRight: '34px' }}>
                <option value="">Select a collection...</option>
                {schemas.map(s => <option key={s._id} value={s.collectionName}>{s.collectionName}</option>)}
              </select>
              <ChevronDown size={14} className="playground__select-icon" />
            </div>
          </div>

          <div className="playground__field">
            <label>Method</label>
            <div className="playground__methods">
              {METHODS.map(m => <MethodBadge key={m} method={m} selected={method === m} onClick={setMethod} />)}
            </div>
          </div>

          <div className="playground__field">
            <label>Document ID <span className="playground__doc-id-hint">(optional)</span></label>
            <input className="input-glass" placeholder="e.g. 507f1f77bcf86cd799439011" value={docId}
              onChange={e => setDocId(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
          </div>

          {url && (
            <div className="playground__url-bar">
              <code className="playground__url-code">
                <span style={{ color: METHOD_COLORS[method]?.text }}>{method}</span>{' '}{url}
              </code>
              <CopyButton text={url} label="" />
            </div>
          )}

          <div>
            <div className="playground__tabs" style={{ marginBottom: '12px' }}>
              {[
                { id: 'params', label: 'Params' },
                { id: 'body', label: 'Body', disabled: ['GET','DELETE'].includes(method) },
                { id: 'snippets', label: 'Code', disabled: !url },
              ].map(tab => (
                <button key={tab.id} onClick={() => !tab.disabled && setActiveTab(tab.id)} disabled={tab.disabled}
                  className={`playground__tab ${activeTab === tab.id ? 'playground__tab--active' : tab.disabled ? 'playground__tab--disabled' : 'playground__tab--inactive'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'params' && (
              <div className="playground__params">
                {queryParams.map((p, i) => <QueryParamRow key={i} param={p} index={i} onChange={handleParamChange} onRemove={handleRemoveParam} />)}
                <button onClick={handleAddParam} className="playground__add-param"><Plus size={13} /> Add Parameter</button>
              </div>
            )}

            {activeTab === 'body' && (
              <div>
                <div className="playground__body-header">
                  <span className="playground__body-label">JSON Body</span>
                  <CopyButton text={body} />
                </div>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} spellCheck={false} className="playground__body-textarea" />
              </div>
            )}

            {activeTab === 'snippets' && (
              <div>
                <div className="playground__snippet-tabs">
                  {['curl', 'fetch', 'axios'].map(s => (
                    <button key={s} onClick={() => setActiveSnippet(s)}
                      className={`playground__snippet-tab ${activeSnippet === s ? 'playground__snippet-tab--active' : 'playground__snippet-tab--inactive'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="playground__snippet-wrap">
                  <pre className="playground__pre">{snippets[activeSnippet] || ''}</pre>
                  <div className="playground__snippet-copy"><CopyButton text={snippets[activeSnippet] || ''} /></div>
                </div>
              </div>
            )}
          </div>

          <button className="btn-primary playground__send" onClick={handleSend}
            disabled={isLoading || !selectedProjectId || !selectedCollection}
            style={{ opacity: (isLoading || !selectedProjectId || !selectedCollection) ? 0.55 : 1, cursor: (isLoading || !selectedProjectId || !selectedCollection) ? 'not-allowed' : 'pointer' }}>
            {isLoading ? (
              <><div className="animate-spin" style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Sending...</>
            ) : (
              <><Play size={16} /> Send Request</>
            )}
          </button>
        </GlassCard>

        {/* RIGHT PANEL */}
        <GlassCard className="playground__panel">
          <div className="playground__response-header">
            <h2 className="playground__panel-title"><FileJson size={15} color="var(--accent-blue)" /> Response</h2>
            {response && (
              <div className="playground__response-meta">
                <span className={`playground__status-badge ${statusClass(response.status)}`}>
                  {response.status} {response.statusText}
                </span>
                {responseTime !== null && (
                  <span className="playground__time"><Clock size={11} /> {responseTime}ms</span>
                )}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="playground__spinner">
              <div className="playground__spinner-ring" />
              <p className="playground__spinner-text">Sending request...</p>
            </div>
          )}

          {!isLoading && !response && (
            <EmptyState
              icon={<Terminal size={28} color="var(--accent-blue)" />}
              title="No response yet"
              description="Configure your request on the left and click Send Request to see the response here."
            />
          )}

          {!isLoading && response && (
            <div className="playground__response-body">
              <div>
                <button onClick={() => setShowHeaders(v => !v)} className="playground__headers-btn" style={{ marginBottom: showHeaders ? '8px' : '0' }}>
                  <ChevronDown size={13} style={{ transform: showHeaders ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  Response Headers ({Object.keys(response.headers).length})
                </button>
                {showHeaders && (
                  <div className="code-block" style={{ fontSize: '0.73rem' }}>
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k}><span style={{ color: 'var(--accent-blue)' }}>{k}</span>: {v}</div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <div className="playground__response-label-row">
                  <span className="playground__response-label">Response Body</span>
                  <div className="playground__response-actions">
                    <CopyButton text={formattedResponse} label="Copy Response" />
                    <CopyButton text={snippets.curl || ''} label="Copy cURL" />
                  </div>
                </div>
                <pre className="playground__response-pre" dangerouslySetInnerHTML={{ __html: syntaxHighlight(formattedResponse) }} />
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default ApiPlayground;
