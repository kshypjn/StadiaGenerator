// src/footyStands.js
import * as THREE from 'three';

let standsGroup = null;

function createStands(scene, options = {}) {
    const {
        height = 15,
        tiers = 3,
        color = 0x1a1a1a,
        seatColor = 0x808080,
        tierSpacing = 1.5,
        individualStands = {
            north: { height: null, tiers: null, color: null, seatColor: null },
            south: { height: null, tiers: null, color: null, seatColor: null },
            east: { height: null, tiers: null, color: null, seatColor: null },
            west: { height: null, tiers: null, color: null, seatColor: null }
        },
       
    } = options;


    clearStands(scene);

    standsGroup = new THREE.Group();
    standsGroup.name = 'stands';

    const standDepth = 20;
    const fieldLength = 105;
    const fieldWidth = 68;

    const materials = {
        stand: new THREE.MeshPhongMaterial({ color }),
        seat: new THREE.MeshPhongMaterial({ color: seatColor }),
        railing: new THREE.MeshPhongMaterial({ color: 0xffffff }),
       
    };

    const sides = ['north', 'south', 'east', 'west'];
    sides.forEach(side => {
        const standHeight = individualStands[side].height !== null ? individualStands[side].height : height;
        const standTiers = individualStands[side].tiers !== null ? individualStands[side].tiers : tiers;
        const standColor = individualStands[side].color !== null ? individualStands[side].color : color;
        const standSeatColor = individualStands[side].seatColor !== null ? individualStands[side].seatColor : seatColor;

        const stand = createStandSection(side, {
            height: standHeight,
            tiers: standTiers,
            color: standColor,
            seatColor: standSeatColor,
            tierSpacing,
            standDepth,
            materials,
            fieldWidth,
            fieldLength
        });
        standsGroup.add(stand);
    });

    scene.add(standsGroup);
}

function createStandSection(side, options) {
    const {
        height,
        tiers,
        color,
        seatColor,
        tierSpacing,
        standDepth,
        materials,
        fieldWidth,
        fieldLength
    } = options;

    const sectionGroup = new THREE.Group();
    const tierHeight = height / tiers;

    // Calculate position and rotation based on side
    let position = new THREE.Vector3();
    let rotation = 0;
    let length, width;

    switch (side) {
        case 'north':
            position.set(0, 0, -fieldWidth/2 - standDepth/2);
            rotation = Math.PI;
            length = fieldLength;
            width = standDepth;
            break;
        case 'south':
            position.set(0, 0, fieldWidth/2 + standDepth/2);
            rotation = 0;
            length = fieldLength;
            width = standDepth;
            break;
        case 'east':
            position.set(fieldLength/2 + standDepth/2, 0, 0);
            rotation = Math.PI/2;
            length = fieldWidth;
            width = standDepth;
            break;
        case 'west':
            position.set(-fieldLength/2 - standDepth/2, 0, 0);
            rotation = -Math.PI/2;
            length = fieldWidth;
            width = standDepth;
            break;
    }


    const segments = 1;
    const segmentLength = length / segments;
    
    for (let segment = 0; segment < segments; segment++) {
        const segmentOffset = segment * segmentLength;
        

        for (let tier = 0; tier < tiers; tier++) {
            const tierY = tier * tierHeight;
            const tierWidth = width - (tier * tierSpacing);
            const tierLength = segmentLength - (tier * tierSpacing * 2);

            const baseGeometry = new THREE.BoxGeometry(tierLength, tierHeight * 0.3, tierWidth);
            const base = new THREE.Mesh(baseGeometry, materials.stand);
            base.position.set(segmentOffset, tierY + tierHeight * 0.15, 0);
            sectionGroup.add(base);

            // Create slanted seating area
            const seatRows = 10;
            const rowHeight = tierHeight * 0.7 / seatRows;
            const rowDepth = tierWidth / seatRows;

            const seatGeometry = new THREE.BoxGeometry(tierLength, rowHeight, rowDepth);
            const backGeometry = new THREE.BoxGeometry(tierLength, rowHeight * 0.5, 0.1);

            for (let row = 0; row < seatRows; row++) {
                const rowY = tierY + tierHeight * 0.3 + row * rowHeight;
                const rowZ = -tierWidth/2 + row * rowDepth;
                
                const seat = new THREE.Mesh(seatGeometry, materials.seat);
                seat.position.set(segmentOffset, rowY, rowZ);
                sectionGroup.add(seat);

                const back = new THREE.Mesh(backGeometry, materials.seat);
                back.position.set(segmentOffset, rowY + rowHeight * 0.25, rowZ + rowDepth/2);
                sectionGroup.add(back);
                
            }

            const railingGeometry = new THREE.BoxGeometry(tierLength, 0.1, 0.1);
            const railing = new THREE.Mesh(railingGeometry, materials.railing);
            railing.position.set(segmentOffset, tierY + tierHeight - 0.1, -tierWidth/2 + 0.1);
            sectionGroup.add(railing);

            const supportSpacing = 10;
            const supportGeometry = new THREE.BoxGeometry(0.2, tierHeight, 0.2);
            for (let x = -tierLength/2; x <= tierLength/2; x += supportSpacing) {
                const support = new THREE.Mesh(supportGeometry, materials.stand);
                support.position.set(segmentOffset + x, tierY + tierHeight/2, -tierWidth/2);
                sectionGroup.add(support);
            }
        }

        
    }

    sectionGroup.position.copy(position);
    sectionGroup.rotation.y = rotation;
    return sectionGroup;
}

function clearStands(scene) {
    if (standsGroup) {
        scene.remove(standsGroup);
        standsGroup = null;
    }
}

export { createStands, clearStands };