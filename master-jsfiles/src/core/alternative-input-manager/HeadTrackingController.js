/**
 * Head Tracking Controller
 * ヘッドトラッキング制御 - 頭部動作とジェスチャー認識の専門管理
 */
export class HeadTrackingController {
    constructor() {
        // ヘッドトラッキング設定
        this.headTrackingConfig = {
            enabled: false,
            sensitivity: 1.0,
            deadZone: 0.1,
            smoothing: 0.5,
            calibrationTime: 3000,
            gestureRecognition: true,
            invertX: false,
            invertY: false
        };
        
        // 追跡状態
        this.headState = {
            isCalibrated: false,
            neutralPosition: null,
            currentPosition: { x: 0, y: 0, z: 0 },
            gestureBuffer: [],
            isTracking: false,
            lastUpdate: 0
        };
        
        // ジェスチャー認識
        this.gestureRecognition = {
            enabled: true,
            gestures: new Map([
                ['nod', { pattern: 'y_oscillation', threshold: 0.3, duration: 1000 }],
                ['shake', { pattern: 'x_oscillation', threshold: 0.3, duration: 1000 }],
                ['tilt_left', { pattern: 'z_negative', threshold: 0.4, duration: 500 }],
                ['tilt_right', { pattern: 'z_positive', threshold: 0.4, duration: 500 }],
                ['lean_forward', { pattern: 'y_positive', threshold: 0.5, duration: 300 }],
                ['lean_back', { pattern: 'y_negative', threshold: 0.5, duration: 300 }]
            ]),
            recognizedGestures: [],
            gestureCallbacks: new Map()
        };
        
        // WebRTC メディアストリーム
        this.mediaStream = null;
        this.videoElement = null;
        
        // MediaPipe Face Mesh
        this.faceMesh = null;
        this.faceMeshLoaded = false;
        
        // 視覚インターフェース
        this.trackingInterface = null;
        this.headPointer = null;
        this.calibrationInterface = null;
        
        // 統計
        this.stats = {
            trackingFrames: 0,
            gesturesRecognized: 0,
            averagePosition: { x: 0, y: 0, z: 0 },
            trackingAccuracy: 0,
            sessionStart: Date.now()
        };
        
        console.log('[HeadTrackingController] Initialized');
    }
    
