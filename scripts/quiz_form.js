const data = `Pizza is good, yes, no, pineapple, pie, 3
  Pizza is bad, no, yes, pepperoni, pizza, 1`
const quizData = data.split('\n').map(row => row.split(',').map(cell => cell.trim()));
const amount = 2;
const form = document.getElementById("quiz-form");
let formString = '<h1>Quiz</h1>';
const correctAnswers = [];

for (let i = 0; i < amount; i++) {
  correctAnswers.push(quizData[i][5]);
  formString += `
  <div class="question">
      <h3>${quizData[i][0]}</h3>
      <input type="radio" name="${i}" id="1-${quizData[i][1]}" value="${quizData[i][1]}">
      <label for="${quizData[i][1]}">${quizData[i][1]}</label><br>
      <input type="radio" name="${i}" id="2-${quizData[i][2]}" value="${quizData[i][2]}">
      <label for="${quizData[i][2]}">${quizData[i][2]}</label><br>
      <input type="radio" name="${i}" id="3-${quizData[i][3]}" value="${quizData[i][3]}">
      <label for="${quizData[i][3]}">${quizData[i][3]}</label>
      <input type="radio" name="${i}" id="4-${quizData[i][4]}" value="${quizData[i][4]}">
      <label for="${quizData[i][4]}">${quizData[i][4]}</label>
  </div>
  `;
}

formString += `<button type="submit">Submit</button>`;
form.innerHTML = formString;

form.addEventListener('submit', function(event) {
  event.preventDefault();
  let correctCount = 0;

  for (let i = 0; i < amount; i++) {
    const selectedOption = form.querySelector(`input[name="${i}"]:checked`);
    if (selectedOption && selectedOption.id[0] == correctAnswers[i]) {
      correctCount++;
    }
  }

  document.getElementById("quiz-correct").innerHTML = `Number of correct answers: ${correctCount}`;
});
