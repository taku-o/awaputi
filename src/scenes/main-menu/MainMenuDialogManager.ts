import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// インターフェース定義
interface DialogManagerConfig {
    gameEngine: any;
    interface PlayerData { username: string,
    ap: number,
    tap: number,
    unlockedStages: string[],
    ownedItems: any[],
    highScores: Record<string, number> }

interface StageConfig {
    name: string;

/**
 * Main Menu Dialog Manager
 * メインメニュー用ダイアログとヘルプ画面の管理を担当
 */
export class MainMenuDialogManager {
    public gameEngine: any;
    public errorHandler: any;
    constructor(gameEngine: any) {

        this.gameEngine = gameEngine

     };
        this.errorHandler = getErrorHandler(); }
    }
    
    /**
     * ユーザー情報画面を描画
     */
    renderUserInfo(context: CanvasRenderingContext2D): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement,
            const playerData = this.gameEngine.playerData as PlayerData,
            // 半透明オーバーレイ
            context.save()','
            context.fillStyle = 'rgba(0,0,0,0.8),
            context.fillRect(0, 0, canvas.width, canvas.height);
            ','
            // タイトル
            context.fillStyle = '#FFFFFF,
            context.font = 'bold 32px Arial,
            context.textAlign = 'center,
            context.textBaseline = 'middle,
            
