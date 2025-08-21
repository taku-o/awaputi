/**
 * Global type definitions for BubblePop game
 * Provides common interfaces and types used throughout the application
 */

// Basic geometric types
export interface Position { x: number,
  y: number;
    export interface Size { width: number,
            height: number;
    export interface Dimensions extends Position, Size {};
export interface Rectangle { x: number,
  y: number,
    width: number,
            height: number;
    export interface Color { r: number,
  g: number,
            b: number;
    a?: number;

// Event and callback types
export interface EventListener<T = any> { (event: T): void;
    export interface EventEmitter { addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    dispatchEvent(event: any): boolean;

// Configuration and data management
export interface ConfigurationManager { get<T>(key: string): T | null;
    set<T>(key: string, value: T): void;
    has(key: string): boolean;
    remove(key: string): void;
    clear(): void;
    load(): Promise<void>;
    save(): Promise<void>;
    export interface DataManager<T = any> { data: T;
    load(): Promise<T>;
    save(data: T): Promise<void>;
    clear(): void;
    validate(data: any): boolean;

// Game state types
export interface GameState { isRunning: boolean,
  isPaused: boolean,
    score: number,
    level: number,
            lives: number;
    time?: number;
    export interface PlayerData { name: string,
  highScore: number,
    currentScore: number,
    level: number,
    achievements: string[],
            statistics: Record<string, number> };
// UI and interaction types
export interface UIComponent { element?: HTMLElement,
  visible: boolean,
            enabled: boolean;
    update(deltaTime: number): void;
    render(): void;
    destroy(): void;
    export interface InteractiveElement { containsPoint(x: number, y: number): boolean;
    onClick?(event: MouseEvent): void;
    onHover?(event: MouseEvent): void;
    onMouseDown?(event: MouseEvent): void;
    onMouseUp?(event: MouseEvent): void;
// Resource loading types
export interface ResourceLoader { loaded: boolean,
  progress: number;
    error?: Error;
    load(): Promise<void>;
     };
export interface AudioResource extends ResourceLoader { url: string;
  audio?: HTMLAudioElement;
  volume: number;
  play(): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void };
export interface ImageResource extends ResourceLoader { url: string;
  image?: HTMLImageElement;
  width: number,
            height: number;

// Animation and timing types
export interface Animation { duration: number,
  elapsed: number,
            isComplete: boolean;
    update(deltaTime: number): void;
    reset(): void;
    export interface Tween extends Animation { from: number,
  to: number,
    current: number,
            easing: (t: number) => number  };
}

// Utility types
export type Optional<T> = T | null | undefined;

export type Partial<T> = { [P in keyof T]?: T[P];;

export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];;

export type Constructor<T = {}> = new (...args: any[]) => T,

export type Mixin<T extends Constructor> = InstanceType<T>;

// Math and physics types
export interface Vector2 { x: number,
  y: number;
    export interface Vector3 extends Vector2 { z: number;
    export interface Transform { position: Vector2,
  rotation: number,
            scale: Vector2;

// Global constants type definitions
declare global { const __DEV__: boolean;
    const, __PROD__: boolean;
    const __VERSION__: string;
    const __BUILD_TIME__: string;
    const __ANALYTICS_ID__: string;
    const __SENTRY_DSN__: string;

// DOM extensions
declare global { interface Window {
    BubblePopGame?: any,
    DEBUG?: boolean,
    GAME_CONFIG?: any;
};
// Canvas and WebGL types
export interface CanvasContext { canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
    width: number,
    height: number,
            devicePixelRatio: number;
    export interface RenderOptions { alpha?: boolean,
  antialias?: boolean;
    preserveDrawingBuffer?: boolean;
    premultipliedAlpha?: boolean;

// Storage and persistence
export interface StorageAdapter { getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    length: number;
    key(index: number): string | null };
// Internationalization
export interface I18nResource { locale: string,
  namespace: string,
            resources: Record<string, string | Record<string, string>> };
export interface I18nManager { currentLocale: string,
  supportedLocales: string[];
  translate(key: string, params?: Record<string, any>): string;
  setLocale(locale: string): Promise<void>;
  addResource(resource: I18nResource): void;