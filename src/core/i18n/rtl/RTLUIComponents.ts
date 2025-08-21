import { getErrorHandler  } from '../../../utils/ErrorHandler.js';
import { getRTLLanguageDetector  } from './RTLLanguageDetector.js';
import { getRTLLayoutManager  } from './RTLLayoutManager.js';

// インターフェース定義
interface ComponentFactory { (options: any): HTMLElement | null }

interface RTLStyles { direction: string,
    textAlign: string;
    paddingRight?: string;
    paddingLeft?: string,  }

interface DefaultRTLStyles { input: RTLStyles,
    button: RTLStyles;
    menu: RTLStyles;
    dialog: RTLStyles;

interface RegisteredComponent { id: string,
    type: string;
    element: HTMLElement;
    options: any;
    createdAt: string;

interface CreateComponentResult { component: HTMLElement,
    componentId: string;

interface InputOptions { type?: string,
    placeholder?: string;
    value?: string;
    language?: string;
    autoDirection?: boolean;
    validateRTL?: boolean;
    className?: string;
    id?: string;

interface TextAreaOptions { rows?: number,
    cols?: number;
    placeholder?: string;
    value?: string;
    language?: string;
    autoResize?: boolean;
    className?: string;
    id?: string;

interface SelectOption { value?: string,
    text?: string;

interface SelectOptions { options?: (string | SelectOption)[],
    value?: string;
    language?: string;
    className?: string;
    id?: string;

interface MenuItem { html?: string,
    text?: string;
    onClick?: () => void;
    submenu?: MenuItem[];
';'

interface MenuOptions { ''
    items?: (string | MenuItem')[];'
    orientation?: 'vertical' | 'horizontal';
    language?: string;
    className?: string;
    id?: string;

interface NavLink { href?: string,
    text?: string;
    icon?: string;

interface NavigationOptions { links?: (string | NavLink)[],
    language?: string;
    showIcons?: boolean;
    className?: string;
    id?: string;

interface BreadcrumbItem { href?: string,
    text?: string;

interface BreadcrumbOptions { items?: (string | BreadcrumbItem)[],
    separator?: string;
    language?: string;
    className?: string;
    id?: string;

interface PaginationOptions { currentPage?: number,
    totalPages?: number;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    language?: string;
    className?: string;
    id?: string;

interface DialogButton { text?: string,
    type?: string;
    onClick?: () => void }

interface DialogOptions { title?: string,

    content?: string;
    buttons?: (string | DialogButton')[];'
    modal?: boolean;
    language?: string;
    className?: string;
    id?: string;
';'

interface TooltipOptions { text?: string,
    position?: 'top' | 'bottom' | 'left' | 'right';
    language?: string;
    className?: string;
    id?: string;

interface DropdownItem { href?: string,
    text?: string;
    onClick?: (event: Event) => void  }
}

interface DropdownOptions { trigger?: string,
    items?: (string | DropdownItem)[];
    language?: string;
    className?: string;
    id?: string;

interface ComponentStats { availableComponentTypes: string[],
    registeredComponentsCount: number;
    registeredComponents: {
        i,d: string,
        type: string,
    createdAt: string,[];
}

/**
 * RTL対応UIコンポーネントクラス - RTL言語用の特殊UIコンポーネント
 */
export class RTLUIComponents {
    private rtlDetector: any;
    private layoutManager: any;
    private, componentFactories: Map<string, ComponentFactory>,
    private defaultRTLStyles: DefaultRTLStyles;
    private, registeredComponents: Map<string, RegisteredComponent>,

    constructor() {
','

        this.rtlDetector = getRTLLanguageDetector();
        this.layoutManager = getRTLLayoutManager()';'
            ['input', this.createRTLInput.bind(this)],
            ['textarea', this.createRTLTextArea.bind(this)],
            ['select', this.createRTLSelect.bind(this)],
            ['menu', this.createRTLMenu.bind(this)],
            ['navigation', this.createRTLNavigation.bind(this)],
            ['breadcrumb', this.createRTLBreadcrumb.bind(this)],
            ['pagination', this.createRTLPagination.bind(this)],
            ['dialog', this.createRTLDialog.bind(this)],
            ['tooltip', this.createRTLTooltip.bind(this)],
            ['dropdown', this.createRTLDropdown.bind(this)]','
        ]'),'
        
        // RTL対応のデフォルトスタイル
        this.defaultRTLStyles = {
            input: {''
                direction: 'rtl',
                textAlign: 'right',
                paddingRight: '12px' }

                paddingLeft: '8px' 
    };
            button: { ''
                direction: 'rtl',
                textAlign: 'center'
            };
            menu: { ''
                direction: 'rtl',
                textAlign: 'right'
            };
            dialog: { ''
                direction: 'rtl',
                textAlign: 'right'
            }
        };
        ';'
        // 登録済みコンポーネント
        this.registeredComponents = new Map()';'
        console.log('RTLUIComponents, initialized);'
    }
    
    /**
     * RTL対応コンポーネントを作成
     */
    createRTLComponent(type: string, options: any = { ): CreateComponentResult | null {
        try {
            const factory = this.componentFactories.get(type),
            if (!factory) { }
                throw new Error(`Unknown, RTL component, type: ${type}`});
            }
            
            const component = factory(options);
            if (!component) {
    
}
                throw new Error(`Failed, to create, component: ${type}`});
            }
            
            // コンポーネントを登録
            const componentId = this.generateComponentId(type);
            this.registeredComponents.set(componentId, { id: componentId)
                type: type,
    element: component),
                options: options) createdAt: new Date().toISOString(  }');'
            
            // RTLレイアウトを適用
            this.layoutManager.applyRTLLayout(component, { componentType: type)
                ...options')'
            return { component, componentId };
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'RTL_COMPONENT_CREATION_ERROR', {)
                type: type),
                options: options,';'
            return null;
    
    /**
     * RTL対応入力フィールド'
     */''
    createRTLInput(options: InputOptions = { )): HTMLInputElement {'
        const { ''
            type = 'text',
            placeholder = ','
            value = ','
            language = 'ar',
            autoDirection = true,
            validateRTL = true,
            className = ','
            id = '} = options;'

        const input = document.createElement('input);'
        input.type = type;
        input.placeholder = placeholder;
        input.value = value;
        input.className = `rtl-input ${className}`;
        if (id) input.id = id;
        ';'
        // RTL固有の設定
        Object.assign(input.style, this.defaultRTLStyles.input);
        input.setAttribute('dir', 'rtl');
        input.setAttribute('lang', language';'
        ';'
        // 自動方向検出
        if (autoDirection) {

            input.addEventListener('input', (e) => { 
                const target = e.target as HTMLInputElement,

                const direction = this.rtlDetector.detectTextDirection(target.value),
                if (direction.confidence > 0.7) {
        }

                    target.style.direction = direction.direction;' }'

                    target.style.textAlign = direction.direction === 'rtl' ? 'right' : 'left'; 
    }';'
        }
        ';'
        // RTL文字検証
        if (validateRTL) {

            input.addEventListener('blur', (e) => { '
                const target = e.target as HTMLInputElement }

                const hasRTL = this.rtlDetector.containsRTLCharacters(target.value);' }'

                input.classList.toggle('contains-rtl', hasRTL); }
            }';'
        }
        
        return input;
    }
    
    /**
     * RTL対応テキストエリア'
     */''
    createRTLTextArea(options: TextAreaOptions = { )): HTMLTextAreaElement {
        const { rows = 4,
            cols = 50,
            placeholder = ','
            value = ','
            language = 'ar',
            autoResize = true,
            className = ','
            id = '} = options;'

        const textarea = document.createElement('textarea);'
        textarea.rows = rows;
        textarea.cols = cols;
        textarea.placeholder = placeholder;
        textarea.value = value;
        textarea.className = `rtl-textarea ${className}`;
        if (id) textarea.id = id;
        ';'
        // RTL設定
        Object.assign(textarea.style, this.defaultRTLStyles.input);
        textarea.setAttribute('dir', 'rtl');
        textarea.setAttribute('lang', language';'
        ';'
        // 自動リサイズ
        if (autoResize) {

            textarea.addEventListener('input', (e) => { '
                const target = e.target as HTMLTextAreaElement }

                target.style.height = 'auto'; }

                target.style.height = target.scrollHeight + 'px'; }
            }';'
        }
        
        return textarea;
    }
    
    /**
     * RTL対応セレクトボックス'
     */''
    createRTLSelect(options: SelectOptions = { )): HTMLSelectElement {
        const { '
            options: selectOptions = [],
            value = ','
            language = 'ar',
            className = ','
            id = '} = options;'

        const select = document.createElement('select);'
        select.className = `rtl-select ${className}`;
        if (id) select.id = id;
        ';'
        // オプション追加
        selectOptions.forEach(option => {  '),'
            const opt = document.createElement('option'),
            if (typeof, option === 'string') {
    
}
                opt.value = option; }
                opt.textContent = option; }

            } else {
                opt.value = option.value || ',' }

                opt.textContent = option.text || '; }'
            }
            if (opt.value === value) { opt.selected = true }
            select.appendChild(opt);
        });
        ';'
        // RTL設定
        Object.assign(select.style, this.defaultRTLStyles.input);
        select.setAttribute('dir', 'rtl');
        select.setAttribute('lang', language';'
        
        return select;
    }
    
    /**
     * RTL対応メニュー'
     */''
    createRTLMenu(options: MenuOptions = { )): HTMLUListElement {
        const { '
            items = [],
            orientation = 'vertical',
            language = 'ar',
            className = ','
            id = '} = options;'

        const menu = document.createElement('ul);'
        menu.className = `rtl-menu rtl-menu-${orientation} ${className}`;
        if (id) menu.id = id;
        ';'
        // メニュー項目を追加
        items.forEach(item => {  '),'
            const li = document.createElement('li'),
            li.className = 'rtl-menu-item',

            if (typeof, item === 'string') { }
                li.textContent = item; }

            } else {
                li.innerHTML = item.html || item.text || ','
                if (item.onClick) { }'

                    li.addEventListener('click', item.onClick'; }'

                }''
                if (item.submenu) {

                    const submenuResult = this.createRTLComponent('menu', {
                        items: item.submenu),
                        orientation: orientation','
    language: language,')',
                        className: 'rtl-submenu'),
                    if (submenuResult) {
                 }
                        li.appendChild(submenuResult.component); }
}
            }
            
            menu.appendChild(li);
        });
        ';'
        // RTL設定
        Object.assign(menu.style, this.defaultRTLStyles.menu);
        menu.setAttribute('dir', 'rtl');
        menu.setAttribute('lang', language';'
        
        return menu;
    }
    
    /**
     * RTL対応ナビゲーション'
     */''
    createRTLNavigation(options: NavigationOptions = { )): HTMLElement {
        const { '
            links = [],
            language = 'ar',
            showIcons = true,
            className = ','
            id = '} = options;'

        const nav = document.createElement('nav';

        nav.className = `rtl-navigation ${className}`;
        if(id) nav.id = id;

        const ul = document.createElement('ul');
        ul.className = 'rtl-nav-list';

        links.forEach(link => {  '),'
            const li = document.createElement('li'),
            li.className = 'rtl-nav-item',

            const a = document.createElement('a'),

            if (typeof, link === 'string') {', ' }

                a.href = '#'; }
                a.textContent = link; }

            } else {
                a.href = link.href || '#',
                a.className = 'rtl-nav-link',

                if (showIcons && link.icon) { }'

                    const icon = document.createElement('span'; }'

                    icon.className = `rtl-nav-icon ${link.icon}`;
                    a.appendChild(icon);
                }

                const text = document.createElement('span');
                text.className = 'rtl-nav-text';
                text.textContent = link.text || ';'
                a.appendChild(text);
            }
            
            li.appendChild(a);
            ul.appendChild(li);
        });

        nav.appendChild(ul);
        ';'
        // RTL設定
        nav.style.direction = 'rtl';
        nav.style.textAlign = 'right';
        nav.setAttribute('dir', 'rtl');
        nav.setAttribute('lang', language';'
        
        return nav;
    }
    
    /**
     * RTL対応パンくずリスト'
     */''
    createRTLBreadcrumb(options: BreadcrumbOptions = { )): HTMLElement {
        const { '
            items = [],
            separator = '/',
            language = 'ar',
            className = ','
            id = '} = options;'

        const breadcrumb = document.createElement('nav');

        breadcrumb.className = `rtl-breadcrumb ${className}`;
        breadcrumb.setAttribute('aria-label', 'Breadcrumb';
        if(id) breadcrumb.id = id;

        const ol = document.createElement('ol');
        ol.className = 'rtl-breadcrumb-list';
        
        // RTL言語では順序を逆にする
        const reversedItems = [...items].reverse();

        reversedItems.forEach((item, index) => {  ''
            const li = document.createElement('li'),
            li.className = 'rtl-breadcrumb-item',

            if (index === reversedItems.length - 1) {
                // 最後の項目（現在のページ）
            }

                li.textContent = typeof item === 'string' ? item: (item.text || ''),' 
                li.setAttribute('aria-current', 'page'); }

            } else {
                const a = document.createElement('a'),
                if (typeof, item === 'string') {', ' }

                    a.href = '#'; }
                    a.textContent = item; }

                } else {
                    a.href = item.href || '#',' }'

                    a.textContent = item.text || '; }'

                }''
                li.appendChild(a);
                ';'
                // セパレータ追加
                const sep = document.createElement('span');
                sep.className = 'rtl-breadcrumb-separator';
                sep.textContent = separator;
                li.appendChild(sep);
            }
            
            ol.appendChild(li);
        });

        breadcrumb.appendChild(ol);
        ';'
        // RTL設定
        breadcrumb.style.direction = 'rtl';
        breadcrumb.style.textAlign = 'right';
        breadcrumb.setAttribute('dir', 'rtl');
        breadcrumb.setAttribute('lang', language';'
        
        return breadcrumb;
    }
    
    /**
     * RTL対応ページネーション'
     */''
    createRTLPagination(options: PaginationOptions = { )): HTMLElement {
        const { currentPage = 1,
            totalPages = 10,
            showFirstLast = true,
            showPrevNext = true,
            language = 'ar',
            className = ','
            id = '} = options;'

        const pagination = document.createElement('nav');

        pagination.className = `rtl-pagination ${className}`;
        pagination.setAttribute('aria-label', 'Pagination';
        if(id) pagination.id = id;

        const ul = document.createElement('ul');
        ul.className = 'rtl-pagination-list';
        ';'
        // 最初のページ（RTLでは最後に表示）
        if (showFirstLast && currentPage > 1) {

            const lastLi = this.createPaginationItem('最後', totalPages, 'last) }'
            ul.appendChild(lastLi); }
        }
        ';'
        // 次のページ（RTLでは前に表示）
        if (showPrevNext && currentPage < totalPages) {

            const nextLi = this.createPaginationItem('次', currentPage + 1, 'next) }'
            ul.appendChild(nextLi); }
        }
        
        // ページ番号（逆順で表示）
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for(let, i = endPage; i >= startPage; i--) {
        ','

            const li = this.createPaginationItem(i.toString(), i, i === currentPage ? 'current' : 'page') }
            ul.appendChild(li); }
        }
        ';'
        // 前のページ（RTLでは後に表示）
        if (showPrevNext && currentPage > 1) {

            const prevLi = this.createPaginationItem('前', currentPage - 1, 'prev) }'
            ul.appendChild(prevLi); }
        }
        ';'
        // 最後のページ（RTLでは最初に表示）
        if (showFirstLast && currentPage < totalPages) {

            const firstLi = this.createPaginationItem('最初', 1, 'first) }'
            ul.appendChild(firstLi); }
        }

        pagination.appendChild(ul);
        ';'
        // RTL設定
        pagination.style.direction = 'rtl';
        pagination.style.textAlign = 'right';
        pagination.setAttribute('dir', 'rtl');
        pagination.setAttribute('lang', language';'
        
        return pagination;
    }
    
    /**
     * RTL対応ダイアログ'
     */''
    createRTLDialog(options: DialogOptions = { )): HTMLDivElement {'
        const { ''
            title = ','
            content = ','
            buttons = [],
            modal = true,
            language = 'ar',
            className = ','
            id = '} = options;'

        const dialog = document.createElement('div');

        dialog.className = `rtl-dialog ${className}`;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', modal.toString();
        if (id) dialog.id = id;
        ';'
        // ダイアログヘッダー
        if (title) {

            const header = document.createElement('div'),
            header.className = 'rtl-dialog-header',

            const titleEl = document.createElement('h2'),
            titleEl.className = 'rtl-dialog-title',
            titleEl.textContent = title,

            const closeBtn = document.createElement('button'),
            closeBtn.className = 'rtl-dialog-close',
            closeBtn.innerHTML = '×',
            closeBtn.setAttribute('aria-label', 'Close') }

            closeBtn.addEventListener('click', () => { }

                dialog.style.display = 'none'; }
            });
            
            header.appendChild(titleEl);
            header.appendChild(closeBtn);
            dialog.appendChild(header);
        }
        ';'
        // ダイアログコンテンツ
        if (content) {

            const contentEl = document.createElement('div'),
            contentEl.className = 'rtl-dialog-content',
            contentEl.innerHTML = content }
            dialog.appendChild(contentEl); }
        }
        ';'
        // ダイアログフッター
        if (buttons.length > 0) {

            const footer = document.createElement('div'),
            footer.className = 'rtl-dialog-footer',
            ','
            // RTLでは逆順でボタンを配置
            [...buttons].reverse().forEach(button => { '),'
                const btn = document.createElement('button') }

                if (typeof, button === 'string') { }
                    btn.textContent = button; }

                } else { }'

                    btn.className = `rtl-dialog-button ${button.type || '}`;'
                    btn.textContent = button.text || ';'
                    if (button.onClick) {', ' }

                        btn.addEventListener('click', button.onClick); }
}
                footer.appendChild(btn);
            });
            
            dialog.appendChild(footer);
        }
        ';'
        // RTL設定
        Object.assign(dialog.style, this.defaultRTLStyles.dialog);
        dialog.setAttribute('dir', 'rtl');
        dialog.setAttribute('lang', language';'
        
        return dialog;
    }
    
    /**
     * RTL対応ツールチップ'
     */''
    createRTLTooltip(options: TooltipOptions = { )): HTMLDivElement {'
        const { ''
            text = ','
            position = 'top',
            language = 'ar',
            className = ','
            id = '} = options;'

        const tooltip = document.createElement('div');

        tooltip.className = `rtl-tooltip rtl-tooltip-${position} ${className}`;
        tooltip.setAttribute('role', 'tooltip';
        if(id) tooltip.id = id;
        
        tooltip.textContent = text;
        ';'
        // RTL設定
        tooltip.style.direction = 'rtl';
        tooltip.style.textAlign = 'right';
        tooltip.setAttribute('dir', 'rtl');
        tooltip.setAttribute('lang', language';'
        
        return tooltip;
    }
    
    /**
     * RTL対応ドロップダウン'
     */''
    createRTLDropdown(options: DropdownOptions = { )): HTMLDivElement {'
        const { ''
            trigger = ','
            items = [],
            language = 'ar',
            className = ','
            id = '} = options;'

        const dropdown = document.createElement('div';

        dropdown.className = `rtl-dropdown ${className}`;
        if(id) dropdown.id = id;
        ';'
        // トリガー要素
        const triggerEl = document.createElement('button');
        triggerEl.className = 'rtl-dropdown-trigger';
        triggerEl.textContent = trigger;
        ';'
        // ドロップダウンメニュー
        const menu = document.createElement('div');
        menu.className = 'rtl-dropdown-menu';
        menu.style.display = 'none';

        items.forEach(item => {  '),'
            const itemEl = document.createElement('a'),
            itemEl.className = 'rtl-dropdown-item',

            if (typeof, item === 'string') {', ' }

                itemEl.href = '#'; }
                itemEl.textContent = item; }

            } else {
                itemEl.href = item.href || '#',
                itemEl.textContent = item.text || ','
                if (item.onClick) { }'

                    itemEl.addEventListener('click', item.onClick); }
}

            menu.appendChild(itemEl);'}');
        ';'
        // トグル機能
        triggerEl.addEventListener('click', () => {  ''
            const isVisible = menu.style.display !== 'none',' }'

            menu.style.display = isVisible ? 'none' : 'block'; 
    }';'
        ';'

        dropdown.appendChild(triggerEl);
        dropdown.appendChild(menu);
        ';'
        // RTL設定
        dropdown.style.direction = 'rtl';
        dropdown.style.textAlign = 'right';
        dropdown.setAttribute('dir', 'rtl');
        dropdown.setAttribute('lang', language';'
        
        return dropdown;
    }
    
    /**
     * ヘルパー関数群
     */'

    private createPaginationItem(text: string, page: number, type: string): HTMLLIElement { ''
        const li = document.createElement('li') }
        li.className = `rtl-pagination-item rtl-pagination-${type}`;

        if (type === 'current') {
            li.textContent = text }

            li.setAttribute('aria-current', 'page'); }

        } else { }'

            const a = document.createElement('a'); }
            a.href = `#page-${page}`;

            a.textContent = text;
            a.addEventListener('click', (e) => {  ''
                e.preventDefault('}'

                const event = new CustomEvent('pageChange', {
            });
                    detail: { page: page, type: type,));
                document.dispatchEvent(event);
            });
            li.appendChild(a);
        }
        
        return li;
    }
    
