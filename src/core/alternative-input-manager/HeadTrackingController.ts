/**
 * HeadTrackingController - ヘッドトラッキングコントローラー
 * 
 * 頭部動作とジェスチャー認識の専門管理システム
 */

// 型定義
export interface HeadTrackingConfig { enabled: boolean,
    sensitivity: number,
    deadZone: number,
    smoothing: number,
    calibrationTime: number,
    gestureRecognition: boolean,
    invertX: boolean,
    invertY: boolean; };
}
export interface Position3D { x: number,
    y: number,
    z: number; };
}
export interface FaceLandmark { x: number,
    y: number,
    z: number; };
}
export interface FaceLandmarks { noseTip: FaceLandmark,
    leftEye: FaceLandmark,
    rightEye: FaceLandmark,
    chin: FaceLandmark;
    };
}
export interface HeadPosition { x: number,
    y: number,
    z: number,
    center: Position3D,
    landmarks: FaceLandmarks;
    };
}
export interface HeadState { isCalibrated: boolean,
    neutralPosition: Position3D | null,
    currentPosition: Position3D,
    gestureBuffer: GestureBufferEntry[],
    isTracking: boolean,
    lastUpdate: number; };
}
export interface GestureBufferEntry { position: Position3D,
    timestamp: number; };
}
export interface GesturePattern { pattern: GesturePatternType,
    threshold: number,
    duration: number; };
}
export interface GestureRecognition { enabled: boolean,
    gestures: Map<string, GesturePattern>,
    recognizedGestures: GestureEvent[],
    gestureCallbacks: Map<string, GestureCallback>, };
}
export interface GestureEvent { name: string,
    timestamp: number,
    position: Position3D;
    };
}
export interface HeadTrackingStats { trackingFrames: number,
    gesturesRecognized: number,
    averagePosition: Position3D,
    trackingAccuracy: number,
    sessionStart: number; };
}
export interface DetailedHeadTrackingStats extends HeadTrackingStats { isCalibrated: boolean,
    isTracking: boolean,
    currentPosition: Position3D,
    neutralPosition: Position3D | null,
    recentGestures: GestureEvent[];
    };
}
export interface CalibrationResult { success: boolean,
    error?: string; };
}
export interface FeedbackData { [key: string]: any, };
}
export interface ClickPosition { x: number,
    y: number; };
}
export interface NavigationFeedbackData extends FeedbackData { direction: NavigationDirection;
    };
}
// MediaPipe関連型定義
export interface MediaPipeFaceMeshResults { multiFaceLandmarks: FaceLandmark[][];
    };
}
export interface MediaPipeFaceMesh { setOptions: (options: FaceMeshOptions) => void,
    onResults: (callback: (results: MediaPipeFaceMeshResults) => void) => void;
}
    send: (input: { image: HTMLVideoElement }) => Promise<void>,
}

export interface FaceMeshOptions { maxNumFaces: number,
    refineLandmarks: boolean,
    minDetectionConfidence: number,
    minTrackingConfidence: number; };
}
export interface MediaPipeCamera { start: () => void; };
}
export interface CameraOptions { onFrame: () => Promise<void>,
    width: number,
    height: number; };
}
// WebRTC関連型定義
export interface MediaStreamConstraints { video: { ;
}
        width: { ideal: number },
        height: { ideal: number },
        frameRate: { ideal: number },
    };
}

export interface TrackingUIElement extends HTMLElement { className: string,
    style: CSSStyleDeclaration;
    };
}
// 列挙型
export type GesturePatternType = ;
    | 'y_oscillation' | 'x_oscillation' '';
    | 'z_negative' | 'z_positive' '';
    | 'y_positive' | 'y_negative';'
'';
export type NavigationDirection = 'left' | 'right' | 'up' | 'down';
';
export type FeedbackType = '';
    | 'gesture_recognized' | 'head_click' '';
    | 'head_cancel' | 'head_navigation';
';
export type GestureName = '';
    | 'nod' | 'shake' | 'tilt_left' | 'tilt_right' '';
    | 'lean_forward' | 'lean_back';
