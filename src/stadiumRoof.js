// src/stadiumRoof.js
import * as THREE from 'three';

let roofGroup = null;

function createStadiumRoof(scene, options = {}) {
    const {
        standHeight = 15,
        fieldLength = 105,
        fieldWidth = 68,
        standDepth = 20,
        roofColor = 0xCCCCCC,
        roofTransparency = 0.7,
        supportColor = 0x888888,
        stadiumFootprint = { width: 1, length: 1 }
    } = options;

    // Remove existing roof if any
    clearRoof(scene);

    // Create a group for the roof
    roofGroup = new THREE.Group();
    roofGroup.name = 'roof';

    // Calculate roof dimensions based on stadium footprint
    const adjustedLength = fieldLength * stadiumFootprint.length;
    const adjustedWidth = fieldWidth * stadiumFootprint.width;
    const totalLength = adjustedLength + (standDepth * 2);
    const totalWidth = adjustedWidth + (standDepth * 2);
    const roofHeight = standHeight + 5; // Roof height relative to stand height
    const roofThickness = 0.5;

    // Create a standard roof (using what was formerly the "modern" style)
    createRoof(roofGroup, {
        totalLength, 
        totalWidth, 
        roofHeight, 
        roofThickness, 
        roofColor, 
        roofTransparency,
        supportColor,
        standDepth,
        adjustedLength,
        adjustedWidth
    });

    scene.add(roofGroup);
    return roofGroup;
}

function createRoof(group, options) {
    const {
        totalLength, 
        totalWidth, 
        roofHeight, 
        roofThickness, 
        roofColor, 
        roofTransparency,
        supportColor,
        standDepth = 20,
        adjustedLength,
        adjustedWidth
    } = options;

    // Create curved roof
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-totalLength/2, -totalWidth/2);
    roofShape.lineTo(totalLength/2, -totalWidth/2);
    roofShape.lineTo(totalLength/2, totalWidth/2);
    roofShape.lineTo(-totalLength/2, totalWidth/2);
    roofShape.lineTo(-totalLength/2, -totalWidth/2);

    // Create a hole in the roof (for the field)
    const holeLength = adjustedLength * 0.7;
    const holeWidth = adjustedWidth * 0.7;
    const hole = new THREE.Path();
    hole.moveTo(-holeLength/2, -holeWidth/2);
    hole.lineTo(holeLength/2, -holeWidth/2);
    hole.lineTo(holeLength/2, holeWidth/2);
    hole.lineTo(-holeLength/2, holeWidth/2);
    hole.lineTo(-holeLength/2, -holeWidth/2);
    roofShape.holes.push(hole);

    // Extrude settings
    const extrudeSettings = {
        steps: 1,
        depth: roofThickness,
        bevelEnabled: false
    };

    // Create transparent roof
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: roofColor,
        transparent: true,
        opacity: roofTransparency,
        side: THREE.DoubleSide
    });

    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = roofHeight;
    roof.rotation.x = Math.PI / 2;
    group.add(roof);

    // Create roof supports with arches
    const supportMaterial = new THREE.MeshPhongMaterial({ color: supportColor });
    const archCount = 12;
    const archThickness = 1;
    
    for (let i = 0; i < archCount; i++) {
        // Calculate position around stadium
        const angle = (i / archCount) * Math.PI * 2;
        const xPos = Math.cos(angle) * (totalLength/2 - standDepth/2);
        const zPos = Math.sin(angle) * (totalWidth/2 - standDepth/2);
        
        // Create arch
        const archHeight = roofHeight;
        const archWidth = 10;
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, archHeight * 1.3, 0),
            new THREE.Vector3(0, archHeight, archWidth)
        );
        
        const points = curve.getPoints(20);
        const archGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const archLine = new THREE.Line(archGeometry, new THREE.LineBasicMaterial({ color: supportColor }));
        
        // Create tubular arch
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, archThickness/2, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeometry, supportMaterial);
        
        // Position and rotate arch
        tubeMesh.position.set(xPos, 0, zPos);
        tubeMesh.lookAt(new THREE.Vector3(0, 0, 0));
        tubeMesh.rotateY(Math.PI/2);
        
        group.add(tubeMesh);
    }
}

function clearRoof(scene) {
    if (roofGroup) {
        scene.remove(roofGroup);
        roofGroup = null;
    }
}

export { createStadiumRoof, clearRoof };