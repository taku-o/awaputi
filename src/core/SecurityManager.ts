import { getErrorHandler } from '../utils/ErrorHandler.js';

// 型定義
interface EncryptionConfig { algorithm: string,
    keyLength: number,
    ivLength: number,
    tagLength: number,
    saltLength: number }
}

interface SecurityConfig { encryptionEnabled: boolean,
    integrityCheckEnabled: boolean,
    anonymizationEnabled: boolean,
    secureDeleteEnabled: boolean,
    auditLoggingEnabled: boolean }
}

interface SecurityStatistics { encryptionOperations: number,
    decryptionOperations: number,
    integrityChecks: number,
    integrityViolations: number,
    dataAnonymizations: number,
    secureDeletes: number,
    lastSecurityEvent: SecurityEvent | null }
}

interface SecurityEvent { type: string,
    timestamp: number,
    details: any,
    userAgent: string,
    sessionId: string }
}

interface EncryptionResult { success: boolean,
    data: any,
    metadata?: any;
    error?: string; }
}

interface DecryptionResult { success: boolean,
    data?: any;
    error?: string; }
}

interface IntegrityResult { isValid: boolean,
    expectedHash: string,
    actualHash: string,
    error?: string }
}

interface AnonymizationResult { success: boolean,
    data: any,
    error?: string }
}

interface SecureDeleteResult { success: boolean,
    operations?: number;
    error?: string; }
}

interface SecurityStatus { isEncryptionAvailable: boolean,
    config: SecurityConfig,
    statistics: SecurityStatistics,
    keyManagerStatus: any,
    lastSecurityEvent: SecurityEvent | null }
}

interface KeyManagerStatus { keysLoaded: number,
    saltGenerated: boolean }
}

/**
 * セキュリティ管理クラス - データ暗号化・改ざん検出・プライバシー保護
 * 
 * 責任:
 * - データ暗号化/復号化
 * - 改ざん検出
 * - プライバシー保護
 * - GDPR準拠機能
 */
