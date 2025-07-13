/**
 * =====================================================
 * MarathonTracker - メインアプリケーションクラス
 * 
 * 機能:
 * - カウントダウン表示
 * - 活動記録管理
 * - 統計情報計算
 * - データの永続化
 * =====================================================
 */
class MarathonTracker {
    /**
     * コンストラクタ - 初期化処理
     */
    constructor() {
        this.activities = JSON.parse(localStorage.getItem('marathonActivities')) || [];
        this.targetDate = new Date('2025-12-21T09:00:00'); // 本番日時
        this.init();
    }

    /**
     * 初期化メソッド - 各機能をセットアップ
     */
    init() {
        this.setupEventListeners();
        this.startCountdown();
        this.setTodayDate();
        this.displayActivities();
        this.updateStats();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        const form = document.getElementById('activityForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    /**
     * 今日の日付を自動設定
     */
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('activityDate').value = today;
    }

    /**
     * =====================================================
     * カウントダウン機能
     * =====================================================
     */
    
    /**
     * カウントダウンタイマーを開始
     */
    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date().getTime();
        const targetTime = this.targetDate.getTime();
        const difference = targetTime - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '0';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }

    // フォーム送信処理
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            date: document.getElementById('activityDate').value,
            distance: parseFloat(document.getElementById('distance').value) || 0,
            duration: document.getElementById('duration').value || '',
            type: document.getElementById('activityType').value,
            notes: document.getElementById('notes').value || ''
        };

        this.addActivity(formData);
        this.clearForm();
    }

    addActivity(activity) {
        this.activities.unshift(activity);
        this.saveActivities();
        this.displayActivities();
        this.updateStats();
    }

    saveActivities() {
        localStorage.setItem('marathonActivities', JSON.stringify(this.activities));
    }

    clearForm() {
        document.getElementById('activityForm').reset();
        this.setTodayDate();
    }

    // 活動一覧表示
    displayActivities() {
        const container = document.getElementById('activitiesList');
        
        if (this.activities.length === 0) {
            container.innerHTML = '<div class="empty-state">まだ活動記録がありません。最初の記録を追加してみましょう！</div>';
            return;
        }

        const recentActivities = this.activities.slice(0, 10);
        const activitiesHTML = recentActivities.map(activity => this.createActivityHTML(activity)).join('');
        container.innerHTML = activitiesHTML;
    }

    createActivityHTML(activity) {
        const activityTypeLabels = {
            'easy-run': 'イージーラン',
            'long-run': 'ロングラン',
            'interval': 'インターバル',
            'tempo': 'テンポラン',
            'recovery': 'リカバリーラン',
            'other': 'その他'
        };

        const formattedDate = this.formatDate(activity.date);
        const typeLabel = activityTypeLabels[activity.type] || activity.type;
        const pace = activity.distance > 0 && activity.duration ? this.calculatePace(activity.distance, activity.duration) : null;

        return `
            <div class="activity-item">
                <div class="activity-date">${formattedDate}</div>
                <div class="activity-info">
                    <div class="activity-type">${typeLabel}</div>
                    <div class="activity-details">
                        ${activity.duration ? `時間: ${activity.duration}` : ''}
                        ${pace ? ` | ペース: ${pace}` : ''}
                        ${activity.notes ? ` | ${activity.notes}` : ''}
                    </div>
                </div>
                <div class="activity-distance">${activity.distance}km</div>
            </div>
        `;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { 
            month: 'short', 
            day: 'numeric',
            weekday: 'short'
        };
        return date.toLocaleDateString('ja-JP', options);
    }

    calculatePace(distance, timeStr) {
        if (!timeStr || !distance) return null;
        
        const timeParts = timeStr.split(':');
        let totalMinutes = 0;
        
        if (timeParts.length === 2) {
            totalMinutes = parseInt(timeParts[0]) + parseInt(timeParts[1]) / 60;
        } else if (timeParts.length === 3) {
            totalMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]) + parseInt(timeParts[2]) / 60;
        }
        
        const paceMinutes = totalMinutes / distance;
        const minutes = Math.floor(paceMinutes);
        const seconds = Math.round((paceMinutes - minutes) * 60);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
    }

    // 統計情報更新
    updateStats() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // 今月の活動をフィルタ
        const thisMonthActivities = this.activities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate.getMonth() === currentMonth && 
                   activityDate.getFullYear() === currentYear;
        });

        // 統計計算
        const monthlyDistance = thisMonthActivities.reduce((sum, activity) => sum + activity.distance, 0);
        const totalDistance = this.activities.reduce((sum, activity) => sum + activity.distance, 0);
        const monthlyRuns = thisMonthActivities.length;
        
        // 平均ペース計算（今月の有効な記録から）
        const validPaceActivities = thisMonthActivities.filter(activity => 
            activity.distance > 0 && activity.duration
        );
        
        let averagePace = '0:00/km';
        if (validPaceActivities.length > 0) {
            const totalPaceMinutes = validPaceActivities.reduce((sum, activity) => {
                const pace = this.calculatePaceInMinutes(activity.distance, activity.duration);
                return sum + pace;
            }, 0);
            
            const avgPaceMinutes = totalPaceMinutes / validPaceActivities.length;
            const minutes = Math.floor(avgPaceMinutes);
            const seconds = Math.round((avgPaceMinutes - minutes) * 60);
            averagePace = `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
        }

        // DOM更新
        document.getElementById('monthlyDistance').textContent = `${monthlyDistance.toFixed(1)} km`;
        document.getElementById('totalDistance').textContent = `${totalDistance.toFixed(1)} km`;
        document.getElementById('monthlyRuns').textContent = `${monthlyRuns} 回`;
        document.getElementById('averagePace').textContent = averagePace;
    }

    calculatePaceInMinutes(distance, timeStr) {
        if (!timeStr || !distance) return 0;
        
        const timeParts = timeStr.split(':');
        let totalMinutes = 0;
        
        if (timeParts.length === 2) {
            totalMinutes = parseInt(timeParts[0]) + parseInt(timeParts[1]) / 60;
        } else if (timeParts.length === 3) {
            totalMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]) + parseInt(timeParts[2]) / 60;
        }
        
        return totalMinutes / distance;
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    new MarathonTracker();
});