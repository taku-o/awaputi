/**
 * Audio system type definitions for BubblePop game
 * Defines audio managers, playback controllers, and related interfaces
 */

import { Component, Manager } from './components';
import { ConfigurationManager } from '../core/ConfigurationManager';

// ========== Core Audio Types ==========

export interface AudioConfig {
  volumes: {
    master: number;
    sfx: number;
    bgm: number;
    muted: boolean;
  };
  effects: {
    compression: boolean;
    reverb: boolean;
  };
  quality: AudioQualityMode;
  sampleRate?: number;
  bufferSize?: number;
  
  getCompressorConfig(): CompressorConfig;
  getReverbConfig(): ReverbConfig;
  isCompressionEnabled(): boolean;
  isReverbEnabled(): boolean;
}

export type AudioQualityMode = 'low' | 'medium' | 'high' | 'ultra';

export interface AudioQualitySettings {
  sampleRate: number;
  bufferSize: number;
  effects: boolean;
}

export interface CompressorConfig {
  threshold: number;
  knee: number;
  ratio: number;
  attack: number;
  release: number;
}

export interface ReverbConfig {
  duration: number;
  decay: number;
}

// ========== Audio Context Management ==========

export interface AudioContextManager {
  audioContext: AudioContext | null;
  masterGainNode: GainNode | null;
  sfxGainNode: GainNode | null;
  bgmGainNode: GainNode | null;
  compressor: DynamicsCompressorNode | null;
  reverbConvolver: ConvolverNode | null;
  reverbBuffer: AudioBuffer | null;
  isInitialized: boolean;
  isEnabled: boolean;
  audioConfig: AudioConfig | null;

  setAudioConfig(audioConfig: AudioConfig): void;
  initializeAudioContext(): Promise<boolean>;
  createAudioNodes(): void;
  setupCompressor(): void;
  setupAudioGraph(): void;
  initializeReverb(): Promise<void>;
  createReverbBuffer(channels: number, length: number, sampleRate: number, decay: number): AudioBuffer;
  reconnectCompressor(): void;
  bypassCompressor(): void;
  reconnectReverb(): void;
  bypassReverb(): void;
  resumeAudioContext(): Promise<void>;
  setGainNodeVolume(type: string, volume: number): void;
  getGainNodeVolume(type: string): number;
  isCompressionEnabled(): boolean;
  isReverbEnabled(): boolean;
  getContextStatus(): AudioContextStatus;
  dispose(): void;
  getAudioContext(): AudioContext | null;
  getMasterGainNode(): GainNode | null;
  getSfxGainNode(): GainNode | null;
  getBgmGainNode(): GainNode | null;
  getCompressor(): DynamicsCompressorNode | null;
  getReverbConvolver(): ConvolverNode | null;
}

export interface AudioContextStatus {
  isInitialized: boolean;
  isEnabled: boolean;
  contextState: AudioContextState;
  sampleRate: number;
  currentTime: number;
  volumes: {
    master: number;
    sfx: number;
    bgm: number;
  };
  effects: {
    compression: boolean;
    reverb: boolean;
  };
}

// ========== Audio Playback ==========

export interface AudioPlaybackController {
  audioContext: AudioContext | null;
  sfxGainNode: GainNode | null;
  masterGainNode: GainNode | null;
  soundBuffers: Map<string, AudioBuffer> | null;
  activeSources: Set<AudioBufferSourceNode>;
  maxConcurrentSounds: number;
  playbackStats: PlaybackStats;
  effectConfig: EffectConfig;
  soundCategories: Record<string, SoundCategory>;

