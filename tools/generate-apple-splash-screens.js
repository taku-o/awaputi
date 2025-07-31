/**
 * generate-apple-splash-screens.js
 * Apple splash screen images (Apple Startup Images) を生成するスクリプト
 * iOS Safari PWA用の起動画面を各デバイスサイズに対応して作成
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Apple Splash Screen用のSVGを生成
 * @param {number} width - 画面幅
 * @param {number} height - 画面高さ  
 * @param {string} deviceName - デバイス名（表示用）
 * @returns {string} SVG文字列
 */
function generateAppleSplashScreenSVG(width, height, deviceName) {
    const viewBox = `0 0 ${width} ${height}`;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // スプラッシュスクリーンのデザインサイズ計算
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    const bubbleSize = minDimension * 0.15; // 画面の15%
    const titleSize = minDimension * 0.06; // 画面の6%
    
    // レスポンシブレイアウト
    const isLandscape = width > height;
    const logoY = isLandscape ? centerY : centerY - minDimension * 0.1;
    const titleY = logoY + bubbleSize + titleSize * 2;
    const subtitleY = titleY + titleSize * 1.5;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">
        <defs>
            <!-- Background gradient optimized for splash screens -->
            <linearGradient id="splashBg-${width}x${height}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#E8F5E8"/>
                <stop offset="30%" style="stop-color:#C8E6C9"/>
                <stop offset="70%" style="stop-color:#A5D6A7"/>
                <stop offset="100%" style="stop-color:#81C784"/>
            </linearGradient>
            
            <!-- Main logo gradient -->
            <radialGradient id="splashLogo-${width}x${height}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#66BB6A"/>
                <stop offset="30%" style="stop-color:#4CAF50"/>
                <stop offset="70%" style="stop-color:#2E7D32"/>
                <stop offset="100%" style="stop-color:#1B5E20"/>
            </radialGradient>
            
            <!-- Logo highlight -->
            <radialGradient id="splashHighlight-${width}x${height}" cx="35%" cy="30%" r="40%">
                <stop offset="0%" style="stop-color:rgba(255,255,255,0.9)"/>
                <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
            </radialGradient>
            
            <!-- Text shadow filter -->
            <filter id="textShadow-${width}x${height}">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
            
            <!-- Logo shadow filter -->
            <filter id="logoShadow-${width}x${height}">
                <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.15)"/>
            </filter>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#splashBg-${width}x${height})"/>
        
        <!-- Decorative background bubbles -->
        <circle cx="${width * 0.15}" cy="${height * 0.2}" r="${minDimension * 0.08}" 
                fill="rgba(255,255,255,0.1)" opacity="0.6"/>
        <circle cx="${width * 0.85}" cy="${height * 0.25}" r="${minDimension * 0.06}" 
                fill="rgba(255,255,255,0.08)" opacity="0.5"/>
        <circle cx="${width * 0.1}" cy="${height * 0.7}" r="${minDimension * 0.05}" 
                fill="rgba(255,255,255,0.12)" opacity="0.4"/>
        <circle cx="${width * 0.9}" cy="${height * 0.8}" r="${minDimension * 0.07}" 
                fill="rgba(255,255,255,0.09)" opacity="0.5"/>
        
        <!-- Main logo bubble -->
        <circle cx="${centerX}" cy="${logoY}" r="${bubbleSize}" 
                fill="url(#splashLogo-${width}x${height})" 
                filter="url(#logoShadow-${width}x${height})"/>
        
        <!-- Logo highlight -->
        <circle cx="${centerX - bubbleSize * 0.3}" cy="${logoY - bubbleSize * 0.3}" 
                r="${bubbleSize * 0.5}" 
                fill="url(#splashHighlight-${width}x${height})"/>
        
        <!-- Logo decorative bubbles -->
        <circle cx="${centerX + bubbleSize * 0.4}" cy="${logoY - bubbleSize * 0.5}" 
                r="${bubbleSize * 0.15}" 
                fill="rgba(255,255,255,0.7)"/>
        <circle cx="${centerX + bubbleSize * 0.5}" cy="${logoY + bubbleSize * 0.3}" 
                r="${bubbleSize * 0.12}" 
                fill="rgba(255,255,255,0.6)"/>
        <circle cx="${centerX - bubbleSize * 0.5}" cy="${logoY + bubbleSize * 0.4}" 
                r="${bubbleSize * 0.13}" 
                fill="rgba(255,255,255,0.5)"/>
        
        <!-- Game title -->
        <text x="${centerX}" y="${titleY}" 
              font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Helvetica, Arial, sans-serif" 
              font-size="${titleSize}" 
              font-weight="700" 
              text-anchor="middle" 
              fill="#2E7D32"
              filter="url(#textShadow-${width}x${height})">BubblePop</text>
        
        <!-- Subtitle -->
        <text x="${centerX}" y="${subtitleY}" 
              font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Helvetica, Arial, sans-serif" 
              font-size="${titleSize * 0.4}" 
              font-weight="400" 
              text-anchor="middle" 
              fill="#388E3C"
              opacity="0.8">バブルポップゲーム</text>
        
        <!-- Loading indicator area (bottom) -->
        <g transform="translate(${centerX}, ${height - minDimension * 0.1})">
            <!-- Loading dots -->
            <circle cx="-${minDimension * 0.03}" cy="0" r="${minDimension * 0.008}" 
                    fill="#4CAF50" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="0" r="${minDimension * 0.008}" 
                    fill="#4CAF50" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="${minDimension * 0.03}" cy="0" r="${minDimension * 0.008}" 
                    fill="#4CAF50" opacity="0.6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
            </circle>
        </g>
        
        <!-- Device info (for development - remove in production) -->
        <!-- <text x="${width - 10}" y="${height - 10}" 
              font-family="SF Mono, Monaco, monospace" 
              font-size="10" 
              text-anchor="end" 
              fill="rgba(0,0,0,0.3)">${deviceName} (${width}×${height})</text> -->
    </svg>`;
}

/**
 * Apple Splash Screensを生成
 */
async function generateAppleSplashScreens() {
    // スプラッシュスクリーンをassetsディレクトリに配置
    const splashDir = path.join(process.cwd(), 'assets', 'splash-screens');
    
    // ディレクトリ作成
    try {
        await fs.mkdir(splashDir, { recursive: true });
        console.log('📁 Created assets/splash-screens directory');
    } catch (error) {
        // ディレクトリが既に存在する場合は無視
    }
    
    // iOS デバイス仕様（2024年現在）
    const iosDevices = [
        // iPhone (Portrait)
        { width: 320, height: 568, device: 'iPhone SE (1st gen)', orientation: 'portrait' },
        { width: 375, height: 667, device: 'iPhone 8', orientation: 'portrait' },
        { width: 375, height: 812, device: 'iPhone X/XS/11 Pro', orientation: 'portrait' },
        { width: 390, height: 844, device: 'iPhone 12/13 mini', orientation: 'portrait' },
        { width: 393, height: 852, device: 'iPhone 14/15', orientation: 'portrait' },
        { width: 414, height: 896, device: 'iPhone XR/XS Max/11/12/13/14 Plus', orientation: 'portrait' },
        { width: 430, height: 932, device: 'iPhone 14 Pro Max/15 Pro Max', orientation: 'portrait' },
        
        // iPhone (Landscape)
        { width: 568, height: 320, device: 'iPhone SE (1st gen)', orientation: 'landscape' },
        { width: 667, height: 375, device: 'iPhone 8', orientation: 'landscape' },
        { width: 812, height: 375, device: 'iPhone X/XS/11 Pro', orientation: 'landscape' },
        { width: 844, height: 390, device: 'iPhone 12/13 mini', orientation: 'landscape' },
        { width: 852, height: 393, device: 'iPhone 14/15', orientation: 'landscape' },
        { width: 896, height: 414, device: 'iPhone XR/XS Max/11/12/13/14 Plus', orientation: 'landscape' },
        { width: 932, height: 430, device: 'iPhone 14 Pro Max/15 Pro Max', orientation: 'landscape' },
        
        // iPad (Portrait)
        { width: 768, height: 1024, device: 'iPad (9th gen)', orientation: 'portrait' },
        { width: 834, height: 1194, device: 'iPad Air (4th/5th gen)', orientation: 'portrait' },
        { width: 820, height: 1180, device: 'iPad Air (6th gen)', orientation: 'portrait' },
        { width: 1024, height: 1366, device: 'iPad Pro 12.9"', orientation: 'portrait' },
        
        // iPad (Landscape)  
        { width: 1024, height: 768, device: 'iPad (9th gen)', orientation: 'landscape' },
        { width: 1194, height: 834, device: 'iPad Air (4th/5th gen)', orientation: 'landscape' },
        { width: 1180, height: 820, device: 'iPad Air (6th gen)', orientation: 'landscape' },
        { width: 1366, height: 1024, device: 'iPad Pro 12.9"', orientation: 'landscape' }
    ];
    
    console.log('🍎 Generating Apple Splash Screens...\n');
    
    console.log('📋 Apple Splash Screen Specifications:');
    console.log('  - Location: /assets/splash-screens/');
    console.log('  - Format: PNG with device-specific dimensions');
    console.log('  - Design: Responsive layout for portrait and landscape');
    console.log(`  - Devices: ${iosDevices.length} iOS device configurations\n`);
    
    const generatedScreens = [];
    
    for (const device of iosDevices) {
        const filename = `apple-splash-${device.width}x${device.height}`;
        
        // SVG生成
        const svg = generateAppleSplashScreenSVG(device.width, device.height, device.device);
        const svgFile = path.join(splashDir, `${filename}.svg`);
        await fs.writeFile(svgFile, svg);
        
        // 情報ファイル作成
        const infoContent = `Apple Splash Screen - ${filename}.png
