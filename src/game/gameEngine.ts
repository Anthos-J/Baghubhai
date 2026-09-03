import { GameState, Player } from '../types/game';
import { createInitialGameState, gameReducer, GameAction } from './gameState';
import { getDeveloperTaskView, evaluateTaskCode } from './tasks';
import { getMaskedPlayersForClient } from './roles';

export type StateListener = (state: GameState) => void;

/**
 * GameEngine is the central orchestrator for Code Mafia.
 * It manages state transitions, the game loop tick timer,
 * role assignment, imposter actions, and dispatches updates to listeners.
 */
export class GameEngine {
  private state: GameState;
  private listeners: Set<StateListener> = new Set();
  private tickInterval: any = null;

  constructor(roomId: string = 'ROOM-1', hostPlayer?: Player) {
    this.state = createInitialGameState(roomId, hostPlayer);
  }

  /**
   * Retrieves the full raw game state (for backend/host usage).
   */
  public getState(): GameState {
    return this.state;
  }

  /**
   * Retrieves sanitized game state scoped for a specific player:
   * - If developer: hides which tasks are sabotaged until tested, hides secret Imposter roles.
   * - Preserves translucent red/yellow alarm status across all players.
   */
  public getScopedStateForPlayer(playerId: string): GameState {
    const player = this.state.players.find((p) => p.id === playerId);
    const maskedPlayers = getMaskedPlayersForClient(this.state.players, playerId);
    
    // If the viewer is a Developer, mask the exact bugged task tag
    const tasks = player?.role === 'MAFIA' ? this.state.tasks : getDeveloperTaskView(this.state.tasks);

    return {
      ...this.state,
      players: maskedPlayers,
      tasks,
    };
  }

  /**
   * Subscribes to state updates.
   */
  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Dispatches an action through the pure reducer and notifies all listeners.
   */
  public dispatch(action: GameAction): GameState {
    this.state = gameReducer(this.state, action);

    // Auto-start or stop tick loop depending on game phase
    if (this.state.phase !== 'LOBBY' && this.state.phase !== 'GAME_OVER') {
      this.startTickLoop();
    } else if (this.state.phase === 'GAME_OVER') {
      this.stopTickLoop();
    }

    this.notify();
    return this.state;
  }

  /**
   * Developer action: attempts to solve a task.
   */
  public developerSolveTask(playerId: string, taskId: string, code?: string): boolean {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return false;

    // Evaluate code deterministically if code is provided
    if (code !== undefined) {
      const passes = evaluateTaskCode(taskId, code);
      if (!passes) {
        return false;
      }
    }

    this.dispatch({
      type: 'DEV_SOLVE_TASK',
      playerId,
      taskId,
      code,
    });
    return true;
  }

  /**
   * Imposter action: bugs a task, drops progress, and triggers
   * the translucent red and yellow alarm.
   */
  public imposterBugTask(imposterId: string, taskId: string): boolean {
    const prevTask = this.state.tasks.find((t) => t.id === taskId);
    this.dispatch({
      type: 'IMPOSTER_BUG_TASK',
      imposterId,
      taskId,
    });
    const currentTask = this.state.tasks.find((t) => t.id === taskId);
    return currentTask?.status === 'BUGGED' && currentTask.status !== prevTask?.status;
  }

  /**
   * Trigger Syntax Blackout.
   */
  public triggerSyntaxBlackout(imposterId: string): boolean {
    this.dispatch({ type: 'TRIGGER_SYNTAX_BLACKOUT', imposterId });
    return this.state.syntaxBlackoutActive;
  }

  /**
   * Trigger Server Overload crisis.
   */
  public triggerServerOverload(imposterId: string): boolean {
    this.dispatch({ type: 'TRIGGER_SERVER_OVERLOAD', imposterId });
    return this.state.serverOverloadActive;
  }

  /**
   * Call Emergency Meeting.
   */
  public callEmergencyMeeting(callerId: string, reason?: string): boolean {
    this.dispatch({ type: 'CALL_MEETING', callerId, reason });
    return this.state.phase === 'MEETING';
  }

  /**
   * Cast a vote.
   */
  public vote(voterId: string, targetId: string | 'SKIP'): void {
    this.dispatch({ type: 'CAST_VOTE', voterId, targetId });
  }

  /**
   * Starts game from LOBBY.
   */
  public startGame(): void {
    this.dispatch({ type: 'START_GAME' });
  }

  /**
   * Restarts game back to LOBBY.
   */
  public restartGame(): void {
    this.dispatch({ type: 'RESTART_GAME' });
  }

  /**
   * Internal tick timer loop (1 second interval).
   */
  private startTickLoop(): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      this.dispatch({ type: 'TICK', deltaSeconds: 1 });
    }, 1000);
  }

  public stopTickLoop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in GameEngine listener:', err);
      }
    });
  }
}
