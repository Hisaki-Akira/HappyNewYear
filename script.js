import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPE7Lv9qxh1BqTvfESMcn1OlaI9pA-t-Q",
  authDomain: "newyearproject-8be53.firebaseapp.com",
  projectId: "newyearproject-8be53"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TARGET_DATE = new Date("2026-01-01T00:00:00").getTime();
const RESOLUTION_LIMIT = 2;
const RESOLUTION_COUNT_KEY = "ny2026_resolution_count";
const OMIKUJI_DONE_KEY = "ny2026_omikuji_done";

const countdownScreen = document.getElementById("countdown-screen");
const celebrationScreen = document.getElementById("celebration-screen");
const mainScreen = document.getElementById("main-screen");

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const balloonsContainer = document.getElementById("balloons-container");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const modalClose = document.getElementById("modal-close");

const resolutionInput = document.getElementById("resolution-input");
const charCountEl = document.getElementById("char-count");
const submitBtn = document.getElementById("submit-btn");
const submitMessage = document.getElementById("submit-message");

const omikujiSection = document.getElementById("omikuji-section");
const omikujiBtn = document.getElementById("omikuji-btn");
const omikujiResult = document.getElementById("omikuji-result");

let countdownTimer = null;
let hasCelebrated = false;
let isSubmitting = false;

const omikujiList = [
  { title: "大吉", message: "最高の一年の予感。大胆にチャレンジしよう！" },
  { title: "中吉", message: "着実な努力が実を結ぶ年。コツコツ積み上げて◎" },
  { title: "小吉", message: "小さな幸せが積み重なる一年。感謝を忘れずに。" },
  { title: "吉",  message: "波は穏やか。準備と計画で好機を掴もう。" },
  { title: "末吉", message: "焦らず、一歩ずつ。続けることで光が見える。" },
  { title: "凶",  message: "リセットのチャンス。学びを力に、未来は明るい！" }
];

/* ========== カウントダウン ========== */
function updateCountdown() {
  const now = Date.now();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    clearInterval(countdownTimer);
    startCelebration();
    return;
  }

  daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
  hoursEl.textContent = String(Math.floor(diff / 3600000) % 24).padStart(2, "0");
  minutesEl.textContent = String(Math.floor(diff / 60000) % 60).padStart(2, "0");
  secondsEl.textContent = String(Math.floor(diff / 1000) % 60).padStart(2, "0");
}

function startCelebration() {
  if (hasCelebrated) return;
  hasCelebrated = true;

  countdownScreen.classList.remove("active");
  celebrationScreen.classList.add("active");

  launchFireworks(15);
  launchConfetti(100);

  setTimeout(() => {
    celebrationScreen.classList.remove("active");
    showMainScreen();
  }, 3000);
}

/* ========== メイン画面 ========== */
function showMainScreen() {
  mainScreen.classList.add("active");
  maybeShowOmikujiSection();
  loadBalloons();
}

/* ========== Fireworks / Confetti ========== */
function launchFireworks(count = 15) {
  const container = document.getElementById("fireworks");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const f = document.createElement("div");
    f.className = "firework";
    const hue = Math.random() * 360;
    f.style.background = `hsl(${hue}, 80%, 60%)`;
    f.style.boxShadow = `
      0 0 0 6px hsla(${hue},80%,60%,0.4),
      0 0 0 12px hsla(${hue},80%,60%,0.2),
      0 0 0 18px hsla(${hue},80%,60%,0.1)
    `;
    f.style.left = Math.random() * 100 + "vw";
    f.style.top = Math.random() * 60 + "vh";
    f.style.animationDelay = (Math.random() * 0.6) + "s";
    container.appendChild(f);
  }
  setTimeout(() => container.innerHTML = "", 2000);
}

function launchConfetti(count = 100) {
  const container = document.getElementById("confetti");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const c = document.createElement("div");
    c.className = "confetti-piece";
    const hue = Math.random() * 360;
    c.style.background = `hsl(${hue}, 90%, 65%)`;
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = (Math.random() * 0.6) + "s";
    c.style.animationDuration = (1.8 + Math.random() * 0.9) + "s";
    container.appendChild(c);
  }
  setTimeout(() => container.innerHTML = "", 2600);
}

/* ========== 抱負送信 ========== */
function getLocalResolutionCount() {
  return parseInt(localStorage.getItem(RESOLUTION_COUNT_KEY) || "0", 10);
}

function setLocalResolutionCount(v) {
  localStorage.setItem(RESOLUTION_COUNT_KEY, String(v));
}

function updateCharCount() {
  charCountEl.textContent = resolutionInput.value.length;
}

function showMessage(text, type = "success") {
  submitMessage.textContent = text;
  submitMessage.classList.remove("success", "error");
  submitMessage.classList.add(type);
}

