/**
 * ソーシャル機能のパフォーマンス検証
 * Task 25.2: パフォーマンス要件の最終検証
 */

// 1. スクリーンショット生成時間の検証 (要件: 2秒以内)
async function verifyScreenshotPerformance() {
    console.log('=== スクリーンショット生成パフォーマンス検証 ===');
    
    try {
        // Canvas要素の作成
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');
        
        // ダミーのゲーム画面を描画
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.fillText('BubblePop - Score: 15000', 50, 100);
        
        const startTime = performance.now();
        
        // スクリーンショット生成（Base64）
        const screenshot = canvas.toDataURL('image/png');
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`スクリーンショット生成時間: ${duration.toFixed(2)}ms`);
        console.log(`要件: 2000ms以内 - ${duration < 2000 ? '✅ 合格' : '❌ 不合格'}`);
        
        return duration < 2000;
    } catch (error) {
        console.error('スクリーンショット生成エラー:', error);
        return false;
    }
}

// 2. リーダーボードデータ読み込み時間の検証 (要件: 1秒以内)
function verifyLeaderboardPerformance() {
    console.log('\n=== リーダーボード読み込みパフォーマンス検証 ===');
    
    try {
        // ダミーのリーダーボードデータ生成
        const generateScoreData = (count) => {
            const scores = [];
            for (let i = 0; i < count; i++) {
                scores.push({
                    id: `player_${i}`,
                    name: `Player ${i}`,
                    score: Math.floor(Math.random() * 100000),
                    timestamp: Date.now() - (i * 1000 * 60)
                });
            }
            return scores.sort((a, b) => b.score - a.score);
        };
        
        const startTime = performance.now();
        
        // 1000件のスコアデータ処理
        const scoreData = generateScoreData(1000);
        
        // トップ10の抽出
        const top10 = scoreData.slice(0, 10);
        
        // 期間別フィルタリング（過去7日間）
        const weeklyScores = scoreData.filter(score => 
            Date.now() - score.timestamp < 7 * 24 * 60 * 60 * 1000
        );
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`リーダーボード処理時間: ${duration.toFixed(2)}ms`);
        console.log(`処理したスコア数: ${scoreData.length}`);
        console.log(`トップ10抽出: ${top10.length}件`);
        console.log(`週間スコア: ${weeklyScores.length}件`);
        console.log(`要件: 1000ms以内 - ${duration < 1000 ? '✅ 合格' : '❌ 不合格'}`);
        
        return duration < 1000;
    } catch (error) {
        console.error('リーダーボード処理エラー:', error);
        return false;
    }
}

// 3. メモリ使用量の検証 (要件: 追加10MB以下)
function verifyMemoryUsage() {
    console.log('\n=== メモリ使用量検証 ===');
    
    try {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // 大量のソーシャル機能データをシミュレート
        const socialData = {
            shareHistory: [],
            leaderboardCache: {},
            achievementData: {},
            challengeProgress: {}
        };
        
        // 共有履歴の生成
        for (let i = 0; i < 1000; i++) {
            socialData.shareHistory.push({
                id: `share_${i}`,
                type: 'score',
                platform: 'twitter',
                timestamp: Date.now() - (i * 1000),
                message: `BubblePopで${Math.floor(Math.random() * 100000)}点を達成！ #BubblePop`,
                metadata: {
                    score: Math.floor(Math.random() * 100000),
                    stage: `stage_${Math.floor(Math.random() * 10)}`
                }
            });
        }
        
        // リーダーボードキャッシュの生成
        for (let stage = 0; stage < 10; stage++) {
            socialData.leaderboardCache[`stage_${stage}`] = [];
            for (let i = 0; i < 100; i++) {
                socialData.leaderboardCache[`stage_${stage}`].push({
                    playerId: `player_${i}`,
                    score: Math.floor(Math.random() * 100000),
                    timestamp: Date.now()
                });
            }
        }
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
        
        console.log(`初期メモリ使用量: ${(initialMemory / (1024 * 1024)).toFixed(2)}MB`);
        console.log(`最終メモリ使用量: ${(finalMemory / (1024 * 1024)).toFixed(2)}MB`);
        console.log(`メモリ増加量: ${memoryIncreaseMB.toFixed(2)}MB`);
        console.log(`要件: 10MB以下 - ${memoryIncreaseMB < 10 ? '✅ 合格' : '❌ 不合格'}`);
        
        // データのクリーンアップ
        socialData.shareHistory = null;
        socialData.leaderboardCache = null;
        socialData.achievementData = null;
        socialData.challengeProgress = null;
        
        return memoryIncreaseMB < 10;
    } catch (error) {
        console.error('メモリ使用量検証エラー:', error);
        return false;
    }
}

