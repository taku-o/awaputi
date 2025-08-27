/**
 * モバイル向けレスポンシブ共有UI
 * Issue #37 Task 22.3: レスポンシブなリーダーボードUIを実装
 */

export class MobileShareUI {
    constructor(mobileSocialOptimizer, mobileWebShareHandler) {
        this.mobileSocialOptimizer = mobileSocialOptimizer;
        this.mobileWebShareHandler = mobileWebShareHandler;
        
        this.isInitialized = false;
        this.currentDialog = null;
        this.currentBottomSheet = null;
        this.gestureState = null;
        
        // UI設定
        this.config = {
            bottomSheet: {
                dragThreshold: 50,
                closeThreshold: 150,
                animationDuration: 300,
                backdropOpacity: 0.5
            },
            buttons: {
                minTouchSize: 44,
                spacing: 16,
                cornerRadius: 12
            },
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                compact: 480
            }
        };
        
        // テーマ設定
        this.themes = {
            light: {
                background: '#ffffff',
                surface: '#f8f9fa',
                primary: '#007bff',
                text: '#333333',
                border: '#e9ecef'
            },
            dark: {
                background: '#1a1a1a',
                surface: '#2d3748',
                primary: '#4299e1',
                text: '#ffffff',
                border: '#4a5568'
            }
        };
        
