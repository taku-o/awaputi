# Design Document

## Overview

ServiceWorkerのCache APIはHEADリクエストをサポートしていないため、HelpManagerやその他のコンポーネントがファイル存在確認に使用するHEADリクエストをキャッシュしようとするとエラーが発生する。この問題を解決するため、ServiceWorkerでHEADリクエストを適切に処理し、必要に応じて代替手段を提供する設計を実装する。

## Architecture

### Current Problem
1. HelpManager、TranslationLoader、FontSourceManager、AnalyticsErrorNotificationSystem、OfflineManagerがHEADリクエストを使用
2. ServiceWorkerがすべてのリクエストをインターセプトし、キャッシュしようとする
3. Cache API の `put()` メソッドがHEADリクエストを拒否し、エラーが発生

### Solution Architecture
1. **ServiceWorker Level**: HEADリクエストを検出し、キャッシュを試行せずにネットワークに直接パススルー
2. **Application Level**: HEADリクエストの代替として、軽量なGETリクエストを使用するオプションを提供
3. **Error Handling**: HEADリクエスト関連のエラーを適切にハンドリング

## Components and Interfaces

### 1. ServiceWorker Request Handler Enhancement

#### Modified Functions:
- `handlePWARequest(request)`: HEADリクエストの検出と特別処理
- `staleWhileRevalidateStrategy(request)`: HEADリクエストのスキップ
- `cacheResponse(request, response)`: HEADリクエストのキャッシュ試行を回避

#### New Functions:
- `isHeadRequest(request)`: HEADリクエストの判定
- `handleHeadRequest(request)`: HEADリクエスト専用ハンドラー

### 2. Request Method Detection

```javascript
function isHeadRequest(request) {
    return request.method === 'HEAD';
}
```

### 3. HEAD Request Handler

```javascript
async function handleHeadRequest(request) {
    try {
        // HEADリクエストはキャッシュせずに直接ネットワークに送信
        const response = await fetch(request);
        return response;
    } catch (error) {
        // ネットワークエラーの場合は適切なレスポンスを返す
        return new Response(null, {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}
```

### 4. Enhanced Request Processing Flow

```
Request → isHeadRequest? → Yes → handleHeadRequest → Network Only
                       ↓
                      No → Existing Strategy (Cache First/Network First/etc.)
```

## Data Models

### Request Classification
- **HEAD Requests**: ネットワークオンリー、キャッシュなし
- **GET Requests**: 既存のキャッシュ戦略を適用
- **Other Methods**: 既存の処理を維持

### Error Response Structure
```javascript
{
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
    }
}
```

## Error Handling

### ServiceWorker Level
1. HEADリクエストのキャッシュ試行エラーを防止
2. ネットワークエラー時の適切なフォールバック
3. エラーログの改善（HEADリクエスト関連エラーの分類）

### Application Level
1. HEADリクエスト失敗時のグレースフルデグラデーション
2. ファイル存在確認の代替手段の提供
3. オフライン時の適切なエラーハンドリング

## Testing Strategy

### Unit Tests
1. `isHeadRequest()` 関数のテスト
2. `handleHeadRequest()` 関数のテスト
3. HEADリクエストがキャッシュされないことの確認

### Integration Tests
1. HelpManagerのHEADリクエストがエラーを発生させないことの確認
2. ServiceWorkerがHEADリクエストを適切に処理することの確認
3. オフライン時のHEADリクエスト処理の確認

### E2E Tests
1. ゲーム再アクセス時にコンソールエラーが発生しないことの確認
2. ヘルプコンテンツの読み込みが正常に動作することの確認
3. オフライン時のヘルプコンテンツアクセスの確認

## Performance Considerations

### ServiceWorker Performance
- HEADリクエストの早期検出により、不要なキャッシュ処理を回避
- ネットワークオンリー処理により、レスポンス時間を最適化

### Application Performance
- ファイル存在確認の効率化
- 不要なエラーハンドリングの削減

## Security Considerations

### Request Validation
- HEADリクエストの送信先URLの検証
- 外部リソースへのHEADリクエストの制限

### Error Information
- HEADリクエストエラー時の情報漏洩防止
- 適切なエラーレスポンスの返却

## Implementation Phases

### Phase 1: ServiceWorker Enhancement
1. HEADリクエスト検出機能の実装
2. HEADリクエスト専用ハンドラーの実装
3. 既存のキャッシュ戦略からのHEADリクエスト除外

### Phase 2: Error Handling Improvement
1. HEADリクエスト関連エラーの分類
2. エラーログの改善
3. グレースフルデグラデーションの実装

### Phase 3: Testing and Validation
1. ユニットテストの実装
2. 統合テストの実装
3. E2Eテストの実装
4. パフォーマンステストの実行

## Backward Compatibility

- 既存のGETリクエストベースのキャッシュ戦略は変更なし
- HEADリクエストを使用している既存コンポーネントの動作は維持
- ServiceWorkerの既存機能に影響なし

## Monitoring and Logging

### ServiceWorker Logging
- HEADリクエストの処理状況をログ出力
- キャッシュスキップの理由を記録
- ネットワークエラーの詳細を記録

### Application Logging
- ファイル存在確認の成功/失敗状況
- HEADリクエストの使用状況
- エラー発生時の詳細情報