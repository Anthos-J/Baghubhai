# Code Mafia Specification

## Product Overview
Code Mafia is a multiplayer collaborative debugging game inspired by social-deduction games. Players must work together in real-time to debug a shared, intentionally flawed software project. However, secret Mafia members will attempt to disrupt progress, introduce bugs, and sabotage the team without being caught.

## Gameplay
1. **JOIN ROOM:** Players create or join a room using a unique code.
2. **LOBBY:** Players wait in the lobby. The host can adjust settings and start the game when ready.
3. **START GAME & ROLE REVEAL:** Roles (Developer or Mafia) are secretly assigned and revealed to each player.
4. **CODEBASE:** Players are taken to the main game dashboard with a shared code editor, file tree, and task list.
5. **DEBUG / SABOTAGE:** 
   - Developers work to fix bugs and complete assigned tasks.
   - Mafia members secretly inject predefined bugs or trigger sabotages (e.g., Syntax Blackout).
6. **TEST:** The deterministic test runner checks if the code passes the requirements.
7. **MEETING:** Any player can call an emergency meeting, temporarily locking the editor.
8. **VOTE:** Players discuss activity and cast votes to eliminate a suspected Mafia member.
9. **ELIMINATION:** The player with the most votes is eliminated and becomes a Ghost.
10. **WIN / LOSE:** The game checks victory conditions. If Developers finish all tasks and pass tests, they win. If Mafia eliminates enough Developers or prevents task completion within the time limit, they win.

## Roles

**Developer:**
- Fix predefined bugs/tasks.
- Run deterministic tests.
- Increase global progress.
- Identify and vote out Mafia.

**Mafia:**
- Secretly sabotage the codebase.
- Inject predefined bugs.
- Trigger simple sabotage events (Syntax Blackout, Server Overload).
- Avoid being voted out.

**Ghost:**
- Eliminated players become Ghosts.
- Can view but cannot edit, vote, or sabotage.

## What We Will Not Build (Out of Scope)
- Arbitrary remote code execution (RCE).
- A full Git client.
- Full VS Code functionality.
- Voice/Video chat.
- Matchmaking, social profiles, friend systems.
- Mobile applications.
- Complicated authentication.
- Huge codebases.
- Complex CRDT collaboration systems (we use a simplified lock/sync or basic presence).
- AI-generated bugs.

## Core Mechanics
- **Tasks:** Predefined fixes the Developers must make.
- **Tests:** Deterministic test runner evaluating the state of the code.
- **Progress:** A global progress bar based on completed tasks and passing tests.
- **Bug Injection:** Controlled, predefined mutations triggered by the Mafia.
- **Sabotage:** Cooldown-based global disruptions.
- **Meetings:** Pauses gameplay for discussion.
- **Voting & Elimination:** Democratic removal of suspected Mafia.
- **Win Conditions:** Developers win by completing all tasks/tests. Mafia wins by eliminating Developers or time running out.

## 18-Hour Timeline
- **HOUR 0-1:** GitHub, Supabase, React/Vite, Env vars, Folder structure.
- **HOUR 1-3:** Initial UI and Backend scaffolding.
- **HOUR 3:** FIRST INTEGRATION (Player A creates room, Player B joins).
- **HOUR 3-5:** Connect UI to Supabase (Create -> Join -> Lobby -> Start -> Role Reveal).
- **HOUR 5-7:** Connect File Tree -> Monaco -> Supabase -> Realtime.
- **HOUR 7-9:** Tasks + deterministic tests.
- **HOUR 9:** STOP. Test the full Developer loop.
- **HOUR 9-11:** Mafia controls (Bug injection, Syntax Blackout, Server Overload).
- **HOUR 11:** Verify Dev fixes -> tests pass -> Mafia injects -> tests fail.
- **HOUR 11-13:** Emergency meeting, chat, activity log, voting.
- **HOUR 13-14:** Elimination, Ghost mode, Victory, Restart.
- **HOUR 14-15:** UI polish, Animations, Notifications.
- **HOUR 15-16:** Deploy, Multiplayer testing.
- **HOUR 16-17:** Demo preparation (PPT, flow).
- **HOUR 17-18:** Only critical bug fixes. No new features.

## Milestones
1. Two players can join the same room.
2. They enter a game with different secret roles.
3. They can access/synchronize the codebase.
4. A Developer can complete a task.
5. Mafia can break a task.
6. Players can meet and vote.
7. Someone wins.
