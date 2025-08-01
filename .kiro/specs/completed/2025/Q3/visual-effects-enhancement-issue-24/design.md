# Design Document

## Overview

視覚効果システムの強化により、既存のEffectManagerとParticleManagerを拡張し、より多様で魅力的な視覚効果を実現します。新しいエフェクトタイプの追加、品質制御システムの改善、パフォーマンス最適化、季節限定エフェクトの実装を通じて、ゲームの視覚的魅力を大幅に向上させます。

## Architecture

### Core Components

```
VisualEffectsSystem
├── EnhancedParticleManager (extends ParticleManager)
│   ├── BubbleEffectRenderer
│   ├── ComboEffectRenderer  
│   ├── SpecialEffectRenderer
│   └── SeasonalEffectRenderer
├── EnhancedEffectManager (extends EffectManager)
│   ├── ScreenTransitionManager
│   ├── LightingEffectManager
│   └── BackgroundEffectManager
├── AnimationManager
│   ├── UIAnimationController
│   ├── BubbleAnimationController
│   └── TransitionAnimationController
├── EffectQualityController
│   ├── PerformanceMonitor
│   ├── QualityAdjuster
│   └── ResourceManager
└── SeasonalEffectManager
    ├── ThemeManager
    ├── EventEffectManager
    └── CustomEffectManager
```

### Integration Points

- **GameEngine**: 中央制御とエフェクト統合
- **ConfigurationManager**: 品質設定とユーザー設定
- **AudioManager**: 音響・視覚効果の同期
- **PerformanceOptimizer**: 動的品質調整
- **AccessibilityManager**: アクセシビリティ対応

## Components and Interfaces

### EnhancedParticleManager

既存のParticleManagerを拡張し、新しいパーティクルタイプと効果を追加：

```javascript
class EnhancedParticleManager extends ParticleManager {
    // 新しいパーティクルタイプ
    createAdvancedBubbleEffect(x, y, bubbleType, bubbleSize, options = {})
    createEnhancedComboEffect(x, y, comboCount, comboType)
    createSpecialBubbleEffect(x, y, effectType, intensity)
    createSeasonalEffect(x, y, seasonType, eventType)
    
    // 背景パーティクル
    createBackgroundParticles(density, theme)
    updateBackgroundParticles(deltaTime)
    
    // パーティクル品質制御
    setParticleQuality(quality) // 'low', 'medium', 'high'
    adjustParticleCount(baseCount, quality)
    
    // 新しいパーティクルタイプ
    renderAdvancedParticle(context, particle)
    renderTrailParticle(context, particle)
    renderGlowParticle(context, particle)
}
```

### EnhancedEffectManager

既存のEffectManagerを拡張し、新しい画面効果を追加：

```javascript
class EnhancedEffectManager extends EffectManager {
    // 画面遷移効果
    addTransitionEffect(type, duration, options)
    addFadeTransition(duration, color, direction)
    addSlideTransition(duration, direction, easing)
    
    // 光源効果
    addLightSource(x, y, intensity, color, radius)
    updateLightSources(deltaTime)
    renderLighting(context)
    
    // 影効果
    addShadowEffect(object, lightSource)
    renderShadows(context)
    
    // リフレクション効果
    addReflectionEffect(surface, intensity)
    renderReflections(context)
    
    // 動的背景効果
    addBackgroundEffect(type, intensity, duration)
    updateBackgroundEffects(deltaTime)
}
```

### AnimationManager

UI要素とゲームオブジェクトのアニメーションを管理：

```javascript
class AnimationManager {
    constructor(canvas)
    
    // UI アニメーション
    animateUIElement(element, animationType, duration, options)
    animateScoreChange(oldScore, newScore, element, duration)
    animateMenuTransition(fromMenu, toMenu, transitionType)
    
    // バブルアニメーション
    animateBubbleSpawn(bubble, spawnType)
    animateBubbleDestroy(bubble, destroyType)
    animateBubbleMovement(bubble, targetPosition, duration)
    
    // ローディングアニメーション
    createLoadingAnimation(type, position, size)
    updateLoadingAnimation(deltaTime)
    
    // アニメーション制御
    pauseAnimations()
    resumeAnimations()
    clearAnimations()
}
```

### EffectQualityController

パフォーマンスに基づく動的品質制御：

