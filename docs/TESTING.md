# Testing Strategy

Testing a multiplayer real-time game requires a structured approach, especially within an 18-hour hackathon.

## Milestones for Testing
1. Two players can join the same room.
2. They enter a game with different secret roles.
3. They can access/synchronize the codebase.
4. A Developer can complete a task.
5. Mafia can break a task.
6. Players can meet and vote.
7. Someone wins.

## Basic Tests (Component & Integration)
- Can create a room and get a valid code.
- Can join a room using the code.
- Roles are assigned correctly based on player count.
- A player can only see their own role in the UI (Verify RLS).
- File content loads in the editor.
- Code changes synchronize to the database.
- Deterministic tests run and correctly evaluate code state.
- Mafia can inject a predefined bug and it breaks a test.
- Emergency meeting locks the editor.
- Voting calculates the correct majority.
- Elimination changes player status and restricts their actions (Ghost permissions).
- Win conditions trigger correctly.

## Multiplayer Testing Workflow
- During development, use multiple browser profiles (e.g., Chrome, Chrome Incognito, Firefox) to simulate multiple players on a single machine.
- Have at least 3 active windows to test 1 Mafia and 2 Developers.

## Final Demo Script (End-to-End Scenario)
To validate the MVP before submission and for the final presentation, run this scripted game with 5 players (e.g., Soham, Rahul, Aryan, Kunal, Priya). 
*Note: Predefine Rahul as Mafia only for the demo, while real gameplay should still randomize roles.*

1. **Setup:** Create room. Four other players join.
2. **Start:** Host starts the game.
3. **Role Reveal:** Show secret role reveal.
4. **Action:** Soham fixes `auth.js`. Tests pass and progress rises.
5. **Sabotage:** Rahul opens `utils.js` and injects a bug.
6. **Testing:** Another player runs tests and sees sorting failure.
7. **Meeting:** Emergency meeting is called.
8. **Discussion:** Show activity log / diff evidence ("Who was in utils.js?").
9. **Voting:** Players vote Rahul.
10. **Elimination:** Reveal Rahul was Mafia.
11. **Recovery:** Complete remaining tasks.
12. **Victory:** Show 100% progress and Developer victory.
