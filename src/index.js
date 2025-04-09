import * as THREE from 'three';
import { OrbitControls } from 'three/examples/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { createField } from './field.js';
import { createStands, clearStands } from './footyStands.js';
import { createStadiumRoof, clearRoof } from './stadiumRoof.js';
import { createStadiumLights, clearStadiumLights } from './stadiumLights.js';


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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
  tierSpacing: 0.8,
  enableRoof: true,
  roofStyle: 'modern',
  roofColor: '#CCCCCC',
  roofTransparency: 0.7,
  enableLights: true,
  lightStyle: 'modern',
  lightHeight: 35,
  lightColor: '#FFFFCC',
  lightIntensity: 1.5
};

// GUI LOGIC
const stadiumFolder = gui.addFolder('Stadium');
stadiumFolder.add(params, 'stadiumType', ['Football', 'Cricket'])
   .name('Type')
   .onChange(value => {
    createField(value, scene);
    updateStands(); 
    updateRoof();
    updateLights();
  });

const standsFolder = gui.addFolder('Stands');
standsFolder.add(params, 'standHeight', 10, 30, 1).name('Height').onChange(() => 
{updateStands();
updateRoof();
updateLights();
});
standsFolder.add(params, 'standTiers', 1, 5, 1).name('Tiers').onChange(() => updateStands());
standsFolder.addColor(params, 'standColor').name('Stand Color').onChange(() => updateStands());
standsFolder.addColor(params, 'seatColor').name('Seat Color').onChange(() => updateStands());
standsFolder.add(params, 'tierSpacing', 0.5, 1.5, 0.1).name('Tier Spacing').onChange(() => updateStands());

const roofFolder = gui.addFolder('Roof');
roofFolder.add(params, 'enableRoof').name('Enable Roof').onChange(() => updateRoof());
roofFolder.add(params, 'roofStyle', ['modern', 'classic', 'partial']).name('Style').onChange(() => updateRoof());
roofFolder.addColor(params, 'roofColor').name('Color').onChange(() => updateRoof());
roofFolder.add(params, 'roofTransparency', 0.1, 1, 0.1).name('Transparency').onChange(() => updateRoof());

const lightsFolder = gui.addFolder('Lights');
lightsFolder.add(params, 'enableLights').name('Enable Lights').onChange(() => updateLights());
lightsFolder.add(params, 'lightStyle', ['modern', 'classic', 'corner']).name('Style').onChange(() => updateLights());
lightsFolder.add(params, 'lightHeight', 20, 50, 5).name('Height').onChange(() => updateLights());
lightsFolder.addColor(params, 'lightColor').name('Color').onChange(() => updateLights());
lightsFolder.add(params, 'lightIntensity', 0.5, 3, 0.1).name('Intensity').onChange(() => updateLights());

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
  

function updateRoof() {
  clearRoof(scene);
  if (params.enableRoof && params.stadiumType === 'Football') {
      createStadiumRoof(scene, {
          standHeight: params.standHeight,
          roofStyle: params.roofStyle,
          roofColor: new THREE.Color(params.roofColor),
          roofTransparency: params.roofTransparency,
          supportColor: new THREE.Color(params.standColor)
      });
  }
}

function updateLights() {
  clearStadiumLights(scene);
  if (params.enableLights && params.stadiumType === 'Football') {
      createStadiumLights(scene, {
          standHeight: params.standHeight,
          lightHeight: params.lightHeight,
          lightColor: new THREE.Color(params.lightColor),
          lightIntensity: params.lightIntensity,
          lightStyle: params.lightStyle
      });
  }
}
// INITIALIZATION
createField(params.stadiumType, scene);
updateStands();
updateRoof();
updateLights();

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
