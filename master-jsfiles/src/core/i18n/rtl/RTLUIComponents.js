import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import { getRTLLanguageDetector } from './RTLLanguageDetector.js';
import { getRTLLayoutManager } from './RTLLayoutManager.js';

/**
 * RTL対応UIコンポーネントクラス - RTL言語用の特殊UIコンポーネント
 */
export class RTLUIComponents {
    constructor() {
        this.rtlDetector = getRTLLanguageDetector();
        this.layoutManager = getRTLLayoutManager();
        
        // コンポーネントファクトリ
        this.componentFactories = new Map([
            ['input', this.createRTLInput.bind(this)],
            ['textarea', this.createRTLTextArea.bind(this)],
            ['select', this.createRTLSelect.bind(this)],
            ['menu', this.createRTLMenu.bind(this)],
            ['navigation', this.createRTLNavigation.bind(this)],
            ['breadcrumb', this.createRTLBreadcrumb.bind(this)],
            ['pagination', this.createRTLPagination.bind(this)],
            ['dialog', this.createRTLDialog.bind(this)],
            ['tooltip', this.createRTLTooltip.bind(this)],
            ['dropdown', this.createRTLDropdown.bind(this)]
        ]);
        
        // RTL対応のデフォルトスタイル
        this.defaultRTLStyles = {
            input: {
                direction: 'rtl',
                textAlign: 'right',
                paddingRight: '12px',
                paddingLeft: '8px'
            },
            button: {
                direction: 'rtl',
                textAlign: 'center'
            },
            menu: {
                direction: 'rtl',
                textAlign: 'right'
            },
            dialog: {
                direction: 'rtl',
                textAlign: 'right'
            }
        };
        
        // 登録済みコンポーネント
        this.registeredComponents = new Map();
        
        console.log('RTLUIComponents initialized');
    }
    
