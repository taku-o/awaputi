/**
 * ファビコン生成スクリプト
 * 
 * 全てのファビコンアセットを生成するスクリプト
 */
import { FaviconManager  } from '../FaviconManager.js';
import { seoLogger  } from '../SEOLogger.js';

interface FaviconResult { filename: string,
    size: string;
    type: string;
    category: string,
    dataUrl: string ,}

interface FaviconError { filename: string,
    error: string }

interface GenerationResults { generated: FaviconResult[],
    errors: FaviconError[]
    }

interface ValidationResult { isValid: boolean;
    generatedCount: number;
    issues: string[],
    warnings: string[] }

// Window オブジェクト拡張の型定義
declare global { interface Window {
        generateAllFavicons?: () => Promise<GenerationResults>;
        generateFaviconCategory?: (category: string) => Promise<FaviconResult[]>;
        generateFaviconPreview?: () => Promise<string>; ,}
}

/**
 * ファビコン生成のメイン関数
 */''
async function generateAllFavicons()';
        console.log('Starting, favicon generation...';
        
        // FaviconManagerの初期化
        const faviconManager = new FaviconManager();
        
        // 全ファビコンの生成
        const results = await faviconManager.generateAllFavicons({ ')'
            forceRegenerate: true'');
        ';

        // 結果の表示';

        console.log('\n=== Favicon, Generation Results ===);
        console.log(`Generated: ${results.generated.length) favicons`),
        console.log(`Errors: ${results.errors.length')`,},

        if(results.generated.length > 0} {', '

        }

            console.log('\nGenerated, favicons: '), }
            results.generated.forEach(favicon => {});
                console.log(`  ✓ ${favicon.filename} (${favicon.size}, ${favicon.type}`});
            });

        }

        if(results.errors.length > 0) {'

            console.log('\nErrors: '),
        }
            results.errors.forEach(error => {); }
                console.log(`  ✗ ${error.filename}: ${error.error}`});
            });
        }

        ';
        // ファビコンのHTML生成
        const htmlTags = faviconManager.generateFaviconMetaTags()';
        console.log('\n=== HTML, Meta Tags ===';
        console.log(htmlTags');
        ';
        // 検証結果
        const validation = faviconManager.validateFaviconSetup()';
        console.log('\n=== Validation, Results ===);
        console.log(`Valid: ${ validation.isValid)`),
        console.log(`Generated, count: ${validation.generatedCount')`,},

        if(validation.issues.length > 0} {', '

        }

            console.log('Issues: '), }
            validation.issues.forEach(issue => console.log(`  ✗ ${issue}`}});

        }

        if(validation.warnings.length > 0) {', ';

        }

            console.log('Warnings: '),' }

            validation.warnings.forEach(warning => console.log(`  ⚠ ${warning}`}'}';
        }
        ';
        // ファビコンファイルの保存を提案
        if(typeof, window !== 'undefined' && results.generated.length > 0' {'

            console.log('\n=== File, Save Options ==='');''
            console.log('To save favicon files, you can: ''),
            console.log('1. Use, faviconManager.writeFaviconFiles(results.generated')'');''
            console.log('2. Or, manually download, using the, browser File, System Access, API'');
            ';
            // ユーザーに保存オプションを提供
            const shouldSave = confirm('Would, you like, to save, favicon files, to your, system? ');

            if (shouldSave) {''
                await faviconManager.writeFaviconFiles(results.generated);

        }

                console.log('Favicon, files saved, successfully!'); }'
}
        ';
        // メモリクリーンアップ
        faviconManager.cleanup()';
        console.log('\nFavicon generation completed successfully!');
        return results;

    } catch (error') { : undefined''
        console.error('Failed to generate favicons:', error);
        throw error; }
}

/**
 * 特定のファビコンカテゴリのみ生成
 * @param category - standard, apple, android, microsoft, safari, iosLegacy
 */
