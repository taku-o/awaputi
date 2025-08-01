#!/usr/bin/env node

/**
 * 完了したspecsをアーカイブするスクリプト
 * Usage: node scripts/archive-completed-specs.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPECS_DIR = path.join(__dirname, '..', '.kiro', 'specs');
const COMPLETED_DIR = path.join(SPECS_DIR, 'completed');

// 完了したspecsのリスト（手動で指定）
const COMPLETED_SPECS = [
    'accessibility-enhancement',
    'achievement-system-implementation',
    'bubble-pop-web-game',
    'configuration-refactoring',
    'data-management-enhancement-issue-29',
    'debug-tools-enhancement-issue-30',
    'documentation-enhancement-issue-31',
    'event-stage-system-issue-28',
    'game-balance-test-sync',
    'internationalization-issue-27',
    'large-file-optimization-issue-52',
    'mobile-enhancement-issue-26',
    'performance-optimization-stability',
    'serviceworker-postmessage-fix-issue-58',
    'statistics-system-enhancement',
    'test-fixes',
    'user-info-scene-implementation',
    'visual-effects-enhancement-issue-24'
];

function getCurrentQuarter() {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return { year, quarter: `Q${quarter}` };
}

function isSpecCompleted(specPath) {
    const tasksFile = path.join(specPath, 'tasks.md');
    if (!fs.existsSync(tasksFile)) {
        return false;
    }
    
    const content = fs.readFileSync(tasksFile, 'utf8');
    const lines = content.split('\n');
    
    // [x] でマークされたタスクと [ ] でマークされたタスクをカウント
    let completedTasks = 0;
    let totalTasks = 0;
    
    for (const line of lines) {
        if (line.match(/^\s*- \[x\]/)) {
            completedTasks++;
            totalTasks++;
        } else if (line.match(/^\s*- \[ \]/)) {
            totalTasks++;
        }
    }
    
    return totalTasks > 0 && completedTasks === totalTasks;
}

function moveSpec(specName, dryRun = false) {
    const { year, quarter } = getCurrentQuarter();
    const sourcePath = path.join(SPECS_DIR, specName);
    const targetDir = path.join(COMPLETED_DIR, year.toString(), quarter);
    const targetPath = path.join(targetDir, specName);
    
    if (!fs.existsSync(sourcePath)) {
        console.log(`❌ Spec not found: ${specName}`);
        return false;
    }
    
    if (!isSpecCompleted(sourcePath)) {
        console.log(`⚠️  Spec not completed: ${specName}`);
        return false;
    }
    
    if (dryRun) {
        console.log(`🔍 Would move: ${specName} -> completed/${year}/${quarter}/`);
        return true;
    }
    
    // ターゲットディレクトリを作成
    fs.mkdirSync(targetDir, { recursive: true });
    
    // specを移動
    fs.renameSync(sourcePath, targetPath);
    
    // 完了情報を記録
    const completionInfo = {
        specName,
        completedDate: new Date().toISOString(),
        originalPath: specName,
        archivedPath: `completed/${year}/${quarter}/${specName}`
    };
    
    const infoFile = path.join(targetPath, 'completion-info.json');
    fs.writeFileSync(infoFile, JSON.stringify(completionInfo, null, 2));
    
    console.log(`✅ Moved: ${specName} -> completed/${year}/${quarter}/`);
    return true;
}

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    console.log('🗂️  Archiving completed specs...\n');
    
    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No files will be moved\n');
    }
    
    let movedCount = 0;
    
    for (const specName of COMPLETED_SPECS) {
        if (moveSpec(specName, dryRun)) {
            movedCount++;
        }
    }
    
    console.log(`\n📊 Summary: ${movedCount} specs ${dryRun ? 'would be' : 'were'} archived`);
    
    if (!dryRun && movedCount > 0) {
        console.log('\n📝 Don\'t forget to update the main README.md to reflect the archived specs!');
    }
}

main();