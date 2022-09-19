const form = document.querySelector('#form');
const input = document.querySelector('#input');
const button = document.querySelector('#search');
const message = document.querySelector('#error-message');
const history = document.querySelector('#history');
const h2 = document.querySelector('#history-title');

const baseUrl = `https://api.giphy.com/v1/gifs`
const apiKey = "ctrj4Sw8vwEJqQaiXS5LRX2i1ssf8pj8";
const urlTrending = `${baseUrl}/trending?api_key=${apiKey}&limit=24&rating=g`;

const addCard = (alt, image) => {
  // console.log(alt, image);
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
  if (!alt) {
    img.alt = "Title not provided by Giphy";
  } 
}

const getImage = async(array) => {
  for(let giphy of array.data) {
    const alt = giphy.title;
    const image = giphy.images.original.webp;
    // const username = giphy.username;
    // const avatar = giphy.user.avatar_url;
    // console.log(image)
    addCard(alt, image);
  }
}

const errorMessage = (message) => {
  const divMessage = document.createElement('div');
  divMessage.className = "message"; //
  divMessage.innerHTML = 
  `
  <h3><strong>${message}</strong></h3>
  `
  ;

  document.querySelector('#error-message').appendChild(divMessage);
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
    const data = await response.json();
    // console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    errorMessage('Oops... somenting went wrong.');
  }
}

const loadData = async(url) => {
  const data = await getData(url);
  getImage(data);
}

const getSearchData = async(string) => {
  const urlSearch = `${baseUrl}/search?api_key=${apiKey}&q=${string}&limit=24&offset=0&rating=g&lang=en`;
  const dataSearch = await getData(urlSearch);
  console.log(dataSearch);
  if (!dataSearch.data.length === 0) {
    errorMessage('Not found. Please enter a valid word again.')
  } else {
    getHistory(string, dataSearch);
    getImage(dataSearch);
  }
}

const search = () => {
  let value = input.value;
  (!value) ? errorMessage('Please enter a valid word.') : getSearchData(value);
  input.value = '';
}

window.addEventListener('load', () => {
  loadData(urlTrending);
  if (JSON.parse(localStorage.getItem('Giphys')) != null ) {
    showHistory();
    addClassName();
  } 
  removeClassName();
});

input.addEventListener('keypress', (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    cleanData();
    search();
  }
});

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
  // let lastSearch = listHistory.reverse().slice(0, 3);
  // console.log(lastSearch)
  // let lastSearch = listHistory.slice(-3);

  h2.innerHTML = 'Recent Searches';
  addClassName();

  let list = '';
  listHistory.forEach((e, index) => {
    list += `<div><span onclick="searchHistory(${index})">${e[0].toLowerCase()}</span>&nbsp;<span onclick="deleteHistory(${index})"><i class="fa-solid fa-x"></i></span></div>`;
  });
  history.innerHTML = list;
}

const searchHistory = (index) => {
  cleanData();
  let listHistory = JSON.parse(localStorage.getItem('Giphys'));
  element = listHistory[index];
  getImage(element[1]);
}

const deleteHistory = (index) => {
  let listHistory = JSON.parse(localStorage.getItem('Giphys'));
  listHistory.splice(index, 1);
  localStorage.setItem('Giphys', JSON.stringify(listHistory));
  showHistory();
  removeClassName();
}

const removeClassName = () => {
  if (!JSON.parse(localStorage.getItem('Giphys')).length) {
    history.classList.remove('history');
    h2.innerHTML = "";
  }
}

const addClassName = () => {
  history.classList.add('history');
}

/*
local storage (3 busquedas)
infinite scrolling
local storage cuota 22 
*/ 