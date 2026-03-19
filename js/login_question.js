document.addEventListener("DOMContentLoaded", () => {
  // copy WAEC to NECO and JAMB for demo
  QUESTION_BANK["NECO"] = JSON.parse(JSON.stringify(QUESTION_BANK["WAEC"]));
  QUESTION_BANK["JAMB"] = JSON.parse(JSON.stringify(QUESTION_BANK["WAEC"]));

  /* ---------- VARIABLES ---------- */
  let studentName = "",
    studentNumber = "",
    examSel = "",
    catSel = "",
    subSel = "",
    questions = [],
    current = 0,
    answers = {},
    timer,
    timeLeft = 0,
    totalTime = 0;

  /* ---------- LOGIN ---------- */
  async function loginStudent() {
    studentName = document.getElementById("studentName").value.trim();
    studentNumber = document.getElementById("studentNumber").value.trim();

    if (!studentName || !studentNumber) {
      return alert("Enter fullname and School name to proceed");
    }

    // ✅ Validate AMEIRA PASSWORD.....................AMS NYSC SDG...4

    // const validExamNumbers = Array.from({length: 4}, (_, i) => `AMS NYSC SDG${i+1}`);
    //   if (!validExamNumbers.includes(studentNumber.toUpperCase())) {
    //      return alert("Invalid school name! Input the correct school");
    //    }

    // ✅ Continue if valid
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    loadExams();
    const result = await DBgetStudents();
    console.log(result);
    // ✅ Save student immediately
    await DBsaveStudent(studentName, studentNumber);
  }

  document.getElementById("loginBtn").addEventListener("click", loginStudent);

  function loadExams() {
    const examSelect = document.getElementById("examSelect");
    Object.keys(QUESTION_BANK).forEach(
      (ex) => (examSelect.innerHTML += `<option>${ex}</option>`),
    );
  }

  /* ---------- FLOW ---------- */
  document.getElementById("examSelect").addEventListener("change", (e) => {
    examSel = e.target.value;
    const catSelBox = document.getElementById("categorySelect");
    catSelBox.innerHTML = "<option>-- Select Category --</option>";
    if (examSel) {
      Object.keys(QUESTION_BANK[examSel]).forEach(
        (c) => (catSelBox.innerHTML += `<option>${c}</option>`),
      );
    }
  });
  document.getElementById("categorySelect").addEventListener("change", (e) => {
    catSel = e.target.value;
    const subSelBox = document.getElementById("subjectSelect");
    subSelBox.innerHTML = "<option>-- Select Subject --</option>";
    if (examSel && catSel) {
      Object.keys(QUESTION_BANK[examSel][catSel]).forEach(
        (s) => (subSelBox.innerHTML += `<option>${s}</option>`),
      );
    }
  });
  document
    .getElementById("subjectSelect")
    .addEventListener("change", (e) => (subSel = e.target.value));

  document.getElementById("startBtn").onclick = async () => {
    if (!examSel || !catSel || !subSel)
      return alert("Select exam, category, subject");

    let loadedQuestions;

    try {
      loadedQuestions = await getQuestions(examSel, catSel, subSel);
    } catch (e) {
      console.error("getQuestions error:", e);
    }

    if (!Array.isArray(loadedQuestions)) {
      loadedQuestions = QUESTION_BANK[examSel][catSel][subSel];
    }

    let allQuestions = [...loadedQuestions];
    allQuestions.sort(() => Math.random() - 0.5);
    questions = allQuestions.slice(0, 60);

    totalTime = questions.length * 30;
    timeLeft = totalTime;

    document.getElementById("candName").textContent = studentName;
    document.getElementById("candNumber").textContent = studentNumber;
    document.getElementById("examLabel").textContent = examSel;
    document.getElementById("catLabel").textContent = catSel;
    document.getElementById("subLabel").textContent = subSel;
    document.getElementById("timeAllowed").textContent = (
      totalTime / 60
    ).toFixed(1);
    document.getElementById("qCount").textContent = questions.length;

    document.getElementById("instructionsView").style.display = "block";
    document.getElementById("startExam").style.display = "none";
  };

  /* ---------- INSTRUCTIONS TO EXAM ---------- */
  document.getElementById("continueBtn").onclick = () => {
    document.getElementById("instructionsView").style.display = "none";
    document.getElementById("examView").style.display = "block";
    current = 0;
    answers = {};
    renderQuestion();
    startTimer();
  };

  /* ---------- EXAM ---------- */
  function renderQuestion() {
    const q = questions[current];
    let html = `<div class="question"><p><strong>Q${current + 1}:</strong> ${q.q}</p>`;
    q.opts.forEach((opt, i) => {
      const checked = answers[current] === i ? "checked" : "";
      html += `<label><input type="radio" name="q${current}" value="${i}" ${checked} onchange="selectAnswer(${current},${i})"/> ${opt}</label><br>`;
    });
    html += "</div>";
    document.getElementById("questionContainer").innerHTML = html;
    updateProgress();
    renderPagination();
  }
  function selectAnswer(qIndex, opt) {
    answers[qIndex] = opt;
    renderPagination();
  }
  function renderPagination() {
    const pag = document.getElementById("pagination");
    pag.innerHTML = "";
    questions.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.className =
        "page-btn" +
        (i === current ? " active" : "") +
        (answers[i] == null ? " unanswered" : "");
      btn.textContent = i + 1;
      btn.onclick = () => {
        current = i;
        renderQuestion();
      };
      pag.appendChild(btn);
    });
  }
  function updateProgress() {
    const done = Object.keys(answers).length,
      total = questions.length;
    document.getElementById("progressText").textContent =
      `Answered: ${done}/${total}`;
    document.getElementById("progressBar").style.width =
      `${(done / total) * 100}%`;
  }
  document.getElementById("nextBtn").onclick = () => {
    if (current < questions.length - 1) {
      current++;
      renderQuestion();
    }
  };
  document.getElementById("prevBtn").onclick = () => {
    if (current > 0) {
      current--;
      renderQuestion();
    }
  };
  document.getElementById("finishBtn").onclick = submitExam;
  document.getElementById("submitBtn").onclick = submitExam;

  /* ---------- TIMER ---------- */
  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      let m = Math.floor(timeLeft / 60),
        s = timeLeft % 60;
      document.getElementById("timer").textContent =
        `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        submitExam();
      }
    }, 1000);
  }

  // new line code that safe to database student record with exam result
  async function saveResult(score, percent) {
    try {
      const locationRes = await fetch("https://ipapi.co/json/");
      const location = await locationRes.json();

      await fetch("/api/save-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: studentName,
          school: studentNumber,
          exam: examType,
          subject: subjectName,

          score: score,
          percentage: percent,

          device: navigator.userAgent,
          city: location.city,
          country: location.country,
        }),
      });
    } catch (err) {
      console.log("Result save error:", err);
    }
  }
  /* ---------- SUBMIT ---------- */
  function submitExam() {
    clearInterval(timer);
    document.getElementById("examView").style.display = "none";
    document.getElementById("resultView").style.display = "block";
    let score = 0;
    let corrHTML = "";
    questions.forEach((q, i) => {
      if (answers[i] === q.ans) score++;
      corrHTML += `<p><strong>Q${i + 1}:</strong> ${q.q}<br>
    Your answer: ${answers[i] != null ? q.opts[answers[i]] : "Not answered"}<br>
    Correct answer: ${q.opts[q.ans]}</p>`;
    });
    const percent = Math.round((score / questions.length) * 100);
    const grade = percent >= 70 ? "Excellent" : percent >= 50 ? "Good" : "Poor";
    const scoreBox = document.getElementById("scoreBox");
    scoreBox.className = "score " + (percent >= 50 ? "pass" : "fail");
    scoreBox.textContent = `${studentName} (${studentNumber}) scored ${score}/${questions.length} = ${percent}% - ${grade}`;
    document.getElementById("corrections").innerHTML = corrHTML;

    /* SAVE RESULT TO DATABASE */
    saveResult(score, percent);
  }

  /* ---------- RETAKE ---------- */
  function retakeExam() {
    document.getElementById("resultView").style.display = "none";
    document.getElementById("instructionsView").style.display = "block";
  }

  /* ---------- PDF ---------- */
  function downloadPDF() {
    if (!window.jspdf) {
      alert("jsPDF not loaded");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    // Title
    doc.setFontSize(14);
    doc.text("NYSC SDG 4 – Quality Education", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text("CBT Examination Result", 10, y);
    y += 10;

    // Candidate Info
    doc.text(`Candidate: ${studentName} (${studentNumber})`, 10, y);
    y += 8;
    doc.text(`Exam: ${examSel}`, 10, y);
    y += 8;
    doc.text(`Category: ${catSel}`, 10, y);
    y += 8;
    doc.text(`Subject: ${subSel}`, 10, y);
    y += 12;

    // Score
    const totalQ = questions.length;
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.ans) correct++;
    });
    const percent = Math.round((correct / totalQ) * 100);
    const grade = percent >= 70 ? "Excellent" : percent >= 50 ? "Good" : "Poor";

    doc.text(`Total Questions: ${totalQ}`, 10, y);
    y += 8;
    doc.text(`Correct Answers: ${correct}`, 10, y);
    y += 8;
    doc.text(`Score: ${percent}%`, 10, y);
    y += 8;
    doc.text(`Grade: ${grade}`, 10, y);
    y += 12;

    // Corrections
    doc.setFontSize(11);
    doc.text("Corrections:", 10, y);
    y += 8;
    questions.forEach((q, i) => {
      let userAns =
        answers[i] !== undefined ? q.opts[answers[i]] : "Not answered";
      let correctAns = q.opts[q.ans];

      doc.text(`Q${i + 1}: ${q.q}`, 10, y, { maxWidth: 190 });
      y += 6;
      doc.text(`Your Answer: ${userAns}`, 15, y, { maxWidth: 180 });
      y += 6;
      doc.text(`Correct Answer: ${correctAns}`, 15, y, { maxWidth: 180 });
      y += 8;
      //  doc.setTextColor(255, 0, 0); // Red color for correct answers

      if (y > 270) {
        // new page if needed
        doc.addPage();
        y = 20;
      }
    });

    // Save PDF
    doc.save(`Result_${studentNumber}.pdf`);
  }

  document.getElementById("retakeBtn").addEventListener("click", retakeExam);
  document.getElementById("pdfBtn").addEventListener("click", downloadPDF);

  function goBackToLogin() {
    // Check if user is currently in exam
    const examView = document.getElementById("examView");
    const inExam = examView && examView.style.display === "block";

    if (inExam) {
      const confirmExit = confirm(
        "You are in the middle of an exam. Going back will end your exam. Do you want to continue?",
      );
      if (!confirmExit) {
        return; // cancel going back
      }
    }

    // stop & clear timer if running
    try {
      if (typeof timer !== "undefined" && timer) {
        clearInterval(timer);
      }
    } catch (e) {}
    timer = null;
    timeLeft = 0;
    totalTime = 0;

    // Reset app state variables
    studentName = "";
    studentNumber = "";
    examSel = "";
    catSel = "";
    subSel = "";
    questions = [];
    current = 0;
    answers = {};

    // Hide everything except login
    const idsToHide = [
      "mainApp",
      "startExam",
      "instructionsView",
      "examView",
      "resultView",
      "examSelectPage",
      "mainPanel",
    ];
    idsToHide.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    // Show login page
    const lp = document.getElementById("loginPage");
    if (lp) lp.style.display = "flex";

    // Reset login inputs
    const nameInput = document.getElementById("studentName");
    const numInput = document.getElementById("studentNumber");
    if (nameInput) {
      nameInput.value = "";
      nameInput.focus();
    }
    if (numInput) numInput.value = "";

    // Reset selects
    const examSelect = document.getElementById("examSelect");
    const catSelect = document.getElementById("categorySelect");
    const subSelect = document.getElementById("subjectSelect");
    if (examSelect) examSelect.selectedIndex = 0;
    if (catSelect)
      catSelect.innerHTML = "<option value=''>-- Select Category --</option>";
    if (subSelect)
      subSelect.innerHTML = "<option value=''>-- Select Subject --</option>";

    // Reset UI
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = "--:--";
    const progressText = document.getElementById("progressText");
    if (progressText) progressText.textContent = "";
    const progressBar = document.getElementById("progressBar");
    if (progressBar) progressBar.style.width = "0%";
    const questionContainer = document.getElementById("questionContainer");
    if (questionContainer) questionContainer.innerHTML = "";
    const pagination = document.getElementById("pagination");
    if (pagination) pagination.innerHTML = "";
    const scoreBox = document.getElementById("scoreBox");
    if (scoreBox) {
      scoreBox.className = "";
      scoreBox.textContent = "";
    }
    const corrections = document.getElementById("corrections");
    if (corrections) corrections.innerHTML = "";
  }

  document
    .getElementById("goBackToLoginBtn")
    .addEventListener("click", goBackToLogin);
});
