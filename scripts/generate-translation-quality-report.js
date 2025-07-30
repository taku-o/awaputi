#!/usr/bin/env node

/**
 * 翻訳品質レポート生成スクリプト
 * - 翻訳完成度の分析
 * - 翻訳品質の評価
 * - 改善提案の生成
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SUPPORTED_LANGUAGES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
const TRANSLATION_CATEGORIES = ['common', 'menu', 'game', 'settings', 'errors', 'achievements', 'help'];

/**
 * 翻訳ファイル読み込み
 */
async function loadTranslationFile(language, category) {
  const filePath = path.join(projectRoot, 'src', 'locales', language, `${category}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * 翻訳キー抽出
 */
function extractTranslationKeys(obj, prefix = '') {
  const keys = [];
  
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'meta') continue;
      
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        keys.push(...extractTranslationKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  
  return keys;
}

/**
 * 翻訳品質分析
 */
async function analyzeTranslationQuality() {
  console.log('🔍 翻訳品質分析を開始...');
  
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      totalLanguages: SUPPORTED_LANGUAGES.length,
      totalCategories: TRANSLATION_CATEGORIES.length,
      completedLanguages: 0,
      averageCompleteness: 0,
      averageQuality: 0
    },
    languages: {},
    issues: [],
    recommendations: []
  };
  
  const baseLanguage = 'ja';
  let baseKeys = {};
  
  // ベース言語（日本語）のキーを取得
  for (const category of TRANSLATION_CATEGORIES) {
    const baseData = await loadTranslationFile(baseLanguage, category);
    if (baseData && baseData.translations) {
      baseKeys[category] = extractTranslationKeys(baseData.translations);
    } else {
      baseKeys[category] = [];
    }
  }
  
  // 各言語の分析
  for (const language of SUPPORTED_LANGUAGES) {
    console.log(`  📊 ${language} を分析中...`);
    
    const languageAnalysis = {
      completeness: 0,
      quality: 0,
      keyCount: 0,
      translatedKeys: 0,
      missingKeys: [],
      extraKeys: [],
      emptyValues: [],
      categories: {}
    };
    
    let totalBaseKeys = 0;
    let totalTranslatedKeys = 0;
    let totalQualityScore = 0;
    let categoryCount = 0;
    
    for (const category of TRANSLATION_CATEGORIES) {
      const categoryData = await loadTranslationFile(language, category);
      const baseKeysForCategory = baseKeys[category] || [];
      totalBaseKeys += baseKeysForCategory.length;
      
      if (categoryData && categoryData.translations) {
        const translationKeys = extractTranslationKeys(categoryData.translations);
        const translatedCount = translationKeys.length;
        totalTranslatedKeys += translatedCount;
        
        // 不足キーの検出
        const missingKeys = baseKeysForCategory.filter(key => !translationKeys.includes(key));
        if (missingKeys.length > 0) {
          languageAnalysis.missingKeys.push(...missingKeys.map(key => `${category}.${key}`));
        }
        
        // 余分なキーの検出
        const extraKeys = translationKeys.filter(key => !baseKeysForCategory.includes(key));
        if (extraKeys.length > 0) {
          languageAnalysis.extraKeys.push(...extraKeys.map(key => `${category}.${key}`));
        }
        
        // カテゴリ分析
        languageAnalysis.categories[category] = {
          completeness: baseKeysForCategory.length > 0 ? (translatedCount / baseKeysForCategory.length) * 100 : 100,
          quality: categoryData.meta?.quality || 90,
          keyCount: translatedCount,
          baseKeyCount: baseKeysForCategory.length,
          missingCount: missingKeys.length,
          extraCount: extraKeys.length
        };
        
        totalQualityScore += categoryData.meta?.quality || 90;
        categoryCount++;
      } else {
        // ファイルが存在しない場合
        languageAnalysis.categories[category] = {
          completeness: 0,
          quality: 0,
          keyCount: 0,
          baseKeyCount: baseKeysForCategory.length,
          missingCount: baseKeysForCategory.length,
          extraCount: 0
        };
        languageAnalysis.missingKeys.push(...baseKeysForCategory.map(key => `${category}.${key}`));
      }
    }
    
    // 言語全体の完成度計算
    languageAnalysis.completeness = totalBaseKeys > 0 ? (totalTranslatedKeys / totalBaseKeys) * 100 : 0;
    languageAnalysis.quality = categoryCount > 0 ? totalQualityScore / categoryCount : 0;
    languageAnalysis.keyCount = totalTranslatedKeys;
    languageAnalysis.translatedKeys = totalTranslatedKeys;
    
    // 完成した言語の判定（90%以上）
    if (languageAnalysis.completeness >= 90) {
      analysis.summary.completedLanguages++;
    }
    
    analysis.languages[language] = languageAnalysis;
  }
  
  // 全体の平均計算
  const completenessValues = Object.values(analysis.languages).map(lang => lang.completeness);
  const qualityValues = Object.values(analysis.languages).map(lang => lang.quality);
  
  analysis.summary.averageCompleteness = completenessValues.reduce((a, b) => a + b, 0) / completenessValues.length;
  analysis.summary.averageQuality = qualityValues.reduce((a, b) => a + b, 0) / qualityValues.length;
  
  // 問題の検出
  for (const [language, langData] of Object.entries(analysis.languages)) {
    if (langData.completeness < 50) {
      analysis.issues.push({
        type: 'low_completeness',
        language,
        severity: 'high',
        message: `${language}の翻訳完成度が低すぎます (${langData.completeness.toFixed(1)}%)`
      });
    }
    
    if (langData.quality < 70) {
      analysis.issues.push({
        type: 'low_quality',
        language,
        severity: 'medium',
        message: `${language}の翻訳品質が低すぎます (${langData.quality.toFixed(1)}点)`
      });
    }
    
    if (langData.missingKeys.length > 10) {
      analysis.issues.push({
        type: 'many_missing_keys',
        language,
        severity: 'high',
        message: `${language}に${langData.missingKeys.length}個の未翻訳キーがあります`
      });
    }
  }
  
  // 改善提案の生成
  analysis.recommendations = generateRecommendations(analysis);
  
  console.log('✅ 翻訳品質分析完了\n');
  return analysis;
}

/**
 * 改善提案の生成
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // 全体的な改善提案
  if (analysis.summary.averageCompleteness < 80) {
    recommendations.push({
      priority: 'high',
      category: 'completeness',
      message: '全体的な翻訳完成度が低いため、優先的に翻訳作業を進めてください'
    });
  }
  
  if (analysis.summary.averageQuality < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'quality',
      message: '翻訳品質の向上のため、ネイティブスピーカーによるレビューを実施してください'
    });
  }
  
  // 言語別の改善提案
  for (const [language, langData] of Object.entries(analysis.languages)) {
    if (langData.completeness < 50) {
      recommendations.push({
        priority: 'high',
        category: 'translation',
        language,
        message: `${language}の基本翻訳を完成させてください（現在${langData.completeness.toFixed(1)}%）`
      });
    }
    
    if (langData.missingKeys.length > 0 && langData.completeness >= 50) {
      recommendations.push({
        priority: 'medium',
        category: 'missing_keys',
        language,
        message: `${language}の${langData.missingKeys.length}個の未翻訳キーを翻訳してください`
      });
    }
    
    if (langData.extraKeys.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'extra_keys',
        language,
        message: `${language}の${langData.extraKeys.length}個の余分なキーを確認・削除してください`
      });
    }
  }
  
  return recommendations;
}

/**
 * HTMLレポート生成
 */
function generateHTMLReport(analysis) {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>翻訳品質レポート - BubblePop</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #333; margin-top: 30px; }
        h1 { border-bottom: 3px solid #007acc; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin-top: 0; color: #007acc; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #333; }
        .language-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .language-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .language-card h3 { margin-top: 0; display: flex; align-items: center; }
        .flag { width: 24px; height: 18px; margin-right: 10px; background: #ddd; border-radius: 2px; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .progress-high { background: #28a745; }
        .progress-medium { background: #ffc107; }
        .progress-low { background: #dc3545; }
        .issues { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .issue { margin: 10px 0; padding: 10px; border-left: 4px solid #ffc107; background: white; }
        .issue.high { border-left-color: #dc3545; }
        .issue.medium { border-left-color: #ffc107; }
        .issue.low { border-left-color: #28a745; }
        .recommendations { background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 翻訳品質レポート</h1>
        <p class="timestamp">生成日時: ${new Date(analysis.timestamp).toLocaleString('ja-JP')}</p>
        
        <div class="summary">
            <div class="summary-card">
                <h3>対応言語数</h3>
                <div class="value">${analysis.summary.totalLanguages}</div>
            </div>
            <div class="summary-card">
                <h3>完成言語数</h3>
                <div class="value">${analysis.summary.completedLanguages}</div>
            </div>
            <div class="summary-card">
                <h3>平均完成度</h3>
                <div class="value">${analysis.summary.averageCompleteness.toFixed(1)}%</div>
            </div>
            <div class="summary-card">
                <h3>平均品質</h3>
                <div class="value">${analysis.summary.averageQuality.toFixed(1)}</div>
            </div>
        </div>

        <h2>📊 言語別詳細</h2>
        <div class="language-grid">
            ${Object.entries(analysis.languages).map(([lang, data]) => `
                <div class="language-card">
                    <h3><span class="flag"></span>${lang}</h3>
                    <div>
                        <strong>完成度:</strong> ${data.completeness.toFixed(1)}%
                        <div class="progress-bar">
                            <div class="progress-fill ${data.completeness >= 80 ? 'progress-high' : data.completeness >= 50 ? 'progress-medium' : 'progress-low'}" 
                                 style="width: ${data.completeness}%"></div>
                        </div>
                    </div>
                    <div><strong>品質:</strong> ${data.quality.toFixed(1)}/100</div>
                    <div><strong>翻訳済みキー:</strong> ${data.translatedKeys}</div>
                    <div><strong>未翻訳キー:</strong> ${data.missingKeys.length}</div>
                    <div><strong>余分なキー:</strong> ${data.extraKeys.length}</div>
                </div>
            `).join('')}
        </div>

        ${analysis.issues.length > 0 ? `
            <h2>⚠️ 検出された問題</h2>
            <div class="issues">
                ${analysis.issues.map(issue => `
                    <div class="issue ${issue.severity}">
                        <strong>${issue.language || '全体'}:</strong> ${issue.message}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <h2>💡 改善提案</h2>
        <div class="recommendations">
            ${analysis.recommendations.map(rec => `
                <div class="recommendation">
                    <strong>[${rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}優先度]</strong>
                    ${rec.language ? `(${rec.language})` : ''} ${rec.message}
                </div>
            `).join('')}
        </div>

        <h2>📋 詳細データ</h2>
        <table>
            <thead>
                <tr>
                    <th>言語</th>
                    <th>完成度</th>
                    <th>品質</th>
                    <th>翻訳済み</th>
                    <th>未翻訳</th>
                    <th>余分</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(analysis.languages).map(([lang, data]) => `
                    <tr>
                        <td>${lang}</td>
                        <td>${data.completeness.toFixed(1)}%</td>
                        <td>${data.quality.toFixed(1)}</td>
                        <td>${data.translatedKeys}</td>
                        <td>${data.missingKeys.length}</td>
                        <td>${data.extraKeys.length}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

  return html;
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('🌍 翻訳品質レポート生成開始\n');
    
    const analysis = await analyzeTranslationQuality();
    
    // JSONレポート保存
    const jsonReportPath = path.join(projectRoot, 'reports', 'translation-quality-report.json');
    await fs.mkdir(path.dirname(jsonReportPath), { recursive: true });
    await fs.writeFile(jsonReportPath, JSON.stringify(analysis, null, 2));
    
    // HTMLレポート生成・保存
    const htmlReport = generateHTMLReport(analysis);
    const htmlReportPath = path.join(projectRoot, 'reports', 'translation-quality-report.html');
    await fs.writeFile(htmlReportPath, htmlReport);
    
    // コンソール出力
    console.log('📊 翻訳品質レポート概要:');
    console.log(`   対応言語: ${analysis.summary.totalLanguages}言語`);
    console.log(`   完成言語: ${analysis.summary.completedLanguages}言語`);
    console.log(`   平均完成度: ${analysis.summary.averageCompleteness.toFixed(1)}%`);
    console.log(`   平均品質: ${analysis.summary.averageQuality.toFixed(1)}点`);
    console.log(`   検出問題: ${analysis.issues.length}個`);
    console.log(`   改善提案: ${analysis.recommendations.length}個\n`);
    
    console.log('📄 レポートファイル:');
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   HTML: ${htmlReportPath}\n`);
    
    // 推奨アクション
    const highPriorityIssues = analysis.issues.filter(issue => issue.severity === 'high');
    if (highPriorityIssues.length > 0) {
      console.log('🚨 高優先度の問題が検出されました:');
      highPriorityIssues.forEach(issue => {
        console.log(`   • ${issue.language || '全体'}: ${issue.message}`);
      });
      console.log('');
    }
    
    const highPriorityRecs = analysis.recommendations.filter(rec => rec.priority === 'high');
    if (highPriorityRecs.length > 0) {
      console.log('💡 優先的に対応すべき改善項目:');
      highPriorityRecs.forEach(rec => {
        console.log(`   • ${rec.language ? `(${rec.language}) ` : ''}${rec.message}`);
      });
      console.log('');
    }
    
    console.log('✅ 翻訳品質レポート生成完了');
    
  } catch (error) {
    console.error('❌ レポート生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeTranslationQuality, generateHTMLReport };