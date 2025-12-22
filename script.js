import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
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

function updateCountdown() {
  const now = Date.now();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    countdownScreen.classList.remove("active");
    mainScreen.classList.add("active");
    loadBalloons();
    return;
  }

  daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
  hoursEl.textContent = String(Math.floor(diff / 3600000) % 24).padStart(2, "0");
  minutesEl.textContent = String(Math.floor(diff / 60000) % 60).padStart(2, "0");
  secondsEl.textContent = String(Math.floor(diff / 1000) % 60).padStart(2, "0");
}

async function loadBalloons() {
  balloonsContainer.innerHTML = "";
  const q = query(collection(db, "resolutions"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  snap.forEach(doc => createBalloon(doc.data().text));
}

function createBalloon(text) {
  const balloon = document.createElement("div");
  balloon.className = "balloon";

  const hue = Math.random() * 360;
  balloon.style.background = `radial-gradient(circle at 30% 30%, hsla(${hue},80%,85%,0.9), hsla(${hue},80%,60%,0.8))`;

  balloon.style.left = Math.random() * window.innerWidth + "px";
  balloon.style.top = Math.random() * window.innerHeight + "px";

  balloon.onclick = () => {
    modalText.textContent = text;
    modal.classList.remove("hidden");
  };

  balloonsContainer.appendChild(balloon);
}

modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};

updateCountdown();
setInterval(updateCountdown, 1000);


// ===== デバッグ用フック =====
window.debug = {
  triggerNewYear() {
    console.log("DEBUG: triggerNewYear");
    countdownScreen.classList.remove("active");
    celebrationScreen?.classList?.add("active");

    setTimeout(() => {
      celebrationScreen?.classList?.remove("active");
      mainScreen.classList.add("active");
      loadBalloons();
    }, 3000);
  },

  skipToMain() {
    console.log("DEBUG: skipToMain");
    countdownScreen.classList.remove("active");
    celebrationScreen?.classList?.remove("active");
    mainScreen.classList.add("active");
    loadBalloons();
  },

  logState() {
    console.log("STATE", {
      countdownActive: countdownScreen.classList.contains("active"),
      mainActive: mainScreen.classList.contains("active"),
      now: new Date(),
      target: new Date(TARGET_DATE)
    });
  }
};
