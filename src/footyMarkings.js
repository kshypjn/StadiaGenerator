import * as THREE from 'three';

function createFieldMarkings(scene) {
  const group = new THREE.Group();
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  const fieldLength = 105;
  const fieldWidth = 68;
  const halfL = fieldLength / 2;
  const halfW = fieldWidth / 2;
  const centerCircleRadius = 9.15;

  // Boundary
  const boundary = [
    new THREE.Vector3(-halfL, 0.01, -halfW),
    new THREE.Vector3(-halfL, 0.01, halfW),
    new THREE.Vector3(halfL, 0.01, halfW),
    new THREE.Vector3(halfL, 0.01, -halfW),
    new THREE.Vector3(-halfL, 0.01, -halfW),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(boundary), lineMaterial));

  // Center Line
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.01, -halfW),
    new THREE.Vector3(0, 0.01, halfW)
  ]), lineMaterial));

  // Center Circle
  const centerGeom = new THREE.CircleGeometry(centerCircleRadius, 64);
  const centerPts = [];
  for (let i = 1; i < centerGeom.attributes.position.count; i++) {
    centerPts.push(new THREE.Vector3().fromBufferAttribute(centerGeom.attributes.position, i));
  }
  const centerCircle = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(centerPts), lineMaterial
  );
  centerCircle.rotation.x = -Math.PI / 2;
  group.add(centerCircle);

  // Boxes & Spots
  const penaltyDepth = 16.5, penaltyWidth = 40.3;
  const goalDepth = 5.5, goalWidth = 18.32;
  [-1, 1].forEach(side => {
    const x = side * halfL;

    // Penalty box
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.01, -penaltyWidth / 2),
      new THREE.Vector3(x - side * penaltyDepth, 0.01, -penaltyWidth / 2),
      new THREE.Vector3(x - side * penaltyDepth, 0.01, penaltyWidth / 2),
      new THREE.Vector3(x, 0.01, penaltyWidth / 2),
      new THREE.Vector3(x, 0.01, -penaltyWidth / 2)
    ]), lineMaterial));

    // Goal box
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.01, -goalWidth / 2),
      new THREE.Vector3(x - side * goalDepth, 0.01, -goalWidth / 2),
      new THREE.Vector3(x - side * goalDepth, 0.01, goalWidth / 2),
      new THREE.Vector3(x, 0.01, goalWidth / 2),
      new THREE.Vector3(x, 0.01, -goalWidth / 2)
    ]), lineMaterial));

    // Penalty spot
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    spot.rotation.x = -Math.PI / 2;
    spot.position.set(x - side * 11, 0.011, 0);
    group.add(spot);
  });

  // Corner arcs
  const drawArc = (x, z, angle) => {
    const arc = [];
    for (let i = 0; i <= 16; i++) {
      const a = angle + (Math.PI / 2) * (i / 16);
      arc.push(new THREE.Vector3(x + Math.cos(a), 0.01, z + Math.sin(a)));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arc), lineMaterial));
  };

  drawArc(-halfL, -halfW, 0);
  drawArc(-halfL, halfW, -Math.PI / 2);
  drawArc(halfL, halfW, -Math.PI);
  drawArc(halfL, -halfW, -Math.PI * 1.5);

  scene.add(group);
  return group;
}

export { createFieldMarkings };
