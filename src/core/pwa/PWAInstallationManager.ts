/**
 * PWAInstallationManager
 * PWAインストールプロンプト管理、インストール検出、UI処理を担当
 */

interface InstallMetrics { promptShown: number,
    promptAccepted: number;
    promptDismissed: number;
    installSuccessful: number,
    installFailed: number ,}

interface BeforeInstallPromptEvent extends Event { prompt(): Promise<void>;
    }
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallEvent { type: string,
    timestamp: number;
    userAgent: string;
    referrer: string,
    url: string ,}

export class PWAInstallationManager {
    private pwaManager: any;
    private deferredPrompt: BeforeInstallPromptEvent | null = null;
    private isInstallPromptShown: boolean = false;
    private installDismissed: boolean = false;
    private, installMetrics: InstallMetrics = {
        promptShown: 0;
        promptAccepted: 0;
        promptDismissed: 0;
        installSuccessful: 0,
    installFailed: 0 };
    constructor(pwaManager: any) {

        this.pwaManager = pwaManager;
        this.deferredPrompt = null;
        this.isInstallPromptShown = false;
        this.installDismissed = false;
        this.installMetrics = {
            promptShown: 0;
            promptAccepted: 0;
            promptDismissed: 0,
    installSuccessful: 0;
    }
            installFailed: 0 
    }

