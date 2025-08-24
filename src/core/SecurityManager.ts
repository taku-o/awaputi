import { getErrorHandler } from '../utils/ErrorHandler.js';

// 型定義
interface EncryptionConfig {
    algorithm: string;
    keyLength: number;
    ivLength: number;
    tagLength: number;
    saltLength: number;
}

interface SecurityConfig {
    encryptionEnabled: boolean;
    integrityCheckEnabled: boolean;
    anonymizationEnabled: boolean;
    secureDeleteEnabled: boolean;
    auditLoggingEnabled: boolean;
}

interface SecurityStatistics {
    encryptionOperations: number;
    decryptionOperations: number;
    integrityChecks: number;
    integrityViolations: number;
    dataAnonymizations: number;
    secureDeletes: number;
    lastSecurityEvent: SecurityEvent | null;
}

interface SecurityEvent {
    type: string;
    timestamp: number;
    details: any;
    userAgent: string;
    sessionId: string;
}

interface EncryptionResult {
    success: boolean;
    data: any;
    metadata?: any;
    error?: string;
}

interface DecryptionResult {
    success: boolean;
    data?: any;
    error?: string;
}

interface IntegrityResult {
    isValid: boolean;
    expectedHash: string;
    actualHash: string;
    error?: string;
}

interface AnonymizationResult {
    success: boolean;
    data: any;
    error?: string;
}

interface SecureDeleteResult {
    success: boolean;
    operations?: number;
    error?: string;
}

interface SecurityStatus {
    isEncryptionAvailable: boolean;
    config: SecurityConfig;
    statistics: SecurityStatistics;
    keyManagerStatus: any;
    lastSecurityEvent: SecurityEvent | null;
}

interface KeyManagerStatus {
    keysLoaded: number;
    saltGenerated: boolean;
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
    private version: string = '1.0.0';
    private encryptionConfig: EncryptionConfig;
    private config: SecurityConfig;
    private keyManager: KeyManager;
    private integrityChecker: IntegrityChecker;
    private privacyManager: PrivacyManager;
    private statistics: SecurityStatistics;
    private sessionId?: string;

    constructor() {
        this.encryptionConfig = {
            algorithm: 'AES-GCM',
            keyLength: 256,
            ivLength: 96,
            tagLength: 128,
            saltLength: 128
        };
        
        // セキュリティ設定
        this.config = {
            encryptionEnabled: false, // デフォルトでは無効
            integrityCheckEnabled: true,
            anonymizationEnabled: true,
            secureDeleteEnabled: true,
            auditLoggingEnabled: true
        };
        
        // キー管理
        this.keyManager = new KeyManager(this);
        
        // 整合性チェック
        this.integrityChecker = new IntegrityChecker(this);
        
        // プライバシー管理
        this.privacyManager = new PrivacyManager(this);
        
        // セキュリティ統計
        this.statistics = {
            encryptionOperations: 0,
            decryptionOperations: 0,
            integrityChecks: 0,
            integrityViolations: 0,
            dataAnonymizations: 0,
            secureDeletes: 0,
            lastSecurityEvent: null
        };
        
        this.initialize();
    }
    
