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
        lightIntensity = 1.5,
        lightCount = 4,
        lightStyle = 'modern' // 'modern', 'classic', 'corner'
    } = options;

    // Clear existing lights
    clearStadiumLights(scene);

    // Create a group for the lights
    lightsGroup = new THREE.Group();
    lightsGroup.name = 'stadiumLights';

    // Create different light styles
    switch(lightStyle) {
        case 'modern':
            createModernLights(lightsGroup, {
                fieldLength,
                fieldWidth,
                lightHeight,
                lightColor,
                lightIntensity
            });
            break;
        case 'classic':
            createClassicLights(lightsGroup, {
                fieldLength,
                fieldWidth,
                lightHeight,
                lightColor,
                lightIntensity,
                lightCount
            });
            break;
        case 'corner':
            createCornerLights(lightsGroup, {
                fieldLength,
                fieldWidth,
                lightHeight,
                lightColor,
                lightIntensity
            });
            break;
    }

    scene.add(lightsGroup);
    return lightsGroup;
}

function createModernLights(group, options) {
    const {
        fieldLength,
        fieldWidth,
        lightHeight,
        lightColor,
        lightIntensity
    } = options;

    // Modern lights: Two large structures on each side of the field
    const sides = ['east', 'west'];
    const poleWidth = 3;
    const poleDepth = 2;
    
    sides.forEach(side => {
        const xPos = side === 'east' ? fieldLength/2 + 5 : -fieldLength/2 - 5;
        
        // Create light support structure
        const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        
        // Main pole
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const poleGeometry = new THREE.BoxGeometry(poleWidth, lightHeight, poleDepth);
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(xPos, lightHeight/2, 0);
        group.add(pole);
        
        // Light bank
        const bankWidth = fieldWidth * 0.8;
        const bankHeight = 5;
        const bankDepth = 3;
        
        const bankGeometry = new THREE.BoxGeometry(bankDepth, bankHeight, bankWidth);
        const bankMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const bank = new THREE.Mesh(bankGeometry, bankMaterial);
        bank.position.set(xPos + (side === 'east' ? -bankDepth/2 : bankDepth/2), 
                         lightHeight - bankHeight/2, 0);
        group.add(bank);
        
        // Add lights
        const lightCount = 8;
        const lightSpacing = bankWidth / lightCount;
        
        for (let i = 0; i < lightCount; i++) {
            const zPos = -bankWidth/2 + lightSpacing/2 + i * lightSpacing;
            
            // Light fixture
            const fixtureGeometry = new THREE.BoxGeometry(2, 1, 1.5);
            const fixtureMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(xPos + (side === 'east' ? -bankDepth-1 : bankDepth+1), 
                              lightHeight - bankHeight/2, zPos);
            group.add(fixture);
            
            // Actual light
            const light = new THREE.SpotLight(lightColor, lightIntensity);
            light.position.copy(fixture.position);
            light.target.position.set(0, 0, zPos);
            light.angle = 0.5;
            light.penumbra = 0.5;
            light.decay = 1;
            light.distance = 200;
            light.castShadow = true;
            
            group.add(light);
            group.add(light.target);
        }
    });
}

function createClassicLights(group, options) {
    const {
        fieldLength,
        fieldWidth,
        lightHeight,
        lightColor,
        lightIntensity,
        lightCount
    } = options;

    // Classic lights: Tall poles at the corners with multiple fixtures
    const corners = [
        {x: -fieldLength/2 - 5, z: -fieldWidth/2 - 5},
        {x: fieldLength/2 + 5, z: -fieldWidth/2 - 5},
        {x: fieldLength/2 + 5, z: fieldWidth/2 + 5},
        {x: -fieldLength/2 - 5, z: fieldWidth/2 + 5}
    ];
    
    corners.forEach(corner => {
        // Create pole
        const poleGeometry = new THREE.CylinderGeometry(0.8, 1.2, lightHeight, 8);
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(corner.x, lightHeight/2, corner.z);
        group.add(pole);
        
        // Create light platform
        const platformGeometry = new THREE.CylinderGeometry(3, 3, 1, 8);
        const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(corner.x, lightHeight - 0.5, corner.z);
        group.add(platform);
        
        // Add multiple light fixtures
        const fixtureCount = 6;
        const angleStep = (Math.PI * 2) / fixtureCount;
        
        for (let i = 0; i < fixtureCount; i++) {
            const angle = i * angleStep;
            const radius = 2.5;
            const fx = corner.x + Math.cos(angle) * radius;
            const fz = corner.z + Math.sin(angle) * radius;
            
            // Light fixture
            const fixtureGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
            const fixtureMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(fx, lightHeight, fz);
            
            // Rotate fixture to point at field
            fixture.lookAt(new THREE.Vector3(0, 0, 0));
            fixture.rotateX(Math.PI/6); // Angle down slightly
            
            group.add(fixture);
            
            // Actual light
            const light = new THREE.SpotLight(lightColor, lightIntensity * 0.5);
            light.position.copy(fixture.position);
            light.target.position.set(0, 0, 0);
            light.angle = 0.3;
            light.penumbra = 0.5;
            light.decay = 1;
            light.distance = 250;
            light.castShadow = true;
            
            group.add(light);
            group.add(light.target);
        }
    });
}

