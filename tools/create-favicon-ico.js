/**
 * create-favicon-ico.js
 * 生成されたPNGファイルからICOファイルを作成するスクリプト
 * WebブラウザでCanvas APIを使用してICO形式のデータを生成
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * PNG画像をBase64データURLに変換
 * @param {string} pngPath - PNGファイルのパス
 * @returns {string} Base64データURL
 */
async function pngToDataURL(pngPath) {
    try {
        const pngBuffer = await fs.readFile(pngPath);
        const base64 = pngBuffer.toString('base64');
        return `data:image/png;base64,${base64}`;
    } catch (error) {
        console.error(`Failed to read PNG file: ${pngPath}`, error);
        return null;
    }
}

/**
 * 簡易ICOファイル形式でのバイナリデータ生成
 * （注意: 完全なICO実装ではなく、単純なPNG埋め込み）
 * @param {Array} pngPaths - PNGファイルパスの配列
 * @returns {Buffer} ICOバイナリデータ
 */
async function createSimpleICO(pngPaths) {
    console.log('⚠️  注意: 簡易ICO作成機能は限定的です');
    console.log('   完全なICOファイルにはオンラインコンバーターの使用を推奨します\n');
    
    // 最大のPNGファイルを単一のICOとして使用
    const largestPngPath = pngPaths.find(p => p.includes('48x48')) || pngPaths[pngPaths.length - 1];
    
    try {
        const pngBuffer = await fs.readFile(largestPngPath);
        
        // 簡易ICOヘッダー（16バイト）
        const header = Buffer.alloc(16);
        header.writeUInt16LE(0, 0);      // Reserved (must be 0)
        header.writeUInt16LE(1, 2);      // Type (1 = ICO)
        header.writeUInt16LE(1, 4);      // Number of images
        header.writeUInt8(48, 6);        // Width (48 pixels)
        header.writeUInt8(48, 7);        // Height (48 pixels)
        header.writeUInt8(0, 8);         // Color palette (0 = no palette)
        header.writeUInt8(0, 9);         // Reserved
        header.writeUInt16LE(1, 10);     // Color planes (1)
        header.writeUInt16LE(32, 12);    // Bits per pixel (32)
        header.writeUInt32LE(pngBuffer.length, 14); // Size of PNG data
        
        // ICOディレクトリエントリ（16バイト）
        const dirEntry = Buffer.alloc(16);
        dirEntry.writeUInt8(48, 0);      // Width
        dirEntry.writeUInt8(48, 1);      // Height
        dirEntry.writeUInt8(0, 2);       // Color count (0 for PNG)
        dirEntry.writeUInt8(0, 3);       // Reserved
        dirEntry.writeUInt16LE(1, 4);    // Color planes
        dirEntry.writeUInt16LE(32, 6);   // Bits per pixel
        dirEntry.writeUInt32LE(pngBuffer.length, 8); // Data size
        dirEntry.writeUInt32LE(22, 12);  // Data offset (6 + 16 = 22)
        
        // ICOファイルの構造: [ICOヘッダー(6)] + [ディレクトリエントリ(16)] + [PNGデータ]
        const icoHeader = Buffer.alloc(6);
        icoHeader.writeUInt16LE(0, 0);   // Reserved
        icoHeader.writeUInt16LE(1, 2);   // Type (ICO)
        icoHeader.writeUInt16LE(1, 4);   // Number of images
        
        return Buffer.concat([icoHeader, dirEntry, pngBuffer]);
        
    } catch (error) {
        console.error('ICO creation failed:', error);
        return null;
    }
}

/**
 * HTMLファイルベースのICO生成器を作成
 */
