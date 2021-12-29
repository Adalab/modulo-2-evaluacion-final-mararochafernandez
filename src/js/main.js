'use strict';


/* Let's do magic! 🦄🦄🦄 */


/* SAMPLE RESULT LIST ITEM:
<li class="results__item">
  <img class="results__image" src="https://via.placeholder.com/227x320/e5e5e5/666/?text=TV" alt="Naruto: Shippuuden" />
  <h3 class="results__title">Naruto: Shippuuden</h3>
</li> */


// global data

const API_URL = 'https://api.jikan.moe/v3/search/anime';
const DEFAULT_IMAGE = 'https://via.placeholder.com/227x320/e5e5e5/666/?text=TV';

let searchTerm = 'naruto';

let animeSeries = [];
let favorites = [];


// helpers

function findIndex(array, id) {
  return array.findIndex(item => item.mal_id === id);
}

function findItem(array, id) {
  return array.find(item => item.mal_id === id);
}


// data rendering

function renderImage(serie) {
  const element = document.createElement('img');
  element.className = 'results__image';
  element.src = serie.image_url ? serie.image_url : DEFAULT_IMAGE;
  element.alt = serie.title;
  return element;
}

function renderTitle(serie) {
  const element = document.createElement('h3');
  element.className = 'results__title';
  element.textContent = serie.title;
  return element;
}

function renderListItem(serie) {
  const element = document.createElement('li');
  element.dataset.id = serie.mal_id;
  element.addEventListener('click', handleListItemEvent);

  // find favorite
  const favorite = findItem(favorites, serie.mal_id);
  element.className = favorite ? 'results__item results__item--fav' : 'results__item';

  return element;
}

function renderAnimeSeries() {
  const resultsListElement = document.querySelector('.js-results-list');
  resultsListElement.textContent = '';
  for (const animeSerie of animeSeries) {

    // list item html element: <li> tag
    const newItem = renderListItem(animeSerie);

    // image html element: <img> tag
    const newImage = renderImage(animeSerie);

    // title html element: <h3> tag
    const newTitle = renderTitle(animeSerie);

    newItem.appendChild(newImage);
    newItem.appendChild(newTitle);
    resultsListElement.appendChild(newItem);
  }
}

function renderFavorites() {
  const favoritesListElement = document.querySelector('.js-favorites-list');
  favoritesListElement.textContent = '';
  for (const favorite of favorites) {

    // list item html element: <li> tag
    const newItem = renderListItem(favorite);

    // image html element: <img> tag
    const newImage = renderImage(favorite);

    // title html element: <h3> tag
    const newTitle = renderTitle(favorite);

    newItem.appendChild(newImage);
    newItem.appendChild(newTitle);
    favoritesListElement.appendChild(newItem);
  }
}


// api

function getAnimeSeriesFromApi() {

  /* pending implementation: pagination */

  // api documentation: only processes queries with a minimum of 3 letters
  if (searchTerm.length >= 3) {
    fetch(`${API_URL}?q=${searchTerm}&limit=5`)
      .then(response => response.json())
      .then(data => {
        animeSeries = data.results;
        renderAnimeSeries();
      });
  }
}


// local storage

function getFavoritesFromLocalStorage() {
  const favoritesFromLocalStorage = JSON.parse(localStorage.getItem('favorites'));
  if (favoritesFromLocalStorage && favoritesFromLocalStorage.length > 0) {
    favorites = favoritesFromLocalStorage;
  }
}

function saveFavoritesInLocalStorage() {
  if (favorites.length === 0) {
    localStorage.removeItem('favorites');
  } else {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}


// event listeners and handlers

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

function handleListItemEvent(event) {
  const currentId = parseInt(event.currentTarget.dataset.id);

  // find indexes
  const animeSerieIndex = findIndex(animeSeries, currentId);
  const favoriteIndex = findIndex(favorites, currentId);

  // add/remove as favorite
  if (favoriteIndex === -1) {
    favorites.push(animeSeries[animeSerieIndex]);
    event.currentTarget.classList.add('results__item--fav');
  } else {
    favorites.splice(favoriteIndex, 1);
    event.currentTarget.classList.remove('results__item--fav');
  }

  // save favorites in local storage
  saveFavoritesInLocalStorage();

  // render data
  renderFavorites();
  renderAnimeSeries();
}


// app start

getAnimeSeriesFromApi();
listenSearchButtonEvent();
getFavoritesFromLocalStorage();
renderFavorites();