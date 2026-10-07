// @ts-nocheck
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Player.css';

export default function Player() {
  const navigate = useNavigate();
  const containerRef = React.useRef(null);
  const initialized = React.useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!containerRef.current) return;
    
    document.body.style.overflow = 'hidden';

    try {
      // Overwrite window.location.assign or replace for React Router
      const originalAssign = window.location.assign;
      const originalReplace = window.location.replace;
      
      window.location.assign = (url) => {
        if (url === 'login.html') navigate('/');
        else navigate('/' + url.replace('.html', ''));
      };
      
      window.location.replace = (url) => {
        if (url === 'login.html') navigate('/', { replace: true });
        else navigate('/' + url.replace('.html', ''), { replace: true });
      };

      
          (function() {
            let currentSession = null;
            let isImpostor = false;
            let isRefreshing = false;
            const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
      
            async function loadSession() {
              if (isRefreshing) return;
              isRefreshing = true;
              const status = containerRef.current.querySelector('#' + 'connStatus');
              const roleTag = containerRef.current.querySelector('#' + 'roleTag');
              const roleDesc = containerRef.current.querySelector('#' + 'roleDesc');
              const powersSection = containerRef.current.querySelector('#' + 'powersSection');
              const sessionRaw = localStorage.getItem('nexus_player_session');
      
              if (!sessionRaw) {
                status.textContent = 'SIGN-IN REQUIRED';
                roleTag.textContent = 'UNAUTHENTICATED';
                roleDesc.textContent = 'Please sign in with your official Team ID.';
                powersSection.style.display = 'none';
                isRefreshing = false;
                return;
              }
      
              try {
                const credentials = JSON.parse(sessionRaw);
                if (typeof credentials.teamId !== 'string' || typeof credentials.playerName !== 'string') {
                  throw new Error('Saved player sign-in is invalid. Please sign in again.');
                }
                const response = await fetch(`${API_BASE}/teams/session`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    teamId: credentials.teamId,
                    playerName: credentials.playerName,
                  }),
                });
                const result = await response.json().catch(() => null);
                if (!response.ok || !result?.success) {
                  if (response.status === 401) {
                    localStorage.removeItem('nexus_player_session');
                    window.location.replace('login.html');
                    return;
                  }
                  throw new Error(result?.message || 'Could not refresh the player session.');
                }
      
                currentSession = result.data;
                const activeTeam = currentSession.team;
                const room = { name: activeTeam.assignedRoom || '' };
                const eventSession = currentSession.eventSession;
                isImpostor = Boolean(activeTeam.isImpostor);
      
                status.textContent = `EVENT ${eventSession.status.toUpperCase()}`;
                roleTag.textContent = `PLAYER: ${currentSession.player.name}`;
                containerRef.current.querySelector('#' + 'valTeamName').textContent = activeTeam.name;
                containerRef.current.querySelector('#' + 'valPlayerName').textContent = currentSession.player.name;
                containerRef.current.querySelector('#' + 'valTeamCode').textContent = activeTeam.teamCode;
                containerRef.current.querySelector('#' + 'valSessionStatus').textContent = eventSession.status;
                containerRef.current.querySelector('#' + 'valRoomName').textContent = activeTeam.assignedRoom || 'Unassigned';
                containerRef.current.querySelector('#' + 'valRound').textContent = eventSession.currentRound ?? '—';
                powersSection.style.display = '';
                renderRoleAndPowers(activeTeam, room);
              } catch (error) {
                console.error('Failed to refresh player session:', error);
                status.textContent = 'SESSION UNAVAILABLE';
                roleTag.textContent = 'SESSION ERROR';
                roleDesc.textContent = error instanceof Error
                  ? error.message
                  : 'Could not connect to the player session service.';
                powersSection.style.display = 'none';
              } finally {
                isRefreshing = false;
              }
            }
      
            function logPlayerAction(type, powerName, message) {
              try {
                const rawLogs = localStorage.getItem('nexus_activity_logs_v2');
                const logs = rawLogs ? JSON.parse(rawLogs) : [];
                const team = currentSession?.team || {};
                const room = currentSession?.room || {};
      
                logs.unshift({
                  id: 'log-' + Date.now(),
                  timestamp: new Date().toISOString(),
                  type: type,
                  message: message,
                  teamId: team.teamCode || team.id,
                  teamName: team.name,
                  roomName: room.name || team.assignedRoomName,
                  powerName: powerName,
                  severity: isImpostor ? 'danger' : 'info'
                });
      
                localStorage.setItem('nexus_activity_logs_v2', JSON.stringify(logs.slice(0, 500)));
              } catch (e) {
                console.error('Failed to save activity log', e);
              }
      
              const toast = containerRef.current.querySelector('#' + 'actionToast');
              toast.textContent = message;
              toast.style.display = 'block';
              setTimeout(() => {
                toast.style.display = 'none';
              }, 4000);
            }
      
            function renderRoleAndPowers(team, room) {
              const roleBanner = containerRef.current.querySelector('#' + 'roleBanner');
              const roleTag = containerRef.current.querySelector('#' + 'roleTag');
              const roleDesc = containerRef.current.querySelector('#' + 'roleDesc');
              const powersGrid = containerRef.current.querySelector('#' + 'powersGrid');
              const powersHeaderTitle = containerRef.current.querySelector('#' + 'powersHeaderTitle');
      
              if (isImpostor) {
                roleTag.className = 'role-tag role-impostor';
                roleTag.textContent = '⚡ ROLE: COVERT IMPOSTOR';
                roleDesc.textContent = 'You are the covert Impostor team in ' + (room.name || 'your assigned room') + '! Deceive the crewmates, trigger room sabotages, and avoid discovery.';
                powersHeaderTitle.textContent = 'Impostor Sabotage Console';
      
                powersGrid.innerHTML = `
                  <button class="power-btn" data-power="Sabotage Lights">
                    <span class="power-btn-title">⚡ Sabotage Lights</span>
                    <span class="power-btn-desc">Kill power to sector lighting to cause darkness</span>
                  </button>
                  <button class="power-btn" data-power="Door Lockdown">
                    <span class="power-btn-title">🚪 Door Lockdown</span>
                    <span class="power-btn-desc">Seal sector doors and freeze room movement for 60s</span>
                  </button>
                  <button class="power-btn" data-power="Comms Blackout">
                    <span class="power-btn-title">📻 Comms Blackout</span>
                    <span class="power-btn-desc">Disrupt radio transmissions and clue signals</span>
                  </button>
                  <button class="power-btn" data-power="Fake Task Broadcast">
                    <span class="power-btn-title">🎭 Fake Task Signal</span>
                    <span class="power-btn-desc">Broadcast fraudulent completion to fool crewmates</span>
                  </button>
                `;
              } else {
                roleTag.className = 'role-tag role-crewmate';
                roleTag.textContent = '🛡️ ROLE: CREWMATE';
                roleDesc.textContent = 'You are a loyal Crewmate team in ' + (room.name || 'your assigned room') + '! Complete station tasks, decipher clues, and find the Impostor.';
                powersHeaderTitle.textContent = 'Crewmate Operations';
      
                powersGrid.innerHTML = `
                  <button class="power-btn" data-game-url="games/wordle">
                    <span class="power-btn-title">🎮 Play Wordle</span>
                    <span class="power-btn-desc">Decipher the secret word</span>
                  </button>
                  <button class="power-btn" data-game-url="games/emoji">
                    <span class="power-btn-title">🎭 Emoji Decoder</span>
                    <span class="power-btn-desc">Guess the phrase from emojis</span>
                  </button>
                  <button class="power-btn" data-game-url="games/memedecoder">
                    <span class="power-btn-title">🖼️ Meme Decoder</span>
                    <span class="power-btn-desc">Decode the popular memes</span>
                  </button>
                  <button class="power-btn" data-game-url="games/monkeytype">
                    <span class="power-btn-title">⌨️ Code Typer</span>
                    <span class="power-btn-desc">Test your typing speed</span>
                  </button>
                  <button class="power-btn" data-game-url="games/pacman">
                    <span class="power-btn-title">👻 Pacman</span>
                    <span class="power-btn-desc">Classic arcade survival</span>
                  </button>
                `;
              }
      
              // Attach power button click events
              powersGrid.querySelectorAll('.power-btn').forEach(btn => {
                btn.onclick = function() {
                  const gameUrl = btn.dataset.gameUrl;
                  if (gameUrl) {
                    window.location.assign(gameUrl);
                    return;
                  }

                  const powerName = btn.dataset.power;
                  const actionMsg = isImpostor
                    ? `⚡ IMPOSTOR POWER: ${team.name} (${team.teamCode || team.id}) activated ${powerName} in ${room.name || 'Sector'}!`
                    : `🛡️ CREWMATE ACTION: ${team.name} (${team.teamCode || team.id}) triggered ${powerName} in ${room.name || 'Sector'}!`;
      
                  btn.disabled = true;
                  btn.style.opacity = '0.5';
      
                  logPlayerAction(isImpostor ? 'power' : 'task', powerName, actionMsg);
      
                  // 10 second visual cooldown
                  let cd = 10;
                  const originalTitle = btn.querySelector('.power-btn-title').innerHTML;
                  const cdInterval = setInterval(() => {
                    cd--;
                    if (cd <= 0) {
                      clearInterval(cdInterval);
                      btn.disabled = false;
                      btn.style.opacity = '1';
                      btn.querySelector('.power-btn-title').innerHTML = originalTitle;
                    } else {
                      btn.querySelector('.power-btn-title').textContent = `${powerName} (${cd}s)`;
                    }
                  }, 1000);
                };
              });
            }
      
            containerRef.current.querySelector('#' + 'btnLogout').onclick = function() {
              localStorage.removeItem('nexus_player_session');
              window.location.assign('login.html');
            };
      
            loadSession();
            window.addEventListener('storage', function(e) {
              if (e.key === 'nexus_player_session') {
                loadSession();
              }
            });
      
            setInterval(loadSession, 3000);
      
          })();
        
      
      // Cleanup
      return () => {
        window.location.assign = originalAssign;
        window.location.replace = originalReplace;
        document.body.style.overflow = '';
      };
    } catch (e) {
      console.error(e);
      document.body.style.overflow = '';
    }
  }, [navigate]);

  return (
    <div className="player-container" ref={containerRef}>
      
        <div className="container">
          <div className="header-bar">
            <div className="brand">Nexus • Among Us</div>
            <div className="status-badge" id="connStatus">Connecting to session…</div>
          </div>
      
          <div className="main-card">
            <div className="dev-badge">Gameplay Terminal</div>
      
            <h1 className="main-title">Gameplay Terminal</h1>
      
            <p className="main-desc">
              Your team allocation, player role, and live event status are synchronized with the NEXUS operations database.
            </p>
      
            {/* Dynamic Impostor / Crewmate Role Banner */}
            <div className="role-banner" id="roleBanner">
              <div className="role-tag" id="roleTag">Scanning Role...</div>
              <div className="role-desc" id="roleDesc">Accessing central telemetry database...</div>
            </div>
      
            {/* Action Toast Feedback */}
            <div className="toast-feedback" id="actionToast"></div>
      
            {/* Interactive Powers / Action Console */}
            <div className="powers-section" id="powersSection">
              <div className="powers-header">
                <span id="powersHeaderTitle">Team Action Telemetry</span>
                <span id="cooldownNotice" style={{color:'#a1a1aa',fontWeight:'normal'}}>Ready</span>
              </div>
              <div className="powers-grid" id="powersGrid">
                {/* Populated by script based on Impostor vs Crewmate */}
              </div>
            </div>
      
            {/* Team Allocation Info */}
            <div className="team-info-box" id="infoBox">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Assigned Team</span>
                  <span className="info-value" id="valTeamName">—</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Player</span>
                  <span className="info-value" id="valPlayerName">—</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Official Team ID</span>
                  <div><span className="info-tag" id="valTeamCode">—</span></div>
                </div>
                <div className="info-item">
                  <span className="info-label">Event Session</span>
                  <span className="info-value" id="valSessionStatus">—</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Allocated Room</span>
                  <span className="info-value" id="valRoomName">—</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Round</span>
                  <span className="info-value" id="valRound">—</span>
                </div>
              </div>
            </div>
      
            <div className="actions">
              <button className="btn btn-outline" id="btnLogout" type="button">Log Out</button>
              <a href="login.html" className="btn btn-outline">Portal Home</a>
            </div>
          </div>
      
          <div className="footer-note">
            Nexus Operations • System Authenticated
          </div>
        </div>
      
        
    </div>
  );
}
