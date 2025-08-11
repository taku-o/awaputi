/**
 * 多言語対応パフォーマンス監視設定（自動生成）
 * 最終更新: 2025-01-28T00:00:00Z
 */

export const i18nPerformanceConfig = {
  "enabled": true,
  "metrics": {
    "languageSwitchTime": {
      "threshold": 500,
      "track": true
    },
    "translationLoadTime": {
      "threshold": 200,
      "track": true
    },
    "fontLoadTime": {
      "threshold": 1000,
      "track": true
    },
    "i18nMemoryUsage": {
      "threshold": 5242880,
      "track": true
    }
  },
  "alerts": {}
};

export default i18nPerformanceConfig;
