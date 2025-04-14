// src/stadiumRoof.js
import * as THREE from 'three';

let roofGroup = null;

function createStadiumRoof(scene, options = {}) {
    const {
        standHeight = 15,
        fieldLength = 105,
        fieldWidth = 68,
        standDepth = 20,
        roofTransparency = 0.7,
        supportColor = 0x888888
    } = options;

    clearRoof(scene);

    roofGroup = new THREE.Group();
    roofGroup.name = 'roof';

    // Calculate roof dimensions
    const totalLength = fieldLength + (standDepth * 2);
    const totalWidth = fieldWidth + (standDepth * 2);
    const roofHeight = standHeight + 5;
    const roofThickness = 0.5;

    // Create roof shape
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-totalLength/2, -totalWidth/2);
    roofShape.lineTo(totalLength/2, -totalWidth/2);
    roofShape.lineTo(totalLength/2, totalWidth/2);
    roofShape.lineTo(-totalLength/2, totalWidth/2);
    roofShape.lineTo(-totalLength/2, -totalWidth/2);

    // Create field hole
    const holeLength = fieldLength * 0.7;
    const holeWidth = fieldWidth * 0.7;
    const hole = new THREE.Path();
    hole.moveTo(-holeLength/2, -holeWidth/2);
    hole.lineTo(holeLength/2, -holeWidth/2);
    hole.lineTo(holeLength/2, holeWidth/2);
    hole.lineTo(-holeLength/2, holeWidth/2);
    hole.lineTo(-holeLength/2, -holeWidth/2);
    roofShape.holes.push(hole);

    // Create procedural texture
    const textureSize = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d');

    // Create gradient background
    const gradient = context.createLinearGradient(0, 0, textureSize, textureSize);
    gradient.addColorStop(0, '#CCCCCC');
    gradient.addColorStop(1, '#EEEEEE');
    context.fillStyle = gradient;
    context.fillRect(0, 0, textureSize, textureSize);

    // Add grid pattern
    const patternSize = 50;
    context.strokeStyle = '#AAAAAA';
    context.lineWidth = 2;
    for (let i = 0; i < textureSize; i += patternSize) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, textureSize);
        context.stroke();
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(textureSize, i);
        context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    // Create roof material
    const roofMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        opacity: roofTransparency,
        side: THREE.DoubleSide
    });

    // Create roof geometry
    const extrudeSettings = {
        steps: 1,
        depth: roofThickness,
        bevelEnabled: false
    };

    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = roofHeight;
    roof.rotation.x = Math.PI / 2;
    roofGroup.add(roof);

    // Create roof supports
    const supportMaterial = new THREE.MeshPhongMaterial({ color: supportColor });
    const archCount = 12;
    const archThickness = 1;
    
    for (let i = 0; i < archCount; i++) {
        const angle = (i / archCount) * Math.PI * 2;
        const xPos = Math.cos(angle) * (totalLength/2 - standDepth/2);
        const zPos = Math.sin(angle) * (totalWidth/2 - standDepth/2);
        
        const archHeight = roofHeight;
        const archWidth = 10;
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, archHeight * 1.3, 0),
            new THREE.Vector3(0, archHeight, archWidth)
        );
        
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, archThickness/2, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeometry, supportMaterial);
        
        tubeMesh.position.set(xPos, 0, zPos);
        tubeMesh.lookAt(new THREE.Vector3(0, 0, 0));
        tubeMesh.rotateY(Math.PI/2);
        
        roofGroup.add(tubeMesh);
    }

    scene.add(roofGroup);
    return roofGroup;
}

function clearRoof(scene) {
    if (roofGroup) {
        scene.remove(roofGroup);
        roofGroup = null;
    }
}

export { createStadiumRoof, clearRoof };