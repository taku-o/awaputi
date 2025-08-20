import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * オフライン管理 - オフライン状態での動作とオンライン復帰時の処理
 * 
 * 責任:
 * - オフライン状態の検出と管理
 * - オフライン時のローカルデータ優先処理
 * - オンライン復帰時の自動同期
 * - オフライン操作のキューイング
 */
export class OfflineManager {
    constructor(dataStorage, syncManager) {
        this.dataStorage = dataStorage;
        this.syncManager = syncManager;
        
        this.config = {
            enableOfflineMode: true,
            maxOfflineOperations: 1000,
            offlineDataExpiry: 7 * 24 * 60 * 60 * 1000, // 7日間;
            autoSyncOnReconnect: true,
            syncDelay: 2000, // オンライン復帰後の同期遅延（ms）;
            heartbeatInterval: 30000, // 30秒;
    }
    }
            maxHeartbeatRetries: 3 }
        },
        
        this.state = { isOnline: navigator.onLine,'
            lastOnlineTime: navigator.onLine ? Date.now() : null,'';
            lastOfflineTime: navigator.onLine ? null : Date.now(''';
            connectionQuality: 'unknown' // 'good', 'poor', 'unstable', 'offline' }
        };
        
        this.heartbeatTimer = null;)
        this.reconnectTimer = null;)
        this.eventListeners = new Map();
        
        this.initialize();
    }
    
    /**
     * オフライン管理の初期化'
     */''
    async initialize('')';
            console.log('OfflineManager: オフライン管理を初期化中...'),
            
            // 保存されたオフライン状態の復元
            await this.restoreOfflineState();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // ハートビート監視の開始
            this.startHeartbeat();
            ';
            // 初期接続テスト''
            await this.checkConnectionQuality('')';
            console.log('OfflineManager: 初期化が完了しました'),
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'OFFLINE_MANAGER_INITIALIZATION_ERROR', {')'
                operation: 'initialize'), };
            });
        }
    }
    
    /**
     * オンライン状態の変更処理
     */
    async handleOnlineStateChange(isOnline) { const previousState = this.state.isOnline;
        this.state.isOnline = isOnline;
         }
        console.log(`OfflineManager: Online state changed from ${previousState} to ${ isOnline)`);
        
        if(isOnline && !previousState) {
        
            
        
        }
            // オフライン → オンライン }
            await this.handleOnlineRecovery(});'
        } else if (!isOnline && previousState) { // オンライン → オフライン''
            await this.handleOfflineTransition(''';
        this.emitEvent('connectionStateChanged', {)
            isOnline,);
            previousState);
            timestamp: Date.now(); }
        });
        
        // オフライン状態の保存
        await this.saveOfflineState();
    }
    
    /**
     * オンライン復帰時の処理
     */'
    async handleOnlineRecovery() { try {''
            this.state.lastOnlineTime = Date.now('')';
            console.log('OfflineManager: Handling online recovery...'),
            
            // 接続品質の確認
            await this.checkConnectionQuality();
            ';
            // 自動同期の実行（設定されている場合）''
            if(this.config.autoSyncOnReconnect && this.syncManager') {'
                '';
                console.log('OfflineManager: Scheduling auto-sync after reconnection...'),
                ';
                // 遅延後に同期実行''
                setTimeout(async (') => { 
                    try {'
                        await this.syncManager.sync({'
            })'
                            direction: 'bidirectional',') }'
                            reason: 'online_recovery'),' };'
                        }');'
                        '';
                        console.log('OfflineManager: Auto-sync after reconnection completed'),'';
                    } catch (error') { ''
                        console.error('OfflineManager: Auto-sync after reconnection failed:', error); }
                    }
                }, this.config.syncDelay);
            }
            ';
            // オフライン操作の処理''
            await this.processOfflineOperations('')';
            this.emitEvent('onlineRecovery', { )
                offlineOperations: this.state.offlineOperations.length),
                offlineDuration: Date.now() - (this.state.lastOfflineTime || Date.now(), };
            });
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'ONLINE_RECOVERY_ERROR', {')'
                operation: 'handleOnlineRecovery'); }
            });
        }
    }
    
    /**
     * オフライン移行時の処理
     */'
    async handleOfflineTransition() { try {''
            this.state.lastOfflineTime = Date.now(''';
            this.state.connectionQuality = 'offline';)'
            ')';
            console.log('OfflineManager: Handling offline transition...''),
            ';
            // オフライン通知''
            this.emitEvent('offlineTransition', {)
                lastOnlineTime: this.state.lastOnlineTime),
                timestamp: Date.now(); }
            });
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'OFFLINE_TRANSITION_ERROR', {')'
                operation: 'handleOfflineTransition'); }
            });
        }
    }
    
    /**
     * オフライン操作の記録
     */'
    async recordOfflineOperation(operation) { ''
        if(!this.config.enableOfflineMode') {'
            ';
        }'
            throw new Error('Offline mode is disabled'); }
        }
        
        try { // 操作キューの容量チェック
            if(this.state.offlineOperations.length >= this.config.maxOfflineOperations) {'
                // 古い操作を削除''
                this.state.offlineOperations.shift('');
            }'
                console.warn('OfflineManager: Offline operations queue is full, removing oldest operation'); }
            }
            
            const offlineOperation = { id: Date.now() + Math.random(),
                type: operation.type,
                key: operation.key,';
                data: operation.data,'';
                timestamp: Date.now(''';
                status: 'pending' })
            })
            );
            this.state.offlineOperations.push(offlineOperation);
            
            console.log(`OfflineManager: Recorded offline operation: ${operation.type} for key: ${ operation.key)`),
            
            // オフライン状態の保存 }
            await this.saveOfflineState(});
            
            return offlineOperation.id;
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'OFFLINE_OPERATION_RECORD_ERROR', {')'
                operation: 'recordOfflineOperation',);
                operationType: operation.type); }
            });
            throw error;
        }
    }
    
    /**
     * オフライン操作の処理
     */
    async processOfflineOperations() { if (this.state.offlineOperations.length === 0) {
            return; }
        }
        
        console.log(`OfflineManager: Processing ${ this.state.offlineOperations.length) offline operations...`),
        
        const processedOperations = [];
        const failedOperations = [];
        
        for(const operation of this.state.offlineOperations) {
        ';
            try {''
                await this.executeOfflineOperation(operation');'
        
        }'
                operation.status = 'completed'; }
                processedOperations.push(operation});
                
            } catch (error) { operation.retries++;
                operation.lastError = error.message;'
                '';
                if(operation.retries >= 3') {'
                    '';
                    operation.status = 'failed';
                }
                    failedOperations.push(operation); }
                    console.error(`OfflineManager: Failed to process operation ${operation.id) after 3 retries:`, error});
                } else {  }
                    console.warn(`OfflineManager: Retry ${operation.retries} for operation ${operation.id):`, error.message});
                }
            }
        }
        
        // 完了した操作を削除
        this.state.offlineOperations = this.state.offlineOperations.filter();
            op => !processedOperations.includes(op) && !failedOperations.includes(op);'
        '';
        console.log(`OfflineManager: Processed ${processedOperations.length} operations, ${ failedOperations.length) failed`');
        ';
        // 結果の通知''
        this.emitEvent('offlineOperationsProcessed', {)
            processed: processedOperations.length);
            failed: failedOperations.length,);
            remaining: this.state.offlineOperations.length),
        
        // オフライン状態の保存 }
        await this.saveOfflineState(});
    }
    
    /**
     * 個別オフライン操作の実行
     */'
    async executeOfflineOperation(operation) { ''
        switch(operation.type') {'
            '';
            case 'save':';
                if (this.syncManager && this.syncManager.cloudStorage) {'
        }'
                    await this.syncManager.cloudStorage.set(operation.key, operation.data'); }
                }
                break;'
                '';
            case 'remove':;
                if (this.syncManager && this.syncManager.cloudStorage) { await this.syncManager.cloudStorage.remove(operation.key); }
                }
                break;
                
            default:;
                throw new Error(`Unknown offline operation type: ${operation.type)`}),
        }
    }
    
    /**
     * 接続品質の確認
     */'
    async checkConnectionQuality() { ''
        if(!navigator.onLine') {'
            '';
            this.state.connectionQuality = 'offline';'
        }'
            return 'offline'; }
        }
        ';
        try { ''
            const startTime = performance.now(''';
            const response = await fetch('/favicon.ico', {')'
                method: 'HEAD',')';
                cache: 'no-cache';
            ),
            ;
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            // 応答時間による品質判定'
            let quality;''
            if(responseTime < 200') {'
                ';
            }'
                quality = 'good';' }'
            } else if (responseTime < 1000') { ''
                quality = 'poor'; }'
            } else {  ' }'
                quality = 'unstable'; }
            }
            
            this.state.connectionQuality = quality;
            this.state.heartbeatFailures = 0;
            
            console.log(`OfflineManager: Connection quality: ${quality) (${responseTime.toFixed(0})}ms)`);
            
            return quality;
            
        } catch (error) { this.state.heartbeatFailures++;'
            '';
            if(this.state.heartbeatFailures >= this.config.maxHeartbeatRetries') {'
                '';
                this.state.connectionQuality = 'offline';'
                // navigator.onLineが間違っている場合の対処''
                if (navigator.onLine') {''
                    console.warn('OfflineManager: Navigator reports online but connection failed, treating as offline');'
            }'
                    await this.handleOnlineStateChange(false'); }
                }'
            } else {  ' }'
                this.state.connectionQuality = 'unstable'; }
            }
            
            return this.state.connectionQuality;
        }
    }
    
    /**
     * ハートビート監視の開始
     */
    startHeartbeat() {
        if (this.heartbeatTimer) {
    }
            this.stopHeartbeat(); }
        }
        
        this.heartbeatTimer = setInterval(async () => { await this.checkConnectionQuality(); }
        }, this.config.heartbeatInterval);
        
        console.log(`OfflineManager: Heartbeat monitoring started (interval: ${this.config.heartbeatInterval}ms)`);
    }
    
    /**
     * ハートビート監視の停止
     */
    stopHeartbeat() {'
        if (this.heartbeatTimer) {''
            clearInterval(this.heartbeatTimer');'
            this.heartbeatTimer = null;'
    }'
            console.log('OfflineManager: Heartbeat monitoring stopped'), }
        }
    }
    
    /**
     * オフライン状態の保存'
     */''
    async saveOfflineState('')';
            await this.dataStorage.save('_offlineState', stateData);''
        } catch (error') { ''
            console.warn('OfflineManager: Failed to save offline state:', error); }
        }
    }
    
    /**
     * オフライン状態の復元'
     */''
    async restoreOfflineState('')';
            const stateData = await this.dataStorage.load('_offlineState');''
            if(stateData') {
                this.state.lastOnlineTime = stateData.lastOnlineTime;
                this.state.lastOfflineTime = stateData.lastOfflineTime;'
                this.state.offlineOperations = stateData.offlineOperations || [];''
                this.state.connectionQuality = stateData.connectionQuality || 'unknown';
                
                // 古いオフライン操作の削除
                const now = Date.now();
                this.state.offlineOperations = this.state.offlineOperations.filter();
                    op => (now - op.timestamp) < this.config.offlineDataExpiry;
                );
            }
                 }'
                console.log(`OfflineManager: Restored ${this.state.offlineOperations.length) offline operations`});''
            } catch (error') { ''
            console.warn('OfflineManager: Failed to restore offline state:', error); }
        }
    }
    
    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners('')';
        window.addEventListener('online', () => { this.handleOnlineStateChange(true);' }'
        }');'
        '';
        window.addEventListener('offline', () => { this.handleOnlineStateChange(false);' }'
        }');
        ';
        // ページ非表示時の状態保存''
        document.addEventListener('visibilitychange', () => {  if (document.hidden) { }
                this.saveOfflineState(); }'
            }''
        }');
        ';
        // ページアンロード時の状態保存''
        window.addEventListener('beforeunload', () => { this.saveOfflineState(); }
        });
    }
    
    /**
     * オフライン状態の取得
     */
    getOfflineStatus() {
        return { isOnline: this.state.isOnline,
            connectionQuality: this.state.connectionQuality,
            lastOnlineTime: this.state.lastOnlineTime,
            lastOfflineTime: this.state.lastOfflineTime,
            offlineOperations: this.state.offlineOperations.length,
            heartbeatFailures: this.state.heartbeatFailures,
    }
            offlineDuration: this.state.lastOfflineTime ?   : undefined };
                Date.now() - this.state.lastOfflineTime : 0 }
        },
    }
    
    /**
     * オフライン設定の更新
     */
    updateConfig(newConfig) {
        const oldHeartbeatInterval = this.config.heartbeatInterval;
    }
         }
        this.config = { ...this.config, ...newConfig };
        
        // ハートビート間隔が変更された場合は再起動
        if(newConfig.heartbeatInterval && newConfig.heartbeatInterval !== oldHeartbeatInterval) {'
            '';
            this.startHeartbeat('');
        }'
        console.log('OfflineManager: Configuration updated', this.config); }
    }
    
    /**
     * オフライン操作のクリア
     */
    clearOfflineOperations() {'
        this.state.offlineOperations = [];''
        this.saveOfflineState('');
    }'
        console.log('OfflineManager: Offline operations cleared'), }
    }
    
    /**
     * イベントの発行
     */
    emitEvent(eventName, data = null) {
        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(listener => { )
    }
            try {); }
                listener(data); }
            } catch (error) {
                console.error(`OfflineManager: Error in event listener for ${eventName}:`, error);
            }
        });
    }
    
    /**
     * イベントリスナーの追加
     */
    on(eventName, listener) {
        if(!this.eventListeners.has(eventName) {
    }
            this.eventListeners.set(eventName, []); }
        }
        this.eventListeners.get(eventName).push(listener);
    }
    
    /**
     * イベントリスナーの削除
     */
    off(eventName, listener) {
        const listeners = this.eventListeners.get(eventName) || [];
        const index = listeners.indexOf(listener);
        if (index > -1) {
    }
            listeners.splice(index, 1); }
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        try {
            // ハートビート監視の停止
            this.stopHeartbeat();
            
            // 再接続タイマーの停止
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
    }
                this.reconnectTimer = null; }
            }
            
            // イベントリスナーの削除
            this.eventListeners.clear();
            ';
            // オフライン状態の最終保存''
            this.saveOfflineState('')';
            console.log('OfflineManager: Destroyed'),
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'OFFLINE_MANAGER_DESTROY_ERROR', {')'
                operation: 'destroy'),' }'
            }');
        }'
    }''
}