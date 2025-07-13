/**
 * 既存の不正管理者セッションを無効化
 */
class SessionInvalidator {
    constructor() {
        this.init();
    }

    init() {
        this.invalidateUnauthorizedSessions();
        this.setupSessionMonitoring();
    }

    /**
     * 不正なセッションを無効化
     */
    invalidateUnauthorizedSessions() {
        // セッション無効化のためのバージョン番号
        const CURRENT_SESSION_VERSION = '2025-01-14-security-fix';
        const storedVersion = localStorage.getItem('marathonSessionVersion');
        
        if (storedVersion !== CURRENT_SESSION_VERSION) {
            // 古いセッションデータをクリア
            const keysToRemove = [
                'adminSession',
                'adminPassword',
                'marathonSecretKey',
                'failedAttempts',
                'lastFailedAttempt'
            ];
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // 新しいセッションバージョンを設定
            localStorage.setItem('marathonSessionVersion', CURRENT_SESSION_VERSION);
            
            console.log('Security update: Previous admin sessions have been invalidated');
        }
    }

    /**
     * セッション監視の設定
     */
    setupSessionMonitoring() {
        // ページ離脱時に不正なセッション情報をクリア
        window.addEventListener('beforeunload', () => {
            const securityManager = new SecurityManager();
            const accessCheck = securityManager.validateAdminAccess();
            
            if (!accessCheck.allowed) {
                // 不正アクセスの場合はセッション情報をクリア
                localStorage.removeItem('adminSession');
                localStorage.removeItem('adminPassword');
            }
        });

        // 定期的なセッション検証（5分間隔）
        setInterval(() => {
            this.validateCurrentSession();
        }, 5 * 60 * 1000);
    }

    /**
     * 現在のセッションを検証
     */
    validateCurrentSession() {
        const securityManager = new SecurityManager();
        const accessCheck = securityManager.validateAdminAccess();
        
        if (!accessCheck.allowed && window.location.pathname.includes('admin.html')) {
            // 不正アクセスが検出された場合はホームページにリダイレクト
            window.location.href = 'index.html';
        }
    }

    /**
     * 管理者権限のリセット（デバッグ用）
     */
    static resetAdminRights() {
        const confirmReset = confirm('管理者権限をリセットしますか？\n注意: この操作により全ての管理者セッションが無効化されます。');
        
        if (confirmReset) {
            localStorage.clear();
            alert('管理者権限がリセットされました。ページを再読み込みしてください。');
            window.location.reload();
        }
    }
}

// 全ページで実行
document.addEventListener('DOMContentLoaded', () => {
    new SessionInvalidator();
});

// デバッグ用グローバル関数
window.resetAdminRights = SessionInvalidator.resetAdminRights;