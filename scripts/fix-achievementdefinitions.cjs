#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * AchievementDefinitions.ts 構文修正
 * Interface定義の構文エラーを修正
 */
function fixAchievementDefinitionsSyntax(content) {
    let modified = false;
    const originalContent = content;
    
    console.log('Starting AchievementDefinitions.ts interface syntax fixes...');
    
    // 1. Achievement interface - fix missing closing brace
    content = content.replace(
        /export interface Achievement \{ id: string,\s*name: string,\s*description: string,\s*icon: string,\s*category: CategoryType,\s*type: AchievementType,\s*condition: AchievementCondition,\s*reward: AchievementReward;\s*difficulty\?: DifficultyLevel;\s*hidden\?: boolean \};/g,
        'export interface Achievement { id: string; name: string; description: string; icon: string; category: CategoryType; type: AchievementType; condition: AchievementCondition; reward: AchievementReward; difficulty?: DifficultyLevel; hidden?: boolean; }'
    );
    
    // 2. AchievementCondition interface - fix missing closing brace
    content = content.replace(
        /export interface AchievementCondition \{ type: ConditionType;\s*value\?: number \| boolean;\s*bubbleType\?: BubbleType;/g,
        'export interface AchievementCondition { type: ConditionType; value?: number | boolean; bubbleType?: BubbleType; }'
    );
    
    // 3. Fix all other interfaces with similar pattern
    content = content.replace(
        /export interface (\w+) \{([^}]*);\s*$/gm,
        'export interface $1 {$2; }'
    );
    
    // 4. Fix interface property separators - change commas to semicolons
    content = content.replace(
        /(\w+): ([^,;{}]+),(\s*[\w}])/g,
        '$1: $2;$3'
    );
    
    // 5. Fix specific common patterns
    content = content.replace(
        /export interface (\w+) \{([^}]*) \};/g,
        (match, name, body) => {
            // Clean up the body: replace commas with semicolons and fix spacing
            const cleanBody = body.replace(/,(\s*\w+:)/g, ';$1').replace(/;(\s*$)/g, ';');
            return `export interface ${name} { ${cleanBody.trim()} }`;
        }
    );
    
    // 6. Fix nested object properties
    content = content.replace(
        /(\w+): \{([^}]*)\},/g,
        (match, prop, body) => {
            const cleanBody = body.replace(/,/g, ';');
            return `${prop}: { ${cleanBody} };`;
        }
    );
    
    // 7. Fix any remaining export interface issues
    content = content.replace(/export interface (\w+) ([^{]*);/g, 'export interface $1 { $2; }');
    
    // 8. Fix type definitions
    content = content.replace(/export type (\w+) = ([^;]+),/g, 'export type $1 = $2;');
    
    // 9. Fix const definitions
    content = content.replace(/export const (\w+) = ([^;]+),/g, 'export const $1 = $2;');
    
    if (content !== originalContent) {
        modified = true;
        console.log('AchievementDefinitions.ts interface syntax fixes applied.');
    } else {
        console.log('No interface syntax fixes needed for AchievementDefinitions.ts.');
    }
    
    return { content, modified };
}

/**
 * ファイルを処理
 */
function processFile(filePath) {
    try {
        console.log(`Processing ${filePath}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const result = fixAchievementDefinitionsSyntax(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`AchievementDefinitions.ts fixed: ${filePath}`);
            return true;
        } else {
            console.log(`No changes needed: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// メイン処理
console.log('AchievementDefinitions.ts Interface Syntax Fix\n');

const filePath = path.join(process.cwd(), 'src/core/achievements/AchievementDefinitions.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log('\n✅ AchievementDefinitions.ts fix completed successfully.');
    } else {
        console.log('\n❌ No fixes applied to AchievementDefinitions.ts.');
    }
} else {
    console.log(`❌ File not found: ${filePath}`);
}

console.log('\nAchievementDefinitions.ts fix completed.');