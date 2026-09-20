import React, { useState, useMemo } from 'react';
import { BookOpen, Search, ChevronRight, Database, GitGraph, Play, Zap, HelpCircle, CheckSquare, Terminal, Code2, Shield, Star } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import './Documentation.css';

// ─── Documentation content ────────────────────────────────────────────────────

const DOCS = [
  {
    id: 'quick-start',
    icon: <Zap size={18} color="#3fb950" />,
    title: 'Quick Start',
    content: `
## Get Your First API Running in 2 Minutes

### Step 1: Create a Project
Navigate to the **Dashboard** and create a new project. Each project gets a unique API key that authenticates all requests.

### Step 2: Define a Collection
Go to **Schema Builder**, select your project, and create a collection (e.g., \`users\`). Add fields:

| Field | Type | Options |
|-------|------|---------|
| name  | String | Required, min 2 chars |
| email | String | Required, Unique |
| age   | Number | Min: 0, Max: 120 |

### Step 3: Use Your API
Once saved, your endpoint is live immediately:

\`\`\`
GET  /api/data/{projectId}/users
POST /api/data/{projectId}/users
PUT  /api/data/{projectId}/users/:id
DELETE /api/data/{projectId}/users/:id
\`\`\`

Include your API key in every request:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  http://localhost:5000/api/data/{projectId}/users
\`\`\`

### Step 4: Test in the Playground
Use the built-in **API Playground** to make requests without leaving API Forge.
    `
  },
  {
    id: 'relationships',
    icon: <GitGraph size={18} color="#bc8cff" />,
    title: 'Relationships',
    content: `
## Collection Relationships

API Forge supports four relationship types between collections.

### Relationship Types

| Type | Symbol | Example |
|------|--------|---------|
| One-to-One | 1:1 | User ↔ Profile |
| One-to-Many | 1:N | User → Orders |
| Many-to-One | N:1 | Orders → User |
| Many-to-Many | M:N | Products ↔ Tags |

### Creating a Relationship

1. Open a collection in the **Schema Builder**
2. Expand the **Relationships** section
3. Fill in the form:
   - **Name**: unique identifier (e.g., \`user_orders\`)
   - **Type**: 1:N / M:N / etc.
   - **Source Field**: the field in this collection holding the reference
   - **Target Collection**: the other collection
   - **On Delete Strategy**: what happens when the parent is deleted

### Deletion Strategies

| Strategy | Behavior |
|----------|----------|
| **Restrict** | Block deletion if related records exist |
| **Cascade** | Delete all related records automatically |
| **Set Null** | Set the foreign key to null on related records |

### Populating Related Data

Use the \`?populate=\` query parameter to fetch related documents inline:

\`\`\`bash
# Fetch orders with the related user object embedded
GET /api/data/{projectId}/orders?populate=user_orders
\`\`\`

Response:
\`\`\`json
{
  "data": [
    {
      "_id": "...",
      "item": "Widget",
      "userId": "...",
      "user_orders": {
        "_id": "...",
        "name": "Alice",
        "email": "alice@example.com"
      }
    }
  ]
}
\`\`\`

### Visualizing Relationships

The **Visual Schema Designer** displays relationships as edges between collection nodes:
- **Green edges** = 1:N (one-to-many)
- **Blue edges** = 1:1 (one-to-one)
- **Amber edges** = N:1 (many-to-one)
- **Purple dashed edges** = M:N (many-to-many)
    `
  },
  {
    id: 'schema-designer',
    icon: <Database size={18} color="#388bfd" />,
    title: 'Schema Designer',
    content: `
## Visual Schema Designer

The Visual Schema Designer gives you a canvas view of your entire data model.

### Supported Field Types

| Type | Description | Validation |
|------|-------------|------------|
| **String** | Text values | minLength, maxLength, enum |
| **Number** | Integer or float | min, max |
| **Boolean** | true/false | — |
| **Date** | ISO 8601 date strings | Date parse check |
| **Array** | JSON arrays | Array.isArray check |
| **Object** | Nested JSON objects | typeof object check |
| **ObjectId** | MongoDB reference ID | 24-char hex + FK check |
| **GeoPoint** | GeoJSON Point | \`{ type: "Point", coordinates: [lng, lat] }\` |
| **Address** | Structured address | \`{ street, city, state, zip }\` |

### Field Options

- **Required** (\`*\`) — Field must be present on create/update
- **Unique** (🔑) — Enforced at DB index level; duplicate values rejected
- **Indexed** (⚡) — Creates a MongoDB index for faster queries
- **Default Value** — Server-side default if field is absent
- **Enum Values** — Comma-separated allowed values (String only)
- **Min/Max Length** — Character limits for Strings
- **Min/Max** — Numeric range constraints

### Canvas Features

- **Drag nodes** to rearrange — positions are saved automatically
- **Auto Layout** button resets to a clean grid
- **Feature Panel** (left sidebar) lists all field types
- **Guide Panel** (right sidebar) has query examples
- **MiniMap** for navigating large schemas
    `
  },
  {
    id: 'testing-apis',
    icon: <Play size={18} color="#3fb950" />,
    title: 'Testing APIs',
    content: `
## API Playground

The built-in playground lets you test every endpoint without deploying anything.

### Making Requests

1. Select your **Project** — the API key is loaded automatically
2. Select a **Collection**
3. Choose a **Method** (GET, POST, PUT, PATCH, DELETE)
4. Optionally enter a **Document ID** for single-record operations
5. Add **Query Parameters** using the Params tab
6. Edit the **JSON Body** for POST/PUT/PATCH requests
7. Click **Send Request** (or press Ctrl+Enter)

### Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| \`page\` | Page number | \`?page=2\` |
| \`limit\` | Records per page | \`?limit=20\` |
| \`sort\` | Sort by field | \`?sort=createdAt:desc\` |
| \`populate\` | Embed related docs | \`?populate=user_orders\` |
| Any field name | Filter by value | \`?status=active\` |

### Code Snippets

Switch to the **Code** tab to get ready-to-copy snippets in:
- **cURL** — command line
- **Fetch** — browser / Node.js
- **Axios** — JavaScript library

### Response Information

- **Status Code** — color-coded badge (green=2xx, amber=3xx, red=4xx/5xx)
- **Response Time** — measured in milliseconds
- **Response Headers** — collapsible section
- **Syntax-highlighted JSON** — for readability
    `
  },
  {
    id: 'best-practices',
    icon: <Star size={18} color="#d29922" />,
    title: 'Best Practices',
    content: `
## Best Practices

### Schema Design

✅ **Use lowercase, underscore-separated collection names** — e.g., \`order_items\` not \`OrderItems\`

✅ **Index fields you filter on** — turn on "Indexed" for fields used in query filters

✅ **Mark identifying fields as Unique** — email, username, SKU, etc.

✅ **Always set a deletion strategy** — default is RESTRICT (safest)

✅ **Use enum validation for status fields** — e.g., \`active,inactive,pending\`

### API Key Security

⚠️ Never expose your API key in frontend JavaScript that's committed to a public repo.

⚠️ Use environment variables (\`.env\`) to store API keys.

✅ Rotate your API key periodically via the Dashboard.

### Performance

✅ Use **pagination** — always include \`?limit=\` in production queries

✅ Use **sort + indexes** together — ensure the sort field is indexed

✅ Use **populate sparingly** — each \`?populate=\` adds a MongoDB \$lookup stage

### Relationship Design

✅ For 1:N relationships, store the parent ID on the child (e.g., \`userId\` on orders)

✅ For M:N relationships, store an array of IDs on the "main" side

✅ Use the RESTRICT deletion strategy until you're confident cascade is safe
    `
  },
  {
    id: 'faq',
    icon: <HelpCircle size={18} color="#8b949e" />,
    title: 'FAQ',
    content: `
## Frequently Asked Questions

**Q: Can I add a field to an existing collection without breaking data?**

Yes — adding new fields is always safe. Existing documents simply won't have that field unless it has a required constraint. Use the Edit mode in Schema Builder to add fields.

**Q: Can I delete a field from an existing collection?**

You can remove it from the schema definition, but the data remains in existing documents. This is intentional — API Forge never automatically drops data. You'd need to update existing documents manually via the API.

**Q: Will changing a field type break anything?**

Yes, potentially. Changing \`String → Number\` on a field that has existing string data will cause validation failures. Change field types only before data is inserted.

**Q: Can I use API Forge with a frontend like React or Next.js?**

Absolutely! Use your API key in a server-side function (API route, Edge Function) to keep it secure, then call your API Forge endpoints like any REST API.

**Q: Is the data stored permanently?**

Yes. API Forge uses MongoDB — your data persists as long as your MongoDB instance is running.

**Q: How does the Playground know my API key?**

When you select a project in the Playground, the API key is pulled from the project data already loaded in the app. It's pre-filled in the Authorization header automatically.

**Q: What happens if I delete a project?**

Projects are soft-deleted (set to inactive). The schema metadata and tenant data remain in the database but the project becomes inaccessible via the API.

**Q: Can I have relationships across projects?**

No. Relationships are scoped within a single project. Cross-project data access is not supported.
    `
  },
];

