import { chromium } from 'playwright';

async function testInputFormPosition() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('Navigating to the game...');
        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
        
        // ゲームが完全に読み込まれるまで待機
        await page.waitForTimeout(3000);
        
        // Canvas要素を取得
        const canvas = await page.locator('#gameCanvas');
        await canvas.waitFor();
        
        // Canvas の情報を取得
        const canvasBox = await canvas.boundingBox();
        console.log('Canvas bounding box:', canvasBox);
        
        // ページ全体のスクリーンショットを撮影
        await page.screenshot({ 
            path: 'test-input-form-full.png',
            fullPage: true 
        });
        console.log('Full page screenshot saved as test-input-form-full.png');
        
        // Canvas領域のスクリーンショットを撮影
        await canvas.screenshot({ 
            path: 'test-input-form-canvas.png'
        });
        console.log('Canvas screenshot saved as test-input-form-canvas.png');
        
        // ユーザー名入力フォームが表示されるまで待機
        // まず、既存のユーザー名データをクリア
        await page.evaluate(() => {
            localStorage.removeItem('bubblePop_playerData');
            location.reload();
        });
        
        await page.waitForTimeout(2000);
        
        // 再度スクリーンショットを撮影（ユーザー名入力表示）
        await page.screenshot({ 
            path: 'test-input-form-with-username.png',
            fullPage: true 
        });
        console.log('Username input form screenshot saved as test-input-form-with-username.png');
        
        // Canvas内の要素を分析するためにJavaScriptを実行
        const canvasInfo = await page.evaluate(() => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            
            return {
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                displayWidth: rect.width,
                displayHeight: rect.height,
                offsetLeft: rect.left,
                offsetTop: rect.top,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            };
        });
        
        console.log('Canvas information:', canvasInfo);
        
        // 入力フォーム要素の理論上の位置を計算
        const inputFormInfo = {
            theoreticalInputX: (canvasInfo.canvasWidth - 400) / 2, // inputWidth = 400
            theoreticalInputY: 280,
            theoreticalButtonY: 360,
            theoreticalOKButtonX: canvasInfo.canvasWidth / 2 - 100 - 10, // buttonWidth = 100
            theoreticalCancelButtonX: canvasInfo.canvasWidth / 2 + 10
        };
        
        console.log('Theoretical input form positions:', inputFormInfo);
        
        // クリック位置の変換をテスト
        const testClickPositions = await page.evaluate(({ canvasInfo, inputFormInfo }) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            
            // 理論上のCanvas座標を画面座標に変換
            const scaleX = rect.width / canvas.width;
            const scaleY = rect.height / canvas.height;
            
            return {
                okButtonScreenX: (inputFormInfo.theoreticalOKButtonX + 50) * scaleX + rect.left, // ボタン中央
                okButtonScreenY: (inputFormInfo.theoreticalButtonY + 20) * scaleY + rect.top,   // ボタン中央
                cancelButtonScreenX: (inputFormInfo.theoreticalCancelButtonX + 50) * scaleX + rect.left,
                cancelButtonScreenY: (inputFormInfo.theoreticalButtonY + 20) * scaleY + rect.top,
                scaleX: scaleX,
                scaleY: scaleY
            };
        }, { canvasInfo, inputFormInfo });
        
        console.log('Test click positions:', testClickPositions);
        
        // OKボタンをクリックしてみる（空の入力でも反応を確認）
        console.log('Clicking OK button...');
        await page.mouse.click(testClickPositions.okButtonScreenX, testClickPositions.okButtonScreenY);
        await page.waitForTimeout(1000);
        
        // クリック後のスクリーンショット
        await page.screenshot({ 
            path: 'test-input-form-after-click.png',
            fullPage: true 
        });
        console.log('After click screenshot saved as test-input-form-after-click.png');
        
        // ブラウザのウィンドウサイズを変更してレスポンシブ動作をテスト
        console.log('Testing responsive behavior...');
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'test-input-form-responsive-1200.png',
            fullPage: true 
        });
        console.log('Responsive (1200x800) screenshot saved as test-input-form-responsive-1200.png');
        
        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'test-input-form-responsive-800.png',
            fullPage: true 
        });
        console.log('Responsive (800x600) screenshot saved as test-input-form-responsive-800.png');
        
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error);
        await page.screenshot({ 
            path: 'test-input-form-error.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

testInputFormPosition();