/**
 * CustomThemeManager - カスタムテーマ管理システム
 * 
 * ユーザー定義のカスタムテーマの保存、読み込み、管理を専門的に処理します
 */

export class CustomThemeManager {
    constructor() {
        this.customThemes = new Map();
        this.userThemes = new Map();
        this.themeHistory = [];
        this.maxHistorySize = 50;
        this.storageKey = 'bubblePop_customThemes';
    }
    
    /**
     * カスタムテーマを保存
     * @param {string} name - テーマ名
     * @param {Object} theme - テーマデータ
     * @param {string} author - 作成者
     * @returns {boolean} 保存成功かどうか
     */
    saveCustomTheme(name, theme, author = 'user') {
        try {
            if (!this._validateTheme(theme)) {
                throw new Error('Invalid theme data');
            }
            
            const themeData = {
                ...theme,
                id: this._generateThemeId(),
                name,
                author,
                created: new Date().toISOString(),
                version: '1.0.0'
            };
            
            this.customThemes.set(name, themeData);
            this._addToHistory('save', name, themeData);
            this._persistToStorage();
            
            return true;
        } catch (error) {
            console.error('Failed to save custom theme:', error);
            return false;
        }
    }
    
    /**
     * カスタムテーマを読み込み
     * @param {string} name - テーマ名
     * @returns {Object|null} テーマデータ
     */
    loadCustomTheme(name) {
        return this.customThemes.get(name) || null;
    }
    
    /**
     * カスタムテーマを削除
     * @param {string} name - テーマ名
     * @returns {boolean} 削除成功かどうか
     */
    deleteCustomTheme(name) {
        if (this.customThemes.has(name)) {
            const theme = this.customThemes.get(name);
            this.customThemes.delete(name);
            this._addToHistory('delete', name, theme);
            this._persistToStorage();
            return true;
        }
        return false;
    }
    
    /**
     * 利用可能なカスタムテーマ一覧を取得
     * @returns {Array} テーマ一覧
     */
    getAvailableCustomThemes() {
        return Array.from(this.customThemes.entries()).map(([name, theme]) => ({
            name,
            displayName: theme.name,
            author: theme.author,
            created: theme.created,
            id: theme.id
        }));
    }
    
    /**
     * テーマをエクスポート
     * @param {string} name - テーマ名
     * @returns {string|null} JSON文字列
     */
    exportTheme(name) {
        const theme = this.customThemes.get(name);
        if (!theme) return null;
        
        try {
            return JSON.stringify(theme, null, 2);
        } catch (error) {
            console.error('Failed to export theme:', error);
            return null;
        }
    }
    
    /**
     * テーマをインポート
     * @param {string} themeJson - JSON文字列
     * @param {string} newName - 新しいテーマ名（オプション）
     * @returns {boolean} インポート成功かどうか
     */
    importTheme(themeJson, newName = null) {
        try {
            const theme = JSON.parse(themeJson);
            
            if (!this._validateTheme(theme)) {
                throw new Error('Invalid theme format');
            }
            
            const name = newName || theme.name || 'Imported Theme';
            const uniqueName = this._generateUniqueName(name);
            
            return this.saveCustomTheme(uniqueName, theme, theme.author || 'imported');
        } catch (error) {
            console.error('Failed to import theme:', error);
            return false;
        }
    }
    
    /**
     * テーマを複製
     * @param {string} sourceName - 元テーマ名
     * @param {string} newName - 新しいテーマ名
     * @returns {boolean} 複製成功かどうか
     */
    duplicateTheme(sourceName, newName) {
        const sourceTheme = this.customThemes.get(sourceName);
        if (!sourceTheme) return false;
        
        const duplicatedTheme = {
            ...sourceTheme,
            name: newName,
            author: sourceTheme.author + ' (copy)',
            created: new Date().toISOString()
        };
        
        return this.saveCustomTheme(newName, duplicatedTheme);
    }
    
