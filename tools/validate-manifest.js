/**
 * validate-manifest.js
 * manifest.jsonの検証と最適化を行うスクリプト
 * アイコンファイルの存在確認、PWA準拠性チェック、最適化提案を実行
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * ファイルの存在確認
 * @param {string} filePath - 確認するファイルパス
 * @returns {boolean} ファイルが存在するかどうか
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * manifest.jsonを読み込む
 * @returns {Object} manifest.jsonの内容
 */
async function loadManifest() {
    try {
        const manifestPath = path.join(process.cwd(), 'manifest.json');
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        return JSON.parse(manifestContent);
    } catch (error) {
        console.error('❌ Failed to load manifest.json:', error.message);
        return null;
    }
}

/**
 * アイコンファイルの存在確認
 * @param {Object} manifest - manifest.jsonの内容
 * @returns {Object} 検証結果
 */
async function validateIcons(manifest) {
    console.log('🔍 Validating icon files...\n');
    
    const results = {
        total: 0,
        existing: 0,
        missing: 0,
        issues: []
    };
    
    if (!manifest.icons || !Array.isArray(manifest.icons)) {
        results.issues.push('❌ No icons array found in manifest.json');
        return results;
    }
    
    results.total = manifest.icons.length;
    
    for (const icon of manifest.icons) {
        const iconPath = path.join(process.cwd(), icon.src.replace(/^\//, ''));
        const exists = await fileExists(iconPath);
        
        if (exists) {
            results.existing++;
            console.log(`✅ Found: ${icon.src} (${icon.sizes})`);
        } else {
            results.missing++;
            results.issues.push(`❌ Missing: ${icon.src} (${icon.sizes})`);
            console.log(`❌ Missing: ${icon.src} (${icon.sizes})`);
        }
    }
    
    return results;
}

/**
 * ショートカットアイコンの存在確認
 * @param {Object} manifest - manifest.jsonの内容
 * @returns {Object} 検証結果
 */
async function validateShortcuts(manifest) {
    console.log('\n🔍 Validating shortcut icons...\n');
    
    const results = {
        total: 0,
        existing: 0,
        missing: 0,
        issues: []
    };
    
    if (!manifest.shortcuts || !Array.isArray(manifest.shortcuts)) {
        results.issues.push('⚠️  No shortcuts found in manifest.json');
        return results;
    }
    
    for (const shortcut of manifest.shortcuts) {
        if (shortcut.icons && Array.isArray(shortcut.icons)) {
            for (const icon of shortcut.icons) {
                results.total++;
                const iconPath = path.join(process.cwd(), icon.src.replace(/^\//, ''));
                const exists = await fileExists(iconPath);
                
                if (exists) {
                    results.existing++;
                    console.log(`✅ Found: ${icon.src} (shortcut: ${shortcut.name})`);
                } else {
                    results.missing++;
                    results.issues.push(`❌ Missing shortcut icon: ${icon.src} (${shortcut.name})`);
                    console.log(`❌ Missing: ${icon.src} (shortcut: ${shortcut.name})`);
                }
            }
        }
    }
    
    return results;
}

/**
 * スクリーンショットファイルの存在確認
 * @param {Object} manifest - manifest.jsonの内容
 * @returns {Object} 検証結果
 */
async function validateScreenshots(manifest) {
    console.log('\n🔍 Validating screenshot files...\n');
    
    const results = {
        total: 0,
        existing: 0,
        missing: 0,
        issues: []
    };
    
    if (!manifest.screenshots || !Array.isArray(manifest.screenshots)) {
        results.issues.push('⚠️  No screenshots found in manifest.json');
        return results;
    }
    
    results.total = manifest.screenshots.length;
    
    for (const screenshot of manifest.screenshots) {
        const screenshotPath = path.join(process.cwd(), screenshot.src.replace(/^\//, ''));
        const exists = await fileExists(screenshotPath);
        
        if (exists) {
            results.existing++;
            console.log(`✅ Found: ${screenshot.src} (${screenshot.sizes})`);
        } else {
            results.missing++;
            results.issues.push(`❌ Missing screenshot: ${screenshot.src}`);
            console.log(`❌ Missing: ${screenshot.src} (${screenshot.sizes})`);
        }
    }
    
    return results;
}

/**
 * PWA準拠性チェック
 * @param {Object} manifest - manifest.jsonの内容
 * @returns {Object} チェック結果
 */
function checkPWACompliance(manifest) {
    console.log('\n🏆 Checking PWA compliance...\n');
    
    const compliance = {
        required: [],
        recommended: [],
        optional: [],
        score: 0,
        maxScore: 0
    };
    
    // 必須フィールドチェック
    const requiredFields = [
        { field: 'name', weight: 10 },
        { field: 'short_name', weight: 10 },
        { field: 'start_url', weight: 10 },
        { field: 'display', weight: 10 },
        { field: 'theme_color', weight: 5 },
        { field: 'background_color', weight: 5 },
        { field: 'icons', weight: 15, validator: icons => icons && icons.length >= 2 }
    ];
    
    requiredFields.forEach(req => {
        compliance.maxScore += req.weight;
        const value = manifest[req.field];
        
        if (req.validator ? req.validator(value) : value) {
            compliance.required.push(`✅ ${req.field}: ${req.weight} points`);
            compliance.score += req.weight;
        } else {
            compliance.required.push(`❌ ${req.field}: Missing (${req.weight} points)`);
        }
    });
    
    // 推奨フィールドチェック
    const recommendedFields = [
        { field: 'description', weight: 5 },
        { field: 'orientation', weight: 3 },
        { field: 'scope', weight: 3 },
        { field: 'lang', weight: 2 },
        { field: 'categories', weight: 2 }
    ];
    
    recommendedFields.forEach(rec => {
        compliance.maxScore += rec.weight;
        const value = manifest[rec.field];
        
        if (value) {
            compliance.recommended.push(`✅ ${rec.field}: ${rec.weight} points`);
            compliance.score += rec.weight;
        } else {
            compliance.recommended.push(`⚠️  ${rec.field}: Missing (${rec.weight} points)`);
        }
    });
    
    // オプションフィールドチェック
    const optionalFields = [
        { field: 'shortcuts', weight: 5 },
        { field: 'screenshots', weight: 5 },
        { field: 'display_override', weight: 3 },
        { field: 'protocol_handlers', weight: 2 },
        { field: 'file_handlers', weight: 2 },
        { field: 'share_target', weight: 3 }
    ];
    
    optionalFields.forEach(opt => {
        compliance.maxScore += opt.weight;
        const value = manifest[opt.field];
        
        if (value && (Array.isArray(value) ? value.length > 0 : true)) {
            compliance.optional.push(`✅ ${opt.field}: ${opt.weight} points`);
            compliance.score += opt.weight;
        } else {
            compliance.optional.push(`➖ ${opt.field}: Not implemented (${opt.weight} points)`);
        }
    });
    
    return compliance;
}

/**
 * manifest.jsonの最適化提案を生成
 * @param {Object} manifest - manifest.jsonの内容
 * @param {Object} iconResults - アイコン検証結果
 * @returns {Array} 最適化提案リスト
 */
function generateOptimizationSuggestions(manifest, iconResults) {
    const suggestions = [];
    
    // アイコン関連の提案
    if (iconResults.missing > 0) {
        suggestions.push({
            priority: 'HIGH',
            category: 'Icons',
            issue: `${iconResults.missing} icon files are missing`,
            solution: 'Generate missing icon files or update manifest.json paths'
        });
    }
    
    // 必須アイコンサイズチェック
    const requiredSizes = ['192x192', '512x512'];
    const availableSizes = manifest.icons ? manifest.icons.map(icon => icon.sizes) : [];
    const missingSizes = requiredSizes.filter(size => !availableSizes.includes(size));
    
    if (missingSizes.length > 0) {
        suggestions.push({
            priority: 'HIGH',
            category: 'Icons',
            issue: `Missing required icon sizes: ${missingSizes.join(', ')}`,
            solution: 'Add icons with sizes 192x192 and 512x512 for PWA compliance'
        });
    }
    
    // マスカブルアイコンチェック
    const hasMaskableIcons = manifest.icons?.some(icon => icon.purpose?.includes('maskable'));
    if (!hasMaskableIcons) {
        suggestions.push({
            priority: 'MEDIUM',
            category: 'Icons',
            issue: 'No maskable icons found',
            solution: 'Add maskable icons for better Android adaptation'
        });
    }
    
    // ディスプレイモードチェック
    if (manifest.display !== 'standalone' && manifest.display !== 'fullscreen') {
        suggestions.push({
            priority: 'MEDIUM',
            category: 'Display',
            issue: `Display mode is '${manifest.display}', not optimal for PWA`,
            solution: 'Consider using "standalone" or "fullscreen" for better app-like experience'
        });
    }
    
    // スクリーンショット提案
    if (!manifest.screenshots || manifest.screenshots.length === 0) {
        suggestions.push({
            priority: 'LOW',
            category: 'Screenshots',
            issue: 'No screenshots provided',
            solution: 'Add screenshots to improve app store listing presentation'
        });
    }
    
    return suggestions;
}

/**
 * 修正されたmanifest.jsonを生成
 * @param {Object} manifest - 元のmanifest.json内容
 * @returns {Object} 修正されたmanifest.json
 */
function generateOptimizedManifest(manifest) {
    const optimized = { ...manifest };
    
    // アイコンパスの修正（存在しないアイコンを除外）
    if (optimized.icons) {
        // 注: 実際のファイル存在確認は非同期なので、ここではパス形式のみ正規化
        optimized.icons = optimized.icons.map(icon => ({
            ...icon,
            src: icon.src.startsWith('/') ? icon.src : `/${icon.src}`
        }));
    }
    
    // 必須フィールドの確認と追加
    if (!optimized.id) {
        optimized.id = '/';
    }
    
    // ディスプレイモードの最適化
    if (!optimized.display_override) {
        optimized.display_override = ['window-controls-overlay', 'standalone', 'minimal-ui', 'browser'];
    }
    
    return optimized;
}

/**
 * メイン検証機能
 */
async function validateManifest() {
    console.log('📋 PWA Manifest Validation\n');
    console.log('='.repeat(50));
    
    // manifest.json読み込み
    const manifest = await loadManifest();
    if (!manifest) {
        return;
    }
    
    console.log('✅ manifest.json loaded successfully\n');
    
    // アイコン検証
    const iconResults = await validateIcons(manifest);
    
    // ショートカットアイコン検証
    const shortcutResults = await validateShortcuts(manifest);
    
    // スクリーンショット検証
    const screenshotResults = await validateScreenshots(manifest);
    
    // PWA準拠性チェック
    const compliance = checkPWACompliance(manifest);
    
    // 最適化提案生成
    const suggestions = generateOptimizationSuggestions(manifest, iconResults);
    
    // レポート出力
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`\n🎯 Icons: ${iconResults.existing}/${iconResults.total} files found`);
    if (iconResults.missing > 0) {
        console.log(`   ⚠️  ${iconResults.missing} missing icon files`);
    }
    
    console.log(`\n🔗 Shortcuts: ${shortcutResults.existing}/${shortcutResults.total} icons found`);
    if (shortcutResults.missing > 0) {
        console.log(`   ⚠️  ${shortcutResults.missing} missing shortcut icons`);
    }
    
    console.log(`\n📷 Screenshots: ${screenshotResults.existing}/${screenshotResults.total} files found`);
    if (screenshotResults.missing > 0) {
        console.log(`   ⚠️  ${screenshotResults.missing} missing screenshot files`);
    }
    
    console.log(`\n🏆 PWA Compliance Score: ${compliance.score}/${compliance.maxScore} (${Math.round(compliance.score/compliance.maxScore*100)}%)`);
    
    if (compliance.score/compliance.maxScore >= 0.8) {
        console.log('   ✅ Excellent PWA compliance!');
    } else if (compliance.score/compliance.maxScore >= 0.6) {
        console.log('   ⚠️  Good PWA compliance, room for improvement');
    } else {
        console.log('   ❌ PWA compliance needs significant improvement');
    }
    
    // 詳細結果
    console.log('\n📋 Required Fields:');
    compliance.required.forEach(item => console.log(`  ${item}`));
    
    console.log('\n📋 Recommended Fields:');
    compliance.recommended.forEach(item => console.log(`  ${item}`));
    
    console.log('\n📋 Optional Features:');
    compliance.optional.forEach(item => console.log(`  ${item}`));
    
    // 最適化提案
    if (suggestions.length > 0) {
        console.log('\n🔧 OPTIMIZATION SUGGESTIONS');
        console.log('='.repeat(50));
        
        suggestions.forEach((suggestion, index) => {
            console.log(`\n${index + 1}. [${suggestion.priority}] ${suggestion.category}`);
            console.log(`   Issue: ${suggestion.issue}`);
            console.log(`   Solution: ${suggestion.solution}`);
        });
    }
    
    // 次のステップ
    console.log('\n🔍 NEXT STEPS');
    console.log('='.repeat(50));
    
    if (iconResults.missing > 0 || shortcutResults.missing > 0 || screenshotResults.missing > 0) {
        console.log('1. ❗ Generate missing asset files');
        if (iconResults.missing > 0) {
            console.log('   • Generate missing PWA icons');
        }
        if (shortcutResults.missing > 0) {
            console.log('   • Create shortcut icons (96x96px)');
        }
        if (screenshotResults.missing > 0) {
            console.log('   • Create app screenshots (portrait/landscape)');
        }
    }
    
    console.log('2. 🔧 Update manifest.json if needed');
    console.log('3. 🧪 Test PWA installation and functionality');
    console.log('4. 📈 Continue to Service Worker optimization (Task 6)');
    
    console.log('\n📈 Validation Status:');
    console.log(`  Manifest loaded: ✅`);  
    console.log(`  Icons validated: ✅`);
    console.log(`  PWA compliance checked: ✅`);
    console.log(`  Optimization suggestions: ${suggestions.length} items`);
    
    // 検証レポート保存
    const report = {
        timestamp: new Date().toISOString(),
        icons: iconResults,
        shortcuts: shortcutResults, 
        screenshots: screenshotResults,
        compliance,
        suggestions,
        summary: {
            totalScore: compliance.score,
            maxScore: compliance.maxScore,
            percentage: Math.round(compliance.score/compliance.maxScore*100),
            status: compliance.score/compliance.maxScore >= 0.8 ? 'EXCELLENT' : 
                   compliance.score/compliance.maxScore >= 0.6 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        }
    };
    
    const reportPath = path.join(process.cwd(), 'pwa-validation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved: pwa-validation-report.json`);
}

// 実行
validateManifest().catch(console.error);