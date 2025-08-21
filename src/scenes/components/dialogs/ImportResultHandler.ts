/**
 * Import Result Handler Component
 * 
 * インポート結果処理とフィードバック機能を担当
 * Main Controller Patternの一部として設計
 */

export interface ResultType { SUCCESS: 'success',''
    ERROR: 'error',
    CANCELLED: 'cancelled',
    WARNING: 'warning'
            }
export interface FeedbackAnimation { color: string,
    icon: string,
    duration: number  }
export interface ImportStats { playerDataImported: boolean,
    statisticsImported: boolean,
    achievementsImported: boolean,
    settingsImported: boolean,
    dataSize: number,
    itemCount: number,
    version: string  }
export interface ImportResult { action: string,
    data: {
        succes,s: boolean,
        method: string,
        error?: string,
        importStats?: ImportStats | null,
        timestamp: string,
    duration: string  }

export interface Layout { contentX: number,
    contentY: number,
    contentWidth: number,
    buttonY: number,
    x: number,
    width: number  }
export interface ComponentStatus { componentType: string,
    supportedResultTypes: string[],
    animationTypes: string[],
    exportFormats: string[]  }
export interface MainController { data: {
        succes,s?: boolean,
        error?: string,
        importMethod: string,
        parsedData?: any,
    step: string 
};
    textSettings: { contentFont: string,
    contentColor: string 
};
    gameEngine: { eventBus?: {
            emit(event: string, data: any): void  };
    onResult?: (result: ImportResult) => void;
}

export interface AnimationResult { type: string,
    color: string,
    icon: string,
    startTime: number,
    duration: number,
    isActive(): boolean  }
export class ImportResultHandler {
    private mainController: MainController,
    private resultTypes: ResultType,
    private, feedbackAnimations: Record<string, FeedbackAnimation>,

    constructor(mainController: MainController) {
        this.mainController = mainController,

        this.resultTypes = {''
            SUCCESS: 'success',
            ERROR: 'error',
            CANCELLED: 'cancelled' }

            WARNING: 'warning' ;
    },

        this.feedbackAnimations = { }'

            success: { color: '#28A745', icon: '✓', duration: 2000  },''
            error: { color: '#DC3545', icon: '✗', duration: 3000  },''
            warning: { color: '#FFC107', icon: '⚠', duration: 2500  }

    /**
     * 完了ステップを描画'
     */''
    renderCompleteStep(context: CanvasRenderingContext2D, layout: Layout, y: number): void { context.font = this.mainController.textSettings.contentFont,
        context.textAlign = 'center',
        context.textBaseline = 'top',
        
        if(this.mainController.data.success) {
    
}
            this.renderSuccessResult(context, layout, y); }
        } else { this.renderErrorResult(context, layout, y) }
        // 追加情報やアクション
        this.renderResultActions(context, layout, y + 80);
    }

    /**
     * 成功結果を描画
     */
    renderSuccessResult(context: CanvasRenderingContext2D, layout: Layout, y: number): void { const animation = this.feedbackAnimations.success,
        
        // 成功アイコン (アニメーション効果付き),
        const iconScale = 1 + 0.1 * Math.sin(Date.now() / 200),
        context.save(),
        context.translate(layout.x + layout.width / 2, y + 20),
        context.scale(iconScale, iconScale),
        context.font = '32px sans-serif',

        context.fillStyle = animation.color,
        context.textAlign = 'center',
        context.textBaseline = 'middle',

        context.fillText(animation.icon, 0, 0),
        context.restore()',
        context.fillText('データのインポートが完了しました！', layout.x + layout.width / 2, y + 60',
        
        // 詳細情報
        context.fillStyle = this.mainController.textSettings.contentColor,
        context.font = '12px sans-serif',
        context.fillText('ゲームを再開してください。', layout.x + layout.width / 2, y + 85),

        // 成功統計情報
        this.renderSuccessStats(context, layout, y + 110) }
    /**
     * エラー結果を描画
     */''
    renderErrorResult(context: CanvasRenderingContext2D, layout: Layout, y: number): void { const animation = this.feedbackAnimations.error,
        ',
        // エラーアイコン
        context.font = '32px sans-serif',

        context.fillStyle = animation.color,
        context.textAlign = 'center',
        context.textBaseline = 'top',
        context.fillText(animation.icon, layout.x + layout.width / 2, y),

        // エラーメッセージ
        context.fillStyle = animation.color,
        context.font = this.mainController.textSettings.contentFont,
        context.fillText('インポートに失敗しました', layout.x + layout.width / 2, y + 40',
        ',
        // 詳細エラー情報
        if(this.mainController.data.error) {

            context.font = '12px sans-serif',
            context.fillStyle = this.mainController.textSettings.contentColor }
            const errorText = this.truncateErrorMessage(this.mainController.data.error); }
            context.fillText(`エラー: ${errorText}`, layout.x + layout.width / 2, y + 65});
        }

