/**
 * StatisticsDataManager.js
 * 統計データの初期化、検証、永続化を担当するクラス
 * データ構造管理、バックアップ、復旧機能を提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';

/**
 * 統計データ管理クラス
 */
export class StatisticsDataManager {'
    '';
    constructor(''';
        this.dataVersion = '2.1.0';
        this.backupHistory = [];
        this.maxBackupCount = 10; }
    }

    /**
     * 統計データを初期化
     * @returns {Object} 初期化された統計データ'
     */''
    initializeStatistics(''';
                '0-1000': 0,'';
                '1001-5000': 0,'';
                '5001-10000': 0,'';
                '10001-25000': 0,'';
                '25001-50000': 0,'';
                '50001+': 0;
            },
            
            // 泡統計
            totalBubblesPopped: 0,
            totalBubblesMissed: 0,
            bubbleAccuracy: 0,
            bubbleTypeStats: { normal: 0,
                stone: 0,
                iron: 0,
                diamond: 0,
                pink: 0,
                poison: 0,
                spiky: 0,
                rainbow: 0,
                clock: 0,
                score: 0,
                electric: 0,
                escaping: 0,
                cracked: 0,
                boss: 0,
                // 新しい泡タイプ
                golden: 0,
                frozen: 0,
                magnetic: 0,
                explosive: 0,
                phantom: 0,
                multiplier: 0 }
            },
            
            // 効率統計
            efficiencyStats: { bubblesPerMinute: 0,
                bubblesPerSecond: 0,
                peakEfficiency: 0,
                efficiencyTrend: [],
                bestEfficiencySession: 0,
                worstEfficiencySession: Infinity }
            },
            
            // 反応時間統計
            reactionTimeStats: { average: 0,
                fastest: Infinity,
                slowest: 0,
                distribution: {''
                    'under_200ms': 0,'';
                    '200_500ms': 0,'';
                    '500_1000ms': 0,'';
                    'over_1000ms': 0 }
                },
                recentTimes: [] // 最新100回の反応時間;
            },
            
            // コンボ統計
            totalCombos: 0,
            highestCombo: 0,
            averageCombo: 0,
            comboBreaks: 0,
            
            // コンボ詳細統計
            comboDetailStats: { comboRanges: {''
                    '1-5': 0,'';
                    '6-10': 0,'';
                    '11-20': 0,'';
                    '21-50': 0,'';
                    '51+': 0 }
                },
                comboSuccessRate: 0,
                averageComboLength: 0,
                longestComboStreak: 0,
                comboRecoveryTime: 0 // コンボが切れてから次のコンボまでの時間;
            },
            
            // HP統計
            totalDamageTaken: 0,
            totalHpHealed: 0,
            timesRevived: 0,
            lowHpTime: 0, // HP10以下の時間;
            // HP詳細統計
            hpDetailStats: { criticalHpEvents: 0, // HP5以下になった回数
                nearDeathRecoveries: 0, // HP1から回復した回数;
                perfectHealthGames: 0, // ダメージを受けなかったゲーム数;
                averageDamagePerGame: 0,
                maxDamageInSingleGame: 0,
                healingEfficiency: 0 // 回復量/ダメージ量 }
            },
            
            // ステージ統計
            stageStats: {},
            stagesCompleted: 0,
            stagesFailed: 0,
            
            // ステージ詳細統計
            stageDetailStats: { favoriteStage: null,
                mostDifficultStage: null, }
                fastestClearTime: {},
                averageClearTime: {},
                stageRetryCount: {},
                stageCompletionRate: {},
                stagePerfectionRate: {} // ステージ別パーフェクト達成率
            },
            
            // 特殊効果統計
            bonusTimeActivated: 0,
            timeStopActivated: 0,
            chainReactionsTriggered: 0,
            screenShakesTriggered: 0,
            
            // 新しい効果統計
            scoreMultipliersUsed: 0,
            shieldActivations: 0,
            magnetEffectsTriggered: 0,
            freezeEffectsUsed: 0,
            explosiveChains: 0,
            phantomBubbleInteractions: 0,
            
            // プレイヤー行動統計
            playerBehaviorStats: { dragOperations: 0,
                averageDragDistance: 0,
                longestDrag: 0,
                shortestDrag: Infinity,
                dragAccuracy: 0,
                rapidClickCount: 0, // 短時間での連続クリック;
                pauseCount: 0,
                settingsChanges: 0 }
            },
            
            // 進捗統計
            progressStats: { achievementsUnlocked: 0,
                totalAP: 0,
                levelUps: 0,
                itemsPurchased: 0,
                tutorialsCompleted: 0,
                hintsUsed: 0 })
            })
            // 時間統計
            timeStats: { playTimeByHour: new Array(24).fill(0),
                playTimeByDay: new Array(7).fill(0),'';
                playTimeByMonth: new Array(12).fill(0'),
                peakPlayingHour: 0,
                peakPlayingDay: 0,
                firstPlayDate: null,
                lastPlayDate: null,
                longestBreak: 0, // 最長プレイ間隔;
                regularPlayStreak: 0 // 連続プレイ日数 }
            },
            
            // デバイス・環境統計
            deviceStats: { isMobile: false,''
                screenResolution: '','';
                browserInfo: '',
                performanceMetrics: {
                    averageFPS: 0,
                    memoryUsage: 0,
                    loadTime: 0 }
                }
            },
            
            // エラー・クラッシュ統計
            errorStats: { crashCount: 0,
                errorCount: 0,
                recoveryCount: 0,
                lastErrorTime: null, }
                commonErrors: {},
            
            // ソーシャル統計（新規追加、将来の機能用）
            socialStats: { shareCount: 0,
                challengesCompleted: 0,
                communityRank: 0,
                friendsConnected: 0 }
            }
        },
    }

    /**
     * セッション統計を初期化
     * @returns {Object} 初期化されたセッション統計
     */
    initializeSessionStats() {
        return { gamesThisSession: 0,
            scoreThisSession: 0,
            bubblesThisSession: 0,
    }
            playTimeThisSession: 0, };
            sessionStartTime: Date.now(); }
        };
    }

    /**
     * 統計データの検証
     * @param {Object} statistics - 検証対象の統計データ
     * @returns {Object} 検証結果と修復された統計データ
     */
    validateStatistics(statistics) {
        const issues = [];''
        const repaired = this.repairStatistics(statistics');
        
        // 基本フィールドの存在確認
        const requiredFields = ['';
            'totalGamesPlayed', 'totalPlayTime', 'totalScore',']';
            'bubbleTypeStats', 'stageStats', 'efficiencyStats'];
        ];
        
        for (const field of requiredFields) {
    }'
            if(!(field in statistics) {' }'
                issues.push(`Missing required field: ${field)`'});
            }
        }
        ';
        // データ型の検証
        if(typeof statistics.totalGamesPlayed !== 'number'') {'
            ';'
        }'
            issues.push('totalGamesPlayed must be a number''); }
        }'
        '';
        if(typeof statistics.bubbleTypeStats !== 'object'') {'
            ';'
        }'
            issues.push('bubbleTypeStats must be an object'); }
        }
        ';
        // 値の範囲検証
        if(statistics.totalGamesPlayed < 0') {'
            ';'
        }'
            issues.push('totalGamesPlayed cannot be negative'); }
        }'
        '';
        if(statistics.totalPlayTime < 0') {'
            ';'
        }'
            issues.push('totalPlayTime cannot be negative'); }
        }
        
        // データ整合性チェック
        const integrity = this.calculateDataIntegrity(statistics);
        
        return { isValid: issues.length === 0,
            issues,
            integrity, };
            repaired }
        };
    }

    /**
     * 統計データの修復
     * @param {Object} statistics - 修復対象の統計データ
     * @returns {Object} 修復された統計データ
     */
    repairStatistics(statistics) {
        const defaultStats = this.initializeStatistics();
        const repaired = this.deepMergeStatistics(defaultStats, statistics);
        
        // 数値フィールドの修復
        this.repairNumericFields(repaired);
        
        // 配列フィールドの修復
        this.repairArrayFields(repaired);
        
        // オブジェクトフィールドの修復
        this.repairObjectFields(repaired);
        
    }
        return repaired; }
    }

    /**
     * 数値フィールドの修復
     * @param {Object} statistics - 修復対象の統計データ
     */''
    repairNumericFields(statistics') {'
        const numericFields = ['';
            'totalGamesPlayed', 'totalPlayTime', 'totalScore',']';
            'totalBubblesPopped', 'totalDamageTaken'];
        ];'
        '';
        for (const field of numericFields') {''
            if(typeof statistics[field] !== 'number' || isNaN(statistics[field]) {
    }
                statistics[field] = 0; }
            }
            if (statistics[field] < 0) { statistics[field] = 0; }
            }
        }
        
        // Infinity値の修復
        if (statistics.shortestSession === Infinity) { statistics.shortestSession = 0; }
        }
    }

    /**
     * 配列フィールドの修復
     * @param {Object} statistics - 修復対象の統計データ
     */
    repairArrayFields(statistics) {
        if(!Array.isArray(statistics.timeStats? .playTimeByHour) {
    }
            statistics.timeStats.playTimeByHour = new Array(24).fill(0); }
        }
        
        if(!Array.isArray(statistics.timeStats?.playTimeByDay) { statistics.timeStats.playTimeByDay = new Array(7).fill(0); }
        }
        
        if(!Array.isArray(statistics.reactionTimeStats?.recentTimes) { statistics.reactionTimeStats.recentTimes = []; }
        }
    }

    /**
     * オブジェクトフィールドの修復
     * @param {Object} statistics - 修復対象の統計データ
     */''
    repairObjectFields(statistics') {'
        ';'
    }'
        if (typeof statistics.bubbleTypeStats !== 'object'') { }
            statistics.bubbleTypeStats = {};
        }'
        '';
        if(typeof statistics.stageStats !== 'object'') {
            
        }
            statistics.stageStats = {};
        }'
        '';
        if(typeof statistics.deviceStats !== 'object'') {
            statistics.deviceStats = { : undefined'
                isMobile: false,'';
                screenResolution: '','';
                browserInfo: '',
                performanceMetrics: {
                    averageFPS: 0,
                    memoryUsage: 0,
        }
                    loadTime: 0 }
                }
            },
        }
    }

    /**
     * 統計データの深いマージ
     * @param {Object} target - マージ先
     * @param {Object} source - マージ元
     * @returns {Object} マージされたオブジェクト
     */
    deepMergeStatistics(target, source) {
        
    }
        const result = { ...target };'
        '';
        for(const key in source') {'
            '';
            if(source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) {
        }
                result[key] = this.deepMergeStatistics(target[key] || {), source[key]); }
            } else { result[key] = source[key]; }
            }
        }
        
        return result;
    }

    /**
     * データ整合性を計算
     * @param {Object} statistics - 統計データ
     * @returns {Object} 整合性情報
     */
    calculateDataIntegrity(statistics) {
        const checks = {
            bubbleAccuracy: this.checkBubbleAccuracy(statistics),
            averageCalculations: this.checkAverageCalculations(statistics),
            timeConsistency: this.checkTimeConsistency(statistics),
    }
            stageConsistency: this.checkStageConsistency(statistics); }
        };
        
        const passedChecks = Object.values(checks).filter(check => check.passed).length;
        const totalChecks = Object.keys(checks).length;
        const integrityScore = (passedChecks / totalChecks) * 100;
        
        return { score: integrityScore,
            checks, };
            isHealthy: integrityScore >= 80 }
        },
    }

    /**
     * 泡の精度チェック
     * @param {Object} statistics - 統計データ
     * @returns {Object} チェック結果
     */
    checkBubbleAccuracy(statistics) {
        const totalAttempts = statistics.totalBubblesPopped + statistics.totalBubblesMissed;
        const calculatedAccuracy = totalAttempts > 0 ? (statistics.totalBubblesPopped / totalAttempts) * 100 : 0;
        const recordedAccuracy = statistics.bubbleAccuracy || 0;
        
        const difference = Math.abs(calculatedAccuracy - recordedAccuracy);
        
        return { passed: difference < 1, // 1%未満の差は許容
            calculated: calculatedAccuracy,
    }
            recorded: recordedAccuracy, };
            difference }
        };
    }

    /**
     * 平均計算のチェック
     * @param {Object} statistics - 統計データ
     * @returns {Object} チェック結果
     */
    checkAverageCalculations(statistics) {
        const checks = [];
        ;
        // 平均スコアのチェック
        if (statistics.totalGamesPlayed > 0') {
            const calculatedAvgScore = statistics.totalScore / statistics.totalGamesPlayed;
            const recordedAvgScore = statistics.averageScore || 0;
            ';'
            checks.push({')'
                field: 'averageScore'),
                passed: Math.abs(calculatedAvgScore - recordedAvgScore) < 1,
                calculated: calculatedAvgScore,
    }
                recorded: recordedAvgScore }
            }),
        }
        
        return { passed: checks.every(check = > check.passed) };
            details: checks }
        },
    }

    /**
     * 時間の一貫性チェック
     * @param {Object} statistics - 統計データ
     * @returns {Object} チェック結果
     */
    checkTimeConsistency(statistics) {
        const checks = [];
        ';
        // セッション時間の論理チェック
        if (statistics.longestSession < statistics.shortestSession && statistics.shortestSession !== Infinity') {'
            checks.push({')'
                issue: 'Longest session is shorter than shortest session',)
    }
                passed: false); }
        }
        
        return { passed: checks.length = == 0 };
            issues: checks }
        },
    }

    /**
     * ステージデータの一貫性チェック
     * @param {Object} statistics - 統計データ
     * @returns {Object} チェック結果
     */
    checkStageConsistency(statistics) {
        let totalStageGames = 0;
        
        for (const stageId in statistics.stageStats) {
            const stageData = statistics.stageStats[stageId];
    }
            totalStageGames += stageData.gamesPlayed || 0; }
        }
        
        const difference = Math.abs(totalStageGames - statistics.totalGamesPlayed);
        
        return { passed: difference <= statistics.totalGamesPlayed * 0.05, // 5%の差は許容
            totalStageGames,
            totalGamesPlayed: statistics.totalGamesPlayed, };
            difference }
        };
    }

    /**
     * データバージョンを取得
     * @returns {string} データバージョン
     */
    getDataVersion() { return this.dataVersion; }
    }

    /**
     * バックアップ履歴を取得
     * @returns {Array} バックアップ履歴
     */
    getBackupHistory() { return [...this.backupHistory]; }
    }

    /**
     * 環境情報を取得
     * @returns {Object} 環境情報
     */
    getEnvironmentInfo() {
        return { userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
    }
            onLine: navigator.onLine, };
            timestamp: Date.now(); }
        };
    }
}

// シングルトンインスタンス管理
let statisticsDataManagerInstance = null;

/**
 * StatisticsDataManagerのシングルトンインスタンスを取得
 * @returns {StatisticsDataManager} シングルトンインスタンス
 */
export function getStatisticsDataManager() { if (!statisticsDataManagerInstance) {
        statisticsDataManagerInstance = new StatisticsDataManager(); }
    }
    return statisticsDataManagerInstance;
}

/**
 * StatisticsDataManagerのシングルトンインスタンスを再初期化
 * @returns {StatisticsDataManager} 新しいシングルトンインスタンス
 */
export function reinitializeStatisticsDataManager() { ''
    statisticsDataManagerInstance = new StatisticsDataManager(' })