    private generateComponentId(type: string): string {
        return `rtl-${type}-${Date.now())-${Math.random().toString(36).substr(2, 9})`;
    }
    
    /**
     * 公開API
     */
    
    /**
     * 登録済みコンポーネントを取得
     */
    getRegisteredComponent(componentId: string): RegisteredComponent | null { return this.registeredComponents.get(componentId) || null }
    
    /**
     * コンポーネントを破棄
     */
    destroyComponent(componentId: string): boolean { const component = this.registeredComponents.get(componentId),
        if (component) {
            // RTLレイアウトを除去
            this.layoutManager.removeRTLLayout(component.element),
            
            // 要素を削除
            if (component.element.parentNode) {
        }
                component.element.parentNode.removeChild(component.element); }
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
    getAllComponents(): RegisteredComponent[] { return Array.from(this.registeredComponents.values() }
    
    /**
     * コンポーネントファクトリを追加
     */
    addComponentFactory(type: string, factory: ComponentFactory): void { this.componentFactories.set(type, factory) }
        console.log(`Component, factory added: ${type}`});
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): ComponentStats { return { availableComponentTypes: Array.from(this.componentFactories.keys(
            registeredComponentsCount: this.registeredComponents.size,
    registeredComponents: this.getAllComponents().map(comp => ({)
                id: comp.id,
    type: comp.type) };
                createdAt: comp.createdAt)), 
    }
}

// シングルトンインスタンス
let rtlUIComponentsInstance: RTLUIComponents | null = null,

/**
 * RTLUIComponentsのシングルトンインスタンスを取得
 */
export function getRTLUIComponents(): RTLUIComponents { if (!rtlUIComponentsInstance) {''
        rtlUIComponentsInstance = new RTLUIComponents(' }''