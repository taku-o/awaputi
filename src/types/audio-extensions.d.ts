// Extended type definitions for audio system components

interface AudioSettingsManager {
    initializeSettings(): void;
    addChangeListener(callback: (event: SettingsChangeEvent) => void): void;
    getStatus(): { isInitialized: boolean };
    destroy(): void;
    getSetting(key: string): any;
    updateSetting(key: string, value: any): void;
}

interface AudioFeedbackManager {
    showVisualNotification(message: string, options?: VisualNotificationOptions): void;
    showCaption(text: string, options?: CaptionOptions): void;
    triggerVibration(pattern: number | number[]): void;
    getStatus(): { isActive: boolean };
    destroy(): void;
}

interface AudioCueManager {
    processAudioEvent(event: AudioEvent): void;
    destroy(): void;
    addEventToHistory?(event: any): void;
    processPattern?(pattern: any): void;
}

interface AudioDescriptionManager {
    destroy(): void;
}

interface EnvironmentalAudioManager {
    start(): void;
    stop(): void;
    isPlaying(): boolean;
    changeBiome(biome: string): void;
    changeWeather(weather: string): void;
    changeTimeOfDay(time: string): void;
    getCurrentSettings(): any;
}

interface SoundEffectRenderer {
    createSound(id: string, options?: any): AudioBufferSourceNode | null;
    dispose(): void;
}

interface EventRankingManager {
    getRanking(eventId: string): any[];
    dispose(): void;
}

interface LoggingSystem {
    log(level: string, message: string, data?: any): void;
}

// Extended MainController interface
interface MainController {
    audioFeedbackManager?: AudioFeedbackManager;
    audioDescriptionManager?: AudioDescriptionManager;
    audioCueManager?: AudioCueManager;
    audioManager?: any;
    configManager?: any;
    errorHandler?: any;
    settings?: any;
    audioContext?: AudioContext;
    audioBufferCache?: Map<string, AudioBuffer>;
}

// Type for AudioChannel
type AudioChannel = 'master' | 'music' | 'effects' | 'ui' | 'voice';

// Extended event interfaces
interface SettingsChangeEvent {
    type: 'single' | 'batch';
    key?: string;
    value?: any;
    changes?: Array<{ key: string; value: any }>;
}

interface AudioEvent {
    type: "single" | "batch";
    data?: any;
    timestamp?: number;
}

interface VisualNotificationOptions {
    title?: string;
    duration?: number;
    position?: 'top' | 'bottom' | 'center';
    type?: 'info' | 'warning' | 'error' | 'success';
}

interface CaptionOptions {
    duration?: number;
    position?: 'top' | 'bottom';
    style?: any;
}

interface AnnounceOptions {
    priority?: 'polite' | 'assertive';
    delay?: number;
}

// Extended gesture and keyboard event interfaces
interface GestureData {
    type?: string;
    touches?: Touch[];
    scale?: number;
    rotation?: number;
    __scale?: number;
}

interface ExtendedKeyboardEvent extends KeyboardEvent {
    __shiftKey?: boolean;
}

// Audio-specific types
interface BGMTrack {
    id: string;
    url: string;
    volume?: number;
    loop?: boolean;
    metadata?: any;
}

interface PlaybackInstance {
    source: AudioBufferSourceNode;
    gainNode?: GainNode;
    startTime: number;
    onended?: () => void;
}

// Localization extensions
interface LocalizationManager {
    get(key: string, params?: any): string;
    get(key: string, params?: any): string;
    getString?(key: string, params?: any): string;
}

// Device capabilities
interface DeviceCapabilities {
    audio: boolean;
    vibration: boolean;
    screenReader: boolean;
    reduceMotion: boolean;
    prefersContrast: string;
}

// Configuration types
type ConfigurationValue = string | number | boolean | object | null;

interface WatcherCallback {
    (key: string, newValue: ConfigurationValue, oldValue: ConfigurationValue): void;
}

// Audio subsystem types
type UIActionType = string;
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type GameStateType = 'menu' | 'playing' | 'paused' | 'gameOver';

// Deletion and cleanup types
interface DeletionReport {
    results?: any[];
    deletedCount?: number;
    errors?: any[];
}

interface CleanupResults {
    [key: string]: any;
}

interface AllResults extends CleanupResults {
    // Extended cleanup results
}

// Scene dialog types
interface ScenesBaseDialog {
    dispose?(): void;
    destroy?(): void;
}
// Extended LocalizationManager interface
interface ExtendedLocalizationManager extends LocalizationManager {
    get(key: string, params?: any): string;
}
