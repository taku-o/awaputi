/**
 * ブラウザ互換性とゲーム起動の基本テスト
 */

const test = {
    async run() {
        console.log('🧪 ブラウザ互換性テスト開始...');
        
        try {
            // Canvas APIテスト
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas 2D context not available');
            }
            console.log('✅ Canvas API サポート確認');
            
            // ES6モジュールテスト
            const moduleTest = await import('./src/utils/BrowserCompatibility.js');
            if (!moduleTest) {
                throw new Error('ES6 modules not supported');
            }
            console.log('✅ ES6 モジュール サポート確認');
            
            // ゲームエンジン初期化テスト
            const canvasElement = document.getElementById('gameCanvas');
            if (canvasElement) {
                console.log('✅ ゲーム用Canvas要素存在確認');
                
                // 基本的なCanvas操作テスト
                const gameCtx = canvasElement.getContext('2d');
                gameCtx.fillStyle = '#00FF00';
                gameCtx.fillRect(0, 0, 50, 50);
                console.log('✅ Canvas描画テスト成功');
            }
            
            console.log('🎉 全ての基本テストが成功しました');
            return true;
            
        } catch (error) {
            console.error('❌ テスト失敗:', error);
            return false;
        }
    }
};

// ページ読み込み後に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => test.run());
} else {
    test.run();
}