export class SecurityManager {
    '';
    private version: string = '1.0.0';
    private encryptionConfig: EncryptionConfig;
    private config: SecurityConfig;
    private keyManager: KeyManager;
    private integrityChecker: IntegrityChecker;
    private privacyManager: PrivacyManager;
    private statistics: SecurityStatistics;
    private sessionId?: string;'
'';
    constructor(''';
            algorithm: 'AES-GCM',
            keyLength: 256,
            ivLength: 96,
            tagLength: 128,
            saltLength: 128 }
        },
        
        // セキュリティ設定
        this.config = { encryptionEnabled: false, // デフォルトでは無効
            integrityCheckEnabled: true,
            anonymizationEnabled: true,
            secureDeleteEnabled: true,
            auditLoggingEnabled: true })
        })
        // キー管理
        this.keyManager = new KeyManager(this);
        
        // 整合性チェック
        this.integrityChecker = new IntegrityChecker(this);
        
        // プライバシー管理
        this.privacyManager = new PrivacyManager(this);
        
        // セキュリティ統計
        this.statistics = { encryptionOperations: 0,
            decryptionOperations: 0,
            integrityChecks: 0,
            integrityViolations: 0,
            dataAnonymizations: 0,
            secureDeletes: 0,
            lastSecurityEvent: null }
        },
        
        this.initialize();
    }
    
    /**
     * SecurityManagerの初期化
     */
    async initialize() { try {
            // Web Crypto APIの利用可能性チェック
            if(!window.crypto || !window.crypto.subtle') {'
                '';
                console.warn('Web Crypto API not available, using fallback implementations');
            }
                this.config.encryptionEnabled = false; }
            }
            ';
            // キー管理の初期化
            await this.keyManager.initialize();'
            console.log('SecurityManager initialized');
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'SECURITY_MANAGER_INITIALIZATION_ERROR', {')'
                operation: 'initialize') }
            });
        }
    }
    
    /**
     * データの暗号化
     */
    async encryptData(data: any, options: any = {}): Promise<EncryptionResult> {'
        try {'
            if(!this.config.encryptionEnabled') {'
                return { success: false,'
            }'
                    error: 'Encryption is disabled', };
                    data: data // 暗号化なしで返す }
                },
            }
            
            this.statistics.encryptionOperations++;
            ;
            // データをJSON文字列に変換
            const plaintext = typeof data === 'string' ? data: JSON.stringify(data),
            ';
            // Web Crypto APIを使用した暗号化
            const result = await this.performEncryption(plaintext, options');'
            '';
            this.logSecurityEvent('ENCRYPTION', { dataSize: plaintext.length)
                algorithm: this.encryptionConfig.algorithm),
            
            return { success: true,
                data: result.encryptedData, };
                metadata: result.metadata }
            },
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'ENCRYPTION_ERROR', {')'
                operation: 'encryptData',);
                options); }
            });
            
            return { success: false,
                error: error.message, };
                data: data // フォールバック }
            },
        }
    }
    
    /**
     * データの復号化
     */
    async decryptData(encryptedData: any, metadata: any, options: any = {}): Promise<DecryptionResult> {
        try {
            if(!this.config.encryptionEnabled) {
                
            }
                return { success: true, };
                    data: encryptedData // 暗号化されていないデータとして返す }
                },
            }
            
            this.statistics.decryptionOperations++;
            
            // Web Crypto APIを使用した復号化
            const plaintext = await this.performDecryption(encryptedData, metadata, options);
            
            // JSONパース試行
            let data;
            try { data = JSON.parse(plaintext);' }'
            } catch (parseError) { data = plaintext; // 文字列として返す }
            }
            '';
            this.logSecurityEvent('DECRYPTION', { dataSize: plaintext.length)
                algorithm: metadata.algorithm || this.encryptionConfig.algorithm) }
            });
            
            return { success: true, };
                data }
            };
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'DECRYPTION_ERROR', {')'
                operation: 'decryptData',);
                options); }
            });
            
            return { success: false, };
                error: error.message }
            },
        }
    }
    
    /**
     * 暗号化の実行
     */
    private async performEncryption(plaintext: string, options: any = {}): Promise<any> {
        try {
            // キーの取得または生成
            const key = await this.keyManager.getEncryptionKey();
            
            // IVの生成
            const iv = window.crypto.getRandomValues(new Uint8Array(this.encryptionConfig.ivLength / 8);
            
            // データのエンコード
            const encoder = new TextEncoder();
            const data = encoder.encode(plaintext);
            
            // 暗号化の実行
            const encryptedBuffer = await window.crypto.subtle.encrypt(;
                {)
                    name: this.encryptionConfig.algorithm);
                    iv: iv,);
                    tagLength: this.encryptionConfig.tagLength),
                key,
                data;
            );
            
            // 結果の組み立て
            const encryptedArray = new Uint8Array(encryptedBuffer);
            const result = new Uint8Array(iv.length + encryptedArray.length);
            result.set(iv);
            result.set(encryptedArray, iv.length);
            
            // Base64エンコード
            const encryptedData = this.arrayBufferToBase64(result);
            
            const metadata = {
                algorithm: this.encryptionConfig.algorithm,
                keyLength: this.encryptionConfig.keyLength,
                ivLength: this.encryptionConfig.ivLength,
                tagLength: this.encryptionConfig.tagLength,
                timestamp: Date.now(),
                version: this.version }
            },
            
            return { encryptedData, metadata };
            '';
        } catch (error) { // フォールバック: Base64エンコードのみ
            console.warn('Encryption failed, using Base64 fallback:', error);'
            return { ''
                encryptedData: btoa(plaintext'),';
                metadata: {''
                    algorithm: 'BASE64',
                    fallback: true, };
                    timestamp: Date.now(); }
                }
            };
        }
    }
    
    /**
     * 復号化の実行'
     */''
    private async performDecryption(encryptedData: string, metadata: any, options: any = {})'): Promise<string> {
        try {
            // フォールバック形式のチェック
            if(metadata.algorithm === 'BASE64' || metadata.fallback) {
                
            }
                return atob(encryptedData); }
            }
            
            // キーの取得
            const key = await this.keyManager.getEncryptionKey();
            
            // Base64デコード
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
            const encryptedArray = new Uint8Array(encryptedBuffer);
            
            // IVの抽出
            const ivLength = metadata.ivLength / 8 || this.encryptionConfig.ivLength / 8;
            const iv = encryptedArray.slice(0, ivLength);
            const ciphertext = encryptedArray.slice(ivLength);
            
            // 復号化の実行
            const decryptedBuffer = await window.crypto.subtle.decrypt(;
                { name: metadata.algorithm || this.encryptionConfig.algorithm)
                    iv: iv,);
                    tagLength: metadata.tagLength || this.encryptionConfig.tagLength),
                key,
                ciphertext;
            );
            
            // テキストデコード
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
            ' }'
        } catch (error) { // フォールバック: Base64デコード
            console.warn('Decryption failed, trying Base64 fallback:', error);
            try {
                return atob(encryptedData); }
            } catch (base64Error) {
                throw new Error(`Decryption failed: ${error.message}`);
            }
        }
    }
    
    /**
     * データ整合性の計算
     */
    async calculateIntegrity(data: any): Promise<string> { try {
            this.statistics.integrityChecks++;
            
            return await this.integrityChecker.calculate(data);
             }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'INTEGRITY_CALCULATION_ERROR', {')'
                operation: 'calculateIntegrity') }
            });
            
            // フォールバック: シンプルハッシュ
            return this.simpleHash(JSON.stringify(data);
        }
    }
    
    /**
     * データ整合性の検証
     */
    async verifyIntegrity(data: any, expectedHash: string): Promise<IntegrityResult> { try {
            const actualHash = await this.calculateIntegrity(data);
            const isValid = actualHash === expectedHash;
            '';
            if(!isValid') {'
                this.statistics.integrityViolations++;''
                this.logSecurityEvent('INTEGRITY_VIOLATION', {)
                    expected: expectedHash,)
            }
                    actual: actualHash); }
            }
            
            return { isValid,
                expectedHash, };
                actualHash }
            };
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'INTEGRITY_VERIFICATION_ERROR', {')'
                operation: 'verifyIntegrity') }
            });
            
            return { isValid: false, };
                error: error.message }
            },
        }
    }
    
    /**
     * データの匿名化
     */
    async anonymizeData(data: any, options: any = {}): Promise<AnonymizationResult> {
        try {
            if (!this.config.anonymizationEnabled) { }
                return { success: true, data };
            }
            
            this.statistics.dataAnonymizations++;'
            '';
            const anonymizedData = await this.privacyManager.anonymize(data, options');'
            '';
            this.logSecurityEvent('ANONYMIZATION', { );
                originalSize: JSON.stringify(data).length,
                anonymizedSize: JSON.stringify(anonymizedData).length }
            }),
            
            return { success: true, };
                data: anonymizedData }
            },
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'ANONYMIZATION_ERROR', {')'
                operation: 'anonymizeData',);
                options); }
            });
            
            return { success: false,
                error: error.message, };
                data }
            };
        }
    }
    
    /**
     * GDPR準拠のデータ削除
     */'
    async secureDelete(dataKey: string): Promise<SecureDeleteResult> { try {'
            if (!this.config.secureDeleteEnabled') {' }'
                return { success: false, error: 'Secure delete is disabled' }
            }
            
            this.statistics.secureDeletes++;
            
            // 複数回の上書きによる安全な削除のシミュレーション
            const deleteOperations = [];
            
            // 1. データの無作為化（複数回）
            for (let i = 0; i < 3; i++) { deleteOperations.push(this.overwriteData(dataKey); }
            }
            
            // 2. メタデータの削除
            deleteOperations.push(this.deleteMetadata(dataKey);
            
            // 3. ガベージコレクションの要求
            if (window.gc) { window.gc(); }
            }
            '';
            await Promise.all(deleteOperations');'
            '';
            this.logSecurityEvent('SECURE_DELETE', { dataKey)
                operations: deleteOperations.length),
            
            return { success: true, };
                operations: deleteOperations.length }
            },
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'SECURE_DELETE_ERROR', {')'
                operation: 'secureDelete',);
                dataKey); }
            });
            
            return { success: false, };
                error: error.message }
            },
        }
    }
    
    /**
     * データの上書き（安全な削除用）
     */
    private async overwriteData(dataKey: string): Promise<boolean> { try {
            // ランダムデータで上書き
            const randomData = this.generateRandomData(1024);
            ';
            // LocalStorageの場合
            if(typeof Storage !== 'undefined') {
                localStorage.setItem(dataKey, randomData);
            }
                localStorage.removeItem(dataKey); }
            }
            ';'
            return true;''
        } catch (error) { ''
            console.warn('Data overwrite failed:', error);
            return false; }
        }
    }
    
    /**
     * メタデータの削除
     */
    private async deleteMetadata(dataKey: string): Promise<boolean> { try {
            // 関連するメタデータキーの削除
            const metadataKeys = [}
                `${dataKey}_metadata`,
                `${dataKey}_integrity`]
                `${dataKey}_timestamp`]
            ];
            
            metadataKeys.forEach(key => {  )
                try {); }
                    localStorage.removeItem(key); }
                } catch (error) {
                    console.warn(`Failed to delete metadata key ${key}:`, error);
                }
            });
            ';'
            return true;''
        } catch (error) { ''
            console.warn('Metadata deletion failed:', error);
            return false; }
        }
    }
    
    /**
     * ランダムデータの生成'
     */''
    private generateRandomData(length: number'): string { ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';''
        let result = '';
        
        for(let i = 0; i < length; i++) {
        
            
        
        }
            result += characters.charAt(Math.floor(Math.random() * characters.length)); }
        }
        
        return result;
    }
    
    /**
     * セキュリティイベントのログ記録
     */
    private logSecurityEvent(eventType: string, details: any): void { if (!this.config.auditLoggingEnabled) {
            return; }
        }
        
        const event = { type: eventType,
            timestamp: Date.now(),
            details,';
            userAgent: navigator.userAgent,'';
            sessionId: this.getSessionId()';
        console.log('Security Event:', event) }
    }
    
    /**
     * セッションIDの取得
     */
    private getSessionId(): string { if (!this.sessionId) {
            this.sessionId = this.generateRandomData(16); }
        }
        return this.sessionId;
    }
    
    /**
     * ArrayBufferをBase64に変換
     */'
    private arrayBufferToBase64(buffer: ArrayBuffer): string { ''
        const bytes = new Uint8Array(buffer');''
        let binary = '';
        for(let i = 0; i < bytes.byteLength; i++) {
            
        }
            binary += String.fromCharCode(bytes[i]); }
        }
        return btoa(binary);
    }
    
    /**
     * Base64をArrayBufferに変換
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer { const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for(let i = 0; i < binary.length; i++) {
            
        }
            bytes[i] = binary.charCodeAt(i); }
        }
        return bytes.buffer;
    }
    
    /**
     * シンプルハッシュ関数（フォールバック用）
     */
    private simpleHash(str: string): string { let hash = 0;
        if (str.length === 0) return hash.toString(16);
        
        for(let i = 0; i < str.length; i++) {
        
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
        
        }
            hash = hash & hash; // 32bit整数に変換 }
        }
        '';
        return Math.abs(hash).toString(16').padStart(8, '0');
    }
    
    /**
     * セキュリティ設定の更新'
     */''
    updateConfig(newConfig: Partial<SecurityConfig>'): void {
        this.config = { ...this.config, ...newConfig };
        ';
        // 暗号化の有効/無効化
        if ('encryptionEnabled' in newConfig') { ' }'
            console.log(`Encryption ${newConfig.encryptionEnabled ? 'enabled' : 'disabled')`});
        }
    }
    
    /**
     * セキュリティ状態の取得
     */
    getSecurityStatus(): SecurityStatus { return {  };
            isEncryptionAvailable: !!(window.crypto && window.crypto.subtle), }
            config: { ...this.config },
            statistics: { ...this.statistics },
            keyManagerStatus: this.keyManager.getStatus(),
            lastSecurityEvent: this.statistics.lastSecurityEvent;
        },
    }
    
    /**
     * リソースの解放
     */'
    destroy(): void { try {'
            this.keyManager.destroy()';
            console.log('SecurityManager destroyed');
             }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'SECURITY_MANAGER_DESTROY_ERROR', {')'
                operation: 'destroy') }
            });
        }
    }
}

/**
 * キー管理クラス
 */
class KeyManager { private securityManager: SecurityManager
    private keys: Map<string, CryptoKey>;
    private keyDerivationSalt: Uint8Array | null;
    constructor(securityManager: SecurityManager) {

        this.securityManager = securityManager;
        this.keys = new Map();

    }
    }
        this.keyDerivationSalt = null; }
    }
    
    async initialize(): Promise<void> { try {
            // ソルトの生成または読み込み
            this.keyDerivationSalt = await this.getOrCreateSalt();' }'
        } catch (error) { ''
            console.warn('Key manager initialization failed:', error) }
        }
    }'
    '';
    async getEncryptionKey(''';
        const keyId = 'default_encryption_key';
        );
        if(this.keys.has(keyId) { return this.keys.get(keyId)!; }
        }
        
