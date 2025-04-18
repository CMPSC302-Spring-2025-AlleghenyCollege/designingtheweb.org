document.addEventListener("DOMContentLoaded", async function () {
    // Ensure the DOM is fully loaded before attaching the event
    const loadQuestions = async () => {
        const response = await fetch("../assets/data/quiz-question.json")
        const questions = await response.json()
        return questions
    }

    const root = document.documentElement;
    const root_style = getComputedStyle(root);
    const startDisplay = document.querySelector("#quiz-start");
    const start = document.querySelector("#start-button");
    const box = document.querySelector("#quiz-box");

    // Start button styling
    start.style.backgroundColor = root_style.getPropertyValue('--secondary-color')


    function startQuiz() {
      startDisplay.style.display = "none"
      box.innerHTML = `
        <form id="quiz-form">
        </form>
        <p id="quiz-correct"></p>`;

      const amount = document.getElementById("question-choice").value;
      const form = document.getElementById("quiz-form");
      let formString = '<h1>Quiz</h1>';
      const correctAnswers = [];

      loadQuestions().then((quizData) => {
        numPicked = [];

        for (let i = 0; i < amount; i++) {
          var question = Math.floor(Math.random() * quizData.length);

          correctAnswers.push(quizData[question].correctAnswerIndex + 1);
          formString += `
            <div class="question">
                <h3>${quizData[question].question}</h3>
                <input type="radio" name="${i}" id="${i}-1-${quizData[question].options[0]}" value="${quizData[question].options[0]}">
                <label for="${i}-1-${quizData[question].options[0]}">${quizData[question].options[0]}</label><br>
                <input type="radio" name="${i}" id="${i}-2-${quizData[question].options[1]}" value="${quizData[question].options[1]}">
                <label for="${i}-2-${quizData[question].options[1]}">${quizData[question].options[1]}</label><br>
                <input type="radio" name="${i}" id="${i}-3-${quizData[question].options[2]}" value="${quizData[question].options[2]}">
                <label for="${i}-3-${quizData[question].options[2]}">${quizData[question].options[2]}</label>
                <input type="radio" name="${i}" id="${i}-4-${quizData[question].options[3]}" value="${quizData[question].options[3]}">
                <label for="${i}-4-${quizData[question].options[3]}">${quizData[question].options[3]}</label>
            </div>
            `;

            numPicked.push(question);
        }

        formString += `<button type="submit">Submit</button>`;
        form.innerHTML = formString;
      });



      form.addEventListener('submit', function(event) {
        event.preventDefault();
        let correctCount = 0;

        for (let i = 0; i < amount; i++) {
          let selectedOption = form.querySelector(`input[name="${i}"]:checked`);
          if (selectedOption && parseInt(selectedOption.id[2]) == correctAnswers[i]) {
            correctCount++;
          }
        }

        document.getElementById("quiz-correct").innerHTML = `Number of correct answers: ${correctCount}`;
      });
    }

    // Add event listener to start the quiz when the button is clicked
    start.addEventListener("click", () => {
      console.log(document.getElementById("question-choice").value)
      if (1 <= document.getElementById("question-choice").value && document.getElementById("question-choice").value <= 100) {
        startQuiz();
      } else {
        alert("Please enter a number between 1 and 100");
      }
    });
});
