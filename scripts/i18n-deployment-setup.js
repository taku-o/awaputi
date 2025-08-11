#!/usr/bin/env node

/**
 * 多言語対応デプロイメントセットアップスクリプト
 * - 翻訳ファイルの最適化
 * - フォントのプリロード設定
 * - CDN設定の検証
 * - パフォーマンス監視の設定
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import deployConfig from '../deploy.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * 翻訳ファイルの最適化
 */
async function optimizeTranslationFiles() {
  console.log('🌍 翻訳ファイルの最適化を開始...');
  
  const localesDir = path.join(projectRoot, 'src', 'locales');
  const supportedLanguages = deployConfig.internationalization.supportedLanguages;
  
  for (const lang of supportedLanguages) {
    const langDir = path.join(localesDir, lang);
    
    try {
      const files = await fs.readdir(langDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      console.log(`  📁 ${lang}/ - ${jsonFiles.length}個のファイル`);
      
      for (const file of jsonFiles) {
        const filePath = path.join(langDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        try {
          // JSONの妥当性チェック
          const parsed = JSON.parse(content);
          
          // メタデータの更新（optimizedAtを削除）
          const optimized = {
            ...parsed,
            meta: {
              ...parsed.meta,
              // optimizedAt フィールドを削除してidempotentに
              version: parsed.meta?.version || '1.0.0',
              size: Buffer.byteLength(content, 'utf8')
            }
          };
          
          // 既存のoptimizedAtフィールドがある場合は削除
          if (optimized.meta.optimizedAt) {
            delete optimized.meta.optimizedAt;
          }
          
          // 内容が変更された場合のみファイルを書き込み（idempotent処理）
          const newContent = JSON.stringify(optimized);
          if (newContent !== JSON.stringify(parsed)) {
            await fs.writeFile(filePath, newContent, 'utf-8');
            console.log(`    ✅ ${file}: 最適化完了`);
          } else {
            console.log(`    ⏭️  ${file}: 既に最適化済み`);
          }
          
        } catch (error) {
          console.error(`    ❌ ${file}: JSON解析エラー`, error.message);
        }
      }
    } catch (error) {
      console.warn(`  ⚠️  ${lang}/: ディレクトリが見つかりません`);
    }
  }
  
  console.log('✅ 翻訳ファイルの最適化完了\n');
}

/**
 * フォントプリロード設定の生成
 */
async function generateFontPreloadConfig() {
  console.log('🔤 フォントプリロード設定の生成...');
  
  const fontConfig = deployConfig.assets.fonts;
  const preloadLinks = [];
  
  // 各言語のフォント設定を確認
  for (const [lang, fonts] of Object.entries(fontConfig.fallbacks)) {
    console.log(`  📝 ${lang}: ${fonts.join(', ')}`);
  }
  
  // HTMLヘッドに追加するプリロードリンクを生成
  const configContent = `/**
 * フォントプリロード設定（自動生成）
 * 生成日時: ${new Date().toISOString()}
 */

export const fontPreloadConfig = ${JSON.stringify(fontConfig, null, 2)};

export const generatePreloadLinks = (language) => {
  const fonts = fontPreloadConfig.fallbacks[language] || fontPreloadConfig.fallbacks.en;
  return fonts.map(font => \`<link rel="preload" href="/fonts/\${font.replace(' ', '-').toLowerCase()}.woff2" as="font" type="font/woff2" crossorigin>\`);
};

export default fontPreloadConfig;
`;
  
  await fs.writeFile(
    path.join(projectRoot, 'src', 'config', 'FontPreloadConfig.js'),
    configContent
  );
  
  console.log('✅ フォントプリロード設定生成完了\n');
}

/**
 * CDN設定の検証
 */
async function validateCDNConfig() {
  console.log('🌐 CDN設定の検証...');
  
  const cdnConfig = deployConfig.cdn;
  
  if (!cdnConfig.enabled) {
    console.log('  ℹ️  CDNが無効化されています');
    return;
  }
  
  // 地域設定の検証
  console.log('  📍 CDN地域設定:');
  for (const region of cdnConfig.regions) {
    const status = region.primary ? '🟢 プライマリ' : '🔵 セカンダリ';
    console.log(`    ${region.code}: ${region.region} ${status}`);
  }
  
  // キャッシュ設定の検証
  console.log('  💾 キャッシュ設定:');
  console.log(`    翻訳ファイル: ${cdnConfig.caching.translation.ttl}秒`);
  console.log(`    フォント: ${cdnConfig.caching.fonts.ttl}秒`);
  
  // プリロード設定の検証
  console.log('  🚀 プリロード設定:');
  console.log(`    クリティカル: ${cdnConfig.preload.critical.length}個`);
  console.log(`    プリフェッチ: ${cdnConfig.preload.prefetch.length}個`);
  
  console.log('✅ CDN設定検証完了\n');
}

/**
 * パフォーマンス監視設定の生成
 */
async function generatePerformanceMonitoringConfig() {
  console.log('📊 パフォーマンス監視設定の生成...');
  
  const monitoringConfig = {
    enabled: true,
    metrics: {
      languageSwitchTime: {
        threshold: 500, // ms
        track: true
      },
      translationLoadTime: {
        threshold: 200, // ms
        track: true
      },
      fontLoadTime: {
        threshold: 1000, // ms
        track: true
      },
      i18nMemoryUsage: {
        threshold: 5 * 1024 * 1024, // 5MB
        track: true
      }
    },
    alerts: {
      email: process.env.DEPLOY_ALERT_EMAIL,
      webhook: process.env.DEPLOY_ALERT_WEBHOOK
    },
    generatedAt: new Date().toISOString()
  };
  
  const configContent = `/**
 * 多言語対応パフォーマンス監視設定（自動生成）
 * 生成日時: ${new Date().toISOString()}
 */

export const i18nPerformanceConfig = ${JSON.stringify(monitoringConfig, null, 2)};

export default i18nPerformanceConfig;
`;
  
  await fs.writeFile(
    path.join(projectRoot, 'src', 'config', 'I18nPerformanceConfig.js'),
    configContent
  );
  
  console.log('✅ パフォーマンス監視設定生成完了\n');
}

/**
 * デプロイメント前チェック
 */
async function preDeploymentCheck() {
  console.log('🔍 デプロイメント前チェック...');
  
  const checks = [
    {
      name: '翻訳ファイル存在チェック',
      check: async () => {
        const supportedLanguages = deployConfig.internationalization.supportedLanguages;
        const categories = ['common', 'menu', 'game', 'settings', 'errors', 'achievements', 'help'];
        
        for (const lang of supportedLanguages) {
          for (const category of categories) {
            const filePath = path.join(projectRoot, 'src', 'locales', lang, `${category}.json`);
            try {
              await fs.access(filePath);
            } catch {
              throw new Error(`Missing translation file: ${lang}/${category}.json`);
            }
          }
        }
        return true;
      }
    },
    {
      name: '設定ファイル存在チェック',
      check: async () => {
        const configFiles = ['languages.json', 'regions.json', 'formats.json'];
        
        for (const file of configFiles) {
          const filePath = path.join(projectRoot, 'src', 'locales', 'config', file);
          try {
            await fs.access(filePath);
          } catch {
            throw new Error(`Missing config file: config/${file}`);
          }
        }
        return true;
      }
    },
    {
      name: 'デプロイ設定ファイルチェック',
      check: async () => {
        const deployFiles = ['netlify.toml', 'vercel.json', 'deploy.config.js'];
        
        for (const file of deployFiles) {
          const filePath = path.join(projectRoot, file);
          try {
            await fs.access(filePath);
          } catch {
            console.warn(`  ⚠️  Optional deploy file missing: ${file}`);
          }
        }
        return true;
      }
    }
  ];
  
  for (const { name, check } of checks) {
    try {
      await check();
      console.log(`  ✅ ${name}`);
    } catch (error) {
      console.error(`  ❌ ${name}: ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('✅ デプロイメント前チェック完了\n');
}

/**
 * デプロイメントレポートの生成
 */
async function generateDeploymentReport() {
  console.log('📋 デプロイメントレポートの生成...');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    internationalization: {
      supportedLanguages: deployConfig.internationalization.supportedLanguages,
      defaultLanguage: deployConfig.internationalization.defaultLanguage,
      fallbackChain: deployConfig.internationalization.fallbackChain
    },
    cdn: {
      enabled: deployConfig.cdn.enabled,
      regions: deployConfig.cdn.regions.length,
      caching: deployConfig.cdn.caching
    },
    assets: {
      translation: deployConfig.assets.translation,
      fonts: deployConfig.assets.fonts
    },
    optimization: {
      compression: deployConfig.assets.compression,
      preload: deployConfig.cdn.preload || {}
    }
  };
  
  const reportPath = path.join(projectRoot, 'reports', 'i18n-deployment-report.json');
  
  // reportsディレクトリが存在しない場合は作成
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('✅ デプロイメントレポート生成完了');
  console.log(`   📄 レポートファイル: ${reportPath}\n`);
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🚀 多言語対応デプロイメントセットアップ開始\n');
  
  try {
    await optimizeTranslationFiles();
    await generateFontPreloadConfig();
    await validateCDNConfig();
    await generatePerformanceMonitoringConfig();
    await preDeploymentCheck();
    await generateDeploymentReport();
    
    console.log('🎉 多言語対応デプロイメントセットアップ完了！');
    console.log('   次のステップ: npm run build または npm run deploy');
    
  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  optimizeTranslationFiles,
  generateFontPreloadConfig,
  validateCDNConfig,
  generatePerformanceMonitoringConfig,
  preDeploymentCheck,
  generateDeploymentReport
};