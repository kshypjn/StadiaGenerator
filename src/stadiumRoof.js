// src/stadiumRoof.js
import * as THREE from 'three';

let roofGroup = null;

function createStadiumRoof(scene, options = {}) {
    const {
        standHeight = 15,
        fieldLength = 105,
        fieldWidth = 68,
        standDepth = 20,
        roofStyle = 'modern', // 'modern', 'classic', 'partial'
        roofColor = 0xCCCCCC,
        roofTransparency = 0.7,
        supportColor = 0x888888
    } = options;

    // Remove existing roof if any
    clearRoof(scene);

    // Create a group for the roof
    roofGroup = new THREE.Group();
    roofGroup.name = 'roof';

    // Calculate roof dimensions
    const totalLength = fieldLength + (standDepth * 2);
    const totalWidth = fieldWidth + (standDepth * 2);
    const roofHeight = standHeight + 5;
    const roofThickness = 0.5;

    // Create different roof styles
    switch(roofStyle) {
        case 'modern':
            createModernRoof(roofGroup, {
                totalLength, 
                totalWidth, 
                roofHeight, 
                roofThickness, 
                roofColor, 
                roofTransparency,
                supportColor,
                standDepth  // Pass standDepth to createModernRoof
            });
            break;
        case 'classic':
            createClassicRoof(roofGroup, {
                totalLength, 
                totalWidth, 
                roofHeight, 
                roofThickness, 
                roofColor, 
                roofTransparency,
                supportColor
            });
            break;
        case 'partial':
            createPartialRoof(roofGroup, {
                totalLength, 
                totalWidth, 
                roofHeight, 
                roofThickness, 
                roofColor, 
                roofTransparency,
                supportColor
            });
            break;
    }

    scene.add(roofGroup);
    return roofGroup;
}

function createModernRoof(group, options) {
    const {
        totalLength, 
        totalWidth, 
        roofHeight, 
        roofThickness, 
        roofColor, 
        roofTransparency,
        supportColor,
        standDepth = 20  // Add default value here as well
    } = options;

    // Create curved roof
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-totalLength/2, -totalWidth/2);
    roofShape.lineTo(totalLength/2, -totalWidth/2);
    roofShape.lineTo(totalLength/2, totalWidth/2);
    roofShape.lineTo(-totalLength/2, totalWidth/2);
    roofShape.lineTo(-totalLength/2, -totalWidth/2);

    // Create a hole in the roof (for the field)
    const holeLength = totalLength * 0.7;
    const holeWidth = totalWidth * 0.7;
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

    // Create roof supports (modern style with arches)
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

function createClassicRoof(group, options) {
    const {
        totalLength, 
        totalWidth, 
        roofHeight, 
        roofThickness, 
        roofColor, 
        roofTransparency,
        supportColor
    } = options;

    // Create flat angled roof for each side
    const sides = ['north', 'south', 'east', 'west'];
    const roofWidth = 22; // Width of each roof section
    const roofAngle = Math.PI / 12; // Angle of roof

    sides.forEach((side, index) => {
        let length, width, xPos, zPos, rotationY;
        
        switch(side) {
            case 'north':
                length = totalLength;
                width = roofWidth;
                xPos = 0;
                zPos = -totalWidth/2 + width/2;
                rotationY = 0;
                break;
            case 'south':
                length = totalLength;
                width = roofWidth;
                xPos = 0;
                zPos = totalWidth/2 - width/2;
                rotationY = Math.PI;
                break;
            case 'east':
                length = roofWidth;
                width = totalWidth;
                xPos = totalLength/2 - length/2;
                zPos = 0;
                rotationY = -Math.PI/2;
                break;
            case 'west':
                length = roofWidth;
                width = totalWidth;
                xPos = -totalLength/2 + length/2;
                zPos = 0;
                rotationY = Math.PI/2;
                break;
        }

        // Create roof panel
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: roofColor,
            transparent: true,
            opacity: roofTransparency,
            side: THREE.DoubleSide
        });
        
        const roofGeometry = new THREE.PlaneGeometry(length, width);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        
        // Position and rotation
        roof.position.set(xPos, roofHeight, zPos);
        roof.rotation.set(roofAngle, rotationY, 0);
        
        group.add(roof);
        
        // Add supports every 10 units
        const supportCount = Math.ceil(length / 10);
        const supportSpacing = length / supportCount;
        const supportMaterial = new THREE.MeshPhongMaterial({ color: supportColor });
        
        for (let i = 0; i <= supportCount; i++) {
            const localX = -length/2 + i * supportSpacing;
            let supportHeight;
            
            // Calculate height based on position
            if (side === 'north' || side === 'south') {
                supportHeight = roofHeight;
            } else {
                supportHeight = roofHeight;
            }
            
            // Create support beam
            const supportGeometry = new THREE.BoxGeometry(0.5, supportHeight, 0.5);
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            
            // Position support based on side
            let sx, sz;
            switch(side) {
                case 'north':
                    sx = xPos + localX;
                    sz = zPos - width/2;
                    break;
                case 'south':
                    sx = xPos - localX;
                    sz = zPos + width/2;
                    break;
                case 'east':
                    sx = xPos + width/2;
                    sz = zPos + localX; 
                    break;
                case 'west':
                    sx = xPos - width/2;
                    sz = zPos - localX;
                    break;
            }
            
            support.position.set(sx, supportHeight/2, sz);
            group.add(support);
        }
    });
}

