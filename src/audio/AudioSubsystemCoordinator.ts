/**
 * AudioSubsystemCoordinator.js
 * サブシステム統合・委譲クラス
 * BGMSystem、SoundEffectSystem、AudioController、AudioVisualizer統合とシーン連携を担当
 */

import { getErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * サブシステム統合・委譲クラス
 */
export class AudioSubsystemCoordinator {
    // プロパティ宣言
    isInitialized: boolean;
    audioManager: any;
    bgmSystem: any;
    soundEffectSystem: any;
    audioController: any;
    audioVisualizer: any;
    accessibilitySupport: any;
    subsystemStates: any;
    currentScene: any;
    sceneTransitionInProgress: boolean;
   , performanceMetrics: any;
    constructor() {

        // 初期化状態
        this.isInitialized = false;
        
        // メインAudioManagerへの参照（外部から注入される）
        this.audioManager = null;
        
        // サブシステム
        this.bgmSystem = null;
        this.soundEffectSystem = null;
        this.audioController = null;
        this.audioVisualizer = null;
        this.accessibilitySupport = null;
        
        // サブシステム初期化状態

    }
        this.subsystemStates = { }
            bgm: { initialized: false, error: null ,},
            sfx: { initialized: false, error: null ,},
            controller: { initialized: false, error: null ,},
            visualizer: { initialized: false, error: null ,},
            accessibility: { initialized: false, error: null ,};
        
        // シーン管理
        this.currentScene = null;
        this.sceneTransitionInProgress = false;
        
        // パフォーマンス監視
        this.performanceMetrics = { sceneTransitions: 0,
            delegatedCalls: 0;
            errors: 0;
           , lastUpdateTime: 0 ,}

    /**
     * AudioManager参照設定
     * @param {Object} audioManager - AudioManagerインスタンス
     */
    setAudioManager(audioManager: any) { this.audioManager = audioManager; }

    /**
     * サブシステムの初期化
     * @returns {Promise<boolean>} 初期化成功フラグ
     */''
    async initializeSubsystems()';
            console.log('Initializing, audio subsystems...);
            
            // BGMシステムの初期化
            await this.initializeBGMSystem();
            
            // 効果音システムの初期化
            await this.initializeSoundEffectSystem();
            
            // 音響制御システムの初期化
            await this.initializeAudioController();
            
            // 音響視覚化システムの初期化
            await this.initializeAudioVisualizer();
            // アクセシビリティ支援システムの初期化
            await this.initializeAccessibilitySupport(');

            console.log('Audio, subsystems initialization, completed');
            ';

        } catch (error) { this.performanceMetrics.errors++;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {)'
                component: 'AudioSubsystemCoordinator',')';
                operation: 'initializeSubsystems' ,});
            throw error;
        }
    }

    /**
     * BGMシステムの初期化'
     */''
    async initializeBGMSystem()';
            const { BGMSystem } = await import('./BGMSystem.js);
            this.bgmSystem = new BGMSystem(this.audioManager);
            this.subsystemStates.bgm.initialized = true;
            this.subsystemStates.bgm.error = null;

        } catch (error) { this.subsystemStates.bgm.error = error;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', { ')'
                component: 'bgmSystem',')';
                operation: 'initialize' ,});
            // BGMなしで続行
        }
    }

    /**
     * 効果音システムの初期化
     */''
    async initializeSoundEffectSystem()';
            const { SoundEffectSystem } = await import('./SoundEffectSystem.js);
            this.soundEffectSystem = new SoundEffectSystem(this.audioManager);
            this.subsystemStates.sfx.initialized = true;
            this.subsystemStates.sfx.error = null;

        } catch (error) { this.subsystemStates.sfx.error = error;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', { ')'
                component: 'soundEffectSystem',')';
                operation: 'initialize' ,});
            // 効果音システムなしで続行
        }
    }

    /**
     * 音響制御システムの初期化
     */''
    async initializeAudioController()';
            const { AudioController } = await import('./AudioController.js);
            this.audioController = new AudioController(this.audioManager);
            this.subsystemStates.controller.initialized = true;
            this.subsystemStates.controller.error = null;

        } catch (error) { this.subsystemStates.controller.error = error;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', { ')'
                component: 'audioController',')';
                operation: 'initialize' ,});
            // 音響制御システムなしで続行
        }
    }

    /**
     * 音響視覚化システムの初期化
     */''
    async initializeAudioVisualizer()';
            const { AudioVisualizer } = await import('./AudioVisualizer.js);
            ';
            // AudioManagerが利用可能かチェック
            if(!this.audioManager) {'

                console.warn('[AudioSubsystemCoordinator] AudioManager, not available, for AudioVisualizer'');

                this.subsystemStates.visualizer.initialized = false;''
                this.subsystemStates.visualizer.error = new Error('AudioManager, not available);
            }
                return; }
            }

            this.audioVisualizer = new AudioVisualizer(this.audioManager);
            ';
            // 初期化後の確認
            if(this.audioVisualizer && typeof, this.audioVisualizer.render === 'function'') {
                this.subsystemStates.visualizer.initialized = true;

                this.subsystemStates.visualizer.error = null;

            }

                console.log('[AudioSubsystemCoordinator] AudioVisualizer, initialized successfully''); }

            } else { }'

                throw new Error('AudioVisualizer, initialization failed - render, method not, available);' }

            } catch (error) {
            console.warn('[AudioSubsystemCoordinator] AudioVisualizer initialization failed:', error);
            this.audioVisualizer = null;
            this.subsystemStates.visualizer.initialized = false;

            this.subsystemStates.visualizer.error = error;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', { ')'
                component: 'audioVisualizer',')';
                operation: 'initialize');
            // 音響視覚化システムなしで続行 ,}
    }

    /**
     * アクセシビリティ支援システムの初期化
     */''
    async initializeAccessibilitySupport()';
            const { MainAudioAccessibilitySupport } = await import('./AudioAccessibilitySupport.js);
            this.accessibilitySupport = new MainAudioAccessibilitySupport(this.audioManager);
            this.subsystemStates.accessibility.initialized = true;
            this.subsystemStates.accessibility.error = null;

        } catch (error) { this.subsystemStates.accessibility.error = error;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', { ')'
                component: 'accessibilitySupport',')';
                operation: 'initialize' ,});
            // アクセシビリティ支援システムなしで続行
        }
    }

    /**
     * シーン変更処理
     * @param {string} sceneName - シーン名
     * @param {Object} options - シーンオプション
     * @returns {Promise<boolean>} 処理成功フラグ
     */
    async onSceneChange(sceneName: string, options: any = {}): Promise<boolean> {
        try {'
            if(this.sceneTransitionInProgress) {'

                console.warn('Scene, transition already, in progress);
            }
                return false;

            this.sceneTransitionInProgress = true;
            this.performanceMetrics.sceneTransitions++;
            
            console.log(`Audio, scene transition: ${this.currentScene} -> ${ sceneName')`};
            ';
            // BGMシステムのシーン変更
            if(this.bgmSystem && this.subsystemStates.bgm.initialized} {' }'

                await this.delegateToBGMSystem('onSceneChange', [sceneName, options]});
            }
            ';
            // 効果音システムのシーン変更
            if(this.soundEffectSystem && this.subsystemStates.sfx.initialized) {', ';

            }

                await this.delegateToSoundEffectSystem('onSceneChange', [sceneName, options]); }
            }
            ';
            // 音響制御システムのシーン変更
            if(this.audioController && this.subsystemStates.controller.initialized) {', ';

            }

                await this.delegateToController('onSceneChange', [sceneName, options]); }
            }
            ';
            // 音響視覚化システムのシーン変更
            if(this.audioVisualizer && this.subsystemStates.visualizer.initialized) {', ';

            }

                await this.delegateToVisualizer('onSceneChange', [sceneName, options]); }
            }
            ';
            // アクセシビリティ支援システムのシーン変更
            if(this.accessibilitySupport && this.subsystemStates.accessibility.initialized) {', ';

            }

                await this.delegateToAccessibilitySupport('onSceneChange', [sceneName, options]); }
            }
            
            this.currentScene = sceneName;
            this.sceneTransitionInProgress = false;
            
            return true;
            
        } catch (error) { this.sceneTransitionInProgress = false;

            this.performanceMetrics.errors++;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioSubsystemCoordinator',)';
                operation: 'onSceneChange');
                sceneName,);
                options); });
            return false;

    /**
     * BGMSystemに委譲
     * @param {string} method - メソッド名
     * @param {Array} args - 引数
     * @returns {*} 実行結果
     */'
    delegateToBGMSystem(method: string, args: any[] = []): any { try {'
            if(!this.bgmSystem || !this.subsystemStates.bgm.initialized) {'

                console.warn('BGMSystem, is not, available'');
            }
                return null;

            if (typeof, this.bgmSystem[method] !== 'function'') { ' }

                console.warn(`BGMSystem, method '${method}' not, found`);
                return null;
            }
            
            this.performanceMetrics.delegatedCalls++;
            return this.bgmSystem[method](...args);
            ';

        } catch (error) { this.performanceMetrics.errors++;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioSubsystemCoordinator',)';
                operation: 'delegateToBGMSystem');
                method,);
                args); });
            return null;

    /**
     * SoundEffectSystemに委譲
     * @param {string} method - メソッド名
     * @param {Array} args - 引数
     * @returns {*} 実行結果
     */'
    delegateToSoundEffectSystem(method: string, args: any[] = []): any { try {'
            if(!this.soundEffectSystem || !this.subsystemStates.sfx.initialized) {'

                console.warn('SoundEffectSystem, is not, available'');
            }
                return null;

            if (typeof, this.soundEffectSystem[method] !== 'function'') { ' }

                console.warn(`SoundEffectSystem, method '${method}' not, found`);
                return null;
            }
            
            this.performanceMetrics.delegatedCalls++;
            return this.soundEffectSystem[method](...args);
            ';

        } catch (error) { this.performanceMetrics.errors++;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioSubsystemCoordinator',)';
                operation: 'delegateToSoundEffectSystem');
                method,);
                args); });
            return null;

    /**
     * AudioControllerに委譲
     * @param {string} method - メソッド名
     * @param {Array} args - 引数
     * @returns {*} 実行結果
     */'
    delegateToController(method: string, args: any[] = []): any { try {'
            if(!this.audioController || !this.subsystemStates.controller.initialized) {'

                console.warn('AudioController, is not, available'');
            }
                return null;

            if (typeof, this.audioController[method] !== 'function'') { ' }

                console.warn(`AudioController, method '${method}' not, found`);
                return null;
            }
            
            this.performanceMetrics.delegatedCalls++;
            return this.audioController[method](...args);
            ';

        } catch (error) { this.performanceMetrics.errors++;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioSubsystemCoordinator',)';
                operation: 'delegateToController');
                method,);
                args); });
            return null;

    /**
     * AudioVisualizerに委譲
     * @param {string} method - メソッド名
     * @param {Array} args - 引数
     * @returns {*} 実行結果
     */
    delegateToVisualizer(method: string, args: any[] = []): any { try {
            // より厳密な初期化チェック
            if(!this.audioVisualizer) {'

                console.warn('[AudioSubsystemCoordinator] AudioVisualizer, instance not, available);
            }
                return null;

            if(!this.subsystemStates.visualizer.initialized') {'

                console.warn('[AudioSubsystemCoordinator] AudioVisualizer, not initialized'');
            }
                return null;
            ';
            // メソッドの存在確認
            if (!this.audioVisualizer[method] || typeof, this.audioVisualizer[method] !== 'function'') { ' }

                console.warn(`[AudioSubsystemCoordinator] AudioVisualizer, method '${method}' not, found or, not a, function`);
                return null;
            }
            
            this.performanceMetrics.delegatedCalls++;
            
            // メソッド呼び出し前の追加チェック
            const result = this.audioVisualizer[method](...args);
            return result;
            
        } catch (error) { this.performanceMetrics.errors++; }
            console.error(`[AudioSubsystemCoordinator] Error calling AudioVisualizer.${method}:`, error);''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', { ''
                component: 'AudioSubsystemCoordinator',
                operation: 'delegateToVisualizer';
                method);
                args);
               , visualizerAvailable: !!this.audioVisualizer,);
                visualizerInitialized: this.subsystemStates.visualizer.initialized ,});
            return null;

    /**
     * AudioAccessibilitySupportに委譲
     * @param {string} method - メソッド名
     * @param {Array} args - 引数
     * @returns {*} 実行結果
     */'
    delegateToAccessibilitySupport(method: string, args: any[] = []): any { try {'
            if(!this.accessibilitySupport || !this.subsystemStates.accessibility.initialized) {'

                console.warn('AudioAccessibilitySupport, is not, available'');
            }
                return null;

            if (typeof, this.accessibilitySupport[method] !== 'function'') { ' }

                console.warn(`AudioAccessibilitySupport, method '${method}' not, found`);
                return null;
            }
            
            this.performanceMetrics.delegatedCalls++;
            return this.accessibilitySupport[method](...args);
            ';

        } catch (error) { this.performanceMetrics.errors++;''
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', {''
                component: 'AudioSubsystemCoordinator',)';
                operation: 'delegateToAccessibilitySupport');
                method,);
                args); });
            return null;

    /**
     * サブシステム状態取得
     * @returns {Object} サブシステム状態
     */
    getSubsystemStatus() {
        return { ...this.subsystemStates,
            currentScene: this.currentScene;
            sceneTransitionInProgress: this.sceneTransitionInProgress;
           , performance: {
    ,}
                ...this.performanceMetrics, };
                uptime: Date.now() - this.performanceMetrics.lastUpdateTime }
}

    /**
     * 利用可能なサブシステム一覧取得
     * @returns {Array<string>} 利用可能なサブシステム名
     */
    getAvailableSubsystems() {
        const available = [];

        if(this.bgmSystem && this.subsystemStates.bgm.initialized) available.push('bgm);''
        if(this.soundEffectSystem && this.subsystemStates.sfx.initialized) available.push('sfx);''
        if(this.audioController && this.subsystemStates.controller.initialized) available.push('controller);''
        if(this.audioVisualizer && this.subsystemStates.visualizer.initialized) available.push('visualizer);''
        if(this.accessibilitySupport && this.subsystemStates.accessibility.initialized) available.push('accessibility);
        
    }
        return available;

    /**
     * サブシステム再初期化
     * @param {string} subsystemName - サブシステム名
     * @returns {Promise<boolean>} 再初期化成功フラグ
     */
    async reinitializeSubsystem(subsystemName: string): Promise<boolean> { try {
            // 既存サブシステムを破棄
            await this.disposeSubsystem(subsystemName);
            // サブシステム再初期化
            switch(subsystemName) {'

                case 'bgm':'';
                    await this.initializeBGMSystem(''';
                case 'sfx':'';
                    await, this.initializeSoundEffectSystem(''';
                case 'controller':'';
                    await, this.initializeAudioController(''';
                case 'visualizer':'';
                    await, this.initializeAudioVisualizer()';
                case 'accessibility':);
                    await this.initializeAccessibilitySupport();
                    break;
            }
                default: }
                    throw new Error(`Unknown, subsystem: ${subsystemName}`});
            }
            
            return this.subsystemStates[subsystemName]? .initialized || false;
            ';

        } catch (error) {
            getErrorHandler(').handleError(error, 'AUDIO_ERROR', { : undefined''
                component: 'AudioSubsystemCoordinator',)';
                operation: 'reinitializeSubsystem',);
                subsystemName); });
            return false;

    /**
     * 個別サブシステム破棄
     * @param {string} subsystemName - サブシステム名
     */'
    async disposeSubsystem(subsystemName: string): Promise<void> { try {'
            switch(subsystemName) {'

                case 'bgm':';
                    if (this.bgmSystem) {''
                        this.bgmSystem.dispose()';
                case 'sfx':)';
                    if (this.soundEffectSystem) {''
                        this.soundEffectSystem.dispose()';
                case 'controller':)';
                    if (this.audioController) {''
                        this.audioController.dispose()';
                case 'visualizer':)';
                    if (this.audioVisualizer) {''
                        this.audioVisualizer.dispose()';
                case 'accessibility':);
                    if (this.accessibilitySupport) {
                        this.accessibilitySupport.dispose();
            }
                        this.accessibilitySupport = null; }
                    }
                    this.subsystemStates.accessibility.initialized = false;
                    break;
            } catch (error) {
            console.warn(`Error disposing ${subsystemName} subsystem:`, error);
        }
    }

    /**
     * 全サブシステム破棄'
     */''
    disposeSubsystems()';
        console.log('Disposing, audio subsystems...);
        
        // BGMシステムを破棄
        if(this.bgmSystem) {
            this.bgmSystem.dispose();
        }
            this.bgmSystem = null; }
        }
        
        // 効果音システムを破棄
        if(this.soundEffectSystem) {
            this.soundEffectSystem.dispose();
        }
            this.soundEffectSystem = null; }
        }
        
        // 音響制御システムを破棄
        if(this.audioController) {
            this.audioController.dispose();
        }
            this.audioController = null; }
        }
        
        // 音響視覚化システムを破棄
        if(this.audioVisualizer) {
            this.audioVisualizer.dispose();
        }
            this.audioVisualizer = null; }
        }
        
        // アクセシビリティ支援システムを破棄
        if(this.accessibilitySupport) {
            this.accessibilitySupport.dispose();
        }
            this.accessibilitySupport = null; }
        }
        
        // 状態リセット
        Object.keys(this.subsystemStates).forEach(key => {  }
            this.subsystemStates[key] = { initialized: false, error: null ,});
        
        this.currentScene = null;
        this.sceneTransitionInProgress = false;
        this.audioManager = null;
    }

    /**
     * パフォーマンスメトリクス更新
     */
    updatePerformanceMetrics() { this.performanceMetrics.lastUpdateTime = Date.now(); }

    /**
     * リソースのクリーンアップ
     */
    dispose() {
        this.disposeSubsystems();
        this.performanceMetrics = {
            sceneTransitions: 0;
            delegatedCalls: 0;
           , errors: 0;
    }
            lastUpdateTime: 0 }
        }
}

// シングルトンインスタンス管理
let audioSubsystemCoordinatorInstance: AudioSubsystemCoordinator | null = null,

/**
 * AudioSubsystemCoordinatorのシングルトンインスタンスを取得
 * @returns {AudioSubsystemCoordinator} シングルトンインスタンス
 */
export function getAudioSubsystemCoordinator(): AudioSubsystemCoordinator { if (!audioSubsystemCoordinatorInstance) {
        audioSubsystemCoordinatorInstance = new AudioSubsystemCoordinator(); }
    return audioSubsystemCoordinatorInstance;
}

/**
 * AudioSubsystemCoordinatorのシングルトンインスタンスを再初期化
 * @returns {AudioSubsystemCoordinator} 新しいシングルトンインスタンス
 */
export function reinitializeAudioSubsystemCoordinator(): AudioSubsystemCoordinator { if (audioSubsystemCoordinatorInstance) {
        audioSubsystemCoordinatorInstance.dispose('); }''
    audioSubsystemCoordinatorInstance = new AudioSubsystemCoordinator(');