import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

/* =======================
   CAMERA ORBIT STATE
======================= */
let orbitYaw = 0;
let orbitPitch = 0;
const orbitRadius = 4;

/* =======================
   THREE CORE
======================= */
let scene, camera, renderer;
let earth;

/* =======================
   INIT
======================= */
init();
initHandTracking();
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

  // IMPORTANT
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  document.body.appendChild(renderer.domElement);

  /* 🌍 EARTH */
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const loader = new THREE.TextureLoader();

  const earthTexture = loader.load(
    "./textures/earth_day.jpg",
    () => console.log("✅ Earth texture loaded"),
    undefined,
    err => console.error("❌ Texture failed", err)
  );

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture
  });

  earth = new THREE.Mesh(geometry, earthMaterial);
  scene.add(earth);

  /* 💡 LIGHTS (VERY IMPORTANT) */
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  window.addEventListener("resize", onResize);
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
   HAND TRACKING (MEDIAPIPE)
======================= */
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

  hands.onResults(res => {
    if (!res.multiHandLandmarks?.length) return;

    const index = res.multiHandLandmarks[0][8];

    // 👆 Inspect Earth like a real 3D object
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
