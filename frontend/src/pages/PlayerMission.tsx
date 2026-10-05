import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Flame,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  Users,
  LogOut,
  Terminal,
  Zap,
  Lock,
  Unlock,
  ChevronRight,
  RefreshCw,
  Award,
  Crosshair,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Team, RoomType, SabotageType, StationTask } from '../types';
import { GameDatabase, EventControls, ActivityLogItem } from '../lib/gameDatabase';
import { GameAudio } from '../utils/gameAudio';
import { AMONG_US_ROOMS } from '../data/initialAdminData';

// Sector metadata for mobile radar
const SECTOR_INFO: Record<RoomType, { code: string; icon: string; desc: string }> = {
  Electrical: { code: 'SEC-01', icon: '⚡', desc: 'Main power distribution & breakers' },
  Reactor: { code: 'SEC-02', icon: '⚛️', desc: 'Core quantum flux manifold' },
  MedBay: { code: 'SEC-03', icon: '🧬', desc: 'Biometric scan diagnostics' },
  Navigation: { code: 'SEC-04', icon: '🧭', desc: 'Sublight charting telemetry' },
  Admin: { code: 'SEC-05', icon: '📋', desc: 'ID swipe & deck manifest' },
  Weapons: { code: 'SEC-06', icon: '🎯', desc: 'Meteor deflection targeting' },
  O2: { code: 'SEC-07', icon: '💨', desc: 'Atmospheric oxygen scrubbers' },
  Cafeteria: { code: 'SEC-08', icon: '☕', desc: 'Central emergency gathering hub' },
  Communications: { code: 'SEC-09', icon: '📡', desc: 'Subspace radio transceiver' },
};

