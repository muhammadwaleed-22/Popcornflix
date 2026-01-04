const movieContainer = document.querySelector('.movie-container');
const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const pagination = document.querySelector('#pagination');

let currentPage = 1;
let totalPages = 0;
const limit = 20;
let currentQuery = '';

async function getMovies(page = 1, query = '') {
  try {
    const res = await fetch(`https://yts.lt/api/v2/list_movies.json?limit=${limit}&page=${page}&query_term=${query}`);
    const data = await res.json();
    const movies = data.data.movies || [];
    const movieCount = data.data.movie_count || 0;
    totalPages = Math.ceil(movieCount / limit);
    showMovies(movies);
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
  }
}

function showMovies(movies) {
  movieContainer.innerHTML = '';
  if (movies.length === 0) {
    movieContainer.innerHTML = `<p class="col-span-full text-center text-gray-400">No movies found.</p>`;
    return;
  }

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'bg-gray-800 border border-4 border-white-700 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition';
    movieCard.innerHTML = `
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
    movieCard.querySelector('.view-details-btn').addEventListener('click', () => openModal(movie));
    movieContainer.appendChild(movieCard);
  });
}

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

async function loadSimilarMovies(movieId) {
  const container = document.getElementById('similarMovies');
  container.innerHTML = '';
  try {
    const res = await fetch(`https://yts.lt/api/v2/movie_suggestions.json?movie_id=${movieId}`);
    const data = await res.json();
    const movies = data.data.movies.slice(0, 4);
    movies.forEach(m => {
      const div = document.createElement('div');
      div.className = 'cursor-pointer hover:scale-105 transition';
      div.innerHTML = `<img src="${m.medium_cover_image}" class="rounded border border-white"/>`;
      div.onclick = () => openModal(m);
      container.appendChild(div);
    });
  } catch (err) { console.error(err); }
}

function searchMovies() {
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  getMovies(currentPage, currentQuery);
}

searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchMovies(); });

function openModal(movie) {
  document.getElementById('movieModal').classList.remove('hidden');
  document.getElementById('modalPoster').src = movie.large_cover_image || movie.medium_cover_image;
  document.getElementById('modalTitle').textContent = movie.title;
  document.getElementById('modalYear').textContent = movie.year;
  document.getElementById('modalGenre').textContent = movie.genres?.join(', ') || 'N/A';
  document.getElementById('modalRating').textContent = movie.rating;
  document.getElementById('modalLikes').textContent = movie.like_count ? `${movie.like_count} likes` : '';
  document.getElementById('modalSummary').textContent = movie.summary || 'No summary available.';
  const tagsContainer = document.getElementById('modalTags');
  tagsContainer.innerHTML = '';
  if (movie.genres) movie.genres.forEach(g => { 
    const span = document.createElement('span'); 
    span.className = 'border px-3 py-1 rounded text-sm'; 
    span.textContent = g; 
    tagsContainer.appendChild(span); 
  });
  loadSimilarMovies(movie.id);
}

function closeModal() {
  document.getElementById('movieModal').classList.add('hidden');
}

getMovies();

// top100 page functionality

async function getTop100Movies() {
  try {
    const res = await fetch(`https://yts.lt/api/v2/list_movies.json?limit=100&sort_by=rating`);
    const data = await res.json();
    const movies = data.data.movies || [];

    // We won't use pagination since it's fixed 100
    showMovies(movies);
  } catch (err) {
    console.error(err);
  }
}



// newmovies page functionality

async function getNewMovies() {
  try {
    const res = await fetch(`https://yts.lt/api/v2/list_movies.json?limit=50&sort_by=date_added`);
    const data = await res.json();
    let movies = data.data.movies || [];

    // Filter movies to show only 2025 and 2026
    movies = movies.filter(movie => movie.year === 2025 || movie.year === 2026);

    showMovies(movies);
  } catch (err) {
    console.error(err);
  }
}

