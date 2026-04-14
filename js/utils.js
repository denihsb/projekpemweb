// ─── DATA ───────────────────────────────────────
async function fetchArtists() {
  const res = await fetch('data/artists.json');
  return res.json();
}

async function fetchArtworks() {
  const res = await fetch('data/artworks.json');
  return res.json();
}

async function getArtistById(id) {
  const artists = await fetchArtists();
  return artists.find(a => a.id === id);
}

async function getArtworkById(id) {
  const artworks = await fetchArtworks();
  return artworks.find(w => w.id === id);
}

async function getArtworksByArtist(artistId) {
  const artworks = await fetchArtworks();
  return artworks.filter(w => w.artistId === artistId);
}

// ─── LOCAL STORAGE HELPERS ──────────────────────
const LS = {
  getFavorites: () => JSON.parse(localStorage.getItem('artlocal_favorites') || '[]'),
  saveFavorites: (favs) => localStorage.setItem('artlocal_favorites', JSON.stringify(favs)),
  isFavorite: (id) => LS.getFavorites().includes(id),
  toggleFavorite: (id) => {
    let favs = LS.getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
      showToast('Dihapus dari favorit');
    } else {
      favs.push(id);
      showToast('💛 Disimpan ke favorit!');
    }
    LS.saveFavorites(favs);
    return favs.includes(id);
  },
  getApresiasi: () => JSON.parse(localStorage.getItem('artlocal_apresiasi') || '{}'),
  getApresiasiCount: (id) => {
    const data = LS.getApresiasi();
    return data[id] || 0;
  },
  isApresiasi: (id) => {
    const liked = JSON.parse(localStorage.getItem('artlocal_liked') || '[]');
    return liked.includes(id);
  },
  toggleApresiasi: (id) => {
    let data = LS.getApresiasi();
    let liked = JSON.parse(localStorage.getItem('artlocal_liked') || '[]');
    if (liked.includes(id)) {
      data[id] = Math.max(0, (data[id] || 0) - 1);
      liked = liked.filter(l => l !== id);
    } else {
      data[id] = (data[id] || 0) + 1;
      liked.push(id);
    }
    localStorage.setItem('artlocal_apresiasi', JSON.stringify(data));
    localStorage.setItem('artlocal_liked', JSON.stringify(liked));
    return liked.includes(id);
  },
  getTheme: () => localStorage.getItem('artlocal_theme') || 'dark',
  setTheme: (t) => localStorage.setItem('artlocal_theme', t),
};

// ─── THEME ──────────────────────────────────────
function initTheme() {
  const theme = LS.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeBtn(theme);
}

function toggleTheme() {
  const current = LS.getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  LS.setTheme(next);
  document.documentElement.setAttribute('data-theme', next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = theme === 'dark'
    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>`;
}

// ─── TOAST ──────────────────────────────────────
let toastTimeout;
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── URL PARAMS ─────────────────────────────────
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ─── ACTIVE NAV ─────────────────────────────────
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ─── RENDER HELPERS ─────────────────────────────
function renderFavBtn(id) {
  const saved = LS.isFavorite(id);
  return `<button class="artwork-fav-btn ${saved ? 'saved' : ''}" onclick="event.stopPropagation(); handleFav(event, '${id}')" title="Simpan favorit">
    ${saved ? '💛' : '🤍'}
  </button>`;
}

function handleFav(e, id) {
  const btn = e.currentTarget;
  const saved = LS.toggleFavorite(id);
  btn.classList.toggle('saved', saved);
  btn.innerHTML = saved ? '💛' : '🤍';
}

function renderArtworkCard(artwork, artist) {
  const saved = LS.isFavorite(artwork.id);
  return `
    <div class="artwork-card" onclick="location.href='artwork.html?id=${artwork.id}'">
      <img src="${artwork.thumbnail}" alt="${artwork.title}" loading="lazy">
      <div class="artwork-card-overlay">
        <div class="artwork-card-title">${artwork.title}</div>
        <div class="artwork-card-artist">${artist ? artist.name : ''} · ${artwork.year}</div>
      </div>
      <span class="artwork-card-cat">${artwork.category}</span>
      <button class="artwork-fav-btn ${saved ? 'saved' : ''}"
        onclick="event.stopPropagation(); handleFav(event, '${artwork.id}')"
        title="Simpan favorit">
        ${saved ? '💛' : '🤍'}
      </button>
    </div>
  `;
}

// ─── INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setActiveNav();
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});
