# ソーシャルメディア用アセット

このディレクトリには、各種ソーシャルメディアプラットフォーム用に最適化された画像アセットが含まれています。

## ファイル構成

### Open Graph用画像
- `og-image.png` - 1200x630px - デフォルトのOpen Graph画像
- `og-image-landscape.png` - 1200x630px - 横長レイアウト版
- `og-image-portrait.png` - 1200x630px - 縦長コンテンツ版

### Twitter Card用画像
- `twitter-card.png` - 1200x600px - デフォルトのTwitter Card画像
- `twitter-summary.png` - 1200x600px - サマリー用画像
- `twitter-summary-large.png` - 1200x600px - 大型サマリー用画像

### LinkedIn用画像
- `linkedin-share.png` - 1200x627px - LinkedIn共有用画像

### Pinterest用画像
- `pinterest-share.png` - 1000x1500px - Pinterest共有用縦長画像

### その他
- `default-share.png` - フォールバック用画像

## 画像仕様

各プラットフォームの推奨仕様に従って作成されています：

- **Facebook/Open Graph**: 1200x630px (1.91:1)
- **Twitter**: 1200x600px (2:1)
- **LinkedIn**: 1200x627px
- **Pinterest**: 1000x1500px (2:3)

## 動的画像生成

`SocialMediaOptimizer`クラスにより、ゲーム状態に基づいた動的な画像生成も可能です：

- スコア達成時の共有画像
- 実績解除時の共有画像
- コンボ記録時の共有画像

## 使用方法

```javascript
import { SocialMediaOptimizer } from '../src/seo/SocialMediaOptimizer.js';

const optimizer = new SocialMediaOptimizer(localizationManager);

// プラットフォーム別最適化
const facebookContent = await optimizer.generateOptimizedContent('facebook', {
    title: 'ハイスコア達成！',
    description: 'BubblePopで新記録を更新しました！',
    gameState: { score: 150000, combo: 25 }
});

// 動的画像生成
const dynamicImage = await optimizer.generateDynamicSocialImage(gameState, 'twitter');
```

## 注意事項

- 画像ファイルは実際の本番環境に合わせて適切な画像に置き換える必要があります
- 各プラットフォームのガイドラインに従ってテキストと画像のバランスを調整してください
- キャッシュバスティング機能により、プラットフォーム側のキャッシュ問題を回避できます