#!/usr/bin/env python3
"""BEAUTY-PASS-001 browser server.

Presentation only. The promoted local agency kernel remains semantic authority.
This server refuses to start unless an explicit bridge module is supplied.
"""
from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import importlib
import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
ASSETS = HERE / "assets"
MOUNTAIN = ASSETS / "mountain_100k.splat"
ALLOWED_ACTIONS = {"MOVE_N", "MOVE_S", "MOVE_E", "MOVE_W", "STAY"}


def load_bridge():
    module_name = os.environ.get("MAL_GEN0_BRIDGE_MODULE", "").strip()
    if not module_name:
        raise RuntimeError("MAL_GEN0_BRIDGE_MODULE_REQUIRED")
    module = importlib.import_module(module_name)
    factory = getattr(module, "create_browser_bridge", None)
    if factory is None or not callable(factory):
        raise RuntimeError("BRIDGE_FACTORY_REQUIRED:create_browser_bridge")
    bridge = factory()
    for name in ("state", "submit_player_action"):
        if not callable(getattr(bridge, name, None)):
            raise RuntimeError(f"BRIDGE_METHOD_REQUIRED:{name}")
    return bridge


BRIDGE = None


def canonical_state() -> dict[str, Any]:
    value = BRIDGE.state()
    if not isinstance(value, dict):
        raise RuntimeError("BRIDGE_STATE_NOT_OBJECT")
    # The bridge is responsible for exposing the promoted kernel's committed state.
    # We do not synthesize semantic defaults here.
    if "snapshot" not in value:
        raise RuntimeError("COMMITTED_SNAPSHOT_REQUIRED")
    return value


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"[beauty-pass-001] {self.address_string()} {fmt % args}")

    def _send_json(self, value: Any, status: int = 200) -> None:
        body = json.dumps(value, ensure_ascii=False, sort_keys=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path: Path, content_type: str) -> None:
        if not path.is_file():
            self.send_error(404)
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _body(self) -> dict[str, Any]:
        size = int(self.headers.get("Content-Length", "0"))
        if size > 65536:
            raise ValueError("REQUEST_TOO_LARGE")
        value = json.loads(self.rfile.read(size) or b"{}")
        if not isinstance(value, dict):
            raise ValueError("OBJECT_BODY_REQUIRED")
        return value

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        try:
            if path == "/api/state":
                self._send_json(canonical_state())
            elif path == "/assets/mountain_100k.splat":
                self._send_file(MOUNTAIN, "application/octet-stream")
            elif path.startswith("/assets/"):
                name = Path(path).name
                if name not in {"player.glb", "enemy.glb", "kloppenheim_03_1k.hdr"}:
                    self.send_error(404)
                    return
                content_type = "model/gltf-binary" if name.endswith(".glb") else "application/octet-stream"
                self._send_file(ASSETS / name, content_type)
            else:
                super().do_GET()
        except Exception as exc:
            self._send_json({"error": "FAIL_CLOSED", "because": str(exc)}, 500)

    def do_POST(self) -> None:
        try:
            path = urlparse(self.path).path
            body = self._body()
            if path != "/api/action":
                self._send_json({"error": "NOT_FOUND", "path": path}, 404)
                return
            action = str(body.get("player_action", ""))
            if action not in ALLOWED_ACTIONS:
                raise ValueError("UNKNOWN_PLAYER_ACTION")
            value = BRIDGE.submit_player_action(action)
            if not isinstance(value, dict) or "snapshot" not in value:
                raise RuntimeError("BRIDGE_SUCCESSOR_SNAPSHOT_REQUIRED")
            self._send_json(value)
        except (ValueError, TypeError) as exc:
            self._send_json({"error": type(exc).__name__, "because": str(exc)}, 400)
        except Exception as exc:
            self._send_json({"error": "FAIL_CLOSED", "because": str(exc)}, 500)


def main() -> int:
    global BRIDGE
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8780)
    args = parser.parse_args()
    BRIDGE = load_bridge()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"BEAUTY-PASS-001 running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
