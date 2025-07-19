class AdminManager {
    constructor() {
        this.security = new SecurityManager();
        this.deviceAuth = new DeviceAuthManager();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        const passwordForm = document.getElementById('passwordForm');
        const exportBtn = document.getElementById('exportData');
        const clearBtn = document.getElementById('clearData');

        passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
        exportBtn.addEventListener('click', () => this.exportData());
        clearBtn.addEventListener('click', () => this.clearAllData());
    }

    async handlePasswordSubmit(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        const existingPassword = localStorage.getItem('adminPassword');
        
        // 既存パスワードがある場合は確認
        if (existingPassword && currentPassword !== existingPassword) {
            alert('現在のパスワードが正しくありません。');
            return;
        }
        
        // 新しいパスワードの確認
        if (newPassword !== confirmPassword) {
            alert('新しいパスワードと確認パスワードが一致しません。');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('パスワードは8文字以上で設定してください。');
            return;
        }
        
        // パスワード強度チェック
        if (!this.validatePasswordStrength(newPassword)) {
            alert('パスワードには英数字と記号を含めてください。');
            return;
        }
        
        // パスワードをハッシュ化して保存
        const hashedPassword = await this.security.hashPassword(newPassword);
        localStorage.setItem('adminPassword', newPassword); // 元のパスワードも保存（認証用）
        localStorage.setItem('adminPasswordHash', hashedPassword);
        
        // デバイス認証を登録（ネットワーク非依存）
        const deviceResult = await this.deviceAuth.registerAdminDevice(newPassword);
        if (deviceResult.success) {
            console.log('✅ デバイス認証登録完了 - どの回線からでもアクセス可能になりました');
        }
        
        // 従来のセッションも生成（互換性維持）
        await this.security.saveSession(newPassword);
        
        alert('パスワードが設定されました！\nこのデバイスはどの回線からでも管理者としてアクセス可能になりました。');
        document.getElementById('passwordForm').reset();
    }

    validatePasswordStrength(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return (hasUpperCase || hasLowerCase) && hasNumbers && (hasSpecialChar || password.length >= 12);
    }

    exportData() {
        const data = {
            articles: JSON.parse(localStorage.getItem('marathonArticles')) || [],
            activities: JSON.parse(localStorage.getItem('marathonActivities')) || [],
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marathon-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('データがエクスポートされました！');
    }

    clearAllData() {
        if (!confirm('すべてのデータ（記事、活動記録、コメント）を削除しますか？\nこの操作は取り消せません。')) {
            return;
        }
        
        if (!confirm('本当によろしいですか？すべてのデータが失われます。')) {
            return;
        }
        
        localStorage.removeItem('marathonArticles');
        localStorage.removeItem('marathonActivities');
        
        alert('すべてのデータが削除されました。');
        this.updateStats();
    }

    updateStats() {
        const articles = JSON.parse(localStorage.getItem('marathonArticles')) || [];
        const activities = JSON.parse(localStorage.getItem('marathonActivities')) || [];
        
        const commentCount = articles.reduce((total, article) => total + article.comments.length, 0);
        
        document.getElementById('articleCount').textContent = articles.length;
        document.getElementById('commentCount').textContent = commentCount;
        document.getElementById('activityCount').textContent = activities.length;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminManager();
});