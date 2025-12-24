import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

/* =======================
   GLOBAL STATE
======================= */
let scene, camera, renderer, earth;
let orbitYaw = 0;
let orbitPitch = 0;
const orbitRadius = 4;

/* =======================
   INIT THREE
======================= */
init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.body.appendChild(renderer.domElement);

  // 🌍 Earth
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const texture = new THREE.TextureLoader().load(
    "./earth_day.jpg",
    () => console.log("✅ Earth texture loaded"),
    undefined,
    err => console.error("❌ Texture failed", err)
  );

  const material = new THREE.MeshPhongMaterial({ map: texture });
  earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  // 💡 Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  window.addEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* =======================
   ANIMATION LOOP
======================= */
function animate() {
  requestAnimationFrame(animate);

  orbitPitch = THREE.MathUtils.clamp(
    orbitPitch,
    -Math.PI / 2 + 0.2,
    Math.PI / 2 - 0.2
  );

  camera.position.set(
    orbitRadius * Math.cos(orbitPitch) * Math.sin(orbitYaw),
    orbitRadius * Math.sin(orbitPitch),
    orbitRadius * Math.cos(orbitPitch) * Math.cos(orbitYaw)
  );

  camera.lookAt(0, 0, 0);

  earth.rotation.y += 0.0008;

  renderer.render(scene, camera);
}

/* =======================
   HAND TRACKING (USER CLICK)
======================= */
document.getElementById("startBtn").onclick = () => {
  initHandTracking();
  document.getElementById("startBtn").remove();
};

function initHandTracking() {
  const video = document.getElementById("video");

  const hands = new Hands({
    locateFile: f =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(results => {
    if (!results.multiHandLandmarks?.length) return;

    const index = results.multiHandLandmarks[0][8];
    orbitYaw = (index.x - 0.5) * Math.PI * 2;
    orbitPitch = (0.5 - index.y) * Math.PI;
  });

  const cam = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480
  });

  cam.start();
}
