# PERSON 1 — FRONTEND / UI

## Section 1 — Role
You are the Frontend & UI Lead. You own the complete visual experience of Code Mafia. Your goal is to make the game look and feel like a hybrid of VS Code, a multiplayer game, and a social deduction game.

## Section 2 — Responsibilities
- Landing page
- Create/Join room UI
- Lobby and Player list
- Role reveal animations and screens
- Main game dashboard layout
- File tree UI (visuals)
- Player panel and Task panel
- Progress indicator
- Emergency meeting UI, Chat UI, Voting UI
- Result and Game Over screens
- Animations and responsive/polished visual design

## Section 3 — Deliverables
- A fully styled React application using Tailwind CSS and shadcn/ui.
- Seamless transitions between game states (Lobby -> Reveal -> Game -> Meeting).
- A polished, intuitive user interface that feels premium despite being built in 18 hours.

## Section 4 — Dependencies
- **Person 2 (Editor):** Needs the main dashboard layout to mount the Monaco Editor component and file tree logic.
- **Person 3 (Backend):** Needs the Supabase schema and realtime endpoints to connect UI state to the actual database.
- **Person 4 (Game Engine):** Needs the game state definitions to render the correct UI phases (e.g., when to show the voting screen).

## Section 5 — Files/components they are expected to work on
```
src/
  pages/
    Landing.tsx
    Room.tsx
    GameDashboard.tsx
  components/
    ui/ (shadcn components)
    Lobby.tsx
    RoleReveal.tsx
    PlayerList.tsx
    TaskPanel.tsx
    MeetingModal.tsx
    VotingScreen.tsx
```

## Section 6 — Implementation order (18-Hour Hackathon Timeline)
- **HOUR 1-3:** Landing, Lobby, Role screen, Game layout.
- **HOUR 3-5:** Connect UI to Supabase with Person 3 (Goal: Create Room -> Join -> Lobby -> Start -> Role Reveal).
- **HOUR 5-7:** Integrate Monaco and File Tree with Person 2 and 3.
- **HOUR 7-9:** Build Task and Test UI.
- **HOUR 11-13:** Build Emergency meeting, Chat, Activity log, Diff evidence, Voting UI.
- **HOUR 13-14:** Build Elimination, Ghost mode, Victory screens.
- **HOUR 14-15:** UI polish, Animations, Notifications, Better visual hierarchy.
- **HOUR 15-18:** Deploy, Multiplayer test, Critical bug fixes.

## Section 7 — Definition of Done
- All views are implemented and visually polished.
- UI responds correctly to mocked game state changes.
- Integrated with backend hooks provided by Person 3 & 4.
- No visual glitches during emergency meetings or role reveals.

## Section 8 — Integration instructions
- Initially build your components accepting standard props (e.g., `gameState`, `players`, `onVote`).
- Once Person 3 and 4 have the Supabase hooks ready, wrap your components in container components that map the backend state to your props.

## CODE MAFIA VISUAL DESIGN SYSTEM
The game uses a **Pixel-Art Sci-Fi Control Room** aesthetic. 
You are responsible for applying this design system throughout all pages.
Do NOT introduce a separate visual style for your feature. Use the shared design tokens, PixelCard, GameButton, and retro typography established in `src/index.css` and `tailwind.config.js`.

## Section 9 — Important DON'Ts
- **DON'T** implement the Monaco Editor logic or file parsing (Person 2's job).
- **DON'T** write complex backend synchronization logic inside your UI components.
- **DON'T** expose secret roles in the UI inadvertently by checking full player arrays on the client.
