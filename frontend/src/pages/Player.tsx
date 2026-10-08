import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AllocationDatabase } from '../lib/gameDatabase';
import { supabase } from '../lib/supabase';
import Imposter, { IMPOSTOR_POWERS, ImpostorPower } from '../games/imposter/Imposter';
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
  const [teamScore, setTeamScore] = useState(0);
  const [completedGames, setCompletedGames] = useState<string[]>([]);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

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

    const myTeam = allTeams.find(
      t => t.teamCode?.toUpperCase() === myTeamId || t.id?.toUpperCase() === myTeamId
    );

    if (myTeam) {
      setTeamScore(myTeam.score || 0);
      setCompletedGames((myTeam.gamesPlayed || []).map(g => g.gameId));
    }

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

  const handleTriggerPower = (power: ImpostorPower) => {
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

  // The 5 available games
  const gamesList = AllocationDatabase.getCrewmateGames();

  // Helper to mark a game as completed temporarily from the UI
  // Real implementation would have the games call markGameCompleted when done.
  const handleGameCompleteClick = (e: React.MouseEvent, gameId: string) => {
    e.preventDefault();
    if (session && !completedGames.includes(gameId)) {
      AllocationDatabase.markGameCompleted(session.teamId, gameId, 5);
      refreshGameContext();
      setToastMessage(`Game completed! +5 Points.`);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/image.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      {/* Top Header / Score */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '8px 24px',
          borderRadius: '20px',
          border: '2px solid rgba(255,255,255,0.2)',
          color: 'white',
          fontSize: '14px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}>
          NEXUS STUDENT CHAPTER
        </div>
        <h1 style={{
          fontSize: '64px',
          fontWeight: '900',
          color: 'white',
          textShadow: '0 4px 6px rgba(0,0,0,0.5)',
          margin: 0,
          fontFamily: '"Arial Black", sans-serif',
          letterSpacing: '2px'
        }}>
          MINI GAMES
        </h1>
        <p style={{
          color: '#e2e8f0',
          fontSize: '18px',
          fontWeight: '500',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          marginBottom: '20px'
        }}>
          Pick a game and start playing!
        </p>

        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#4ade80',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '10px 30px',
          borderRadius: '12px',
          border: '2px solid #4ade80',
          boxShadow: '0 0 15px rgba(74,222,128,0.3)',
          marginBottom: '30px'
        }}>
          SCORE: {teamScore}
        </div>
      </div>

      {/* Mini Games Buttons Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '24px',
        width: '90%',
        maxWidth: '1000px',
        marginTop: '20px'
      }}>
        {gamesList.map((game, index) => {
          const isCompleted = completedGames.includes(game.id);
          const colors = [
            { bg: '#C51111', shadow: '#7A0838' }, // Red
            { bg: '#132ED1', shadow: '#09158E' }, // Blue
            { bg: '#117F2D', shadow: '#0A4D2E' }, // Green
            { bg: '#F07D0D', shadow: '#B43E15' }, // Orange
            { bg: '#71491E', shadow: '#3E260F' }  // Brown
          ];
          const color = colors[index % colors.length];

          return (
            <button
              key={game.id}
              onClick={() => navigate(game.route)}
              style={{
                flex: '1 1 calc(33.333% - 24px)',
                minWidth: '260px',
                maxWidth: '300px',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isCompleted ? '#4ade80' : color.bg,
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                boxShadow: `0 8px 0 ${isCompleted ? '#166534' : color.shadow}, 0 15px 20px rgba(0,0,0,0.4)`,
                transition: 'transform 0.1s, box-shadow 0.1s',
                transform: 'translateY(0)',
                textDecoration: 'none'
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'translateY(8px)';
                e.currentTarget.style.boxShadow = `0 0px 0 ${isCompleted ? '#166534' : color.shadow}, 0 5px 10px rgba(0,0,0,0.4)`;
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 0 ${isCompleted ? '#166534' : color.shadow}, 0 15px 20px rgba(0,0,0,0.4)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 0 ${isCompleted ? '#166534' : color.shadow}, 0 15px 20px rgba(0,0,0,0.4)`;
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                {game.icon}
              </div>
              <div style={{
                fontSize: '22px',
                fontWeight: '900',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                marginBottom: '8px'
              }}>
                {game.title} {isCompleted && '✓'}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                textAlign: 'center',
                padding: '0 10px'
              }}>
                {game.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Imposter Panel Logic */}
      <button 
        className="side-panel-toggle"
        onClick={() => setIsSidePanelOpen(true)}
        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}
      >
        &lt;
      </button>

      <div 
        className={`side-panel-overlay ${isSidePanelOpen ? 'open' : ''}`}
        onClick={() => setIsSidePanelOpen(false)}
      ></div>

      <div className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
        <button className="side-panel-close" onClick={() => setIsSidePanelOpen(false)}>&times;</button>
        {isImpostor ? (
          <Imposter
            roomName={roomName}
            targetTeams={targetTeams}
            selectedTargetId={selectedTargetId}
            toastMessage={toastMessage}
            cooldowns={cooldowns}
            onSelectTarget={setSelectedTargetId}
            onTriggerPower={handleTriggerPower}
          />
        ) : (
          <div className="crewmate-message">
            <p>You are a Crewmate</p>
          </div>
        )}
      </div>
    </div>
  );
}
