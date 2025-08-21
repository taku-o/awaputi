import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, it } from '@jest/globals';
/**
 * Path Mappings Configuration for Phase G Test Suite Repair
 * Phase G後のファイル再編成に対応したインポートパスマッピング
 */

export const PATH_CORRECTIONS = {
    // Achievement系コンポーネントの移動
    'AchievementNotificationSystem': {
        oldPaths: [
            '../../src/core/AchievementNotificationSystem.js'
        ],
        newPath: '../../src/core/achievements/AchievementNotificationSystem.js',
        description: 'AchievementNotificationSystem moved to achievements subdirectory during Phase G',
        phase: 'G'
    },

    // Debug系ファイルの utils → debug 移動
    'TestResultVisualizer': {
        oldPaths: [
            '../../src/utils/TestResultVisualizer.js'
        ],
        newPath: '../../src/debug/TestResultVisualizer.js',
        description: 'TestResultVisualizer moved from utils to debug during file reorganization',
        phase: 'G'
    },

    'ErrorReporter': {
        oldPaths: [
            '../../src/utils/ErrorReporter.js'
        ],
        newPath: '../../src/debug/ErrorReporter.js',
        description: 'ErrorReporter moved from utils to debug during file reorganization',
        phase: 'G'
    },

    // Audio系コンポーネントの accessibility 構造化
    'AudioDescriptionManager': {
        oldPaths: [
            './AudioDescriptionManager.js',
            '../AudioDescriptionManager.js'
        ],
        newPath: '../../src/audio/accessibility/AudioDescriptionManager.js',
        description: 'AudioDescriptionManager organized into audio/accessibility structure',
        phase: 'G'
    },

    'AudioCueManager': {
        oldPaths: [
            './AudioCueManager.js',
            '../AudioCueManager.js'
        ],
        newPath: '../../src/audio/accessibility/AudioCueManager.js',
        description: 'AudioCueManager organized into audio/accessibility structure',
        phase: 'G'
    },

    'AudioFeedbackManager': {
        oldPaths: [
            './AudioFeedbackManager.js',
            '../AudioFeedbackManager.js'
        ],
        newPath: '../../src/audio/accessibility/AudioFeedbackManager.js',
        description: 'AudioFeedbackManager organized into audio/accessibility structure',
        phase: 'G'
    },

    'AudioSettingsManager': {
        oldPaths: [
            './AudioSettingsManager.js',
            '../AudioSettingsManager.js'
        ],
        newPath: '../../src/audio/accessibility/AudioSettingsManager.js',
        description: 'AudioSettingsManager organized into audio/accessibility structure',
        phase: 'G'
    },

    // Visual Manager系の統合（深いネストから core 直下へ）
    'VisualFocusManager': {
        oldPaths: [
            '../../src/core/visual/focus/VisualFocusManager.js'
        ],
        newPath: '../../src/core/VisualFocusManager.js',
        description: 'VisualFocusManager consolidated back to core during Phase G cleanup',
        phase: 'G'
    },

    'VisualFeedbackManager': {
        oldPaths: [
            '../../src/core/visual/feedback/VisualFeedbackManager.js'
        ],
        newPath: '../../src/core/VisualFeedbackManager.js',
        description: 'VisualFeedbackManager consolidated back to core during Phase G cleanup',
        phase: 'G'
    },

    // Help系コンポーネントのパス正規化
    'HelpScene': {
        oldPaths: [
            '../../../src/scenes/HelpScene.js'
        ],
        newPath: '../../../src/scenes/HelpScene.js',
        description: 'HelpScene path normalization for accessibility tests',
        phase: 'G'
    },

    'TutorialOverlay': {
        oldPaths: [
            '../../../src/core/help/TutorialOverlay.js'
        ],
        newPath: '../../../src/core/help/TutorialOverlay.js',
        description: 'TutorialOverlay path normalization for accessibility tests',
        phase: 'G'
    },

    'TooltipSystem': {
        oldPaths: [
            '../../../src/core/help/TooltipSystem.js'
        ],
        newPath: '../../../src/core/help/TooltipSystem.js',
        description: 'TooltipSystem path normalization for accessibility tests',
        phase: 'G'
    },

    // Balance系コンポーネントの tools 移動
    'BalanceCalculator': {
        oldPaths: [
            './BalanceCalculator.js'
        ],
        newPath: '../../../tools/balance/BalanceCalculator.js',
        description: 'BalanceCalculator moved to tools/balance during reorganization',
        phase: 'G'
    },

    'BalanceDataLoader': {
        oldPaths: [
            './BalanceDataLoader.js'
        ],
        newPath: '../../../tools/balance/BalanceDataLoader.js',
        description: 'BalanceDataLoader moved to tools/balance during reorganization',
        phase: 'G'
    },

    'BalanceValidator': {
        oldPaths: [
            './BalanceValidator.js'
        ],
        newPath: '../../../tools/balance/BalanceValidator.js',
        description: 'BalanceValidator moved to tools/balance during reorganization',
        phase: 'G'
    },

    'BalanceExporter': {
        oldPaths: [
            './BalanceExporter.js'
        ],
        newPath: '../../../tools/balance/BalanceExporter.js',
        description: 'BalanceExporter moved to tools/balance during reorganization',
        phase: 'G'
    }
};

