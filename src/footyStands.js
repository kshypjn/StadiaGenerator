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
        standShape = 'rectangular', 
        standGaps = false,
        individualStands = {
            north: { height: null, tiers: null, color: null, seatColor: null },
            south: { height: null, tiers: null, color: null, seatColor: null },
            east: { height: null, tiers: null, color: null, seatColor: null },
            west: { height: null, tiers: null, color: null, seatColor: null }
        },
        premiumTier = {
            enabled: false,
            tier: 1,
            color: 0x333333,
            seatColor: 0xCCCCCC
        },
        bowlShape = 0, // 0-1 controls how rounded the corners are (0=square, 1=circular)
        stadiumFootprint = { width: 1, length: 1 } 
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

    // Apply stadium footprint scaling
    const adjustedLength = fieldLength * stadiumFootprint.length;
    const adjustedWidth = fieldWidth * stadiumFootprint.width;

    // Create shared materials
    const materials = {
        stand: new THREE.MeshPhongMaterial({ color }),
        seat: new THREE.MeshPhongMaterial({ color: seatColor }),
        railing: new THREE.MeshPhongMaterial({ color: 0xffffff }),
        premium: new THREE.MeshPhongMaterial({ color: premiumTier.color }),
        premiumSeat: new THREE.MeshPhongMaterial({ color: premiumTier.seatColor })
    };

    // Create all four sides with individual configurations
    const sides = ['north', 'south', 'east', 'west'];
    sides.forEach(side => {
        // Merge default and individual stand settings
        const standHeight = individualStands[side].height !== null ? individualStands[side].height : height;
        const standTiers = individualStands[side].tiers !== null ? individualStands[side].tiers : tiers;
        const standColor = individualStands[side].color !== null ? individualStands[side].color : color;
        const standSeatColor = individualStands[side].seatColor !== null ? individualStands[side].seatColor : seatColor;

        // Add gaps to certain sections if enabled
        const hasGap = standGaps && (side === 'north' || side === 'south');
        
        const stand = createStandSection(side, {
            height: standHeight,
            tiers: standTiers,
            color: standColor,
            seatColor: standSeatColor,
            tierSpacing,
            fieldLength: adjustedLength,
            fieldWidth: adjustedWidth,
            standDepth,
            premiumTier,
            standShape,
            hasGap,
            materials
        });
        standsGroup.add(stand);
    });

    // Add corner sections based on bowl shape parameter
    if (standShape !== 'asymmetric') {
        createCornerSections(standsGroup, {
            height, 
            tiers, 
            color, 
            seatColor, 
            tierSpacing,
            fieldLength: adjustedLength,
            fieldWidth: adjustedWidth,
            standDepth,
            bowlShape,
            premiumTier,
            materials
        });
    }

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
        standDepth,
        premiumTier,
        standShape,
        hasGap = false,
        materials
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

    // Create stand segments (to allow for gaps if needed)
    const segments = hasGap ? 2 : 1;
    const segmentLength = length / segments;
    const gapWidth = hasGap ? 10 : 0;
    
    for (let segment = 0; segment < segments; segment++) {
        const segmentOffset = segment * segmentLength + (segment * gapWidth) - (hasGap ? (length + gapWidth) / 2 : 0);
        
        // Create each tier with slanted seating
        for (let tier = 0; tier < tiers; tier++) {
            const tierY = tier * tierHeight;
            // Apply different dimensions based on stand shape
            let tierWidth = width;
            let tierLength = segmentLength;
            
            if (standShape === 'curved') {
                tierWidth = width - (tier * tierSpacing * 0.7);
                tierLength = segmentLength - (tier * tierSpacing * 1.4);
            } else {
                tierWidth = width - (tier * tierSpacing);
                tierLength = segmentLength - (tier * tierSpacing * 2);
            }

            // Determine if this is the premium tier
            const isPremiumTier = premiumTier.enabled && tier === premiumTier.tier;
            const currentMaterial = isPremiumTier ? materials.premium : materials.stand;
            const currentSeatMaterial = isPremiumTier ? materials.premiumSeat : materials.seat;

            // Create tier base (concrete structure)
            const baseGeometry = new THREE.BoxGeometry(tierLength, tierHeight * 0.3, tierWidth);
            const base = new THREE.Mesh(baseGeometry, currentMaterial);
            base.position.set(segmentOffset, tierY + tierHeight * 0.15, 0);
            sectionGroup.add(base);

            // Create slanted seating area
            const seatRows = isPremiumTier ? 6 : 10;
            const rowHeight = tierHeight * 0.7 / seatRows;
            const rowDepth = tierWidth / seatRows;

            // Create a single geometry for all seats in a row
            const seatGeometry = new THREE.BoxGeometry(tierLength, rowHeight, rowDepth);
            const backGeometry = new THREE.BoxGeometry(tierLength, rowHeight * 0.5, 0.1);

            for (let row = 0; row < seatRows; row++) {
                const rowY = tierY + tierHeight * 0.3 + row * rowHeight;
                const rowZ = -tierWidth/2 + row * rowDepth;
                
                // Create seat row
                const seat = new THREE.Mesh(seatGeometry, currentSeatMaterial);
                seat.position.set(segmentOffset, rowY, rowZ);
                sectionGroup.add(seat);

                // Create seat back
                const back = new THREE.Mesh(backGeometry, currentSeatMaterial);
                back.position.set(segmentOffset, rowY + rowHeight * 0.25, rowZ + rowDepth/2);
                sectionGroup.add(back);
                
                // Add premium tier embellishments
                if (isPremiumTier) {
                    const dividerCount = 20;
                    const dividerSpacing = tierLength / dividerCount;
                    const dividerGeometry = new THREE.BoxGeometry(0.05, rowHeight, rowDepth);
                    
                    for (let d = 0; d <= dividerCount; d++) {
                        const dividerX = -tierLength/2 + d * dividerSpacing;
                        const divider = new THREE.Mesh(dividerGeometry, materials.premium);
                        divider.position.set(segmentOffset + dividerX, rowY, rowZ);
                        sectionGroup.add(divider);
                    }
                }
            }

            // Create safety railing
            const railingGeometry = new THREE.BoxGeometry(tierLength, 0.1, 0.1);
            const railing = new THREE.Mesh(railingGeometry, materials.railing);
            railing.position.set(segmentOffset, tierY + tierHeight - 0.1, -tierWidth/2 + 0.1);
            sectionGroup.add(railing);

            // Create vertical supports
            const supportSpacing = 10;
            const supportGeometry = new THREE.BoxGeometry(0.2, tierHeight, 0.2);
            for (let x = -tierLength/2; x <= tierLength/2; x += supportSpacing) {
                const support = new THREE.Mesh(supportGeometry, currentMaterial);
                support.position.set(segmentOffset + x, tierY + tierHeight/2, -tierWidth/2);
                sectionGroup.add(support);
            }
        }

        // Add entrance tunnels
        if (!hasGap || segment === 0) {
            const tunnelWidth = 5;
            const tunnelHeight = 3;
            const tunnelGeometry = new THREE.BoxGeometry(tunnelWidth, tunnelHeight, width);
            const tunnel = new THREE.Mesh(tunnelGeometry, materials.stand);
            tunnel.position.set(segmentOffset - segmentLength/4, tunnelHeight/2, 0);
            sectionGroup.add(tunnel);
        }
    }

    sectionGroup.position.copy(position);
    sectionGroup.rotation.y = rotation;
    return sectionGroup;
}