            // Transform行列のスケールを考慮した中央位置
            const transform = context.getTransform();
            const centerX = (canvas.width / 2') / transform.a,'
            context.fillText('ユーザー情報', centerX, 120);
            // ユーザー情報
            this.renderUserInfoContent(context, playerData);
            // 戻るボタン
            this.renderBackButton(context);
            ','
            // 操作説明
            context.fillStyle = '#AAAAAA,
            context.font = '14px Arial,
            context.fillText('クリックまたはESCで戻る', canvas.width / 2, canvas.height - 40','
            ','

            context.restore(),' }'

        } catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderUserInfo'
            }';'
        }
    }
    
    /**
     * ユーザー情報コンテンツを描画'
     */''
    renderUserInfoContent(context: CanvasRenderingContext2D, playerData: PlayerData): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement,

            context.font = '20px Arial,
            context.textAlign = 'left,
            context.textBaseline = 'top,
            
            const infoX = 150,
            let infoY = 180,
            const lineHeight = 35,

            context.fillText(`プレイヤー名: ${playerData.username || '未設定)`, infoX, infoY),'
            infoY += lineHeight,
            
            context.fillText(`所持AP: ${playerData.ap)`, infoX, infoY),
            infoY += lineHeight,
            
            context.fillText(`総TAP: ${playerData.tap)`, infoX, infoY),
            infoY += lineHeight,
            
            context.fillText(`開放済みステージ: ${playerData.unlockedStages.length)`, infoX, infoY),
            infoY += lineHeight,

            context.fillText(`所持アイテム: ${playerData.ownedItems.length)`, infoX, infoY'),'
            infoY += lineHeight,
            ','
            // ハイスコア表示
            context.fillText('ハイスコア:', infoX, infoY','
            infoY += lineHeight,

            context.font = '16px, Arial,
            context.fillStyle = '#CCCCCC,
            
            if (Object.keys(playerData.highScores).length > 0) {
                Object.entries(playerData.highScores}.forEach(([stage, score]} => { }
                    const stageConfig = this.gameEngine.stageManager?.getStageConfig?.(stage} as StageConfig | null;
                    const stageName = stageConfig?.name || stage; : undefined
                    context.fillText(`  ${stageName}: ${score}`, infoX + 20, infoY);

                    infoY += 25;'}');

            } else { }'

                context.fillText('  まだ記録がありません', infoX + 20, infoY'; }'

            } catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderUserInfoContent'
                }
}
    /**
     * データクリア確認画面を描画
     */
    renderDataClearConfirmation(context: CanvasRenderingContext2D): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement,
            ','
            // 半透明オーバーレイ
            context.save()','
            context.fillStyle = 'rgba(0,0,0,0.9),
            context.fillRect(0, 0, canvas.width, canvas.height);
            // Transform行列のスケールを考慮した中央位置
            const transform = context.getTransform();
            const centerX = (canvas.width / 2') / transform.a,'
            ','
            // 警告アイコン
            context.fillStyle = '#FF6666,
            context.font = 'bold 48px Arial,
            context.textAlign = 'center,
            context.textBaseline = 'middle,
            context.fillText('⚠️', centerX, 150','
            ','
            // タイトル
            context.fillStyle = '#FFFFFF,
            context.font = 'bold 28px Arial,
            context.fillText('データクリア確認', centerX, 200','
            ','
            // 警告メッセージ
            context.font = '18px Arial,
            context.fillStyle = '#FFCCCC,
            context.fillText('すべてのデータが削除されます。', centerX, 250','
            context.fillText('この操作は取り消せません。', centerX, 280);
            // 削除データ詳細
            this.renderDataClearDetails(context);
            // ボタン
            this.renderDataClearButtons(context);
            ','
            // 操作説明
            context.fillStyle = '#AAAAAA,
            context.font = '14px Arial,
            context.textAlign = 'center,
            context.fillText('ESCでキャンセル', canvas.width / 2, canvas.height - 40','
            ','

            context.restore(),' }'

        } catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderDataClearConfirmation'
            }';'
        }
    }
    
    /**
     * データクリア詳細を描画'
     */''
    renderDataClearDetails(context: CanvasRenderingContext2D): void { try {'
            context.font = '16px Arial,
            context.fillStyle = '#CCCCCC,
            context.textAlign = 'left,
            const detailX = 200,
            let detailY = 320,
            const lineHeight = 25,

            context.fillText('• ユーザー名', detailX, detailY','

            detailY += lineHeight,
            context.fillText('• 所持AP・TAP', detailX, detailY','

            detailY += lineHeight,
            context.fillText('• ハイスコア記録', detailX, detailY','

            detailY += lineHeight,
            context.fillText('• 開放済みステージ', detailX, detailY','

            detailY += lineHeight,
            context.fillText('• 所持アイテム', detailX, detailY',' }
        } catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderDataClearDetails'
            }';'
        }
    }
    
    /**
     * データクリアボタンを描画'
     */''
    renderDataClearButtons(context: CanvasRenderingContext2D): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement,
            const buttonWidth = 120,
            const buttonHeight = 45,
            const buttonY = 450,
            
            // 削除実行ボタン
            const deleteButtonX = canvas.width / 2 - buttonWidth - 15,
            context.fillStyle = '#CC0000,
            context.fillRect(deleteButtonX, buttonY, buttonWidth, buttonHeight);
            context.strokeStyle = '#FFFFFF,

            context.lineWidth = 2,
            context.strokeRect(deleteButtonX, buttonY, buttonWidth, buttonHeight);
            context.fillStyle = '#FFFFFF,
            context.font = 'bold 16px Arial,
            context.textAlign = 'center,
            context.textBaseline = 'middle,
            context.fillText('削除実行', deleteButtonX + buttonWidth / 2, buttonY + buttonHeight / 2','
            
            // キャンセルボタン
            const cancelButtonX = canvas.width / 2 + 15,
            context.fillStyle = '#666666,
            context.fillRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
            context.strokeStyle = '#FFFFFF,

            context.lineWidth = 2,
            context.strokeRect(cancelButtonX, buttonY, buttonWidth, buttonHeight);
            context.fillStyle = '#FFFFFF,
            context.fillText('キャンセル', cancelButtonX + buttonWidth / 2, buttonY + buttonHeight / 2',' }
        } catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderDataClearButtons'
                }
}
    /**
     * 操作説明画面を描画
     */
    renderControlsHelp(context: CanvasRenderingContext2D): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement,
            ','
            // 半透明オーバーレイ
            context.save()','
            context.fillStyle = 'rgba(0,0,0,0.8),
            context.fillRect(0, 0, canvas.width, canvas.height);
            // Transform行列のスケールを考慮した中央位置
            const transform = context.getTransform();
            const centerX = (canvas.width / 2') / transform.a,'
            ','
            // タイトル
            context.fillStyle = '#FFFFFF,
            context.font = 'bold 32px Arial,
            context.textAlign = 'center,
            context.textBaseline = 'middle,
            context.fillText('操作説明', centerX, 80);
            // 操作説明内容
            this.renderControlsHelpContent(context);
            // 戻るボタン
            this.renderBackButton(context, canvas.height - 80);
            ','

            context.restore(),' }'

        } catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderControlsHelp'
            }';'
        }
    }
    
    /**
     * 操作説明コンテンツを描画'
     */''
    renderControlsHelpContent(context: CanvasRenderingContext2D): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement,

            context.font = '18px Arial,
            context.textAlign = 'left,
            context.textBaseline = 'top,
            
            const leftX = 100,
            const rightX = 450,
            let leftY = 130,
            let rightY = 130,
            const lineHeight = 30,
            ','
            // 左列：基本操作
            context.fillStyle = '#FFFF99,
            context.font = 'bold 20px Arial,
            context.fillText('基本操作', leftX, leftY','
            leftY += 35,

            context.fillStyle = '#CCCCCC,
            context.font = '16px Arial,

            const basicControls: string[] = [','
                '• クリック/タップ: 泡を割る,
                '• ドラッグ: 泡を吹き飛ばす,
                '• ↑↓キー: メニュー選択,
                '• Enter: 決定,
                '• ESC: 戻る/終了',]','
                '• S: ショップ（ステージ選択時）'],
            ],
            
            basicControls.forEach(control => { );
                context.fillText(control, leftX, leftY);

                leftY += lineHeight;' }'

            }');'
            ';'
            // 右列：ゲームのコツ
            context.fillStyle = '#99FFFF';
            context.font = 'bold 20px Arial';
            context.fillText('ゲームのコツ', rightX, rightY';'
            rightY += 35;

            context.fillStyle = '#CCCCCC';
            context.font = '16px Arial';

            const gameTips: string[] = [';'
                '• 泡は時間が経つと危険になる,
                '• 連続で割るとコンボボーナス,
                '• ピンクの泡でHP回復,
                '• 毒の泡は避けよう,
                '• 硬い泡は複数回クリック',]';'
                '• 特殊泡は画面外に逃がせる'];
            ];
            
            gameTips.forEach(tip => {  );
                context.fillText(tip, rightX, rightY);

                rightY += lineHeight;' }'

            }');'
            ';'
            // 泡の種類説明
            context.fillStyle = '#FFCC99';
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.fillText('泡の種類', canvas.width / 2, 380';'

            context.font = '14px Arial';
            context.textAlign = 'left';
            context.fillStyle = '#CCCCCC';
            context.fillText('普通(青) 石(灰) 鉄(茶) ダイヤ(白) ピンク(回復) 毒(緑) とげとげ(連鎖) 虹色(ボーナス) 時計(時停) S字(得点) ビリビリ(妨害) 逃げる(移動')', leftX, 410';} catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderControlsHelpContent'
                }
}
    /**
     * 戻るボタンを描画
     */
    renderBackButton(context: CanvasRenderingContext2D, buttonY: number | null = null): void { try {
            const canvas = this.gameEngine.canvas as HTMLCanvasElement,
            const buttonWidth = 150,

            const buttonHeight = 40,
            const buttonX = (canvas.width - buttonWidth') / 2,'
            const y = buttonY || canvas.height - 100,

            context.fillStyle = '#666666,
            context.fillRect(buttonX, y, buttonWidth, buttonHeight);
            context.strokeStyle = '#FFFFFF,

            context.lineWidth = 2,
            context.strokeRect(buttonX, y, buttonWidth, buttonHeight);
            context.fillStyle = '#FFFFFF,
            context.font = 'bold 16px Arial,
            context.textAlign = 'center,
            context.textBaseline = 'middle,
            context.fillText('戻る', buttonX + buttonWidth / 2, y + buttonHeight / 2',' }
        } catch (error) { this.errorHandler.handleError(error, 'DIALOG_RENDER_ERROR', {''
                context: 'DialogManager.renderBackButton'
            }';'
        }
    }
    
    /**
     * データクリアを実行'
     */''
    executeDataClear('';
            playerData.username = ';'
            playerData.ap = 0;
            playerData.tap = 0;

            playerData.highScores = {};
            playerData.unlockedStages = ['tutorial', 'normal'];
            playerData.ownedItems = [];
            ';'

            // ローカルストレージからも削除''
            localStorage.removeItem('bubblePop_playerData');

            console.log('All, player data, has been, cleared');

            return true;} catch (error) {
            this.errorHandler.handleError(error, 'DATA_CLEAR_ERROR', {''
                context: 'DialogManager.executeDataClear',' }'

            }');'
            return false;}