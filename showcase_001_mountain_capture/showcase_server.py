#!/usr/bin/env python3
"""Serve SHOWCASE-001 as a read-only capture projection over v0.8.0."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sys
from typing import Any
from urllib.parse import urlparse

import showcase


HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
VIS = HERE.parent / "vis_rd_001_gaussian_splat_render_primitive"
sys.path.insert(0, str(VIS))

from gaussian_primitive import (  # noqa: E402
    GaussianPresentationController,
    UNSUPPORTED,
    WEBGPU_FORCE_WEBGL_GAUSSIAN,
    WEBGPU_GAUSSIAN,
)


ASSET_RECORD = showcase.validate_asset()
SESSION = GaussianPresentationController()


def decorated_state() -> dict[str, Any]:
    state = SESSION.state()
    state["showcase"] = {
        "asset": ASSET_RECORD,
        "authority": "PRODUCT_EVIDENCE_ONLY",
        "copy_boundary": {
            "allowed": ["Gaussian mountain environment", "volumetric terrain", "Gaussian-splat terrain"],
            "forbidden": ["captured real mountain", "photorealistic scan", "real-world capture", "captured lighting"],
        },
        "run_id": showcase.run_id(state["snapshot"]["game_run_id"]),
    }
    return state


class ShowcaseHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[showcase-001] {self.address_string()} {format % args}")

    def _send_json(self, value: Any, status: int = 200) -> None:
        body = json.dumps(value, ensure_ascii=False, sort_keys=True).encode("utf-8")
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
            self._send_json(decorated_state())
        elif path == "/api/render":
            self._send_json(SESSION.render())
        elif path == "/api/asset":
            self._send_json(ASSET_RECORD)
        elif path == "/assets/mountain_10k.splat":
            body = showcase.ASSET_PATH.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

    def do_POST(self) -> None:
        global SESSION
        try:
            path = urlparse(self.path).path
            body = self._body()
            if path == "/api/reset":
                SESSION = GaussianPresentationController()
            elif path == "/api/toggle":
                SESSION.toggle_surface()
            elif path == "/api/capability":
                capability = str(body.get("capability", UNSUPPORTED))
                if capability not in (WEBGPU_GAUSSIAN, WEBGPU_FORCE_WEBGL_GAUSSIAN, UNSUPPORTED):
                    raise ValueError("UNKNOWN_RENDERER_CAPABILITY")
                SESSION.set_renderer_capability(capability)
            elif path == "/api/game/controls":
                SESSION.stage_controls(player_near=body.get("player_near"), enemy_health=body.get("enemy_health"))
            elif path == "/api/game/tick":
                SESSION.advance_logical_tick()
            else:
                self._send_json({"error": "NOT_FOUND", "path": path}, 404)
                return
            self._send_json(decorated_state())
        except (KeyError, TypeError, ValueError) as exc:
            self._send_json({"error": type(exc).__name__, "because": str(exc)}, 400)
        except Exception as exc:
            self._send_json({"error": "FAIL_CLOSED", "because": str(exc)}, 500)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8770)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), ShowcaseHandler)
    print(f"SHOWCASE-001 running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