';
// コールバック型''
export type GestureCallback = (gestureEvent: GestureEvent') => void;

// 定数
export const DEFAULT_SENSITIVITY = 1.0;
export const DEFAULT_DEAD_ZONE = 0.1;
export const DEFAULT_SMOOTHING = 0.5;
export const DEFAULT_CALIBRATION_TIME = 3000;
export const GESTURE_BUFFER_DURATION = 2000;
export const MIN_GESTURE_DATA_POINTS = 5;
export const MIN_OSCILLATION_DATA_POINTS = 10;
export const OSCILLATION_MIN_PEAKS = 2;
export const GESTURE_COOLDOWN_TIME = 1000;
export const MAX_GESTURE_HISTORY = 20;
export const TRACKING_INFO_UPDATE_INTERVAL = 30;

// MediaPipe CDN URLs'
export const MEDIAPIPE_SCRIPTS: string[] = ['';
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js','';
    'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js','';
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',']';
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'];
];

// ジェスチャーパターン定義'
export const DEFAULT_GESTURE_PATTERNS: Record<GestureName, GesturePattern> = { ' }'
    nod: { pattern: 'y_oscillation', threshold: 0.3, duration: 1000 },''
    shake: { pattern: 'x_oscillation', threshold: 0.3, duration: 1000 },''
    tilt_left: { pattern: 'z_negative', threshold: 0.4, duration: 500 },''
    tilt_right: { pattern: 'z_positive', threshold: 0.4, duration: 500 },''
    lean_forward: { pattern: 'y_positive', threshold: 0.5, duration: 300 },''
    lean_back: { pattern: 'y_negative', threshold: 0.5, duration: 300 }
};

