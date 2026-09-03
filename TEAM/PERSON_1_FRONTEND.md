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

## Section 6 — Implementation order
- **Phase 1:** Set up routing, Landing page, Create/join room screens (using mock state).
- **Phase 2:** Lobby, Player list, Host controls, Role reveal.
- **Phase 3:** Main dashboard layout, File tree (UI only), Editor container, Player panel, Task panel, Progress bar.
- **Phase 4:** Mafia panel, Emergency meeting, Chat, Voting, Elimination, Result screen.
- **Phase 5:** Animations, Notifications, Responsive design, Final visual polish.

## Section 7 — Definition of Done
- All views are implemented and visually polished.
- UI responds correctly to mocked game state changes.
- Integrated with backend hooks provided by Person 3 & 4.
- No visual glitches during emergency meetings or role reveals.

## Section 8 — Integration instructions
- Initially build your components accepting standard props (e.g., `gameState`, `players`, `onVote`).
- Once Person 3 and 4 have the Supabase hooks ready, wrap your components in container components that map the backend state to your props.

## Section 9 — Important DON'Ts
- **DON'T** implement the Monaco Editor logic or file parsing (Person 2's job).
- **DON'T** write complex backend synchronization logic inside your UI components.
- **DON'T** expose secret roles in the UI inadvertently by checking full player arrays on the client.