function setSubmitting(state) {
  isSubmitting = state;
  submitBtn.disabled = state;
  submitBtn.textContent = state ? "送信中..." : "送信する";
}

async function handleSubmit() {
  if (isSubmitting) return;
  const text = resolutionInput.value.trim();
  if (!text) {
    showMessage("入力してください", "error");
    return;
  }
  if (text.length > 40) {
    showMessage("40文字以内で入力してください", "error");
    return;
  }
  const count = getLocalResolutionCount();
  if (count >= RESOLUTION_LIMIT) {
    showMessage("1端末につき2回までです", "error");
    return;
  }

  try {
    setSubmitting(true);
    await addDoc(collection(db, "resolutions"), {
      text,
      createdAt: serverTimestamp()
    });
    setLocalResolutionCount(count + 1);
    showMessage("送信しました！", "success");
    resolutionInput.value = "";
    updateCharCount();
    maybeShowOmikujiSection();
    loadBalloons();
  } catch (e) {
    console.error(e);
    showMessage("送信に失敗しました。時間をおいて再度お試しください", "error");
  } finally {
    setSubmitting(false);
  }
}

/* ========== バルーン表示 ========== */
async function loadBalloons() {
  balloonsContainer.innerHTML = "";
  try {
    const q = query(collection(db, "resolutions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    snap.forEach(doc => createBalloon(doc.data().text));
  } catch (e) {
    console.error("Failed to load balloons:", e);
  }
}

function createBalloon(text) {
  const balloon = document.createElement("div");
  balloon.className = "balloon";

  const hue = Math.random() * 360;
  balloon.style.background = `radial-gradient(circle at 30% 30%, hsla(${hue},80%,85%,0.9), hsla(${hue},80%,60%,0.85))`;

  const sideLeft = Math.random() < 0.5;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = sideLeft
    ? Math.random() * 0.25 * vw
    : vw * 0.75 + Math.random() * 0.25 * vw;
  const y = Math.random() * vh * 0.9;

  balloon.style.left = `${x}px`;
  balloon.style.top = `${y}px`;

  balloon.onclick = () => {
    modalText.textContent = text;
    modal.classList.remove("hidden");
  };

  balloonsContainer.appendChild(balloon);
}

/* ========== モーダル ========== */
modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };

/* ========== おみくじ ========== */
function maybeShowOmikujiSection() {
  if (getLocalResolutionCount() > 0) {
    omikujiSection.classList.remove("hidden");
  }
  if (localStorage.getItem(OMIKUJI_DONE_KEY) === "done") {
    omikujiBtn.disabled = true;
    omikujiResult.classList.remove("hidden");
  }
}

function drawOmikuji() {
  if (localStorage.getItem(OMIKUJI_DONE_KEY) === "done") return;
  const pick = omikujiList[Math.floor(Math.random() * omikujiList.length)];
  omikujiResult.innerHTML = `<strong>${pick.title}</strong><br>${pick.message}`;
  omikujiResult.classList.remove("hidden");
  localStorage.setItem(OMIKUJI_DONE_KEY, "done");
  omikujiBtn.disabled = true;
}

/* ========== デバッグコマンド ========== */
async function clearResolutions() {
  const snap = await getDocs(collection(db, "resolutions"));
  const promises = [];
  snap.forEach(doc => promises.push(deleteDoc(doc.ref)));
  await Promise.all(promises);
  loadBalloons();
  console.log("All resolutions deleted (client-side).");
}

function resetTest() {
  localStorage.removeItem(RESOLUTION_COUNT_KEY);
  localStorage.removeItem(OMIKUJI_DONE_KEY);
  resolutionInput.disabled = false;
  submitBtn.disabled = false;
  omikujiBtn.disabled = false;
  omikujiSection.classList.add("hidden");
  omikujiResult.classList.add("hidden");
  showMessage("");
  console.log("LocalStorage reset.");
}

window.triggerNewYear = () => {
  clearInterval(countdownTimer);
  startCelebration();
};

window.skipToMain = () => {
  clearInterval(countdownTimer);
  countdownScreen.classList.remove("active");
  celebrationScreen.classList.remove("active");
  showMainScreen();
};

window.resetTest = resetTest;
window.clearResolutions = clearResolutions;

/* ========== 初期化 ========== */
function init() {
  updateCharCount();
  resolutionInput.addEventListener("input", updateCharCount);
  submitBtn.addEventListener("click", handleSubmit);
  omikujiBtn.addEventListener("click", drawOmikuji);

  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);

  // すでに年越し後にアクセスした場合に備える
  if (Date.now() >= TARGET_DATE) {
    clearInterval(countdownTimer);
    startCelebration();
  }
}

init();
