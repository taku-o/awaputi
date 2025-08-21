/**
 * 多言語対応パフォーマンス監視設定（自動生成）
 * 最終更新: 2025-01-28T00:00:00Z
 */

/**
 * パフォーマンスメトリクス設定の型定義
 */
export interface PerformanceMetric { threshold: number,
    track: boolean ,}

/**
 * パフォーマンスメトリクス集合の型定義
 */
export interface PerformanceMetrics { languageSwitchTime: PerformanceMetric;
    translationLoadTime: PerformanceMetric;
    fontLoadTime: PerformanceMetric,
    i18nMemoryUsage: PerformanceMetric
    }

/**
 * i18nパフォーマンス設定の型定義
 */
export interface I18nPerformanceConfig { enabled: boolean;
    metrics: PerformanceMetrics,
    alerts: Record<string, any>, }

/**
 * 多言語対応パフォーマンス監視設定
 */
export const i18nPerformanceConfig: I18nPerformanceConfig = { enabled: true,
    metrics: {
        languageSwitchTime: {
            threshold: 500,
    track: true ,};
        translationLoadTime: { threshold: 200,
    track: true };
        fontLoadTime: { threshold: 1000,
    track: true };
        i18nMemoryUsage: { threshold: 5242880, // 5MB in bytes
            track: true ,}
    };
    alerts: {};
export default i18nPerformanceConfig;