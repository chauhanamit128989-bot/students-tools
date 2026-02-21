// Navigation
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navLink = document.querySelector(`.nav-links a[onclick="showPage('${pageId}')"]`);
  if (navLink) navLink.classList.add('active');
}

function showTool(toolId) { showPage(toolId); }
showPage('home');

// Stat counter animation
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      counters.forEach(el => {
        let count = 0;
        const target = +el.getAttribute('data-count');
        const step = target / 40;
        const tick = () => {
          count += step;
          el.textContent = Math.ceil(count);
          if (count < target) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        tick();
      });
      obs.disconnect();
    }
  }, {threshold: 0.5});
  obs.observe(document.querySelector('.hero'));
});

// ────────────────────────────────────────────────
// Tool Implementations
// ────────────────────────────────────────────────

function convertToPDF() {
  const file = document.getElementById('img2pdf-file').files[0];
  if (!file) return alert("Select an image first");
  const reader = new FileReader();
  reader.onload = e => {
    const win = window.open();
    win.document.write(`<img src="${e.target.result}" style="width:100%;height:auto;" onload="window.print()">`);
  };
  reader.readAsDataURL(file);
}

function compressImage() {
  const file = document.getElementById('compress-file').files[0];
  const q = parseFloat(document.getElementById('compress-q').value);
  if (!file) return alert("Select image");
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      const url = c.toDataURL('image/jpeg', q);
      const a = document.getElementById('compress-dl');
      a.href = url; a.download = 'compressed.jpg'; a.style.display = 'inline-block';
      a.textContent = '↓ Download Compressed Image';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function resizeImage() {
  const file = document.getElementById('resize-file').files[0];
  const w = +document.getElementById('resize-w').value;
  const h = +document.getElementById('resize-h').value;
  if (!file || !w || !h) return alert("Select image & enter dimensions");
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      const url = c.toDataURL('image/jpeg');
      const a = document.getElementById('resize-dl');
      a.href = url; a.download = 'resized.jpg'; a.style.display = 'inline-block';
      a.textContent = '↓ Download Resized Image';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function calculateCgpa() {
  const val = document.getElementById('cgpa-input').value;
  const nums = val.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) return;
  const avg = (nums.reduce((a,b)=>a+b,0) / nums.length).toFixed(2);
  document.getElementById('cgpa-result').textContent = `CGPA = ${avg}`;
}

function calcPercentage() {
  const o = +document.getElementById('pct-obt').value;
  const t = +document.getElementById('pct-total').value;
  if (!o || !t) return;
  document.getElementById('pct-result').textContent = `Percentage = ${(o/t*100).toFixed(2)}%`;
}

function calcGrade() {
  const m = +document.getElementById('grade-marks').value;
  if (isNaN(m)) return;
  let g = 'F';
  if (m >= 90) g = 'A+'; else if (m >= 80) g = 'A'; else if (m >= 70) g = 'B';
  else if (m >= 60) g = 'C'; else if (m >= 50) g = 'D';
  document.getElementById('grade-result').textContent = `Grade: ${g}`;
}

function calcAttendance() {
  const p = +document.getElementById('att-present').value;
  const t = +document.getElementById('att-total').value;
  if (!p || !t) return;
  document.getElementById('att-result').textContent = `Attendance = ${(p/t*100).toFixed(2)}%`;
}

function calcAge() {
  const dob = new Date(document.getElementById('age-dob').value);
  if (!dob.getTime()) return;
  const diff = Date.now() - dob.getTime();
  const age = Math.floor(diff / 31557600000);
  document.getElementById('age-result').textContent = `You are ${age} years old`;
}

// Pomodoro
let pomodoroTimer, pomodoroTime = 25*60;
function updateTimerDisplay() {
  const min = Math.floor(pomodoroTime/60);
  const sec = pomodoroTime%60;
  document.getElementById('timer').textContent = `${min}:${sec<10?'0':''}${sec}`;
}
function startPomodoro() {
  if (pomodoroTimer) return;
  pomodoroTimer = setInterval(() => {
    pomodoroTime--;
    updateTimerDisplay();
    if (pomodoroTime <= 0) { clearInterval(pomodoroTimer); alert("Time's up! Take a break."); }
  }, 1000);
}
function stopPomodoro() { clearInterval(pomodoroTimer); pomodoroTimer = null; }
function resetPomodoro() { stopPomodoro(); pomodoroTime = 25*60; updateTimerDisplay(); }

// Text tools
function countWords() {
  const t = document.getElementById('word-txt').value.trim();
  const c = t ? t.split(/\s+/).length : 0;
  document.getElementById('word-res').textContent = `Words: ${c}`;
}
function countChars() {
  const c = document.getElementById('char-txt').value.length;
  document.getElementById('char-res').textContent = `Characters: ${c}`;
}
function saveNote() {
  localStorage.setItem('studentNote', document.getElementById('notes-area').value);
  document.getElementById('notes-msg').textContent = 'Saved!';
}
function loadNote() {
  const n = localStorage.getItem('studentNote');
  if (n) document.getElementById('notes-area').value = n;
}
function toUpperCase() {
  const el = document.getElementById('format-txt');
  el.value = el.value.toUpperCase();
}
function toLowerCase() {
  const el = document.getElementById('format-txt');
  el.value = el.value.toLowerCase();
}
function toTitleCase() {
  const el = document.getElementById('format-txt');
  el.value = el.value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

// Calculators
function initBasicCalc() {
  const disp = document.getElementById('basic-display');
  const keys = document.getElementById('basic-keys');
  ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C'].forEach(k => {
    const btn = document.createElement('button');
    btn.textContent = k;
    btn.onclick = () => {
      if (k==='C') disp.value = '';
      else if (k==='=') { try{disp.value=eval(disp.value);}catch{e=>disp.value='Error';} }
      else disp.value += k;
    };
    keys.appendChild(btn);
  });
}
initBasicCalc();

function initSciCalc() {
  const disp = document.getElementById('sci-display');
  const keys = document.getElementById('sci-keys');
  ['sin','cos','tan','sqrt','7','8','9','/','^','4','5','6','*','(','1','2','3',')','-','0','.','=','+','C'].forEach(k => {
    const btn = document.createElement('button');
    btn.textContent = k;
    btn.onclick = () => {
      if (k==='C') disp.value = '';
      else if (k==='=') {
        try {
          let expr = disp.value.replace('^','**').replace('sqrt','Math.sqrt').replace('sin','Math.sin').replace('cos','Math.cos').replace('tan','Math.tan');
          disp.value = eval(expr);
        } catch { disp.value = 'Error'; }
      }
      else disp.value += k;
    };
    keys.appendChild(btn);
  });
}
initSciCalc();

// To-Do & Planner
function addTodo() {
  const txt = document.getElementById('todo-input').value.trim();
  if (!txt) return;
  const li = document.createElement('li');
  li.textContent = txt;
  li.onclick = () => li.remove();
  document.getElementById('todo-ul').appendChild(li);
  document.getElementById('todo-input').value = '';
}
function addPlan() {
  const sub = document.getElementById('plan-subj').value.trim();
  const tim = document.getElementById('plan-time').value;
  if (!sub || !tim) return;
  const li = document.createElement('li');
  li.textContent = `${sub} @ ${tim}`;
  document.getElementById('plan-ul').appendChild(li);
  document.getElementById('plan-subj').value = '';
  document.getElementById('plan-time').value = '';
}