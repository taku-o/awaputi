/**
 * GameEngine Mock for Integration Tests
 */

export class GameEngine {
    constructor() {
        this.isRunning = false;
        this.config = {};
        this.eventListeners = new Map();
    }

    start() {
        this.isRunning = true;
        return Promise.resolve();
    }

    stop() {
        this.isRunning = false;
        return Promise.resolve();
    }

    addEventListener(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }

    removeEventListener(event, listener) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    cleanup() {
        this.eventListeners.clear();
        this.isRunning = false;
    }
}