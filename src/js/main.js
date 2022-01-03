'use strict';


/* Let's do magic! 🦄🦄🦄 */


// global data

const API_URL = 'https://api.jikan.moe/v3/search/anime';
const DEFAULT_IMAGE = 'https://via.placeholder.com/227x320/e5e5e5/666/?text=TV';
const RESULTS_TITLE = 'Resultados';
const FAVORITES_TITLE = 'Series favoritas';

let searchTerm = 'naruto';
let lastPage = 0;
let currentPage = 1;

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
    const newTitle = renderTitle(FAVORITES_TITLE);
    const newList = renderList(FAVORITES_TITLE, favorites);
    favoritesElement.appendChild(newTitle);
    favoritesElement.appendChild(newList);

    // render "remove all favorites" button
    const newButton = renderResultsButton('Borrar series favoritas', handleRemoveAllFavorites);
    favoritesElement.appendChild(newButton);

    favoritesElement.classList.add('favorites');
  } else {
    favoritesElement.classList.remove('favorites');
  }
}

function renderAnimeSeries() {
  const resultsElement = document.querySelector('.js-results');
  resultsElement.textContent = '';
  if (animeSeries.length > 0) {
    const newTitle = renderTitle(RESULTS_TITLE);
    const newList = renderList(RESULTS_TITLE, animeSeries);
    resultsElement.appendChild(newTitle);
    resultsElement.appendChild(newList);

    // render "load more results" button
    if (currentPage < lastPage) {
      const newButton = renderResultsButton('Cargar más resultados', handleLoadMoreResults);
      resultsElement.appendChild(newButton);
    }
  }
}

function renderTitle(text) {
  const element = document.createElement('h2');
  element.className = 'results__title';
  element.textContent = text;
  return element;
}

function renderList(text, series) {
  const element = document.createElement('ul');
  element.className = 'results__list';
  for (const serie of series) {
    const newListItem = renderListItem(text, serie);
    const newImage = renderImage(serie);
    const newSubtitle = renderSubtitle(text, serie);
    newListItem.appendChild(newImage);
    newListItem.appendChild(newSubtitle);
    element.appendChild(newListItem);
  }
  return element;
}

function renderListItem(text, serie) {
  const element = document.createElement('li');
  element.dataset.id = serie.mal_id;

  // listen list item (only in results section)
  if (text === RESULTS_TITLE) {
    element.addEventListener('click', handleListItem);
  }

  // check if favorite
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

  // render and listen icon (only in favorites section)
  if (text === FAVORITES_TITLE) {
    const newIcon = renderIcon();
    element.appendChild(newIcon);
  }

  return element;
}

function renderIcon() {
  const element = document.createElement('i');
  element.className = 'fas fa-times-circle';
  element.addEventListener('click', handleIcon);
  return element;
}

function renderResultsButton(text, handlerFunction) {
  const element = document.createElement('button');
  element.className = 'main__button main__button--results';
  element.type = 'button';
  element.textContent = text;
  element.addEventListener('click', handlerFunction);
  return element;
}


// api

function getAnimeSeriesFromApi() {

  // reset results from previous search
  if (currentPage === 1) {
    animeSeries = [];
  }

  fetch(`${API_URL}?q=${searchTerm}&page=${currentPage}`)
    .then(response => response.json())
    .then(data => {
      lastPage = data.last_page;
      animeSeries = animeSeries.concat(data.results);
      renderAnimeSeries();
    });
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

  // api documentation: only processes queries with a minimum of 3 letters
  if (searchTerm && searchTerm.length >= 3) {
    currentPage = 1;
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
  currentPage = 1;
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

  renderFavorites();
  renderAnimeSeries();
  setFavoritesInLocalStorage();
}

function handleRemoveAllFavorites() {
  favorites = [];
  renderFavorites();
  renderAnimeSeries();
  removeFavoritesFromLocalStorage();
}

function handleLoadMoreResults(event) {
  currentPage++;
  getAnimeSeriesFromApi();

  // remove clicked button
  event.currentTarget.remove();
}


// app start

getFavoritesFromLocalStorage();
renderFavorites();
listenSearchForm();