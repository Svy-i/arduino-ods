// Firebase Authentication (Google + Email/Password)
// Versão estática HTML/JS - usa CDN do Firebase v10 (modular)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD95Ep-PHqmhIxepOfX5QDpxjMFSZM4Eto",
  authDomain: "arduinoods.firebaseapp.com",
  projectId: "arduinoods",
  storageBucket: "arduinoods.firebasestorage.app",
  messagingSenderId: "388730504518",
  appId: "1:388730504518:web:4106a0aa4a366a8b5cd147",
  measurementId: "G-889JSKP8XD",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// === Página de Login ===
const emailForm = document.getElementById("email-form");
if (emailForm) {
  let mode = "login"; // "login" | "signup"
  const titleEl = document.getElementById("auth-title");
  const submitBtn = document.getElementById("submit-btn");
  const switchLabel = document.getElementById("switch-label");
  const switchBtn = document.getElementById("switch-btn");
  const googleBtn = document.getElementById("google-btn");
  const errorBox = document.getElementById("error-box");

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  }
  function clearError() {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
  }
  function setBusy(b) {
    submitBtn.disabled = b;
    googleBtn.disabled = b;
    submitBtn.textContent = b ? "Aguarde..." : (mode === "login" ? "Entrar" : "Criar conta");
  }
  function setMode(next) {
    mode = next;
    titleEl.textContent = mode === "login" ? "Entrar" : "Criar conta";
    submitBtn.textContent = mode === "login" ? "Entrar" : "Criar conta";
    switchLabel.textContent = mode === "login" ? "Não tem conta?" : "Já tem conta?";
    switchBtn.textContent = mode === "login" ? "Cadastre-se" : "Entrar";
  }

  switchBtn.addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));

  googleBtn.addEventListener("click", async () => {
    clearError(); setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message || "Falha no login com Google");
    } finally { setBusy(false); }
  });

  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(); setBusy(true);
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message || "Falha na autenticação");
    } finally { setBusy(false); }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "dashboard.html";
  });
}

// === Página de Dashboard ===
const userLabel = document.getElementById("user-label");
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    if (userLabel) userLabel.textContent = user.displayName || user.email || "";
  });

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}
