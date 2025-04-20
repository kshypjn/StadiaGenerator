// src/stadiumLights.js
import * as THREE from 'three';

let lightsGroup = null;
let spotLights = [];

function createStadiumLights(scene, options = {}) {
    const {
        fieldLength = 105,
        fieldWidth = 68,
        standHeight = 15,
        lightHeight = 35,
        lightColor = 0xFFFFCC,
        lightIntensity = 1.5,
        lightsOn = true
    } = options;

    // Clear existing lights
    clearStadiumLights(scene);

    // Create a group for the lights
    lightsGroup = new THREE.Group();
    lightsGroup.name = 'stadiumLights';
    spotLights = []; // Reset spotlights array

    // Create flood lights in the corners
    createFloodLights(lightsGroup, {
        fieldLength,
        fieldWidth,
        lightHeight,
        lightColor,
        lightIntensity,
        lightsOn
    });

    scene.add(lightsGroup);
    return lightsGroup;
}

function createFloodLights(group, options) {
    const {
        fieldLength,
        fieldWidth,
        lightHeight,
        lightColor,
        lightIntensity,
        lightsOn
    } = options;

    // Define corner positions with better offset from field
    const corners = [
        {x: -fieldLength/2 - 5, z: -fieldWidth/2 - 5, angle: Math.PI/4},
        {x: fieldLength/2 + 5, z: -fieldWidth/2 - 5, angle: 3*Math.PI/4},
        {x: fieldLength/2 + 5, z: fieldWidth/2 + 5, angle: 5*Math.PI/4},
        {x: -fieldLength/2 - 5, z: fieldWidth/2 + 5, angle: 7*Math.PI/4}
    ];
    
    // Create materials
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const fixtureMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const lightGlassMaterial = new THREE.MeshPhongMaterial({ 
        color: lightsOn ? lightColor : 0x555555,
        emissive: lightsOn ? lightColor : 0x000000,
        emissiveIntensity: lightsOn ? 0.5 : 0,
        transparent: true,
        opacity: 0.7
    });
    
    corners.forEach(corner => {
        // Create main pole
        const poleGeometry = new THREE.CylinderGeometry(0.8, 1, lightHeight, 8);
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(corner.x, lightHeight/2, corner.z);
        pole.castShadow = true;
        pole.receiveShadow = true;
        group.add(pole);

        // Create cross beam at the top of the pole
        const crossBeamGeometry = new THREE.BoxGeometry(8, 0.8, 0.8);
        const crossBeam = new THREE.Mesh(crossBeamGeometry, poleMaterial);
        crossBeam.position.set(corner.x, lightHeight - 1, corner.z);
        crossBeam.rotateY(corner.angle - Math.PI/2);
        crossBeam.castShadow = true;
        crossBeam.receiveShadow = true;
        group.add(crossBeam);

        // Create light fixtures on the cross beam
        const lightCount = 4;
        const lightSpacing = 1.5;
        
        for (let i = 0; i < lightCount; i++) {
            // Position offset along the cross beam
            const offset = (i - (lightCount - 1) / 2) * lightSpacing;
            
            // Calculate position
            const offsetX = Math.cos(corner.angle - Math.PI/2) * offset;
            const offsetZ = Math.sin(corner.angle - Math.PI/2) * offset;
            
            const lightX = corner.x + offsetX;
            const lightZ = corner.z + offsetZ;
            
            // Create light fixture housing
            const fixtureGeometry = new THREE.BoxGeometry(1.2, 1.2, 2);
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(lightX, lightHeight - 1, lightZ);
            
            // Point fixtures toward the center of the field
            fixture.lookAt(new THREE.Vector3(0, 0, 0));
            fixture.rotateX(Math.PI/6); // Angle down towards field
            fixture.castShadow = true;
            fixture.receiveShadow = true;
            group.add(fixture);
            
            // Create light glass/lens
            const glassGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.4, 16);
            const glass = new THREE.Mesh(glassGeometry, lightGlassMaterial);
            
            // Position the glass at the front of the fixture
            const glassPos = fixture.position.clone();
            const direction = new THREE.Vector3(0, 0, 0).sub(fixture.position).normalize();
            glassPos.add(direction.multiplyScalar(0.8));
            
            glass.position.copy(glassPos);
            glass.lookAt(new THREE.Vector3(0, 0, 0));
            glass.rotateX(Math.PI/2);
            group.add(glass);
            
            // Add the actual light if lights are on
            if (lightsOn) {
                const light = new THREE.SpotLight(lightColor, lightIntensity);
                light.position.copy(glassPos);
                
                // Target slightly beyond the center for better coverage
                const targetPos = new THREE.Vector3();
                targetPos.copy(direction.normalize().multiplyScalar(-fieldLength/2));
                light.target.position.copy(targetPos);
                
                light.angle = 0.3;
                light.penumbra = 0.5;
                light.decay = 1.5;
                light.distance = 300;
                
                // Enable and configure shadows
                light.castShadow = true;
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;
                light.shadow.camera.near = 1;
                light.shadow.camera.far = 200;
                light.shadow.bias = -0.0005;
                
                group.add(light);
                group.add(light.target);
                
                // Store reference to spotlight for toggling
                spotLights.push(light);
            }
        }
    });
}

function toggleLights(on = true) {
    // Update lighting state for all spotlights
    spotLights.forEach(light => {
        light.visible = on;
        light.intensity = on ? light.userData.intensity || 1.5 : 0;
    });
    
    // Update fixture materials if they're stored with lightsGroup
    if (lightsGroup) {
        lightsGroup.traverse(object => {
            if (object.isMesh && object.material && object.material.emissive) {
                if (on) {
                    object.material.emissive.set(0xFFFFCC);
                    object.material.emissiveIntensity = 0.5;
                } else {
                    object.material.emissive.set(0x000000);
                    object.material.emissiveIntensity = 0;
                }
            }
        });
    }
}

function clearStadiumLights(scene) {
    if (lightsGroup) {
        // Properly dispose of all resources
        lightsGroup.traverse(object => {
            if (object.isMesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else if (object.material) {
                    object.material.dispose();
                }
            }
        });
        
        scene.remove(lightsGroup);
        lightsGroup = null;
        spotLights = [];
    }
}

export { createStadiumLights, clearStadiumLights, toggleLights };