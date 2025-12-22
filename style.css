// ========================================
// Firebase設定
// ========================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDPE7Lv9qxh1BqTvfESMcn1OlaI9pA-t-Q",
  authDomain: "newyearproject-8be53.firebaseapp.com",
  projectId: "newyearproject-8be53",
  storageBucket: "newyearproject-8be53.firebasestorage.app",
  messagingSenderId: "541999984164",
  appId: "1:541999984164:web: 7d2038d3e8cec6264572b1",
  measurementId: "G-14RNPP91J8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================================
// グローバル変数
// ========================================
const TARGET_DATE = new Date('2026-01-01T00:00:00').getTime();
let countdownInterval;
let hasReachedNewYear = false;

// ========================================
// 画面要素取得
// ========================================
const countdownScreen = document.getElementById('countdown-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const mainScreen = document.getElementById('main-screen');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const resolutionInput = document.getElementById('resolution-input');
const charCountEl = document.getElementById('char-count');
const submitBtn = document. getElementById('submit-btn');
const submitMessage = document.getElementById('submit-message');

const omikujiSection = document.getElementById('omikuji-section');
const omikujiBtn = document.getElementById('omikuji-btn');
const omikujiResult = document.getElementById('omikuji-result');

const balloonsContainer = document.getElementById('balloons-container');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalClose = document. getElementById('modal-close');

// ========================================
// カウントダウン処理
// ========================================
function updateCountdown() {
  const now = new Date().getTime();
  const distance = TARGET_DATE - now;

  if (distance <= 0 && !hasReachedNewYear) {
    clearInterval(countdownInterval);
    hasReachedNewYear = true;
    showCelebration();
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

// ========================================
// 年越し演出
// ========================================
function showCelebration() {
  countdownScreen.classList.remove('active');
  celebrationScreen.classList.add('active');

  // 花火生成
  const fireworksContainer = document.getElementById('fireworks');
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const firework = document.createElement('div');
      firework.className = 'firework';
      firework.style.left = Math. random() * 100 + '%';
      firework.style. top = Math.random() * 60 + '%';
      firework.style. background = `hsl(${Math.random() * 360}, 100%, 60%)`;
      fireworksContainer.appendChild(firework);
      
      setTimeout(() => firework.remove(), 1000);
    }, i * 200);
  }

  // 紙吹雪生成
  const confettiContainer = document.getElementById('confetti');
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = `hsl(${Math.random() * 360}, 100%, 70%)`;
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confettiContainer.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }, i * 10);
  }

  // 3秒後にメイン画面へ
  setTimeout(() => {
    celebrationScreen.classList.remove('active');
    mainScreen.classList. add('active');
    loadBalloons();
  }, 3000);
}

// ========================================
// 抱負送信処理
// ========================================
resolutionInput.addEventListener('input', () => {
  charCountEl.textContent = resolutionInput.value.length;
});

