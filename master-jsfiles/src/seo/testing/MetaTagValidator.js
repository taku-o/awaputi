/**
 * Meta Tag Validator Component
 * 
 * メタタグ検証機能を担当
 * SEOTester のサブコンポーネント
 */

import { seoLogger } from '../SEOLogger.js';
import { seoErrorHandler } from '../SEOErrorHandler.js';

export class MetaTagValidator {
    constructor(mainController) {
        this.mainController = mainController;
        this.baseUrl = mainController.baseUrl;
    }

    /**
     * メタタグの検証
     * @returns {Promise<Object>}
     */
    async validateMetaTags() {
        try {
            const results = {
                category: 'Meta Tags',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // HTMLからメタタグを抽出（実際の実装では DOM から取得）
            const metaTags = await this._extractMetaTags();
            const rules = this.mainController.validationRules.get('metaTags');
            
            // 必須タグの存在確認
            for (const requiredTag of rules.required) {
                const test = {
                    name: `Required meta tag: ${requiredTag}`,
                    passed: false,
                    message: ''
                };
                
                if (metaTags[requiredTag]) {
                    test.passed = true;
                    test.message = `✅ ${requiredTag} tag present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredTag} tag`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // タイトル長の検証
            if (metaTags.title) {
                const titleTest = {
                    name: 'Title length validation',
                    passed: false,
                    message: ''
                };
                
                const titleLength = metaTags.title.length;
                if (titleLength >= rules.titleLength.min && titleLength <= rules.titleLength.max) {
                    titleTest.passed = true;
                    titleTest.message = `✅ Title length optimal: ${titleLength} characters`;
                    results.passed++;
                } else {
                    titleTest.message = `⚠️ Title length suboptimal: ${titleLength} characters (recommended: ${rules.titleLength.min}-${rules.titleLength.max})`;
                    results.warnings++;
                }
                
                results.tests.push(titleTest);
            }
            
            // 説明文長の検証
            if (metaTags.description) {
                const descTest = {
                    name: 'Description length validation',
                    passed: false,
                    message: ''
                };
                
                const descLength = metaTags.description.length;
                if (descLength >= rules.descriptionLength.min && descLength <= rules.descriptionLength.max) {
                    descTest.passed = true;
                    descTest.message = `✅ Description length optimal: ${descLength} characters`;
                    results.passed++;
                } else {
                    descTest.message = `⚠️ Description length suboptimal: ${descLength} characters (recommended: ${rules.descriptionLength.min}-${rules.descriptionLength.max})`;
                    results.warnings++;
                }
                
                results.tests.push(descTest);
            }
            
            seoLogger.validation('metaTags', results.failed === 0, results.tests);
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateMetaTags');
        }
    }

    /**
     * Open Graphタグの検証
     * @returns {Promise<Object>}
     */
    async validateOpenGraphTags() {
        try {
            const results = {
                category: 'Open Graph',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const ogTags = await this._extractOpenGraphTags();
            const rules = this.mainController.validationRules.get('openGraph');
            
            // 必須OGタグの存在確認
            for (const requiredTag of rules.required) {
                const test = {
                    name: `Required OG tag: ${requiredTag}`,
                    passed: false,
                    message: ''
                };
                
                if (ogTags[requiredTag]) {
                    test.passed = true;
                    test.message = `✅ ${requiredTag} tag present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredTag} tag`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // OG画像の検証
            if (ogTags['og:image']) {
                const imageTest = {
                    name: 'OG image validation',
                    passed: false,
                    message: ''
                };
                
                const imageUrl = ogTags['og:image'];
                if (this._isValidImageUrl(imageUrl)) {
                    imageTest.passed = true;
                    imageTest.message = `✅ Valid OG image URL: ${imageUrl}`;
                    results.passed++;
                } else {
                    imageTest.message = `❌ Invalid OG image URL: ${imageUrl}`;
                    results.failed++;
                }
                
                results.tests.push(imageTest);
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateOpenGraphTags');
        }
    }

    /**
     * Twitter Cardタグの検証
     * @returns {Promise<Object>}
     */
    async validateTwitterCardTags() {
        try {
            const results = {
                category: 'Twitter Card',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const twitterTags = await this._extractTwitterCardTags();
            const rules = this.mainController.validationRules.get('twitterCard');
            
            // 必須Twitterタグの存在確認
            for (const requiredTag of rules.required) {
                const test = {
                    name: `Required Twitter tag: ${requiredTag}`,
                    passed: false,
                    message: ''
                };
                
                if (twitterTags[requiredTag]) {
                    test.passed = true;
                    test.message = `✅ ${requiredTag} tag present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredTag} tag`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // Cardタイプの検証
            if (twitterTags['twitter:card']) {
                const cardTest = {
                    name: 'Twitter card type validation',
                    passed: false,
                    message: ''
                };
                
                const cardType = twitterTags['twitter:card'];
                if (rules.cardTypes.includes(cardType)) {
                    cardTest.passed = true;
                    cardTest.message = `✅ Valid card type: ${cardType}`;
                    results.passed++;
                } else {
                    cardTest.message = `❌ Invalid card type: ${cardType}`;
                    results.failed++;
                }
                
                results.tests.push(cardTest);
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateTwitterCardTags');
        }
    }

    /**
     * ソーシャルメディア最適化の検証
     * @returns {Promise<Object>}
     */
    async validateSocialMediaOptimization() {
        try {
            const results = {
                category: 'Social Media Optimization',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // 画像の最適化確認
            const socialImages = await this._extractSocialMediaImages();
            
            for (const [platform, imageUrl] of Object.entries(socialImages)) {
                if (imageUrl) {
                    const test = {
                        name: `${platform} image optimization`,
                        passed: false,
                        message: ''
                    };
                    
                    const isOptimized = await this._checkImageOptimization(imageUrl);
                    if (isOptimized) {
                        test.passed = true;
                        test.message = `✅ ${platform} image properly optimized`;
                        results.passed++;
                    } else {
                        test.message = `⚠️ ${platform} image could be optimized`;
                        results.warnings++;
                    }
                    
                    results.tests.push(test);
                }
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateSocialMediaOptimization');
        }
    }

    // プライベートメソッド
    
    /**
     * メタタグの抽出
     * @private
     */
    async _extractMetaTags() {
        // 実際の実装では document.head から抽出
        return {
            title: 'BubblePop - 泡割りゲーム',
            description: 'HTML5 Canvas を使用したバブルポップゲーム。18種類以上の特殊な泡を割って高スコアを目指そう！',
            charset: 'UTF-8',
            keywords: 'バブルポップ,ゲーム,HTML5,ブラウザゲーム,無料'
        };
    }
    
    /**
     * Open Graphタグの抽出
     * @private
     */
    async _extractOpenGraphTags() {
        return {
            'og:title': 'BubblePop - 泡割りゲーム',
            'og:description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'og:image': `${this.baseUrl}/assets/images/og-image.png`,
            'og:url': this.baseUrl,
            'og:type': 'website'
        };
    }
    
    /**
     * Twitter Cardタグの抽出
     * @private
     */
    async _extractTwitterCardTags() {
        return {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'BubblePop - 泡割りゲーム',
            'twitter:description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'twitter:image': `${this.baseUrl}/assets/images/twitter-card.png`
        };
    }
    
    /**
     * ソーシャルメディア画像の抽出
     * @private
     */
    async _extractSocialMediaImages() {
        return {
            'Open Graph': `${this.baseUrl}/assets/images/og-image.png`,
            'Twitter Card': `${this.baseUrl}/assets/images/twitter-card.png`,
            'LinkedIn': `${this.baseUrl}/assets/images/linkedin-share.png`
        };
    }
    
    /**
     * 画像URLの有効性確認
     * @private
     */
    _isValidImageUrl(url) {
        try {
            new URL(url);
            return url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) !== null;
        } catch {
            return false;
        }
    }
    
    /**
     * 画像最適化の確認
     * @private
     */
    async _checkImageOptimization(imageUrl) {
        // 実際の実装では画像のサイズやフォーマットをチェック
        return imageUrl.includes('optimized') || imageUrl.includes('webp');
    }
}