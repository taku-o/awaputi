#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * TranslationDataManager.ts 構文修正
 * Interface定義の構文エラーを修正
 */
function fixTranslationDataManagerSyntax(content) {
    let modified = false;
    const originalContent = content;
    
    console.log('Starting TranslationDataManager.ts interface syntax fixes...');
    
    // 1. AccessibilityTranslationData interface - missing closing brace
    content = content.replace(
        /export interface AccessibilityTranslationData \{ \[key: string\]: string;/g,
        'export interface AccessibilityTranslationData { [key: string]: string; }'
    );
    
    // 2. TranslationCategoryStats interface - missing closing brace
    content = content.replace(
        /export interface TranslationCategoryStats \{ keyCount: number,\s*arrayCount: number;/g,
        'export interface TranslationCategoryStats { keyCount: number; arrayCount: number; }'
    );
    
    // 3. AccessibilityCategoryStats interface - missing closing brace
    content = content.replace(
        /export interface AccessibilityCategoryStats \{\s*keyCount: number;/g,
        'export interface AccessibilityCategoryStats { keyCount: number; }'
    );
    
    // 4. TranslationStats interface - fix structure
    content = content.replace(
        /export interface TranslationStats \{ loadedLanguages: string\[\],\s*languageCount: number,\s*translations: Record<string, TranslationCategoryStats>;\s*accessibilityTranslations: Record<string, AccessibilityCategoryStats> \};/g,
        'export interface TranslationStats { loadedLanguages: string[]; languageCount: number; translations: Record<string, TranslationCategoryStats>; accessibilityTranslations: Record<string, AccessibilityCategoryStats>; }'
    );
    
    // 5. TranslationSearchOptions interface
    content = content.replace(
        /export interface TranslationSearchOptions \{ caseSensitive\?: boolean,\s*exactMatch\?: boolean;\s*includeAccessibility\?: boolean;/g,
        'export interface TranslationSearchOptions { caseSensitive?: boolean; exactMatch?: boolean; includeAccessibility?: boolean; }'
    );
    
    // 6. TranslationSearchResult interface
    content = content.replace(
        /export interface TranslationSearchResult \{ language: string,\s*key: string,\s*value: string \| string\[\],\s*category: TranslationCategory;/g,
        'export interface TranslationSearchResult { language: string; key: string; value: string | string[]; category: TranslationCategory; }'
    );
    
    // 7. TranslationValidationResult interface
    content = content.replace(
        /export interface TranslationValidationResult \{ isValid: boolean,\s*missingKeys: string\[\],\s*extraKeys: string\[\],\s*invalidValues: string\[\];/g,
        'export interface TranslationValidationResult { isValid: boolean; missingKeys: string[]; extraKeys: string[]; invalidValues: string[]; }'
    );
    
    // 8. TranslationExportOptions interface
    content = content.replace(
        /export interface TranslationExportOptions \{ includeAccessibility\?: boolean,\s*format\?: TranslationExportFormat;\s*languages\?: string\[\];/g,
        'export interface TranslationExportOptions { includeAccessibility?: boolean; format?: TranslationExportFormat; languages?: string[]; }'
    );
    
    // 9. TranslationImportResult interface
    content = content.replace(
        /export interface TranslationImportResult \{ success: boolean,\s*importedLanguages: string\[\],\s*errors: string\[\];/g,
        'export interface TranslationImportResult { success: boolean; importedLanguages: string[]; errors: string[]; }'
    );
    
    // 10. BulkTranslationOperation interface
    content = content.replace(
        /export interface BulkTranslationOperation \{ language: string,\s*key: string,\s*value: string \| string\[\],\s*operation: TranslationOperation;/g,
        'export interface BulkTranslationOperation { language: string; key: string; value: string | string[]; operation: TranslationOperation; }'
    );
    
    // 11. TranslationMergeResult interface
    content = content.replace(
        /export interface TranslationMergeResult \{ mergedKeys: number,\s*conflictKeys: string\[\],\s*newKeys: number;/g,
        'export interface TranslationMergeResult { mergedKeys: number; conflictKeys: string[]; newKeys: number; }'
    );
    
    // 12. Fix export type declarations - remove spurious characters
    content = content.replace(/export type TranslationCategory = 'main' \| 'accessibility';\s*export type TranslationExportFormat = 'json' \| 'csv' \| 'yaml';\s*export type TranslationOperation = 'add' \| 'update' \| 'delete';\s*';'/g,
        "export type TranslationCategory = 'main' | 'accessibility';\nexport type TranslationExportFormat = 'json' | 'csv' | 'yaml';\nexport type TranslationOperation = 'add' | 'update' | 'delete';"
    );
    
    // 13. Fix SUPPORTED_LANGUAGES constant - missing closing quote
    content = content.replace(
        /export const SUPPORTED_LANGUAGES = \['ja', 'en', 'ko', 'zh-CN', 'zh-TW\] as const;'/g,
        "export const SUPPORTED_LANGUAGES = ['ja', 'en', 'ko', 'zh-CN', 'zh-TW'] as const;"
    );
    
    if (content !== originalContent) {
        modified = true;
        console.log('TranslationDataManager.ts interface syntax fixes applied.');
    } else {
        console.log('No interface syntax fixes needed for TranslationDataManager.ts.');
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
        
        const result = fixTranslationDataManagerSyntax(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`TranslationDataManager.ts fixed: ${filePath}`);
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
console.log('TranslationDataManager.ts Interface Syntax Fix\n');

const filePath = path.join(process.cwd(), 'src/core/localization-manager/TranslationDataManager.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log('\n✅ TranslationDataManager.ts fix completed successfully.');
    } else {
        console.log('\n❌ No fixes applied to TranslationDataManager.ts.');
    }
} else {
    console.log(`❌ File not found: ${filePath}`);
}

console.log('\nTranslationDataManager.ts fix completed.');