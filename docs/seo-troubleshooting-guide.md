# SEO トラブルシューティングガイド

BubblePopのSEO最適化システムで発生する可能性のある問題とその解決方法について説明します。

## 一般的な問題と解決方法

### 1. メタタグが表示されない

**症状**:
- FacebookやTwitterでリンクを共有しても画像や説明が表示されない
- Google検索結果でタイトルや説明が正しく表示されない

**原因**:
- SEOシステムの初期化エラー
- メタタグの動的生成の失敗
- キャッシュの問題

**解決方法**:

```javascript
// 1. ブラウザコンソールでSEOシステムの状態確認
console.log('SEO Meta Manager:', window.seoMetaManager);
console.log('Structured Data Engine:', window.structuredDataEngine);

// 2. 手動でメタタグを再生成
if (window.seoMetaManager) {
    try {
        const metaTags = await window.seoMetaManager.generateDynamicMetaTags();
        console.log('Generated meta tags:', metaTags);
    } catch (error) {
        console.error('Meta tag generation failed:', error);
    }
}

// 3. フォールバック確認
const metaInjectionPoint = document.getElementById('seo-meta-injection-point');
if (metaInjectionPoint && metaInjectionPoint.innerHTML.includes('Fallback')) {
    console.warn('Using fallback meta tags - check SEO system initialization');
}
```

**予防策**:
- SEOシステムの初期化ログを確認
- エラーハンドリングの強化
- フォールバックメタタグの適切な設定

### 2. 構造化データエラー

**症状**:
- Google Rich Results Testでエラー表示
- 構造化データがGoogle検索結果に反映されない

**原因**:
- JSON-LD形式の構文エラー
- 必須フィールドの欠落
- スキーマの不適切な使用

**解決方法**:

```javascript
// 1. 構造化データの検証
const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
if (structuredDataScript) {
    try {
        const structuredData = JSON.parse(structuredDataScript.textContent);
        console.log('Structured data is valid JSON:', structuredData);
        
        // 必須フィールドの確認
        const requiredFields = ['@context', '@type', 'name', 'description'];
        requiredFields.forEach(field => {
            if (!structuredData[field]) {
                console.error(`Missing required field: ${field}`);
            }
        });
    } catch (error) {
        console.error('Invalid JSON in structured data:', error);
    }
}

// 2. スキーマ検証ツールでの確認
// https://validator.schema.org/
// https://search.google.com/test/rich-results
```

**予防策**:
- 定期的なスキーマ検証
- 必須フィールドの自動チェック
- 開発環境でのテスト実行

### 3. ソーシャルメディア共有の問題

**症状**:
- Facebook/TwitterでOG画像が表示されない
- 共有時の説明文が古い内容のまま

**原因**:
- OG画像のパスエラー
- キャッシュの問題
- 画像サイズの不適切

**解決方法**:

```javascript
// 1. OG画像の存在確認
const ogImage = document.querySelector('meta[property="og:image"]');
if (ogImage) {
    const imageUrl = ogImage.getAttribute('content');
    
    // 画像の存在確認
    const img = new Image();
    img.onload = () => console.log('OG image loaded successfully:', imageUrl);
    img.onerror = () => console.error('OG image failed to load:', imageUrl);
    img.src = imageUrl;
}

// 2. Facebookデバッガーでキャッシュクリア
// https://developers.facebook.com/tools/debug/

// 3. Twitterカード検証
// https://cards-dev.twitter.com/validator
```

**解決策**:
- 正しい画像パスの設定
- 画像サイズの最適化（OG: 1200x630px、Twitter: 1200x600px）
- CDN使用時のCORS設定

### 4. 多言語SEOの問題

**症状**:
- hreflangタグが機能しない
- 言語別ページが正しく認識されない

**原因**:
- hreflangタグの形式エラー
- 言語コードの不整合
- 相互リンクの欠落

**解決方法**:

```javascript
// 1. hreflangタグの確認
const hreflangTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
console.log('Hreflang tags found:', hreflangTags.length);

hreflangTags.forEach(tag => {
    const hreflang = tag.getAttribute('hreflang');
    const href = tag.getAttribute('href');
    console.log(`${hreflang}: ${href}`);
    
    // URL存在確認
    fetch(href, { method: 'HEAD' })
        .then(response => {
            if (!response.ok) {
                console.error(`Hreflang URL not accessible: ${href}`);
            }
        })
        .catch(error => console.error(`Hreflang URL error: ${href}`, error));
});

// 2. x-defaultタグの確認
const xDefault = document.querySelector('link[hreflang="x-default"]');
if (!xDefault) {
    console.warn('Missing x-default hreflang tag');
}
```

**予防策**:
- 正しい言語コード形式の使用（ja, en, zh-CN等）
- x-defaultタグの必須実装
- 相互リンクの整合性チェック

### 5. パフォーマンス問題

**症状**:
- ページ読み込み速度の低下
- SEO処理による応答遅延

