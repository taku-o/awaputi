/**
 * 泡設定移行スクリプト
 * 
 * ハードコードされた泡設定をConfigurationManagerに移行します
 */

import { migrateBubbleConfigurations, getConfigurationMigrationUtility } from '../src/utils/ConfigurationMigrationUtility.js';

async function main() {
    try {
        console.log('🔄 泡設定の移行を開始します...\n');
        
        // 移行実行
        const migrationResult = await migrateBubbleConfigurations();
        
        // 結果の表示
        console.log('📊 移行結果:');
        console.log(`- 移行ID: ${migrationResult.migrationId}`);
        console.log(`- 成功: ${migrationResult.success ? '✅' : '❌'}`);
        console.log(`- 移行されたタイプ数: ${migrationResult.totalMigrated}`);
        console.log(`- 実行時間: ${migrationResult.duration}ms`);
        
        if (migrationResult.migratedTypes && migrationResult.migratedTypes.length > 0) {
            console.log(`- 移行されたタイプ: ${migrationResult.migratedTypes.join(', ')}`);
        }
        
        if (migrationResult.errors && migrationResult.errors.length > 0) {
            console.log(`\n⚠️  エラー (${migrationResult.errors.length}件):`);
            migrationResult.errors.forEach(error => {
                console.log(`  - ${error.bubbleType}: ${error.error}`);
            });
        }
        
        // 検証実行
        console.log('\n🔍 移行結果の検証を実行します...');
        const utility = getConfigurationMigrationUtility();
        const validationResult = await utility.validateMigration();
        
        console.log('\n📋 検証結果:');
        console.log(`- 検証成功: ${validationResult.validated.length}タイプ`);
        console.log(`- 設定不足: ${validationResult.missing.length}タイプ`);
        
        if (validationResult.validated.length > 0) {
            console.log(`- 検証成功タイプ: ${validationResult.validated.join(', ')}`);
        }
        
        if (validationResult.missing.length > 0) {
            console.log(`\n❌ 設定不足タイプ:`);
            validationResult.missing.forEach(missing => {
                const missingProps = Object.entries(missing.missingProperties)
                    .filter(([, isMissing]) => isMissing)
                    .map(([prop]) => prop);
                console.log(`  - ${missing.bubbleType}: ${missingProps.join(', ')}`);
            });
        }
        
        // 統計情報
        console.log('\n📈 移行統計:');
        const stats = utility.getMigrationStats();
        console.log(`- 総移行回数: ${stats.totalMigrations}`);
        console.log(`- 成功率: ${stats.successRate}`);
        console.log(`- 総移行タイプ数: ${stats.totalMigratedTypes}`);
        
        // 完了メッセージ
        if (migrationResult.success && validationResult.missing.length === 0) {
            console.log('\n✅ 移行が正常に完了しました！');
        } else {
            console.log('\n⚠️  移行は完了しましたが、問題があります。上記のエラーを確認してください。');
        }
        
    } catch (error) {
        console.error('❌ 移行中にエラーが発生しました:', error);
        process.exit(1);
    }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { main };