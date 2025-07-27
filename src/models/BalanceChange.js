/**
 * バランス変更モデル - BalanceChange
 * 
 * ゲームバランス設定の変更履歴と詳細情報を管理するモデルクラス。
 * 変更の追跡、影響分析、ロールバック機能を提供します。
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class BalanceChange {
    constructor(changeData = {}) {
        this.errorHandler = getErrorHandler();
        
        // 必須フィールド
        this.id = changeData.id || this._generateChangeId();
        this.timestamp = changeData.timestamp || Date.now();
        this.configType = changeData.configType || null;
        this.bubbleType = changeData.bubbleType || null;
        this.propertyType = changeData.propertyType || null;
        
        // 変更値
        this.oldValue = changeData.oldValue;
        this.newValue = changeData.newValue;
        this.changeType = this._determineChangeType(changeData.oldValue, changeData.newValue);
        
        // メタデータ
        this.author = changeData.author || 'system';
        this.rationale = changeData.rationale || '';
        this.impactAssessment = changeData.impactAssessment || null;
        this.reviewStatus = changeData.reviewStatus || 'pending';
        this.tags = changeData.tags || [];
        
        // 検証・承認情報
        this.validationResults = changeData.validationResults || null;
        this.reviewedBy = changeData.reviewedBy || null;
        this.reviewedAt = changeData.reviewedAt || null;
        this.reviewComments = changeData.reviewComments || '';
        
        // ロールバック情報
        this.canRollback = changeData.canRollback !== false;
        this.rolledBack = changeData.rolledBack || false;
        this.rollbackTimestamp = changeData.rollbackTimestamp || null;
        this.rollbackReason = changeData.rollbackReason || '';
        
        // 関連する変更
        this.relatedChanges = changeData.relatedChanges || [];
        this.parentChangeId = changeData.parentChangeId || null;
        this.childChanges = changeData.childChanges || [];
        
        // 実行状況
        this.applied = changeData.applied || false;
        this.appliedAt = changeData.appliedAt || null;
        this.appliedBy = changeData.appliedBy || null;
        
        // 変更の影響度
        this.severity = changeData.severity || 'medium';
        this.riskLevel = changeData.riskLevel || 'low';
        this.affectedSystems = changeData.affectedSystems || [];
        
        console.log(`[BalanceChange] 変更モデル作成: ${this.id}`);
    }
    
    /**
     * 変更IDを生成
     * @returns {string} 一意の変更ID
     * @private
     */
    _generateChangeId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `change_${timestamp}_${random}`;
    }
    
    /**
     * 変更タイプを決定
     * @param {*} oldValue - 古い値
     * @param {*} newValue - 新しい値
     * @returns {string} 変更タイプ
     * @private
     */
    _determineChangeType(oldValue, newValue) {
        if (oldValue === undefined || oldValue === null) {
            return 'create';
        }
        
        if (newValue === undefined || newValue === null) {
            return 'delete';
        }
        
        if (typeof oldValue === 'number' && typeof newValue === 'number') {
            if (newValue > oldValue) {
                return 'increase';
            } else if (newValue < oldValue) {
                return 'decrease';
            } else {
                return 'no_change';
            }
        }
        
        if (oldValue !== newValue) {
            return 'modify';
        }
        
        return 'no_change';
    }
    
    /**
     * 変更を検証
     * @returns {Object} 検証結果
     */
    validate() {
        const errors = [];
        const warnings = [];
        
        try {
            // 必須フィールドの検証
            if (!this.configType) {
                errors.push('configType is required');
            }
            
            if (!this.bubbleType) {
                errors.push('bubbleType is required');
            }
            
            if (!this.propertyType) {
                errors.push('propertyType is required');
            }
            
            if (this.oldValue === undefined && this.newValue === undefined) {
                errors.push('Either oldValue or newValue must be defined');
            }
            
            // 作成者の検証
            if (!this.author || this.author.trim() === '') {
                warnings.push('Author information is missing');
            }
            
            // 理由の検証
            if (!this.rationale || this.rationale.trim() === '') {
                warnings.push('Rationale for change is not provided');
            }
            
            // 値の妥当性検証
            if (typeof this.oldValue === 'number' && typeof this.newValue === 'number') {
                const changeRatio = Math.abs(this.newValue - this.oldValue) / this.oldValue;
                
                if (changeRatio > 2.0) {
                    warnings.push('Large change detected (>200%). Consider gradual adjustment.');
                }
                
                if (this.newValue <= 0 && this.oldValue > 0) {
                    warnings.push('Setting value to zero or negative may break functionality');
                }
            }
            
            // 影響度と値変更の整合性
            if (this.severity === 'low' && this.changeType === 'increase') {
                const changePercent = Math.abs((this.newValue - this.oldValue) / this.oldValue * 100);
                if (changePercent > 50) {
                    warnings.push('Change marked as low severity but has significant impact');
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                timestamp: Date.now()
            };
            
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_VALIDATION', {
                changeId: this.id,
                configType: this.configType,
                bubbleType: this.bubbleType
            });
            
            return {
                isValid: false,
                errors: ['Validation failed due to error'],
                warnings: [],
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * 変更を適用状態にマーク
     * @param {string} appliedBy - 適用者
     * @returns {boolean} 成功フラグ
     */
    markAsApplied(appliedBy = 'system') {
        try {
            if (this.applied) {
                console.warn(`[BalanceChange] 変更 ${this.id} は既に適用済みです`);
                return false;
            }
            
            this.applied = true;
            this.appliedAt = Date.now();
            this.appliedBy = appliedBy;
            
            console.log(`[BalanceChange] 変更 ${this.id} を適用済みにマーク`);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_APPLY', {
                changeId: this.id,
                appliedBy
            });
            return false;
        }
    }
    
    /**
     * 変更をロールバック
     * @param {string} reason - ロールバック理由
     * @param {string} rolledBackBy - ロールバック実行者
     * @returns {boolean} 成功フラグ
     */
    rollback(reason = '', rolledBackBy = 'system') {
        try {
            if (!this.canRollback) {
                console.warn(`[BalanceChange] 変更 ${this.id} はロールバック不可です`);
                return false;
            }
            
            if (this.rolledBack) {
                console.warn(`[BalanceChange] 変更 ${this.id} は既にロールバック済みです`);
                return false;
            }
            
            this.rolledBack = true;
            this.rollbackTimestamp = Date.now();
            this.rollbackReason = reason;
            this.applied = false;
            
            console.log(`[BalanceChange] 変更 ${this.id} をロールバック: ${reason}`);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_ROLLBACK', {
                changeId: this.id,
                reason,
                rolledBackBy
            });
            return false;
        }
    }
    
    /**
     * レビューステータスを更新
     * @param {string} status - レビューステータス (pending, approved, rejected)
     * @param {string} reviewer - レビュー者
     * @param {string} comments - レビューコメント
     * @returns {boolean} 成功フラグ
     */
    updateReviewStatus(status, reviewer = '', comments = '') {
        try {
            const validStatuses = ['pending', 'approved', 'rejected', 'needs_revision'];
            
            if (!validStatuses.includes(status)) {
                throw new Error(`Invalid review status: ${status}`);
            }
            
            this.reviewStatus = status;
            this.reviewedBy = reviewer;
            this.reviewedAt = Date.now();
            this.reviewComments = comments;
            
            console.log(`[BalanceChange] 変更 ${this.id} のレビューステータス更新: ${status}`);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_REVIEW', {
                changeId: this.id,
                status,
                reviewer
            });
            return false;
        }
    }
    
    /**
     * 関連する変更を追加
     * @param {string} relatedChangeId - 関連変更ID
     * @param {string} relationshipType - 関係タイプ
     */
    addRelatedChange(relatedChangeId, relationshipType = 'related') {
        try {
            if (!this.relatedChanges.find(r => r.changeId === relatedChangeId)) {
                this.relatedChanges.push({
                    changeId: relatedChangeId,
                    relationshipType,
                    addedAt: Date.now()
                });
                
                console.log(`[BalanceChange] 関連変更を追加: ${relatedChangeId} (${relationshipType})`);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_RELATION', {
                changeId: this.id,
                relatedChangeId,
                relationshipType
            });
        }
    }
    
    /**
     * タグを追加
     * @param {string|Array<string>} tags - 追加するタグ
     */
    addTags(tags) {
        try {
            const tagsToAdd = Array.isArray(tags) ? tags : [tags];
            
            for (const tag of tagsToAdd) {
                if (typeof tag === 'string' && tag.trim() !== '' && !this.tags.includes(tag)) {
                    this.tags.push(tag.trim());
                }
            }
            
            console.log(`[BalanceChange] タグを追加: ${tagsToAdd.join(', ')}`);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_TAGS', {
                changeId: this.id,
                tags
            });
        }
    }
    
    /**
     * 変更の影響度を計算
     * @returns {Object} 影響度情報
     */
    calculateImpact() {
        try {
            const impact = {
                numerical: 0,
                percentage: 0,
                direction: 'neutral',
                magnitude: 'low',
                description: ''
            };
            
            if (typeof this.oldValue === 'number' && typeof this.newValue === 'number') {
                impact.numerical = this.newValue - this.oldValue;
                impact.percentage = (impact.numerical / this.oldValue) * 100;
                
                if (impact.numerical > 0) {
                    impact.direction = 'increase';
                } else if (impact.numerical < 0) {
                    impact.direction = 'decrease';
                } else {
                    impact.direction = 'neutral';
                }
                
                const absPercentage = Math.abs(impact.percentage);
                if (absPercentage >= 100) {
                    impact.magnitude = 'critical';
                } else if (absPercentage >= 50) {
                    impact.magnitude = 'high';
                } else if (absPercentage >= 20) {
                    impact.magnitude = 'medium';
                } else {
                    impact.magnitude = 'low';
                }
                
                impact.description = `${impact.direction} by ${Math.abs(impact.numerical)} (${Math.abs(impact.percentage).toFixed(1)}%)`;
            } else {
                impact.description = `Changed from "${this.oldValue}" to "${this.newValue}"`;
                impact.magnitude = 'medium'; // 非数値変更は中程度として扱う
            }
            
            return impact;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_IMPACT', {
                changeId: this.id,
                oldValue: this.oldValue,
                newValue: this.newValue
            });
            
            return {
                numerical: 0,
                percentage: 0,
                direction: 'unknown',
                magnitude: 'unknown',
                description: 'Impact calculation failed',
                error: error.message
            };
        }
    }
    
    /**
     * 変更情報をJSON形式で取得
     * @returns {Object} JSON形式の変更情報
     */
    toJSON() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            configType: this.configType,
            bubbleType: this.bubbleType,
            propertyType: this.propertyType,
            oldValue: this.oldValue,
            newValue: this.newValue,
            changeType: this.changeType,
            author: this.author,
            rationale: this.rationale,
            impactAssessment: this.impactAssessment,
            reviewStatus: this.reviewStatus,
            tags: this.tags,
            validationResults: this.validationResults,
            reviewedBy: this.reviewedBy,
            reviewedAt: this.reviewedAt,
            reviewComments: this.reviewComments,
            canRollback: this.canRollback,
            rolledBack: this.rolledBack,
            rollbackTimestamp: this.rollbackTimestamp,
            rollbackReason: this.rollbackReason,
            relatedChanges: this.relatedChanges,
            parentChangeId: this.parentChangeId,
            childChanges: this.childChanges,
            applied: this.applied,
            appliedAt: this.appliedAt,
            appliedBy: this.appliedBy,
            severity: this.severity,
            riskLevel: this.riskLevel,
            affectedSystems: this.affectedSystems
        };
    }
    
    /**
     * JSON文字列から変更オブジェクトを復元
     * @param {string} jsonString - JSON文字列
     * @returns {BalanceChange} 復元された変更オブジェクト
     * @static
     */
    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return new BalanceChange(data);
        } catch (error) {
            console.error('[BalanceChange] JSON復元エラー:', error);
            throw new Error(`Failed to restore BalanceChange from JSON: ${error.message}`);
        }
    }
    
    /**
     * 変更の要約を取得
     * @returns {string} 変更要約
     */
    getSummary() {
        try {
            const impact = this.calculateImpact();
            const timestamp = new Date(this.timestamp).toLocaleString('ja-JP');
            
            let summary = `[${timestamp}] ${this.bubbleType}.${this.propertyType}: `;
            
            if (typeof this.oldValue === 'number' && typeof this.newValue === 'number') {
                summary += `${this.oldValue} → ${this.newValue} (${impact.direction} ${Math.abs(impact.percentage).toFixed(1)}%)`;
            } else {
                summary += `"${this.oldValue}" → "${this.newValue}"`;
            }
            
            if (this.author && this.author !== 'system') {
                summary += ` by ${this.author}`;
            }
            
            if (this.rationale) {
                summary += ` - ${this.rationale}`;
            }
            
            return summary;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'BALANCE_CHANGE_SUMMARY', {
                changeId: this.id
            });
            return `Change ${this.id} (summary generation failed)`;
        }
    }
    
    /**
     * 変更が有効かどうかチェック
     * @returns {boolean} 有効フラグ
     */
    isValid() {
        const validation = this.validate();
        return validation.isValid;
    }
    
    /**
     * 変更が適用可能かどうかチェック
     * @returns {boolean} 適用可能フラグ
     */
    canApply() {
        return this.isValid() && 
               !this.applied && 
               !this.rolledBack && 
               this.reviewStatus === 'approved';
    }
    
    /**
     * デバッグ用の詳細情報を出力
     */
    debug() {
        console.log(`[BalanceChange Debug] ID: ${this.id}`);
        console.log(`  Config: ${this.configType}`);
        console.log(`  Bubble: ${this.bubbleType}`);
        console.log(`  Property: ${this.propertyType}`);
        console.log(`  Value: ${this.oldValue} → ${this.newValue}`);
        console.log(`  Change Type: ${this.changeType}`);
        console.log(`  Author: ${this.author}`);
        console.log(`  Rationale: ${this.rationale}`);
        console.log(`  Review Status: ${this.reviewStatus}`);
        console.log(`  Applied: ${this.applied}`);
        console.log(`  Rolled Back: ${this.rolledBack}`);
        console.log(`  Severity: ${this.severity}`);
        console.log(`  Risk Level: ${this.riskLevel}`);
        console.log(`  Tags: ${this.tags.join(', ')}`);
        
        const impact = this.calculateImpact();
        console.log(`  Impact: ${impact.description} (${impact.magnitude})`);
        
        const validation = this.validate();
        console.log(`  Valid: ${validation.isValid}`);
        if (validation.errors.length > 0) {
            console.log(`  Errors: ${validation.errors.join(', ')}`);
        }
        if (validation.warnings.length > 0) {
            console.log(`  Warnings: ${validation.warnings.join(', ')}`);
        }
    }
}

export default BalanceChange;