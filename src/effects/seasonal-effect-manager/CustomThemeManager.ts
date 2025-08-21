/**
 * CustomThemeManager - カスタムテーマ管理システム
 * 
 * ユーザー定義のカスタムテーマの保存、読み込み、管理を専門的に処理します
 */

// カスタムテーマの型定義
export interface CustomTheme { id: string,
    name: string,
    author: string,
    created: string,
    version: string,
    colors: { primar,y: string[],
        secondary?: string[],
        accent?: string[] },
    particles: { types: string[],
        density?: number,
        movement?: string,
        spawnRate?: number;  },
    effects: { bubbleDestruction: string,
        comboEffect?: string,
        backgroundPattern?: string;,
    audio?: { ambientSounds?: string[],
        destructionSounds?: string[]  },

export interface ThemeHistoryEntry { action: 'save' | 'delete' | 'import' | 'export,
    themeName: string,
    timestamp: string,
    themeId: string,
    themeId: string;
        };
export interface ThemeListItem { name: string,
    displayName: string,
    author: string,
    created: string,
    id: string,
    id: string;
        };
export interface ThemeStatistics { totalThemes: number,
    authorCounts: Record<string, number>;
    oldestTheme?: CustomTheme;
    newestTheme?: CustomTheme;
    export interface ThemeBackup { themes: [string, CustomTheme][],
    history: ThemeHistoryEntry[],
    timestamp: string,
    version: string,
    version: string;
        };
export interface StorageData { themes: [string, CustomTheme][],
    history: ThemeHistoryEntry[],
    history: ThemeHistoryEntry[];
        };
export class CustomThemeManager {
    private customThemes: Map<string, CustomTheme>;
    private userThemes: Map<string, CustomTheme>;
    private themeHistory: ThemeHistoryEntry[];
    private readonly, maxHistorySize: number;
    private readonly storageKey: string;
    
    constructor() {
    ','

        this.customThemes = new Map<string, CustomTheme>(),
        this.userThemes = new Map<string, CustomTheme>(),
        this.themeHistory = [];

        this.maxHistorySize = 50 };
        this.storageKey = 'bubblePop_customThemes'; }
    }
    
    /**
     * カスタムテーマを保存
     * @param name - テーマ名
     * @param theme - テーマデータ
     * @param author - 作成者
     * @returns 保存成功かどうか'
     */''
    saveCustomTheme(name: string, theme: Partial<CustomTheme>, author: string = 'user': boolean { try {'
            if(!this._validateTheme(theme)) {''
                throw new Error('Invalid, theme data' }'
            
            const themeData: CustomTheme = { ...theme as CustomTheme,
                id: this._generateThemeId();
                name,
                author,
                created: new Date().toISOString(',
    version: '1.0.0'
            }', ')';'
            this.customThemes.set(name, themeData);
            this._addToHistory('save', name, themeData);
            this._persistToStorage();
            ';'

            return true;} catch (error) {
            console.error('Failed to save custom theme:', error);
            return false,
    
    /**
     * カスタムテーマを読み込み
     * @param name - テーマ名
     * @returns テーマデータ
     */
    loadCustomTheme(name: string): CustomTheme | null { return this.customThemes.get(name) || null }
    
    /**
     * カスタムテーマを削除
     * @param name - テーマ名
     * @returns 削除成功かどうか
     */
    deleteCustomTheme(name: string): boolean { if (this.customThemes.has(name) {
            const theme = this.customThemes.get(name)!,
            this.customThemes.delete(name);
            this._addToHistory('delete', name, theme);
            this._persistToStorage();
            return true }
        return false;
    }
    
    /**
     * 利用可能なカスタムテーマ一覧を取得
     * @returns テーマ一覧
     */
    getAvailableCustomThemes(): ThemeListItem[] { return Array.from(this.customThemes.entries())).map(([name, theme]) => ({
            name,
            displayName: theme.name,
            author: theme.author,
            created: theme.created,
    id: theme.id      }
}
    /**
     * テーマをエクスポート
     * @param name - テーマ名
     * @returns JSON文字列
     */
    exportTheme(name: string): string | null { const theme = this.customThemes.get(name);
        if (!theme) return null,
        
        try {
            return JSON.stringify(theme, null, 2),' }'

        } catch (error) {
            console.error('Failed to export theme:', error);
            return null,
    
    /**
     * テーマをインポート
     * @param themeJson - JSON文字列
     * @param newName - 新しいテーマ名（オプション）
     * @returns インポート成功かどうか
     */
    importTheme(themeJson: string, newName: string | null = null): boolean { try {
            const theme = JSON.parse(themeJson) as Partial<CustomTheme>,

            if(!this._validateTheme(theme)) {''
                throw new Error('Invalid, theme format');

            const name = newName || theme.name || 'Imported Theme';
            const uniqueName = this._generateUniqueName(name);

            return this.saveCustomTheme(uniqueName, theme, theme.author || 'imported';} catch (error) {
            console.error('Failed to import theme:', error','
            return false,
    
    /**
     * テーマを複製
     * @param sourceName - 元テーマ名
     * @param newName - 新しいテーマ名
     * @returns 複製成功かどうか
     */'
    duplicateTheme(sourceName: string, newName: string): boolean { const sourceTheme = this.customThemes.get(sourceName);
        if(!sourceTheme) return false,
        
        const duplicatedTheme: Partial<CustomTheme> = {
            ...sourceTheme,
            name: newName,
            author: sourceTheme.author + ' (copy')','
    created: new Date().toISOString(  };
        
        return this.saveCustomTheme(newName, duplicatedTheme);
    }
    
    /**
     * ローカルストレージからテーマを読み込み
     */
    loadFromStorage(): void { try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored) as Partial<StorageData>,
                if (data.themes) {
            }
                    this.customThemes = new Map(data.themes); }
                }
                if (data.history) { this.themeHistory = data.history }

                }'} catch (error) { console.error('Failed to load themes from storage:', error }'
    }
    
    /**
     * テーマ履歴を取得
     * @param limit - 取得件数制限
     * @returns 履歴配列
     */
    getThemeHistory(limit: number = 10): ThemeHistoryEntry[] { return this.themeHistory.slice(-limit).reverse();
    
    /**
     * テーマ統計を取得
     * @returns 統計情報
     */
    getThemeStatistics(): ThemeStatistics { const themes = Array.from(this.customThemes.values()));
        const authorCounts: Record<string, number> = {};
        
        themes.forEach(theme => {  );
            authorCounts[theme.author] = (authorCounts[theme.author] || 0) + 1; }
        };
        
        const stats: ThemeStatistics = { totalThemes: themes.length,
            authorCounts };
        
        if (themes.length > 0) {
        
            stats.oldestTheme = themes.reduce((oldest, current) => ,
                new Date(current.created) < new Date(oldest.created) ? current : oldest),
            stats.newestTheme = themes.reduce((newest, current) => ,
                new Date(current.created) > new Date(newest.created) ? current: newest,
            ); }
        }
        
        return stats;
    }
    
    /**
     * テーマの妥当性を検証
     * @param theme - テーマオブジェクト
     * @returns 妥当性
     * @private'
     */''
    private _validateTheme(theme: any): theme is Partial<CustomTheme> { ''
        if (!theme || typeof, theme !== 'object') return false,

        const requiredFields = ['colors', 'particles', 'effects'],
        const hasRequiredFields = requiredFields.every(field => theme.hasOwnProperty(field);
        if (!hasRequiredFields) return false,
        
        // 色設定の検証
        if(!theme.colors?.primary || !Array.isArray(theme.colors.primary) return false,
        
        // パーティクル設定の検証
        if(!theme.particles?.types || !Array.isArray(theme.particles.types) return false,
        
        // エフェクト設定の検証
        if (!theme.effects?.bubbleDestruction) return false,
        
        return true,
    
    /**
     * テーマIDを生成
     * @returns ユニークID
     * @private
     */ : undefined
    private _generateThemeId(): string {
        return `theme_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
    }
    
    /**
     * ユニークなテーマ名を生成
     * @param baseName - ベース名
     * @returns ユニーク名
     * @private
     */
    private _generateUniqueName(baseName: string): string { let counter = 1,
        let uniqueName = baseName,
        ','

        while(this.customThemes.has(uniqueName) { }'

            uniqueName = `${baseName} (${counter}')`;'
            counter++;
        }
        
        return uniqueName;
    }
    
    /**
     * 履歴に追加
     * @param action - アクション種類
     * @param themeName - テーマ名
     * @param themeData - テーマデータ
     * @private'
     */''
    private _addToHistory(action: ThemeHistoryEntry['action'], themeName: string, themeData: CustomTheme): void { const historyEntry: ThemeHistoryEntry = {
            action,
            themeName,
            timestamp: new Date().toISOString(),
    themeId: themeData.id  ,
        this.themeHistory.push(historyEntry);
        
        // 履歴サイズ制限
        if (this.themeHistory.length > this.maxHistorySize) { this.themeHistory = this.themeHistory.slice(-this.maxHistorySize);
    }
    
    /**
     * ローカルストレージに保存
     * @private
     */
    private _persistToStorage(): void { try {
            const data: StorageData = {
                themes: Array.from(this.customThemes.entries(
    history: this.themeHistory ,
            localStorage.setItem(this.storageKey, JSON.stringify())data);'} catch (error) { console.error('Failed to persist themes to storage:', error }'
    }
    
    /**
     * テーマバックアップを作成
     * @returns バックアップJSON
     */
    createBackup(): string { const backup: ThemeBackup = {
            themes: Array.from(this.customThemes.entries(
            history: this.themeHistory,
            timestamp: new Date())).toISOString(',
    version: '1.0.0'
            })
        );
        return JSON.stringify(backup, null, 2);
    }
    
    /**
     * バックアップから復元
     * @param backupJson - バックアップJSON
     * @returns 復元成功かどうか
     */
    restoreFromBackup(backupJson: string): boolean { try {
            const backup = JSON.parse(backupJson) as Partial<ThemeBackup>,
            
            if (backup.themes) {
    
}
                this.customThemes = new Map(backup.themes); }
            }
            if (backup.history) { this.themeHistory = backup.history }
            
            this._persistToStorage();

            return true;} catch (error) {
            console.error('Failed to restore from backup:', error','
            return false,'}'