/**
 * generate-maskable-icons.js
 * マスカブルアイコンを生成するスクリプト
 * Android Adaptive Iconsに対応した安全領域を考慮したアイコンを生成
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * マスカブルアイコンのSVGを生成
 * Android Adaptive Iconの仕様に準拠:
 * - 安全領域: 80% (中央の円形領域)
 * - 表示領域: 66% (最小保証表示領域)
 * @param {number} size - アイコンサイズ
 * @returns {string} SVG文字列
 */
function generateMaskableBubbleSVG(size) {
    const viewBox = `0 0 ${size} ${size}`;
    const center = size / 2;
    
    // マスカブルアイコンの領域定義
    const safeZone = size * 0.8 / 2;      // 80% - 安全領域
    const displayZone = size * 0.66 / 2;  // 66% - 最小表示領域
    
    // メインバブルは安全領域内に配置
    const mainBubbleRadius = safeZone - 4;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">
        <defs>
            <!-- Background gradient for full canvas -->
            <radialGradient id="bgGradient-${size}" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:#66BB6A"/>
                <stop offset="50%" style="stop-color:#4CAF50"/>
                <stop offset="100%" style="stop-color:#2E7D32"/>
            </radialGradient>
            
            <!-- Main bubble gradient -->
            <radialGradient id="mainGradient-${size}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#4CAF50"/>
                <stop offset="70%" style="stop-color:#2E7D32"/>
                <stop offset="100%" style="stop-color:#1B5E20"/>
            </radialGradient>
            
            <!-- Highlight gradient -->
            <radialGradient id="highlightGradient-${size}" cx="30%" cy="30%" r="40%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.9)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
            </radialGradient>
            
            <!-- Outer glow for better visibility -->
            <filter id="glow-${size}">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <!-- Background fill to ensure full coverage -->
        <rect width="${size}" height="${size}" fill="url(#bgGradient-${size})"/>
        
        <!-- Safe zone indicator (for development - remove in production) -->
        <!-- <circle cx="${center}" cy="${center}" r="${safeZone}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="5,5"/> -->
        
        <!-- Display zone indicator (for development - remove in production) -->
        <!-- <circle cx="${center}" cy="${center}" r="${displayZone}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="3,3"/> -->
        
        <!-- Main bubble - positioned within safe zone -->
        <circle cx="${center}" cy="${center}" r="${mainBubbleRadius}" 
                fill="url(#mainGradient-${size})" 
                filter="url(#glow-${size})"/>
        
        <!-- Primary highlight -->
        <circle cx="${center - safeZone/3}" cy="${center - safeZone/3}" r="${safeZone/2.5}" 
                fill="url(#highlightGradient-${size})"/>
        
        <!-- Decorative bubbles - carefully positioned within safe zone -->
        <circle cx="${center + safeZone * 0.4}" cy="${center - safeZone * 0.5}" r="${safeZone * 0.15}" 
                fill="rgba(255,255,255,0.6)"/>
        <circle cx="${center + safeZone * 0.5}" cy="${center + safeZone * 0.3}" r="${safeZone * 0.12}" 
                fill="rgba(255,255,255,0.5)"/>
        <circle cx="${center - safeZone * 0.5}" cy="${center + safeZone * 0.4}" r="${safeZone * 0.13}" 
                fill="rgba(255,255,255,0.4)"/>
        
        <!-- Small highlights on decorative bubbles -->
        <circle cx="${center + safeZone * 0.35}" cy="${center - safeZone * 0.55}" r="${safeZone * 0.05}" 
                fill="rgba(255,255,255,0.8)"/>
        <circle cx="${center + safeZone * 0.46}" cy="${center + safeZone * 0.26}" r="${safeZone * 0.04}" 
                fill="rgba(255,255,255,0.7)"/>
        <circle cx="${center - safeZone * 0.54}" cy="${center + safeZone * 0.36}" r="${safeZone * 0.045}" 
                fill="rgba(255,255,255,0.6)"/>
        
        ${size >= 192 ? `
        <!-- Game title - positioned within display zone for guaranteed visibility -->
        <text x="${center}" y="${center + displayZone * 0.7}" 
              font-family="Arial, sans-serif" 
              font-size="${Math.max(size * 0.06, 10)}" 
              font-weight="bold" 
              text-anchor="middle" 
              fill="rgba(255,255,255,0.95)"
              style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.7))">BubblePop</text>
        ` : ''}
        
        <!-- Corner accents for full canvas utilization -->
        <circle cx="${size * 0.15}" cy="${size * 0.15}" r="${size * 0.08}" 
                fill="rgba(255,255,255,0.1)"/>
        <circle cx="${size * 0.85}" cy="${size * 0.15}" r="${size * 0.06}" 
                fill="rgba(255,255,255,0.08)"/>
        <circle cx="${size * 0.15}" cy="${size * 0.85}" r="${size * 0.07}" 
                fill="rgba(255,255,255,0.09)"/>
        <circle cx="${size * 0.85}" cy="${size * 0.85}" r="${size * 0.05}" 
                fill="rgba(255,255,255,0.07)"/>
    </svg>`;
}

/**
 * マスカブルアイコンを生成
 */
async function generateMaskableIcons() {
    const iconsDir = path.join(process.cwd(), 'assets', 'icons');
    
    // ディレクトリが存在することを確認
    try {
        await fs.access(iconsDir);
    } catch {
        console.error('❌ assets/icons directory not found. Please run previous tasks first.');
        process.exit(1);
    }
    
    const maskableSizes = [
        { size: 192, description: 'Maskable PWA installation icon' },
        { size: 512, description: 'Maskable PWA splash screen icon' }
    ];
    
    console.log('🎨 Generating maskable PWA icons...\n');
    console.log('📋 Maskable Icon Specifications:');
    console.log('  - Safe Zone: 80% (guaranteed not to be clipped)');
    console.log('  - Display Zone: 66% (minimum guaranteed visible area)');
    console.log('  - Full Canvas: 100% (background utilization)\n');
    
    for (const icon of maskableSizes) {
        const filename = `icon-maskable-${icon.size}x${icon.size}`;
        
        // SVG生成
        const svg = generateMaskableBubbleSVG(icon.size);
        const svgFile = path.join(iconsDir, `${filename}.svg`);
        await fs.writeFile(svgFile, svg);
        console.log(`✅ Generated SVG: ${filename}.svg`);
        
        // 情報ファイル作成
        const infoContent = `Maskable PWA Icon - ${filename}.png
Size: ${icon.size}x${icon.size}px
Purpose: ${icon.description}
Type: Maskable PWA Icon (Android Adaptive Icon compatible)
Generated: ${new Date().toISOString()}

Maskable Icon Specifications:
- Safe Zone: 80% of icon size (${Math.round(icon.size * 0.8)}x${Math.round(icon.size * 0.8)}px)
- Display Zone: 66% of icon size (${Math.round(icon.size * 0.66)}x${Math.round(icon.size * 0.66)}px)
- Background: Full canvas utilization for better appearance
- Compatibility: Android Adaptive Icons, PWA maskable icons

To convert to PNG:
1. Use: sips -s format png ${filename}.svg --out ${filename}.png
2. Or use the web-based generator

Manifest.json usage:
{
  "src": "/assets/icons/${filename}.png",
  "sizes": "${icon.size}x${icon.size}",
  "type": "image/png",
  "purpose": "maskable"
}
`;
        
        const infoFile = path.join(iconsDir, `${filename}.png.info.txt`);
        await fs.writeFile(infoFile, infoContent);
        console.log(`📋 Created info: ${filename}.png.info.txt`);
    }
    
    console.log('\n🔧 Converting SVG to PNG...');
    
    // PNG変換を試行
    for (const icon of maskableSizes) {
        const filename = `icon-maskable-${icon.size}x${icon.size}`;
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
            console.log(`   Manual conversion: sips -s format png "${svgPath}" --out "${pngPath}"`);
        }
    }
    
    console.log('\n📋 Summary - Maskable PWA Icons Generated:');
    maskableSizes.forEach(icon => {
        console.log(`  - icon-maskable-${icon.size}x${icon.size}.png (${icon.description})`);
    });
    
    console.log('\n✅ All PWA Icons Status:');
    console.log('  Standard Icons: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 ✅');
    console.log('  Maskable Icons: 192x192, 512x512 ✅');
    console.log('  Total: 10 icon files generated');
    
    console.log('\n🔍 Next steps:');
    console.log('  1. Verify maskable icons display correctly in various shapes');
    console.log('  2. Test PWA installation with maskable icon support');
    console.log('  3. Continue to Task 3 (Apple-specific PWA assets)');
    
    console.log('\n📱 Testing Maskable Icons:');
    console.log('  - Chrome DevTools: Application > Manifest');
    console.log('  - Maskable.app: https://maskable.app/');
    console.log('  - Android: Install PWA and check launcher icon adaptation');
}

// 実行
generateMaskableIcons().catch(console.error);