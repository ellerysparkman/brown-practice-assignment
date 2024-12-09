
// Declare global variables
let finalArray = [];
let dontTouch = [];
let currentSort = 'date-published'; 

// Initial DOM Load
document.addEventListener("DOMContentLoaded", function(event) { 
    const promiseArray = paginated_fetch(); // API call
    const sortButton = document.getElementById('sortMenuButton'); // initialize Sort tool
    const defaultSorting = 'Date Published';
    sortButton.textContent = `Sorting By ${defaultSorting}`;


    // Add functionality to Sorting Dropdown
    const sortingOptions = document.querySelectorAll('.dropdown-item');
    sortingOptions.forEach(item => {
        item.addEventListener('click', (event) => {
            const selectedOption = event.target.textContent;
            const category = event.target.id; // date-published', 'date-accessed'
            sortButton.textContent = `Sorting By ${selectedOption}`;             // Update the button text
            sortReposByCategory(category);});})             // Call  sorting function with the selected criteria
});
// countRepos();


// VARIABLES
const forkingSlider = document.getElementById('forking-slider');
const forkingSliderVal = document.getElementById('forking-slider-value');
const commitsSlider = document.getElementById('commits-slider');
const commitsSliderVal = document.getElementById('commits-slider-value');
const sizeSlider = document.getElementById('size-slider');
const sizeSliderVal = document.getElementById('size-slider-value');
const watchersSlider = document.getElementById('watchers-slider');
const watchersSliderVal = document.getElementById('watchers-slider-value');
// EVENT LISTENERs

document.getElementById("public-filter").addEventListener("click", function(event){
    filter("public");
});

// document.getElementById("sortByDate").addEventListener("click", function(event){
//     container = document.getElementById("repos-container");
//     cards = container.querySelectorAll('.card');
//     var cardsArray = Array.from(cards);
//     quickSort(cardsArray);
// });

// Forking SLIDER
[forkingSlider, commitsSlider, sizeSlider, watchersSlider].forEach(slider => {
    slider.addEventListener("input", () => {
        // show new score   
        const value = slider.value;
        const element = slider.id+ "-value";
        const sliderVal = document.getElementById(element);
        sliderVal.textContent = value;
        sortReposByCategory(currentSort);

        // sort on click!
    });
    slider.addEventListener("change", () => {
        console.log("Slider value changed, resorting repositories.");
        sortReposByCategory(currentSortCriteria);

        if (slider.id == "'forking-slider"){
            forkingScoreCalculator();
        }
        else if (slider.id == "commits-slider"){
            commitScoreCalculator();
        }
        else if (slider.id == "size-slider"){
            sizeScoreCalculator();
        }
        else if (slider.id == "watchers-slider"){
            watchersScoreCalculator();

        }


        commitScoreCalculator();
       });
});










// FUNCTIONS
function filter(myFilter){
    // create Filter Card
    var filterCard = document.createElement('div');
    filterCard.classList.add('card');
    filterCard.classList.add('filter-card');
    // create title
    var title = document.createElement('div');
    title.classList.add('card-title');
    title.innerHTML = myFilter;
    // create close button
    var closeButton = document.createElement('button');
    closeButton.type = "button";
    closeButton.classList.add('close');
    closeButton.ariaLabel = "Close";
    // create X
    var span = document.createElement('span');
    span.ariaHidden = "true"
    span.innerHTML = "&times";
    closeButton.appendChild(span);

    filterCard.appendChild(title);
    filterCard.appendChild(closeButton);

    var filterRow = document.createElement('div');
    filterRow.classList.add('row');
    filterRow.insertAdjacentElement('beforebegin', document.getElementById('search-row'));
    filterRow.appendChild(filterCard);

    container = document.getElementById("repos-container");
    cards = container.querySelectorAll('.card');
    var cardsArray = Array.from(cards);

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < cardsArray.length; i++) {
        // filter out public
        if (myFilter == "public"){



        }
        // filter 
    // a = cardsArray[i].getElementsByTagName("h6")[0];
    // txtValue = a.textContent || a.innerText;
    // if (txtValue.toUpperCase().indexOf(filter) > -1) {
    //     cardsArray[i].style.display = "block";
    // } else {
    //     cardsArray[i].style.display = "none";
    // }
    }
}


function quickSort(array){
    if (arr.length <= 1) {
        return arr;
      }
      const pivot = getMedianPivot(arr);
      const left = [];
      const right = [];
    
      for (let i = 0; i < arr.length; i++) {
        if (i === pivot) continue; // Skip the pivot element
        if (arr[i] < arr[pivot]) {
          left.push(arr[i]);
        } else {
          right.push(arr[i]);
        }
      }
      return quickSort(left).concat(arr[pivot], quickSort(right));
}

