let browseDocuments = [];

const loadingText = document.getElementById("loading");
const searchSection = document.getElementById("search");
const browseSection = document.getElementById("browse");

const browseTab = document.getElementById("browse-tab");
browseTab.addEventListener("click", () => activateBrowse());
const searchTab = document.getElementById("search-tab");
searchTab.addEventListener("click", () => activateSearch());

const searchInput = document.getElementById('search-input');

const POST_TEMPLATE = document.querySelector(".search_item").cloneNode(true);
POST_TEMPLATE.remove();

const pageSize = 50;
let pageMax = 1;
let page = 1;
let browseIndex = (page - 1) * pageSize;

const index = new FlexSearch.Document({
	encode: function(str){
		const cjkItems = str.replace(/[\x00-\x7F]/g, "").split("");
		const asciiItems = str.toLowerCase().split(/\W+/);
		return cjkItems.concat(asciiItems);
  },
  document: {
    id: "id_str",
    index: ["full_text"],
    store: true
  }
});

function processData(data) {
  for (const doc of data) {
    index.add({
        id_str: doc.id_str,
        created_at: doc.created_at,
        full_text: doc.full_text,
        favorite_count: doc.favorite_count,
        retweet_count: doc.retweet_count
    })
  };
  loadingText.hidden = true;
  searchSection.hidden = false;
}

fetch("./documents.json")
  .then(r => r.json())
  .then(documents => {
    processData(documents);

    browseDocuments = documents.sort(function(a,b){
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setPaging();

    renderBrowse();
  });

function setPaging() {
  pageMax = Math.floor(browseDocuments.length / pageSize) + 1;
  document.getElementById('page-total').innerText = pageMax;
  document.getElementById('page-num').addEventListener('input', onPageNumChange);
  document.getElementById('page-num').value = +page;
  document.getElementById('page-num').max = pageMax;
  document.getElementById('page-num').min = 1;
}

// function sortResults(criterion) {
//   if (criterion === 'newest-first') {
//     results = results.sort(function(a,b){
//       return new Date(b.created_at) - new Date(a.created_at);
//     });
//     renderResults();
//   }
//   if (criterion === 'oldest-first') {
//     results = results.sort(function(a,b){
//       return new Date(a.created_at) - new Date(b.created_at);
//     });
//     renderResults();
//   }
//   if (criterion === 'most-relevant') {
//     results = results.sort(function(a,b){
//       return a.index - b.index;
//     });
//     renderResults();
//   }
//   if (criterion === 'most-popular') {
//     results = results.sort(function(a,b){
//       return (+b.favorite_count + +b.retweet_count) - (+a.favorite_count + +a.retweet_count);
//     });
//     renderResults();
//   }
//   if (criterion === 'newest-first-browse') {
//     browseDocuments = browseDocuments.sort(function(a,b){
//       return new Date(b.created_at) - new Date(a.created_at);
//     });
//     renderBrowse();
//   }
//   if (criterion === 'oldest-first-browse') {
//     browseDocuments = browseDocuments.sort(function(a,b){
//       return new Date(a.created_at) - new Date(b.created_at);
//     });
//     renderBrowse();
//   }
//   if (criterion === 'most-popular-browse') {
//     browseDocuments = browseDocuments.sort(function(a,b){
//       return (+b.favorite_count + +b.retweet_count) - (+a.favorite_count + +a.retweet_count);
//     });
//     renderBrowse();
//   }
// }

function renderResults(results) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  results.forEach(item => {
    const element = POST_TEMPLATE.cloneNode(true);
    output.appendChild(element);

    element.querySelector(".search_link a").href = `kayserifserif/status/${item.id_str}`;
    // element.querySelector(".search_text").textContent = item.full_text;
    element.querySelector(".search_text").innerHTML = item.full_text;
    element.querySelector(".search_time").textContent = (new Date(item.created_at)).toLocaleString();
  });

  if (results.length > 0) {
    output.innerHTML += '<a href="#tabs">top &uarr;</a>';
  }
}

function onSearchChange(e) {
  let results = index.search(e.target.value, { enrich: true });
  if (results.length > 0) {
    // limit search results to the top 100 by relevance
    results = results.slice(0,100);
    // preserve original search result order in the 'index' variable since that is ordered by relevance
    results = results[0].result.map((item, index) => { let result = item.doc; result.index = index; return result;});
  }
  renderResults(results);
}
searchInput.addEventListener('input', onSearchChange);

function activateSearch() {
  searchTab.classList.add('active');
  browseTab.classList.remove('active');
  browseSection.hidden = true;
  searchSection.hidden = false;
}

function activateBrowse() {
  browseTab.classList.add('active');
  searchTab.classList.remove('active');
  searchSection.hidden = true;
  browseSection.hidden = false;
}

function onPageNumChange(e) {
  page = e.target.value;
  browseIndex = (page - 1) * pageSize;
  renderBrowse();
}

function renderBrowse() {
  const output = document.getElementById("browse-output");
  output.innerHTML = "";

  const pageItems = browseDocuments.slice(browseIndex, browseIndex + pageSize);
  pageItems.forEach(item => {
    const element = POST_TEMPLATE.cloneNode(true);
    output.appendChild(element);

    element.querySelector(".search_link a").href = `kayserifserif/status/${item.id_str}`;
    // element.querySelector(".search_text").textContent = item.full_text;
    element.querySelector(".search_text").innerHTML = item.full_text;
    element.querySelector(".search_time").textContent = (new Date(item.created_at)).toLocaleString();
  })

  output.innerHTML += '<a href="#tabs">top &uarr;</a>';
}