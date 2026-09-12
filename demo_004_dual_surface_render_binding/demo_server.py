#!/usr/bin/env python3
"""Dependency-free HTTP carrier for the DEMO-004 dual-surface projection."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from render_binding import DualSurfaceController, demo3


HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
SESSION = DualSurfaceController()


class DemoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[demo-004] {self.address_string()} {format % args}")

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
        path = urlparse(self.path).path
        if path == "/api/state":
            self._send_json(SESSION.state())
        elif path == "/api/render":
            self._send_json(SESSION.render())
        else:
            super().do_GET()

    def do_POST(self) -> None:
        global SESSION
        try:
            path = urlparse(self.path).path
            body = self._body()
            if path == "/api/reset":
                SESSION = DualSurfaceController()
                result = SESSION.state()
            elif path == "/api/toggle":
                result = SESSION.toggle_surface()
            elif path == "/api/zoom":
                result = SESSION.set_zoom(str(body.get("zoom", "FABRIC")))
            elif path == "/api/game/controls":
                result = SESSION.stage_controls(player_near=body.get("player_near"), enemy_health=body.get("enemy_health"))
            elif path == "/api/game/tick":
                result = SESSION.advance_logical_tick()
            elif path == "/api/game/blocked":
                SESSION = DualSurfaceController(demo3.blocked_engine())
                result = SESSION.state()
            else:
                self._send_json({"error": "NOT_FOUND", "path": path}, 404)
                return
            self._send_json(result)
        except (KeyError, TypeError, ValueError) as exc:
            self._send_json({"error": type(exc).__name__, "because": str(exc)}, 400)
        except Exception as exc:
            self._send_json({"error": "FAIL_CLOSED", "because": str(exc)}, 500)


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve DEMO-004 Dual-Surface Render Binding")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8768)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), DemoHandler)
    print(f"DEMO-004 running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
