#!/usr/bin/env python3
"""Dependency-free HTTP carrier for VIS-R&D-001."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from gaussian_primitive import (
    CONVENTIONAL_ASSET,
    GAUSSIAN_ASSET,
    GaussianPresentationController,
    UNSUPPORTED,
    WEBGPU_FORCE_WEBGL_GAUSSIAN,
    WEBGPU_GAUSSIAN,
    demo4,
)


HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
SESSION = GaussianPresentationController()


class DemoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[vis-rd-001] {self.address_string()} {format % args}")

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
        elif path == "/api/descriptor":
            self._send_json(SESSION.descriptor.canonical())
        else:
            super().do_GET()

    def do_POST(self) -> None:
        global SESSION
        try:
            path = urlparse(self.path).path
            body = self._body()
            if path == "/api/reset":
                SESSION = GaussianPresentationController()
                result = SESSION.state()
            elif path == "/api/toggle":
                result = SESSION.toggle_surface()
            elif path == "/api/asset/mode":
                mode = str(body.get("mode", GAUSSIAN_ASSET))
                if mode not in (GAUSSIAN_ASSET, CONVENTIONAL_ASSET):
                    raise ValueError("UNSUPPORTED_UI_ASSET_MODE")
                result = SESSION.set_asset_mode(mode)
            elif path == "/api/capability":
                capability = str(body.get("capability", UNSUPPORTED))
                if capability not in (WEBGPU_GAUSSIAN, WEBGPU_FORCE_WEBGL_GAUSSIAN, UNSUPPORTED):
                    raise ValueError("UNKNOWN_RENDERER_CAPABILITY")
                result = SESSION.set_renderer_capability(capability)
            elif path == "/api/game/controls":
                result = SESSION.stage_controls(player_near=body.get("player_near"), enemy_health=body.get("enemy_health"))
            elif path == "/api/game/tick":
                result = SESSION.advance_logical_tick()
            elif path == "/api/game/blocked":
                SESSION = GaussianPresentationController(demo4.DualSurfaceController(demo4.demo3.blocked_engine()))
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
    parser = argparse.ArgumentParser(description="Serve VIS-R&D-001 Gaussian Splat Render Primitive")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8769)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), DemoHandler)
    print(f"VIS-R&D-001 running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
