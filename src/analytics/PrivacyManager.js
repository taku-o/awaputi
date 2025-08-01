/**
 * Privacy Manager
 * プライバシー保護とGDPR準拠を管理
 */
export class PrivacyManager {
    constructor() {
        this.consentStatus = null;
        this.anonymizationRules = new Map();
        this.optOutFeatures = new Set();
        this.consentVersion = '1.0';
        
        // デフォルトの匿名化ルール
        this.setupDefaultAnonymizationRules();
        
        // 保存されている同意状態を読み込み
        this.loadConsentStatus();
    }
    
    /**
     * デフォルトの匿名化ルール設定
     */
    setupDefaultAnonymizationRules() {
        // IPアドレスの匿名化
        this.anonymizationRules.set('ipAddress', (value) => {
            if (!value) return null;
            const parts = value.split('.');
            if (parts.length === 4) {
                // 最後のオクテットを0に置換
                return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
            }
            return null;
        });
        
        // タイムスタンプの丸め（5分単位）
        this.anonymizationRules.set('timestamp', (value) => {
            if (!value) return null;
            const date = new Date(value);
            const minutes = Math.floor(date.getMinutes() / 5) * 5;
            date.setMinutes(minutes);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.getTime();
        });
        
        // 位置情報の精度低下
        this.anonymizationRules.set('position', (value) => {
            if (!value || !value.x || !value.y) return null;
            return {
                x: Math.round(value.x / 50) * 50,
                y: Math.round(value.y / 50) * 50
            };
        });
        
        // セッションIDのハッシュ化
        this.anonymizationRules.set('sessionId', (value) => {
            if (!value) return null;
            return this.hashString(value);
        });
    }
    
