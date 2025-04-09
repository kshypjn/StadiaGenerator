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
  standShape: 'rectangular',
  standGaps: false,
  bowlShape: 0,
  stadiumWidth: 1,
  stadiumLength: 1,
  enableRoof: false,
  roofStyle: 'modern',
  roofColor: '#ffffff',
  roofTransparency: 0.5,
  enableLights: false,
  lightStyle: 'modern',
  lightHeight: 30,
  lightColor: '#ffffff',
  lightIntensity: 1.0,
  individualStandControl: false,
  enablePremiumTier: false,
  premiumTierLevel: 1,
  premiumColor: '#333333',
  premiumSeatColor: '#CCCCCC',
  // Individual stand parameters
  northHeight: 15,
  northTiers: 3,
  northColor: '#1a1a1a',
  northSeatColor: '#808080',
  southHeight: 15,
  southTiers: 3,
  southColor: '#1a1a1a',
  southSeatColor: '#808080',
  eastHeight: 15,
  eastTiers: 3,
  eastColor: '#1a1a1a',
  eastSeatColor: '#808080',
  westHeight: 15,
  westTiers: 3,
  westColor: '#1a1a1a',
  westSeatColor: '#808080'
};


// Add debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize update functions
const debouncedUpdateStands = debounce(() => {
    clearStands(scene);
    if (params.stadiumType === 'Football') {
        const individualStands = {
            north: {
                height: params.individualStandControl ? params.northHeight : null,
                tiers: params.individualStandControl ? params.northTiers : null,
                color: params.individualStandControl ? new THREE.Color(params.northColor) : null,
                seatColor: params.individualStandControl ? new THREE.Color(params.northSeatColor) : null
            },
            south: {
                height: params.individualStandControl ? params.southHeight : null,
                tiers: params.individualStandControl ? params.southTiers : null,
                color: params.individualStandControl ? new THREE.Color(params.southColor) : null,
                seatColor: params.individualStandControl ? new THREE.Color(params.southSeatColor) : null
            },
            east: {
                height: params.individualStandControl ? params.eastHeight : null,
                tiers: params.individualStandControl ? params.eastTiers : null,
                color: params.individualStandControl ? new THREE.Color(params.eastColor) : null,
                seatColor: params.individualStandControl ? new THREE.Color(params.eastSeatColor) : null
            },
            west: {
                height: params.individualStandControl ? params.westHeight : null,
                tiers: params.individualStandControl ? params.westTiers : null,
                color: params.individualStandControl ? new THREE.Color(params.westColor) : null,
                seatColor: params.individualStandControl ? new THREE.Color(params.westSeatColor) : null
            }
        };
        const premiumTier = {
            enabled: params.enablePremiumTier,
            tier: params.premiumTierLevel,
            color: new THREE.Color(params.premiumColor),
            seatColor: new THREE.Color(params.premiumSeatColor)
        };
        
        const stadiumFootprint = {
            width: params.stadiumWidth,
            length: params.stadiumLength
        };
        
        createStands(scene, {
            height: params.standHeight,
            tiers: params.standTiers,
            color: new THREE.Color(params.standColor),
            seatColor: new THREE.Color(params.seatColor),
            tierSpacing: params.tierSpacing,
            standShape: params.standShape,
            standGaps: params.standGaps,
            individualStands: individualStands,
            premiumTier: premiumTier,
            bowlShape: params.bowlShape,
            stadiumFootprint: stadiumFootprint
        });
    }
}, 100);

const debouncedUpdateRoof = debounce(() => {
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
}, 100);

const debouncedUpdateLights = debounce(() => {
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
}, 100);

// GUI LOGIC
const stadiumFolder = gui.addFolder('Stadium');
stadiumFolder.add(params, 'stadiumType', ['Football', 'Cricket'])
   .name('Type')
   .onChange(value => {
    createField(value, scene);
    debouncedUpdateStands();
    debouncedUpdateRoof();
    debouncedUpdateLights();
});

const standsFolder = gui.addFolder('Stands');
standsFolder.add(params, 'standHeight', 10, 30, 1).name('Height').onChange(() => {
    debouncedUpdateStands();
    debouncedUpdateRoof();
    debouncedUpdateLights();
});
standsFolder.add(params, 'standTiers', 1, 5, 1).name('Tiers').onChange(() => debouncedUpdateStands());
standsFolder.addColor(params, 'standColor').name('Stand Color').onChange(() => debouncedUpdateStands());
standsFolder.addColor(params, 'seatColor').name('Seat Color').onChange(() => debouncedUpdateStands());
standsFolder.add(params, 'tierSpacing', 0.5, 2.0, 0.1).name('Tier Spacing').onChange(() => debouncedUpdateStands());
standsFolder.add(params, 'standShape', ['rectangular', 'curved', 'asymmetric']).name('Stand Shape').onChange(() => debouncedUpdateStands());
standsFolder.add(params, 'standGaps').name('Add Stand Gaps').onChange(() => debouncedUpdateStands());
standsFolder.add(params, 'bowlShape', 0, 1, 0.1).name('Bowl Roundness').onChange(() => debouncedUpdateStands());