// キーマッピング'
export const NAVIGATION_KEY_MAP: Record<NavigationDirection, string> = { ''
    left: 'ArrowLeft','';
    right: 'ArrowRight','';
    up: 'ArrowUp','';
    down: 'ArrowDown' ;
}
},
';
// 型ガード''
export function isValidHeadPosition(position: any'): position is Position3D { return position &&''
           typeof position.x === 'number' &&'';
           typeof position.y === 'number' &&'';
           typeof position.z === 'number'; };
}
';
export function isValidFaceLandmarks(landmarks: any[]): landmarks is FaceLandmark[] { ''
    return Array.isArray(landmarks') && ;
           landmarks.length > 0 &&;
           landmarks.every(landmark => ';
               landmark && '';
               typeof landmark.x === 'number' &&')';
               typeof landmark.y === 'number' &&')';
               typeof landmark.z === 'number'); }
}'
'';
export function hasMediaDevices(''';
    return 'navigator' in window && '';
           'mediaDevices' in navigator &&'';
           'getUserMedia' in navigator.mediaDevices;
}'
'';
export function hasMediaPipeGlobals(''';
    return typeof window !== 'undefined' &&'';
           'FaceMesh' in window &&'';
           'Camera' in window;
}'
')';
export function isValidGestureEvent(event: any'): event is GestureEvent { return event &&''
           typeof event.name === 'string' &&'';
           typeof event.timestamp === 'number' &&;
           isValidHeadPosition(event.position); };
}
// Window拡張（MediaPipeグローバル）
declare global { interface Window {
        FaceMesh: { ;
}
            new (options: { locateFile: (file: string) => string }): MediaPipeFaceMesh
        },
        Camera: { new (videoElement: HTMLVideoElement, options: CameraOptions): MediaPipeCamera;
    }
        };
    };
}
export class HeadTrackingController {
    private headTrackingConfig: HeadTrackingConfig;
    private headState: HeadState;
    private gestureRecognition: GestureRecognition;
    // WebRTC・MediaPipe
    private mediaStream: MediaStream | null;
    private videoElement: HTMLVideoElement | null;
    private faceMesh: MediaPipeFaceMesh | null;
    private faceMeshLoaded: boolean;
    // 視覚インターフェース
    private trackingInterface: TrackingUIElement | null;
    private headPointer: TrackingUIElement | null;
    private calibrationInterface: TrackingUIElement | null;
    // 統計
    private stats: HeadTrackingStats;
    constructor() {

        // ヘッドトラッキング設定
        this.headTrackingConfig = {
            enabled: false,
            sensitivity: DEFAULT_SENSITIVITY,
            deadZone: DEFAULT_DEAD_ZONE,
            smoothing: DEFAULT_SMOOTHING,
            calibrationTime: DEFAULT_CALIBRATION_TIME,
            gestureRecognition: true,
            invertX: false;
};
}
            invertY: false ;
}
        },
        
        // 追跡状態
        this.headState = { isCalibrated: false,
            neutralPosition: null;
}
            currentPosition: { x: 0, y: 0, z: 0 },
            gestureBuffer: [],
            isTracking: false,
            lastUpdate: 0;
        },
        
        // ジェスチャー認識
        this.gestureRecognition = { enabled: true,
            gestures: new Map<string, GesturePattern>(;
                Object.entries(DEFAULT_GESTURE_PATTERNS),
            recognizedGestures: [],
            gestureCallbacks: new Map<string, GestureCallback>(); }
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
        this.stats = { trackingFrames: 0,
            gesturesRecognized: 0;
}
            averagePosition: { x: 0, y: 0, z: 0 },'
            trackingAccuracy: 0,'';
            sessionStart: Date.now('')';
        console.log('[HeadTrackingController] Initialized'),
    }
    
    /**
     * ヘッドトラッキングを初期化
     */
    async initializeHeadTracking(config: { headTracking?: Partial<HeadTrackingConfig> } = { ): Promise<void> {
        Object.assign(this.headTrackingConfig, config.headTracking || {);
        
        if (!this.headTrackingConfig.enabled) return;
        
        try {
            await this.setupCamera();
            await this.loadFaceMesh();
            this.setupHeadTracking();'
            this.createTrackingInterface();''
            this.setupGestureCallbacks('')';
            console.log('[HeadTrackingController] Head tracking initialized');' }'
        } catch (error') { ''
            console.error('[HeadTrackingController] Initialization failed:', error);
            throw error; };
}
    }
    
    /**
     * カメラをセットアップ
     */'
    private async setupCamera(): Promise<void> { ''
        if (!hasMediaDevices()') {''
            throw new Error('MediaDevices API not supported'); };
}
        try { const constraints: MediaStreamConstraints = {
                video: { ;
}
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 ;
};
}
            },'
            '';
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints');
            ';
            // 非表示のビデオ要素を作成''
            this.videoElement = document.createElement('video');
            this.videoElement.style.cssText = `;
                position: fixed,
                top: -1000px,
                left: -1000px,
                width: 640px,
                height: 480px,
            `;
            this.videoElement.srcObject = this.mediaStream;
            this.videoElement.autoplay = true;
            this.videoElement.muted = true;'
            '';
            document.body.appendChild(this.videoElement');'
            '';
            console.log('[HeadTrackingController] Camera setup completed');''
        } catch (error') { ' }'
            throw new Error(`Camera setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        };
}
    /**
     * MediaPipe Face Meshをロード
     */
    private async loadFaceMesh(): Promise<void> { try {
            // MediaPipe Face Meshライブラリをロード
            await this.loadMediaPipeScript();'
            '';
            if (!hasMediaPipeGlobals()') {''
                throw new Error('MediaPipe libraries not loaded properly'); };
}
            // Face Meshを初期化
            this.faceMesh = new window.FaceMesh({ );
                locateFile: (file: string) => { ;
}
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
                }
            });
            
            const options: FaceMeshOptions = { maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5 ;
}
            },
            
            this.faceMesh.setOptions(options);
            ';
            this.faceMesh.onResults((results: MediaPipeFaceMeshResults) => { this.processFaceMeshResults(results);' }'
            }');
            ';
            this.faceMeshLoaded = true;''
            console.log('[HeadTrackingController] Face Mesh loaded');''
        } catch (error') { ' }'
            throw new Error(`Face Mesh loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        };
}
    /**
     * MediaPipeスクリプトをロード
     */
    private async loadMediaPipeScript(): Promise<void> { return new Promise((resolve, reject) => { 
            let loadedCount = 0;'
            '';
            MEDIAPIPE_SCRIPTS.forEach(src => {');''
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loadedCount++;
                    if (loadedCount === MEDIAPIPE_SCRIPTS.length) { }
                        resolve(); };
}
                };
                script.onerror = () => reject(new Error(`Failed to load ${src}`);
                document.head.appendChild(script);
            });
        });
    }
    
    /**
     * ヘッドトラッキングをセットアップ
     */
    private setupHeadTracking(): void { if(!this.videoElement || !this.faceMeshLoaded || !hasMediaPipeGlobals() return;
        
        // Camera utilsを使用してビデオ処理を開始
        const cameraOptions: CameraOptions = {
            onFrame: async () => {  ;
}
                if (this.faceMesh && this.headState.isTracking) { }
                    await this.faceMesh.send({ image: this.videoElement! }),
                }
            },
            width: 640,
            height: 480;
        },
        ;
        const camera = new window.Camera(this.videoElement, cameraOptions);
        camera.start();
        this.headState.isTracking = true;
    }
    
    /**
     * Face Mesh結果を処理
     */
    private processFaceMeshResults(results: MediaPipeFaceMeshResults): void { if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            return; };
}
        this.stats.trackingFrames++;
        
        const landmarks = results.multiFaceLandmarks[0];
        if(!isValidFaceLandmarks(landmarks) return;
        
        const headPosition = this.calculateHeadPosition(landmarks);
        
        // 位置データを平滑化
        const smoothedPosition = this.smoothHeadPosition(headPosition);
        this.headState.currentPosition = smoothedPosition;
        this.headState.lastUpdate = Date.now();
        
        // ジェスチャー認識
        if (this.gestureRecognition.enabled) { this.processGestureRecognition(smoothedPosition); };
}
        // 頭部ポインターを更新
        this.updateHeadPointer(smoothedPosition);
        
        // 統計を更新
        this.updateStats(smoothedPosition);
    }
    
    /**
     * ランドマークから頭部位置を計算
     */
    private calculateHeadPosition(landmarks: FaceLandmark[]): HeadPosition { // 主要な顔の特徴点を使用して頭部の向きを計算
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
        
        return { x: horizontalAngle * (this.headTrackingConfig.invertX ? -1 : 1),
            y: verticalAngle * (this.headTrackingConfig.invertY ? -1 : 1), };
            z: headTilt;
}
            center: { x: centerX, y: centerY, z: centerZ },
            landmarks: { noseTip, leftEye, rightEye, chin }
        };
    }
    
    /**
     * 頭部位置を平滑化
     */
    private smoothHeadPosition(position: HeadPosition): Position3D { const factor = this.headTrackingConfig.smoothing;
        const current = this.headState.currentPosition;
        
        // デッドゾーンの適用
        const deadZone = this.headTrackingConfig.deadZone;
        const applyDeadZone = (value: number): number => {  }
            return Math.abs(value) < deadZone ? 0 : value; }
        };
        
        const smoothed: Position3D = { x: current.x * factor + applyDeadZone(position.x) * (1 - factor),
            y: current.y * factor + applyDeadZone(position.y) * (1 - factor),
            z: current.z * factor + applyDeadZone(position.z) * (1 - factor); }
        };
        
        // 感度調整
        const sensitivity = this.headTrackingConfig.sensitivity;
        return { x: smoothed.x * sensitivity,
            y: smoothed.y * sensitivity, };
            z: smoothed.z * sensitivity ;
}
        },
    }
    
    /**
     * ジェスチャー認識を処理
     */
    private processGestureRecognition(position: Position3D): void { const now = Date.now();
        
        // ジェスチャーバッファーに追加
        this.headState.gestureBuffer.push({ })
            position: { ...position },)
            timestamp: now),
        
        // バッファーサイズを制限（2秒間のデータ）
        this.headState.gestureBuffer = this.headState.gestureBuffer;
            .filter(entry => now - entry.timestamp < GESTURE_BUFFER_DURATION);
        
        // 各ジェスチャーパターンをチェック
        for(const [gestureName, gestureConfig] of this.gestureRecognition.gestures) {
            if(this.detectGesturePattern(gestureName, gestureConfig) {
        }
                this.handleGestureRecognition(gestureName); };
}
        };
}
    /**
     * ジェスチャーパターンを検出
     */
    private detectGesturePattern(gestureName: string, gestureConfig: GesturePattern): boolean { const buffer = this.headState.gestureBuffer;
        const now = Date.now();
        
        // 指定期間内のデータを取得
        const relevantData = buffer.filter(entry => );
            now - entry.timestamp < gestureConfig.duration);
        
        if (relevantData.length < MIN_GESTURE_DATA_POINTS) return false;'
        '';
        switch(gestureConfig.pattern') {'
            '';
            case 'y_oscillation': // うなずき'';
                return this.detectOscillation(relevantData, 'y', gestureConfig.threshold');'
            '';
            case 'x_oscillation': // 首振り'';
                return this.detectOscillation(relevantData, 'x', gestureConfig.threshold');'
            '';
            case 'z_negative': // 左傾き'';
                return this.detectTilt(relevantData, 'z', -gestureConfig.threshold');'
            '';
            case 'z_positive': // 右傾き'';
                return this.detectTilt(relevantData, 'z', gestureConfig.threshold');'
            '';
            case 'y_positive': // 前傾'';
                return this.detectTilt(relevantData, 'y', gestureConfig.threshold');'
            '';
            case 'y_negative': // 後傾'';
                return this.detectTilt(relevantData, 'y', -gestureConfig.threshold);
            
        }
            default: return false; };
}
    }
    
    /**
     * 振動パターンを検出
     */
    private detectOscillation(data: GestureBufferEntry[], axis: keyof Position3D, threshold: number): boolean { if (data.length < MIN_OSCILLATION_DATA_POINTS) return false;
        
        const values = data.map(entry => entry.position[axis]);
        let peaks = 0;
        let valleys = 0;
        
        for(let i = 1; i < values.length - 1; i++) {
        
            const prev = values[i - 1];
            const curr = values[i];
            const next = values[i + 1];
            
            // ピーク検出
            if (curr > prev && curr > next && curr > threshold) {
        
        }
                peaks++; };
}
            // 谷検出
            if (curr < prev && curr < next && curr < -threshold) { valleys++; };
}
        }
        
        // 少なくとも2回の往復運動
        return peaks >= OSCILLATION_MIN_PEAKS && valleys >= OSCILLATION_MIN_PEAKS;
    }
    
    /**
     * 傾きパターンを検出
     */
    private detectTilt(data: GestureBufferEntry[], axis: keyof Position3D, threshold: number): boolean { if (data.length < MIN_GESTURE_DATA_POINTS) return false;
        
        const recentValues = data.slice(-5).map(entry => entry.position[axis]);
        const average = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
        
        // 閾値との比較（正負を考慮）
        return threshold > 0 ? average > threshold: average < threshold; };
}
    /**
     * ジェスチャー認識を処理
     */
    private handleGestureRecognition(gestureName: string): void { // 同じジェスチャーの連続認識を防ぐ
        const lastGesture = this.gestureRecognition.recognizedGestures[;
            this.gestureRecognition.recognizedGestures.length - 1];
        ];
        
        if (lastGesture && lastGesture.name === gestureName && ;
            Date.now() - lastGesture.timestamp < GESTURE_COOLDOWN_TIME) {
            return; };
}
        this.stats.gesturesRecognized++;
        
        const gestureEvent: GestureEvent = { name: gestureName,
            timestamp: Date.now();
}
            position: { ...this.headState.currentPosition ;
}
        },
        
        this.gestureRecognition.recognizedGestures.push(gestureEvent);
        
        // 履歴サイズを制限
        if (this.gestureRecognition.recognizedGestures.length > MAX_GESTURE_HISTORY) { this.gestureRecognition.recognizedGestures.shift(); };
}
        // ジェスチャーコールバックを実行
        const callback = this.gestureRecognition.gestureCallbacks.get(gestureName);
        if(callback) {'
            ';
        }'
            callback(gestureEvent'); }
        }'
        '';
        this.provideFeedback('gesture_recognized', { gesture: gestureName ), }
        console.log(`[HeadTrackingController] Gesture recognized: ${gestureName)`});
    }
    
    /**
     * トラッキングインターフェースを作成
     */
    private createTrackingInterface(): void { this.createHeadPointer();
        this.createTrackingInfo();
        this.createCalibrationInterface(); };
}
    /**
     * 頭部ポインターを作成
     */'
    private createHeadPointer(): void { if (this.headPointer) {''
            this.headPointer.remove('')';
        this.headPointer = document.createElement('div'') as TrackingUIElement;''
        this.headPointer.className = 'head-pointer';
        this.headPointer.style.cssText = `;
            position: fixed,
            width: 30px,
            height: 30px,
            border: 2px solid rgba(0, 255, 255, 0.8),
            border-radius: 50%,
            background: rgba(0, 255, 255, 0.2),
            pointer-events: none,
            z-index: 10006,
            display: none,
            transform: translate(-50%, -50%),
            transition: all 0.1s ease,
        `;
        
        document.body.appendChild(this.headPointer); };
}
    /**
     * トラッキング情報表示を作成
     */'
    private createTrackingInfo(): void { if (this.trackingInterface) {''
            this.trackingInterface.remove('')';
        this.trackingInterface = document.createElement('div'') as TrackingUIElement;''
        this.trackingInterface.className = 'head-tracking-info';
        this.trackingInterface.style.cssText = `;
            position: fixed,
            top: 20px,
            left: 20px,
            width: 200px,
            background: rgba(0, 0, 0, 0.8),
            border: 1px solid #555,
            border-radius: 8px,
            padding: 10px,
            color: white,
            font-size: 12px,
            z-index: 10007,
            display: none,
        `;
        
        document.body.appendChild(this.trackingInterface); };
}
    /**
     * キャリブレーションインターフェースを作成'
     */''
    private createCalibrationInterface('')';
        this.calibrationInterface = document.createElement('div'') as TrackingUIElement;''
        this.calibrationInterface.className = 'head-calibration-interface';
        this.calibrationInterface.style.cssText = `;
            position: fixed,
            top: 0,
            left: 0,
            width: 100vw,
            height: 100vh,
            background: rgba(0, 0, 0, 0.9),
            z-index: 10020,
            display: none,
            justify-content: center,
            align-items: center,
            color: white,
            text-align: center,
        `;
        
        document.body.appendChild(this.calibrationInterface);
    }
    
    /**
     * 頭部ポインターを更新
     */
    private updateHeadPointer(position: Position3D): void { if (!this.headPointer) return;
        
        // 画面中央を基準に位置を計算
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        ';
        const pointerX = centerX + (position.x * window.innerWidth * 0.3);''
        const pointerY = centerY + (position.y * window.innerHeight * 0.3');'
        '';
        this.headPointer.style.display = 'block'; }
        this.headPointer.style.left = `${pointerX}px`;
        this.headPointer.style.top = `${pointerY}px`;
        
        // 傾き表示
        this.headPointer.style.transform = ;
            `translate(-50%, -50%) rotate(${position.z)deg})`;
    }
    
    /**
     * トラッキング情報を更新
     */
    private updateTrackingInfo(): void { if (!this.trackingInterface) return;
        ';
        const position = this.headState.currentPosition;''
        const recentGestures = this.gestureRecognition.recognizedGestures.slice(-3');
        ';
        this.trackingInterface.innerHTML = `'';
            <h4 style="margin: 0 0 8px 0;">Head Tracking</h4> }
            <div>X: ${position.x.toFixed(2})}</div>"
            <div>Y: ${position.y.toFixed(2})}</div>""
            <div>Z: ${position.z.toFixed(2"})}</div>""
            <div style="margin-top: 8px;">"
                <strong>Recent Gestures:</strong>"";
                ${recentGestures.map(g => `<div>• ${g.name)</div>`").join('''})}'
            </div>'';
            <div style="margin-top: 8px; font-size: 10px; color: #aaa;">
                Frames: ${this.stats.trackingFrames} | 
                Gestures: ${this.stats.gesturesRecognized;
}
            </div>;
        `,
    }
    
    /**
     * ジェスチャーコールバックをセットアップ"
     */""
    private setupGestureCallbacks("): void { ""
        this.gestureRecognition.gestureCallbacks.set('nod', (') => { ''
            console.log('[HeadTrackingController] Nod gesture - simulating click'); }'
            this.simulateClick();' }'
        }');'
        '';
        this.gestureRecognition.gestureCallbacks.set('shake', (') => {  ''
            console.log('[HeadTrackingController] Shake gesture - simulating cancel'); }'
            this.simulateCancel();' }'
        }');'
        '';
        this.gestureRecognition.gestureCallbacks.set('tilt_left', (') => {  ''
            console.log('[HeadTrackingController] Tilt left gesture'');' }'
            this.simulateNavigation('left');' }'
        }');'
        '';
        this.gestureRecognition.gestureCallbacks.set('tilt_right', (') => {  ''
            console.log('[HeadTrackingController] Tilt right gesture'');' }'
            this.simulateNavigation('right'); }
        });
    }
    
    /**
     * クリックをシミュレート
     */
    private simulateClick(): void { const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const position = this.headState.currentPosition;
        
        const clickX = centerX + (position.x * window.innerWidth * 0.3);
        const clickY = centerY + (position.y * window.innerHeight * 0.3);'
        '';
        const element = document.elementFromPoint(clickX, clickY') as HTMLElement;''
        if(element && typeof element.click === 'function') {'
            ';
        }'
            element.click('') }'
            this.provideFeedback('head_click', { x: clickX, y: clickY } as ClickPosition);
        };
}
    /**
     * キャンセルをシミュレート'
     */''
    private simulateCancel('')';
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape' ),''
        document.dispatchEvent(escEvent');''
        this.provideFeedback('head_cancel'); };
}
    /**
     * ナビゲーションをシミュレート
     */'
    private simulateNavigation(direction: NavigationDirection): void { const key = NAVIGATION_KEY_MAP[direction];''
        if(key') {'
            '';
            const keyEvent = new KeyboardEvent('keydown', { key );''
            document.dispatchEvent(keyEvent');'
        }'
            this.provideFeedback('head_navigation', { direction ) as NavigationFeedbackData); };
}
    }
    
    /**
     * キャリブレーションを開始
     */
    async startCalibration(): Promise<CalibrationResult> { this.showCalibrationInterface();
        ';
        try {''
            await this.performHeadCalibration('');'
            console.log('[HeadTrackingController] Calibration completed'); }'
            return { success: true }''
        } catch (error') { ''
            console.error('[HeadTrackingController] Calibration failed:', error');'
            return { success: false, ' };'
                error: error instanceof Error ? error.message : 'Unknown error' ;
}
            },
        } finally { this.hideCalibrationInterface(); };
}
    }
    
    /**
     * キャリブレーションインターフェースを表示
     */'
    private showCalibrationInterface(): void { ''
        if(this.calibrationInterface') {'
            '';
            this.calibrationInterface.style.display = 'flex';
            this.calibrationInterface.innerHTML = `;
                <div>;
                    <h2>Head Tracking Calibration</h2>;
                    <p>Please look straight ahead and keep your head still.</p>;
                    <p>Calibration will start in 3 seconds...</p>;
                </div>;
        }
            `; };
}
    }
    
    /**
     * キャリブレーションインターフェースを隠す
     */'
    private hideCalibrationInterface(): void { ''
        if(this.calibrationInterface') {'
            ';
        }'
            this.calibrationInterface.style.display = 'none'; };
}
    }
    
    /**
     * ヘッドキャリブレーションを実行
     */
    private async performHeadCalibration(): Promise<void> { return new Promise<void>((resolve) => { 
            const calibrationData: Position3D[] = [],
            const calibrationTime = this.headTrackingConfig.calibrationTime;
            const startTime = Date.now();
            
            const collectCalibrationData = (): void => {
                const now = Date.now();
                const elapsed = now - startTime;
                
                if(elapsed < calibrationTime) {
                
                    
                
                }
                    if (this.headState.currentPosition) { }
                        calibrationData.push({ ...this.headState.currentPosition ); };
}
                    // 進行状況を更新'
                    const progress = (elapsed / calibrationTime * 100).toFixed(0);''
                    if(this.calibrationInterface') {
                        this.calibrationInterface.innerHTML = `;
                            <div>;
                                <h2>Head Tracking Calibration</h2>;
                    }
                                <p>Keep your head in neutral position...</p> }'
                                <p>Progress: ${progress}%</p>''
                                <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; margin: 10px auto;">""
                                    <div style="width: ${progress}%; height: 100%; background: #0f0; border-radius: 5px; transition: width 0.1s;"></div>
                                </div>;
                            </div>;
                        `;
                    }
                    
                    setTimeout(collectCalibrationData, 100);
                } else {  // キャリブレーション完了
                    if(calibrationData.length > 0) {
                        this.headState.neutralPosition = {
                            x: calibrationData.reduce((sum, pos) => sum + pos.x, 0) / calibrationData.length,
                    }
                            y: calibrationData.reduce((sum, pos) => sum + pos.y, 0) / calibrationData.length, }
                            z: calibrationData.reduce((sum, pos) => sum + pos.z, 0) / calibrationData.length }
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
     */
    private updateStats(position: Position3D): void { // 平均位置を更新
        const stats = this.stats;
        const count = stats.trackingFrames;
        
        stats.averagePosition.x = (stats.averagePosition.x * (count - 1) + position.x) / count;
        stats.averagePosition.y = (stats.averagePosition.y * (count - 1) + position.y) / count;
        stats.averagePosition.z = (stats.averagePosition.z * (count - 1) + position.z) / count;
        
        // トラッキング情報を定期的に更新
        if(count % TRACKING_INFO_UPDATE_INTERVAL === 0) {
            
        }
            this.updateTrackingInfo(); };
}
    }
    
    /**
     * フィードバックを提供
     */
    private provideFeedback(type: FeedbackType, data: FeedbackData = { ): void {
        // 視覚・音響・ハプティックフィードバック（実装省略） }
        console.log(`[HeadTrackingController] Feedback: ${type)`, data});
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): DetailedHeadTrackingStats { return { ...this.stats,
            isCalibrated: this.headState.isCalibrated, };
            isTracking: this.headState.isTracking;
}
            currentPosition: { ...this.headState.currentPosition },
            neutralPosition: this.headState.neutralPosition ?   : undefined;
                { ...this.headState.neutralPosition } : null,
            recentGestures: this.gestureRecognition.recognizedGestures.slice(-5),
        };
    }
    
    /**
     * 設定を更新
     */"
    updateConfig(newConfig: Partial<HeadTrackingConfig>): void { ""
        Object.assign(this.headTrackingConfig, newConfig");""
        console.log('[HeadTrackingController] Configuration updated'); };
}
    /**
     * ヘッドトラッキング設定の取得
     */
    getConfig(): HeadTrackingConfig {
        return { ...this.headTrackingConfig };
    }
    
    /**
     * 現在の頭部状態を取得
     */
    getHeadState(): Readonly<HeadState> { return {  };
            ...this.headState, }
            currentPosition: { ...this.headState.currentPosition },
            neutralPosition: this.headState.neutralPosition ?   : undefined;
                { ...this.headState.neutralPosition } : null,
            gestureBuffer: [...this.headState.gestureBuffer];
        },
    }
    
    /**
     * ジェスチャーコールバックを追加
     */
    addGestureCallback(gestureName: string, callback: GestureCallback): void { this.gestureRecognition.gestureCallbacks.set(gestureName, callback); };
}
    /**
     * ジェスチャーコールバックを削除
     */
    removeGestureCallback(gestureName: string): boolean { return this.gestureRecognition.gestureCallbacks.delete(gestureName); };
}
    /**
     * カスタムジェスチャーパターンを追加
     */
    addGesturePattern(gestureName: string, pattern: GesturePattern): void { this.gestureRecognition.gestures.set(gestureName, pattern); };
}
    /**
     * ジェスチャーパターンを削除
     */
    removeGesturePattern(gestureName: string): boolean { return this.gestureRecognition.gestures.delete(gestureName); };
}
    /**
     * トラッキングインターフェースの表示切り替え
     */'
    toggleTrackingInterface(show: boolean): void { ''
        if(this.trackingInterface') {'
            ';
        }'
            this.trackingInterface.style.display = show ? 'block' : 'none'; }'
        }''
        if(this.headPointer') {'
            ';
        }'
            this.headPointer.style.display = show ? 'block' : 'none'; };
}
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup(): void { // メディアストリームを停止
        if(this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop();
        }
            this.mediaStream = null; };
}
        // ビデオ要素を削除
        if(this.videoElement) {
            this.videoElement.remove();
        }
            this.videoElement = null; };
}
        // UI要素を削除
        [this.headPointer, this.trackingInterface, this.calibrationInterface].forEach(element => {  );
            if (element) { }
                element.remove(); };
}
        });
        
        this.headPointer = null;
        this.trackingInterface = null;
        this.calibrationInterface = null;
        
        this.headState.isTracking = false;
        this.faceMesh = null;
        this.faceMeshLoaded = false;
        ';
        // コールバックとバッファをクリア''
        this.gestureRecognition.gestureCallbacks.clear('')';
        console.log('[HeadTrackingController] Cleaned up'');'
    }''
}