export default function PlayerMission() {
  // Authentication State
  const [team, setTeam] = useState<Team | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<{ text: string; x: number; y: number } | null>(null);
  const speechTimerRef = useRef<number | null>(null);

  // Live Database State
  const [eventControls, setEventControls] = useState<EventControls>({
    id: 'primary_match',
    status: 'running',
    impostor_powers_active: true,
    active_sabotage: null,
    emergency_active: false,
    elapsed_seconds: 1420,
    current_round: 1,
  });
  const [tasks, setTasks] = useState<StationTask[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'radar' | 'tasks' | 'sabotage' | 'squad' | 'logs'>('radar');

  // Interactive Modals
  const [selectedTask, setSelectedTask] = useState<StationTask | null>(null);
  const [isRepairingSabotage, setIsRepairingSabotage] = useState(false);
  const [isCallingEmergency, setIsCallingEmergency] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [selectedKillTarget, setSelectedKillTarget] = useState('');
  const [showKillModal, setShowKillModal] = useState(false);

  // Canvas Refs
  const starsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const warpCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tiltStageRef = useRef<HTMLDivElement | null>(null);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1. Initial Load & Persistent Session Check
  useEffect(() => {
    const savedTeamId = localStorage.getItem('nexus_player_team_id');
    if (savedTeamId) {
      GameDatabase.getTeam(savedTeamId).then(loaded => {
        if (loaded && loaded.status !== 'eliminated') {
          setTeam(loaded);
        } else {
          localStorage.removeItem('nexus_player_team_id');
        }
      });
    }

    // Load initial event controls & tasks
    GameDatabase.getEventControls().then(setEventControls);
    GameDatabase.getTasks().then(setTasks);
    GameDatabase.getActivityLogs().then(setActivityLogs);

    // Subscribe to Event Controls
    const unsubControls = GameDatabase.subscribeToEventControls(updated => {
      setEventControls(updated);
      if (updated.active_sabotage) {
        GameAudio.sabotage();
      }
      if (updated.emergency_active) {
        GameAudio.emergency();
      }
    });

    // Subscribe to Tasks
    const unsubTasks = GameDatabase.subscribeToTasks(updated => {
      setTasks(updated);
    });

    // Subscribe to Logs
    const unsubLogs = GameDatabase.subscribeToActivityLogs(updated => {
      setActivityLogs(updated);
    });

    return () => {
      unsubControls();
      unsubTasks();
      unsubLogs();
    };
  }, []);

  // 2. Subscribe to Team Changes when authenticated
  useEffect(() => {
    if (!team?.id) return;
    const unsubTeam = GameDatabase.subscribeToTeam(team.id, updated => {
      setTeam(updated);
      if (updated.status === 'eliminated') {
        alert('Your squad has been ejected from the station.');
        handleLogout();
      }
    });
    return () => unsubTeam();
  }, [team?.id]);

  // 3. Twinkling Stars Animation for Login Portal
  useEffect(() => {
    if (team || isWarping) return;
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const stars: Array<{ x: number; y: number; r: number; p: number }> = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.4,
        r: Math.random() * 1.5 + 0.4,
        p: Math.random() * 6,
      });
    }

    let shootingStar: { x: number; y: number; l: number } | null = null;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Stars
      stars.forEach(s => {
        ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(time / 900 + s.p));
        ctx.fillStyle = '#cfe4ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Occasional shooting star
      if (!shootingStar && Math.random() < 0.005) {
        shootingStar = { x: Math.random() * width * 0.8, y: Math.random() * height * 0.15, l: 0 };
      }

      if (shootingStar) {
        shootingStar.l += 0.04;
        ctx.globalAlpha = Math.max(0, 1 - shootingStar.l);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x + shootingStar.l * width * 0.25, shootingStar.y + shootingStar.l * width * 0.1);
        ctx.lineTo(
          shootingStar.x + shootingStar.l * width * 0.25 - width * 0.08,
          shootingStar.y + shootingStar.l * width * 0.1 - width * 0.03
        );
        ctx.stroke();

        if (shootingStar.l >= 1) shootingStar = null;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [team, isWarping]);

  // 4. Parallax 3D Tilt on Pointer Move for Login Portal
  const handlePointerMove = (e: React.PointerEvent) => {
    if (team || isWarping || !tiltStageRef.current) return;
    const rect = tiltStageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tiltStageRef.current.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
  };

  const handlePointerLeave = () => {
    if (tiltStageRef.current) {
      tiltStageRef.current.style.transform = '';
    }
  };

  // 5. Speech Bubble trigger for hull crewmates
  const handleCrewmateTap = (message: string, xPercent: number, yPercent: number) => {
    if (soundEnabled) GameAudio.beep(540 + Math.random() * 200, 0.12);
    if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current);
    setSpeechBubble({ text: message, x: xPercent, y: yPercent });
    speechTimerRef.current = window.setTimeout(() => {
      setSpeechBubble(null);
    }, 2200);
  };

  // 6. Form Submission & Hyperspace Warp Transition
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!teamNameInput.trim()) {
      setLoginError('Enter your registered squad name.');
      if (soundEnabled) GameAudio.error();
      return;
    }
    if (!passcodeInput.trim()) {
      setLoginError('Enter your squad passcode or captain phone number.');
      if (soundEnabled) GameAudio.error();
      return;
    }

    setIsScanning(true);
    if (soundEnabled) GameAudio.beep(880, 0.1);

    try {
      const res = await GameDatabase.loginTeam(teamNameInput, passcodeInput);
      if (!res.success || !res.team) {
        setIsScanning(false);
        setLoginError(res.error || 'Authentication rejected. Contact Event Facilitator.');
        if (soundEnabled) GameAudio.error();
        return;
      }

      // Validated! Run Hyperspace Warp
      setIsScanning(false);
      setIsWarping(true);
      if (soundEnabled) GameAudio.warp();

      // Run Hyperspace Canvas Animation
      runHyperspaceWarp(() => {
        setTeam(res.team!);
        localStorage.setItem('nexus_player_team_id', res.team!.id);
        setIsWarping(false);
      });
    } catch (err) {
      setIsScanning(false);
      setLoginError('Error connecting to Skeld telemetry cluster.');
      if (soundEnabled) GameAudio.error();
    }
  };

  // Hyperspace canvas runner
  const runHyperspaceWarp = (onComplete: () => void) => {
    const canvas = warpCanvasRef.current;
    if (!canvas) {
      onComplete();
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onComplete();
      return;
    }

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const cx = width / 2;
    const cy = height / 2;
    const maxDim = Math.max(width, height);

    const stars: Array<{ a: number; d: number; v: number }> = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        a: Math.random() * Math.PI * 2,
        d: Math.random() * 0.2,
        v: Math.random() * 0.01 + 0.005,
      });
    }

    const t0 = performance.now();
    const duration = 2000;

    const frame = (now: number) => {
      const elapsed = now - t0;
      const progress = Math.min(elapsed / duration, 1);

      ctx.fillStyle = 'rgba(2, 3, 12, 0.25)';
      ctx.fillRect(0, 0, width, height);

      stars.forEach(s => {
        const p = s.d;
        s.d += s.v * (1 + progress * 12);
        const q = s.d;
        ctx.strokeStyle = `rgba(180, 220, 255, ${Math.min(0.3 + q, 1)})`;
        ctx.lineWidth = 1 + q * 2.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.a) * p * maxDim, cy + Math.sin(s.a) * p * maxDim);
        ctx.lineTo(cx + Math.cos(s.a) * q * maxDim, cy + Math.sin(s.a) * q * maxDim);
        ctx.stroke();

        if (q > 0.85) s.d = Math.random() * 0.1;
      });

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(frame);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_player_team_id');
    setTeam(null);
    setTeamNameInput('');
    setPasscodeInput('');
    setActiveTab('radar');
  };

  // 7. Interactive Game Actions
  const handleCompleteTask = async (task: StationTask) => {
    if (!team) return;
    if (task.status === 'completed') return;

    if (soundEnabled) GameAudio.success();
    await GameDatabase.completeTask(task.id, team.id, team.name, task.points);
    setSelectedTask(null);
  };

  const handleTriggerSabotageAction = async (type: SabotageType) => {
    if (!team || !team.isImpostor) return;
    if (!eventControls.impostor_powers_active) {
      alert('Impostor powers are currently frozen by the Master Admin!');
      return;
    }
    if (soundEnabled) GameAudio.sabotage();
    await GameDatabase.triggerSabotage(type, team.name);
  };

  const handleResolveSabotageAction = async () => {
    if (!team || !eventControls.active_sabotage) return;
    if (soundEnabled) GameAudio.success();
    await GameDatabase.resolveSabotage(eventControls.active_sabotage, team.id, team.name);
    setIsRepairingSabotage(false);
  };

  const handleCallEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    if (soundEnabled) GameAudio.emergency();
    await GameDatabase.callEmergency(team.name, emergencyReason || 'Suspicious motion detected');
    setIsCallingEmergency(false);
    setEmergencyReason('');
  };

  const handleLogCovertKill = async () => {
    if (!team || !team.isImpostor || !selectedKillTarget) return;
    if (soundEnabled) GameAudio.beep(200, 0.3, 'sawtooth');
    await GameDatabase.logCovertElimination(team.id, team.name, selectedKillTarget);
    setShowKillModal(false);
    setSelectedKillTarget('');
  };

  // ============================================================================
  // RENDER A: AUTHENTIC LOGIN PORTAL STAGE (Unauthenticated)
  // ============================================================================
  if (!team) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center relative overflow-hidden select-none p-4">
        {/* Blurred ambient poster backdrop */}
        <div
          className="fixed inset-[-5%] bg-cover bg-center filter blur-2xl opacity-40 pointer-events-none"
          style={{ backgroundImage: `url('/mission-poster.jpg')` }}
        />

        {/* Parallax Container Stage */}
        <div
          ref={tiltStageRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative z-10 w-full max-w-[420px] aspect-[941/1672] rounded-3xl overflow-hidden shadow-2xl border border-blue-900/40 bg-cover bg-center flex flex-col justify-between"
          style={{
            backgroundImage: `url('/mission-poster.jpg')`,
            perspective: '900px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Twinkling Stars Overlay Canvas */}
          <canvas ref={starsCanvasRef} className="absolute inset-0 pointer-events-none z-10" />

          {/* UFO Animation elements */}
          <div className="absolute top-[9%] left-0 w-8 h-3.5 rounded-full bg-blue-300/30 shadow-[0_0_12px_#8fe3ff] pointer-events-none animate-[fly_24s_linear_infinite]" />
          <div className="absolute top-[15%] left-0 w-6 h-2.5 rounded-full bg-blue-300/30 shadow-[0_0_10px_#8fe3ff] pointer-events-none animate-[fly_36s_linear_infinite]" />

          {/* Radar Scanline */}
          <div className="absolute top-[36.5%] left-[19%] w-[62%] h-[36%] rounded-3xl overflow-hidden pointer-events-none z-10">
            <div className="w-full h-10 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-[scan_4s_linear_infinite]" />
          </div>

          {/* Audio toggle button top-right */}
          <div className="absolute top-4 right-4 z-30">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-black/60 backdrop-blur-xs text-blue-200 border border-blue-500/30 text-xs"
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
            </button>
          </div>

          {/* Interactive Crewmates on the hull */}
          <button
            type="button"
            onClick={() => handleCrewmateTap('Red is definitely not sus.', 20, 36)}
            className="absolute left-0 top-[38%] w-[22%] h-[18%] cursor-pointer z-20 outline-none"
            aria-label="Red Crewmate"
          />
          <button
            type="button"
            onClick={() => handleCrewmateTap('I was in electrical. Trust me.', 70, 50)}
            className="absolute right-0 top-[52%] w-[20%] h-[12%] cursor-pointer z-20 outline-none"
            aria-label="Purple Crewmate"
          />
          <button
            type="button"
            onClick={() => handleCrewmateTap('Good luck, crew! Find the impostor!', 25, 70)}
            className="absolute left-0 top-[71%] w-[28%] h-[15%] cursor-pointer z-20 outline-none"
            aria-label="Yellow Crewmate"
          />
          <button
            type="button"
            onClick={() => handleCrewmateTap('Stay together. Check your sector!', 60, 79)}
            className="absolute right-0 top-[80%] w-[32%] h-[18%] cursor-pointer z-20 outline-none"
            aria-label="Blue Crewmate"
          />

          {/* Animated Speech Bubble */}
          {speechBubble && (
            <div
              className="absolute z-30 bg-white text-neutral-900 px-3.5 py-1.5 rounded-2xl text-xs font-semibold font-sans shadow-lg border border-neutral-800 transition-all pointer-events-none transform -translate-x-1/2 -translate-y-full animate-bounce"
              style={{ left: `${speechBubble.x}%`, top: `${speechBubble.y}%` }}
            >
              {speechBubble.text}
            </div>
          )}

          {/* Central Login Terminal Form */}
          <div className="absolute inset-0 flex flex-col justify-center items-center px-8 z-20">
            <form onSubmit={handleLoginSubmit} className="w-full space-y-3 pt-32">
              {/* Team Name Input */}
              <div className="relative">
                <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-b from-[#071342]/90 to-[#050b2b]/95 border border-[#2d6bff] shadow-[0_0_15px_rgba(45,107,255,0.35)] focus-within:border-blue-400 focus-within:shadow-[0_0_20px_rgba(45,107,255,0.6)] transition">
                  <Users className="w-4 h-4 text-blue-300 shrink-0" />
                  <input
                    type="text"
                    value={teamNameInput}
                    onChange={e => setTeamNameInput(e.target.value)}
                    onFocus={() => soundEnabled && GameAudio.click()}
                    placeholder="Registered Squad Name"
                    className="w-full bg-transparent text-sm text-blue-100 placeholder-blue-300/70 outline-none font-sans font-medium"
                    autoComplete="off"
                    autoCapitalize="words"
                  />
                </label>
              </div>

              {/* Passcode / Phone Input */}
              <div className="relative">
                <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-b from-[#071342]/90 to-[#050b2b]/95 border border-[#2d6bff] shadow-[0_0_15px_rgba(45,107,255,0.35)] focus-within:border-blue-400 focus-within:shadow-[0_0_20px_rgba(45,107,255,0.6)] transition">
                  <Lock className="w-4 h-4 text-blue-300 shrink-0" />
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={e => setPasscodeInput(e.target.value)}
                    onFocus={() => soundEnabled && GameAudio.click()}
                    placeholder="Captain Phone or Badge Code"
                    className="w-full bg-transparent text-sm text-blue-100 placeholder-blue-300/70 outline-none font-sans font-medium"
                    autoComplete="off"
                  />
                </label>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="text-center text-xs font-semibold text-red-400 bg-red-950/80 border border-red-500/50 rounded-xl px-3 py-1.5 shadow-md">
                  {loginError}
                </div>
              )}

              {/* Enter Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full py-3 px-6 bg-gradient-to-r from-[#2a62ff] to-[#0b2fc4] hover:from-[#3a72ff] hover:to-[#1b3fd4] active:scale-95 text-white font-extrabold uppercase tracking-wider rounded-full shadow-[0_0_25px_rgba(45,107,255,0.6)] border border-blue-400/50 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Biometrics...</span>
                    </>
                  ) : (
                    <span>Board Skeld Station</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] uppercase font-mono text-blue-300/60 tracking-widest">
                  LIVE SUPABASE TELEMETRY ENLISTMENT
                </span>
              </div>
            </form>
          </div>

          {/* Hyperspace Warp Canvas Overlay */}
          <div
            className={`absolute inset-0 bg-[#02030c] z-50 transition-opacity duration-300 pointer-events-none ${
              isWarping ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <canvas ref={warpCanvasRef} className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-2xl font-bold font-sans tracking-wide text-white drop-shadow-[0_0_20px_#4d8dff]">
                Welcome Aboard, {teamNameInput}
              </h2>
              <p className="text-sm text-blue-200 mt-2 font-mono">
                Synchronizing Station Sector & Covert Clearances...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER B: AUTHENTICATED MOBILE PLAYER DECK (Crewmate vs Impostor)
  // ============================================================================
  const isImpostor = Boolean(team.isImpostor);
  const assignedRoom: RoomType = team.assignedRoom || 'Cafeteria';
  const roomMeta = SECTOR_INFO[assignedRoom] || SECTOR_INFO.Cafeteria;

  // Filter tasks
  const roomTasks = tasks.filter(t => t.room === assignedRoom);
  const allOtherTasks = tasks.filter(t => t.room !== assignedRoom);

  return (
    <div
      className={`min-h-[100dvh] max-h-[100dvh] w-full flex flex-col font-sans select-none overflow-hidden ${
        isImpostor ? 'bg-[#0f0407] text-neutral-100' : 'bg-[#050b1a] text-neutral-100'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* 1. TOP STATUS HUD (Mobile Safe Area) */}
      <header
        className={`px-4 py-3 border-b shrink-0 flex items-center justify-between gap-2 backdrop-blur-md z-30 ${
          isImpostor ? 'bg-red-950/40 border-red-900/50' : 'bg-blue-950/40 border-blue-900/50'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border ${
              isImpostor
                ? 'bg-red-900/60 border-red-600 text-red-200'
                : 'bg-blue-900/60 border-blue-500 text-blue-200'
            }`}
          >
            {roomMeta.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white truncate leading-tight">{team.name}</h1>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                  isImpostor
                    ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(255,42,58,0.8)]'
                    : 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                }`}
              >
                {isImpostor ? 'IMPOSTOR' : 'CREWMATE'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 truncate mt-0.5">
              {roomMeta.code} • {assignedRoom}
            </div>
          </div>
        </div>

        {/* Live Score & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-black/50 border border-white/10 font-mono text-xs font-bold text-amber-300">
            {team.score} pts
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. CRITICAL ALARM STRIPS (Live Realtime Overrides) */}
      {/* Sabotage Strobe Alert */}
      {eventControls.active_sabotage && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between animate-pulse shrink-0 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 fill-current shrink-0" />
            <div className="text-xs font-black uppercase tracking-wider">
              CRITICAL SABOTAGE: {eventControls.active_sabotage.toUpperCase()}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('sabotage')}
            className="text-[11px] font-bold uppercase px-2.5 py-1 bg-white text-red-600 rounded-lg shadow-sm"
          >
            Repair
          </button>
        </div>
      )}

      {/* Emergency Meeting Strobe Alert */}
      {eventControls.emergency_active && (
        <div className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between shrink-0 shadow-lg font-bold text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 fill-current" />
            <span>EMERGENCY MEETING IN PROGRESS</span>
          </div>
          <button
            onClick={() => setActiveTab('radar')}
            className="text-[10px] uppercase px-2 py-0.5 bg-black text-white rounded-md"
          >
            Attend
          </button>
        </div>
      )}

      {/* Impostor Powers Frozen Warning */}
      {isImpostor && !eventControls.impostor_powers_active && (
        <div className="bg-neutral-900 border-b border-red-500/40 text-red-400 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between shrink-0">
          <span>⚠️ POWERS FROZEN BY LEAD ADMIN</span>
          <span className="font-bold text-red-500">LOCKED</span>
        </div>
      )}

      {/* 3. MAIN SCROLLABLE CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* =================================================================== */}
        {/* TAB 1: RADAR / SECTOR STATION TELEMETRY */}
        {/* =================================================================== */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            {/* Current Station Compartment Card */}
            <div
              className={`p-5 rounded-2xl border relative overflow-hidden ${
                isImpostor
                  ? 'bg-gradient-to-br from-red-950/40 to-black/80 border-red-800/60 shadow-[0_0_20px_rgba(255,42,58,0.15)]'
                  : 'bg-gradient-to-br from-blue-950/40 to-black/80 border-blue-800/60 shadow-[0_0_20px_rgba(45,107,255,0.15)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    ASSIGNED SECTOR
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">{assignedRoom}</h2>
                  <p className="text-xs text-neutral-300 mt-1">{roomMeta.desc}</p>
                </div>
                <span className="text-3xl p-2 rounded-2xl bg-black/40 border border-white/10 shrink-0">
                  {roomMeta.icon}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block text-[10px]">SECTOR CODE</span>
                  <span className="font-bold text-white">{roomMeta.code}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">LOCAL TASKS</span>
                  <span className="font-bold text-white">
                    {roomTasks.filter(t => t.status === 'completed').length} / {roomTasks.length} Done
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Meeting Trigger Control */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Emergency Gathering Protocol
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Call all crew to Cafeteria to report dead bodies or vote
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCallingEmergency(true)}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-98 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 border border-red-400/40"
              >
                <AlertTriangle className="w-4 h-4 fill-current" />
                <span>Call Emergency Meeting</span>
              </button>
            </div>

            {/* Skeld 9-Compartment Status Grid */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-2xl">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">
                Skeld Life Support Grid
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {AMONG_US_ROOMS.map(r => {
                  const meta = SECTOR_INFO[r];
                  const isCurrent = r === assignedRoom;
                  return (
                    <div
                      key={r}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        isCurrent
                          ? isImpostor
                            ? 'bg-red-950/60 border-red-500 shadow-xs'
                            : 'bg-blue-950/60 border-cyan-400 shadow-xs'
                          : 'bg-black/20 border-white/5 text-neutral-400'
                      }`}
                    >
                      <span className="text-lg block">{meta.icon}</span>
                      <span className="text-[11px] font-bold text-white block mt-1 truncate">{r}</span>
                      <span className="text-[9px] font-mono text-neutral-400 block">{meta.code}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: TASKS CHECKLIST (Crewmate Tasks vs Impostor Fake Tasks) */}
        {/* =================================================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isImpostor ? 'Covert Deception Manifest' : 'Station Work Tasks'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isImpostor
                    ? 'Use these tasks to fake alibis while sabotaging.'
                    : 'Complete station tasks to earn squad points.'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/10 text-neutral-200">
                {tasks.filter(t => t.status === 'completed').length} / {tasks.length}
              </span>
            </div>

            {/* Current Room Tasks Section */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                PRIMARY SECTOR TASKS ({assignedRoom})
              </span>

              {roomTasks.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-neutral-500 text-xs">
                  No tasks stationed in {assignedRoom}
                </div>
              ) : (
                roomTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => !isImpostor && task.status !== 'completed' && setSelectedTask(task)}
                    className={`p-3.5 rounded-xl border transition ${
                      task.status === 'completed'
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : isImpostor
                        ? 'bg-black/40 border-white/10'
                        : 'bg-black/40 border-blue-900/60 hover:border-blue-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Terminal className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                          <span>{task.title}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300 shrink-0">
                        +{task.points} pts
                      </span>
                    </div>

                    {!isImpostor && task.status !== 'completed' && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
                        <span>Tap to Execute</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Other Sector Tasks */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                OTHER COMPARTMENT TASKS
              </span>

              {allOtherTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => !isImpostor && task.status !== 'completed' && setSelectedTask(task)}
                  className={`p-3.5 rounded-xl border transition ${
                    task.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400/80'
                      : isImpostor
                      ? 'bg-black/30 border-white/5'
                      : 'bg-black/30 border-white/10 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          [{task.room}]
                        </span>
                        <span>{task.title}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">+{task.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: SABOTAGE (Impostor Switchboard vs Crewmate Repair) */}
        {/* =================================================================== */}
        {activeTab === 'sabotage' && (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h3 className="text-sm font-bold text-white">
                {isImpostor ? 'Covert Sabotage Switchboard' : 'Station Damage Control'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isImpostor
                  ? 'Trigger critical malfunctions to scatter and disorient crew.'
                  : 'Monitor station telemetry and repair active sabotages.'}
              </p>
            </div>

            {/* Active Sabotage Alert Box */}
            {eventControls.active_sabotage ? (
              <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500 shadow-[0_0_20px_rgba(255,42,58,0.3)] animate-pulse">
                <div className="flex items-center gap-2 text-red-300 text-xs font-bold uppercase">
                  <AlertTriangle className="w-4 h-4 fill-current text-red-500" />
                  <span>CATASTROPHIC FAILURE DETECTED</span>
                </div>
                <h4 className="text-lg font-black text-white mt-1 uppercase">
                  {eventControls.active_sabotage} ANOMALY
                </h4>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Life support integrity compromised. Immediate manual override required.
                </p>

                <div className="mt-4 pt-3 border-t border-red-500/30 flex gap-2">
                  <button
                    onClick={handleResolveSabotageAction}
                    className="flex-1 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
                  >
                    Stabilize & Clear Sabotage (+120 pts)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400">All Sectors Nominal</div>
                  <div className="text-[11px] text-neutral-400">No active sabotages or leaks reported.</div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            )}

            {/* Impostor Actions: Trigger Sabotage buttons */}
            {isImpostor && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                  COVERT SABOTEUR OVERRIDES
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleTriggerSabotageAction('reactor')}
                    disabled={!eventControls.impostor_powers_active || Boolean(eventControls.active_sabotage)}
                    className="p-3.5 rounded-xl border border-red-800/50 bg-red-950/30 hover:bg-red-900/40 text-left transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">⚛️</span>
                    <div className="font-bold text-xs text-white mt-1">Reactor Core</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Countdown meltdown</div>
                  </button>

                  <button
                    onClick={() => handleTriggerSabotageAction('oxygen')}
                    disabled={!eventControls.impostor_powers_active || Boolean(eventControls.active_sabotage)}
                    className="p-3.5 rounded-xl border border-red-800/50 bg-red-950/30 hover:bg-red-900/40 text-left transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">💨</span>
                    <div className="font-bold text-xs text-white mt-1">Oxygen Purge</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Atmospheric failure</div>
                  </button>

                  <button
                    onClick={() => handleTriggerSabotageAction('lights')}
                    disabled={!eventControls.impostor_powers_active || Boolean(eventControls.active_sabotage)}
                    className="p-3.5 rounded-xl border border-red-800/50 bg-red-950/30 hover:bg-red-900/40 text-left transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">⚡</span>
                    <div className="font-bold text-xs text-white mt-1">Kill Lights</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Black out sectors</div>
                  </button>

                  <button
                    onClick={() => handleTriggerSabotageAction('comms')}
                    disabled={!eventControls.impostor_powers_active || Boolean(eventControls.active_sabotage)}
                    className="p-3.5 rounded-xl border border-red-800/50 bg-red-950/30 hover:bg-red-900/40 text-left transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">📡</span>
                    <div className="font-bold text-xs text-white mt-1">Jam Comms</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Hide tasks & map</div>
                  </button>
                </div>

                {/* Covert Kill Record button */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowKillModal(true)}
                    disabled={!eventControls.impostor_powers_active}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,42,58,0.5)] flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>Report Covert Elimination (+150 pts)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: SQUAD MANIFEST & IDENTITY */}
        {/* =================================================================== */}
        {activeTab === 'squad' && (
          <div className="space-y-4">
            {/* Squad Dossier Card */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{team.name}</h3>
                  <div className="text-xs text-neutral-400 font-mono">Badge: {team.badgeCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-mono font-bold text-amber-300">{team.score}</div>
                  <div className="text-[10px] text-neutral-500">TOTAL POINTS</div>
                </div>
              </div>

              {/* Impostor Classified Identity banner */}
              {isImpostor && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-600 text-xs space-y-1">
                  <div className="font-black text-red-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    <span>TOP SECRET // COVERT OPERATIVE</span>
                  </div>
                  <div className="text-neutral-300">
                    Designated Infiltrator:{' '}
                    <strong className="text-white">
                      {team.impostorPlayerName || team.leaderName}
                    </strong>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px]">COMMANDER</span>
                  <span className="font-medium text-white">{team.leaderName}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px]">ENLISTED PERSONNEL</span>
                  <span className="font-medium text-white">
                    {team.members?.join(', ') || team.leaderName}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block text-[10px]">ASSIGNED ARENA DECK</span>
                  <span className="font-medium text-white">
                    {team.assignedRoom || 'Unassigned'} Sector
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Match Telemetry */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500">EVENT TELEMETRY</span>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Match Status:</span>
                <span className="font-bold text-white capitalize">{eventControls.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Impostor Powers:</span>
                <span className="font-bold text-white">
                  {eventControls.impostor_powers_active ? 'Active' : 'Frozen'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Tasks Completed:</span>
                <span className="font-bold text-white">{team.tasksCompleted}</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: TELEMETRY STREAM (Realtime Activity Logs) */}
        {/* =================================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Skeld Telemetry Stream
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                LIVE SYNC
              </span>
            </div>

            <div className="space-y-2">
              {activityLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                    log.severity === 'danger'
                      ? 'bg-red-950/30 border-red-800/40 text-red-200'
                      : log.severity === 'warning'
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      : log.severity === 'success'
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                      : 'bg-black/30 border-white/10 text-neutral-300'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span className="uppercase font-bold">[{log.type}]</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. BOTTOM MOBILE NAVIGATION BAR (Thumb Friendly) */}
      <nav
        className={`border-t px-2 py-2 shrink-0 grid grid-cols-5 gap-1 backdrop-blur-lg z-30 ${
          isImpostor ? 'bg-red-950/50 border-red-900/60' : 'bg-[#050b1a]/90 border-blue-900/60'
        }`}
      >
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center py-1.5 rounded-xl transition ${
            activeTab === 'radar'
              ? isImpostor
                ? 'text-red-400 font-bold'
                : 'text-cyan-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Radio className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Sector</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center py-1.5 rounded-xl transition ${
            activeTab === 'tasks'
              ? isImpostor
                ? 'text-red-400 font-bold'
                : 'text-cyan-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Terminal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isImpostor ? 'Deception' : 'Tasks'}</span>
        </button>

        <button
          onClick={() => setActiveTab('sabotage')}
          className={`flex flex-col items-center py-1.5 rounded-xl relative transition ${
            activeTab === 'sabotage'
              ? isImpostor
                ? 'text-red-400 font-bold'
                : 'text-cyan-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          {eventControls.active_sabotage && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
          <AlertTriangle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Sabotage</span>
        </button>

        <button
          onClick={() => setActiveTab('squad')}
          className={`flex flex-col items-center py-1.5 rounded-xl transition ${
            activeTab === 'squad'
              ? isImpostor
                ? 'text-red-400 font-bold'
                : 'text-cyan-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Squad</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex flex-col items-center py-1.5 rounded-xl transition ${
            activeTab === 'logs'
              ? isImpostor
                ? 'text-red-400 font-bold'
                : 'text-cyan-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Telemetry</span>
        </button>
      </nav>

      {/* =================================================================== */}
      {/* MODAL: TASK EXECUTION TERMINAL */}
      {/* =================================================================== */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-blue-500/60 rounded-3xl p-6 w-full max-w-sm text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">
                  [{selectedTask.room}] SECTOR TASK
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">{selectedTask.description}</p>

            {selectedTask.snippet && (
              <div className="bg-black/60 p-3 rounded-xl border border-white/10 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                <pre>{selectedTask.snippet}</pre>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteTask(selectedTask)}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
              >
                Verify & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CALL EMERGENCY MEETING */}
      {/* =================================================================== */}
      {isCallingEmergency && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a0a0f] border border-red-500/60 rounded-3xl p-6 w-full max-w-sm text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-red-500/30 pb-3">
              <h3 className="text-base font-bold text-red-400 uppercase tracking-wider">
                Emergency Assembly
              </h3>
              <button
                onClick={() => setIsCallingEmergency(false)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCallEmergencySubmit} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-300 block mb-1">
                  Reason for Emergency Meeting:
                </label>
                <input
                  type="text"
                  value={emergencyReason}
                  onChange={e => setEmergencyReason(e.target.value)}
                  placeholder="e.g. Dead body in Electrical or Red vented"
                  className="w-full bg-black/50 border border-red-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCallingEmergency(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  Trigger Siren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: REPORT COVERT ELIMINATION */}
      {/* =================================================================== */}
      {showKillModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a0a0f] border border-red-600 rounded-3xl p-6 w-full max-w-sm text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-red-500/30 pb-3">
              <h3 className="text-base font-bold text-red-400 uppercase tracking-wider">
                Log Covert Strike
              </h3>
              <button
                onClick={() => setShowKillModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-300 block mb-1">
                  Target Squad or Player Eliminated:
                </label>
                <input
                  type="text"
                  value={selectedKillTarget}
                  onChange={e => setSelectedKillTarget(e.target.value)}
                  placeholder="e.g. Player Alex Vance from Byte Saboteurs"
                  className="w-full bg-black/50 border border-red-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKillModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogCovertKill}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  Confirm Strike
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
