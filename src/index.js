import * as THREE from 'three';
import { OrbitControls } from 'three/examples/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { createField } from './field.js';
import { createStands, clearStands } from './footyStands.js';



// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(100, 200, 100);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// GUI
const gui = new GUI();
const params = {
  stadiumType: 'Football',
  standHeight: 15,
  standTiers: 3,
  standColor: '#1a1a1a',
  seatColor: '#808080',
  tierSpacing: 0.8
};

// GUI LOGIC
const stadiumFolder = gui.addFolder('Stadium');
stadiumFolder.add(params, 'stadiumType', ['Football', 'Cricket'])
   .name('Type')
   .onChange(value => {
    createField(value, scene);
    updateStands(); 
  });

const standsFolder = gui.addFolder('Stands');
standsFolder.add(params, 'standHeight', 10, 30, 1).name('Height').onChange(() => updateStands());
standsFolder.add(params, 'standTiers', 1, 5, 1).name('Tiers').onChange(() => updateStands());
standsFolder.addColor(params, 'standColor').name('Stand Color').onChange(() => updateStands());
standsFolder.addColor(params, 'seatColor').name('Seat Color').onChange(() => updateStands());
standsFolder.add(params, 'tierSpacing', 0.5, 1.5, 0.1).name('Tier Spacing').onChange(() => updateStands());

function updateStands() {
    clearStands(scene);
    if (params.stadiumType === 'Football') {
        createStands(scene, {
            height: params.standHeight,
            tiers: params.standTiers,
            color: new THREE.Color(params.standColor),
            seatColor: new THREE.Color(params.seatColor),
            tierSpacing: params.tierSpacing
        });
    }
}
  
// INITIALIZATION
createField(params.stadiumType, scene);

// ANIMATION
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
