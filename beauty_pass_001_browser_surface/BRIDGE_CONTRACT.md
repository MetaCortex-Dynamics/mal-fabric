# BEAUTY-PASS-001 bridge contract

The browser surface consumes a normalized presentation record emitted by the local promoted agency/kernel bridge. Normalization happens on the kernel side because only that side knows the authoritative schema. The browser MUST NOT infer gameplay state from pixels, animation, elapsed time, or asset transforms.

`bridge.state()` and `bridge.submit_player_action(action)` return:

```json
{
  "snapshot": {
    "game_run_id": "...",
    "logical_tick_index": 42,
    "snapshot_digest": "...",
    "fabric_digest": "...",
    "joint_state_digest": "...",
    "run_status": "RUNNING",
    "player": {
      "entity_id": "player",
      "position": [0, 0, 0],
      "action": "STAY",
      "blocked": false
    },
    "enemy": {
      "entity_id": "enemy_01",
      "position": [4, 0, 0],
      "action": "APPROACH",
      "health": 100,
      "blocked": false
    },
    "carrier": {
      "cells": [],
      "routes": [],
      "payload_states": {}
    }
  }
}
```

## Required invariants

- `position` is committed canonical world state `(x,y,z)`, never renderer state.
- `enemy.action` is committed kernel behavior. The browser only selects an animation clip from it.
- `logical_tick_index` is `w`; the browser cannot set it.
- `snapshot_digest`, `game_run_id`, and `joint_state_digest` are read-only proof identity.
- `carrier.cells/routes/payload_states` are committed projection inputs, not reconstructed from the GAME scene.
- `Tab`/`C` surface switching is browser-local and MUST NOT call `bridge.state()` for mutation or submit an action.
- One `/api/action` call submits exactly one canonical `PlayerAction`; the returned successor snapshot is the only source of movement.

If the local agency lineage uses a different internal representation, its bridge adapter must normalize it to this shape without changing semantics.
