/**
 * Help Animation Manager
 * ヘルプアニメーション管理 - UI遷移アニメーションの統合管理
 */

/**
 * Help Animation Manager
 * アニメーション管理器 - ヘルプシーンの各種アニメーション制御
 */
export class HelpAnimationManager {
    constructor() {
        // アニメーション状態
        this.animations = {
            contentTransition: {
                isActive: false,
                startTime: 0,
                duration: 300, // 300ms
                fromContent: null,
                toContent: null,
                progress: 0,
                type: 'slide' // 'slide', 'fade', 'scale'
            },
            categoryTransition: {
                isActive: false,
                startTime: 0,
                duration: 200,
                fromIndex: 0,
                toIndex: 0,
                progress: 0
            },
            searchTransition: {
                isActive: false,
                startTime: 0,
                duration: 250,
                isEntering: true,
                progress: 0
            },
            focusTransition: {
                isActive: false,
                startTime: 0,
                duration: 150,
                fromIndex: 0,
                toIndex: 0,
                progress: 0
            }
        };

        // アニメーション設定
        this.enableAnimations = true;
        this.easingFunctions = {
            linear: t => t,
            easeOut: t => 1 - Math.pow(1 - t, 3),
            easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            bounce: t => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) {
                    return n1 * t * t;
                } else if (t < 2 / d1) {
                    return n1 * (t -= 1.5 / d1) * t + 0.75;
                } else if (t < 2.5 / d1) {
                    return n1 * (t -= 2.25 / d1) * t + 0.9375;
                } else {
                    return n1 * (t -= 2.625 / d1) * t + 0.984375;
                }
            }
        };
    }

    /**
     * コンテンツ遷移アニメーション開始
     */
    startContentTransition(newContent, transitionType = 'slide') {
        if (!this.enableAnimations) {
            return null;
        }

        if (this.animations.contentTransition.isActive) {
            return null; // 既にアニメーション中
        }

        this.animations.contentTransition = {
            isActive: true,
            startTime: performance.now(),
            duration: 300,
            fromContent: this.getCurrentContent(),
            toContent: newContent,
            progress: 0,
            type: transitionType
        };

        return this.animations.contentTransition;
    }

    /**
     * カテゴリ遷移アニメーション開始
     */
    startCategoryTransition(fromIndex, toIndex) {
        if (!this.enableAnimations) {
            return null;
        }

        if (this.animations.categoryTransition.isActive) {
            return null;
        }

        this.animations.categoryTransition = {
            isActive: true,
            startTime: performance.now(),
            duration: 200,
            fromIndex,
            toIndex,
            progress: 0
        };

        return this.animations.categoryTransition;
    }

    /**
     * 検索遷移アニメーション開始
     */
    startSearchTransition(isEntering) {
        if (!this.enableAnimations) {
            return null;
        }

        this.animations.searchTransition = {
            isActive: true,
            startTime: performance.now(),
            duration: 250,
            isEntering,
            progress: 0
        };

        return this.animations.searchTransition;
    }

    /**
     * フォーカス遷移アニメーション開始
     */
    startFocusTransition(fromIndex, toIndex) {
        if (!this.enableAnimations) {
            return null;
        }

        this.animations.focusTransition = {
            isActive: true,
            startTime: performance.now(),
            duration: 150,
            fromIndex,
            toIndex,
            progress: 0
        };

        return this.animations.focusTransition;
    }

    /**
     * アニメーション更新
     */
    updateAnimations(currentTime) {
        let hasActiveAnimations = false;

        // コンテンツ遷移アニメーション
        if (this.animations.contentTransition.isActive) {
            const animation = this.animations.contentTransition;
            const elapsed = currentTime - animation.startTime;
            animation.progress = Math.min(1, elapsed / animation.duration);

            if (animation.progress >= 1) {
                animation.isActive = false;
                animation.progress = 1;
            }
            hasActiveAnimations = true;
        }

        // カテゴリ遷移アニメーション
        if (this.animations.categoryTransition.isActive) {
            const animation = this.animations.categoryTransition;
            const elapsed = currentTime - animation.startTime;
            animation.progress = Math.min(1, elapsed / animation.duration);

            if (animation.progress >= 1) {
                animation.isActive = false;
                animation.progress = 1;
            }
            hasActiveAnimations = true;
        }

        // 検索遷移アニメーション
        if (this.animations.searchTransition.isActive) {
            const animation = this.animations.searchTransition;
            const elapsed = currentTime - animation.startTime;
            animation.progress = Math.min(1, elapsed / animation.duration);

            if (animation.progress >= 1) {
                animation.isActive = false;
                animation.progress = 1;
            }
            hasActiveAnimations = true;
        }

        // フォーカス遷移アニメーション
        if (this.animations.focusTransition.isActive) {
            const animation = this.animations.focusTransition;
            const elapsed = currentTime - animation.startTime;
            animation.progress = Math.min(1, elapsed / animation.duration);

            if (animation.progress >= 1) {
                animation.isActive = false;
                animation.progress = 1;
            }
            hasActiveAnimations = true;
        }

        return hasActiveAnimations;
    }

    /**
     * イージング関数の適用
     */
    applyEasing(progress, easingType = 'easeOut') {
        const easingFunction = this.easingFunctions[easingType] || this.easingFunctions.easeOut;
        return easingFunction(progress);
    }

    /**
     * アニメーション状態の取得
     */
    getAnimationState(animationType) {
        return this.animations[animationType] || null;
    }

    getAllAnimationStates() {
        return { ...this.animations };
    }

    isAnyAnimationActive() {
        return Object.values(this.animations).some(anim => anim.isActive);
    }

    /**
     * アニメーション停止
     */
    stopAnimation(animationType) {
        if (this.animations[animationType]) {
            this.animations[animationType].isActive = false;
            this.animations[animationType].progress = 1;
        }
    }

    stopAllAnimations() {
        Object.keys(this.animations).forEach(type => {
            this.stopAnimation(type);
        });
    }

    /**
     * アニメーション設定
     */
    setAnimationEnabled(enabled) {
        this.enableAnimations = enabled;
        if (!enabled) {
            this.stopAllAnimations();
        }
    }

    setAnimationDuration(animationType, duration) {
        if (this.animations[animationType]) {
            this.animations[animationType].duration = duration;
        }
    }

    /**
     * プリセットアニメーション
     */
    getSlideTransitionOffset(progress, direction = 'horizontal') {
        const easedProgress = this.applyEasing(progress, 'easeOut');
        const offset = (1 - easedProgress) * 100;
        
        return direction === 'horizontal' ? { x: offset, y: 0 } : { x: 0, y: offset };
    }

    getFadeTransitionAlpha(progress) {
        return this.applyEasing(progress, 'linear');
    }

    getScaleTransitionScale(progress) {
        const easedProgress = this.applyEasing(progress, 'easeOut');
        return 0.5 + (easedProgress * 0.5); // 0.5 to 1.0
    }

    // ヘルパーメソッド（継承用）
    getCurrentContent() {
        // オーバーライド用のプレースホルダー
        return null;
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.stopAllAnimations();
        console.log('HelpAnimationManager destroyed');
    }
}