/**
 * 特定のファイルタイプに対する一般的な修正パターン
 */
export const COMMON_PATTERNS = {
    // utils → debug 移動パターン
    'utils_to_debug': {
        pattern: /^(.*)\/src\/utils\/(.*\.js')$/,'
        replacement: '$1/src/debug/$2',
        description: 'Utils to debug directory migration'
    },

    // core サブディレクトリの統合パターン
    'core_consolidation': {
        pattern: /^(.*)\/src\/core\/[^/]+\/([^/]+\.js')$/,'
        replacement: '$1/src/core/$2',
        description: 'Core subdirectory consolidation'
    },

    // accessibility 構造化パターン
    'accessibility_organization': {
        pattern: /^(.*)\/([A-Z][a-zA-Z]*Manager\.js')$/,'
        replacement: '$1/src/audio/accessibility/$2',
        description: 'Accessibility component organization'
    }
};

/**
 * ファイル拡張子の自動補完
 */
export const FILE_EXTENSIONS = ['.js', '.mjs', '.json', '];'

/**
 * 除外するディレクトリ（スキャン対象外）
 */
export const EXCLUDED_DIRECTORIES = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage'
];

/**
 * バックアップファイルのパターン
 */
export const BACKUP_PATTERNS = [
    '*.backup.*',
    '*_old.*',
    '*_original.*',
    '*.bak'
];

/**
 * Phase G特有の移動パターン検出
 */
export function detectPhaseGPattern(importPath {
    // Phase G で一般的に発生したファイル移動パターンを検出
    const patterns = [
        {
            name: 'achievement_reorganization',
            test: /Achievement.*\.js$/,
            suggestedPath: (path') => path.replace('/core/', '/core/achievements/') },'
        {
            name: 'debug_migration',
            test: /utils\/(Test|Error|Debug).*\.js$/,
            suggestedPath: (path') => path.replace('/utils/', '/debug/') },'
        {
            name: 'audio_accessibility',
            test: /Audio.*Manager\.js$/,
            suggestedPath: (path) => path.replace(/\.\/([^/]+')\.js$/, '../../src/audio/accessibility/$1.js') },'
        {
            name: 'visual_consolidation',
            test: /visual\/(focus|feedback)\/.*\.js$/,
            suggestedPath: (path) => path.replace(/\/visual\/(focus|feedback')\//, '/') },'
        {
            name: 'balance_tools',
            test: /Balance.*\.js$/,
            suggestedPath: (path) => path.replace(/\.\/([^/]+')\.js$/, '../../../tools/balance/$1.js') }'
    ];

    for (const pattern of patterns) {
        if (pattern.test.test(importPath) {
            return {
                pattern: pattern.name,
                suggestedPath: pattern.suggestedPath(importPath,
                description: `Phase G ${pattern.name} detected`
            };
        }
    }

    return null;
}

export default {
    PATH_CORRECTIONS,
    COMMON_PATTERNS,
    FILE_EXTENSIONS,
    EXCLUDED_DIRECTORIES,
    BACKUP_PATTERNS,
    detectPhaseGPattern)
');'