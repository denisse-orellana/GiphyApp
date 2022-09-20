const form = document.querySelector('#form');
const input = document.querySelector('#input');
const button = document.querySelector('#search');
const btnSearch = document.querySelector("#btn-search");
const message = document.querySelector('#error__message');
const history = document.querySelector('#history');
const h2 = document.querySelector('#history__title');
let limit = 6;
let offSet = 0;

const baseUrl = `https://api.giphy.com/v1/gifs`
const apiKey = "ctrj4Sw8vwEJqQaiXS5LRX2i1ssf8pj8";
const urlTrending = `${baseUrl}/trending?api_key=${apiKey}&limit=${limit}&offset=${offSet}&rating=g`;
const errorGiphy = "https://media0.giphy.com/media/JsE9qckiYyVClQ5bY2/giphy.gif?cid=790b7611eebfc64d468ef60c14903e5f82dd73b4856f6cf8&rid=giphy.gif&ct=g";
const errorFetch = "./assets/images/server_error_500.svg"

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
}

const getImage = async(array) => {
  for(let giphy of array.data) {
    const alt = giphy.title ||= "Title not provided by Giphy";
    const username = giphy.username ||= "Unknown User";
    const image = giphy.images.original.webp ||= giphy.images.original.url;
    // const avatar = giphy.user.avatar_url ?? {};
    // console.log(username)
    addCard(alt, image);
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
    const data = await response.json();
    // console.log(data);
    offSet++;
    console.log(offSet);
    return data;
  } catch (error) {
    console.error(error);
    errorMessage('Oops... somenting went wrong.', errorFetch);
  }
}

const loadData = async(url) => {
  const data = await getData(url);
  getImage(data);
}

const getSearchData = async(string) => {
  const urlSearch = `${baseUrl}/search?api_key=${apiKey}&q=${string}&limit=${limit}&offset=${offSet}&rating=g&lang=en`;
  const dataSearch = await getData(urlSearch);
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

window.addEventListener("scroll", async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    // await loadData(urlTrending); 
    await getData();
  }
});
