import { Server as SocketIOServer, Socket } from 'socket.io';
import { gameService } from '../services/gameService';

export const registerSocketHandlers = (io: SocketIOServer) => {
  // Hook the gameService broadcast so changes emit over Socket.IO
  gameService.setSocketBroadcaster((event: string, payload: any) => {
    io.emit(event, payload);
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send current game state upon initial connection
    socket.emit('game:init', {
      state: gameService.getGameState(),
      teams: gameService.getTeams(),
      tasks: gameService.getTasks(),
      clues: gameService.getMysteryClues(),
      logs: gameService.getActivityLogs(),
    });

    // Handle team task completion from client
    socket.on('task:complete', ({ taskId, teamId }: { taskId: string; teamId: string }) => {
      gameService.completeTask(taskId, teamId);
    });

    // Handle emergency vote from client
    socket.on('emergency:vote', ({ voterTeamId, suspectName }: { voterTeamId: string; suspectName: string }) => {
      gameService.voteEmergency(voterTeamId, suspectName);
    });

    // Handle sabotage resolution attempt
    socket.on('sabotage:resolve', ({ teamId }: { teamId?: string }) => {
      gameService.resolveSabotage(teamId);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