        this.currentTheme = 'light';
    }

    /**
     * 初期化
     */
    async initialize() {
        try {
            // CSS スタイルの注入
            this.injectMobileStyles();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // レスポンシブブレークポイントの監視
            this.setupResponsiveObserver();
            
            this.isInitialized = true;
            console.log('MobileShareUI initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize MobileShareUI:', error);
            throw error;
        }
    }

    /**
     * モバイル用スタイルの注入
     */
    injectMobileStyles() {
        const style = document.createElement('style');
        style.id = 'mobile-share-ui-styles';
        style.textContent = `
            /* ボトムシート基本スタイル */
            .mobile-bottom-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--bg-color, #ffffff);
                border-radius: 24px 24px 0 0;
                box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
                transform: translateY(100%);
                transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
                z-index: 1000;
                max-height: 80vh;
                overflow: hidden;
                touch-action: pan-y;
            }
            
            .mobile-bottom-sheet.open {
                transform: translateY(0);
            }
            
            .mobile-bottom-sheet.dragging {
                transition: none;
            }
            
            /* ハンドル */
            .mobile-bottom-sheet-handle {
                width: 40px;
                height: 4px;
                background: var(--border-color, #e9ecef);
                border-radius: 2px;
                margin: 12px auto 8px;
                cursor: grab;
                touch-action: none;
            }
            
            .mobile-bottom-sheet-handle:active {
                cursor: grabbing;
            }
            
            /* コンテンツエリア */
            .mobile-bottom-sheet-content {
                padding: 0 24px 32px;
                max-height: calc(80vh - 32px);
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            /* ヘッダー */
            .mobile-share-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 0;
                border-bottom: 1px solid var(--border-color, #e9ecef);
                margin-bottom: 24px;
            }
            
            .mobile-share-title {
                font-size: 20px;
                font-weight: 600;
                color: var(--text-color, #333333);
                margin: 0;
            }
            
            .mobile-share-close {
                width: 32px;
                height: 32px;
                border: none;
                background: var(--surface-color, #f8f9fa);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-color, #333333);
                touch-action: manipulation;
            }
            
            /* プラットフォームグリッド */
            .mobile-platform-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 16px;
                margin-bottom: 32px;
            }
            
            .mobile-platform-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 16px 8px;
                background: var(--surface-color, #f8f9fa);
                border: none;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 88px;
                touch-action: manipulation;
                position: relative;
                overflow: hidden;
            }
            
            .mobile-platform-button:active {
                transform: scale(0.95);
                background: var(--primary-color, #007bff);
                color: white;
            }
            
            .mobile-platform-icon {
                width: 32px;
                height: 32px;
                margin-bottom: 8px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .mobile-platform-label {
                font-size: 12px;
                font-weight: 500;
                text-align: center;
                color: var(--text-color, #333333);
            }
            
            /* メッセージプレビュー */
            .mobile-message-preview {
                background: var(--surface-color, #f8f9fa);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
            }
            
            .mobile-message-text {
                font-size: 14px;
                line-height: 1.5;
                color: var(--text-color, #333333);
                margin: 0;
            }
            
            .mobile-message-edit {
                margin-top: 12px;
            }
            
            .mobile-message-textarea {
                width: 100%;
                min-height: 80px;
                padding: 12px;
                border: 1px solid var(--border-color, #e9ecef);
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                resize: vertical;
                background: var(--bg-color, #ffffff);
                color: var(--text-color, #333333);
            }
            
            /* アクションボタン */
            .mobile-action-buttons {
                display: flex;
                gap: 12px;
            }
            
            .mobile-action-button {
                flex: 1;
                height: 48px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                touch-action: manipulation;
            }
            
            .mobile-action-button.primary {
                background: var(--primary-color, #007bff);
                color: white;
            }
            
            .mobile-action-button.secondary {
                background: var(--surface-color, #f8f9fa);
                color: var(--text-color, #333333);
            }
            
            .mobile-action-button:active {
                transform: scale(0.98);
            }
            
            /* バックドロップ */
            .mobile-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0);
                transition: background 0.3s ease;
                z-index: 999;
                pointer-events: none;
            }
            
            .mobile-backdrop.visible {
                background: rgba(0, 0, 0, 0.5);
                pointer-events: all;
            }
            
            /* スクリーンショットプレビュー */
            .mobile-screenshot-preview {
                width: 100%;
                max-width: 200px;
                height: auto;
                border-radius: 8px;
                margin: 16px auto;
                display: block;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            /* レスポンシブ調整 */
            @media (max-width: 480px) {
                .mobile-bottom-sheet {
                    border-radius: 20px 20px 0 0;
                }
                
                .mobile-bottom-sheet-content {
                    padding: 0 16px 24px;
                }
                
                .mobile-platform-grid {
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }
                
                .mobile-platform-button {
                    padding: 12px 4px;
                    min-height: 72px;
                }
                
                .mobile-platform-icon {
                    width: 28px;
                    height: 28px;
                    font-size: 16px;
                }
                
                .mobile-platform-label {
                    font-size: 11px;
                }
            }
            
            @media (max-width: 360px) {
                .mobile-platform-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            
            /* 横向き対応 */
            @media (orientation: landscape) and (max-height: 500px) {
                .mobile-bottom-sheet {
                    max-height: 90vh;
                    border-radius: 16px 16px 0 0;
                }
                
                .mobile-bottom-sheet-content {
                    padding: 0 16px 16px;
                }
                
                .mobile-share-header {
                    padding: 8px 0 12px;
                    margin-bottom: 16px;
                }
                
                .mobile-platform-grid {
                    margin-bottom: 16px;
                }
                
                .mobile-message-preview {
                    margin-bottom: 16px;
                }
            }
            
            /* ダークテーマ */
            .mobile-share-ui.dark {
                --bg-color: #1a1a1a;
                --surface-color: #2d3748;
                --primary-color: #4299e1;
                --text-color: #ffffff;
                --border-color: #4a5568;
            }
            
            /* アクセシビリティ */
            .mobile-platform-button:focus {
                outline: 2px solid var(--primary-color, #007bff);
                outline-offset: 2px;
            }
            
            .mobile-action-button:focus {
                outline: 2px solid var(--primary-color, #007bff);
                outline-offset: 2px;
            }
            
            /* 高コントラストモード */
            @media (prefers-contrast: high) {
                .mobile-platform-button {
                    border: 2px solid var(--text-color, #333333);
                }
                
                .mobile-action-button.secondary {
                    border: 2px solid var(--text-color, #333333);
                }
            }
            
            /* アニメーション削減 */
            @media (prefers-reduced-motion: reduce) {
                .mobile-bottom-sheet,
                .mobile-platform-button,
                .mobile-action-button,
                .mobile-backdrop {
                    transition: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // 画面向き変更
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 100);
        });
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentBottomSheet) {
                this.closeBottomSheet();
            }
        });
    }

    /**
     * レスポンシブ監視の設定
     */
    setupResponsiveObserver() {
        // ブレークポイント監視
        const mobileQuery = window.matchMedia(`(max-width: ${this.config.breakpoints.mobile}px)`);
        const compactQuery = window.matchMedia(`(max-width: ${this.config.breakpoints.compact}px)`);
        
        mobileQuery.addListener(() => this.handleBreakpointChange());
        compactQuery.addListener(() => this.handleBreakpointChange());
    }

    /**
     * 共有ダイアログの表示
     */
    async showShareDialog(shareData) {
        try {
            // 既存のダイアログを閉じる
            if (this.currentBottomSheet) {
                await this.closeBottomSheet();
            }

            // ダイアログタイプを決定
            const isMobile = window.innerWidth <= this.config.breakpoints.mobile;
            
            if (isMobile) {
                return await this.showMobileBottomSheet(shareData);
            } else {
                return await this.showTabletDialog(shareData);
            }
            
        } catch (error) {
            console.error('Failed to show share dialog:', error);
            throw error;
        }
    }

    /**
     * モバイル用ボトムシートの表示
     */
    async showMobileBottomSheet(shareData) {
        // バックドロップの作成
        const backdrop = this.createBackdrop();
        document.body.appendChild(backdrop);

        // ボトムシートの作成
        const bottomSheet = this.createBottomSheet(shareData);
        document.body.appendChild(bottomSheet);

        this.currentBottomSheet = bottomSheet;

        // アニメーション開始
        await this.animateBottomSheetOpen(backdrop, bottomSheet);

        // ジェスチャーハンドラーの設定
        this.setupBottomSheetGestures(bottomSheet);

        return new Promise((resolve) => {
            bottomSheet.addEventListener('share-complete', (e) => {
                resolve(e.detail);
            });
            
            bottomSheet.addEventListener('share-cancel', () => {
                resolve({ cancelled: true });
            });
        });
    }

    /**
     * タブレット用ダイアログの表示
     */
    async showTabletDialog(shareData) {
        // 中央表示のダイアログを作成
        const dialog = this.createTabletDialog(shareData);
        document.body.appendChild(dialog);

        this.currentDialog = dialog;

        return new Promise((resolve) => {
            dialog.addEventListener('share-complete', (e) => {
                resolve(e.detail);
            });
            
            dialog.addEventListener('share-cancel', () => {
                resolve({ cancelled: true });
            });
        });
    }

    /**
     * バックドロップの作成
     */
    createBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.className = 'mobile-backdrop';
        
        backdrop.addEventListener('click', () => {
            this.closeBottomSheet();
        });
        
        return backdrop;
    }

    /**
     * ボトムシートの作成
     */
    createBottomSheet(shareData) {
        const bottomSheet = document.createElement('div');
        bottomSheet.className = 'mobile-bottom-sheet';
        bottomSheet.innerHTML = `
            <div class="mobile-bottom-sheet-handle"></div>
            <div class="mobile-bottom-sheet-content">
                ${this.createShareContent(shareData)}
            </div>
        `;

        // イベントハンドラーの設定
        this.setupBottomSheetEvents(bottomSheet, shareData);

        return bottomSheet;
    }

    /**
     * タブレットダイアログの作成
     */
    createTabletDialog(shareData) {
        const dialog = document.createElement('div');
        dialog.className = 'mobile-share-dialog tablet';
        dialog.innerHTML = `
            <div class="mobile-share-dialog-content">
                ${this.createShareContent(shareData)}
            </div>
        `;

        this.setupDialogEvents(dialog, shareData);

        return dialog;
    }

    /**
     * 共有コンテンツの作成
     */
    createShareContent(shareData) {
        const platforms = this.getAvailablePlatforms();
        const previewMessage = this.generatePreviewMessage(shareData);

        return `
            <div class="mobile-share-header">
                <h2 class="mobile-share-title">共有</h2>
                <button class="mobile-share-close" aria-label="閉じる">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
                    </svg>
                </button>
            </div>

            <div class="mobile-platform-grid">
                ${platforms.map(platform => this.createPlatformButton(platform)).join('')}
            </div>

            <div class="mobile-message-preview">
                <p class="mobile-message-text">${previewMessage}</p>
                <div class="mobile-message-edit">
                    <textarea 
                        class="mobile-message-textarea" 
                        placeholder="メッセージをカスタマイズ..."
                        maxlength="280"
                    >${previewMessage}</textarea>
                </div>
            </div>

            ${shareData.screenshot ? `
                <img 
                    class="mobile-screenshot-preview" 
                    src="${shareData.screenshot}" 
                    alt="スクリーンショット"
                />
            ` : ''}

            <div class="mobile-action-buttons">
                <button class="mobile-action-button secondary">キャンセル</button>
                <button class="mobile-action-button primary">共有</button>
            </div>
        `;
    }

    /**
     * 利用可能プラットフォームの取得
     */
    getAvailablePlatforms() {
        const platforms = [
            {
                id: 'native',
                name: 'デバイス共有',
                icon: '📱',
                available: this.mobileWebShareHandler?.isSupported || false
            },
            {
                id: 'twitter',
                name: 'Twitter',
                icon: '🐦',
                available: true
            },
            {
                id: 'facebook',
                name: 'Facebook',
                icon: '📘',
                available: true
            },
            {
                id: 'line',
                name: 'LINE',
                icon: '💬',
                available: true
            },
            {
                id: 'whatsapp',
                name: 'WhatsApp',
                icon: '💬',
                available: true
            },
            {
                id: 'email',
                name: 'メール',
                icon: '📧',
                available: true
            },
            {
                id: 'copy',
                name: 'コピー',
                icon: '📋',
                available: 'clipboard' in navigator
            },
            {
                id: 'more',
                name: 'その他',
                icon: '⋯',
                available: true
            }
        ];

        return platforms.filter(platform => platform.available);
    }

    /**
     * プラットフォームボタンの作成
     */
    createPlatformButton(platform) {
        return `
            <button 
                class="mobile-platform-button" 
                data-platform="${platform.id}"
                aria-label="${platform.name}で共有"
            >
                <div class="mobile-platform-icon">${platform.icon}</div>
                <div class="mobile-platform-label">${platform.name}</div>
            </button>
        `;
    }

    /**
     * プレビューメッセージの生成
     */
    generatePreviewMessage(shareData) {
        if (shareData.type === 'score') {
            return `BubblePopで${shareData.score.toLocaleString()}点を達成！ #BubblePop`;
        } else if (shareData.type === 'achievement') {
            return `BubblePopで実績「${shareData.achievement.name}」を解除！ #BubblePop`;
        } else if (shareData.type === 'challenge') {
            return `BubblePopでチャレンジ「${shareData.challenge.name}」を完了！ #BubblePop`;
        } else {
            return `BubblePopをプレイ中！ #BubblePop`;
        }
    }

    /**
     * ボトムシートイベントの設定
     */
    setupBottomSheetEvents(bottomSheet, shareData) {
        // 閉じるボタン
        const closeButton = bottomSheet.querySelector('.mobile-share-close');
        closeButton.addEventListener('click', () => {
            this.closeBottomSheet();
            bottomSheet.dispatchEvent(new CustomEvent('share-cancel'));
        });

        // プラットフォームボタン
        const platformButtons = bottomSheet.querySelectorAll('.mobile-platform-button');
        platformButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handlePlatformSelection(e.target.closest('.mobile-platform-button'), shareData, bottomSheet);
            });
        });

        // アクションボタン
        const cancelButton = bottomSheet.querySelector('.mobile-action-button.secondary');
        const shareButton = bottomSheet.querySelector('.mobile-action-button.primary');

        cancelButton.addEventListener('click', () => {
            this.closeBottomSheet();
            bottomSheet.dispatchEvent(new CustomEvent('share-cancel'));
        });

        shareButton.addEventListener('click', () => {
            this.handleGenericShare(shareData, bottomSheet);
        });

        // メッセージ編集
        const textarea = bottomSheet.querySelector('.mobile-message-textarea');
        textarea.addEventListener('input', (e) => {
            shareData.customMessage = e.target.value;
        });
    }

    /**
     * ボトムシートジェスチャーの設定
     */
    setupBottomSheetGestures(bottomSheet) {
        const handle = bottomSheet.querySelector('.mobile-bottom-sheet-handle');
        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const startDrag = (y) => {
            startY = y;
            currentY = y;
            isDragging = true;
            bottomSheet.classList.add('dragging');
        };

        const updateDrag = (y) => {
            if (!isDragging) return;
            
            currentY = y;
            const deltaY = Math.max(0, currentY - startY);
            bottomSheet.style.transform = `translateY(${deltaY}px)`;
        };

        const endDrag = () => {
            if (!isDragging) return;
            
            isDragging = false;
            bottomSheet.classList.remove('dragging');
            
            const deltaY = currentY - startY;
            
            if (deltaY > this.config.bottomSheet.closeThreshold) {
                this.closeBottomSheet();
            } else {
                bottomSheet.style.transform = 'translateY(0)';
            }
        };

        // タッチイベント
        handle.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientY);
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                updateDrag(e.touches[0].clientY);
            }
        }, { passive: false });

        document.addEventListener('touchend', endDrag, { passive: true });

        // マウスイベント（デスクトップ対応）
        handle.addEventListener('mousedown', (e) => {
            startDrag(e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateDrag(e.clientY);
            }
        });

        document.addEventListener('mouseup', endDrag);
    }

    /**
     * プラットフォーム選択処理
     */
    async handlePlatformSelection(button, shareData, container) {
        const platform = button.dataset.platform;
        
        try {
            // ハプティックフィードバック
            if (this.mobileSocialOptimizer?.triggerHapticFeedback) {
                this.mobileSocialOptimizer.triggerHapticFeedback('light');
            }

            let result;
            switch (platform) {
                case 'native':
                    result = await this.shareViaNative(shareData);
                    break;
                case 'twitter':
                    result = await this.shareViaTwitter(shareData);
                    break;
                case 'facebook':
                    result = await this.shareViaFacebook(shareData);
                    break;
                case 'copy':
                    result = await this.shareViaCopy(shareData);
                    break;
                default:
                    result = await this.shareViaGeneric(platform, shareData);
            }

            if (result.success) {
                await this.closeBottomSheet();
                container.dispatchEvent(new CustomEvent('share-complete', { detail: result }));
            }

        } catch (error) {
            console.error(`Failed to share via ${platform}:`, error);
            this.showErrorMessage(`${platform}での共有に失敗しました。`);
        }
    }

    /**
     * ネイティブ共有
     */
    async shareViaNative(shareData) {
        return await this.mobileWebShareHandler.share(shareData);
    }

    /**
     * Twitter共有
     */
    async shareViaTwitter(shareData) {
        const text = shareData.customMessage || this.generatePreviewMessage(shareData);
        const url = shareData.url || window.location.href;
        const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        
        window.open(twitterURL, '_blank', 'width=550,height=420');
        return { success: true, platform: 'twitter' };
    }

    /**
     * Facebook共有
     */
    async shareViaFacebook(shareData) {
        const url = shareData.url || window.location.href;
        const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        
        window.open(facebookURL, '_blank', 'width=550,height=420');
        return { success: true, platform: 'facebook' };
    }

    /**
     * コピー共有
     */
    async shareViaCopy(shareData) {
        const text = shareData.customMessage || this.generatePreviewMessage(shareData);
        const url = shareData.url || window.location.href;
        const copyText = `${text}\n${url}`;
        
        await navigator.clipboard.writeText(copyText);
        this.showSuccessMessage('クリップボードにコピーしました');
        
        return { success: true, platform: 'copy' };
    }

    /**
     * ボトムシートアニメーション（開く）
     */
    async animateBottomSheetOpen(backdrop, bottomSheet) {
        // バックドロップフェードイン
        requestAnimationFrame(() => {
            backdrop.classList.add('visible');
        });

        // ボトムシートスライドアップ
        await new Promise(resolve => {
            setTimeout(() => {
                bottomSheet.classList.add('open');
                setTimeout(resolve, this.config.bottomSheet.animationDuration);
            }, 50);
        });
    }

    /**
     * ボトムシートを閉じる
     */
    async closeBottomSheet() {
        if (!this.currentBottomSheet) return;

        const backdrop = document.querySelector('.mobile-backdrop');
        const bottomSheet = this.currentBottomSheet;

        // アニメーション
        bottomSheet.classList.remove('open');
        if (backdrop) {
            backdrop.classList.remove('visible');
        }

        // 要素を削除
        setTimeout(() => {
            if (bottomSheet.parentNode) {
                bottomSheet.parentNode.removeChild(bottomSheet);
            }
            if (backdrop && backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
        }, this.config.bottomSheet.animationDuration);

        this.currentBottomSheet = null;
    }

    /**
     * 成功メッセージの表示
     */
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    /**
     * エラーメッセージの表示
     */
    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    /**
     * トースト通知の表示
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `mobile-toast mobile-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#333333'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10001;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: calc(100vw - 40px);
            text-align: center;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * 画面向き変更処理
     */
    handleOrientationChange() {
        if (this.currentBottomSheet) {
            // ボトムシートの高さを再計算
            this.adjustBottomSheetHeight();
        }
    }

    /**
     * リサイズ処理
     */
    handleResize() {
        if (this.currentBottomSheet) {
            this.adjustBottomSheetHeight();
        }
    }

    /**
     * ブレークポイント変更処理
     */
    handleBreakpointChange() {
        // 必要に応じてUIを再構築
        if (this.currentBottomSheet || this.currentDialog) {
            // 現在の状態を保存して再作成
        }
    }

    /**
     * ボトムシートの高さ調整
     */
    adjustBottomSheetHeight() {
        if (!this.currentBottomSheet) return;

        const maxHeight = Math.min(window.innerHeight * 0.8, 600);
        this.currentBottomSheet.style.maxHeight = `${maxHeight}px`;
    }

    /**
     * テーマの設定
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.body.classList.toggle('mobile-share-ui', true);
        document.body.classList.toggle('dark', theme === 'dark');
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.currentBottomSheet) {
            this.closeBottomSheet();
        }

        if (this.currentDialog) {
            this.currentDialog.remove();
            this.currentDialog = null;
        }

        const style = document.getElementById('mobile-share-ui-styles');
        if (style) {
            style.remove();
        }

        this.isInitialized = false;
    }
}