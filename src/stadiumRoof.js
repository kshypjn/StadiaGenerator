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
        stadiumFootprint = { width: 1, length: 1 },
        individualRoofs = false,
        individualRoofSettings = {
            north: { enabled: true, height: null, color: null, transparency: null },
            south: { enabled: true, height: null, color: null, transparency: null },
            east: { enabled: true, height: null, color: null, transparency: null },
            west: { enabled: true, height: null, color: null, transparency: null }
        },
        individualStands = null
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
    const roofThickness = 0.5;

    if (individualRoofs) {
        // Create individual roofs for each stand
        const sides = ['north', 'south', 'east', 'west'];
        sides.forEach(side => {
            const settings = individualRoofSettings[side];
            
            if (settings.enabled) {
                // Calculate height for this stand
                let standHeightValue = standHeight;
                if (individualStands && individualStands[side] && individualStands[side].height !== null) {
                    standHeightValue = individualStands[side].height;
                }
                
                // Use individual settings if provided, otherwise use global settings
                const roofHeightValue = settings.height !== null ? settings.height : standHeightValue + 5;
                const roofColorValue = settings.color !== null ? settings.color : roofColor;
                const roofTransparencyValue = settings.transparency !== null ? settings.transparency : roofTransparency;
                
                createIndividualRoof(roofGroup, {
                    side: side,
                    totalLength: totalLength,
                    totalWidth: totalWidth,
                    roofHeight: roofHeightValue,
                    roofThickness: roofThickness,
                    roofColor: roofColorValue,
                    roofTransparency: roofTransparencyValue,
                    supportColor: supportColor,
                    standDepth: standDepth,
                    adjustedLength: adjustedLength,
                    adjustedWidth: adjustedWidth
                });
            }
        });
    } else {
        // Create a unified roof (using what was formerly the "modern" style)
        const roofHeight = standHeight + 5; // Roof height relative to stand height
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
    }

    scene.add(roofGroup);
    return roofGroup;
}

function createIndividualRoof(group, options) {
    const {
        side,
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

    // Create materials
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: roofColor,
        transparent: true,
        opacity: roofTransparency,
        side: THREE.DoubleSide
    });
    
    const supportMaterial = new THREE.MeshPhongMaterial({ color: supportColor });
    
    // Determine dimensions and position based on side
    let roofWidth, roofLength, xPos, zPos, rotation;
    
    switch(side) {
        case 'north':
            roofWidth = standDepth;
            roofLength = adjustedLength;
            xPos = 0;
            zPos = -adjustedWidth/2 - standDepth/2;
            rotation = Math.PI;
            break;
        case 'south':
            roofWidth = standDepth;
            roofLength = adjustedLength;
            xPos = 0;
            zPos = adjustedWidth/2 + standDepth/2;
            rotation = 0;
            break;
        case 'east':
            roofWidth = standDepth;
            roofLength = adjustedWidth;
            xPos = adjustedLength/2 + standDepth/2;
            zPos = 0;
            rotation = -Math.PI/2;
            break;
        case 'west':
            roofWidth = standDepth;
            roofLength = adjustedWidth;
            xPos = -adjustedLength/2 - standDepth/2;
            zPos = 0;
            rotation = Math.PI/2;
            break;
    }
    
    // Create the roof shape
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-roofLength/2, -roofWidth/2);
    roofShape.lineTo(roofLength/2, -roofWidth/2);
    roofShape.lineTo(roofLength/2, roofWidth/2);
    roofShape.lineTo(-roofLength/2, roofWidth/2);
    roofShape.lineTo(-roofLength/2, -roofWidth/2);
    
    // Extrude settings
    const extrudeSettings = {
        steps: 1,
        depth: roofThickness,
        bevelEnabled: false
    };
    
    // Create the roof
    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    
    // Position and rotate the roof
    if (side === 'east' || side === 'west') {
        // For east/west stands, we need to rotate differently
        roof.position.set(xPos, roofHeight, zPos);
        roof.rotation.x = Math.PI / 2;
        roof.rotation.z = rotation;
    } else {
        // North/south stands keep the original rotation
        roof.position.set(xPos, roofHeight, zPos);
        roof.rotation.x = Math.PI / 2;
        roof.rotation.y = rotation;
    }
    
    group.add(roof);
    
    // Create supports with arches
    const archCount = Math.max(4, Math.floor(roofLength / 15)); // Scale number of arches with length
    const archSpacing = roofLength / (archCount - 1);
    const archThickness = 1;
    
    for (let i = 0; i < archCount; i++) {
        const archPos = -roofLength/2 + i * archSpacing;
        
        // Create arch curve
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, roofHeight * 1.3, 0),
            new THREE.Vector3(0, roofHeight, roofWidth)
        );
        
        // Create tubular arch
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, archThickness/2, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeometry, supportMaterial);
        
        // Position and rotate arch based on stand side
        if (side === 'east' || side === 'west') {
            tubeMesh.position.set(xPos, 0, zPos + archPos);
            tubeMesh.rotation.y = rotation + Math.PI/2;
        } else {
            tubeMesh.position.set(xPos + archPos, 0, zPos);
            tubeMesh.rotation.y = Math.PI/2;
        }
        
        group.add(tubeMesh);
        
        // Add vertical supports
        const supportHeight = roofHeight;
        const supportGeometry = new THREE.CylinderGeometry(archThickness/2, archThickness/2, supportHeight, 8);
        const supportMesh = new THREE.Mesh(supportGeometry, supportMaterial);
        
        // Position the support based on stand side
        if (side === 'east' || side === 'west') {
            supportMesh.position.set(xPos, supportHeight/2, zPos + archPos);
        } else {
            supportMesh.position.set(xPos + archPos, supportHeight/2, zPos);
        }
        
        group.add(supportMesh);
    }
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