function commitScoreCalculator(repo = null){
    if (repo === null){
        finalArray.forEach(i => {
            commitHelperFunction(i);
        });
    }
    else {
        return commitHelperFunction(repo);
    }
}

function commitHelperFunction(repo){
    var mostRecentCommit = new Date(repo.pushed_at);  
    const now = new Date();
    var diff = now - mostRecentCommit;
    const year2000 = new Date('2016-01-01T00:00:00Z').getTime();
    var maxDiff =  now - year2000;
    var score = ((maxDiff - diff)/maxDiff ) * 100;
    repo.commitScore = score;
    return score;
}

function watchersScoreCalculator(repo = null){
    const maxAmt= 30;
    if (repo === null) {
        finalArray.forEach(i => {
            var watchersCount = i.watchers_count;
            const watchersScore = (watchersCount/maxAmt)*100;
            i.watchersScore = watchersScore;
    });}
    else {
        var watchersCount = repo.watchers_count;
        const watchersScore = (watchersCount/maxAmt)*100;
        repo.watchersScore = watchersScore;
        return watchersScore;
    }
}



function forkingScoreCalculator(repo = null){
    const maxAmt= 10;
    if (repo === null){
        finalArray.forEach(i => {
            if (i.forks_count != undefined){
                const forkingNum= i.forks_count
                const forkingScore = ((maxAmt - forkingNum)/maxAmt)*100;
                i.forkingScore = forkingScore;
            }
            else {
                i.forkingScore = 0;
            }
    });}
    else {
        if (repo.forks_count != undefined){
            const forkingNum= repo.forks_count
            const forkingScore = (forkingNum/maxAmt)*100;
            repo.forkingScore = forkingScore;
            return forkingScore;}
        else {
            repo.forkingScore = 0;
            return forkingScore;
        }
    }}


function sizeScoreCalculator(repo = null){

    const maxSize = 3000000;
    if (repo === null){
        finalArray.forEach(i => {
            if (i.size != undefined){
                const size= i.size
                const sizeScore = ((maxSize - size)/maxSize)*100;
                i.sizeScore = sizeScore;
            }
            else {
                i.sizeScore = 0;
            }
    });}
    else {
        if (repo.size != undefined){
            const size= repo.size
            const sizeScore = ((maxSize - size)/maxSize)*100;
            repo.sizeScore = sizeScore;
            return sizeScore;}
        else {
            repo.sizeScore = 0;
            return sizeScore;
        }
    }}

    function normalizeWeights(weights) {
        const totalWeight = weights.forking + weights.size + weights.commits + weights.watchers;
        if (totalWeight > 0) {
            weights.forking /= totalWeight;
            weights.size /= totalWeight;
            weights.commits /= totalWeight;
            weights.watchers /= totalWeight;
        }
        return weights;
    }



function finalScoreCalculator(repo, weights){
    weights = normalizeWeights(weights);

    const forkingScore = repo.forkingScore || forkingScoreCalculator(repo); 
    const sizeScore = repo.sizeScore || sizeScoreCalculator(repo); 
    const commitsScore = repo.commitScore || commitScoreCalculator(repo) ; 
    const watchersScore = repo.watchersScore || watchersScoreCalculator(repo); 
   var score = (
            (forkingScore * weights.forking) +
            (sizeScore * weights.size) +
            (commitsScore * weights.commits) +
            (watchersScore * weights.watchers)
        ) ; // Normalize and scale

    // console.log(
    //         repo.name, 
    //         'forking: ', forkingScore, "*", weights.forking, ' + ', 
    //         'size: ', sizeScore, " * ", weights.size, ' + ', 
    //         'commits: ', commitsScore, " * ", weights.commits, ' + ', 
    //         'watchers: ', watchersScore, " * ", weights.watchers, ' + '
    //         );

    score = Math.round(score);
    return score;
}

function sortReposByCategory(cat){
    currentSortCriteria = cat; 

    if (cat == "date-published"){
        finalArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Ascending order
    }
    else if (cat == "date-last-accessed"){
        finalArray.sort((a,b)=>  new Date(b.pushed_at) - new Date(a.pushed_at)); 
    }
    else if (cat == "alphabetical"){
        finalArray.sort((a,b)=>
        {
            const authorA = a.name.toLowerCase(); // Convert to lowercase for case-insensitive sorting
            const authorB = b.name.toLowerCase();
            return authorA.localeCompare(authorB); // Sorting in alphabetical order
        });
    }
    displayRepoNames(finalArray);
}


