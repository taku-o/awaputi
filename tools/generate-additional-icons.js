/**
 * generate-additional-icons.js
 * 追加PWAアイコンサイズを生成するスクリプト
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * バブルアイコンのSVGを生成（サイズ最適化版）
 * @param {number} size - アイコンサイズ
 * @param {boolean} maskable - マスカブルアイコンか
 * @returns {string} SVG文字列
 */
function generateOptimizedBubbleSVG(size, maskable = false) {
    const viewBox = `0 0 ${size} ${size}`;
    const safeArea = maskable ? 0.8 : 1.0;
    const bubbleSize = size * safeArea;
    const radius = bubbleSize / 2 - 2;
    const center = size / 2;
    
    // 小さなアイコンでは装飾を簡素化
    const useDecorations = size >= 96;
    const useTitle = size >= 144;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">
        <defs>
            <radialGradient id="mainGradient-${size}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#4CAF50"/>
                <stop offset="70%" style="stop-color:#2E7D32"/>
                <stop offset="100%" style="stop-color:#1B5E20"/>
            </radialGradient>
            <radialGradient id="highlightGradient-${size}" cx="30%" cy="30%" r="40%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.8)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
            </radialGradient>
        </defs>
        
        <!-- Main bubble -->
        <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#mainGradient-${size})"/>
        
        <!-- Highlight -->
        <circle cx="${center - bubbleSize/6}" cy="${center - bubbleSize/6}" r="${bubbleSize/4}" fill="url(#highlightGradient-${size})"/>
        
        ${useDecorations ? `
        <!-- Decorative bubbles -->
        <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${bubbleSize * 0.12}" fill="rgba(255,255,255,0.6)"/>
        <circle cx="${size * 0.8}" cy="${size * 0.7}" r="${bubbleSize * 0.08}" fill="rgba(255,255,255,0.5)"/>
        <circle cx="${size * 0.3}" cy="${size * 0.8}" r="${bubbleSize * 0.1}" fill="rgba(255,255,255,0.4)"/>
        
        <!-- Small highlights on decorative bubbles -->
        <circle cx="${size * 0.7 - bubbleSize * 0.04}" cy="${size * 0.3 - bubbleSize * 0.04}" r="${bubbleSize * 0.04}" fill="rgba(255,255,255,0.5)"/>
        <circle cx="${size * 0.8 - bubbleSize * 0.027}" cy="${size * 0.7 - bubbleSize * 0.027}" r="${bubbleSize * 0.027}" fill="rgba(255,255,255,0.4)"/>
        <circle cx="${size * 0.3 - bubbleSize * 0.033}" cy="${size * 0.8 - bubbleSize * 0.033}" r="${bubbleSize * 0.033}" fill="rgba(255,255,255,0.32)"/>
        ` : ''}
        
        ${useTitle ? `
        <!-- Game title -->
        <text x="${center}" y="${size * 0.85}" 
              font-family="Arial, sans-serif" 
              font-size="${Math.max(size * 0.08, 8)}" 
              font-weight="bold" 
              text-anchor="middle" 
              fill="rgba(255,255,255,0.9)"
              style="filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5))">BubblePop</text>
        ` : ''}
    </svg>`;
}

/**
 * 追加PWAアイコンを生成
 */
async function generateAdditionalPWAIcons() {
    const iconsDir = path.join(process.cwd(), 'assets', 'icons');
    
    // ディレクトリが存在することを確認
    try {
        await fs.access(iconsDir);
    } catch {
        console.error('❌ assets/icons directory not found. Please run Task 1 first.');
        process.exit(1);
    }
    
    const additionalSizes = [
        { size: 72, description: 'Android launcher icon' },
        { size: 96, description: 'Windows tile icon' },
        { size: 128, description: 'Chrome Web Store icon' },
        { size: 144, description: 'Windows tile icon (large)' },
        { size: 152, description: 'iPad touch icon' },
        { size: 384, description: 'Android splash screen icon' }
    ];
    
    console.log('🎨 Generating additional PWA icon sizes...\n');
    
    for (const icon of additionalSizes) {
        const filename = `icon-${icon.size}x${icon.size}`;
        
        // SVG生成
        const svg = generateOptimizedBubbleSVG(icon.size, false);
        const svgFile = path.join(iconsDir, `${filename}.svg`);
        await fs.writeFile(svgFile, svg);
        console.log(`✅ Generated SVG: ${filename}.svg (${icon.description})`);
        
        // 情報ファイル作成
        const infoContent = `PWA Icon - ${filename}.png
Size: ${icon.size}x${icon.size}px
Purpose: ${icon.description}
Type: Standard PWA Icon
Generated: ${new Date().toISOString()}

To convert to PNG:
1. Use: sips -s format png ${filename}.svg --out ${filename}.png
2. Or open generate-icons.html and generate manually

SVG version is immediately usable for PWA manifest.
`;
        
        const infoFile = path.join(iconsDir, `${filename}.png.info.txt`);
        await fs.writeFile(infoFile, infoContent);
        console.log(`📋 Created info: ${filename}.png.info.txt`);
    }
    
    console.log('\n🔧 Converting SVG to PNG...');
    
    // PNG変換を試行
    for (const icon of additionalSizes) {
        const filename = `icon-${icon.size}x${icon.size}`;
        const svgPath = path.join(iconsDir, `${filename}.svg`);
        const pngPath = path.join(iconsDir, `${filename}.png`);
        
        try {
            // sipsコマンドを使用してSVGをPNGに変換
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            const command = `sips -s format png "${svgPath}" --out "${pngPath}"`;
            await execAsync(command);
            console.log(`✅ Converted to PNG: ${filename}.png`);
        } catch (error) {
            console.log(`⚠️  PNG conversion failed for ${filename}: ${error.message}`);
            console.log(`   Manual conversion needed: sips -s format png "${svgPath}" --out "${pngPath}"`);
        }
    }
    
    console.log('\n📋 Summary - Additional PWA Icons Generated:');
    additionalSizes.forEach(icon => {
        console.log(`  - icon-${icon.size}x${icon.size}.png (${icon.description})`);
    });
    
    console.log('\n📁 Total icons in manifest.json:');
    console.log('  - 72x72, 96x96, 128x128, 144x144, 152x152 (✅ Generated)');
    console.log('  - 192x192, 384x384, 512x512 (✅ Previously generated)');
    
    console.log('\n🔍 Next steps:');
    console.log('  1. Verify all PNG files were generated successfully');
    console.log('  2. Check manifest.json references are correct');
    console.log('  3. Continue to Task 2.3 (Maskable icons)');
}

// 実行
generateAdditionalPWAIcons().catch(console.error);