/**
 * ユーザー情報画面シーン
 */
import { Scene } from '../core/Scene.js';

export class UserInfoScene extends Scene {
    constructor(gameEngine) {
        super(gameEngine);
    }

    enter() {
        console.log('User info scene entered');
    }

    exit() {
        console.log('User info scene exited');
    }

    update(deltaTime) {
        // Update logic here
    }

    render(context) {
        const canvas = this.gameEngine.canvas;
        
        // Clear background
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Title
        context.fillStyle = '#ffffff';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText('ユーザー情報', canvas.width / 2, 80);
        
        // Placeholder content
        context.font = '20px Arial';
        context.fillText('ユーザー情報画面（実装予定）', canvas.width / 2, 200);
        
        // Back button
        context.fillStyle = '#4a90e2';
        context.fillRect(50, canvas.height - 100, 120, 50);
        context.fillStyle = '#ffffff';
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText('戻る', 110, canvas.height - 70);
    }

    handleInput(event) {
        if (event.type === 'click') {
            const canvas = this.gameEngine.canvas;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Back button
            if (x >= 50 && x <= 170 && y >= canvas.height - 100 && y <= canvas.height - 50) {
                this.sceneManager.switchScene('menu');
            }
        }
    }
}