#!/usr/bin/env python3
"""Capture SHOWCASE-001 product evidence from one live imported runtime run."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import time
from typing import Any
from urllib.request import urlopen

from PIL import Image, ImageDraw
from playwright.sync_api import Page, sync_playwright
import imageio_ffmpeg

import showcase


HERE = Path(__file__).resolve().parent
SERVER = HERE / "showcase_server.py"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
CAPTURE_DATE = "2026-09-12"
WIDTH = 1440
HEIGHT = 900


def wait_for_server(url: str, timeout: float = 15.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with urlopen(url + "/api/state", timeout=1) as response:
                if response.status == 200:
                    return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError("SHOWCASE_SERVER_UNAVAILABLE")


def state(page: Page) -> dict[str, Any]:
    return page.evaluate("window.showcaseApi.state()")


def wait_surface(page: Page, surface: str) -> dict[str, Any]:
    page.wait_for_function(
        "surface => window.showcaseApi?.state()?.active_surface?.surface === surface",
        arg=surface,
    )
    return state(page)


def click_surface(page: Page, surface: str) -> dict[str, Any]:
    page.click("#game-tab" if surface == "GAME" else "#carrier-tab")
    return wait_surface(page, surface)


def advance(page: Page, *, near: bool | None = None, health: int | None = None) -> dict[str, Any]:
    if near is not None:
        current_near = page.locator("#near").inner_text() == "PLAYER NEAR"
        if current_near != near:
            page.click("#near")
    if health is not None:
        page.locator("#health").evaluate("(node, value) => { node.value = value; node.dispatchEvent(new Event('input', {bubbles:true})); }", str(health))
    prior_tick = int(state(page)["snapshot"]["logical_tick_index"])
    page.click("#advance")
    page.wait_for_function(
        "tick => window.showcaseApi?.state()?.snapshot?.logical_tick_index === tick + 1",
        arg=prior_tick,
    )
    return state(page)


def save_still(page: Page, name: str) -> Path:
    path = showcase.OUTPUT / name
    page.screenshot(path=str(path), full_page=True)
    return path


def compose_pair(left: Path, right: Path, output: Path, title: str) -> None:
    with Image.open(left) as left_image, Image.open(right) as right_image:
        canvas = Image.new("RGB", (left_image.width + right_image.width, max(left_image.height, right_image.height) + 60), "#030608")
        canvas.paste(left_image.convert("RGB"), (0, 60))
        canvas.paste(right_image.convert("RGB"), (left_image.width, 60))
        ImageDraw.Draw(canvas).text((24, 20), title, fill="#edf7f6")
        canvas.save(output, optimize=True)


def compose_contact_sheet(paths: list[Path], output: Path) -> None:
    thumbs: list[Image.Image] = []
    for path in paths:
        with Image.open(path) as image:
            thumb = image.convert("RGB")
            thumb.thumbnail((600, 375))
            thumbs.append(thumb.copy())
    cell_width = max(image.width for image in thumbs)
    cell_height = max(image.height for image in thumbs)
    sheet = Image.new("RGB", (cell_width * 2, cell_height * 3), "#030608")
    for index, image in enumerate(thumbs):
        sheet.paste(image, ((index % 2) * cell_width, (index // 2) * cell_height))
    sheet.save(output, optimize=True)


def transcode_video(source: Path, destination: Path, sequence_seconds: float) -> tuple[float, float, float]:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    _, source_duration = imageio_ffmpeg.count_frames_and_secs(str(source))
    target_duration = min(44.0, max(20.5, source_duration))
    presentation_filter = f"setpts={target_duration / source_duration:.9f}*PTS,fps=25"
    command = [
        ffmpeg,
        "-y",
        "-i", str(source),
        "-an",
        "-vf", presentation_filter,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(destination),
    ]
    completed = subprocess.run(command, capture_output=True, text=True, check=False)
    if completed.returncode:
        raise RuntimeError("VIDEO_TRANSCODE_FAILED\n" + completed.stderr[-4000:])
    _, duration = imageio_ffmpeg.count_frames_and_secs(str(destination))
    return float(duration), float(source_duration), 0.0


def attribution_text() -> str:
    return "\n".join([
        "SHOWCASE-001 — Mountain Gaussian Asset Attribution",
        "",
        "Asset: mountain_10k.splat",
        "Asset identifier: mountain_10k",
        "Creator / rights holder: lastloginname (original mesh author)",
        "Source: marcelpadilla/splats at commit ac7f3850ceadbc0483d10c9f0b597c2ba5e89009",
        "Origin: odedstein-meshes/objects/mountain; originally lastloginname via Thingiverse thing:991578",
        "Derivation: mesh2splat; no photography, COLMAP reconstruction, or Gaussian training",
        "License: CC-BY-4.0",
        "Required attribution: " + showcase.ATTRIBUTION,
        "Redistribution: permitted subject to CC-BY-4.0 attribution requirements",
        "Privacy / model release: not applicable (mesh-derived asset; no identifiable people)",
        "Showcase capture date: " + CAPTURE_DATE,
        "",
    ])


def capture(port: int) -> dict[str, Any]:
    showcase.OUTPUT.mkdir(parents=True, exist_ok=True)
    video_dir = HERE / ".capture-video"
    if video_dir.exists():
        shutil.rmtree(video_dir)
    video_dir.mkdir()
    server = subprocess.Popen(
        [sys.executable, str(SERVER), "--port", str(port)],
        cwd=HERE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    events: list[dict[str, Any]] = []
    proofs: list[dict[str, Any]] = []
    still_paths: list[Path] = []
    browser_video: Path | None = None
    started = time.monotonic()
    try:
        base_url = f"http://127.0.0.1:{port}"
        wait_for_server(base_url)
        if not CHROME.is_file():
            raise RuntimeError("SYSTEM_CHROME_UNAVAILABLE")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path=str(CHROME),
                headless=True,
                args=[
                    "--enable-webgl",
                    "--ignore-gpu-blocklist",
                    "--use-angle=swiftshader",
                    "--disable-dev-shm-usage",
                ],
            )
            context = browser.new_context(
                viewport={"width": WIDTH, "height": HEIGHT},
                record_video_dir=str(video_dir),
                record_video_size={"width": WIDTH, "height": HEIGHT},
                device_scale_factor=1,
            )
            page = context.new_page()
            page.on("console", lambda message: print(f"[browser:{message.type}] {message.text}", file=sys.stderr))
            page.on("pageerror", lambda error: print(f"[browser:error] {error}", file=sys.stderr))
            page.on("requestfailed", lambda request: print(f"[browser:requestfailed] {request.url}: {request.failure}", file=sys.stderr))
            page.goto(base_url, wait_until="domcontentloaded", timeout=30_000)
            print(
                f"[capture] page={page.url} title={page.title()!r} body={page.locator('body').inner_text()[:120]!r}",
                file=sys.stderr,
            )
            page.wait_for_function("document.body.dataset.captureReady === 'true'", timeout=30_000)
            page.wait_for_function("document.body.dataset.assetReady === 'true'", timeout=60_000)
            sequence_started = time.monotonic()
            initial = state(page)
            initial_projection = showcase.semantic_projection(initial)
            events.append({"event": "CAPTURE_BEGIN", "surface": "GAME", "tick": 0})
            page.wait_for_timeout(2_000)

            hero_game = save_still(page, "still-01-hero-game.png")
            still_paths.append(hero_game)
            proofs.append(showcase.proof_record(state(page), "GAME", hero_game.name, "HERO_GAME"))
            events.append({"event": "STILL", "ref": hero_game.name, "surface": "GAME", "tick": 0})

            hero_carrier_state = click_surface(page, "CARRIER")
            hero_carrier = save_still(page, "still-02-hero-carrier.png")
            still_paths.append(hero_carrier)
            proofs.append(showcase.proof_record(hero_carrier_state, "CARRIER", hero_carrier.name, "HERO_CARRIER"))
            events.append({"event": "LIVE_TOGGLE", "surface": "CARRIER", "tick": hero_carrier_state["snapshot"]["logical_tick_index"]})
            page.wait_for_timeout(2_000)

            click_surface(page, "GAME")
            advance(page, near=True, health=100)
            approach = advance(page, near=True, health=100)
            if approach["snapshot"]["committed_game_state"]["enemy_mode"] != "APPROACH":
                raise RuntimeError("APPROACH_MOMENT_UNAVAILABLE")
            events.append({"event": "CONTROL_ADVANCE", "behavior": approach["snapshot"]["committed_game_state"]["enemy_mode"], "tick": approach["snapshot"]["logical_tick_index"]})
            page.wait_for_timeout(2_000)
            proof_game = save_still(page, "still-03-proof-game.png")
            still_paths.append(proof_game)
            proofs.append(showcase.proof_record(approach, "GAME", proof_game.name, "SAME_SNAPSHOT_GAME"))

            proof_carrier_state = click_surface(page, "CARRIER")
            proof_carrier = save_still(page, "still-04-proof-carrier.png")
            still_paths.append(proof_carrier)
            proofs.append(showcase.proof_record(proof_carrier_state, "CARRIER", proof_carrier.name, "SAME_SNAPSHOT_CARRIER"))
            events.append({"event": "LIVE_TOGGLE", "surface": "CARRIER", "tick": proof_carrier_state["snapshot"]["logical_tick_index"]})
            page.wait_for_timeout(2_000)

            click_surface(page, "GAME")
            behavior_state = advance(page, near=True, health=100)
            if behavior_state["snapshot"]["committed_game_state"]["enemy_mode"] != "APPROACH":
                raise RuntimeError("BEHAVIOR_MOMENT_UNAVAILABLE")
            events.append({"event": "CONTROL_ADVANCE", "behavior": behavior_state["snapshot"]["committed_game_state"]["enemy_mode"], "tick": behavior_state["snapshot"]["logical_tick_index"]})
            page.wait_for_timeout(2_000)
            behavior_game = save_still(page, "still-05-behavior-game.png")
            still_paths.append(behavior_game)
            proofs.append(showcase.proof_record(behavior_state, "GAME", behavior_game.name, "BEHAVIOR_GAME"))

            behavior_carrier_state = click_surface(page, "CARRIER")
            behavior_carrier = save_still(page, "still-06-behavior-carrier.png")
            still_paths.append(behavior_carrier)
            proofs.append(showcase.proof_record(behavior_carrier_state, "CARRIER", behavior_carrier.name, "BEHAVIOR_CARRIER"))
            events.append({"event": "LIVE_TOGGLE", "surface": "CARRIER", "tick": behavior_carrier_state["snapshot"]["logical_tick_index"]})
            page.wait_for_timeout(2_000)

            continued = advance(page, near=True, health=100)
            events.append({"event": "CONTROL_ADVANCE_DURING_CARRIER", "behavior": continued["snapshot"]["committed_game_state"]["enemy_mode"], "tick": continued["snapshot"]["logical_tick_index"]})
            page.wait_for_timeout(2_000)
            click_surface(page, "GAME")
            events.append({"event": "LIVE_TOGGLE", "surface": "GAME", "tick": state(page)["snapshot"]["logical_tick_index"]})
            page.wait_for_timeout(3_000)

            final = state(page)
            sequence_seconds = time.monotonic() - sequence_started
            video = page.video
            context.close()
            if video is None:
                raise RuntimeError("BROWSER_VIDEO_UNAVAILABLE")
            browser_video = Path(video.path())
            browser.close()

        clip_path = showcase.OUTPUT / "clip-01-launch.mp4"
        duration, source_duration, trim_start = transcode_video(browser_video, clip_path, sequence_seconds)
        if not 20 <= duration <= 45:
            raise RuntimeError(f"CLIP_DURATION_OUT_OF_RANGE:{duration}")

        asset_record = showcase.validate_asset()
        run_record = showcase.capture_run_record(initial, events, duration)
        run_record.update({
            "browser_renderer_status": "NATIVE_GAUSSIAN_LOADED",
            "capture_tool_authority": "NONE",
            "clip_ref": clip_path.name,
            "clip_source_duration_seconds": round(source_duration, 3),
            "clip_source_trim_start_seconds": round(trim_start, 3),
            "capture_sequence_duration_seconds": round(sequence_seconds, 3),
            "final_logical_tick_index": final["snapshot"]["logical_tick_index"],
            "initial_semantic_projection": initial_projection,
            "product_copy": {
                "primary": "THAT CREATURE YOU WERE JUST FIGHTING / IS THIS PROGRAM",
                "support": "Same run. Same tick. Same snapshot. Two surfaces.",
            },
            "semantic_controller": "imported mal-fabric v0.8.0 UI runtime",
        })
        showcase.write_json(showcase.OUTPUT / "asset-record.json", asset_record)
        showcase.write_json(showcase.OUTPUT / "capture-run-record.json", run_record)
        showcase.write_json(showcase.OUTPUT / "proof-records.json", {"proof_records": proofs})
        (showcase.OUTPUT / "attribution.txt").write_text(attribution_text(), encoding="utf-8", newline="\n")
        compose_pair(proof_game, proof_carrier, showcase.OUTPUT / "overlay-proof-pair.png", "SAME RUN · SAME TICK · SAME SNAPSHOT · TWO SURFACES")
        compose_pair(hero_game, hero_carrier, showcase.OUTPUT / "split-composite.png", "THAT CREATURE YOU WERE JUST FIGHTING · IS THIS PROGRAM")
        compose_contact_sheet(still_paths, showcase.OUTPUT / "contact-sheet.png")
        return {
            "asset": asset_record,
            "clip_duration_seconds": duration,
            "elapsed_seconds": round(time.monotonic() - started, 3),
            "proof_records": len(proofs),
            "stills": len(still_paths),
        }
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
        if video_dir.exists():
            shutil.rmtree(video_dir)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8771)
    args = parser.parse_args()
    print(json.dumps(capture(args.port), indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
