import Link from "next/link";

const FEATURES = [
  {
    icon: "⚡",
    title: "Exact or smart splitting",
    desc: "Fixed-length chunks or boundary-aware splits that never break mid-sentence.",
  },
  {
    icon: "🔒",
    title: "100% local",
    desc: "Nothing leaves your machine. No cloud, no uploads, no telemetry — ever.",
  },
  {
    icon: "📂",
    title: "Numbered output files",
    desc: "1.txt, 2.txt, 3.txt … with optional prefix, leading zeros, and subfolder.",
  },
  {
    icon: "🌍",
    title: "Unicode-safe",
    desc: "Emoji, CJK, and accented characters each count as exactly 1 character.",
  },
  {
    icon: "📊",
    title: "Live preview",
    desc: "See the first chunks before you export. Copy any chunk with one click.",
  },
  {
    icon: "🛡️",
    title: "Overwrite protection",
    desc: "Overwrite, skip, or auto-create a new subfolder on every export.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="font-semibold text-sm">SplitForge Local</span>
        </div>
        <a
          href="https://github.com/VijaysinghPuwar/splitforge-local"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </a>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Open source · MIT license
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Split large text files
          <br />
          <span className="text-green-400">into numbered chunks</span>
        </h1>

        <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto">
          A local-first desktop app built with Next.js + Tauri. Paste or import any text, set
          a character limit, and export numbered .txt files — all on your machine.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://github.com/VijaysinghPuwar/splitforge-local/releases"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-medium rounded-lg transition-colors"
          >
            Download for macOS / Windows
          </a>
          <a
            href="https://github.com/VijaysinghPuwar/splitforge-local"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Screenshot placeholder */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
          <p className="text-gray-600 text-sm">App screenshot</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">Everything you need, nothing you don&apos;t</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">How it works</h2>
        <p className="text-gray-400 mb-10 text-sm">
          Five seconds from start to exported files.
        </p>
        <ol className="space-y-4 text-left">
          {[
            ["Paste text or import a .txt file", "Supports drag & drop, clipboard paste, or file import."],
            ["Set a character limit", "Default is 7,100 characters. Change it to anything you need."],
            ["Choose exact or smart mode", "Exact cuts at the limit. Smart finds the nearest paragraph break."],
            ["Select an output folder", "A native folder picker — no browser permissions needed."],
            ["Click Split & Export", "Files are written instantly to your local folder."],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-xs text-gray-600">
        <p>SplitForge Local · MIT License · Built with Next.js + Tauri</p>
        <p className="mt-1">No cloud. No tracking. No analytics. Fully open source.</p>
      </footer>
    </main>
  );
}
