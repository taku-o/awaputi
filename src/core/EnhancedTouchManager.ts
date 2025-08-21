// TypeScript conversion - basic types
interface BasicConfig { [key: string]: any }
import { getConfigurationManager  } from './ConfigurationManager.js';
import { getErrorHandler  } from '../utils/ErrorHandler.js';
import { getBrowserCompatibility  } from '../utils/BrowserCompatibility.js';

/**
 * Enhanced Touch Manager
 * 高度なタッチ操作管理システム - マルチタッチ、ジェスチャー検出、感度調整
 */
export class EnhancedTouchManager {
    private config: BasicConfig,
    private, state: any,
    constructor(canvas, gameEngine: any) {

        this.canvas = canvas,
        this.gameEngine = gameEngine,
        this.configManager = getConfigurationManager(),
        this.errorHandler = getErrorHandler(),
        
        // タッチ感度設定
        this.touchSensitivity = 1.0,
        this.multiTouchEnabled = true,
        
        // ジェスチャー閾値設定
        this.gestureThresholds = {
            swipe: { 
                minDistance: 50,
    maxTime: 500 }
                minVelocity: 0.5 
    };
            pinch: { minScale: 0.1,
                maxScale: 3.0,
    minDistance: 30 };
            longPress: { duration: 500,
    maxMovement: 10 };
            doubleTap: { maxInterval: 300,
    maxDistance: 25 
    };
        // タッチ状態管理
        this.touchState = { touches: new Map(), // タッチポイントのMap
            activeGestures: new Set(), // アクティブなジェスチャー,
            gestureHistory: [], // ジェスチャー履歴,
            lastTapTime: 0,
    tapCount: 0  };
        // パフォーマンス最適化
        this.touchPool = { pool: [],
            maxSize: 50,
    active: new Set(  }
        
        // 誤タッチ防止設定
        this.accidentalTouchPrevention = { enabled: true,
            edgeThreshold: 20, // 画面端からの距離,
            minTouchSize: 5, // 最小タッチサイズ,
            maxTouchSize: 100, // 最大タッチサイズ,
            rapidTapThreshold: 50 // 連続タップ間隔  };
        // コールバック登録
        this.callbacks = { onTouchStart: null,
            onTouchMove: null,
            onTouchEnd: null,
            onSwipe: null,
            onPinch: null,
            onLongPress: null,
    onDoubleTap: null  };
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            // タッチイベントプールの初期化
            this.initializeTouchPool(),
            
            // イベントリスナーの設定
            this.setupEventListeners(),
            // デバイス固有の最適化
            this.applyDeviceOptimizations()',
            console.log('[EnhancedTouchManager] 初期化完了') }

            ' }'

        } catch (error) { this.errorHandler.logError(error, {)'
                context: 'EnhancedTouchManager.initialize'
            });
        }
    }
    
    /**
     * タッチイベントプールの初期化
     */
    initializeTouchPool() {

        for(let, i = 0, i < 10, i++) {
            this.touchPool.pool.push({'
                id: null }

                type: '}
                position: { x: 0, y: 0  },
                startPosition: { x: 0, y: 0  },
                previousPosition: { x: 0, y: 0  },
                timestamp: 0;
                startTime: 0;
                pressure: 1.0,
    radius: { x: 0, y: 0  })
                force: 0);
                isActive: false';
    }
    
    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners()';
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), options');
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), options');
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), options');
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), options);
        ';
        // ポインターイベント（フォールバック）
        if(window.PointerEvent) {

            this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e)),
            this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e)),
            this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e)) }

            this.canvas.addEventListener('pointercancel', (e) => this.handlePointerCancel(e)); }
        }
        ';
        // コンテキストメニュー無効化
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault();
    }
    
    /**
     * デバイス固有の最適化
     */
    applyDeviceOptimizations() {
        const deviceInfo = getBrowserCompatibility().deviceInfo,
        const browserInfo = getBrowserCompatibility()',
        if (deviceInfo.platform === 'ios') {
            // iOS Safari のタッチ遅延を防ぐ
            this.canvas.style.touchAction = 'manipulation',
            this.canvas.style.webkitTouchCallout = 'none',
            this.canvas.style.webkitUserSelect = 'none',
            ',
            // 3D Touch / Force Touch対応
            if('ontouchforcechange' in, document' {
    }
                this.enable3DTouch = true; }
}
        ';
        // Android固有の最適化
        if(deviceInfo.platform === 'android') {
            // Androidのタッチ最適化
            this.canvas.style.touchAction = 'none' }

            this.canvas.style.userSelect = 'none'; }
        }
        
        // 小画面デバイスの調整
        if(deviceInfo.screenInfo.width < 400) {
            this.gestureThresholds.swipe.minDistance = 30 }
            this.gestureThresholds.doubleTap.maxDistance = 35; }
}
    
    /**
     * タッチ開始処理
     */
    handleTouchStart(event) {
        event.preventDefault(),
        
        try {
            const touches = event.changedTouches,
            
            for (let, i = 0, i < touches.length, i++) {
                const touch = touches[i],
                const touchData = this.getTouchFromPool(),
                
                if (!touchData) continue,
                // タッチデータの初期化
                const position = this.getTouchPosition(touch),

                touchData.id = touch.identifier }

                touchData.type = 'start'; }
                touchData.position = { ...position,
                touchData.startPosition = { ...position,
                touchData.previousPosition = { ...position,
                touchData.timestamp = Date.now(),
                touchData.startTime = Date.now(),
                touchData.pressure = touch.force || 1.0,
                touchData.radius = { x: touch.radiusX || 1,
                    y: touch.radiusY || 1  };
                touchData.isActive = true;
                
                // 誤タッチ防止チェック
                if(this.isAccidentalTouch(touchData) {
                    this.returnTouchToPool(touchData) }
                    continue; }
                }
                
                // タッチ状態に追加
                this.touchState.touches.set(touch.identifier, touchData);
                
                // コールバック呼び出し
                if (this.callbacks.onTouchStart) { this.callbacks.onTouchStart(touchData) }
                
                // ジェスチャー検出開始
                this.startGestureDetection();
            }
            
            // 16ms以内の応答を保証
            this.processImmediateFeedback();

        } catch (error) { this.errorHandler.logError(error, {)'
                context: 'EnhancedTouchManager.handleTouchStart'
            });
        }
    }
    
    /**
     * タッチ移動処理
     */
    handleTouchMove(event) {
        event.preventDefault(),
        
        try {
            const touches = event.changedTouches,
            
            for (let, i = 0, i < touches.length, i++) {
                const touch = touches[i],
                const touchData = this.touchState.touches.get(touch.identifier),
                
                if (!touchData) continue }
                // 位置更新 }
                touchData.previousPosition = { ...touchData.position,
                touchData.position = this.getTouchPosition(touch),
                touchData.timestamp = Date.now(),
                touchData.pressure = touch.force || 1.0,
                
                // コールバック呼び出し
                if (this.callbacks.onTouchMove) { this.callbacks.onTouchMove(touchData) }
            }
            
            // ジェスチャー検出更新
            this.updateGestureDetection();

        } catch (error) { this.errorHandler.logError(error, {)'
                context: 'EnhancedTouchManager.handleTouchMove'
            });
        }
    }
    
    /**
     * タッチ終了処理
     */
    handleTouchEnd(event) {
        event.preventDefault(),
        
        try {
            const touches = event.changedTouches,
            
            for (let, i = 0, i < touches.length, i++) {
                const touch = touches[i],
                const touchData = this.touchState.touches.get(touch.identifier),

                if(!touchData) continue,

                touchData.type = 'end',
                touchData.timestamp = Date.now(),
                
                // コールバック呼び出し
                if (this.callbacks.onTouchEnd) {
    }
                    this.callbacks.onTouchEnd(touchData); }
                }
                
                // タップ検出
                this.detectTap(touchData);
                
                // タッチ状態から削除
                this.touchState.touches.delete(touch.identifier);
                this.returnTouchToPool(touchData);
            }
            
            // ジェスチャー検出終了
            this.endGestureDetection();

        } catch (error) { this.errorHandler.logError(error, {)'
                context: 'EnhancedTouchManager.handleTouchEnd'
            });
        }
    }
    
    /**
     * タッチキャンセル処理
     */
    handleTouchCancel(event) {
        event.preventDefault(),
        
        try {
            const touches = event.changedTouches,
            
            for (let, i = 0, i < touches.length, i++) {
                const touch = touches[i],
                const touchData = this.touchState.touches.get(touch.identifier),
                
                if (touchData) {
                    this.touchState.touches.delete(touch.identifier) }
                    this.returnTouchToPool(touchData); }
}
            
            // 全ジェスチャーをリセット
            this.resetGestures();

        } catch (error) { this.errorHandler.logError(error, {)'
                context: 'EnhancedTouchManager.handleTouchCancel'
            }';
        }
    }
    
    /**
     * ポインターイベントハンドラー（フォールバック）'
     */''
    handlePointerDown(event) {

        if(event.pointerType === 'touch' {'
            // タッチイベントとして処理
            const fakeTouch = {
                identifier: event.pointerId,
                clientX: event.clientX,
                clientY: event.clientY,
                force: event.pressure,
    radiusX: event.width / 2 }
                radiusY: event.height / 2 
    };
            this.handleTouchStart({ ) }
                preventDefault: () => {};
                changedTouches: [fakeTouch];
            }) }
    }

    handlePointerMove(event) {

        if(event.pointerType === 'touch' && this.touchState.touches.has(event.pointerId) {
            const fakeTouch = {
                identifier: event.pointerId,
                clientX: event.clientX,
    clientY: event.clientY }
                force: event.pressure 
    };
            this.handleTouchMove({ ) }
                preventDefault: () => {};
                changedTouches: [fakeTouch];
            }) }
    }

    handlePointerUp(event) {

        if(event.pointerType === 'touch' && this.touchState.touches.has(event.pointerId) {
            const fakeTouch = {
    }
                identifier: event.pointerId 
    };
            this.handleTouchEnd({ ) }
                preventDefault: () => {};
                changedTouches: [fakeTouch];
            }) }
    }

    handlePointerCancel(event) {

        if(event.pointerType === 'touch' && this.touchState.touches.has(event.pointerId) {
            const fakeTouch = {
    }
                identifier: event.pointerId 
    };
            this.handleTouchCancel({ ) }
                preventDefault: () => {};
                changedTouches: [fakeTouch];
            }) }
    }
    
    /**
     * タッチ位置を取得
     */
    getTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect() }
        return { x: (touch.clientX - rect.left) * this.touchSensitivity };
            y: (touch.clientY - rect.top) * this.touchSensitivity 
    }
    
    /**
     * タッチプールから取得
     */
    getTouchFromPool() {
        if (this.touchPool.pool.length > 0) {
            const touch = this.touchPool.pool.pop(),
            this.touchPool.active.add(touch) }
            return touch;
        ';
        // プールが空の場合は新規作成
        if(this.touchPool.active.size < this.touchPool.maxSize) {
            const touch = {'
                id: null }

                type: '}
                position: { x: 0, y: 0  },
                startPosition: { x: 0, y: 0  },
                previousPosition: { x: 0, y: 0  },
                timestamp: 0;
                startTime: 0;
                pressure: 1.0,
    radius: { x: 0, y: 0  },
                force: 0,
    isActive: false;
            },
            this.touchPool.active.add(touch);
            return touch;
        }
        
        return null;
    }
    
    /**
     * タッチをプールに返却
     */
    returnTouchToPool(touch) {
        if(this.touchPool.active.has(touch) {
            this.touchPool.active.delete(touch),
            touch.isActive = false }
            this.touchPool.pool.push(touch); }
}
    
    /**
     * 誤タッチ判定
     */
    isAccidentalTouch(touchData) {
        if (!this.accidentalTouchPrevention.enabled) return false,
        
        const pos = touchData.position,
        const rect = this.canvas.getBoundingClientRect(),
        const edge = this.accidentalTouchPrevention.edgeThreshold,
        
        // 画面端チェック
        if (pos.x < edge || pos.x > rect.width - edge ||,
            pos.y < edge || pos.y > rect.height - edge) {
    }
            return true;
        
        // タッチサイズチェック
        const size = Math.max(touchData.radius.x, touchData.radius.y);
        if (size < this.accidentalTouchPrevention.minTouchSize ||;
            size > this.accidentalTouchPrevention.maxTouchSize) { return true }
        
        // 連続タップチェック
        const now = Date.now();
        const lastTouch = Array.from(this.touchState.touches.values().pop();
        if (lastTouch && now - lastTouch.startTime < this.accidentalTouchPrevention.rapidTapThreshold) { return true }
        
        return false;
    }
    
    /**
     * 即時フィードバック処理
     */
    processImmediateFeedback() {
        // 16ms以内に視覚的フィードバックを提供
        if (this.gameEngine && this.gameEngine.provideTouchFeedback) {
            requestAnimationFrame(() => { 
                this.gameEngine.provideTouchFeedback() }
                    Array.from(this.touchState.touches.values() }
                ); }
            });
        }
    }
    
    /**
     * ジェスチャー検出開始
     */
    startGestureDetection() {
        const touchCount = this.touchState.touches.size,
        
        if (touchCount === 1) {
            // シングルタッチジェスチャー
    }
            this.detectLongPress(); }
        } else if (touchCount === 2) { // マルチタッチジェスチャー
            this.detectPinch() }
    }
    
    /**
     * ジェスチャー検出更新
     */
    updateGestureDetection() {
        const touchCount = this.touchState.touches.size,
        
        if (touchCount === 1) {
    }
            this.detectSwipe(); }
        } else if (touchCount === 2) { this.updatePinch() }
    }
    
    /**
     * ジェスチャー検出終了
     */
    endGestureDetection() {
        // アクティブなジェスチャーを終了
    }
        this.touchState.activeGestures.forEach(gesture => { ) }
            this.endGesture(gesture); }
        });
    }
    
    /**
     * タップ検出
     */
    detectTap(touchData) { const duration = touchData.timestamp - touchData.startTime,
        const distance = this.calculateDistance(
            touchData.startPosition),
            touchData.position),
        
        // タップ条件チェック
        if (duration < this.gestureThresholds.longPress.duration &&,
            distance < this.gestureThresholds.longPress.maxMovement) {
            
            const now = Date.now(),
            
            // ダブルタップ検出
            if (now - this.touchState.lastTapTime < this.gestureThresholds.doubleTap.maxInterval) {
                const tapDistance = this.calculateDistance(
                    touchData.position),
                    this.touchState.lastTapPosition || touchData.position),
                
                if (tapDistance < this.gestureThresholds.doubleTap.maxDistance) {
                    this.touchState.tapCount++,
                    
                    if (this.touchState.tapCount === 2) {
                        // ダブルタップ
                        if (this.callbacks.onDoubleTap) {
                            this.callbacks.onDoubleTap({)
                                position: touchData.position }
                                timestamp: now); 
    }
                        this.touchState.tapCount = 0;
                    }
} else { this.touchState.tapCount = 1 }
            
            this.touchState.lastTapTime = now;
            this.touchState.lastTapPosition = { ...touchData.position }
    }
    
    /**
     * スワイプ検出
     */
    detectSwipe() { const touches = Array.from(this.touchState.touches.values(),
        if (touches.length !== 1) return,
        
        const touch = touches[0],
        const distance = this.calculateDistance(touch.startPosition, touch.position),
        const duration = Date.now() - touch.startTime,
        const velocity = distance / duration,
        
        if (distance > this.gestureThresholds.swipe.minDistance &&,
            duration < this.gestureThresholds.swipe.maxTime &&,
            velocity > this.gestureThresholds.swipe.minVelocity) {
            
            const direction = this.calculateSwipeDirection(
                touch.startPosition),
                touch.position),
            
            if (this.callbacks.onSwipe) {
                this.callbacks.onSwipe({
                    direction,
                    distance,
                    velocity,
                    startPosition: touch.startPosition,' }'

                    endPosition: touch.position'); }'
            }
            ';
            // ジェスチャー履歴に追加
            this.addToGestureHistory('swipe', { direction, velocity ) }
    }
    
    /**
     * 長押し検出
     */
    detectLongPress() {
        const touches = Array.from(this.touchState.touches.values(),
        if (touches.length !== 1) return,
        
        const touch = touches[0],
        
        // 長押しタイマー設定
        const longPressTimer = setTimeout(() => { 
            const currentTouch = this.touchState.touches.get(touch.id),
            if (!currentTouch) return,
            
            const distance = this.calculateDistance(
                currentTouch.startPosition),
                currentTouch.position),
            
            if (distance < this.gestureThresholds.longPress.maxMovement) {
                if (this.callbacks.onLongPress) {
                    this.callbacks.onLongPress({
            });
                        position: currentTouch.position,') }'

                        duration: this.gestureThresholds.longPress.duration'); }'
                }

                this.addToGestureHistory('longPress', {
                position: currentTouch.position 
    
            }), this.gestureThresholds.longPress.duration);
        
        // タイマーを保存
        touch.longPressTimer = longPressTimer;
    }
    
    /**
     * ピンチ検出
     */
    detectPinch() {
        const touches = Array.from(this.touchState.touches.values(),
        if (touches.length !== 2) return,
        
        const initialDistance = this.calculateDistance(
            touches[0].position),
            touches[1].position),
        
        // ピンチ状態を保存
        this.touchState.pinchData = {
            initialDistance,
            currentDistance: initialDistance,
    scale: 1.0 }

            center: this.calculateCenter(touches[0].position, touches[1].position); }
        };

        this.touchState.activeGestures.add('pinch);
    }
    
    /**
     * ピンチ更新
     */
    updatePinch() {
        if (!this.touchState.pinchData) return,
        
        const touches = Array.from(this.touchState.touches.values(),
        if (touches.length !== 2) return,
        
        const currentDistance = this.calculateDistance(
            touches[0].position),
            touches[1].position),
        
        const scale = currentDistance / this.touchState.pinchData.initialDistance,
        const center = this.calculateCenter(touches[0].position, touches[1].position),
        
        // 最小変化量チェック
        if (Math.abs(currentDistance - this.touchState.pinchData.currentDistance) > ,
            this.gestureThresholds.pinch.minDistance) {
            
            this.touchState.pinchData.currentDistance = currentDistance,
            this.touchState.pinchData.scale = scale,
            this.touchState.pinchData.center = center,
            
            if (this.callbacks.onPinch) {
                this.callbacks.onPinch({)
                    scale: Math.max(),
                        this.gestureThresholds.pinch.minScale),
                        Math.min(this.gestureThresholds.pinch.maxScale, scale),
                    center }
                    distance: currentDistance 
    });
            }
}
    
    /**
     * ジェスチャー終了
     */
    endGesture(gestureName) {

        this.touchState.activeGestures.delete(gestureName),

        if(gestureName === 'pinch' { }
            this.touchState.pinchData = null; }
}
    
    /**
     * ジェスチャーリセット
     */
    resetGestures() {
        this.touchState.activeGestures.clear(),
        this.touchState.pinchData = null,
        
        // 長押しタイマーをクリア
        this.touchState.touches.forEach(touch => { ) }
            if (touch.longPressTimer) { }
                clearTimeout(touch.longPressTimer); }
});
    }
    
    /**
     * 距離計算
     */
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x,
        const dy = pos2.y - pos1.y }
        return Math.sqrt(dx * dx + dy * dy);
    
    /**
     * 中心点計算
     */
    calculateCenter(pos1, pos2) { return { x: (pos1.x + pos2.x) / 2 };
            y: (pos1.y + pos2.y) / 2 
    }
    
    /**
     * スワイプ方向計算
     */
    calculateSwipeDirection(startPos, endPos) {
        const dx = endPos.x - startPos.x,
        const dy = endPos.y - startPos.y,
        const angle = Math.atan2(dy, dx) * 180 / Math.PI,

        if(angle >= -45 && angle < 45) return 'right',
        if(angle >= 45 && angle < 135) return 'down',
        if(angle >= -135 && angle < -45) return 'up' }

        return 'left';
    
    /**
     * ジェスチャー履歴に追加
     */
    addToGestureHistory(type, data) {
        this.touchState.gestureHistory.push({)
            type),
            data }
            timestamp: Date.now(); 
    });
        
        // 履歴サイズ制限
        if (this.touchState.gestureHistory.length > 50) { this.touchState.gestureHistory.shift() }
    }
    
    /**
     * タッチ感度調整
     */
    adjustTouchSensitivity(level) { this.touchSensitivity = Math.max(0.5, Math.min(2.0, level) }
        console.log(`[EnhancedTouchManager] タッチ感度を ${this.touchSensitivity} に調整`});
    }
    
    /**
     * ジェスチャー閾値設定
     */
    configureTouchSettings(settings) {
        if (settings.sensitivity !== undefined) {
    }
            this.adjustTouchSensitivity(settings.sensitivity); }
        }
        
        if (settings.multiTouch !== undefined) { this.multiTouchEnabled = settings.multiTouch }
        
        if (settings.gestures) { Object.assign(this.gestureThresholds, settings.gestures) }
        
        if (settings.accidentalTouchPrevention) { Object.assign(this.accidentalTouchPrevention, settings.accidentalTouchPrevention) }
    }
    
    /**
     * タッチ機能情報取得
     */
    getTouchCapabilities() {

        const browserInfo = getBrowserCompatibility('''
            touchSupported: 'ontouchstart' in window,
            forceSupported: 'ontouchforcechange' in document,
            pointerSupported: window.PointerEvent !== undefined,
            multiTouchEnabled: this.multiTouchEnabled),
            sensitivity: this.touchSensitivity,
    activeGestures: Array.from(this.touchState.activeGestures) }
            activeTouches: this.touchState.touches.size 
    }
    
    /**
     * コールバック登録
     */
    registerCallback(event, callback) {

        if(this.callbacks.hasOwnProperty(event) && typeof callback === 'function') {
    }
            this.callbacks[event] = callback; }
}
    
    /**
     * 現在のタッチ状態取得
     */
    getTouchState() {
        return { touchCount: this.touchState.touches.size,
            touches: Array.from(this.touchState.touches.values().map(t => ({)
                id: t.id,
    position: { ...t.position ) }
                pressure: t.pressure };
                duration: Date.now() - t.startTime 
    });
            activeGestures: Array.from(this.touchState.activeGestures,
    lastGesture: this.touchState.gestureHistory[this.touchState.gestureHistory.length - 1];
        } }
    
    /**
     * クリーンアップ'
     */''
    cleanup()';
        this.canvas.removeEventListener('touchstart', this.handleTouchStart, options';
        this.canvas.removeEventListener('touchmove', this.handleTouchMove, options';
        this.canvas.removeEventListener('touchend', this.handleTouchEnd, options';
        this.canvas.removeEventListener('touchcancel', this.handleTouchCancel, options);

        if(window.PointerEvent) {

            this.canvas.removeEventListener('pointerdown', this.handlePointerDown',
            this.canvas.removeEventListener('pointermove', this.handlePointerMove',
            this.canvas.removeEventListener('pointerup', this.handlePointerUp' }

            this.canvas.removeEventListener('pointercancel', this.handlePointerCancel); }
        }
        
        // ジェスチャーリセット
        this.resetGestures();
        
        // タッチ状態クリア
        this.touchState.touches.clear();
        this.touchPool.active.clear()';
        console.log('[EnhancedTouchManager] クリーンアップ完了');

    }'}