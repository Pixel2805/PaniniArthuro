// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById('finalSearch');
const resultsList = document.getElementById('final-results-list');

function fărăDiacritice(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

searchInput.addEventListener('input', function () {
  const query = this.value.trim().toLowerCase();
  const queryNorm = fărăDiacritice(query);
  resultsList.innerHTML = '';
  if (query.length < 2) { resultsList.style.display = 'none'; return; }
  const cards = document.querySelectorAll('.menu-card');
  const matches = [];
  cards.forEach(card => {
    const name = card.querySelector('h3');
    const price = card.querySelector('.price');
    const text = name ? fărăDiacritice(name.textContent) : '';
    if (text.includes(queryNorm) && name) {
      matches.push({ name: name.textContent.trim(), price: price ? price.textContent.trim() : '', card: card });
    }
  });
  if (matches.length === 0) {
    resultsList.innerHTML = '<div class="res-item" style="justify-content:center;color:#999;">Niciun rezultat găsit.</div>';
  } else {
    matches.forEach(item => {
      const div = document.createElement('div');
      div.className = 'res-item';
      div.innerHTML = `<span>${item.name}</span><span style="color:#254b23;font-weight:bold;">${item.price}</span>`;
      div.addEventListener('click', () => {
        item.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.card.style.outline = '3px solid #254b23';
        setTimeout(() => item.card.style.outline = '', 2000);
        resultsList.style.display = 'none';
        searchInput.value = '';
      });
      resultsList.appendChild(div);
    });
  }
  resultsList.style.display = 'block';
});

document.addEventListener('click', function (e) {
  if (!e.target.closest('.search-wrapper-final')) {
    resultsList.style.display = 'none';
  }
});

// ===== SCROLL TO TOP BUTTON =====
const scrollBtn = document.getElementById("scrollTopBtn");
window.onscroll = () => {
  scrollBtn.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? "block" : "none";
};
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ===== REVIEWS SLIDER =====
const SLIDE_DURATION = 10000; // 10 secunde
const TRANSITION_DURATION = 900; // ms

const track = document.getElementById('reviewsTrack');
const slides = track.querySelectorAll('.review-slide');
const dotsContainer = document.getElementById('sliderDots');
const progressFill = document.getElementById('progressFill');
const prevBtn = document.getElementById('reviewPrev');
const nextBtn = document.getElementById('reviewNext');

let currentIndex = 0;
let autoTimer = null;
let progressTimer = null;
const total = slides.length;

// Creăm dots
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Recenzie ' + (i + 1));
  dot.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(dot);
});

function updateDots(index) {
  dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

function startProgress() {
  progressFill.style.transition = 'none';
  progressFill.style.width = '0%';
  // Forțăm reflow
  void progressFill.offsetWidth;
  progressFill.style.transition = `width ${SLIDE_DURATION}ms linear`;
  progressFill.style.width = '100%';
}

function goTo(index, userAction = false) {
  currentIndex = (index + total) % total;
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateDots(currentIndex);

  if (userAction) {
    clearTimeout(autoTimer);
    scheduleNext();
  }
  startProgress();
}

function scheduleNext() {
  clearTimeout(autoTimer);
  autoTimer = setTimeout(() => {
    goTo(currentIndex + 1);
    scheduleNext();
  }, SLIDE_DURATION);
}

prevBtn.addEventListener('click', () => goTo(currentIndex - 1, true));
nextBtn.addEventListener('click', () => goTo(currentIndex + 1, true));

// Suport swipe pe mobil
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1, true);
  }
});

// Start
goTo(0);
scheduleNext();

// ===== SMOOTH SCROLL NAVIGATION =====
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    window.scrollTo({ top: target.offsetTop - 40, behavior: "smooth" });
  });
});

// ===== STATUS PROGRAM (DESCHIS/ÎNCHIS) =====
function actualizeazaStatusProgram() {
  const acum = new Date();
  const ziuaSaptamanii = acum.getDay();
  const oraCurenta = acum.getHours() + (acum.getMinutes() / 60);
  const statusElem = document.getElementById('status-program');
  let esteDeschis = false;
  let mesaj = "";
  if (ziuaSaptamanii === 1) {
    esteDeschis = oraCurenta >= 8 && oraCurenta < 15.5;
    mesaj = esteDeschis ? "Deschis acum (Până la 15:30)" : "Închis acum (Deschidem Marți la 08:00)";
  } else {
    esteDeschis = oraCurenta >= 8 && oraCurenta < 21;
    mesaj = esteDeschis ? "Deschis acum (Până la 21:00)" : "Închis acum (Deschidem la 08:00)";
  }
  if (esteDeschis) {
    statusElem.innerHTML = `<span style="color:#2ecc71;font-size:18px;">●</span> <span style="color:white;">${mesaj}</span>`;
  } else {
    statusElem.innerHTML = `<span style="color:#e74c3c;font-size:18px;">●</span> <span style="color:#dcdcdc;">${mesaj}</span>`;
  }
}
actualizeazaStatusProgram();
setInterval(actualizeazaStatusProgram, 60000);
