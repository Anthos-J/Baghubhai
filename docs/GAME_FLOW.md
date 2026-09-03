# Game Flow

```text
Player creates room
        ↓
Players join (Lobby State)
        ↓
Host starts game
        ↓
Roles assigned securely by Backend
        ↓
Role reveal (Clients show assigned roles)
        ↓
Players enter codebase (Playing State)
        ↓
Developers fix tasks / run tests
        ↓
Mafia sabotages / injects bugs
        ↓
Tests fail (or progress halts)
        ↓
Player calls Emergency Meeting (Meeting State)
        ↓
Discussion (Chat / Activity Review)
        ↓
Vote (Voting State)
        ↓
Votes tallied, Player Elimination (if majority)
        ↓
Check victory conditions
  ├─ Developers finish tasks -> Developers Win (Game Over State)
  ├─ Mafia eliminates enough Devs / time runs out -> Mafia Wins (Game Over State)
  └─ Otherwise -> Continue (Return to Playing State)
```

## Major Game States
- **LOBBY:** Waiting for players. Settings can be changed by the host.
- **ROLE_REVEAL:** A brief animation showing the player their role.
- **PLAYING:** The main gameplay loop. The editor is active.
- **MEETING:** Gameplay is paused. The editor is locked. Players discuss.
- **VOTING:** Players cast their vote.
- **GAME_OVER:** Roles are revealed to everyone. The winning team is declared.
