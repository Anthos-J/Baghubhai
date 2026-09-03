# CODE MAFIA

"Among Us meets collaborative debugging."

## Problem
Software development relies on collaboration and teamwork, but identifying whether a team member is unintentionally introducing problems or deliberately causing them can be challenging.

## Solution
Code Mafia is a multiplayer collaborative debugging game inspired by social-deduction games. Developers must collaboratively repair a predefined broken software project, complete debugging tasks, and pass tests, while Mafia players secretly try to prevent this by injecting bugs, creating regressions, and triggering sabotage events without being detected.

## Features
- Multiplayer lobby with room creation and joining
- Secret role assignment (Developers and Mafia)
- Shared codebase with real-time collaborative coding via Monaco Editor
- Predefined deterministic tests and tasks
- Mafia bug injection and sabotage (Syntax Blackout, Server Overload)
- Emergency meetings, chat, voting, and player elimination
- Real-time synchronized game state

## Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Editor:** Monaco Editor
- **Backend:** Supabase (PostgreSQL, Supabase Realtime)
- **Hosting:** Vercel

## Architecture
See `docs/ARCHITECTURE.md` for a detailed breakdown.
The system heavily relies on Supabase Realtime for synchronizing the game state between the React frontend clients. The database uses Row Level Security (RLS) to ensure secret roles are protected and only accessible by the assigned players.

## How to Run
*(Instructions will be added here once the MVP is ready)*

## Team
- **Person 1:** Frontend / UI
- **Person 2:** Code Editor / Codebase
- **Person 3:** Backend / Supabase / Realtime
- **Person 4:** Game Engine / Mafia / Testing

## Future Scope
- More complex predefined projects and debugging challenges
- Matchmaking and public lobbies
- Advanced mafia sabotage abilities
- Spectator mode

## Git Workflow
- **Main branch:** `main`
- **Feature branches:** `frontend/*`, `editor/*`, `backend/*`, `game-engine/*`

**Rules:**
* Never directly push experimental code to `main`.
* Pull the latest `main` before starting work.
* Make focused commits.
* Open a pull request before merging major features.
* Test before merging.
* Avoid large unrelated changes.
* Do not rewrite another person's subsystem without coordination.
