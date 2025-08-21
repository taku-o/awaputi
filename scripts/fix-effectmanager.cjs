#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * EffectManager.ts 構文修正
 * Interface定義の構文エラーを修正
 */
function fixEffectManagerSyntax(content) {
    let modified = false;
    const originalContent = content;
    
    console.log('Starting EffectManager.ts interface syntax fixes...');
    
    // 1. ColorRGBA interface - missing closing brace
    content = content.replace(
        /export interface ColorRGBA \{ r: number,\s*g: number,\s*b: number,\s*a: number;/g,
        'export interface ColorRGBA { r: number; g: number; b: number; a: number; }'
    );
    
    // 2. CurrentTransform interface - fix structure with nested object
    content = content.replace(
        /export interface CurrentTransform \{\s*shake: \{ ,x: number, y: number,\s*zoom: number;\s*\},\s*rotation: number,\s*flash: ColorRGBA,\s*tint: ColorRGBA,\s*blur: number,\s*contrast: number,\s*brightness: number,\s*saturation: number;\s*\}/g,
        'export interface CurrentTransform { shake: { x: number; y: number; zoom: number; }; rotation: number; flash: ColorRGBA; tint: ColorRGBA; blur: number; contrast: number; brightness: number; saturation: number; }'
    );
    
    // 3. Transforms interface - missing closing brace
    content = content.replace(
        /export interface Transforms \{ shakeX: number\[\],\s*shakeY: number\[\],\s*zoom: number\[\],\s*rotation: number\[\],\s*flash: ColorRGBA\[\],\s*tint: ColorRGBA\[\],\s*blur: number\[\],\s*contrast: number\[\],\s*brightness: number\[\],\s*saturation: number\[\];/g,
        'export interface Transforms { shakeX: number[]; shakeY: number[]; zoom: number[]; rotation: number[]; flash: ColorRGBA[]; tint: ColorRGBA[]; blur: number[]; contrast: number[]; brightness: number[]; saturation: number[]; }'
    );
    
    // 4. EffectParameters interface - fix complex nested structure
    content = content.replace(
        /export interface EffectParameters \{ shakeIntensity: number,\s*flashDuration: number,\s*zoomSensitivity: number,\s*enabled: boolean,\s*shake: \{ duratio,n: number,\s*damping: number;\s*\},\s*flash: \{ intensity: number,\s*zoom: \{ duration: number,\s*easing: string;\s*\},\s*tint: \{ intensity: number,\s*duration: number;\s*\},\s*duration: number;\s*\};/g,
        'export interface EffectParameters { shakeIntensity: number; flashDuration: number; zoomSensitivity: number; enabled: boolean; shake: { duration: number; damping: number; }; flash: { intensity: number; duration: number; }; zoom: { duration: number; easing: string; }; tint: { intensity: number; duration: number; }; }'
    );
    
    // 5. BaseEffect interface - missing closing brace
    content = content.replace(
        /export interface BaseEffect \{ id: number,\s*type: EffectType,\s*duration: number,\s*elapsed: number;/g,
        'export interface BaseEffect { id: number; type: EffectType; duration: number; elapsed: number; }'
    );
    
    // 6. Fix any remaining comma to semicolon in interfaces
    content = content.replace(/(\w+): ([^,;{}]+),(\s*[}\w])/g, '$1: $2;$3');
    
    // 7. Fix any unterminated string literals that might exist
    content = content.replace(/('[^']*$)/gm, "$1'");
    content = content.replace(/(\"[^\"]*$)/gm, '$1"');
    
    // 8. Fix any duplicate export keywords
    content = content.replace(/export\s+export\s+/g, 'export ');
    
    // 9. Fix missing opening or closing braces in interfaces
    content = content.replace(/export interface (\w+) ([^{]*);/g, 'export interface $1 { $2; }');
    
    if (content !== originalContent) {
        modified = true;
        console.log('EffectManager.ts interface syntax fixes applied.');
    } else {
        console.log('No interface syntax fixes needed for EffectManager.ts.');
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
        
        const result = fixEffectManagerSyntax(content);
        
        if (result.modified) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`EffectManager.ts fixed: ${filePath}`);
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
console.log('EffectManager.ts Interface Syntax Fix\n');

const filePath = path.join(process.cwd(), 'src/effects/EffectManager.ts');

if (fs.existsSync(filePath)) {
    if (processFile(filePath)) {
        console.log('\n✅ EffectManager.ts fix completed successfully.');
    } else {
        console.log('\n❌ No fixes applied to EffectManager.ts.');
    }
} else {
    console.log(`❌ File not found: ${filePath}`);
}

console.log('\nEffectManager.ts fix completed.');