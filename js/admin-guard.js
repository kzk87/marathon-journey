/**
 * 管理者ページアクセス制御
 */
class AdminGuard {
    constructor() {
        this.securityManager = new SecurityManager();
        this.init();
    }

    init() {
        this.checkAdminAccess();
    }

    checkAdminAccess() {
        const accessCheck = this.securityManager.validateAdminAccess();
        
        if (!accessCheck.allowed) {
            this.blockAccess(accessCheck.reason);
            return;
        }

        if (accessCheck.reason === 'initial_setup') {
            this.showInitialSetupMessage();
        }

        // アクセス許可の場合は管理者フラグを設定
        this.securityManager.initializeMasterAdmin();
    }

    blockAccess(reason) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: 'Noto Sans JP', sans-serif;
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 500px;
                    width: 100%;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">🚫</div>
                    <h1 style="color: #e74c3c; margin: 0 0 20px 0; font-size: 24px;">アクセス拒否</h1>
                    <p style="color: #666; margin: 0 0 30px 0; line-height: 1.6;">
                        この管理者ページは既に設定済みです。<br>
                        サイト所有者のみがアクセス可能です。
                    </p>
                    <div style="
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-left: 4px solid #e74c3c;
                    ">
                        <p style="margin: 0; color: #555; font-size: 14px;">
                            <strong>理由:</strong> ${this.getReasonMessage(reason)}
                        </p>
                    </div>
                    <a href="index.html" style="
                        display: inline-block;
                        background: #3498db;
                        color: white;
                        text-decoration: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-weight: bold;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#2980b9'" onmouseout="this.style.background='#3498db'">
                        ホームページに戻る
                    </a>
                </div>
            </div>
        `;
    }

    showInitialSetupMessage() {
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-family: 'Noto Sans JP', sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        banner.innerHTML = `
            <div style="font-size: 14px; font-weight: bold;">
                ✅ あなたが管理者として認証されました - このブラウザでのみ管理機能が利用可能です
            </div>
        `;
        document.body.appendChild(banner);

        // 5秒後にバナーを削除
        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 5000);
    }

    getReasonMessage(reason) {
        switch (reason) {
            case 'unauthorized_access':
                return '他のユーザーによって既に管理者設定が完了しています';
            case 'expired_session':
                return '管理者セッションの有効期限が切れています';
            default:
                return '不正なアクセスが検出されました';
        }
    }
}

// 管理者ページでのみ実行
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new AdminGuard();
    });
}