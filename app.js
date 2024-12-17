// Declare global variables
let finalArray = [];
let dontTouch = [];
let currentSort = "date-published";
let defaultWeights =  {
    forking: 1 / 100,
    size: 1 / 100,
    commits: 1 / 100,
    watchers: 1 / 100,
    issues: 1/100
};

// Initial DOM Load
document.addEventListener("DOMContentLoaded", function (event) {
  const promiseArray = paginated_fetch(); // API call
  const sortButton = document.getElementById("sortMenuButton"); // initialize Sort tool
  const defaultSorting = "Date Published";
  sortButton.textContent = `Sorting By ${defaultSorting}`;

  // Add functionality to Sorting Dropdown
  const sortingOptions = document.querySelectorAll(".dropdown-item");
  sortingOptions.forEach((item) => {
    item.addEventListener("click", (event) => {
      const selectedOption = event.target.textContent;
      const category = event.target.id; // date-published', 'date-accessed'
      sortButton.textContent = `Sorting By ${selectedOption}`;
      sortReposByCategory(category);
    });
  }); 
});

// VARIABLES
const forkingSlider = document.getElementById("forking-slider");
const commitsSlider = document.getElementById("commits-slider");
const sizeSlider = document.getElementById("size-slider");
const watchersSlider = document.getElementById("watchers-slider");
const issuesSlider = document.getElementById("issues-slider");

// EVENT LISTENERs

// add slider fucntionality
[forkingSlider, commitsSlider, sizeSlider, watchersSlider, issuesSlider].forEach((slider) => {
  slider.addEventListener("input", () => {
    // show new score
    const value = slider.value;
    const element = slider.id + "-value";
    const sliderVal = document.getElementById(element);
    sliderVal.textContent = value; // display number
    sortReposByCategory(currentSort); // live sort
  });
  slider.addEventListener("change", () => {
    console.log("Slider value changed, resorting repositories.");
    sortReposByCategory(currentSortCriteria);
    if (slider.id == "'forking-slider") {
      forkingScoreCalculator();
    } else if (slider.id == "commits-slider") {
      commitScoreCalculator();
    } else if (slider.id == "size-slider") {
      sizeScoreCalculator();
    } else if (slider.id == "watchers-slider") {
      watchersScoreCalculator();
    }
    else if (slider.id == "issues-slider") {
      issuesScoreCalculator();
    }
    commitScoreCalculator();
  });
});

// Category Score Calculators
function commitScoreCalculator(repo = null) {
  if (repo === null) {
    finalArray.forEach((i) => {
      commitHelperFunction(i);
    });
  } else {
    return commitHelperFunction(repo);
  }
}

function commitHelperFunction(repo) {
  var mostRecentCommit = new Date(repo.pushed_at);
  const now = new Date();
  var diff = now - mostRecentCommit;
  const year2000 = new Date("2016-01-01T00:00:00Z").getTime();
  var maxDiff = now - year2000;
  var score = ((maxDiff - diff) / maxDiff) * 100;
  repo.commitScore = score;
  return score;
}

function watchersScoreCalculator(repo = null) {
  const maxAmt = 30;
  if (repo === null) {
    finalArray.forEach((i) => {
      var watchersCount = i.watchers_count;
      const watchersScore = (watchersCount / maxAmt) * 100;
      i.watchersScore = watchersScore;
    });
  } else {
    var watchersCount = repo.watchers_count;
    const watchersScore = (watchersCount / maxAmt) * 100;
    repo.watchersScore = watchersScore;
    return watchersScore;
  }
}

function issuesScoreCalculator(repo = null) {
    const maxAmt = 50;
    if (repo === null) {
      finalArray.forEach((i) => {
        var issuesCount = i.open_issues;
        const issuesScore = (issuesCount / maxAmt) * 100; 
        i.issuesScore = issuesScore;
      });
    } else {
      var issuesCount= repo.open_issues;
      const issuesScore = (issuesCount / maxAmt) * 100;
      repo.issuesScore = issuesScore;
      return issuesScore;
    }
  }

function forkingScoreCalculator(repo = null) {
  const maxAmt = 10;
  if (repo === null) {
    finalArray.forEach((i) => {
      if (i.forks_count != undefined) {
        const forkingNum = i.forks_count;
        const forkingScore = ((maxAmt - forkingNum) / maxAmt) * 100;
        i.forkingScore = forkingScore;
      } else {
        i.forkingScore = 0;
      }
    });
  } else {
    if (repo.forks_count != undefined) {
      const forkingNum = repo.forks_count;
      const forkingScore = (forkingNum / maxAmt) * 100;
      repo.forkingScore = forkingScore;
      return forkingScore;
    } else {
      repo.forkingScore = 0;
      return forkingScore;
    }
  }
}

function sizeScoreCalculator(repo = null) {
  const maxSize = 3000000;
  if (repo === null) {
    finalArray.forEach((i) => {
      if (i.size != undefined) {
        const size = i.size;
        const sizeScore = ((maxSize - size) / maxSize) * 100;
        i.sizeScore = sizeScore;
      } else {
        i.sizeScore = 0;
      }
    });
  } else {
    if (repo.size != undefined) {
      const size = repo.size;
      const sizeScore = ((maxSize - size) / maxSize) * 100;
      repo.sizeScore = sizeScore;
      return sizeScore;
    } else {
      repo.sizeScore = 0;
      return sizeScore;
    }
  }
}

function normalizeWeights(weights) {
  const totalWeight =
    weights.forking + weights.size + weights.commits + weights.watchers + weights.issues;
  if (totalWeight > 0) {
    weights.forking /= totalWeight;
    weights.size /= totalWeight;
    weights.commits /= totalWeight;
    weights.watchers /= totalWeight;
    weights.issues /= totalWeight;
  }
  return weights;
}