    /**
     * RTL対応コンポーネントを作成
     */
    createRTLComponent(type, options = {}) {
        try {
            const factory = this.componentFactories.get(type);
            if (!factory) {
                throw new Error(`Unknown RTL component type: ${type}`);
            }
            
            const component = factory(options);
            
            // コンポーネントを登録
            const componentId = this.generateComponentId(type);
            this.registeredComponents.set(componentId, {
                id: componentId,
                type: type,
                element: component,
                options: options,
                createdAt: new Date().toISOString()
            });
            
            // RTLレイアウトを適用
            this.layoutManager.applyRTLLayout(component, {
                componentType: type,
                ...options
            });
            
            return { component, componentId };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'RTL_COMPONENT_CREATION_ERROR', {
                type: type,
                options: options
            });
            return null;
        }
    }
    
    /**
     * RTL対応入力フィールド
     */
    createRTLInput(options = {}) {
        const {
            type = 'text',
            placeholder = '',
            value = '',
            language = 'ar',
            autoDirection = true,
            validateRTL = true,
            className = '',
            id = ''
        } = options;
        
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.value = value;
        input.className = `rtl-input ${className}`;
        if (id) input.id = id;
        
        // RTL固有の設定
        Object.assign(input.style, this.defaultRTLStyles.input);
        input.setAttribute('dir', 'rtl');
        input.setAttribute('lang', language);
        
        // 自動方向検出
        if (autoDirection) {
            input.addEventListener('input', (e) => {
                const direction = this.rtlDetector.detectTextDirection(e.target.value);
                if (direction.confidence > 0.7) {
                    e.target.style.direction = direction.direction;
                    e.target.style.textAlign = direction.direction === 'rtl' ? 'right' : 'left';
                }
            });
        }
        
        // RTL文字検証
        if (validateRTL) {
            input.addEventListener('blur', (e) => {
                const hasRTL = this.rtlDetector.containsRTLCharacters(e.target.value);
                input.classList.toggle('contains-rtl', hasRTL);
            });
        }
        
        return input;
    }
    
    /**
     * RTL対応テキストエリア
     */
    createRTLTextArea(options = {}) {
        const {
            rows = 4,
            cols = 50,
            placeholder = '',
            value = '',
            language = 'ar',
            autoResize = true,
            className = '',
            id = ''
        } = options;
        
        const textarea = document.createElement('textarea');
        textarea.rows = rows;
        textarea.cols = cols;
        textarea.placeholder = placeholder;
        textarea.value = value;
        textarea.className = `rtl-textarea ${className}`;
        if (id) textarea.id = id;
        
        // RTL設定
        Object.assign(textarea.style, this.defaultRTLStyles.input);
        textarea.setAttribute('dir', 'rtl');
        textarea.setAttribute('lang', language);
        
        // 自動リサイズ
        if (autoResize) {
            textarea.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
            });
        }
        
        return textarea;
    }
    
    /**
     * RTL対応セレクトボックス
     */
    createRTLSelect(options = {}) {
        const {
            options: selectOptions = [],
            value = '',
            language = 'ar',
            className = '',
            id = ''
        } = options;
        
        const select = document.createElement('select');
        select.className = `rtl-select ${className}`;
        if (id) select.id = id;
        
        // オプション追加
        selectOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value || option;
            opt.textContent = option.text || option;
            if (option.value === value) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
        
        // RTL設定
        Object.assign(select.style, this.defaultRTLStyles.input);
        select.setAttribute('dir', 'rtl');
        select.setAttribute('lang', language);
        
        return select;
    }
    
    /**
     * RTL対応メニュー
     */
    createRTLMenu(options = {}) {
        const {
            items = [],
            orientation = 'vertical',
            language = 'ar',
            className = '',
            id = ''
        } = options;
        
        const menu = document.createElement('ul');
        menu.className = `rtl-menu rtl-menu-${orientation} ${className}`;
        if (id) menu.id = id;
        
        // メニュー項目を追加
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'rtl-menu-item';
            
            if (typeof item === 'string') {
                li.textContent = item;
            } else {
                li.innerHTML = item.html || item.text || '';
                if (item.onClick) {
                    li.addEventListener('click', item.onClick);
                }
                if (item.submenu) {
                    const submenu = this.createRTLMenu({
                        items: item.submenu,
                        orientation: orientation,
                        language: language,
                        className: 'rtl-submenu'
                    });
                    li.appendChild(submenu.component);
                }
            }
            
            menu.appendChild(li);
        });
        
        // RTL設定
        Object.assign(menu.style, this.defaultRTLStyles.menu);
        menu.setAttribute('dir', 'rtl');
        menu.setAttribute('lang', language);
        
        return menu;
    }
    
    /**
     * RTL対応ナビゲーション
     */
    createRTLNavigation(options = {}) {
        const {
            links = [],
            language = 'ar',
            showIcons = true,
            className = '',
            id = ''
        } = options;
        
        const nav = document.createElement('nav');
        nav.className = `rtl-navigation ${className}`;
        if (id) nav.id = id;
        
        const ul = document.createElement('ul');
        ul.className = 'rtl-nav-list';
        
        links.forEach(link => {
            const li = document.createElement('li');
            li.className = 'rtl-nav-item';
            
            const a = document.createElement('a');
            a.href = link.href || '#';
            a.className = 'rtl-nav-link';
            
            if (showIcons && link.icon) {
                const icon = document.createElement('span');
                icon.className = `rtl-nav-icon ${link.icon}`;
                a.appendChild(icon);
            }
            
            const text = document.createElement('span');
            text.className = 'rtl-nav-text';
            text.textContent = link.text || link;
            a.appendChild(text);
            
            li.appendChild(a);
            ul.appendChild(li);
        });
        
        nav.appendChild(ul);
        
        // RTL設定
        nav.style.direction = 'rtl';
        nav.style.textAlign = 'right';
        nav.setAttribute('dir', 'rtl');
        nav.setAttribute('lang', language);
        
        return nav;
    }
    
    /**
     * RTL対応パンくずリスト
     */
    createRTLBreadcrumb(options = {}) {
        const {
            items = [],
            separator = '/',
            language = 'ar',
            className = '',
            id = ''
        } = options;
        
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = `rtl-breadcrumb ${className}`;
        breadcrumb.setAttribute('aria-label', 'Breadcrumb');
        if (id) breadcrumb.id = id;
        
        const ol = document.createElement('ol');
        ol.className = 'rtl-breadcrumb-list';
        
        // RTL言語では順序を逆にする
        const reversedItems = [...items].reverse();
        
        reversedItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'rtl-breadcrumb-item';
            
            if (index === reversedItems.length - 1) {
                // 最後の項目（現在のページ）
                li.textContent = item.text || item;
                li.setAttribute('aria-current', 'page');
            } else {
                const a = document.createElement('a');
                a.href = item.href || '#';
                a.textContent = item.text || item;
                li.appendChild(a);
                
                // セパレータ追加
                const sep = document.createElement('span');
                sep.className = 'rtl-breadcrumb-separator';
                sep.textContent = separator;
                li.appendChild(sep);
            }
            
            ol.appendChild(li);
        });
        
        breadcrumb.appendChild(ol);
        
        // RTL設定
        breadcrumb.style.direction = 'rtl';
        breadcrumb.style.textAlign = 'right';
        breadcrumb.setAttribute('dir', 'rtl');
        breadcrumb.setAttribute('lang', language);
        
        return breadcrumb;
    }
    
    /**
     * RTL対応ページネーション
     */
    createRTLPagination(options = {}) {
        const {
            currentPage = 1,
            totalPages = 10,
            showFirstLast = true,
            showPrevNext = true,
            language = 'ar',
            className = '',
            id = ''
        } = options;
        
        const pagination = document.createElement('nav');
        pagination.className = `rtl-pagination ${className}`;
        pagination.setAttribute('aria-label', 'Pagination');
        if (id) pagination.id = id;
        
        const ul = document.createElement('ul');
        ul.className = 'rtl-pagination-list';
        
        // 最初のページ（RTLでは最後に表示）
        if (showFirstLast && currentPage > 1) {
            const lastLi = this.createPaginationItem('最後', totalPages, 'last');
            ul.appendChild(lastLi);
        }
        
        // 次のページ（RTLでは前に表示）
        if (showPrevNext && currentPage < totalPages) {
            const nextLi = this.createPaginationItem('次', currentPage + 1, 'next');
            ul.appendChild(nextLi);
        }
        
        // ページ番号（逆順で表示）
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = endPage; i >= startPage; i--) {
            const li = this.createPaginationItem(i.toString(), i, i === currentPage ? 'current' : 'page');
            ul.appendChild(li);
        }
        
        // 前のページ（RTLでは後に表示）
        if (showPrevNext && currentPage > 1) {
            const prevLi = this.createPaginationItem('前', currentPage - 1, 'prev');
            ul.appendChild(prevLi);
        }
        
        // 最後のページ（RTLでは最初に表示）
        if (showFirstLast && currentPage < totalPages) {
            const firstLi = this.createPaginationItem('最初', 1, 'first');
            ul.appendChild(firstLi);
        }
        
        pagination.appendChild(ul);
        
        // RTL設定
        pagination.style.direction = 'rtl';
        pagination.style.textAlign = 'right';
        pagination.setAttribute('dir', 'rtl');
        pagination.setAttribute('lang', language);
        
        return pagination;
    }
    
    /**
     * RTL対応ダイアログ
     */
    createRTLDialog(options = {}) {
        const {
            title = '',
            content = '',
            buttons = [],
            modal = true,
            language = 'ar',
            className = '',
            id = ''
        } = options;
        
        const dialog = document.createElement('div');
        dialog.className = `rtl-dialog ${className}`;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', modal.toString());
        if (id) dialog.id = id;
        
        // ダイアログヘッダー
        if (title) {
            const header = document.createElement('div');
            header.className = 'rtl-dialog-header';
            
            const titleEl = document.createElement('h2');
            titleEl.className = 'rtl-dialog-title';
            titleEl.textContent = title;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'rtl-dialog-close';
            closeBtn.innerHTML = '×';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.addEventListener('click', () => {
                dialog.style.display = 'none';
            });
            
            header.appendChild(titleEl);
            header.appendChild(closeBtn);
            dialog.appendChild(header);
        }
        
        // ダイアログコンテンツ
        if (content) {
            const contentEl = document.createElement('div');
            contentEl.className = 'rtl-dialog-content';
            contentEl.innerHTML = content;
            dialog.appendChild(contentEl);
        }
        
        // ダイアログフッター
        if (buttons.length > 0) {
            const footer = document.createElement('div');
            footer.className = 'rtl-dialog-footer';
            
            // RTLでは逆順でボタンを配置
            [...buttons].reverse().forEach(button => {
                const btn = document.createElement('button');
                btn.className = `rtl-dialog-button ${button.type || ''}`;
                btn.textContent = button.text || button;
                if (button.onClick) {
                    btn.addEventListener('click', button.onClick);
                }
                footer.appendChild(btn);
            });
            
            dialog.appendChild(footer);
        }
        
        // RTL設定
        Object.assign(dialog.style, this.defaultRTLStyles.dialog);
        dialog.setAttribute('dir', 'rtl');
        dialog.setAttribute('lang', language);
        
        return dialog;
    }
    
    /**
     * RTL対応ツールチップ
     */
    createRTLTooltip(options = {}) {
        const {
            text = '',
            position = 'top',
            language = 'ar',
            className = '',
            id = ''
        } = options;
        
        const tooltip = document.createElement('div');
        tooltip.className = `rtl-tooltip rtl-tooltip-${position} ${className}`;
        tooltip.setAttribute('role', 'tooltip');
        if (id) tooltip.id = id;
        
        tooltip.textContent = text;
        
        // RTL設定
        tooltip.style.direction = 'rtl';
        tooltip.style.textAlign = 'right';
        tooltip.setAttribute('dir', 'rtl');
        tooltip.setAttribute('lang', language);
        
        return tooltip;
    }
    
    /**
     * RTL対応ドロップダウン
     */
    createRTLDropdown(options = {}) {
        const {
            trigger = '',
            items = [],
            language = 'ar',
            className = '',
            id = ''
        } = options;
        
        const dropdown = document.createElement('div');
        dropdown.className = `rtl-dropdown ${className}`;
        if (id) dropdown.id = id;
        
        // トリガー要素
        const triggerEl = document.createElement('button');
        triggerEl.className = 'rtl-dropdown-trigger';
        triggerEl.textContent = trigger;
        
        // ドロップダウンメニュー
        const menu = document.createElement('div');
        menu.className = 'rtl-dropdown-menu';
        menu.style.display = 'none';
        
        items.forEach(item => {
            const itemEl = document.createElement('a');
            itemEl.className = 'rtl-dropdown-item';
            itemEl.href = item.href || '#';
            itemEl.textContent = item.text || item;
            if (item.onClick) {
                itemEl.addEventListener('click', item.onClick);
            }
            menu.appendChild(itemEl);
        });
        
        // トグル機能
        triggerEl.addEventListener('click', () => {
            const isVisible = menu.style.display !== 'none';
            menu.style.display = isVisible ? 'none' : 'block';
        });
        
        dropdown.appendChild(triggerEl);
        dropdown.appendChild(menu);
        
        // RTL設定
        dropdown.style.direction = 'rtl';
        dropdown.style.textAlign = 'right';
        dropdown.setAttribute('dir', 'rtl');
        dropdown.setAttribute('lang', language);
        
        return dropdown;
    }
    
    /**
     * ヘルパー関数群
     */
    
    createPaginationItem(text, page, type) {
        const li = document.createElement('li');
        li.className = `rtl-pagination-item rtl-pagination-${type}`;
        
        if (type === 'current') {
            li.textContent = text;
            li.setAttribute('aria-current', 'page');
        } else {
            const a = document.createElement('a');
            a.href = `#page-${page}`;
            a.textContent = text;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                // ページ変更イベントを発火
                const event = new CustomEvent('pageChange', {
                    detail: { page: page, type: type }
                });
                document.dispatchEvent(event);
            });
            li.appendChild(a);
        }
        
        return li;
    }
    
    generateComponentId(type) {
        return `rtl-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 公開API
     */
    
    /**
     * 登録済みコンポーネントを取得
     */
    getRegisteredComponent(componentId) {
        return this.registeredComponents.get(componentId) || null;
    }
    
    /**
     * コンポーネントを破棄
     */
    destroyComponent(componentId) {
        const component = this.registeredComponents.get(componentId);
        if (component) {
            // RTLレイアウトを除去
            this.layoutManager.removeRTLLayout(component.element);
            
            // 要素を削除
            if (component.element.parentNode) {
                component.element.parentNode.removeChild(component.element);
            }
            
            // 登録から削除
            this.registeredComponents.delete(componentId);
            return true;
        }
        return false;
    }
    
    /**
     * 全コンポーネントを取得
     */
    getAllComponents() {
        return Array.from(this.registeredComponents.values());
    }
    
    /**
     * コンポーネントファクトリを追加
     */
    addComponentFactory(type, factory) {
        this.componentFactories.set(type, factory);
        console.log(`Component factory added: ${type}`);
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            availableComponentTypes: Array.from(this.componentFactories.keys()),
            registeredComponentsCount: this.registeredComponents.size,
            registeredComponents: this.getAllComponents().map(comp => ({
                id: comp.id,
                type: comp.type,
                createdAt: comp.createdAt
            }))
        };
    }
}

// シングルトンインスタンス
let rtlUIComponentsInstance = null;

/**
 * RTLUIComponentsのシングルトンインスタンスを取得
 */
export function getRTLUIComponents() {
    if (!rtlUIComponentsInstance) {
        rtlUIComponentsInstance = new RTLUIComponents();
    }
    return rtlUIComponentsInstance;
}