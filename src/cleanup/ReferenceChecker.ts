import fs from 'fs';''
import path from 'path';''
import { glob } from 'glob';

interface Reference { file: string,
    line: number,';
    context: string,'';
    type: 'import' | 'string'; }
}

export interface ReferenceResult { filePath: string,
    references: Reference[],
    hasReferences: boolean,
    importCount: number,
    stringCount: number; }
}

export class ReferenceChecker {
    private searchExtensions: string[]';
'';
    constructor(''';
        this.searchExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md']; }
    }
);
    async checkImportReferences(filePath: string, rootPath: string = process.cwd(): Promise<Reference[]> { const fileName = path.basename(filePath);'
        const fileNameWithoutExt = path.basename(filePath, path.extname(filePath);''
        const relativeFromRoot = path.relative(rootPath, filePath');
        ';
        const patterns = [' }]'
            `import.*from.*['"\`][^'"\`]*${fileNameWithoutExt}[^'"\`]*['"\`]`,""
            `import.*['"\`][^'"\`]*${fileNameWithoutExt}[^'"\`]*['"\`]`,""
            `require\\(['"\`][^'"\`]*${fileNameWithoutExt}[^'"\`]*['"\`]\\")`,""
            `import\\(['"\`][^'"\`]*${fileNameWithoutExt}[^'"\`]*['"\`]\\)`
        ];

        return await this.searchPatterns(patterns, filePath, rootPath);
    }

    async checkStringReferences(filePath: string, rootPath: string = process.cwd(): Promise<Reference[]> { const fileName = path.basename(filePath);
        const relativeFromRoot = path.relative(rootPath, filePath);
        ";
        const patterns = ["]";
            fileName.replace(/[.*+? ^${)(")|[\]\\]/g, '\\$&'),''
            relativeFromRoot.replace(/[.*+?^${)(')|[\]\\]/g, '\\$&')
        ];
 }
        return await this.searchPatterns(patterns, filePath, rootPath});
    }'
 : undefined'';
    async searchPatterns(patterns: string[], targetFile: string, rootPath: string = process.cwd()'): Promise<Reference[]> { ''
        const allFiles = await glob('**/*', {'
            cwd: rootPath,')';
            ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '*.log']);
            absolute: true;
        ),
;
        const searchableFiles = allFiles.filter(file => { );
            const ext = path.extname(file); }
            return this.searchExtensions.includes(ext) && file !== targetFile; }
        });

        const references: Reference[] = [],';
'';
        for(const file of searchableFiles') {'
            try {''
                const content = await fs.promises.readFile(file, 'utf8'');''
                const lines = content.split('\n');

                for (let i = 0; i < lines.length; i++) {'
                    const line = lines[i];''
                    for (const pattern of patterns') {''
                        const regex = new RegExp(pattern, 'gi');
                        if(regex.test(line) {
                            references.push({);
                                file: path.relative(rootPath, file),
                                line: i + 1,
                                context: line.trim(),
        }
                                type: this.detectReferenceType(line); }
                            });
                        }
                    }
                } catch (error) {
                console.error(`Error reading file ${file}:`, error);
            }
        }

        return references;
    }'
'';
    private detectReferenceType(line: string'): 'import' | 'string' { ''
        if (/import.*from|require\(|import\(/.test(line)') {''
            return 'import'; }'
        }''
        return 'string';
    }

    excludeTargetFile(searchResults: Reference[], targetFile: string): Reference[] { return searchResults.filter(result => result.file !== targetFile); }
    }

    async generateReferenceReport(filePath: string, rootPath: string = process.cwd(): Promise<ReferenceResult> { const importReferences = await this.checkImportReferences(filePath, rootPath);
        const stringReferences = await this.checkStringReferences(filePath, rootPath);
        
        const allReferences = [...importReferences, ...stringReferences];
        const uniqueReferences = this.removeDuplicateReferences(allReferences);
';
        return { ''
            filePath: path.relative(rootPath, filePath'),
            references: uniqueReferences,';
            hasReferences: uniqueReferences.length > 0,'';
            importCount: uniqueReferences.filter(ref => ref.type === 'import'').length,' };'
            stringCount: uniqueReferences.filter(ref => ref.type === 'string').length }
        },
    }

    private removeDuplicateReferences(references: Reference[]): Reference[] { const seen = new Set<string>();
        return references.filter(ref => {); }
            const key = `${ref.file}:${ref.line}:${ ref.context)`; }
            if (seen.has(key)}) { return false; }
            }
            seen.add(key);'
            return true;''
        }');'
    }''
}