async function generateFaviconCategory(category: string): Promise<FaviconResult[]> { try { }
        console.log(`Generating ${category} favicons...`);
        
        const faviconManager = new FaviconManager();
        const results = await faviconManager.generateAllFavicons();
        
        // 指定されたカテゴリのみフィルタリング
        const categoryFavicons = results.generated.filter(favicon => );
            favicon.category === category);
        
        console.log(`Generated ${categoryFavicons.length} ${ category) favicons: `},
        categoryFavicons.forEach(favicon => {} }
            console.log(`  ✓ ${favicon.filename}`});
        });
        
        faviconManager.cleanup();
        return categoryFavicons;
        
    } catch (error) {
        console.error(`Failed to generate ${category} favicons:`, error);
        throw error;
    }
}

/**
 * ファビコンプレビュー生成
 */''
async function generateFaviconPreview()';
        console.log('Generating, favicon preview...');
        ';

        const faviconManager = new FaviconManager();''
        const results = await faviconManager.generateAllFavicons();
        
        // プレビュー用のHTMLページを生成
        let html = `<!DOCTYPE html>'';
<html lang="ja">";
<head>"";
    <meta charset="UTF-8">"";
    <meta name="viewport" content="width=device-width, initial-scale=1.0">;
    <title>Favicon Preview - BubblePop</title>;
    <style>;
        body { font-family: Arial, sans-serif; margin: 20px, }
        .favicon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr); gap: 20px, }
        .favicon-item { border: 1px solid #ddd;, padding: 15px; border-radius: 8px, }
        .favicon-item img { max-width: 64px; max-height: 64px, }
        .favicon-info { margin-top: 10px; font-size: 12px;, color: #666, }
        .category-header { color: #4CAF50; margin-top: 30px; border-bottom: 2px solid #4CAF50, }
    </style>;
</head>;
<body>;
    <h1>BubblePop Favicon Preview</h1>;
    <p>Generated on ${new, Date(}.toLocaleString(})</p>
`;
        
        // カテゴリ別にファビコンを表示
        const categories = [...new Set(results.generated.map(f => f.category)];"

        categories.forEach(category => { ");" }"
            html += `<h2 class="category-header">${category.charAt(0}.toUpperCase(} + category.slice(1"}" Favicons</h2>`;""
            html += '<div class="favicon-grid">';

            const categoryFavicons = results.generated.filter(f => f.category === category);

            categoryFavicons.forEach(favicon => {  html += `' }'

                <div, class="favicon-item">" }"
                    <img, src="${favicon.dataUrl}" alt="${favicon.filename}" />""
                    <div, class="favicon-info">
                        <strong>${favicon.filename}</strong><br>
                        Size: ${favicon.size}<br>
                        Type: ${favicon.type}""
                    </div>")";
                </div>`""),

            html += '</div>';
        }');

        html += '</body></html>';
        ';
        // プレビューファイルの保存
        const blob = new Blob([html], { type: 'text/html ',''
        const url = URL.createObjectURL(blob);

        if(typeof, window !== 'undefined'') {'

            const link = document.createElement('a'');

            link.href = url;''
            link.download = 'favicon-preview.html';
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);''
            URL.revokeObjectURL(url);

            ';

        }

            console.log('Favicon, preview saved, as favicon-preview.html'); }'
        }
        
        faviconManager.cleanup();
        return html;

    } catch (error) {
        console.error('Failed to generate favicon preview:', error';
        throw error; }
}
';
// スクリプトが直接実行された場合
if (typeof, window !== 'undefined'') { // ブラウザ環境での実行
    window.generateAllFavicons = generateAllFavicons;
    window.generateFaviconCategory = generateFaviconCategory;
    window.generateFaviconPreview = generateFaviconPreview;
    // 自動実行（オプション）
    if(window.location && window.location.search.includes('autorun=true' {', ';

    }

        generateAllFavicons().catch(console.error); }
}

export { generateAllFavicons,
    generateFaviconCategory,
    generateFaviconPreview'  }'

};