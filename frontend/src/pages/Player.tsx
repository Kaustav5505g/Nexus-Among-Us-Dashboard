import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AllocationDatabase } from '../lib/gameDatabase';
import { supabase } from '../lib/supabase';
import { Team, TeamActiveEffect } from '../types';
import './Player.css';

interface PlayerSession {
  teamId: string;
  phone?: string;
  playerName?: string;
  teamName?: string;
  isImpostor?: boolean;
  assignedRoom?: string;
  eventStatus?: string;
  currentRound?: string | number;
}

const IMPOSTOR_POWERS = [
  {
    name: 'Sabotage Lights',
    title: '⚡ Sabotage Lights',
    desc: 'Kill power to sector lighting to cause room darkness',
    targetRequired: false,
  },
  {
    name: 'Door Lockdown',
    title: '🚪 Door Lockdown',
    desc: 'Seal sector doors & freeze target crewmate squad for 40s',
    targetRequired: true,
  },
  {
    name: 'Comms Blackout',
    title: '📻 Comms Blackout',
    desc: 'Disrupt radio signals and clue deciphering for target squad',
    targetRequired: true,
  },
  {
    name: 'Terminal Freeze',
    title: '❄️ Terminal Freeze',
    desc: 'Freeze target crewmate team terminal, disabling all actions for 40s',
    targetRequired: true,
  },
  {
    name: 'Fake Task Signal',
    title: '🎭 Fake Task Signal',
    desc: 'Broadcast fraudulent completion to fool crewmates',
    targetRequired: false,
  },
  {
    name: 'Fake Clue Inject',
    title: '🧩 Fake Clue Inject',
    desc: 'Transmit corrupted forensic clue decipher to confuse target crewmates',
    targetRequired: true,
  },
];

const CREWMATE_TASKS = [
  {
    title: 'Play Wordle',
    desc: 'Decipher the secret word',
    icon: '🎮',
    route: '/games/wordle',
  },
  {
    title: 'Emoji Decoder',
    desc: 'Guess the phrase from emojis',
    icon: '🎭',
    route: '/games/emoji',
  },
  {
    title: 'Meme Decoder',
    desc: 'Decode the popular memes',
    icon: '🖼️',
    route: '/games/memedecoder',
  },
  {
    title: 'Code Typer',
    desc: 'Test your typing speed',
    icon: '⌨️',
    route: '/games/monkeytype',
  },
  {
    title: 'Pacman',
    desc: 'Classic arcade survival',
    icon: '👻',
    route: '/games/pacman',
  },
];

