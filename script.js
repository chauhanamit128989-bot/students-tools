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

async function convertImagesToPDF() {
  const fileInput = document.getElementById('img2pdf-files');
  const files = fileInput.files;

  if (!files || files.length === 0) {
    alert("कृपया कम से कम एक इमेज चुनें।");
    return;
  }

  if (files.length > 200) {  // आप चाहें तो लिमिट बढ़ा या हटा सकते हैं
    alert("अधिकतम 200 इमेज की अनुमति है (ब्राउज़र मेमोरी के लिए)।");
    return;
  }

  // प्रीव्यू दिखाना (ऑप्शनल)
  const preview = document.getElementById('preview-container');
  preview.innerHTML = ''; // पुराना प्रीव्यू क्लियर करें
  Array.from(files).forEach(file => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '120px';
    img.style.borderRadius = '6px';
    img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    preview.appendChild(img);
  });

  // असली PDF बनाना शुरू
  try {
    // jsPDF लाइब्रेरी यूज़ करें (CDN से लोड करें)
    // सबसे पहले index.html के <head> में ये जोड़ें:
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });

      const img = new Image();
      img.src = imgData;

      await new Promise(resolve => { img.onload = resolve; });

      // पेज साइज़ इमेज के aspect ratio के हिसाब से
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', (pdfWidth - width)/2, (pdfHeight - height)/2, width, height);
    }

    pdf.save('images-to-pdf.pdf');

    // प्रीव्यू क्लियर (ऑप्शनल)
    // preview.innerHTML = '';

  } catch (err) {
    console.error(err);
    alert("PDF बनाने में समस्या आई। कृपया फिर से ट्राई करें या कम इमेज चुनें।");
  }
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
  const input = document.getElementById('cgpa-input').value.trim();
  const resultEl = document.getElementById('cgpa-result');

  resultEl.classList.remove('show');
  resultEl.innerHTML = '';

  if (!input) {
    resultEl.innerHTML = "कृपया कुछ GPA डालें...";
    resultEl.style.color = "#ef4444";
    resultEl.classList.add('show');
    return;
  }

  const gpas = input
    .split(',')
    .map(n => parseFloat(n.trim()))
    .filter(n => !isNaN(n));

  if (gpas.length === 0) {
    resultEl.innerHTML = "कोई वैध GPA नहीं मिला";
    resultEl.style.color = "#ef4444";
    resultEl.classList.add('show');
    return;
  }

  const cgpa = (gpas.reduce((sum, val) => sum + val, 0) / gpas.length).toFixed(2);

  let comment = "";
  if (cgpa >= 9.0)      comment = "<small style='color:#10b981;'>Outstanding! 🌟</small>";
  else if (cgpa >= 8.0) comment = "<small style='color:#059669;'>Excellent! Keep shining ✨</small>";
  else if (cgpa >= 7.0) comment = "<small style='color:#d97706;'>Very Good! Consistent effort 👍</small>";
  else if (cgpa >= 6.0) comment = "<small style='color:#ea580c;'>Good - Can aim higher next time 💪</small>";
  else                  comment = "<small style='color:#ef4444;'>Needs improvement - Let's work harder 🔥</small>";

  resultEl.innerHTML = `
    Your CGPA: <span style="font-size:2.1rem; font-weight:900;">${cgpa}</span><br>
    (${gpas.length} semesters)<br>
    ${comment}
  `;

  resultEl.style.color = "#4338ca";
  resultEl.classList.add('show');
}

function calcPercentage() {
  const obtained = parseFloat(document.getElementById('pct-obt').value);
  const total    = parseFloat(document.getElementById('pct-total').value);
  const result   = document.getElementById('pct-result');

  // Reset पहले
  result.classList.remove('show');
  result.innerHTML = '';

  if (isNaN(obtained) || isNaN(total) || total <= 0 || obtained < 0 || obtained > total) {
    result.innerHTML = "कृपया सही नंबर डालें (Obtained ≤ Total)";
    result.style.color = "#ef4444";
    result.classList.add('show');
    return;
  }

  const percentage = ((obtained / total) * 100).toFixed(2);
  let message = `Percentage: <span style="font-size:1.8rem;">${percentage}%</span>`;

  if (percentage >= 90) {
    message += "<br><small style='color:#10b981;'>Excellent! Outstanding performance 🎉</small>";
  } else if (percentage >= 75) {
    message += "<br><small style='color:#059669;'>Very Good! Keep it up 👍</small>";
  } else if (percentage >= 60) {
    message += "<br><small style='color:#d97706;'>Good - Can do better 💪</small>";
  } else if (percentage >= 40) {
    message += "<br><small style='color:#ea580c;'>Average - Need improvement ⚠️</small>";
  } else {
    message += "<br><small style='color:#dc2626;'>Low - Work harder next time 🔥</small>";
  }

  result.innerHTML = message;
  result.style.color = "#6b21a8";
  result.classList.add('show');
}
function calcGrade() {
  const marks = parseFloat(document.getElementById('grade-marks').value);
  const result = document.getElementById('grade-result');

  if (isNaN(marks) || marks < 0 || marks > 100) {
    result.innerHTML = "कृपया 0 से 100 के बीच नंबर डालें";
    result.style.color = "red";
    return;
  }

  let grade = "";
  if      (marks >= 90) grade = "A+";
  else if (marks >= 80) grade = "A";
  else if (marks >= 70) grade = "B";
  else if (marks >= 60) grade = "C";
  else if (marks >= 50) grade = "D";
  else                  grade = "F";

  result.innerHTML = `Your Grade: <b>${grade}</b> (${marks}%)`;
  result.style.color = "#1e40af";
}

