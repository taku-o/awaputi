/**
 * InterfaceSimplifier - インターフェース簡素化実行システム
 * 
 * 実際のUI要素の簡素化操作を実行し、視覚的な変更を適用
 */

export class InterfaceSimplifier {
    constructor() {
        this.activeSimplifications = new Map();
        this.simplificationRules = this.initializeSimplificationRules();
        this.originalStates = new Map();
        this.observedElements = new Set();
        
        this.setupMutationObserver();
    }

    /**
     * 簡素化ルールを初期化
     */
    initializeSimplificationRules() {
        return {
            // 要素非表示ルール
            hideElements: {
                decorative: [
                    '.decoration', '.ornament', '.fancy-border',
                    '.background-pattern', '.visual-flair'
                ],
                secondary: [
                    '.secondary-info', '.extra-details', '.bonus-content',
                    '.advertisement', '.promotion'
                ],
                advanced: [
                    '.advanced-controls', '.expert-settings', '.debug-info',
                    '.developer-tools', '.admin-panel'
                ],
                nonEssential: [
                    '.social-media', '.share-buttons', '.rating-widget',
                    '.recommendation', '.trending'
                ]
            },

            // アニメーション制御ルール
            animations: {
                disable: [
                    'animation', 'transition', 'transform'
                ],
                reduce: {
                    duration: '0.1s',
                    easing: 'linear'
                }
            },

            // 視覚効果制御ルール
            effects: {
                disable: [
                    'box-shadow', 'text-shadow', 'filter',
                    'backdrop-filter', 'clip-path'
                ],
                reduce: {
                    'box-shadow': 'none',
                    'text-shadow': 'none',
                    'filter': 'none'
                }
            },

            // フォント簡素化ルール
            typography: {
                simplify: {
                    'font-family': 'Arial, sans-serif',
                    'font-weight': 'normal',
                    'text-decoration': 'none'
                },
                sizes: {
                    'font-size': '14px',
                    'line-height': '1.5'
                }
            },

            // 色彩簡素化ルール
            colors: {
                highContrast: {
                    'color': '#000000',
                    'background-color': '#ffffff',
                    'border-color': '#666666'
                },
                monochrome: {
                    filter: 'grayscale(100%)'
                }
            },

            // レイアウト簡素化ルール
            layout: {
                simplify: {
                    'padding': '8px',
                    'margin': '4px',
                    'border-radius': '0px',
                    'border': '1px solid #ccc'
                },
                grid: {
                    'display': 'block',
                    'float': 'none',
                    'position': 'static'
                }
            }
        };
    }

