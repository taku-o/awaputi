/**
 * Component type definitions for BubblePop game
 * Defines UI components, managers, and system interfaces
 */

import { Position, Size, Color, EventListener, UIComponent  } from './global';'
import { Scene, InputState  } from './game';

// Base component interfaces
export interface Component { id: string;
  name: string;
 , enabled: boolean;
  init(): Promise<void>;
  update(deltaTime: number): void;
  destroy(): void;

export interface RenderableComponent extends Component { visible: boolean;
  zIndex: number;
  render(context: CanvasRenderingContext2D): void;

// Manager interfaces
export interface Manager extends Component { initialized: boolean;
  
  reset(): void;
  pause(): void;
  resume(): void;

// UI Manager types
export interface UIManager extends Manager { components: Map<string, UIComponent>,
  activeComponent: UIComponent | null;
  addComponent(component: UIComponent): void;
  removeComponent(id: string): void;
  getComponent(id: string): UIComponent | null;
  showComponent(id: string): void;
  hideComponent(id: string): void;
  handleInput(input: InputState): boolean;
  render(context: CanvasRenderingContext2D): void;

// Menu system components
export interface MenuItem { id: string;
  text: string;
  action: () => void;
  enabled: boolean;
  visible: boolean;
  icon?: string;
  submenu?: MenuItem[];
     }
}

export interface Menu extends UIComponent { items: MenuItem[];
  selectedIndex: number;
 , title: string;
  addItem(item: MenuItem): void;
  removeItem(id: string): void;
  selectItem(index: number): void;
  activateSelected(): void;
  navigateUp(): void;
  navigateDown(): void;

export interface MenuManager extends UIManager { currentMenu: Menu | null;
  menuStack: Menu[];
  openMenu(menu: Menu): void;
  closeMenu(): void;
  goBack(): void;
  clearMenuStack(): void;

// Dialog and modal components
export interface Dialog extends UIComponent { title: string;
  message: string;
  buttons: DialogButton[];
 , modal: boolean;
  show(): void;
  hide(): void,''
  addButton(button: DialogButton): void;

export interface DialogButton { id: string;