    /**
     * 同意状態の読み込み
     */
    loadConsentStatus() {
        try {
            const stored = localStorage.getItem('bubblePopAnalyticsConsent');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.version === this.consentVersion) {
                    this.consentStatus = parsed.status;
                    this.optOutFeatures = new Set(parsed.optOutFeatures || []);
                }
            }
        } catch (error) {
            console.error('Failed to load consent status:', error);
        }
    }
    
    /**
     * 同意状態の保存
     */
    saveConsentStatus() {
        try {
            const data = {
                status: this.consentStatus,
                version: this.consentVersion,
                timestamp: Date.now(),
                optOutFeatures: Array.from(this.optOutFeatures)
            };
            localStorage.setItem('bubblePopAnalyticsConsent', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save consent status:', error);
        }
    }
    
    /**
     * 同意要求
     * @returns {Promise<boolean>}
     */
    async requestConsent() {
        // 既に同意がある場合はスキップ
        if (this.consentStatus !== null) {
            return this.consentStatus;
        }
        
        return new Promise((resolve) => {
            // 同意ダイアログの作成
            const dialog = this.createConsentDialog();
            document.body.appendChild(dialog);
            
            // ボタンイベントハンドラー
            const acceptBtn = dialog.querySelector('.consent-accept');
            const declineBtn = dialog.querySelector('.consent-decline');
            const customizeBtn = dialog.querySelector('.consent-customize');
            
            const handleResponse = (accepted, customized = false) => {
                this.consentStatus = accepted;
                if (!customized && !accepted) {
                    // 完全拒否の場合、全機能をオプトアウト
                    this.optOutFeatures.add('sessionTracking');
                    this.optOutFeatures.add('performanceTracking');
                    this.optOutFeatures.add('behaviorAnalysis');
                }
                this.saveConsentStatus();
                dialog.remove();
                resolve(accepted);
            };
            
            acceptBtn.addEventListener('click', () => handleResponse(true));
            declineBtn.addEventListener('click', () => handleResponse(false));
            customizeBtn.addEventListener('click', () => {
                this.showCustomizationDialog(dialog, handleResponse);
            });
        });
    }
    
    /**
     * 同意ダイアログの作成
     * @returns {HTMLElement}
     */
    createConsentDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'analytics-consent-dialog';
        dialog.innerHTML = `
            <div class="consent-overlay"></div>
            <div class="consent-content">
                <h2>データ収集に関する同意</h2>
                <p>
                    このゲームでは、ゲーム体験の改善のために、プレイデータを収集・分析します。
                    収集されるデータは匿名化され、個人を特定することはできません。
                </p>
                <div class="consent-details">
                    <h3>収集される情報：</h3>
                    <ul>
                        <li>プレイ時間とセッション情報</li>
                        <li>ゲーム内の行動（クリック、スコアなど）</li>
                        <li>パフォーマンス情報（フレームレート、エラーなど）</li>
                    </ul>
                    <h3>収集されない情報：</h3>
                    <ul>
                        <li>個人情報（名前、メールアドレスなど）</li>
                        <li>正確な位置情報</li>
                        <li>他のウェブサイトの閲覧履歴</li>
                    </ul>
                </div>
                <div class="consent-buttons">
                    <button class="consent-accept">同意する</button>
                    <button class="consent-customize">カスタマイズ</button>
                    <button class="consent-decline">同意しない</button>
                </div>
                <p class="consent-note">
                    この設定は後から変更できます。詳細は
                    <a href="#privacy-policy" target="_blank">プライバシーポリシー</a>
                    をご覧ください。
                </p>
            </div>
        `;
        
        // スタイルの追加
        this.addConsentDialogStyles();
        
        return dialog;
    }
    
    /**
     * カスタマイズダイアログの表示
     * @param {HTMLElement} mainDialog - メインダイアログ
     * @param {Function} callback - コールバック関数
     */
    showCustomizationDialog(mainDialog, callback) {
        const content = mainDialog.querySelector('.consent-content');
        content.innerHTML = `
            <h2>データ収集のカスタマイズ</h2>
            <p>収集する情報を選択してください：</p>
            <div class="consent-options">
                <label>
                    <input type="checkbox" id="consent-session" checked>
                    <span>セッション情報（プレイ時間、ステージ進行）</span>
                </label>
                <label>
                    <input type="checkbox" id="consent-performance" checked>
                    <span>パフォーマンス情報（FPS、エラー、ロード時間）</span>
                </label>
                <label>
                    <input type="checkbox" id="consent-behavior" checked>
                    <span>行動分析（クリック、スコア、バブル情報）</span>
                </label>
            </div>
            <div class="consent-buttons">
                <button class="consent-save">保存して続行</button>
                <button class="consent-cancel">キャンセル</button>
            </div>
        `;
        
        const saveBtn = content.querySelector('.consent-save');
        const cancelBtn = content.querySelector('.consent-cancel');
        
        saveBtn.addEventListener('click', () => {
            const sessionChecked = content.querySelector('#consent-session').checked;
            const performanceChecked = content.querySelector('#consent-performance').checked;
            const behaviorChecked = content.querySelector('#consent-behavior').checked;
            
            // オプトアウト設定
            this.optOutFeatures.clear();
            if (!sessionChecked) this.optOutFeatures.add('sessionTracking');
            if (!performanceChecked) this.optOutFeatures.add('performanceTracking');
            if (!behaviorChecked) this.optOutFeatures.add('behaviorAnalysis');
            
            // 少なくとも1つが選択されていれば同意とする
            const accepted = sessionChecked || performanceChecked || behaviorChecked;
            callback(accepted, true);
        });
        
        cancelBtn.addEventListener('click', () => {
            // メインダイアログに戻る
            mainDialog.remove();
            const newDialog = this.createConsentDialog();
            document.body.appendChild(newDialog);
            
            // イベントハンドラーの再設定
            const acceptBtn = newDialog.querySelector('.consent-accept');
            const declineBtn = newDialog.querySelector('.consent-decline');
            const customizeBtn = newDialog.querySelector('.consent-customize');
            
            acceptBtn.addEventListener('click', () => callback(true));
            declineBtn.addEventListener('click', () => callback(false));
            customizeBtn.addEventListener('click', () => {
                this.showCustomizationDialog(newDialog, callback);
            });
        });
    }
    
    /**
     * 同意ダイアログのスタイル追加
     */
    addConsentDialogStyles() {
        if (document.getElementById('analytics-consent-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'analytics-consent-styles';
        style.textContent = `
            .analytics-consent-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .consent-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
            }
            
            .consent-content {
                position: relative;
                background: white;
                border-radius: 10px;
                padding: 30px;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .consent-content h2 {
                margin: 0 0 20px;
                color: #333;
                font-size: 24px;
            }
            
            .consent-content h3 {
                margin: 15px 0 10px;
                color: #555;
                font-size: 18px;
            }
            
            .consent-content p {
                margin: 15px 0;
                color: #666;
                line-height: 1.6;
            }
            
            .consent-details {
                background: #f5f5f5;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
            }
            
            .consent-details ul {
                margin: 5px 0;
                padding-left: 20px;
            }
            
            .consent-details li {
                margin: 5px 0;
                color: #666;
            }
            
            .consent-buttons {
                display: flex;
                gap: 10px;
                margin: 25px 0;
                justify-content: center;
            }
            
            .consent-buttons button {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .consent-accept {
                background: #4CAF50;
                color: white;
            }
            
            .consent-accept:hover {
                background: #45a049;
            }
            
            .consent-customize {
                background: #2196F3;
                color: white;
            }
            
            .consent-customize:hover {
                background: #1976D2;
            }
            
            .consent-decline {
                background: #f44336;
                color: white;
            }
            
            .consent-decline:hover {
                background: #d32f2f;
            }
            
            .consent-save {
                background: #4CAF50;
                color: white;
            }
            
            .consent-save:hover {
                background: #45a049;
            }
            
            .consent-cancel {
                background: #757575;
                color: white;
            }
            
            .consent-cancel:hover {
                background: #616161;
            }
            
            .consent-note {
                font-size: 14px;
                color: #888;
                text-align: center;
                margin-top: 20px;
            }
            
            .consent-note a {
                color: #2196F3;
                text-decoration: none;
            }
            
            .consent-note a:hover {
                text-decoration: underline;
            }
            
            .consent-options {
                margin: 20px 0;
            }
            
            .consent-options label {
                display: block;
                margin: 15px 0;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .consent-options label:hover {
                background: #eeeeee;
            }
            
            .consent-options input[type="checkbox"] {
                margin-right: 10px;
                width: 18px;
                height: 18px;
                vertical-align: middle;
            }
            
            .consent-options span {
                color: #666;
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 同意チェック
     * @returns {boolean}
     */
    checkConsent() {
        return this.consentStatus === true;
    }
    
    /**
     * 特定機能のオプトアウトチェック
     * @param {string} feature - 機能名
     * @returns {boolean}
     */
    isOptedOut(feature) {
        return this.optOutFeatures.has(feature);
    }
    
    /**
     * オプトアウト設定
     * @param {string} feature - 機能名
     * @param {boolean} status - オプトアウト状態
     */
    setOptOut(feature, status) {
        if (status) {
            this.optOutFeatures.add(feature);
        } else {
            this.optOutFeatures.delete(feature);
        }
        this.saveConsentStatus();
    }
    
    /**
     * データ匿名化
     * @param {Object} data - 匿名化するデータ
     * @returns {Object}
     */
    anonymizeData(data) {
        if (!data || typeof data !== 'object') return data;
        
        const anonymized = Array.isArray(data) ? [] : {};
        
        for (const [key, value] of Object.entries(data)) {
            if (this.anonymizationRules.has(key)) {
                // 匿名化ルールがある場合は適用
                anonymized[key] = this.anonymizationRules.get(key)(value);
            } else if (typeof value === 'object' && value !== null) {
                // ネストされたオブジェクトは再帰的に処理
                anonymized[key] = this.anonymizeData(value);
            } else {
                // その他はそのままコピー
                anonymized[key] = value;
            }
        }
        
        return anonymized;
    }
    
    /**
     * 文字列のハッシュ化（簡易版）
     * @param {string} str - ハッシュ化する文字列
     * @returns {string}
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
    
    /**
     * GDPR準拠のデータエクスポート
     * @param {Function} dataProvider - データ提供関数
     * @returns {Promise<Object>}
     */
    async exportUserData(dataProvider) {
        if (!this.checkConsent()) {
            throw new Error('No consent given for data export');
        }
        
        const data = await dataProvider();
        
        // 匿名化されていないユーザーデータをエクスポート用に整形
        return {
            exportDate: new Date().toISOString(),
            consentStatus: this.consentStatus,
            optOutFeatures: Array.from(this.optOutFeatures),
            data: data
        };
    }
    
    /**
     * データ削除要求の処理
     * @param {Function} dataDeleter - データ削除関数
     * @returns {Promise<void>}
     */
    async deleteUserData(dataDeleter) {
        // データ削除
        await dataDeleter();
        
        // 同意状態もリセット
        this.consentStatus = null;
        this.optOutFeatures.clear();
        localStorage.removeItem('bubblePopAnalyticsConsent');
    }
    
    /**
     * 地域に基づくGDPR適用チェック
     * @returns {boolean}
     */
    isGDPRApplicable() {
        // タイムゾーンベースの簡易チェック
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const euTimezones = [
            'Europe/', 'Atlantic/Azores', 'Atlantic/Canary', 'Atlantic/Madeira'
        ];
        
        return euTimezones.some(tz => timezone.startsWith(tz));
    }
}