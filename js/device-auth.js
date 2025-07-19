/**
 * デバイス認証システム - ネットワーク非依存
 * どの回線からでも許可されたデバイスで管理可能
 */

class DeviceAuthManager {
    constructor() {
        this.sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7日間
    }

    /**
     * デバイス固有フィンガープリントを生成（ネットワーク情報除外）
     */
    generateDeviceFingerprint() {
        const deviceInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            memory: navigator.deviceMemory || 'unknown',
            cores: navigator.hardwareConcurrency || 'unknown',
            vendor: navigator.vendor || 'unknown'
        };
        
        return btoa(JSON.stringify(deviceInfo));
    }

    /**
     * デバイスを管理者として登録
     */
    async registerAdminDevice(password) {
        try {
            const deviceFingerprint = this.generateDeviceFingerprint();
            const hashedPassword = await this.hashPassword(password);
            
            // 既存の登録デバイス一覧を取得
            const registeredDevices = JSON.parse(localStorage.getItem('marathonAdminDevices')) || [];
            
            // 新しいデバイス情報
            const newDevice = {
                id: Date.now().toString(),
                fingerprint: deviceFingerprint,
                hashedPassword: hashedPassword,
                registeredAt: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
                deviceName: this.getDeviceName(),
                userAgent: navigator.userAgent.substring(0, 100) // 参考用
            };
            
            // 既存デバイスから同じフィンガープリントを削除（更新）
            const filteredDevices = registeredDevices.filter(d => d.fingerprint !== deviceFingerprint);
            filteredDevices.push(newDevice);
            
            // 最新5デバイスのみ保持
            if (filteredDevices.length > 5) {
                filteredDevices.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
                filteredDevices.splice(5);
            }
            
            localStorage.setItem('marathonAdminDevices', JSON.stringify(filteredDevices));
            localStorage.setItem('marathonCurrentDevice', deviceFingerprint);
            
            console.log('✅ デバイス登録完了:', newDevice.deviceName);
            return { success: true, deviceId: newDevice.id };
            
        } catch (error) {
            console.error('❌ デバイス登録エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * デバイス認証チェック
     */
    async checkDeviceAuth(password) {
        try {
            const deviceFingerprint = this.generateDeviceFingerprint();
            const hashedPassword = await this.hashPassword(password);
            const registeredDevices = JSON.parse(localStorage.getItem('marathonAdminDevices')) || [];
            
            // 現在のデバイスが登録済みかチェック
            const currentDevice = registeredDevices.find(d => d.fingerprint === deviceFingerprint);
            
            if (!currentDevice) {
                return { valid: false, reason: 'device_not_registered' };
            }
            
            // パスワード確認
            if (currentDevice.hashedPassword !== hashedPassword) {
                return { valid: false, reason: 'invalid_password' };
            }
            
            // 最終使用日時を更新
            currentDevice.lastUsed = new Date().toISOString();
            localStorage.setItem('marathonAdminDevices', JSON.stringify(registeredDevices));
            localStorage.setItem('marathonCurrentDevice', deviceFingerprint);
            
            console.log('✅ デバイス認証成功:', currentDevice.deviceName);
            return { valid: true, deviceName: currentDevice.deviceName };
            
        } catch (error) {
            console.error('❌ デバイス認証エラー:', error);
            return { valid: false, reason: 'auth_error' };
        }
    }

    /**
     * パスワードをハッシュ化
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'marathon2025device');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * デバイス名を生成
     */
    getDeviceName() {
        const ua = navigator.userAgent;
        let deviceName = 'Unknown Device';
        
        if (ua.includes('iPhone')) deviceName = 'iPhone';
        else if (ua.includes('iPad')) deviceName = 'iPad';
        else if (ua.includes('Android')) deviceName = 'Android Device';
        else if (ua.includes('Mac')) deviceName = 'Mac';
        else if (ua.includes('Windows')) deviceName = 'Windows PC';
        
        const browser = ua.includes('Safari') && !ua.includes('Chrome') ? 'Safari' :
                       ua.includes('Chrome') ? 'Chrome' :
                       ua.includes('Firefox') ? 'Firefox' : 'Browser';
        
        return `${deviceName} (${browser})`;
    }

    /**
     * 登録デバイス一覧を取得
     */
    getRegisteredDevices() {
        const devices = JSON.parse(localStorage.getItem('marathonAdminDevices')) || [];
        return devices.map(d => ({
            id: d.id,
            deviceName: d.deviceName,
            registeredAt: d.registeredAt,
            lastUsed: d.lastUsed,
            isCurrent: d.fingerprint === localStorage.getItem('marathonCurrentDevice')
        }));
    }

    /**
     * デバイスの登録を削除
     */
    removeDevice(deviceId) {
        const devices = JSON.parse(localStorage.getItem('marathonAdminDevices')) || [];
        const filteredDevices = devices.filter(d => d.id !== deviceId);
        localStorage.setItem('marathonAdminDevices', JSON.stringify(filteredDevices));
        
        console.log('✅ デバイス削除完了:', deviceId);
        return true;
    }

    /**
     * 全デバイス登録をリセット
     */
    resetAllDevices() {
        localStorage.removeItem('marathonAdminDevices');
        localStorage.removeItem('marathonCurrentDevice');
        console.log('✅ 全デバイス登録リセット完了');
    }

    /**
     * 現在のデバイスが登録済みかチェック
     */
    isCurrentDeviceRegistered() {
        const deviceFingerprint = this.generateDeviceFingerprint();
        const registeredDevices = JSON.parse(localStorage.getItem('marathonAdminDevices')) || [];
        return registeredDevices.some(d => d.fingerprint === deviceFingerprint);
    }
}

// グローバルに公開
window.DeviceAuthManager = DeviceAuthManager;

// 既存の認証システムとの互換性のため
window.resetAdminRights = () => {
    const deviceAuth = new DeviceAuthManager();
    const confirmReset = confirm('全てのデバイス登録をリセットしますか？\n注意: この操作により全ての管理者権限が無効化されます。');
    
    if (confirmReset) {
        deviceAuth.resetAllDevices();
        // 既存のlocalStorageもクリア
        localStorage.removeItem('adminSession');
        localStorage.removeItem('adminPassword');
        localStorage.removeItem('marathonSecretKey');
        localStorage.removeItem('marathonMasterAdmin');
        localStorage.removeItem('marathonAdminInitTime');
        
        alert('全デバイス登録がリセットされました。ページを再読み込みしてください。');
        window.location.reload();
    }
};