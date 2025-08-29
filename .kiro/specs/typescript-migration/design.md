# TypeScript導入 - 設計書

## 概要

BubblePopゲームプロジェクトにTypeScriptを段階的に導入し、型安全性を確保する。771個のJavaScriptファイルを対象とし、設定ファイルは除外する。

## アーキテクチャ

### TypeScript設定アーキテクチャ

```
プロジェクトルート/
├── tsconfig.json              # メインのTypeScript設定
├── tsconfig.build.json        # ビルド用設定
├── tsconfig.test.json         # テスト用設定
├── src/
│   ├── **/*.ts               # 変換されたソースファイル
│   └── types/                # 型定義ファイル
│       ├── global.d.ts       # グローバル型定義
│       ├── game.d.ts         # ゲーム関連型定義
│       └── components.d.ts   # コンポーネント型定義
├── tests/
│   └── **/*.ts               # 変換されたテストファイル
└── test/
    └── **/*.ts               # 変換されたテストファイル
```

### 移行戦略アーキテクチャ

```
Phase 1: 環境構築
├── TypeScript依存関係インストール
├── tsconfig.json作成
├── ビルドツール設定更新
└── 型定義ファイル作成

Phase 2: コアシステム移行
├── src/core/ (基盤システム)
├── src/utils/ (ユーティリティ)
└── src/managers/ (管理システム)

Phase 3: UI・シーン移行
├── src/scenes/ (シーン)
├── src/ui/ (UI)
└── src/components/ (コンポーネント)

Phase 4: エフェクト・オーディオ移行
├── src/effects/ (エフェクト)
├── src/audio/ (オーディオ)
└── src/bubbles/ (バブル)

Phase 5: テスト移行
├── tests/ (テストファイル)
└── test/ (テストファイル)

Phase 6: 最終検証
├── ビルドテスト
├── 全テスト実行
└── E2Eテスト
```

## コンポーネントと インターフェース

### TypeScript設定コンポーネント

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@tests/*": ["tests/*"],
      "@utils/*": ["src/utils/*"],
      "@core/*": ["src/core/*"]
    }
  },
  "include": [
    "src/**/*",
    "tests/**/*",
    "test/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "coverage",
    "*.config.js",
    "scripts/**/*"
  ]
}
```

### 型定義システム

#### ゲームエンジン型定義
```typescript
// src/types/game.d.ts
export interface GameEngine {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  isRunning: boolean;
  lastTime: number;
  
  start(): void;
  stop(): void;
  update(deltaTime: number): void;
  render(): void;
}

export interface BubbleManager {
  bubbles: Bubble[];
  spawnBubble(type?: string, position?: Position): Bubble | null;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
}

export interface Bubble {
  id: string;
  type: string;
  position: Position;
  size: number;
  isAlive: boolean;
  age: number;
  maxAge: number;
  
  update(deltaTime: number, mousePosition: Position): void;
  render(context: CanvasRenderingContext2D): void;
  containsPoint(x: number, y: number): boolean;
}
```

#### ユーティリティ型定義
```typescript
// src/types/global.d.ts
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface EventListener<T = any> {
  (event: T): void;
}

export interface ConfigurationManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
}
```

### 移行ツールコンポーネント

#### ファイル変換ツール
```typescript
// scripts/typescript-migration/FileMigrator.ts
export class FileMigrator {
  private sourceDir: string;
  private targetDir: string;
  
  constructor(sourceDir: string, targetDir: string) {
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
  }
  
  async migrateFile(filePath: string): Promise<void> {
    // .js → .ts変換
    // import文の更新
    // 基本的な型注釈の追加
  }
  
  async migrateDirectory(dirPath: string): Promise<void> {
    // ディレクトリ内の全ファイルを移行
  }
}
```

#### 型注釈追加ツール
```typescript
// scripts/typescript-migration/TypeAnnotator.ts
export class TypeAnnotator {
  addClassPropertyTypes(classContent: string): string {
    // クラスプロパティに型注釈を追加
  }
  
  addMethodTypes(methodContent: string): string {
    // メソッドの引数と戻り値に型注釈を追加
  }
  
  addInterfaceDefinitions(content: string): string {
    // インターフェース定義を追加
  }
}
```

## データモデル

### 移行対象ファイル分析

```typescript
interface MigrationTarget {
  totalFiles: number;        // 771
  sourceFiles: number;       // ~650 (src/**/*.js)
  testFiles: number;         // ~121 (tests/**/*.js, test/**/*.js)
  excludedFiles: string[];   // 設定ファイル等
}

interface MigrationPhase {
  name: string;
  files: string[];
  dependencies: string[];
  estimatedTime: number;     // 時間（分）
  priority: number;          // 優先度 (1-5)
}
```

### 型定義マッピング

```typescript
interface TypeMapping {
  jsType: string;
  tsType: string;
  needsInterface: boolean;
  customType?: string;
}

