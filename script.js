/* Helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* Mobile nav toggle */
const navToggle = $('#navToggle');
const mainNav = $('#mainNav');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    if (mainNav) mainNav.style.display = expanded ? 'none' : 'flex';
  });
}

/* Inline search for help topics */
const helpSearch = $('#helpSearch');
const helpTopics = $('#helpTopics');
if (helpSearch && helpTopics) {
  helpSearch.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('#helpTopics li').forEach(li => {
      li.style.display = q === '' || li.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* Feeling bubbles */
const RED_LEVELS = ['distress'];
const bubbles = $$('.bubble');
const redModal = $('#redModal');
const closeRed = $('#closeRed');

bubbles.forEach(b => {
  b.addEventListener('click', () => {
    const level = b.dataset.level;

    // Visual feedback animation
    b.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.95)' }, { transform: 'scale(1)' }], { duration: 260 });

    if (RED_LEVELS.includes(level)) {
      showRedModal();
    } else {
      const note = document.createElement('div');
      note.className = 'sw-result';
      note.textContent = `Noted — "${b.textContent}". If things change, the Need Help options are available.`;
      b.closest('.card').appendChild(note);
      setTimeout(() => note.remove(), 4200);
    }
  });
});

/* SWEMWBS form scoring */
const swForm = $('#swemForm');
const swResult = $('#swResult');
const swReset = $('#swReset');

if (swForm) {
  swForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const data = new FormData(swForm);
    const vals = [];
    for (let i = 1; i <= 7; i++) {
      const v = Number(data.get('q' + i));
      if (!v || v < 1 || v > 5) {
        alert('Please answer all SWEMWBS items to get an automated result (or use Reset).');
        return;
      }
      vals.push(v);
    }
    const total = vals.reduce((a, b) => a + b, 0);
    const avg = (total / vals.length).toFixed(2);
    const redFlag = total <= 14; // conservative threshold
    swResult.hidden = false;
    swResult.innerHTML = `<strong>Score:</strong> ${total} (avg ${avg}). ` +
      (redFlag ? `<span style="color:#b71c1c">This score suggests you may be struggling — please consider reaching support.</span>` :
        `<span style="color:green">This score suggests some positive aspects — consider tools to maintain wellbeing.</span>`);
    if (redFlag) showRedModal();
  });
}

if (swReset) {
  swReset.addEventListener('click', () => {
    swForm.reset();
    if (swResult) { swResult.hidden = true; swResult.textContent = ''; }
  });
}

/* Modal helpers */
function showRedModal() {
  if (!redModal) return;
  redModal.removeAttribute('aria-hidden');
  redModal.style.display = 'grid';
}
function hideRedModal() {
  if (!redModal) return;
  redModal.setAttribute('aria-hidden', 'true');
  redModal.style.display = 'none';
}
if (closeRed) closeRed.addEventListener('click', hideRedModal);
if (redModal) {
  redModal.addEventListener('click', (e) => { if (e.target === redModal) hideRedModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideRedModal(); });
}

/* Grounding guided prompt */
const openGuided = $('#openGuided');
const quickPrompt = $('#quickPrompt');

if (openGuided) {
  openGuided.addEventListener('click', () => {
    alert('Short grounding exercise. Cancel at any step.');
    const five = prompt('5 things you can SEE — list one or Cancel.');
    if (five === null) return;
    const four = prompt('4 things you can FEEL — list one.');
    if (four === null) return;
    const three = prompt('3 things you can HEAR — list one.');
    if (three === null) return;
    const two = prompt('2 things you can SMELL — list one (or leave blank).');
    if (two === null) return;
    const one = prompt('1 thing you can TASTE or a short positive thought.');
    if (one === null) return;
    alert('Grounding complete — well done. If you feel worse, use the Need Help options.');
  });
}

if (quickPrompt) {
  quickPrompt.addEventListener('click', () => { alert('Prompt: Name 5 things you can see right now.'); });
}

/* Sine-wave calming tone */
let audioCtx = null, osc = null, gainNode = null;
const playBtn = $('#playTone'), stopBtn = $('#stopTone'), vol = $('#toneVolume');

if (playBtn) {
  playBtn.addEventListener('click', () => {
    if (!window.AudioContext && !window.webkitAudioContext) return alert('Audio not supported in this browser.');
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!osc) {
      osc = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 220;
      gainNode.gain.value = Number(vol ? vol.value : 0.25);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
    }
  });
}

if (stopBtn) {
  stopBtn.addEventListener('click', () => {
    if (osc) { osc.stop(); osc.disconnect(); osc = null; gainNode.disconnect(); gainNode = null; }
  });
}

if (vol) {
  vol.addEventListener('input', () => { if (gainNode) gainNode.gain.value = Number(vol.value); });
}
