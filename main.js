import { heartShape, saturnShape, fireworkShape, earthShape } from "./shapes.js";


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

  const count = 4000;
  const geo = new THREE.BufferGeometry();

  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  const points = shapeFn(count);

  for (let i = 0; i < count; i++) {
    pos[i*3]   = points[i][0];
    pos[i*3+1] = points[i][1];
    pos[i*3+2] = points[i][2];

    // 🌍 Earth coloring
    if (shapeFn === earthShape) {
      const y = points[i][1];

      if (y > 0.45) {
        col[i*3] = 1; col[i*3+1] = 1; col[i*3+2] = 1; // clouds
      } else if (Math.random() > 0.65) {
        col[i*3] = 0.1; col[i*3+1] = 0.6; col[i*3+2] = 0.2; // land
      } else {
        col[i*3] = 0.05; col[i*3+1] = 0.3; col[i*3+2] = 0.8; // ocean
      }
    } 
    // ❤️ Other shapes keep HSL color
    else {
      const c = new THREE.Color(`hsl(${colorHue},100%,60%)`);
      col[i*3] = c.r;
      col[i*3+1] = c.g;
      col[i*3+2] = c.b;
    }
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: shapeFn === earthShape ? 0.025 : 0.03,
    vertexColors: true
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

if (currentShape === earthShape) {
  particles.rotation.y += 0.0015;
  particles.rotation.x += 0.0003;
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
  const shapes = [
    heartShape,
    saturnShape,
    fireworkShape,
    earthShape // 🌍 added
  ];

  currentShape = shapes[Math.floor(Math.random() * shapes.length)];
  createParticles(currentShape);
}

