// FETCH AND DISPLAY POKEMON
let allPokemon = [];
let isPopupOpen = false;
let initialScrollPosition;
let currentPokemon;
let currentSearchQuery = '';
let maxPokemon = 200;
let loadedPokemonCount = 0;
let colors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    dark: "#EE99AC",
};

async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function updateLoadButtonVisibility() {
    const loadButton = document.querySelector('footer button');
    loadButton.style.visibility = currentSearchQuery ? 'hidden' : 'visible';
}

async function loadPokemon() {
    document.querySelector('footer button').style.visibility = 'hidden';
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    const startIdx = loadedPokemonCount + 1;
    const endIdx = Math.min(loadedPokemonCount + 20, maxPokemon);
    for (let i = startIdx; i <= endIdx; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        const pokemonData = await fetchData(url);
        allPokemon.push(pokemonData);
    }
    loadedPokemonCount = endIdx;
    renderPokemonList(allPokemon);
    loader.style.display = 'none';
    updateLoadButtonVisibility();
}

function renderPokemonList(pokemonArray) {
    let pokemonList = document.getElementById("allPokemons");
    pokemonList.innerHTML = "";
    for (let i = 0; i < pokemonArray.length; i++) {
        let pokemon = pokemonArray[i];
        let capitalizedFirstLetter = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        let html = createPokedexTemplate(pokemon, capitalizedFirstLetter);
        pokemonList.innerHTML += html;
    }
}

async function nextPokemon() {
    currentPokemon++;
    if (currentPokemon >= allPokemon.length) {
        currentPokemon = 0;
    }
    await updatePopupContent(allPokemon[currentPokemon]);
}

async function previousPokemon() {
    currentPokemon--;
    if (currentPokemon < 0) {
        currentPokemon = allPokemon.length - 1;
    }
    await updatePopupContent(allPokemon[currentPokemon]);
}

// FILTER POKEMON
function filterPokemonByName(pokemon, query) {
    return pokemon.name.toLowerCase().startsWith(query.toLowerCase());
}

function searchPokemon(query) {
    currentSearchQuery = query;
    let filteredPokemon = allPokemon.filter(function (pokemon) {
        return filterPokemonByName(pokemon, query);
    });
    if (filteredPokemon.length === 0) {
        displayNotFoundMessage();
    } else {
        renderPokemonList(filteredPokemon);
    }
    updateLoadButtonVisibility();
}

function displayNotFoundMessage() {
    let pokemonList = document.getElementById("allPokemons");
    pokemonList.innerHTML = "<div id='notFoundMessage'>Pokemon not found</div>";
}

// POKEMON DETAILS FUNCTION
async function openPokemon(id) {
    if (isPopupOpen) {
        closePopup();
    }
    initialScrollPosition = window.scrollY;
    currentPokemon = id - 1;
    let url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    let response = await fetch(url);
    let pokemonDetail = await response.json();
    displayPopup(pokemonDetail, currentPokemon);
}

function calculatePokemonDetails(pokemonDetail) {
    let capitalizedFirstLetter = pokemonDetail.name.charAt(0).toUpperCase() + pokemonDetail.name.slice(1);
    let typesHtml = pokemonDetail.types.map(type => `<span class="${type.type.name}">${type.type.name}</span>`).join('');
    let height = pokemonDetail.height / 10;
    let weight = pokemonDetail.weight / 10;
    let abilitiesHtml = pokemonDetail.abilities.map(ability => `<span class="${ability.ability.name.toLowerCase()}">${ability.ability.name}</span>`).join('');
    let typeColor = colors[pokemonDetail.types[0].type.name] || "#FFFFFF";
    let statsHtml = generateStatsHtml(pokemonDetail.stats, typeColor);
    return {
        capitalizedFirstLetter, typesHtml, height, weight, abilitiesHtml, statsHtml
    };
}

function displayPopup(pokemonDetail, currentPokemonIndex) {
    let { capitalizedFirstLetter, typesHtml, height, weight, abilitiesHtml, statsHtml } = calculatePokemonDetails(pokemonDetail);
    let pokemonColor = colors[pokemonDetail.types[0].type.name] || "#FFFFFF";
    let html = generatePopupHTML(pokemonDetail, capitalizedFirstLetter, typesHtml, height, weight, abilitiesHtml, statsHtml, pokemonColor);
    document.body.innerHTML += html;
    document.body.style.overflow = 'hidden';
    currentPokemon = currentPokemonIndex;
    document.getElementById('searchInput').value = currentSearchQuery;
}

