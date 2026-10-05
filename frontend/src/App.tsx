import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  KeyRound,
  Shield,
  Search,
  Zap,
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Sparkles,
  Flame,
  Target,
  FileText,
  AlertTriangle,
  Compass,
  Radio,
  HelpCircle,
  Terminal as TerminalIcon,
  Crosshair,
  Lock,
  Unlock,
  Eye,
  CheckSquare,
  Square,
  Bell,
  Cpu,
  Layers,
  Stamp,
  BookOpen,
  Hash,
} from 'lucide-react';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { GameAudio } from './utils/gameAudio';

const AmongUsAdmin = lazy(() => import('./pages/AmongUsAdmin'));
const PlayerMission = lazy(() => import('./pages/PlayerMission'));

// Countdown to TechIdeate'26 Opening Bell: 9 October 2026, 12:00 PM IST
function useCountdown() {
  const targetDate = new Date('2026-10-09T12:00:00+05:30').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function Home() {
  const countdown = useCountdown();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sectorView, setSectorView] = useState<'both' | 'skeld' | 'baker'>('both');
  const [selectedPoster, setSelectedPoster] = useState<'amongus' | 'sherlock' | null>(null);

  // Interactive Among Us Skeld Task Panel state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    wiring: false,
    upload: true,
    calibrate: false,
    power: true,
  });
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);

  // Interactive Sherlock Holmes Cipher Decrypter state
  const [cipherInput, setCipherInput] = useState('');
  const [cipherSolved, setCipherSolved] = useState(false);
  const [cipherHintRevealed, setCipherHintRevealed] = useState(false);

  const playClick = () => {
    if (soundEnabled) GameAudio.click();
  };

  const playSiren = () => {
    if (soundEnabled) GameAudio.emergency();
  };

  const toggleTask = (key: string) => {
    playClick();
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerEmergencySim = () => {
    playSiren();
    setEmergencyAlertActive(true);
    setTimeout(() => setEmergencyAlertActive(false), 5000);
  };

  const handleCipherCheck = (val: string) => {
    setCipherInput(val);
    const cleaned = val.trim().toLowerCase();
    if (cleaned.includes('moriarty') || cleaned.includes('impostor') || cleaned.includes('nexus')) {
      if (!cipherSolved && soundEnabled) GameAudio.success();
      setCipherSolved(true);
    }
  };

  return (
    <div className="relative text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Tactile Archival Paper Texture Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#f6f4ee] paper-grid opacity-70" />

      {/* Emergency Siren Alert Banner */}
      {emergencyAlertActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white font-mono font-bold text-xs sm:text-sm py-2.5 px-4 shadow-[0_4px_20px_rgba(220,38,38,0.5)] border-b-2 border-black animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 tracking-wider">
              <AlertTriangle className="w-5 h-5 fill-white text-red-600 shrink-0" />
              <span>EMERGENCY PROTOCOL CALLED // SUSPECT SIGHTED AT AB1 LOBBY! PROCEED TO ELECTRICAL!</span>
            </span>
            <button
              onClick={() => setEmergencyAlertActive(false)}
              className="px-3 py-1 rounded bg-black text-white text-xs font-mono uppercase font-black hover:bg-neutral-800 transition"
            >
              DISMISS [ESC]
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. BREAKING BULLETIN: SPECIAL CAMPUS OFFER (BUY 1 GET 1 FREE) */}
      {/* ========================================================================= */}
      <div className="bg-neutral-950 text-white font-mono text-xs py-2.5 px-4 border-b-2 border-neutral-900 relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider animate-pulse">
              ★ OFFICIAL DECREE
            </span>
            <span className="font-extrabold uppercase tracking-wide text-xs sm:text-sm">
              REGISTER FOR 1 EVENT — GET THE 2ND EVENT 100% FREE!
            </span>
            <span className="hidden lg:inline text-neutral-400">•</span>
            <span className="hidden lg:inline text-neutral-300 font-normal">
              Pay ₹25 once and receive verified clearance to play BOTH Among Us & Sherlock Holmes!
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#enlist"
              className="text-red-400 hover:text-white font-bold underline transition text-xs flex items-center gap-1"
            >
              <span>CLAIM 1+1 PASS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) GameAudio.beep(600, 0.08);
              }}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-neutral-300 transition"
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-neutral-200" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BROADSHEET MASTHEAD & METADATA BAR */}
      {/* ========================================================================= */}
      <div className="border-b border-neutral-900/20 bg-[#fbfaf6] px-4 py-2 font-mono text-[11px] text-neutral-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-900 uppercase">VOL. XXVI // SPECIAL DISPATCH</span>
            <span className="text-neutral-400">|</span>
            <span>MANIPAL UNIVERSITY JAIPUR • AB1 LOBBY</span>
            <span className="text-neutral-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline">9 & 10 OCTOBER 2026 (HOLIDAYS)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="stamp-red text-[10px]">
              🔥 1+1 FREE ACTIVE
            </span>
            <span className="stamp-black text-[10px]">
              ₹30,000 TREASURY
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BROADSHEET HERO: TWO UNIVERSES. TWO MYSTERIES. */}
      {/* ========================================================================= */}
      <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Newspaper Column Header */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-neutral-900 bg-white font-mono text-xs uppercase tracking-widest font-bold shadow-[2px_2px_0px_#111111]">
            <Hash className="w-3.5 h-3.5 text-red-600" />
            <span>NEXUS × TECHIDEATE'26 CLASSIFIED SPECIAL ISSUE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-serif tracking-tight leading-[0.98] text-neutral-950 uppercase">
            Two Events. <br />
            <span className="italic font-normal font-serif">Two Mysteries.</span> <br />
            <span className="font-sans font-black text-red-600 tracking-tighter">One Pass.</span>
          </h1>

          <div className="flex items-center justify-center gap-3 flex-wrap font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
            <span className="bg-neutral-950 text-white px-2 py-0.5">WHO IS THE IMPOSTOR?</span>
            <span className="text-neutral-400">•</span>
            <span className="bg-neutral-950 text-white px-2 py-0.5">WHO IS THE CULPRIT?</span>
          </div>

          <p className="text-sm sm:text-base text-neutral-700 max-w-2xl font-normal leading-relaxed text-center">
            Organized by <strong className="text-neutral-950 font-bold underline">NEXUS</strong> (Research • Space • Technology Club) for <strong className="text-neutral-950 font-bold">TechIdeate'26</strong> at Manipal University Jaipur. Two consecutive university holidays of live tactical deception, cryptographic forensics, station challenges, and ₹30,000 in cash prizes.
          </p>

          {/* =================================================================== */}
          {/* THE OFFICIAL FESTIVAL DECREE: BUY 1 GET 1 FREE */}
          {/* =================================================================== */}
          <div className="w-full max-w-3xl mx-auto p-6 sm:p-7 rounded-none paper-card-red relative text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="stamp-red text-xs">
                    OFFICIAL FESTIVAL DECREE
                  </span>
                  <span className="font-mono text-xs font-black text-neutral-900 uppercase">
                    BUY 1 GET 1 FREE
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-neutral-950 leading-tight">
                  Register for ONE Event — Get the SECOND Event 100% FREE!
                </h3>
                <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                  Pay just <strong>₹25 once</strong>. Your confirmation grants instant clearance to <strong>BOTH</strong> Among Us (9th Oct) & Sherlock Holmes (10th Oct). Double your chances to take home the combined <strong>₹30,000 treasury</strong>!
                </p>
              </div>

              <a
                href="#enlist"
                onClick={playClick}
                className="shrink-0 w-full sm:w-auto btn-paper-red px-6 py-4 text-xs text-center"
              >
                Claim 1+1 Pass • ₹25
              </a>
            </div>
          </div>

          {/* Editorial Broadsheet Filter Tabs */}
          <div className="pt-2 flex items-center p-1 border-2 border-neutral-900 bg-white font-mono text-xs shadow-[3px_3px_0px_#111111]">
            <button
              onClick={() => { setSectorView('both'); playClick(); }}
              className={`px-4 py-2 font-bold uppercase transition ${
                sectorView === 'both' ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              [ BOTH DOSSIERS ]
            </button>
            <button
              onClick={() => { setSectorView('skeld'); playClick(); }}
              className={`px-4 py-2 font-bold uppercase transition flex items-center gap-1.5 ${
                sectorView === 'skeld' ? 'bg-red-600 text-white' : 'text-neutral-600 hover:text-red-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block border border-black" />
              <span>SKELD: AMONG US</span>
            </button>
            <button
              onClick={() => { setSectorView('baker'); playClick(); }}
              className={`px-4 py-2 font-bold uppercase transition flex items-center gap-1.5 ${
                sectorView === 'baker' ? 'bg-amber-600 text-white' : 'text-neutral-600 hover:text-amber-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block border border-black" />
              <span>221B: SHERLOCK</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DUAL CASE FILES: EDITORIAL DOSSIERS */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* DOSSIER 01: AMONG US (CODED CHAOS) */}
          {(sectorView === 'both' || sectorView === 'skeld') && (
            <div className="paper-card paper-card-hover p-6 sm:p-8 flex flex-col justify-between space-y-6 relative group">
              {/* Dossier Header */}
              <div className="border-b-2 border-neutral-900 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-neutral-900">DOSSIER #01</span>
                    <span className="text-neutral-400">/</span>
                    <span className="text-red-600 font-bold uppercase">9TH OCTOBER 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="stamp-red text-[10px]">
                      🔥 GET SHERLOCK FREE
                    </span>
                    <span className="stamp-black text-[10px]">
                      BOUNTY: ₹15,000
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl sm:text-5xl font-black font-serif text-neutral-950 uppercase tracking-tight">
                      Among Us
                    </h2>
                    <span className="font-mono text-xs font-black text-red-600 uppercase tracking-wider">
                      CODED CHAOS
                    </span>
                  </div>
                  <p className="font-mono text-xs text-neutral-600 font-bold tracking-wider">
                    DECEIVE • DISCUSS • DECIPHER • SURVIVE
                  </p>
                </div>
              </div>

              {/* Official Portrait Poster Framing */}
              <div
                onClick={() => { setSelectedPoster('amongus'); playClick(); }}
                className="relative border-2 border-neutral-900 bg-neutral-950 p-2 cursor-pointer shadow-[4px_4px_0px_#111111] group/art transition-all"
              >
                <div className="aspect-[2/3] max-h-[500px] w-full relative overflow-hidden flex items-center justify-center bg-black">
                  <img
                    src="/poster-among-us.jpg"
                    alt="Among Us Coded Chaos Official Poster"
                    className="w-full h-full object-contain filter group-hover/art:scale-105 transition-all duration-300"
                  />
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between font-mono text-xs text-white px-1">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Maximize2 className="w-3.5 h-3.5 text-red-400" />
                    <span>FIG 1.0: OFFICIAL MISSION POSTER (CLICK TO EXPAND)</span>
                  </span>
                  <span className="text-red-400 font-bold">AB1 LOBBY</span>
                </div>
              </div>

              {/* Physical Skeld Station Simulator Board */}
              <div className="p-4 sm:p-5 border-2 border-neutral-900 bg-[#fbfaf6] space-y-3 font-mono text-xs shadow-[3px_3px_0px_#111111]">
                <div className="flex items-center justify-between text-neutral-700 text-[11px] border-b border-neutral-900 pb-2">
                  <span className="flex items-center gap-1.5 font-bold uppercase text-neutral-950">
                    <Cpu className="w-3.5 h-3.5 text-red-600" />
                    <span>SKELD SYSTEM CONSOLE (INTERACTIVE)</span>
                  </span>
                  <span className="text-neutral-500 uppercase">AB1 ELECTRICAL</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleTask('wiring')}
                    className={`p-2.5 border-2 border-neutral-900 text-left flex items-center justify-between transition ${
                      completedTasks.wiring
                        ? 'bg-neutral-950 text-white font-bold'
                        : 'bg-white text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <span>Fix Wiring</span>
                    {completedTasks.wiring ? (
                      <CheckSquare className="w-4 h-4 text-red-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTask('upload')}
                    className={`p-2.5 border-2 border-neutral-900 text-left flex items-center justify-between transition ${
                      completedTasks.upload
                        ? 'bg-neutral-950 text-white font-bold'
                        : 'bg-white text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <span>Upload Data</span>
                    {completedTasks.upload ? (
                      <CheckSquare className="w-4 h-4 text-red-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTask('calibrate')}
                    className={`p-2.5 border-2 border-neutral-900 text-left flex items-center justify-between transition ${
                      completedTasks.calibrate
                        ? 'bg-neutral-950 text-white font-bold'
                        : 'bg-white text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <span>Calibrate Engine</span>
                    {completedTasks.calibrate ? (
                      <CheckSquare className="w-4 h-4 text-red-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTask('power')}
                    className={`p-2.5 border-2 border-neutral-900 text-left flex items-center justify-between transition ${
                      completedTasks.power
                        ? 'bg-neutral-950 text-white font-bold'
                        : 'bg-white text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <span>Divert Power</span>
                    {completedTasks.power ? (
                      <CheckSquare className="w-4 h-4 text-red-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                </div>

                {/* Tactile Red Emergency Buzzer */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={triggerEmergencySim}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs border-2 border-neutral-900 shadow-[3px_3px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#111111] transition flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>HIT EMERGENCY MEETING BUZZER</span>
                  </button>
                </div>
              </div>

              {/* Mission Field Specifications */}
              <div className="font-mono text-xs text-neutral-700 space-y-1.5 border-t border-neutral-900/20 pt-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">DATE & TIMING:</span>
                  <span className="font-bold text-neutral-950">9 October 2026 • 12:00 PM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">VENUE:</span>
                  <span className="font-bold text-neutral-950">AB1 Lobby, Manipal University Jaipur</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">ENTRY PASS:</span>
                  <span className="font-black text-red-600">₹25 (Unlocks BOTH Days! 🔥 1+1 FREE)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">SQUADS:</span>
                  <span className="font-bold text-neutral-900">Formed on the spot at event desk</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://tinyurl.com/bdfp2emu"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="flex-1 btn-paper-red py-4 text-center flex items-center justify-center gap-2 text-xs"
                >
                  <span>Register Among Us (₹25) + Get Sherlock FREE!</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <Link
                  to="/play"
                  onClick={playClick}
                  className="btn-paper-white py-4 px-5 text-center flex items-center justify-center gap-2 text-xs"
                >
                  <Zap className="w-4 h-4 text-neutral-950" />
                  <span>Mission Console</span>
                </Link>
              </div>
            </div>
          )}

          {/* DOSSIER 02: SHERLOCK HOLMES (TECH MYSTERY) */}
          {(sectorView === 'both' || sectorView === 'baker') && (
            <div className="paper-card paper-card-hover p-6 sm:p-8 flex flex-col justify-between space-y-6 relative group">
              {/* Dossier Header */}
              <div className="border-b-2 border-neutral-900 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-neutral-900">DOSSIER #02</span>
                    <span className="text-neutral-400">/</span>
                    <span className="text-amber-800 font-bold uppercase">10TH OCTOBER 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="stamp-red text-[10px]">
                      🔥 GET AMONG US FREE
                    </span>
                    <span className="stamp-gold text-[10px]">
                      BOUNTY: ₹15,000
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-3xl sm:text-5xl font-black font-serif text-neutral-950 uppercase tracking-tight">
                      Sherlock Holmes
                    </h2>
                    <span className="font-mono text-xs font-black text-amber-800 uppercase tracking-wider">
                      TECH MYSTERY
                    </span>
                  </div>
                  <p className="font-mono text-xs text-neutral-600 font-bold tracking-wider">
                    OBSERVE • DEDUCE • SOLVE
                  </p>
                </div>
              </div>

              {/* Official Portrait Poster Framing */}
              <div
                onClick={() => { setSelectedPoster('sherlock'); playClick(); }}
                className="relative border-2 border-neutral-900 bg-neutral-950 p-2 cursor-pointer shadow-[4px_4px_0px_#111111] group/art transition-all"
              >
                <div className="aspect-[2/3] max-h-[500px] w-full relative overflow-hidden flex items-center justify-center bg-black">
                  <img
                    src="/poster-sherlock.jpg"
                    alt="Sherlock Holmes Tech Mystery Official Poster"
                    className="w-full h-full object-contain filter group-hover/art:scale-105 transition-all duration-300"
                  />
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between font-mono text-xs text-white px-1">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>FIG 2.0: OFFICIAL INVESTIGATION POSTER (CLICK TO EXPAND)</span>
                  </span>
                  <span className="text-amber-400 font-bold">AB1 LOBBY</span>
                </div>
              </div>

              {/* Interactive Forensic Cipher Terminal Widget */}
              <div className="p-4 sm:p-5 border-2 border-neutral-900 bg-[#fbfaf6] space-y-3 font-mono text-xs shadow-[3px_3px_0px_#111111]">
                <div className="flex items-center justify-between text-neutral-700 text-[11px] border-b border-neutral-900 pb-2">
                  <span className="flex items-center gap-1.5 font-bold uppercase text-neutral-950">
                    <Search className="w-3.5 h-3.5 text-amber-700" />
                    <span>221B CIPHER DECRYPTER (INTERACTIVE)</span>
                  </span>
                  <span className="text-neutral-500 uppercase">FORENSICS DESK</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 border border-neutral-900 bg-white text-neutral-800 text-[11px] leading-relaxed">
                    <span className="font-bold text-neutral-950 block mb-0.5 uppercase">
                      CASE DIRECTIVE: INFILTRATION SUSPECT
                    </span>
                    <span>
                      "The culprit leaves encrypted footprints across AB1. Enter keyword{' '}
                      <strong className="text-amber-800 font-bold">[MORIARTY]</strong> or{' '}
                      <strong className="text-red-600 font-bold">[IMPOSTOR]</strong> to unlock the classified clue."
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cipherInput}
                      onChange={e => handleCipherCheck(e.target.value)}
                      placeholder="Type suspect keyword to decrypt..."
                      className="flex-1 bg-white border-2 border-neutral-900 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 font-mono text-xs outline-none focus:bg-amber-50/50 transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCipherHintRevealed(!cipherHintRevealed);
                        playClick();
                      }}
                      className="btn-paper-white px-3 py-2 text-[10px]"
                    >
                      {cipherHintRevealed ? 'Hide' : 'Hint'}
                    </button>
                  </div>

                  {cipherSolved && (
                    <div className="p-2.5 border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-xs font-bold font-mono">
                      ✓ CLUE DECRYPTED: "Every detail matters and nothing is a coincidence. AB1 Lobby, 12PM."
                    </div>
                  )}

                  {cipherHintRevealed && !cipherSolved && (
                    <div className="text-[10px] text-amber-800 italic font-serif">
                      Tip: Type "Moriarty" or "Nexus" to test decryption telemetry.
                    </div>
                  )}
                </div>
              </div>

              {/* Mission Field Specifications */}
              <div className="font-mono text-xs text-neutral-700 space-y-1.5 border-t border-neutral-900/20 pt-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">DATE & TIMING:</span>
                  <span className="font-bold text-neutral-950">10 October 2026 • 12:00 PM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">VENUE:</span>
                  <span className="font-bold text-neutral-950">AB1 Lobby, Manipal University Jaipur</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">ENTRY PASS:</span>
                  <span className="font-black text-amber-800">₹25 (Unlocks BOTH Days! 🔥 1+1 FREE)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 uppercase">SQUADS:</span>
                  <span className="font-bold text-neutral-900">Formed on the spot at event desk</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://tinyurl.com/45sbus6m"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  className="flex-1 btn-paper-primary py-4 text-center flex items-center justify-center gap-2 text-xs"
                >
                  <span>Register Sherlock (₹25) + Get Among Us FREE!</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => { setSelectedPoster('sherlock'); playClick(); }}
                  className="btn-paper-white py-4 px-5 text-center text-xs"
                >
                  Inspect Poster
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. BROADSHEET TELEMETRY & TREASURY LEDGER */}
      {/* ========================================================================= */}
      <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto border-t-2 border-b-2 border-neutral-900 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center text-center sm:text-left font-mono">
          {/* Stat 1 */}
          <div className="space-y-1 border-b md:border-b-0 md:border-r border-neutral-900/20 pb-4 md:pb-0 md:pr-4">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5 font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-700" /> TOTAL TREASURY POOL
            </span>
            <div className="text-3xl sm:text-4xl font-black font-serif text-neutral-950">₹30,000</div>
            <span className="text-[11px] text-neutral-600">₹15,000 Per Flagship Event</span>
          </div>

          {/* Stat 2 */}
          <div className="space-y-1 border-b md:border-b-0 lg:border-r border-neutral-900/20 pb-4 md:pb-0 md:pr-4">
            <span className="text-[10px] text-red-600 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5 font-black">
              ★ 1+1 MEGA OFFER PASS
            </span>
            <div className="text-3xl sm:text-4xl font-black font-serif text-red-600">₹25 TOTAL</div>
            <span className="text-[11px] text-neutral-900 font-bold">Pay once, 2nd event 100% FREE!</span>
          </div>

          {/* Stat 3 */}
          <div className="space-y-1 border-b md:border-b-0 md:border-r border-neutral-900/20 pb-4 md:pb-0 md:pr-4">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5 font-bold">
              <MapPin className="w-3.5 h-3.5 text-red-600" /> HEADQUARTERS
            </span>
            <div className="text-2xl sm:text-3xl font-black font-serif text-neutral-950">AB1 LOBBY</div>
            <span className="text-[11px] text-neutral-600">12:00 PM – 6:00 PM • Holidays</span>
          </div>

          {/* Stat 4 */}
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-neutral-900" /> KICKOFF CLOCK
            </span>
            <div className="text-2xl sm:text-3xl font-black font-serif text-neutral-950">
              {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
            </div>
            <span className="text-[11px] text-neutral-500">Kickoff: 9th Oct • 12:00 PM</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CLASSIFIED EVIDENCE DOSSIERS: 10 REASONS TO REGISTER */}
      {/* ========================================================================= */}
      <section id="dossiers" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-neutral-900 bg-white font-mono text-xs uppercase tracking-widest font-bold shadow-[2px_2px_0px_#111111]">
            <BookOpen className="w-3.5 h-3.5 text-neutral-900" />
            <span>OFFICIAL INTELLIGENCE DOSSIER // DECLASSIFIED</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-serif text-neutral-950 tracking-tight uppercase">
            10 Reasons You Cannot Say No
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-mono">
            VERIFIED DIRECTIVES FOR MANIPAL UNIVERSITY JAIPUR STUDENTS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Briefing 01 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group border-2 border-red-600 bg-red-50/20">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-red-600">EXHIBIT #01</span>
              <span className="stamp-red text-[10px]">🔥 1+1 FREE PASS</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-red-600 transition">
              Unbeatable 1+1 Mega Offer (₹25 Total)
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Register for ONE event and get the SECOND event ABSOLUTELY FREE! Just ₹25 unlocks both 9th Oct (Among Us) and 10th Oct (Sherlock Holmes) with full shot at the ₹30,000 bounty!
            </p>
          </div>

          {/* Briefing 02 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-neutral-500">EXHIBIT #02</span>
              <span className="stamp-gold text-[10px]">₹30,000 POOL</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-amber-800 transition">
              Real Money, Verified Payouts
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              ₹30,000 cash disbursed across both flagship competitions (₹15,000 per event). Verified payouts for top detectives and impostors.
            </p>
          </div>

          {/* Briefing 03 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-neutral-500">EXHIBIT #03</span>
              <span className="stamp-black text-[10px]">NO CLASHES</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-red-600 transition">
              Zero Academic Risk
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Both 9th and 10th October are official university holidays. No attendance penalties, no missed lectures. Pure holiday entertainment.
            </p>
          </div>

          {/* Briefing 04 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-neutral-500">EXHIBIT #04</span>
              <span className="stamp-black text-[10px]">SOLO READY</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-neutral-700 transition">
              Lone Wolf Friendly
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Don’t have a team yet? Arrive solo at AB1 Lobby! Teams are actively formed and paired right on the day of the event.
            </p>
          </div>

          {/* Briefing 05 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-neutral-500">EXHIBIT #05</span>
              <span className="stamp-black text-[10px]">1-6 SQUADS</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-amber-800 transition">
              Squad Friendly
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Teams can range from 1 to 6 members. Bring your roommates, hostel wingmates, or branch squad to dominate the floor.
            </p>
          </div>

          {/* Briefing 06 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group border-2 border-amber-600 bg-amber-50/20">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-amber-800">EXHIBIT #06</span>
              <span className="stamp-gold text-[10px]">FREE 2ND EVENT</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-amber-800 transition">
              Free Double Strike Probability
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Because your single registration unlocks the second event at zero additional charge, you automatically get double the chances to win without spending an extra rupee!
            </p>
          </div>

          {/* Briefing 07 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-neutral-500">EXHIBIT #07</span>
              <span className="stamp-black text-[10px]">LIVE STAGING</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-neutral-700 transition">
              Pop Culture in Real Life
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Two of the world’s most iconic intellectual universes brought physically to life inside AB1 Lobby with real physical tasks and forensic clues.
            </p>
          </div>

          {/* Briefing 08 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-neutral-500">EXHIBIT #08</span>
              <span className="stamp-gold text-[10px]">CAMPUS LEGEND</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-amber-800 transition">
              Campus Bragging Rights
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Outsmart your friends, eliminate your hostel rivals, and establish your syndicate's reputation in front of the entire fest.
            </p>
          </div>

          {/* Briefing 09 */}
          <div className="paper-card paper-card-hover p-6 space-y-3 relative group">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-bold text-neutral-500">EXHIBIT #09</span>
              <span className="stamp-red text-[10px]">CAPPED BERTHS</span>
            </div>
            <h3 className="text-base font-bold font-serif text-neutral-950 group-hover:text-red-600 transition">
              Strictly Capped Capacity
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Station capacity at AB1 Lobby is strictly limited for round integrity. Early online registrants receive guaranteed berths.
            </p>
          </div>

          {/* Briefing 10 (Full Banner) */}
          <div className="md:col-span-2 lg:col-span-3 paper-card p-6 sm:p-8 border-2 border-neutral-900 text-center space-y-2">
            <span className="font-mono text-[11px] text-neutral-900 font-black tracking-widest uppercase">
              EXHIBIT #10 • MAXIMUM ADRENALINE
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-serif text-neutral-950 uppercase">
              Unforgettable Campus Experience & High Energy
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl mx-auto font-sans font-normal leading-relaxed">
              Break the routine. Forge alliances, experience high-stakes interrogations, crack ciphers, and make lasting fest memories at TechIdeate'26.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ENLISTMENT PROTOCOL: 3 EASY STEPS */}
      {/* ========================================================================= */}
      <section id="enlist" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto border-t-2 border-neutral-900">
        <div className="paper-card p-8 sm:p-12 relative">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-neutral-900 bg-[#fbfaf6] font-mono text-xs uppercase tracking-widest font-bold shadow-[2px_2px_0px_#111111]">
              DEPLOYMENT PROTOCOL // 60 SECONDS
            </div>

            <h2 className="text-4xl sm:text-5xl font-black font-serif text-neutral-950 uppercase tracking-tight">
              How To Register
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 font-mono">
              THREE STEPS. UNDER A MINUTE. NO PRE-FORMED TEAM REQUIRED.
            </p>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left font-mono">
              <div className="p-5 border-2 border-neutral-900 bg-[#fbfaf6] shadow-[3px_3px_0px_#111111] space-y-2.5">
                <div className="w-8 h-8 rounded-sm bg-neutral-950 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  1
                </div>
                <h3 className="font-bold text-neutral-950 text-sm uppercase">SUBMIT EITHER FORM</h3>
                <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
                  Register for either event for just ₹25. Your single confirmation grants free entry to BOTH days!
                </p>
              </div>

              <div className="p-5 border-2 border-neutral-900 bg-[#fbfaf6] shadow-[3px_3px_0px_#111111] space-y-2.5">
                <div className="w-8 h-8 rounded-sm bg-red-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  2
                </div>
                <h3 className="font-bold text-neutral-950 text-sm uppercase">SCREENSHOT PROOF</h3>
                <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
                  Take a screenshot of your submission and payment confirmation. This is your official gate pass for both days at AB1 Lobby.
                </p>
              </div>

              <div className="p-5 border-2 border-neutral-900 bg-[#fbfaf6] shadow-[3px_3px_0px_#111111] space-y-2.5">
                <div className="w-8 h-8 rounded-sm bg-amber-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  3
                </div>
                <h3 className="font-bold text-neutral-950 text-sm uppercase">JOIN WHATSAPP</h3>
                <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
                  Tap the WhatsApp group link inside the confirmation form. Round announcements and station briefings happen here!
                </p>
              </div>
            </div>

            {/* High-Impact Callout with 1+1 Offer Highlight */}
            <div className="p-5 border-2 border-red-600 bg-red-50/50 shadow-[4px_4px_0px_#dc2626] text-center space-y-1.5">
              <div className="font-mono text-xs font-black text-red-700 uppercase tracking-widest flex items-center justify-center gap-2">
                <Flame className="w-4 h-4 text-red-600 animate-bounce" />
                <span>ACTIVE PROMOTION: 1 REGISTRATION UNLOCKS BOTH FESTIVAL DAYS</span>
              </div>
              <p className="text-sm font-extrabold text-neutral-950 font-serif">
                Register for ONE event for ₹25 and get the SECOND event ABSOLUTELY FREE!
              </p>
              <div className="font-mono text-[11px] text-neutral-700 font-bold">
                CLAIM NOW • ₹25 FOR BOTH • SCREENSHOT IT • JOIN THE GROUP
              </div>
            </div>

            {/* Direct Register Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="https://tinyurl.com/bdfp2emu"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="w-full sm:w-auto btn-paper-red px-8 py-4 text-xs"
              >
                <span>Register: Among Us (₹25) + Get Sherlock FREE!</span>
                <ArrowUpRight className="w-4 h-4 inline ml-1" />
              </a>

              <a
                href="https://tinyurl.com/45sbus6m"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="w-full sm:w-auto btn-paper-primary px-8 py-4 text-xs"
              >
                <span>Register: Sherlock (₹25) + Get Among Us FREE!</span>
                <ArrowUpRight className="w-4 h-4 inline ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. COMPARISON MATRIX (PRINTED BROADSHEET LEDGER) */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t-2 border-neutral-900">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
            STATION TELEMETRY
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-neutral-950 uppercase tracking-tight">
            The Big Picture
          </h2>
          <p className="text-xs text-neutral-600 font-mono">
            TWO BACK-TO-BACK DAYS OF GAMES, DEDUCTION AND PRIZES
          </p>
        </div>

        <div className="overflow-x-auto border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_#111111]">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b-2 border-neutral-900 bg-neutral-950 text-white">
                <th className="py-4 px-6 uppercase font-bold text-neutral-300">Parameter</th>
                <th className="py-4 px-6 text-red-400 font-black uppercase">Among Us: Coded Chaos</th>
                <th className="py-4 px-6 text-amber-300 font-black uppercase">Sherlock: Tech Mystery</th>
              </tr>
            </thead>
            <tbody className="divide-y border-neutral-900/10 text-neutral-800">
              <tr className="hover:bg-neutral-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Date</td>
                <td className="py-4 px-6 text-red-600 font-bold">9 October 2026 (Holiday)</td>
                <td className="py-4 px-6 text-amber-800 font-bold">10 October 2026 (Holiday)</td>
              </tr>
              <tr className="bg-red-50/50 hover:bg-red-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Special Promo Offer</td>
                <td className="py-4 px-6 text-red-700 font-black">🔥 Get Sherlock FREE!</td>
                <td className="py-4 px-6 text-amber-900 font-black">🔥 Get Among Us FREE!</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Venue</td>
                <td className="py-4 px-6">AB1 Lobby, MUJ</td>
                <td className="py-4 px-6">AB1 Lobby, MUJ</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Time</td>
                <td className="py-4 px-6">12:00 PM to 6:00 PM</td>
                <td className="py-4 px-6">12:00 PM to 6:00 PM</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Prize Pool</td>
                <td className="py-4 px-6 font-black text-red-600">₹15,000 Cash</td>
                <td className="py-4 px-6 font-black text-amber-800">₹15,000 Cash</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Registration Fee</td>
                <td className="py-4 px-6 text-neutral-950 font-black">₹25 (Unlocks BOTH Days! 🔥)</td>
                <td className="py-4 px-6 text-neutral-950 font-black">₹25 (Unlocks BOTH Days! 🔥)</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Team Size</td>
                <td className="py-4 px-6">1 to 6 members</td>
                <td className="py-4 px-6">1 to 6 members</td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="py-4 px-6 font-bold text-neutral-950">Team Formation</td>
                <td className="py-4 px-6 text-neutral-900">On the day of the event</td>
                <td className="py-4 px-6 text-neutral-900">On the day of the event</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. ORGANIZING COMMITTEE & CONTACTS */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t-2 border-neutral-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-neutral-900 bg-white font-mono text-xs uppercase tracking-widest font-bold shadow-[2px_2px_0px_#111111]">
              NEXUS COORDINATION DESK
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-neutral-950 uppercase tracking-tight">
              Questions? Reach Out.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
              Connect with the official student coordinators from <strong className="text-neutral-950 font-bold">NEXUS MUJ</strong>. Desk check-ins open at 11:30 AM inside AB1 Lobby for on-the-spot team matching and 1+1 offer verification.
            </p>

            <div className="pt-2 space-y-3 font-mono text-xs">
              <div className="p-4 border-2 border-neutral-900 bg-white shadow-[3px_3px_0px_#111111] flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-sm bg-neutral-950 text-white flex items-center justify-center font-bold">
                  PJ
                </div>
                <div>
                  <span className="text-neutral-950 font-bold block text-sm">Preksha Jain</span>
                  <span className="text-neutral-500 text-xs">Lead Event Coordinator • NEXUS MUJ</span>
                </div>
              </div>

              <div className="p-4 border-2 border-neutral-900 bg-white shadow-[3px_3px_0px_#111111] flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-sm bg-red-600 text-white flex items-center justify-center font-bold">
                  AS
                </div>
                <div>
                  <span className="text-neutral-950 font-bold block text-sm">Aditya Sarkar</span>
                  <span className="text-neutral-500 text-xs">Lead Event Coordinator • NEXUS MUJ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_#111111] space-y-4 font-mono">
            <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2 uppercase">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>STATION DISPATCH HQ</span>
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans font-normal">
              Both events take place physically in <strong className="text-neutral-950 font-bold">AB1 Lobby</strong> at Manipal University Jaipur. Real-time updates, clues, and round calls will be pushed via the WhatsApp groups provided after form registration.
            </p>
            <div className="p-3.5 border-2 border-neutral-900 bg-red-50 text-xs text-red-900 font-bold">
              🔥 Reminder: 1 Registration = Access to BOTH Among Us & Sherlock Holmes!
            </div>
            <p className="text-sm font-bold text-red-600 italic pt-1 font-serif">
              "See you there, detective. Or impostor."
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. POSTER LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none"
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-[#fbfaf6] border-2 border-neutral-900 shadow-[8px_8px_0px_#111111] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b-2 border-neutral-900 flex items-center justify-between bg-white font-mono text-xs">
              <span className="text-neutral-950 font-bold uppercase tracking-wider">
                {selectedPoster === 'amongus'
                  ? 'AMONG US: CODED CHAOS // 9 OCT • AB1 LOBBY'
                  : 'SHERLOCK HOLMES: TECH MYSTERY // 10 OCT • AB1 LOBBY'}
              </span>
              <button
                onClick={() => setSelectedPoster(null)}
                className="p-1 rounded border border-neutral-900 bg-white hover:bg-neutral-100 text-neutral-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-neutral-950">
              <img
                src={selectedPoster === 'amongus' ? '/poster-among-us.jpg' : '/poster-sherlock.jpg'}
                alt="Official Event Poster"
                className="max-h-[72vh] w-auto object-contain border-2 border-white shadow-2xl"
              />
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 border-t-2 border-neutral-900 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <span className="text-red-600 font-bold text-center sm:text-left">
                ★ 1+1 FREE PROMO: ₹25 Entry Unlocks BOTH Flagship Events!
              </span>
              <a
                href={
                  selectedPoster === 'amongus'
                    ? 'https://tinyurl.com/bdfp2emu'
                    : 'https://tinyurl.com/45sbus6m'
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="w-full sm:w-auto btn-paper-red px-6 py-2.5 text-xs text-center"
              >
                <span>Claim 1+1 Pass Now</span>
                <ArrowUpRight className="w-3.5 h-3.5 inline ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/amongus-admin') ||
    location.pathname.startsWith('/dashboard');

  const isPlayerRoute =
    location.pathname.startsWith('/play') ||
    location.pathname.startsWith('/mission') ||
    location.pathname.startsWith('/player');

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-mono text-xs text-neutral-600">INITIALIZING OPERATIONS GATEWAY...</div>}>
        <Routes>
          <Route path="/admin" element={<AmongUsAdmin />} />
          <Route path="/dashboard" element={<AmongUsAdmin />} />
          <Route path="/amongus-admin" element={<AmongUsAdmin />} />
        </Routes>
      </Suspense>
    );
  }

  if (isPlayerRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#030611] flex items-center justify-center font-mono text-xs text-cyan-400">CONNECTING TO MISSION DECK...</div>}>
        <Routes>
          <Route path="/play" element={<PlayerMission />} />
          <Route path="/mission" element={<PlayerMission />} />
          <Route path="/player" element={<PlayerMission />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f4ee] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Physical Archival Header & Masthead */}
      <header className="border-b-2 border-neutral-900 bg-[#fbfaf6] sticky top-0 z-40 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              <img
                src="/logo.jpeg"
                alt="NEXUS Insignia"
                className="w-11 h-11 object-contain rounded-sm border-2 border-neutral-900 bg-white p-0.5 shadow-[2px_2px_0px_#111111] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition"
              />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-base tracking-tight text-neutral-950 font-serif group-hover:text-red-600 transition block uppercase">
                NEXUS
              </span>
              <span className="font-mono text-[9px] tracking-wider text-neutral-600 uppercase block font-bold">
                RESEARCH • SPACE • TECH • MUJ
              </span>
            </div>
          </Link>

          {/* Navigation Items (No Public Admin Link) */}
          <nav className="flex items-center gap-3 sm:gap-5 font-mono text-xs tracking-wider">
            <a href="#dossiers" className="text-neutral-700 hover:text-neutral-950 transition uppercase hidden md:inline font-bold">
              [DOSSIERS]
            </a>
            <a href="#enlist" className="text-neutral-700 hover:text-neutral-950 transition uppercase hidden sm:inline font-bold">
              [ENLIST]
            </a>

            {/* Direct Player Mission Link */}
            <Link
              to="/play"
              className="btn-paper-white px-3.5 py-2 text-xs flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-neutral-950" />
              <span>Player Deck</span>
            </Link>

            {/* Direct Register Button with 1+1 FREE highlight */}
            <a
              href="#enlist"
              className="btn-paper-red px-4 sm:px-5 py-2 sm:py-2.5 text-xs flex items-center gap-1.5"
            >
              <span>🔥 Claim 1+1 Pass • ₹25</span>
            </a>
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

      {/* BroadSheet Colophon Footer with Private Staff Key */}
      <footer className="border-t-2 border-neutral-900 py-12 bg-white font-mono text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt="NEXUS MUJ"
                className="w-9 h-9 rounded-sm object-contain border border-neutral-900 bg-white"
              />
              <div>
                <span className="text-neutral-950 font-bold block text-sm font-serif">NEXUS MUJ × TECHIDEATE'26</span>
                <span className="text-[10px] text-neutral-500 block">MANIPAL UNIVERSITY JAIPUR • AB1 LOBBY</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase font-bold">
              <a href="#dossiers" className="hover:text-neutral-950 transition">Classified Dossiers</a>
              <a href="#enlist" className="hover:text-neutral-950 transition">How to Register</a>
              <a href="#contact" className="hover:text-neutral-950 transition">Coordinators</a>
              <Link to="/play" className="text-red-600 hover:text-red-700 transition">Player Deck</Link>
            </div>
          </div>

          <div className="border-t border-neutral-900/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <div>
              © 2026 NEXUS MUJ (Research • Space • Technology) • TechIdeate'26 Official BroadSheet.
            </div>

            {/* Discreet private staff access key */}
            <div className="flex items-center gap-4">
              <span>9 & 10 October 2026</span>
              <Link
                to="/admin"
                className="text-neutral-400 hover:text-neutral-800 transition flex items-center gap-1 opacity-50 hover:opacity-100"
                title="Internal Facilitator Access"
              >
                <KeyRound className="w-3 h-3" />
                <span className="text-[9px]">[STAFF]</span>
              </Link>
            </div>
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
