# Game Input Agency 001

This directory implements the authorized `AMENDMENT-GAME-INPUT-AGENCY-001`
as an isolated successor over the byte-bound DEMO-003 kernel.

`GameTickInputV0` remains available only through the unmodified DEMO-003
replay surface. New playable runs accept `GameTickInputV1(tick,
player_action)` only. A player action proposes one planar lattice movement;
the kernel admits or blocks the candidate against the canonical three-
dimensional `ArenaSpecV1`. Blocked movement retains the prior position and is
recorded explicitly. It is never clamped.

The Gen0 movement plane is `z = 0`, but canonical positions are always
`(x, y, z)`. The logical unfolding coordinate `w` is not an input field. It is
advanced exactly once by the governed tick, including for `STAY` and blocked
movement.

`ascii_projection.py` is the first read-only consumer. It receives committed
snapshots rather than an engine handle, owns only GAME/CARRIER surface
selection, and cannot advance the world.

Run:

```powershell
python run_conformance.py
python ascii_gen0.py
```

Expected closure: `M01-M16 := 16/16`, with DEMO-003 `28/28` unchanged.

Terminal controls are `W/A/S/D` or the arrow keys to submit movement, `C` to
toggle GAME/CARRIER without advancing a tick, and `Q` to close the terminal
surface. Closing the surface does not mutate or terminate the canonical run.
