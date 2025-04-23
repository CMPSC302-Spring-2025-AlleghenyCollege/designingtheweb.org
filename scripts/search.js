document.addEventListener("DOMContentLoaded", function () {
  // Search functionality
  document
    .getElementById("search-button")
    .addEventListener("click", function () {
      searchAndScroll();
      console.log("yes");
    });

  document
    .getElementById("search-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        // Enter key pressed
        searchAndScroll();
      }
    });

  function searchAndScroll() {
    var searchTerm = document
      .getElementById("search-input")
      .value.toLowerCase();
    if (searchTerm) {
      var found = false;
      var divs = document.querySelectorAll("div");
      divs.forEach(function (div) {
        if (div.textContent.toLowerCase().includes(searchTerm)) {
          window.scrollTo({
            top: div.offsetTop,
            behavior: "smooth",
          });
          found = true;
          return false; // Break the loop
        }
      });
      if (!found) {
        alert("No results found");
      }
    }
  }
});