function createPartialRoof(group, options) {
    const {
        totalLength, 
        totalWidth, 
        roofHeight, 
        roofThickness, 
        roofColor, 
        roofTransparency,
        supportColor
    } = options;

    // Only cover the main stand (west side)
    const mainStandWidth = totalWidth * 0.8; // 80% of total width
    const roofWidth = 25;
    const roofAngle = Math.PI / 15;
    
    // Create main stand roof (west side)
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: roofColor,
        transparent: true,
        opacity: roofTransparency,
        side: THREE.DoubleSide
    });
    
    const roofGeometry = new THREE.PlaneGeometry(roofWidth, mainStandWidth);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    
    // Position and rotation
    roof.position.set(-totalLength/2 + roofWidth/2, roofHeight, 0);
    roof.rotation.set(roofAngle, Math.PI/2, 0);
    
    group.add(roof);
    
    // Add supports
    const supportCount = 10;
    const supportSpacing = mainStandWidth / supportCount;
    const supportMaterial = new THREE.MeshPhongMaterial({ color: supportColor });
    
    for (let i = 0; i <= supportCount; i++) {
        const zPos = -mainStandWidth/2 + i * supportSpacing;
        
        // Create support beam
        const supportGeometry = new THREE.BoxGeometry(0.8, roofHeight, 0.8);
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(-totalLength/2 + 1, roofHeight/2, zPos);
        
        group.add(support);
        
        // Create diagonal support
        const diagLength = Math.sqrt(Math.pow(roofHeight, 2) + Math.pow(roofWidth, 2));
        const diagGeometry = new THREE.BoxGeometry(diagLength, 0.4, 0.4);
        const diag = new THREE.Mesh(diagGeometry, supportMaterial);
        
        diag.position.set(-totalLength/2 + roofWidth/2, roofHeight/2, zPos);
        diag.rotation.set(0, 0, -roofAngle);
        
        group.add(diag);
    }
    
    // Create smaller east side roof (opposite side)
    const eastRoofWidth = 12;
    const eastRoof = new THREE.Mesh(
        new THREE.PlaneGeometry(eastRoofWidth, mainStandWidth * 0.6),
        roofMaterial
    );
    
    eastRoof.position.set(totalLength/2 - eastRoofWidth/2, roofHeight - 2, 0);
    eastRoof.rotation.set(-roofAngle, -Math.PI/2, 0);
    
    group.add(eastRoof);
    
    // Add some supports for east roof
    const eastSupportCount = 5;
    const eastSupportSpacing = (mainStandWidth * 0.6) / eastSupportCount;
    
    for (let i = 0; i <= eastSupportCount; i++) {
        const zPos = -mainStandWidth*0.3 + i * eastSupportSpacing;
        
        const support = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, roofHeight - 2, 0.6),
            supportMaterial
        );
        support.position.set(totalLength/2 - 1, (roofHeight-2)/2, zPos);
        
        group.add(support);
    }
}

function clearRoof(scene) {
    if (roofGroup) {
        scene.remove(roofGroup);
        roofGroup = null;
    }
}

export { createStadiumRoof, clearRoof };