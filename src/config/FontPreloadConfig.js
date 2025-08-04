/**
 * フォントプリロード設定（自動生成）
 * 生成日時: 2025-08-03T23:46:19.498Z
 */

export const fontPreloadConfig = {
  "preload": [
    "ja",
    "en",
    "zh-CN",
    "zh-TW",
    "ko"
  ],
  "fallbacks": {
    "ja": [
      "Hiragino Sans",
      "Yu Gothic",
      "Meiryo",
      "sans-serif"
    ],
    "zh-CN": [
      "PingFang SC",
      "Microsoft YaHei",
      "SimHei",
      "sans-serif"
    ],
    "zh-TW": [
      "PingFang TC",
      "Microsoft JhengHei",
      "PMingLiU",
      "sans-serif"
    ],
    "ko": [
      "Apple SD Gothic Neo",
      "Malgun Gothic",
      "Nanum Gothic",
      "sans-serif"
    ],
    "en": [
      "Arial",
      "Helvetica",
      "sans-serif"
    ]
  }
};

export const generatePreloadLinks = (language) => {
  const fonts = fontPreloadConfig.fallbacks[language] || fontPreloadConfig.fallbacks.en;
  return fonts.map(font => `<link rel="preload" href="/fonts/${font.replace(' ', '-').toLowerCase()}.woff2" as="font" type="font/woff2" crossorigin>`);
};

export default fontPreloadConfig;
