/* =========================
   Mech 1322 — app.js (FIXED)
   ========================= */

console.log("APP OK");
console.log("students:", courseData?.students);

const STORAGE_KEY = "mechanics_course_site_v3";

let state = loadState();
let currentView = "home";

/* ====== DOM ====== */
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const viewContainer = document.getElementById("viewContainer");
const studentNameEl = document.getElementById("studentName");
const loginErrorEl = document.getElementById("loginError");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const certificateModal = document.getElementById("certificateModal");
const certificateOverlay = document.getElementById("certificateOverlay");
const certificateStudentName = document.getElementById("certificateStudentName");
const certificateSubject = document.getElementById("certificateSubject");
const certificateScore = document.getElementById("certificateScore");
const certificateWeeks = document.getElementById("certificateWeeks");
const certificateDate = document.getElementById("certificateDate");
const closeCertificateBtn = document.getElementById("closeCertificateBtn");
const downloadCertificateBtn = document.getElementById("downloadCertificateBtn");

/* ====== EVENTS ====== */
if (loginBtn) loginBtn.addEventListener("click", handleLogin);
if (logoutBtn) logoutBtn.addEventListener("click", logout);

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    renderView(btn.dataset.view);
  });
});

if (closeCertificateBtn) closeCertificateBtn.addEventListener("click", closeCertificate);
if (certificateOverlay) certificateOverlay.addEventListener("click", closeCertificate);
if (downloadCertificateBtn) downloadCertificateBtn.addEventListener("click", () => window.print());

/* ====== INIT ====== */
init();

/* =======================
   AI DEMO (без API)
   ======================= */

function renderAI() {
  viewContainer.innerHTML = `
    <section class="card">
      <h2 class="section-title">AI көмекші</h2>
      <p class="muted">Сұрағыңды жаз — мен бағыт беріп көмектесем.</p>

      <div class="ai-box">
        <div id="aiMessages" class="ai-messages"></div>

        <div class="ai-input">
          <input id="aiInput" type="text" placeholder="Мысалы: Ньютон 2-заңы, үйкеліс, 1.4 есеп..." />
          <button class="btn" id="aiSendBtn">Жіберу</button>
        </div>
      </div>
    </section>
  `;

  const aiMessages = document.getElementById("aiMessages");
  const aiInput = document.getElementById("aiInput");
  const aiSendBtn = document.getElementById("aiSendBtn");

  // кішкентай база (қаласаң кеңейтеміз)
  const KB = [
    {
      keys: ["ньютон", "2", "f=ma", "f = ma"],
      answer:
        "Ньютон 2-заңы: F⃗ = m a⃗.\nАлгоритм: 1) күштерді жаз (FBD) 2) проекция: ΣFx=max, ΣFy=may 3) белгі (+/-) дұрыс қой."
    },
    {
      keys: ["үйкеліс", "mu", "μ", "көлбеу"],
      answer:
        "Көлбеу: mg sinα төмен, N=mg cosα. Үйкеліс: Fүйк=μN=μmg cosα. Қозғалу шарты: tgα>μ."
    },
    {
      keys: ["импульс", "p=mv", "соқтығыс"],
      answer:
        "Импульс: p⃗=mv⃗. Сақталу: m1v1+m2v2=m1v1'+m2v2'. Егер жабысып қалса: v'=(m1v1+m2v2)/(m1+m2)."
    },
    {
      keys: ["жұмыс", "энергия", "w="],
      answer:
        "Жұмыс-энергия: W=ΔK, K=mv²/2. Тұрақты күш: W=F s cosφ. Үйкеліс жоқ болса: K1+U1=K2+U2."
    },
    {
      keys: ["лақтыру", "парабола", "траектория"],
      answer:
        "Лақтыру: x=v0cosα·t, y=v0sinα·t - gt²/2. Ұшу уақыты: T=2v0sinα/g. hmax=v0²sin²α/(2g)."
    }
  ];

  function addMsg(who, text) {
    const div = document.createElement("div");
    div.className = "ai-msg " + (who === "user" ? "user" : "bot");
    div.textContent = text;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function findAnswer(q) {
    const t = (q || "").toLowerCase();
    for (const item of KB) {
      if (item.keys.some((k) => t.includes(k))) return item.answer;
    }
    return "Түсіндім 🙂 Қай тақырып/есеп №? (мыс: Week 2, 1.4). Берілгенін қысқаша жазсаң, қадамдап шығару жоспарын айтып берем.";
  }

  addMsg("bot", "Сәлем! Қандай тақырып/есеп керек? (мыс: Ньютон 2-заңы, үйкеліс, Week 2 / 1.4)");

  function send() {
    const q = aiInput.value.trim();
    if (!q) return;
    addMsg("user", q);
    aiInput.value = "";
    addMsg("bot", findAnswer(q));
  }

  aiSendBtn.onclick = send;
  aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });
}

