#!/usr/bin/env python3
"""Dependency-free local HTTP server for DEMO-001."""

from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import argparse
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from demo_adapter import DemoSession


HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
SESSION = DemoSession()


class DemoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[demo] {self.address_string()} {format % args}")

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
                SESSION = DemoSession()
                result = SESSION.view()
            elif path == "/api/propose":
                result = SESSION.propose(str(body.get("prompt", "")))
            elif path == "/api/edit":
                result = SESSION.edit(
                    str(body.get("surface", "VISUAL")),
                    body.get("projection", {}),
                    str(body.get("evidence_mode", "full")),
                )
            elif path == "/api/candidate/accept":
                result = SESSION.accept()
            elif path == "/api/candidate/reject":
                result = SESSION.reject()
            elif path == "/api/presentation":
                result = SESSION.set_presentation(
                    str(body["cell_id"]), float(body["x"]), float(body["y"])
                )
            elif path == "/api/runtime/start":
                result = SESSION.runtime_start()
            elif path == "/api/runtime/tick":
                result = SESSION.runtime_tick()
            elif path == "/api/runtime/run":
                result = SESSION.runtime_run(int(body.get("max_steps", 12)))
            elif path == "/api/runtime/blocked":
                result = SESSION.runtime_blocked_fixture()
            elif path == "/api/runtime/halted":
                result = SESSION.runtime_halted_fixture()
            else:
                self._send_json({"error": "NOT_FOUND", "path": path}, 404)
                return
            self._send_json(result)
        except (KeyError, TypeError, ValueError) as exc:
            self._send_json({"error": type(exc).__name__, "because": str(exc)}, 400)
        except Exception as exc:  # fail closed at the HTTP boundary
            self._send_json({"error": "FAIL_CLOSED", "because": str(exc)}, 500)


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve DEMO-001 Visible Fabric")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), DemoHandler)
    print(f"DEMO-001 running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