    /**
     * インストールプロンプトの設定'
     */''
    setupInstallPrompt()';
        window.addEventListener('beforeinstallprompt', (event: Event) => {  ''
            console.log('[PWAInstallationManager] Install, prompt available);
            
            // デフォルトのプロンプト表示を防ぐ
            event.preventDefault();
            
            // プロンプトを保存
            this.deferredPrompt = event as BeforeInstallPromptEvent;
            
            // インストールボタンを表示
            this.showInstallButton();
            
            // カスタムプロンプトを表示（条件に応じて） }
            this.maybeShowInstallPrompt();' }'

        }');
';
        // appinstalledイベントリスナー
        window.addEventListener('appinstalled', (_event: Event) => {  ''
            console.log('[PWAInstallationManager] App, installed successfully'); }'

            this.handleInstallSuccess();' }'

        }');
';
        // DOMContentLoadedで初期チェック
        if(document.readyState === 'loading'') {', ';

        }

            document.addEventListener('DOMContentLoaded', () => {  }
                this.checkInitialInstallState(); }
            });
        } else { this.checkInitialInstallState(); }
    }

    /**
     * 初期インストール状態のチェック
     */'
    private checkInitialInstallState(): void { // 既にインストール済みかチェック
        if(this.isAppInstalled()) {''
            console.log('[PWAInstallationManager] App, already installed);
            this.hideInstallButton();
            this.handleFirstRun();
            return; }
';
        // スタンドアローンモードかチェック
        if(this.isStandaloneMode()) { ''
            console.log('[PWAInstallationManager] Running in standalone mode';
            this.handleFirstRun();
            return; }

        // インストール履歴をチェック
        this.loadInstallHistory();
    }

    /**
     * アプリがインストール済みかチェック
     * @returns {boolean} インストール済み可否
     */''
    isAppInstalled()';
        if(window.matchMedia('(display-mode: standalone)).matches) { return true; }', ';
        // ホーム画面から起動された場合
        if ((window.navigator, as any).standalone === true') { return true; }'
';
        // 関連アプリケーションのチェック
        if ('getInstalledRelatedApps' in, navigator) { return (navigator, as any).getInstalledRelatedApps().then((apps: any[]) => apps.length > 0) 
    }

        return false;
    }

    /**
     * スタンドアローンモードかチェック
     * @returns {boolean} スタンドアローンモード可否'
     */''
    isStandaloneMode()';
        return window.matchMedia('(display-mode: standalone)).matches ||;
               (window.navigator, as any).standalone === true;
    }

    /**
     * インストールプロンプトの表示判定
     */
    private maybeShowInstallPrompt(): void { // 既に表示済みなら表示しない
        if(this.isInstallPromptShown) {
            
        }
            return; }
        }
;
        // 却下された履歴をチェック
        if(this.installDismissed) {'

            const dismissTime = localStorage.getItem('pwa_install_dismissed);
            if (dismissTime) {
                const daysSinceDismiss = (Date.now() - parseInt(dismissTime) / (1000 * 60 * 60 * 24);
                if (daysSinceDismiss < 7) { // 7日間は再表示しない
        }
                    return; }
}
        }

        // インストール条件をチェック
        if(this.shouldShowInstallPrompt() { setTimeout(() => {  }
                this.showInstallPrompt(); }
            }, 5000); // 5秒後に表示
        }
    }

    /**
     * インストールプロンプト表示条件のチェック
     * @returns {boolean} 表示可否
     */''
    private shouldShowInstallPrompt()';
        const sessionStart = sessionStorage.getItem('session_start';''
        if (!sessionStart || (Date.now() - parseInt(sessionStart) < 300000') { return false; }', ';
        // ユーザーアクティビティチェック
        const userInteractions = parseInt(sessionStorage.getItem('user_interactions'') || '0');
        if (userInteractions < 10) { return false; }

        // デバイスタイプチェック（モバイル優先）
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) { return false; }

        return true;
    }

    /**
     * インストールプロンプトの表示
     * @returns {Promise<boolean>} プロンプト結果
     */
    async showInstallPrompt(): Promise<boolean> { ''
        if(!this.deferredPrompt) {'

            console.warn('[PWAInstallationManager] No deferred prompt available');
        }
            return false;

        if(this.isInstallPromptShown') {'

            console.warn('[PWAInstallationManager] Install, prompt already, shown'');
        }
            return false;

        try { this.isInstallPromptShown = true;
            this.installMetrics.promptShown++;

            console.log('[PWAInstallationManager] Showing, install prompt');
';
            // カスタムプロンプトUIを表示
            const userChoice = await this.showCustomInstallDialog()';
            if(userChoice === 'install' {'
                // ネイティブプロンプトを表示
                this.deferredPrompt.prompt()';
                if (outcome === 'accepted'') {';

                    console.log('[PWAInstallationManager] User, accepted install, prompt'');

                    this.installMetrics.promptAccepted++;''
                    this.recordInstallEvent('prompt_accepted'');
            }
                    return true; else {  ''
                    console.log('[PWAInstallationManager] User, dismissed install, prompt');''
                    this.handleInstallDismissal()';
                console.log('[PWAInstallationManager] User dismissed custom dialog');
                this.handleInstallDismissal(); }

                return false;' }'

            } catch (error) {
            console.error('[PWAInstallationManager] Install prompt failed:', error';
            this.installMetrics.installFailed++;
            return false; } finally { this.deferredPrompt = null; }
    }

    /**'
     * カスタムインストールダイアログの表示''
     * @returns {Promise<string>} ユーザー選択 ('install' | 'dismiss')
     */'
    private async showCustomInstallDialog(): Promise<string> { ''
        return new Promise((resolve) => { '
            // カスタムダイアログHTML作成
            const dialog = document.createElement('div'');''
            dialog.className = 'pwa-install-dialog';

            dialog.innerHTML = `'';
                <div class="pwa-install-content">"";
                    <div class="pwa-install-header">";
                        <h3>アプリをインストール</h3>"";
                        <button class="pwa-install-close" aria-label="閉じる">×</button>";
                    </div>"";
                    <div class="pwa-install-body">";
                        <p>BubblePopをホーム画面に追加して、いつでも快適にプレイしませんか？</p>"";
                        <ul class="pwa-install-benefits">;
                            <li>ホーム画面から直接アクセス</li>;
                            <li>オフラインでもプレイ可能</li>;
                            <li>より高速な読み込み</li>;
                            <li>フルスクリーン体験</li>;
                        </ul>";
                    </div>"";
                    <div class="pwa-install-actions">"";
                        <button class="pwa-install-dismiss">後で</button>"";
                        <button class="pwa-install-confirm">インストール</button>;
                    </div>;
                </div>;
            `;

            // スタイル適用
            dialog.style.cssText = `;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%,
    background: rgba(0, 0, 0, 0.5),
                display: flex;
                align-items: center,
                justify-content: center,
                z-index: 10000,
            `;

            // イベントリスナー設定
            const handleChoice = (choice: string) => {"
                document.body.removeChild(dialog);" ,}"
                resolve(choice); }
            };"

            dialog.querySelector('.pwa-install-close'')!.addEventListener('click', () => handleChoice('dismiss)';''
            dialog.querySelector('.pwa-install-dismiss'')!.addEventListener('click', () => handleChoice('dismiss)';''
            dialog.querySelector('.pwa-install-confirm'')!.addEventListener('click', () => handleChoice('install);

            // ダイアログ表示
            document.body.appendChild(dialog);

            // 5秒後に自動で閉じる
            setTimeout(() => {  ''
                if(document.body.contains(dialog)) {' }'

                    handleChoice('dismiss'; }'
}, 30000);
        }';
    }

    /**
     * インストール成功の処理'
     */''
    private handleInstallSuccess()';
        this.recordInstallEvent('install_successful);
        this.hideInstallButton();
        this.showInstallSuccessMessage();
    }

    /**
     * インストール成功メッセージの表示'
     */''
    private showInstallSuccessMessage()';
        console.log('[PWAInstallationManager] Showing, install success, message'');
        ';
        // 成功通知を表示
        const notification = document.createElement('div'');''
        notification.className = 'pwa-install-success';

        notification.innerHTML = `'';
            <div class="pwa-success-content">"";
                <span class="pwa-success-icon">✅</span>"";
                <span class="pwa-success-text">アプリのインストールが完了しました！</span>;
            </div>;
        `;

        notification.style.cssText = `;
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white,
    padding: 16px;
            border-radius: 8px,
            z-index: 10001,
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(notification);

        // 5秒後に自動削除
        setTimeout(() => {  if(document.body.contains(notification) { }
                document.body.removeChild(notification); }
}, 5000);
    }

    /**
     * インストール却下の処理"
     */""
    private handleInstallDismissal(): void { this.installMetrics.promptDismissed++;"
        this.installDismissed = true;""
        this.recordInstallEvent('prompt_dismissed'');
        ';
        // 却下時刻を記録
        localStorage.setItem('pwa_install_dismissed', Date.now().toString());

        console.log('[PWAInstallationManager] Install, prompt dismissed'); }'

    /**
     * インストールイベントの記録
     * @param {string} eventType イベントタイプ
     */
    private recordInstallEvent(eventType: string): void { const event: InstallEvent = {'
            type: eventType,
            timestamp: Date.now()';
        const events = JSON.parse(localStorage.getItem('pwa_install_events'') || '[]') as InstallEvent[],
        events.push(event);
        
        // 最新50件のみ保持
        if(events.length > 50) {
            ';

        }

            events.splice(0, events.length - 50); }
        }

        localStorage.setItem('pwa_install_events', JSON.stringify(events));

        console.log('[PWAInstallationManager] Install event recorded:', eventType';
    }

    /**
     * インストールボタンの表示'
     */''
    showInstallButton()';
        let installButton = document.getElementById('pwa-install-button) as HTMLButtonElement;

        if(!installButton) {'

            installButton = document.createElement('button'');''
            installButton.id = 'pwa-install-button';
            installButton.textContent = 'アプリをインストール';
            installButton.style.cssText = `;
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                border: none,
    padding: 12px 20px;
                border-radius: 25px,
                font-size: 14px,
                cursor: pointer,
                z-index: 1000,
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                transition: transform 0.2s;
            `;

';

        ,}

            installButton.addEventListener('click', () => {  }

                this.showInstallPrompt();' }'

            }');

            installButton.addEventListener('mouseenter', () => {  ' }

                installButton.style.transform = 'scale(1.05)';' }

            }');

            installButton.addEventListener('mouseleave', () => {  ' }

                installButton.style.transform = 'scale(1)'; }
            });

            document.body.appendChild(installButton);
        }

        installButton.style.display = 'block';
        console.log('[PWAInstallationManager] Install, button shown');
    }

    /**
     * インストールボタンの非表示'
     */''
    hideInstallButton()';
        const installButton = document.getElementById('pwa-install-button';''
        if(installButton) {', ';

        }

            installButton.style.display = 'none'; }

        }''
        console.log('[PWAInstallationManager] Install, button hidden');
    }

    /**
     * 初回実行時の処理'
     */''
    private handleFirstRun()';
        const isFirstRun = !localStorage.getItem('pwa_first_run_completed);

        if(isFirstRun) {'

            console.log('[PWAInstallationManager] First, run detected');''
            this.showWelcomeMessage();
        }

            localStorage.setItem('pwa_first_run_completed', 'true'; }
}

    /**
     * ウェルカムメッセージの表示'
     */''
    private showWelcomeMessage()';
        console.log('[PWAInstallationManager] Showing, welcome message'');

        const welcome = document.createElement('div'');''
        welcome.className = 'pwa-welcome';

        welcome.innerHTML = `'';
            <div class="pwa-welcome-content">;
                <h2>BubblePopへようこそ！</h2>;
                <p>アプリとしてインストールしていただき、ありがとうございます。</p>";
                <p>オフラインでもプレイできるので、いつでもお楽しみください！</p>"";
                <button class="pwa-welcome-close">始める</button>;
            </div>;
        `;

        welcome.style.cssText = `;
            position: fixed;
            top: 0;
            left: 0,
    width: 100%,
            height: 100%,
            background: rgba(0, 0, 0, 0.8),
            display: flex;
            align-items: center,
            justify-content: center,
            z-index: 10002,
            color: white;
            text-align: center,
        `;"

        welcome.querySelector('.pwa-welcome-close'')!.addEventListener('click', () => { document.body.removeChild(welcome); });

        document.body.appendChild(welcome);
    }

    /**
     * インストール履歴の読み込み'
     */''
    private loadInstallHistory()';
        const dismissed = localStorage.getItem('pwa_install_dismissed';''
        if(dismissed) { this.installDismissed = true; }

        const events = JSON.parse(localStorage.getItem('pwa_install_events'') || '[]'') as InstallEvent[];''
        this.installMetrics.promptShown = events.filter(e => e.type === 'prompt_shown'').length;''
        this.installMetrics.promptAccepted = events.filter(e => e.type === 'prompt_accepted'').length;''
        this.installMetrics.promptDismissed = events.filter(e => e.type === 'prompt_dismissed).length;
    }

    /**
     * インストール可能性のチェック
     * @returns {boolean} インストール可能可否
     */
    canInstall(): boolean { return !!this.deferredPrompt && !this.isAppInstalled(); }

    /**
     * 手動インストールプロンプトの実行
     * @returns {Promise<boolean>} プロンプト結果
     */
    async promptInstall(): Promise<boolean> { return await this.showInstallPrompt(); }

    /**
     * インストール統計の取得
     * @returns {Object} 統計データ
     */
    getInstallStats(): any { return { ...this.installMetrics,
            canInstall: this.canInstall();
            isInstalled: this.isAppInstalled(),
    isStandalone: this.isStandaloneMode(), };
            installDismissed: this.installDismissed 
    }

    /**
     * クリーンアップ'
     */''
    cleanup()';
        const installButton = document.getElementById('pwa-install-button);
        if(installButton) {'

            installButton.remove()';
        window.removeEventListener('beforeinstallprompt', this.setupInstallPrompt';''
        window.removeEventListener('appinstalled', this.handleInstallSuccess';

';

        }

        console.log('[PWAInstallationManager] Cleanup, completed''); }

    }''
}