function calcAttendance() {
  const p = +document.getElementById('att-present').value;
  const t = +document.getElementById('att-total').value;
  if (!p || !t) return;
  document.getElementById('att-result').textContent = `Attendance = ${(p/t*100).toFixed(2)}%`;
}

function calculateAge() {
  const dobInput = document.getElementById('age-dob').value;
  const resultEl = document.getElementById('age-result');

  resultEl.classList.remove('show');
  resultEl.innerHTML = '';

  if (!dobInput) {
    resultEl.innerHTML = "कृपया जन्म तिथि चुनें... 📅";
    resultEl.style.color = "#ef4444";
    resultEl.classList.add('show');
    return;
  }

  const dob = new Date(dobInput);
  const today = new Date();

  if (dob > today) {
    resultEl.innerHTML = "भविष्य की तारीख नहीं चुन सकते 😉";
    resultEl.style.color = "#ef4444";
    resultEl.classList.add('show');
    return;
  }

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  let message = `You are <span style="font-size:2.1rem; font-weight:900;">${years}</span> years old`;

  if (months > 0 || days > 0) {
    message += `<br><small>${months} month${months !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''} old 🎂</small>`;
  }

  // Birthday message
  if (months === 0 && days === 0) {
    message += "<br><span style='color:#f59e0b; font-weight:bold;'>Happy Birthday! 🥳🎉</span>";
  }

  resultEl.innerHTML = message;
  resultEl.style.color = "#be185d";
  resultEl.classList.add('show');
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
  const text = document.getElementById('word-txt').value;
  const statsDisplay = document.getElementById('word-stats');

  // Live counting (also triggers on every input)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s+/g, '').length;

  document.getElementById('word-count').textContent = words;
  document.getElementById('char-count').textContent = chars;
  document.getElementById('char-no-space').textContent = charsNoSpace;

  // Show stats with animation only once (or every time if you prefer)
  statsDisplay.classList.add('active');

  // Optional: change color based on count
  if (words > 500) {
    document.getElementById('word-count').style.color = '#10b981';
  } else if (words > 200) {
    document.getElementById('word-count').style.color = '#f59e0b';
  } else {
    document.getElementById('word-count').style.color = '#6b21a8';
  }
}

// Make it live (count as user types)
document.getElementById('word-txt').addEventListener('input', countWords);

// Optional: initial call
countWords();
function countChars() {
  const text = document.getElementById('char-txt').value;
  const statsDisplay = document.getElementById('char-stats');

  const totalChars = text.length;
  const noSpaceChars = text.replace(/\s+/g, '').length;
  const approxWords = text.trim() ? text.trim().split(/\s+/).length : 0;

  document.getElementById('total-chars').textContent = totalChars;
  document.getElementById('chars-no-space').textContent = noSpaceChars;
  document.getElementById('word-count-from-char').textContent = approxWords;

  statsDisplay.classList.add('active');

  // Visual feedback based on length
  const valueEl = document.getElementById('total-chars');
  if (totalChars > 1000) {
    valueEl.style.color = '#ef4444'; // red for very long
  } else if (totalChars > 500) {
    valueEl.style.color = '#f59e0b'; // orange for long
  } else if (totalChars > 100) {
    valueEl.style.color = '#10b981'; // green for good length
  } else {
    valueEl.style.color = '#b45309'; // default
  }
}

// Live update as user types
document.getElementById('char-txt').addEventListener('input', countChars);

