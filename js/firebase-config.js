/**
 * Firebase設定ファイル
 * GitHub Pages用に最適化された設定
 */

// Firebase設定（GitHub Pages対応）
const firebaseConfig = {
  apiKey: "AIzaSyBu7xGtE9nWnpKcqhFgrdCNIXBkPP0Nalc",
  authDomain: "marathon-journey-eff35.firebaseapp.com",
  projectId: "marathon-journey-eff35",
  storageBucket: "marathon-journey-eff35.firebasestorage.app",
  messagingSenderId: "93744432557",
  appId: "1:93744432557:web:12d66af53787c098cf4d24",
  measurementId: "G-JRVKSJ4LLV"
};

// Firebase初期化
let app, db, analytics;

async function initializeFirebase() {
  try {
    // Firebase v9+ modular SDK を動的にインポート
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const { getFirestore, connectFirestoreEmulator } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js');
    
    // Firebase初期化
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Analytics初期化（オプション）
    if (typeof getAnalytics !== 'undefined') {
      analytics = getAnalytics(app);
    }
    
    console.log('✅ Firebase初期化完了');
    return { app, db, analytics };
    
  } catch (error) {
    console.error('❌ Firebase初期化エラー:', error);
    throw error;
  }
}

// グローバルに公開
window.initializeFirebase = initializeFirebase;
window.getFirebaseDB = () => db;