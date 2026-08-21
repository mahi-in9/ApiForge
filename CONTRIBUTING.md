# 🤝 Contributing to ApiForge

First off — thank you for taking the time to contribute! ApiForge is an open project and every contribution, from bug reports to new features, makes it better for everyone.

Please read this guide carefully before opening a pull request.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Style](#code-style)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## 📜 Code of Conduct

By participating in this project you agree to abide by the standard open-source norms:

- Be respectful and inclusive.
- Provide constructive feedback.
- Focus on the problem, not the person.
- Welcome newcomers and help them get up to speed.

---

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB | v6+ (or a MongoDB Atlas URI) |
| Git | Any recent version |

### Fork & Clone

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/ApiForge.git
cd ApiForge

# 2. Add the upstream remote so you can pull in future changes
git remote add upstream https://github.com/yourusername/ApiForge.git
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start the dev server (uses `nodemon` for hot-reload):

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

Open a **new terminal** in the project root:

```bash
cd frontend
npm install
npm run dev
```

The React app will be available at `http://localhost:5173`.

> **Tip:** Keep both terminals running side-by-side during development.

---

## 🗂️ Project Structure

```
ApiForge/
├── backend/
│   ├── server.js               # Express app entry point
│   └── src/
│       ├── config/             # DB connection & environment helpers
│       ├── controllers/        # Route handler logic
│       ├── middlewares/        # Auth, API key, dynamic validator
│       ├── models/             # Mongoose models (User, Project, Schema)
│       ├── routes/             # Express routers
│       └── services/           # Business logic & reusable utilities
│
├── frontend/
│   └── src/
│       ├── api/                # Axios instances & API call functions
│       ├── components/         # Reusable React components
│       ├── context/            # React context providers
│       ├── pages/              # Page-level components (routes)
│       ├── store/              # Redux Toolkit slices & store config
│       ├── App.jsx             # Root component & router setup
│       └── index.css           # Global styles & Tailwind directives
│
├── screenshot/                 # Platform preview images (README only)
├── README.md
└── CONTRIBUTING.md             # ← You are here
```

---

## 🔄 Development Workflow

1. **Sync your fork** before starting any work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch** from `main` (see [Branching Strategy](#branching-strategy)).

3. **Make your changes** — keep them focused and atomic.

4. **Test manually** using the local dev servers.

5. **Commit** following the [commit message guidelines](#commit-message-guidelines).

6. **Push** your branch to your fork and **open a Pull Request**.

---

## 🌿 Branching Strategy

Use the following naming conventions:

| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feat/<short-description>` | `feat/add-rate-limiting` |
| Bug fix | `fix/<short-description>` | `fix/jwt-expiry-refresh` |
| Documentation | `docs/<short-description>` | `docs/update-contributing` |
| Refactor | `refactor/<short-description>` | `refactor/dynamic-router` |
| Chore / DX | `chore/<short-description>` | `chore/upgrade-vite` |

---

## ✍️ Commit Message Guidelines

ApiForge follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:**
```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons — no logic change |
| `refactor` | Code restructuring — no feature or fix |
| `perf` | Performance improvements |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency updates, tooling |

**Examples:**

```
feat(backend): add rate limiting middleware to dynamic API routes
fix(frontend): resolve Redux state desync on project switch
docs: add CONTRIBUTING guide
refactor(backend): extract foreign key validation into dedicated service
```

---

## 🎨 Code Style

### Backend (Node.js / Express)

- Use `async/await` — avoid raw `.then()` chains.
- Always wrap async route handlers in `try/catch` and forward errors to `next(err)`.
- Keep controllers thin — move business logic into `src/services/`.
- Environment variables must be read via `process.env` and never hard-coded.
- Mongoose models live in `src/models/`; native MongoDB driver calls live in services/controllers for dynamic collections.

### Frontend (React / Redux)

- Functional components with hooks only — no class components.
- Global server state lives in Redux slices (`src/store/`); local UI state uses `useState`.
- API calls are centralised in `src/api/` — **do not** call `fetch`/`axios` directly inside components.
- Use Tailwind utility classes for styling. Avoid inline `style` props unless strictly necessary.
- React Flow (`@xyflow/react`) nodes and edges should be managed through the dedicated Visual Studio slice.

### General

- No console statements left in committed code (`console.log`, `console.error`, etc.).
- All new `.env` variables must be documented in the relevant `.env.example` (create one if it does not exist).
- Keep files under ~300 lines; split into smaller modules if a file grows beyond that.

---

## 📬 Submitting a Pull Request

1. Ensure your branch is up to date with `upstream/main`.
2. Open a PR against the `main` branch of the original repository.
3. Fill in the PR description with:
   - **What** changed and **why**.
   - Steps to test / reproduce (if applicable).
   - Screenshots or screen recordings for UI changes.
4. Link any related issues using GitHub keywords (`Closes #123`, `Fixes #456`).
5. A maintainer will review your PR. Please be responsive to feedback — PRs with no activity for 14 days may be closed.

### PR Checklist

Before marking your PR as ready for review, confirm:

- [ ] The local dev servers (`backend` + `frontend`) run without errors.
- [ ] No `console.log` statements are left in the code.
- [ ] New `.env` variables are added to a `.env.example` file.
- [ ] Commit messages follow the Conventional Commits format.
- [ ] UI changes include a screenshot in the PR description.

---

## 🐛 Reporting Bugs

Open a [GitHub Issue](https://github.com/yourusername/ApiForge/issues/new) and include:

- **Description**: What happened vs. what you expected.
- **Steps to reproduce**: Numbered, minimal steps.
- **Environment**: OS, Node.js version, browser (for frontend bugs).
- **Logs / Screenshots**: Any relevant error output from the terminal or browser console.

---

## 💡 Requesting Features

Open a [GitHub Issue](https://github.com/yourusername/ApiForge/issues/new) with the `enhancement` label and include:

- **Problem statement**: What limitation or pain point does this address?
- **Proposed solution**: Your idea for how to solve it.
- **Alternatives considered**: Any other approaches you thought about.

---

<div align="center">
  <p>Thank you for helping make ApiForge better. Happy forging! 🔥</p>
</div>