// Initial call
countChars();
function saveAsPDF() {
  const text = document.getElementById('notes-area').value.trim();
  const msg = document.getElementById('notes-msg');

  if (!text) {
    msg.textContent = "कृपया कुछ लिखें पहले... 😅";
    msg.className = "status-msg error";
    return;
  }

  // jsPDF इस्तेमाल करके PDF बनाना
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    msg.textContent = "PDF लाइब्रेरी लोड नहीं हुई। पेज रिफ्रेश करें।";
    msg.className = "status-msg error";
    return;
  }

  const pdf = new jsPDF();
  
  // हेडर
  pdf.setFontSize(20);
  pdf.setTextColor(79, 70, 229); // indigo
  pdf.text("Quick Notes", 105, 20, { align: "center" });

  pdf.setFontSize(12);
  pdf.setTextColor(100);
  const today = new Date().toLocaleString('gu-IN', { timeZone: 'Asia/Kolkata' });
  pdf.text(`Date: ${today}`, 105, 30, { align: "center" });

  pdf.line(20, 35, 190, 35); // लाइन

  // नोट्स कंटेंट
  pdf.setFontSize(14);
  pdf.setTextColor(30);
  
  // टेक्स्ट को लाइनों में तोड़कर PDF में डालना
  const splitText = pdf.splitTextToSize(text, 170); // 170mm चौड़ाई तक
  pdf.text(splitText, 20, 50);

  // फाइल डाउनलोड
  pdf.save("Quick_Notes_" + new Date().toISOString().slice(0,10) + ".pdf");

  // सफल मैसेज
  msg.textContent = "PDF डाउनलोड हो गया! 📄";
  msg.className = "status-msg success";
  
  // 4 सेकंड बाद मैसेज हटाओ
  setTimeout(() => {
    msg.textContent = "";
    msg.className = "status-msg";
  }, 4000);
}

// पुराना saveNote (localStorage वाला) — वैकल्पिक रख सकते हो
function saveNote() {
  const text = document.getElementById('notes-area').value;
  if (text.trim()) {
    localStorage.setItem('quickNote', text);
    document.getElementById('notes-msg').textContent = "Local में सेव हो गया ✓";
    document.getElementById('notes-msg').className = "status-msg success";
  }
}

function loadNote() {
  const saved = localStorage.getItem('quickNote');
  if (saved) {
    document.getElementById('notes-area').value = saved;
    document.getElementById('notes-msg').textContent = "पिछला नोट लोड हो गया 📝";
    document.getElementById('notes-msg').className = "status-msg success";
  } else {
    document.getElementById('notes-msg').textContent = "कोई सेव्ड नोट नहीं मिला 😕";
    document.getElementById('notes-msg').className = "status-msg error";
  }
}
function updatePreview(text) {
  const preview = document.getElementById('preview');
  preview.innerHTML = text ? text : "<p>Formatted text will appear here...</p>";
  preview.classList.add('updated');
  setTimeout(() => preview.classList.remove('updated'), 800);
}

function toUpper() {
  const el = document.getElementById('format-txt');
  el.value = el.value.toUpperCase();
  updatePreview(el.value);
}

function toLower() {
  const el = document.getElementById('format-txt');
  el.value = el.value.toLowerCase();
  updatePreview(el.value);
}

function toTitleCase() {
  const el = document.getElementById('format-txt');
  el.value = el.value.toLowerCase().replace(/(^|\s)\w/g, letter => letter.toUpperCase());
  updatePreview(el.value);
}

function toSentenceCase() {
  const el = document.getElementById('format-txt');
  let text = el.value.toLowerCase();
  text = text.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  el.value = text;
  updatePreview(el.value);
}

// Optional: live preview while typing
document.getElementById('format-txt').addEventListener('input', function() {
  updatePreview(this.value);
});

let display = document.getElementById('calc-display');

function appendToDisplay(value) {
  if (display.value === '0' || display.value === 'Error') {
    display.value = value;
  } else {
    display.value += value;
  }
}

function clearDisplay() {
  display.value = '0';
}

function calculate() {
  try {
    // Replace × with * for eval
    let expression = display.value.replace(/×/g, '*');
    display.value = eval(expression);
  } catch (error) {
    display.value = 'Error';
    display.classList.add('shake');
    setTimeout(() => display.classList.remove('shake'), 600);
  }
}