```javascript
class EffectQualityController {
    constructor()
    
    // 品質レベル管理
    setQualityLevel(level) // 'low', 'medium', 'high', 'ultra'
    getQualityLevel()
    autoAdjustQuality(fps, memoryUsage)
    
    // エフェクト制御
    shouldRenderEffect(effectType, priority)
    getParticleCountMultiplier()
    getEffectIntensityMultiplier()
    
    // パフォーマンス監視
    monitorPerformance()
    getPerformanceMetrics()
    
    // リソース管理
    cleanupUnusedResources()
    optimizeMemoryUsage()
}
```

### SeasonalEffectManager

季節限定・イベント限定エフェクトの管理：

```javascript
class SeasonalEffectManager {
    constructor()
    
    // 季節テーマ
    setSeasonalTheme(season) // 'spring', 'summer', 'autumn', 'winter'
    getCurrentTheme()
    
    // イベントエフェクト
    activateEventEffects(eventType, duration)
    deactivateEventEffects()
    
    // カスタムテーマ
    loadCustomTheme(themeData)
    applyThemeToEffects(theme)
    
    // エフェクト変更
    modifyParticleColors(colorScheme)
    modifyBackgroundEffects(theme)
    addThemeSpecificEffects(theme)
}
```

## Data Models

### ParticleDefinition

```javascript
{
    id: string,
    type: 'basic' | 'advanced' | 'special' | 'seasonal',
    renderType: 'circle' | 'star' | 'diamond' | 'custom',
    physics: {
        gravity: number,
        friction: number,
        bounce: number,
        airResistance: number
    },
    appearance: {
        size: { min: number, max: number },
        color: string | string[] | function,
        opacity: { start: number, end: number },
        scale: { start: number, end: number }
    },
    animation: {
        rotation: { speed: number, direction: 'cw' | 'ccw' },
        pulse: { frequency: number, amplitude: number },
        trail: { length: number, fadeRate: number }
    },
    lifetime: { min: number, max: number },
    qualityScaling: {
        low: { countMultiplier: 0.25, sizeMultiplier: 0.8 },
        medium: { countMultiplier: 0.5, sizeMultiplier: 0.9 },
        high: { countMultiplier: 1.0, sizeMultiplier: 1.0 },
        ultra: { countMultiplier: 1.5, sizeMultiplier: 1.2 }
    }
}
```

### EffectDefinition

```javascript
{
    id: string,
    type: 'screen' | 'lighting' | 'background' | 'transition',
    priority: number, // 0-10, higher = more important
    performance: {
        cost: 'low' | 'medium' | 'high',
        minQuality: 'low' | 'medium' | 'high'
    },
    parameters: {
        intensity: { min: number, max: number, default: number },
        duration: { min: number, max: number, default: number },
        color: string | string[],
        easing: string
    },
    qualityVariants: {
        low: { /* simplified parameters */ },
        medium: { /* standard parameters */ },
        high: { /* enhanced parameters */ },
        ultra: { /* maximum quality parameters */ }
    }
}
```

### SeasonalTheme

```javascript
{
    id: string,
    name: string,
    season: 'spring' | 'summer' | 'autumn' | 'winter' | 'event',
    colorScheme: {
        primary: string[],
        secondary: string[],
        accent: string[]
    },
    particleModifications: {
        bubblePop: { colors: string[], additionalEffects: string[] },
        combo: { colors: string[], intensity: number },
        background: { type: string, density: number }
    },
    screenEffects: {
        tint: { color: string, intensity: number },
        overlay: { type: string, opacity: number }
    },
    duration: number | null, // null for permanent themes
    startDate: Date | null,
    endDate: Date | null
}
```

## Error Handling

### Error Categories

1. **Rendering Errors**: WebGL context loss, canvas errors
2. **Performance Errors**: Memory overflow, frame rate drops
3. **Configuration Errors**: Invalid effect parameters
4. **Resource Errors**: Missing textures, failed asset loading

### Error Recovery Strategies

```javascript
class EffectErrorHandler {
    handleRenderingError(error, context) {
        // Fallback to basic rendering
        // Disable problematic effects
        // Log error for debugging
    }
    
    handlePerformanceError(error, metrics) {
        // Automatically reduce quality
        // Clear unnecessary effects
        // Notify user if needed
    }
    
    handleConfigurationError(error, config) {
        // Use default configuration
        // Validate and sanitize settings
        // Provide user feedback
    }
    
    handleResourceError(error, resource) {
        // Use fallback resources
        // Retry loading with timeout
        // Graceful degradation
    }
}
```

## Testing Strategy

### Unit Tests

