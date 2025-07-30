/**
 * Lazy Load Manager - デバッグコンポーネントの遅延読み込み管理
 */
export class LazyLoadManager {
    constructor(debugInterface) {
        this.debugInterface = debugInterface;
        this.loadedComponents = new Set();
        this.loadingComponents = new Map();
        this.componentRegistry = new Map();
        this.preloadQueue = [];
        this.preloadBatch = 2; // 一度に先読みする数
        
        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        this.registerDefaultComponents();
        this.setupIntersectionObserver();
    }

    /**
     * デフォルトコンポーネントを登録
     */
    registerDefaultComponents() {
        // パネルの遅延読み込み設定
        this.componentRegistry.set('overview', {
            path: './panels/OverviewPanel.js',
            className: 'OverviewPanel',
            priority: 'high',
            preload: true,
            dependencies: []
        });

        this.componentRegistry.set('performance', {
            path: './panels/PerformancePanel.js',
            className: 'PerformancePanel',
            priority: 'high',
            preload: false,
            dependencies: []
        });

        this.componentRegistry.set('console', {
            path: './panels/ConsolePanel.js',
            className: 'ConsolePanel',
            priority: 'medium',
            preload: false,
            dependencies: []
        });

        this.componentRegistry.set('error', {
            path: './panels/ErrorPanel.js',
            className: 'ErrorPanel',
            priority: 'medium',
            preload: false,
            dependencies: []
        });

        this.componentRegistry.set('test', {
            path: './panels/TestPanel.js',
            className: 'TestPanel',
            priority: 'low',
            preload: false,
            dependencies: []
        });

        // 管理系コンポーネント
        this.componentRegistry.set('theme-manager', {
            path: './ThemeManager.js',
            className: 'ThemeManager',
            priority: 'high',
            preload: true,
            dependencies: []
        });

        this.componentRegistry.set('accessibility-manager', {
            path: './AccessibilityManager.js',
            className: 'AccessibilityManager',
            priority: 'high',
            preload: true,
            dependencies: []
        });
    }