    /**
     * ローカルストレージからテーマを読み込み
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.themes) {
                    this.customThemes = new Map(data.themes);
                }
                if (data.history) {
                    this.themeHistory = data.history;
                }
            }
        } catch (error) {
            console.error('Failed to load themes from storage:', error);
        }
    }
    
    /**
     * テーマ履歴を取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} 履歴配列
     */
    getThemeHistory(limit = 10) {
        return this.themeHistory.slice(-limit).reverse();
    }
    
    /**
     * テーマ統計を取得
     * @returns {Object} 統計情報
     */
    getThemeStatistics() {
        const themes = Array.from(this.customThemes.values());
        const authorCounts = {};
        
        themes.forEach(theme => {
            authorCounts[theme.author] = (authorCounts[theme.author] || 0) + 1;
        });
        
        return {
            totalThemes: themes.length,
            authorCounts,
            oldestTheme: themes.reduce((oldest, current) => 
                new Date(current.created) < new Date(oldest.created) ? current : oldest, 
                themes[0]
            ),
            newestTheme: themes.reduce((newest, current) => 
                new Date(current.created) > new Date(newest.created) ? current : newest, 
                themes[0]
            )
        };
    }
    
    /**
     * テーマの妥当性を検証
     * @param {Object} theme - テーマオブジェクト
     * @returns {boolean} 妥当性
     * @private
     */
    _validateTheme(theme) {
        if (!theme || typeof theme !== 'object') return false;
        
        const requiredFields = ['colors', 'particles', 'effects'];
        const hasRequiredFields = requiredFields.every(field => theme.hasOwnProperty(field));
        
        if (!hasRequiredFields) return false;
        
        // 色設定の検証
        if (!theme.colors.primary || !Array.isArray(theme.colors.primary)) return false;
        
        // パーティクル設定の検証
        if (!theme.particles.types || !Array.isArray(theme.particles.types)) return false;
        
        // エフェクト設定の検証
        if (!theme.effects.bubbleDestruction) return false;
        
        return true;
    }
    
    /**
     * テーマIDを生成
     * @returns {string} ユニークID
     * @private
     */
    _generateThemeId() {
        return `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * ユニークなテーマ名を生成
     * @param {string} baseName - ベース名
     * @returns {string} ユニーク名
     * @private
     */
    _generateUniqueName(baseName) {
        let counter = 1;
        let uniqueName = baseName;
        
        while (this.customThemes.has(uniqueName)) {
            uniqueName = `${baseName} (${counter})`;
            counter++;
        }
        
        return uniqueName;
    }
    
    /**
     * 履歴に追加
     * @param {string} action - アクション種類
     * @param {string} themeName - テーマ名
     * @param {Object} themeData - テーマデータ
     * @private
     */
    _addToHistory(action, themeName, themeData) {
        const historyEntry = {
            action,
            themeName,
            timestamp: new Date().toISOString(),
            themeId: themeData.id
        };
        
        this.themeHistory.push(historyEntry);
        
        // 履歴サイズ制限
        if (this.themeHistory.length > this.maxHistorySize) {
            this.themeHistory = this.themeHistory.slice(-this.maxHistorySize);
        }
    }
    
    /**
     * ローカルストレージに保存
     * @private
     */
    _persistToStorage() {
        try {
            const data = {
                themes: Array.from(this.customThemes.entries()),
                history: this.themeHistory
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to persist themes to storage:', error);
        }
    }
    
    /**
     * テーマバックアップを作成
     * @returns {string} バックアップJSON
     */
    createBackup() {
        const backup = {
            themes: Array.from(this.customThemes.entries()),
            history: this.themeHistory,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return JSON.stringify(backup, null, 2);
    }
    
    /**
     * バックアップから復元
     * @param {string} backupJson - バックアップJSON
     * @returns {boolean} 復元成功かどうか
     */
    restoreFromBackup(backupJson) {
        try {
            const backup = JSON.parse(backupJson);
            
            if (backup.themes) {
                this.customThemes = new Map(backup.themes);
            }
            if (backup.history) {
                this.themeHistory = backup.history;
            }
            
            this._persistToStorage();
            return true;
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    }
}