        try { // キーの派生
            const key = await this.deriveKey();
            this.keys.set(keyId, key);
            return key; }
        } catch (error) {
            throw new Error(`Failed to get encryption key: ${error.message}`);
        }
    }
    
    private async deriveKey(): Promise<CryptoKey> { try {
            // ベースキーマテリアルの生成（ブラウザ固有）
            const baseKeyMaterial = await this.generateBaseKeyMaterial(''';
                    name: 'PBKDF2',
                    salt: this.keyDerivationSalt,';
                    iterations: 100000,'';
                    hash: 'SHA-256' }
                })
                baseKeyMaterial)';
                { ''
                    name: 'AES-GCM',)';
                    length: this.securityManager.encryptionConfig.keyLength)'';
                '),';
                false, // extractable;
                ['encrypt', 'decrypt'];
            );
            
            return key; }
        } catch (error) {
            throw new Error(`Key derivation failed: ${error.message}`);
        }
    }
    
    private async generateBaseKeyMaterial(): Promise<CryptoKey> { try {
            // ブラウザ固有の識別子を使用
            const identifier = navigator.userAgent + navigator.language + screen.width + screen.height;
            const encoder = new TextEncoder();''
            const data = encoder.encode(identifier');
            ';'
            return await window.crypto.subtle.importKey(')';
                'raw',')';
                data')'';
                { name: 'PBKDF2' '),'
                false,'';
                ['deriveKey'];
            ); }
        } catch (error) {
            throw new Error(`Base key material generation failed: ${error.message}`);
        }
    }'
    '';
    private async getOrCreateSalt()';
            const storedSalt = localStorage.getItem('_security_salt');
            if (storedSalt) { return this.base64ToUint8Array(storedSalt); }
            }
            ';
            // 新しいソルトを生成
            const salt = window.crypto.getRandomValues(new Uint8Array(this.securityManager.encryptionConfig.saltLength / 8)');''
            localStorage.setItem('_security_salt', this.uint8ArrayToBase64(salt);
            ';'
            return salt;''
        } catch (error) { // フォールバック: 固定ソルト
            console.warn('Failed to create salt, using fallback:', error);
            return new Uint8Array(16).fill(42); }
        }
    }'
    '';
    private uint8ArrayToBase64(array: Uint8Array'): string { ''
        let binary = '';
        for(let i = 0; i < array.byteLength; i++) {
            
        }
            binary += String.fromCharCode(array[i]); }
        }
        return btoa(binary);
    }
    
    private base64ToUint8Array(base64: string): Uint8Array { const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for(let i = 0; i < binary.length; i++) {
            
        }
            array[i] = binary.charCodeAt(i); }
        }
        return array;
    }
    
    getStatus(): KeyManagerStatus { return { keysLoaded: this.keys.size, };
            saltGenerated: !!this.keyDerivationSalt }
        },
    }
    
    destroy(): void { this.keys.clear();
        this.keyDerivationSalt = null; }
    }
}

/**
 * 整合性チェッククラス
 */
class IntegrityChecker { private securityManager: SecurityManager

    constructor(securityManager: SecurityManager) {
        this.securityManager = securityManager }
    }'
    '';
    async calculate(data: any'): Promise<string> { try {'
            const dataString = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort();
            
            // Web Crypto APIを使用したSHA-256
            if(window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();''
                const dataBuffer = encoder.encode(dataString');''
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);'
                const hashArray = Array.from(new Uint8Array(hashBuffer);'
            }'
                return hashArray.map(b => b.toString(16').padStart(2, '0')').join(); }
            }
            
            // フォールバック
            return this.securityManager.simpleHash(dataString);
            '';
        } catch (error) { ''
            console.warn('Integrity calculation failed:', error);
            return this.securityManager.simpleHash(JSON.stringify(data); }
        }
    }
}

/**
 * プライバシー管理クラス
 */
class PrivacyManager { private securityManager: SecurityManager

    constructor(securityManager: SecurityManager) {
        this.securityManager = securityManager }
    }
    
    async anonymize(data: any, options: any = {}): Promise<any> {
        try { }
            const anonymizedData = { ...data };
            
            // データタイプ別の匿名化
            if (data.username) { anonymizedData.username = this.anonymizeString(data.username); }
            }
            
            // IPアドレスやユーザーエージェントの除去
            delete anonymizedData.userAgent;
            delete anonymizedData.ipAddress;
            delete anonymizedData.sessionId;
            
            // タイムスタンプの粗い化（時間単位に丸める）
            if (data.timestamp) { anonymizedData.timestamp = Math.floor(data.timestamp / (60 * 60 * 1000) * (60 * 60 * 1000); }
            }
            
            // 統計データの場合は値の範囲化
            if (options.statisticsMode) { this.anonymizeStatistics(anonymizedData); }
            }
            
            return anonymizedData;
            '';
        } catch (error) { ''
            console.warn('Data anonymization failed:', error);
            return data; }
        }
    }
    ';'
    private anonymizeString(str: string): string { ''
        if (!str || str.length === 0') return '';
        ';
        // 最初と最後の文字を保持、中間をマスク
        if(str.length <= 2') {'
            ';'
        }'
            return '*'.repeat(str.length'); }
        }'
        '';
        return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
    }
    
    private anonymizeStatistics(data: any): void { // 数値を範囲に変換
        const ranges = {
            totalPlayTime: [0, 3600000, 7200000, 14400000, Infinity],
            totalGamesPlayed: [0, 10, 50, 100, 500, Infinity],
            totalBubblesPopped: [0, 100, 1000, 5000, 10000, Infinity] }
        };
        
        for(const [field, range] of Object.entries(ranges) {
        
            if (data[field] !== undefined) {
        
        }
                data[field] = this.valueToRange(data[field], range); }
            }
        }
    }
    ';'
    private valueToRange(value: number, ranges: number[]): string { for (let i = 0; i < ranges.length - 1; i++) {''
            if (value >= ranges[i] && value < ranges[i + 1]') {' }'
                return `${ranges[i]}-${ranges[i + 1] === Infinity ? '∞' : ranges[i + 1]}`;
            }'
        }''
        return 'unknown';'
    }''
}