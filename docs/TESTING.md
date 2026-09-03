# Testing Strategy

Testing a multiplayer real-time game requires a structured approach, especially within an 18-hour hackathon.

## Basic Tests (Component & Integration)
- Can create a room and get a valid code.
- Can join a room using the code.
- Host can start the game.
- Roles are assigned correctly based on player count.
- A player can only see their own role in the UI (Verify RLS).
- File content loads in the editor.
- Code changes synchronize to the database.
- Deterministic tests run and correctly evaluate code state.
- Task status updates when tests pass.
- Mafia can inject a bug and it breaks a test.
- Emergency meeting locks the editor.
- Voting calculates the correct majority.
- Elimination changes player status and restricts their actions (Ghost permissions).
- Win conditions trigger correctly.

## Multiplayer Testing Workflow
- During development, use multiple browser profiles (e.g., Chrome, Chrome Incognito, Firefox) to simulate multiple players on a single machine.
- Have at least 3 active windows to test 1 Mafia and 2 Developers.

## Final End-to-End Scenario Script
To validate the MVP before submission, run this scripted game:

1. **Setup:** Five players join the lobby.
2. **Start:** Host starts the game. One Mafia is assigned.
3. **Action:** A Developer fixes `auth.js` and a task is marked complete.
4. **Sabotage:** The Mafia breaks `utils.js` using a predefined bug injection.
5. **Testing:** A Developer runs tests; tests fail unexpectedly.
6. **Meeting:** A Developer calls an emergency meeting.
7. **Discussion:** Players review the activity log ("Who was in utils.js?").
8. **Voting:** The Mafia is identified and voted out.
9. **Recovery:** Developers fix `utils.js` and complete the remaining tasks.
10. **Victory:** Developers win the game. The result screen displays correctly.