    /**
     * ヘッドトラッキングを初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initializeHeadTracking(config = {}) {
        Object.assign(this.headTrackingConfig, config.headTracking || {});
        
        if (!this.headTrackingConfig.enabled) return;
        
        try {
            await this.setupCamera();
            await this.loadFaceMesh();
            this.setupHeadTracking();
            this.createTrackingInterface();
            this.setupGestureCallbacks();
            
            console.log('[HeadTrackingController] Head tracking initialized');
        } catch (error) {
            console.error('[HeadTrackingController] Initialization failed:', error);
        }
    }
    
    /**
     * カメラをセットアップ
     */
    async setupCamera() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                }
            });
            
            // 非表示のビデオ要素を作成
            this.videoElement = document.createElement('video');
            this.videoElement.style.cssText = `
                position: fixed;
                top: -1000px;
                left: -1000px;
                width: 640px;
                height: 480px;
            `;
            this.videoElement.srcObject = this.mediaStream;
            this.videoElement.autoplay = true;
            this.videoElement.muted = true;
            
            document.body.appendChild(this.videoElement);
            
            console.log('[HeadTrackingController] Camera setup completed');
        } catch (error) {
            throw new Error(`Camera setup failed: ${error.message}`);
        }
    }
    
    /**
     * MediaPipe Face Meshをロード
     */
    async loadFaceMesh() {
        try {
            // MediaPipe Face Meshライブラリをロード
            await this.loadMediaPipeScript();
            
            // Face Meshを初期化
            this.faceMesh = new window.FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });
            
            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.faceMesh.onResults((results) => {
                this.processFaceMeshResults(results);
            });
            
            this.faceMeshLoaded = true;
            console.log('[HeadTrackingController] Face Mesh loaded');
        } catch (error) {
            throw new Error(`Face Mesh loading failed: ${error.message}`);
        }
    }
    
    /**
     * MediaPipeスクリプトをロード
     */
    async loadMediaPipeScript() {
        return new Promise((resolve, reject) => {
            // MediaPipe関連のスクリプトを順次ロード
            const scripts = [
                'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
                'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
                'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
                'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
            ];
            
            let loadedCount = 0;
            
            scripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loadedCount++;
                    if (loadedCount === scripts.length) {
                        resolve();
                    }
                };
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        });
    }
    
    /**
     * ヘッドトラッキングをセットアップ
     */
    setupHeadTracking() {
        if (!this.videoElement || !this.faceMeshLoaded) return;
        
        // Camera utilsを使用してビデオ処理を開始
        const camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
                if (this.faceMesh && this.headState.isTracking) {
                    await this.faceMesh.send({ image: this.videoElement });
                }
            },
            width: 640,
            height: 480
        });
        
        camera.start();
        this.headState.isTracking = true;
    }
    
    /**
     * Face Mesh結果を処理
     * @param {Object} results - Face Mesh結果
     */
    processFaceMeshResults(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            return;
        }
        
        this.stats.trackingFrames++;
        
        const landmarks = results.multiFaceLandmarks[0];
        const headPosition = this.calculateHeadPosition(landmarks);
        
        // 位置データを平滑化
        const smoothedPosition = this.smoothHeadPosition(headPosition);
        this.headState.currentPosition = smoothedPosition;
        this.headState.lastUpdate = Date.now();
        
        // ジェスチャー認識
        if (this.gestureRecognition.enabled) {
            this.processGestureRecognition(smoothedPosition);
        }
        
        // 頭部ポインターを更新
        this.updateHeadPointer(smoothedPosition);
        
        // 統計を更新
        this.updateStats(smoothedPosition);
    }
    
    /**
     * ランドマークから頭部位置を計算
     * @param {Array} landmarks - 顔のランドマーク
     * @returns {Object} 頭部位置
     */
    calculateHeadPosition(landmarks) {
        // 主要な顔の特徴点を使用して頭部の向きを計算
        const noseTip = landmarks[1]; // 鼻先
        const leftEye = landmarks[33]; // 左目
        const rightEye = landmarks[263]; // 右目
        const chin = landmarks[17]; // 顎
        
        // 顔の中心を計算
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;
        const centerZ = (leftEye.z + rightEye.z) / 2;
        
        // 頭部の傾きを計算
        const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        const headTilt = eyeAngle * (180 / Math.PI);
        
        // 上下の角度を計算
        const faceHeight = Math.abs(chin.y - centerY);
        const verticalAngle = (noseTip.y - centerY) / faceHeight;
        
        // 左右の角度を計算
        const horizontalAngle = (noseTip.x - centerX) * 2;
        
        return {
            x: horizontalAngle * (this.headTrackingConfig.invertX ? -1 : 1),
            y: verticalAngle * (this.headTrackingConfig.invertY ? -1 : 1),
            z: headTilt,
            center: { x: centerX, y: centerY, z: centerZ },
            landmarks: { noseTip, leftEye, rightEye, chin }
        };
    }
    
    /**
     * 頭部位置を平滑化
     * @param {Object} position - 生の位置データ
     * @returns {Object} 平滑化された位置データ
     */
    smoothHeadPosition(position) {
        const factor = this.headTrackingConfig.smoothing;
        const current = this.headState.currentPosition;
        
        // デッドゾーンの適用
        const deadZone = this.headTrackingConfig.deadZone;
        const applyDeadZone = (value) => {
            return Math.abs(value) < deadZone ? 0 : value;
        };
        
        const smoothed = {
            x: current.x * factor + applyDeadZone(position.x) * (1 - factor),
            y: current.y * factor + applyDeadZone(position.y) * (1 - factor),
            z: current.z * factor + applyDeadZone(position.z) * (1 - factor)
        };
        
        // 感度調整
        const sensitivity = this.headTrackingConfig.sensitivity;
        return {
            x: smoothed.x * sensitivity,
            y: smoothed.y * sensitivity,
            z: smoothed.z * sensitivity
        };
    }
    
    /**
     * ジェスチャー認識を処理
     * @param {Object} position - 頭部位置
     */
    processGestureRecognition(position) {
        const now = Date.now();
        
        // ジェスチャーバッファーに追加
        this.headState.gestureBuffer.push({
            position: { ...position },
            timestamp: now
        });
        
        // バッファーサイズを制限（2秒間のデータ）
        this.headState.gestureBuffer = this.headState.gestureBuffer
            .filter(entry => now - entry.timestamp < 2000);
        
        // 各ジェスチャーパターンをチェック
        for (const [gestureName, gestureConfig] of this.gestureRecognition.gestures) {
            if (this.detectGesturePattern(gestureName, gestureConfig)) {
                this.handleGestureRecognition(gestureName);
            }
        }
    }
    
    /**
     * ジェスチャーパターンを検出
     * @param {string} gestureName - ジェスチャー名
     * @param {Object} gestureConfig - ジェスチャー設定
     * @returns {boolean} パターンが検出されたかどうか
     */
    detectGesturePattern(gestureName, gestureConfig) {
        const buffer = this.headState.gestureBuffer;
        const now = Date.now();
        
        // 指定期間内のデータを取得
        const relevantData = buffer.filter(entry => 
            now - entry.timestamp < gestureConfig.duration
        );
        
        if (relevantData.length < 5) return false; // 最小データ数
        
        switch (gestureConfig.pattern) {
            case 'y_oscillation': // うなずき
                return this.detectOscillation(relevantData, 'y', gestureConfig.threshold);
            
            case 'x_oscillation': // 首振り
                return this.detectOscillation(relevantData, 'x', gestureConfig.threshold);
            
            case 'z_negative': // 左傾き
                return this.detectTilt(relevantData, 'z', -gestureConfig.threshold);
            
            case 'z_positive': // 右傾き
                return this.detectTilt(relevantData, 'z', gestureConfig.threshold);
            
            case 'y_positive': // 前傾
                return this.detectTilt(relevantData, 'y', gestureConfig.threshold);
            
            case 'y_negative': // 後傾
                return this.detectTilt(relevantData, 'y', -gestureConfig.threshold);
            
            default:
                return false;
        }
    }
    
    /**
     * 振動パターンを検出
     * @param {Array} data - 位置データ配列
     * @param {string} axis - 軸 ('x', 'y', 'z')
     * @param {number} threshold - 閾値
     * @returns {boolean} 振動が検出されたかどうか
     */
    detectOscillation(data, axis, threshold) {
        if (data.length < 10) return false;
        
        const values = data.map(entry => entry.position[axis]);
        let peaks = 0;
        let valleys = 0;
        
        for (let i = 1; i < values.length - 1; i++) {
            const prev = values[i - 1];
            const curr = values[i];
            const next = values[i + 1];
            
            // ピーク検出
            if (curr > prev && curr > next && curr > threshold) {
                peaks++;
            }
            // 谷検出
            if (curr < prev && curr < next && curr < -threshold) {
                valleys++;
            }
        }
        
        // 少なくとも2回の往復運動
        return peaks >= 2 && valleys >= 2;
    }
    
    /**
     * 傾きパターンを検出
     * @param {Array} data - 位置データ配列
     * @param {string} axis - 軸 ('x', 'y', 'z')
     * @param {number} threshold - 閾値
     * @returns {boolean} 傾きが検出されたかどうか
     */
    detectTilt(data, axis, threshold) {
        if (data.length < 5) return false;
        
        const recentValues = data.slice(-5).map(entry => entry.position[axis]);
        const average = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
        
        // 閾値との比較（正負を考慮）
        return threshold > 0 ? average > threshold : average < threshold;
    }
    
    /**
     * ジェスチャー認識を処理
     * @param {string} gestureName - 認識されたジェスチャー名
     */
    handleGestureRecognition(gestureName) {
        // 同じジェスチャーの連続認識を防ぐ
        const lastGesture = this.gestureRecognition.recognizedGestures[
            this.gestureRecognition.recognizedGestures.length - 1
        ];
        
        if (lastGesture && lastGesture.name === gestureName && 
            Date.now() - lastGesture.timestamp < 1000) {
            return;
        }
        
        this.stats.gesturesRecognized++;
        
        const gestureEvent = {
            name: gestureName,
            timestamp: Date.now(),
            position: { ...this.headState.currentPosition }
        };
        
        this.gestureRecognition.recognizedGestures.push(gestureEvent);
        
        // 履歴サイズを制限
        if (this.gestureRecognition.recognizedGestures.length > 20) {
            this.gestureRecognition.recognizedGestures.shift();
        }
        
        // ジェスチャーコールバックを実行
        const callback = this.gestureRecognition.gestureCallbacks.get(gestureName);
        if (callback) {
            callback(gestureEvent);
        }
        
        this.provideFeedback('gesture_recognized', { gesture: gestureName });
        console.log(`[HeadTrackingController] Gesture recognized: ${gestureName}`);
    }
    
    /**
     * トラッキングインターフェースを作成
     */
    createTrackingInterface() {
        this.createHeadPointer();
        this.createTrackingInfo();
        this.createCalibrationInterface();
    }
    
    /**
     * 頭部ポインターを作成
     */
    createHeadPointer() {
        if (this.headPointer) {
            this.headPointer.remove();
        }
        
        this.headPointer = document.createElement('div');
        this.headPointer.className = 'head-pointer';
        this.headPointer.style.cssText = `
            position: fixed;
            width: 30px;
            height: 30px;
            border: 2px solid rgba(0, 255, 255, 0.8);
            border-radius: 50%;
            background: rgba(0, 255, 255, 0.2);
            pointer-events: none;
            z-index: 10006;
            display: none;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        `;
        
        document.body.appendChild(this.headPointer);
    }
    
    /**
     * トラッキング情報表示を作成
     */
    createTrackingInfo() {
        if (this.trackingInterface) {
            this.trackingInterface.remove();
        }
        
        this.trackingInterface = document.createElement('div');
        this.trackingInterface.className = 'head-tracking-info';
        this.trackingInterface.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 200px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #555;
            border-radius: 8px;
            padding: 10px;
            color: white;
            font-size: 12px;
            z-index: 10007;
            display: none;
        `;
        
        document.body.appendChild(this.trackingInterface);
    }
    
    /**
     * キャリブレーションインターフェースを作成
     */
    createCalibrationInterface() {
        this.calibrationInterface = document.createElement('div');
        this.calibrationInterface.className = 'head-calibration-interface';
        this.calibrationInterface.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10020;
            display: none;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
        `;
        
        document.body.appendChild(this.calibrationInterface);
    }
    
    /**
     * 頭部ポインターを更新
     * @param {Object} position - 頭部位置
     */
    updateHeadPointer(position) {
        if (!this.headPointer) return;
        
        // 画面中央を基準に位置を計算
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const pointerX = centerX + (position.x * window.innerWidth * 0.3);
        const pointerY = centerY + (position.y * window.innerHeight * 0.3);
        
        this.headPointer.style.display = 'block';
        this.headPointer.style.left = `${pointerX}px`;
        this.headPointer.style.top = `${pointerY}px`;
        
        // 傾き表示
        this.headPointer.style.transform = 
            `translate(-50%, -50%) rotate(${position.z}deg)`;
    }
    
    /**
     * トラッキング情報を更新
     */
    updateTrackingInfo() {
        if (!this.trackingInterface) return;
        
        const position = this.headState.currentPosition;
        const recentGestures = this.gestureRecognition.recognizedGestures.slice(-3);
        
        this.trackingInterface.innerHTML = `
            <h4 style="margin: 0 0 8px 0;">Head Tracking</h4>
            <div>X: ${position.x.toFixed(2)}</div>
            <div>Y: ${position.y.toFixed(2)}</div>
            <div>Z: ${position.z.toFixed(2)}</div>
            <div style="margin-top: 8px;">
                <strong>Recent Gestures:</strong>
                ${recentGestures.map(g => `<div>• ${g.name}</div>`).join('')}
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #aaa;">
                Frames: ${this.stats.trackingFrames} | 
                Gestures: ${this.stats.gesturesRecognized}
            </div>
        `;
    }
    
    /**
     * ジェスチャーコールバックをセットアップ
     */
    setupGestureCallbacks() {
        this.gestureRecognition.gestureCallbacks.set('nod', () => {
            console.log('[HeadTrackingController] Nod gesture - simulating click');
            this.simulateClick();
        });
        
        this.gestureRecognition.gestureCallbacks.set('shake', () => {
            console.log('[HeadTrackingController] Shake gesture - simulating cancel');
            this.simulateCancel();
        });
        
        this.gestureRecognition.gestureCallbacks.set('tilt_left', () => {
            console.log('[HeadTrackingController] Tilt left gesture');
            this.simulateNavigation('left');
        });
        
        this.gestureRecognition.gestureCallbacks.set('tilt_right', () => {
            console.log('[HeadTrackingController] Tilt right gesture');
            this.simulateNavigation('right');
        });
    }
    
    /**
     * クリックをシミュレート
     */
    simulateClick() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const position = this.headState.currentPosition;
        
        const clickX = centerX + (position.x * window.innerWidth * 0.3);
        const clickY = centerY + (position.y * window.innerHeight * 0.3);
        
        const element = document.elementFromPoint(clickX, clickY);
        if (element && typeof element.click === 'function') {
            element.click();
            this.provideFeedback('head_click', { x: clickX, y: clickY });
        }
    }
    
    /**
     * キャンセルをシミュレート
     */
    simulateCancel() {
        // ESCキーイベントをシミュレート
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escEvent);
        this.provideFeedback('head_cancel');
    }
    
    /**
     * ナビゲーションをシミュレート
     * @param {string} direction - 方向 ('left', 'right', 'up', 'down')
     */
    simulateNavigation(direction) {
        const keyMap = {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            up: 'ArrowUp',
            down: 'ArrowDown'
        };
        
        const key = keyMap[direction];
        if (key) {
            const keyEvent = new KeyboardEvent('keydown', { key });
            document.dispatchEvent(keyEvent);
            this.provideFeedback('head_navigation', { direction });
        }
    }
    
    /**
     * キャリブレーションを開始
     */
    async startCalibration() {
        this.showCalibrationInterface();
        
        try {
            await this.performHeadCalibration();
            this.headState.isCalibrated = true;
            console.log('[HeadTrackingController] Calibration completed');
            return { success: true };
        } catch (error) {
            console.error('[HeadTrackingController] Calibration failed:', error);
            return { success: false, error: error.message };
        } finally {
            this.hideCalibrationInterface();
        }
    }
    
    /**
     * キャリブレーションインターフェースを表示
     */
    showCalibrationInterface() {
        if (this.calibrationInterface) {
            this.calibrationInterface.style.display = 'flex';
            this.calibrationInterface.innerHTML = `
                <div>
                    <h2>Head Tracking Calibration</h2>
                    <p>Please look straight ahead and keep your head still.</p>
                    <p>Calibration will start in 3 seconds...</p>
                </div>
            `;
        }
    }
    
    /**
     * キャリブレーションインターフェースを隠す
     */
    hideCalibrationInterface() {
        if (this.calibrationInterface) {
            this.calibrationInterface.style.display = 'none';
        }
    }
    
    /**
     * ヘッドキャリブレーションを実行
     */
    async performHeadCalibration() {
        return new Promise((resolve) => {
            const calibrationData = [];
            const calibrationTime = this.headTrackingConfig.calibrationTime;
            const startTime = Date.now();
            
            const collectCalibrationData = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                
                if (elapsed < calibrationTime) {
                    if (this.headState.currentPosition) {
                        calibrationData.push({ ...this.headState.currentPosition });
                    }
                    
                    // 進行状況を更新
                    const progress = (elapsed / calibrationTime * 100).toFixed(0);
                    if (this.calibrationInterface) {
                        this.calibrationInterface.innerHTML = `
                            <div>
                                <h2>Head Tracking Calibration</h2>
                                <p>Keep your head in neutral position...</p>
                                <p>Progress: ${progress}%</p>
                                <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; margin: 10px auto;">
                                    <div style="width: ${progress}%; height: 100%; background: #0f0; border-radius: 5px; transition: width 0.1s;"></div>
                                </div>
                            </div>
                        `;
                    }
                    
                    setTimeout(collectCalibrationData, 100);
                } else {
                    // キャリブレーション完了
                    if (calibrationData.length > 0) {
                        this.headState.neutralPosition = {
                            x: calibrationData.reduce((sum, pos) => sum + pos.x, 0) / calibrationData.length,
                            y: calibrationData.reduce((sum, pos) => sum + pos.y, 0) / calibrationData.length,
                            z: calibrationData.reduce((sum, pos) => sum + pos.z, 0) / calibrationData.length
                        };
                    }
                    
                    resolve();
                }
            };
            
            // カウントダウン後に開始
            setTimeout(collectCalibrationData, 3000);
        });
    }
    
    /**
     * 統計を更新
     * @param {Object} position - 頭部位置
     */
    updateStats(position) {
        // 平均位置を更新
        const stats = this.stats;
        const count = stats.trackingFrames;
        
        stats.averagePosition.x = (stats.averagePosition.x * (count - 1) + position.x) / count;
        stats.averagePosition.y = (stats.averagePosition.y * (count - 1) + position.y) / count;
        stats.averagePosition.z = (stats.averagePosition.z * (count - 1) + position.z) / count;
        
        // トラッキング情報を定期的に更新
        if (count % 30 === 0) { // 約1秒間隔
            this.updateTrackingInfo();
        }
    }
    
    /**
     * フィードバックを提供
     * @param {string} type - フィードバックタイプ
     * @param {Object} data - 追加データ
     */
    provideFeedback(type, data = {}) {
        // 視覚・音響・ハプティックフィードバック（実装省略）
        console.log(`[HeadTrackingController] Feedback: ${type}`, data);
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            isCalibrated: this.headState.isCalibrated,
            isTracking: this.headState.isTracking,
            currentPosition: { ...this.headState.currentPosition },
            neutralPosition: this.headState.neutralPosition ? 
                { ...this.headState.neutralPosition } : null,
            recentGestures: this.gestureRecognition.recognizedGestures.slice(-5)
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.headTrackingConfig, newConfig);
        console.log('[HeadTrackingController] Configuration updated');
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup() {
        // メディアストリームを停止
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // ビデオ要素を削除
        if (this.videoElement) {
            this.videoElement.remove();
            this.videoElement = null;
        }
        
        // UI要素を削除
        [this.headPointer, this.trackingInterface, this.calibrationInterface].forEach(element => {
            if (element) {
                element.remove();
            }
        });
        
        this.headPointer = null;
        this.trackingInterface = null;
        this.calibrationInterface = null;
        
        this.headState.isTracking = false;
        
        console.log('[HeadTrackingController] Cleaned up');
    }
}