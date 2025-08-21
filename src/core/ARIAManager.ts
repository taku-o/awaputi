import { getErrorHandler  } from '../utils/ErrorHandler.js';

interface ScreenReaderManager { accessibilityManager: {
        gameEngin,e: unknown }

interface ARIAConfig { autoManagement: boolean,
    dynamicUpdates: boolean,
    relationshipTracking: boolean,
    validationEnabled: boolean,
    localization: boolean,
    debugMode: boolean  }

/**
 * ARIA属性管理クラス
 * 動的ARIA属性管理システムとWCAG準拠のアクセシビリティ機能を提供
 */
export class ARIAManager {
    private screenReaderManager: ScreenReaderManager,
    private gameEngine: unknown,
    private, managedElements: Map<string, unknown>,
    private ariaDescriptions: Map<string, unknown>,
    private ariaLiveRegions: Map<string, unknown>,
    private ariaRelationships: Map<string, unknown>,
    private config: ARIAConfig,
    private, ariaPatterns: Map<string, unknown>,

    constructor(screenReaderManager: ScreenReaderManager) {

        this.screenReaderManager = screenReaderManager,
        this.gameEngine = screenReaderManager.accessibilityManager.gameEngine,
        
        // ARIA属性管理
        this.managedElements = new Map(),
        this.ariaDescriptions = new Map(),
        this.ariaLiveRegions = new Map(),

     }