function createCornerSections(group, options) {
    const {
        height,
        tiers,
        color,
        seatColor,
        tierSpacing,
        fieldLength,
        fieldWidth,
        standDepth,
        bowlShape,
        premiumTier,
        materials
    } = options;

    const corners = [
        { pos: { x: fieldLength/2 + standDepth/2, z: fieldWidth/2 + standDepth/2 }, rotation: 0 },
        { pos: { x: -fieldLength/2 - standDepth/2, z: fieldWidth/2 + standDepth/2 }, rotation: Math.PI/2 },
        { pos: { x: -fieldLength/2 - standDepth/2, z: -fieldWidth/2 - standDepth/2 }, rotation: Math.PI },
        { pos: { x: fieldLength/2 + standDepth/2, z: -fieldWidth/2 - standDepth/2 }, rotation: -Math.PI/2 }
    ];

    corners.forEach(corner => {
        // Skip corner sections if bowl shape is 0 (rectangular stadium)
        if (bowlShape === 0) return;
        
        const cornerSize = standDepth * 2 * bowlShape;
        const cornerGroup = new THREE.Group();
        const tierHeight = height / tiers;
        const standMaterial = new THREE.MeshPhongMaterial({ color });
        const seatMaterial = new THREE.MeshPhongMaterial({ color: seatColor });
        const railingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const premiumMaterial = premiumTier.enabled ? 
            new THREE.MeshPhongMaterial({ color: premiumTier.color }) : standMaterial;
        const premiumSeatMaterial = premiumTier.enabled ? 
            new THREE.MeshPhongMaterial({ color: premiumTier.seatColor }) : seatMaterial;

        // Create each tier with slanted seating
        for (let tier = 0; tier < tiers; tier++) {
            const tierY = tier * tierHeight;
            const tierSize = cornerSize - (tier * tierSpacing);
            
            // Determine if this is the premium tier
            const isPremiumTier = premiumTier.enabled && tier === premiumTier.tier;
            const currentMaterial = isPremiumTier ? premiumMaterial : standMaterial;
            const currentSeatMaterial = isPremiumTier ? premiumSeatMaterial : seatMaterial;

            // Create corner base with curved shape
            const cornerSegments = 8; // More segments = smoother curve
            const cornerRadius = tierSize / 2;
            const cornerBaseGeometry = new THREE.CylinderGeometry(
                cornerRadius, cornerRadius, tierHeight * 0.3, cornerSegments, 1, false, 0, Math.PI/2
            );
            const cornerBase = new THREE.Mesh(cornerBaseGeometry, currentMaterial);
            cornerBase.position.y = tierY + tierHeight * 0.15;
            cornerBase.rotation.y = Math.PI;
            cornerGroup.add(cornerBase);

            // Create slanted seating area
            const seatRows = isPremiumTier ? 6 : 10;
            const rowHeight = tierHeight * 0.7 / seatRows;
            const rowStep = cornerRadius / seatRows;
            
            for (let row = 0; row < seatRows; row++) {
                const rowY = tierY + tierHeight * 0.3 + row * rowHeight;
                const rowRadius = cornerRadius - row * rowStep;
                
                // Create curved seat row
                const seatGeometry = new THREE.CylinderGeometry(
                    rowRadius, rowRadius, rowHeight, cornerSegments, 1, false, 0, Math.PI/2
                );
                const seat = new THREE.Mesh(seatGeometry, currentSeatMaterial);
                seat.position.y = rowY;
                seat.rotation.y = Math.PI;
                cornerGroup.add(seat);

                // Create curved seat back
                if (row < seatRows - 1) {
                    const backHeight = isPremiumTier ? rowHeight * 0.8 : rowHeight * 0.5;
                    const backRadius = rowRadius + 0.05;
                    const backGeometry = new THREE.CylinderGeometry(
                        backRadius, backRadius, backHeight, cornerSegments, 1, false, 0, Math.PI/2
                    );
                    const back = new THREE.Mesh(backGeometry, currentSeatMaterial);
                    back.position.y = rowY + rowHeight * 0.5;
                    back.rotation.y = Math.PI;
                    cornerGroup.add(back);
                }
            }

            // Create curved safety railing
            const railingGeometry = new THREE.TorusGeometry(
                cornerRadius, 0.05, 8, cornerSegments, Math.PI/2
            );
            const railing = new THREE.Mesh(railingGeometry, railingMaterial);
            railing.position.y = tierY + tierHeight - 0.1;
            railing.rotation.x = Math.PI/2;
            cornerGroup.add(railing);
        }

        cornerGroup.position.set(corner.pos.x, 0, corner.pos.z);
        cornerGroup.rotation.y = corner.rotation;
        group.add(cornerGroup);
    });
}

function clearStands(scene) {
    if (standsGroup) {
        scene.remove(standsGroup);
        standsGroup = null;
    }
}

export { createStands, clearStands };