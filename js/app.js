// js/app.js

let participants = [];
let winnersList = [];
let isSpinning = false;

// Element Selectors
const btnSpin = document.getElementById('btnSpin');
const btnToggleSettings = document.getElementById('btnToggleSettings');
const btnCloseModal = document.getElementById('btnCloseModal');
const modalSettings = document.getElementById('modalSettings');
const sheetUrlInput = document.getElementById('sheetUrl');
const spinCountSelect = document.getElementById('spinCount');
const bgUploadInput = document.getElementById('bgUpload');
const winnerListUI = document.getElementById('winnerList');

// Init & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  setupEventListeners();
  fetchParticipantsData();
});

function setupEventListeners() {
  btnToggleSettings.addEventListener('click', () => modalSettings.classList.add('active'));
  btnCloseModal.addEventListener('click', saveSettingsAndClose);
  btnSpin.addEventListener('click', handleMultiSpin);
  bgUploadInput.addEventListener('change', handleBackgroundUpload);
}

// 1. Load & Save Settings
function loadSavedSettings() {
  const savedUrl = localStorage.getItem('sheet_api_url');
  if (savedUrl) sheetUrlInput.value = savedUrl;

  const savedBg = localStorage.getItem('custom_bg');
  if (savedBg) document.body.style.backgroundImage = `url('${savedBg}')`;
}

function saveSettingsAndClose() {
  const url = sheetUrlInput.value.trim();
  if (url) {
    localStorage.setItem('sheet_api_url', url);
    fetchParticipantsData();
  }
  modalSettings.classList.remove('active');
}

function handleBackgroundUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const base64Img = event.target.result;
      document.body.style.backgroundImage = `url('${base64Img}')`;
      localStorage.setItem('custom_bg', base64Img);
    };
    reader.readAsDataURL(file);
  }
}

// 2. Fetch Data dari Google Apps Script API
// js/app.js

async function fetchParticipantsData() {
  // Ambil dari LocalStorage, jika kosong gunakan URL default hardcoded ini:
  const defaultUrl = 'https://script.google.com/macros/s/AKfycbwygM1ydQWtPeTagQOy2LQLC8TpF_LrcmpDlBAB4xzGNlhpCG1qe_MT0nJ6cdr6kf-e/exec'; // Paste URL Web App Anda di sini
  const apiUrl = localStorage.getItem('sheet_api_url') || defaultUrl;

  if (!apiUrl) return;

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (result.status === 'success') {
      participants = result.data.filter(p => !p.result || p.result.trim() === '');
      create3DWheel(participants);
    }
  } catch (error) {
    console.error('Gagal mengambil data dari Google Sheet:', error);
  }
}

// 3. Logika Multi-Spin (1 Klik = N Pemenang)
async function handleMultiSpin() {
  if (isSpinning || participants.length === 0) return;

  const countToSpin = parseInt(spinCountSelect.value, 10);
  const actualSpins = Math.min(countToSpin, participants.length);

  isSpinning = true;
  btnSpin.disabled = true;

  const sessionWinners = [];

  for (let i = 0; i < actualSpins; i++) {
  if (participants.length === 0) break;

  const randomIndex = Math.floor(Math.random() * participants.length);
  const winner = participants[randomIndex];

  // Putar roda hingga berhenti
  await spinToWinner(winner, participants, 4000);

  // Trigger Confetti tepat saat roda berhenti
  triggerConfetti();

  sessionWinners.push(winner);
  participants.splice(randomIndex, 1);

  renderWinnerUI(winner);

  create3DWheel(participants);
  if (i < actualSpins - 1) {
    await new Promise(res => setTimeout(res, 1200));
  }
}

    for (let i = 0; i < actualSpins; i++) {
  if (participants.length === 0) break;

  const randomIndex = Math.floor(Math.random() * participants.length);
  const winner = participants[randomIndex];

  // Putar roda hingga berhenti
  await spinToWinner(winner, participants, 4000);

  // Trigger Confetti tepat saat roda berhenti
  triggerConfetti();

  sessionWinners.push(winner);
  participants.splice(randomIndex, 1);

  renderWinnerUI(winner);

  create3DWheel(participants);
  if (i < actualSpins - 1) {
    await new Promise(res => setTimeout(res, 1200));  
    }
  }

  // Kirim data hasil pemenang ke Google Sheet via API
  await syncWinnersToSheet(sessionWinners);

  isSpinning = false;
  btnSpin.disabled = false;
}

// 4. Render UI List Pemenang
function renderWinnerUI(winner) {
  winnersList.push(winner);
  const li = document.createElement('li');
  li.className = 'winner-item';
  li.innerHTML = `
    <span class="bib" style="font-size: 18px; font-weight: bold; width: 100%; text-align: center;">BIB: ${winner.bib}</span>
  `;
  winnerListUI.appendChild(li);
}

// 5. Sync Data Pemenang ke Google Sheets
async function syncWinnersToSheet(winners) {
  const apiUrl = localStorage.getItem('sheet_api_url');
  if (!apiUrl || winners.length === 0) return;

  const payload = {
    winners: winners.map(w => ({
      rowIndex: w.rowIndex,
      resultText: 'Winner'
    }))
  };

  try {
    await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Gagal memperbarui Google Sheet:', error);
  }
}
  
  function triggerConfetti() {
  if (typeof confetti === 'function') {
    // Ledakan dari kiri
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { x: 0.1, y: 0.6 }
    });

    // Ledakan dari kanan
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { x: 0.9, y: 0.6 }
    });
  }
}