function sortReposByVal(){
    // grab all categories
    const weights = {
        forking: parseFloat(forkingSlider.value) / 100,
        commits: parseFloat(commitsSlider.value) / 100,
        size: parseFloat(sizeSlider.value) / 100,
        watchers: parseFloat(watchersSlider.value) / 100
      };
      finalArray.sort((a, b) =>  finalScoreCalculator(a, weights) - finalScoreCalculator(b, weights));
      displayRepoNames(finalArray);
}

function getMedianPivot(arr) {
    const mid = Math.floor(arr.length / 2);
    const first = arr[0];
    const last = arr[arr.length - 1];
    const middle = arr[mid];
  
    if (first < middle && middle < last || last < middle && middle < first) {
      return mid;
    } else if (middle < first && first < last || last < first && first < middle) {
      return 0;
    } else {
      return arr.length - 1;
    }
  }

function repoSearch(){
var input, filter, container, cards, a, i, txtValue;
  input = document.getElementById('searchInput');
  filter = input.value.toUpperCase();
  container = document.getElementById("repos-container");
  cards = container.querySelectorAll('.card');
  var cardsArray = Array.from(cards);

  // Loop through all list items, and hide those who don't match the search query
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


function toggleShowRepo(id){
    // if need to close
    if (document.getElementById(id).style.display == "none"){
        document.getElementById(id).style.display = "block";
    } // if need to open
    else {
        document.getElementById(id).style.display == "none";
    }
}

function clearRepos() {
    const container = document.getElementById('repos-container');
    container.innerHTML = '';
}
function getWeights(){
    const weights = {
        forking: document.getElementById('forking-slider') ? parseFloat(document.getElementById('forking-slider').value) / 100 : defaultWeights.forking,
        size: document.getElementById('size-slider') ? parseFloat(document.getElementById('size-slider').value) / 100 : defaultWeights.size,
        commits: document.getElementById('commits-slider') ? parseFloat(document.getElementById('commits-slider').value) / 100 : defaultWeights.commits,
        watchers: document.getElementById('watchers-slider') ? parseFloat(document.getElementById('watchers-slider').value) / 100 : defaultWeights.watchers
    };
    return weights;
}

function createRepoCard(repo){
    // create card element
    const card = document.createElement('div');
    card.classList.add("card", "repo-card");
    // get data
     let title = repo.name;
     let date = new Date(repo.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
     let watchers = repo.watchers_count;
     let days = Math.floor((new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24));     
    let size = repo.size;
    let forks = repo.forks_count;

    // truncate title 
    if (title.length> 20){
    title = title.substring(0,19);
    title = title + "...";}

    // create default weights
    const defaultWeights = {
        forking: 1 / 100,
        size: 1 / 100,
        commits: 1 / 100,
        watchers: 1 / 100
    };

    // Get actual weights, if they exist , else resort to default
     var weights = getWeights();

    var score = finalScoreCalculator(repo,weights);    

    let cardColor;
    let face = ":/"
    if (score >= 80) {
        cardColor = '#93cb7f';   // High score, green
        face = ":)";
    } else if (score >= 20) {
        cardColor = '#cdc58b';  // Medium score, yellow
        face = ":/";

    } else {
        cardColor = '#bd756f';     // Low score, red
        face = ":(";
    }
    card.innerHTML = `
    <h6 class="card-title" id="title-link">${title}</h6>
    <small class="text-muted">Created ${date}</small>
    <p>Watchers: ${watchers}</p>
    <p>Size: ${size} kb</p>
    <p>Days Since Last Commit: ${days}</p>
    <p>Number of Forks: ${forks}</p>

    <p>Score: ${score}/100</p>`;

    card.style.backgroundColor = cardColor;  // Apply the color to the card's background

    card.addEventListener("click", function() {
        const repoUrl = repo.html_url;
        const userConfirmed = window.confirm("Do you want to open this repository in a new tab?");
        if (userConfirmed) {
            window.open(repoUrl, "_blank");}});
    return card;
}


function displayRepoNames(repoArray){
    const container = document.getElementById('repos-container');
    container.innerHTML = ""; // Clear existing content
    for (let i=0; i<repoArray.length; i++){
        // for each repo, create a repo card
        const weights = getWeights();
        repoArray.sort((a, b) => finalScoreCalculator(a, weights) - finalScoreCalculator(b, weights));
        const card = createRepoCard(repoArray[i]);
        card.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(card);
    }
}



    async function paginated_fetch(
        url = 'https://api.github.com/orgs/brown-ccv/repos?per_page=50',
        page = 1,
        previousResponse = [],
      ) {
        return await fetch(`${url}&page=${page}`)          
            .then(response => response.json())
          .then(newResponse => {
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
          .catch(error => console.error('Yo Error:', error));
      }

async function countRepos(){
        document.getElementById('numRepos').innerHTML= 'Total Public Repositories: ' + finalArray.length;
}