    /**
     * SecurityManagerの初期化
     */
    async initialize(): Promise<void> {
        try {
            // Web Crypto APIの利用可能性チェック
            if (!window.crypto || !window.crypto.subtle) {
                console.warn('Web Crypto API not available, using fallback implementations');
                this.config.encryptionEnabled = false;
            }
            
            // キー管理の初期化
            await this.keyManager.initialize();

            console.log('SecurityManager initialized');

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'SECURITY_MANAGER_INITIALIZATION_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * データの暗号化
     */
    async encryptData(data: any, options: any = {}): Promise<EncryptionResult> {
        try {
            if (!this.config.encryptionEnabled) {
                return {
                    success: false,
                    data: data, // 暗号化なしで返す
                    error: 'Encryption is disabled'
                };
            }
            
            this.statistics.encryptionOperations++;
            
            // データをJSON文字列に変換
            const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
            
            // Web Crypto APIを使用した暗号化
            const result = await this.performEncryption(plaintext, options);

            this.logSecurityEvent('ENCRYPTION', {
                dataSize: plaintext.length,
                algorithm: this.encryptionConfig.algorithm
            });
            
            return {
                success: true,
                data: result.encryptedData,
                metadata: result.metadata
            };

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'ENCRYPTION_ERROR', {
                operation: 'encryptData',
                options
            });
            
            return {
                success: false,
                data: null,
                error: (error as Error).message
            };
        }
    }
    
    /**
     * データの復号化
     */
    async decryptData(encryptedData: any, metadata: any = {}): Promise<DecryptionResult> {
        try {
            if (!this.config.encryptionEnabled) {
                return {
                    success: true,
                    data: encryptedData // 暗号化なしのデータをそのまま返す
                };
            }
            
            this.statistics.decryptionOperations++;
            
            const decryptedText = await this.performDecryption(encryptedData, metadata);
            
            // JSON形式の場合はパース
            let result;
            try {
                result = JSON.parse(decryptedText);
            } catch {
                result = decryptedText; // JSON以外の場合はそのまま
            }
            
            this.logSecurityEvent('DECRYPTION', {
                algorithm: this.encryptionConfig.algorithm
            });
            
            return {
                success: true,
                data: result
            };

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'DECRYPTION_ERROR', {
                operation: 'decryptData',
                metadata
            });
            
            return {
                success: false,
                error: (error as Error).message
            };
        }
    }
    
