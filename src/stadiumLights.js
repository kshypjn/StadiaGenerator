// src/stadiumLights.js
import * as THREE from 'three';

let lightsGroup = null;

function createStadiumLights(scene, options = {}) {
    const {
        fieldLength = 105,
        fieldWidth = 68,
        standHeight = 15,
        lightHeight = 35,
        lightColor = 0xFFFFCC,
        lightIntensity = 1.5
    } = options;

    // Clear existing lights
    clearStadiumLights(scene);

    // Create a group for the lights
    lightsGroup = new THREE.Group();
    lightsGroup.name = 'stadiumLights';

    // Create flood lights in the corners
    createFloodLights(lightsGroup, {
        fieldLength,
        fieldWidth,
        lightHeight,
        lightColor,
        lightIntensity
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
        lightIntensity
    } = options;

    // Define corner positions
    const corners = [
        {x: -fieldLength/2 - 10, z: -fieldWidth/2 - 10, angle: Math.PI/4},
        {x: fieldLength/2 + 10, z: -fieldWidth/2 - 10, angle: 3*Math.PI/4},
        {x: fieldLength/2 + 10, z: fieldWidth/2 + 10, angle: 5*Math.PI/4},
        {x: -fieldLength/2 - 10, z: fieldWidth/2 + 10, angle: 7*Math.PI/4}
    ];
    
    // Create materials
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const fixtureMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    corners.forEach(corner => {
        // Create main pole
        const poleGeometry = new THREE.CylinderGeometry(1, 1.2, lightHeight, 8);
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(corner.x, lightHeight/2, corner.z);
        group.add(pole);

        // Create light fixture platform
        const platformGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8);
        const platform = new THREE.Mesh(platformGeometry, fixtureMaterial);
        platform.position.set(corner.x, lightHeight - 0.25, corner.z);
        group.add(platform);

        // Create three flood lights per corner
        const lightCount = 3;
        const angleStep = Math.PI / 4; // 45 degrees between lights
        
        for (let i = 0; i < lightCount; i++) {
            const angle = corner.angle + (i - 1) * angleStep;
            const radius = 1.5;
            
            // Calculate position for each light
            const lightX = corner.x + Math.cos(angle) * radius;
            const lightZ = corner.z + Math.sin(angle) * radius;
            
            // Create light fixture
            const fixtureGeometry = new THREE.BoxGeometry(2, 1, 1);
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(lightX, lightHeight, lightZ);
            
            // Rotate fixture to point at field
            fixture.lookAt(new THREE.Vector3(0, 0, 0));
            fixture.rotateX(Math.PI/4); // Angle down towards field
            
            group.add(fixture);
            
            // Create the actual light
            const light = new THREE.SpotLight(lightColor, lightIntensity);
            light.position.copy(fixture.position);
            light.target.position.set(0, 0, 0);
            light.angle = 0.4; // Wider angle for flood lights
            light.penumbra = 0.5;
            light.decay = 1;
            light.distance = 300;
            light.castShadow = true;
            
            group.add(light);
            group.add(light.target);
        }
    });
}

function clearStadiumLights(scene) {
    if (lightsGroup) {
        scene.remove(lightsGroup);
        lightsGroup = null;
    }
}

export { createStadiumLights, clearStadiumLights };