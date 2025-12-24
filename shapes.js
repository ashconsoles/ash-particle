export function heartShape(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t);
    pts.push([x * 0.05, y * 0.05, (Math.random() - 0.5)]);
  }
  return pts;
}

export function saturnShape(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1 + Math.random() * 0.2;
    pts.push([
      Math.cos(a) * r,
      (Math.random() - 0.5) * 0.2,
      Math.sin(a) * r
    ]);
  }
  return pts;
}

export function fireworkShape(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize().multiplyScalar(Math.random());
    pts.push([v.x, v.y, v.z]);
  }
  return pts;
}

export function earthShape(count) {
  const pts = [];

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();

    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const r = 1;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    pts.push([x, y, z]);
  }
  return pts;
}

export function galaxyShape(count) {
  const pts = [];

  const arms = 4;
  const spin = 5;

  for (let i = 0; i < count; i++) {
    const radius = Math.random() ** 0.5 * 2.2;
    const arm = (i % arms) / arms * Math.PI * 2;

    const angle = arm + radius * spin;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 0.1;

    pts.push([x, y, z, radius]);
  }

  return pts;
}
