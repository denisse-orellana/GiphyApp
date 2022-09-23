const form = document.querySelector('#form');
const input = document.querySelector('#input');
const button = document.querySelector('#search');
const btnSearch = document.querySelector("#btn-search");
const message = document.querySelector('#error__message');
const history = document.querySelector('#history');
const h2 = document.querySelector('#history__title');

let limit = 9;
let offSet = 0;
let searchQuery = false;

const baseUrl = `https://api.giphy.com/v1/gifs`
const apiKey = "ctrj4Sw8vwEJqQaiXS5LRX2i1ssf8pj8";
const urlTrending = `${baseUrl}/trending?api_key=${apiKey}&limit=${limit}&offset=${offSet}&rating=g`;
const errorGiphy = "https://media0.giphy.com/media/JsE9qckiYyVClQ5bY2/giphy.gif?cid=790b7611eebfc64d468ef60c14903e5f82dd73b4856f6cf8&rid=giphy.gif&ct=g";
const errorFetch = "./assets/images/server_error_500.svg"
const userAvatar = "./assets/images/avatar.png"
let url = '';

const addCard = (alt, image, username, avatar) => {
  const figure = document.createElement("figure");
  figure.className = "card-giphy";
  const img = document.createElement("img");
  img.src = image;
  img.alt = alt; 

  figure.appendChild(img);
  document.querySelector('#main__section').appendChild(figure);

  if (!image) {
    document.querySelector('#main__section').removeChild(figure);
  }

  const divUser = document.createElement("div");
  divUser.className = "card-user";
  const figureUser = document.createElement("figure");
  figureUser.className = "card-avatar";
  const imgUser = document.createElement("img");
  imgUser.src = avatar;
  imgUser.alt = 'Avatar User'; 
  const p = document.createElement("p");
  p.innerHTML = `@${username}`;

  figureUser.appendChild(imgUser);
  divUser.appendChild(figureUser);
  divUser.appendChild(p);
  figure.appendChild(divUser);
  
}

const getImage = async(array) => {
  for(let giphy of array.data) {
    const alt = giphy.title ||= "Title not provided by Giphy";
    const image = giphy.images.original.webp ||= giphy.images.original.url;
    let avatar = '';
    (image && !giphy.user) ? (avatar = userAvatar) : (avatar = giphy.user.avatar_url)
    const username = giphy.username ||= "UnknownUser";
    addCard(alt, image, username, avatar);
  }
}

const errorMessage = (message, image) => {
  const figure = document.createElement("figure");
  figure.className = "card-error"
  const img = document.createElement("img");
  img.src = image;
  img.alt = "Error Giphy"
  const divMessage = document.createElement('div');
  divMessage.className = "message"; //
  divMessage.innerHTML = 
  `
  <h3><strong>${message}</strong></h3>
  `
  ;

  figure.appendChild(img);
  divMessage.appendChild(figure);
  document.querySelector('#error__message').appendChild(divMessage);
  setTimeout(() => {
    divMessage.remove();
  }, 3000);
  loadData(urlTrending);
}

const cleanData = () => {
  document.querySelector('#main__section').innerHTML = '';
}

async function getData(url) {
  try {
    const response = await fetch(url);
    if (response.status === 404) {
      errorMessage(`${response.status}: Not Found. Please try again.`, errorFetch);
    }
    if (response.status != 200) {
      errorMessage(`${response.status}: Oops... somenthing went wrong. Please try again.`, errorFetch);
    }
    const data = await response.json();
    // console.log(url)
    // console.log(limit, offSet)
    // console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    errorMessage('Oops... somenthing went wrong.', errorFetch);
  }
}

const loadData = async(url) => {
  const data = await getData(url);
  searchQuery = false;
  getImage(data);
}

const getSearchData = async(string) => {
  let urlSearch = `${baseUrl}/search?api_key=${apiKey}&q=${string}&limit=${limit}&offset=${offSet}&rating=g&lang=en`;
  const dataSearch = await getData(urlSearch);
  searchQuery = true;
  console.log(searchQuery)
  // console.log(dataSearch);
  if (!dataSearch.data.length) {
    errorMessage('Not found. Please enter a valid word again.', errorGiphy)
  } else {
    getHistory(string, dataSearch);
    getImage(dataSearch);
  }
}

const search = () => {
  let value = input.value;
  (!value) ? errorMessage('Please enter a valid word.', errorGiphy) : getSearchData(value);
  input.value = '';
}

const getHistory = (string, obj) => {
  let listHistory = JSON.parse(localStorage.getItem('Giphys')) || [];
  listHistory.push([ string, obj ]);
  localStorage.setItem('Giphys', JSON.stringify(listHistory));
  // console.log(listHistory)

  if (listHistory.length) {
    showHistory();
  } 
}

const showHistory = () => {
  let listHistory = JSON.parse(localStorage.getItem('Giphys'));
  let lastSearch = listHistory.slice(-3).reverse();

  h2.innerHTML = 'Recent History';
  addClassName();

  let list = '';
  lastSearch.forEach((e) => {
    let index = listHistory.indexOf(e);
    list += `<div><span onclick="searchHistory(${index})">${e[0].toLowerCase()}</span>&nbsp;<span onclick="deleteHistory(${index})"><i class="fa-solid fa-x"></i></span></div>`;
  });
  history.innerHTML = list;
}

const searchHistory = (index) => {
  cleanData();
  let listHistory = JSON.parse(localStorage.getItem('Giphys'));
  element = listHistory[index];
  getImage(element[1]);
  searchQuery = true;
}

const deleteHistory = (index) => {
  let listHistory = JSON.parse(localStorage.getItem('Giphys'));
  listHistory.splice(index, 1);
  localStorage.setItem('Giphys', JSON.stringify(listHistory));
  showHistory();
  removeClassName();
};

const removeClassName = () => {
  if ( !JSON.parse(localStorage.getItem('Giphys')) || !JSON.parse(localStorage.getItem('Giphys')).length ) {
    history.classList.remove('history');
    h2.innerHTML = "";
  };
};

const addClassName = () => {
  history.classList.add('history');
};

window.addEventListener('load', () => {
  loadData(urlTrending);
  if (JSON.parse(localStorage.getItem('Giphys')) != null ) {
    showHistory();
    addClassName();
  } 
  removeClassName();
});

btnSearch.addEventListener('keypress', (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    cleanData();
    search();
  }
});

btnSearch.addEventListener('click', (e) => {
  e.preventDefault();
  cleanData();
  search();
});

const loadMore = async() => {
  let pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,  document.documentElement.clientHeight,  document.documentElement.scrollHeight,  document.documentElement.offsetHeight );
  ((window.innerHeight + window.scrollY) >= pageHeight) ? console.log("You are at the bottom of the page.") : console.log("Nop. Not the bottom of the page.")

  if ((window.innerHeight + window.scrollY) >= pageHeight) {

    if (!searchQuery) {
      offSet += limit + 1;
      url = `${baseUrl}/trending?api_key=${apiKey}&limit=${limit}&offset=${offSet}&rating=g`;
      await loadData(url);
    }

    if (searchQuery) {
      offSet += limit + 1;
      lasthistory = JSON.parse(localStorage.getItem('Giphys'));
      string = history[history.length - 1];
      url = `${baseUrl}/search?api_key=${apiKey}&q=${string}&limit=${limit}&offset=${offSet}&rating=g&lang=en`;
      await getSearchData(url);
      searchQuery = true;
    }
  }
}

window.addEventListener("scroll", loadMore);