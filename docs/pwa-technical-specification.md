# PWA技術仕様書

## 概要

BubblePopのPWA（Progressive Web App）実装に関する技術仕様とアーキテクチャについて説明します。

## アーキテクチャ概要

```
BubblePop PWA Architecture
├── Web App Manifest (manifest.json)
├── Service Worker (sw.js)
├── PWA Manager (src/core/PWAManager.js)
├── Assets Generation Tools (tools/)
└── Cache Strategy Implementation
```

## Web App Manifest

### ファイル: `manifest.json`

#### 基本設定
```json
{
  "name": "BubblePop - バブルポップゲーム",
  "short_name": "BubblePop",
  "description": "HTML5 Canvas を使用した楽しいバブルポップゲーム",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#4CAF50",
  "background_color": "#ffffff"
}
```

#### アイコン設定
- **標準アイコン**: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512px
- **マスカブルアイコン**: 192x192, 512x512px (purpose: "maskable")
- **Apple Touch Icons**: 57x57〜180x180px
- **ファビコン**: 16x16, 32x32, 48x48px, favicon.ico

#### ショートカット機能
- クイックプレイ
- 統計表示
- 設定
- 実績

#### 高度な機能
- **File Handlers**: JSONファイルの処理
- **Protocol Handlers**: web+bubblepop://
- **Share Target**: スクリーンショット共有

## Service Worker

### ファイル: `sw.js`

#### キャッシュ戦略

##### 静的アセット（Cache-First）
```javascript
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/core/',
    '/src/scenes/',
    '/assets/icons/',
    // ...
];
```

##### 動的コンテンツ（Network-First）
- ゲームデータ
- 統計情報
- 設定更新

##### API呼び出し（Network-Only）
- サーバー通信
- データ同期

#### 機能実装

##### キャッシュ管理
```javascript
const CACHE_CONFIG = {
    version: '1.1.0-pwa',
    staticCacheName: 'bubblepop-static-v1.1.0-pwa',
    dynamicCacheName: 'bubblepop-dynamic-v1.1.0-pwa',
    limits: {
        staticCache: 100 * 1024 * 1024,  // 100MB
        dynamicCache: 20 * 1024 * 1024,  // 20MB
        iconCache: 30 * 1024 * 1024      // 30MB
    }
};
```

##### 自動クリーンアップ
- LRUアルゴリズムによる古いキャッシュ削除
- 重要ファイルの保護（PWA必須ファイル）
- サイズ制限の自動実行

## PWAManager

### ファイル: `src/core/PWAManager.js`

#### 主要機能

##### インストールプロンプト管理
```javascript
setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.pwaConfig.installation.deferPrompt = event;
        // インストールプロンプトの最適化
    });
}
```

##### オフライン機能管理
- オフライン状態検出
- 機能制限の実装
- データ同期キュー管理

##### ネットワーク監視
- 接続状態の監視
- 回線品質の検出
- 自動再接続処理

#### 設定パラメータ

##### Service Worker設定
```javascript
serviceWorker: {
    enabled: true,
    scriptPath: '/sw.js',
    scope: '/',
    updateCheckInterval: 300000, // 5分
    skipWaiting: true,
    clientsClaim: true
}
```

##### インストール設定
```javascript
installation: {
    enabled: true,
    autoPrompt: false,
    promptDelay: 5000,
    maxPromptCount: 3
}
```

##### オフライン設定
```javascript
offline: {
    enabled: true,
    enabledFeatures: ['gameplay', 'settings', 'statistics'],
    disabledFeatures: ['multiplayer', 'achievements_sync'],
    dataSync: true,
    syncRetryAttempts: 3
}
```

## アセット生成ツール

### ディレクトリ: `tools/`

#### 自動生成スクリプト
- `generate-pwa-assets.js`: 全PWAアセット生成
- `generate-apple-touch-icons.js`: Apple Touch Icons生成
- `generate-maskable-icons.js`: マスカブルアイコン生成
- `generate-favicons.js`: ファビコン生成
- `generate-apple-splash-screens.js`: スプラッシュスクリーン生成

#### 検証ツール
- `validate-manifest.js`: Manifest検証
- PWAコンプライアンステスト
- アイコンファイル存在確認

## HTML メタタグ

### PWA基本メタタグ
```html
<meta name="theme-color" content="#4CAF50">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">
```

### Apple特化メタタグ
```html
<meta name="apple-mobile-web-app-title" content="BubblePop">
<meta name="apple-touch-fullscreen" content="yes">
<meta name="apple-mobile-web-app-orientations" content="portrait">
```

### Microsoft PWAメタタグ
```html
<meta name="msapplication-TileColor" content="#4CAF50">
<meta name="msapplication-starturl" content="/">
<meta name="msapplication-navbutton-color" content="#4CAF50">
```

## パフォーマンス最適化

### キャッシュ最適化
- 重要度ベースの優先順位設定
- バックグラウンド更新
- 効率的なキャッシュサイズ管理

### ローディング最適化
- Service Worker早期登録
- 重要リソースのプリロード
- 段階的リソース読み込み

### メモリ管理
- 自動的なキャッシュクリーンアップ
- メモリ使用量監視
- オブジェクトプールの活用

## セキュリティ

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: blob:;">
```

### データ保護
- ローカルストレージの暗号化
- 機密データの適切な処理
- クロスサイトスクリプティング防止

## ブラウザ対応

### 完全サポート
- Chrome 67+
- Edge 79+
- Firefox 63+

### 部分サポート
- Safari 11.1+ (一部制限)
- Samsung Internet 8.0+

### 機能検出
```javascript
this.features = {
    serviceWorkerSupported: 'serviceWorker' in navigator,
    manifestSupported: 'manifest' in document.createElement('link'),
    notificationSupported: 'Notification' in window,
    installPromptSupported: 'BeforeInstallPromptEvent' in window
};
```

## デプロイメント

### 本番環境要件
- HTTPS必須
- Service Worker配信
- 適切なキャッシュヘッダー
- Manifest.json配信

### CDN設定
- 静的アセットのCDN配信
- アイコンファイルの最適化
- 圧縮設定

## 監視・分析

### PWA メトリクス
- インストール率
- エンゲージメント率
- オフライン使用率
- 更新成功率

### パフォーマンス監視
- Service Worker応答時間
- キャッシュヒット率
- リソース読み込み時間

## トラブルシューティング

### 一般的な問題

#### Service Worker更新されない
- キャッシュバスティング
- skipWaiting実装
- 強制更新機能

#### インストールプロンプト表示されない
- HTTPS確認
- Manifest検証
- ブラウザ対応確認

#### オフライン機能動作しない
- Service Worker登録確認
- キャッシュ戦略検証
- ネットワーク状態確認

## 今後の拡張予定

### 新機能
- プッシュ通知
- バックグラウンド同期
- Web Share API拡張

### パフォーマンス向上
- Workbox導入検討
- キャッシュ戦略の最適化
- メモリ使用量の削減

---

このドキュメントは技術実装の詳細を示しています。ユーザー向けの説明は `pwa-user-guide.md` を参照してください。