/**
 * Game-specific type definitions for BubblePop
 * Defines core game entities, systems, and their interfaces
 */

import { Position, Size, Color, EventListener, Animation, Vector2 } from './global';

// Core game engine types
export interface GameEngine {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  isRunning: boolean;
  isPaused: boolean;
  lastTime: number;
  deltaTime: number;
  frameCount: number;
  
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  update(deltaTime: number): void;
  render(): void;
  destroy(): void;
}

// Scene management
export interface Scene {
  name: string;
  isActive: boolean;
  isLoaded: boolean;
  
  init(): Promise<void>;
  enter(): void;
  exit(): void;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
  handleInput(input: InputEvent): boolean;
  destroy(): void;
}

export interface SceneManager {
  currentScene: Scene | null;
  scenes: Map<string, Scene>;
  
  addScene(name: string, scene: Scene): void;
  removeScene(name: string): void;
  switchScene(sceneName: string): Promise<void>;
  getCurrentScene(): Scene | null;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
}

// Bubble system types
export interface Bubble {
  id: string;
  type: string;
  position: Position;
  velocity: Vector2;
  size: number;
  maxSize: number;
  color: Color;
  isAlive: boolean;
  age: number;
  maxAge: number;
  points: number;
  health?: number;
  
  update(deltaTime: number, mousePosition: Position): void;
  render(context: CanvasRenderingContext2D): void;
  containsPoint(x: number, y: number): boolean;
  pop(): void;
  grow(amount: number): void;
  shrink(amount: number): void;
  getScore(): number;
  getTypeConfig(): BubbleTypeConfig;
}

export interface BubbleType {
  name: string;
  color: Color;
  size: number;
  maxAge: number;
  points: number;
  speed: number;
  special: boolean;
  effects?: BubbleEffect[];
}

export interface BubbleTypeConfig {
  phaseChance?: number;
  [key: string]: any;
}

export interface BubbleEffect {
  type: string;
  duration: number;
  intensity: number;
  apply(bubble: Bubble, deltaTime: number): void;
}

export interface BubbleManager {
  gameEngine: any; // GameEngine type will be defined in a circular dependency fix
  bubbles: Bubble[];
  spawner: BubbleSpawner;
  physicsEngine: BubblePhysicsEngine;
  dragSystem: BubbleDragSystem;
  effectProcessor: BubbleEffectProcessor;
  lastCullTime: number;
  cullInterval: number;
  offscreenBubbles: Set<Bubble>;
  offscreenTimer: Map<Bubble, number>;
  
  setStageConfig(config: any): any;
  spawnBubble(type?: string | null, position?: Position | null): Bubble | null;
  spawnSpecificBubble(type: string, position?: Position | null): Bubble | null;
  updateMousePosition(x: number, y: number): void;
  update(deltaTime: number): void;
  performCulling(): void;
  calculateBubblePriority(bubble: Bubble): number;
  cleanupOffscreenTimers(): void;
  render(context: CanvasRenderingContext2D): void;
  handleClick(x: number, y: number): boolean;
  popBubble(bubble: Bubble, x: number, y: number): boolean;
  handleDragStart(x: number, y: number): any;
  handleDragMove(x: number, y: number): any;
  handleDragEnd(startX: number, startY: number, endX: number, endY: number): any;
  getBubblesAlongPath(startPos: Position, endPos: Position): Bubble[];
  getBubblesInRadius(x: number, y: number, radius: number): Bubble[];
  clearAllBubbles(): void;
  getBubbleCount(): number;
  getActiveBubbles(): Bubble[];
  setSpecialSpawnRate(bubbleType: string, rate: number): void;
  addTestBubble(bubbleData: any): boolean;
  addTestBubbles(bubblesData: any[]): number;
  removeTestBubbles(condition: string | ((bubble: Bubble) => boolean) | 'all'): number;
  getTestBubbleInfo(): TestBubbleInfo;
}

export interface TestBubbleInfo {
  total: number;
  byType: Record<string, number>;
  positions: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    health?: number;
  }>;
}

// BubbleManager sub-components
export interface BubbleSpawner {
  gameEngine: any;
  setStageConfig(config: any): any;
  spawnBubble(type?: string | null, position?: Position | null): Bubble | null;
  spawnSpecificBubble(type: string, position?: Position | null): Bubble | null;
  updateSpawnTimer(deltaTime: number, currentBubbleCount: number): boolean;
  setSpecialSpawnRate(bubbleType: string, rate: number): void;
  addTestBubble(bubbleData: any): Bubble | null;
  addTestBubbles(bubblesData: any[]): Bubble[];
}

export interface BubblePhysicsEngine {
  gameEngine: any;
  mousePosition: Position;
  updateMousePosition(x: number, y: number): void;
  updateBubble(bubble: Bubble, deltaTime: number): void;
  handleOffscreenBubble(bubble: Bubble, deltaTime: number, offscreenBubbles: Set<Bubble>, offscreenTimer: Map<Bubble, number>): void;
  isBubbleVisible(bubble: Bubble): boolean;
  getBubblesAlongPath(bubbles: Bubble[], startPos: Position, endPos: Position): Bubble[];
  getBubblesInRadius(bubbles: Bubble[], x: number, y: number, radius: number): Bubble[];
}

