#!/usr/bin/env python3
"""Local fail-closed checks for the BEAUTY-PASS-001 kernel bridge."""
from __future__ import annotations

from copy import deepcopy

import browser_bridge


def require(condition: bool, label: str) -> None:
    if not condition:
        raise AssertionError(label)


def main() -> int:
    bridge = browser_bridge.create_browser_bridge()
    initial = bridge.state()
    repeated = bridge.state()
    require(initial == repeated, "B_STATE_READ_NONMUTATION")
    before = deepcopy(initial["snapshot"])
    successor = bridge.submit_player_action("MOVE_N")["snapshot"]
    require(successor["logical_tick_index"] == before["logical_tick_index"] + 1, "B_ONE_ACTION_ONE_TICK")
    require(successor["player"]["position"] == [0, 1, 0], "B_COMMITTED_PLAYER_POSITION")
    require(successor["enemy"]["action"] in {"PATROL", "APPROACH", "FLEE"}, "B_COMMITTED_ENEMY_ACTION")
    require(successor["joint_state_digest"] == successor["snapshot_digest"], "B_JOINT_DIGEST_ALIAS")
    require(bool(successor["carrier"]["cells"]), "B_COMMITTED_CARRIER_CELLS")
    require(bool(successor["carrier"]["routes"]), "B_COMMITTED_CARRIER_ROUTES")
    try:
        bridge.submit_player_action("TELEPORT")
    except browser_bridge.BrowserBridgeError as exc:
        require(str(exc) == "UNKNOWN_PLAYER_ACTION", "B_UNKNOWN_ACTION_REASON")
    else:
        raise AssertionError("B_UNKNOWN_ACTION_ACCEPTED")
    require(bridge.state()["snapshot"]["logical_tick_index"] == successor["logical_tick_index"], "B_REJECTION_NONMUTATION")
    print("BEAUTY_PASS_001_BRIDGE_SMOKE := PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
