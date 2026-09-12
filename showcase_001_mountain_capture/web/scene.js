import * as THREE from 'three/webgpu';
import { GaussianSplat } from 'three/addons/objects/GaussianSplat.js';
import { SPLATLoader } from 'three/addons/loaders/SPLATLoader.js';

const EXPECTED_SHA256 = 'ED0387C03566505342407DFF661D6F47181B6FEF6DF83013626EF3469024ED41';
const EXPECTED_BYTES = 320000;

async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function actor(color, scale = 1) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(.35 * scale, 2), new THREE.MeshStandardMaterial({color, roughness:.32, metalness:.15, emissive:new THREE.Color(color).multiplyScalar(.12)}));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.53 * scale,.018,8,56), new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7}));
  ring.rotation.x = Math.PI / 2;
  group.add(body, ring);
  return group;
}

export async function createShowcaseRenderer(container, onCapability, onStatus) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04080c);
  scene.fog = new THREE.FogExp2(0x071019,.035);
  const camera = new THREE.PerspectiveCamera(46,1,.05,100);
  const webgl2 = !!document.createElement('canvas').getContext('webgl2');
  const capability = navigator.gpu ? 'WEBGPU_GAUSSIAN' : webgl2 ? 'WEBGPU_FORCE_WEBGL_GAUSSIAN' : 'UNSUPPORTED';
  onCapability(capability);
  if (capability === 'UNSUPPORTED') throw new Error('Gaussian backend unavailable');
  const renderer = new THREE.WebGPURenderer({antialias:true,forceWebGL:!navigator.gpu});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  await renderer.init();
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xa6ddff,0x170a19,2.0));
  const sun = new THREE.DirectionalLight(0xffd5a0,4.2); sun.position.set(-4,9,5); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(11,96),new THREE.MeshStandardMaterial({color:0x0a1820,roughness:.96}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-1.15; scene.add(ground);
  const grid = new THREE.GridHelper(18,36,0x225462,0x102b33); grid.position.y=-1.13; scene.add(grid);

  const player = actor(0x55e1d7,.9);
  const enemyA = actor(0xf05b6c,1.05);
  const enemyB = actor(0xffb15c,1.05);
  scene.add(player,enemyA,enemyB);

  const response = await fetch('/assets/mountain_10k.splat',{cache:'no-store'});
  if (!response.ok) throw new Error(`Mountain fetch ${response.status}`);
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength !== EXPECTED_BYTES || buffer.byteLength % 32) throw new Error('Mountain size gate');
  if (await sha256Hex(buffer) !== EXPECTED_SHA256) throw new Error('Mountain hash gate');
  const gaussian = new GaussianSplat(new SPLATLoader().parse(buffer),{autoSort:true});
  gaussian.scale.setScalar(3.7);
  gaussian.rotation.x = Math.PI;
  gaussian.position.set(0,-.9,-1.8);
  scene.add(gaussian);
  onStatus('LOADED',capability);

  function world(position){return{x:(position?.[0]||0)*.66,z:(position?.[1]||0)*.66+1.8};}
  function place(object,position){const p=world(position);object.position.set(p.x,-.55,p.z);}
  function update(view){
    const entities=Object.fromEntries((view?.entities||[]).map(item=>[item.entity_id,item]));
    place(player,entities.player?.world_position);
    place(enemyA,entities.enemy_01?.world_position);
    place(enemyB,entities.enemy_02?.world_position);
  }
  function resize(){const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function show(value){renderer.domElement.style.visibility=value?'visible':'hidden';}
  function animate(time){
    resize();
    const drift=Math.sin(time*.00008)*.22;
    camera.position.set(7.8+drift,3.2,10.8);
    camera.lookAt(0,.1,-.4);
    enemyA.rotation.y=time*.00035; enemyB.rotation.y=-time*.00028;
    renderer.render(scene,camera);
  }
  renderer.setAnimationLoop(animate);
  return {capability,show,update};
}
