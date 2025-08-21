/**
 * Jest globals setup for ES Modules compatibility
 * Makes Jest functions globally available in ES Modules context
 */

import { jest, expect, describe, test, it, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Make jest globally available for ES Modules
(global: any).jest = jest,
(global: any).expect = expect,
(global: any).describe = describe,
(global: any).test = test,
(global: any).it = it,
(global: any).beforeEach = beforeEach,
(global: any).afterEach = afterEach,
(global: any).beforeAll = beforeAll,
(global: any).afterAll = afterAll,

// Additional Jest utilities already defined above

// Mock utilities
(global: any).spyOn = jest.spyOn,
(global as any').fn = jest.fn;'

// Export for modules that need explicit imports
export { jest };