/**
 * Jest設定ファイル - ソーシャル機能統合テスト用
 * Issue #37 Task 21: 統合テスト実装
 */

export default {
    // テスト環境
    testEnvironment: 'jsdom',
    
    // テストファイルのパターン
    testMatch: [
        '**/src/tests/integration/**/*.test.js'
    ],
    
    // モジュール解決
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/src/tests/$1'
    },
    
    // ES6モジュールサポート
    extensionsToTreatAsEsm: ['.js'],
    
    // トランスフォーム設定
    transform: {
        '^.+\\.js$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', {
                    targets: { node: 'current' },
                    modules: false
                }]
            ]
        }]
    },
    
    // セットアップファイル
    setupFilesAfterEnv: [
        '<rootDir>/src/tests/integration/setup.js'
    ],
    
    // カバレッジ設定
    collectCoverage: true,
    collectCoverageFrom: [
        'src/core/SocialSharingManager.js',
        'src/core/ShareContentGenerator.js',
        'src/core/ShareButton.js',
        'src/core/ShareDialog.js',
        'src/core/LeaderboardManager.js',
        'src/core/ChallengeSystem.js',
        'src/ui/components/LeaderboardUI.js',
        'src/scenes/components/ChallengesTab.js',
        '!src/tests/**'
    ],
    
    coverageReporters: [
        'text',
        'html',
        'lcov',
        'json-summary'
    ],
    
    coverageDirectory: '<rootDir>/coverage/integration',
    
    // カバレッジ閾値
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 85,
            statements: 85
        }
    },
    
    // テストタイムアウト
    testTimeout: 30000,
    
    // 並列実行設定
    maxWorkers: '50%',
    
    // モック設定
    clearMocks: true,
    restoreMocks: true,
    
    // グローバル設定
    globals: {
        'process.env.NODE_ENV': 'test',
        'process.env.JEST_ENVIRONMENT': 'integration'
    },
    
    // 詳細な出力
    verbose: true,
    
    // エラー時の詳細表示
    errorOnDeprecated: true,
    
    // 非同期処理の検出
    detectOpenHandles: true,
    detectLeaks: true,
    
    // テスト結果のレポート
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: './coverage/integration/html-report',
            filename: 'integration-test-report.html',
            openReport: false,
            pageTitle: 'ソーシャル機能統合テスト結果',
            logoImgPath: './assets/logo.png',
            hideIcon: false,
            expand: true,
            customInfos: [
                {
                    title: 'プロジェクト',
                    value: 'BubblePop ソーシャル機能'
                },
                {
                    title: 'テストタイプ',
                    value: '統合テスト'
                },
                {
                    title: 'Issue',
                    value: '#37 Task 21'
                }
            ]
        }]
    ]
};