const roofFolder = gui.addFolder('Roof');
roofFolder.add(params, 'enableRoof').name('Enable Roof').onChange(() => debouncedUpdateRoof());
roofFolder.add(params, 'roofStyle', ['modern', 'classic', 'partial']).name('Style').onChange(() => debouncedUpdateRoof());
roofFolder.addColor(params, 'roofColor').name('Color').onChange(() => debouncedUpdateRoof());
roofFolder.add(params, 'roofTransparency', 0.1, 1, 0.1).name('Transparency').onChange(() => debouncedUpdateRoof());

const lightsFolder = gui.addFolder('Lights');
lightsFolder.add(params, 'enableLights').name('Enable Lights').onChange(() => debouncedUpdateLights());
lightsFolder.add(params, 'lightStyle', ['modern', 'classic', 'corner']).name('Style').onChange(() => debouncedUpdateLights());
lightsFolder.add(params, 'lightHeight', 20, 50, 5).name('Height').onChange(() => debouncedUpdateLights());
lightsFolder.addColor(params, 'lightColor').name('Color').onChange(() => debouncedUpdateLights());
lightsFolder.add(params, 'lightIntensity', 0.5, 3, 0.1).name('Intensity').onChange(() => debouncedUpdateLights());

// INITIALIZATION
createField(params.stadiumType, scene);
debouncedUpdateStands();
debouncedUpdateRoof();
debouncedUpdateLights();

const footprintFolder = standsFolder.addFolder('Stadium Footprint');
footprintFolder.add(params, 'stadiumWidth', 0.8, 1.5, 0.05).name('Width').onChange(() => {
  debouncedUpdateStands();
  debouncedUpdateRoof();
  debouncedUpdateLights();
});
footprintFolder.add(params, 'stadiumLength', 0.8, 1.5, 0.05).name('Length').onChange(() => {
  debouncedUpdateStands();
  debouncedUpdateRoof();
  debouncedUpdateLights();
});

const premiumFolder = standsFolder.addFolder('Premium Seating');
premiumFolder.add(params, 'enablePremiumTier').name('Enable Premium Tier').onChange(() => debouncedUpdateStands());
premiumFolder.add(params, 'premiumTierLevel', 0, 4, 1).name('Tier Level').onChange(() => debouncedUpdateStands());
premiumFolder.addColor(params, 'premiumColor').name('Color').onChange(() => debouncedUpdateStands());
premiumFolder.addColor(params, 'premiumSeatColor').name('Seat Color').onChange(() => debouncedUpdateStands());

// Individual stand controls
const individualFolder = standsFolder.addFolder('Individual Stands');
individualFolder.add(params, 'individualStandControl').name('Enable').onChange(() => debouncedUpdateStands());

// North stand controls
const northFolder = individualFolder.addFolder('North Stand');
northFolder.add(params, 'northHeight', 5, 30, 1).name('Height').onChange(() => debouncedUpdateStands());
northFolder.add(params, 'northTiers', 1, 5, 1).name('Tiers').onChange(() => debouncedUpdateStands());
northFolder.addColor(params, 'northColor').name('Color').onChange(() => debouncedUpdateStands());
northFolder.addColor(params, 'northSeatColor').name('Seat Color').onChange(() => debouncedUpdateStands());

// South stand controls
const southFolder = individualFolder.addFolder('South Stand');
southFolder.add(params, 'southHeight', 5, 30, 1).name('Height').onChange(() => debouncedUpdateStands());
southFolder.add(params, 'southTiers', 1, 5, 1).name('Tiers').onChange(() => debouncedUpdateStands());
southFolder.addColor(params, 'southColor').name('Color').onChange(() => debouncedUpdateStands());
southFolder.addColor(params, 'southSeatColor').name('Seat Color').onChange(() => debouncedUpdateStands());

// East stand controls
const eastFolder = individualFolder.addFolder('East Stand');
eastFolder.add(params, 'eastHeight', 5, 30, 1).name('Height').onChange(() => debouncedUpdateStands());
eastFolder.add(params, 'eastTiers', 1, 5, 1).name('Tiers').onChange(() => debouncedUpdateStands());
eastFolder.addColor(params, 'eastColor').name('Color').onChange(() => debouncedUpdateStands());
eastFolder.addColor(params, 'eastSeatColor').name('Seat Color').onChange(() => debouncedUpdateStands());

// West stand controls
const westFolder = individualFolder.addFolder('West Stand');
westFolder.add(params, 'westHeight', 5, 30, 1).name('Height').onChange(() => debouncedUpdateStands());
westFolder.add(params, 'westTiers', 1, 5, 1).name('Tiers').onChange(() => debouncedUpdateStands());
westFolder.addColor(params, 'westColor').name('Color').onChange(() => debouncedUpdateStands());
westFolder.addColor(params, 'westSeatColor').name('Seat Color').onChange(() => debouncedUpdateStands());


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
