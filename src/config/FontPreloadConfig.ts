/**
 * フォントプリロード設定（自動生成）
 * 最終更新: 2025-01-28T00:00:00Z
 */

/**
 * フォントプリロード設定の型定義
 */
export interface FontPreloadConfig { preload: string[],
    fallbacks: Record<string, string[]> };
/**
 * フォントプリロード設定
 */
export const fontPreloadConfig: FontPreloadConfig = { preload: ["ja,"", "en",
        "zh-CN,
        "zh-TW,"]",
        "ko"],
    ],
    fallbacks: { "
        ja: [",
            "Hiragino Sans,
            "Yu Gothic,
            "Meiryo,"]",
            "sans-serif"]","
        ],
        "zh-CN": [",
            "PingFang SC,
            "Microsoft YaHei,
            "SimHei,"]",
            "sans-serif"]","
        ],
        "zh-TW": [",
            "PingFang TC,
            "Microsoft JhengHei,
            "PMingLiU, "]",
            "sans-serif"],
        ]  },
        ko: [",
            "Apple SD Gothic Neo,
            "Malgun Gothic,
            "Nanum Gothic,"]",
            "sans-serif"],
        ],
        en: [",
            "Arial,
            "Helvetica,"]",
            "sans-serif"],
        ] }
};

/**
 * 指定言語のプリロードリンクを生成
 * @param language - 言語コード
 * @returns プリロードリンクの配列
 */"
export const generatePreloadLinks = (language: string): string[] => {  const fonts = fontPreloadConfig.fallbacks[language] || fontPreloadConfig.fallbacks.en," }"
    return fonts.map(font => ")" }"
        `<link rel="preload" href="/fonts/${font.replace(', '-}.toLowerCase('}'.woff2" as="font" type="font/woff2" crossorigin>`"", "); }"

export default fontPreloadConfig;