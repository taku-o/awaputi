/**
 * Audio Description Manager Component
 * 
 * 音声説明の生成・管理を担当
 * AudioAccessibilitySupport のサブコンポーネント
 */

import { getLocalizationManager } from '../../core/LocalizationManager.js';
import { getConfigurationManager } from '../../core/ConfigurationManager.js';

export class AudioDescriptionManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.localizationManager = getLocalizationManager();
        this.configManager = getConfigurationManager();
        
        // 音声説明設定
        this.descriptionSettings = {
            enabled: false,
            language: 'ja',
            speed: 1.0,
            volume: 0.8,
            voice: 'default',
            detailLevel: 'normal' // minimal, normal, detailed
        };
        
        // 説明キュー
        this.descriptionQueue = [];
        this.isPlaying = false;
        this.currentDescription = null;
        
        // 説明テンプレート
        this.templates = {
            gameState: {
                start: 'ゲームが開始されました',
                pause: 'ゲームが一時停止されました', 
                resume: 'ゲームが再開されました',
                gameOver: 'ゲームオーバーです',
                victory: 'ステージクリアです'
            },
            bubble: {
                pop: '{color}の泡を破壊しました',
                spawn: '{color}の泡が出現しました',
                special: '特殊な{type}泡が出現しました'
            },
            score: {
                increase: 'スコアが{score}になりました',
                combo: '{combo}コンボを達成しました',
                achievement: '実績「{name}」を解除しました'
            },
            system: {
                warning: '警告: {message}',
                error: 'エラーが発生しました: {message}',
                success: '操作が完了しました'
            }
        };
        
        // 音声合成設定
        this.speechSynthesis = null;
        this.voices = [];
        this.initializeSpeechSynthesis();
    }

    /**
     * 音声合成の初期化
     */
    initializeSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            
            // 利用可能な音声を取得
            this.speechSynthesis.onvoiceschanged = () => {
                this.voices = this.speechSynthesis.getVoices();
                this.updateVoiceSettings();
            };
            
            // 初期音声リスト取得
            this.voices = this.speechSynthesis.getVoices();
            if (this.voices.length > 0) {
                this.updateVoiceSettings();
            }
        }
    }

    /**
     * 音声設定の更新
     */
    updateVoiceSettings() {
        // 日本語音声を優先選択
        const japaneseVoice = this.voices.find(voice => 
            voice.lang.startsWith('ja') || voice.name.includes('Japanese')
        );
        
        if (japaneseVoice) {
            this.descriptionSettings.voice = japaneseVoice;
        } else {
            // フォールバック: デフォルト音声
            this.descriptionSettings.voice = this.voices[0] || 'default';
        }
    }

    /**
     * 音声説明の追加
     * @param {string} category - 説明カテゴリ
     * @param {string} type - 説明タイプ
     * @param {Object} params - パラメータ
     * @param {number} priority - 優先度 (1-5, 5が最高)
     */
    addDescription(category, type, params = {}, priority = 3) {
        if (!this.descriptionSettings.enabled) {
            return;
        }

        const template = this.getTemplate(category, type);
        if (!template) {
            console.warn(`Unknown description template: ${category}.${type}`);
            return;
        }

        const description = {
            id: this.generateDescriptionId(),
            category: category,
            type: type,
            text: this.formatTemplate(template, params),
            priority: priority,
            timestamp: Date.now(),
            params: params
        };

        this.enqueueDescription(description);
    }

    /**
     * テンプレートの取得
     * @param {string} category - カテゴリ
     * @param {string} type - タイプ
     * @returns {string|null} テンプレート文字列
     */
    getTemplate(category, type) {
        const categoryTemplates = this.templates[category];
        if (!categoryTemplates) {
            return null;
        }

        if (typeof categoryTemplates[type] === 'string') {
            return categoryTemplates[type];
        }

        // ネストされたテンプレートの場合
        if (typeof categoryTemplates[type] === 'object') {
            const subType = type.split('.').pop();
            return categoryTemplates[type][subType] || null;
        }

        return null;
    }

    /**
     * テンプレートのフォーマット
     * @param {string} template - テンプレート文字列
     * @param {Object} params - パラメータ
     * @returns {string} フォーマット済み文字列
     */
    formatTemplate(template, params) {
        let formatted = template;
        
        for (const [key, value] of Object.entries(params)) {
            const placeholder = `{${key}}`;
            formatted = formatted.replace(new RegExp(placeholder, 'g'), value);
        }
        
        return formatted;
    }

    /**
     * 説明をキューに追加
     * @param {Object} description - 説明オブジェクト
     */
    enqueueDescription(description) {
        // 優先度に基づいて挿入位置を決定
        let insertIndex = this.descriptionQueue.length;
        
        for (let i = 0; i < this.descriptionQueue.length; i++) {
            if (this.descriptionQueue[i].priority < description.priority) {
                insertIndex = i;
                break;
            }
        }
        
        this.descriptionQueue.splice(insertIndex, 0, description);
        
        // キューサイズの制限
        if (this.descriptionQueue.length > 10) {
            this.descriptionQueue = this.descriptionQueue.slice(0, 10);
        }
        
        // 再生を開始
        if (!this.isPlaying) {
            this.playNextDescription();
        }
    }

    /**
     * 次の説明を再生
     */
    async playNextDescription() {
        if (this.descriptionQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const description = this.descriptionQueue.shift();
        this.currentDescription = description;

        try {
            await this.playDescription(description);
        } catch (error) {
            console.error('Description playback error:', error);
        }

        // 次の説明を再生
        setTimeout(() => {
            this.playNextDescription();
        }, 100); // 短い間隔
    }

    /**
     * 説明の再生
     * @param {Object} description - 説明オブジェクト
     * @returns {Promise} 再生完了Promise
     */
    playDescription(description) {
        return new Promise((resolve, reject) => {
            if (!this.speechSynthesis) {
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(description.text);
            
            // 音声設定の適用
            utterance.voice = this.descriptionSettings.voice !== 'default' ? 
                this.descriptionSettings.voice : null;
            utterance.rate = this.descriptionSettings.speed;
            utterance.volume = this.descriptionSettings.volume;
            utterance.lang = this.descriptionSettings.language;

            // イベントハンドラー
            utterance.onend = () => {
                this.currentDescription = null;
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.currentDescription = null;
                resolve(); // エラーでも続行
            };

            // 再生開始
            this.speechSynthesis.speak(utterance);
        });
    }

    /**
     * 説明の中断
     */
    stopCurrentDescription() {
        if (this.speechSynthesis && this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        
        this.currentDescription = null;
        this.isPlaying = false;
    }

    /**
     * キューのクリア
     */
    clearDescriptionQueue() {
        this.descriptionQueue = [];
        this.stopCurrentDescription();
    }

    /**
     * 設定の更新
     * @param {Object} newSettings - 新しい設定
     */
    updateSettings(newSettings) {
        Object.assign(this.descriptionSettings, newSettings);
        
        // 音声設定の再適用
        if (newSettings.language || newSettings.voice) {
            this.updateVoiceSettings();
        }
    }

    /**
     * 詳細レベルに基づく説明フィルター
     * @param {string} category - カテゴリ
     * @param {string} type - タイプ
     * @returns {boolean} 説明するかどうか
     */
    shouldDescribe(category, type) {
        const level = this.descriptionSettings.detailLevel;
        
        // 最小レベル: 重要なイベントのみ
        if (level === 'minimal') {
            return ['gameState', 'system'].includes(category);
        }
        
        // 通常レベル: ゲーム進行に関連するイベント
        if (level === 'normal') {
            return ['gameState', 'score', 'system'].includes(category);
        }
        
        // 詳細レベル: すべてのイベント
        return true;
    }

    /**
     * 状態の取得
     * @returns {Object} 現在の状態
     */
    getStatus() {
        return {
            enabled: this.descriptionSettings.enabled,
            isPlaying: this.isPlaying,
            queueLength: this.descriptionQueue.length,
            currentDescription: this.currentDescription,
            settings: { ...this.descriptionSettings }
        };
    }

    /**
     * 説明IDの生成
     * @returns {string} ユニークなID
     */
    generateDescriptionId() {
        return `desc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.stopCurrentDescription();
        this.clearDescriptionQueue();
        this.speechSynthesis = null;
        this.voices = [];
    }
}