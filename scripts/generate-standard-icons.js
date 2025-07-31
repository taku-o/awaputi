/**
 * generate-standard-icons.js
 * 
 * 標準PWAアイコン（192x192px, 512x512px）を生成するNode.jsスクリプト
 * Canvas APIのサーバーサイド実装を使用
 */

import { createCanvas } from 'canvas';
import fs from 'fs/promises';
import path from 'path';

/**
 * バブルアイコンを描画
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - アイコンサイズ
 * @param {boolean} maskable - マスカブルアイコンか
 */
function drawBubbleIcon(ctx, size, maskable = false) {
    // 背景をクリア
    ctx.clearRect(0, 0, size, size);
    
    // マスカブルアイコンの場合、安全領域を考慮（80%のサイズに）
    const safeArea = maskable ? 0.8 : 1.0;
    const bubbleSize = size * safeArea;
    const offset = (size - bubbleSize) / 2;
    
    // グラデーション背景（BubblePopのテーマカラー）
    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, bubbleSize / 2
    );
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.7, '#2E7D32');
    gradient.addColorStop(1, '#1B5E20');
    
    // メインの泡を描画
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, bubbleSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // ハイライト効果
    const highlightGradient = ctx.createRadialGradient(
        size / 2 - bubbleSize / 6, size / 2 - bubbleSize / 6, 0,
        size / 2 - bubbleSize / 6, size / 2 - bubbleSize / 6, bubbleSize / 4
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(size / 2 - bubbleSize / 6, size / 2 - bubbleSize / 6, bubbleSize / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 小さな装飾泡（サイズが十分大きい場合のみ）
    if (size >= 128) {
        drawDecorativeBubbles(ctx, size, bubbleSize, offset);
    }
    
    // ゲーム名テキスト（大きなアイコンの場合のみ）
    if (size >= 192) {
        drawGameTitle(ctx, size);
    }
}

/**
 * 装飾用の小さな泡を描画
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - アイコンサイズ
 * @param {number} bubbleSize - メインバブルサイズ
 * @param {number} offset - オフセット
 */
function drawDecorativeBubbles(ctx, size, bubbleSize, offset) {
    const decorBubbles = [
        { x: 0.7, y: 0.3, size: 0.12, alpha: 0.6 },
        { x: 0.8, y: 0.7, size: 0.08, alpha: 0.5 },
        { x: 0.3, y: 0.8, size: 0.1, alpha: 0.4 }
    ];
    
    decorBubbles.forEach(bubble => {
        const x = size * bubble.x;
        const y = size * bubble.y;
        const r = bubbleSize * bubble.size;
        
        // バブルが境界内にある場合のみ描画
        if (x - r > offset && x + r < size - offset && 
            y - r > offset && y + r < size - offset) {
            
            ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            
            // 小さなハイライト
            ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(x - r/3, y - r/3, r/3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

/**
 * ゲームタイトルを描画
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - アイコンサイズ
 */
function drawGameTitle(ctx, size) {
    const fontSize = Math.max(size * 0.08, 12);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // テキストに影を追加
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText('BubblePop', size / 2, size * 0.85);
    
    // 影をリセット
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

/**
 * アイコンを生成してファイルに保存
 * @param {number} size - アイコンサイズ
 * @param {string} filename - 保存ファイル名
 * @param {boolean} maskable - マスカブルアイコンか
 */
async function generateIcon(size, filename, maskable = false) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    drawBubbleIcon(ctx, size, maskable);
    
    // PNGバッファとして出力
    const buffer = canvas.toBuffer('image/png');
    
    // ファイルに保存
    const outputPath = path.join(process.cwd(), 'assets', 'icons', filename);
    await fs.writeFile(outputPath, buffer);
    
    console.log(`✅ Generated: ${filename} (${size}x${size}px)`);
}

/**
 * メイン実行関数
 */
async function main() {
    try {
        console.log('🎨 Generating standard PWA icons...\n');
        
        // assetsディレクトリが存在することを確認
        try {
            await fs.access(path.join(process.cwd(), 'assets', 'icons'));
        } catch {
            console.log('📁 Creating assets/icons directory...');
            await fs.mkdir(path.join(process.cwd(), 'assets', 'icons'), { recursive: true });
        }
        
        // 標準PWAアイコン生成
        console.log('🔧 Generating standard PWA icons...');
        await generateIcon(192, 'icon-192x192.png', false);
        await generateIcon(512, 'icon-512x512.png', false);
        
        console.log('\n✨ Standard PWA icons generated successfully!');
        console.log('\n📋 Generated files:');
        console.log('  - assets/icons/icon-192x192.png (PWA installation icon)');
        console.log('  - assets/icons/icon-512x512.png (PWA splash screen icon)');
        
        console.log('\n🔍 Next steps:');
        console.log('  1. Check the generated icons in assets/icons/');
        console.log('  2. Verify manifest.json references are correct');
        console.log('  3. Test PWA installation functionality');
        
    } catch (error) {
        console.error('❌ Error generating icons:', error);
        process.exit(1);
    }
}

// Node.js環境でのみ実行
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'browser') {
    main();
}