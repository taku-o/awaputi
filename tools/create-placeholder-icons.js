/**
 * create-placeholder-icons.js
 * プレースホルダーPWAアイコンを作成するスクリプト
 * SVGベースで軽量なアイコンを生成
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * バブルアイコンのSVGを生成
 * @param {number} size - アイコンサイズ
 * @param {boolean} maskable - マスカブルアイコンか
 * @returns {string} SVG文字列
 */
function generateBubbleSVG(size, maskable = false) {
    const viewBox = `0 0 ${size} ${size}`;
    const safeArea = maskable ? 0.8 : 1.0;
    const bubbleSize = size * safeArea;
    const radius = bubbleSize / 2 - 2;
    const center = size / 2;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">
        <defs>
            <radialGradient id="mainGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#4CAF50"/>
                <stop offset="70%" style="stop-color:#2E7D32"/>
                <stop offset="100%" style="stop-color:#1B5E20"/>
            </radialGradient>
            <radialGradient id="highlightGradient" cx="30%" cy="30%" r="40%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.8)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
            </radialGradient>
        </defs>
        
        <!-- Main bubble -->
        <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#mainGradient)"/>
        
        <!-- Highlight -->
        <circle cx="${center - bubbleSize/6}" cy="${center - bubbleSize/6}" r="${bubbleSize/4}" fill="url(#highlightGradient)"/>
        
        <!-- Decorative bubbles -->
        <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${bubbleSize * 0.12}" fill="rgba(255,255,255,0.6)"/>
        <circle cx="${size * 0.8}" cy="${size * 0.7}" r="${bubbleSize * 0.08}" fill="rgba(255,255,255,0.5)"/>
        <circle cx="${size * 0.3}" cy="${size * 0.8}" r="${bubbleSize * 0.1}" fill="rgba(255,255,255,0.4)"/>
        
        <!-- Small highlights on decorative bubbles -->
        <circle cx="${size * 0.7 - bubbleSize * 0.04}" cy="${size * 0.3 - bubbleSize * 0.04}" r="${bubbleSize * 0.04}" fill="rgba(255,255,255,0.5)"/>
        <circle cx="${size * 0.8 - bubbleSize * 0.027}" cy="${size * 0.7 - bubbleSize * 0.027}" r="${bubbleSize * 0.027}" fill="rgba(255,255,255,0.4)"/>
        <circle cx="${size * 0.3 - bubbleSize * 0.033}" cy="${size * 0.8 - bubbleSize * 0.033}" r="${bubbleSize * 0.033}" fill="rgba(255,255,255,0.32)"/>
        
        ${size >= 192 ? `
        <!-- Game title -->
        <text x="${center}" y="${size * 0.85}" 
              font-family="Arial, sans-serif" 
              font-size="${Math.max(size * 0.08, 12)}" 
              font-weight="bold" 
              text-anchor="middle" 
              fill="rgba(255,255,255,0.9)"
              style="filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5))">BubblePop</text>
        ` : ''}
    </svg>`;
}

/**
 * SVGをPNG形式のBase64データURLに変換（プレースホルダー）
 * @param {string} svg - SVG文字列
 * @returns {string} Base64データURL
 */
function svgToDataURL(svg) {
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}

/**
 * プレースホルダーアイコンファイルを作成
 */
async function createPlaceholderIcons() {
    const iconsDir = path.join(process.cwd(), 'assets', 'icons');
    
    // ディレクトリ作成
    try {
        await fs.mkdir(iconsDir, { recursive: true });
        console.log('📁 Created assets/icons directory');
    } catch (error) {
        // ディレクトリが既に存在する場合は無視
    }
    
    const icons = [
        { size: 192, filename: 'icon-192x192.png', maskable: false },
        { size: 512, filename: 'icon-512x512.png', maskable: false }
    ];
    
    console.log('🎨 Creating placeholder PWA icons...\n');
    
    for (const icon of icons) {
        const svg = generateBubbleSVG(icon.size, icon.maskable);
        const dataURL = svgToDataURL(svg);
        
        // プレースホルダー情報ファイルを作成
        const infoFile = path.join(iconsDir, `${icon.filename}.info.txt`);
        const infoContent = `PWA Icon Placeholder - ${icon.filename}
Size: ${icon.size}x${icon.size}px
Type: ${icon.maskable ? 'Maskable' : 'Standard'} PWA Icon
Generated: ${new Date().toISOString()}

This is a placeholder file. To create the actual PNG icon:
1. Open generate-icons.html in a browser
2. Click "Generate Icons"
3. Download ${icon.filename}
4. Replace this file with the downloaded PNG

Data URL (for testing):
${dataURL}
`;
        
        await fs.writeFile(infoFile, infoContent);
        console.log(`✅ Created placeholder info: ${icon.filename}.info.txt`);
        
        // SVGファイルとしても保存
        const svgFile = path.join(iconsDir, `${icon.filename.replace('.png', '.svg')}`);
        await fs.writeFile(svgFile, svg);
        console.log(`✅ Created SVG version: ${icon.filename.replace('.png', '.svg')}`);
    }
    
    console.log('\n📋 Summary:');
    console.log('  - Created placeholder info files with generation instructions');
    console.log('  - Created SVG versions for immediate use');
    console.log('  - Ready for PNG generation using generate-icons.html');
    
    console.log('\n🔄 Next steps:');
    console.log('  1. Open generate-icons.html in your browser');
    console.log('  2. Download the generated PNG files');
    console.log('  3. Place them in assets/icons/ directory');
    console.log('  4. Test PWA installation functionality');
}

// 実行
createPlaceholderIcons().catch(console.error);