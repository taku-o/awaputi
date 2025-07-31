# Analytics

## 概要

ファイル: `utils/Analytics.js`  
最終更新: 2025/7/19 2:00:50

## 目次

## クラス
- [Analytics](#analytics)
## 定数
- [error](#error)
- [eventData](#eventdata)
- [errorData](#errordata)
- [trackFPS](#trackfps)
- [currentTime](#currenttime)
- [fps](#fps)
- [memoryInfo](#memoryinfo)
- [usagePercent](#usagepercent)
- [updateEngagement](#updateengagement)
- [analytics](#analytics)

---

## Analytics

### コンストラクタ

```javascript
new Analytics()
```

### プロパティ

| プロパティ名 | 説明 |
|-------------|------|
| `isEnabled` | 説明なし |
| `sessionId` | 説明なし |
| `startTime` | 説明なし |

### メソッド

#### if

**シグネチャ**:
```javascript
 if (this.isEnabled)
```

**パラメーター**:
- `this.isEnabled`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(this.isEnabled);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeAnalytics

**シグネチャ**:
```javascript
 initializeAnalytics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeAnalytics();

// initializeAnalyticsの実用的な使用例
const result = instance.initializeAnalytics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (__ANALYTICS_ID__ && typeof gtag !== 'undefined')
```

**パラメーター**:
- `__ANALYTICS_ID__ && typeof gtag !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(__ANALYTICS_ID__ && typeof gtag !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializeErrorTracking

**シグネチャ**:
```javascript
 initializeErrorTracking()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializeErrorTracking();

// initializeErrorTrackingの実用的な使用例
const result = instance.initializeErrorTracking(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (__SENTRY_DSN__ && typeof Sentry !== 'undefined')
```

**パラメーター**:
- `__SENTRY_DSN__ && typeof Sentry !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(__SENTRY_DSN__ && typeof Sentry !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### init

**シグネチャ**:
```javascript
 init({
        dsn: __SENTRY_DSN__,
        environment: __PROD__ ? 'production' : 'development',
        release: __VERSION__,
        beforeSend(event)
```

**パラメーター**:
- `{
        dsn: __SENTRY_DSN__`
- `environment: __PROD__ ? 'production' : 'development'`
- `release: __VERSION__`
- `beforeSend(event`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.init({
        dsn: __SENTRY_DSN__, environment: __PROD__ ? 'production' : 'development', release: __VERSION__, beforeSend(event);

// initの実用的な使用例
const result = instance.init(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Filter out non-critical errors

**シグネチャ**:
```javascript
 if (event.exception)
```

**パラメーター**:
- `event.exception`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(event.exception);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (error && error.type === 'ChunkLoadError')
```

**パラメーター**:
- `error && error.type === 'ChunkLoadError'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(error && error.type === 'ChunkLoadError');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### initializePerformanceTracking

**シグネチャ**:
```javascript
 initializePerformanceTracking()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.initializePerformanceTracking();

// initializePerformanceTrackingの実用的な使用例
const result = instance.initializePerformanceTracking(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Web Vitals tracking

**シグネチャ**:
```javascript
 if (typeof webVitals !== 'undefined')
```

**パラメーター**:
- `typeof webVitals !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof webVitals !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackEvent

**シグネチャ**:
```javascript
 trackEvent(eventName, parameters = {})
```

**パラメーター**:
- `eventName`
- `parameters = {}`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackEvent(eventName, parameters = {});

// trackEventの実用的な使用例
const result = instance.trackEvent(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof gtag !== 'undefined')
```

**パラメーター**:
- `typeof gtag !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof gtag !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Also log to console in development

**シグネチャ**:
```javascript
 if (__DEV__)
```

**パラメーター**:
- `__DEV__`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(__DEV__);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackGameStart

**シグネチャ**:
```javascript
 trackGameStart(stageName)
```

**パラメーター**:
- `stageName`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackGameStart(stageName);

// trackGameStartの実用的な使用例
const result = instance.trackGameStart(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackGameEnd

**シグネチャ**:
```javascript
 trackGameEnd(stageName, score, duration, reason)
```

**パラメーター**:
- `stageName`
- `score`
- `duration`
- `reason`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackGameEnd(stageName, score, duration, reason);

// trackGameEndの実用的な使用例
const result = instance.trackGameEnd(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackBubbleInteraction

**シグネチャ**:
```javascript
 trackBubbleInteraction(bubbleType, action, score = 0)
```

**パラメーター**:
- `bubbleType`
- `action`
- `score = 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackBubbleInteraction(bubbleType, action, score = 0);

// trackBubbleInteractionの実用的な使用例
const result = instance.trackBubbleInteraction(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackPerformanceIssue

**シグネチャ**:
```javascript
 trackPerformanceIssue(issueType, details)
```

**パラメーター**:
- `issueType`
- `details`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackPerformanceIssue(issueType, details);

// trackPerformanceIssueの実用的な使用例
const result = instance.trackPerformanceIssue(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackError

**シグネチャ**:
```javascript
 trackError(error, context = '')
```

**パラメーター**:
- `error`
- `context = ''`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackError(error, context = '');

// trackErrorの実用的な使用例
const result = instance.trackError(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Send to Sentry if available

**シグネチャ**:
```javascript
 if (typeof Sentry !== 'undefined')
```

**パラメーター**:
- `typeof Sentry !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof Sentry !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Send to Google Analytics as exception

**シグネチャ**:
```javascript
 if (typeof gtag !== 'undefined')
```

**パラメーター**:
- `typeof gtag !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof gtag !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### sendWebVital

**シグネチャ**:
```javascript
 sendWebVital(metric)
```

**パラメーター**:
- `metric`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.sendWebVital(metric);

// sendWebVitalの実用的な使用例
const result = instance.sendWebVital(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (typeof gtag !== 'undefined')
```

**パラメーター**:
- `typeof gtag !== 'undefined'`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(typeof gtag !== 'undefined');

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackCustomMetrics

**シグネチャ**:
```javascript
 trackCustomMetrics()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackCustomMetrics();

// trackCustomMetricsの実用的な使用例
const result = instance.trackCustomMetrics(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (currentTime - lastTime >= 1000)
```

**パラメーター**:
- `currentTime - lastTime >= 1000`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(currentTime - lastTime >= 1000);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (fps < 30)
```

**パラメーター**:
- `fps < 30`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(fps < 30);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

Track memory usage (if available)

**シグネチャ**:
```javascript
 usage (if available)
```

**パラメーター**:
- `if available`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(if available);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (usagePercent > 80)
```

**パラメーター**:
- `usagePercent > 80`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(usagePercent > 80);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### generateSessionId

**シグネチャ**:
```javascript
 generateSessionId()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.generateSessionId();

// generateSessionIdの実用的な使用例
const result = instance.generateSessionId(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackVisibilityChange

**シグネチャ**:
```javascript
 trackVisibilityChange()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackVisibilityChange();

// trackVisibilityChangeの実用的な使用例
const result = instance.trackVisibilityChange(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### trackEngagement

**シグネチャ**:
```javascript
 trackEngagement()
```

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.trackEngagement();

// trackEngagementの実用的な使用例
const result = instance.trackEngagement(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (isActive)
```

**パラメーター**:
- `isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (!isActive)
```

**パラメーター**:
- `!isActive`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(!isActive);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```

#### if

**シグネチャ**:
```javascript
 if (engagementTime > 0)
```

**パラメーター**:
- `engagementTime > 0`

**使用例**:
```javascript
// 基本的な使用方法
const result = instance.if(engagementTime > 0);

// ifの実用的な使用例
const result = instance.if(/* 適切なパラメータ */);
// 結果を適切に処理
console.log('Operation result:', result);
```


---

## 定数

| 定数名 | 説明 |
|--------|------|
| `error` | 説明なし |
| `eventData` | 説明なし |
| `errorData` | 説明なし |
| `trackFPS` | 説明なし |
| `currentTime` | 説明なし |
| `fps` | 説明なし |
| `memoryInfo` | 説明なし |
| `usagePercent` | 説明なし |
| `updateEngagement` | 説明なし |
| `analytics` | Create singleton instance |

---

