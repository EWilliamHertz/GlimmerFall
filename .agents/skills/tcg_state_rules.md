# TCG State Rules

1. ALL game logic must reside entirely on the backend.
2. The system must utilize an Event Sourcing pattern.
3. The frontend is forbidden from calculating outcomes; it must only render state deltas received via WebSocket.
4. Any card can be played face-down as a 'Glimmer Node'.
5. 'Overload' logic: calculate end-of-turn damage if unspent Glimmer exceeds 3.