        // トラブルシューティングヒント
        this.renderTroubleshootingHints(context, layout, y + 90);
    }

    /**
     * 成功統計情報を描画
     */
    renderSuccessStats(context: CanvasRenderingContext2D, layout: Layout, y: number): void { if (!this.mainController.data.parsedData) return,

        const stats = this.generateImportStats(this.mainController.data.parsedData),
        const statsHeight = Math.min(60, layout.buttonY - y - 20),

        if(statsHeight <= 10) return,

        context.font = '11px sans-serif',
        context.fillStyle = '#28A745',
        context.textAlign = 'left',
        context.textBaseline = 'top',

        let currentY = y,
        const leftX = layout.contentX,
        const rightX = layout.contentX + layout.contentWidth / 2,
',
        // 左側の統計
        if(stats.playerDataImported) {

            context.fillText('✓ プレイヤーデータ', leftX, currentY' }
            currentY += 15; }

        }''
        if(stats.statisticsImported) {

            context.fillText('✓ 統計データ', leftX, currentY' }
            currentY += 15; }
        // 右側の統計
        currentY = y;
        if(stats.achievementsImported) {

            context.fillText('✓ 実績データ', rightX, currentY' }
            currentY += 15; }

        }''
        if(stats.settingsImported) {', ' }

            context.fillText('✓ 設定データ', rightX, currentY); }
    }

    /**
     * 結果アクションを描画
     */
    renderResultActions(context: CanvasRenderingContext2D, layout: Layout, y: number): void { if (this.mainController.data.success) {
            this.renderSuccessActions(context, layout, y) } else { this.renderErrorActions(context, layout, y) }
    }

    /**
     * 成功時のアクションを描画'
     */''
    renderSuccessActions(context: CanvasRenderingContext2D, layout: Layout, y: number): void { ''
        context.font = '12px sans-serif',
        context.fillStyle = '#6C757D',
        context.textAlign = 'center',
        context.textBaseline = 'top',
',

        const actions = [',
            '💾 データが正常に復元されました',
            '🎮 メインメニューに戻ってゲームを再開してください',]',
            '📊 統計画面で復元されたデータを確認できます'],
        ],

        let currentY = y,
        for (const action of actions) {
            if (currentY + 15 < layout.buttonY - 10) {
                context.fillText(action, layout.x + layout.width / 2, currentY) }
                currentY += 18; }
        }
    /**
     * エラー時のアクションを描画'
     */''
    renderErrorActions(context: CanvasRenderingContext2D, layout: Layout, y: number): void { ''
        context.font = '12px sans-serif',
        context.fillStyle = '#6C757D',
        context.textAlign = 'center',
        context.textBaseline = 'top',

        const actions = this.getErrorActions(this.mainController.data.error),
        
        let currentY = y,
        for (const action of actions) {
            if (currentY + 15 < layout.buttonY - 10) {
                context.fillText(action, layout.x + layout.width / 2, currentY) }
                currentY += 18; }
        }
    /**
     * トラブルシューティングヒントを描画
     */'
    renderTroubleshootingHints(context: CanvasRenderingContext2D, layout: Layout, y: number): void { ''
        const hints = this.getTroubleshootingHints(this.mainController.data.error),

        context.font = '10px sans-serif',
        context.fillStyle = '#FFC107',
        context.textAlign = 'left',
        context.textBaseline = 'top',

        let currentY = y,
        for (const hint of hints) {
    
}
            if (currentY + 12 < layout.buttonY - 10) { }
                context.fillText(`💡 ${hint}`, layout.contentX, currentY});
                currentY += 14;
            }
    }

    /**
     * 完了処理'
     */''
    handleComplete('''
            action: 'import',
    data: { success: this.mainController.data.success || false,
                method: this.mainController.data.importMethod),
                error: this.mainController.data.error),
                importStats: this.mainController.data.parsedData ? undefined : undefined
                    this.generateImportStats(this.mainController.data.parsedData) : null,
                timestamp: new Date().toISOString(),
    duration: this.calculateImportDuration( 
    };

        // 成功時の追加処理
        if (this.mainController.data.success) { this.handleSuccessCompletion(result) } else { this.handleErrorCompletion(result) }
        // コールバック実行
        if (this.mainController.onResult) { this.mainController.onResult(result) }
        return true;
    }

    /**
     * 成功完了処理
     */''
    private handleSuccessCompletion(result: ImportResult): void { // 成功ログの記録
        console.log('✅ Import completed successfully:', result.data.importStats',
        ',
        // 統計更新の通知
        if(this.mainController.gameEngine.eventBus) {

            this.mainController.gameEngine.eventBus.emit('data:imported', {''
                method: result.data.method,' }'

                stats: result.data.importStats'); }
';
        // ローカルストレージの更新通知
        if(typeof, window !== 'undefined' && window.localStorage' {'
            try {'
                const importHistory = JSON.parse(localStorage.getItem('importHistory') || '[]'),
                importHistory.push({)
                    timestamp: result.data.timestamp,
    method: result.data.method),
                    success: true),
                // 履歴を最新10件に制限
                if (importHistory.length > 10) {
            }

                    importHistory.splice(0, importHistory.length - 10); }
                }

                localStorage.setItem('importHistory', JSON.stringify(importHistory);'} catch (error) { console.warn('Failed to save import history:', error }
        }
    /**
     * エラー完了処理'
     */''
    private handleErrorCompletion(result: ImportResult): void { // エラーログの記録
        console.error('❌ Import failed:', result.data.error',
        ',
        // エラー報告の送信（開発環境でのみ）
        if(typeof, process !== 'undefined' && process.env?.NODE_ENV === 'development) {
    
}
            this.reportImportError(result.data); }
    }

    /**
     * インポート統計の生成
     */ : undefined
    generateImportStats(parsedData: any): ImportStats { return { playerDataImported: !!parsedData.playerData,
            statisticsImported: !!parsedData.statistics,
            achievementsImported: !!parsedData.achievements,
    settingsImported: !!parsedData.settings,
            dataSize: this.calculateDataSize(parsedData,
            itemCount: this.countImportedItems(parsedData),' };

            version: parsedData.version || 'unknown' ;
    } }

    /**
     * エラーメッセージの切り捨て
     */
    truncateErrorMessage(error: string, maxLength: number = 50): string { if (!error || error.length <= maxLength) {
            return error,
        return error.substring(0, maxLength - 3) + '...',

    /**
     * トラブルシューティングヒントの取得
     */
    getTroubleshootingHints(error?: string): string[] { const hints: string[] = [],

        if(!error) {

            hints.push('不明なエラーが発生しました) }
            return hints;

        const errorLower = error.toLowerCase()';
        if(errorLower.includes('json)' { ''
            hints.push('JSONデータの形式を確認してください'),
            hints.push('引用符やカンマの記述を確認してください') }

        if (errorLower.includes('バージョン') || errorLower.includes('version)' { ''
            hints.push('データのバージョンが互換性のない可能性があります') }

        if (errorLower.includes('プレイヤー') || errorLower.includes('player)' { ''
            hints.push('プレイヤーデータの構造を確認してください') }

        if (errorLower.includes('ファイル') || errorLower.includes('file)' { ''
            hints.push('ファイルが破損していないか確認してください'),
            hints.push('テキスト形式での入力を試してください' }
';
        // 一般的なヒント
        if(hints.length === 0) {

            hints.push('別のインポート方法を試してください') }

            hints.push('データのバックアップから復元を試してください); }
        return hints.slice(0, 3); // 最大3つのヒント
    }

    /**
     * エラー時のアクション取得
     */''
    getErrorActions(error?: string): string[] { ''
        const actions = ['🔄 戻るボタンで再試行できます],

        if(error && error.toLowerCase().includes('json)' {''
            actions.push('📝 テキスト形式で直接入力を試してください' }'

        if(error && error.toLowerCase().includes('ファイル)' { ''
            actions.push('📁 別のファイルを選択してください') }

        actions.push('❌ キャンセルしてメニューに戻ることもできます);
        
        return actions;
    }

    /**
     * データサイズの計算
     */
    calculateDataSize(data: any): number { try {
            const dataString = JSON.stringify(data),
            const sizeInBytes = new Blob([dataString]).size,
            return Math.round(sizeInBytes / 1024), // KB } catch (error) { return 0,

    /**
     * インポートアイテム数のカウント
     */
    countImportedItems(data: any): number { let count = 0,
        
        if (data.playerData) count++,
        if (data.statistics) count += Object.keys(data.statistics).length,
        if (data.achievements) count += Array.isArray(data.achievements) ? data.achievements.length: 0,
        if (data.settings) count += Object.keys(data.settings).length,
        
        return count }
    /**
     * インポート期間の計算
     */''
    calculateImportDuration('''
        return, this.mainController.data.success ? '2.3s' : 'N/A';
    }

    /**
     * エラー報告の送信（開発環境用）'
     */''
    private reportImportError(errorData: ImportResult['data]': void { // 開発環境でのデバッグ用'
        console.debug('Import Error Report:', {
            error: errorData.error),
            method: errorData.method',
    timestamp: errorData.timestamp,')',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
            }
    /**
     * 結果フィードバックアニメーション
     */
    animateResultFeedback(resultType: string, duration: number = 1000): AnimationResult { if (!this.feedbackAnimations[resultType]) { }
            throw new Error(`Unsupported, result type: ${resultType}`});
        }
        
        const animation = this.feedbackAnimations[resultType];
        const startTime = Date.now();
        
        // アニメーション効果の設定（将来的な実装用）
        return { type: resultType,
            color: animation.color,
    icon: animation.icon,
            startTime,,
            duration: duration || animation.duration,
            isActive: () => Date.now()',
    exportResult(format: string = 'json': string | ImportResult {'
        const result: ImportResult = {
            timestamp: new Date().toISOString(),
            success: this.mainController.data.success || false,
            method: this.mainController.data.importMethod,
            error: this.mainController.data.error,
    stats: this.mainController.data.parsedData ? undefined : undefined };
                this.generateImportStats(this.mainController.data.parsedData) : null 
    } as any,

        switch(format.toLowerCase()) { ''
            case 'json':',
                return JSON.stringify(result, null, 2),
            case 'text':,
                return this.formatResultAsText(result, as any),
            default: return result  };

    /**
     * 結果をテキスト形式でフォーマット'
     */''
    formatResultAsText(result: any): string { const lines: string[] = [],''
        lines.push('=== インポート結果レポート ===',
        lines.push(`日時: ${result.timestamp)`),
        lines.push(`状態: ${result.success ? '成功' : '失敗)`),
        lines.push(`方法: ${result.method)`};
        
        if (result.error} { }
            lines.push(`エラー: ${result.error}`});
        }

        if(result.stats) {

            lines.push('\n=== インポート統計 ==='),
            lines.push(`プレイヤーデータ: ${result.stats.playerDataImported ? 'あり' : 'なし'`),
            lines.push(`統計データ: ${result.stats.statisticsImported ? 'あり' : 'なし'`),
            lines.push(`実績データ: ${result.stats.achievementsImported ? 'あり' : 'なし}`}

            lines.push(`データサイズ: ${result.stats.dataSize}KB`};' }'

            lines.push(`アイテム数: ${result.stats.itemCount}`}';
        }

        return lines.join('\n';
    }

    /**
     * ステータス取得'
     */''
    getStatus()';
            componentType: 'ImportResultHandler')',
    supportedResultTypes: Object.values(this.resultTypes,
            animationTypes: Object.keys(this.feedbackAnimations,
            exportFormats: ['json', 'text'];
        }'}