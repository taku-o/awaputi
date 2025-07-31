# SEO設定ガイド

BubblePopゲームのSEO最適化システムの設定と活用方法について説明します。

## 概要

BubblePopのSEO最適化システムは以下のコンポーネントで構成されています：

- **SEOMetaManager**: 動的メタタグ管理
- **StructuredDataEngine**: 構造化データ生成
- **SocialMediaOptimizer**: ソーシャルメディア最適化
- **FaviconManager**: ファビコン管理
- **SitemapGenerator**: サイトマップ生成
- **SEOTester**: 自動テスト・検証
- **SEOMonitor**: パフォーマンス監視

## 設定オプション

### 1. 基本設定 (SEOConfig.js)

```javascript
const SEOConfig = {
    baseUrl: 'https://your-domain.com',
    supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
    defaultLanguage: 'ja',
    
    metaTags: {
        siteName: 'BubblePop',
        twitterHandle: '@your_handle',
        authorName: 'BubblePop Team'
    },
    
    socialMedia: {
        ogImageSize: { width: 1200, height: 630 },
        twitterImageSize: { width: 1200, height: 600 },
        enableDynamicImages: true
    }
};
```

### 2. メタタグ設定

```javascript
// 動的メタタグの生成
const seoMetaManager = new SEOMetaManager();
await seoMetaManager.generateDynamicMetaTags();

// ゲーム状態に基づく共有コンテンツ
await seoMetaManager.updateForSharing({
    type: 'achievement',
    title: '実績解除: 初心者マスター',
    description: 'BubblePopで「初心者マスター」を達成しました！',
    imageUrl: '/assets/images/achievement-share.png'
});
```

### 3. 構造化データ設定

```javascript
// VideoGameスキーマの生成
const structuredDataEngine = new StructuredDataEngine();
const gameSchema = await structuredDataEngine.generateVideoGameSchema();

// 組織スキーマの追加
const orgSchema = await structuredDataEngine.generateOrganizationSchema();
```

### 4. ソーシャルメディア最適化

```javascript
const socialOptimizer = new SocialMediaOptimizer();

// プラットフォーム別最適化
await socialOptimizer.optimizeForPlatform('twitter', {
    title: 'BubblePop - 泡割りゲーム',
    description: 'HTML5で作られた楽しい泡割りゲーム',
    image: '/assets/images/twitter-share.png'
});
```

## カスタマイズ方法

### 1. 新しい言語の追加

1. `src/locales/`に新しい言語ディレクトリを作成
2. SEOConfigに言語コードを追加
3. メタタグ翻訳を追加

```javascript
// config/languages.jsonに追加
{
    "fr": {
        "name": "Français",
        "direction": "ltr",
        "font": "system-ui"
    }
}
```

### 2. カスタムメタタグの追加

```javascript
// SEOMetaManagerの拡張
class CustomSEOMetaManager extends SEOMetaManager {
    async generateCustomMetaTags() {
        const metaTags = await super.generateDynamicMetaTags();
        
        // カスタムメタタグを追加
        metaTags += `<meta name="custom-tag" content="custom-value">`;
        
        return metaTags;
    }
}
```

### 3. 構造化データの拡張

```javascript
// カスタムスキーマの追加
const customSchema = {
    "@type": "Game",
    "gameItem": [
        {
            "@type": "Thing",
            "name": "Special Bubble",
            "description": "Magic bubble with special powers"
        }
    ]
};

await structuredDataEngine.addCustomSchema(customSchema);
```

## パフォーマンス最適化

### 1. 画像最適化

- WebP形式をサポート（PNG/JPEGフォールバック付き）
- 適切な圧縮レベル設定
- レスポンシブ画像対応

```javascript
const optimizedImage = await socialOptimizer.optimizeImage(
    originalImagePath,
    { format: 'webp', quality: 85, fallback: 'png' }
);
```

### 2. キャッシュ設定

```javascript
// メタタグキャッシュの設定
const cache = new Map();
const cacheKey = generateCacheKey(gameState);

if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
}
```

### 3. 非同期読み込み

```javascript
// SEOシステムの非同期初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeSEOSystem();
    } catch (error) {
        console.error('SEO system initialization failed:', error);
    }
});
```

## 統合方法

### 1. ゲーム状態との連携

```javascript
// GameEngineでのイベント発火
this.emit('gameStateChanged', {
    state: 'gameOver',
    score: this.playerData.currentScore,
    timestamp: Date.now()
});

this.emit('achievementUnlocked', {
    id: achievement.id,
    name: achievement.name,
    description: achievement.description
});

this.emit('highScoreUpdated', {
    score: finalScore,
    stageId: stageId,
    previousScore: currentHighScore
});
```

### 2. SEOイベントハンドラー

```javascript
// GameEngineでのSEO統合
this.on('gameStateChanged', async (gameState) => {
    await this.updateSEOMetadata(gameState);
});

this.on('achievementUnlocked', async (achievement) => {
    await this.updateSEOForAchievement(achievement);
});

this.on('highScoreUpdated', async (score) => {
    await this.updateSEOForHighScore(score);
});
```

## 高度な機能

### 1. A/Bテスト対応

```javascript
// メタタグのA/Bテスト
const variant = Math.random() < 0.5 ? 'A' : 'B';
const titleVariants = {
    A: 'BubblePop - 楽しい泡割りゲーム',
    B: 'BubblePop - HTML5アクションゲーム'
};

await seoMetaManager.updateTitle(titleVariants[variant]);
```

### 2. 地域別最適化

```javascript
// 地域別コンテンツ
const region = detectUserRegion();
const localizedContent = await getLocalizedSEOContent(region);

await seoMetaManager.updateForRegion(region, localizedContent);
```

### 3. 動的サイトマップ

```javascript
// ゲーム進捗に基づくサイトマップ生成
const sitemapGenerator = new SitemapGenerator();
const playerProgress = await getPlayerProgress();

const dynamicUrls = generateDynamicUrls(playerProgress);
await sitemapGenerator.addUrls(dynamicUrls);
```

## ベストプラクティス

### 1. メタタグの最適化

- **タイトル**: 10-60文字
- **説明文**: 50-160文字
- **キーワード**: 10個以下
- **OG画像**: 1200x630px推奨

### 2. 構造化データ

- Schema.org準拠
- 必須フィールドの完備
- JSONエラーの回避

### 3. パフォーマンス

- メタタグ生成: <100ms
- 画像最適化: <500ms
- キャッシュ活用: 90%以上

### 4. 多言語対応

- hreflangタグの正確な実装
- 言語別コンテンツの一貫性
- 文化的適応の考慮

## 次のステップ

1. **Google Search Console設定**: ウェブマスター用ツールの統合
2. **ソーシャルメディア分析**: 共有状況のトラッキング
3. **パフォーマンス監視**: Lighthouseスコアの継続監視
4. **A/Bテスト実装**: メタタグ効果の測定

詳細なトラブルシューティング情報については、`seo-troubleshooting-guide.md`を参照してください。