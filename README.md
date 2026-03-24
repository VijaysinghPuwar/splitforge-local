# SplitForge Local

**A local-first desktop app for splitting large text files into numbered chunks.**

Paste or import any text, set a character limit, and export numbered `.txt` files — all processed on your machine with zero network access.

---

## Why Tauri?

Browser-only Next.js apps cannot access the local file system, pick native folders, or write files directly. Tauri solves this:

- **Native folder picker** — the OS-level dialog, not a browser workaround
- **Direct file-system writes** — Rust backend handles all I/O with path-traversal protection
- **Zero cloud dependency** — no API calls, no uploads, no analytics
- **Cross-platform binaries** — `.app` on macOS, `.exe`/`.msi` on Windows, from the same codebase
- **Small bundle size** — Tauri uses the system WebView, not a bundled Chromium

The Next.js layer handles the UI; Tauri handles the OS integration. The two communicate through strongly-typed Rust commands.

---

## Features

- **Exact split mode** — every file contains exactly N characters (last file may be shorter)
- **Smart split mode** — prefers paragraph / line breaks near the limit, never exceeds it
- **Live character count** and estimated output file count as you type
- **Native folder picker** for the output directory
- **Overwrite protection** — overwrite, skip existing, or auto-create a timestamped subfolder
- **Optional export subfolder** — `splitforge-export-2026-03-24-001/`
- **Optional manifest.json** — records input size, split config, and file list
- **Chunk preview** — inspect the first 3 chunks before committing to an export
- **Copy chunk** — copy any preview chunk to the clipboard
- **Open output folder** — opens Finder / Explorer after export
- **Settings persistence** — last-used settings survive app restarts
- **Drag & drop** — drop a `.txt` file onto the text area to import
- **Unicode-safe** — emoji, CJK, and accented characters each count as 1 character
- **Progress indicator** with cancellation support for large exports

---

## Project Structure

```
splitforge-local/               ← monorepo root (npm workspaces)
├── apps/
│   ├── desktop/                ← Tauri + Next.js desktop app  [NOT on Vercel]
│   │   ├── src-tauri/          ← Rust backend (file I/O, security)
│   │   └── src/                ← Next.js UI + Tauri-specific lib/
│   └── web/                    ← Next.js landing page          [Vercel target]
│       └── src/app/            ← Self-contained, zero Tauri deps
├── packages/
│   └── core/                   ← Shared pure logic (no I/O, fully tested)
│       ├── src/                ← textCounter, splitter, fileNaming
│       └── __tests__/
├── vercel.json                 ← Tells Vercel to build apps/web only
├── .eslintrc.js
├── .prettierrc.json
├── .gitignore
├── LICENSE
└── README.md
```

### Architecture separation

| Layer | Location | Vercel? | Tauri? |
|-------|----------|---------|--------|
| Shared logic | `packages/core` | No dependency | No dependency |
| Desktop UI + FS bridge | `apps/desktop` | ✗ Never | ✓ Required |
| Landing page | `apps/web` | ✓ Target | ✗ Zero imports |

`apps/web` is **fully self-contained** — it has its own `package.json` with all dependencies declared directly and imports nothing from `apps/desktop` or Tauri packages.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | bundled with Node |
| Rust | ≥ 1.77 | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |

**macOS only:** `xcode-select --install`

**Windows only:** WebView2 (ships with Windows 11; install via Microsoft Edge on Windows 10)

---

## Local Development

### 1. Install all dependencies

```bash
git clone https://github.com/VijaysinghPuwar/splitforge-local.git
cd splitforge-local
npm install
```

### 2. Run the desktop app

```bash
npm run tauri:dev
# Starts Next.js on :3000 + opens the Tauri window
```

### 3. Run the web landing page

```bash
npm run dev:web
# → http://localhost:3000
```

### 4. Run just the desktop UI in the browser (no Tauri)

```bash
npm run dev:desktop
# → http://localhost:3000
# File-system features will show errors — they require the Tauri runtime
```

---

## Tests

```bash
npm test                # run all core tests
npm run test:coverage   # with coverage report
```

Tests live in `packages/core/__tests__/` and cover character counting, exact splits, smart splits, edge cases, and file naming.

---

## Building Desktop Binaries

```bash
npm run tauri:build
```

Output:

| Platform | Path |
|----------|------|
| macOS `.dmg` | `apps/desktop/src-tauri/target/release/bundle/dmg/` |
| macOS `.app` | `apps/desktop/src-tauri/target/release/bundle/macos/` |
| Windows `.msi` | `apps/desktop/src-tauri/target/release/bundle/msi/` |
| Windows installer | `apps/desktop/src-tauri/target/release/bundle/nsis/` |

> Generating icons: `cd apps/desktop && npx tauri icon path/to/icon-1024.png`

---

## Deploying the Web Landing Page to Vercel

`apps/web` is a fully self-contained Next.js app with no workspace or Tauri dependencies.

### Exact Vercel project settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js (auto-detected) |
| **Build Command** | `next build` (default) |
| **Install Command** | `npm install` (default) |
| **Output Directory** | `.next` (default) |

**Step-by-step:**
1. Go to [vercel.com/new](https://vercel.com/new) → Import Git repository → `VijaysinghPuwar/splitforge-local`
2. In **Configure Project**, set **Root Directory** to `apps/web`
3. Leave all other settings at their defaults — Vercel auto-detects Next.js
4. Deploy

Vercel will install only the dependencies in `apps/web/package.json`. The desktop app and Tauri packages are never touched.

### Vercel CLI

```bash
cd apps/web
npx vercel          # follow prompts; set project root to apps/web
npx vercel --prod   # deploy to production
```

---

## Linting & Formatting

```bash
npm run lint          # ESLint across all workspaces
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
npm run type-check    # TypeScript (root tsconfig)
```

---

## Commit conventions

```
feat: add drag-and-drop file import
fix: correct off-by-one in smart split boundary search
chore: update Tauri to 2.1
docs: add Windows build instructions
test: add Unicode edge cases for splitter
```

---

## Contributing

1. Fork → feature branch → pull request
2. Tests must pass: `npm test`
3. No Tauri imports in `apps/web` or `packages/core`

---

## License

MIT — see [LICENSE](./LICENSE).
