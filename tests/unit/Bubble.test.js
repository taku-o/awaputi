/**
 * Unit tests for Bubble class
 */

import { Bubble } from '../../src/bubbles/Bubble.js';

describe('Bubble', () => {
  let bubble;
  const mockPosition = { x: 100, y: 100 };

  beforeEach(() => {
    bubble = new Bubble('normal', mockPosition);
  });

  describe('Constructor', () => {
    test('should create bubble with correct initial properties', () => {
      expect(bubble.type).toBe('normal');
      expect(bubble.position).toEqual(mockPosition);
      expect(bubble.position).not.toBe(mockPosition); // Should be a copy
      expect(bubble.velocity).toEqual({ x: 0, y: 0 });
      expect(bubble.isAlive).toBe(true);
      expect(bubble.age).toBe(0);
      expect(bubble.health).toBe(1);
      expect(bubble.size).toBe(50);
    });

    test('should apply type-specific configuration', () => {
      const stoneBubble = new Bubble('stone', mockPosition);
      expect(stoneBubble.health).toBe(2);
      expect(stoneBubble.size).toBe(55);

      const bossBubble = new Bubble('boss', mockPosition);
      expect(bossBubble.health).toBe(10);
      expect(bossBubble.size).toBe(100);
    });
  });

  describe('Type Configuration', () => {
    test('should return correct config for normal bubble', () => {
      const config = bubble.getTypeConfig();
      expect(config.health).toBe(1);
      expect(config.color).toBe('#87CEEB');
      expect(config.score).toBe(10);
    });

    test('should return correct config for special bubbles', () => {
      const pinkBubble = new Bubble('pink', mockPosition);
      const config = pinkBubble.getTypeConfig();
      expect(config.healAmount).toBe(20);
      expect(config.color).toBe('#FFB6C1');
    });

    test('should fallback to normal config for unknown type', () => {
      const unknownBubble = new Bubble('unknown', mockPosition);
      const config = unknownBubble.getTypeConfig();
      expect(config.health).toBe(1);
      expect(config.color).toBe('#87CEEB');
    });
  });

  describe('Update', () => {
    test('should increase age over time', () => {
      const deltaTime = 1000; // 1 second
      bubble.update(deltaTime);
      expect(bubble.age).toBe(1000);
    });

    test('should update position based on velocity', () => {
      bubble.velocity = { x: 100, y: 50 }; // pixels per second
      const deltaTime = 1000; // 1 second
      bubble.update(deltaTime);
      
      expect(bubble.position.x).toBe(200); // 100 + 100
      expect(bubble.position.y).toBe(150); // 100 + 50
    });

    test('should burst when max age is reached', () => {
      bubble.age = bubble.maxAge - 100;
      bubble.update(200); // This should exceed maxAge
      expect(bubble.isAlive).toBe(false);
    });

    test('should not update if not alive', () => {
      bubble.isAlive = false;
      const initialAge = bubble.age;
      bubble.update(1000);
      expect(bubble.age).toBe(initialAge);
    });
  });

  describe('Escaping Behavior', () => {
    test('should move away from mouse when close', () => {
      const escapingBubble = new Bubble('escaping', { x: 100, y: 100 });
      const mousePosition = { x: 120, y: 120 }; // Close to bubble
      
      escapingBubble.update(1000, mousePosition);
      
      // Should have velocity pointing away from mouse
      expect(escapingBubble.velocity.x).toBeLessThan(0); // Moving left (away from mouse)
      expect(escapingBubble.velocity.y).toBeLessThan(0); // Moving up (away from mouse)
    });

    test('should slow down when far from mouse', () => {
      const escapingBubble = new Bubble('escaping', { x: 100, y: 100 });
      escapingBubble.velocity = { x: 100, y: 100 };
      const mousePosition = { x: 500, y: 500 }; // Far from bubble
      
      escapingBubble.update(1000, mousePosition);
      
      // Velocity should be reduced
      expect(Math.abs(escapingBubble.velocity.x)).toBeLessThan(100);
      expect(Math.abs(escapingBubble.velocity.y)).toBeLessThan(100);
    });
  });

  describe('Boundary Collision', () => {
    test('should bounce off left boundary', () => {
      bubble.position.x = 10; // Near left edge
      bubble.velocity.x = -50; // Moving left
      bubble.handleBoundaryCollision();
      
      expect(bubble.position.x).toBeGreaterThanOrEqual(25); // Should be pushed away from edge
      expect(bubble.velocity.x).toBeGreaterThan(0); // Should bounce right
    });

    test('should bounce off right boundary', () => {
      bubble.position.x = 790; // Near right edge (canvas width 800)
      bubble.velocity.x = 50; // Moving right
      bubble.handleBoundaryCollision();
      
      expect(bubble.position.x).toBeLessThanOrEqual(775); // Should be pushed away from edge
      expect(bubble.velocity.x).toBeLessThan(0); // Should bounce left
    });

    test('should apply dampening on bounce', () => {
      bubble.position.x = 10;
      bubble.velocity.x = -100;
      bubble.handleBoundaryCollision();
      
      // Velocity should be reduced due to dampening (0.7 factor)
      expect(Math.abs(bubble.velocity.x)).toBeLessThan(100);
    });

    test('should stop if velocity becomes too small', () => {
      bubble.position.x = 10;
      bubble.velocity.x = -5; // Small velocity
      bubble.handleBoundaryCollision();
      
      expect(bubble.velocity.x).toBe(0); // Should stop
    });
  });

  describe('Damage and Destruction', () => {
    test('should take damage and reduce health', () => {
      const stoneBubble = new Bubble('stone', mockPosition); // Health = 2
      const destroyed = stoneBubble.takeDamage(1);
      
      expect(stoneBubble.health).toBe(1);
      expect(stoneBubble.clickCount).toBe(1);
      expect(destroyed).toBe(false);
    });

    test('should be destroyed when health reaches zero', () => {
      const destroyed = bubble.takeDamage(1);
      
      expect(bubble.health).toBe(0);
      expect(bubble.isAlive).toBe(false);
      expect(destroyed).toBe(true);
    });

    test('should trigger special effects when destroyed', () => {
      const pinkBubble = new Bubble('pink', mockPosition);
      pinkBubble.destroy();
      
      const effects = pinkBubble.getAndClearEffects();
      expect(effects).toHaveLength(1);
      expect(effects[0].type).toBe('heal');
      expect(effects[0].amount).toBe(20);
    });

    test('should not trigger effects when bursting naturally', () => {
      bubble.burst();
      
      expect(bubble.isAlive).toBe(false);
      const effects = bubble.getAndClearEffects();
      expect(effects).toHaveLength(0);
    });
  });

  describe('Special Effects', () => {
    test('should create heal effect for pink bubble', () => {
      const pinkBubble = new Bubble('pink', mockPosition);
      pinkBubble.triggerSpecialEffect();
      
      const effects = pinkBubble.getAndClearEffects();
      expect(effects[0]).toEqual({
        type: 'heal',
        amount: 20
      });
    });

    test('should create damage effect for poison bubble', () => {
      const poisonBubble = new Bubble('poison', mockPosition);
      poisonBubble.triggerSpecialEffect();
      
      const effects = poisonBubble.getAndClearEffects();
      expect(effects[0]).toEqual({
        type: 'damage',
        amount: 10
      });
    });

    test('should create chain destroy effect for spiky bubble', () => {
      const spikyBubble = new Bubble('spiky', mockPosition);
      spikyBubble.triggerSpecialEffect();
      
      const effects = spikyBubble.getAndClearEffects();
      expect(effects[0].type).toBe('chain_destroy');
      expect(effects[0].position).toEqual(mockPosition);
      expect(effects[0].radius).toBe(150);
    });

    test('should create bonus time effect for rainbow bubble', () => {
      const rainbowBubble = new Bubble('rainbow', mockPosition);
      rainbowBubble.triggerSpecialEffect();
      
      const effects = rainbowBubble.getAndClearEffects();
      expect(effects[0]).toEqual({
        type: 'bonus_time',
        duration: 10000
      });
    });

    test('should create screen shake effect for electric bubble', () => {
      const electricBubble = new Bubble('electric', mockPosition);
      electricBubble.triggerSpecialEffect();
      
      const effects = electricBubble.getAndClearEffects();
      expect(effects[0]).toEqual({
        type: 'screen_shake',
        intensity: 20,
        duration: 2000
      });
    });
  });

  describe('Collision Detection', () => {
    test('should detect point inside bubble', () => {
      expect(bubble.containsPoint(100, 100)).toBe(true); // Center
      expect(bubble.containsPoint(120, 120)).toBe(true); // Within radius
    });

    test('should detect point outside bubble', () => {
      expect(bubble.containsPoint(200, 200)).toBe(false); // Far away
      expect(bubble.containsPoint(100, 200)).toBe(false); // Outside radius
    });

    test('should handle edge cases', () => {
      // Exactly on the edge (distance = radius)
      expect(bubble.containsPoint(150, 100)).toBe(true); // 50 pixels away horizontally
    });
  });

  describe('Score Calculation', () => {
    test('should return base score for normal bubble', () => {
      expect(bubble.getScore()).toBe(10);
    });

    test('should apply age bonus for early destruction', () => {
      bubble.age = bubble.maxAge * 0.05; // Very young (5% of max age)
      expect(bubble.getScore()).toBe(20); // 2x bonus
    });

    test('should apply age bonus for late destruction', () => {
      bubble.age = bubble.maxAge * 0.95; // Very old (95% of max age)
      expect(bubble.getScore()).toBe(30); // 3x bonus
    });

    test('should return base score for middle age', () => {
      bubble.age = bubble.maxAge * 0.5; // Middle age
      expect(bubble.getScore()).toBe(10); // No bonus
    });
  });

  describe('Rendering', () => {
    test('should not render if not alive', () => {
      const mockContext = {
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillText: jest.fn()
      };

      bubble.isAlive = false;
      bubble.render(mockContext);

      expect(mockContext.save).not.toHaveBeenCalled();
    });

    test('should render basic bubble when alive', () => {
      const mockContext = {
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        fillText: jest.fn(),
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        }))
      };

      bubble.render(mockContext);

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalledWith(100, 100, 50, 0, Math.PI * 2);
      expect(mockContext.restore).toHaveBeenCalled();
    });
  });

  describe('Effects Management', () => {
    test('should clear effects after getting them', () => {
      const pinkBubble = new Bubble('pink', mockPosition);
      pinkBubble.triggerSpecialEffect();
      
      const effects1 = pinkBubble.getAndClearEffects();
      const effects2 = pinkBubble.getAndClearEffects();
      
      expect(effects1).toHaveLength(1);
      expect(effects2).toHaveLength(0);
    });

    test('should accumulate multiple effects', () => {
      bubble.effects.push({ type: 'test1' });
      bubble.effects.push({ type: 'test2' });
      
      const effects = bubble.getAndClearEffects();
      expect(effects).toHaveLength(2);
      expect(effects[0].type).toBe('test1');
      expect(effects[1].type).toBe('test2');
    });
  });
});