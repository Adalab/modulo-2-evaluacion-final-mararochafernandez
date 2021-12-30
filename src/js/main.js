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
    renderResultsButton(favoritesElement, 'Borrar series favoritas', handleRemoveAllFavorites);

  } else {
    favoritesElement.classList.remove('favorites');
  }
}

function renderAnimeSeries() {
  const resultsElement = document.querySelector('.js-results');
  resultsElement.textContent = '';
  if (animeSeries.length > 0) {
    renderData(resultsElement, 'Resultados', animeSeries);
    renderResultsButton(resultsElement, 'Cargar más resultados', handleLoadMoreResults);
  }
}

function renderData(element, text, series) {
  const newTitle = renderTitle(text);
  const newList = renderList();
  for (const serie of series) {
    const newListItem = renderListItem(text, serie);
    const newImage = renderImage(serie);
    const newSubtitle = renderSubtitle(text, serie);
    newListItem.appendChild(newImage);
    newListItem.appendChild(newSubtitle);
    newList.appendChild(newListItem);
  }
  element.appendChild(newTitle);
  element.appendChild(newList);
}

function renderTitle(text) {
  const element = document.createElement('h2');
  element.className = 'results__title';
  element.textContent = text;
  return element;
}

function renderList() {
  const element = document.createElement('ul');
  element.className = 'results__list';
  return element;
}

function renderListItem(text, serie) {
  const element = document.createElement('li');
  element.dataset.id = serie.mal_id;

  // listen list item
  if (text === 'Resultados') {
    element.addEventListener('click', handleListItem);
  }

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

function renderSubtitle(text, serie) {
  const element = document.createElement('h3');
  element.className = 'results__subtitle';
  element.textContent = serie.title;

  // listen icon
  if (text === 'Series favoritas') {
    const newIcon = document.createElement('i');
    newIcon.className = 'fas fa-times-circle';
    newIcon.addEventListener('click', handleIcon);
    element.appendChild(newIcon);
  }

  return element;
}

function renderResultsButton(element, text, handlerFunction) {
  const newButton = document.createElement('button');
  newButton.className = 'main__button main__button--results';
  newButton.type = 'button';
  newButton.textContent = text;
  newButton.addEventListener('click', handlerFunction);
  element.appendChild(newButton);
}


// api

function getAnimeSeriesFromApi() {

  /* pending pagination: load more button (cargar más resultados) */

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

function setFavoritesInLocalStorage() {
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
  handleFavorites(event.currentTarget);
}

function handleIcon(event) {
  handleFavorites(event.currentTarget.parentNode.parentNode);
}

function handleFavorites(listItem) {
  const currentId = parseInt(listItem.dataset.id);

  // find indexes
  const animeSerieIndex = findIndex(animeSeries, currentId);
  const favoriteIndex = findIndex(favorites, currentId);

  // add/remove as favorite
  if (favoriteIndex === -1) {
    favorites.push(animeSeries[animeSerieIndex]);
    listItem.classList.add('results__item--favorite');
  } else {
    favorites.splice(favoriteIndex, 1);
    listItem.classList.remove('results__item--favorite');
  }

  // set favorites in local storage
  setFavoritesInLocalStorage();

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

function handleLoadMoreResults(event) {
  console.log(event.currentTarget);
}


// app start

getFavoritesFromLocalStorage();
renderFavorites();
//getAnimeSeriesFromApi();
listenSearchForm();