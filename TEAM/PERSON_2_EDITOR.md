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

## Section 3 — Predefined Game Codebase & Bugs
Use 5 simple files in `/src`:
1. `auth.js`
   - **Bug:** `return username === "admin" || password === "admin123";`
   - **Correct:** `return username === "admin" && password === "admin123";`
2. `utils.js`
   - **Bug:** `return scores.sort((a, b) => b - a);`
   - **Correct:** `return scores.sort((a, b) => a - b);`
3. `database.js`
   - **Bug:** `function connectDatabase() { return false; }`
   - **Correct:** `function connectDatabase() { return true; }`
4. `payment.js`
   - **Bug:** `return amount >= 0;`
   - **Correct:** `return amount > 0;`
5. `app.js` (General structure, no specific initial bug)

## Section 4 — Dependencies
- **Person 1 (Frontend):** Needs your editor component to mount inside the dashboard layout.
- **Person 3 (Backend):** Needs to synchronize code changes via Supabase Realtime.
- **Person 4 (Game Engine):** Relies on your test runner to determine if tasks are complete.

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

## Section 6 — Implementation order (18-Hour Hackathon Timeline)
- **HOUR 1-3:** Monaco Editor, File tree, Predefined files, Task/test UI, Diff viewer.
- **HOUR 5-7:** Connect File Tree -> Monaco -> Supabase -> Realtime. Editing on one browser updates others.
- **HOUR 7-9:** Tasks + deterministic tests. (Test -> Pass -> Task Complete).
- **HOUR 9-11:** Integrate Mafia controls (Bug injection, Syntax Blackout) with Editor.
- **HOUR 11:** Verify: Developer fixes -> tests pass -> Mafia injects -> tests fail.
- **HOUR 11-14:** Support evidence gathering (Diff evidence) for meetings.

## Section 7 — Definition of Done
- Monaco Editor loads and syntax highlights correctly.
- Predefined project has at least 5 files with specific, fixable bugs.
- Tests can be run and accurately report success/failure using deterministic checks.
- Editor correctly locks or turns read-only during meetings, syntax blackouts, and for ghosts.

## Section 8 — Integration instructions
- Expose a `<CodeEditor />` component that takes `currentFile`, `codeContent`, and `onChange` callbacks.
- Expose a `runTests(filesState)` function that returns a boolean or list of passed tasks.

## Section 9 — Important DON'Ts
- **DON'T** implement arbitrary remote code execution (RCE).
- **DON'T** let Mafia type arbitrary malicious code; use predefined bug mutations only.
