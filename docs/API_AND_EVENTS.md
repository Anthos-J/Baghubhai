# API and Events

Define a consistent naming convention for important operations and events across the team.

## Operations (Functions/Actions)
- `createRoom()`
- `joinRoom(code)`
- `startGame()`
- `completeTask(taskId)`
- `runTest()`
- `updateFile(fileId, newContent)`
- `injectBug(bugId)`
- `triggerSabotage(sabotageType)`
- `callMeeting()`
- `castVote(targetPlayerId)`
- `eliminatePlayer(playerId)`
- `endGame(winningTeam)`

## Realtime Events (Broadcasts)
- `PLAYER_JOINED`
- `PLAYER_LEFT`
- `GAME_STARTED`
- `ROLE_ASSIGNED`
- `FILE_OPENED`
- `FILE_CHANGED`
- `TEST_RUN`
- `TASK_COMPLETED`
- `BUG_INJECTED` (Masked for Developers)
- `SABOTAGE_TRIGGERED`
- `MEETING_STARTED`
- `VOTE_CAST`
- `PLAYER_ELIMINATED`
- `GAME_ENDED`

## Convention Rules
- Frontend components listen for `Events` via Supabase Realtime subscriptions.
- Frontend components trigger `Operations` by calling Supabase database functions, edge functions, or standard table updates.
- Keep naming consistent across TypeScript interfaces, database columns, and variable names.
