import * as THREE from 'three/webgpu';
import { GaussianSplat } from 'three/addons/objects/GaussianSplat.js';
import { SPLATLoader } from 'three/addons/loaders/SPLATLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const MOUNTAIN_SHA256 = 'ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41';
const MOUNTAIN_BYTES = 320000;
const WORLD_SCALE = 0.66;

async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function canonicalToWorld(position = [0, 0, 0]) {
  // Canonical world is (x,y,z); Three.js uses Y as up.
  return new THREE.Vector3(
    Number(position[0] || 0) * WORLD_SCALE,
    Number(position[2] || 0) * WORLD_SCALE - 0.60,
    Number(position[1] || 0) * WORLD_SCALE + 1.80,
  );
}

function findClip(clips, patterns, fallback = null) {
  for (const pattern of patterns) {
    const match = clips.find(clip => pattern.test(clip.name));
    if (match) return match;
  }
  return fallback || clips[0] || null;
}

function makeActor(gltf, role) {
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
    target.copy(canonicalToWorld(entity?.position));
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
  scene.background = new THREE.Color(0x8395a0);
  scene.fog = new THREE.FogExp2(0x8d9da4, 0.018);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 150);
  const webgl2 = !!document.createElement('canvas').getContext('webgl2');
  if (!navigator.gpu && !webgl2) throw new Error('NO_SUPPORTED_GPU_BACKEND');
  const renderer = new THREE.WebGPURenderer({antialias: true, forceWebGL: !navigator.gpu});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  await renderer.init();
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xcfe5ef, 0x29302e, 2.3));
  const sun = new THREE.DirectionalLight(0xffead2, 3.4);
  sun.position.set(-5, 10, 4);
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

  const mountainResponse = await fetch('/assets/mountain_10k.splat', {cache: 'no-store'});
  if (!mountainResponse.ok) throw new Error(`MOUNTAIN_FETCH_${mountainResponse.status}`);
  const mountainBuffer = await mountainResponse.arrayBuffer();
  if (mountainBuffer.byteLength !== MOUNTAIN_BYTES || mountainBuffer.byteLength % 32) {
    throw new Error('MOUNTAIN_SIZE_GATE');
  }
  if (await sha256Hex(mountainBuffer) !== MOUNTAIN_SHA256) throw new Error('MOUNTAIN_HASH_GATE');
  const mountain = new GaussianSplat(new SPLATLoader().parse(mountainBuffer), {autoSort: true});
  mountain.scale.setScalar(3.7);
  mountain.rotation.x = Math.PI;
  mountain.position.set(0, -0.9, -1.8);
  scene.add(mountain);

  const loader = new GLTFLoader();
  const [playerGltf, enemyGltf] = await Promise.all([
    loader.loadAsync('/assets/player.glb'),
    loader.loadAsync('/assets/enemy.glb'),
  ]).catch(error => { throw new Error(`CHARACTER_ASSET_REQUIRED:${error.message}`); });

  const player = makeActor(playerGltf, 'player');
  const enemy = makeActor(enemyGltf, 'enemy');
  player.root.scale.setScalar(0.72);
  enemy.root.scale.setScalar(0.76);
  scene.add(player.root, enemy.root);

  // Presentation-only receiver for character shadows. It is not collision geometry.
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.ShadowMaterial({opacity: 0.20}),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.62;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const cameraLook = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  const clock = new THREE.Clock();
  let visible = true;

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
    cameraLook.copy(player.root.position).add(new THREE.Vector3(0, 1.15, 0));
    const back = new THREE.Vector3(0, 2.0, 4.6).applyAxisAngle(new THREE.Vector3(0,1,0), player.root.rotation.y);
    desiredCamera.copy(cameraLook).add(back);
    camera.position.lerp(desiredCamera, 1 - Math.exp(-7 * dt));
    camera.lookAt(cameraLook);

    if (visible) renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(frame);
  status(navigator.gpu ? 'WEBGPU_READY' : 'WEBGL2_FALLBACK_READY');
  return {applySnapshot, setVisible};
}