function createCornerLights(group, options) {
    const {
        fieldLength,
        fieldWidth,
        lightHeight,
        lightColor,
        lightIntensity
    } = options;

    // Angled corner lights
    const corners = [
        {x: -fieldLength/2 - 10, z: -fieldWidth/2 - 10, angle: Math.PI/4},
        {x: fieldLength/2 + 10, z: -fieldWidth/2 - 10, angle: 3*Math.PI/4},
        {x: fieldLength/2 + 10, z: fieldWidth/2 + 10, angle: 5*Math.PI/4},
        {x: -fieldLength/2 - 10, z: fieldWidth/2 + 10, angle: 7*Math.PI/4}
    ];
    
    corners.forEach(corner => {
        // Create main pole
        const poleGeometry = new THREE.CylinderGeometry(1, 1.5, lightHeight * 0.7, 8);
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(corner.x, lightHeight * 0.35, corner.z);
        group.add(pole);
        
        // Create angled arm
        const armLength = 15;
        const armGeometry = new THREE.CylinderGeometry(0.8, 0.8, armLength, 8);
        const arm = new THREE.Mesh(armGeometry, poleMaterial);
        
        // Position and rotate arm
        arm.position.set(
            corner.x + Math.cos(corner.angle) * armLength/2, 
            lightHeight * 0.7 + Math.sin(Math.PI/4) * armLength/2, 
            corner.z + Math.sin(corner.angle) * armLength/2
        );
        
        // Point arm towards field
        arm.lookAt(new THREE.Vector3(0, arm.position.y, 0));
        arm.rotateX(Math.PI/4); // Angle up
        
        group.add(arm);
        
        // Create light fixtures array
        const fixtureCount = 4;
        const fixtureSpacing = 3;
        const bankGeometry = new THREE.BoxGeometry(fixtureCount * fixtureSpacing, 1.5, 3);
        const bankMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const bank = new THREE.Mesh(bankGeometry, bankMaterial);
        
        // Calculate end position of arm
        const endX = corner.x + Math.cos(corner.angle) * armLength;
        const endY = lightHeight * 0.7 + Math.sin(Math.PI/4) * armLength;
        const endZ = corner.z + Math.sin(corner.angle) * armLength;
        
        bank.position.set(endX, endY, endZ);
        bank.lookAt(new THREE.Vector3(0, bank.position.y, 0));
        bank.rotateX(-Math.PI/6); // Angle down towards field
        
        group.add(bank);
        
        // Add light fixtures
        for (let i = 0; i < fixtureCount; i++) {
            const localOffset = (i - (fixtureCount-1)/2) * fixtureSpacing;
            
            // Create a dummy object to calculate the correct offset position
            const dummy = new THREE.Object3D();
            dummy.position.set(endX, endY, endZ);
            dummy.lookAt(new THREE.Vector3(0, dummy.position.y, 0));
            dummy.rotateX(-Math.PI/6);
            
            // Local position is in local space of the rotated bank
            dummy.translateX(localOffset);
            dummy.translateZ(1.5);
            
            const light = new THREE.SpotLight(lightColor, lightIntensity * 0.4);
            light.position.copy(dummy.position);
            light.target.position.set(0, 0, 0);
            light.angle = 0.4;
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