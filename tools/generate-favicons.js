/**
 * generate-favicons.js
 * Favicon files を生成するスクリプト
 * ブラウザタブアイコン、ショートカットアイコン用のファビコンを生成
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Favicon用のSVGを生成
 * @param {number} size - アイコンサイズ
 * @returns {string} SVG文字列
 */
function generateFaviconSVG(size) {
    const viewBox = `0 0 ${size} ${size}`;
    const center = size / 2;
    
    // ファビコン用の小さなサイズに最適化されたデザイン
    const bubbleSize = size * 0.35;
    const highlightSize = bubbleSize * 0.4;
    const smallBubbleSize = bubbleSize * 0.15;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">
        <defs>
            <!-- Background gradient for favicon -->\n            <radialGradient id="faviconBg-${size}" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:#81C784"/>
                <stop offset="50%" style="stop-color:#66BB6A"/>
                <stop offset="100%" style="stop-color:#4CAF50"/>
            </radialGradient>
            
            <!-- Main bubble gradient -->\n            <radialGradient id="faviconBubble-${size}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#E8F5E8"/>
                <stop offset="30%" style="stop-color:#C8E6C9"/>
                <stop offset="70%" style="stop-color:#A5D6A7"/>
                <stop offset="100%" style="stop-color:#81C784"/>
            </radialGradient>
            
            <!-- Highlight gradient -->\n            <radialGradient id="faviconHighlight-${size}" cx="40%" cy="30%" r="50%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.9)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
            </radialGradient>
        </defs>
        
        <!-- Background -->\n        <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#faviconBg-${size})"/>
        
        <!-- Main bubble -->\n        <circle cx="${center}" cy="${center}" r="${bubbleSize}" 
                fill="url(#faviconBubble-${size})"/>
        
        <!-- Main highlight -->\n        <circle cx="${center - bubbleSize * 0.3}" cy="${center - bubbleSize * 0.3}" 
                r="${highlightSize}" 
                fill="url(#faviconHighlight-${size})"/>
        
        <!-- Small decorative bubbles -->\n        <circle cx="${center + bubbleSize * 0.6}" cy="${center - bubbleSize * 0.4}" 
                r="${smallBubbleSize}" 
                fill="rgba(255,255,255,0.7)"/>
        <circle cx="${center + bubbleSize * 0.4}" cy="${center + bubbleSize * 0.6}" 
                r="${smallBubbleSize * 0.8}" 
                fill="rgba(255,255,255,0.6)"/>
    </svg>`;
}

/**
 * ICO形式のファビコンを生成するためのマルチサイズSVG
 * @returns {string} マルチサイズ対応SVG文字列
 */
function generateMultiSizeFaviconSVG() {
    // ICO形式で使用される標準サイズ
    const sizes = [16, 32, 48];
    const largestSize = Math.max(...sizes);
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${largestSize}" height="${largestSize}" viewBox="0 0 ${largestSize} ${largestSize}">
        <defs>
            <!-- Background gradient -->\n            <radialGradient id="multiFaviconBg" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:#81C784"/>
                <stop offset="50%" style="stop-color:#66BB6A"/>
                <stop offset="100%" style="stop-color:#4CAF50"/>
            </radialGradient>
            
            <!-- Main bubble gradient -->\n            <radialGradient id="multiFaviconBubble" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#E8F5E8"/>
                <stop offset="30%" style="stop-color:#C8E6C9"/>
                <stop offset="70%" style="stop-color:#A5D6A7"/>
                <stop offset="100%" style="stop-color:#81C784"/>
            </radialGradient>
            
            <!-- Highlight gradient -->\n            <radialGradient id="multiFaviconHighlight" cx="40%" cy="30%" r="50%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.9)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
            </radialGradient>
        </defs>
        
        <!-- Background -->\n        <rect width="${largestSize}" height="${largestSize}" rx="${largestSize * 0.1}" fill="url(#multiFaviconBg)"/>
        
        <!-- Main bubble -->\n        <circle cx="${largestSize / 2}" cy="${largestSize / 2}" r="${largestSize * 0.35}" 
                fill="url(#multiFaviconBubble)"/>
        
        <!-- Main highlight -->\n        <circle cx="${largestSize / 2 - largestSize * 0.12}" cy="${largestSize / 2 - largestSize * 0.12}" 
                r="${largestSize * 0.14}" 
                fill="url(#multiFaviconHighlight)"/>
        
        <!-- Small decorative bubbles -->\n        <circle cx="${largestSize / 2 + largestSize * 0.21}" cy="${largestSize / 2 - largestSize * 0.14}" 
                r="${largestSize * 0.05}" 
                fill="rgba(255,255,255,0.7)"/>
        <circle cx="${largestSize / 2 + largestSize * 0.14}" cy="${largestSize / 2 + largestSize * 0.21}" 
                r="${largestSize * 0.04}" 
                fill="rgba(255,255,255,0.6)"/>
    </svg>`;
}