submitBtn.addEventListener('click', async () => {
  const text = resolutionInput.value. trim();
  
  if (!text) {
    submitMessage.textContent = '抱負を入力してください';
    submitMessage.style.color = '#e74c3c';
    return;
  }

  if (text.length > 40) {
    submitMessage.textContent = '40文字以内で入力してください';
    submitMessage.style.color = '#e74c3c';
    return;
  }

  // LocalStorageで投稿回数チェック
  const postCount = parseInt(localStorage.getItem('postCount') || '0');
  if (postCount >= 2) {
    submitMessage.textContent = '投稿は2回までです';
    submitMessage.style.color = '#e74c3c';
    return;
  }

  submitBtn.disabled = true;
  submitMessage.textContent = '送信中...';
  submitMessage.style.color = '#3498db';

  try {
    await addDoc(collection(db, 'resolutions'), {
      text: text,
      createdAt: serverTimestamp()
    });

    localStorage.setItem('postCount', String(postCount + 1));
    
    submitMessage.textContent = '✨ 抱負を送信しました！';
    submitMessage.style.color = '#27ae60';
    resolutionInput.value = '';
    charCountEl.textContent = '0';
    
    // おみくじ表示
    omikujiSection.classList.remove('hidden');
    
    // バルーン再読み込み
    loadBalloons();
    
    if (postCount + 1 >= 2) {
      submitBtn.disabled = true;
      submitBtn.textContent = '投稿完了';
    } else {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitMessage. textContent = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Error adding document:', error);
    submitMessage.textContent = 'エラーが発生しました';
    submitMessage.style.color = '#e74c3c';
    submitBtn.disabled = false;
  }
});

// ========================================
// バルーン表示
// ========================================
async function loadBalloons() {
  try {
    const q = query(collection(db, 'resolutions'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    balloonsContainer.innerHTML = '';
    
    querySnapshot.forEach((document) => {
      const data = document.data();
      createBalloon(data. text);
    });
  } catch (error) {
    console.error('Error loading balloons:', error);
  }
}

function createBalloon(text) {
  const balloon = document.createElement('div');
  balloon.className = 'balloon';

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // 左右どちらに出すか
  const side = Math.random() < 0.5 ? 'left' : 'right';

  // 中央を避けるための余白
  const margin = screenW * 0.25; // 25%空ける

  let x;
  if (side === 'left') {
    x = Math.random() * (margin - 80);
  } else {
    x = screenW - margin + Math.random() * (margin - 80);
  }

  const y = Math.random() * (screenH - 120);

  balloon.style.left = `${x}px`;
  balloon.style.top = `${y}px`;

  // 色（radial-gradientを設定）
  const hue = Math.random() * 360;
  balloon.style. background = `radial-gradient(circle at 30% 30%, hsla(${hue}, 80%, 85%, 0.9), hsla(${hue}, 80%, 60%, 0.75))`;

  // 透け感
  balloon.style.opacity = (0.75 + Math.random() * 0.25).toFixed(2);

  // アニメーション個体差
  balloon.style.animationDelay = `${Math.random() * 5}s`;
  balloon.style.animationDuration = `${12 + Math.random() * 10}s`;

  // クリックイベント
  balloon.addEventListener('click', () => {
    modalText.textContent = text;
    modal.classList.remove('hidden');
  });

  balloonsContainer.appendChild(balloon);
}

// モーダル閉じる
modalClose.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
  if (e. target === modal) {
    modal.classList.add('hidden');
  }
});

// ========================================
// おみくじ機能
// ========================================
omikujiBtn.addEventListener('click', () => {
  if (localStorage.getItem('omikujiDrawn')) {
    alert('おみくじは1回までです');
    return;
  }

  const fortunes = [
    { level: '大吉', message: '素晴らしい一年になるでしょう！夢に向かって突き進む年です。' },
    { level: '中吉', message: '良いことがたくさん訪れます。前向きな気持ちを大切に。' },
    { level: '小吉', message: '小さな幸せが積み重なる年。感謝の心を忘れずに。' },
    { level: '吉', message: '穏やかで心地よい一年。周りの人を大切にしましょう。' },
    { level: '末吉', message: '努力が実を結ぶ年。焦らずコツコツと進みましょう。' },
    { level: '凶', message: '試練を乗り越えた先に成長があります。諦めない心が大切です。' }
  ];

  const result = fortunes[Math.floor(Math. random() * fortunes.length)];
  
  omikujiResult.innerHTML = `
    <h3>${result.level}</h3>
    <p>${result.message}</p>
  `;
  omikujiResult.classList.remove('hidden');
  
  localStorage.setItem('omikujiDrawn', 'true');
  omikujiBtn.disabled = true;
  omikujiBtn.textContent = 'おみくじ済み';
});

// ========================================
// 初期化処理
// ========================================
function init() {
  const now = new Date().getTime();
  
  if (now >= TARGET_DATE) {
    // 既に年越し済み
    hasReachedNewYear = true;
    countdownScreen.classList.remove('active');
    mainScreen.classList.add('active');
    loadBalloons();
  } else {
    // カウントダウン開始
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }
}

init();

// ========================================
// デバッグ用コンソールコマンド
// ========================================

// コンソールから triggerNewYear() で年越し演出を発火
window.triggerNewYear = function() {
  console.log('🎉 年越し演出を開始します！');
  clearInterval(countdownInterval);
  hasReachedNewYear = true;
  showCelebration();
};

// コンソールから skipToMain() でメイン画面に直接移動
window.skipToMain = function() {
  console.log('📝 メイン画面にスキップします');
  clearInterval(countdownInterval);
  hasReachedNewYear = true;
  countdownScreen.classList.remove('active');
  celebrationScreen.classList.remove('active');
  mainScreen.classList.add('active');
  loadBalloons();
};

// コンソールから resetTest() でテストをリセット
window.resetTest = function() {
  console.log('🔄 テストデータをリセットします');
  localStorage.removeItem('postCount');
  localStorage.removeItem('omikujiDrawn');
  location.reload();
};

// コンソールから clearResolutions() でFirestoreの抱負を全削除
window.clearResolutions = async function() {
  const confirmed = confirm('⚠️ Firestoreの全抱負データを削除しますか？');
  if (!confirmed) {
    console.log('❌ キャンセルしました');
    return;
  }
  
  console.log('🗑️ 抱負データを削除中...');
  
  try {
    const q = query(collection(db, 'resolutions'));
    const querySnapshot = await getDocs(q);
    
    let deleteCount = 0;
    const deletePromises = [];
    
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, 'resolutions', document.id)));
      deleteCount++;
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ ${deleteCount}件の抱負を削除しました`);
    
    // バルーンを再読み込み
    balloonsContainer.innerHTML = '';
    
    alert(`${deleteCount}件の抱負を削除しました`);
  } catch (error) {
    console.error('❌ 削除エラー:', error);
    alert('削除に失敗しました:  ' + error.message);
  }
};

// 使い方をコンソールに表示
console.log(`
🎊 年越しアプリ - デバッグコマンド
================================
triggerNewYear()      - 年越し演出を発火
skipToMain()          - メイン画面に直接移動
resetTest()           - LocalStorageをリセットして再読み込み
clearResolutions()    - Firestoreの全抱負データを削除
================================
`);
