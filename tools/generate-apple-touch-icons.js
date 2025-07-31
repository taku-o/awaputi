/**
 * generate-apple-touch-icons.js
 * Apple Touch Iconsを生成するスクリプト
 * iOS Safari、iPadOS、Apple Watchなど様々なAppleデバイス対応
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Apple Touch Icon用のSVGを生成
 * Appleデバイス特化の最適化:
 * - 角丸は自動適用されるため、四角形デザイン
 * - 高コントラスト対応
 * - Retina Display対応の細部まで鮮明
 * @param {number} size - アイコンサイズ
 * @returns {string} SVG文字列
 */
function generateAppleTouchIconSVG(size) {
    const viewBox = `0 0 ${size} ${size}`;
    const center = size / 2;
    
    // Appleデバイス用の最適化されたサイズ
    const bubbleRadius = size * 0.42; // 84%の直径
    const useDetailedGraphics = size >= 114; // 高解像度用詳細グラフィック
    const useTitle = size >= 152; // 大型アイコン用タイトル
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">
        <defs>
            <!-- Apple-optimized gradients with better contrast -->
            <radialGradient id="appleMainGradient-${size}" cx="45%" cy="45%" r="60%">
                <stop offset="0%" style="stop-color:#66BB6A"/>
                <stop offset="30%" style="stop-color:#4CAF50"/>
                <stop offset="70%" style="stop-color:#2E7D32"/>
                <stop offset="100%" style="stop-color:#1B5E20"/>
            </radialGradient>
            
            <!-- High-contrast highlight for Retina displays -->
            <radialGradient id="appleHighlight-${size}" cx="35%" cy="35%" r="45%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.95)"/>
                <stop offset="60%" style="stop-color:rgba(255,255,255,0.3)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
            </radialGradient>
            
            <!-- Background gradient for full coverage -->
            <linearGradient id="appleBg-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#81C784"/>
                <stop offset="50%" style="stop-color:#4CAF50"/>
                <stop offset="100%" style="stop-color:#388E3C"/>
            </linearGradient>
            
            <!-- Subtle shadow for depth -->
            <filter id="appleShadow-${size}" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="${size * 0.01}"/>
                <feOffset dx="${size * 0.01}" dy="${size * 0.015}" result="offset"/>
                <feFlood flood-color="rgba(0,0,0,0.3)"/>
                <feComposite in2="offset" operator="in"/>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        <!-- Background - full coverage for Apple's rounded corners -->
        <rect width="${size}" height="${size}" fill="url(#appleBg-${size})"/>
        
        <!-- Main bubble with Apple-optimized positioning -->
        <circle cx="${center}" cy="${center}" r="${bubbleRadius}" 
                fill="url(#appleMainGradient-${size})" 
                filter="url(#appleShadow-${size})"/>
        
        <!-- Primary highlight - optimized for Apple's rendering -->
        <circle cx="${center - bubbleRadius * 0.35}" cy="${center - bubbleRadius * 0.4}" 
                r="${bubbleRadius * 0.6}" 
                fill="url(#appleHighlight-${size})"/>
        
        ${useDetailedGraphics ? `
        <!-- Detailed decorative elements for high-res displays -->
        <circle cx="${center + bubbleRadius * 0.5}" cy="${center - bubbleRadius * 0.6}" 
                r="${bubbleRadius * 0.18}" 
                fill="rgba(255,255,255,0.7)"/>
        <circle cx="${center + bubbleRadius * 0.6}" cy="${center + bubbleRadius * 0.4}" 
                r="${bubbleRadius * 0.14}" 
                fill="rgba(255,255,255,0.6)"/>
        <circle cx="${center - bubbleRadius * 0.6}" cy="${center + bubbleRadius * 0.5}" 
                r="${bubbleRadius * 0.16}" 
                fill="rgba(255,255,255,0.5)"/>
        
        <!-- High-res highlights on decorative bubbles -->
        <circle cx="${center + bubbleRadius * 0.45}" cy="${center - bubbleRadius * 0.65}" 
                r="${bubbleRadius * 0.06}" 
                fill="rgba(255,255,255,0.9)"/>
        <circle cx="${center + bubbleRadius * 0.56}" cy="${center + bubbleRadius * 0.36}" 
                r="${bubbleRadius * 0.05}" 
                fill="rgba(255,255,255,0.8)"/>
        <circle cx="${center - bubbleRadius * 0.64}" cy="${center + bubbleRadius * 0.46}" 
                r="${bubbleRadius * 0.055}" 
                fill="rgba(255,255,255,0.7)"/>
        ` : `
        <!-- Simplified decorative elements for standard resolution -->
        <circle cx="${center + bubbleRadius * 0.5}" cy="${center - bubbleRadius * 0.5}" 
                r="${bubbleRadius * 0.15}" 
                fill="rgba(255,255,255,0.6)"/>
        <circle cx="${center + bubbleRadius * 0.55}" cy="${center + bubbleRadius * 0.4}" 
                r="${bubbleRadius * 0.12}" 
                fill="rgba(255,255,255,0.5)"/>
        <circle cx="${center - bubbleRadius * 0.55}" cy="${center + bubbleRadius * 0.45}" 
                r="${bubbleRadius * 0.13}" 
                fill="rgba(255,255,255,0.4)"/>
        `}
        
        ${useTitle ? `
        <!-- Game title for larger icons -->
        <text x="${center}" y="${center + bubbleRadius * 1.3}" 
              font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" 
              font-size="${Math.max(size * 0.08, 11)}" 
              font-weight="600" 
              text-anchor="middle" 
              fill="rgba(255,255,255,0.95)"
              style="filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.6))">BubblePop</text>
        ` : ''}
        
        <!-- Corner details for better Apple integration -->
        <circle cx="${size * 0.2}" cy="${size * 0.2}" r="${size * 0.04}" 
                fill="rgba(255,255,255,0.15)" opacity="0.8"/>
        <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.035}" 
                fill="rgba(255,255,255,0.12)" opacity="0.7"/>
        <circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.038}" 
                fill="rgba(255,255,255,0.13)" opacity="0.75"/>
        <circle cx="${size * 0.8}" cy="${size * 0.8}" r="${size * 0.032}" 
                fill="rgba(255,255,255,0.11)" opacity="0.65"/>
    </svg>`;
}

/**
 * Apple Touch Iconsを生成
 */
async function generateAppleTouchIcons() {
    // アイコンをルートディレクトリに配置（Apple推奨）
    const rootDir = process.cwd();
    
    // Apple Touch Iconサイズ定義
    const appleSizes = [
        { size: 57, description: 'iPhone (iOS 6 and earlier)', legacy: true },
        { size: 60, description: 'iPhone (iOS 7-10)', standard: true },
        { size: 72, description: 'iPad (iOS 6 and earlier)', legacy: true },
        { size: 76, description: 'iPad (iOS 7-10)', standard: true },
        { size: 114, description: 'iPhone Retina (iOS 6 and earlier)', legacy: true },
        { size: 120, description: 'iPhone Retina (iOS 7-14)', standard: true },
        { size: 144, description: 'iPad Retina (iOS 6 and earlier)', legacy: true },
        { size: 152, description: 'iPad Retina (iOS 7-10)', standard: true },
        { size: 180, description: 'iPhone 6/7/8/X/11/12/13/14/15 Plus & Pro', primary: true }
    ];
    
    console.log('🍎 Generating Apple Touch Icons...\n');
    
    console.log('📋 Apple Touch Icon Specifications:');
    console.log('  - Location: Root directory (Apple recommendation)');
    console.log('  - Format: Square PNG (iOS applies rounded corners automatically)');
    console.log('  - Design: High contrast, optimized for Retina displays');
    console.log('  - Compatibility: iOS 6+ across all devices\n');
    
    for (const icon of appleSizes) {
        const filename = `apple-touch-icon-${icon.size}x${icon.size}`;
        
        // SVG生成
        const svg = generateAppleTouchIconSVG(icon.size);
        const svgFile = path.join(rootDir, `${filename}.svg`);
        await fs.writeFile(svgFile, svg);
        console.log(`✅ Generated SVG: ${filename}.svg`);
        
        // 情報ファイル作成
        const priority = icon.primary ? 'PRIMARY' : (icon.standard ? 'Standard' : 'Legacy');
        const infoContent = `Apple Touch Icon - ${filename}.png