**原因**:
- 大量のメタタグ生成処理
- 画像最適化の処理負荷
- 同期的な初期化処理

**解決方法**:

```javascript
// 1. パフォーマンス測定
console.time('SEO initialization');
await initializeSEOSystem();
console.timeEnd('SEO initialization');

// 2. 非同期処理への変更
const seoInitPromise = initializeSEOSystem();
// 他の初期化処理を並行実行
const gameInitPromise = initializeGame();

await Promise.all([seoInitPromise, gameInitPromise]);

// 3. 遅延読み込みの実装
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadSEOEnhancements();
        }
    });
});
```

**最適化策**:
- SEO処理の非同期化
- 画像遅延読み込み
- キャッシュの効率的活用

## デバッグツール

### 1. ブラウザ開発者ツール

```javascript
// SEOデバッグ情報の出力
function debugSEOSystem() {
    console.group('SEO Debug Information');
    
    // メタタグ確認
    console.log('Title:', document.title);
    console.log('Description:', document.querySelector('meta[name="description"]')?.content);
    console.log('Keywords:', document.querySelector('meta[name="keywords"]')?.content);
    
    // OGタグ確認
    const ogTags = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
        ogTags[tag.getAttribute('property')] = tag.getAttribute('content');
    });
    console.log('Open Graph tags:', ogTags);
    
    // 構造化データ確認
    const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
    console.log('Structured data scripts:', structuredDataScripts.length);
    
    console.groupEnd();
}

// 実行
debugSEOSystem();
```

### 2. SEOテストの実行

```javascript
// 自動SEOテストの実行
const seoTester = new SEOTester();
const testResults = await seoTester.runComprehensiveTest({
    includeMetaTags: true,
    includeStructuredData: true,
    includeSocialMedia: true,
    includeAccessibility: true
});

console.log('SEO Test Results:', testResults);
```

### 3. 外部検証ツール

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Schema.org Validator**: https://validator.schema.org/

## 監視とメンテナンス

### 1. 自動監視の設定

```javascript
// SEO健全性チェック
function setupSEOHealthCheck() {
    const seoMonitor = new SEOMonitor();
    
    seoMonitor.startMonitoring({
        interval: 300000, // 5分間隔
        includeMetaTags: true,
        includeLighthouse: true,
        enableAlerts: true
    });
    
    // アラートコールバックの設定
    seoMonitor.addAlertCallback((alert) => {
        console.error('SEO Alert:', alert.message);
        // 必要に応じて通知送信
    });
}
```

### 2. 定期メンテナンス

**週次チェック**:
- Google Search Consoleでの検索パフォーマンス確認
- 構造化データエラーの確認
- ソーシャルメディア共有テスト

**月次チェック**:
- Lighthouseスコアの測定
- 競合サイトとの比較
- 新機能に対するSEO対応の検討

**四半期チェック**:
- SEO戦略の見直し
- 新しいSEO要件への対応
- パフォーマンス指標の分析

## 緊急時対応

### 1. SEOシステム完全停止

```javascript
// 緊急時フォールバック
function emergencySEOFallback() {
    const head = document.head;
    
    // 最小限のメタタグを手動追加
    const essentialMeta = [
        { name: 'description', content: 'BubblePop - HTML5 bubble popping game' },
        { property: 'og:title', content: 'BubblePop' },
        { property: 'og:description', content: 'Fun HTML5 bubble popping game' },
        { property: 'og:type', content: 'website' }
    ];
    
    essentialMeta.forEach(meta => {
        const tag = document.createElement('meta');
        if (meta.name) tag.setAttribute('name', meta.name);
        if (meta.property) tag.setAttribute('property', meta.property);
        tag.setAttribute('content', meta.content);
        head.appendChild(tag);
    });
}
```

### 2. ログとエラー追跡

```javascript
// エラーログの収集
window.addEventListener('error', (event) => {
    if (event.filename.includes('seo/')) {
        console.error('SEO System Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
        
        // エラー報告システムに送信
        reportSEOError({
            type: 'javascript_error',
            details: event
        });
    }
});
```

## よくある質問 (FAQ)

**Q: メタタグが更新されない**
A: ブラウザキャッシュやCDNキャッシュが原因の可能性があります。強制リロード（Ctrl+F5）を試してください。

**Q: モバイルでOG画像が表示されない**
A: 画像サイズとファイル形式を確認してください。WebP形式の場合、フォールバック用のPNG/JPEG画像も必要です。

**Q: 多言語サイトでhreflangが効かない**
A: x-defaultタグの設定と、各言語ページでの相互リンクを確認してください。

**Q: Lighthouseスコアが低い**
A: SEO処理の非同期化と画像最適化を確認してください。不要なメタタグの削除も効果的です。

## サポート情報

- **開発者ドキュメント**: `docs/seo-configuration-guide.md`
- **API仕様**: `docs/seo-api-reference.md`
- **パフォーマンスガイド**: `docs/seo-performance-guide.md`

問題が解決しない場合は、ブラウザコンソールのエラーログとともに開発チームにご相談ください。