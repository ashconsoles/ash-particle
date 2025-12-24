import { heartShape, saturnShape, fireworkShape } from "./shapes.js";

let scene, camera, renderer, particles;
let currentShape = heartShape;
let scaleFactor = 1;
let colorHue = 0;

init();
initHandTracking();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 4;

  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  createParticles(currentShape);
}

function createParticles(shapeFn) {
  if (particles) scene.remove(particles);

  const count = 3000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);

  shapeFn(count).forEach((p, i) => {
    pos[i*3] = p[0];
    pos[i*3+1] = p[1];
    pos[i*3+2] = p[2];
  });

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.03,
    color: new THREE.Color(`hsl(${colorHue},100%,60%)`)
  });

  particles = new THREE.Points(geo, mat);
  scene.add(particles);
}

function animate() {
  requestAnimationFrame(animate);

  particles.rotation.y += 0.002;
  particles.scale.set(scaleFactor, scaleFactor, scaleFactor);
  particles.material.color.setHSL(colorHue / 360, 1, 0.6);

  renderer.render(scene, camera);
}

function initHandTracking() {
  const hands = new Hands({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(results => {
    if (!results.multiHandLandmarks.length) return;

    const lm = results.multiHandLandmarks[0];

    const thumb = lm[4];
    const index = lm[8];

    const distance = Math.hypot(
      thumb.x - index.x,
      thumb.y - index.y
    );

    // ✋ Pinch → Scale
    scaleFactor = THREE.MathUtils.clamp(distance * 6, 0.5, 3);

    // 👆 Move finger up/down → Color
    colorHue = (1 - index.y) * 360;

    // ✊ Fist → Switch shape
    if (distance < 0.03) {
      switchShape();
    }
  });

  const cameraFeed = new Camera(document.getElementById("video"), {
    onFrame: async () => await hands.send({ image: video }),
    width: 640,
    height: 480
  });
  cameraFeed.start();
}

function switchShape() {
  const shapes = [heartShape, saturnShape, fireworkShape];
  currentShape = shapes[Math.floor(Math.random() * shapes.length)];
  createParticles(currentShape);
}
