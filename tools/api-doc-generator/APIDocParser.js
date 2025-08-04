/**
 * APIDocParser - ソースコード解析コンポーネント
 * 
 * 責任:
 * - JavaScriptソースコードの解析
 * - クラス定義・メソッドシグネチャの抽出
 * - 日本語コメント・JSDocアノテーションの解析
 * - 抽象構文木の構築
 */

import fs from 'fs/promises';
import path from 'path';

export class APIDocParser {
    constructor() {
        this.classRegistry = new Map();
        this.methodRegistry = new Map();
    }

    /**
     * ファイルの解析メイン処理
     * @param {string} filePath - 解析対象ファイルパス
     * @param {string} sourceDir - ソースディレクトリ
     * @returns {Object|null} 解析結果
     */
    async analyzeFile(filePath, sourceDir) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(sourceDir, filePath);
            
            console.log(`🔍 ファイルを解析中: ${relativePath}`);
            
            const analysis = {
                filePath: relativePath,
                absolutePath: filePath,
                classes: [],
                functions: [],
                constants: [],
                exports: [],
                imports: [],
                lastModified: (await fs.stat(filePath)).mtime.toISOString()
            };
            
            // クラスの抽出
            const classes = this.extractClasses(content);
            analysis.classes = classes;
            
            // 関数の抽出
            const functions = this.extractFunctions(content);
            analysis.functions = functions;
            
            // 定数の抽出
            const constants = this.extractConstants(content);
            analysis.constants = constants;
            
            // エクスポートの抽出
            const exports = this.extractExports(content);
            analysis.exports = exports;
            
            // インポートの抽出
            const imports = this.extractImports(content);
            analysis.imports = imports;
            
