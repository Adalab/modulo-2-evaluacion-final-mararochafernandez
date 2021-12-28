'use strict';


/* Let's do magic! 🦄🦄🦄 */


// global data

const API_URL = 'https://api.jikan.moe/v3/search/anime';

let searchTerm = 'naruto';

let animeSeries = [];
let favorites = [];


// render anime series

function renderAnimeSeries() {
  // render anime series
}


// api

function getAnimeSeriesFromApi() {

  // api documentation: only processes queries with a minimum of 3 letters
  if (searchTerm.length >= 3) {
    fetch(`${API_URL}?q=${searchTerm}`)
      .then(response => response.json())
      .then(data => {
        animeSeries = data.results;
        renderAnimeSeries();
      });
  }
}


// listen and handle search button event

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


// start app

getAnimeSeriesFromApi();
listenSearchButtonEvent();