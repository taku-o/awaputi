import { GameEngine } from './core/GameEngine.js';

/**
 * ゲーム初期化
 */
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const gameEngine = new GameEngine(canvas);
    
    // ゲーム開始
    gameEngine.start();
    
    // デバッグ用：グローバルに公開
    window.gameEngine = gameEngine;
}

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}