  text: string;
  style: 'primary' | 'secondary' | 'danger';
 , onClick: () => void  }
}

export interface ConfirmDialog extends Dialog { onConfirm: () => void;
  onCancel: () => void }
}

// Settings components
export interface SettingsPanel extends UIComponent { categories: SettingsCategory[];
 , activeCategory: string;
  addCategory(category: SettingsCategory): void;
  switchCategory(categoryId: string): void;
  applySettings(): void;
  resetSettings(): void,''
  restoreDefaults(''';'
  type: 'boolean' | 'number' | 'string' | 'select' | 'range';
  value: any);
 , defaultValue: any);
  options?: SettingOption[];
  min?: number;
  max?: number;
  step?: number;
  
  setValue(value: any): void;
  getValue(): any;
  resetToDefault(): void;
  validate(value: any): boolean;

export interface SettingOption { value: any;
  label: string;
  description?: string;

// Help and tutorial components
export interface HelpSystem extends UIComponent { topics: HelpTopic[];
  currentTopic: string | null;
 , searchQuery: string;
  showTopic(topicId: string): void;
  search(query: string): HelpTopic[];
  navigateBack(): void;
  navigateForward(): void;

export interface HelpTopic { id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
 , relatedTopics: string[];

export interface Tutorial extends Component { steps: TutorialStep[];
  currentStep: number;
 , completed: boolean;
  start(): void;
  nextStep(): void;
  previousStep(): void;
  skip(): void,''
  complete(''';'
  action?: 'click' | 'hover' | 'key' | 'wait';
  duration?: number);
  isComplete(): boolean;
  execute(): void;

// Input and control components
export interface InputField extends UIComponent { value: string;
  placeholder: string;
  maxLength: number;
  focused: boolean;
 , readonly: boolean;
  focus(): void;
  blur(): void;
  clear(): void;
  setValue(value: string): void;
  getValue(): string;

export interface Button extends UIComponent { text: string;
  icon?: string;
  style: ButtonStyle;
 , state: ButtonState;
  click(): void;
  press(): void;
  release(): void;
  hover(): void,''
  unhover(''';'
export, type ButtonState = 'normal' | 'hover' | 'pressed' | 'disabled';

// Layout, and container, components
export, interface Container, extends UIComponent {
  children: UIComponent[];
  layout: LayoutType;
  padding: number);
 , spacing: number);
  addChild(child: UIComponent): void;
  removeChild(child: UIComponent): void;
  clearChildren(): void,''
  arrangeChildren(''';'
export type LayoutType = 'absolute' | 'horizontal' | 'vertical' | 'grid';

export interface Panel extends Container {
  title?: string;
  border: boolean;
  backgroundColor: Color;
 , borderColor: Color;

export interface ScrollContainer extends Container { scrollX: number;
  scrollY: number;
  scrollWidth: number);
 , scrollHeight: number)';'
  scrollTo(x: number, y: number): void;
  scrollBy(dx: number, dy: number): void;

// Data display components
export interface Label extends UIComponent { text: string,''
  textAlign: 'left' | 'center' | 'right';
  wordWrap: boolean;
  fontSize: number;
  fontFamily: string;
 , textColor: Color;

export interface ProgressBar extends UIComponent { value: number;
  maxValue: number;
  showText: boolean;
  fillColor: Color;
  backgroundColor: Color;
 , borderColor: Color;
  setValue(value: number): void;
  setMaxValue(maxValue: number): void;
  getProgress(): number;

export interface Chart extends UIComponent { data: ChartData[];
  type: ChartType;
 , colors: Color[];
  setData(data: ChartData[]): void;
  addDataPoint(data: ChartData): void;
  clearData(''';'
export, type ChartType = 'bar' | 'line' | 'pie' | 'area';

// Game-specific, UI components, export interface, ScoreDisplay extends, Label {
  score: number;
  animatedScore: number);
 , animationSpeed: number);
  setScore(score: number, animate?: boolean): void,''
  formatScore(score: number): string;
';'

export interface TimerDisplay extends Label { time: number,''
  format: 'seconds' | 'minutes' | 'hours';
 , countUp: boolean;
  setTime(time: number): void;
  start(): void;
  stop(): void;
  reset(): void;
  formatTime(time: number): string;

export interface HealthBar extends ProgressBar { maxHealth: number;
  currentHealth: number;
  criticalThreshold: number;
 , criticalColor: Color;
  setHealth(health: number): void;
  damage(amount: number): void;
  heal(amount: number): void;
  isCritical(): boolean;

// Notification and feedback components
export interface NotificationManager extends Manager { notifications: Notification[];
  maxNotifications: number;
 , defaultDuration: number;
  show(message: string, type?: NotificationType, duration?: number): void;
  hide(id: string): void;
  clear(): void;

export interface Notification extends UIComponent { id: string;
  message: string;
  type: NotificationType;
  duration: number;
 , remaining: number;
  show(): void;
  hide(): void;
  pause(): void,''
  resume(''';'
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Toast extends Notification {
  position: ToastPosition;
 , animation: ToastAnimation;

export type ToastPosition = 'top' | 'bottom' | 'center';'
export type ToastAnimation = 'slide' | 'fade' | 'bounce';

// Performance and debugging components
export interface PerformanceMonitor extends Component { fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number);
 , updateTime: number);
  startFrame(): void;
  endFrame(): void;
  getStats(): PerformanceStats;
     }

export interface PerformanceStats { fps: number;
  frameTime: number;
  memory: number;
  renderTime: number;
  updateTime: number;
 , drawCalls: number;

export interface DebugConsole extends UIComponent { commands: Map<string, ConsoleCommand>,
  history: string[];
 , output: string[];
  addCommand(name: string, command: ConsoleCommand): void;
  executeCommand(commandLine: string): void;
  log(message: string): void;
  clear(): void;

export interface ConsoleCommand { name: string;
  description: string;
 , usage: string;
  execute: (arg,s: string[]') => string,' }

}