// ─── Markdown renderer (simple, no external lib) ──────────────────────────────
const inlineFormat = (text) =>
  text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-main);font-weight:600">$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-dark);padding:2px 6px;border:1px solid var(--border);border-radius:4px;font-family:var(--font-mono);font-size:0.85em;color:var(--accent-blue)">$1</code>')
    .replace(/✅/g, '<span style="color:var(--accent-green)">✅</span>')
    .replace(/⚠️/g, '<span style="color:var(--accent-amber)">⚠️</span>');

const renderContent = (markdown) => {
  const lines = markdown.split('\n');
  const elements = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines = [];
  let tableRows = [];

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="code-block docs-code-block">
            <pre style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
              {codeLines.join('\n')}
            </pre>
          </div>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Table
    if (line.trim().startsWith('|')) {
      tableRows.push(line);
      i++;
      continue;
    } else if (tableRows.length > 0) {
      const headers = tableRows[0].split('|').slice(1, -1).map(h => h.trim());
      const dataRows = tableRows.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
      elements.push(
        <div key={`table-${i}`} className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="docs-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="docs-td"
                      dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }

    // Headings
    if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${i}`} className="docs-h2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} className="docs-h3">{line.slice(4)}</h3>);
    } else if (line.trim() === '') {
      // skip
    } else {
      elements.push(
        <p key={`p-${i}`} className="docs-p"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
        />
      );
    }

    i++;
  }

  return elements;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Documentation = () => {
  const [activeId, setActiveId] = useState('quick-start');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return DOCS;
    const q = search.toLowerCase();
    return DOCS.filter(d =>
      d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    );
  }, [search]);

  const activeDoc = DOCS.find(d => d.id === activeId) || filtered[0];

  return (
    <div className="docs">

      {/* Header */}
      <div className="docs__header">
        <BookOpen size={26} color="var(--accent-blue)" />
        <div>
          <h1 className="docs__title">Documentation</h1>
          <p className="docs__subtitle">Everything you need to master API Forge</p>
        </div>
      </div>

      <div className="docs__layout">

        {/* Sidebar */}
        <div className="docs__sidebar">
          <div className="docs__search-wrap">
            <Search size={13} className="docs__search-icon" />
            <input
              className="input-glass docs__search"
              placeholder="Search docs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <GlassCard style={{ padding: '6px' }}>
            {filtered.map(doc => (
              <button
                key={doc.id}
                onClick={() => { setActiveId(doc.id); setSearch(''); }}
                className={`docs__nav-btn ${activeId === doc.id ? 'docs__nav-btn--active' : ''}`}
              >
                {doc.icon}
                {doc.title}
                {activeId === doc.id && <ChevronRight size={14} className="docs__nav-icon-wrap" />}
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Content */}
        <GlassCard className="docs__content-card animate-fade-up" style={{ padding: '36px' }}>
          {activeDoc ? (
            <div>
              <div className="docs__content-header">
                <div className="docs__content-icon">
                  {activeDoc.icon}
                </div>
                <h1 className="docs__content-title">
                  {activeDoc.title}
                </h1>
              </div>
              {renderContent(activeDoc.content)}
            </div>
          ) : (
            <div className="docs__empty">
              No results for "{search}". Try a different search term.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Documentation;
