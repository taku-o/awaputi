/**
 * GameEngine Mock for Integration Tests
 */

interface EventListener {
    (event: any80: void;
}

export class GameEngine {
    isRunning: boolean;
    config: Record<string, any>;
    eventListeners: Map<string, EventListener[]>;

    constructor() {
        this.isRunning = false;
        this.config = {};
        this.eventListeners = new Map();
    }

    start(): Promise<void> {
        this.isRunning = true;
        return Promise.resolve();
    }

    stop(): Promise<void> {
        this.isRunning = false;
        return Promise.resolve();
    }

    addEventListener(event: string, listener: EventListener): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(listener);
    }

    removeEventListener(event: string, listener: EventListener): void {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event)!;
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    cleanup(): void {
        this.eventListeners.clear();
        this.isRunning = false;
    }
}