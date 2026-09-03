# PERSON 1 — FRONTEND + 2D WORLD

## Section 1 — Role
You are the Frontend & UI Lead. Your core responsibility is the application shell, routing, static screens, and the **2D Game World**. Code Mafia is a 2D top-down multiplayer game (like Among Us), and the map is the primary game experience.

## Section 2 — Responsibilities
- Routing and Application Shell (`Home`, `Lobby`, `RoleReveal`, `Room`)
- **2D Game World** (HTML5 Canvas + React integration)
- Map rendering, Player rendering (local and remote)
- Local player movement (WASD/Arrows), Camera tracking
- Simple rectangle collision and map zones
- Room interaction (detecting when a player enters a room and pressing [E] to open the Editor)
- Game HUD (Task progress, timer, meeting buttons)
- Meeting, Voting, and Result presentation

## Section 3 — Dependencies
- **Person 2 (Editor):** You open their `CodeEditor` component when a player interacts with a room.
- **Person 3 (Backend):** You send local movement and receive remote player movement updates via Realtime.

## Section 4 — Files/components expected to work on
```
src/map/*
src/pages/*
src/components/lobby/*
src/components/map/*
src/components/game/*
src/components/meeting/*
src/components/voting/*
src/components/result/*
```

## Section 5 — Implementation Phases
1. **Routing & App Shell:** `/` (Home), `/room/:roomId` (Room container).
2. **Lobby & Role Reveal:** Basic lobby UI and secret role reveal animations.
3. **2D Map:** Implement `GameCanvas.tsx`, `MapRenderer.ts`. Draw the static sci-fi command-center map with zones (Auth Lab, Database Room, etc.).
4. **Movement & Collision:** Implement `Movement.ts` and `Collision.ts`. Local player moves with WASD, collides with walls.
5. **Room Interaction:** Detect when a player is in a room. Show `[E] INTERACT` prompt. Transition to Person 2's Editor.
6. **Other Players:** Render remote players moving on the map based on data from Person 3.
7. **Camera:** Follow the local player (`worldToScreen`).
8. **Emergency Terminal & HUD:** Interaction to call a meeting, and overlay HUD.

## Section 6 — Definition of Done
- [ ] Home, Lobby, Role Reveal
- [ ] 2D Map rendering
- [ ] Player movement and collision
- [ ] Room detection and Interact prompt
- [ ] Coding-room transition
- [ ] Other players visible with remote movement
- [ ] Emergency terminal interaction
- [ ] Meeting/Voting/Result UI
- [ ] Adherence to the Pixel-Art Sci-Fi theme

## Section 7 — Important DON'Ts
- **DON'T** implement authoritative game rules or role assignment.
- **DON'T** implement Monaco Editor internals.
- **DON'T** send database writes on every animation frame (throttle movement via Realtime broadcasts).
- **DON'T** implement complex physics engines. Stick to simple rectangle collision.
