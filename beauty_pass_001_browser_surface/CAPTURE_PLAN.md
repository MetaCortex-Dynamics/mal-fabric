# BEAUTY-PASS-001 capture choreography

Target: 20–25 seconds. No explanatory title before the first toggle.

## Beat 1 — ordinary game assumption (0–11s)

- Start in GAME, full screen.
- Move with canonical WASD actions until the committed enemy action transitions from PATROL/idle into APPROACH/CHASE.
- Let the third-person camera and committed animation binding carry the scene; no proof UI is visible.

## Beat 2 — reveal (≈11–16s)

1. At a visually readable chase state, record the current `game_run_id`, `logical_tick_index`, `snapshot_digest`, and enemy identity from `window.__beautyPassState`.
2. Press `Tab`.
3. The toggle itself performs no API request and therefore cannot advance the logical tick.
4. CARRIER shows the same run, tick, snapshot, joint-state digest, and enemy action.
5. While CARRIER remains visible, submit one or more ordinary canonical movement actions (or `STAY` through the bridge/capture harness if desired). Those actions advance the kernel normally; CARRIER redraws from their returned committed snapshots.

The reveal proof is the first CARRIER frame immediately after `Tab`: SAME RUN + SAME TICK + SAME SNAPSHOT. Continued execution is evidenced by subsequent committed ticks, not by presentation animation.

## Beat 3 — return (≈16–22s)

- Press `Tab` again. This second toggle also performs no API request.
- GAME returns using the latest committed snapshot.
- The enemy is rendered at the kernel-committed position/action reached while CARRIER was visible.
- Continue moving for several ticks and cut.

## Required evidence

```text
TOGGLE_1:
  before.game_run_id       == after.game_run_id
  before.logical_tick      == after.logical_tick
  before.snapshot_digest   == after.snapshot_digest
  before.enemy.entity_id   == after.enemy.entity_id

CARRIER_CONTINUATION:
  later.logical_tick       > reveal.logical_tick
  later.game_run_id        == reveal.game_run_id

TOGGLE_2:
  pre_toggle.latest_snapshot_digest
  ==
  post_toggle.latest_snapshot_digest
```

`Tab` never demonstrates progress by itself. Progress is always caused by admitted kernel input and evidenced by a new committed snapshot.

## Copy boundary

Preferred spoken/post copy:

> That creature chasing you? Press Tab. That's its running program — same entity, same state, same tick. Press Tab again. You're back in the fight.

Do not call CARRIER "source code" unless literal source text is the rendered object.