export interface BubbleDragSystem {
  handleDragStart(bubbles: Bubble[], x: number, y: number): any;
  handleDragMove(x: number, y: number): any;
  handleDragEnd(startX: number, startY: number, endX: number, endY: number, physicsEngine: BubblePhysicsEngine): any;
  renderDragTrail(context: CanvasRenderingContext2D, renderQuality: number): void;
  resetDrag(): void;
}

export interface BubbleEffectProcessor {
  gameEngine: any;
  checkAutoBurst(bubble: Bubble): void;
  processBubbleEffect(bubble: Bubble, x: number, y: number): void;
}

// Input system
export interface InputState {
  mouse: {
    position: Position;
    buttons: boolean[];
    wheel: number;
  };
  keyboard: {
    keys: boolean[];
    modifiers: {
      shift: boolean;
      ctrl: boolean;
      alt: boolean;
      meta: boolean;
    };
  };
  touch: {
    touches: Touch[];
    scale: number;
    rotation: number;
  };
}

export interface InputManager {
  state: InputState;
  enabled: boolean;
  
  init(canvas: HTMLCanvasElement): void;
  update(): void;
  isKeyPressed(keyCode: number): boolean;
  isMouseButtonPressed(button: number): boolean;
  getMousePosition(): Position;
  addListener(event: string, callback: EventListener): void;
  removeListener(event: string, callback: EventListener): void;
  destroy(): void;
}

// Score and progression
export interface ScoreManager {
  gameEngine: any;
  combo: number;
  comboTimer: number;
  comboTimeout: number;
  scoreMultipliers: number[];
  
  getComboTimeout(): number;
  getCombo(): number;
  addScore(bubble: Bubble, x: number, y: number): void;
  calculateBaseScore(bubble: Bubble): number;
  calculateAgeBonus(bubble: Bubble): number;
  getItemScoreMultiplier(): number;
  addScoreMultiplier(multiplier: number): void;
  notifyScoreGained(score: number, x: number, y: number, multiplier: number): void;
  updateCombo(x?: number, y?: number): void;
  notifyComboBonus(bonusScore: number, x: number, y: number, combo: number): void;
  resetCombo(): void;
  update(deltaTime: number): void;
  getCurrentCombo(): number;
  getComboMultiplier(): number;
  getTotalMultiplier(): number;
  resetMultipliers(): void;
  getDebugInfo(): ScoreDebugInfo;
}

export interface ScoreDebugInfo {
  combo: number;
  comboMultiplier: number;
  itemMultiplier: number;
  specialMultiplier: number;
  totalMultiplier: number;
  comboTimer: number;
}

export interface StageManager {
  gameEngine: any;
  currentStage: CurrentStage | null;
  stageConfigs: Record<string, StageConfig>;
  
  initializeStageConfigs(): Record<string, StageConfig>;
  startStage(stageId: string): boolean;
  isStageUnlocked(stageId: string): boolean;
  getUnlockedStages(): UnlockedStageInfo[];
  getLockedStages(): LockedStageInfo[];
  getCurrentStageConfig(): StageConfig | null;
  getCurrentStageId(): string | null;
  checkBossEvents(timeRemaining: number): void;
  triggerBossEvent(event: BossEvent): void;
  completeStage(finalScore: number): void;
}

export interface CurrentStage {
  id: string;
  config: StageConfig;
  startTime: number;
  bossEventsTriggered: number[];
}

export interface StageConfig {
  name: string;
  description: string;
  duration: number;
  bubbleTypes: string[];
  spawnRate: number;
  maxBubbles: number;
  unlockCondition?: UnlockCondition | null;
  unlockMessage?: string;
  bossEvents?: BossEvent[];
}

export interface UnlockCondition {
  type: 'tap' | 'highScore' | 'stageComplete';
  value: number;
  stage?: string;
}

export interface BossEvent {
  time: number;
  type: string;
  count: number;
}

export interface UnlockedStageInfo {
  id: string;
  name: string;
  description: string;
  duration: number;
}

export interface LockedStageInfo {
  id: string;
  name: string;
  description: string;
  unlockMessage: string;
}

// Audio system
export interface AudioManager {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  
  loadSound(id: string, url: string): Promise<HTMLAudioElement>;
  playSound(id: string, volume?: number): Promise<void>;
  stopSound(id: string): void;
  pauseSound(id: string): void;
  playMusic(id: string, loop?: boolean): Promise<void>;
  stopMusic(): void;
  setMasterVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  setSfxVolume(volume: number): void;
  mute(): void;
  unmute(): void;
}

// Effects system
export interface ParticleSystem {
  particles: Particle[];
  maxParticles: number;
  
  emit(position: Position, config: ParticleConfig): void;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
  clear(): void;
}

export interface Particle {
  position: Position;
  velocity: Vector2;
  acceleration: Vector2;
  size: number;
  color: Color;
  life: number;
  maxLife: number;
  
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
  isAlive(): boolean;
}

