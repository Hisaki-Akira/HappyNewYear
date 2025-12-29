import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  doc
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
const isAdminMode = new URLSearchParams(location.search).get("admin") === "1";

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
  { title: "Daikichi (Excellent)", message: "An amazing year awaits. Be bold and go for it!" },
  { title: "Chukichi (Very Good)", message: "Steady effort will pay off. Keep building step by step." },
  { title: "Shokichi (Good)", message: "Small joys will add up. Keep gratitude in your heart." },
  { title: "Kichi (Fair)", message: "Calm waters ahead. With prep and planning, seize good chances." },
  { title: "Sue-kichi (Slightly Good)", message: "No need to rush. Consistency will reveal the light." },
  { title: "Kyo (Bad)", message: "A reset chance. Turn lessons into power—your future is bright!" }
];

/* ========== Countdown ========== */
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

/* ========== Main screen ========== */
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

/* ========== Resolution submission ========== */
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
  submitBtn.textContent = state ? "Submitting..." : "Submit";
}

async function handleSubmit() {
  if (isSubmitting) return;
  const text = resolutionInput.value.trim();
  if (!text) {
    showMessage("Please enter text", "error");
    return;
  }
  if (text.length > 40) {
    showMessage("Please keep it within 40 characters", "error");
    return;
  }
  const count = getLocalResolutionCount();
  if (count >= RESOLUTION_LIMIT) {
    showMessage("Up to 2 posts per device", "error");
    return;
  }

  try {
    setSubmitting(true);
    await addDoc(collection(db, "resolutions"), {
      text,
      createdAt: serverTimestamp()
    });
    setLocalResolutionCount(count + 1);
    showMessage("Submitted!", "success");
    resolutionInput.value = "";
    updateCharCount();
    maybeShowOmikujiSection();
    loadBalloons();
  } catch (e) {
    console.error(e);
    showMessage("Submission failed. Please try again later.", "error");
  } finally {
    setSubmitting(false);
  }
}

/* ========== Balloons (delete button only with admin=1) ========== */
async function loadBalloons() {
  balloonsContainer.innerHTML = "";
  try {
    const q = query(collection(db, "resolutions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    snap.forEach(d => createBalloon(d.id, d.data().text));
  } catch (e) {
    console.error("Failed to load balloons:", e);
  }
}

function createBalloon(id, text) {
  const balloon = document.createElement("div");
  balloon.className = "balloon";

  const hue = Math.random() * 360;
  balloon.style.background = `radial-gradient(circle at 30% 30%, hsla(${hue},80%,85%,0.9), hsla(${hue},80%,60%,0.85))`;

  const sideLeft = Math.random() < 0.5;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = sideLeft ? Math.random() * 0.25 * vw : vw * 0.75 + Math.random() * 0.25 * vw;
  const y = Math.random() * vh * 0.9;
  balloon.style.left = `${x}px`;
  balloon.style.top = `${y}px`;

  balloon.onclick = () => {
    modalText.textContent = text;
    modal.classList.remove("hidden");
  };

  if (isAdminMode) {
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.style.position = "absolute";
    del.style.bottom = "-14px";
    del.style.left = "50%";
    del.style.transform = "translateX(-50%)";
    del.style.fontSize = "0.75rem";
    del.style.padding = "4px 8px";
    del.style.borderRadius = "6px";
    del.style.border = "none";
    del.style.background = "rgba(0,0,0,0.65)";
    del.style.color = "#fff";
    del.style.cursor = "pointer";
    del.onclick = async (e) => {
      e.stopPropagation();
      try {
        await deleteDoc(doc(db, "resolutions", id));
        balloon.remove();
        console.log(`Deleted resolution: ${id}`);
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete");
      }
    };
    balloon.appendChild(del);
  }

  balloonsContainer.appendChild(balloon);
}

/* ========== Modal ========== */
modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };

/* ========== Omikuji ========== */
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

/* ========== Debug helpers ========== */
async function clearResolutions() {
  const snap = await getDocs(collection(db, "resolutions"));
  const promises = [];
  snap.forEach(docu => promises.push(deleteDoc(docu.ref)));
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

/* ========== Init ========== */
function init() {
  updateCharCount();
  resolutionInput.addEventListener("input", updateCharCount);
  submitBtn.addEventListener("click", handleSubmit);
  omikujiBtn.addEventListener("click", drawOmikuji);

  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);

  if (Date.now() >= TARGET_DATE) {
    clearInterval(countdownTimer);
    startCelebration();
  }
}

init();
