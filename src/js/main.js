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
  const favoritesElement = document.querySelector('.js-favorites');
  favoritesElement.textContent = '';
  if (favorites.length > 0) {
    favoritesElement.classList.add('favorites');
    renderData(favoritesElement, 'Series favoritas', favorites);
    renderRemoveAllFavorites();
  } else {
    favoritesElement.classList.remove('favorites');
  }
}

function renderAnimeSeries() {
  const resultsElement = document.querySelector('.js-results');
  resultsElement.textContent = '';
  if (animeSeries.length > 0) {
    renderData(resultsElement, 'Resultados', animeSeries);
  }
}

function renderData(element, title, series) {
  const newTitle = renderTitle(title);
  const newList = renderList();
  for (const serie of series) {
    const newListItem = renderListItem(serie);
    const newImage = renderImage(serie);
    const newSubtitle = renderSubtitle(serie);
    newListItem.appendChild(newImage);
    newListItem.appendChild(newSubtitle);
    newList.appendChild(newListItem);
  }
  element.appendChild(newTitle);
  element.appendChild(newList);
}

function renderTitle(title) {
  const element = document.createElement('h2');
  element.className = 'results__title';
  element.textContent = title;
  return element;
}

function renderList() {
  const element = document.createElement('ul');
  element.className = 'results__list';
  return element;
}

function renderListItem(serie) {
  const element = document.createElement('li');
  element.dataset.id = serie.mal_id;
  element.addEventListener('click', handleListItem);

  // find favorite
  const favorite = findItem(favorites, serie.mal_id);
  element.className = favorite ? 'results__item results__item--favorite' : 'results__item';

  return element;
}

function renderImage(serie) {
  const element = document.createElement('img');
  element.className = 'results__image';
  element.src = serie.image_url && serie.image_url.includes('https://cdn.myanimelist.net/images/anime/') ? serie.image_url : DEFAULT_IMAGE;
  element.alt = serie.title;
  return element;
}

function renderSubtitle(serie) {
  const element = document.createElement('h3');
  element.className = 'results__subtitle';
  element.textContent = serie.title;
  return element;
}

function renderRemoveAllFavorites() {
  const element = document.querySelector('.js-favorites');
  const newButton = document.createElement('button');
  newButton.className = 'main__button main__button--favorites';
  newButton.type = 'reset';
  newButton.textContent = 'Borrar todas las series favoritas';
  newButton.addEventListener('click', handleRemoveAllFavorites);
  element.appendChild(newButton);
}


// api

function getAnimeSeriesFromApi() {

  /* pending implementation: pagination */

  // api documentation: only processes queries with a minimum of 3 letters
  if (searchTerm.length >= 3) {
    fetch(`${API_URL}?q=${searchTerm}&limit=12`)
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
  if (favoritesFromLocalStorage) {
    favorites = favoritesFromLocalStorage;
  }
}

function saveFavoritesInLocalStorage() {
  if (favorites.length > 0) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  } else {
    removeFavoritesFromLocalStorage();
  }
}

function removeFavoritesFromLocalStorage() {
  localStorage.removeItem('favorites');
}


// event listeners and handlers

function listenSearchForm() {
  const searchButtonElement = document.querySelector('.js-button-search');
  const resetButtonElement = document.querySelector('.js-button-reset');
  searchButtonElement.addEventListener('click', handleSearch);
  resetButtonElement.addEventListener('click', handleReset);
}

function handleSearch(event) {
  event.preventDefault();
  const searchTermElement = document.querySelector('.js-search-term');
  //searchTerm = searchTermElement.value ? searchTermElement.value : searchTerm;
  searchTerm = searchTermElement.value;
  if (searchTerm) {
    getAnimeSeriesFromApi();
  } else {
    animeSeries = [];
    renderAnimeSeries();
  }
}

function handleReset(event) {
  event.preventDefault();
  const searchTermElement = document.querySelector('.js-search-term');
  searchTermElement.value = '';
  animeSeries = [];
  renderAnimeSeries();
}

function handleListItem(event) {
  const currentId = parseInt(event.currentTarget.dataset.id);

  // find indexes
  const animeSerieIndex = findIndex(animeSeries, currentId);
  const favoriteIndex = findIndex(favorites, currentId);

  // add/remove as favorite
  if (favoriteIndex === -1) {
    favorites.push(animeSeries[animeSerieIndex]);
    event.currentTarget.classList.add('results__item--favorite');
  } else {
    favorites.splice(favoriteIndex, 1);
    event.currentTarget.classList.remove('results__item--favorite');
  }

  // save favorites in local storage
  saveFavoritesInLocalStorage();

  // render data
  renderFavorites();
  renderAnimeSeries();
}

function handleRemoveAllFavorites() {
  favorites = [];
  renderFavorites();
  renderAnimeSeries();
  removeFavoritesFromLocalStorage();
}


// app start

getFavoritesFromLocalStorage();
renderFavorites();
listenSearchForm();