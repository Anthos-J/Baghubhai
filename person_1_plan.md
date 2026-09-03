# Person 1 (Frontend & 2D World) Comprehensive Implementation Plan

This is the expanded, end-to-end blueprint for Person 1. It covers everything from the React Router shell and UI component extraction to the granular architecture of the HTML5 Canvas 2D engine, meeting the strict requirements defined in the master spec.

## Goal Description
Build the complete Frontend Shell and the 2D Game World. This includes all navigational flows (Home -> Lobby -> Role Reveal -> 2D Map -> Meeting -> Game Over), the mock state abstraction layer, the interactive UI overlays (HUD, Meetings), and the core Canvas engine (Movement, Collision, Rendering, Camera, Interaction).

## User Review Required

> [!IMPORTANT]
> The biggest challenge is connecting the 60fps Canvas Engine with React UI overlays without causing massive re-renders. 
> 
> **Architecture Decision:** The Canvas will maintain its own internal state loop for high-speed coordinate calculation. It will only update the React `zustand` store when a state change is strictly required for the UI (e.g., when the player enters a room zone, we update a boolean `canInteract` so React renders the `[E] Interact` button overlay).

## Open Questions
1. **Procedural vs. Assets:** I will draw the map procedurally (drawing rectangles and glowing borders on the canvas) to match the pixel-art sci-fi theme quickly without relying on external spritesheets. Do you approve?
2. **Mock State:** I will use `zustand` to create a `mockStore.ts` that acts as the temporary data source for our hooks (`useGame`, `usePlayers`), allowing us to test the entire flow locally before Person 3 wires it to Supabase. Do you approve?

---

## Proposed Changes

### Phase 1: Routing & App Shell
Configure `react-router-dom` to manage the transition between the main menu and active game rooms.
- [NEW] `src/App.tsx`: Define the routes:
  - `/` -> `Home.tsx`
  - `/room/:roomId` -> `Room.tsx` (Master container that switches views based on `gamePhase`).
- [MODIFY] `src/pages/Home.tsx`: Wire up `handleCreateRoom()` and `handleJoinRoom()` to navigate to `/room/:roomId`.
- [NEW] `src/components/game/GameShell.tsx`: The layout wrapper that ensures the visual design system stays consistent across all phases.

### Phase 2: State Abstraction (Zustand Hooks)
We will build clean interfaces so Person 3 (Backend) can swap the data source later without rewriting UI logic.
- [NEW] `src/store/mockStore.ts`: A Zustand store holding mock players, game phase, and tasks.
- [NEW] `src/hooks/useRoom.ts`: Access room configuration and connection status.
- [NEW] `src/hooks/useGame.ts`: Access `gamePhase`, timer, and `setGamePhase()`.
- [NEW] `src/hooks/usePlayers.ts`: Access the list of all players (for rendering on the map) and `localPlayer`.

### Phase 3: Static UI to Interactive React
Refactor the static screens into state-driven components.
- [MODIFY] `src/pages/Lobby.tsx`: Read from `usePlayers()`. Implement `handleStartGame()` to transition phase to `ROLE_REVEAL`.
- [MODIFY] `src/pages/RoleReveal.tsx`: Show the role, wait 3 seconds, then transition phase to `PLAYING` (which shows the 2D Map).
- [NEW] `src/components/meeting/MeetingModal.tsx`: An overlay that appears when `gamePhase === 'MEETING'`. Contains chat and discussion UI.
- [NEW] `src/components/voting/VotingScreen.tsx`: Triggered after discussion; allows alive players to select a target.
- [MODIFY] `src/pages/Result.tsx`: Reads the winner from state and displays the final stats.

### Phase 4: 2D Game World Setup (Canvas Engine)
Establish the dedicated rendering and game loop inside `src/map/`.
- [NEW] `src/map/GameCanvas.tsx`: The React component that mounts `<canvas ref={canvasRef} />` and starts the `requestAnimationFrame` loop.
- [NEW] `src/map/Engine.ts`: Manages the tick updates and clears the canvas every frame.
- [NEW] `src/map/MapData.ts`: Defines the static coordinates (`x, y, w, h`) of the walls, Central Hub, Auth Lab, Database Room, Mainframe, etc.
- [NEW] `src/map/MapRenderer.ts`: Procedurally draws the floors and glowing neon walls based on `MapData.ts`.

### Phase 5: Player Movement, Collision & Camera
- [NEW] `src/map/Movement.ts`: Implements `moveUp`, `moveDown`, `moveLeft`, `moveRight` bound to WASD/Arrows. Uses `calculateVelocity()` and `normalizeMovement()` to prevent faster diagonal running.
- [NEW] `src/map/Collision.ts`: Implements `checkCollision()` (AABB rectangle collision) against the walls in `MapData.ts`. Prevents movement if blocked.
- [NEW] `src/map/Camera.ts`: Implements `updateCamera()` and `centerCameraOnPlayer()`. Uses `worldToScreen()` offsets to draw everything relative to the local player.
- [NEW] `src/map/PlayerRenderer.ts`: Draws the local player (and remote players fetched from `usePlayers()`) with their respective colors, names, and direction indicators.

### Phase 6: Room Zones & Interaction
Detect when the player enters a physical room and prompt them to enter the code editor (owned by Person 2).
- [NEW] `src/map/RoomZones.ts`: Defines the interaction bounding boxes for each coding room.
- [NEW] `src/map/Interaction.ts`: Checks `isInsideRoom()`. If true, it triggers `showInteractPrompt()` in the React state.
- [NEW] `src/components/map/GameHUD.tsx`: React overlay on top of the canvas. Shows:
  - Task progress bar.
  - Emergency Meeting button (if near the Emergency Terminal zone).
  - An animated `[E] INTERACT` button when inside an active RoomZone. Clicking this will call `openCodingRoom()` to hand off control to Person 2.

### Phase 7: Multiplayer Pre-Wiring
- [NEW] `src/lib/events.ts`: Create an internal event emitter. When `Movement.ts` updates the local player's position, it emits a `PLAYER_MOVED` event. (Person 3 will later listen to this event to broadcast the coordinates via Supabase Realtime).

---

## Verification Plan

### Automated Tests
- Run `npm run build` and `npm run lint`.
- Verify TypeScript compilation for the new `GameCanvas` and Hook interfaces.

### Manual Verification
The ultimate test of Person 1's flow:
1. Load `/` and click "Create Room".
2. View the `Lobby` populated with mock players.
3. Click "Start Game". See the `RoleReveal` screen.
4. Automatically drop into the `GameCanvas` (2D Map).
5. Verify WASD movement, camera tracking, and wall collisions.
6. Verify remote players are visible and standing on the map.
7. Walk into the "Auth Lab" area; verify the `[E] INTERACT` UI overlay appears.
8. Click "Emergency Meeting" on the HUD; verify the `MeetingModal` overlay freezes the game.