    /**
     * Intersection Observer を設定
     */
    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const componentName = entry.target.dataset.lazyComponent;
                    if (componentName && !this.loadedComponents.has(componentName)) {
                        this.loadComponent(componentName);
                    }
                }
            });
        }, {
            rootMargin: '50px' // 50px手前で読み込み開始
        });
    }

    /**
     * コンポーネントを登録
     */
    registerComponent(name, config) {
        this.componentRegistry.set(name, {
            priority: 'medium',
            preload: false,
            dependencies: [],
            ...config
        });
    }

    /**
     * コンポーネントを読み込み
     */
    async loadComponent(name) {
        // すでに読み込み済みの場合
        if (this.loadedComponents.has(name)) {
            return this.getLoadedComponent(name);
        }

        // 読み込み中の場合は既存のPromiseを返す
        if (this.loadingComponents.has(name)) {
            return this.loadingComponents.get(name);
        }

        const config = this.componentRegistry.get(name);
        if (!config) {
            throw new Error(`Component '${name}' not registered`);
        }

        // 読み込み開始
        const loadPromise = this.performComponentLoad(name, config);
        this.loadingComponents.set(name, loadPromise);

        try {
            const component = await loadPromise;
            this.loadedComponents.add(name);
            this.loadingComponents.delete(name);
            
            console.log(`Lazy loaded component: ${name}`);
            return component;
        } catch (error) {
            this.loadingComponents.delete(name);
            console.error(`Failed to lazy load component '${name}':`, error);
            throw error;
        }
    }

    /**
     * 実際のコンポーネント読み込み処理
     */
    async performComponentLoad(name, config) {
        // 依存関係を先に読み込み
        if (config.dependencies && config.dependencies.length > 0) {
            await Promise.all(
                config.dependencies.map(dep => this.loadComponent(dep))
            );
        }

        // モジュールをインポート
        try {
            const module = await import(config.path);
            const ComponentClass = module[config.className];
            
            if (!ComponentClass) {
                throw new Error(`Class '${config.className}' not found in module`);
            }

            // インスタンスを作成
            const instance = new ComponentClass(
                this.debugInterface.gameEngine,
                this.debugInterface
            );

            return {
                name,
                class: ComponentClass,
                instance,
                config
            };
        } catch (error) {
            throw new Error(`Failed to import ${config.path}: ${error.message}`);
        }
    }

    /**
     * 読み込み済みコンポーネントを取得
     */
    getLoadedComponent(name) {
        // 読み込み済みの場合、インスタンスを返す
        // 実装は PanelManager と連携する必要がある
        return this.debugInterface.panelManager?.getPanelInfo(name)?.instance;
    }

    /**
     * 先読みを実行
     */
    async preloadComponents() {
        const preloadList = Array.from(this.componentRegistry.entries())
            .filter(([name, config]) => config.preload && !this.loadedComponents.has(name))
            .sort(([, a], [, b]) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))
            .slice(0, this.preloadBatch);

        if (preloadList.length === 0) return;

        console.log(`Preloading ${preloadList.length} components...`);

        const preloadPromises = preloadList.map(([name]) => 
            this.loadComponent(name).catch(error => {
                console.warn(`Preload failed for ${name}:`, error);
                return null;
            })
        );

        await Promise.all(preloadPromises);
    }

    /**
     * 優先度の数値変換
     */
    getPriorityValue(priority) {
        switch (priority) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    }

    /**
     * オンデマンド読み込み用の要素を設定
     */
    setupLazyElement(element, componentName) {
        if (!this.intersectionObserver) return;

        element.dataset.lazyComponent = componentName;
        this.intersectionObserver.observe(element);
    }

    /**
     * バッチ読み込み
     */
    async loadComponentBatch(names) {
        const loadPromises = names.map(name => 
            this.loadComponent(name).catch(error => {
                console.warn(`Batch load failed for ${name}:`, error);
                return null;
            })
        );

        const results = await Promise.all(loadPromises);
        return results.filter(result => result !== null);
    }

    /**
     * 条件付き読み込み
     */
    async loadComponentIf(name, condition) {
        if (typeof condition === 'function') {
            if (!await condition()) return null;
        } else if (!condition) {
            return null;
        }

        return this.loadComponent(name);
    }

    /**
     * 使用されていないコンポーネントをアンロード
     */
    unloadUnusedComponents() {
        const activePanel = this.debugInterface.activePanel;
        const recentPanels = this.debugInterface.panelHistory.slice(-2);
        const keepLoaded = new Set([activePanel, ...recentPanels]);

        for (const name of this.loadedComponents) {
            if (!keepLoaded.has(name)) {
                this.unloadComponent(name);
            }
        }
    }

    /**
     * コンポーネントをアンロード
     */
    unloadComponent(name) {
        if (!this.loadedComponents.has(name)) return;

        const panelInfo = this.debugInterface.panelManager?.getPanelInfo(name);
        if (panelInfo && panelInfo.instance && typeof panelInfo.instance.destroy === 'function') {
            panelInfo.instance.destroy();
        }

        this.loadedComponents.delete(name);
        console.log(`Unloaded component: ${name}`);
    }

    /**
     * 読み込み統計を取得
     */
    getLoadingStats() {
        const totalComponents = this.componentRegistry.size;
        const loadedCount = this.loadedComponents.size;
        const loadingCount = this.loadingComponents.size;

        return {
            total: totalComponents,
            loaded: loadedCount,
            loading: loadingCount,
            unloaded: totalComponents - loadedCount - loadingCount,
            loadedComponents: Array.from(this.loadedComponents),
            loadingComponents: Array.from(this.loadingComponents.keys()),
            loadPercentage: (loadedCount / totalComponents) * 100
        };
    }

    /**
     * メモリ使用量を最適化
     */
    optimizeMemoryUsage() {
        // 最近使用されていないコンポーネントをアンロード
        this.unloadUnusedComponents();

        // ガベージコレクションを促進（可能な場合）
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
    }

    /**
     * 読み込み品質を評価
     */
    evaluateLoadingPerformance() {
        const stats = this.getLoadingStats();
        const evaluation = {
            efficiency: stats.loadPercentage < 50 ? 'good' : stats.loadPercentage < 80 ? 'moderate' : 'poor',
            memoryImpact: stats.loaded < 3 ? 'low' : stats.loaded < 6 ? 'medium' : 'high',
            recommendations: []
        };

        if (stats.loadPercentage > 70) {
            evaluation.recommendations.push('Consider unloading unused components');
        }

        if (stats.loaded > 5) {
            evaluation.recommendations.push('Enable automatic memory optimization');
        }

        return evaluation;
    }

    /**
     * デバッグ情報を取得
     */
    getDebugInfo() {
        return {
            stats: this.getLoadingStats(),
            registry: Array.from(this.componentRegistry.entries()).map(([name, config]) => ({
                name,
                ...config,
                loaded: this.loadedComponents.has(name),
                loading: this.loadingComponents.has(name)
            })),
            performance: this.evaluateLoadingPerformance()
        };
    }

    /**
     * 破棄
     */
    destroy() {
        // 全コンポーネントをアンロード
        for (const name of this.loadedComponents) {
            this.unloadComponent(name);
        }

        // Intersection Observer を停止
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // 読み込み中の処理をキャンセル
        this.loadingComponents.clear();
        this.componentRegistry.clear();
        this.loadedComponents.clear();
    }
}