/**
 * MetaTagAnalyzer - メタタグ分析システム
 * 
 * メタタグチェック、アラート検証、抽出処理を専門的に管理します
 */
export class MetaTagAnalyzer {
    constructor(thresholds) {
        this.thresholds = thresholds;
    }
    
    /**
     * メタタグのチェック
     */
    async checkMetaTags() {
        try {
            const metaTags = {
                title: this.extractTitleTag(),
                description: this.extractDescriptionTag(),
                keywords: this.extractKeywordsTag(),
                ogTags: this.extractOGTags(),
                twitterTags: this.extractTwitterTags(),
                timestamp: new Date().toISOString()
            };
            
            return metaTags;
            
        } catch (error) {
            console.error('Failed to check meta tags', error);
            return null;
        }
    }
    
    /**
     * メタタグアラートのチェック
     */
    checkMetaTagAlerts(metaTags, alerts) {
        if (!metaTags) return;
        
        // タイトル長のチェック
        if (metaTags.title) {
            const titleLength = metaTags.title.length;
            const { min, max } = this.thresholds.metaTags.titleLength;
            
            if (titleLength < min || titleLength > max) {
                alerts.push({
                    type: 'metaTags',
                    severity: 'warning',
                    metric: 'title_length',
                    current: titleLength,
                    threshold: `${min}-${max}`,
                    message: `Title length (${titleLength}) is outside optimal range (${min}-${max})`,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            alerts.push({
                type: 'metaTags',
                severity: 'critical',
                metric: 'title_missing',
                message: 'Title tag is missing',
                timestamp: new Date().toISOString()
            });
        }
        
        // 説明文長のチェック
        if (metaTags.description) {
            const descLength = metaTags.description.length;
            const { min, max } = this.thresholds.metaTags.descriptionLength;
            
            if (descLength < min || descLength > max) {
                alerts.push({
                    type: 'metaTags',
                    severity: 'warning',
                    metric: 'description_length',
                    current: descLength,
                    threshold: `${min}-${max}`,
                    message: `Description length (${descLength}) is outside optimal range (${min}-${max})`,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            alerts.push({
                type: 'metaTags',
                severity: 'critical',
                metric: 'description_missing',
                message: 'Description meta tag is missing',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * タイトルタグの抽出
     */
    extractTitleTag() {
        if (typeof document !== 'undefined') {
            return document.title || null;
        }
        return 'BubblePop - 泡割りゲーム'; // モックデータ
    }
    
    /**
     * 説明メタタグの抽出
     */
    extractDescriptionTag() {
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') : null;
        }
        return 'HTML5 Canvas を使用したバブルポップゲーム'; // モックデータ
    }
    
    /**
     * キーワードメタタグの抽出
     */
    extractKeywordsTag() {
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="keywords"]');
            return meta ? meta.getAttribute('content') : null;
        }
        return 'バブルポップ,ゲーム,HTML5'; // モックデータ
    }
    
    /**
     * Open Graphタグの抽出
     */
    extractOGTags() {
        const ogTags = {};
        
        if (typeof document !== 'undefined') {
            const ogMetas = document.querySelectorAll('meta[property^="og:"]');
            ogMetas.forEach(meta => {
                const property = meta.getAttribute('property');
                const content = meta.getAttribute('content');
                if (property && content) {
                    ogTags[property] = content;
                }
            });
        }
        
        return Object.keys(ogTags).length > 0 ? ogTags : {
            'og:title': 'BubblePop',
            'og:description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'og:type': 'website'
        };
    }
    
    /**
     * Twitterタグの抽出
     */
    extractTwitterTags() {
        const twitterTags = {};
        
        if (typeof document !== 'undefined') {
            const twitterMetas = document.querySelectorAll('meta[name^="twitter:"]');
            twitterMetas.forEach(meta => {
                const name = meta.getAttribute('name');
                const content = meta.getAttribute('content');
                if (name && content) {
                    twitterTags[name] = content;
                }
            });
        }
        
        return Object.keys(twitterTags).length > 0 ? twitterTags : {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'BubblePop',
            'twitter:description': 'HTML5 Canvas を使用したバブルポップゲーム'
        };
    }
}