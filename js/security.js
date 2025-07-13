/**
 * =====================================================
 * SecurityManager - セキュリティ管理クラス
 * 
 * 機能:
 * - パスワードハッシュ化
 * - セッション管理
 * - ブラウザーフィンガープリント
 * - 不正アクセス検出
 * =====================================================
 */
class SecurityManager {
    /**
     * コンストラクタ - セキュリティ設定の初期化
     */
    constructor() {
        // 動的に生成される秘密鍵（ブラウザごとに異なる）
        this.secretKey = this.generateSecretKey();
        this.sessionDuration = 2 * 60 * 60 * 1000; // 2時間
    }

    /**
     * ブラウザ固有の秘密鍵を生成
     * @returns {string} - 動的生成された秘密鍵
     */
    generateSecretKey() {
        // ブラウザ固有の情報から秘密鍵を生成
        const browserInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: `${screen.width}x${screen.height}`,
            timestamp: Date.now()
        };
        
        // 既存の秘密鍵があれば使用、なければ新規生成
        let secretKey = localStorage.getItem('marathonSecretKey');
        if (!secretKey) {
            secretKey = btoa(JSON.stringify(browserInfo) + Math.random().toString(36));
            localStorage.setItem('marathonSecretKey', secretKey);
        }
        
        return secretKey;
    }

    /**
     * =====================================================
     * パスワード管理
     * =====================================================
     */
    
    /**
     * パスワードをハッシュ化
     * @param {string} password - 元のパスワード
     * @returns {Promise<string>} - ハッシュ化されたパスワード
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + this.secretKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // ブラウザーフィンガープリントを生成
    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            canvas: canvas.toDataURL(),
            memory: navigator.deviceMemory || 'unknown',
            cores: navigator.hardwareConcurrency || 'unknown'
        };
        
        return btoa(JSON.stringify(fingerprint));
    }

    // 管理者トークンを生成
    async generateAdminToken(password) {
        const hashedPassword = await this.hashPassword(password);
        const fingerprint = this.generateFingerprint();
        const timestamp = Date.now();
        
        const tokenData = {
            hash: hashedPassword,
            fingerprint: fingerprint,
            timestamp: timestamp,
            expires: timestamp + this.sessionDuration
        };
        
        return btoa(JSON.stringify(tokenData));
    }

    // トークンを検証
    async verifyAdminToken(token, password) {
        try {
            const tokenData = JSON.parse(atob(token));
            const currentTime = Date.now();
            
            // 有効期限チェック
            if (currentTime > tokenData.expires) {
                return { valid: false, reason: 'expired' };
            }
            
            // パスワードハッシュチェック
            const hashedPassword = await this.hashPassword(password);
            if (tokenData.hash !== hashedPassword) {
                return { valid: false, reason: 'invalid_password' };
            }
            
            // フィンガープリントチェック
            const currentFingerprint = this.generateFingerprint();
            if (tokenData.fingerprint !== currentFingerprint) {
                return { valid: false, reason: 'different_device' };
            }
            
            return { valid: true };
        } catch (error) {
            return { valid: false, reason: 'invalid_token' };
        }
    }

    // セッションを保存
    async saveSession(password) {
        const token = await this.generateAdminToken(password);
        localStorage.setItem('adminSession', token);
        return token;
    }

    // セッションを確認
    async checkSession() {
        const token = localStorage.getItem('adminSession');
        if (!token) return { valid: false, reason: 'no_session' };
        
        const adminPassword = localStorage.getItem('adminPassword');
        if (!adminPassword) return { valid: false, reason: 'no_password' };
        
        return await this.verifyAdminToken(token, adminPassword);
    }

    // セッションをクリア
    clearSession() {
        localStorage.removeItem('adminSession');
    }

    // データの整合性チェック
    async validateDataIntegrity() {
        const articles = localStorage.getItem('marathonArticles');
        const activities = localStorage.getItem('marathonActivities');
        
        if (!articles || !activities) return true;
        
        try {
            JSON.parse(articles);
            JSON.parse(activities);
            return true;
        } catch (error) {
            console.warn('Data integrity check failed:', error);
            return false;
        }
    }

    // 不正アクセス検出
    detectSuspiciousActivity() {
        const attempts = localStorage.getItem('failedAttempts');
        const attemptsCount = attempts ? parseInt(attempts) : 0;
        const lastAttempt = localStorage.getItem('lastFailedAttempt');
        
        if (attemptsCount >= 5) {
            const timeSinceLastAttempt = Date.now() - (lastAttempt ? parseInt(lastAttempt) : 0);
            const lockoutTime = 15 * 60 * 1000; // 15分
            
            if (timeSinceLastAttempt < lockoutTime) {
                const remainingTime = Math.ceil((lockoutTime - timeSinceLastAttempt) / 60000);
                return { locked: true, remainingMinutes: remainingTime };
            } else {
                // ロックアウト期間が過ぎたらリセット
                localStorage.removeItem('failedAttempts');
                localStorage.removeItem('lastFailedAttempt');
            }
        }
        
        return { locked: false };
    }

    // 失敗試行を記録
    recordFailedAttempt() {
        const attempts = localStorage.getItem('failedAttempts');
        const attemptsCount = attempts ? parseInt(attempts) + 1 : 1;
        
        localStorage.setItem('failedAttempts', attemptsCount.toString());
        localStorage.setItem('lastFailedAttempt', Date.now().toString());
    }

    // 成功時に失敗カウントをリセット
    resetFailedAttempts() {
        localStorage.removeItem('failedAttempts');
        localStorage.removeItem('lastFailedAttempt');
    }
}