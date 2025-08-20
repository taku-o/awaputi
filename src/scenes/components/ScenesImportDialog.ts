/**
 * データインポートダイアログ - Main Controller
 * 
 * Main Controller Patternを採用し、各専門コンポーネントを統制
 * 多様なデータ形式に対応した包括的インポート機能を提供
 * 
 * **Architecture**: Main Controller Pattern
 * - **ImportMethodSelector**: インポート方法選択UI（ファイル選択、UI描画、ユーザー操作）
 * - **ImportDataProcessor**: データ処理・検証（データ解析、検証、形式検出、処理）
 * - **ImportProgressManager**: 進捗追跡（プログレス監視、ステップ管理、ステータス追跡）
 * - **ImportResultHandler**: 結果処理・フィードバック（結果処理、ユーザーフィードバック、エラー処理、完了）
 * 
 * **Import Features**:
 * - Multi-format data support (JSON, CSV, XML, binary)
 * - Step-by-step import wizard interface  
 * - Real-time progress tracking and feedback
 * - Data validation and integrity checking
 * - Error handling with user-friendly messages
 * - Rollback capability for failed imports
 * 
 * **Usage Examples**:
 * ```javascript
 * const importDialog = new ImportDialog(gameEngine, eventBus, state);
 * 
 * // Show import dialog
 * const result = await importDialog.show({ *   allowedFormats: ['json', 'csv'])
 *   maxFileSize: 10 * 1024 * 1024 // 10MB);
 * );
 * 
 * // Handle import result  
 * if (result.success') {''
 *   console.log('Import completed:', result.data) }
 * }
 * ```
 * 
 * **Supported Import Methods**:
 * - File upload (drag & drop, file picker)
 * - Direct paste from clipboard
 * - URL import from remote sources
 * - QR code scanning (mobile)
 * 
 * @class ImportDialog'
 * @extends ScenesBaseDialog  ''
 * @version 1.2.0 (Phase F.4 - Main Controller Pattern')
 * @since UserInfoScene component implementation
 * 
 * Phase F.4 - Peripheral File Splitting Project'
 */''
import { ScenesBaseDialog, GameEngine, EventBus, GameState } from './ScenesBaseDialog.js';

// Type definitions for import dialog
export interface ImportValidationResult { isValid: boolean,
    errors?: string[];
    info?: {
        recordCount: number,
        createdAt: string }
    };
}

export interface ImportPlayerData { username?: string;
    ap?: number;
    tap?: number;
    highScores?: Record<string, number>;
    unlockedStages?: string[];
    ownedItems?: string[];
    gamesPlayed?: number;
    totalPlayTime?: number;
    bubblesPopped?: number;
    exportedAt?: string;
    createdAt?: string; }
}

export interface ImportGameSettings { graphics?: Record<string, unknown>;
    audio?: Record<string, unknown>;
    gameplay?: Record<string, unknown>;
    accessibility?: Record<string, unknown>; }
}

export interface ImportAchievementData { achievements?: Array<{
        id: string,
        name: string,
        description: string,
        progress?: number;
        requirement?: number;
        unlockedAt?: string; }
    }>;
}

export interface ImportData extends ImportPlayerData, ImportGameSettings, ImportAchievementData { [key: string]: unknown, }
}

export interface GameEngineWithData extends GameEngine { playerData?: {
        username?: string;
        ap?: number;
        tap?: number;
        highScores?: Record<string, number>;
        unlockedStages?: string[];
        ownedItems?: string[];
        [key: string]: unknown, }
    };
    gameSettings?: ImportGameSettings;
    achievementManager?: { ''
        unlockAchievement: (id: string, notify: boolean') => void }
    };
}'
'';
export type ImportType = 'playerData' | 'gameSettings' | 'achievements';

/**
 * シーン用インポートダイアログ
 * ゲーム内でのデータインポート機能を提供
 * @extends ScenesBaseDialog
 */
