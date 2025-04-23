document.addEventListener("DOMContentLoaded", () => {
  const loadQuestions = async () => {
    const response = await fetch("../assets/data/quiz-question.json");
    return await response.json();
  };

  const root = document.documentElement;
  const rootStyle = getComputedStyle(root);
  const startDisplay = document.querySelector("#quiz-start");
  const startButton = document.querySelector("#start-button");
  const quizBox = document.querySelector("#quiz-box");

  // Style the start button
  startButton.style.backgroundColor =
    rootStyle.getPropertyValue("--secondary-color");

  startButton.addEventListener("click", async () => {
    const questionAmount = parseInt(
      document.getElementById("question-choice").value,
    );
    if (questionAmount < 1 || questionAmount > 20 || isNaN(questionAmount)) {
      alert("Please enter a number between 1 and 20");
      return;
    }

    startDisplay.style.display = "none";
    quizBox.innerHTML = `
      <form id="quiz-form"></form>
      <p id="quiz-correct"></p>
    `;

    const form = document.getElementById("quiz-form");
    const allQuestions = await loadQuestions();
    const selectedQuestions = [];

    // Randomly select unique questions
    const usedIndices = new Set();
    while (selectedQuestions.length < questionAmount) {
      const randIndex = Math.floor(Math.random() * allQuestions.length);
      if (!usedIndices.has(randIndex)) {
        usedIndices.add(randIndex);
        selectedQuestions.push(allQuestions[randIndex]);
      }
    }

    let formHTML = "<h1>Quiz</h1>";

    selectedQuestions.forEach((q, i) => {
      formHTML += `
        <div class="question">
          <h3>${q.question}</h3>
          ${q.options
            .map(
              (opt, idx) => `
            <input type="radio" name="q${i}" id="q${i}-opt${idx}" value="${opt}">
            <label for="q${i}-opt${idx}">${opt}</label><br>
          `,
            )
            .join("")}
        </div>
      `;
    });

    formHTML += `<button type="submit">Submit</button>`;
    form.innerHTML = formHTML;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let score = 0;
      const incorrectQuestions = [];

      selectedQuestions.forEach((q, i) => {
        const selected = form.querySelector(`input[name="q${i}"]:checked`);
        const selectedValue = selected ? selected.value : null;
        const correctValue = q.options[q.correctAnswerIndex];

        if (selectedValue === correctValue) {
          score++;
        } else {
          incorrectQuestions.push({
            question: q.question,
            options: q.options,
            selected: selectedValue,
            correct: correctValue,
          });
        }
      });

      const resultData = {
        score,
        total: selectedQuestions.length,
        incorrectQuestions,
      };

      localStorage.setItem("quizResults", JSON.stringify(resultData));
      window.location.href = "quiz-results.html";
    });
  });
});