Dimensions: ${device.width}×${device.height}px
Device: ${device.device}
Orientation: ${device.orientation}
Generated: ${new Date().toISOString()}

Apple Splash Screen Specifications:
- Optimized for iOS Safari PWA launch experience
- Responsive design adapts to portrait/landscape orientations
- Loading animation provides visual feedback during app initialization
- Device-specific dimensions ensure pixel-perfect display

HTML meta tag usage:
<link rel="apple-touch-startup-image" href="/assets/splash-screens/${filename}.png" 
      media="(device-width: ${device.orientation === 'portrait' ? Math.min(device.width, device.height) : Math.max(device.width, device.height)}px) and (device-height: ${device.orientation === 'portrait' ? Math.max(device.width, device.height) : Math.min(device.width, device.height)}px) and (-webkit-device-pixel-ratio: 2) and (orientation: ${device.orientation})">

To convert to PNG:
sips -s format png ${filename}.svg --out ${filename}.png
`;
        
        const infoFile = path.join(splashDir, `${filename}.png.info.txt`);
        await fs.writeFile(infoFile, infoContent);
        
        generatedScreens.push({
            filename,
            device: device.device,
            orientation: device.orientation,
            dimensions: `${device.width}×${device.height}`
        });
        
        console.log(`✅ Generated: ${filename}.svg (${device.device} - ${device.orientation})`);
    }
    
    console.log('\n🔧 Converting SVG to PNG...');
    
    // PNG変換を試行
    let convertedCount = 0;
    for (const device of iosDevices) {
        const filename = `apple-splash-${device.width}x${device.height}`;
        const svgPath = path.join(splashDir, `${filename}.svg`);
        const pngPath = path.join(splashDir, `${filename}.png`);
        
        try {
            // sipsコマンドを使用してSVGをPNGに変換
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
    
    console.log(`✅ Converted ${convertedCount}/${iosDevices.length} splash screens to PNG`);
    
    console.log('\n📋 Summary - Apple Splash Screens Generated:');
    
    const groupedScreens = generatedScreens.reduce((groups, screen) => {
        const deviceType = screen.device.includes('iPad') ? 'iPad' : 'iPhone';
        if (!groups[deviceType]) groups[deviceType] = { portrait: [], landscape: [] };
        groups[deviceType][screen.orientation].push(screen);
        return groups;
    }, {});
    
    Object.entries(groupedScreens).forEach(([deviceType, orientations]) => {
        console.log(`\n  ${deviceType}:`);
        console.log(`    Portrait: ${orientations.portrait.length} screens`);
        console.log(`    Landscape: ${orientations.landscape.length} screens`);
    });
    
    console.log('\n📱 HTML Integration Required:');
    console.log('Add to <head> section of index.html (example for iPhone 14):');
    console.log('');
    
    // 代表的なデバイスのHTMLタグ例を表示
    const exampleDevices = iosDevices.filter(d => 
        d.device.includes('iPhone 14') && d.orientation === 'portrait'
    ).slice(0, 2);
    
    exampleDevices.forEach(device => {
        const filename = `apple-splash-${device.width}x${device.height}`;
        console.log(`<link rel="apple-touch-startup-image" href="/assets/splash-screens/${filename}.png"`);
        console.log(`      media="(device-width: ${Math.min(device.width, device.height)}px) and (device-height: ${Math.max(device.width, device.height)}px) and (-webkit-device-pixel-ratio: 2) and (orientation: ${device.orientation})">`);
    });
    
    console.log('\n🔍 Next steps:');
    console.log('  1. Add Apple splash screen meta tags to index.html');
    console.log('  2. Test splash screens on various iOS devices');
    console.log('  3. Continue to Task 4 (Favicons and browser tab icons)');
    
    console.log('\n📈 Apple Splash Screens Status:');
    console.log(`  Generated: ${iosDevices.length} splash screen images`);
    console.log(`  iPhone screens: ${iosDevices.filter(d => !d.device.includes('iPad')).length}`);
    console.log(`  iPad screens: ${iosDevices.filter(d => d.device.includes('iPad')).length}`);
    console.log('  Orientations: Portrait and Landscape for all devices');
}

// 実行
generateAppleSplashScreens().catch(console.error);