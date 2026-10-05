import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShieldAlert, Terminal, Users, Trophy, Radio, Flame, Sparkles } from 'lucide-react';

function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Announcement Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-space-900 via-space-800 to-space-950 p-8 shadow-2xl mb-12">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Flame className="w-3.5 h-3.5" /> NEXUS Club Presents
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-wide font-display">
              NEXUS IS BRINGING THE CHAOS! 🚨
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-2xl">
              Ready to put your brains, instincts & detective skills to the test? 
              Two events. One registration. Double the fun.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://tinyurl.com/bdfp2emu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold hover:from-red-500 hover:to-rose-500 transition shadow-lg shadow-red-600/30 text-center"
            >
              🕹️ Coded Chaos Form
            </a>
            <a
              href="https://tinyurl.com/45sbus6m"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-600/30 transition text-center"
            >
              🕵🏻‍♀️ Tech Mystery Form
            </a>
          </div>
        </div>

        {/* Promo Highlight */}
        <div className="mt-6 pt-6 border-t border-gray-800/80 flex items-center gap-3 text-amber-300 font-medium text-sm">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SPECIAL PROMO:</strong> REGISTER FOR ONE EVENT & GET THE SECOND EVENT ABSOLUTELY FREE! (1 REGISTRATION = 2 EVENTS)
          </span>
        </div>
      </div>

      {/* Module Overview Cards for Teammates & Participants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-space-900 border border-gray-800 hover:border-cyan-500/50 transition">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">1. Coded Chaos (Among Us)</h3>
          <p className="text-gray-400 text-sm">
            Live Skeld station arena, real-time debugging tasks in Electrical/Reactor, saboteur alarms & emergency meeting sirens.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-space-900 border border-gray-800 hover:border-cyan-500/50 transition">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">2. Tech Mystery Room</h3>
          <p className="text-gray-400 text-sm">
            Forensic terminal dossiers, encrypted hexadecimal and binary riddles, evidence deduction, and cipher flag submissions.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-space-900 border border-gray-800 hover:border-cyan-500/50 transition">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">3. Live Leaderboard & Hub</h3>
          <p className="text-gray-400 text-sm">
            WebSocket live synchronization across spectator screens, active room feeds, and Game Master control panel.
          </p>
        </div>
      </div>

      {/* Developer Collaboration Callout */}
      <div className="mt-12 p-6 rounded-xl border border-gray-800 bg-space-900/60 text-center">
        <h4 className="text-lg font-semibold text-gray-200">🚀 Developer Workspace Initialized</h4>
        <p className="text-gray-400 text-sm mt-1 max-w-xl mx-auto">
          This repository is prepared for multi-user club collaboration. Check <code className="text-cyan-400">docs/GIT_WORKFLOW.md</code> and <code className="text-cyan-400">docs/TASK_BOARD.md</code> to pick up assigned modules.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#070a13] text-gray-100 radar-grid">
        {/* Navigation Bar */}
        <header className="border-b border-gray-800/80 bg-space-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-red-500 flex items-center justify-center text-white font-black text-lg">
                N
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-white">
                NEXUS <span className="text-cyan-400 text-sm">DASHBOARD</span>
              </span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium text-gray-400">
              <Link to="/" className="hover:text-cyan-400 transition">Event Hub</Link>
              <a
                href="https://github.com/Tejas-Narula/Nexus-Among-Us-Dashboard"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                GitHub Repo
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/60 py-6 text-center text-xs text-gray-500 bg-space-950">
          <p>© 2026 NEXUS Club. Built for Coded Chaos & Tech Mystery Events.</p>
        </footer>
      </div>
    </Router>
  );
}
