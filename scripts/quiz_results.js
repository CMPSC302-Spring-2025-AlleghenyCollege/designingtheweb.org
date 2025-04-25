document.addEventListener("DOMContentLoaded", () => {
  const results = JSON.parse(localStorage.getItem("quizResults"));

  const resultsBox = document.getElementById("quiz-results");

  if (!results) {
    resultsBox.innerHTML = "<p>No quiz results found.</p>";
    return;
  }

  // Display the score
  resultsBox.innerHTML = `
    <h1>Your Score: ${results.score} / ${results.total}</h1>
    <h2>Incorrect Questions:</h2>
  `;

  // Show missed questions or a perfect score message
  if (results.incorrectQuestions.length === 0) {
    resultsBox.innerHTML += "<p>Nice! You got everything correct!</p>";
  } else {
    results.incorrectQuestions.forEach((item, index) => {
      resultsBox.innerHTML += `
        <div class="incorrect-question">
          <h3>Question ${index + 1}: ${item.question}</h3>
          <p><strong>Your Answer:</strong> ${item.selected ?? "(no answer)"}</p>
          <p><strong>Correct Answer:</strong> ${item.correct}</p>
        </div>
        <hr>
      `;
    });
  }
});
