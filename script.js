
(function () {
  "use strict";

  const CATEGORY_LABELS = {
    pizza: "Pizza",
    paste: "Paste",
    meniu: "Panini",
    deserturi: "Desert",
    bauturi: "Băuturi",
    "produse-italiene": "Produse Italiene",
    "alte-produse": "Alte Produse",
    locatie: "Locație",
    contact: "Contact",
    recenzii: "Recenzii",
    feedback: "Feedback",
  };

  function fărăDiacritice(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function parsePret(pretText) {
    const match = (pretText || "").replace(",", ".").match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  // ---------------------------------------------------------
  // 1. Randarea meniului din MENU_DATA
  // ---------------------------------------------------------

  const flatIndex = [];

  function randeazaMeniul() {
    const container = document.getElementById("meniu-dinamic");
    if (!container) return;
    const fragment = document.createDocumentFragment();

    MENU_DATA.forEach((section) => {
      const sectionEl = document.createElement("section");
      sectionEl.id = section.id;
      sectionEl.className = "menu-section";

      const h2 = document.createElement("h2");
      h2.textContent = section.title;
      sectionEl.appendChild(h2);

      section.groups.forEach((group, gIdx) => {
        if (group.heading) {
          const heading = document.createElement("h3");
          heading.className = "group-heading";
          heading.textContent = group.heading;
          sectionEl.appendChild(heading);
        }

        const list = document.createElement("div");
        list.className = "menu-list";

        group.items.forEach((item, iIdx) => {
          const itemId = `${section.id}-${gIdx}-${iIdx}`;
          const priceNum = parsePret(item.price);

          flatIndex.push({
            id: itemId,
            name: item.name,
            detail: item.details.join(" "),
            price: item.price,
            priceNum,
            sectionId: section.id,
          });

          const row = document.createElement("div");
          row.className = "menu-row";
          row.dataset.id = itemId;

          if (item.img) {
            const img = document.createElement("img");
            img.className = "thumb";
            img.src = item.img;
            img.alt = item.name;
            img.loading = "lazy";
            row.appendChild(img);
          }

          const body = document.createElement("div");
          body.className = "row-body";

          const head = document.createElement("div");
          head.className = "row-head";

          const name = document.createElement("span");
          name.className = "name";
          name.textContent = item.name;
          head.appendChild(name);

          const fill = document.createElement("span");
          fill.className = "fill";
          head.appendChild(fill);

          const price = document.createElement("span");
          price.className = "price";
          price.textContent = item.price;
          head.appendChild(price);

          body.appendChild(head);

          item.details.forEach((d) => {
            const p = document.createElement("p");
            p.className = "detail";
            p.textContent = d;
            body.appendChild(p);
          });

          row.appendChild(body);
          list.appendChild(row);
        });

        sectionEl.appendChild(list);
      });

      fragment.appendChild(sectionEl);
    });

    container.appendChild(fragment);
  }

  function randeazaNavigarea() {
    const scroller = document.getElementById("categoryNavScroller");
    if (!scroller) return;
    const staticSections = ["locatie", "contact", "recenzii", "feedback"];
    const ids = MENU_DATA.map((s) => s.id).concat(staticSections);

    ids.forEach((id) => {
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = CATEGORY_LABELS[id] || id;
      a.dataset.target = id;
      scroller.appendChild(a);
    });
  }

  function centreazaLinkulActiv(link) {
    const scroller = document.getElementById("categoryNavScroller");
    if (!scroller) return;
    const target = link.offsetLeft - scroller.clientWidth / 2 + link.clientWidth / 2;
    scroller.scrollTo({ left: target, behavior: "smooth" });
  }

  function evidentiazaSectiuneaActiva() {
    const navLinks = document.querySelectorAll(".category-nav a");
    const sections = document.querySelectorAll("main .menu-section");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.dataset.target === entry.target.id);
            });
            const activeLink = document.querySelector(`.category-nav a[data-target="${entry.target.id}"]`);
            if (activeLink) centreazaLinkulActiv(activeLink);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // ---------------------------------------------------------
  // 2. Căutare
  // ---------------------------------------------------------

  function initCautare() {
    const searchInput = document.getElementById("finalSearch");
    const resultsList = document.getElementById("final-results-list");
    if (!searchInput || !resultsList) return;

    searchInput.addEventListener("input", function () {
      const query = this.value.trim();
      const queryNorm = fărăDiacritice(query);
      resultsList.innerHTML = "";

      if (query.length < 2) {
        resultsList.classList.remove("open");
        return;
      }

      const matches = flatIndex.filter((item) => {
        return (
          fărăDiacritice(item.name).includes(queryNorm) ||
          fărăDiacritice(item.detail).includes(queryNorm)
        );
      });

      if (matches.length === 0) {
        resultsList.innerHTML = '<div class="search-result-empty">Niciun rezultat găsit.</div>';
      } else {
        matches.slice(0, 20).forEach((item) => {
          const div = document.createElement("div");
          div.className = "search-result-item";
          div.innerHTML = `<span>${item.name}</span><span class="sr-price">${item.price}</span>`;
          div.addEventListener("click", () => {
            const row = document.querySelector(`.menu-row[data-id="${item.id}"]`);
            if (row) {
              row.scrollIntoView({ behavior: "smooth", block: "center" });
              row.style.outline = "2px solid var(--auriu)";
              row.style.outlineOffset = "4px";
              setTimeout(() => { row.style.outline = ""; row.style.outlineOffset = ""; }, 2000);
            }
            resultsList.classList.remove("open");
            searchInput.value = "";
          });
          resultsList.appendChild(div);
        });
      }
      resultsList.classList.add("open");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrapper")) {
        resultsList.classList.remove("open");
      }
    });
  }

  // ---------------------------------------------------------
  // 3. Scroll to top
  // ---------------------------------------------------------

  function initScrollTop() {
    const scrollBtn = document.getElementById("scrollTopBtn");
    if (!scrollBtn) return;
    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ---------------------------------------------------------
  // 4. Slider recenzii
  // ---------------------------------------------------------

  function initSliderRecenzii() {
    const track = document.getElementById("reviewsTrack");
    if (!track) return;
    
    const SLIDE_DURATION = 10000;
    const slides = track.querySelectorAll(".review-slide");
    const dotsContainer = document.getElementById("sliderDots");
    const progressFill = document.getElementById("progressFill");
    const prevBtn = document.getElementById("reviewPrev");
    const nextBtn = document.getElementById("reviewNext");
    const wrapper = document.querySelector(".reviews-slider-wrapper");

    let currentIndex = 0;
    let autoTimer = null;
    let pauzat = false;
    const total = slides.length;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Recenzie " + (i + 1));
      dot.addEventListener("click", () => goTo(i, true));
      dotsContainer.appendChild(dot);
    });

    function updateDots(index) {
      dotsContainer.querySelectorAll(".slider-dot").forEach((d, i) => {
        d.classList.toggle("active", i === index);
      });
    }

    function startProgress() {
      if (!progressFill) return;
      progressFill.style.transition = "none";
      progressFill.style.width = "0%";
      void progressFill.offsetWidth;
      progressFill.style.transition = `width ${SLIDE_DURATION}ms linear`;
      progressFill.style.width = "100%";
    }

    function goTo(index, userAction) {
      currentIndex = (index + total) % total;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots(currentIndex);
      if (userAction) scheduleNext();
      startProgress();
    }

    function scheduleNext() {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => {
        if (!pauzat) {
          goTo(currentIndex + 1);
          scheduleNext();
        } else {
          scheduleNext();
        }
      }, SLIDE_DURATION);
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(currentIndex - 1, true));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(currentIndex + 1, true));
    if (wrapper) {
      wrapper.addEventListener("mouseenter", () => (pauzat = true));
      wrapper.addEventListener("mouseleave", () => (pauzat = false));
    }

    let touchStartX = 0;
    track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1, true);
    });

    goTo(0);
    scheduleNext();
  }

  // ---------------------------------------------------------
  // 5. Program deschis/închis
  // ---------------------------------------------------------

  function actualizeazaStatusProgram() {
    const acum = new Date();
    const ziua = acum.getDay();
    const oraCurenta = acum.getHours() + acum.getMinutes() / 60;
    const statusElem = document.getElementById("status-program");
    if (!statusElem) return;

    const orarInchidere = ziua === 1 ? 15.5 : 22;
    const esteDeschis = oraCurenta >= 8 && oraCurenta < orarInchidere;
    const oraFormatata = ziua === 1 ? "15:30" : "22:00";

    const mesaj = esteDeschis
      ? `Deschis acum (până la ${oraFormatata})`
      : "Închis acum (deschidem la 08:00)";

    statusElem.innerHTML = esteDeschis
      ? `<span style="color:#2ecc71;font-size:16px;">●</span> <span style="color:white;">${mesaj}</span>`
      : `<span style="color:#e74c3c;font-size:16px;">●</span> <span style="color:#dcdcdc;">${mesaj}</span>`;
  }

  // ---------------------------------------------------------
  // Inițializare
  // ---------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    randeazaMeniul();
    randeazaNavigarea();
    evidentiazaSectiuneaActiva();
    initCautare();
    initScrollTop();
    initSliderRecenzii();
    actualizeazaStatusProgram();
    setInterval(actualizeazaStatusProgram, 60000);
  });
})();

window.addEventListener('load', () => {
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    // Aici inserezi iframe-ul hărții pentru a te asigura 
    // că se randează imediat ce resursele paginii sunt gata.
    mapContainer.innerHTML = `
      <iframe 
        src="https://www.google.com/maps?q=Panini+da+Arthuro,+Hîncești,+Republica+Moldova&output=embed" 
        width="100%" 
        height="350" 
        style="border:0; border-radius: 12px;" 
        allowfullscreen="" 
        loading="eager">
      </iframe>
    `;
  }
});