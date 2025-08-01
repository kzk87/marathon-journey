class AuthManager {
    static async checkPassword() {
        const deviceAuth = new DeviceAuthManager();
        const security = new SecurityManager();
        
        // デバイス認証をまずチェック
        if (deviceAuth.isCurrentDeviceRegistered()) {
            const adminPassword = localStorage.getItem('adminPassword');
            if (adminPassword) {
                const authResult = await deviceAuth.checkDeviceAuth(adminPassword);
                if (authResult.valid) {
                    console.log('✅ デバイス認証済み:', authResult.deviceName);
                    return true;
                }
            }
        }
        
        // 従来のセッションチェック（互換性維持）
        const sessionCheck = await security.checkSession();
        if (sessionCheck.valid) {
            return true;
        }
        
        // 不正アクセス検出
        const suspiciousActivity = security.detectSuspiciousActivity();
        if (suspiciousActivity.locked) {
            alert(`セキュリティのため${suspiciousActivity.remainingMinutes}分間ロックされています。`);
            return false;
        }
        
        const adminPassword = localStorage.getItem('adminPassword');
        
        if (!adminPassword) {
            alert('管理者パスワードが設定されていません。管理ページでパスワードを設定してください。');
            window.location.href = 'admin.html';
            return false;
        }
        
        return new Promise((resolve) => {
            this.showPasswordModal(adminPassword, resolve, security, deviceAuth);
        });
    }
    
    static showPasswordModal(correctPassword, callback, security, deviceAuth) {
        const overlay = document.createElement('div');
        overlay.className = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-modal">
                <h3>管理者認証</h3>
                <div class="auth-error" id="authError" style="display: none;">
                    パスワードが正しくありません。
                </div>
                <form class="auth-form" id="authForm">
                    <div class="form-group">
                        <label for="authPassword">パスワード</label>
                        <input type="password" id="authPassword" required autofocus>
                    </div>
                    <div class="form-actions">
                        <button type="button" id="authCancel" class="cancel-btn">キャンセル</button>
                        <button type="submit" class="submit-btn">認証</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const authForm = document.getElementById('authForm');
        const authCancel = document.getElementById('authCancel');
        const authError = document.getElementById('authError');
        
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('authPassword').value;
            
            if (password === correctPassword) {
                // デバイス認証を登録
                if (deviceAuth) {
                    const registerResult = await deviceAuth.registerAdminDevice(password);
                    if (registerResult.success) {
                        console.log('✅ デバイス登録完了 - どの回線からでもアクセス可能になりました');
                    }
                }
                
                // 従来のセッションも保存（互換性維持）
                await security.saveSession(password);
                security.resetFailedAttempts();
                
                document.body.removeChild(overlay);
                callback(true);
            } else {
                security.recordFailedAttempt();
                authError.style.display = 'block';
                authError.textContent = 'パスワードが正しくありません。';
                document.getElementById('authPassword').value = '';
                document.getElementById('authPassword').focus();
                
                // 連続失敗チェック
                const suspiciousActivity = security.detectSuspiciousActivity();
                if (suspiciousActivity.locked) {
                    authError.textContent = `セキュリティのため${suspiciousActivity.remainingMinutes}分間ロックされました。`;
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        callback(false);
                    }, 2000);
                }
            }
        });
        
        authCancel.addEventListener('click', () => {
            document.body.removeChild(overlay);
            callback(false);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                callback(false);
            }
        });
    }
}