  setDependencies(
    audioContext: AudioContext,
    sfxGainNode: GainNode,
    masterGainNode: GainNode,
    soundBuffers: Map<string, AudioBuffer>
  ): void;
  playSound(soundName: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playBubbleSound(bubbleType: string, comboLevel?: number, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playUISound(actionType: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playComboSound(comboLevel: number, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playAchievementSound(rarity: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playGameStateSound(stateType: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  stopAllSounds(): void;
  stopOldestSound(): void;
  getPlaybackStats(): PlaybackStats;
  testSound(soundName?: string): boolean;
  dispose(): void;
}

export interface PlaySoundOptions {
  volume?: number;
  pitch?: number;
  pan?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  category?: string;
  priority?: number;
}

export interface PlaybackStats {
  totalPlayed: number;
  activeCount: number;
  peakConcurrency: number;
  errors: number;
}

export interface EffectConfig {
  maxPitchShift: number;
  maxVolumeScale: number;
  maxPan: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

export interface SoundCategory {
  volume: number;
  priority: number;
}

// ========== BGM System ==========

export interface BGMSystem extends Manager {
  audioManager: AudioManager;
  audioContext: AudioContext;
  configManager: ConfigurationManager;
  tracks: Map<string, BGMTrack>;
  currentTrack: BGMTrack | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentVolume: number;
  configWatchers: Set<any>;
  bgmTypes: Record<string, BGMType>;
  bgmGenerator: BGMGenerator | null;
  bgmPlayer: BGMPlayer | null;
  transitionManager: BGMTransitionManager | null;

  initialize(): void;
  playBGM(trackName: string, options?: BGMPlayOptions): Promise<boolean>;
  stopBGM(): void;
  pauseBGM(): void;
  resumeBGM(): void;
  setBGMVolume(volume: number): void;
  getBGMVolume(): number;
  crossfadeTo(trackName: string, duration?: number): Promise<boolean>;
  dispose(): void;
}

export interface BGMTrack {
  name: string;
  buffer: AudioBuffer;
  duration: number;
  loop: boolean;
  volume: number;
  metadata?: BGMMetadata;
}

export interface BGMType {
  style: string;
  tempo: number;
  key: string;
  duration: number;
}

export interface BGMPlayOptions {
  loop?: boolean;
  volume?: number;
  fadeIn?: number;
  startTime?: number;
}

export interface BGMMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  bpm?: number;
  key?: string;
}

export interface BGMGenerator {
  audioContext: AudioContext;
  generateBGM(type: string, options?: BGMGenerationOptions): Promise<AudioBuffer>;
  generateTrack(config: BGMTrackConfig): Promise<AudioBuffer>;
  dispose(): void;
}

export interface BGMGenerationOptions {
  duration?: number;
  tempo?: number;
  key?: string;
  style?: string;
}

export interface BGMTrackConfig {
  style: string;
  tempo: number;
  key: string;
  duration: number;
  instruments?: string[];
  effects?: string[];
}

export interface BGMPlayer {
  audioContext: AudioContext;
  gainNode: GainNode;
  currentSource: AudioBufferSourceNode | null;
  currentBuffer: AudioBuffer | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  play(buffer: AudioBuffer, options?: BGMPlayOptions): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  setVolume(volume: number, fadeTime?: number): void;
  getVolume(): number;
  getCurrentTime(): number;
  getDuration(): number;
  seek(time: number): void;
  dispose(): void;
}

export interface BGMTransitionManager {
  audioContext: AudioContext;
  bgmSystem: BGMSystem;
  isTransitioning: boolean;
  currentTransition: BGMTransition | null;

  crossfade(fromTrack: BGMTrack, toTrack: BGMTrack, duration: number): Promise<void>;
  fadeOut(track: BGMTrack, duration: number): Promise<void>;
  fadeIn(track: BGMTrack, duration: number): Promise<void>;
  stop(): void;
  dispose(): void;
}

export interface BGMTransition {
  type: 'crossfade' | 'fadeOut' | 'fadeIn';
  fromTrack: BGMTrack | null;
  toTrack: BGMTrack | null;
  duration: number;
  startTime: number;
  progress: number;
}

// ========== Sound Effect System ==========

export interface SoundEffectSystem extends Manager {
  audioManager: AudioManager;
  audioContext: AudioContext;
  sfxGainNode: GainNode;
  configManager: ConfigurationManager;
  audioContextManager: AudioEffectContextManager | null;
  effectManager: AudioEffectManager | null;
  poolManager: SoundPoolManager | null;
  soundRenderer: SoundEffectRenderer | null;
  soundCategories: Record<string, SoundEffectCategory>;
  soundVariations: Map<string, SoundVariation[]>;
  activeSources: Set<AudioBufferSourceNode>;
  configWatchers: Set<any>;
  bubbleTypes: string[];
  comboLevels: number[];
  achievementRarities: string[];

  initialize(): Promise<boolean>;
  initializeComponents(): Promise<void>;
  setupComponentIntegration(): void;
  setupConfigWatchers(): void;
  generateAllSounds(): Promise<void>;
  playBubbleSound(bubbleType: string, comboLevel?: number, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playUISound(actionType: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playComboSound(comboLevel: number, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playAchievementSound(rarity: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playGameStateSound(stateType: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  stopAllSounds(): void;
  dispose(): void;
}

export interface SoundEffectCategory {
  enabled: boolean;
  volume: number;
}

export interface SoundVariation {
  name: string;
  buffer: AudioBuffer;
  weight: number;
  conditions?: SoundCondition[];
}

export interface SoundCondition {
  type: 'combo' | 'score' | 'time' | 'random';
  value: any;
  operator: '=' | '>' | '<' | '>=' | '<=' | '!=';
}

// ========== Audio Configuration ==========

export interface AudioConfigurationManager {
  configManager: ConfigurationManager | null;
  audioConfig: AudioConfig | null;
  audioNodes: AudioNodes | null;
  configWatchers: Set<any>;
  settings: AudioSettings;

  setDependencies(
    configManager: ConfigurationManager,
    audioConfig: AudioConfig,
    audioNodes: AudioNodes
  ): void;
  setupConfigWatchers(): void;
  syncWithConfig(): void;
  setVolume(type: string, volume: number): void;
  getVolume(type: string): number;
  toggleMute(): boolean;
  setMuted(muted: boolean): void;
  setAudioEffect(effectType: string, enabled: boolean): void;
  updateQualitySettings(qualityConfig: Partial<AudioQualitySettings>): void;
  getAllSettings(): AudioSettings;
  dispose(): void;
}

export interface AudioNodes {
  masterGainNode: GainNode;
  sfxGainNode: GainNode;
  bgmGainNode: GainNode;
  compressor: DynamicsCompressorNode;
  reverbConvolver: ConvolverNode;
}

export interface AudioSettings {
  volumes: {
    master: number;
    sfx: number;
    bgm: number;
    muted: boolean;
  };
  effects: {
    compression: boolean;
    reverb: boolean;
    [key: string]: boolean;
  };
  quality: AudioQualitySettings;
}

// ========== Main Audio Manager ==========

export interface AudioManager {
  configManager: ConfigurationManager;
  audioConfig: AudioConfig;
  contextManager: AudioContextManager;
  soundGenerator: ProceduralSoundGenerator;
  playbackController: AudioPlaybackController;
  configurationManager: AudioConfigurationManager;
  subsystemCoordinator: AudioSubsystemCoordinator;
  isInitialized: boolean;
  isEnabled: boolean;
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
  _isMuted: boolean;
  audioContext: AudioContext | null;
  masterGainNode: GainNode | null;
  sfxGainNode: GainNode | null;
  bgmGainNode: GainNode | null;
  soundBuffers: Map<string, AudioBuffer>;
  activeSources: Set<AudioBufferSourceNode>;
  qualityMode: AudioQualityMode;
  qualitySettings: Record<AudioQualityMode, AudioQualitySettings>;
  bgmSystem: BGMSystem | null;
  soundEffectSystem: SoundEffectSystem | null;
  audioController: AudioController | null;
  audioVisualizer: AudioVisualizer | null;
  accessibilitySupport: AudioAccessibilitySupport | null;

  initialize(): Promise<boolean>;
  playSound(soundName: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playBubbleSound(bubbleType: string, comboLevel?: number, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playUISound(actionType: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playComboSound(comboLevel: number, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playAchievementSound(rarity: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playGameStateSound(stateType: string, options?: PlaySoundOptions): AudioBufferSourceNode | null;
  playBonusSound(): AudioBufferSourceNode | null;
  playTimeStopSound(): AudioBufferSourceNode | null;
  playElectricSound(): AudioBufferSourceNode | null;
  playPopSound(): AudioBufferSourceNode | null;
  playGameOverSound(): AudioBufferSourceNode | null;
  stopAllSounds(): void;
  setVolume(type: string, volume: number): void;
  getVolume(type?: string): number;
  toggleMute(): boolean;
  setMuted(muted: boolean): void;
  setAudioEffect(effectType: string, enabled: boolean): void;
  updateQualitySettings(qualityConfig: Partial<AudioQualitySettings>): void;
  setScene(scene: string): void;
  fadeOutBGM(duration?: number): Promise<void>;
  isMuted(): boolean;
  onSceneChange(sceneName: string, options?: any): Promise<boolean>;
  resumeContext(): Promise<void>;
  playBGM(trackName: string, options?: BGMPlayOptions): any;
  stopBGM(): any;
  setBGMVolume(volume: number): any;
  setVolumeLevel(category: string, volume: number, fadeTime?: number): any;
  getVolumeLevel(category: string): any;
  fadeInVolume(category: string, duration?: number, targetVolume?: number): any;
  fadeOutVolume(category: string, duration?: number, targetVolume?: number): any;
  enableVisualization(enabled: boolean): any;
  setVisualizationStyle(style: string): any;
  getAudioManagerState(): AudioManagerState;
  getStatus(): AudioStatus;
  getMasterVolume(): number;
  getSoundEffectVolume(): number;
  getBackgroundMusicVolume(): number;
  getAvailableSounds(): string[];
  testSound(soundName?: string): boolean;
  dispose(): void;
  readonly currentTime: number;
  readonly sampleRate: number;
  readonly state: AudioContextState;
  setQualityMode(mode: AudioQualityMode): void;
  getQualityMode(): AudioQualityMode;
  getQualitySettings(mode?: AudioQualityMode): AudioQualitySettings;
  disable(): void;
  enable(): void;
}

export interface AudioManagerState {
  isInitialized: boolean;
  isEnabled: boolean;
  volumes: {
    master: number;
    sfx: number;
    bgm: number;
    muted: boolean;
  };
  context: AudioContextStatus;
  playback: PlaybackStats;
  configuration: AudioSettings;
  subsystems: SubsystemStatus;
  soundGeneration: GenerationStatus;
}

export interface AudioStatus {
  isEnabled: boolean;
  masterVolume: number;
  soundEffectVolume: number;
  backgroundMusicVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  activeSounds: number;
  isLoading: boolean;
  initialized: boolean;
  muted: boolean;
  contextState: AudioContextState;
  supportedFormats: string[];
  qualityMode: AudioQualityMode;
}

// ========== Additional Interfaces ==========

export interface ProceduralSoundGenerator {
  audioContext: AudioContext | null;
  soundBuffers: Map<string, AudioBuffer>;
  isInitialized: boolean;
  
  setAudioContext(audioContext: AudioContext): void;
  generateAllSounds(): Promise<boolean>;
  getAvailableSounds(): string[];
  getGenerationStatus(): GenerationStatus;
  dispose(): void;
}

export interface GenerationStatus {
  isGenerated: boolean;
  soundCount: number;
  generationTime: number;
  lastGenerated: Date | null;
}

export interface AudioSubsystemCoordinator {
  audioManager: AudioManager | null;
  bgmSystem: BGMSystem | null;
  soundEffectSystem: SoundEffectSystem | null;
  audioController: AudioController | null;
  audioVisualizer: AudioVisualizer | null;
  accessibilitySupport: AudioAccessibilitySupport | null;
  isInitialized: boolean;

  setAudioManager(audioManager: AudioManager): void;
  initializeSubsystems(): Promise<void>;
  onSceneChange(sceneName: string, options?: any): Promise<boolean>;
  delegateToBGMSystem(method: string, args: any[]): any;
  delegateToController(method: string, args: any[]): any;
  delegateToVisualizer(method: string, args: any[]): any;
  getSubsystemStatus(): SubsystemStatus;
  disposeSubsystems(): void;
}

export interface SubsystemStatus {
  bgmSystem: boolean;
  soundEffectSystem: boolean;
  audioController: boolean;
  audioVisualizer: boolean;
  accessibilitySupport: boolean;
}

export interface AudioController {
  // Audio controller interface (placeholder)
  setVolume(category: string, volume: number, fadeTime?: number): any;
  getVolume(category: string): any;
  fadeIn(category: string, duration?: number, targetVolume?: number): any;
  fadeOut(category: string, duration?: number, targetVolume?: number): any;
}

export interface AudioVisualizer {
  // Audio visualizer interface (placeholder)
  setEnabled(enabled: boolean): any;
  setStyle(style: string): any;
}

export interface AudioAccessibilitySupport {
  // Audio accessibility interface (placeholder)
  initialize(): Promise<void>;
  dispose(): void;
}

export interface AudioEffectManager {
  // Audio effect manager interface (placeholder)
  initialize(): Promise<void>;
  dispose(): void;
}

export interface SoundPoolManager {
  // Sound pool manager interface (placeholder)
  initialize(): Promise<void>;
  dispose(): void;
}

export interface AudioEffectContextManager {
  // Audio effect context manager interface (placeholder)
  initialize(): Promise<void>;
  dispose(): void;
}

export interface SoundEffectRenderer {
  // Sound effect renderer interface (placeholder)
  initialize(): Promise<void>;
  dispose(): void;
}

// ========== Utility Functions ==========

export function getAudioManager(configManager: ConfigurationManager, audioConfig: AudioConfig): AudioManager;
export function reinitializeAudioManager(configManager: ConfigurationManager, audioConfig: AudioConfig): AudioManager;
export function getAudioContextManager(): AudioContextManager;
export function reinitializeAudioContextManager(): AudioContextManager;

// ========== Type Guards ==========

export function isAudioManagerInitialized(audioManager: AudioManager): boolean;
export function isAudioContextAvailable(): boolean;
export function isSoundSupported(format: string): boolean;