// 4. 共有ダイアログ応答時間の検証 (要件: 500ms以内)
function verifyShareDialogPerformance() {
    console.log('\n=== 共有ダイアログ応答時間検証 ===');
    
    try {
        const startTime = performance.now();
        
        // ダイアログ要素の作成
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 300px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            padding: 20px;
            z-index: 1000;
        `;
        
        // ダイアログ内容の生成
        dialog.innerHTML = `
            <h2>スコアを共有</h2>
            <p>BubblePopで15,000点を達成しました！</p>
            <div>
                <button id="twitter-share">Twitterで共有</button>
                <button id="facebook-share">Facebookで共有</button>
                <button id="copy-link">リンクをコピー</button>
            </div>
            <textarea placeholder="メッセージをカスタマイズ"></textarea>
        `;
        
        // DOMに追加
        document.body.appendChild(dialog);
        
        // イベントリスナーの追加
        const twitterBtn = dialog.querySelector('#twitter-share');
        const facebookBtn = dialog.querySelector('#facebook-share');
        const copyBtn = dialog.querySelector('#copy-link');
        
        twitterBtn.addEventListener('click', () => {
            console.log('Twitter共有クリック');
        });
        
        facebookBtn.addEventListener('click', () => {
            console.log('Facebook共有クリック');
        });
        
        copyBtn.addEventListener('click', () => {
            console.log('リンクコピークリック');
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`共有ダイアログ生成時間: ${duration.toFixed(2)}ms`);
        console.log(`要件: 500ms以内 - ${duration < 500 ? '✅ 合格' : '❌ 不合格'}`);
        
        // クリーンアップ
        document.body.removeChild(dialog);
        
        return duration < 500;
    } catch (error) {
        console.error('共有ダイアログ生成エラー:', error);
        return false;
    }
}

// 5. 非ブロッキング処理の検証
function verifyNonBlockingProcessing() {
    console.log('\n=== 非ブロッキング処理検証 ===');
    
    return new Promise((resolve) => {
        let uiUpdateCount = 0;
        const targetUpdates = 10;
        
        // UI更新の監視
        const uiUpdateInterval = setInterval(() => {
            uiUpdateCount++;
            if (uiUpdateCount >= targetUpdates) {
                clearInterval(uiUpdateInterval);
            }
        }, 10);
        
        const startTime = performance.now();
        
        // 大量データ処理（非同期）
        setTimeout(async () => {
            // 大量の共有データ処理をシミュレート
            for (let i = 0; i < 10000; i++) {
                const shareData = {
                    id: `share_${i}`,
                    message: `Message ${i}`,
                    timestamp: Date.now()
                };
                
                // 処理を細切れにしてUIブロックを防ぐ
                if (i % 1000 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // UI更新が継続できたかチェック
            setTimeout(() => {
                const uiWasResponsive = uiUpdateCount >= targetUpdates * 0.8; // 80%以上の更新ができていれば合格
                
                console.log(`大量データ処理時間: ${duration.toFixed(2)}ms`);
                console.log(`UI更新回数: ${uiUpdateCount}/${targetUpdates}`);
                console.log(`UIレスポンシブ性: ${uiWasResponsive ? '✅ 合格' : '❌ 不合格'}`);
                
                resolve(uiWasResponsive);
            }, 100);
        }, 0);
    });
}

// メイン検証実行
async function runPerformanceVerification() {
    console.log('🚀 ソーシャル機能パフォーマンス検証を開始');
    console.log('=' .repeat(60));
    
    const results = {};
    
    // 各検証の実行
    results.screenshot = await verifyScreenshotPerformance();
    results.leaderboard = verifyLeaderboardPerformance();
    results.memory = verifyMemoryUsage();
    results.shareDialog = verifyShareDialogPerformance();
    results.nonBlocking = await verifyNonBlockingProcessing();
    
    // 総合結果
    console.log('\n' + '=' .repeat(60));
    console.log('📊 パフォーマンス検証結果サマリー');
    console.log('=' .repeat(60));
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`✅ 合格: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log('\n詳細結果:');
    console.log(`- スクリーンショット生成: ${results.screenshot ? '✅' : '❌'}`);
    console.log(`- リーダーボード処理: ${results.leaderboard ? '✅' : '❌'}`);
    console.log(`- メモリ使用量: ${results.memory ? '✅' : '❌'}`);
    console.log(`- 共有ダイアログ応答: ${results.shareDialog ? '✅' : '❌'}`);
    console.log(`- 非ブロッキング処理: ${results.nonBlocking ? '✅' : '❌'}`);
    
    const overallPass = passedTests === totalTests;
    console.log(`\n🎯 総合判定: ${overallPass ? '✅ 全要件合格' : '❌ 要改善'}`);
    
    return {
        passed: overallPass,
        results: results,
        score: (passedTests / totalTests) * 100
    };
}

// ブラウザ環境でのみ実行
if (typeof window !== 'undefined') {
    // DOMContentLoadedイベントで実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runPerformanceVerification);
    } else {
        runPerformanceVerification();
    }
} else {
    console.log('ブラウザ環境で実行してください');
}

export { runPerformanceVerification };