import * as THREE from 'three';

function createGoals(scene) {
  const goalWidth = 7.32;
  const goalHeight = 2.44;
  const goalDepth = 2;
  const postRadius = 0.1;
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  [-1, 1].forEach(side => {
    const postX = side * 105 / 2;

    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(postRadius, goalHeight, postRadius), material);
    leftPost.position.set(postX, goalHeight / 2, -goalWidth / 2);
    leftPost.userData.isGoal = true;

    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(postRadius, goalHeight, postRadius), material);
    rightPost.position.set(postX, goalHeight / 2, goalWidth / 2);
    rightPost.userData.isGoal = true;

    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(postRadius, postRadius, goalWidth), material);
    crossbar.position.set(postX, goalHeight, 0);
    crossbar.userData.isGoal = true;

    const netMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const net = new THREE.Mesh(
      new THREE.BoxGeometry(goalDepth, goalHeight, goalWidth),
      netMaterial
    );
    net.position.set(postX - side * goalDepth / 2, goalHeight / 2, 0);
    net.userData.isGoal = true;

    scene.add(leftPost, rightPost, crossbar, net);
  });
}

function createCornerFlags(scene) {
  const flagHeight = 1.5;
  const poleRadius = 0.05;
  const flagWidth = 0.4;
  const flagHeightSize = 0.3;

  const poleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const flagMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

  const corners = [
    [-105/2, 68/2], [-105/2, -68/2], [105/2, 68/2], [105/2, -68/2]
  ];

  corners.forEach(([x, z]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(poleRadius, poleRadius, flagHeight, 8),
      poleMaterial
    );
    pole.position.set(x, flagHeight / 2, z);
    pole.userData.isCornerFlag = true;

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(flagWidth, flagHeightSize), flagMaterial);
    flag.position.set(x + 0.2, flagHeight - flagHeightSize / 2, z);
    flag.rotation.y = Math.PI / 2;
    flag.userData.isCornerFlag = true;

    scene.add(pole, flag);
  });
}

export { createGoals, createCornerFlags };