    /**
     * データの整合性チェック
     */
    async checkIntegrity(data: any, expectedHash: string): Promise<IntegrityResult> {
        try {
            if (!this.config.integrityCheckEnabled) {
                return {
                    isValid: true,
                    expectedHash,
                    actualHash: 'N/A',
                    error: 'Integrity check is disabled'
                };
            }
            
            this.statistics.integrityChecks++;
            
            const actualHash = await this.integrityChecker.calculate(data);
            const isValid = actualHash === expectedHash;
            
            if (!isValid) {
                this.statistics.integrityViolations++;
                this.logSecurityEvent('INTEGRITY_VIOLATION', {
                    expectedHash,
                    actualHash
                });
            }
            
            return {
                isValid,
                expectedHash,
                actualHash
            };

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'INTEGRITY_CHECK_ERROR', {
                operation: 'checkIntegrity'
            });
            
            return {
                isValid: false,
                expectedHash,
                actualHash: 'ERROR',
                error: (error as Error).message
            };
        }
    }
    
    /**
     * データの匿名化
     */
    async anonymizeData(data: any, options: any = {}): Promise<AnonymizationResult> {
        try {
            if (!this.config.anonymizationEnabled) {
                return {
                    success: true,
                    data: data,
                    error: 'Anonymization is disabled'
                };
            }
            
            this.statistics.dataAnonymizations++;
            
            const anonymizedData = await this.privacyManager.anonymize(data, options);
            
            this.logSecurityEvent('DATA_ANONYMIZATION', {
                fieldsAnonymized: Object.keys(options.fields || {}).length
            });
            
            return {
                success: true,
                data: anonymizedData
            };

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'ANONYMIZATION_ERROR', {
                operation: 'anonymizeData',
                options
            });
            
            return {
                success: false,
                data: null,
                error: (error as Error).message
            };
        }
    }
    
    /**
     * セキュアな削除
     */
    async secureDelete(key: string): Promise<SecureDeleteResult> {
        try {
            if (!this.config.secureDeleteEnabled) {
                // 通常の削除
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
                
                return {
                    success: true,
                    operations: 1
                };
            }
            
            this.statistics.secureDeletes++;
            
            // セキュアな削除の実装
            const operations = await this.performSecureDelete(key);
            
            this.logSecurityEvent('SECURE_DELETE', {
                key,
                operations
            });
            
            return {
                success: true,
                operations
            };

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'SECURE_DELETE_ERROR', {
                operation: 'secureDelete',
                key
            });
            
            return {
                success: false,
                error: (error as Error).message
            };
        }
    }
    
    /**
     * 暗号化の実行
     */
    private async performEncryption(plaintext: string, options: any): Promise<any> {
        try {
            if (!window.crypto || !window.crypto.subtle) {
                // フォールバック: 簡易暗号化
                return this.fallbackEncryption(plaintext);
            }
            
            const key = await this.keyManager.getEncryptionKey();
            const iv = window.crypto.getRandomValues(new Uint8Array(this.encryptionConfig.ivLength / 8));
            
            const encoder = new TextEncoder();
            const data = encoder.encode(plaintext);
            
            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                data
            );
            
            return {
                encryptedData: this.arrayBufferToBase64(encryptedData),
                metadata: {
                    iv: this.arrayBufferToBase64(iv.buffer),
                    algorithm: 'AES-GCM'
                }
            };

        } catch (error) {
            // フォールバック使用
            console.warn('Web Crypto encryption failed, using fallback:', error);
            return this.fallbackEncryption(plaintext);
        }
    }
    
    /**
     * 復号化の実行
     */
    private async performDecryption(encryptedData: string, metadata: any): Promise<string> {
        try {
            if (!window.crypto || !window.crypto.subtle || !metadata.iv) {
                // フォールバック: 簡易復号化
                return this.fallbackDecryption(encryptedData);
            }
            
            const key = await this.keyManager.getEncryptionKey();
            const iv = this.base64ToArrayBuffer(metadata.iv);
            const data = this.base64ToArrayBuffer(encryptedData);
            
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: new Uint8Array(iv)
                },
                key,
                data
            );
            
            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);

        } catch (error) {
            // フォールバック使用
            console.warn('Web Crypto decryption failed, using fallback:', error);
            return this.fallbackDecryption(encryptedData);
        }
    }
    
    /**
     * セキュアな削除の実行
     */
    private async performSecureDelete(key: string): Promise<number> {
        let operations = 0;
        
        // 複数回の上書き
        const overwriteData = this.generateRandomData(100);
        for (let i = 0; i < 3; i++) {
            localStorage.setItem(key, overwriteData + i);
            sessionStorage.setItem(key, overwriteData + i);
            operations++;
        }
        
        // 最終削除
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        operations++;
        
        return operations;
    }
    
    /**
     * フォールバック暗号化（XOR方式）
     */
    private fallbackEncryption(plaintext: string): any {
        const key = this.generateSimpleKey();
        let encrypted = '';
        
        for (let i = 0; i < plaintext.length; i++) {
            encrypted += String.fromCharCode(
                plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        
        return {
            encryptedData: btoa(encrypted),
            metadata: {
                algorithm: 'XOR',
                keyHint: this.simpleHash(key)
            }
        };
    }
    
    /**
     * フォールバック復号化（XOR方式）
     */
    private fallbackDecryption(encryptedData: string): string {
        try {
            const key = this.generateSimpleKey();
            const encrypted = atob(encryptedData);
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            
            return decrypted;
        } catch (error) {
            throw new Error('Fallback decryption failed');
        }
    }
    
    /**
     * 簡易キー生成
     */
    private generateSimpleKey(): string {
        // ブラウザ固有の値を使用
        const seed = navigator.userAgent + screen.width + screen.height;
        return this.simpleHash(seed);
    }
    
    /**
     * ランダムデータ生成
     */
    private generateRandomData(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        return result;
    }
    
    /**
     * セキュリティイベントのログ記録
     */
    private logSecurityEvent(eventType: string, details: any): void {
        if (!this.config.auditLoggingEnabled) {
            return;
        }
        
        const event: SecurityEvent = {
            type: eventType,
            timestamp: Date.now(),
            details,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };
        
        this.statistics.lastSecurityEvent = event;
        console.log('Security Event:', event);
    }
    
    /**
     * セッションIDの取得
     */
    private getSessionId(): string {
        if (!this.sessionId) {
            this.sessionId = this.generateRandomData(16);
        }
        return this.sessionId;
    }
    
    /**
     * ArrayBufferをBase64に変換
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    
    /**
     * Base64をArrayBufferに変換
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
    
    /**
     * シンプルハッシュ関数（フォールバック用）
     */
    private simpleHash(str: string): string {
        let hash = 0;
        if (str.length === 0) return hash.toString(16);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }

        return Math.abs(hash).toString(16).padStart(8, '0');
    }
    
    /**
     * セキュリティ設定の更新
     */
    updateConfig(newConfig: Partial<SecurityConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // 暗号化の有効/無効化
        if ('encryptionEnabled' in newConfig) {
            console.log(`Encryption ${newConfig.encryptionEnabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    /**
     * セキュリティ状態の取得
     */
    getSecurityStatus(): SecurityStatus {
        return {
            isEncryptionAvailable: !!(window.crypto && window.crypto.subtle),
            config: { ...this.config },
            statistics: { ...this.statistics },
            keyManagerStatus: this.keyManager.getStatus(),
            lastSecurityEvent: this.statistics.lastSecurityEvent
        };
    }
    
    /**
     * リソースの解放
     */
    destroy(): void {
        try {
            this.keyManager.destroy();
            console.log('SecurityManager destroyed');
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'SECURITY_MANAGER_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
    
    // encryptionConfigへの読み取りアクセスを提供
    get encryptionConfigRef(): EncryptionConfig {
        return this.encryptionConfig;
    }
}

/**
 * キー管理クラス
 */
class KeyManager {
    private securityManager: SecurityManager;
    private keys: Map<string, CryptoKey>;
    private keyDerivationSalt: Uint8Array | null;
    
    constructor(securityManager: SecurityManager) {
        this.securityManager = securityManager;
        this.keys = new Map();
        this.keyDerivationSalt = null;
    }
    
    async initialize(): Promise<void> {
        try {
            // ソルトの生成または読み込み
            this.keyDerivationSalt = await this.getOrCreateSalt();
        } catch (error) {
            console.warn('Key manager initialization failed:', error);
        }
    }

    async getEncryptionKey(): Promise<CryptoKey> {
        const keyId = 'default_encryption_key';
        
        if (this.keys.has(keyId)) {
            return this.keys.get(keyId)!;
        }
        
        try {
            // キーの派生
            const key = await this.deriveKey();
            this.keys.set(keyId, key);
            return key;
        } catch (error) {
            throw new Error(`Failed to get encryption key: ${(error as Error).message}`);
        }
    }
    
    private async deriveKey(): Promise<CryptoKey> {
        try {
            // ベースキーマテリアルの生成（ブラウザ固有）
            const baseKeyMaterial = await this.generateBaseKeyMaterial();
            
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.keyDerivationSalt!,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                baseKeyMaterial,
                {
                    name: 'AES-GCM',
                    length: this.securityManager.encryptionConfigRef.keyLength
                },
                false, // extractable
                ['encrypt', 'decrypt']
            );
            
            return key;
        } catch (error) {
            throw new Error(`Key derivation failed: ${(error as Error).message}`);
        }
    }
    
    private async generateBaseKeyMaterial(): Promise<CryptoKey> {
        try {
            // ブラウザ固有の識別子を使用
            const identifier = navigator.userAgent + navigator.language + screen.width + screen.height;
            const encoder = new TextEncoder();
            const data = encoder.encode(identifier);
            
            return await window.crypto.subtle.importKey(
                'raw',
                data,
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
        } catch (error) {
            throw new Error(`Base key material generation failed: ${(error as Error).message}`);
        }
    }

    private async getOrCreateSalt(): Promise<Uint8Array> {
        try {
            const storedSalt = localStorage.getItem('_security_salt');
            if (storedSalt) {
                return this.base64ToUint8Array(storedSalt);
            }
            
            // 新しいソルトを生成
            const salt = window.crypto.getRandomValues(new Uint8Array(this.securityManager.encryptionConfigRef.saltLength / 8));
            localStorage.setItem('_security_salt', this.uint8ArrayToBase64(salt));
            
            return salt;
        } catch (error) {
            // フォールバック: 固定ソルト
            console.warn('Failed to create salt, using fallback:', error);
            return new Uint8Array(16).fill(42);
        }
    }
    
    private uint8ArrayToBase64(array: Uint8Array): string {
        let binary = '';
        for (let i = 0; i < array.byteLength; i++) {
            binary += String.fromCharCode(array[i]);
        }
        return btoa(binary);
    }
    
    private base64ToUint8Array(base64: string): Uint8Array {
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        return array;
    }
    
    getStatus(): KeyManagerStatus {
        return {
            keysLoaded: this.keys.size,
            saltGenerated: !!this.keyDerivationSalt
        };
    }
    
    destroy(): void {
        this.keys.clear();
        this.keyDerivationSalt = null;
    }
}

/**
 * 整合性チェッククラス
 */
class IntegrityChecker {
    private securityManager: SecurityManager;

    constructor(securityManager: SecurityManager) {
        this.securityManager = securityManager;
    }

    async calculate(data: any): Promise<string> {
        try {
            const dataString = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
            
            // Web Crypto APIを使用したSHA-256
            if (window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(dataString);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            
            // フォールバック
            return (this.securityManager as any).simpleHash(dataString);

        } catch (error) {
            console.warn('Integrity calculation failed:', error);
            return (this.securityManager as any).simpleHash(JSON.stringify(data));
        }
    }
}

/**
 * プライバシー管理クラス
 */
class PrivacyManager {
    private securityManager: SecurityManager;

    constructor(securityManager: SecurityManager) {
        this.securityManager = securityManager;
    }
    
    async anonymize(data: any, options: any = {}): Promise<any> {
        try {
            const anonymizedData = { ...data };
            
            // フィールド指定がある場合
            if (options.fields) {
                for (const field of Object.keys(options.fields)) {
                    if (field in anonymizedData) {
                        anonymizedData[field] = this.anonymizeField(
                            anonymizedData[field],
                            options.fields[field]
                        );
                    }
                }
            }
            
            // デフォルトの匿名化ルール
            if (options.useDefaults !== false) {
                // IPアドレス
                if (anonymizedData.ip) {
                    anonymizedData.ip = this.anonymizeIP(anonymizedData.ip);
                }
                
                // メールアドレス
                if (anonymizedData.email) {
                    anonymizedData.email = this.anonymizeEmail(anonymizedData.email);
                }
                
                // ユーザー名
                if (anonymizedData.username) {
                    anonymizedData.username = this.anonymizeUsername(anonymizedData.username);
                }
            }
            
            return anonymizedData;
            
        } catch (error) {
            throw new Error(`Anonymization failed: ${(error as Error).message}`);
        }
    }
    
    private anonymizeField(value: any, method: string): any {
        switch (method) {
            case 'hash':
                return (this.securityManager as any).simpleHash(String(value));
            case 'mask':
                return this.maskString(String(value));
            case 'random':
                return (this.securityManager as any).generateRandomData(8);
            case 'remove':
                return undefined;
            default:
                return value;
        }
    }
    
    private anonymizeIP(ip: string): string {
        const parts = ip.split('.');
        if (parts.length === 4) {
            // IPv4: 最後のオクテットを0に
            return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
        return 'xxx.xxx.xxx.0';
    }
    
    private anonymizeEmail(email: string): string {
        const parts = email.split('@');
        if (parts.length === 2) {
            const username = parts[0];
            const domain = parts[1];
            return `${username.charAt(0)}***@${domain}`;
        }
        return '***@***.***';
    }
    
    private anonymizeUsername(username: string): string {
        if (username.length <= 3) {
            return '***';
        }
        return username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    }
    
    private maskString(str: string): string {
        if (str.length <= 4) {
            return '*'.repeat(str.length);
        }
        const visibleChars = Math.floor(str.length / 4);
        return str.substring(0, visibleChars) + 
               '*'.repeat(str.length - visibleChars * 2) + 
               str.substring(str.length - visibleChars);
    }
}