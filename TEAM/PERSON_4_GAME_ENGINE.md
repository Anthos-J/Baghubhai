# PERSON 4 — GAME ENGINE + MAFIA

## Section 1 — Role
You are the Game Engine Lead. You own the authoritative game rules, role distribution, task assignment, Mafia mechanics, and win conditions.

## Section 2 — Responsibilities
- Role distribution (4 Developers + 1 Mafia for 5 players).
- Task assignment and completion validation.
- Mafia mechanics: Bug injection validation and Sabotages (Syntax Blackout, Server Overload).
- Emergency meeting state transitions and timers.
- Voting rules, majority calculation, and player elimination.
- Ghost rules (what eliminated players can/cannot do).
- Win/Loss conditions.

## Section 3 — Dependencies
- **Person 1 (Frontend):** Renders your game state phases (Playing vs Meeting) and Ghost states.
- **Person 2 (Editor):** Uses your task assignments and bug injection validations.
- **Person 3 (Backend):** Persists your rule calculations to the database.

## Section 4 — Files/components expected to work on
```
src/game/*
src/components/meeting/* (relevant logic)
src/components/voting/* (relevant logic)
```

## Section 5 — Implementation Phases
1. **Role Distribution:** `assignRolesToPlayers()`. Ensure configurable Mafia counts for larger games.
2. **Task Assignment:** Generate and assign coding tasks to Developers.
3. **Completion & Win (Devs):** Validate tasks and calculate global progress. Trigger Developer Win at 100%.
4. **Mafia Actions:** Validate `injectBug()`. MVP Rule: Mafia must be inside the target physical room to sabotage the code.
5. **Sabotages:** Implement timers and logic for Syntax Blackout and Server Overload.
6. **Meetings & Voting:** Freeze the game state. Implement discussion timers, vote casting, and majority calculations.
7. **Elimination & Ghosts:** Transition eliminated players to ghosts. Ensure ghosts cannot vote or edit.
8. **Win (Mafia):** Trigger Mafia Win if `mafiaAlive >= developerAlive`.

## Section 6 — Definition of Done
- [ ] Role distribution logic
- [ ] Task assignment and progress
- [ ] Bug injection validation
- [ ] Sabotages (Syntax Blackout, Server Overload)
- [ ] Emergency Meeting state flow
- [ ] Discussion timer and Voting logic
- [ ] Majority calculation and Elimination
- [ ] Ghost restrictions
- [ ] Developer win condition
- [ ] Mafia win condition

## Section 7 — Important DON'Ts
- **DON'T** implement the visual components for meetings (Person 1 does this).
- **DON'T** manage database infrastructure or Realtime connections (Person 3 does this).
- **DON'T** let the game get stuck in an endless phase. Use strict timers for discussions and voting.