async function updatePopupContent(pokemonDetail) {
    let { capitalizedFirstLetter, typesHtml, height, weight, abilitiesHtml, statsHtml } = calculatePokemonDetails(pokemonDetail);
    let pokemonColor = colors[pokemonDetail.types[0].type.name] || "#FFFFFF";
    let popupElement = document.querySelector('.popup');
    popupElement.querySelector('.card span').innerText = capitalizedFirstLetter;
    popupElement.querySelector('.pokemonId').innerText = `#${pokemonDetail.id}`;
    popupElement.querySelector('.detailImage img').src = pokemonDetail.sprites.other.dream_world.front_default;
    popupElement.querySelector('.types').innerHTML = typesHtml;
    popupElement.querySelector('.weight p').innerText = `${weight}kg`;
    popupElement.querySelector('.height p').innerText = `${height}m`;
    popupElement.querySelector('.abilities').innerHTML = abilitiesHtml;
    popupElement.querySelector('.stats').innerHTML = `<span>Base Stats</span>${statsHtml}`;
    popupElement.querySelector('.card').style.backgroundColor = pokemonColor;
    let spanElements = popupElement.querySelectorAll('.types span');
    spanElements.forEach(function (span) {
        span.style.backgroundColor = pokemonColor;
    });
}

function closePopup() {
    isPopupOpen = false;
    document.querySelector('.popup').remove();
    document.body.style.overflow = '';
    window.scrollTo(0, initialScrollPosition);
}

// HTML FUNCTIONS
function createPokedexTemplate(pokemon, capitalizedFirstLetter) {
    let pokemonColor = colors[pokemon.types[0].type.name] || "#FFFFFF";
    return `
        <div id="pokedex" style="background-color: ${pokemonColor};">
            <div id="pokemonId">#${pokemon.id}</div>
            <div onclick="openPokemon(${pokemon.id})" id="pokemonImage" style="background-color: ${pokemonColor};">
                <img src="${pokemon.sprites.other.dream_world.front_default}">
            </div>
            <div id="name">${capitalizedFirstLetter}</div>
        </div>`;
}

function generateStatsHtml(stats, typeColor) {
    return stats.map(stat => {
        return `
            <div class="statsWrapper">
                <div class="statName" style="color: ${typeColor};"><p>${stat.stat.name}</p></div>
                <progress value="${stat.base_stat}" max="100" class="progress-bar" style="--progress-color: ${typeColor};"></progress>
            </div>`;
    }).join('');
}

function generatePopupHTML(pokemonDetail, capitalizedFirstLetter, typesHtml, height, weight, abilitiesHtml, statsHtml, pokemonColor) {
    return `
        <div class="popup">
            <style>
                .types span {
                    background-color: ${pokemonColor};
                    border-radius: 50px;
                    padding: 8px 20px;
                }
            </style>
            <div class="card" style="background-color: ${pokemonColor};">
                <div class="detailHeader">
                    <i onclick="closePopup()" class="fa-solid fa-arrow-left"></i>
                    <span>${capitalizedFirstLetter}</span>
                    <div class="pokemonId">#${pokemonDetail.id}</div>
                </div>
                <div class="detailImage">
                    <img src="${pokemonDetail.sprites.other.dream_world.front_default}">
                </div>
                <div>
                    <div class="nextPokemon"><i class="fa-solid fa-chevron-left" onclick="previousPokemon()"></i>
                        <i class="fa-solid fa-chevron-right" onclick="nextPokemon()"></i>
                    </div>
                    <p class="types">${typesHtml}</p>
                    <p class="about">About</p>
                </div>
                <div class="pokemonWeightHeightMove">
                    <div class="weightWrapper">
                        <div class="weight">
                            <i class="fa-solid fa-weight-hanging"></i>
                            <p>${weight}kg</p>
                        </div>
                        <p>Weight</p>
                    </div>
                    <div class="heightWrapper">
                        <div class="height">
                            <i class="fa-solid fa-ruler-vertical"></i>
                            <p>${height}m</p>
                        </div>
                        <p>Height</p>
                    </div>
                    <div class="abilitiesWrapper">
                        <div class="abilities">${abilitiesHtml}</div>
                    </div>
                </div>
                <div class="stats">
                    <span>Base Stats</span>
                    ${statsHtml}
                </div>
            </div>
        </div>`;
}