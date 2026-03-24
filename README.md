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
- **Optional export subfolder** — `splitforge-export-2026-03-23-001/`
- **Optional manifest.json** — records input size, split config, and file list
- **Chunk preview** — inspect the first 3 chunks before committing to an export
- **Copy chunk** — copy any preview chunk to the clipboard
- **Open output folder** — opens Finder / Explorer after export
- **Settings persistence** — last-used settings survive app restarts
- **Drag & drop** — drop a `.txt` file onto the text area to import
- **Unicode-safe** — emoji, CJK, and accented characters each count as 1 character
- **Progress indicator** with cancellation support for large exports
- **Dark mode** throughout

---

## Project Structure

```
splitforge-local/           ← monorepo root
├── apps/
│   ├── desktop/            ← Tauri + Next.js desktop app
│   │   ├── src-tauri/      ← Rust backend (file I/O, path security)
│   │   └── src/            ← Next.js UI
│   └── web/                ← Next.js landing page (Vercel-deployable)
├── packages/
│   └── core/               ← Shared pure logic (no I/O, no side-effects)
│       ├── src/
│       │   ├── textCounter.ts
│       │   ├── splitter.ts
│       │   ├── fileNaming.ts
│       │   └── index.ts
│       └── __tests__/      ← Unit tests
├── .eslintrc.js
├── .prettierrc.json
├── .gitignore
├── LICENSE
└── README.md
```

**`packages/core`** contains all text-splitting logic — pure TypeScript, no I/O, fully testable without Tauri.

**`apps/desktop`** is the full Tauri application. The `src/lib/tauri-bridge.ts` isolates all Tauri API calls so the rest of the code stays portable.

**`apps/web`** is the public landing page, deployable to Vercel. It imports from `packages/core` for any shared logic but has no Tauri dependency.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | bundled with Node |
| Rust | ≥ 1.77 | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Tauri CLI | v2 | installed as a dev dependency — `npx tauri` |

**macOS only:** Xcode Command Line Tools — `xcode-select --install`

**Windows only:** WebView2 (ships with Windows 11; available via Microsoft Edge installer on Windows 10)

---

## Local Development

### 1. Install dependencies

```bash
git clone https://github.com/VijaysinghPuwar/splitforge-local.git
cd splitforge-local
npm install
```

### 2. Run the desktop app (hot-reload)

```bash
npm run tauri:dev
```

This starts the Next.js dev server on `http://localhost:3000` and launches the Tauri window pointing at it. Changes to the UI update instantly without restarting Tauri.

### 3. Run the web landing page

```bash
npm run dev:web
# → http://localhost:3001
```

### 4. Run the desktop UI only (no Tauri)

```bash
npm run dev:desktop
# → http://localhost:3000
```

File-system features will not work in the browser, but the UI and logic are fully inspectable.

---

## Running Tests

```bash
npm test                      # run all tests
npm run test:coverage         # with coverage report
```

Tests live in `packages/core/__tests__/` and cover:

- `textCounter.ts` — Unicode-safe character counting
- `splitter.ts` — exact and smart split modes, edge cases, large inputs
- `fileNaming.ts` — file name generation, prefix sanitization, path validation

---

## Building Desktop Binaries

```bash
npm run tauri:build
```

Output locations:

| Platform | Path |
|----------|------|
| macOS `.app` | `apps/desktop/src-tauri/target/release/bundle/macos/` |
| macOS `.dmg` | `apps/desktop/src-tauri/target/release/bundle/dmg/` |
| Windows `.msi` | `apps/desktop/src-tauri/target/release/bundle/msi/` |
| Windows `.exe` | `apps/desktop/src-tauri/target/release/bundle/nsis/` |

> **Note:** macOS code-signing requires an Apple Developer account. Windows signing requires a code-signing certificate. Unsigned builds work fine for local use.

---

## Deploying the Web Layer to Vercel

The web landing page (`apps/web`) is a standard Next.js app with no Tauri dependency.

### One-click (Vercel dashboard)

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `apps/web`
3. Framework preset: **Next.js** (auto-detected)
4. Deploy

### Vercel CLI

```bash
npm install -g vercel
cd apps/web
vercel
```

Or from the repo root:

```bash
vercel --cwd apps/web
```

> The desktop binary is **not** hosted on Vercel. Vercel only serves the landing page. Link to GitHub Releases for downloads.

---

## Environment Variables

The desktop app requires no environment variables — all configuration is local.

The web app has no required environment variables either. Add `NEXT_PUBLIC_GITHUB_URL` if you want to inject the repo URL at build time.

---

## Linting & Formatting

```bash
npm run lint            # ESLint
npm run format          # Prettier (write)
npm run format:check    # Prettier (check only)
npm run type-check      # TypeScript
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following the commit style below
4. Open a pull request

### Commit style

```
feat: add drag-and-drop file import
fix: correct off-by-one in smart split boundary search
chore: update Tauri to 2.1
docs: add Windows build instructions
test: add edge cases for Unicode splitting
```

---

## Screenshots

> _Add screenshots here once the app is running._

---

## License

MIT — see [LICENSE](./LICENSE).
