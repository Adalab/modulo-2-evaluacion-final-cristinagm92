const searchForm = document.querySelector(".search-box");
const searchInput = document.querySelector(".search-input");
const resultsContainer = document.querySelector(".results-grid");
const favoritesList = document.querySelector(".favorites-list");
const clearFavsButton = document.querySelector(".clear-favorites-button");
const resetButton = document.querySelector(".reset-button");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

searchForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const query = searchInput.value.trim();
  resultsContainer.innerHTML = "";

  if (!query) return;

  fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      if (data.data.length === 0) {
        resultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
      }

      resultsContainer.innerHTML = data.data.map(anime => {
        const imageUrl = anime.images.jpg.image_url;
        const isDefault = imageUrl === "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png";
        const fixedUrl = isDefault ? "https://via.placeholder.com/210x295//666666/?text=TV" : imageUrl;
        const isFav = favorites.some(fav => fav.mal_id === anime.mal_id);
        const favClass = isFav ? "favorite" : "";

        return `
          <div class="anime-card ${favClass}" data-id="${anime.mal_id}" data-title="${anime.title}" data-image="${fixedUrl}">
            <img src="${fixedUrl}" alt="${anime.title}" />
            <div class="anime-title">${anime.title}</div>
          </div>
        `;
      }).join("");

      document.querySelectorAll(".anime-card").forEach(card => {
        card.addEventListener("click", () => toggleFavorite(card));
      });
    });
});

function toggleFavorite(card) {
  const animeId = parseInt(card.dataset.id);
  const title = card.dataset.title;
  const image = card.dataset.image;

  const index = favorites.findIndex(anime => anime.mal_id === animeId);

  if (index === -1) {
    favorites.push({ mal_id: animeId, title, image });
  } else {
    favorites.splice(index, 1);
  }

  card.classList.toggle("favorite");
  saveFavorites();
  renderFavorites();
}
function renderFavorites() {
  favoritesList.innerHTML = favorites.map(anime => `
    <li>
      ${anime.title}
      <button class="remove-fav" data-id="${anime.mal_id}">x</button>
    </li>
  `).join("");

  document.querySelectorAll(".remove-fav").forEach(button => {
    button.addEventListener("click", (e) => {
      const idToRemove = parseInt(button.dataset.id);
      favorites = favorites.filter(anime => anime.mal_id !== idToRemove);
      saveFavorites();
      renderFavorites();
      updateResultCards();
    });
  });
}
function updateResultCards() {
  document.querySelectorAll(".anime-card").forEach(card => {
    const animeId = parseInt(card.dataset.id);
    const isFav = favorites.some(fav => fav.mal_id === animeId);
    card.classList.toggle("favorite", isFav);
  });
}

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}
