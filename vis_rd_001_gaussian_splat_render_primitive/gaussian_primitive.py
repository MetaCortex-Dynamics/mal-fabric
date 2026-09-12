#!/usr/bin/env python3
"""Presentation-only Gaussian-splat readout over immutable DEMO-004 snapshots."""

from __future__ import annotations

from dataclasses import dataclass, replace
from hashlib import sha256
import importlib.util
import inspect
import json
import math
from pathlib import Path
import struct
import sys
from typing import Any, Mapping


HERE = Path(__file__).resolve().parent
DEMO_004_ROOT = HERE.parent / "demo_004_dual_surface_render_binding"
DEMO_004_KERNEL = DEMO_004_ROOT / "render_binding.py"
DEMO_004_ACCEPTANCE = DEMO_004_ROOT / "acceptance-summary.json"
DEMO_004_PROMOTION = DEMO_004_ROOT / "PROMOTION_RECORD.md"
DESCRIPTOR_PATH = HERE / "splat-asset-descriptor.json"
FIXTURE_PATH = HERE / "web" / "assets" / "mal_orbit_192.splat"

V0_7_0_DOI = "10.5281/zenodo.22727508"
V0_7_0_CONCEPT_DOI = "10.5281/zenodo.22678127"
DEMO_004_KERNEL_SHA256 = "41D523C2AB2A2957A60C19031CC258BA7E98E9B836A242FBE5EE36320D8376E1"
DEMO_004_ACCEPTANCE_SHA256 = "50BB725920F17B5BA5565A8BC37F5E2A301B4BD8FE173F7C399AA5B2ECDDC275"
DEMO_004_PROMOTION_SHA256 = "0D4E15694E07BBF14758E217CBC05F85D7C3D6FCADFA55D4D80FFAF2C65400E6"

CONVENTIONAL_ASSET = "CONVENTIONAL_ASSET"
GAUSSIAN_ASSET = "GAUSSIAN_ASSET"
FALLBACK_ASSET = "FALLBACK_ASSET"
ASSET_MODES = (CONVENTIONAL_ASSET, GAUSSIAN_ASSET, FALLBACK_ASSET)

WEBGPU_GAUSSIAN = "WEBGPU_GAUSSIAN"
WEBGPU_FORCE_WEBGL_GAUSSIAN = "WEBGPU_FORCE_WEBGL_GAUSSIAN"
UNSUPPORTED = "UNSUPPORTED"
SUPPORTED_CAPABILITIES = (WEBGPU_GAUSSIAN, WEBGPU_FORCE_WEBGL_GAUSSIAN)

LOADED = "LOADED"
NOT_REQUESTED = "NOT_REQUESTED"
REJECTED_HASH_MISMATCH = "REJECTED_HASH_MISMATCH"
REJECTED_PARSE = "REJECTED_PARSE"
UNSUPPORTED_BACKEND = "UNSUPPORTED_BACKEND"
REJECTED_RESOURCE_BUDGET = "REJECTED_RESOURCE_BUDGET"


class GaussianBoundaryError(ValueError):
    """Fail-closed presentation-boundary error."""


