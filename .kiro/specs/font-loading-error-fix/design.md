# Design Document

## Overview

フォント読み込みエラーの問題を解決するため、以下の設計アプローチを採用する：

1. **エラーハンドリングの強化**: フォント読み込み失敗時の適切な処理
2. **フォールバック機能の改善**: システムフォントへの確実な切り替え
3. **ログレベルの最適化**: デバッグに邪魔にならないログ出力
4. **設定可能な読み込み制御**: 開発時の柔軟な制御

## Architecture

### Core Components

```
FontLoadingManager
├── FontSourceManager (フォントソース管理)
├── FontFallbackHandler (フォールバック処理)
├── FontErrorHandler (エラー処理)
└── FontConfigManager (設定管理)
```

### Integration Points

- I18nRenderOptimizer: フォント読み込み処理の改善
- I18nIntegrationController: フォント管理の統合
- ErrorHandler: エラーログの最適化
- Configuration System: 設定による制御

## Components and Interfaces

### FontLoadingManager

```javascript
class FontLoadingManager {
    constructor(config = {}) {
        this.config = config;
        this.sourceManager = new FontSourceManager(config);
        this.fallbackHandler = new FontFallbackHandler(config);
        this.errorHandler = new FontErrorHandler(config);
        this.loadAttempts = new Map(); // 読み込み試行の記録
        this.failedSources = new Set(); // 失敗したソースの記録
    }
    
    async loadFont(fontFamily, language) {
        // フォント読み込みの統合処理
    }
    
    getFallbackFont(fontFamily, language) {
        // フォールバックフォントの取得
    }
    
    isSourceAvailable(source) {
        // ソースの可用性チェック
    }
}
```

### FontSourceManager

```javascript
class FontSourceManager {
    constructor(config) {
        this.sources = {
            local: new LocalFontSource(config),
            google: new GoogleFontSource(config),
            system: new SystemFontSource(config)
        };
        this.enabledSources = config.enabledSources || ['system', 'google', 'local'];
    }
    
    async loadFromSource(source, fontFamily, options) {
        // 指定されたソースからフォントを読み込み
    }
    
    getAvailableSources() {
        // 利用可能なソースの一覧
    }
}
```

### FontFallbackHandler

```javascript
class FontFallbackHandler {
    constructor(config) {
        this.fallbackChains = {
            'ja': ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
            'zh-CN': ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
            'zh-TW': ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'sans-serif'],
            'ko': ['Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
            'default': ['Arial', 'Helvetica', 'sans-serif']
        };
    }
    
    getFallbackChain(language) {
        // 言語に応じたフォールバックチェーンを取得
    }
    
    applyFallback(element, language) {
        // 要素にフォールバックフォントを適用
    }
}
```

### FontErrorHandler

```javascript
class FontErrorHandler {
    constructor(config) {
        this.config = config;
        this.errorCounts = new Map();
        this.suppressedErrors = new Set();
    }
    
    handleFontError(error, context) {
        // フォントエラーの適切な処理
    }
    
    shouldSuppressError(errorType, source) {
        // エラーを抑制すべきかの判定
    }
    
    logFontError(error, level = 'warn') {
        // 適切なレベルでのエラーログ出力
    }
}
```

## Data Models

### FontLoadingConfig

```javascript
const FontLoadingConfig = {
    enabledSources: ['system', 'google'], // 有効なフォントソース
    timeouts: {
        google: 3000,    // Google Fonts読み込みタイムアウト
        local: 1000      // ローカルフォント読み込みタイムアウト
    },
    fallbackBehavior: {
        useSystemFonts: true,
        suppressErrors: true,
        maxRetries: 1
    },
    logging: {
        level: 'warn',           // ログレベル
        suppressRepeated: true,  // 重複エラーの抑制
        maxErrorsPerSource: 3    // ソースごとの最大エラー数
    },
    development: {
        disableExternalFonts: false,  // 外部フォントの無効化
        verboseLogging: false         // 詳細ログ
    }
};
```

### FontLoadingResult

```javascript
const FontLoadingResult = {
    success: boolean,
    fontFamily: string,
    source: 'local' | 'google' | 'system',
    fallbackUsed: boolean,
    loadTime: number,
    error: Error | null
};
```

## Error Handling

### Error Categories

1. **NetworkError**: Google Fontsの読み込み失敗
2. **FileNotFoundError**: ローカルフォントファイルの不存在
3. **TimeoutError**: 読み込みタイムアウト
4. **ConfigurationError**: 設定エラー

### Error Suppression Strategy

```javascript
const ErrorSuppressionRules = {
    // 同じエラーの繰り返し抑制
    repeatSuppression: {
        enabled: true,
        timeWindow: 60000, // 1分間
        maxOccurrences: 3
    },
    
    // ソース別エラー抑制
    sourceBasedSuppression: {
        'local': {
            'FileNotFoundError': 'suppress', // 完全に抑制
            'TimeoutError': 'warn_once'      // 1回だけ警告
        },
        'google': {
            'NetworkError': 'warn_once',
            'TimeoutError': 'warn_once'
        }
    }
};
```

## Testing Strategy

### Unit Tests

1. **FontLoadingManager Tests**
   - フォント読み込み成功/失敗のテスト
   - フォールバック機能のテスト
   - エラーハンドリングのテスト

2. **FontSourceManager Tests**
   - 各ソースからの読み込みテスト
   - ソース無効化のテスト
   - タイムアウト処理のテスト

3. **FontErrorHandler Tests**
   - エラー分類のテスト
   - エラー抑制のテスト
   - ログレベル制御のテスト

### Integration Tests

1. **I18nRenderOptimizer Integration**
   - 既存のフォント読み込み処理との統合テスト
   - パフォーマンス影響のテスト

2. **Error Logging Integration**
   - ErrorHandlerとの連携テスト
   - ログ出力の検証

### Manual Tests

1. **Network Disconnection Test**
   - ネットワーク切断時の動作確認
   - フォールバック動作の確認

2. **File System Test**
   - フォントディレクトリ不存在時の動作確認
   - 権限エラー時の動作確認

## Implementation Plan

### Phase 1: Core Error Handling
- FontErrorHandlerの実装
- エラー抑制機能の実装
- ログレベル制御の実装

### Phase 2: Fallback System
- FontFallbackHandlerの実装
- システムフォントへの切り替え機能
- フォールバックチェーンの実装

### Phase 3: Source Management
- FontSourceManagerの実装
- ソース別読み込み制御
- 設定による制御機能

### Phase 4: Integration
- I18nRenderOptimizerの修正
- I18nIntegrationControllerの更新
- 既存コードとの統合

### Phase 5: Configuration & Testing
- 設定システムの実装
- テストの実装
- ドキュメントの更新