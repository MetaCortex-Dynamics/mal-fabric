import * as THREE from 'three/webgpu';
import { GaussianSplat } from 'three/addons/objects/GaussianSplat.js';
import { SPLATLoader } from 'three/addons/loaders/SPLATLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const MOUNTAIN_SHA256 = 'C6A2004D2801485B10E0D426828A151547A523460DAC62074145852D996A6168';
const MOUNTAIN_BYTES = 3200000;
const WORLD_SCALE = 0.66;
const TERRAIN_SCALE = 3.7;
const TERRAIN_ORIGIN = Object.freeze({x: 0, y: 0.68, z: 0});

async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function createTerrainProjection(buffer) {
  const view = new DataView(buffer);
  const terrainPoints = [];
  const terrainBins = new Map();
  const binWidth = 0.06;
  const binKey = (x, z) => `${Math.floor(x / binWidth)},${Math.floor(z / binWidth)}`;
  for (let offset = 0; offset < buffer.byteLength; offset += 32) {
    // The bound splat is rotated PI around X in the scene.
    const point = {
      x: TERRAIN_ORIGIN.x + TERRAIN_SCALE * view.getFloat32(offset, true),
      y: TERRAIN_ORIGIN.y - TERRAIN_SCALE * view.getFloat32(offset + 4, true),
      z: TERRAIN_ORIGIN.z - TERRAIN_SCALE * view.getFloat32(offset + 8, true),
    };
    terrainPoints.push(point);
    const key = binKey(point.x, point.z);
    const bin = terrainBins.get(key);
    if (bin) bin.push(point);
    else terrainBins.set(key, [point]);
  }

  function heightAt(x, z, radius = 0.12) {
    const radiusSquared = radius * radius;
    const x0 = Math.floor((x - radius) / binWidth);
    const x1 = Math.floor((x + radius) / binWidth);
    const z0 = Math.floor((z - radius) / binWidth);
    const z1 = Math.floor((z + radius) / binWidth);
    let height = -Infinity;
    for (let bx = x0; bx <= x1; bx += 1) {
      for (let bz = z0; bz <= z1; bz += 1) {
        for (const point of terrainBins.get(`${bx},${bz}`) || []) {
          const dx = point.x - x;
          const dz = point.z - z;
          if (dx * dx + dz * dz <= radiusSquared && point.y > height) height = point.y;
        }
      }
    }
    if (Number.isFinite(height)) return height;

    // This path is used only outside the sampled footprint. It keeps the
    // presentation stable without granting the terrain projector authority.
    let nearestDistance = Infinity;
    let nearestHeight = TERRAIN_ORIGIN.y;
    for (const point of terrainPoints) {
      const dx = point.x - x;
      const dz = point.z - z;
      const distance = dx * dx + dz * dz;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestHeight = point.y;
      }
    }
    return nearestHeight;
  }

  function projectPosition(position = [0, 0, 0]) {
    // Gen0 starts on the mountain's broad foreground shoulder. North advances
    // into the terrain. Height is a presentation sample of the splat surface;
    // it never feeds collision, admission, or canonical position back to v3.
    const x = (Number(position[0] || 0) - 7) * 0.12;
    const z = 0.65 - Number(position[1] || 0) * 0.10;
    const height = heightAt(x, z, 0.045);
    return new THREE.Vector3(x, height + Number(position[2] || 0) * WORLD_SCALE, z);
  }

  return {projectPosition, heightAt};
}

function findClip(clips, patterns, fallback = null) {
  for (const pattern of patterns) {
    const match = clips.find(clip => pattern.test(clip.name));
    if (match) return match;
  }
  return fallback || clips[0] || null;
}

function makeActor(gltf, role, projectPosition) {
  const root = gltf.scene;
  root.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.frustumCulled = false;
    }
  });
  const mixer = new THREE.AnimationMixer(root);
  const clips = gltf.animations || [];
  const idle = findClip(clips, [/idle/i, /breath/i], clips[0]);
  const walk = findClip(clips, [/walk/i], idle);
  const run = findClip(clips, [/run/i, /jog/i], walk);
  const attack = findClip(clips, [/attack/i, /punch/i, /slash/i, /strike/i], run);
  const hit = findClip(clips, [/hit/i, /impact/i, /stagger/i], idle);
  const actions = {idle, walk, run, attack, hit};
  let activeAction = null;
  let activeKey = null;
  const target = new THREE.Vector3();
  const previousTarget = new THREE.Vector3();
  let initialized = false;

  function clipKey(committedAction, blocked = false) {
    if (blocked) return 'hit';
    const action = String(committedAction || '').toUpperCase();
    if (action.includes('ATTACK')) return 'attack';
    if (action.includes('APPROACH') || action.includes('CHASE') || action.includes('FLEE')) return 'run';
    if (action.includes('PATROL')) return 'walk';
    if (role === 'player' && action.startsWith('MOVE_')) return 'run';
    return 'idle';
  }

  function selectAnimation(committedAction, blocked) {
    const key = clipKey(committedAction, blocked);
    if (key === activeKey) return;
    activeKey = key;
    const clip = actions[key] || idle;
    if (!clip) return;
    const next = mixer.clipAction(clip);
    next.reset().fadeIn(0.12).play();
    if (activeAction && activeAction !== next) activeAction.fadeOut(0.12);
    activeAction = next;
  }

  function setCommittedState(entity) {
    previousTarget.copy(target);
    target.copy(projectPosition(entity?.position));
    if (!initialized) {
      root.position.copy(target);
      previousTarget.copy(target);
      initialized = true;
    }
    selectAnimation(entity?.action, !!entity?.blocked);
    const delta = target.clone().sub(previousTarget);
    delta.y = 0;
    if (delta.lengthSq() > 1e-6) {
      root.userData.targetYaw = Math.atan2(delta.x, delta.z);
    }
  }

  function update(dt) {
    const smoothing = 1 - Math.exp(-12 * dt);
    root.position.lerp(target, smoothing);
    if (Number.isFinite(root.userData.targetYaw)) {
      let diff = root.userData.targetYaw - root.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      root.rotation.y += diff * (1 - Math.exp(-14 * dt));
    }
    mixer.update(dt);
  }

  return {root, setCommittedState, update};
}

