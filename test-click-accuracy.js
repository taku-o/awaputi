import { chromium } from 'playwright';

async function testClickAccuracy() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('Testing click accuracy for input form...');
        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // プレイヤーデータをクリアしてユーザー名入力を表示
        await page.evaluate(() => {
            localStorage.removeItem('bubblePop_playerData');
            location.reload();
        });
        await page.waitForTimeout(2000);
        
        // Canvas情報を取得
        const testInfo = await page.evaluate(() => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            
            // ベース座標系での理論位置
            const baseWidth = 800;
            const buttonWidth = 100;
            const buttonY = 360;
            const okButtonX = baseWidth / 2 - buttonWidth - 10; // 340
            const cancelButtonX = baseWidth / 2 + 10; // 410
            
            return {
                canvasRect: rect,
                baseWidth: baseWidth,
                actualWidth: canvas.width,
                actualHeight: canvas.height,
                okButtonX: okButtonX,
                cancelButtonX: cancelButtonX,
                buttonY: buttonY,
                scaleX: rect.width / canvas.width,
                scaleY: rect.height / canvas.height
            };
        });
        
        console.log('Test info:', testInfo);
        
        // 理論上のOKボタン中央位置を画面座標に変換
        const okButtonCenterX = (testInfo.okButtonX + 50) * testInfo.scaleX + testInfo.canvasRect.left;
        const okButtonCenterY = (testInfo.buttonY + 20) * testInfo.scaleY + testInfo.canvasRect.top;
        
        console.log(`Clicking OK button at screen coordinates: (${okButtonCenterX}, ${okButtonCenterY})`);
        
        // スクリーンショット（クリック前）
        await page.screenshot({ 
            path: 'test-click-before.png',
            fullPage: true 
        });
        
        // 何か文字を入力
        await page.type('#gameCanvas', 'test', { delay: 100 });
        await page.waitForTimeout(500);
        
        // OKボタンをクリック
        await page.mouse.click(okButtonCenterX, okButtonCenterY);
        await page.waitForTimeout(1500);
        
        // スクリーンショット（クリック後）
        await page.screenshot({ 
            path: 'test-click-after.png',
            fullPage: true 
        });
        
        // ユーザー名が設定されたかチェック
        const usernameSet = await page.evaluate(() => {
            const playerData = JSON.parse(localStorage.getItem('bubblePop_playerData') || '{}');
            return playerData.username;
        });
        
        if (usernameSet) {
            console.log(`✅ SUCCESS: Username "${usernameSet}" was set successfully!`);
            console.log('✅ Click detection is working correctly!');
        } else {
            console.log('❌ FAILED: Username was not set. Click detection may be incorrect.');
        }
        
        // 異なるウィンドウサイズでもテスト
        console.log('Testing with different window sizes...');
        
        // データをクリア
        await page.evaluate(() => {
            localStorage.removeItem('bubblePop_playerData');
            location.reload();
        });
        await page.waitForTimeout(2000);
        
        // ウィンドウサイズ変更
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.waitForTimeout(1000);
        
        // 新しいサイズでの座標計算
        const testInfo2 = await page.evaluate(() => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            
            const baseWidth = 800;
            const buttonWidth = 100;
            const buttonY = 360;
            const okButtonX = baseWidth / 2 - buttonWidth - 10;
            
            return {
                canvasRect: rect,
                okButtonX: okButtonX,
                buttonY: buttonY,
                scaleX: rect.width / canvas.width,
                scaleY: rect.height / canvas.height
            };
        });
        
        const okButtonCenterX2 = (testInfo2.okButtonX + 50) * testInfo2.scaleX + testInfo2.canvasRect.left;
        const okButtonCenterY2 = (testInfo2.buttonY + 20) * testInfo2.scaleY + testInfo2.canvasRect.top;
        
        console.log(`Clicking OK button (1024x768) at: (${okButtonCenterX2}, ${okButtonCenterY2})`);
        
        // 文字入力とクリック
        await page.type('#gameCanvas', 'responsive', { delay: 100 });
        await page.waitForTimeout(500);
        await page.mouse.click(okButtonCenterX2, okButtonCenterY2);
        await page.waitForTimeout(1500);
        
        // 結果確認
        const usernameSet2 = await page.evaluate(() => {
            const playerData = JSON.parse(localStorage.getItem('bubblePop_playerData') || '{}');
            return playerData.username;
        });
        
        if (usernameSet2) {
            console.log(`✅ SUCCESS (1024x768): Username "${usernameSet2}" was set successfully!`);
            console.log('✅ Responsive click detection is working correctly!');
        } else {
            console.log('❌ FAILED (1024x768): Click detection failed at different window size.');
        }
        
        await page.screenshot({ 
            path: 'test-click-responsive.png',
            fullPage: true 
        });
        
        console.log('Click accuracy test completed!');
        
    } catch (error) {
        console.error('Test failed:', error);
        await page.screenshot({ 
            path: 'test-click-error.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

testClickAccuracy();