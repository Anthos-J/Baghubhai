# PERSON 4 — GAME ENGINE / MAFIA / TESTING

## Section 1 — Role
You are the Game Engine & Mechanics Lead. You own the rules of the game. You manage how the game progresses, how roles are assigned, how Mafia sabotages work, and how the game ends.

## Section 2 — Responsibilities
- Role and task assignment logic
- Task completion and Progress calculation
- Mafia controls (Bug injection, Syntax Blackout, Server Overload)
- Emergency meetings, Timers, Voting, Elimination
- Ghost mode permissions and Win conditions
- Game phases state machine
- Integration testing for the full game loop

## Section 3 — Deliverables
- A robust state machine managing the flow of the game (`LOBBY` -> `ROLE_REVEAL` -> `PLAYING` -> `MEETING` -> `VOTING` -> `GAME_OVER`).
- Functions for Mafia to trigger sabotages and inject bugs safely.
- Voting resolution logic to determine who is eliminated.
- End-to-end integration tests verifying a full game session.

## Section 4 — Dependencies
- **Person 1 (Frontend):** Needs your state machine to know what screen to show.
- **Person 2 (Editor):** Needs your bug definitions to know what code to mutate when a bug is injected, and provides you test results to evaluate progress.
- **Person 3 (Backend):** Needs to store the state transitions you calculate, and run your role assignment logic securely.

## Section 5 — Files/components they are expected to work on
```
src/
  game/
    gameEngine.ts
    stateMachine.ts
    mafiaActions.ts
    votingLogic.ts
    roles.ts
  tests/
    integration.test.ts
```

## Section 6 — Implementation order (18-Hour Hackathon Timeline)
- **HOUR 1-3:** Roles, Tasks, Bug injection, Mafia actions, Voting, Win conditions (Logic level).
- **HOUR 3-5:** Integrate state machine with backend (Start Game, Role Reveal).
- **HOUR 7-9:** Tasks + deterministic tests logic. (Test -> Pass -> Task Complete -> Progress increases).
- **HOUR 9-11:** Mafia controls integration.
  - Bug injection (uses predefined mutations only).
  - Syntax Blackout (Visual syntax highlighting disabled for 30s).
  - Server Overload (Create a simple timed emergency objective for selected developers).
- **HOUR 11-13:** Emergency meeting flow, Discussion timer, Voting mechanics.
- **HOUR 13-14:** Elimination, Ghost mode logic, Victory checks, Restart capability.
- **HOUR 15-18:** End-to-end testing, bug fixing, demo preparation.

## Section 7 — Definition of Done
- The game can transition smoothly from lobby to game over.
- Mafia can successfully inject a bug that breaks a previously passing test.
- Voting accurately eliminates the correct player.
- Win conditions accurately trigger when tasks are done or time runs out/Developers are eliminated.

## Section 8 — Integration instructions
- Expose pure functions for state transitions where possible.
- Work with Person 3 to ensure your engine logic runs securely.

## Section 9 — Important DON'Ts
- **DON'T** let the game state get stuck in an unresolvable phase. Implement fallback timers.
- **DON'T** overcomplicate Mafia actions. Use simple, predefined, controlled mutations (e.g., `AND` -> `OR`).
