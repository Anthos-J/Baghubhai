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
- Must collaborate to fix bugs in the predefined files.
- Can run deterministic tests to verify fixes.
- Monitors file presence and code changes to spot suspicious behavior.
- Votes during emergency meetings to eliminate Mafia.

**Mafia:**
- Appears as a regular Developer.
- Can secretly trigger predefined bug injections (e.g., changing `AND` to `OR`).
- Can trigger global sabotages (e.g., Server Overload, Syntax Blackout).
- Must avoid detection by lying or misdirecting during meetings.

**Ghost:**
- Eliminated players become Ghosts.
- Cannot edit code or participate in voting/meetings.
- Can spectate the game and chat with other Ghosts.

## Core Mechanics
- **Tasks:** Predefined fixes the Developers must make.
- **Tests:** Deterministic test runner evaluating the state of the code.
- **Progress:** A global progress bar based on completed tasks and passing tests.
- **Bug Injection:** Controlled, predefined mutations triggered by the Mafia.
- **Sabotage:** Cooldown-based global disruptions.
- **Meetings:** Pauses gameplay for discussion.
- **Voting & Elimination:** Democratic removal of suspected Mafia.
- **Win Conditions:** Developers win by completing all tasks/tests. Mafia wins by eliminating Developers or time running out.

## Technology
- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Monaco Editor
- Backend: Supabase (PostgreSQL, Auth, Realtime)
- Hosting: Vercel

## MVP Requirements
- Multiplayer lobby and room joining.
- Secret role assignment and role reveal.
- Shared code editor (Monaco) with a small, predefined project.
- Ability for Developers to edit code and run tests.
- Ability for Mafia to inject predefined bugs.
- Emergency meetings, voting, and player elimination.
- Win/loss condition evaluation.
- Real-time synchronization of game state via Supabase.

## Explicitly Out of Scope
- Arbitrary remote code execution (RCE).
- A full Git client.
- Full VS Code functionality.
- Voice/Video chat.
- Matchmaking, social profiles, friend systems.
- Mobile applications.
- Complex CRDT collaboration systems (we use a simplified lock/sync or basic presence).
- AI-generated bugs.

## Important Architectural Rules
- **Keep implementation simple:** This is an 18-hour hackathon. MVP is the priority.
- **Do not duplicate business logic unnecessarily:** Keep game engine logic centralized where possible.
- **Do not allow frontend users to expose hidden roles:** Use RLS and secure backend checks. A client should NEVER receive other players' roles unless they are eliminated.
- **Do not implement arbitrary code execution:** Tests and bugs are predefined and deterministic.
- **Prefer deterministic game behavior:** Predictable state transitions.
- **Make components modular:** Easy for 4 people to work in parallel.
