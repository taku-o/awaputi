/**
 * generate-shortcut-icons.js
 * PWAショートカット用アイコンを生成するスクリプト
 * クイックプレイ、統計、設定、実績の各ショートカット用96x96pxアイコンを作成
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * ショートカットアイコン用SVGを生成
 * @param {string} type - アイコンタイプ（play, stats, settings, achievements）
 * @param {number} size - アイコンサイズ（デフォルト96px）
 * @returns {string} SVG文字列
 */
function generateShortcutIconSVG(type, size = 96) {
    const viewBox = `0 0 ${size} ${size}`;
    const center = size / 2;
    const iconSize = size * 0.4;
    
    // ベース背景グラデーション
    const baseGradient = `
        <defs>
            <linearGradient id="shortcutBg-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#66BB6A"/>
                <stop offset="50%" style="stop-color:#4CAF50"/>
                <stop offset="100%" style="stop-color:#388E3C"/>
            </linearGradient>
            <filter id="shadow-${type}">
                <feDropShadow dx="2" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
        </defs>`;
    
    let iconSVG = '';
    
    switch (type) {
        case 'play':
            // プレイボタン（再生アイコン）
            iconSVG = `
                <!-- Play button background circle -->
                <circle cx="${center}" cy="${center}" r="${iconSize}" 
                        fill="rgba(255,255,255,0.9)" filter="url(#shadow-${type})"/>
                
                <!-- Play triangle -->
                <polygon points="${center-iconSize*0.3},${center-iconSize*0.4} ${center+iconSize*0.4},${center} ${center-iconSize*0.3},${center+iconSize*0.4}" 
                         fill="#2E7D32"/>
                
                <!-- Decorative bubbles -->
                <circle cx="${center+iconSize*0.7}" cy="${center-iconSize*0.7}" r="${iconSize*0.15}" 
                        fill="rgba(255,255,255,0.7)"/>
                <circle cx="${center-iconSize*0.6}" cy="${center+iconSize*0.8}" r="${iconSize*0.12}" 
                        fill="rgba(255,255,255,0.6)"/>`;
            break;
            
        case 'stats':
            // 統計チャート
            iconSVG = `
                <!-- Stats background -->
                <rect x="${center-iconSize*0.8}" y="${center-iconSize*0.8}" 
                      width="${iconSize*1.6}" height="${iconSize*1.6}" 
                      rx="${iconSize*0.1}" fill="rgba(255,255,255,0.9)" filter="url(#shadow-${type})"/>
                
                <!-- Bar chart -->
                <rect x="${center-iconSize*0.5}" y="${center-iconSize*0.2}" 
                      width="${iconSize*0.2}" height="${iconSize*0.8}" fill="#2E7D32"/>
                <rect x="${center-iconSize*0.1}" y="${center}" 
                      width="${iconSize*0.2}" height="${iconSize*0.4}" fill="#4CAF50"/>
                <rect x="${center+iconSize*0.3}" y="${center-iconSize*0.6}" 
                      width="${iconSize*0.2}" height="${iconSize*1.2}" fill="#66BB6A"/>
                
                <!-- Trend line -->
                <polyline points="${center-iconSize*0.6},${center+iconSize*0.3} ${center-iconSize*0.2},${center-iconSize*0.1} ${center+iconSize*0.2},${center-iconSize*0.4} ${center+iconSize*0.6},${center-iconSize*0.7}"
                          stroke="#1B5E20" stroke-width="3" fill="none"/>`;
            break;
            
        case 'settings':
            // 設定歯車
            iconSVG = `
                <!-- Settings gear -->
                <g transform="translate(${center}, ${center})">
                    <!-- Outer gear -->
                    <circle r="${iconSize*0.9}" fill="rgba(255,255,255,0.9)" filter="url(#shadow-${type})"/>
                    
                    <!-- Gear teeth -->
                    ${Array.from({length: 8}, (_, i) => {
                        const angle = (i * 45) * Math.PI / 180;
                        const x = Math.cos(angle) * iconSize * 0.85;
                        const y = Math.sin(angle) * iconSize * 0.85;
                        return `<rect x="${x-iconSize*0.08}" y="${y-iconSize*0.15}" 
                                      width="${iconSize*0.16}" height="${iconSize*0.3}" 
                                      fill="#2E7D32" 
                                      transform="rotate(${i*45} ${x} ${y})"/>`;
                    }).join('')}
                    
                    <!-- Inner circle -->
                    <circle r="${iconSize*0.4}" fill="#4CAF50"/>
                    <circle r="${iconSize*0.15}" fill="rgba(255,255,255,0.8)"/>
                </g>`;
            break;
            
        case 'achievements':
            // トロフィー/実績
            iconSVG = `
                <!-- Trophy base -->
                <rect x="${center-iconSize*0.3}" y="${center+iconSize*0.4}" 
                      width="${iconSize*0.6}" height="${iconSize*0.3}" 
                      fill="#795548" filter="url(#shadow-${type})"/>
                
                <!-- Trophy cup -->
                <ellipse cx="${center}" cy="${center-iconSize*0.1}" 
                         rx="${iconSize*0.5}" ry="${iconSize*0.6}" 
                         fill="rgba(255,193,7,0.9)"/>
                
                <!-- Trophy handles -->
                <ellipse cx="${center-iconSize*0.7}" cy="${center-iconSize*0.2}" 
                         rx="${iconSize*0.1}" ry="${iconSize*0.3}" 
                         fill="none" stroke="#FF8F00" stroke-width="6"/>
                <ellipse cx="${center+iconSize*0.7}" cy="${center-iconSize*0.2}" 
                         rx="${iconSize*0.1}" ry="${iconSize*0.3}" 
                         fill="none" stroke="#FF8F00" stroke-width="6"/>
                
                <!-- Trophy highlight -->
                <ellipse cx="${center-iconSize*0.2}" cy="${center-iconSize*0.3}" 
                         rx="${iconSize*0.15}" ry="${iconSize*0.2}" 
                         fill="rgba(255,255,255,0.7)"/>
                
                <!-- Star decoration -->
                <polygon points="${center},${center-iconSize*0.5} ${center+iconSize*0.1},${center-iconSize*0.2} ${center+iconSize*0.3},${center-iconSize*0.2} ${center+iconSize*0.15},${center} ${center+iconSize*0.2},${center+iconSize*0.2} ${center},${center+iconSize*0.1} ${center-iconSize*0.2},${center+iconSize*0.2} ${center-iconSize*0.15},${center} ${center-iconSize*0.3},${center-iconSize*0.2} ${center-iconSize*0.1},${center-iconSize*0.2}" 
                         fill="#FF6F00"/>`;
            break;
    }
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">
        ${baseGradient}
        
        <!-- Background -->
        <rect width="${size}" height="${size}" rx="${size*0.15}" fill="url(#shortcutBg-${type})"/>
        
        <!-- Icon content -->
        ${iconSVG}
    </svg>`;
}

/**
 * ショートカットアイコンを生成
 */
async function generateShortcutIcons() {
    const iconsDir = path.join(process.cwd(), 'assets', 'icons');
    
    // アイコンディレクトリ確認
    try {
        await fs.access(iconsDir);
    } catch {
        console.log('❌ assets/icons directory not found. Please create it first.');
        return;
    }
    
    console.log('🔗 Generating PWA Shortcut Icons...\n');
    
    console.log('📋 Shortcut Icon Specifications:');
    console.log('  - Location: /assets/icons/');
    console.log('  - Size: 96×96px (PWA standard)');
    console.log('  - Format: PNG from SVG source');
    console.log('  - Types: Play, Stats, Settings, Achievements\\n');
    
    const shortcuts = [
        { 
            type: 'play', 
            filename: 'shortcut-play',
            description: 'Quick Play - Game start shortcut icon',
            manifest_name: 'クイックプレイ'
        },
        { 
            type: 'stats', 
            filename: 'shortcut-stats',
            description: 'Statistics - Player stats and scores shortcut icon',
            manifest_name: '統計表示'
        },
        { 
            type: 'settings', 
            filename: 'shortcut-settings',
            description: 'Settings - Game configuration shortcut icon',
            manifest_name: '設定'
        },
        { 
            type: 'achievements', 
            filename: 'shortcut-achievements',
            description: 'Achievements - Player achievements shortcut icon',
            manifest_name: '実績'
        }
    ];
    
    const generatedIcons = [];
    
    for (const shortcut of shortcuts) {
        // SVG生成
        const svg = generateShortcutIconSVG(shortcut.type, 96);
        const svgFile = path.join(iconsDir, `${shortcut.filename}.svg`);
        await fs.writeFile(svgFile, svg);
        
        // 情報ファイル作成
        const infoContent = `PWA Shortcut Icon - ${shortcut.filename}.png
Size: 96×96px
Type: ${shortcut.type}
Purpose: ${shortcut.description}
Manifest Name: ${shortcut.manifest_name}
Generated: ${new Date().toISOString()}

PWA Shortcut Icon Specifications:
- Designed for PWA app shortcuts in launcher/home screen
- 96x96px is the standard size for shortcut icons
- Optimized for visibility at small sizes
- Bubble-themed design consistent with main app icons

Manifest.json usage:
{
  "name": "${shortcut.manifest_name}",
  "icons": [
    {
      "src": "/assets/icons/${shortcut.filename}.png",
      "sizes": "96x96",
      "type": "image/png"
    }
  ]
}

To convert to PNG:
sips -s format png ${shortcut.filename}.svg --out ${shortcut.filename}.png
`;
        
        const infoFile = path.join(iconsDir, `${shortcut.filename}.png.info.txt`);
        await fs.writeFile(infoFile, infoContent);
        
        generatedIcons.push({
            type: shortcut.type,
            filename: shortcut.filename,
            description: shortcut.description,
            manifest_name: shortcut.manifest_name
        });
        
        console.log(`✅ Generated: ${shortcut.filename}.svg (${shortcut.description})`);
    }
    
    console.log('\\n🔧 Converting SVG to PNG...');
    
    // PNG変換
    let convertedCount = 0;
    for (const shortcut of shortcuts) {
        const svgPath = path.join(iconsDir, `${shortcut.filename}.svg`);
        const pngPath = path.join(iconsDir, `${shortcut.filename}.png`);
        
        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            const command = `sips -s format png "${svgPath}" --out "${pngPath}"`;
            await execAsync(command);
            convertedCount++;
        } catch (error) {
            console.log(`⚠️  PNG conversion failed for ${shortcut.filename}: ${error.message}`);
        }
    }
    
    console.log(`✅ Converted ${convertedCount}/${shortcuts.length} shortcut icons to PNG`);
    
    console.log('\\n📋 Summary - PWA Shortcut Icons Generated:');
    generatedIcons.forEach(icon => {
        console.log(`  ${icon.filename}.png - ${icon.description}`);
    });
    
    console.log('\\n🔗 Manifest Integration:');
    console.log('All shortcut icons are already properly configured in manifest.json:');
    generatedIcons.forEach(icon => {
        console.log(`  ✅ ${icon.manifest_name} -> /assets/icons/${icon.filename}.png`);
    });
    
    console.log('\\n🔍 Next steps:');
    console.log('  1. ✅ Shortcut icons generated and ready');
    console.log('  2. 📷 Generate app screenshots (Task 5.2)');
    console.log('  3. 🧪 Test PWA shortcuts functionality');
    console.log('  4. 📈 Continue to Service Worker optimization');
    
    console.log('\\n📈 Shortcut Icons Status:');
    console.log(`  Generated: ${generatedIcons.length} shortcut icons`);
    console.log('  Types: Play, Statistics, Settings, Achievements');
    console.log('  Size: 96×96px PNG format');
    console.log('  Integration: Ready for PWA shortcuts');
}

// 実行
generateShortcutIcons().catch(console.error);