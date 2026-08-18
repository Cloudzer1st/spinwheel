// wheel.js
let scene, camera, renderer, wheelMesh, pointerMesh;
let participantsData = [];
const WHEEL_RADIUS = 5;
const WHEEL_HEIGHT = 0.8;

function initThree() {
  const container = document.getElementById('canvas-container');

  // 1. Scene setup
  scene = new THREE.Scene();

  // 2. Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 14);

  // 3. Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // 4. Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xffd700, 1, 20);
  pointLight.position.set(0, 0, 8);
  scene.add(pointLight);

  // 5. Create 3D Pointer/Jarum Penunjuk
  createPointer();

  // Handle Resize Window
  window.addEventListener('resize', onWindowResize);
}

function createPointer() {
  const pointerGroup = new THREE.Group();
  const geometry = new THREE.ConeGeometry(0.4, 1.2, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0055,
    metalness: 0.6,
    roughness: 0.2
  });

  const pointer = new THREE.Mesh(geometry, material);
  pointer.rotation.z = Math.PI; // Menunjuk ke bawah
  pointerGroup.add(pointer);

  // Posisi di atas roda
  pointerGroup.position.set(0, WHEEL_RADIUS + 0.3, 0.5);
  scene.add(pointerGroup);
  pointerMesh = pointerGroup;
}

// Menghasilkan Canvas Tekstur untuk Sisi Depan Roda 3D
function createWheelTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - 20;

  const total = data.length > 0 ? data.length : 1;
  const arc = (Math.PI * 2) / total;
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c'];

  // Draw Segments
  for (let i = 0; i < total; i++) {
    const angle = i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arc);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw Text (Nama & BIB)
    if (data.length > 0) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle + arc / 2);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';

  // Font Scaling berdasarkan jumlah peserta
  const fontSize = Math.max(18, Math.min(42, Math.floor(650 / total)));
  ctx.font = `bold ${fontSize}px Arial`;

  const item = data[i];
  const text = `BIB: ${item.bib}`; // Hanya menampilkan Nomor BIB
  ctx.fillText(text, radius - 40, fontSize / 3);
  ctx.restore();
}
  }

  // Draw Outer Border & Center Cap
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.lineWidth = 25;
  ctx.strokeStyle = '#ffd700'; // Ring Emas
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
  ctx.fillStyle = '#222222';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffd700';
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

// Build / Rebuild 3D Wheel Mesh
function create3DWheel(data) {
  participantsData = data;

  if (wheelMesh) {
    scene.remove(wheelMesh);
    wheelMesh.geometry.dispose();
  }

  const texture = createWheelTexture(data);
  const wheelGeometry = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_HEIGHT, 64);

  // Material untuk Sisi Samping, Atas (Depan), dan Bawah
  const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
  const topMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

  const materials = [sideMaterial, topMaterial, bottomMaterial];
  wheelMesh = new THREE.Mesh(wheelGeometry, materials);

  // Posisikan roda agar menghadap ke depan (Kamera)
  wheelMesh.rotation.x = Math.PI / 2;
  scene.add(wheelMesh);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function renderScene() {
  requestAnimationFrame(renderScene);
  renderer.render(scene, camera);
}

// Inisialisasi awal
initThree();
renderScene();