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
  
  update(deltaTime: number, mousePosition: Position): void;
  render(context: CanvasRenderingContext2D): void;
  containsPoint(x: number, y: number): boolean;
  pop(): void;
  grow(amount: number): void;
  shrink(amount: number): void;
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

export interface BubbleEffect {
  type: string;
  duration: number;
  intensity: number;
  apply(bubble: Bubble, deltaTime: number): void;
}

export interface BubbleManager {
  bubbles: Bubble[];
  spawnTimer: number;
  spawnInterval: number;
  maxBubbles: number;
  
  spawnBubble(type?: string, position?: Position): Bubble | null;
  removeBubble(bubbleId: string): boolean;
  popBubble(bubbleId: string): number;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
  clear(): void;
  getBubbleAt(position: Position): Bubble | null;
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
  currentScore: number;
  highScore: number;
  multiplier: number;
  combo: number;
  
  addScore(points: number): void;
  resetScore(): void;
  updateHighScore(): boolean;
  getComboMultiplier(): number;
  increaseCombo(): void;
  resetCombo(): void;
}

export interface StageManager {
  currentStage: number;
  stageConfig: StageConfig;
  isComplete: boolean;
  objectives: StageObjective[];
  
  loadStage(stageNumber: number): Promise<void>;
  updateProgress(): void;
  checkCompletion(): boolean;
  getNextStage(): number | null;
  reset(): void;
}

export interface StageConfig {
  number: number;
  name: string;
  timeLimit?: number;
  scoreTarget?: number;
  bubbleTypes: string[];
  spawnRate: number;
  difficulty: number;
  background?: string;
  music?: string;
}

export interface StageObjective {
  id: string;
  type: string;
  target: number;
  current: number;
  description: string;
  isComplete: boolean;
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

// Game progression and achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewards?: Reward[];
}

export interface Reward {
  type: string;
  value: number;
  description: string;
}

export interface ItemSystem {
  items: Map<string, Item>;
  inventory: string[];
  
  addItem(itemId: string): boolean;
  removeItem(itemId: string): boolean;
  useItem(itemId: string): boolean;
  hasItem(itemId: string): boolean;
  getItem(itemId: string): Item | null;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  rarity: number;
  stackable: boolean;
  maxStack: number;
  
  use(context: any): boolean;
  canUse(context: any): boolean;
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