            return analysis;
            
        } catch (error) {
            console.warn(`⚠️  ファイル解析でエラーが発生しました: ${filePath}`, error.message);
            return null;
        }
    }

    /**
     * クラスの抽出
     * @param {string} content - ファイル内容
     * @returns {Array} クラス情報配列
     */
    extractClasses(content) {
        const classes = [];
        const classRegex = /(?:\/\/(.*?)\n)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/g;
        
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            const [fullMatch, comment, className, superClass] = match;
            const startIndex = match.index;
            
            // クラス本体の終了位置を検索
            const classBody = this.extractClassBody(content, startIndex + fullMatch.length);
            
            const classInfo = {
                name: className,
                superClass: superClass || null,
                comment: comment ? comment.trim().replace(/^\s*\/\/\s*/, '') : null,
                methods: this.extractMethods(classBody),
                properties: this.extractProperties(classBody),
                location: this.getLineNumber(content, startIndex)
            };
            
            classes.push(classInfo);
            this.classRegistry.set(className, classInfo);
        }
        
        return classes;
    }

    /**
     * クラス本体の抽出
     * @param {string} content - ファイル内容
     * @param {number} startIndex - 開始インデックス
     * @returns {string} クラス本体
     */
    extractClassBody(content, startIndex) {
        let braceCount = 1;
        let index = startIndex;
        
        while (index < content.length && braceCount > 0) {
            const char = content[index];
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
            }
            index++;
        }
        
        return content.substring(startIndex, index - 1);
    }

    /**
     * メソッドの抽出
     * @param {string} classBody - クラス本体
     * @returns {Array} メソッド情報配列
     */
    extractMethods(classBody) {
        const methods = [];
        const methodRegex = /(?:\/\*\*(.*?)\*\/|\/\/(.*?)\n)?\s*(async\s+)?(\w+)\s*\([^)]*\)\s*{/gs;
        
        let match;
        while ((match = methodRegex.exec(classBody)) !== null) {
            const [fullMatch, jsdocComment, lineComment, asyncKeyword, methodName] = match;
            
            // コンストラクタやgetterなどの判別
            const isConstructor = methodName === 'constructor';
            const isAsync = !!asyncKeyword;
            
            const methodInfo = {
                name: methodName,
                isConstructor,
                isAsync,
                comment: this.extractMethodComment(jsdocComment, lineComment),
                parameters: this.extractParameters(fullMatch),
                returnType: this.extractReturnType(jsdocComment),
                visibility: this.determineVisibility(methodName),
                location: this.getLineNumber(classBody, match.index)
            };
            
            methods.push(methodInfo);
            this.methodRegistry.set(`${methodName}`, methodInfo);
        }
        
        return methods;
    }

    /**
     * プロパティの抽出
     * @param {string} classBody - クラス本体
     * @returns {Array} プロパティ情報配列
     */
    extractProperties(classBody) {
        const properties = [];
        const propertyRegex = /(?:\/\*\*(.*?)\*\/|\/\/(.*?)\n)?\s*this\.(\w+)\s*=/g;
        
        let match;
        while ((match = propertyRegex.exec(classBody)) !== null) {
            const [, jsdocComment, lineComment, propertyName] = match;
            
            const propertyInfo = {
                name: propertyName,
                comment: this.extractMethodComment(jsdocComment, lineComment),
                type: this.extractPropertyType(jsdocComment),
                visibility: this.determineVisibility(propertyName),
                location: this.getLineNumber(classBody, match.index)
            };
            
            properties.push(propertyInfo);
        }
        
        return properties;
    }

    /**
     * 関数の抽出（トップレベル関数）
     * @param {string} content - ファイル内容
     * @returns {Array} 関数情報配列
     */
    extractFunctions(content) {
        const functions = [];
        const functionRegex = /(?:\/\*\*(.*?)\*\/|\/\/(.*?)\n)?\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{/gs;
        
        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            const [fullMatch, jsdocComment, lineComment, functionName] = match;
            
            const functionInfo = {
                name: functionName,
                comment: this.extractMethodComment(jsdocComment, lineComment),
                parameters: this.extractParameters(fullMatch),
                returnType: this.extractReturnType(jsdocComment),
                isExported: fullMatch.includes('export'),
                location: this.getLineNumber(content, match.index)
            };
            
            functions.push(functionInfo);
        }
        
        return functions;
    }

    /**
     * 定数の抽出
     * @param {string} content - ファイル内容
     * @returns {Array} 定数情報配列
     */
    extractConstants(content) {
        const constants = [];
        const constantRegex = /(?:\/\*\*(.*?)\*\/|\/\/(.*?)\n)?\s*(?:export\s+)?const\s+(\w+)\s*=/g;
        
        let match;
        while ((match = constantRegex.exec(content)) !== null) {
            const [fullMatch, jsdocComment, lineComment, constantName] = match;
            
            const constantInfo = {
                name: constantName,
                comment: this.extractMethodComment(jsdocComment, lineComment),
                type: this.extractPropertyType(jsdocComment),
                isExported: fullMatch.includes('export'),
                location: this.getLineNumber(content, match.index)
            };
            
            constants.push(constantInfo);
        }
        
        return constants;
    }

    /**
     * エクスポートの抽出
     * @param {string} content - ファイル内容
     * @returns {Array} エクスポート情報配列
     */
    extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:default\s+)?(?:class\s+|function\s+|const\s+|let\s+|var\s+)?(\w+)/g;
        
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            const [fullMatch, exportName] = match;
            const isDefault = fullMatch.includes('default');
            
            exports.push({
                name: exportName,
                isDefault,
                location: this.getLineNumber(content, match.index)
            });
        }
        
        return exports;
    }

    /**
     * インポートの抽出
     * @param {string} content - ファイル内容
     * @returns {Array} インポート情報配列
     */
    extractImports(content) {
        const imports = [];
        const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const [, namedImports, defaultImport, source] = match;
            
            const importInfo = {
                source,
                defaultImport: defaultImport || null,
                namedImports: namedImports ? namedImports.split(',').map(s => s.trim()) : [],
                location: this.getLineNumber(content, match.index)
            };
            
            imports.push(importInfo);
        }
        
        return imports;
    }

    /**
     * メソッドコメントの抽出と処理
     * @param {string} jsdocComment - JSDocコメント
     * @param {string} lineComment - 行コメント
     * @returns {string|null} 処理されたコメント
     */
    extractMethodComment(jsdocComment, lineComment) {
        if (jsdocComment) {
            return jsdocComment.trim()
                .replace(/^\s*\*\s?/gm, '')
                .replace(/^\s*$/gm, '')
                .trim();
        }
        
        if (lineComment) {
            return lineComment.trim().replace(/^\s*\/\/\s*/, '');
        }
        
        return null;
    }

    /**
     * パラメータの抽出
     * @param {string} methodSignature - メソッドシグネチャ
     * @returns {Array} パラメータ情報配列
     */
    extractParameters(methodSignature) {
        const paramMatch = methodSignature.match(/\(([^)]*)\)/);
        if (!paramMatch || !paramMatch[1].trim()) {
            return [];
        }
        
        return paramMatch[1].split(',').map(param => {
            const cleanParam = param.trim();
            const [name, defaultValue] = cleanParam.split('=').map(s => s.trim());
            
            return {
                name: name.replace(/^\.\.\./, ''), // rest parameter処理
                hasDefault: cleanParam.includes('='),
                defaultValue: defaultValue || null,
                isRest: cleanParam.startsWith('...')
            };
        });
    }

    /**
     * 戻り値の型抽出
     * @param {string} jsdocComment - JSDocコメント
     * @returns {string|null} 戻り値の型
     */
    extractReturnType(jsdocComment) {
        if (!jsdocComment) return null;
        
        const returnMatch = jsdocComment.match(/@returns?\s+{([^}]+)}/);
        return returnMatch ? returnMatch[1] : null;
    }

    /**
     * プロパティの型抽出
     * @param {string} jsdocComment - JSDocコメント
     * @returns {string|null} プロパティの型
     */
    extractPropertyType(jsdocComment) {
        if (!jsdocComment) return null;
        
        const typeMatch = jsdocComment.match(/@type\s+{([^}]+)}/);
        return typeMatch ? typeMatch[1] : null;
    }

    /**
     * 可視性の判定
     * @param {string} name - メソッド・プロパティ名
     * @returns {string} 可視性（public/private）
     */
    determineVisibility(name) {
        return name.startsWith('_') ? 'private' : 'public';
    }

    /**
     * 行番号の取得
     * @param {string} content - ファイル内容
     * @param {number} index - 文字インデックス
     * @returns {number} 行番号
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    /**
     * レジストリのクリア
     */
    clearRegistries() {
        this.classRegistry.clear();
        this.methodRegistry.clear();
    }

    /**
     * クラス情報の取得
     * @param {string} className - クラス名
     * @returns {Object|null} クラス情報
     */
    getClassInfo(className) {
        return this.classRegistry.get(className) || null;
    }

    /**
     * メソッド情報の取得
     * @param {string} methodName - メソッド名
     * @returns {Object|null} メソッド情報
     */
    getMethodInfo(methodName) {
        return this.methodRegistry.get(methodName) || null;
    }
}