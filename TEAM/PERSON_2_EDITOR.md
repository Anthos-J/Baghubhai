# PERSON 2 — CODE EDITOR + CODEBASE

## Section 1 — Role
You are the Editor Lead. You own everything that happens *after* a player enters a coding room on the 2D map. You are responsible for Monaco Editor integration, task validation, bug mutations, and diff generation.

## Section 2 — Responsibilities
- Monaco Editor initialization and lifecycle
- File loading and code state management
- Room-to-file mapping (e.g., Auth Lab -> auth.js)
- Task list presentation and progress
- Deterministic testing (pass/fail validation)
- Mafia bug mutations (e.g., changing `&&` to `||`)
- Code change history and diff rendering (evidence for meetings)
- Read-only states (for Ghosts or non-assigned players)

## Section 3 — Dependencies
- **Person 1 (Frontend):** Triggers your Editor components when a player interacts with a room.
- **Person 3 (Backend):** Syncs file changes and editor presence across clients.
- **Person 4 (Game Engine):** Assigns tasks and validates Mafia sabotage actions.

## Section 4 — Files/components expected to work on
```
src/editor/*
src/components/editor/*
```

## Section 5 — Implementation Phases
1. **Monaco Integration:** `CodeEditor.tsx`, load files, read/write state.
2. **Codebase & Room Mapping:** Define the 5 static files (`auth.js`, `database.js`, `utils.js`, `payment.js`, `app.js`). Map them to the physical rooms on the map.
3. **Task System:** Present tasks assigned to the player.
4. **Deterministic Testing:** Implement `runTest()` which validates if the player's code matches the expected logical output (NO arbitrary remote code execution).
5. **Bug Mutations:** Implement predefined bugs for Mafia to inject (e.g., swap `+` for `-`).
6. **Diff & History:** Track previous/new code and who made the change for meeting evidence.
7. **Editor Presence:** Show who else is currently viewing the same file.

## Section 6 — Definition of Done
- [ ] Monaco works
- [ ] Five static code files load correctly based on room mapping
- [ ] File editing works
- [ ] Task list and progress displayed
- [ ] Deterministic tests pass/fail correctly
- [ ] Bug mutations can be injected by Mafia
- [ ] Diff and change history works
- [ ] Ghost read-only state works
- [ ] Exit back to map works

## Section 7 — Important DON'Ts
- **DON'T** build a full VS Code clone or full Git client.
- **DON'T** implement arbitrary remote code execution (RCE). Use deterministic static checks or isolated evaluations.
- **DON'T** own map movement, game rules, or role assignments.