const typeMappings: TypeMapping[] = [
  { jsType: 'object', tsType: 'object', needsInterface: true },
  { jsType: 'array', tsType: 'Array<T>', needsInterface: false },
  { jsType: 'function', tsType: '(...args: any[]) => any', needsInterface: false },
  { jsType: 'canvas', tsType: 'HTMLCanvasElement', needsInterface: false },
  { jsType: 'context', tsType: 'CanvasRenderingContext2D', needsInterface: false }
];
```

## エラーハンドリング

### TypeScriptコンパイルエラー対応

```typescript
interface CompilationError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

class TypeScriptErrorHandler {
  handleUndefinedFunction(error: CompilationError): void {
    // 未定義関数の実装を追加
  }
  
  handleUndefinedVariable(error: CompilationError): void {
    // 未定義変数の初期化を追加
  }
  
  handleTypeError(error: CompilationError): void {
    // 型エラーの修正
  }
}
```

### 移行エラー対応

```typescript
class MigrationErrorHandler {
  handleImportError(filePath: string, importPath: string): void {
    // import文の修正
  }
  
  handleCircularDependency(files: string[]): void {
    // 循環依存の解決
  }
  
  handleMissingImplementation(className: string, methodName: string): void {
    // 未実装メソッドの追加
  }
}
```

## テスト戦略

### 段階的テスト戦略

```typescript
interface TestStrategy {
  phase: string;
  testTypes: string[];
  coverage: number;
  criticalPaths: string[];
}

const testStrategies: TestStrategy[] = [
  {
    phase: 'Phase 1: 環境構築',
    testTypes: ['build', 'compile'],
    coverage: 100,
    criticalPaths: ['tsconfig.json', 'package.json']
  },
  {
    phase: 'Phase 2: コアシステム',
    testTypes: ['unit', 'integration'],
    coverage: 90,
    criticalPaths: ['GameEngine', 'BubbleManager', 'SceneManager']
  },
  {
    phase: 'Phase 3-4: UI・エフェクト',
    testTypes: ['unit', 'visual'],
    coverage: 80,
    criticalPaths: ['MainMenuScene', 'GameScene']
  },
  {
    phase: 'Phase 5: テスト移行',
    testTypes: ['test-migration'],
    coverage: 100,
    criticalPaths: ['all test files']
  },
  {
    phase: 'Phase 6: 最終検証',
    testTypes: ['e2e', 'performance'],
    coverage: 100,
    criticalPaths: ['full application']
  }
];
```

### テスト自動化

```typescript
class MigrationTestRunner {
  async runPhaseTests(phase: string): Promise<TestResult> {
    // 各フェーズのテストを実行
  }
  
  async validateTypeScript(): Promise<boolean> {
    // TypeScriptコンパイルの検証
  }
  
  async runRegressionTests(): Promise<TestResult> {
    // リグレッションテストの実行
  }
}
```

## パフォーマンス考慮事項

### ビルド時間最適化

```typescript
interface BuildOptimization {
  incrementalCompilation: boolean;
  typeCheckingMode: 'build' | 'watch' | 'editor';
  parallelProcessing: boolean;
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
}

const buildConfig: BuildOptimization = {
  incrementalCompilation: true,
  typeCheckingMode: 'build',
  parallelProcessing: true,
  cacheStrategy: 'hybrid'
};
```

### 型チェック最適化

```typescript
interface TypeCheckOptimization {
  skipLibCheck: boolean;
  strictMode: boolean;
  incrementalMode: boolean;
  projectReferences: boolean;
}
```

## セキュリティ考慮事項

### 型安全性の確保

```typescript
interface TypeSafetyConfig {
  noImplicitAny: boolean;
  strictNullChecks: boolean;
  noImplicitReturns: boolean;
  noUnusedLocals: boolean;
  exactOptionalPropertyTypes: boolean;
}

const securityConfig: TypeSafetyConfig = {
  noImplicitAny: true,
  strictNullChecks: true,
  noImplicitReturns: true,
  noUnusedLocals: true,
  exactOptionalPropertyTypes: true
};
```

## 移行スケジュール

### フェーズ別スケジュール

| フェーズ | 期間 | 対象ファイル数 | 主要作業 |
|---------|------|---------------|----------|
| Phase 1 | 1日 | 設定ファイル | 環境構築 |
| Phase 2 | 3日 | ~200ファイル | コアシステム移行 |
| Phase 3 | 2日 | ~150ファイル | UI・シーン移行 |
| Phase 4 | 2日 | ~150ファイル | エフェクト・オーディオ移行 |
| Phase 5 | 2日 | ~121ファイル | テスト移行 |
| Phase 6 | 1日 | 全体 | 最終検証 |

### リスク管理

```typescript
interface MigrationRisk {
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

const risks: MigrationRisk[] = [
  {
    risk: '循環依存の発生',
    probability: 'medium',
    impact: 'high',
    mitigation: '依存関係の事前分析と段階的移行'
  },
  {
    risk: 'ビルド時間の増加',
    probability: 'high',
    impact: 'medium',
    mitigation: 'インクリメンタルコンパイルの活用'
  },
  {
    risk: '未実装機能の発見',
    probability: 'high',
    impact: 'medium',
    mitigation: 'その場での実装とテスト'
  }
];
```