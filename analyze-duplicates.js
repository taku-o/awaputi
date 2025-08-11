#!/usr/bin/env node

/**
 * JavaScriptファイルのクラス名とファイル名の重複を分析するスクリプト
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ファイル名からクラス名を抽出する関数
function extractClassNamesFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const classMatches = content.match(/class\s+([A-Z]\w*)/g);
        if (!classMatches) return [];
        
        return classMatches.map(match => {
            const className = match.replace(/^class\s+/, '');
            return className;
        });
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return [];
    }
}

// ディレクトリを再帰的に探索してJSファイルを取得
function findJSFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // node_modules, .git などは除外
            if (!['node_modules', '.git', 'dist', 'test-results', 'playwright-report'].includes(item)) {
                findJSFiles(fullPath, files);
            }
        } else if (item.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// ファイル名からベース名を取得（拡張子を除く）
function getBaseName(filePath) {
    return path.basename(filePath, '.js');
}

// メイン処理
function analyzeDuplicates() {
    console.log('JavaScriptファイルのクラス名とファイル名の重複を分析中...\n');
    
    const jsFiles = findJSFiles('./src');
    const classToFiles = new Map(); // クラス名 -> ファイルパスの配列
    const fileToClasses = new Map(); // ファイルパス -> クラス名の配列
    const fileNames = new Map(); // ファイル名 -> ファイルパスの配列
    
    // 各ファイルを分析
    for (const filePath of jsFiles) {
        const classes = extractClassNamesFromFile(filePath);
        const baseName = getBaseName(filePath);
        
        // ファイル名の重複をチェック
        if (!fileNames.has(baseName)) {
            fileNames.set(baseName, []);
        }
        fileNames.get(baseName).push(filePath);
        
        // クラス名の重複をチェック
        fileToClasses.set(filePath, classes);
        for (const className of classes) {
            if (!classToFiles.has(className)) {
                classToFiles.set(className, []);
            }
            classToFiles.get(className).push(filePath);
        }
    }
    
    // 重複ファイル名を報告
    console.log('=== 重複ファイル名 ===');
    let duplicateFileNames = false;
    for (const [fileName, files] of fileNames.entries()) {
        if (files.length > 1) {
            duplicateFileNames = true;
            console.log(`ファイル名: ${fileName}.js`);
            files.forEach(file => console.log(`  - ${file}`));
            console.log();
        }
    }
    if (!duplicateFileNames) {
        console.log('重複するファイル名は見つかりませんでした。\n');
    }
    
    // 重複クラス名を報告
    console.log('=== 重複クラス名 ===');
    let duplicateClassNames = false;
    for (const [className, files] of classToFiles.entries()) {
        if (files.length > 1) {
            duplicateClassNames = true;
            console.log(`クラス名: ${className}`);
            files.forEach(file => console.log(`  - ${file}`));
            console.log();
        }
    }
    if (!duplicateClassNames) {
        console.log('重複するクラス名は見つかりませんでした。\n');
    }
    
    // クラス名とファイル名の一致をチェック
    console.log('=== クラス名とファイル名の一致状況 ===');
    let potentialConflicts = false;
    
    for (const [filePath, classes] of fileToClasses.entries()) {
        const baseName = getBaseName(filePath);
        
        for (const className of classes) {
            // 同じ名前のファイルが他にあるかチェック
            const sameNameFiles = fileNames.get(className) || [];
            if (sameNameFiles.length > 0 && !sameNameFiles.includes(filePath)) {
                potentialConflicts = true;
                console.log(`潜在的な競合: クラス "${className}" (${filePath}) とファイル名 "${className}.js"`);
                sameNameFiles.forEach(file => console.log(`  - 同名ファイル: ${file}`));
                console.log();
            }
        }
    }
    
    if (!potentialConflicts) {
        console.log('クラス名とファイル名の潜在的な競合は見つかりませんでした。\n');
    }
    
    // 統計情報
    console.log('=== 統計情報 ===');
    console.log(`総JSファイル数: ${jsFiles.length}`);
    console.log(`総クラス数: ${Array.from(classToFiles.keys()).length}`);
    console.log(`重複ファイル名数: ${Array.from(fileNames.values()).filter(files => files.length > 1).length}`);
    console.log(`重複クラス名数: ${Array.from(classToFiles.values()).filter(files => files.length > 1).length}`);
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
    analyzeDuplicates();
}

export { analyzeDuplicates };