function finalScoreCalculator(repo, weights) {
  weights = normalizeWeights(weights); // normalize weights
  // get calculated scores if they exist, else calculate them
  const forkingScore = repo.forkingScore || forkingScoreCalculator(repo);
  const sizeScore = repo.sizeScore || sizeScoreCalculator(repo);
  const commitsScore = repo.commitScore || commitScoreCalculator(repo);
  const watchersScore = repo.watchersScore || watchersScoreCalculator(repo);
  const issuesScore = repo.issuesScore || issuesScoreCalculator(repo);

  // weightefd algorithm
  var score =
    forkingScore * weights.forking +
    sizeScore * weights.size +
    commitsScore * weights.commits +
    watchersScore * weights.watchers +
    issuesScore * weights.issues;

  score = Math.round(score);
  return score;
}

// extra sort feature
function sortReposByCategory(cat) {
  currentSortCriteria = cat;
  if (cat == "date-published") {
    finalArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Ascending order
  } else if (cat == "date-last-accessed") {
    finalArray.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  } else if (cat == "alphabetical") {
    finalArray.sort((a, b) => {
      const authorA = a.name.toLowerCase(); // Convert to lowercase for case-insensitive sorting
      const authorB = b.name.toLowerCase();
      return authorA.localeCompare(authorB); // Sorting in alphabetical order
    });
  }
  displayRepoNames(finalArray);
}

// live search feature
function repoSearch() {
  var input, filter, container, cards, a, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  container = document.getElementById("repos-container");
  cards = container.querySelectorAll(".card");
  var cardsArray = Array.from(cards);
  // Loop through all list items, and hide if not string match 
  for (i = 0; i < cardsArray.length; i++) {
    a = cardsArray[i].getElementsByTagName("h6")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      cardsArray[i].style.display = "block";
    } else {
      cardsArray[i].style.display = "none";
    }
  }
}

function getWeights() {
  const weights = {
    forking: document.getElementById("forking-slider")
      ? parseFloat(document.getElementById("forking-slider").value) / 100
      : defaultWeights.forking,
    size: document.getElementById("size-slider")
      ? parseFloat(document.getElementById("size-slider").value) / 100
      : defaultWeights.size,
    commits: document.getElementById("commits-slider")
      ? parseFloat(document.getElementById("commits-slider").value) / 100
      : defaultWeights.commits,
    watchers: document.getElementById("watchers-slider")
      ? parseFloat(document.getElementById("watchers-slider").value) / 100
      : defaultWeights.watchers,
      issues: document.getElementById("issues-slider")
      ? parseFloat(document.getElementById("issues-slider").value) / 100
      : defaultWeights.issues,
  };
  return weights;
}

function createRepoCard(repo) {
  // create card element
  const card = document.createElement("div");
  card.classList.add("card", "repo-card");
  // get data
  let title = repo.name;
  let date = new Date(repo.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  let watchers = repo.watchers_count;
  let days = Math.floor(
    (new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24)
  );
  let size = repo.size;
  let forks = repo.forks_count;
  let issues = repo.open_issues;

  // truncate title
  if (title.length > 20) {
    title = title.substring(0, 19);
    title = title + "...";
  }
  // Get actual weights, if they exist , else resort to default. calculate score
  var weights = getWeights();
  var score = finalScoreCalculator(repo, weights);

  let cardColor;
  if (score >= 80) {
    cardColor = "#93cb7f"; // High score, green, good
  } else if (score >= 20) {
    cardColor = "#cdc58b"; // Medium score, yellow, mid
  } else {
    cardColor = "#bd756f"; // Low score, red, bad
  }
  card.innerHTML = `
    <h6 class="card-title" id="title-link">${title}</h6>
    <small class="text-muted">Created ${date}</small>
    <p>Watchers: ${watchers}</p>
    <p>Size: ${size} kb</p>
    <p>Days Since Last Commit: ${days}</p>
    <p>Number of Forks: ${forks}</p>
    <p>Open Issues: ${issues}</p>

    <p class="score-circle">Score: ${score}/100</p>`;
  card.style.backgroundColor = cardColor; // 

  // open repo with user approval
  card.addEventListener("click", function () {
    const repoUrl = repo.html_url;
    const userConfirmed = window.confirm(
      "Do you want to open this repository in a new tab?"
    );
    if (userConfirmed) {
      window.open(repoUrl, "_blank");
    }
  });
  return card;
}

function displayRepoNames(repoArray) {
  const container = document.getElementById("repos-container");
  container.innerHTML = ""; // Clear existing content
  for (let i = 0; i < repoArray.length; i++) {
    // for each repo, create a repo card
    const weights = getWeights();
    repoArray.sort(
      (a, b) =>
        finalScoreCalculator(a, weights) - finalScoreCalculator(b, weights)
    );
    const card = createRepoCard(repoArray[i]);
    card.style.animationDelay = `${i * 0.05}s`;
    container.appendChild(card);
  }
}

async function paginated_fetch(
  url = "https://api.github.com/orgs/brown-ccv/repos?per_page=50",
  page = 1,
  previousResponse = []
) {
  return await fetch(`${url}&page=${page}`)
    .then((response) => response.json())
    .then((newResponse) => {
      const response = [...previousResponse, ...newResponse];
      if (newResponse.length !== 0) {
        page++;
        return paginated_fetch(url, page, response);
      }
      displayRepoNames(response);
      finalArray = response;
      dontTouch = response;
      return response;
    })
    .catch((error) => console.error("Yo Error:", error));
}