export interface ParticleConfig {
  count: number;
  life: number;
  speed: number;
  size: number;
  color: Color;
  spread: number;
  gravity?: Vector2;
  fadeOut?: boolean;
}

export interface EffectManager {
  effects: Map<string, Effect>;
  
  addEffect(id: string, effect: Effect): void;
  removeEffect(id: string): void;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
  clear(): void;
}

export interface Effect extends Animation {
  id: string;
  position: Position;
  
  render(context: CanvasRenderingContext2D): void;
}

// UI system extensions
export interface GameUI {
  scoreDisplay: UIElement;
  timeDisplay: UIElement;
  livesDisplay: UIElement;
  comboDisplay: UIElement;
  pauseButton: UIButton;
  
  update(gameState: any): void;
  render(context: CanvasRenderingContext2D): void;
  handleClick(position: Position): boolean;
}

export interface UIElement {
  position: Position;
  size: Size;
  visible: boolean;
  text: string;
  style: TextStyle;
  
  render(context: CanvasRenderingContext2D): void;
  containsPoint(position: Position): boolean;
}

export interface UIButton extends UIElement {
  enabled: boolean;
  hover: boolean;
  pressed: boolean;
  onClick: EventListener;
  
  handleMouseDown(position: Position): void;
  handleMouseUp(position: Position): void;
  handleMouseMove(position: Position): void;
}

export interface TextStyle {
  font: string;
  size: number;
  color: Color;
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle' | 'bottom';
  bold?: boolean;
  italic?: boolean;
}

// Item System
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  effect: ItemEffect;
}

export interface ItemEffect {
  type: 'scoreMultiplier' | 'revival' | 'rareRate' | 'hpBoost' | 'timeExtension' | 'comboBoost' | 'reset';
  value: number;
}

export interface ItemInfo extends ItemDefinition {
  currentLevel: number;
  cost: number;
  canPurchase: boolean;
  isMaxLevel: boolean;
}

export interface ItemManager {
  gameEngine: any;
  ownedItems: Map<string, number>;
  activeEffects: Map<string, number>;
  
  initialize(): void;
  loadOwnedItems(): void;
  saveOwnedItems(): void;
  purchaseItem(itemId: string): boolean;
  resetAllItems(): boolean;
  applyItemEffect(itemId: string): void;
  applyAllEffects(): void;
  getEffectValue(effectType: string): number;
  getItemLevel(itemId: string): number;
  getItemCost(itemId: string): number;
  canPurchaseItem(itemId: string): boolean;
  useRevival(): boolean;
  getAvailableItems(): ItemDefinition[];
  getItemInfo(itemId: string): ItemInfo | null;
}

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category?: string;
  rewards?: AchievementReward[];
}

export interface AchievementReward {
  type: string;
  value: number;
  description: string;
}

export interface AchievementProgressResult {
  isComplete: boolean;
  progress: number;
  maxProgress: number;
}

export interface AchievementStatistics {
  total: number;
  unlocked: number;
  unlockedPercentage: number;
  categories: Record<string, number>;
  performance: any;
  byCategory: Record<string, number>;
}

export interface AchievementManager {
  gameEngine: any;
  definitions: any;
  notificationSystem: any;
  progressTracker: any;
  performanceOptimizer: any;
  config: AchievementConfig;
  
  initializeAchievementManager(): void;
  setupEventListeners(): void;
  configureNotificationSystem(): void;
  initializeAchievements(): Record<string, Achievement>;
  updateProgress(eventType: string, data: any): void;
  processUpdateEvent(eventType: string, data: any): Promise<void>;
  unlockAchievement(achievement: Achievement): void;
  handleAchievementUnlocked(data: any): void;
  handleProgressUpdated(data: any): void;
  updateAchievementProgressAdvanced(achievement: Achievement, eventType: string, data: any): AchievementProgressResult | null;
  checkAchievementConditionOptimized(achievement: Achievement, eventType: string, data: any): boolean;
  getAchievements(): Record<string, Achievement>;
  getAchievementsByCategory(category: string): Achievement[];
  getAchievementProgress(achievementId: string): AchievementProgressResult | null;
  getUnlockedAchievements(): string[];
  isUnlocked(achievementId: string): boolean;
  getStatistics(): AchievementStatistics;
  getNotificationHistory(limit?: number): any[];
  getProgressData(): any;
  updateConfig(config: Partial<AchievementConfig>): void;
  getDebugInfo(): any;
  resetData(): void;
  load(): void;
  destroy(): void;
}

export interface AchievementConfig {
  enableNotifications: boolean;
  enablePerformanceOptimization: boolean;
  autoSave: boolean;
  debugMode: boolean;
}

// Game settings and preferences
export interface GameSettings {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
  gameplay: GameplaySettings;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high';
  fullscreen: boolean;
  vsync: boolean;
  particles: boolean;
  effects: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface ControlSettings {
  mouseControls: boolean;
  keyboardControls: boolean;
  touchControls: boolean;
  sensitivity: number;
}

export interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard';
  tutorials: boolean;
  hints: boolean;
  autoSave: boolean;
}