/* =======================
   CORE
   ======================= */

function init() {
  if (state.currentStudent) {
    showApp();
    renderView("home");
  } else {
    showLogin();
  }
}

function createEmptyProgress() {
  const weeks = {};
  for (let i = 1; i <= courseData.weeks.length; i++) {
    weeks[i] = {
      testDone: false,
      testScore: 0,
      selectedAnswers: [],
      practices: [
        { submitted: false, content: "" },
        { submitted: false, content: "" }
      ],
      feedback: ""
    };
  }

  return {
    weeks,
    finalQuizDone: false,
    finalQuizScore: 0,
    finalSelectedAnswers: []
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { currentStudent: null, progressByLogin: {} };
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { currentStudent: null, progressByLogin: {} };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentProgress() {
  if (!state.currentStudent) return null;
  const login = state.currentStudent.login;

  if (!state.progressByLogin[login]) {
    state.progressByLogin[login] = createEmptyProgress();
    saveState();
  }
  return state.progressByLogin[login];
}

function handleLogin() {
  const login = document.getElementById("loginInput")?.value.trim();
  const password = document.getElementById("passwordInput")?.value.trim();

  const found = courseData.students.find(
    (student) => student.login === login && student.password === password
  );

  if (!found) {
    if (loginErrorEl) loginErrorEl.textContent = "Логин немесе құпия сөз қате.";
    return;
  }

  state.currentStudent = { login: found.login, name: found.name };

  if (!state.progressByLogin[found.login]) {
    state.progressByLogin[found.login] = createEmptyProgress();
  }

  saveState();
  if (loginErrorEl) loginErrorEl.textContent = "";
  showApp();
  renderView("home");
}

function logout() {
  state.currentStudent = null;
  saveState();
  closeCertificate();
  showLogin();
}

function showLogin() {
  if (loginScreen) loginScreen.classList.remove("hidden");
  if (appScreen) appScreen.classList.add("hidden");
}

function showApp() {
  if (loginScreen) loginScreen.classList.add("hidden");
  if (appScreen) appScreen.classList.remove("hidden");
  if (state.currentStudent && studentNameEl) {
    studentNameEl.textContent = state.currentStudent.name;
  }
}

function setActiveNav(view) {
  currentView = view;
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
}

function renderView(view) {
  currentView = view;
  setActiveNav(view);

  if (view === "home") return renderHome();
  if (view === "weeks") return renderWeeks();
  if (view === "results") return renderResults();
  if (view === "ai") return renderAI();

  return renderHome();
}

/* =======================
   HOME
   ======================= */
function renderHome() {
  viewContainer.innerHTML = `
    <section class="two-col">
      <div class="card">
        <h2 class="section-title">Пән туралы толық таныстыру</h2>
        <p class="muted">${courseData.intro.replace(/\n/g, "<br><br>")}</p>

        <div class="info-grid" style="margin-top:18px;">
          <div class="info-box">
            <h4>Пән</h4>
            <p>${courseData.subject}</p>
          </div>
          <div class="info-box">
            <h4>Оқытушылар</h4>
            <p>${courseData.teachers.join("<br>")}</p>
          </div>
          <div class="info-box">
            <h4>Оқу форматы</h4>
            <p>15 апта, лекция, тест, практика, кері байланыс</p>
          </div>
          <div class="info-box">
            <h4>Қорытынды</h4>
            <p>Нәтиже және сертификат</p>
          </div>
        </div>

        <div class="start-wrap">
          <button class="primary-btn" onclick="renderView('weeks')">Сабақты бастау</button>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">Бағалау критерийі</h2>

        <table class="criteria-table">
          <thead>
            <tr>
              <th>Бөлім</th>
              <th>Балл</th>
              <th>Сипаттама</th>
            </tr>
          </thead>
          <tbody>
            ${courseData.grading
              .map(
                (item) => `
                <tr>
                  <td><b>${item.title}</b></td>
                  <td><b>${item.points}</b></td>
                  <td>${item.desc.replace(/\n/g, "<br>")}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>

        <div class="scale-list">
          ${courseData.scale
            .map((item) => `<div class="scale-item">${item}</div>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

/* =======================
   WEEKS
   ======================= */
function renderWeeks() {
  const progress = getCurrentProgress();

  viewContainer.innerHTML = `
    <section class="card">
      <h2 class="section-title">15 аптаға бөлінген сабақтар</h2>
      <p class="muted">
        Әр аптада 3 бөлім бар: <b>Лекция</b>, <b>Практика</b>, <b>Кері байланыс</b>.
        Лекцияны оқыған соң тест тапсырасың. Практикада екі есепке
        берілгенін, формулаларын, толық шығарылуын және жауабын жазасың.
      </p>
    </section>

    <section class="weeks-grid">
      ${courseData.weeks
        .map((week, index) => {
          const weekNo = index + 1;
          const wp = progress.weeks[weekNo];
          const practiceDone = wp.practices.filter((p) => p.submitted).length;
          const feedbackDone = wp.feedback.trim() ? "бар" : "жоқ";
          const fullDone =
            wp.testDone &&
            wp.practices.every((p) => p.submitted) &&
            wp.feedback.trim();

          return `
            <article class="week-card">
              <div class="week-number">${weekNo}</div>
              <h3>${week.title}</h3>
              <p>${week.short}</p>

              <div class="week-meta">
                <span class="tag">Тест: ${wp.testDone ? wp.testScore + "/4" : "жоқ"}</span>
                <span class="tag">Практика: ${practiceDone}/2</span>
                <span class="tag">Кері байланыс: ${feedbackDone}</span>
                <span class="tag">${fullDone ? "Аяқталған" : "Толық емес"}</span>
              </div>

              <button class="week-btn" onclick="openWeek(${weekNo})">Аптаны ашу</button>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function openWeek(weekNo) {
  const week = courseData.weeks[weekNo - 1];
  const progress = getCurrentProgress().weeks[weekNo];

  viewContainer.innerHTML = `
    <div class="card">
      <span class="back-link" onclick="renderView('weeks')">← 15 апта тізіміне қайту</span>

      <div class="week-header">
        <div>
          <h2 class="section-title">${weekNo}-апта. ${week.title}</h2>
          <p class="muted">${week.short}</p>
        </div>
        <div class="score-pill">
          Тест: ${progress.testDone ? progress.testScore + "/4" : "0/4"} |
          Практика: ${progress.practices.filter((p) => p.submitted).length}/2
        </div>
      </div>

      <div class="week-tabs">
        <button class="tab-btn active" onclick="showWeekTab(${weekNo}, 'lecture', this)">Лекция</button>
        <button class="tab-btn" onclick="showWeekTab(${weekNo}, 'practice', this)">Практика</button>
        <button class="tab-btn" onclick="showWeekTab(${weekNo}, 'feedback', this)">Кері байланыс</button>
      </div>

      <div id="weekTabContent"></div>
    </div>
  `;

  renderWeekTabContent(weekNo, "lecture");
}

function showWeekTab(weekNo, tab, el) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  el.classList.add("active");
  renderWeekTabContent(weekNo, tab);
}

function renderWeekTabContent(weekNo, tab) {
  const week = courseData.weeks[weekNo - 1];
  const progress = getCurrentProgress().weeks[weekNo];
  const content = document.getElementById("weekTabContent");

  if (!content) return;

  if (tab === "lecture") {
    content.innerHTML = `
      <div class="lecture-block">
        <div class="card">
          <h3 class="section-subtitle">Лекция мәтіні</h3>
          <p class="muted">${week.lecture.replace(/\n/g, "<br><br>")}</p>
        </div>

        <div class="card">
          <h3 class="section-subtitle">Негізгі формулалар</h3>
          <div class="formula-box">${week.formulas.join("<br>")}</div>
        </div>

        <div class="card">
          <h3 class="section-subtitle">Лекция соңындағы тест</h3>
          ${
            progress.testDone
              ? `<p class="locked-note">Тест бір рет тапсырылды. Нәтиже: ${progress.testScore}/4</p>`
              : ""
          }

          ${week.tests
            .map(
              (item, qIndex) => `
                <div class="test-card question-item">
                  <b>${qIndex + 1}. ${item.q}</b>
                  <div class="options-list">
                    ${item.options
                      .map(
                        (opt, optIndex) => `
                          <label class="option">
                            <input
                              type="radio"
                              name="week${weekNo}_q${qIndex}"
                              value="${optIndex}"
                              ${progress.testDone ? "disabled" : ""}
                            >
                            <span>${opt}</span>
                          </label>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              `
            )
            .join("")}

          ${
            progress.testDone
              ? ""
              : `<button class="submit-btn" onclick="submitWeekTest(${weekNo})">Тестті аяқтау</button>`
          }
        </div>
      </div>
    `;
    return;
  }

  if (tab === "practice") {
    content.innerHTML = `
      <div class="warning-note">
        Бұл бөлім Волькенштейн типіндегі механика есептеріне сай жасалған.
        Әр есепке берілгенін, SI жүйесіне келтіруді, формуланы, толық шығарылуын және жауабын жазыңдар.
      </div>

      ${week.practices
        .map((task, index) => {
          const item = progress.practices[index];
          return `
            <div class="practice-card">
              <h3 class="section-subtitle">${task.title}</h3>
              <p class="muted"><b>Шарт:</b> ${task.prompt}</p>
              <p class="small-note"><b>Көмек:</b> ${task.hint}</p>

              <textarea
                id="practice_${weekNo}_${index}"
                class="textarea"
                placeholder="Берілгені, SI, формула, түрлендіру, есептеу, толық шығарылуы, жауабы..."
                ${item.submitted ? "disabled" : ""}
              >${item.content}</textarea>

              <div class="practice-actions">
                ${
                  item.submitted
                    ? `<span class="locked-note">Бұл есеп жіберілген.</span>`
                    : `<button class="submit-btn" onclick="submitPractice(${weekNo}, ${index})">Есепті жіберу</button>`
                }
              </div>
            </div>
          `;
        })
        .join("")}
    `;
    return;
  }

  if (tab === "feedback") {
    content.innerHTML = `
      <div class="feedback-card">
        <h3 class="section-subtitle">Кері байланыс</h3>
        <p class="muted">
          Қай жері түсініксіз болғанын, қандай формула қиын болғанын,
          немесе тағы нені қайталау керек екенін жазыңдар.
        </p>

        <textarea
          id="feedbackArea"
          class="textarea"
          placeholder="Мысалы: Бұл аптада үдеу формулаларын ажырату қиын болды..."
        >${progress.feedback}</textarea>

        <div class="practice-actions">
          <button class="submit-btn" onclick="saveFeedback(${weekNo})">Кері байланысты сақтау</button>
        </div>

        ${
          progress.feedback.trim()
            ? `<p class="locked-note">Кері байланыс сақталған.</p>`
            : ""
        }
      </div>
    `;
    return;
  }
}

function submitWeekTest(weekNo) {
  const week = courseData.weeks[weekNo - 1];
  const progress = getCurrentProgress().weeks[weekNo];
  if (progress.testDone) return;

  let score = 0;
  const selectedAnswers = [];

  for (let i = 0; i < week.tests.length; i++) {
    const checked = document.querySelector(`input[name="week${weekNo}_q${i}"]:checked`);
    if (!checked) {
      alert("Барлық сұраққа жауап бер.");
      return;
    }
    const value = Number(checked.value);
    selectedAnswers.push(value);
    if (value === week.tests[i].answer) score++;
  }

  progress.testDone = true;
  progress.testScore = score;
  progress.selectedAnswers = selectedAnswers;

  saveState();
  alert(`Тест аяқталды. Нәтиже: ${score}/4`);
  openWeek(weekNo);
}

function submitPractice(weekNo, taskIndex) {
  const textarea = document.getElementById(`practice_${weekNo}_${taskIndex}`);
  const text = (textarea?.value || "").trim();

  if (text.length < 30) {
    alert("Есептің толық шығарылуын толығырақ жаз.");
    return;
  }

  const progress = getCurrentProgress().weeks[weekNo];
  progress.practices[taskIndex].submitted = true;
  progress.practices[taskIndex].content = text;

  saveState();
  alert("Есеп жіберілді.");
  renderWeekTabContent(weekNo, "practice");
}

function saveFeedback(weekNo) {
  const text = (document.getElementById("feedbackArea")?.value || "").trim();
  const progress = getCurrentProgress().weeks[weekNo];

  progress.feedback = text;
  saveState();

  alert("Кері байланыс сақталды.");
  renderWeekTabContent(weekNo, "feedback");
}

/* =======================
   RESULTS + CERT
   ======================= */

function calculateResults() {
  const progress = getCurrentProgress();

  let earnedTestQuestions = 0;
  let completedPractices = 0;
  let completedFeedbacks = 0;
  let completedWeeks = 0;

  courseData.weeks.forEach((week, index) => {
    const weekNo = index + 1;
    const wp = progress.weeks[weekNo];

    earnedTestQuestions += wp.testScore;
    completedPractices += wp.practices.filter((p) => p.submitted).length;

    if (wp.feedback.trim()) completedFeedbacks++;

    const fullDone =
      wp.testDone &&
      wp.practices.every((p) => p.submitted) &&
      wp.feedback.trim();

    if (fullDone) completedWeeks++;
  });

  const totalTestQuestions = courseData.weeks.length * 4;
  const totalPracticeCount = courseData.weeks.length * 2;

  const lecturePoints = round2((earnedTestQuestions / totalTestQuestions) * 20);
  const practicePoints = round2((completedPractices / totalPracticeCount) * 50);
  const feedbackPoints = round2((completedFeedbacks / courseData.weeks.length) * 10);
  const finalPoints = round2((progress.finalQuizScore / courseData.finalQuiz.length) * 20);

  const total = round2(lecturePoints + practicePoints + feedbackPoints + finalPoints);

  return {
    lecturePoints,
    practicePoints,
    feedbackPoints,
    finalPoints,
    total,
    earnedTestQuestions,
    completedPractices,
    completedFeedbacks,
    completedWeeks
  };
}

function getGradeLabel(total) {
  if (total >= 90) return "A / A- — Өте жақсы";
  if (total >= 75) return "B+ / B / B- — Жақсы";
  if (total >= 50) return "C+ / C / C- / D — Қанағаттанарлық";
  return "F — Қанағаттанарлықсыз";
}

function renderResults() {
  const progress = getCurrentProgress();
  const result = calculateResults();
  const canGetCertificate =
    result.completedWeeks >= courseData.weeks.length && progress.finalQuizDone;

  viewContainer.innerHTML = `
    <section class="card">
      <h2 class="section-title">15 аптаның нәтижесі</h2>
      <p class="muted">
        Бұл бөлімде лекциялық бақылау, практикалық жұмыс, кері байланыс
        және қорытынды бақылау бойынша жинақталған жалпы нәтиже көрсетіледі.
      </p>

      <div class="result-grid">
        <div class="result-box">
          <h4>Лекциялық бақылау</h4>
          <div class="result-number">${result.lecturePoints}</div>
          <div class="small-note">20 баллдан</div>
        </div>

        <div class="result-box">
          <h4>Практикалық жұмыс</h4>
          <div class="result-number">${result.practicePoints}</div>
          <div class="small-note">50 баллдан</div>
        </div>

        <div class="result-box">
          <h4>Кері байланыс</h4>
          <div class="result-number">${result.feedbackPoints}</div>
          <div class="small-note">10 баллдан</div>
        </div>

        <div class="result-box">
          <h4>Қорытынды бақылау</h4>
          <div class="result-number">${result.finalPoints}</div>
          <div class="small-note">20 баллдан</div>
        </div>
      </div>

      <div class="card" style="margin-top:18px;">
        <h3 class="section-subtitle">Жалпы қорытынды</h3>
        <p class="muted">Жалпы балл: <b>${result.total}</b> / 100</p>
        <p class="muted">Баға: <b>${getGradeLabel(result.total)}</b></p>
        <p class="muted">Лекция сұрақтары: <b>${result.earnedTestQuestions}</b> / ${courseData.weeks.length * 4}</p>
        <p class="muted">Практика орындалуы: <b>${result.completedPractices}</b> / ${courseData.weeks.length * 2}</p>
        <p class="muted">Кері байланыс саны: <b>${result.completedFeedbacks}</b> / ${courseData.weeks.length}</p>
        <p class="muted">Толық аяқталған апта: <b>${result.completedWeeks}</b> / ${courseData.weeks.length}</p>
      </div>

      <div class="progress-list">
        ${courseData.weeks
          .map((week, index) => {
            const weekNo = index + 1;
            const wp = progress.weeks[weekNo];
            const fullDone =
              wp.testDone &&
              wp.practices.every((p) => p.submitted) &&
              wp.feedback.trim();

            return `
              <div class="progress-row">
                <div class="progress-left">
                  <span class="week-number">${weekNo}</span>
                  <div>
                    <b>${week.title}</b>
                    <div class="small-note">
                      Тест: ${wp.testDone ? wp.testScore + "/4" : "жоқ"} |
                      Практика: ${wp.practices.filter((p) => p.submitted).length}/2 |
                      Кері байланыс: ${wp.feedback.trim() ? "бар" : "жоқ"}
                    </div>
                  </div>
                </div>
                <div class="progress-status ${fullDone ? "status-good" : "status-bad"}">
                  ${fullDone ? "Аяқталған" : "Толық емес"}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>

    ${renderFinalQuizBlock(progress)}

    <section class="card">
      <h3 class="section-subtitle">Курс аяқталуы</h3>
      <p class="muted">
        Сертификат алу үшін барлық 15 апта толық орындалуы және қорытынды бақылау тапсырылуы керек.
      </p>
      ${
        canGetCertificate
          ? `<button class="print-btn" onclick="openCertificate()">Сертификатты алу</button>`
          : `<button class="print-btn" disabled style="opacity:0.6; cursor:not-allowed;">Сертификат әлі қолжетімсіз</button>`
      }
    </section>
  `;
}

function renderFinalQuizBlock(progress) {
  if (progress.finalQuizDone) {
    return `
      <section class="card final-quiz-card">
        <h3 class="section-subtitle">Қорытынды бақылау</h3>
        <p class="locked-note">
          Қорытынды бақылау тапсырылды. Нәтиже: ${progress.finalQuizScore}/${courseData.finalQuiz.length}
        </p>
      </section>
    `;
  }

  return `
    <section class="card final-quiz-card">
      <h3 class="section-subtitle">Қорытынды бақылау</h3>
      <p class="muted">
        Бұл бөлім 20 баллдық қорытынды бақылауға жатады. Барлық сұраққа жауап беріп, нәтижені бекітіңдер.
      </p>

      ${courseData.finalQuiz
        .map(
          (item, qIndex) => `
            <div class="question-item">
              <b>${qIndex + 1}. ${item.q}</b>
              <div class="options-list">
                ${item.options
                  .map(
                    (opt, optIndex) => `
                      <label class="option">
                        <input type="radio" name="final_q${qIndex}" value="${optIndex}">
                        <span>${opt}</span>
                      </label>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
        )
        .join("")}

      <button class="submit-btn" onclick="submitFinalQuiz()">Қорытынды бақылауды аяқтау</button>
    </section>
  `;
}

function submitFinalQuiz() {
  const progress = getCurrentProgress();

  let score = 0;
  const selected = [];

  for (let i = 0; i < courseData.finalQuiz.length; i++) {
    const checked = document.querySelector(`input[name="final_q${i}"]:checked`);
    if (!checked) {
      alert("Қорытынды бақылауда барлық сұраққа жауап бер.");
      return;
    }

    const value = Number(checked.value);
    selected.push(value);

    if (value === courseData.finalQuiz[i].answer) score++;
  }

  progress.finalQuizDone = true;
  progress.finalQuizScore = score;
  progress.finalSelectedAnswers = selected;

  saveState();
  alert(`Қорытынды бақылау аяқталды. Нәтиже: ${score}/${courseData.finalQuiz.length}`);
  renderResults();
}

function openCertificate() {
  const progress = getCurrentProgress();
  const result = calculateResults();

  const canGetCertificate =
    result.completedWeeks >= courseData.weeks.length && progress.finalQuizDone;

  if (!canGetCertificate) {
    alert("Сертификат алу үшін барлық 15 апта толық орындалуы және қорытынды бақылау тапсырылуы керек.");
    return;
  }

  certificateStudentName.textContent = state.currentStudent.name;
  certificateSubject.textContent = courseData.subject;
  certificateScore.textContent = `${result.total} / 100`;
  certificateWeeks.textContent = `${result.completedWeeks} / ${courseData.weeks.length}`;
  certificateDate.textContent = new Date().toLocaleDateString("kk-KZ");

  certificateModal.classList.remove("hidden");
}

function closeCertificate() {
  certificateModal.classList.add("hidden");
}

function round2(num) {
  return Math.round(num * 100) / 100;
}

/* inline onclick үшін */
window.renderView = renderView;
window.openWeek = openWeek;
window.showWeekTab = showWeekTab;
window.submitWeekTest = submitWeekTest;
window.submitPractice = submitPractice;
window.saveFeedback = saveFeedback;
window.submitFinalQuiz = submitFinalQuiz;
window.openCertificate = openCertificate;