    /**
     * Mutation Observerを設定
     */
    setupMutationObserver() {
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.applyActiveSimplifications(node);
                        }
                    });
                }
            });
        });

        if (typeof document !== 'undefined') {
            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * 簡素化を適用
     */
    applySimplification(level, options = {}) {
        const simplificationId = `simplification_${Date.now()}`;
        
        try {
            const operations = this.getSimplificationOperations(level, options);
            const appliedOperations = [];

            operations.forEach(operation => {
                const result = this.executeOperation(operation);
                if (result.success) {
                    appliedOperations.push(result);
                }
            });

            // アクティブな簡素化を記録
            this.activeSimplifications.set(simplificationId, {
                level,
                options,
                operations: appliedOperations,
                timestamp: Date.now()
            });

            return {
                success: true,
                id: simplificationId,
                operationsApplied: appliedOperations.length,
                details: appliedOperations
            };

        } catch (error) {
            console.error('Simplification failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 簡素化操作を取得
     */
    getSimplificationOperations(level, options) {
        const operations = [];

        switch (level) {
            case 'minimal':
                operations.push(
                    { type: 'hideElements', target: 'decorative' },
                    { type: 'reduceAnimations' }
                );
                break;

            case 'moderate':
                operations.push(
                    { type: 'hideElements', target: 'decorative' },
                    { type: 'hideElements', target: 'secondary' },
                    { type: 'disableAnimations' },
                    { type: 'reduceEffects' }
                );
                break;

            case 'significant':
                operations.push(
                    { type: 'hideElements', target: 'decorative' },
                    { type: 'hideElements', target: 'secondary' },
                    { type: 'hideElements', target: 'advanced' },
                    { type: 'disableAnimations' },
                    { type: 'disableEffects' },
                    { type: 'simplifyTypography' }
                );
                break;

            case 'extreme':
                operations.push(
                    { type: 'hideElements', target: 'decorative' },
                    { type: 'hideElements', target: 'secondary' },
                    { type: 'hideElements', target: 'advanced' },
                    { type: 'hideElements', target: 'nonEssential' },
                    { type: 'disableAnimations' },
                    { type: 'disableEffects' },
                    { type: 'simplifyTypography' },
                    { type: 'simplifyColors' },
                    { type: 'simplifyLayout' }
                );
                break;
        }

        // カスタムオプションを追加
        if (options.highContrast) {
            operations.push({ type: 'applyHighContrast' });
        }

        if (options.monochrome) {
            operations.push({ type: 'applyMonochrome' });
        }

        if (options.largeText) {
            operations.push({ type: 'increaseFontSize' });
        }

        return operations;
    }

    /**
     * 操作を実行
     */
    executeOperation(operation) {
        try {
            switch (operation.type) {
                case 'hideElements':
                    return this.hideElements(operation.target);

                case 'disableAnimations':
                    return this.disableAnimations();

                case 'reduceAnimations':
                    return this.reduceAnimations();

                case 'disableEffects':
                    return this.disableEffects();

                case 'reduceEffects':
                    return this.reduceEffects();

                case 'simplifyTypography':
                    return this.simplifyTypography();

                case 'simplifyColors':
                    return this.simplifyColors();

                case 'simplifyLayout':
                    return this.simplifyLayout();

                case 'applyHighContrast':
                    return this.applyHighContrast();

                case 'applyMonochrome':
                    return this.applyMonochrome();

                case 'increaseFontSize':
                    return this.increaseFontSize();

                default:
                    throw new Error(`Unknown operation: ${operation.type}`);
            }
        } catch (error) {
            return {
                success: false,
                operation: operation.type,
                error: error.message
            };
        }
    }

    /**
     * 要素を非表示
     */
    hideElements(category) {
        const selectors = this.simplificationRules.hideElements[category];
        if (!selectors) return { success: false, error: 'Unknown category' };

        const hiddenElements = [];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.saveOriginalState(element, 'display');
                element.style.display = 'none';
                hiddenElements.push(element);
            });
        });

        return {
            success: true,
            operation: 'hideElements',
            category,
            elementsAffected: hiddenElements.length,
            elements: hiddenElements
        };
    }

    /**
     * アニメーションを無効化
     */
    disableAnimations() {
        const style = this.createOrUpdateGlobalStyle('disable-animations', `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `);

        return {
            success: true,
            operation: 'disableAnimations',
            styleElement: style
        };
    }

    /**
     * アニメーションを軽減
     */
    reduceAnimations() {
        const style = this.createOrUpdateGlobalStyle('reduce-animations', `
            *, *::before, *::after {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
                transition-timing-function: linear !important;
            }
        `);

        return {
            success: true,
            operation: 'reduceAnimations',
            styleElement: style
        };
    }

    /**
     * 視覚効果を無効化
     */
    disableEffects() {
        const style = this.createOrUpdateGlobalStyle('disable-effects', `
            * {
                box-shadow: none !important;
                text-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
                clip-path: none !important;
            }
        `);

        return {
            success: true,
            operation: 'disableEffects',
            styleElement: style
        };
    }

    /**
     * 視覚効果を軽減
     */
    reduceEffects() {
        const style = this.createOrUpdateGlobalStyle('reduce-effects', `
            * {
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                text-shadow: none !important;
                filter: none !important;
            }
        `);

        return {
            success: true,
            operation: 'reduceEffects',
            styleElement: style
        };
    }

    /**
     * タイポグラフィを簡素化
     */
    simplifyTypography() {
        const style = this.createOrUpdateGlobalStyle('simplify-typography', `
            * {
                font-family: Arial, sans-serif !important;
                font-weight: normal !important;
                text-decoration: none !important;
                font-style: normal !important;
            }
        `);

        return {
            success: true,
            operation: 'simplifyTypography',
            styleElement: style
        };
    }

    /**
     * 色彩を簡素化
     */
    simplifyColors() {
        const style = this.createOrUpdateGlobalStyle('simplify-colors', `
            * {
                background-image: none !important;
                background-gradient: none !important;
            }
        `);

        return {
            success: true,
            operation: 'simplifyColors',
            styleElement: style
        };
    }

    /**
     * レイアウトを簡素化
     */
    simplifyLayout() {
        const style = this.createOrUpdateGlobalStyle('simplify-layout', `
            * {
                border-radius: 0 !important;
                padding: 8px !important;
                margin: 4px !important;
            }
        `);

        return {
            success: true,
            operation: 'simplifyLayout',
            styleElement: style
        };
    }

    /**
     * 高コントラストを適用
     */
    applyHighContrast() {
        const style = this.createOrUpdateGlobalStyle('high-contrast', `
            * {
                color: #000000 !important;
                background-color: #ffffff !important;
                border-color: #666666 !important;
            }
            
            a, button {
                color: #0000ff !important;
            }
            
            a:visited {
                color: #800080 !important;
            }
        `);

        return {
            success: true,
            operation: 'applyHighContrast',
            styleElement: style
        };
    }

    /**
     * モノクロームを適用
     */
    applyMonochrome() {
        const style = this.createOrUpdateGlobalStyle('monochrome', `
            * {
                filter: grayscale(100%) !important;
            }
        `);

        return {
            success: true,
            operation: 'applyMonochrome',
            styleElement: style
        };
    }

    /**
     * フォントサイズを拡大
     */
    increaseFontSize() {
        const style = this.createOrUpdateGlobalStyle('large-text', `
            * {
                font-size: 18px !important;
                line-height: 1.6 !important;
            }
            
            h1 { font-size: 28px !important; }
            h2 { font-size: 24px !important; }
            h3 { font-size: 20px !important; }
        `);

        return {
            success: true,
            operation: 'increaseFontSize',
            styleElement: style
        };
    }

    /**
     * グローバルスタイルを作成または更新
     */
    createOrUpdateGlobalStyle(id, css) {
        let styleElement = document.getElementById(`simplification-${id}`);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = `simplification-${id}`;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = css;
        return styleElement;
    }

    /**
     * 元の状態を保存
     */
    saveOriginalState(element, property) {
        const key = `${element.tagName}_${element.className}_${property}`;
        if (!this.originalStates.has(key)) {
            this.originalStates.set(key, {
                element,
                property,
                value: element.style[property] || window.getComputedStyle(element)[property]
            });
        }
    }

    /**
     * 簡素化を元に戻す
     */
    revertSimplification(simplificationId) {
        const simplification = this.activeSimplifications.get(simplificationId);
        if (!simplification) {
            return { success: false, error: 'Simplification not found' };
        }

        try {
            let revertedOperations = 0;

            simplification.operations.forEach(operation => {
                if (this.revertOperation(operation)) {
                    revertedOperations++;
                }
            });

            this.activeSimplifications.delete(simplificationId);

            return {
                success: true,
                operationsReverted: revertedOperations
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 操作を元に戻す
     */
    revertOperation(operation) {
        try {
            switch (operation.operation) {
                case 'hideElements':
                    operation.elements?.forEach(element => {
                        element.style.display = '';
                    });
                    return true;

                default:
                    // グローバルスタイルを削除
                    if (operation.styleElement) {
                        operation.styleElement.remove();
                        return true;
                    }
                    return false;
            }
        } catch (error) {
            console.error('Failed to revert operation:', error);
            return false;
        }
    }

    /**
     * 全ての簡素化を元に戻す
     */
    revertAllSimplifications() {
        const simplificationIds = Array.from(this.activeSimplifications.keys());
        const results = [];

        simplificationIds.forEach(id => {
            results.push(this.revertSimplification(id));
        });

        // グローバルスタイルを全て削除
        document.querySelectorAll('style[id^="simplification-"]').forEach(style => {
            style.remove();
        });

        return {
            success: true,
            revertedSimplifications: results.filter(r => r.success).length,
            results
        };
    }

    /**
     * アクティブな簡素化に新しい要素を適用
     */
    applyActiveSimplifications(element) {
        this.activeSimplifications.forEach(simplification => {
            simplification.operations.forEach(operation => {
                if (operation.operation === 'hideElements') {
                    const selectors = this.simplificationRules.hideElements[operation.category];
                    selectors.forEach(selector => {
                        if (element.matches && element.matches(selector)) {
                            element.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    /**
     * アクティブな簡素化を取得
     */
    getActiveSimplifications() {
        return Array.from(this.activeSimplifications.entries()).map(([id, simplification]) => ({
            id,
            ...simplification
        }));
    }

    /**
     * 簡素化統計を取得
     */
    getStats() {
        const active = this.activeSimplifications.size;
        const totalOperations = Array.from(this.activeSimplifications.values())
            .reduce((sum, s) => sum + s.operations.length, 0);

        return {
            activeSimplifications: active,
            totalOperations,
            originalStatesStored: this.originalStates.size,
            observedElements: this.observedElements.size
        };
    }

    /**
     * 簡素化ルールを更新
     */
    updateSimplificationRules(newRules) {
        Object.assign(this.simplificationRules, newRules);
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.revertAllSimplifications();
        
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.activeSimplifications.clear();
        this.originalStates.clear();
        this.observedElements.clear();
    }
}