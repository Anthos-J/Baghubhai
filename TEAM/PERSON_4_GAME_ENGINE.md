# PERSON 4 — GAME ENGINE / MAFIA / TESTING

## Section 1 — Role
You are the Game Engine & Mechanics Lead. You own the rules of the game. You manage how the game progresses, how roles are assigned, how Mafia sabotages work, and how the game ends.

## Section 2 — Responsibilities
- Role assignment logic (determining how many Mafia based on player count)
- Developer task assignment and tracking Task completion
- Global progress calculation based on Tests
- Mafia controls and actions
- Bug injection logic (mutating code state based on predefined rules)
- Global sabotages (Syntax Blackout, Server Overload)
- Emergency meetings logic and Meeting timers
- Voting logic, tallying, and Elimination
- Ghost mode permissions
- Win conditions evaluation
- Game phase transitions
- Activity events generation
- Integration testing for the full game loop

## Section 3 — Deliverables
- A robust state machine managing the flow of the game (`LOBBY` -> `ROLE_REVEAL` -> `PLAYING` -> `MEETING` -> `VOTING` -> `PLAYING` -> `GAME_OVER`).
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

## Section 6 — Implementation order
- **Phase 1:** Define the game state machine, Game phases, Role assignment, Player count rules.
- **Phase 2:** Developer tasks, Task completion, Progress calculation.
- **Phase 3:** Mafia actions, predefined Bug injection logic, Sabotages (Syntax blackout, Server overload).
- **Phase 4:** Emergency meeting, Meeting timer, Voting, Elimination, Ghost mode.
- **Phase 5:** Win conditions, Activity events, Integration testing.

## Section 7 — Definition of Done
- The game can transition smoothly from lobby to game over.
- Mafia can successfully inject a bug that breaks a previously passing test.
- Voting accurately eliminates the correct player.
- Win conditions accurately trigger when tasks are done or time runs out/Developers are eliminated.

## Section 8 — Integration instructions
- Expose pure functions for state transitions where possible (e.g., `calculateNextState(currentState, action)`).
- Work with Person 3 to ensure your engine logic runs securely (either on the backend or securely verified if running on the host client).

## Section 9 — Important DON'Ts
- **DON'T** let the game state get stuck in an unresolvable phase (e.g., a meeting that never ends because a player disconnected). Implement fallback timers.
- **DON'T** overcomplicate Mafia actions. Use simple, predefined, controlled mutations (e.g., `AND` -> `OR`).
