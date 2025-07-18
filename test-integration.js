/**
 * Integration test for task 29 implementation
 */

import { Bubble } from './src/bubbles/Bubble.js';
import { BubbleManager } from './src/managers/BubbleManager.js';

// Mock canvas and game engine
const mockCanvas = {
    width: 800,
    height: 600,
    getContext: () => ({
        save: () => {},
        restore: () => {},
        fillRect: () => {},
        fillText: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        createRadialGradient: () => ({
            addColorStop: () => {}
        }),
        createLinearGradient: () => ({
            addColorStop: () => {}
        })
    })
};

const mockGameEngine = {
    canvas: mockCanvas,
    context: mockCanvas.getContext(),
    playerData: {
        currentHP: 100,
        maxHP: 100,
        takeDamage: (amount) => {
            console.log(`Player took ${amount} damage`);
            return false;
        },
        heal: (amount) => {
            console.log(`Player healed ${amount} HP`);
        }
    },
    scoreManager: {
        updateCombo: () => {},
        addScore: (score) => {
            console.log(`Score added: ${score}`);
        }
    },
    createExplosion: (x, y, type, size, intensity) => {
        console.log(`Explosion created at (${x}, ${y}) for ${type} bubble`);
    },
    returnBubbleToPool: () => {},
    activateScoreMultiplier: (multiplier, duration) => {
        console.log(`Score multiplier activated: ${multiplier}x for ${duration}ms`);
    },
    activateNextScoreMultiplier: (multiplier, duration) => {
        console.log(`Next score multiplier activated: ${multiplier}x for ${duration}ms`);
    }
};

console.log('Integration Test: New Bubble Types with BubbleManager');

// Test BubbleManager with new bubble types
const bubbleManager = new BubbleManager(mockGameEngine);

// Test spawning new bubble types
const newBubbleTypes = ['golden', 'frozen', 'magnetic', 'explosive', 'phantom', 'multiplier'];

console.log('\n1. Testing bubble spawning...');
newBubbleTypes.forEach(type => {
    const bubble = bubbleManager.spawnBubble(type, { x: 100, y: 100 });
    if (bubble) {
        console.log(`✓ ${type} bubble spawned successfully`);
    } else {
        console.log(`✗ Failed to spawn ${type} bubble`);
    }
});

console.log(`\nTotal bubbles spawned: ${bubbleManager.getBubbleCount()}`);

console.log('\n2. Testing bubble effects...');

// Test golden bubble effect
const goldenBubble = bubbleManager.spawnBubble('golden', { x: 200, y: 200 });
if (goldenBubble) {
    console.log('Testing golden bubble pop...');
    bubbleManager.popBubble(goldenBubble, 200, 200);
}

// Test frozen bubble effect
const frozenBubble = bubbleManager.spawnBubble('frozen', { x: 300, y: 300 });
if (frozenBubble) {
    console.log('Testing frozen bubble pop...');
    bubbleManager.popBubble(frozenBubble, 300, 300);
}

// Test magnetic bubble effect
const magneticBubble = bubbleManager.spawnBubble('magnetic', { x: 400, y: 400 });
if (magneticBubble) {
    console.log('Testing magnetic bubble pop...');
    bubbleManager.popBubble(magneticBubble, 400, 400);
}

// Test explosive bubble effect
const explosiveBubble = bubbleManager.spawnBubble('explosive', { x: 500, y: 500 });
if (explosiveBubble) {
    console.log('Testing explosive bubble pop...');
    bubbleManager.popBubble(explosiveBubble, 500, 500);
}

// Test phantom bubble effect (should have chance to phase through)
const phantomBubble = bubbleManager.spawnBubble('phantom', { x: 600, y: 600 });
if (phantomBubble) {
    console.log('Testing phantom bubble pop (may phase through)...');
    const result = bubbleManager.popBubble(phantomBubble, 600, 600);
    console.log(`Phantom bubble pop result: ${result ? 'popped' : 'phased through'}`);
}

// Test multiplier bubble effect
const multiplierBubble = bubbleManager.spawnBubble('multiplier', { x: 700, y: 700 });
if (multiplierBubble) {
    console.log('Testing multiplier bubble pop...');
    bubbleManager.popBubble(multiplierBubble, 700, 700);
}

console.log('\n3. Testing special spawn rates...');

// Test special spawn rates
bubbleManager.setSpecialSpawnRate('golden', 0.5);
bubbleManager.setSpecialSpawnRate('phantom', 0.3);

console.log('Spawning 10 bubbles with special rates...');
const spawnedTypes = {};
for (let i = 0; i < 10; i++) {
    const bubble = bubbleManager.spawnBubble();
    if (bubble) {
        spawnedTypes[bubble.type] = (spawnedTypes[bubble.type] || 0) + 1;
    }
}

console.log('Spawned bubble types:', spawnedTypes);

console.log('\n4. Testing bubble update with special effects...');

// Create bubbles with special effects
const testBubbles = [
    bubbleManager.spawnBubble('frozen', { x: 100, y: 100 }),
    bubbleManager.spawnBubble('magnetic', { x: 200, y: 200 }),
    bubbleManager.spawnBubble('escaping', { x: 300, y: 300 })
];

// Update bubbles
bubbleManager.updateMousePosition(150, 150);
bubbleManager.update(16.67); // ~60fps

console.log('✓ Bubble update completed successfully');

console.log('\n5. Testing bubble rendering...');

// Test rendering (mock context)
bubbleManager.render(mockGameEngine.context);
console.log('✓ Bubble rendering completed successfully');

console.log('\nIntegration test completed successfully!');
console.log(`Final bubble count: ${bubbleManager.getBubbleCount()}`);

// Clean up
bubbleManager.clearAllBubbles();
console.log('✓ Cleanup completed');