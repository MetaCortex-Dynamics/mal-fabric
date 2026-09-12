import * as THREE from 'three/webgpu';
import { GaussianSplat } from 'three/addons/objects/GaussianSplat.js';
import { SPLATLoader } from 'three/addons/loaders/SPLATLoader.js';

const EXPECTED_SHA256 = '6AEB775435810389BC47D15F02E3D545E09DED2760E8A15E76DE71D89D55D143';
const MAX_ASSET_BYTES = 1048576;
const MAX_SPLATS = 32768;
const LOAD_TIMEOUT_MS = 5000;

async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function conventionalEnemy(color = 0xf0a04b) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 2), new THREE.MeshStandardMaterial({color, roughness: 0.36, metalness: 0.22}));
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.022, 8, 64), new THREE.MeshBasicMaterial({color: 0xffc66d, transparent: true, opacity: 0.48}));
  halo.rotation.x = Math.PI / 2;
  group.add(body, halo);
  return group;
}

export async function createGameRenderer(container, onCapability, onStatus) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b0f);
  scene.fog = new THREE.FogExp2(0x071014, 0.045);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 80);
  let yaw = 0.52, pitch = 0.3, radius = 10.8;
  const target = new THREE.Vector3(0, 0.4, 0);
  const webgl2 = !!document.createElement('canvas').getContext('webgl2');
  const capability = navigator.gpu ? 'WEBGPU_GAUSSIAN' : webgl2 ? 'WEBGPU_FORCE_WEBGL_GAUSSIAN' : 'UNSUPPORTED';
  onCapability(capability);
  if (capability === 'UNSUPPORTED') throw new Error('No WebGPU-backed Gaussian capability');
  const renderer = new THREE.WebGPURenderer({antialias: true, forceWebGL: !navigator.gpu});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  await renderer.init();
  container.appendChild(renderer.domElement);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.4, 80), new THREE.MeshStandardMaterial({color: 0x10272b, roughness: 0.92, metalness: 0.05}));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.82;
  scene.add(floor, new THREE.GridHelper(12, 24, 0x3b7577, 0x183738));
  scene.add(new THREE.HemisphereLight(0xa8f4ef, 0x220916, 2.1));
  const key = new THREE.DirectionalLight(0xffb978, 3.3);
  key.position.set(5, 8, 3);
  scene.add(key);

  const player = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.72, 8, 18), new THREE.MeshStandardMaterial({color: 0x53e3d8, emissive: 0x0c4444, roughness: 0.3}));
  const enemy01 = conventionalEnemy(0xed5264);
  let conventional = conventionalEnemy();
  let gaussian = null;
  scene.add(player, enemy01, conventional);

  let dragging = false, lastX = 0, lastY = 0;
  renderer.domElement.addEventListener('pointerdown', event => { dragging = true; lastX = event.clientX; lastY = event.clientY; renderer.domElement.setPointerCapture(event.pointerId); });
  renderer.domElement.addEventListener('pointerup', () => dragging = false);
  renderer.domElement.addEventListener('pointermove', event => {
    if (!dragging) return;
    yaw -= (event.clientX - lastX) * 0.007;
    pitch = Math.max(-0.1, Math.min(1.1, pitch + (event.clientY - lastY) * 0.005));
    lastX = event.clientX; lastY = event.clientY;
  });
  renderer.domElement.addEventListener('wheel', event => { radius = Math.max(5, Math.min(18, radius + event.deltaY * 0.01)); }, {passive: true});

  async function loadGaussian(url) {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort('Gaussian asset load timeout'), LOAD_TIMEOUT_MS);
    let buffer;
    try {
      const response = await fetch(url, {cache: 'no-store', signal: abort.signal});
      if (!response.ok) throw new Error(`Asset fetch failed: ${response.status}`);
      buffer = await response.arrayBuffer();
    } finally {
      clearTimeout(timeout);
    }
    if (buffer.byteLength > MAX_ASSET_BYTES || buffer.byteLength % 32 !== 0 || buffer.byteLength / 32 > MAX_SPLATS) throw new Error('Asset resource guard rejected');
    if (await sha256Hex(buffer) !== EXPECTED_SHA256) throw new Error('Asset SHA-256 mismatch');
    const geometry = new SPLATLoader().parse(buffer);
    gaussian = new GaussianSplat(geometry, {autoSort: true});
    gaussian.scale.setScalar(0.78);
    scene.add(gaussian);
    onStatus('LOADED', capability);
  }

  try { await loadGaussian('/assets/mal_orbit_192.splat'); }
  catch (error) { onStatus('FALLBACK', `${capability} · ${error.message}`); }

  function resize() {
    const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function world(position) { return {x: position?.[0] * 0.72 || 0, z: position?.[1] * 0.72 || 0}; }
  function applyEntity(object, position) { const p = world(position); object.position.set(p.x, 0, p.z); }
  function update(view, gaussianData, mode) {
    if (!view?.entities) return;
    const entities = Object.fromEntries(view.entities.map(item => [item.entity_id, item]));
    applyEntity(player, entities.player?.world_position);
    applyEntity(enemy01, entities.enemy_01?.world_position);
    applyEntity(conventional, entities.enemy_02?.world_position);
    if (gaussian) applyEntity(gaussian, entities.enemy_02?.world_position);
    const useGaussian = mode === 'GAUSSIAN_ASSET' && gaussian && gaussianData?.load?.disposition === 'LOADED';
    conventional.visible = !useGaussian;
    if (gaussian) gaussian.visible = !!useGaussian;
  }
  function show(value) { renderer.domElement.style.visibility = value ? 'visible' : 'hidden'; }
  function animate(time) {
    resize();
    camera.position.set(target.x + radius * Math.cos(pitch) * Math.sin(yaw), target.y + radius * Math.sin(pitch), target.z + radius * Math.cos(pitch) * Math.cos(yaw));
    camera.lookAt(target);
    enemy01.rotation.y = time * 0.00035;
    conventional.rotation.y = -time * 0.00028;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
  return {capability, show, update};
}