/**
 * Help Transition Renderer
 * ヘルプ遷移レンダラー - アニメーション描画の実装
 */
export class HelpTransitionRenderer {
    constructor(animationManager) {
        this.animationManager = animationManager;
    }

    /**
     * コンテンツ遷移の描画
     */
    renderContentTransition(ctx, contentArea, renderer) {
        const transition = this.animationManager.getAnimationState('contentTransition');
        if (!transition || !transition.isActive) {
            return false;
        }

        const progress = this.animationManager.applyEasing(transition.progress, 'easeOut');

        ctx.save();

        switch (transition.type) {
        case 'slide':
            this.renderSlideTransition(ctx, contentArea, transition, progress, renderer);
            break;
        case 'fade':
            this.renderFadeTransition(ctx, contentArea, transition, progress, renderer);
            break;
        case 'scale':
            this.renderScaleTransition(ctx, contentArea, transition, progress, renderer);
            break;
        default:
            this.renderSlideTransition(ctx, contentArea, transition, progress, renderer);
        }

        ctx.restore();
        return true;
    }

    /**
     * スライド遷移の描画
     */
    renderSlideTransition(ctx, contentArea, transition, progress, renderer) {
        const slideOffset = contentArea.width * (1 - progress);

        // 前のコンテンツ（左にスライドアウト）
        if (transition.fromContent && renderer) {
            ctx.save();
            ctx.translate(-slideOffset, 0);
            ctx.globalAlpha = 1 - progress;
            renderer.renderContentData(ctx, contentArea, transition.fromContent);
            ctx.restore();
        }

        // 新しいコンテンツ（右からスライドイン）
        if (transition.toContent && renderer) {
            ctx.save();
            ctx.translate(contentArea.width - slideOffset, 0);
            ctx.globalAlpha = progress;
            renderer.renderContentData(ctx, contentArea, transition.toContent);
            ctx.restore();
        }
    }

