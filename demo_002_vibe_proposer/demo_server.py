#!/usr/bin/env python3
"""Dependency-free HTTP surface for DEMO-002."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from proposal_kernel import VibeSession


HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
SESSION = VibeSession()


class DemoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(WEB), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[demo-002] {self.address_string()} {format % args}")

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
                SESSION = VibeSession()
                result = SESSION.view()
            elif path == "/api/propose":
                result = SESSION.propose(str(body.get("text", "")))
            elif path == "/api/disposition/accept":
                result = SESSION.accept()
            elif path == "/api/disposition/modify":
                result = SESSION.modify(
                    str(body.get("surface", "VISUAL")),
                    body.get("projection", {}),
                )
            elif path == "/api/disposition/reject":
                result = SESSION.reject()
            elif path == "/api/admission/submit":
                result = SESSION.submit_admission(str(body.get("evidence_mode", "full")))
            elif path == "/api/presentation":
                result = SESSION.set_presentation(
                    str(body["cell_id"]), float(body["x"]), float(body["y"])
                )
            elif path == "/api/runtime/start":
                result = SESSION.runtime_start()
            elif path == "/api/runtime/tick":
                result = SESSION.runtime_tick()
            else:
                self._send_json({"error": "NOT_FOUND", "path": path}, 404)
                return
            self._send_json(result)
        except (KeyError, TypeError, ValueError) as exc:
            self._send_json({"error": type(exc).__name__, "because": str(exc)}, 400)
        except Exception as exc:  # fail closed at the product boundary
            self._send_json({"error": "FAIL_CLOSED", "because": str(exc)}, 500)


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve DEMO-002 Vibe Proposer")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), DemoHandler)
    print(f"DEMO-002 running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