export class ScenesImportDialog extends ScenesBaseDialog { // インポート用の設定
    private selectedFile: File | null;
    private importData: ImportData | null;
    private validationResult: ImportValidationResult | null;
    // インポートタイプ
    private importType: ImportType;
    // プレビューデータ
    private previewData: unknown | null;
    private showPreview: boolean;
    // ファイル入力エレメント
    private fileInput: HTMLInputElement | null;
    constructor(gameEngine: GameEngine, eventBus: EventBus, state: GameState) {
';'
        '';
        super(gameEngine, eventBus, state');
        
        // インポート用の設定
        this.selectedFile = null;
        this.importData = null;
        this.validationResult = null;
        ;
        // インポートタイプ
        this.importType = 'playerData';
        
        // プレビューデータ
        this.previewData = null;
        this.showPreview = false;
        ;
        // ボタン設定
        this.setupButtons([')'';
            { text: 'ファイル選択', callback: () => this.selectFile()

    }
    }'
            { text: 'インポート', callback: () => this.executeImport() }]'
            { text: 'キャンセル', callback: () => this.handleCancel() }]
        ]);
        
        // レイアウト調整
        this.layout.width = 500;
        this.layout.height = 400;
        
        // ファイル入力エレメント
        this.fileInput = null;
        this.createFileInput();
    }
    
    /**
     * ファイル入力エレメントを作成
     */''
    private createFileInput()';
        if(typeof document !== 'undefined'') {'
            '';
            this.fileInput = document.createElement('input'');''
            this.fileInput.type = 'file';''
            this.fileInput.accept = '.json,.txt';''
            this.fileInput.style.display = 'none';''
            this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e);
        }
            document.body.appendChild(this.fileInput); }
        }
    }
    
    /**
     * ダイアログコンテンツをレンダリング
     * @param context - Canvas描画コンテキスト
     */
    protected renderContent(context: CanvasRenderingContext2D): void { const contentX = this.layout.x + this.layout.padding;
        const contentY = this.layout.y + this.layout.titleHeight + this.layout.padding;
        const contentWidth = this.layout.width - (this.layout.padding * 2);
        let currentY = contentY;
        
        // インポートタイプ選択
        this.renderImportTypeSelection(context, contentX, currentY, contentWidth);
        currentY += 80;
        
        // ファイル選択状態
        this.renderFileSelection(context, contentX, currentY, contentWidth);
        currentY += 60;
        
        // バリデーション結果
        if(this.validationResult) {
            this.renderValidationResult(context, contentX, currentY, contentWidth);
        }
            currentY += 80; }
        }
        
        // プレビュー表示
        if (this.showPreview && this.previewData) { this.renderDataPreview(context, contentX, currentY, contentWidth); }
        }
    }
    
    /**
     * インポートタイプ選択をレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     */''
    private renderImportTypeSelection(context: CanvasRenderingContext2D, x: number, y: number, width: number'): void { ''
        context.fillStyle = '#333333';''
        context.font = '14px Arial, sans-serif';''
        context.textAlign = 'left';''
        context.textBaseline = 'top';''
        context.fillText('インポートタイプ:', x, y');
         }'
        const types: Array<{ key: ImportType; label: string }> = [''
            { key: 'playerData', label: 'プレイヤーデータ' },''
            { key: 'gameSettings', label: 'ゲーム設定' },']'
            { key: 'achievements', label: '実績データ' }]
        ];
        ';'
        types.forEach((type, index) => {  ''
            const typeY = y + 25 + (index * 20');
            const isSelected = this.importType === type.key;
            ';
            // ラジオボタン
            context.fillStyle = isSelected ? '#4CAF50' : '#CCCCCC';''
            context.fillRect(x + 10, typeY, 12, 12');
            ';
            // ラベル
            context.fillStyle = '#333333'; }
            context.fillText(type.label, x + 30, typeY); }
        };
    }
    
    /**
     * ファイル選択状態をレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅'
     */''
    private renderFileSelection(context: CanvasRenderingContext2D, x: number, y: number, width: number'): void { ''
        context.fillStyle = '#333333';''
        context.font = '14px Arial, sans-serif';''
        context.textAlign = 'left';''
        context.textBaseline = 'top';''
        context.fillText('選択ファイル:', x, y');
        ';
        // ファイル表示エリア
        context.strokeStyle = '#CCCCCC';'
        context.lineWidth = 1;''
        context.strokeRect(x, y + 20, width, 30');'
        '';
        const fileName = this.selectedFile ? this.selectedFile.name: 'ファイルが選択されていません','';
        context.fillStyle = this.selectedFile ? '#333333' : '#999999';''
        context.font = '12px Arial, sans-serif';''
        context.textAlign = 'left';''
        context.textBaseline = 'middle';
        context.fillText(fileName, x + 10, y + 35); }
    }
    
    /**
     * バリデーション結果をレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅'
     */''
    private renderValidationResult(context: CanvasRenderingContext2D, x: number, y: number, width: number'): void { const result = this.validationResult!;
        const isValid = result.isValid;'
        '';
        context.fillStyle = isValid ? '#4CAF50' : '#FF5722';''
        context.font = 'bold 14px Arial, sans-serif';''
        context.textAlign = 'left';''
        context.textBaseline = 'top';''
        context.fillText(isValid ? '✓ ファイルは有効です' : '✗ ファイルが無効です', x, y);'
        '';
        if(!isValid && result.errors') {'
            '';
            context.fillStyle = '#FF5722';''
            context.font = '12px Arial, sans-serif';
        }
            result.errors.forEach((error, index) => { }
                context.fillText(`• ${error}`, x + 10, y + 25 + (index * 15);
            };
        }'
        '';
        if(isValid && result.info') {'
            '';
            context.fillStyle = '#666666';''
            context.font = '12px Arial, sans-serif';'
        }'
            context.fillText(`データ数: ${result.info.recordCount || 0)`, x + 10, y + 25');' }'
            context.fillText(`作成日: ${result.info.createdAt || '不明')`, x + 10, y + 40});
        }
    }
    
    /**
     * データプレビューをレンダリング
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅'
     */''
    private renderDataPreview(context: CanvasRenderingContext2D, x: number, y: number, width: number'): void { ''
        context.fillStyle = '#333333';''
        context.font = 'bold 14px Arial, sans-serif';''
        context.textAlign = 'left';''
        context.textBaseline = 'top';''
        context.fillText('データプレビュー:', x, y);'
        '';
        if(this.previewData') {'
            '';
            context.fillStyle = '#666666';''
            context.font = '12px Arial, sans-serif';'
            '';
            const preview = JSON.stringify(this.previewData, null, 2');''
            const lines = preview.split('\n').slice(0, 8); // 最初の8行のみ表示
            
        }
            lines.forEach((line, index) => {  }
                context.fillText(line, x + 10, y + 25 + (index * 15);' }'
            }');'
            '';
            if (preview.split('\n').length > 8') { ''
                context.fillText('...', x + 10, y + 25 + (8 * 15); }
            }
        }
    }
    
    /**
     * ファイル選択処理
     */
    private selectFile(): void { if (this.fileInput) {
            this.fileInput.click(); }
        }
    }
    
    /**
     * ファイル選択時の処理
     * @param event - ファイル選択イベント
     */
    private async handleFileSelection(event: Event): Promise<void> { const target = event.target as HTMLInputElement;
        const file = target.files? .[0];
        if(!file) {
            
        }
            return; }
        }
        
        this.selectedFile = file;
        
        try { // ファイル内容を読み込み
            const content = await this.readFileContent(file);
            this.importData = JSON.parse(content);
            
            // バリデーション実行
            this.validationResult = this.validateImportData(this.importData);
            
            // プレビューデータを設定
            if(this.validationResult.isValid) {
                this.previewData = this.createPreviewData(this.importData);
            }
                this.showPreview = true;' }'
            } catch (error) { this.validationResult = { : undefined'
                isValid: false,'';
                errors: ['ファイル形式が正しくありません'] }'
            };''
            console.error('File reading error:', error);
        }
    }
    
    /**
     * ファイル内容を読み込み
     * @param file - ファイルオブジェクト
     * @returns ファイル内容
     */
    private readFileContent(file: File): Promise<string>,
        return new Promise((resolve, reject) => {  const reader = new FileReader();'
            reader.onload = (e) => resolve(e.target? .result as string);''
            reader.onerror = (') => reject(new Error('ファイル読み込みエラー'); }
            reader.readAsText(file); }
        };
    }
    
    /**
     * インポートデータをバリデーション
     * @param data - インポートデータ
     * @returns バリデーション結果'
     */ : undefined''
    private validateImportData(data: ImportData'): ImportValidationResult { const errors: string[] = [],'
        '';
        if(!data || typeof data !== 'object'') {'
            ';'
        }'
            errors.push('データが正しい形式ではありません'); }
            return { isValid: false, errors };
        }'
        '';
        switch(this.importType') {'
            '';
            case 'playerData':'';
                this.validatePlayerData(data, errors');'
                break;''
            case 'gameSettings':'';
                this.validateGameSettings(data, errors');'
                break;''
            case 'achievements':;
                this.validateAchievements(data, errors);
        }
                break; }
        }
        
        const isValid = errors.length === 0;
        const result: ImportValidationResult = { isValid, errors };
        
        if(isValid) {
        ';'
            result.info = {''
                recordCount: this.getRecordCount(data'),'
        }'
                createdAt: data.exportedAt || data.createdAt || '不明' }
            },
        }
        
        return result;
    }
    
    /**
     * プレイヤーデータのバリデーション
     * @param data - データ
     * @param errors - エラー配列'
     */''
    private validatePlayerData(data: ImportData, errors: string[]'): void { ''
        const requiredFields = ['username', 'ap', 'tap', 'highScores'];
        requiredFields.forEach(field => { ); }
            if(!(field in data) { }
                errors.push(`必須フィールドが不足: ${field}`);'
            }''
        }');'
        '';
        if(data.highScores && typeof data.highScores !== 'object'') {'
            ';'
        }'
            errors.push('ハイスコアデータの形式が正しくありません'); }
        }
    }
    
    /**
     * ゲーム設定のバリデーション
     * @param data - データ
     * @param errors - エラー配列'
     */''
    private validateGameSettings(data: ImportData, errors: string[]'): void { ''
        const requiredFields = ['graphics', 'audio', 'gameplay'];
        requiredFields.forEach(field => { ); }
            if(!(field in data) { }
                errors.push(`設定カテゴリが不足: ${field}`);
            }
        };
    }
    
    /**
     * 実績データのバリデーション
     * @param data - データ
     * @param errors - エラー配列
     */'
    private validateAchievements(data: ImportData, errors: string[]): void { ''
        if (!Array.isArray(data.achievements)') {''
            errors.push('実績データは配列である必要があります'); }
        }
    }
    
    /**
     * レコード数を取得
     * @param data - データ
     * @returns レコード数
     */'
    private getRecordCount(data: ImportData): number { ''
        switch(this.importType') {'
            '';
            case 'playerData':'';
                return Object.keys(data.highScores || {)').length;''
            case 'gameSettings':'';
                return Object.keys(data').length;''
            case 'achievements': return data.achievements ? data.achievements.length: 0
        }
            default: return 0; }
        }
    }
    
    /**
     * プレビューデータを作成
     * @param data - インポートデータ
     * @returns プレビューデータ
     */'
    private createPreviewData(data: ImportData): unknown { ''
        switch(this.importType') {'
            '';
            case 'playerData': return { username: data.username;
                    ap: data.ap,
        }'
                    tap: data.tap,' };'
                    highScoresCount: Object.keys(data.highScores || {)').length }'
                };''
            case 'gameSettings': return { graphics: data.graphics;
                    audio: data.audio, };
                    gameplay: data.gameplay }'
                };''
            case 'achievements':;
                return { achievementsCount: data.achievements ? data.achievements.length : 0, };
                    sample: data.achievements ? data.achievements.slice(0, 3) : [] }
                };
            default: return data;
        }
    }
    
    /**
     * インポート実行
     */'
    private async executeImport(): Promise<void> { ''
        if(!this.validationResult || !this.validationResult.isValid') {'
            '';
            alert('有効なファイルを選択してください');
        }
            return; }
        }
        
        try { await this.performImport(this.importData!);'
            '';
            if(this.onResult') {'
                this.onResult({''
                    action: 'import',
                    data: {
                        type: this.importType);
                        importedData: this.importData)
            }
                        fileName: this.selectedFile? .name) }
                    }'
                );''
            } catch (error) { : undefined''
            console.error('Import error:', error');''
            alert('インポートに失敗しました: ' + (error as Error).message); }
        }
    }
    
    /**
     * インポート処理を実行
     * @param data - インポートデータ'
     */'
    private async performImport(data: ImportData): Promise<void> { ''
        switch(this.importType') {'
            '';
            case 'playerData':'';
                await this.importPlayerData(data');'
                break;''
            case 'gameSettings':'';
                await this.importGameSettings(data');'
                break;''
            case 'achievements':;
                await this.importAchievements(data);
        }
                break; }
        }
    }
    
    /**
     * プレイヤーデータをインポート
     * @param data - プレイヤーデータ
     */
    private async importPlayerData(data: ImportData): Promise<void> { const gameEngine = this.gameEngine as GameEngineWithData;
        const playerData = gameEngine.playerData;'
        '';
        if(!playerData') {'
            ';'
        }'
            throw new Error('プレイヤーデータにアクセスできません'); }
        }
        
        // バックアップ作成
        const backup = { ...playerData };
        ;
        try { // データを適用
            if (data.username') playerData.username = data.username;''
            if (typeof data.ap === 'number'') playerData.ap = data.ap;''
            if (typeof data.tap === 'number') playerData.tap = data.tap; }
            if (data.highScores) playerData.highScores = { ...data.highScores };'
            if (data.unlockedStages) playerData.unlockedStages = [...data.unlockedStages];''
            if (data.ownedItems') playerData.ownedItems = [...data.ownedItems];
            ';
            // ローカルストレージに保存
            localStorage.setItem('bubblePop_playerData', JSON.stringify(playerData)');'
            '';
            console.log('Player data imported successfully');
        } catch (error) { // エラー時はバックアップから復旧
            Object.assign(playerData, backup);
            throw error; }
        }
    }
    
    /**
     * ゲーム設定をインポート
     * @param data - ゲーム設定
     */
    private async importGameSettings(data: ImportData): Promise<void> { const gameEngine = this.gameEngine as GameEngineWithData; }
        const currentSettings = gameEngine.gameSettings || {};
        
        try { // 設定を適用
            if(data.graphics) {
                
            }
                Object.assign(currentSettings.graphics || {), data.graphics); }
            }
            if (data.audio) { Object.assign(currentSettings.audio || {), data.audio); }
            }
            if(data.gameplay) {
                ';'
            }'
                Object.assign(currentSettings.gameplay || {), data.gameplay'); }
            }
            ';
            // 設定を保存
            localStorage.setItem('bubblePop_gameSettings', JSON.stringify(currentSettings)');'
            '';
            console.log('Game settings imported successfully');''
        } catch (error) { ''
            throw new Error('ゲーム設定のインポートに失敗しました'); }
        }
    }
    
    /**
     * 実績データをインポート
     * @param data - 実績データ
     */
    private async importAchievements(data: ImportData): Promise<void> { try {
            const gameEngine = this.gameEngine as GameEngineWithData;
            if(gameEngine.achievementManager && data.achievements) {
                // 実績データをマージ
            }
                data.achievements.forEach(achievement => { );' }'
                    gameEngine.achievementManager!.unlockAchievement(achievement.id, false'); }
                };
            }'
            '';
            console.log('Achievements imported successfully');''
        } catch (error) { ''
            throw new Error('実績データのインポートに失敗しました'); }
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { super.cleanup();
        
        // ファイル入力エレメントを削除
        if(this.fileInput && this.fileInput.parentNode) {
            ';'
        }'
            this.fileInput.parentNode.removeChild(this.fileInput'); }
        }
        
        this.selectedFile = null;
        this.importData = null;
        this.validationResult = null;
        this.previewData = null;
        this.showPreview = false;'
    }''
}