- **ParticleManager**: パーティクル生成、更新、描画
- **EffectManager**: 画面効果の適用、組み合わせ
- **AnimationManager**: アニメーション制御、タイミング
- **QualityController**: 品質調整、パフォーマンス監視

### Integration Tests

- **Effect Coordination**: 複数エフェクトの同時実行
- **Performance Impact**: 品質設定による影響測定
- **Configuration Sync**: 設定変更の反映確認
- **Audio-Visual Sync**: 音響効果との同期確認

### Performance Tests

- **Frame Rate Impact**: 各エフェクトのFPS影響測定
- **Memory Usage**: メモリリーク検出、使用量監視
- **Mobile Performance**: モバイルデバイスでの動作確認
- **Quality Scaling**: 品質レベル別パフォーマンス測定

### Visual Tests

- **Effect Appearance**: 各エフェクトの視覚的確認
- **Quality Differences**: 品質レベル間の差異確認
- **Seasonal Themes**: テーマ適用の視覚的確認
- **Accessibility**: アクセシビリティ機能の動作確認

### User Experience Tests

- **Effect Timing**: エフェクトのタイミング適切性
- **Visual Feedback**: ユーザーアクションへの応答性
- **Performance Perception**: 体感パフォーマンスの評価
- **Theme Consistency**: テーマの一貫性確認

## Performance Considerations

### Optimization Strategies

1. **Object Pooling**: パーティクルオブジェクトの再利用
2. **Batch Rendering**: 同種エフェクトのまとめて描画
3. **LOD System**: 距離・重要度による品質調整
4. **Culling**: 画面外エフェクトの描画スキップ
5. **Lazy Loading**: 必要時のみリソース読み込み

### Memory Management

```javascript
class EffectResourceManager {
    // リソースプール管理
    getParticleFromPool(type)
    returnParticleToPool(particle)
    
    // メモリ監視
    monitorMemoryUsage()
    cleanupUnusedResources()
    
    // リソース最適化
    optimizeTextures()
    compressEffectData()
    
    // ガベージコレクション支援
    scheduleCleanup()
    forceCleanup()
}
```

### Mobile Optimization

- **Touch-Optimized Effects**: タッチ操作に最適化されたエフェクト
- **Battery Consideration**: バッテリー消費を考慮した品質調整
- **Device Detection**: デバイス性能に基づく自動設定
- **Network Awareness**: ネットワーク状況に応じたリソース管理

## Accessibility Features

### Visual Accessibility

- **High Contrast Mode**: 高コントラスト表示対応
- **Color Blind Support**: 色覚異常者への配慮
- **Motion Sensitivity**: 動きに敏感なユーザーへの配慮
- **Flash Reduction**: 光過敏性発作の予防

### Alternative Feedback

```javascript
class AccessibilityEffectManager {
    // 代替視覚フィードバック
    provideAlternativeVisualFeedback(effectType, intensity)
    
    // 触覚フィードバック
    triggerHapticFeedback(pattern, intensity)
    
    // 音響代替
    provideAudioAlternative(visualEffect)
    
    // 設定管理
    applyAccessibilitySettings(settings)
}
```

## Integration with Existing Systems

### Configuration System

- **Dynamic Updates**: 実行時設定変更対応
- **Validation**: 設定値の妥当性検証
- **Migration**: 既存設定からの移行
- **Backup/Restore**: 設定のバックアップ・復元

### Audio System

- **Synchronized Effects**: 音響・視覚効果の同期
- **Cross-fade Support**: 音響エフェクトとの連携
- **Volume-based Scaling**: 音量に応じた視覚効果調整

### Performance System

- **Quality Negotiation**: パフォーマンスに基づく品質調整
- **Resource Sharing**: 他システムとのリソース共有
- **Priority Management**: エフェクト優先度管理

## Future Extensibility

### Plugin Architecture

```javascript
class EffectPlugin {
    constructor(name, version)
    
    // プラグインライフサイクル
    initialize(effectSystem)
    activate()
    deactivate()
    cleanup()
    
    // エフェクト提供
    registerEffects()
    registerParticleTypes()
    registerAnimations()
    
    // 設定管理
    getDefaultConfig()
    validateConfig(config)
    applyConfig(config)
}
```

### Custom Effect Creation

- **Effect Builder**: ビジュアルエフェクトビルダー
- **Particle Designer**: パーティクルデザインツール
- **Animation Timeline**: アニメーションタイムライン編集
- **Theme Creator**: カスタムテーマ作成ツール