Size: ${icon.size}x${icon.size}px
Device: ${icon.description}
Priority: ${priority}
Generated: ${new Date().toISOString()}

Apple Touch Icon Specifications:
- iOS automatically applies rounded corners (don't pre-round)
- High contrast design for better visibility
- Optimized for Retina displays with fine details
- Background fills entire canvas area

HTML meta tag usage:
<link rel="apple-touch-icon" sizes="${icon.size}x${icon.size}" href="/${filename}.png">

iOS Behavior:
- iOS will automatically downscale larger icons if exact size not found
- Primary icon (180x180) is used for modern iPhones
- Legacy icons maintained for older iOS versions

To convert to PNG:
sips -s format png ${filename}.svg --out ${filename}.png
`;
        
        const infoFile = path.join(rootDir, `${filename}.png.info.txt`);
        await fs.writeFile(infoFile, infoContent);
        console.log(`📋 Created info: ${filename}.png.info.txt`);
    }
    
    console.log('\n🔧 Converting SVG to PNG...');
    
    // PNG変換を試行
    for (const icon of appleSizes) {
        const filename = `apple-touch-icon-${icon.size}x${icon.size}`;
        const svgPath = path.join(rootDir, `${filename}.svg`);
        const pngPath = path.join(rootDir, `${filename}.png`);
        
        try {
            // sipsコマンドを使用してSVGをPNGに変換
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            const command = `sips -s format png "${svgPath}" --out "${pngPath}"`;
            await execAsync(command);
            
            const priority = icon.primary ? '⭐ ' : (icon.standard ? '✅ ' : '📱 ');
            console.log(`${priority}Converted: ${filename}.png (${icon.description})`);
        } catch (error) {
            console.log(`⚠️  PNG conversion failed for ${filename}: ${error.message}`);
            console.log(`   Manual conversion: sips -s format png "${svgPath}" --out "${pngPath}"`);
        }
    }
    
    console.log('\n📋 Summary - Apple Touch Icons Generated:');
    appleSizes.forEach(icon => {
        const priority = icon.primary ? ' ⭐ PRIMARY' : (icon.standard ? ' ✅ Standard' : ' 📱 Legacy');
        console.log(`  - apple-touch-icon-${icon.size}x${icon.size}.png${priority}`);
    });
    
    console.log('\n📱 HTML Integration Required:');
    console.log('Add to <head> section of index.html:');
    console.log('');
    
    // 主要なアイコンのみHTMLタグを表示
    const primaryIcons = appleSizes.filter(icon => icon.primary || icon.standard);
    primaryIcons.forEach(icon => {
        console.log(`<link rel="apple-touch-icon" sizes="${icon.size}x${icon.size}" href="/apple-touch-icon-${icon.size}x${icon.size}.png">`);
    });
    
    console.log('\n🔍 Next steps:');
    console.log('  1. Add Apple Touch Icon meta tags to index.html');
    console.log('  2. Test icons on various iOS devices and versions');
    console.log('  3. Continue to Task 3.2 (Apple splash screens)');
    
    console.log('\n📈 Apple Touch Icons Status:');
    console.log(`  Generated: ${appleSizes.length} Apple Touch Icons`);
    console.log('  Primary: 180x180 (iPhone 6+, X, 11, 12, 13, 14, 15 series)');
    console.log('  Standard: 60, 76, 120, 152 (Modern iOS devices)');
    console.log('  Legacy: 57, 72, 114, 144 (iOS 6 and earlier)');
}

// 実行
generateAppleTouchIcons().catch(console.error);