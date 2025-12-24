import {
  heartShape,
  saturnShape,
  fireworkShape,
  earthShape,
  galaxyShape
} from "./shapes.js";

/* =======================
   ORBIT CAMERA
======================= */
let orbitYaw = 0;
let orbitPitch = 0;
const orbitRadius = 4;

/* =======================
   THREE CORE
======================= */
let scene, camera, renderer, particles;
let currentShape = heartShape;
let scaleFactor = 1;
let colorHue = 0;

/* =======================
   INIT
======================= */
init();
initHandTracking();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  createParticles(currentShape);
}

/* =======================
   PARTICLES
======================= */
function createParticles(shapeFn) {
  if (particles) scene.remove(particles);

  const count = 6000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  const points = shapeFn(count);

  for (let i = 0; i < count; i++) {
    pos[i*3]   = points[i][0];
    pos[i*3+1] = points[i][1];
    pos[i*3+2] = points[i][2];

    if (shapeFn === galaxyShape) {
      const r = points[i][3];
      if (r < 0.15) col.set([0,0,0], i*3);
      else if (r < 0.5) col.set([1,0.6,0.2], i*3);
      else col.set([0.6,0.7,1], i*3);
    }
    else if (shapeFn === earthShape) {
      const y = points[i][1];
      if (y > 0.45) col.set([1,1,1], i*3);
      else if (Math.random() > 0.65) col.set([0.1,0.6,0.2], i*3);
      else col.set([0.05,0.3,0.8], i*3);
    }
    else {
      const c = new THREE.Color(`hsl(${colorHue},100%,60%)`);
      col.set([c.r, c.g, c.b], i*3);
    }
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

  particles = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: shapeFn === galaxyShape ? 0.02 : 0.03,
      vertexColors: true
    })
  );

  scene.add(particles);
}

/* =======================
   ANIMATE
======================= */
function animate() {
  requestAnimationFrame(animate);

  orbitPitch = THREE.MathUtils.clamp(
    orbitPitch,
    -Math.PI/2 + 0.2,
    Math.PI/2 - 0.2
  );

  camera.position.set(
    orbitRadius * Math.cos(orbitPitch) * Math.sin(orbitYaw),
    orbitRadius * Math.sin(orbitPitch),
    orbitRadius * Math.cos(orbitPitch) * Math.cos(orbitYaw)
  );

  camera.lookAt(0, 0, 0);

  particles.scale.set(scaleFactor, scaleFactor, scaleFactor);

  if (currentShape === earthShape) {
    particles.rotation.y += 0.0015;
  }

  if (currentShape === galaxyShape) {
    particles.rotation.y += 0.002;

    const p = particles.geometry.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const d = Math.sqrt(p[i]*p[i] + p[i+2]*p[i+2]) + 0.001;
      p[i]   -= (p[i]/d) * 0.00005;
      p[i+2] -= (p[i+2]/d) * 0.00005;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

/* =======================
   HAND TRACKING (FIXED)
======================= */
function initHandTracking() {
  const video = document.getElementById("video");

  const hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(res => {
    if (!res.multiHandLandmarks?.length) return;

    const lm = res.multiHandLandmarks[0];
    const thumb = lm[4];
    const index = lm[8];

    const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);

    scaleFactor = THREE.MathUtils.clamp(dist * 6, 0.5, 3);

    orbitYaw   = (index.x - 0.5) * Math.PI * 2;
    orbitPitch = (0.5 - index.y) * Math.PI;

    if (dist < 0.03) switchShape();
  });

  const cam = new Camera(video, {
    onFrame: async () => hands.send({ image: video }),
    width: 640,
    height: 480
  });

  cam.start();
}

/* =======================
   SHAPE SWITCH
======================= */
function switchShape() {
  const shapes = [
    heartShape,
    saturnShape,
    fireworkShape,
    earthShape,
    galaxyShape
  ];

  currentShape = shapes[Math.floor(Math.random() * shapes.length)];
  createParticles(currentShape);
}
