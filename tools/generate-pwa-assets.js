/**
 * generate-pwa-assets.js
 * 
 * PWAアセット自動生成スクリプト
 * PWAAssetGeneratorを使用してアイコンファイルを生成し、適切なディレクトリに保存
 */

import { getPWAAssetGenerator } from '../src/utilities/PWAAssetGenerator.js';

/**
 * Blobをファイルとしてダウンロード
 * @param {Blob} blob - ダウンロードするBlob
 * @param {string} filename - ファイル名
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 生成進捗を表示するUI要素を作成
 */
function createProgressUI() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #4CAF50;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: Arial, sans-serif;
        max-width: 400px;
    `;
    
    container.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #4CAF50;">PWA Asset Generator</h3>
        <div id="progress-log" style="max-height: 200px; overflow-y: auto; font-size: 12px;"></div>
        <div style="margin-top: 15px;">
            <button id="generate-btn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                Generate All Assets
            </button>
            <button id="preview-btn" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                Preview Icons
            </button>
            <button id="close-btn" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                Close
            </button>
        </div>
        <div id="preview-container" style="margin-top: 15px; display: none;">
            <h4>Icon Preview:</h4>
            <div id="preview-icons" style="display: flex; flex-wrap: wrap; gap: 10px;"></div>
        </div>
    `;
    
    document.body.appendChild(container);
    return container;
}

/**
 * ログメッセージを表示
 * @param {string} message - ログメッセージ
 * @param {string} type - メッセージタイプ (info, success, error)
 */
function log(message, type = 'info') {
    const logContainer = document.getElementById('progress-log');
    if (!logContainer) return;
    
    const colors = {
        info: '#333',
        success: '#4CAF50',
        error: '#f44336',
        warning: '#FF9800'
    };
    
    const logEntry = document.createElement('div');
    logEntry.style.color = colors[type];
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * アイコンプレビューを表示
 */
function showIconPreview() {
    const generator = getPWAAssetGenerator();
    const previewContainer = document.getElementById('preview-container');
    const previewIcons = document.getElementById('preview-icons');
    
    previewIcons.innerHTML = '';
    
    const previewSizes = [
        { size: 192, label: 'PWA 192px', maskable: false },
        { size: 192, label: 'Maskable 192px', maskable: true },
        { size: 512, label: 'PWA 512px', maskable: false },
        { size: 32, label: 'Favicon 32px', maskable: false }
    ];
    
    previewSizes.forEach(({ size, label, maskable }) => {
        const canvas = generator.previewIcon(size, maskable);
        canvas.style.cssText = `
            width: 64px;
            height: 64px;
            border: 1px solid #ddd;
            border-radius: 4px;
        `;
        
        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        
        const labelEl = document.createElement('div');
        labelEl.textContent = label;
        labelEl.style.fontSize = '10px';
        labelEl.style.marginTop = '5px';
        
        wrapper.appendChild(canvas);
        wrapper.appendChild(labelEl);
        previewIcons.appendChild(wrapper);
    });
    
    previewContainer.style.display = 'block';
    log('Icon preview generated', 'success');
}

/**
 * 全アセットを生成してダウンロード
 */
async function generateAllAssets() {
    const generator = getPWAAssetGenerator();
    const generateBtn = document.getElementById('generate-btn');
    
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    try {
        log('Starting PWA asset generation...', 'info');
        
        // 標準PWAアイコン生成
        log('Generating standard PWA icons...', 'info');
        const standardSizes = [72, 96, 128, 144, 152, 192, 384, 512];
        for (const size of standardSizes) {
            const blob = await generator.generatePWAIcon(size, false);
            downloadBlob(blob, `icon-${size}x${size}.png`);
            log(`Generated icon-${size}x${size}.png`, 'success');
        }
        
        // マスカブルアイコン生成
        log('Generating maskable icons...', 'info');
        const maskableSizes = [192, 512];
        for (const size of maskableSizes) {
            const blob = await generator.generatePWAIcon(size, true);
            downloadBlob(blob, `icon-maskable-${size}x${size}.png`);
            log(`Generated icon-maskable-${size}x${size}.png`, 'success');
        }
        
        // ファビコン生成
        log('Generating favicons...', 'info');
        const faviconSizes = [16, 32];
        for (const size of faviconSizes) {
            const blob = await generator.generateFavicon(size);
            downloadBlob(blob, `favicon-${size}x${size}.png`);
            log(`Generated favicon-${size}x${size}.png`, 'success');
        }
        
        // Apple Touch Icons生成
        log('Generating Apple Touch Icons...', 'info');
        const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];
        for (const size of appleSizes) {
            const blob = await generator.generatePWAIcon(size, false);
            downloadBlob(blob, `apple-touch-icon-${size}x${size}.png`);
            log(`Generated apple-touch-icon-${size}x${size}.png`, 'success');
        }
        
        // ショートカット用アイコン生成
        log('Generating shortcut icons...', 'info');
        const shortcutIcons = [
            { name: 'shortcut-play', color: '#4CAF50' },
            { name: 'shortcut-stats', color: '#2196F3' },
            { name: 'shortcut-settings', color: '#FF9800' },
            { name: 'shortcut-achievements', color: '#9C27B0' }
        ];
        
        for (const shortcut of shortcutIcons) {
            const blob = await generator.generatePWAIcon(96, false);
            downloadBlob(blob, `${shortcut.name}.png`);
            log(`Generated ${shortcut.name}.png`, 'success');
        }
        
        log('All assets generated successfully!', 'success');
        log('Download the files and place them in the /assets/icons/ directory', 'warning');
        
    } catch (error) {
        log(`Error generating assets: ${error.message}`, 'error');
        console.error('Asset generation error:', error);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate All Assets';
    }
}

/**
 * メイン初期化関数
 */
function initializePWAAssetGenerator() {
    // 既存のUIがある場合は削除
    const existingUI = document.querySelector('[data-pwa-generator]');
    if (existingUI) {
        existingUI.remove();
    }
    
    const ui = createProgressUI();
    ui.setAttribute('data-pwa-generator', 'true');
    
    // イベントリスナー設定
    document.getElementById('generate-btn').addEventListener('click', generateAllAssets);
    document.getElementById('preview-btn').addEventListener('click', showIconPreview);
    document.getElementById('close-btn').addEventListener('click', () => {
        ui.remove();
    });
    
    log('PWA Asset Generator initialized', 'success');
    log('Click "Preview Icons" to see samples or "Generate All Assets" to create files', 'info');
}

// グローバル関数として公開
window.initializePWAAssetGenerator = initializePWAAssetGenerator;

// DOMが読み込まれた後に自動実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePWAAssetGenerator);
} else {
    initializePWAAssetGenerator();
}

// 開発者コンソール用のヘルパー関数
window.PWAAssetGenerator = {
    init: initializePWAAssetGenerator,
    generateAssets: generateAllAssets,
    showPreview: showIconPreview
};

console.log('PWA Asset Generator loaded. Use PWAAssetGenerator.init() to start, or it will auto-initialize.');