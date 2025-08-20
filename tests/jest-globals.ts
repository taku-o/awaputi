/**
 * Jest globals setup for ES Modules compatibility
 * Makes Jest functions globally available in ES Modules context
 */

import { jest, expect, describe, test, it, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Make jest globally available for ES Modules
(global as any).jest = jest;
(global as any).expect = expect;
(global as any).describe = describe;
(global as any).test = test;
(global as any).it = it;
(global as any).beforeEach = beforeEach;
(global as any).afterEach = afterEach;
(global as any).beforeAll = beforeAll;
(global as any).afterAll = afterAll;

// Additional Jest utilities already defined above

// Mock utilities
(global as any).spyOn = jest.spyOn;
(global as any').fn = jest.fn;

// Export for modules that need explicit imports
export { jest };