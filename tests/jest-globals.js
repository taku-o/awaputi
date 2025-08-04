/**
 * Jest globals setup for ES Modules compatibility
 * Makes Jest functions globally available in ES Modules context
 */

import { jest } from '@jest/globals';

// Make jest globally available for ES Modules
global.jest = jest;
global.expect = expect;
global.describe = describe;
global.test = test;
global.it = it;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;

// Additional Jest utilities
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;

// Mock utilities
global.spyOn = jest.spyOn;
global.fn = jest.fn;

// Export for modules that need explicit imports
export { jest };