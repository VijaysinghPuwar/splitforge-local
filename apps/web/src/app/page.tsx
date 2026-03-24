const GITHUB_URL = "https://github.com/VijaysinghPuwar/splitforge-local";
const RELEASES_URL = `${GITHUB_URL}/releases`;

const FEATURES = [
  {
    title: "Exact split mode",
    desc: "Every file contains exactly the chosen character count. The last file holds the remainder.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="2" y="8.5" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
        <rect x="2" y="14" width="6" height="3" rx="1.5" fill="currentColor" opacity="0.35" />
      </svg>
    ),
  },
  {
    title: "Smart split mode",
    desc: "Prefers paragraph or line breaks near the limit. Never exceeds the maximum.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 5h12M4 9h8M4 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 11V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Unicode-safe counting",
    desc: "Emoji, CJK, and accented characters each count as exactly 1. No surprises.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Native folder picker",
    desc: "Select your output folder with the OS-level dialog. No browser permission tricks.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 7a2 2 0 012-2h3.586a1 1 0 01.707.293L9.707 6.7A1 1 0 0010.414 7H16a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Overwrite protection",
    desc: "Choose to overwrite, skip existing files, or auto-create a timestamped subfolder.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "100% local processing",
    desc: "No cloud. No uploads. No analytics. Text never leaves your machine.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="11" width="14" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 11V7a3 3 0 116 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const STEPS = [
  ["Paste or import text", "Drop in any .txt file or paste directly into the editor."],
  ["Set a character limit", "Default is 7,100 characters. Change it to anything from 1 to 10 million."],
  ["Choose exact or smart", "Fixed-length cuts, or break at the nearest paragraph boundary."],
  ["Pick an output folder", "A native OS folder picker — no browser permissions needed."],
  ["Split & Export", "Numbered files written instantly to your local folder."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d11] text-white font-sans">
      {/* ── Nav ── */}
      <nav className="border-b border-white/[0.06] sticky top-0 bg-[#0b0d11]/90 backdrop-blur-md z-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="3" rx="1" fill="white" opacity="0.95" />
                <rect x="1" y="5.5" width="8" height="3" rx="1" fill="white" opacity="0.7" />
                <rect x="1" y="10" width="5" height="3" rx="1" fill="white" opacity="0.45" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight">SplitForge Local</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`${GITHUB_URL}#readme`}
              className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Docs
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          Open source · MIT · No telemetry
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
          Split large text files
          <br />
          <span className="text-green-400">into numbered chunks</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg mx-auto mb-10">
          A desktop app built with Next.js&nbsp;+&nbsp;Tauri. Set a character limit, pick a folder,
          and get clean numbered <code className="text-gray-300 bg-white/5 px-1 py-0.5 rounded text-sm">.txt</code> files — all processed locally.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10m-4-4 4 4 4-4M4 15h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download — macOS &amp; Windows
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            View source on GitHub
          </a>
        </div>
      </section>

      {/* ── App mockup ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          {/* Fake window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-gray-600">SplitForge Local</span>
          </div>
          {/* Mockup body */}
          <div className="p-6 sm:p-10 flex flex-col gap-4">
            {/* Input area mock */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0f1117] p-4 h-36 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-2 rounded bg-white/10 w-3/4" />
                <div className="h-2 rounded bg-white/10 w-full" />
                <div className="h-2 rounded bg-white/10 w-5/6" />
                <div className="h-2 rounded bg-white/10 w-2/3" />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>142,000 chars</span>
                <span>~20 files</span>
              </div>
            </div>
            {/* Settings row mock */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["7,100 chars/file", "Exact mode", "/Users/alice/output", ""].map((label, i) =>
                i === 3 ? (
                  <div key={i} className="col-span-2 sm:col-span-1 rounded-lg bg-green-500 flex items-center justify-center py-2.5 text-xs font-semibold text-white">
                    Split &amp; Export
                  </div>
                ) : (
                  <div key={i} className="rounded-lg border border-white/[0.08] bg-[#0f1117] px-3 py-2.5 text-xs text-gray-500 truncate">
                    {label}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-24">
        <h2 className="text-xl font-semibold text-center mb-2">Built to be simple and exact</h2>
        <p className="text-sm text-gray-500 text-center mb-10">
          No configuration wizards. No hidden behaviour. Just clean, predictable splits.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] p-5 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-white">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
        <h2 className="text-xl font-semibold text-center mb-2">How it works</h2>
        <p className="text-sm text-gray-500 text-center mb-10">Five steps, under ten seconds.</p>
        <ol className="space-y-5">
          {STEPS.map(([title, desc], i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="shrink-0 w-7 h-7 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-sm text-white">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Why Tauri ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-24">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 sm:p-10">
          <h2 className="text-lg font-semibold mb-3">Why Tauri instead of Electron?</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-gray-400 leading-relaxed">
            <p>
              Browser-only apps cannot write directly to the local file system or open native
              folder pickers without cumbersome workarounds. Tauri gives us a secure Rust
              backend that handles all I/O — the OS-level folder dialog, direct file writes,
              and path-traversal protection — while the Next.js frontend handles the UI.
            </p>
            <p>
              Unlike Electron, Tauri uses the system WebView rather than bundling a full
              Chromium instance. The result is a binary that is typically under 10 MB, starts
              fast, and uses a fraction of the memory. The Rust backend is also memory-safe
              by default, making the app robust against crashes and security issues.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to split?</h2>
        <p className="text-sm text-gray-500 mb-8">Free, open source, no sign-up required.</p>
        <a
          href={RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Download SplitForge Local
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] px-5 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="0.5" y="0.5" width="9" height="2.5" rx="0.75" fill="white" opacity="0.9" />
                <rect x="0.5" y="4" width="6" height="2.5" rx="0.75" fill="white" opacity="0.65" />
                <rect x="0.5" y="7.5" width="3.5" height="2" rx="0.75" fill="white" opacity="0.4" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">SplitForge Local · MIT License</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-600">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">GitHub</a>
            <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Releases</a>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">License</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