def file_sha256(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


for _path, _expected, _label in (
    (DEMO_004_KERNEL, DEMO_004_KERNEL_SHA256, "DEMO_004_KERNEL"),
    (DEMO_004_ACCEPTANCE, DEMO_004_ACCEPTANCE_SHA256, "DEMO_004_ACCEPTANCE"),
    (DEMO_004_PROMOTION, DEMO_004_PROMOTION_SHA256, "DEMO_004_PROMOTION"),
):
    if not _path.is_file() or file_sha256(_path) != _expected:
        raise GaussianBoundaryError(f"{_label}_IMPORT_MISMATCH")

_MODULE_NAME = "mal_fabric_demo_004_gaussian_import"
_MODULE_SPEC = importlib.util.spec_from_file_location(_MODULE_NAME, DEMO_004_KERNEL)
if _MODULE_SPEC is None or _MODULE_SPEC.loader is None:
    raise GaussianBoundaryError("DEMO_004_IMPORT_UNAVAILABLE")
demo4 = importlib.util.module_from_spec(_MODULE_SPEC)
sys.modules[_MODULE_NAME] = demo4
_MODULE_SPEC.loader.exec_module(demo4)


def canonical_value(value: Any) -> Any:
    return demo4.canonical_value(value)


def canonical_json(value: Any, *, pretty: bool = False) -> str:
    return demo4.canonical_json(value, pretty=pretty)


def canonical_digest(value: Any) -> str:
    return demo4.canonical_digest(value)


@dataclass(frozen=True)
class SplatAssetDescriptor:
    splat_asset_id: str
    format: str
    content_sha256: str
    byte_length: int
    declared_splat_count: int | None
    bounds: Mapping[str, Any] | None
    provenance: Mapping[str, Any]

    def __post_init__(self) -> None:
        expected_id = f"splat-sha256-{self.content_sha256.lower()}"
        if self.splat_asset_id != expected_id:
            raise GaussianBoundaryError("ASSET_ID_NOT_CONTENT_ADDRESSED")
        if self.byte_length <= 0 or self.declared_splat_count is not None and self.declared_splat_count <= 0:
            raise GaussianBoundaryError("INVALID_ASSET_DESCRIPTOR")

    @classmethod
    def from_json(cls, value: Mapping[str, Any]) -> "SplatAssetDescriptor":
        return cls(
            str(value["splat_asset_id"]),
            str(value["format"]),
            str(value["content_sha256"]).upper(),
            int(value["byte_length"]),
            int(value["declared_splat_count"]) if value.get("declared_splat_count") is not None else None,
            value.get("bounds"),
            value["provenance"],
        )

    def canonical(self) -> dict[str, Any]:
        return canonical_value(self.__dict__)


@dataclass(frozen=True)
class GaussianAssetBinding:
    render_binding_id: str
    target_render_entity: str
    splat_asset_id: str
    transform_binding: str
    fallback_asset_id: str

    @property
    def binding_id(self) -> str:
        return canonical_digest(self.canonical())

    def canonical(self) -> dict[str, str]:
        return canonical_value(self.__dict__)


@dataclass(frozen=True)
class ResourceGuard:
    maximum_asset_byte_length: int = 1_048_576
    maximum_splat_count: int = 32_768
    load_timeout_ms: int = 5_000

    def canonical(self) -> dict[str, int]:
        return canonical_value(self.__dict__)


@dataclass(frozen=True)
class PresentationState:
    asset_mode: str = GAUSSIAN_ASSET
    renderer_capability: str = WEBGPU_GAUSSIAN
    camera_pose: tuple[int, int, int, int, int, int] = (0, 180, 620, 0, 0, 0)
    sort_generation: int = 0
    color_generation: int = 0

    def __post_init__(self) -> None:
        if self.asset_mode not in ASSET_MODES:
            raise GaussianBoundaryError("UNKNOWN_ASSET_MODE")
        if self.renderer_capability not in (*SUPPORTED_CAPABILITIES, UNSUPPORTED):
            raise GaussianBoundaryError("UNKNOWN_RENDERER_CAPABILITY")

    def canonical(self) -> dict[str, Any]:
        return canonical_value(self.__dict__)


@dataclass(frozen=True)
class LoadResult:
    disposition: str
    fallback_used: bool
    observed_byte_length: int
    observed_splat_count: int | None
    diagnostics: tuple[str, ...]

    def canonical(self) -> dict[str, Any]:
        return canonical_value(self.__dict__)


@dataclass(frozen=True)
class GaussianRenderDecision:
    logical_tick_index: int
    game_run_id: str
    render_snapshot_digest: str
    render_binding_digest: str
    splat_asset_id: str
    asset_content_sha256: str
    renderer_backend: str
    load_disposition: str
    fallback_used: bool
    presentation_transform_digest: str
    semantic_digest_before: str
    semantic_digest_after: str
    diagnostics: tuple[str, ...]

    @property
    def decision_digest(self) -> str:
        return canonical_digest(self.canonical())

    def canonical(self) -> dict[str, Any]:
        return canonical_value(self.__dict__)


def load_descriptor(path: Path = DESCRIPTOR_PATH) -> SplatAssetDescriptor:
    return SplatAssetDescriptor.from_json(json.loads(path.read_text(encoding="utf-8")))


def _parse_fixed_width_splat(data: bytes) -> int:
    if not data or len(data) % 32 != 0:
        raise GaussianBoundaryError("SPLAT_FIXED_WIDTH_PARSE_FAILURE")
    count = len(data) // 32
    for offset in range(0, len(data), 32):
        values = struct.unpack_from("<6f", data, offset)
        if not all(math.isfinite(value) for value in values) or any(value <= 0 for value in values[3:]):
            raise GaussianBoundaryError("SPLAT_RECORD_INVALID")
    return count


def load_splat(
    descriptor: SplatAssetDescriptor,
    capability: str,
    guard: ResourceGuard,
    *,
    asset_bytes: bytes | None = None,
) -> LoadResult:
    data = FIXTURE_PATH.read_bytes() if asset_bytes is None else asset_bytes
    if sha256(data).hexdigest().upper() != descriptor.content_sha256 or len(data) != descriptor.byte_length:
        return LoadResult(REJECTED_HASH_MISMATCH, True, len(data), None, ("CONTENT_IDENTITY_REJECTED",))
    if capability not in SUPPORTED_CAPABILITIES:
        return LoadResult(UNSUPPORTED_BACKEND, True, len(data), None, ("GAUSSIAN_BACKEND_UNAVAILABLE",))
    if len(data) > guard.maximum_asset_byte_length:
        return LoadResult(REJECTED_RESOURCE_BUDGET, True, len(data), len(data) // 32, ("ASSET_BYTE_BUDGET_EXCEEDED",))
    if descriptor.format != "SPLAT_FIXED_WIDTH_32":
        return LoadResult(REJECTED_PARSE, True, len(data), None, ("UNSUPPORTED_OR_INVALID_FORMAT",))
    try:
        count = _parse_fixed_width_splat(data)
    except GaussianBoundaryError as exc:
        return LoadResult(REJECTED_PARSE, True, len(data), None, (str(exc),))
    if count > guard.maximum_splat_count or descriptor.declared_splat_count not in (None, count):
        return LoadResult(REJECTED_RESOURCE_BUDGET, True, len(data), count, ("SPLAT_COUNT_BUDGET_OR_DECLARATION_REJECTED",))
    return LoadResult(LOADED, False, len(data), count, ())


def default_gaussian_binding(parent_binding: Any, descriptor: SplatAssetDescriptor) -> GaussianAssetBinding:
    return GaussianAssetBinding(
        parent_binding.render_binding_id,
        "enemy_02",
        descriptor.splat_asset_id,
        "COMMITTED_ENTITY_TRANSFORM_V1",
        dict(parent_binding.asset_bindings)["enemy_02"],
    )


def _entity_transform(base_render: Mapping[str, Any], target: str) -> dict[str, Any]:
    view = base_render["view"]
    if base_render["active_surface"] == demo4.GAME:
        entity = next(item for item in view["entities"] if item["entity_id"] == target)
        position = entity["world_position"]
    else:
        position = None
    return {
        "direction": "GAME_STATE_TO_RENDER_TRANSFORM",
        "entity_id": target,
        "position": position,
        "rotation_quarter_turns": [0, 0, 0],
        "scale_milli": [780, 780, 780],
    }


def gaussian_render_readout(
    snapshot: Any,
    parent_binding: Any,
    base_render: Mapping[str, Any],
    descriptor: SplatAssetDescriptor,
    gaussian_binding: GaussianAssetBinding,
    presentation: PresentationState,
    guard: ResourceGuard,
    *,
    asset_bytes: bytes | None = None,
) -> dict[str, Any]:
    """Pure readout: no execution controller or mutation-capable handle is accepted."""
    semantic_before = demo4.semantic_digest(snapshot)
    if presentation.asset_mode == CONVENTIONAL_ASSET:
        load = LoadResult(NOT_REQUESTED, False, 0, None, ())
        selected = gaussian_binding.fallback_asset_id
    elif presentation.asset_mode == FALLBACK_ASSET:
        load = LoadResult(NOT_REQUESTED, True, 0, None, ("EXPLICIT_FALLBACK_SELECTED",))
        selected = gaussian_binding.fallback_asset_id
    else:
        load = load_splat(descriptor, presentation.renderer_capability, guard, asset_bytes=asset_bytes)
        selected = descriptor.splat_asset_id if load.disposition == LOADED else gaussian_binding.fallback_asset_id
    transform = _entity_transform(base_render, gaussian_binding.target_render_entity)
    semantic_after = demo4.semantic_digest(snapshot)
    if semantic_before != semantic_after:
        raise GaussianBoundaryError("GAUSSIAN_RENDERER_MUTATED_SEMANTICS")
    binding_digest = canonical_digest(
        {
            "demo_004_render_binding": parent_binding.canonical(),
            "gaussian_asset_binding": gaussian_binding.canonical(),
            "splat_asset_descriptor": descriptor.canonical(),
        }
    )
    decision = GaussianRenderDecision(
        snapshot.logical_tick_index,
        snapshot.game_run_id,
        snapshot.snapshot_digest,
        binding_digest,
        descriptor.splat_asset_id,
        descriptor.content_sha256,
        presentation.renderer_capability,
        load.disposition,
        load.fallback_used,
        canonical_digest(transform),
        semantic_before,
        semantic_after,
        load.diagnostics,
    )
    carrier_diagnostics = None
    if base_render["active_surface"] == demo4.CARRIER:
        carrier_diagnostics = {
            "asset_identity": descriptor.splat_asset_id,
            "binding_present": True,
            "gaussian_geometry": "NOT_CARRIER_GEOMETRY",
            "load_disposition": load.disposition,
        }
    return {
        "asset_class": GAUSSIAN_ASSET if selected == descriptor.splat_asset_id else FALLBACK_ASSET if load.fallback_used else CONVENTIONAL_ASSET,
        "asset_url": "/assets/mal_orbit_192.splat",
        "carrier_diagnostics": carrier_diagnostics,
        "decision": decision.canonical(),
        "decision_digest": decision.decision_digest,
        "descriptor": descriptor.canonical(),
        "load": load.canonical(),
        "presentation_transform": transform,
        "selected_asset_id": selected,
    }


class GaussianPresentationController:
    """Owns presentation choices; semantic execution remains in DEMO-004."""

    def __init__(self, dual: Any | None = None) -> None:
        self.dual = dual if dual is not None else demo4.DualSurfaceController()
        self.descriptor = load_descriptor()
        self.gaussian_binding = default_gaussian_binding(self.dual.binding, self.descriptor)
        self.presentation = PresentationState()
        self.guard = ResourceGuard()
        self.telemetry: list[dict[str, Any]] = []

    def set_asset_mode(self, mode: str) -> dict[str, Any]:
        self.presentation = replace(self.presentation, asset_mode=mode)
        return self.state()

    def set_renderer_capability(self, capability: str) -> dict[str, Any]:
        self.presentation = replace(self.presentation, renderer_capability=capability)
        return self.state()

    def move_camera(self, camera_pose: tuple[int, int, int, int, int, int]) -> dict[str, Any]:
        self.presentation = replace(
            self.presentation,
            camera_pose=camera_pose,
            sort_generation=self.presentation.sort_generation + 1,
            color_generation=self.presentation.color_generation + 1,
        )
        return self.state()

    def render(self, *, asset_bytes: bytes | None = None) -> dict[str, Any]:
        base = self.dual.render()
        gaussian = gaussian_render_readout(
            self.dual.snapshot,
            self.dual.binding,
            base,
            self.descriptor,
            self.gaussian_binding,
            self.presentation,
            self.guard,
            asset_bytes=asset_bytes,
        )
        return {**base, "gaussian": gaussian}

    def toggle_surface(self) -> dict[str, Any]:
        self.dual.toggle_surface()
        return self.state()

    def stage_controls(self, **controls: Any) -> dict[str, Any]:
        self.dual.stage_controls(**controls)
        return self.state()

    def advance_logical_tick(self) -> dict[str, Any]:
        self.dual.advance_logical_tick()
        return self.state()

    def state(self) -> dict[str, Any]:
        base = self.dual.state()
        return {
            **base,
            "demo": "VIS-R&D-001 — Gaussian Splat Render Primitive",
            "publication_import": {"version": "mal-fabric v0.7.0", "doi": V0_7_0_DOI},
            "gaussian_binding": self.gaussian_binding.canonical(),
            "gaussian_binding_digest": self.gaussian_binding.binding_id,
            "presentation_state": self.presentation.canonical(),
            "resource_guard": self.guard.canonical(),
            "last_render": self.render(),
        }


def semantic_trace(mode: str) -> tuple[dict[str, Any], ...]:
    controller = GaussianPresentationController()
    controller.presentation = replace(controller.presentation, asset_mode=mode)
    trace: list[dict[str, Any]] = []
    schedule = ((False, 100), (True, 100), (True, 15), (False, 15))
    for near, health in schedule:
        controller.dual.stage_controls(player_near=near, enemy_health=health)
        controller.dual.advance_logical_tick()
        controller.render()
        snapshot = controller.dual.snapshot
        game = json.loads(snapshot.committed_game_state_json)
        trace.append(
            {
                "enemy_action": game["enemy_mode"],
                "fabric_spec_digest": snapshot.fabric_digest,
                "fabric_state_digest": snapshot.fabric_state_digest,
                "game_run_id": snapshot.game_run_id,
                "game_state_digest": snapshot.game_state_digest,
                "logical_tick_index": snapshot.logical_tick_index,
            }
        )
    return tuple(trace)


def renderer_api_surface() -> dict[str, Any]:
    signature = inspect.signature(gaussian_render_readout)
    parameters = tuple(signature.parameters)
    forbidden = tuple(
        item
        for item in parameters
        if item in {"engine", "fabric_edit", "game_tick_input", "admission", "proposal", "controller"}
    )
    return {"parameters": parameters, "mutation_capable_handles": forbidden}


def import_identities() -> dict[str, str]:
    return {
        "demo_004_acceptance_sha256": file_sha256(DEMO_004_ACCEPTANCE),
        "demo_004_kernel_sha256": file_sha256(DEMO_004_KERNEL),
        "demo_004_promotion_sha256": file_sha256(DEMO_004_PROMOTION),
        "mal_fabric_v0_7_0_concept_doi": V0_7_0_CONCEPT_DOI,
        "mal_fabric_v0_7_0_doi": V0_7_0_DOI,
    }


__all__ = [
    "ASSET_MODES", "CONVENTIONAL_ASSET", "DESCRIPTOR_PATH", "FALLBACK_ASSET", "FIXTURE_PATH",
    "GAUSSIAN_ASSET", "GaussianAssetBinding", "GaussianBoundaryError", "GaussianPresentationController",
    "GaussianRenderDecision", "LOADED", "LoadResult", "NOT_REQUESTED", "PresentationState",
    "REJECTED_HASH_MISMATCH", "REJECTED_PARSE", "REJECTED_RESOURCE_BUDGET", "ResourceGuard",
    "SUPPORTED_CAPABILITIES", "SplatAssetDescriptor", "UNSUPPORTED", "UNSUPPORTED_BACKEND",
    "V0_7_0_DOI", "WEBGPU_FORCE_WEBGL_GAUSSIAN", "WEBGPU_GAUSSIAN", "canonical_digest",
    "canonical_json", "canonical_value", "default_gaussian_binding", "demo4", "file_sha256",
    "gaussian_render_readout", "import_identities", "load_descriptor", "load_splat", "renderer_api_surface",
    "semantic_trace",
]
