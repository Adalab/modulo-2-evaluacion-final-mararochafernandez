'use strict';


/* Let's do magic! 🦄🦄🦄 */


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

function renderFavorites() {
  renderData('.js-favorites', 'Series favoritas', favorites);
}

function renderAnimeSeries() {
  renderData('.js-results', 'Resultados', animeSeries);
}

function renderData(selector, title, series) {
  const element = document.querySelector(selector);
  element.textContent = '';
  const newTitle = renderTitle(title);
  const newList = renderList();
  for (const serie of series) {
    const newItem = renderItem(serie);
    const newImage = renderImage(serie);
    const newSubtitle = renderSubtitle(serie);
    newItem.appendChild(newImage);
    newItem.appendChild(newSubtitle);
    newList.appendChild(newItem);
  }
  element.appendChild(newTitle);
  element.appendChild(newList);
}

// title html element: <h2> tag
function renderTitle(title) {
  const element = document.createElement('h2');
  element.className = 'results__title';
  element.textContent = title;
  return element;
}

// list html element: <ul> tag
function renderList() {
  const element = document.createElement('ul');
  element.className = 'results__list';
  return element;
}

// list item html element: <li> tag
function renderItem(serie) {
  const element = document.createElement('li');
  element.dataset.id = serie.mal_id;
  element.addEventListener('click', handleItemEvent);

  // find favorite
  const favorite = findItem(favorites, serie.mal_id);
  element.className = favorite ? 'results__item results__item--fav' : 'results__item';

  return element;
}

// image html element: <img> tag
function renderImage(serie) {
  const element = document.createElement('img');
  element.className = 'results__image';
  element.src = serie.image_url ? serie.image_url : DEFAULT_IMAGE;
  element.alt = serie.title;
  return element;
}

// subtitle html element: <h3> tag
function renderSubtitle(serie) {
  const element = document.createElement('h3');
  element.className = 'results__subtitle';
  element.textContent = serie.title;
  return element;
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

function handleItemEvent(event) {
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

getFavoritesFromLocalStorage();
renderFavorites();
//getAnimeSeriesFromApi();
listenSearchButtonEvent();