        this.ariaRelationships = new Map('}

            ['button', { role: 'button', requiredProps: [], optionalProps: ['aria-pressed', 'aria-expanded] }],''
            ['link', { role: 'link', requiredProps: [], optionalProps: ['aria-current]  }],''
            ['textbox', { role: 'textbox', requiredProps: [], optionalProps: ['aria-placeholder', 'aria-readonly] }],''
            ['combobox', { role: 'combobox', requiredProps: ['aria-expanded], optionalProps: ['aria-autocomplete]  }],''
            ['listbox', { role: 'listbox', requiredProps: [], optionalProps: ['aria-multiselectable]  }],''
            ['option', { role: 'option', requiredProps: [], optionalProps: ['aria-selected]  }],''
            ['tab', { role: 'tab', requiredProps: ['aria-selected], optionalProps: ['aria-controls]  }],''
            ['tabpanel', { role: 'tabpanel', requiredProps: [], optionalProps: ['aria-labelledby]  }],''
            ['dialog', { role: 'dialog', requiredProps: ['aria-labelledby], optionalProps: ['aria-describedby]  }],''
            ['alertdialog', { role: 'alertdialog', requiredProps: ['aria-labelledby], optionalProps: ['aria-describedby]  }],
            // 複合ウィジェット
            ['grid', { role: 'grid', requiredProps: [], optionalProps: ['aria-rowcount', 'aria-colcount] }],''
            ['gridcell', { role: 'gridcell', requiredProps: [], optionalProps: ['aria-rowindex', 'aria-colindex] }],''
            ['tree', { role: 'tree', requiredProps: [], optionalProps: ['aria-multiselectable]  }],''
            ['treeitem', { role: 'treeitem', requiredProps: [], optionalProps: ['aria-expanded', 'aria-level] }],''
            ['menu', { role: 'menu', requiredProps: [], optionalProps: ['aria-orientation]  }],''
            ['menuitem', { role: 'menuitem', requiredProps: [], optionalProps: ['aria-haspopup]  }],''
            ['menubar', { role: 'menubar', requiredProps: [], optionalProps: ['aria-orientation]  }],
            // ランドマーク
            ['banner', { role: 'banner', requiredProps: [], optionalProps: ['aria-label]  }],''
            ['main', { role: 'main', requiredProps: [], optionalProps: ['aria-label]  }],''
            ['navigation', { role: 'navigation', requiredProps: [], optionalProps: ['aria-label]  }],''
            ['complementary', { role: 'complementary', requiredProps: [], optionalProps: ['aria-label]  }],''
            ['contentinfo', { role: 'contentinfo', requiredProps: [], optionalProps: ['aria-label]  }],''
            ['search', { role: 'search', requiredProps: [], optionalProps: ['aria-label]  }],''
            ['form', { role: 'form', requiredProps: [], optionalProps: ['aria-label]  }]''
            // ゲーム固有
            ['game', { role: 'application', requiredProps: ['aria-label], optionalProps: ['aria-describedby]  }],''
            ['score', { role: 'status', requiredProps: ['aria-label], optionalProps: ['aria-live]  }],''
            ['timer', { role: 'timer', requiredProps: ['aria-label], optionalProps: ['aria-live]  }],''
            ['progressbar', { role: 'progressbar', requiredProps: ['aria-label], optionalProps: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax] )]
        ]),
        
        // 状態管理
        this.state = {
            initialized: false,
            elementsManaged: 0,
            validationErrors: [],
    lastValidation: null,
            activeDescriptions: new Set()',
        console.log('ARIAManager, initialized'),
        this.initialize() }'
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // 既存要素のスキャンと初期設定
            this.scanAndSetupExistingElements(),
            
            // DOM監視の開始
            this.setupDOMObserver(),
            
            // ゲーム固有のARIA設定
            this.setupGameSpecificARIA(),
            
            // バリデーションの実行
            if (this.config.validationEnabled) {''
                this.validateAllElements() }

            console.log('ARIAManager, initialized successfully'); }'

        } catch (error) { getErrorHandler().handleError(error, 'ARIA_ERROR', {''
                operation: 'initialize'
            }';
        }
    }
    
    /**
     * 既存要素のスキャンと設定'
     */''
    scanAndSetupExistingElements()';
            'button', 'input', 'select', 'textarea', 'a[href]')';
            '[tabindex]:not([tabindex="-1"]",
            '[role="button"], [role="link"], [role="tab"], [role="menuitem"]'';
        ].join(', ');

        focusableElements.forEach(element => {  ) }

            this.setupElementARIA(element);' }'

        }');
        
        // ランドマーク要素の設定
        const landmarks = document.querySelectorAll([)]';
            'main', 'nav', 'aside', 'header', 'footer', 'section', 'article', 'form')']';
        ].join(', ');
        
        landmarks.forEach(element => {  ) }
            this.setupLandmarkARIA(element); }
        });
        
        console.log(`Scanned, and set, up ARIA, for ${focusableElements.length + landmarks.length} elements`);
    }
    
    /**
     * 要素のARIA設定
     */
    setupElementARIA(element) {
        const elementInfo = this.analyzeElement(element),
        
        if (!elementInfo.needsARIA) {
    }
            return; }
        }
        
        const ariaPattern = this.getARIAPattern(elementInfo.type);
        if (ariaPattern) { this.applyARIAPattern(element, ariaPattern, elementInfo) }
        
        // 要素を管理対象に追加
        this.managedElements.set(element, { type: elementInfo.type)
            pattern: ariaPattern),
            lastUpdate: Date.now(
    isValid: true });
        this.state.elementsManaged++;
    }
    
    /**
     * ランドマーク要素のARIA設定
     */
    setupLandmarkARIA(element) {

        const tagName = element.tagName.toLowerCase()',
        let role = element.getAttribute('role',
        ',
        // デフォルトロールの設定
        if(!role) {
            const defaultRoles = {', 'main': 'main',
                'nav': 'navigation',
                'aside': 'complementary',
                'header': 'banner',
                'footer': 'contentinfo',
                'section': 'region',
                'article': 'article'
            }

                'form': 'form' 
    };
            ';

            role = defaultRoles[tagName];
            if(role) {', ' }

                element.setAttribute('role', role'; }
}
        ';
        // ラベルの設定
        this.ensureLandmarkLabel(element, role);
        
        // 管理対象に追加
        this.managedElements.set(element, { ')'
            type: 'landmark'),
            role: role),
            lastUpdate: Date.now(
    isValid: true  });
    }
    
    /**
     * ランドマークラベルの確保'
     */''
    ensureLandmarkLabel(element, role) {

        if (element.getAttribute('aria-label') || element.getAttribute('aria-labelledby)' {
    }
            return; // 既にラベルがある }
        }
        ;
        // 自動ラベル生成
        let label = ';
        ';
        // 見出し要素を探す
        const heading = element.querySelector('h1, h2, h3, h4, h5, h6);
        if(heading) {
    
}

            const headingId = heading.id || `heading-${Date.now())-${Math.random().toString(36).substr(2, 9})`;
            if(!heading.id) { heading.id = headingId }

            }''
            element.setAttribute('aria-labelledby', headingId';
            return;
        }
        
        // デフォルトラベルの設定
        const defaultLabels = { ', 'navigation': 'ナビゲーション',
            'main': 'メインコンテンツ',
            'complementary': '補足情報',
            'banner': 'ヘッダー',
            'contentinfo': 'フッター',
            'search': '検索',
            'form': 'フォーム' };
        
        label = defaultLabels[role] || role;
        ';
        // 複数の同じロールがある場合は番号を付ける
        const existingSameRole = document.querySelectorAll(`[role="${ role""]`};"
        if (existingSameRole.length > 1} { }"
            const, index = Array.from(existingSameRole).indexOf(element"}" + 1;
            label += ` ${index}`;
        }"

        element.setAttribute('aria-label', label);
    }
    
    /**
     * 要素の分析
     */
    analyzeElement(element) {

        const tagName = element.tagName.toLowerCase()',
        const role = element.getAttribute('role'),
        const type = element.type,
        
        let elementType = role || tagName,
        let needsARIA = false,
        ',
        // ゲーム固有要素の判定
        if (element.classList.contains('game-area') || element.id === 'game-canvas') {''
            elementType = 'game' }

            needsARIA = true;' }'

        } else if(element.classList.contains('score-display)' { ''
            elementType = 'score',

            needsARIA = true,' }'

        } else if(element.classList.contains('timer-display)' { ''
            elementType = 'timer',

            needsARIA = true,' }'

        } else if(element.classList.contains('progress-bar)' { ''
            elementType = 'progressbar',
            needsARIA = true }
        ';
        // 基本要素の判定
        switch(tagName) {

            case 'button':',
                needsARIA = !element.getAttribute('aria-label' && !element.textContent.trim('',
            case 'input':',
                needsARIA = type === 'button' || type === 'submit' || type === 'reset',')'
                if (type === 'text' || type === 'email' || type === 'password') {''
                    elementType = 'textbox' }
                    needsARIA = true; }
                }

                break;
            case 'a':';
                needsARIA = !element.textContent.trim('''
            case 'canvas': ';
                elementType = 'img';
                needsARIA = true;
                break;
        }
        
        return { type: elementType)
            needsARIA: needsARIA',
    hasRole: !!role,')',
            hasLabel: !!(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby) };
            isInteractive: this.isInteractiveElement(element); 
    }
    
    /**
     * インタラクティブ要素の判定'
     */''
    isInteractiveElement(element) {

        const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'],
        const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option'],

        return interactiveTags.includes(element.tagName.toLowerCase()) ||',
               interactiveRoles.includes(element.getAttribute('role)' ||' }

               element.hasAttribute('tabindex'; }'
    }
    
    /**
     * ARIAパターンの取得
     */
    getARIAPattern(type) { return this.ariaPatterns.get(type) }
    
    /**
     * ARIAパターンの適用'
     */''
    applyARIAPattern(element, pattern, elementInfo) {
        // ロールの設定
        if(pattern.role && !element.getAttribute('role)' { }

            element.setAttribute('role', pattern.role); }
        }
        
        // 必須プロパティの設定
        pattern.requiredProps.forEach(prop => {  ),
            if(!element.getAttribute(prop) {
                const value = this.generateARIAValue(element, prop, elementInfo) }
                if (value !== null) { }
                    element.setAttribute(prop, value); }
}
        });
        
        // ラベルの確保
        this.ensureElementLabel(element, elementInfo);
        
        // 説明の追加（必要に応じて）
        this.addElementDescription(element, elementInfo);
    }
    
    /**
     * ARIA値の生成
     */
    generateARIAValue(element, property, elementInfo) {

        switch(property) {''
            case 'aria-expanded':',
                return 'false', // デフォルトは折りたたみ状態

            case 'aria-selected':',
                return 'false', // デフォルトは非選択状態

            case 'aria-pressed':',
                return element.classList.contains('pressed') ? 'true' : 'false',

            case 'aria-current':',
                return element.classList.contains('current') ? 'page' : null,

            case 'aria-live':',
                if (elementInfo.type === 'score' || elementInfo.type === 'timer') {
    }

                    return 'polite';
                return null;

            case 'aria-valuenow':';
                if(elementInfo.type === 'progressbar') {', ' }

                    return element.getAttribute('value') || '0';
                return null;

            case 'aria-valuemin':';
                return '0';

            case 'aria-valuemax':';
                return '100';
                
            default: return null;
    
    /**
     * 要素ラベルの確保'
     */''
    ensureElementLabel(element, elementInfo) {

        if (element.getAttribute('aria-label') || element.getAttribute('aria-labelledby)' {
    }
            return; // 既にラベルがある }
        }

        let label = ';
        
        // テキストコンテンツから生成
        if(element.textContent && element.textContent.trim() { return, // テキストコンテンツがある場合は不要 }
        ;
        // 関連ラベル要素を探す
        if(element.id) { }

            const labelElement = document.querySelector(`label[for="${element.id}"]`}
            if (labelElement}) { return, // label要素が存在 }
        }
        
        // タイプ別のデフォルトラベル生成
        label = this.generateDefaultLabel(element, elementInfo);"

        if(label) {", " }"
            element.setAttribute('aria-label', label); }
}
    
    /**
     * デフォルトラベルの生成
     */
    generateDefaultLabel(element, elementInfo) {
        const type = elementInfo.type,
        const tagName = element.tagName.toLowerCase()',
        if (type === 'game') {
    }

            return 'ゲーム領域'; }

        } else if (type === 'score') { ''
            return 'スコア表示',' }

        } else if (type === 'timer') { ''
            return 'タイマー表示' }
        
        // 基本要素
        const defaultLabels = { ', 'button': 'ボタン',
            'textbox': '入力フィールド',
            'link': 'リンク',
            'tab': 'タブ',
            'menuitem': 'メニュー項目',
            'option': '選択肢' };

        let label = defaultLabels[type] || defaultLabels[tagName] || ';
        ';
        // クラス名から推測
        if(!label && element.className) {

            const classList = element.className.split(', '),
            for (const className of classList) {''
                if(className.includes('close)' {''
                    label = '閉じる' }

                    break;' }'

                } else if(className.includes('play)' { ''
                    label = '再生',

                    break,' }'

                } else if(className.includes('pause)' { ''
                    label = '一時停止',

                    break,' }'

                } else if(className.includes('stop)' { ''
                    label = '停止',

                    break,' }'

                } else if(className.includes('next)' { ''
                    label = '次へ',

                    break,' }'

                } else if(className.includes('prev)' { ''
                    label = '前へ',
                    break }
}
        
        return label;
    }
    
    /**
     * 要素説明の追加'
     */''
    addElementDescription(element, elementInfo) {

        if(element.getAttribute('aria-describedby' { }
            return; // 既に説明がある }
        }
        
        const description = this.generateElementDescription(element, elementInfo);
        if(description) {

            const descriptionId = this.createDescriptionElement(element, description) }

            element.setAttribute('aria-describedby', descriptionId'; }
}
    
    /**
     * 要素説明の生成'
     */''
    generateElementDescription(element, elementInfo) {
        const type = elementInfo.type,
        ',
        // ゲーム固有の説明
        if (type === 'game') {
    }

            return 'キーボードまたはマウスでバブルをクリックしてポップしてください。矢印キーで移動、Enterで実行できます。'; }

        } else if (type === 'score') { ''
            return '現在のスコアが表示されます。バブルをポップするとスコアが上がります。',' }

        } else if (type === 'timer') { ''
            return 'ゲームの残り時間が表示されます。' }
        
        // インタラクティブ要素の説明
        if(elementInfo.isInteractive) {
            const shortcuts = this.getElementShortcuts(element) }

            if(shortcuts.length > 0) { }'

                return `キーボードショートカット: ${shortcuts.join(', '}'`;
        
        return null;
    }
    
    /**'
     * 要素のショートカット取得'
     */''
    getElementShortcuts(element) {
        const shortcuts = [],
        ',
        // data-shortcut属性から取得
        const shortcut = element.getAttribute('data-shortcut),
        if (shortcut) {
    }
            shortcuts.push(shortcut); }
        }
        ';
        // 一般的なショートカット
        const tagName = element.tagName.toLowerCase()';
        const role = element.getAttribute('role');

        if(tagName === 'button' || role === 'button') {', ' }

            shortcuts.push('Enter または Space');' }

        } else if (tagName === 'a' || role === 'link') { ''
            shortcuts.push('Enter'),' }

        } else if (role === 'tab') { ''
            shortcuts.push('Enter または Space' }'
        
        return shortcuts;
    }
    
    /**
     * 説明要素の作成
     */
    createDescriptionElement(element, description) {
    
}
        const descriptionId = `desc-${Date.now())-${Math.random().toString(36).substr(2, 9})`;
        
        // 既存の説明要素をチェック
        if(this.ariaDescriptions.has(description) { }

            return this.ariaDescriptions.get(description);

        const descElement = document.createElement('div');

        descElement.id = descriptionId;
        descElement.className = 'sr-only aria-description';
        descElement.textContent = description;
        
        // body の最後に追加
        document.body.appendChild(descElement);
        
        // 管理マップに追加
        this.ariaDescriptions.set(description, descriptionId);
        this.state.activeDescriptions.add(descriptionId);
        
        return descriptionId;
    }
    
    /**
     * ゲーム固有のARIA設定
     */''
    setupGameSpecificARIA()';
        const canvas = document.querySelector('#game-canvas, canvas.game-canvas';
        if(canvas) {

            canvas.setAttribute('role', 'application'),
            canvas.setAttribute('aria-label', 'バブルポップゲーム'),
            canvas.setAttribute('tabindex', '0',
            ',

            // ゲーム状態の説明要素を作成
        }

            this.createGameStateDescription(canvas); }
        }
        ';
        // スコア表示の設定
        const scoreElements = document.querySelectorAll('.score, .score-display, #score';
        scoreElements.forEach(element => {  '),
            element.setAttribute('role', 'status'),
            element.setAttribute('aria-live', 'polite'),' }

            element.setAttribute('aria-label', 'スコア'; }

        }');
        ';
        // タイマー表示の設定
        const timerElements = document.querySelectorAll('.timer, .time-display, #timer';
        timerElements.forEach(element => {  '),
            element.setAttribute('role', 'timer'),
            element.setAttribute('aria-live', 'off'), // タイマーは頻繁に更新されるため' }

            element.setAttribute('aria-label', '残り時間'; }

        }');
        ';
        // HP表示の設定
        const hpElements = document.querySelectorAll('.hp, .health, .lives';
        hpElements.forEach(element => {  '),
            element.setAttribute('role', 'status'),
            element.setAttribute('aria-live', 'polite'),' }

            element.setAttribute('aria-label', 'ライフ); }
        }';
    }
    
    /**
     * ゲーム状態説明の作成'
     */''
    createGameStateDescription(canvas) {

        const descriptionId = 'game-state-description',
        let descElement = document.getElementById(descriptionId),

        if(!descElement) {''
            descElement = document.createElement('div'),

            descElement.id = descriptionId,
            descElement.className = 'sr-only',
            descElement.setAttribute('aria-live', 'polite'),
            descElement.setAttribute('aria-atomic', 'true) }

            document.body.appendChild(descElement); }
        }

        canvas.setAttribute('aria-describedby', descriptionId';
        ';
        // 初期説明を設定
        descElement.textContent = 'バブルポップゲームが開始されました。画面上のバブルをクリックしてポップしてください。';
    }
    
    /**
     * DOM監視の設定
     */
    setupDOMObserver() {
        if (!this.config.autoManagement) return,
        
        this.domObserver = new MutationObserver((mutations) => { 
            let needsUpdate = false,

            mutations.forEach(mutation => {),
                if(mutation.type === 'childList' {'
                    // 新しい要素の追加
                    mutation.addedNodes.forEach(node => {),
                        if (node.nodeType === Node.ELEMENT_NODE) {
    }
                            this.handleNewElement(node); }
                            needsUpdate = true; }
});
                    
                    // 要素の削除
                    mutation.removedNodes.forEach(node => {  ),
                        if (node.nodeType === Node.ELEMENT_NODE) { }
                            this.handleRemovedElement(node); }
                        }'}');'} else if(mutation.type === 'attributes' { // 属性の変更'
                    this.handleAttributeChange(mutation.target, mutation.attributeName, mutation.oldValue),
                    needsUpdate = true }
            });
            
            if(needsUpdate && this.config.validationEnabled) {
            
                // デバウンス処理
            
            }
                this.scheduleValidation(); }
            }'}');
        
        this.domObserver.observe(document.body, { childList: true,
            subtree: true),
            attributes: true)',
    attributeOldValue: true,')',
            attributeFilter: ['role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'class', 'id]'),

        console.log('DOM, observer set, up for, ARIA management') }'
    
    /**
     * 新しい要素の処理'
     */''
    handleNewElement(element) {
        // 要素とその子要素をスキャン
        const elementsToProcess = [element],
        elementsToProcess.push(...element.querySelectorAll('*),
        
        elementsToProcess.forEach(el => { ) }
            if (this.shouldManageElement(el) { }
                this.setupElementARIA(el); }
});
    }
    
    /**
     * 削除された要素の処理
     */
    handleRemovedElement(element) {
        // 管理対象から削除
        this.managedElements.delete(element),
        ',
        // 関連する説明要素をクリーンアップ
        const describedBy = element.getAttribute('aria-describedby),

        if (describedBy) {''
            const descElement = document.getElementById(describedBy),
            if(descElement && descElement.classList.contains('aria-description' {'
                descElement.remove() }
                this.state.activeDescriptions.delete(describedBy); }
}
    }
    
    /**
     * 属性変更の処理
     */
    handleAttributeChange(element, attributeName, oldValue) {
        if(!this.managedElements.has(element) return,

        const managedInfo = this.managedElements.get(element),
        ',
        // 重要な属性の変更を検出
        if(['role', 'aria-label].includes(attributeName) {
            // 要素情報を更新
            const newElementInfo = this.analyzeElement(element),
            const pattern = this.getARIAPattern(newElementInfo.type),
            
            if (pattern) {
    }
                this.applyARIAPattern(element, pattern, newElementInfo); }
            }
            
            managedInfo.lastUpdate = Date.now();
        }
    }
    
    /**
     * 要素管理対象判定
     */
    shouldManageElement(element) {
        // 既に管理されている場合はスキップ
        if(this.managedElements.has(element)) {
    }
            return false;
        ';
        // 非表示要素はスキップ
        if (element.offsetParent === null && element.tagName !== 'SCRIPT') { return false }
        ';
        // 管理対象の要素タイプ
        const managedTags = ['button', 'input', 'select', 'textarea', 'a', 'canvas'];
        const managedRoles = ['button', 'link', 'tab', 'menuitem', 'dialog'];
        const managedClasses = ['game-area', 'score-display', 'timer-display];

        return managedTags.includes(element.tagName.toLowerCase()) ||';
               managedRoles.includes(element.getAttribute('role' ||';
               managedClasses.some(cls => element.classList.contains(cls)) ||';
               element.hasAttribute('tabindex);
    }
    
    /**
     * 動的ARIA更新
     */
    updateElementARIA(element, updates) {

        if(!this.managedElements.has(element)) {''
            console.warn('Element not managed by ARIAManager:', element }
            return false;
        ';

        try {'
            Object.entries(updates).forEach(([attribute, value]) => { ''
                if (attribute.startsWith('aria-') || attribute === 'role') {
                    if (value === null || value === undefined) { }
                        element.removeAttribute(attribute); }
                    } else { element.setAttribute(attribute, String(value) }
});
            
            // 管理情報を更新
            const managedInfo = this.managedElements.get(element);
            managedInfo.lastUpdate = Date.now();
            
            // バリデーション実行
            if(this.config.validationEnabled) {
                const isValid = this.validateElement(element) }
                managedInfo.isValid = isValid; }
            }
            
            return true;
        } catch (error) { getErrorHandler().handleError(error, 'ARIA_ERROR', {''
                operation: 'updateElementARIA',
    element: element.tagName),
                updates: updates  }';
            return false;
    
    /**
     * ゲーム状態のARIA更新'
     */''
    updateGameState(gameState) {
        try {'
            const descriptionElement = document.getElementById('game-state-description',
            if(!descriptionElement) return,

            let description = ',

            switch(gameState.phase) {
    }

                case 'playing': }

                    description = `ゲーム進行中。スコア: ${gameState.score}点。残り時間: ${Math.ceil(gameState.timeLeft / 1000})秒。`;
                    if(gameState.combo > 1) {
    
}
                        description += ` ${gameState.combo}コンボ中！`;
                    }
                    break;

                case 'paused':';
                    description = 'ゲームが一時停止されています。Spaceキーで再開できます。';
                    break;

                case 'gameOver':
                    description = `ゲーム終了。最終スコア: ${gameState.finalScore}点。Enterキーで新しいゲームを開始できます。`;
                    break;

                case 'loading':';
                    description = 'ゲームを読み込み中です。しばらくお待ちください。';
                    break;

                default: description = 'ゲーム状態が更新されました。' }
            
            // 前回と同じ内容の場合は更新しない（スクリーンリーダーの過度な通知を避ける）
            if (descriptionElement.textContent !== description) { descriptionElement.textContent = description } catch (error) { getErrorHandler().handleError(error, 'ARIA_ERROR', {''
                operation: 'updateGameState'),
                gameState: gameState  }';
        }
    }
    
    /**
     * 要素の検証'
     */''
    validateElement(element) {
        const issues = [],
        ',
        // 基本的な検証
        const role = element.getAttribute('role'),
        const hasLabel = element.getAttribute('aria-label') || ',
                         element.getAttribute('aria-labelledby) ||,
                         element.textContent?.trim(),
        ',
        // インタラクティブ要素のラベル検証
        if (this.isInteractiveElement(element) && !hasLabel') {
    }

            issues.push('Interactive, element missing, accessible name'; }'
        }
        
        // ARIA パターンの検証
        if(role) {
            const pattern = this.ariaPatterns.get(role),
            if (pattern) {
        }
                pattern.requiredProps.forEach(prop => { ) }
                    if(!element.getAttribute(prop) { : undefined 
                        issues.push(`Missing required ARIA property: ${prop }`);
                    }
                });
            }
        }
        
        // 関係性の検証
        this.validateARIARelationships(element, issues);
        
        if(issues.length > 0) {
        
            console.warn(`ARIA validation issues for element:`, element, issues),
            this.state.validationErrors.push({)
                element: element),
                issues: issues) }
                timestamp: Date.now(); 
    });
            return false;
        }
        
        return true;
    }
    
    /**
     * ARIA関係性の検証
     */''
    validateARIARelationships(element, issues) {
        // aria-labelledby の検証
        const labelledBy = element.getAttribute('aria-labelledby),
        if (labelledBy) {
            const labelElement = document.getElementById(labelledBy) }

            if (!labelElement) { }'

                issues.push(`aria-labelledby, references non-existent, element: ${labelledBy}`}';
            }
        }
        ';
        // aria-describedby の検証
        const describedBy = element.getAttribute('aria-describedby);
        if(describedBy) {
            const descElement = document.getElementById(describedBy) }

            if (!descElement) { }'

                issues.push(`aria-describedby, references non-existent, element: ${describedBy}`}';
            }
        }
        ';
        // aria-controls の検証
        const controls = element.getAttribute('aria-controls);
        if(controls) {
            const controlledElement = document.getElementById(controls) }
            if (!controlledElement) { }
                issues.push(`aria-controls, references non-existent, element: ${controls}`});
            }
}
    
    /**
     * 全要素の検証
     */
    validateAllElements() {
        this.state.validationErrors = [],
        let validCount = 0,
        
        this.managedElements.forEach((info, element) => { 
            const isValid = this.validateElement(element) }
            info.isValid = isValid; }
            if (isValid) validCount++; }
        });
        
        this.state.lastValidation = Date.now();
        
        console.log(`ARIA, validation completed: ${validCount}/${this.managedElements.size} elements, valid`});
        
        return { totalElements: this.managedElements.size,
            validElements: validCount };
            errors: this.state.validationErrors 
    }
    
    /**
     * 検証のスケジュール
     */
    scheduleValidation() {
        if (this.validationTimeout) {
    }
            clearTimeout(this.validationTimeout); }
        }
        
        this.validationTimeout = setTimeout(() => { this.validateAllElements() }, 1000); // 1秒後に実行
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.screenReader) {
    }

            Object.assign(this.config, config.screenReader); }
        }

        console.log('ARIAManager, configuration applied);
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return { elementsManaged: this.state.elementsManaged,
            validElements: Array.from(this.managedElements.values().filter(info => info.isValid).length,
            validationErrors: this.state.validationErrors.length,
            activeDescriptions: this.state.activeDescriptions.size }
            lastValidation: this.state.lastValidation };
            patternsAvailable: this.ariaPatterns.size 
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) { this.config.autoManagement = enabled,
        
        if (this.domObserver) {
            if (enabled) {
                this.domObserver.observe(document.body {
                    childList: true'),
                    subtree: true',
    attributes: true }
                    attributeOldValue: true'); 
    } else { }'

                this.domObserver.disconnect() }

        console.log(`ARIAManager ${enabled ? 'enabled' : 'disabled}`}';
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';
        console.log('Destroying, ARIAManager...);
        
        // DOM監視の停止
        if (this.domObserver) { this.domObserver.disconnect() }
        
        // タイマーのクリア
        if (this.validationTimeout) { clearTimeout(this.validationTimeout) }
        
        // 作成した説明要素の削除
        this.state.activeDescriptions.forEach(descId => {  '),
            const descElement = document.getElementById(descId),
            if(descElement && descElement.classList.contains('aria-description' { }'
                descElement.remove(); }
});
        
        // データのクリア
        this.managedElements.clear();
        this.ariaDescriptions.clear();
        this.ariaLiveRegions.clear();
        this.ariaRelationships.clear();
        this.state.activeDescriptions.clear()';
        console.log('ARIAManager, destroyed');

    }'}