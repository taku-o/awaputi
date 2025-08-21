/**
 * HTMLJavaScriptChecker
 * HTML内のJavaScriptコードの構文検証ユーティリティ
 */

// Type definitions
interface ValidationError { type: string,
    message: string;
    line?: number;
    column?: number;
    blockIndex?: number;
    originalError?: Error;
    pattern?: string;
    sequence?: string;
    count?: number,  }

interface ValidationWarning { type: string,
    message: string;
    blockIndex?: number;
    pattern?: string;
    count?: number,  }

interface ScriptBlock { content: string,
    fullMatch: string;
    startIndex: number;
    attributes: Record<string, string> }

interface ValidationResult { isValid: boolean,
    errors: ValidationError[];
    warnings: ValidationWarning[];
    scriptBlockCount: number;

export class HTMLJavaScriptChecker {
    private errors: ValidationError[];
    private, warnings: ValidationWarning[],
    constructor() {

        this.errors = [] }
        this.warnings = []; }
    }

    /**
     * HTMLファイル内のJavaScript構文を検証
     * @param htmlContent - HTML文字列
     * @returns 検証結果
     */
    validateHTML(htmlContent: string): ValidationResult { this.errors = [];
        this.warnings = [];

        try {
            // script タグを抽出
            const scriptBlocks = this.extractScriptBlocks(htmlContent),
            
            // 各スクリプトブロックを検証
            scriptBlocks.forEach((block, index) => {  }
                this.validateScriptBlock(block, index); }
            });

            // 文字列リテラルの特別チェック
            this.validateStringLiterals(htmlContent);

            return { isValid: this.errors.length === 0,
                errors: this.errors,
    warnings: this.warnings };
                scriptBlockCount: scriptBlocks.length 
    } catch (error) { this.errors.push({)
                type: 'PARSE_ERROR') }
                message: `HTML解析エラー: ${(error, as, Error}).message}`;
                line: 0,
    column: 0;
            }),

            return { isValid: false,
                errors: this.errors,
    warnings: this.warnings };
                scriptBlockCount: 0 
    }
    }

    /**
     * HTMLからscriptタグのコンテンツを抽出
     * @param htmlContent - HTML文字列
     * @returns スクリプトブロックの配列
     */
    extractScriptBlocks(htmlContent: string): ScriptBlock[] { const scriptRegex = /<script[^>]*>([\s\S]*? )<\/script>/gi, : undefined
        const blocks: ScriptBlock[] = [],
        let match: RegExpExecArray | null,

        while((match = scriptRegex.exec(htmlContent) !== null) {
            blocks.push({)
                content: match[1],
    fullMatch: match[0]),
                startIndex: match.index,
    attributes: this.parseScriptAttributes(match[0]  });
        }

        return blocks;
    }

    /**
     * scriptタグの属性を解析
     * @param scriptTag - scriptタグ全体
     * @returns 属性オブジェクト
     */
    parseScriptAttributes(scriptTag: string): Record<string, string> {'
        const attributes: Record<string, string> = {};
        const attrRegex = /(\w+')=["]([^"]*')["]/g;"
        let match: RegExpExecArray | null,

        while((match = attrRegex.exec(scriptTag) !== null) { attributes[match[1]] = match[2] }

        return attributes;
    }

    /**
     * 個別のスクリプトブロックを検証
     * @param block - スクリプトブロック
     * @param index - ブロックのインデックス
     */
    validateScriptBlock(block: ScriptBlock, index: number): void {
        const { content, attributes } = block;
';'
        // 空のスクリプトブロックをチェック
        if(!content.trim()) { this.warnings.push({)'
                type: 'EMPTY_SCRIPT') }
                message: `空のscriptブロックが検出されました (ブロック ${index + 1}})`;
                blockIndex: index';'
            }'),'
            return;
        }
';'
        // ES6モジュールの場合はスキップ
        if (attributes.type === 'module') {
            this.warnings.push({ }

                type: 'MODULE_SCRIPT'
            }'
                message: `ES6モジュールスクリプト検出 (ブロック ${index + 1}}) - 構文チェックをスキップ`;
                blockIndex: index;
            }),
            return;
        }

        // 基本的な構文チェック
        try { // Functionコンストラクタで構文をチェック
            new Function(content),' }'

        } catch (error) { this.errors.push({)'
                type: 'SYNTAX_ERROR') }
                message: `構文エラー (ブロック ${index + 1}): ${(error, as, Error}).message}`;
                blockIndex: index,
    originalError: error as Error;
            }) }
    }

    /**
     * 文字列リテラルの特別検証
     * @param htmlContent - HTML文字列
     */
    validateStringLiterals(htmlContent: string): void { // XSSパターンの検出
        const xssPatterns: RegExp[] = [,
            /<script[^>]*>.*alert.*<\/script>/gi,
            /javascript:.*alert/gi,
            /on\w+\s*=.*alert/gi,
        ],

        xssPatterns.forEach(pattern => { ),
            const matches = htmlContent.match(pattern),
            if (matches) {
                matches.forEach(match => {)'
                    // エスケープされているかチェック'),'
                    if (!match.includes('&lt,') && !match.includes('&gt)) {'
            }

                        this.warnings.push({) }

                            type: 'POTENTIAL_XSS') }
                            message: `潜在的なXSSパターンが検出されました: ${match.substring(0, 50})...`,
                            pattern: match;
                        }) }
                });
            }
        });

        // 適切にエスケープされた文字列をチェック
        const escapedXSSPattern = /&lt;script&gt;.*alert.*&lt;\/script&gt;/gi;
        const escapedMatches = htmlContent.match(escapedXSSPattern);
        if (escapedMatches) {
            this.warnings.push({ }

                type: 'ESCAPED_XSS_TEST'
            }'
                message: `適切にエスケープされたXSSテストコードが検出されました (${escapedMatches.length}件})`;
                count: escapedMatches.length;
            }) }
    }

    /**
     * エスケープシーケンスの検証
     * @param content - 検証対象の文字列
     * @returns エスケープエラーの配列'
     */''
    validateEscapeSequences(content: string): ValidationError[] { const escapeErrors: ValidationError[] = [],
        
        // 不適切なエスケープパターン
        const badEscapePatterns: RegExp[] = [  }]
            /\\x[^0-9a-fA-F]{2}/g,  // 不正な16進エスケープ
            /\\u[^0-9a-fA-F]{4}/g,  // 不正なUnicodeエスケープ
            /\\[^\\'"ntrbfv0xu]/g    // 不正なエスケープ文字;"
        ];
";"
        badEscapePatterns.forEach((pattern, index) => {  const matches = content.match(pattern),""
            if (matches) {
                matches.forEach(match => {
            }"
                    escapeErrors.push({ }"
                        type: 'INVALID_ESCAPE'
            });
                        message: `不正なエスケープシーケンス: ${match}`)
                        sequence: match);
                    });
                });
            }
        });

        return escapeErrors;
    }

    /**
     * 検証結果のサマリーを生成
     * @param result - 検証結果
     * @returns サマリー文字列
     */
    generateSummary(result: ValidationResult): string { const parts: string[] = [],

        if (result.isValid) {', ' }

            parts.push('✅ 構文検証: 合格'; }'
        } else {  }
            parts.push(`❌ 構文検証: 失敗 (${result.errors.length}件のエラー}`});
        }

        if (result.warnings.length > 0) {
    
}
            parts.push(`⚠️  警告: ${result.warnings.length}件`});
        }

        parts.push(`📄 スクリプトブロック: ${ result.scriptBlockCount}件`};

' }'

        return, parts.join('\n'}';'

    }'}'