    /**
     * フェード遷移の描画
     */
    renderFadeTransition(ctx, contentArea, transition, progress, renderer) {
        // 前のコンテンツ（フェードアウト）
        if (transition.fromContent && renderer) {
            ctx.save();
            ctx.globalAlpha = 1 - progress;
            renderer.renderContentData(ctx, contentArea, transition.fromContent);
            ctx.restore();
        }

        // 新しいコンテンツ（フェードイン）
        if (transition.toContent && renderer) {
            ctx.save();
            ctx.globalAlpha = progress;
            renderer.renderContentData(ctx, contentArea, transition.toContent);
            ctx.restore();
        }
    }

    /**
     * スケール遷移の描画
     */
    renderScaleTransition(ctx, contentArea, transition, progress, renderer) {
        const centerX = contentArea.x + contentArea.width / 2;
        const centerY = contentArea.y + contentArea.height / 2;

        // 前のコンテンツ（スケールアウト）
        if (transition.fromContent && renderer) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(1 + progress * 0.2, 1 + progress * 0.2); // わずかに拡大
            ctx.globalAlpha = 1 - progress;
            ctx.translate(-centerX, -centerY);
            renderer.renderContentData(ctx, contentArea, transition.fromContent);
            ctx.restore();
        }

        // 新しいコンテンツ（スケールイン）
        if (transition.toContent && renderer) {
            ctx.save();
            ctx.translate(centerX, centerY);
            const scale = 0.8 + progress * 0.2; // 0.8 から 1.0 へ
            ctx.scale(scale, scale);
            ctx.globalAlpha = progress;
            ctx.translate(-centerX, -centerY);
            renderer.renderContentData(ctx, contentArea, transition.toContent);
            ctx.restore();
        }
    }

    /**
     * カテゴリ遷移の描画効果
     */
    renderCategoryTransition(ctx, categories, layout, selectedCategory) {
        const transition = this.animationManager.getAnimationState('categoryTransition');
        if (!transition || !transition.isActive) {
            return false;
        }

        const progress = this.animationManager.applyEasing(transition.progress, 'easeOut');
        
        // カテゴリ項目のハイライト遷移
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            const isFrom = i === transition.fromIndex;
            const isTo = i === transition.toIndex;
            
            if (isFrom || isTo) {
                const alpha = isFrom ? (1 - progress) : progress;
                const scale = isTo ? (0.95 + progress * 0.05) : 1;
                
                ctx.save();
                ctx.globalAlpha = alpha;
                
                if (scale !== 1) {
                    const itemY = layout.sidebar.y + i * 40;
                    const centerX = layout.sidebar.x + layout.sidebar.width / 2;
                    const centerY = itemY + 20;
                    
                    ctx.translate(centerX, centerY);
                    ctx.scale(scale, scale);
                    ctx.translate(-centerX, -centerY);
                }
                
                // カテゴリ項目の強調描画
                this.renderCategoryHighlight(ctx, layout.sidebar, i);
                
                ctx.restore();
            }
        }

        return true;
    }

    /**
     * 検索遷移の描画効果
     */
    renderSearchTransition(ctx, layout, isSearching) {
        const transition = this.animationManager.getAnimationState('searchTransition');
        if (!transition || !transition.isActive) {
            return false;
        }

        const progress = this.animationManager.applyEasing(transition.progress, 'easeInOut');
        const isEntering = transition.isEntering;
        
        // 検索バーの拡大効果
        ctx.save();
        
        if (isEntering) {
            const scale = 1 + progress * 0.05; // わずかに拡大
            const centerX = layout.searchBar.x + layout.searchBar.width / 2;
            const centerY = layout.searchBar.y + layout.searchBar.height / 2;
            
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);
        }
        
        // グロー効果
        ctx.shadowColor = '#4A90E2';
        ctx.shadowBlur = 10 * progress;
        
        ctx.restore();
        return true;
    }

    renderCategoryHighlight(ctx, sidebarLayout, categoryIndex) {
        const itemY = sidebarLayout.y + categoryIndex * 40;
        
        ctx.fillStyle = 'rgba(74, 144, 226, 0.3)';
        ctx.fillRect(sidebarLayout.x, itemY, sidebarLayout.width, 35);
        
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 2;
        ctx.strokeRect(sidebarLayout.x, itemY, sidebarLayout.width, 35);
    }
}