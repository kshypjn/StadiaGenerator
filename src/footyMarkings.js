import * as THREE from 'three';

function createFieldMarkings(scene) {
  const group = new THREE.Group();
  
  const lineMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  });

  const fieldLength = 105;
  const fieldWidth = 68;
  const halfL = fieldLength / 2;
  const halfW = fieldWidth / 2;
  const centerCircleRadius = 9.15;
  const lineWidth = 0.12; 
  const lineHeight = 0.02; 


  function createLine(points) {
    const lineGeometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(lineWidth / 2);

      vertices.push(
        p1.x + perpendicular.x, p1.y, p1.z + perpendicular.z,
        p1.x - perpendicular.x, p1.y, p1.z - perpendicular.z,
        p2.x + perpendicular.x, p2.y, p2.z + perpendicular.z,
        p2.x - perpendicular.x, p2.y, p2.z - perpendicular.z,
        p2.x + perpendicular.x, p2.y, p2.z + perpendicular.z,
        p1.x - perpendicular.x, p1.y, p1.z - perpendicular.z
      );
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Mesh(lineGeometry, lineMaterial);
  }

  // Boundary
  const boundary = [
    new THREE.Vector3(-halfL, lineHeight, -halfW),
    new THREE.Vector3(-halfL, lineHeight, halfW),
    new THREE.Vector3(halfL, lineHeight, halfW),
    new THREE.Vector3(halfL, lineHeight, -halfW),
    new THREE.Vector3(-halfL, lineHeight, -halfW),
  ];
  group.add(createLine(boundary));

  // Center Line
  group.add(createLine([
    new THREE.Vector3(0, lineHeight, -halfW),
    new THREE.Vector3(0, lineHeight, halfW)
  ]));

  // Center Circle
  const centerPoints = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    centerPoints.push(new THREE.Vector3(
      Math.cos(angle) * centerCircleRadius,
      lineHeight,
      Math.sin(angle) * centerCircleRadius
    ));
  }
  group.add(createLine(centerPoints));

  // Center spot
  const centerSpot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, lineHeight * 2, 16),
    lineMaterial
  );
  centerSpot.position.set(0, lineHeight, 0);
  group.add(centerSpot);

  // Boxes & Spots
  const penaltyDepth = 16.5, penaltyWidth = 40.3;
  const goalDepth = 5.5, goalWidth = 18.32;
  [-1, 1].forEach(side => {
    const x = side * halfL;

    // Penalty box
    group.add(createLine([
      new THREE.Vector3(x, lineHeight, -penaltyWidth / 2),
      new THREE.Vector3(x - side * penaltyDepth, lineHeight, -penaltyWidth / 2),
      new THREE.Vector3(x - side * penaltyDepth, lineHeight, penaltyWidth / 2),
      new THREE.Vector3(x, lineHeight, penaltyWidth / 2),
      new THREE.Vector3(x, lineHeight, -penaltyWidth / 2)
    ]));

    // Goal box
    group.add(createLine([
      new THREE.Vector3(x, lineHeight, -goalWidth / 2),
      new THREE.Vector3(x - side * goalDepth, lineHeight, -goalWidth / 2),
      new THREE.Vector3(x - side * goalDepth, lineHeight, goalWidth / 2),
      new THREE.Vector3(x, lineHeight, goalWidth / 2),
      new THREE.Vector3(x, lineHeight, -goalWidth / 2)
    ]));

    // Penalty spot
    const spot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, lineHeight * 2, 16),
      lineMaterial
    );
    spot.position.set(x - side * 11, lineHeight, 0);
    group.add(spot);
  });

  // Corner arcs
  const drawArc = (x, z, startAngle) => {
    const arcPoints = [];
    const arcSegments = 16;
    for (let i = 0; i <= arcSegments; i++) {
      const angle = startAngle + (Math.PI / 2) * (i / arcSegments);
      arcPoints.push(new THREE.Vector3(
        x + Math.cos(angle),
        lineHeight,
        z + Math.sin(angle)
      ));
    }
    group.add(createLine(arcPoints));
  };

  drawArc(-halfL, -halfW, 0);
  drawArc(-halfL, halfW, -Math.PI / 2);
  drawArc(halfL, halfW, -Math.PI);
  drawArc(halfL, -halfW, -Math.PI * 1.5);

  scene.add(group);
  return group;
}

export { createFieldMarkings };