export async function createBeautyRenderer(container, status) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x71858e);
  scene.fog = new THREE.FogExp2(0x71858e, 0.024);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 150);
  const webgl2 = !!document.createElement('canvas').getContext('webgl2');
  if (!navigator.gpu && !webgl2) throw new Error('NO_SUPPORTED_GPU_BACKEND');
  const renderer = new THREE.WebGPURenderer({antialias: true, forceWebGL: !navigator.gpu});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  await renderer.init();
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xd9edf0, 0x18251f, 2.6));
  const sun = new THREE.DirectionalLight(0xffd7ad, 4.0);
  sun.position.set(-7, 11, 6);
  sun.castShadow = true;
  scene.add(sun);

  // Optional local CC0 HDRI. Absence changes presentation only.
  try {
    const hdr = await new RGBELoader().loadAsync('/assets/kloppenheim_03_1k.hdr');
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.background = hdr;
    status('HDRI_LOADED');
  } catch (_) {
    status('HDRI_OPTIONAL_MISSING');
  }

  const mountainResponse = await fetch('/assets/mountain_100k.splat', {cache: 'no-store'});
  if (!mountainResponse.ok) throw new Error(`MOUNTAIN_FETCH_${mountainResponse.status}`);
  const mountainBuffer = await mountainResponse.arrayBuffer();
  if (mountainBuffer.byteLength !== MOUNTAIN_BYTES || mountainBuffer.byteLength % 32) {
    throw new Error('MOUNTAIN_SIZE_GATE');
  }
  if (await sha256Hex(mountainBuffer) !== MOUNTAIN_SHA256) throw new Error('MOUNTAIN_HASH_GATE');
  const mountain = new GaussianSplat(new SPLATLoader().parse(mountainBuffer), {autoSort: true});
  // The Gaussian asset is the scene itself, not a background prop.
  mountain.scale.setScalar(TERRAIN_SCALE);
  mountain.rotation.x = Math.PI;
  mountain.position.set(TERRAIN_ORIGIN.x, TERRAIN_ORIGIN.y, TERRAIN_ORIGIN.z);
  scene.add(mountain);
  const terrainProjection = createTerrainProjection(mountainBuffer);
  const projectPosition = terrainProjection.projectPosition;

  const loader = new GLTFLoader();
  const [playerGltf, enemyGltf] = await Promise.all([
    loader.loadAsync('/assets/player.glb'),
    loader.loadAsync('/assets/enemy.glb'),
  ]).catch(error => { throw new Error(`CHARACTER_ASSET_REQUIRED:${error.message}`); });

  const player = makeActor(playerGltf, 'player', projectPosition);
  const enemy = makeActor(enemyGltf, 'enemy', projectPosition);
  // The mountain is the world, so actors use human-scale proportions within
  // it instead of the old showcase-object scale.
  player.root.scale.setScalar(0.040);
  enemy.root.scale.setScalar(0.044);
  scene.add(player.root, enemy.root);

  const cameraLook = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  const clock = new THREE.Clock();
  let visible = true;
  let cameraInitialized = false;

  function applySnapshot(snapshot) {
    if (!snapshot?.player || !snapshot?.enemy) throw new Error('COMMITTED_ENTITY_STATE_REQUIRED');
    player.setCommittedState(snapshot.player);
    enemy.setCommittedState(snapshot.enemy);
  }

  function setVisible(value) {
    visible = !!value;
    renderer.domElement.style.visibility = visible ? 'visible' : 'hidden';
  }

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    resize();
    player.update(dt);
    enemy.update(dt);

    // Third-person follow is presentation-only; it follows committed/interpolated player transform.
    cameraLook.lerpVectors(player.root.position, enemy.root.position, 0.42)
      .add(new THREE.Vector3(0, 0.15, -0.10));
    const back = new THREE.Vector3(-1.35, 0.92, 1.75)
      .applyAxisAngle(new THREE.Vector3(0,1,0), player.root.rotation.y);
    desiredCamera.copy(player.root.position).add(back);
    const terrainEyeFloor = terrainProjection.heightAt(desiredCamera.x, desiredCamera.z, 0.14) + 0.40;
    desiredCamera.y = Math.max(terrainEyeFloor, player.root.position.y + 0.92);
    if (!cameraInitialized) {
      camera.position.copy(desiredCamera);
      cameraInitialized = true;
    } else {
      camera.position.lerp(desiredCamera, 1 - Math.exp(-7 * dt));
    }
    camera.lookAt(cameraLook);

    window.__beautyPassProjection = {
      player: player.root.position.toArray(),
      enemy: enemy.root.position.toArray(),
      camera: camera.position.toArray(),
      look: cameraLook.toArray(),
    };

    if (visible) renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(frame);
  status(navigator.gpu ? 'WEBGPU_READY' : 'WEBGL2_FALLBACK_READY');
  return {applySnapshot, setVisible};
}
