#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('TypeScript TS6133 エラー一括修正スクリプト開始...');

// TypeScript エラー情報を取得
let tscOutput = '';
try {
    tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8', cwd: __dirname });
} catch (error) {
    tscOutput = error.stdout || error.message;
}

// TS6133 エラーのみを抽出
const ts6133Errors = [];
const lines = tscOutput.split('\n');

for (const line of lines) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS6133:\s+'([^']+)'\s+is\s+declared\s+but\s+its\s+value\s+is\s+never\s+read\./);
    if (match) {
        const [, filePath, lineNum, colNum, varName] = match;
        ts6133Errors.push({ filePath, lineNum: parseInt(lineNum), colNum: parseInt(colNum), varName });
    }
}

console.log(`TS6133 エラー ${ts6133Errors.length} 個を検出しました。`);

let fixedCount = 0;
let processedFiles = new Set();

// ファイル別に処理を行う
const fileGroups = {};
for (const error of ts6133Errors) {
    if (!fileGroups[error.filePath]) {
        fileGroups[error.filePath] = [];
    }
    fileGroups[error.filePath].push(error);
}

for (const [filePath, errors] of Object.entries(fileGroups)) {
    if (processedFiles.has(filePath)) continue;
    if (!fs.existsSync(filePath)) continue;
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let modified = false;
        
        // 行番号の降順でソート（後ろから処理して行番号のズレを防ぐ）
        errors.sort((a, b) => b.lineNum - a.lineNum);
        
        for (const error of errors) {
            const lineIndex = error.lineNum - 1;
            if (lineIndex >= lines.length) continue;
            
            const line = lines[lineIndex];
            
            // 単純な変数宣言かどうかを判定
            const isSimpleDeclaration = (
                line.trim().match(/^(private|protected|public|readonly|static)?\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[:\?]/) ||
                line.trim().match(/^(const|let|var)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*[:\=]/) ||
                line.trim().match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*[:\=]/)
            );
            
            if (isSimpleDeclaration && line.trim() && !line.trim().startsWith('//')) {
                // 行全体をコメントアウト
                lines[lineIndex] = line.replace(/^(\s*)(.*)$/, '$1// $2');
                modified = true;
                fixedCount++;
                console.log(`${filePath}:${error.lineNum} - ${error.varName} をコメントアウト`);
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            processedFiles.add(filePath);
        }
    } catch (error) {
        console.error(`エラー: ${filePath} の処理に失敗: ${error.message}`);
    }
}

console.log(`\n完了: ${fixedCount} 個の変数宣言をコメントアウトしました。`);
console.log(`処理ファイル数: ${processedFiles.size}`);

// 残りのエラー確認
try {
    const remainingOutput = execSync('npx tsc --noEmit 2>&1 | grep TS6133 | wc -l', { encoding: 'utf8', cwd: __dirname });
    console.log(`残りのTS6133エラー数: ${remainingOutput.trim()}`);
} catch (error) {
    console.log('残りエラー数の確認に失敗');
}

process.exit(0);