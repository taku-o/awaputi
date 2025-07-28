/**
 * ScreenReaderSimulator - スクリーンリーダー動作シミュレーター
 * 主要プラットフォームのスクリーンリーダー互換性テスト
 * ARIA属性検証とアナウンステスト機能
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class ScreenReaderSimulator {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // スクリーンリーダー設定
        this.config = {
            enabled: true,
            simulationMode: true,
            verbosityLevel: 'normal', // minimal, normal, verbose
            speechRate: 180, // words per minute
            announceChanges: true,
            announceInteractions: true,
            validateAria: true
        };
        
        // サポートするスクリーンリーダー
        this.screenReaders = {
            nvda: {
                name: 'NVDA',
                platform: 'Windows',
                version: '2023.1',
                features: {
                    browseMode: true,
                    focusMode: true,
                    liveRegions: true,
                    tableNavigation: true,
                    landmarkNavigation: true,
                    headingNavigation: true
                },
                shortcuts: {
                    nextHeading: 'H',
                    nextLandmark: 'D',
                    nextButton: 'B',
                    nextLink: 'K',
                    readAll: 'Ctrl+Shift+Down'
                }
            },
            jaws: {
                name: 'JAWS',
                platform: 'Windows',
                version: '2023',
                features: {
                    browseMode: true,
                    formsMode: true,
                    liveRegions: true,
                    tableNavigation: true,
                    landmarkNavigation: true,
                    headingNavigation: true
                },
                shortcuts: {
                    nextHeading: 'H',
                    nextLandmark: 'R',
                    nextButton: 'B',
                    nextLink: 'K',
                    readAll: 'Ctrl+Home'
                }
            },
            voiceOver: {
                name: 'VoiceOver',
                platform: 'macOS/iOS',
                version: '13.0',
                features: {
                    quickNav: true,
                    rotorControl: true,
                    liveRegions: true,
                    tableNavigation: true,
                    landmarkNavigation: true,
                    headingNavigation: true
                },
                shortcuts: {
                    nextHeading: 'VO+Cmd+H',
                    nextLandmark: 'VO+U+L',
                    nextButton: 'VO+Cmd+B',
                    nextLink: 'VO+Cmd+L',
                    readAll: 'VO+A'
                }
            },
            talkback: {
                name: 'TalkBack',
                platform: 'Android',
                version: '13.1',
                features: {
                    exploreByTouch: true,
                    linearNavigation: true,
                    liveRegions: true,
                    headingNavigation: true,
                    controlNavigation: true
                },
                shortcuts: {
                    nextHeading: 'swipe+H',
                    nextControl: 'swipe+C',
                    readAll: 'swipe+down+right'
                }
            }
        };
        
        // 現在のシミュレーション状態
        this.state = {
            currentReader: 'nvda',
            readingMode: 'browse', // browse, focus, forms
            currentPosition: null,
            readingQueue: [],
            isReading: false,
            focusHistory: [],
            interactionLog: []
        };
        
        // ARIA属性マッピング
        this.ariaMapping = {
            roles: {
                button: 'ボタン',
                link: 'リンク',
                heading: '見出し',
                list: 'リスト',
                listitem: 'リスト項目',
                table: 'テーブル',
                row: '行',
                cell: 'セル',
                dialog: 'ダイアログ',
                alert: 'アラート',
                status: 'ステータス',
                progressbar: 'プログレスバー',
                slider: 'スライダー',
                checkbox: 'チェックボックス',
                radio: 'ラジオボタン',
                tab: 'タブ',
                tabpanel: 'タブパネル',
                menuitem: 'メニュー項目',
                navigation: 'ナビゲーション',
                main: 'メイン',
                banner: 'バナー',
                contentinfo: 'コンテンツ情報',
                complementary: '補完情報',
                search: '検索'
            },
            states: {
                'aria-expanded': {
                    'true': '展開済み',
                    'false': '折りたたみ済み'
                },
                'aria-checked': {
                    'true': 'チェック済み',
                    'false': 'チェックなし',
                    'mixed': '部分的にチェック済み'
                },
                'aria-selected': {
                    'true': '選択済み',
                    'false': '選択されていません'
                },
                'aria-pressed': {
                    'true': '押下済み',
                    'false': '押下されていません'
                },
                'aria-disabled': {
                    'true': '無効',
                    'false': '有効'
                }
            },
            properties: {
                'aria-label': 'アクセシブル名',
                'aria-labelledby': '見出し参照',
                'aria-describedby': '説明参照',
                'aria-live': 'ライブリージョン',
                'aria-atomic': '完全読み上げ',
                'aria-relevant': '関連変更',
                'aria-level': 'レベル',
                'aria-setsize': 'セットサイズ',
                'aria-posinset': 'セット内位置'
            }
        };
        
        // 読み上げ結果とテスト結果
        this.results = {
            announcements: [],
            ariaValidation: {
                passed: [],
                failed: [],
                warnings: []
            },
            compatibility: {
                nvda: { score: 0, issues: [] },
                jaws: { score: 0, issues: [] },
                voiceOver: { score: 0, issues: [] },
                talkback: { score: 0, issues: [] }
            },
            navigationTests: {
                headingNavigation: null,
                landmarkNavigation: null,
                focusManagement: null,
                keyboardTrapping: null
            }
        };
        
        // パフォーマンス監視
        this.performance = {
            simulationTime: [],
            announcementLatency: [],
            ariaValidationTime: []
        };
        
        // 統計情報
        this.stats = {
            totalSimulations: 0,
            totalAnnouncements: 0,
            ariaIssuesFound: 0,
            compatibilityScore: 0,
            sessionStart: Date.now()
        };
        
        console.log('ScreenReaderSimulator initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            this.setupEventListeners();
            this.initializeSimulation();
            this.loadSimulationHistory();
            
            console.log('ScreenReaderSimulator initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'SCREEN_READER_SIMULATOR_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * 包括的スクリーンリーダーシミュレーション実行
     */
    async runFullSimulation(readerType = 'all') {
        const startTime = performance.now();
        console.log(`Starting screen reader simulation for: ${readerType}`);
        
        try {
            const readers = readerType === 'all' ? 
                Object.keys(this.screenReaders) : [readerType];
            
            // 各スクリーンリーダーでシミュレーション実行
            for (const reader of readers) {
                await this.runReaderSimulation(reader);
            }
            
            // ARIA属性検証
            await this.validateAriaAttributes();
            
            // ナビゲーションテスト
            await this.runNavigationTests();
            
            // 互換性マトリックス生成
            this.generateCompatibilityMatrix();
            
            const endTime = performance.now();
            const simulationTime = endTime - startTime;
            this.performance.simulationTime.push(simulationTime);
            this.stats.totalSimulations++;
            
            console.log(`Screen reader simulation completed in ${simulationTime.toFixed(2)}ms`);
            
            // イベント発火
            this.accessibilityManager?.eventSystem?.emit('screenReaderSimulationCompleted', {
                results: this.results,
                simulationTime,
                readerType
            });
            
            return this.results;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'SCREEN_READER_SIMULATION_ERROR', {
                operation: 'runFullSimulation',
                readerType
            });
            return null;
        }
    }
    
    /**
     * 個別スクリーンリーダーシミュレーション
     */
    async runReaderSimulation(readerType) {
        const reader = this.screenReaders[readerType];
        if (!reader) {
            console.warn(`Unknown screen reader: ${readerType}`);
            return;
        }
        
        console.log(`Simulating ${reader.name} (${reader.platform})`);
        
        this.state.currentReader = readerType;
        
        // ページ全体の読み上げシミュレーション
        await this.simulatePageReading(reader);
        
        // フォーカスナビゲーションシミュレーション
        await this.simulateFocusNavigation(reader);
        
        // ランドマークナビゲーションシミュレーション
        await this.simulateLandmarkNavigation(reader);
        
        // 見出しナビゲーションシミュレーション
        await this.simulateHeadingNavigation(reader);
        
        // ライブリージョンテスト
        await this.simulateLiveRegions(reader);
    }
    
    /**
     * ページ読み上げシミュレーション
     */
    async simulatePageReading(reader) {
        console.log(`Simulating page reading with ${reader.name}`);
        
        const allElements = this.getReadableElements();
        const announcements = [];
        
        for (const element of allElements) {
            const announcement = this.generateAnnouncement(element, reader);
            if (announcement) {
                announcements.push({
                    element,
                    text: announcement,
                    reader: reader.name,
                    timestamp: Date.now(),
                    type: 'page-reading'
                });
                
                // 読み上げ遅延のシミュレーション
                await this.simulateReadingDelay(announcement);
            }
        }
        
        this.results.announcements.push(...announcements);
        this.stats.totalAnnouncements += announcements.length;
    }
    
    /**
     * 読み上げ可能要素の取得
     */
    getReadableElements() {
        const selector = [
            'h1, h2, h3, h4, h5, h6',
            'p', 'div', 'span',
            'a[href]', 'button',
            'input', 'textarea', 'select',
            '[role]',
            '[aria-label]',
            '[aria-labelledby]'
        ].join(', ');
        
        const elements = Array.from(document.querySelectorAll(selector));
        
        // 非表示要素を除外
        return elements.filter(element => {
            const styles = window.getComputedStyle(element);
            return styles.display !== 'none' && 
                   styles.visibility !== 'hidden' &&
                   element.offsetParent !== null;
        });
    }
    
    /**
     * アナウンス生成
     */
    generateAnnouncement(element, reader) {
        let announcement = '';
        
        // 要素の基本情報
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const textContent = element.textContent?.trim();
        
        // アクセシブル名の取得
        let accessibleName = '';
        
        if (ariaLabel) {
            accessibleName = ariaLabel;
        } else if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            accessibleName = labelElement ? labelElement.textContent?.trim() : '';
        } else if (tagName === 'img') {
            accessibleName = element.getAttribute('alt') || '';
        } else if (textContent) {
            accessibleName = textContent;
        }
        
        // 役割の取得
        const elementRole = role || this.getImplicitRole(tagName);
        const roleAnnouncement = this.ariaMapping.roles[elementRole] || '';
        
        // 状態の取得
        const stateAnnouncements = this.getStateAnnouncements(element);
        
        // レベル情報（見出しなど）
        const levelInfo = this.getLevelInfo(element);
        
        // アナウンス文の構築
        if (accessibleName) {
            announcement = accessibleName;
            
            if (roleAnnouncement) {
                announcement += ` ${roleAnnouncement}`;
            }
            
            if (levelInfo) {
                announcement += ` ${levelInfo}`;
            }
            
            if (stateAnnouncements.length > 0) {
                announcement += ` ${stateAnnouncements.join(' ')}`;
            }
        }
        
        // スクリーンリーダー固有の調整
        announcement = this.adjustAnnouncementForReader(announcement, reader, element);
        
        return announcement.trim();
    }
    
    /**
     * 要素の暗黙的役割を取得
     */
    getImplicitRole(tagName) {
        const implicitRoles = {
            'button': 'button',
            'a': 'link',
            'h1': 'heading', 'h2': 'heading', 'h3': 'heading',
            'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
            'ul': 'list', 'ol': 'list',
            'li': 'listitem',
            'table': 'table',
            'tr': 'row',
            'td': 'cell', 'th': 'cell',
            'nav': 'navigation',
            'main': 'main',
            'header': 'banner',
            'footer': 'contentinfo',
            'aside': 'complementary',
            'section': 'region',
            'img': 'image'
        };
        
        return implicitRoles[tagName];
    }
    
    /**
     * 状態アナウンスの取得
     */
    getStateAnnouncements(element) {
        const announcements = [];
        
        // ARIA状態属性をチェック
        for (const [attr, values] of Object.entries(this.ariaMapping.states)) {
            const value = element.getAttribute(attr);
            if (value && values[value]) {
                announcements.push(values[value]);
            }
        }
        
        // HTML固有の状態
        if (element.disabled) {
            announcements.push('無効');
        }
        
        if (element.required) {
            announcements.push('必須');
        }
        
        if (element.readOnly) {
            announcements.push('読み取り専用');
        }
        
        // フォーカス状態
        if (element === document.activeElement) {
            announcements.push('フォーカス中');
        }
        
        return announcements;
    }
    
    /**
     * レベル情報の取得
     */
    getLevelInfo(element) {
        // 見出しレベル
        const headingMatch = element.tagName.match(/^H([1-6])$/);
        if (headingMatch) {
            return `レベル${headingMatch[1]}`;
        }
        
        // ARIA レベル
        const ariaLevel = element.getAttribute('aria-level');
        if (ariaLevel) {
            return `レベル${ariaLevel}`;
        }
        
        // リスト内位置
        const setPosInSet = element.getAttribute('aria-posinset');
        const setSize = element.getAttribute('aria-setsize');
        if (setPosInSet && setSize) {
            return `${setSize}個中${setPosInSet}番目`;
        }
        
        return '';
    }
    
    /**
     * スクリーンリーダー固有の調整
     */
    adjustAnnouncementForReader(announcement, reader, element) {
        // NVDA固有の調整
        if (reader.name === 'NVDA') {
            // ボタンの場合、"button"を後に付ける
            if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
                announcement = announcement.replace(/ボタン/, '') + ' ボタン';
            }
        }
        
        // JAWS固有の調整
        if (reader.name === 'JAWS') {
            // より詳細な状態情報を追加
            if (element.getAttribute('aria-describedby')) {
                const descElement = document.getElementById(element.getAttribute('aria-describedby'));
                if (descElement) {
                    announcement += ` 説明: ${descElement.textContent?.trim()}`;
                }
            }
        }
        
        // VoiceOver固有の調整
        if (reader.name === 'VoiceOver') {
            // より自然な日本語読み上げ
            announcement = announcement.replace(/チェック済み/, 'オン');
            announcement = announcement.replace(/チェックなし/, 'オフ');
        }
        
        // TalkBack固有の調整
        if (reader.name === 'TalkBack') {
            // タッチ操作の説明を追加
            if (element.tagName === 'BUTTON') {
                announcement += ' ダブルタップして実行';
            }
        }
        
        return announcement;
    }
    
    /**
     * 読み上げ遅延のシミュレーション
     */
    async simulateReadingDelay(text) {
        // 文字数に基づく読み上げ時間の計算
        const wordsPerMinute = this.config.speechRate;
        const characters = text.length;
        const estimatedWords = characters / 5; // 平均的な文字数/単語
        const readingTimeMs = (estimatedWords / wordsPerMinute) * 60 * 1000;
        
        // 最小・最大時間の制限
        const delayTime = Math.max(100, Math.min(readingTimeMs, 2000));
        
        return new Promise(resolve => {
            setTimeout(resolve, delayTime);
        });
    }
    
    /**
     * フォーカスナビゲーションシミュレーション
     */
    async simulateFocusNavigation(reader) {
        console.log(`Simulating focus navigation with ${reader.name}`);
        
        const focusableElements = this.getFocusableElements();
        const navigationLog = [];
        
        for (let i = 0; i < focusableElements.length; i++) {
            const element = focusableElements[i];
            
            // フォーカス移動をシミュレート
            element.focus();
            
            const announcement = this.generateFocusAnnouncement(element, reader);
            navigationLog.push({
                element,
                announcement,
                tabIndex: i,
                timestamp: Date.now()
            });
            
            // フォーカス移動の遅延
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.results.navigationTests.focusManagement = {
            reader: reader.name,
            totalElements: focusableElements.length,
            navigationLog,
            passed: navigationLog.length === focusableElements.length
        };
    }
    
    /**
     * フォーカス可能要素の取得
     */
    getFocusableElements() {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        return Array.from(document.querySelectorAll(selector))
            .filter(element => {
                const styles = window.getComputedStyle(element);
                return styles.display !== 'none' && 
                       styles.visibility !== 'hidden';
            })
            .sort((a, b) => {
                const aIndex = parseInt(a.getAttribute('tabindex')) || 0;
                const bIndex = parseInt(b.getAttribute('tabindex')) || 0;
                return aIndex - bIndex;
            });
    }
    
    /**
     * フォーカス時のアナウンス生成
     */
    generateFocusAnnouncement(element, reader) {
        let announcement = this.generateAnnouncement(element, reader);
        
        // フォーカス固有の情報を追加
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) > 0) {
            announcement += ` タブインデックス${tabIndex}`;
        }
        
        // キーボードショートカット情報
        const accessKey = element.getAttribute('accesskey');
        if (accessKey) {
            announcement += ` ショートカット Alt+${accessKey}`;
        }
        
        return announcement;
    }
    
    /**
     * ARIA属性検証
     */
    async validateAriaAttributes() {
        const startTime = performance.now();
        console.log('Validating ARIA attributes...');
        
        const elementsWithAria = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-checked], [aria-selected]');
        
        for (const element of elementsWithAria) {
            await this.validateElementAria(element);
        }
        
        const endTime = performance.now();
        this.performance.ariaValidationTime.push(endTime - startTime);
        
        console.log(`ARIA validation completed. Found ${this.results.ariaValidation.failed.length} issues`);
    }
    
    /**
     * 個別要素のARIA検証
     */
    async validateElementAria(element) {
        const issues = [];
        const warnings = [];
        
        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const ariaDescribedBy = element.getAttribute('aria-describedby');
        
        // 役割の検証
        if (role) {
            if (!this.ariaMapping.roles[role]) {
                issues.push({
                    element,
                    issue: `Unknown ARIA role: ${role}`,
                    severity: 'error',
                    type: 'invalid-role'
                });
            }
            
            // 必須プロパティの検証
            const requiredProps = this.getRequiredAriaProperties(role);
            for (const prop of requiredProps) {
                if (!element.hasAttribute(prop)) {
                    issues.push({
                        element,
                        issue: `Missing required ARIA property: ${prop} for role ${role}`,
                        severity: 'error',
                        type: 'missing-required-property'
                    });
                }
            }
        }
        
        // ラベル参照の検証
        if (ariaLabelledBy) {
            const labelIds = ariaLabelledBy.split(/\s+/);
            for (const id of labelIds) {
                if (!document.getElementById(id)) {
                    issues.push({
                        element,
                        issue: `aria-labelledby references non-existent element: ${id}`,
                        severity: 'error',
                        type: 'invalid-reference'
                    });
                }
            }
        }
        
        // 説明参照の検証
        if (ariaDescribedBy) {
            const descIds = ariaDescribedBy.split(/\s+/);
            for (const id of descIds) {
                if (!document.getElementById(id)) {
                    issues.push({
                        element,
                        issue: `aria-describedby references non-existent element: ${id}`,
                        severity: 'error',
                        type: 'invalid-reference'
                    });
                }
            }
        }
        
        // アクセシブル名の検証
        if (!this.hasAccessibleName(element)) {
            warnings.push({
                element,
                issue: 'Element may need an accessible name',
                severity: 'warning',
                type: 'missing-accessible-name'
            });
        }
        
        // 結果の記録
        if (issues.length > 0) {
            this.results.ariaValidation.failed.push(...issues);
            this.stats.ariaIssuesFound += issues.length;
        } else {
            this.results.ariaValidation.passed.push({
                element,
                timestamp: Date.now()
            });
        }
        
        if (warnings.length > 0) {
            this.results.ariaValidation.warnings.push(...warnings);
        }
    }
    
    /**
     * アクセシブル名の存在確認
     */
    hasAccessibleName(element) {
        // aria-label
        if (element.getAttribute('aria-label')) {
            return true;
        }
        
        // aria-labelledby
        if (element.getAttribute('aria-labelledby')) {
            return true;
        }
        
        // alt属性（画像）
        if (element.tagName === 'IMG' && element.getAttribute('alt') !== null) {
            return true;
        }
        
        // label要素
        const id = element.getAttribute('id');
        if (id && document.querySelector(`label[for="${id}"]`)) {
            return true;
        }
        
        // テキストコンテンツ
        if (element.textContent?.trim()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 必須ARIA属性の取得
     */
    getRequiredAriaProperties(role) {
        const requiredProps = {
            'checkbox': ['aria-checked'],
            'radio': ['aria-checked'],
            'slider': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
            'spinbutton': ['aria-valuenow'],
            'tab': ['aria-selected'],
            'tabpanel': ['aria-labelledby'],
            'progressbar': ['aria-valuenow'],
            'option': ['aria-selected']
        };
        
        return requiredProps[role] || [];
    }
    
    /**
     * ランドマークナビゲーションシミュレーション
     */
    async simulateLandmarkNavigation(reader) {
        console.log(`Simulating landmark navigation with ${reader.name}`);
        
        const landmarks = document.querySelectorAll('[role="navigation"], [role="main"], [role="banner"], [role="contentinfo"], [role="complementary"], nav, main, header, footer, aside');
        const navigationResults = [];
        
        for (const landmark of landmarks) {
            const announcement = this.generateLandmarkAnnouncement(landmark, reader);
            navigationResults.push({
                element: landmark,
                announcement,
                role: landmark.getAttribute('role') || landmark.tagName.toLowerCase(),
                timestamp: Date.now()
            });
        }
        
        this.results.navigationTests.landmarkNavigation = {
            reader: reader.name,
            totalLandmarks: landmarks.length,
            results: navigationResults,
            passed: landmarks.length > 0
        };
    }
    
    /**
     * ランドマークアナウンス生成
     */
    generateLandmarkAnnouncement(element, reader) {
        const role = element.getAttribute('role') || this.getImplicitRole(element.tagName.toLowerCase());
        const roleText = this.ariaMapping.roles[role] || role;
        const label = element.getAttribute('aria-label') || '';
        
        let announcement = roleText;
        if (label) {
            announcement = `${label} ${roleText}`;
        }
        
        return announcement;
    }
    
    /**
     * 見出しナビゲーションシミュレーション
     */
    async simulateHeadingNavigation(reader) {
        console.log(`Simulating heading navigation with ${reader.name}`);
        
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
        const navigationResults = [];
        
        for (const heading of headings) {
            const announcement = this.generateHeadingAnnouncement(heading, reader);
            navigationResults.push({
                element: heading,
                announcement,
                level: this.getHeadingLevel(heading),
                timestamp: Date.now()
            });
        }
        
        this.results.navigationTests.headingNavigation = {
            reader: reader.name,
            totalHeadings: headings.length,
            results: navigationResults,
            passed: this.validateHeadingStructure(headings)
        };
    }
    
    /**
     * 見出しアナウンス生成
     */
    generateHeadingAnnouncement(element, reader) {
        const level = this.getHeadingLevel(element);
        const text = element.textContent?.trim() || '';
        
        return `見出しレベル${level} ${text}`;
    }
    
    /**
     * 見出しレベルの取得
     */
    getHeadingLevel(element) {
        const tagMatch = element.tagName.match(/^H([1-6])$/);
        if (tagMatch) {
            return parseInt(tagMatch[1]);
        }
        
        const ariaLevel = element.getAttribute('aria-level');
        if (ariaLevel) {
            return parseInt(ariaLevel);
        }
        
        return 1;
    }
    
    /**
     * 見出し構造の検証
     */
    validateHeadingStructure(headings) {
        if (headings.length === 0) return false;
        
        let previousLevel = 0;
        let hasValidStructure = true;
        
        for (const heading of headings) {
            const level = this.getHeadingLevel(heading);
            
            // レベル1から始まっているか
            if (previousLevel === 0 && level !== 1) {
                hasValidStructure = false;
                break;
            }
            
            // レベルが1つ以上スキップされていないか
            if (level > previousLevel + 1) {
                hasValidStructure = false;
                break;
            }
            
            previousLevel = level;
        }
        
        return hasValidStructure;
    }
    
    /**
     * ライブリージョンシミュレーション
     */
    async simulateLiveRegions(reader) {
        console.log(`Simulating live regions with ${reader.name}`);
        
        const liveRegions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
        
        for (const region of liveRegions) {
            this.setupLiveRegionMonitoring(region, reader);
        }
    }
    
    /**
     * ライブリージョン監視の設定
     */
    setupLiveRegionMonitoring(region, reader) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const announcement = this.generateLiveRegionAnnouncement(region, reader);
                    if (announcement) {
                        this.results.announcements.push({
                            element: region,
                            text: announcement,
                            reader: reader.name,
                            timestamp: Date.now(),
                            type: 'live-region'
                        });
                        this.stats.totalAnnouncements++;
                    }
                }
            });
        });
        
        observer.observe(region, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    /**
     * ライブリージョンアナウンス生成
     */
    generateLiveRegionAnnouncement(element, reader) {
        const liveValue = element.getAttribute('aria-live') || 'polite';
        const atomicValue = element.getAttribute('aria-atomic') === 'true';
        const text = element.textContent?.trim() || '';
        
        if (!text) return '';
        
        let announcement = text;
        
        // 緊急度に応じた前置詞
        if (liveValue === 'assertive' || element.getAttribute('role') === 'alert') {
            announcement = `アラート: ${announcement}`;
        } else if (element.getAttribute('role') === 'status') {
            announcement = `ステータス: ${announcement}`;
        }
        
        return announcement;
    }
    
    /**
     * ナビゲーションテストの実行
     */
    async runNavigationTests() {
        console.log('Running navigation tests...');
        
        // キーボードトラップテスト
        await this.testKeyboardTrapping();
    }
    
    /**
     * キーボードトラップテスト
     */
    async testKeyboardTrapping() {
        const focusableElements = this.getFocusableElements();
        let trapDetected = false;
        
        // 各要素でTabキーによる移動をシミュレート
        for (let i = 0; i < focusableElements.length; i++) {
            const element = focusableElements[i];
            element.focus();
            
            // 次の要素にフォーカスが移動するかテスト
            const nextElement = focusableElements[i + 1];
            if (nextElement) {
                // Tabキーイベントをシミュレート
                const tabEvent = new KeyboardEvent('keydown', {
                    key: 'Tab',
                    code: 'Tab',
                    keyCode: 9,
                    bubbles: true
                });
                
                element.dispatchEvent(tabEvent);
                
                // フォーカスが適切に移動したかチェック
                await new Promise(resolve => setTimeout(resolve, 10));
                
                if (document.activeElement === element) {
                    // フォーカスが移動しなかった場合、トラップの可能性
                    trapDetected = true;
                    break;
                }
            }
        }
        
        this.results.navigationTests.keyboardTrapping = {
            trapDetected,
            totalElements: focusableElements.length,
            passed: !trapDetected
        };
    }
    
    /**
     * 互換性マトリックス生成
     */
    generateCompatibilityMatrix() {
        console.log('Generating compatibility matrix...');
        
        for (const [readerType, reader] of Object.entries(this.screenReaders)) {
            let score = 100;
            const issues = [];
            
            // ARIA検証結果に基づくスコア調整
            const ariaFailed = this.results.ariaValidation.failed.length;
            score -= ariaFailed * 5; // 1問題につき5点減点
            
            // ナビゲーションテスト結果に基づく調整
            Object.values(this.results.navigationTests).forEach(test => {
                if (test && !test.passed) {
                    score -= 10;
                    issues.push(`Navigation test failed: ${test.constructor.name}`);
                }
            });
            
            // スクリーンリーダー固有の問題
            if (readerType === 'talkback' && this.detectMobileIncompatibilities()) {
                score -= 15;
                issues.push('Mobile accessibility issues detected');
            }
            
            this.results.compatibility[readerType] = {
                score: Math.max(0, score),
                issues,
                reader: reader.name,
                platform: reader.platform
            };
        }
        
        // 総合互換性スコアの計算
        const totalScore = Object.values(this.results.compatibility)
            .reduce((sum, result) => sum + result.score, 0);
        this.stats.compatibilityScore = Math.round(totalScore / Object.keys(this.results.compatibility).length);
    }
    
    /**
     * モバイル非互換性の検出
     */
    detectMobileIncompatibilities() {
        // 小さなタッチターゲットの検出
        const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
        
        for (const element of interactiveElements) {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                return true; // 44px未満のタッチターゲット
            }
        }
        
        return false;
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // フォーカスイベントの監視
        document.addEventListener('focus', (event) => {
            if (this.config.announceInteractions && this.state.currentReader) {
                const reader = this.screenReaders[this.state.currentReader];
                const announcement = this.generateFocusAnnouncement(event.target, reader);
                
                this.results.announcements.push({
                    element: event.target,
                    text: announcement,
                    reader: reader.name,
                    timestamp: Date.now(),
                    type: 'focus'
                });
            }
        }, true);
        
        // クリックイベントの監視
        document.addEventListener('click', (event) => {
            if (this.config.announceInteractions && this.state.currentReader) {
                const reader = this.screenReaders[this.state.currentReader];
                const announcement = this.generateInteractionAnnouncement(event.target, 'click', reader);
                
                if (announcement) {
                    this.results.announcements.push({
                        element: event.target,
                        text: announcement,
                        reader: reader.name,
                        timestamp: Date.now(),
                        type: 'interaction'
                    });
                }
            }
        }, true);
    }
    
    /**
     * 操作アナウンス生成
     */
    generateInteractionAnnouncement(element, action, reader) {
        const baseAnnouncement = this.generateAnnouncement(element, reader);
        
        const actionTexts = {
            click: '実行しました',
            focus: 'フォーカスしました',
            change: '変更しました'
        };
        
        const actionText = actionTexts[action] || '';
        
        return baseAnnouncement ? `${baseAnnouncement} ${actionText}` : '';
    }
    
    /**
     * シミュレーション履歴の読み込み
     */
    loadSimulationHistory() {
        try {
            const saved = localStorage.getItem('screenReaderSimulator_results');
            if (saved) {
                const data = JSON.parse(saved);
                this.results.announcements = data.announcements || [];
                Object.assign(this.stats, data.stats || {});
            }
        } catch (error) {
            console.warn('Failed to load simulation history:', error);
        }
    }
    
    /**
     * シミュレーション結果の保存
     */
    saveSimulationResults() {
        try {
            const dataToSave = {
                announcements: this.results.announcements.slice(-1000), // 最新1000件
                stats: this.stats,
                timestamp: Date.now()
            };
            
            localStorage.setItem('screenReaderSimulator_results', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Failed to save simulation results:', error);
        }
    }
    
    /**
     * シミュレーションの初期化
     */
    initializeSimulation() {
        // デフォルトスクリーンリーダーの設定
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('windows')) {
            this.state.currentReader = 'nvda';
        } else if (userAgent.includes('mac')) {
            this.state.currentReader = 'voiceOver';
        } else if (userAgent.includes('android')) {
            this.state.currentReader = 'talkback';
        } else {
            this.state.currentReader = 'nvda'; // デフォルト
        }
        
        console.log(`Default screen reader set to: ${this.state.currentReader}`);
    }
    
    // パブリックAPI
    
    /**
     * スクリーンリーダーの切り替え
     */
    switchScreenReader(readerType) {
        if (this.screenReaders[readerType]) {
            this.state.currentReader = readerType;
            console.log(`Switched to ${this.screenReaders[readerType].name}`);
            return true;
        }
        return false;
    }
    
    /**
     * 詳細度レベルの設定
     */
    setVerbosityLevel(level) {
        const validLevels = ['minimal', 'normal', 'verbose'];
        if (validLevels.includes(level)) {
            this.config.verbosityLevel = level;
            console.log(`Verbosity level set to: ${level}`);
            return true;
        }
        return false;
    }
    
    /**
     * 読み上げ速度の設定
     */
    setSpeechRate(wordsPerMinute) {
        if (wordsPerMinute >= 50 && wordsPerMinute <= 400) {
            this.config.speechRate = wordsPerMinute;
            console.log(`Speech rate set to: ${wordsPerMinute} WPM`);
            return true;
        }
        return false;
    }
    
    /**
     * シミュレーション結果の取得
     */
    getSimulationResults() {
        return {
            ...this.results,
            stats: this.stats,
            performance: this.performance
        };
    }
    
    /**
     * 互換性レポートの取得
     */
    getCompatibilityReport() {
        return {
            overallScore: this.stats.compatibilityScore,
            readerResults: this.results.compatibility,
            totalIssues: this.stats.ariaIssuesFound,
            timestamp: Date.now()
        };
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.screenReader) {
            Object.assign(this.config, config.screenReader);
        }
        
        console.log('ScreenReaderSimulator configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        
        if (enabled) {
            this.runFullSimulation();
        }
        
        console.log(`ScreenReaderSimulator ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying ScreenReaderSimulator...');
        
        // 結果の保存
        this.saveSimulationResults();
        
        // データのクリア
        this.results.announcements = [];
        this.results.ariaValidation = { passed: [], failed: [], warnings: [] };
        this.state.readingQueue = [];
        
        console.log('ScreenReaderSimulator destroyed');
    }
}