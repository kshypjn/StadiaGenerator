import * as THREE from 'three';

let standsGroup = null;

function createStands(scene, options = {}) {
    const {
        height = 15,
        tiers = 3,
        color = 0x1a1a1a,
        seatColor = 0x808080,
        tierSpacing = 1.5
    } = options;

    // Remove existing stands if any
    clearStands(scene);

    // Create a group for all stands
    standsGroup = new THREE.Group();
    standsGroup.name = 'stands';

    // Field dimensions
    const fieldLength = 105;
    const fieldWidth = 68;
    const standDepth = 20;

    // Create all four sides
    const sides = ['north', 'south', 'east', 'west'];
    sides.forEach(side => {
        const stand = createStandSection(side, {
            height,
            tiers,
            color,
            seatColor,
            tierSpacing,
            fieldLength,
            fieldWidth,
            standDepth
        });
        standsGroup.add(stand);
    });

    // Add corner sections
    const corners = [
        { side1: 'north', side2: 'east', rotation: 0 },
        { side1: 'east', side2: 'south', rotation: Math.PI/2 },
        { side1: 'south', side2: 'west', rotation: Math.PI },
        { side1: 'west', side2: 'north', rotation: -Math.PI/2 }
    ];

    corners.forEach(corner => {
        const cornerStand = createCornerSection(corner.side1, corner.side2, {
            height,
            tiers,
            color,
            seatColor,
            tierSpacing,
            fieldLength,
            fieldWidth,
            standDepth
        });
        cornerStand.rotation.y = corner.rotation;
        standsGroup.add(cornerStand);
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
        fieldLength,
        fieldWidth,
        standDepth
    } = options;

    const sectionGroup = new THREE.Group();
    const tierHeight = height / tiers;
    const standMaterial = new THREE.MeshPhongMaterial({ color });
    const seatMaterial = new THREE.MeshPhongMaterial({ color: seatColor });
    const railingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    // Calculate position and rotation based on side
    let position = new THREE.Vector3();
    let rotation = 0;
    let length, width;

    switch (side) {
        case 'north':
            position.set(0, 0, -fieldWidth/2 - standDepth/2);
            rotation = 0;
            length = fieldLength;
            width = standDepth;
            break;
        case 'south':
            position.set(0, 0, fieldWidth/2 + standDepth/2);
            rotation = Math.PI;
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

    // Create each tier with slanted seating
    for (let tier = 0; tier < tiers; tier++) {
        const tierY = tier * tierHeight;
        const tierWidth = width - (tier * tierSpacing);
        const tierLength = length - (tier * tierSpacing * 2);

        // Create tier base (concrete structure)
        const baseGeometry = new THREE.BoxGeometry(tierLength, tierHeight * 0.3, tierWidth);
        const base = new THREE.Mesh(baseGeometry, standMaterial);
        base.position.y = tierY + tierHeight * 0.15;
        sectionGroup.add(base);

        // Create slanted seating area
        const seatRows = 10; // Number of rows in each tier
        const rowHeight = tierHeight * 0.7 / seatRows;
        const rowDepth = tierWidth / seatRows;

        for (let row = 0; row < seatRows; row++) {
            const rowY = tierY + tierHeight * 0.3 + row * rowHeight;
            const rowZ = -tierWidth/2 + row * rowDepth;
            
            // Create seat row
            const seatGeometry = new THREE.BoxGeometry(tierLength, rowHeight, rowDepth);
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);
            seat.position.set(0, rowY, rowZ);
            sectionGroup.add(seat);

            // Create seat back
            const backGeometry = new THREE.BoxGeometry(tierLength, rowHeight * 0.5, 0.1);
            const back = new THREE.Mesh(backGeometry, seatMaterial);
            back.position.set(0, rowY + rowHeight * 0.25, rowZ + rowDepth/2);
            sectionGroup.add(back);
        }

        // Create safety railing
        const railingGeometry = new THREE.BoxGeometry(tierLength, 0.1, 0.1);
        const railing = new THREE.Mesh(railingGeometry, railingMaterial);
        railing.position.y = tierY + tierHeight - 0.1;
        railing.position.z = -tierWidth/2 + 0.1;
        sectionGroup.add(railing);

        // Create vertical supports
        const supportSpacing = 10;
        for (let x = -tierLength/2; x <= tierLength/2; x += supportSpacing) {
            const supportGeometry = new THREE.BoxGeometry(0.2, tierHeight, 0.2);
            const support = new THREE.Mesh(supportGeometry, standMaterial);
            support.position.set(x, tierY + tierHeight/2, -tierWidth/2);
            sectionGroup.add(support);
        }
    }

    // Add entrance tunnels
    const tunnelWidth = 5;
    const tunnelHeight = 3;
    const tunnelSpacing = 20;
    for (let x = -length/2 + tunnelWidth; x < length/2; x += tunnelSpacing) {
        const tunnelGeometry = new THREE.BoxGeometry(tunnelWidth, tunnelHeight, width);
        const tunnel = new THREE.Mesh(tunnelGeometry, standMaterial);
        tunnel.position.set(x, tunnelHeight/2, 0);
        sectionGroup.add(tunnel);
    }

    sectionGroup.position.copy(position);
    sectionGroup.rotation.y = rotation;
    return sectionGroup;
}

function createCornerSection(side1, side2, options) {
    const {
        height,
        tiers,
        color,
        seatColor,
        tierSpacing,
        fieldLength,
        fieldWidth,
        standDepth
    } = options;

    const cornerGroup = new THREE.Group();
    const tierHeight = height / tiers;
    const standMaterial = new THREE.MeshPhongMaterial({ color });
    const seatMaterial = new THREE.MeshPhongMaterial({ color: seatColor });
    const railingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    // Calculate corner position
    const cornerX = fieldLength/2 + standDepth/2;
    const cornerZ = fieldWidth/2 + standDepth/2;

    // Create each tier with slanted seating
    for (let tier = 0; tier < tiers; tier++) {
        const tierY = tier * tierHeight;
        const tierWidth = standDepth - (tier * tierSpacing);
        const tierLength = standDepth - (tier * tierSpacing);

        // Create tier base
        const baseGeometry = new THREE.BoxGeometry(tierLength, tierHeight * 0.3, tierWidth);
        const base = new THREE.Mesh(baseGeometry, standMaterial);
        base.position.y = tierY + tierHeight * 0.15;
        cornerGroup.add(base);

        // Create slanted seating area
        const seatRows = 10;
        const rowHeight = tierHeight * 0.7 / seatRows;
        const rowDepth = tierWidth / seatRows;

        for (let row = 0; row < seatRows; row++) {
            const rowY = tierY + tierHeight * 0.3 + row * rowHeight;
            const rowZ = -tierWidth/2 + row * rowDepth;
            
            // Create seat row
            const seatGeometry = new THREE.BoxGeometry(tierLength, rowHeight, rowDepth);
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);
            seat.position.set(0, rowY, rowZ);
            cornerGroup.add(seat);

            // Create seat back
            const backGeometry = new THREE.BoxGeometry(tierLength, rowHeight * 0.5, 0.1);
            const back = new THREE.Mesh(backGeometry, seatMaterial);
            back.position.set(0, rowY + rowHeight * 0.25, rowZ + rowDepth/2);
            cornerGroup.add(back);
        }

        // Create corner railing
        const railingGeometry = new THREE.BoxGeometry(tierLength, 0.1, 0.1);
        const railing = new THREE.Mesh(railingGeometry, railingMaterial);
        railing.position.y = tierY + tierHeight - 0.1;
        railing.position.z = -tierWidth/2 + 0.1;
        cornerGroup.add(railing);

        // Create corner supports
        const supportGeometry = new THREE.BoxGeometry(0.2, tierHeight, 0.2);
        const support = new THREE.Mesh(supportGeometry, standMaterial);
        support.position.set(0, tierY + tierHeight/2, -tierWidth/2);
        cornerGroup.add(support);
    }

    // Position the corner section
    cornerGroup.position.set(cornerX, 0, cornerZ);
    return cornerGroup;
}

function clearStands(scene) {
    if (standsGroup) {
        scene.remove(standsGroup);
        standsGroup = null;
    }
}

export { createStands, clearStands };
