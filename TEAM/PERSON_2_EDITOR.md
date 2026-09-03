# PERSON 2 — CODE EDITOR / CODEBASE

## Section 1 — Role
You are the Editor and Codebase Lead. You are responsible for integrating the Monaco Editor, managing the predefined mini-project the players will work on, tracking code changes, and running deterministic tests.

## Section 2 — Responsibilities
- Monaco Editor integration
- File tree logic and state
- Creating the predefined game project files (`auth.js`, `database.js`, etc.)
- File switching and editing state
- File presence indicators (who is looking at what file)
- Code synchronization support (with Person 3)
- Code change tracking and Diff viewer
- Task-to-file mapping
- Deterministic test runner
- Predefined bugs/regressions for the Mafia

## Section 3 — Deliverables
- A robust code editing environment embedded in the main dashboard.
- A functional predefined project with clear, fixable bugs.
- A deterministic testing system that accurately evaluates if tasks are completed.
- Read-only 'Ghost Mode' for eliminated players.

## Section 4 — Dependencies
- **Person 1 (Frontend):** Needs your editor component to mount inside the dashboard layout.
- **Person 3 (Backend):** Needs to synchronize code changes (e.g., debounced saves or basic presence) via Supabase Realtime.
- **Person 4 (Game Engine):** Relies on your test runner to determine if tasks are complete and progress should update.

## Section 5 — Files/components they are expected to work on
```
src/
  editor/
    CodeEditor.tsx
    FileTree.tsx
    DiffViewer.tsx
    testRunner.ts
    predefinedProject.ts
    bugDefinitions.ts
```

## Section 6 — Implementation order
- **Phase 1:** Monaco installation, basic Editor component, File tree logic.
- **Phase 2:** Define the initial predefined project files and example bugs. Implement file selection and local editing state.
- **Phase 3:** Task mapping, Deterministic test runner, Test results evaluation.
- **Phase 4:** Realtime integration (syncing code changes/presence with Person 3), Change tracking.
- **Phase 5:** Read-only ghost mode, Diff viewer, Polish editor interactions.

## Section 7 — Definition of Done
- Monaco Editor loads and syntax highlights correctly.
- Predefined project has at least 5 files with specific, fixable bugs.
- Tests can be run and accurately report success/failure without executing arbitrary code (e.g., using AST parsing, regex, or safe sandboxed evaluation).
- Editor correctly locks or turns read-only during meetings and for ghosts.

## Section 8 — Integration instructions
- Expose a `<CodeEditor />` component that takes `currentFile`, `codeContent`, and `onChange` callbacks.
- Expose a `runTests(filesState)` function that returns a boolean or list of passed tasks for the Game Engine.

## Section 9 — Important DON'Ts
- **DON'T** implement arbitrary remote code execution (RCE). No Docker containers, no raw `eval()` without strict sandbox controls. Use deterministic checking (e.g., "Does auth.js line 14 say 'return true' instead of 'return false'?").
- **DON'T** spend time on full language server (LSP) features beyond basic Monaco defaults.
