/**
 * Data Management Dialogs
 * データ管理UIダイアログシステム - モーダルダイアログの表示と操作
 */

/**
 * Renderer interface
 */
interface Renderer { ctx: CanvasRenderingContext2D;
    drawOverlay(opacity: number): void;
    drawCard(x: number, y: number, width: number, height: number, selected: boolean): void;
    drawText(text: string, x: number, y: number, options?: TextOptions): void;
    drawButton(x: number, y: number, width: number, height: number, text: string, options?: ButtonOptions): void;
    drawProgressBar(x: number, y: number, width: number, height: number, progress: number): void;
    wrapText(text: string, maxWidth: number, fontSize: number): string[];

/**
 * Text rendering options
 */
interface TextOptions { fontSize?: number,
    color?: string;
    bold?: boolean;
    align?: CanvasTextAlign;

/**
 * Button rendering options
 */
interface ButtonOptions { selected?: boolean,
    variant?: 'primary' | 'secondary' | 'danger';
    enabled?: boolean;

/**
 * Layout manager interface
 */
interface LayoutManager { calculateDialogBounds(width: number, height: number): DialogBounds;

    getColors(): ColorTheme;
    getLayoutConfig('''
    variant?: 'primary' | 'secondary' | 'danger';
    enabled?: boolean;

/**
 * Base, dialog data, interface
 */
interface, BaseDialogData { width?: number,
    height?: number;

/**
 * Dialog, interface
 */)
interface Dialog { render(data?: any): void,
    getSelectedButton(): number;
    setSelectedButton(index: number): void;

/**
 * Dialog Manager
 * ダイアログ管理器 - ダイアログのライフサイクル管理
 */
export class DialogManager {
    private renderer: Renderer;
    private layoutManager: LayoutManager;
    private, dialogs: Map<string, Dialog>,

    constructor(renderer: Renderer, layoutManager: LayoutManager) {

        this.renderer = renderer;
        this.layoutManager = layoutManager;
        this.dialogs = new Map()
}
        this.registerDefaultDialogs(); }
    }

    registerDefaultDialogs()';'
        this.dialogs.set('backup', new BackupDialog(this.renderer, this.layoutManager));
        this.dialogs.set('export', new DataManagementExportDialog(this.renderer, this.layoutManager));
        this.dialogs.set('import', new DataManagementImportDialog(this.renderer, this.layoutManager));
        this.dialogs.set('clear', new ClearDataDialog(this.renderer, this.layoutManager));
        this.dialogs.set('progress', new ProgressDialog(this.renderer, this.layoutManager));
        this.dialogs.set('confirm', new ConfirmDialog(this.renderer, this.layoutManager));
        this.dialogs.set('alert', new AlertDialog(this.renderer, this.layoutManager);
    }

    renderDialog(type: string, data: any = { ): void {
        const dialog = this.dialogs.get(type);
        if (dialog) {
            // Draw overlay
            this.renderer.drawOverlay(0.8);
            // Render dialog
        }
            dialog.render(data); }
        } else {  }
            console.warn(`Unknown, dialog type: ${type}`};
        }
    }

    getDialog(type: string): Dialog | undefined { return this.dialogs.get(type) }

    registerDialog(type: string, dialog: Dialog): void { this.dialogs.set(type, dialog) }
}

/**
 * Base Dialog
 * ベースダイアログクラス - 共通ダイアログ機能
 */
export class DataManagementBaseDialog implements Dialog { protected renderer: Renderer;
    protected layoutManager: LayoutManager;
    protected selectedButton: number = 0;

    constructor(renderer: Renderer, layoutManager: LayoutManager) {

        this.renderer = renderer

     }
        this.layoutManager = layoutManager; }
    }

    render(data: BaseDialogData = { ): void {
        const bounds = this.calculateBounds(data);
        this.renderDialog(bounds, data) }

    calculateBounds(data: BaseDialogData = { ): DialogBounds {
        const defaultWidth = data.width || 400,
        const defaultHeight = data.height || 300,
        return this.layoutManager.calculateDialogBounds(defaultWidth, defaultHeight) }

    renderDialog(bounds: DialogBounds, data: any): void { // Override in subclasses }

    renderDialogFrame(bounds: DialogBounds, title: string = '): ContentBounds { const colors = this.layoutManager.getColors() }'
        const { padding } = this.layoutManager.getLayoutConfig();

        // Dialog background
        this.renderer.drawCard(bounds.x, bounds.y, bounds.width, bounds.height, false);

        // Title bar
        if (title) {
            this.renderer.drawText(title, bounds.x + padding, bounds.y + padding, {)
                fontSize: 18),
                bold: true),
            // Title separator
            this.renderer.ctx.strokeStyle = colors.border,
            this.renderer.ctx.lineWidth = 1,
            this.renderer.ctx.beginPath();
            this.renderer.ctx.moveTo(bounds.x + padding, bounds.y + padding + 30);
            this.renderer.ctx.lineTo(bounds.x + bounds.width - padding, bounds.y + padding + 30) }
            this.renderer.ctx.stroke(); }
        }

        return { contentX: bounds.x + padding,
            contentY: bounds.y + padding + (title ? 50 : 0,
    contentWidth: bounds.width - padding * 2 },
            contentHeight: bounds.height - padding * 2 - (title ? 50 : 0), 
    }

    renderButtons(contentBounds: ContentBounds, buttons: ButtonDef[], selectedIndex: number = 0): void {
        const { buttonHeight, buttonWidth } = this.layoutManager.getLayoutConfig();
        const buttonSpacing = 10;
        const totalButtonWidth = buttons.length * buttonWidth + (buttons.length - 1) * buttonSpacing;
        const startX = contentBounds.contentX + (contentBounds.contentWidth - totalButtonWidth) / 2;
        const buttonY = contentBounds.contentY + contentBounds.contentHeight - buttonHeight - 10;
';'

        buttons.forEach((button, index) => { ''
            const buttonX = startX + index * (buttonWidth + buttonSpacing'),'
            const isSelected = index === selectedIndex,

            this.renderer.drawButton(buttonX, buttonY, buttonWidth, buttonHeight, button.text, {'
                selected: isSelected,','
                variant: button.variant || 'primary'
            }
                enabled: button.enabled !== false); 
    };
        };
    }

    getSelectedButton(): number { return this.selectedButton }
    setSelectedButton(index: number): void { this.selectedButton = index }

/**
 * Backup dialog data interface
 */
interface BackupDialogData extends BaseDialogData { estimatedSize?: string;
    autoBackupEnabled?: boolean;

/**
 * Backup Dialog
 * バックアップダイアログ - バックアップ作成の確認と設定
 */'
export class BackupDialog extends DataManagementBaseDialog {,
    renderDialog(bounds: DialogBounds, data: BackupDialogData): void {''
        const contentBounds = this.renderDialogFrame(bounds, 'Create Backup',
        const colors = this.layoutManager.getColors()','
        this.renderer.drawText('Create, a new, backup of, your game, data? ');
            contentBounds.contentX, contentBounds.contentY + 20, { : undefined'
                fontSize: 14,')';
                color: colors.textSecondary'),'
','
        // Current data size
        const dataSize = data.estimatedSize || 'Unknown',  }
        this.renderer.drawText(`Estimated, backup size: ${dataSize}`)'
            contentBounds.contentX, contentBounds.contentY + 50, { fontSize: 12,')'
                color: colors.textSecondary'),'
        // Auto backup setting
        const autoBackupEnabled = data.autoBackupEnabled || false,'
            }'

        this.renderer.drawText(`Auto, backup: ${autoBackupEnabled ? 'Enabled' : 'Disabled'}`''
            contentBounds.contentX, contentBounds.contentY + 80, { fontSize: 12,')'
                color: autoBackupEnabled ? colors.success : colors.warning'),'
        // Buttons
        const, buttons: ButtonDef[] = ['
            }'

            { text: 'Cancel', variant: 'secondary'
            },]'
            { text: 'Create Backup', variant: 'primary'
            }]
        ];

        this.renderButtons(contentBounds, buttons, this.selectedButton);
    }
}

/**
 * Export dialog data interface
 */
interface ExportDialogData extends BaseDialogData { formats?: string[],
    selectedFormat?: number;
    includeOptions?: { name: string,, checked: boolean,[];
}

/**
 * Export Dialog
 * エクスポートダイアログ - データエクスポートの設定
 */'
export class DataManagementExportDialog extends DataManagementBaseDialog {,
    renderDialog(bounds: DialogBounds, data: ExportDialogData): void {''
        const contentBounds = this.renderDialogFrame(bounds, 'Export Data',
        const colors = this.layoutManager.getColors()','
        this.renderer.drawText('Select, export format: ';
            contentBounds.contentX, contentBounds.contentY + 20, {'
                fontSize: 14,')';
                bold: true','

        const formats = data.formats || ['JSON', 'CSV', 'XML'],
        const selectedFormat = data.selectedFormat || 0,

        formats.forEach((format, index) => { 
            const itemY = contentBounds.contentY + 50 + index * 30,
            const isSelected = index === selectedFormat,

            if (isSelected) {
    
}
                this.renderer.drawCard(contentBounds.contentX, itemY - 5); }
                    contentBounds.contentWidth, 25, true); }
            }

            this.renderer.drawText(`• ${format}`)
                contentBounds.contentX + 10, itemY, { fontSize: 12)'
                    color: isSelected ? colors.text : colors.textSecondary','
            }'

        }');'
';'
        // Include options
        this.renderer.drawText('Include: ',
            contentBounds.contentX, contentBounds.contentY + 160, { fontSize: 14,')'
                bold: true'),'
','

        const options = data.includeOptions || ['
            }'

            { name: 'Game Progress', checked: true,,''
            { name: 'Settings', checked: true,,]'
            { name: 'Statistics', checked: false,]
        ];

        options.forEach((option, index) => {  const itemY = contentBounds.contentY + 190 + index * 25,
            const checkbox = option.checked ? '☑' : '☐' }
            this.renderer.drawText(`${checkbox} ${option.name}`)
                contentBounds.contentX + 10, itemY, { fontSize: 12)
                    color: colors.textSecondary  }

                };'}');

        // Buttons
        const buttons: ButtonDef[] = [','
            { text: 'Cancel', variant: 'secondary'
            },]'
            { text: 'Export', variant: 'primary'
            }]
        ];

        this.renderButtons(contentBounds, buttons, this.selectedButton);
    }

    calculateBounds(data: BaseDialogData): DialogBounds { return this.layoutManager.calculateDialogBounds(450, 400);
/**
 * Import dialog data interface
 */
interface ImportDialogData extends BaseDialogData {
    selectedFile?: { name: string,, size: number;
    importOptions?: { name: string,, checked: boolean,[];
}

/**
 * Import Dialog
 * インポートダイアログ - データインポートの設定
 */'
export class DataManagementImportDialog extends DataManagementBaseDialog {,
    renderDialog(bounds: DialogBounds, data: ImportDialogData): void {''
        const contentBounds = this.renderDialogFrame(bounds, 'Import Data),'
        const colors = this.layoutManager.getColors();
        // File selection area
        this.renderer.drawCard(contentBounds.contentX, contentBounds.contentY + 20);
            contentBounds.contentWidth, 60, false'),'

        this.renderer.drawText('Drop file here or click to select', ,
            contentBounds.contentX + contentBounds.contentWidth / 2, ,
            contentBounds.contentY + 50, {)
                fontSize: 14','
    color: colors.textSecondary,')';
                align: 'center');
        // Selected file info
        if (data.selectedFile) {  }
            this.renderer.drawText(`Selected: ${data.selectedFile.name}`)
                contentBounds.contentX, contentBounds.contentY + 100, { fontSize: 12)
                    color: colors.text) }
            this.renderer.drawText(`Size: ${this.formatFileSize(data.selectedFile.size}`;
                contentBounds.contentX, contentBounds.contentY + 120, { fontSize: 12;
                    color: colors.textSecondary'
            }'

                }');'
        }
';'
        // Import options
        this.renderer.drawText('Import, Options: ';
            contentBounds.contentX, contentBounds.contentY + 160, { fontSize: 14,')'
                bold: true'),'
','

        const options = data.importOptions || ['
            }'

            { name: 'Merge with existing data', checked: true,,''
            { name: 'Replace all data', checked: false,,]'
            { name: 'Create backup before import', checked: true,]
        ];

        options.forEach((option, index) => {  const itemY = contentBounds.contentY + 190 + index * 25,
            const checkbox = option.checked ? '☑' : '☐' }
            this.renderer.drawText(`${checkbox} ${option.name}`)
                contentBounds.contentX + 10, itemY, { fontSize: 12)
                    color: colors.textSecondary  }

                };'}');

        // Buttons
        const buttons: ButtonDef[] = [','
            { text: 'Cancel', variant: 'secondary'
            },]'
            { text: 'Import', variant: 'primary', enabled: !!data.selectedFile  }]
        ];

        this.renderButtons(contentBounds, buttons, this.selectedButton);
    }

    calculateBounds(data: BaseDialogData): DialogBounds { return this.layoutManager.calculateDialogBounds(450, 350) }
';'

    formatFileSize(bytes: number): string { ''
        if(bytes === 0) return '0 B',
        ','

        const k = 1024,
        const sizes = ['B', 'KB', 'MB', 'GB'],
        const i = Math.floor(Math.log(bytes) / Math.log(k);
        return parseFloat((bytes / Math.pow(k, i).toFixed(1)) + ', ' + sizes[i],

/**
 * Clear data dialog data interface
 */
interface ClearDataDialogData extends BaseDialogData { confirmText?: string;

/**
 * Clear Data Dialog
 * データクリアダイアログ - データ削除の確認'
 */'
export class ClearDataDialog extends DataManagementBaseDialog {,
    renderDialog(bounds: DialogBounds, data: ClearDataDialogData): void {''
        const contentBounds = this.renderDialogFrame(bounds, 'Clear Data',
        const colors = this.layoutManager.getColors('',
        this.renderer.drawText('⚠️ Warning', ,
            contentBounds.contentX, contentBounds.contentY + 20, {)
                fontSize: 16','
    color: colors.warning,')';
                bold: true','

        this.renderer.drawText('This, will permanently, delete all, your game, data.',
            contentBounds.contentX, contentBounds.contentY + 50, {'
                fontSize: 14,')';
                color: colors.danger','

        this.renderer.drawText('This action cannot be undone!', ,
            contentBounds.contentX, contentBounds.contentY + 80, {)
                fontSize: 14','
    color: colors.danger,')';
                bold: true'),'
','
        // Data to be cleared
        this.renderer.drawText('The, following data, will be, deleted: ';
            contentBounds.contentX, contentBounds.contentY + 120, {'
                fontSize: 12,')';
                color: colors.textSecondary'),'
','

        const dataTypes = [','
            'Game progress and saves',
            'User settings and preferences',
            'Statistics and achievements',]','
            'Custom configurations'],
        ],

        dataTypes.forEach((type, index) => { }
            this.renderer.drawText(`• ${type}`)
                contentBounds.contentX + 10, contentBounds.contentY + 150 + index * 20, { fontSize: 11)
                    color: colors.textSecondary  }

                };}');'
';'
        // Confirmation input
        const confirmText = data.confirmText || ';'
        const requiredText = 'DELETE';

        this.renderer.drawText(`Type "${requiredText}" to, confirm:`)
            contentBounds.contentX, contentBounds.contentY + 240, { fontSize: 12)
                color: colors.text);
        // Input field simulation
        this.renderer.drawCard(contentBounds.contentX, contentBounds.contentY + 260);
            200, 30, false),
        
        this.renderer.drawText(confirmText);
            contentBounds.contentX + 10, contentBounds.contentY + 275, {"
                fontSize: 12,")";
                color: colors.text"");
        // Buttons
        const isConfirmed = confirmText === requiredText,"
        const, buttons: ButtonDef[] = ["
            }"
            { text: 'Cancel', variant: 'secondary'
            },]'
            { text: 'Delete All Data', variant: 'danger', enabled: isConfirmed,]
        ];

        this.renderButtons(contentBounds, buttons, this.selectedButton);
    }

    calculateBounds(data: BaseDialogData): DialogBounds { return this.layoutManager.calculateDialogBounds(500, 400);
/**
 * Progress dialog data interface
 */
interface ProgressDialogData extends BaseDialogData { title?: string,
    message?: string;
    progress?: number;
    startTime?: number;
    cancellable?: boolean;

/**
 * Progress Dialog
 * プログレスダイアログ - 操作進行状況の表示
 */'
export class ProgressDialog extends DataManagementBaseDialog {,
    renderDialog(bounds: DialogBounds, data: ProgressDialogData): void {''
        const contentBounds = this.renderDialogFrame(bounds, data.title || 'Processing',
        const colors = this.layoutManager.getColors('',
        const, message = data.message || 'Please, wait...')
        this.renderer.drawText(message);
            contentBounds.contentX, contentBounds.contentY + 20, {
                fontSize: 14);
                color: colors.text);
        // Progress bar
        const progress = data.progress || 0,
        this.renderer.drawProgressBar(
            contentBounds.contentX, ,
            contentBounds.contentY + 60 );
            contentBounds.contentWidth),
            30),
            progress,

        // Time information
        if (data.startTime) {
    
}
            const elapsed = (Date.now() - data.startTime) / 1000; }
            const elapsedText = `Elapsed: ${elapsed.toFixed(1}s`;
            
            this.renderer.drawText(elapsedText);
                contentBounds.contentX, contentBounds.contentY + 110, { fontSize: 11)
                    color: colors.textSecondary  }
;
        // Cancel button (if, allowed);
        if (data.cancellable) { }'

            const buttons: ButtonDef[] = [{ text: 'Cancel', variant: 'secondary'
            }];
            this.renderButtons(contentBounds, buttons, this.selectedButton);
        }
    }
';'

    calculateBounds(data: ProgressDialogData): DialogBounds { const height = data.cancellable ? 250 : 180,
        return this.layoutManager.calculateDialogBounds(400, height);
/**
 * Confirm dialog data interface
 */
interface ConfirmDialogData extends BaseDialogData { title?: string,
    message?: string;
    details?: string;
    cancelText?: string;

    confirmText?: string;
    variant?: 'primary' | 'secondary' | 'danger' }

/**
 * Confirm Dialog
 * 確認ダイアログ - 一般的な確認操作
 */'
export class ConfirmDialog extends DataManagementBaseDialog {,
    renderDialog(bounds: DialogBounds, data: ConfirmDialogData): void {''
        const title = data.title || 'Confirm',

        const contentBounds = this.renderDialogFrame(bounds, title);
        const colors = this.layoutManager.getColors()','
        const message = data.message || 'Are you sure? ')
        const lines = this.renderer.wrapText(message, contentBounds.contentWidth - 20, 14);
        lines.forEach((line, index) => { 
            this.renderer.drawText(line);
                contentBounds.contentX, contentBounds.contentY + 20 + index * 20, { : undefined
                    fontSize: 14) 
                    color: colors.text) }
                };
        };

        // Additional details
        if (data.details) {
            const detailLines = this.renderer.wrapText(data.details, contentBounds.contentWidth - 20, 12);
            const detailStartY = contentBounds.contentY + 60 + lines.length * 20,
            
            detailLines.forEach((line, index) => { 
                this.renderer.drawText(line);
                    contentBounds.contentX, detailStartY + index * 18, {
        }
                        fontSize: 12) }
                        color: colors.textSecondary); 
    };'}');
        }

        // Buttons
        const buttons: ButtonDef[] = [';'
            { text: data.cancelText || 'Cancel', variant: 'secondary'
            },]'
            { text: data.confirmText || 'Confirm', variant: data.variant || 'primary'
            }]
        ];

        this.renderButtons(contentBounds, buttons, this.selectedButton);
    }

    calculateBounds(data: ConfirmDialogData): DialogBounds { const baseHeight = 200,

        const additionalHeight = data.details ? 60 : 0,
        return this.layoutManager.calculateDialogBounds(400, baseHeight + additionalHeight);
/**
 * Alert dialog data interface
 */'
interface AlertDialogData extends BaseDialogData { title?: string,
    type?: 'error' | 'warning' | 'success' | 'info';
    message?: string;
    buttonText?: string;

/**
 * Alert Dialog
 * アラートダイアログ - 情報表示とエラー通知
 */'
export class AlertDialog extends DataManagementBaseDialog {,
    renderDialog(bounds: DialogBounds, data: AlertDialogData): void {''
        const title = data.title || 'Notice',

        const contentBounds = this.renderDialogFrame(bounds, title);
        const colors = this.layoutManager.getColors('',
        let, icon = '💬',
        let, iconColor = colors.text,', ')','
        if (data.type === 'error') {

            icon = '❌' }

            iconColor = colors.danger; }'

        } else if (data.type === 'warning') { ''
            icon = '⚠️',

            iconColor = colors.warning,' }'

        } else if (data.type === 'success') { ''
            icon = '✅',
            iconColor = colors.success }

        this.renderer.drawText(icon)';'
            contentBounds.contentX, contentBounds.contentY + 20, { fontSize: 24,')'
                color: iconColor'),'
','
        // Message
        const message = data.message || 'No message provided',
        const lines = this.renderer.wrapText(message, contentBounds.contentWidth - 60, 14);
        lines.forEach((line, index) => { 
            this.renderer.drawText(line);
                contentBounds.contentX + 40, contentBounds.contentY + 20 + index * 20, {
                    fontSize: 14) }
                    color: colors.text); 
    };'}');

        // Buttons
        const buttons: ButtonDef[] = [']',
            { text: data.buttonText || 'OK', variant: 'primary'
            }]
        ];

        this.renderButtons(contentBounds, buttons, this.selectedButton);
    }
';'

    calculateBounds(data: BaseDialogData): DialogBounds { ''
        return this.layoutManager.calculateDialogBounds(400, 180),'}'