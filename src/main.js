import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// ---------- 场景 ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e0e);

// ---------- 相机 ----------
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.set(0, 0, 1500);
camera.lookAt(0, 0, 0);

// ---------- 渲染器 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ---------- 光源 ----------
const ambient = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 0.8);
directional.position.set(0, 0, 1000);
scene.add(directional);

// ---------- 控制器 ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ---------- 加载 SVG ----------
const loader = new SVGLoader();
loader.load('/favicon.svg', function (data) {
  const group = new THREE.Group();

  for (const path of data.paths) {
    // 使用 SVG 原色，如果没有则默认白色
    const color = path.userData.style.fill ? new THREE.Color(path.userData.style.fill) : new THREE.Color(0xffffff);

    const material = new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      depthWrite: true,
      metalness: 0.2,
      roughness: 0.7,
    });

    const shapes = SVGLoader.createShapes(path);
    for (const shape of shapes) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 20,          // 厚度
        bevelEnabled: false, // 是否倒角
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }
  }

  // ---------- 居中 ----------
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.x -= center.x - 150;
  group.position.y -= center.y - 150;
  group.position.z -= center.z;

  // ---------- 缩放 ----------
  const size = box.getSize(new THREE.Vector3());
  const scale = 800 / Math.max(size.x, size.y, size.z);
  group.scale.set(scale, scale, scale);

  scene.add(group);
});

// ---------- 动画循环 ----------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ---------- 自适应窗口 ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
