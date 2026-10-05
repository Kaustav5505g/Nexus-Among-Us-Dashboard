import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, CornerDownRight, Sparkles, Shield, Compass } from 'lucide-react';
import { AdminAuthProvider } from './context/AdminAuthContext';

const AmongUsAdmin = lazy(() => import('./pages/AmongUsAdmin'));
const PlayerMission = lazy(() => import('./pages/PlayerMission'));

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24 font-sans">
      {/* Editorial Meta Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5 mb-16 text-xs font-mono tracking-architectural text-neutral-500 uppercase">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          <span className="text-black font-semibold">STATION PROTOCOL: AMONG US // CHAOS IN ORBIT</span>
        </div>
        <div className="flex items-center gap-6">
          <span>CLASSIFICATION: OPEN ENLISTMENT</span>
          <span>CYCLE: 2026.OCT</span>
        </div>
      </div>

      {/* Grand Palatial Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-b border-neutral-200 pb-20 mb-20">
        {/* Left Column: Majestic Editorial Typography */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="font-mono text-xs text-neutral-500 tracking-ultra-wide uppercase block">
              // 01. ANNUAL FLAGSHIP EXHIBITION
            </span>
            <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-black leading-[1.02]">
              Nexus is Bringing the Chaos.
            </h1>
            <p className="font-display text-lg sm:text-xl text-neutral-700 font-medium tracking-wide uppercase">
              Among Us: Coded Chaos <span className="text-neutral-400 font-serif italic lowercase font-normal">and</span> Tech Mystery
            </p>
          </div>

          <p className="text-lg text-neutral-600 font-light leading-relaxed max-w-xl">
            A masterclass in real-time deception and forensic deduction. Step into the orbital station to resolve critical code anomalies, coordinate emergency sessions, and decipher encrypted case archives.
          </p>

          {/* Palatial Registration Directive Box */}
          <div className="border border-neutral-300 bg-neutral-50/80 p-8 space-y-5 relative shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-4">
              <span className="text-xs font-mono tracking-architectural text-neutral-500 uppercase">
                EXECUTIVE FESTIVAL DIRECTIVE
              </span>
              <span className="text-xs font-mono font-bold text-black uppercase bg-white border border-neutral-300 px-3 py-1">
                1 REGISTRATION = 2 EVENTS
              </span>
            </div>

            <p className="text-sm text-neutral-700 leading-relaxed font-normal">
              Register for either event and unlock unrestricted squad clearance to both competitions absolutely free. Double the challenge, double the glory.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/play"
                className="px-7 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-mono text-xs font-bold uppercase tracking-architectural hover:opacity-95 transition flex items-center gap-2 group shadow-md"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Launch Player Deck (Mobile)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="https://tinyurl.com/bdfp2emu"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 bg-black text-white font-mono text-xs font-bold uppercase tracking-architectural hover:bg-neutral-800 transition flex items-center gap-2 group shadow-sm"
              >
                <span>Register: Coded Chaos</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="https://tinyurl.com/45sbus6m"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 bg-white border border-black text-black font-mono text-xs font-bold uppercase tracking-architectural hover:bg-neutral-100 transition flex items-center gap-2 group"
              >
                <span>Register: Tech Mystery</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Station Telemetry */}
        <div className="lg:col-span-5 border border-neutral-300 bg-white p-8 font-mono text-xs space-y-6 shadow-sm relative">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4 text-neutral-500 text-xs uppercase tracking-wider">
            <span className="font-bold text-black">[STATION // SKELD]</span>
            <span className="text-black bg-neutral-100 px-2 py-0.5 border border-neutral-200">ACTIVE GRID</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-500">STATION STATUS:</span>
              <span className="text-black font-medium">98.4% NOMINAL</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-500">TACTICAL ARENAS:</span>
              <span className="text-black font-medium">CODED CHAOS & TECH MYSTERY</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-500">ACTIVE DECKS:</span>
              <span className="text-black font-medium">ELECTRICAL, REACTOR, MEDBAY</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-500">CLEARANCE ACCESS:</span>
              <span className="text-black font-bold">MULTI-TIER FACILITATOR</span>
            </div>
          </div>

          <div className="p-5 border border-neutral-200 bg-neutral-50 text-xs leading-relaxed text-neutral-600 space-y-2">
            <div className="text-black font-bold uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-none" /> COMPETITION SUMMARY
            </div>
            <p className="font-light">
              Squads accomplish algorithmic tasks while covert impostors trigger controlled station sabotages. Live voting sessions resolve emergency reports.
            </p>
          </div>

          <Link
            to="/admin"
            className="w-full py-4 bg-black text-white text-center font-mono font-bold text-xs uppercase tracking-architectural block hover:bg-neutral-800 transition"
          >
            Launch Facilitator Deck →
          </Link>
        </div>
      </div>

      {/* Section 02: Architectural Arena Breakdown */}
      <div className="space-y-12 mb-20 border-b border-neutral-200 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="font-mono text-xs text-neutral-500 tracking-ultra-wide uppercase block mb-2">
              // 02. COMPETITION MATRICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black">
              Two Operational Theaters
            </h2>
          </div>
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
            INSPECTION OVERVIEW
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Theater I */}
          <div className="border border-neutral-300 bg-white p-8 sm:p-10 space-y-6 shadow-sm hover:border-black transition-colors duration-300">
            <div className="flex justify-between items-start font-mono text-xs text-neutral-500">
              <span className="text-black font-bold text-base">THEATER [I]</span>
              <span className="uppercase">AMONG US LIVE</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-serif font-bold text-black">
                Coded Chaos Arena
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                A live tactical simulation inside The Skeld station. Crewmates debug asynchronous logic and coordinate reactor coolant manifolds, while undercover Impostors execute stealth sabotages and misdirect crew during emergency meetings.
              </p>
            </div>

            <div className="pt-5 border-t border-neutral-200 font-mono text-xs flex justify-between items-center">
              <span className="text-neutral-500 uppercase">FORMAT: PHYSICAL & DIGITAL</span>
              <a
                href="https://tinyurl.com/bdfp2emu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black font-bold hover:underline flex items-center gap-1.5"
              >
                <span>Registration Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Theater II */}
          <div className="border border-neutral-300 bg-white p-8 sm:p-10 space-y-6 shadow-sm hover:border-black transition-colors duration-300">
            <div className="flex justify-between items-start font-mono text-xs text-neutral-500">
              <span className="text-black font-bold text-base">THEATER [II]</span>
              <span className="uppercase">CYBER INVESTIGATION</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-serif font-bold text-black">
                Tech Mystery Lab
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                A classified forensic laboratory compromised by hostile intrusion. Detective squads dissect inverted binary streams, ROT-13 autopsy rotation ciphers, and memory leaks to reconstruct evidentiary trails and unmask the perpetrator.
              </p>
            </div>

            <div className="pt-5 border-t border-neutral-200 font-mono text-xs flex justify-between items-center">
              <span className="text-neutral-500 uppercase">FORMAT: FORENSIC CRYPTOGRAPHY</span>
              <a
                href="https://tinyurl.com/45sbus6m"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black font-bold hover:underline flex items-center gap-1.5"
              >
                <span>Registration Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Section 03: Facilitator Deck Callout */}
      <div className="border border-neutral-900 bg-black text-white p-10 sm:p-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-sm">
        <div className="space-y-3 max-w-xl">
          <span className="font-mono text-xs text-neutral-400 tracking-ultra-wide uppercase">
            // 03. MISSION FACILITATION
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Facilitator & POC Switchboard
          </h3>
          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            Multi-tier clearance controls for Master Admins, Event Admins, and Field Points of Contact (POC). Includes squad manifest CRUD, automated Skeld sector allotment, impostor containment switches, and live sabotage overrides.
          </p>
        </div>

        <Link
          to="/admin"
          className="px-8 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-architectural hover:bg-neutral-200 transition shrink-0 flex items-center gap-2"
        >
          <span>Open Command Deck</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/amongus-admin');
  const isPlayerRoute =
    location.pathname.startsWith('/play') ||
    location.pathname.startsWith('/mission') ||
    location.pathname.startsWith('/player');

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-neutral-500">INITIALIZING FACILITATOR TERMINAL...</div>}>
        <Routes>
          <Route path="/admin" element={<AmongUsAdmin />} />
          <Route path="/amongus-admin" element={<AmongUsAdmin />} />
        </Routes>
      </Suspense>
    );
  }

  if (isPlayerRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050816] flex items-center justify-center font-mono text-xs text-cyan-400">BOARDING SKELD ORBITAL STATION...</div>}>
        <Routes>
          <Route path="/play" element={<PlayerMission />} />
          <Route path="/mission" element={<PlayerMission />} />
          <Route path="/player" element={<PlayerMission />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 architectural-light-grid font-sans">
      {/* Pristine White Navigation Bar with Professional Black Text */}
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img
              src="/logo.jpeg"
              alt="NEXUS Insignia"
              className="w-10 h-10 object-contain border border-neutral-300 bg-white p-0.5 shadow-sm"
            />
            <div className="leading-tight">
              <span className="font-serif font-bold text-base tracking-tight text-black block">
                NEXUS
              </span>
              <span className="font-mono text-[9px] tracking-ultra-wide text-neutral-500 uppercase block">
                RESEARCH • SPACE • TECH
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 font-mono text-xs tracking-wider">
            <Link to="/" className="text-neutral-600 hover:text-black transition uppercase hidden sm:inline">
              [EVENT HUB]
            </Link>
            <Link
              to="/play"
              className="text-blue-600 hover:text-blue-800 font-bold transition uppercase flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>[PLAYER DECK]</span>
            </Link>
            <Link
              to="/admin"
              className="px-5 py-2.5 bg-black text-white font-bold uppercase hover:bg-neutral-800 transition flex items-center gap-2 shadow-sm"
            >
              <span>FACILITATOR TERMINAL</span>
              <CornerDownRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Pristine White Footer */}
      <footer className="border-t border-neutral-200 py-10 bg-white font-mono text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-neutral-700">© 2026 NEXUS CLUB • ARCHITECTURAL EVENT PLATFORM</div>
          <div className="flex gap-6 text-[11px] uppercase text-neutral-500">
            <span>STATION: SKELD</span>
            <span>SYSTEM: CODED CHAOS</span>
            <span>SPEC: V2.6</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AdminAuthProvider>
  );
}
