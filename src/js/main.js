'use strict';


/* Let's do magic! 🦄🦄🦄 */


/* SAMPLE RESULTS LIST:
<ul class="results__list">
  <li class="results__item">
    <img class="results__img" src="https://via.placeholder.com/227x320/e5e5e5/666/?text=TV" alt="Naruto: Shippuuden" />
    <h2 class="results__title">Naruto: Shippuuden</h2>
  </li>
</ul> */


// global data

const API_URL = 'https://api.jikan.moe/v3/search/anime';
const DEFAULT_IMAGE = 'https://via.placeholder.com/227x320/e5e5e5/666/?text=TV';

let searchTerm = 'naruto';

let animeSeries = [];
let favorites = [];


// helpers

function getIndex(array, id) {
  return array.findIndex(item => item.mal_id === id);
}


// list item event

function handleListItemEvent(event) {
  const currentId = parseInt(event.currentTarget.dataset.id);

  // get indexes from arrays
  const animeSerieIndex = getIndex(animeSeries, currentId);
  const favoriteIndex = getIndex(favorites, currentId);

  // add/remove as favorite
  if (favoriteIndex === -1) {
    favorites.push(animeSeries[animeSerieIndex]);
    event.currentTarget.classList.add('results__item--fav');
  } else {
    favorites.splice(favoriteIndex, 1);
    event.currentTarget.classList.remove('results__item--fav');
  }

  // save favorites in local storage
  localStorage.setItem('favorites', JSON.stringify(favorites));
}


// data rendering

function renderAnimeSeries() {
  const resultsElement = document.querySelector('.js-results');
  resultsElement.textContent = '';

  // list html element: <ul> tag
  const newList = document.createElement('ul');
  newList.className = 'results__list';
  for (const animeSerie of animeSeries) {

    // list item html element: <li> tag
    const newItem = document.createElement('li');
    newItem.className = 'results__item';
    newItem.dataset.id = animeSerie.mal_id;
    newItem.addEventListener('click', handleListItemEvent);

    // image html element: <img> tag
    const newImage = document.createElement('img');
    newImage.className = 'results__img';
    newImage.src = animeSerie.image_url ? animeSerie.image_url : DEFAULT_IMAGE;
    newImage.alt = animeSerie.title;

    // title html element: <h2> tag
    const newTitle = document.createElement('h2');
    newTitle.className = 'results__title';
    newTitle.textContent = animeSerie.title;

    newItem.appendChild(newImage);
    newItem.appendChild(newTitle);
    newList.appendChild(newItem);
    resultsElement.appendChild(newList);
  }
}


// api

function getAnimeSeriesFromApi() {

  // api documentation: only processes queries with a minimum of 3 letters
  if (searchTerm.length >= 3) {
    fetch(`${API_URL}?q=${searchTerm}&limit=3`)
      .then(response => response.json())
      .then(data => {
        animeSeries = data.results;
        renderAnimeSeries();
      });
  }
}


// search button event

function listenSearchButtonEvent() {
  const searchButtonElement = document.querySelector('.js-button-submit');
  searchButtonElement.addEventListener('click', handleSearchButtonEvent);
}

function handleSearchButtonEvent(event) {
  event.preventDefault();
  const searchTermElement = document.querySelector('.js-search-term');
  searchTerm = searchTermElement.value ? searchTermElement.value : searchTerm;
  getAnimeSeriesFromApi();
}


// app start

listenSearchButtonEvent();
getAnimeSeriesFromApi();