// Optional shake animation when error
const shakeKeyframes = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-6px); }
    100% { transform: translateX(0); }
  }
  .shake { animation: shake 0.5s; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = shakeKeyframes;
document.head.appendChild(styleSheet);

let sciDisplay = document.getElementById('sci-display');

function appendSci(value) {
  if (sciDisplay.value === '0' || sciDisplay.value === 'Error') {
    sciDisplay.value = value;
  } else {
    sciDisplay.value += value;
  }
}

function appendToDisplay(value) {
  if (sciDisplay.value === '0' || sciDisplay.value === 'Error') {
    sciDisplay.value = value;
  } else {
    sciDisplay.value += value;
  }
}

function clearDisplay() {
  sciDisplay.value = '0';
}

function calculateSci() {
  try {
    let expr = sciDisplay.value
      .replace(/×/g, '*')           // × → *
      .replace(/\^/g, '**')         // ^ → **
      .replace(/sqrt/g, 'Math.sqrt') // sqrt → Math.sqrt
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan');

    sciDisplay.value = eval(expr).toFixed(8).replace(/\.?0+$/, '');
  } catch (err) {
    sciDisplay.value = 'Error';
    sciDisplay.classList.add('shake');
    setTimeout(() => sciDisplay.classList.remove('shake'), 600);
  }
}

// Shake animation for error (add to head or style tag if not already there)
const shakeStyle = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-6px); }
    100% { transform: translateX(0); }
  }
  .shake { animation: shake 0.5s; }
`;
if (!document.getElementById('shake-style')) {
  const style = document.createElement('style');
  style.id = 'shake-style';
  style.textContent = shakeStyle;
  document.head.appendChild(style);
}

// To-Do & Planner
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCountEl = document.getElementById('task-count');
const clearAllBtn = document.querySelector('.clear-all-btn');

// Load saved tasks from localStorage on page load
function loadTodos() {
  const saved = localStorage.getItem('todos');
  if (saved) {
    const tasks = JSON.parse(saved);
    tasks.forEach(task => addTaskToDOM(task.text, task.completed));
    updateStats();
  }
}

// Save tasks to localStorage
function saveTodos() {
  const tasks = [];
  document.querySelectorAll('.todo-item').forEach(item => {
    tasks.push({
      text: item.querySelector('.task-text').textContent,
      completed: item.classList.contains('completed')
    });
  });
  localStorage.setItem('todos', JSON.stringify(tasks));
  updateStats();
}

// Add task to DOM
function addTaskToDOM(text, completed = false) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  if (completed) li.classList.add('completed');

  li.innerHTML = `
    <span class="task-text">${text}</span>
    <div class="task-actions">
      <button class="check-btn" onclick="toggleComplete(this)">✓</button>
      <button class="delete-btn" onclick="deleteTask(this)">✕</button>
    </div>
  `;

  todoList.appendChild(li);
  saveTodos();
}

// Add new task
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  addTaskToDOM(text);
  todoInput.value = '';
  todoInput.focus();
}

// Toggle complete
function toggleComplete(btn) {
  const li = btn.closest('.todo-item');
  li.classList.toggle('completed');
  saveTodos();
}

// Delete task
function deleteTask(btn) {
  const li = btn.closest('.todo-item');
  li.style.transform = 'translateX(100px)';
  li.style.opacity = '0';
  setTimeout(() => {
    li.remove();
    saveTodos();
  }, 400);
}

// Clear all
function clearAllTodos() {
  if (confirm("Clear all tasks?")) {
    todoList.innerHTML = '';
    saveTodos();
  }
}

// Update stats
function updateStats() {
  const total = document.querySelectorAll('.todo-item').length;
  taskCountEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;
  clearAllBtn.style.display = total > 0 ? 'block' : 'none';
}

// Live input focus
todoInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTodo();
});

// Load on page open
loadTodos();

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
function calculateAttendance() {
  const present = parseFloat(document.getElementById('att-present').value);
  const total   = parseFloat(document.getElementById('att-total').value);
  const result  = document.getElementById('att-result');

  // पहले रिजल्ट रीसेट
  result.classList.remove('show');
  result.innerHTML = '';

  if (isNaN(present) || isNaN(total) || total <= 0 || present < 0 || present > total) {
    result.innerHTML = "कृपया सही नंबर डालें (Present ≤ Total)";
    result.style.color = "#ef4444";
    result.classList.add('show');
    return;
  }

  const percentage = ((present / total) * 100).toFixed(2);
  let message = `Attendance: <span style="font-size:1.8rem;">${percentage}%</span>`;

  if (percentage >= 75) {
    message += "<br><small style='color:#10b981;'>Good! You are safe ✅</small>";
  } else if (percentage >= 60) {
    message += "<br><small style='color:#f59e0b;'>Average - Improve it ⚠️</small>";
  } else {
    message += "<br><small style='color:#ef4444;'>Low! Need to attend more classes ❌</small>";
  }

  result.innerHTML = message;
  result.classList.add('show');
}