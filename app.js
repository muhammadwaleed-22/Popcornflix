const movieContainer = document.querySelector('.movie-container');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

let currentPage = 1;
let totalPages = 0;
let currentQuery = '';
const limit = 20;

async function getMovies(page = 1, query = '') {
  const res = await fetch(`https://yts.bz/api/v2/list_movies.json?limit=${limit}&page=${page}&query_term=${query}`);
  const data = await res.json();
  const movies = data.data.movies || [];
  totalPages = Math.ceil((data.data.movie_count || 0) / limit);
  showMovies(movies);
  renderPagination();
}

function showMovies(movies) {
  movieContainer.innerHTML = '';
  movies.forEach(movie => {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition';
    div.innerHTML = `
      <div class="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <img src="${movie.medium_cover_image}" alt="${movie.title}" class="w-full h-[320px] object-cover" />
        <div class="p-2">
          <h5 class="text-lg font-weight-500 text-yellow-500">${movie.title}</h5>
        </div>
        <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-center px-4">
          <div class="flex items-center gap-2 text-yellow-500 text-xl font-bold mb-2">⭐</div>
          <div class="flex items-center gap-2 text-yellow-500 text-xl font-bold mb-2"><span>${movie.rating} / 10</span></div>
          <p class="text-white text-lg font-semibold mb-4">${movie.genres?.[0] || 'N/A'}</p>
          <button class="view-details-btn bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded transition">View Details</button>
        </div>
      </div>
    `;
    div.querySelector('.view-details-btn').onclick = () => {
      location.href = `view.html?id=${movie.id}`;
    };
    movieContainer.appendChild(div);
  });
}

// function renderPagination() {
//   pagination.innerHTML = '';
//   for (let i = 1; i <= Math.min(totalPages, 10); i++) {
//     const btn = document.createElement('button');
//     btn.textContent = i;
//     btn.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`;
//     btn.onclick = () => {
//       currentPage = i;
//       getMovies(currentPage, currentQuery);
//     };
//     pagination.appendChild(btn);
//   }
// }

function renderPagination() {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;
  const group = Math.floor((currentPage - 1) / 10);
  const start = group * 10 + 1;
  const end = Math.min(start + 9, totalPages);
  pagination.appendChild(createButton('First', currentPage === 1, () => { currentPage = 1; getMovies(currentPage, currentQuery); }));
  pagination.appendChild(createButton('Prev', currentPage === 1, () => { currentPage--; getMovies(currentPage, currentQuery); }));
  for (let i = start; i <= end; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-gray-700 text-white hover:bg-gray-600'}`;
    btn.onclick = () => { currentPage = i; getMovies(currentPage, currentQuery); };
    pagination.appendChild(btn);
  }
  pagination.appendChild(createButton('Next', currentPage === totalPages, () => { currentPage++; getMovies(currentPage, currentQuery); }));
  pagination.appendChild(createButton('Last', currentPage === totalPages, () => { currentPage = totalPages; getMovies(currentPage, currentQuery); }));
}

function createButton(text, disabled, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.disabled = disabled;
  btn.className = 'px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-40';
  btn.onclick = onClick;
  return btn;
}

if (searchBtn) {
  searchBtn.onclick = () => {
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    getMovies(currentPage, currentQuery);
  };
}

if (movieContainer) getMovies();

const params = new URLSearchParams(window.location.search);
const movieId = params.get('id');

async function loadMovieDetails() {
  if (!movieId) return;
  const res = await fetch(`https://yts.bz/api/v2/movie_details.json?movie_id=${movieId}`);
  const data = await res.json();
  const movie = data.data.movie;

  document.getElementById('poster').src = movie.large_cover_image;
  document.getElementById('title').textContent = movie.title;
  document.getElementById('year').textContent = movie.year;
  document.getElementById('genre').textContent = movie.genres?.join(', ') || 'N/A';
  document.getElementById('rating').textContent = movie.rating;
  document.getElementById('likes').textContent = movie.like_count ? `${movie.like_count} likes` : '';
  document.getElementById('summary').textContent = movie.description_full;

  const tags = document.getElementById('tags');
  tags.innerHTML = '';
  movie.genres?.forEach(g => {
    const span = document.createElement('span');
    span.className = 'border px-3 py-1 rounded text-sm';
    span.textContent = g;
    tags.appendChild(span);
  });

  loadSimilarMovies(movie.id);
}

async function loadSimilarMovies(id) {
  const container = document.getElementById('similarMovies');
  if (!container) return;
  const res = await fetch(`https://yts.lt/api/v2/movie_suggestions.json?movie_id=${id}`);
  const data = await res.json();
  data.data.movies.slice(0, 4).forEach(m => {
    const div = document.createElement('div');
    div.className = 'cursor-pointer hover:scale-105 transition';
    div.innerHTML = `<img src="${m.medium_cover_image}" class="rounded border">`;
    div.onclick = () => location.href = `view.html?id=${m.id}`;
    container.appendChild(div);
  });
}

loadMovieDetails();
