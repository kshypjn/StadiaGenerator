import * as THREE from 'three';
import { createFieldMarkings } from './footyMarkings.js';
import { createGoals, createCornerFlags } from './footySides.js';

let field;
let fieldMarkings;

function clearExtras(scene) {
  if (field) scene.remove(field);
  if (fieldMarkings) scene.remove(fieldMarkings);

  const extras = scene.children.filter(obj =>
    obj.userData.isGoal || obj.userData.isCornerFlag
  );
  extras.forEach(obj => scene.remove(obj));
}

function createField(type, scene) {
  clearExtras(scene);

  let geometry;
  if (type === 'Football') {
    geometry = new THREE.PlaneGeometry(105, 68);
  } else if (type === 'Cricket') {
    geometry = new THREE.RingGeometry(0, 60, 64);
    geometry.scale(1, 0.85, 1);
  }

  const material = new THREE.MeshPhongMaterial({ color: 0x228B22, side: THREE.DoubleSide, receiveShadow: true });
  field.rotation.x = -Math.PI / 2;
  scene.add(field);

  if (type === 'Football') {
    fieldMarkings = createFieldMarkings(scene);
    createGoals(scene);
    createCornerFlags(scene);
  }
}

export { createField };
