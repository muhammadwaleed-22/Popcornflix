const movieContainer = document.querySelector('.movie-container');
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');

let allMovies = [];

async function getMovies() {
  try {
    const res = await fetch(
      'https://yts.lt/api/v2/list_movies.json'
    );
    const data = await res.json();
    showMovies(data.data.movies);
  } catch (err) {
    console.error(err);
  }
}

function showMovies(movies) {
  movieContainer.innerHTML = '';

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className =
      'movieCard bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition';

    movieCard.innerHTML = `
      
      <img 
        src="${movie.medium_cover_image}" 
        alt="${movie.title}" 
        class="w-full h-[350px] object-cover"
      />

      <div class="p-4">
        <h2 class="text-lg font-bold text-yellow-500 mb-1">
          ${movie.title}
        </h2>

        <p class="text-gray-400 text-sm">
            Rating: ${movie.rating}
        </p>

        <p class="text-gray-400 text-sm">
            Year: ${movie.year}
        </p>
        
        <p class="text-gray-400 text-sm">
            Duration: ${movie.runtime} mins
        </p>
      </div>
    `;

    movieContainer.appendChild(movieCard);
  });
}

getMovies();

function setMoviesData(movies) {
  allMovies = movies;
}

async function searchMovies() {
  const q = searchInput.value.toLowerCase().trim();

  if (!q) {
    showMovies(allMovies);
    return;
  }

  try {
    const res = await fetch(
      `https://yts.lt/api/v2/list_movies.json?query_term=${q}`
    );
    const data = await res.json();
    setMoviesData(data.data.movies || []);
    showMovies(allMovies);
  } catch (err) {
    console.error(err);
  }
}

searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchMovies();
});