export default function Player() {
  const navigate = useNavigate();

  // Step 1: Immediate Synchronous Render from localStorage (0ms delay)
  const [session, setSession] = useState<PlayerSession | null>(() => {
    try {
      const raw = localStorage.getItem('nexus_player_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [statusText, setStatusText] = useState('LIVE • CONNECTED');
  const [toastMessage, setToastMessage] = useState('');
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Target team selection for Impostor powers
  const [targetTeams, setTargetTeams] = useState<Team[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  // Active sabotage effects for crewmates
  const [activeSabotages, setActiveSabotages] = useState<TeamActiveEffect[]>([]);

  // Ensure body background is pitch black (#000000)
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    const originalOverflow = document.body.style.overflow;

    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#ffffff';
    document.body.style.overflow = 'auto';

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  // Toast message auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(''), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Refresh target teams & crewmate status
  const refreshGameContext = () => {
    if (!session) return;
    const allTeams = AllocationDatabase.getTeams();
    const myTeamId = session.teamId?.toUpperCase();

    // 1. If Impostor, find target crewmate teams
    if (session.isImpostor) {
      const crewmates = allTeams.filter(
        t => !t.isImpostor && t.teamCode?.toUpperCase() !== myTeamId && t.id?.toUpperCase() !== myTeamId
      );

      // Prioritize same room
      const sameRoom = crewmates.filter(
        t =>
          t.assignedRoomId === session.assignedRoom ||
          t.assignedRoomName === session.assignedRoom ||
          t.assignedRoom === session.assignedRoom
      );

      const available = sameRoom.length > 0 ? sameRoom : crewmates;
      setTargetTeams(available);

      if (!selectedTargetId && available.length > 0) {
        setSelectedTargetId(available[0].teamCode || available[0].id);
      }
    } else {
      // 2. If Crewmate, check active sabotage effects
      const myTeam = allTeams.find(
        t => t.teamCode?.toUpperCase() === myTeamId || t.id?.toUpperCase() === myTeamId
      );
      if (myTeam) {
        const now = Date.now();
        const active = (myTeam.activeEffects || []).filter(e => e.expiresAt > now);
        setActiveSabotages(active);
      }
    }
  };

  useEffect(() => {
    refreshGameContext();
    const interval = setInterval(refreshGameContext, 2500);
    return () => clearInterval(interval);
  }, [session, selectedTargetId]);

  // Background sync with API or Supabase
  useEffect(() => {
    if (!session) return;

    let isRefreshing = false;
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

    async function syncSession() {
      if (isRefreshing) return;
      isRefreshing = true;

      try {
        const currentRaw = localStorage.getItem('nexus_player_session');
        if (!currentRaw) return;
        const creds = JSON.parse(currentRaw);

        let updated = false;

        // Option 1: Backend API
        try {
          const res = await fetch(`${API_BASE}/teams/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId: creds.teamId,
              phone: creds.phone,
              playerName: creds.playerName,
            }),
          });
          const result = await res.json().catch(() => null);
          if (res.ok && result?.success && result?.data) {
            const d = result.data;
            const updatedSession: PlayerSession = {
              teamId: d.team?.teamCode || creds.teamId,
              phone: d.player?.phone || creds.phone,
              playerName: d.player?.name || creds.playerName,
              teamName: d.team?.name || creds.teamName,
              isImpostor: Boolean(d.team?.isImpostor),
              assignedRoom: d.team?.assignedRoom || creds.assignedRoom,
              eventStatus: d.eventSession?.status || creds.eventStatus || 'active',
              currentRound: d.eventSession?.currentRound ?? creds.currentRound ?? 1,
            };
            setSession(updatedSession);
            localStorage.setItem('nexus_player_session', JSON.stringify(updatedSession));
            setStatusText(`EVENT ${(d.eventSession?.status || 'ACTIVE').toUpperCase()}`);
            updated = true;
          }
        } catch {
          // Backend offline - silent fallback
        }

        // Option 2: Direct Supabase Cloud
        if (!updated && supabase) {
          try {
            const { data: teamRecord } = await supabase
              .from('teams')
              .select('*')
              .or(`team_code.ilike.${creds.teamId},badge_code.ilike.${creds.teamId}`)
              .limit(1)
              .single();

            if (teamRecord) {
              const updatedSession: PlayerSession = {
                ...creds,
                teamName: teamRecord.name,
                isImpostor: Boolean(teamRecord.is_impostor),
                assignedRoom: teamRecord.assigned_room || teamRecord.assigned_room_name || creds.assignedRoom || 'Room 1 (Command Hub)',
                eventStatus: teamRecord.status || creds.eventStatus || 'active',
              };
              setSession(updatedSession);
              localStorage.setItem('nexus_player_session', JSON.stringify(updatedSession));
              setStatusText('LIVE • CONNECTED');
              updated = true;
            }
          } catch (sbEx) {
            console.warn('Supabase session background check:', sbEx);
          }
        }
      } catch (err) {
        console.warn('Failed background session check:', err);
      } finally {
        isRefreshing = false;
      }
    }

    syncSession();
    const interval = setInterval(syncSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const isImpostor = Boolean(session?.isImpostor);
  const teamName = session?.teamName || session?.teamId || 'Cyber Phantoms';
  const playerName = session?.playerName || 'Operative';
  const teamId = session?.teamId || 'NX-T1';
  const roomName = session?.assignedRoom || 'Room 1 (Command Hub)';
  const eventStatus = session?.eventStatus || 'active';
  const round = session?.currentRound ?? '1';

  const handleTriggerPower = (power: typeof IMPOSTOR_POWERS[0]) => {
    if (cooldowns[power.name] && cooldowns[power.name] > 0) return;

    let targetTeamObj = targetTeams.find(
      t => t.teamCode === selectedTargetId || t.id === selectedTargetId
    );
    if (power.targetRequired && !targetTeamObj && targetTeams.length > 0) {
      targetTeamObj = targetTeams[0];
      setSelectedTargetId(targetTeamObj.teamCode || targetTeamObj.id);
    }

    if (power.targetRequired && !targetTeamObj) {
      setToastMessage('⚠️ No target crewmate squad available in sector.');
      return;
    }

    const targetIdToSend = power.targetRequired && targetTeamObj
      ? (targetTeamObj.teamCode || targetTeamObj.id)
      : undefined;

    // Trigger power in AllocationDatabase
    const result = AllocationDatabase.triggerPower(teamId, power.name, targetIdToSend);

    const actionMsg = power.targetRequired && targetTeamObj
      ? `🎯 IMPOSTOR POWER: ${power.name} activated on ${targetTeamObj.name} (${targetTeamObj.teamCode || targetTeamObj.id})!`
      : `⚡ IMPOSTOR POWER: ${power.name} activated room-wide in ${roomName}!`;

    setToastMessage(result?.message || actionMsg);

    // 10 second visual cooldown
    setCooldowns(prev => ({ ...prev, [power.name]: 10 }));
    const cdInterval = setInterval(() => {
      setCooldowns(prev => {
        const nextVal = (prev[power.name] || 1) - 1;
        if (nextVal <= 0) {
          clearInterval(cdInterval);
          const copy = { ...prev };
          delete copy[power.name];
          return copy;
        }
        return { ...prev, [power.name]: nextVal };
      });
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_player_session');
    navigate('/', { replace: true });
  };

  return (
    <div className="player-container">
      <div className="container">
        <div className="header-bar">
          <div className="brand">Nexus • Among Us</div>
          <div className="status-badge" id="connStatus">{statusText}</div>
        </div>

        <div className="main-card">
          <div className="dev-badge">Gameplay Terminal</div>

          <h1 className="main-title">Gameplay Terminal</h1>

          <p className="main-desc">
            Your team allocation, player role, and live event status are synchronized with the NEXUS operations database.
          </p>

          {/* Dynamic Impostor / Crewmate Role Banner */}
          <div className="role-banner" id="roleBanner">
            {isImpostor ? (
              <>
                <div className="role-tag role-impostor" id="roleTag">
                  ⚡ ROLE: COVERT IMPOSTOR
                </div>
                <div className="role-desc" id="roleDesc">
                  You are the covert Impostor team in {roomName}! Deceive the crewmates, trigger room sabotages, and target enemy squads.
                </div>
              </>
            ) : (
              <>
                <div className="role-tag role-crewmate" id="roleTag">
                  🛡️ ROLE: CREWMATE
                </div>
                <div className="role-desc" id="roleDesc">
                  You are a loyal Crewmate team in {roomName}! Complete station missions, clear sabotages, and expose the Impostor.
                </div>
              </>
            )}
          </div>

          {/* Action Toast Feedback */}
          {toastMessage ? (
            <div className="toast-feedback" id="actionToast">
              {toastMessage}
            </div>
          ) : null}

          {/* Active Sabotage Alert Banner for Crewmate */}
          {!isImpostor && activeSabotages.length > 0 && (
            <div className="sabotage-alert">
              <div>🚨 <strong>EMERGENCY: SECTOR SABOTAGE ACTIVE!</strong></div>
              {activeSabotages.map(eff => (
                <div key={eff.id} style={{ marginTop: '4px', fontSize: '11px' }}>
                  • <strong>{eff.powerName}</strong> in effect! Active for {Math.max(1, Math.ceil((eff.expiresAt - Date.now()) / 1000))}s.
                </div>
              ))}
            </div>
          )}

          {/* IMPOSTOR ONLY: Target Crewmate Selection Box */}
          {isImpostor && (
            <div className="target-box">
              <div className="target-header">
                <span>🎯 Select Target Crewmate Squad:</span>
                <span style={{ color: '#a1a1aa', fontWeight: 'normal', fontSize: '10px' }}>
                  {targetTeams.length} Targets in Sector
                </span>
              </div>

              {targetTeams.length > 0 ? (
                <div className="target-chips">
                  {targetTeams.map(t => {
                    const code = t.teamCode || t.id;
                    const isSelected = selectedTargetId === code || selectedTargetId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`target-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedTargetId(code)}
                      >
                        <span>{t.name}</span>
                        <span style={{ opacity: 0.7 }}>[{code}]</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#71717a' }}>
                  No active crewmate teams currently detected in sector.
                </div>
              )}
            </div>
          )}

          {/* Interactive Powers / Action Console */}
          <div className="powers-section" id="powersSection">
            <div className="powers-header">
              <span id="powersHeaderTitle">
                {isImpostor ? 'Impostor Sabotage Console' : 'Station Mini-Games Console'}
              </span>
              <span id="cooldownNotice" style={{ color: '#a1a1aa', fontWeight: 'normal' }}>
                {Object.values(cooldowns).some(c => c > 0) ? 'Cooldown Active' : 'Ready'}
              </span>
            </div>

            <div className="powers-grid" id="powersGrid">
              {isImpostor ? (
                IMPOSTOR_POWERS.map(power => {
                  const cd = cooldowns[power.name] || 0;
                  const isCooling = cd > 0;
                  return (
                    <button
                      key={power.name}
                      className="power-btn"
                      disabled={isCooling}
                      onClick={() => handleTriggerPower(power)}
                      data-power={power.name}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span className="power-btn-title">
                          {isCooling ? `${power.name} (${cd}s)` : power.title}
                        </span>
                        <span className={`power-scope-badge ${power.targetRequired ? 'scope-targeted' : 'scope-room'}`}>
                          {power.targetRequired ? '🎯 Targeted' : '🌐 Room'}
                        </span>
                      </div>
                      <span className="power-btn-desc">{power.desc}</span>
                    </button>
                  );
                })
              ) : (
                CREWMATE_TASKS.map(task => (
                  <button
                    key={task.title}
                    className="power-btn"
                    onClick={() => navigate(task.route)}
                  >
                    <span className="power-btn-title">
                      {task.icon} {task.title}
                    </span>
                    <span className="power-btn-desc">{task.desc}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Team Allocation Info */}
          <div className="team-info-box" id="infoBox">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Assigned Team</span>
                <span className="info-value" id="valTeamName">{teamName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Player</span>
                <span className="info-value" id="valPlayerName">{playerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Official Team ID</span>
                <div><span className="info-tag" id="valTeamCode">{teamId}</span></div>
              </div>
              <div className="info-item">
                <span className="info-label">Event Session</span>
                <span className="info-value" id="valSessionStatus">{eventStatus}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Allocated Room</span>
                <span className="info-value" id="valRoomName">{roomName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Round</span>
                <span className="info-value" id="valRound">{round}</span>
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-outline" id="btnLogout" type="button" onClick={handleLogout}>
              Log Out
            </button>
            <button className="btn btn-outline" type="button" onClick={() => navigate('/')}>
              Portal Home
            </button>
          </div>
        </div>

        <div className="footer-note">
          Nexus Operations • System Authenticated
        </div>
      </div>
    </div>
  );
}