/**
 * Faviconを生成
 */
async function generateFavicons() {
    // プロジェクトルートにファビコンを配置
    const rootDir = process.cwd();
    
    console.log('🔗 Generating Favicons...\n');
    
    console.log('📋 Favicon Specifications:');
    console.log('  - Location: / (project root)');
    console.log('  - Formats: PNG (16x16, 32x32) + ICO (multi-size)');
    console.log('  - Design: Optimized for small browser tab display');
    console.log('  - Browser Support: All modern browsers + legacy IE\n');
    
    // 標準ファビコンサイズ
    const faviconSizes = [
        { size: 16, description: 'Standard browser tab icon' },
        { size: 32, description: 'High-DPI browser tab icon' }
    ];
    
    const generatedFavicons = [];
    
    // PNG ファビコン生成
    for (const favicon of faviconSizes) {
        const filename = `favicon-${favicon.size}x${favicon.size}`;
        
        // SVG生成
        const svg = generateFaviconSVG(favicon.size);
        const svgFile = path.join(rootDir, `${filename}.svg`);
        await fs.writeFile(svgFile, svg);
        
        // 情報ファイル作成
        const infoContent = `Favicon - ${filename}.png
Dimensions: ${favicon.size}×${favicon.size}px
Purpose: ${favicon.description}
Generated: ${new Date().toISOString()}

Favicon Specifications:
- Optimized for browser tab display
- High contrast design for small size visibility
- Bubble-themed design consistent with PWA icons
- Cross-browser compatibility

HTML usage:
<link rel="icon" type="image/png" sizes="${favicon.size}x${favicon.size}" href="/${filename}.png">

To convert to PNG:
sips -s format png ${filename}.svg --out ${filename}.png
`;
        
        const infoFile = path.join(rootDir, `${filename}.png.info.txt`);
        await fs.writeFile(infoFile, infoContent);
        
        generatedFavicons.push({
            filename,
            size: favicon.size,
            description: favicon.description
        });
        
        console.log(`✅ Generated: ${filename}.svg (${favicon.description})`);
    }
    
    // Multi-size ICO用のSVG生成
    const icoSvg = generateMultiSizeFaviconSVG();
    const icoSvgFile = path.join(rootDir, 'favicon.svg');
    await fs.writeFile(icoSvgFile, icoSvg);
    
    // ICO用情報ファイル
    const icoInfoContent = `Favicon - favicon.ico
Format: ICO (multi-size: 16x16, 32x32, 48x48)
Purpose: Legacy browser support and shortcut icon
Generated: ${new Date().toISOString()}

ICO Favicon Specifications:
- Multi-size ICO format for broad compatibility
- Contains 16x16, 32x32, and 48x48 pixel versions
- Optimized for Windows taskbar and desktop shortcuts
- Legacy Internet Explorer support

HTML usage:
<link rel="shortcut icon" href="/favicon.ico">
<link rel="icon" href="/favicon.ico" type="image/x-icon">

Manual ICO creation required:
1. Convert SVG to PNG: sips -s format png favicon.svg --out favicon-48x48.png
2. Use online ICO converter or ImageMagick:
   convert favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon.ico

Alternative: Use online ICO generator with generated PNG files
`;
    
    const icoInfoFile = path.join(rootDir, 'favicon.ico.info.txt');
    await fs.writeFile(icoInfoFile, icoInfoContent);
    
    generatedFavicons.push({
        filename: 'favicon',
        size: 'multi',
        description: 'Multi-size ICO for legacy support'
    });
    
    console.log('✅ Generated: favicon.svg (Multi-size ICO source)');
    
    console.log('\n🔧 Converting SVG to PNG...');
    
    // PNG変換
    let convertedCount = 0;
    for (const favicon of faviconSizes) {
        const filename = `favicon-${favicon.size}x${favicon.size}`;
        const svgPath = path.join(rootDir, `${filename}.svg`);
        const pngPath = path.join(rootDir, `${filename}.png`);
        
        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            const command = `sips -s format png "${svgPath}" --out "${pngPath}"`;
            await execAsync(command);
            convertedCount++;
        } catch (error) {
            console.log(`⚠️  PNG conversion failed for ${filename}: ${error.message}`);
        }
    }
    
    // 大きなサイズのPNG生成（ICO作成用）
    try {
        const svgPath = path.join(rootDir, 'favicon.svg');
        const pngPath = path.join(rootDir, 'favicon-48x48.png');
        
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        const command = `sips -s format png "${svgPath}" --out "${pngPath}" -Z 48`;
        await execAsync(command);
        convertedCount++;
        console.log('✅ Generated: favicon-48x48.png (ICO source)');
    } catch (error) {
        console.log(`⚠️  ICO source PNG generation failed: ${error.message}`);
    }
    
    console.log(`✅ Converted ${convertedCount}/${faviconSizes.length + 1} favicons to PNG`);
    
    console.log('\n📋 Summary - Favicons Generated:');
    console.log('  Standard Favicons:');
    generatedFavicons.forEach(favicon => {
        if (favicon.size !== 'multi') {
            console.log(`    ${favicon.filename}.png (${favicon.size}×${favicon.size}px) - ${favicon.description}`);
        }
    });
    console.log('  Legacy Support:');
    console.log('    favicon.svg (Multi-size source) - ICO format preparation');
    console.log('    favicon-48x48.png (48×48px) - ICO creation source');
    
    console.log('\n🔗 HTML Integration Required:');
    console.log('Add to <head> section of index.html:');
    console.log('');
    console.log('<!-- Standard favicons -->');
    console.log('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">');
    console.log('<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">');
    console.log('');
    console.log('<!-- Legacy ICO favicon (create manually) -->');
    console.log('<link rel="shortcut icon" href="/favicon.ico">');
    console.log('<link rel="icon" href="/favicon.ico" type="image/x-icon">');
    
    console.log('\n⚠️  Manual ICO Creation Required:');
    console.log('To create favicon.ico from generated PNGs:');
    console.log('1. Use online ICO converter (recommended): favicon.io, icoconvert.com');
    console.log('2. Upload: favicon-16x16.png, favicon-32x32.png, favicon-48x48.png');
    console.log('3. Download generated favicon.ico to project root');
    console.log('');
    console.log('Alternative (ImageMagick):');
    console.log('convert favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon.ico');
    
    console.log('\n🔍 Next steps:');
    console.log('  1. Create favicon.ico manually using online converter');
    console.log('  2. Add favicon meta tags to index.html');
    console.log('  3. Test favicon display across different browsers');
    console.log('  4. Continue to Task 5 (Manifest validation)');
    
    console.log('\n📈 Favicon Generation Status:');
    console.log(`  Generated: ${generatedFavicons.length} favicon assets`);
    console.log('  PNG Files: favicon-16x16.png, favicon-32x32.png, favicon-48x48.png');
    console.log('  SVG Source: favicon.svg (for manual ICO creation)');
    console.log('  Manual Step: favicon.ico creation required');
}

// 実行
generateFavicons().catch(console.error);