#!/usr/bin/env python3
"""Dependency-free HTTP surface for DEMO-003."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from game_loop import GameLoopEngine, ObservationSet, replay


HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
SESSION = GameLoopEngine()


class DemoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[demo-003] {self.address_string()} {format % args}")

    def _send_json(self, payload: Any, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _body(self) -> dict[str, Any]:
        size = int(self.headers.get("Content-Length", "0"))
        if size > 1_000_000:
            raise ValueError("REQUEST_TOO_LARGE")
        return json.loads(self.rfile.read(size) or b"{}")

    def do_GET(self) -> None:
        if urlparse(self.path).path == "/api/state":
            self._send_json(SESSION.view())
            return
        super().do_GET()

    def do_POST(self) -> None:
        global SESSION
        try:
            path = urlparse(self.path).path
            body = self._body()
            if path == "/api/reset":
                SESSION = GameLoopEngine()
                result = SESSION.view()
            elif path == "/api/game/reset":
                result = SESSION.reset_run()
            elif path == "/api/game/controls":
                result = SESSION.stage_controls(
                    player_near=body.get("player_near"),
                    enemy_health=body.get("enemy_health"),
                )
            elif path == "/api/game/tick":
                result = SESSION.advance_logical_tick()
            elif path == "/api/game/render-frame":
                result = SESSION.render_frame()
            elif path == "/api/game/replay":
                raw_observations = body.get("observations")
                if raw_observations is None:
                    fixture = json.loads((HERE / "replay-fixture.json").read_text(encoding="utf-8"))
                    raw_observations = fixture["observations"]
                observations = tuple(
                    ObservationSet(bool(item["player_near"]), bool(item["health_low"]))
                    for item in raw_observations
                )
                trace, final_game, _final_fabric = replay(observations)
                result = {
                    "trace": trace.canonical(),
                    "final_game_state": final_game.canonical(),
                    "replayed": True,
                }
            elif path == "/api/propose":
                result = SESSION.propose(str(body.get("text", "")))
            elif path == "/api/disposition/accept":
                result = SESSION.proposal_accept()
            elif path == "/api/disposition/modify":
                result = SESSION.proposal_modify(str(body.get("surface", "VISUAL")), body.get("projection", {}))
            elif path == "/api/disposition/reject":
                result = SESSION.proposal_reject()
            elif path == "/api/admission/submit":
                result = SESSION.proposal_submit()
            elif path == "/api/presentation":
                SESSION.vibe.set_presentation(str(body["cell_id"]), float(body["x"]), float(body["y"]))
                result = SESSION.view()
            else:
                self._send_json({"error": "NOT_FOUND", "path": path}, 404)
                return
            self._send_json(result)
        except (KeyError, TypeError, ValueError) as exc:
            status = 409 if "RESET_REQUIRED" in str(exc) else 400
            self._send_json({"error": type(exc).__name__, "because": str(exc)}, status)
        except Exception as exc:  # fail closed at the product boundary
            self._send_json({"error": "FAIL_CLOSED", "because": str(exc)}, 500)


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve DEMO-003 Game Loop Binding")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8767)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), DemoHandler)
    print(f"DEMO-003 running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