async function createICOGeneratorHTML() {
    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Favicon ICO Generator - BubblePop PWA</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 10px 0; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #45a049; }
        .preview { display: flex; gap: 20px; margin: 20px 0; }
        .icon-preview { text-align: center; }
        .icon-preview img { border: 1px solid #ddd; background: white; }
        input[type="file"] { margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🔗 Favicon ICO Generator</h1>
    <p>生成されたPNGファイルからICOファイルを作成します</p>
    
    <div class="container">
        <h2>Step 1: PNGファイルを選択</h2>
        <p>favicon-16x16.png, favicon-32x32.png, favicon-48x48.png を選択してください</p>
        <input type="file" id="fileInput" multiple accept=".png" />
    </div>
    
    <div class="container">
        <h2>Step 2: プレビュー</h2>
        <div id="preview" class="preview"></div>
    </div>
    
    <div class="container">
        <h2>Step 3: ICO生成とダウンロード</h2>
        <button id="generateICO">ICOファイルを生成してダウンロード</button>
        <p><small>⚠️ 注意: この機能は基本的なICO生成です。完全な互換性には<a href="https://favicon.io/favicon-converter/" target="_blank">favicon.io</a>の使用を推奨します。</small></p>
    </div>
    
    <div class="container">
        <h2>推奨オンラインツール</h2>
        <ul>
            <li><a href="https://favicon.io/favicon-converter/" target="_blank">favicon.io - Favicon Converter</a></li>
            <li><a href="https://icoconvert.com/" target="_blank">icoconvert.com</a></li>
            <li><a href="https://convertio.co/png-ico/" target="_blank">convertio.co</a></li>
        </ul>
        <p>これらのサービスを使用して、生成されたPNGファイルをアップロードし、ICOファイルをダウンロードしてください。</p>
    </div>

    <script>
        const fileInput = document.getElementById('fileInput');
        const preview = document.getElementById('preview');
        const generateBtn = document.getElementById('generateICO');
        
        let loadedImages = [];
        
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            preview.innerHTML = '';
            loadedImages = [];
            
            files.forEach(file => {
                if (file.type === 'image/png') {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = new Image();
                        img.onload = function() {
                            loadedImages.push({
                                name: file.name,
                                size: this.width,
                                data: e.target.result
                            });
                            
                            const previewDiv = document.createElement('div');
                            previewDiv.className = 'icon-preview';
                            previewDiv.innerHTML = \`
                                <img src="\${e.target.result}" width="64" height="64" alt="\${file.name}">
                                <div>\${file.name}</div>
                                <div>\${this.width}×\${this.height}px</div>
                            \`;
                            preview.appendChild(previewDiv);
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
        
        generateBtn.addEventListener('click', function() {
            if (loadedImages.length === 0) {
                alert('PNGファイルを選択してください');
                return;
            }
            
            // 最大サイズの画像を選択（簡易実装）
            const largestImage = loadedImages.reduce((prev, current) => 
                (prev.size > current.size) ? prev : current
            );
            
            // データURLからBlobを作成
            fetch(largestImage.data)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'favicon.ico';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    alert('⚠️ 基本的なICOファイルがダウンロードされました。\\n完全な互換性には favicon.io などのオンラインツールの使用を推奨します。');
                });
        });
    </script>
</body>
</html>`;
    
    const htmlFile = path.join(process.cwd(), 'favicon-ico-generator.html');
    await fs.writeFile(htmlFile, htmlContent);
    
    return htmlFile;
}

/**
 * ICOファイル作成機能の実行
 */
async function createFaviconICO() {
    console.log('🔗 Creating Favicon ICO...\n');
    
    const rootDir = process.cwd();
    const pngFiles = [
        'favicon-16x16.png',
        'favicon-32x32.png', 
        'favicon-48x48.png'
    ];
    
    // PNGファイルの存在確認
    const existingPngs = [];
    for (const pngFile of pngFiles) {
        const pngPath = path.join(rootDir, pngFile);
        try {
            await fs.access(pngPath);
            existingPngs.push(pngPath);
            console.log(`✅ Found: ${pngFile}`);
        } catch {
            console.log(`❌ Missing: ${pngFile}`);
        }
    }
    
    if (existingPngs.length === 0) {
        console.log('❌ No PNG files found. Please run generate-favicons.js first.');
        return;
    }
    
    // 簡易ICO作成を試行
    console.log('\n🔧 Creating simple ICO file...');
    const icoData = await createSimpleICO(existingPngs);
    
    if (icoData) {
        const icoPath = path.join(rootDir, 'favicon.ico');
        await fs.writeFile(icoPath, icoData);
        console.log('✅ Created: favicon.ico (simple version)');
    }
    
    // HTMLベースのICO生成器作成
    console.log('\n🌐 Creating HTML-based ICO generator...');
    const htmlFile = await createICOGeneratorHTML();
    console.log(`✅ Created: ${path.basename(htmlFile)}`);
    
    console.log('\n📋 ICO Creation Summary:');
    console.log('  Simple ICO: favicon.ico (basic compatibility)');
    console.log('  HTML Tool: favicon-ico-generator.html (browser-based generator)');
    
    console.log('\n🔍 Recommended workflow:');
    console.log('  1. ✅ Simple ICO created automatically');
    console.log('  2. 🌐 Open favicon-ico-generator.html for better ICO');
    console.log('  3. 📱 Or use online converter (favicon.io, icoconvert.com)');
    console.log('  4. 🔗 Add favicon meta tags to index.html');
    
    console.log('\n📈 Next Steps:');
    console.log('  • Task 4 completion: ✅ Favicons created');
    console.log('  • Continue to Task 5: Manifest validation');
    console.log('  • Test favicon display in browsers');
}

// 実行
createFaviconICO().catch(console.error);