import {
  heartShape,
  saturnShape,
  fireworkShape,
  earthShape,
  galaxyShape
} from "./shapes.js";

let orbitYaw = 0;    // left / right
let orbitPitch = 0;  // up / down
const orbitRadius = 4;



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

  const count = 6000;
  const geo = new THREE.BufferGeometry();

  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  const points = shapeFn(count);

  for (let i = 0; i < count; i++) {
    pos[i*3]   = points[i][0];
    pos[i*3+1] = points[i][1];
    pos[i*3+2] = points[i][2];

    // 🌌 GALAXY COLORS
    if (shapeFn === galaxyShape) {
      const r = points[i][3];

      // black hole core
      if (r < 0.15) {
        col[i*3] = 0; col[i*3+1] = 0; col[i*3+2] = 0;
      }
      // hot inner disk
      else if (r < 0.5) {
        col[i*3] = 1; col[i*3+1] = 0.6; col[i*3+2] = 0.2;
      }
      // spiral arms
      else {
        col[i*3] = 0.6; col[i*3+1] = 0.7; col[i*3+2] = 1;
      }
    }

    // 🌍 EARTH
    else if (shapeFn === earthShape) {
      const y = points[i][1];
      if (y > 0.45) {
        col[i*3] = 1; col[i*3+1] = 1; col[i*3+2] = 1;
      } else if (Math.random() > 0.65) {
        col[i*3] = 0.1; col[i*3+1] = 0.6; col[i*3+2] = 0.2;
      } else {
        col[i*3] = 0.05; col[i*3+1] = 0.3; col[i*3+2] = 0.8;
      }
    }

    // ❤️ OTHER SHAPES
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
    size: shapeFn === galaxyShape ? 0.02 : 0.03,
    vertexColors: true
  });

  particles = new THREE.Points(geo, mat);
  scene.add(particles);
}


function animate() {
  requestAnimationFrame(animate);

  // limit pitch so camera never flips
  orbitPitch = THREE.MathUtils.clamp(orbitPitch, -Math.PI/2 + 0.2, Math.PI/2 - 0.2);

  // spherical orbit camera
  camera.position.x =
    orbitRadius * Math.cos(orbitPitch) * Math.sin(orbitYaw);
  camera.position.y =
    orbitRadius * Math.sin(orbitPitch);
  camera.position.z =
    orbitRadius * Math.cos(orbitPitch) * Math.cos(orbitYaw);

  camera.lookAt(0, 0, 0);

  // particle behavior
  particles.scale.set(scaleFactor, scaleFactor, scaleFactor);

  if (currentShape === galaxyShape) {
    particles.rotation.y += 0.002;

    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const z = pos[i+2];
      const d = Math.sqrt(x*x + z*z) + 0.001;
      pos[i]   -= (x / d) * 0.00005;
      pos[i+2] -= (z / d) * 0.00005;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}


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

    // 👆 Hand controls camera ORBIT (not direction movement)
orbitYaw   = (index.x - 0.5) * Math.PI * 2; // left/right orbit
orbitPitch = (0.5 - index.y) * Math.PI;    // up/down orbit


// Color still works
colorHue = (1 - index.y) * 360;


    // ✊ Fist → Switch shape
    if (distance < 0.03) {
      switchShape();
    }

if (currentShape === earthShape) {
  particles.rotation.y += 0.0015;
  particles.rotation.x += 0.0003;
}

if (currentShape === galaxyShape) {
  particles.rotation.y += 0.002;

  const pos = particles.geometry.attributes.position.array;

  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i];
    const z = pos[i+2];

    const d = Math.sqrt(x*x + z*z) + 0.001;

    // black hole pull
    pos[i]   -= (x / d) * 0.00005;
    pos[i+2] -= (z / d) * 0.00005;
  }

  particles.geometry.attributes.position.needsUpdate = true;
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
    earthShape,
    galaxyShape // 🌌 added
  ];

  currentShape = shapes[Math.floor(Math.random() * shapes.length)];
  createParticles(currentShape);
}

