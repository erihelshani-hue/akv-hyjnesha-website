// FIX: Read language preference from localStorage on init
let currentLang = localStorage.getItem("akv-lang-v2") || "sq";

const topicLabels = {
  booking: { sq: "K\u00ebrkes\u00eb p\u00ebr rezervim", de: "Buchungsanfrage", en: "Booking request" },
  press: { sq: "Shtypi", de: "Presse", en: "Press" },
  partner: { sq: "Partner", de: "Partner", en: "Partner" },
  community: { sq: "Community", de: "Community", en: "Community" },
};

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("akv-lang-v2", lang);
  // FIX: Update <html lang> dynamically for accessibility & SEO
  document.documentElement.lang = lang;

  document.querySelectorAll(".lang, .lang-block, .lang-line").forEach((el) => {
    el.classList.toggle("active", el.dataset.lang === lang);
  });

  document.querySelectorAll(".nav-lang button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  document.querySelectorAll("[data-topic-select] option").forEach((opt) => {
    const labels = topicLabels[opt.value];
    if (labels) opt.textContent = labels[lang] || labels.sq;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setLang(currentLang);

  document.querySelectorAll(".nav-lang button").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const mobileBtn = document.querySelector(".nav-mobile");
  const navLinks  = document.querySelector(".nav-links");
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      // FIX: aria-expanded for screen readers
      mobileBtn.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        mobileBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("[data-events-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.eventsTab;
      document.querySelectorAll("[data-events-tab]").forEach((btn) => {
        const isActive = btn === tab;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
      document.querySelectorAll("[data-events-panel]").forEach((panel) => {
        const isActive = panel.dataset.eventsPanel === target;
        panel.classList.toggle("active", isActive);
        panel.hidden = !isActive;
      });
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.opacity = 0;
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
    io.observe(el);
  });

  // FIX: Improved form states — spinner, success message, prevent double-submit
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      if (btn.disabled) return;

      btn.disabled = true;
      btn.innerHTML = '<span class="form-spinner"></span>';

      setTimeout(() => {
        const successText = {
          de: "Nachricht gesendet! Wir melden uns bald. ✓",
          sq: "Mesazhi u dërgua! Do t'ju kontaktojmë së shpejti. ✓",
          en: "Message sent! We will be in touch soon. ✓",
        };
        form.innerHTML = `<div class="form-success">${successText[currentLang] || successText.de}</div>`;
      }, 1400);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (event) => {
      const id = a.getAttribute("href");
      if (id.length <= 1) return;
      const el = document.querySelector(id);
      if (!el) return;
      event.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // FIX: Gallery lightbox
  initLightbox();

  // FIX: Video modal — replaces inline <video> with thumbnail + play button → modal
  initVideoModal();
});

// FIX: Full-screen gallery lightbox with keyboard navigation
function initLightbox() {
  const galleryItems = [...document.querySelectorAll(".gallery-item img")];
  if (!galleryItems.length) return;

  let currentIndex = 0;

  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Bildanzeige");
  lb.innerHTML = `
    <div class="lb-backdrop"></div>
    <button class="lb-close" aria-label="Schliessen">&#x2715;</button>
    <button class="lb-prev" aria-label="Vorheriges Bild">&#8249;</button>
    <button class="lb-next" aria-label="N&auml;chstes Bild">&#8250;</button>
    <figure class="lb-figure">
      <img class="lb-img" src="" alt="" />
      <figcaption class="lb-caption"></figcaption>
    </figure>
  `;
  document.body.appendChild(lb);

  const lbImg     = lb.querySelector(".lb-img");
  const lbCaption = lb.querySelector(".lb-caption");

  function openLightbox(index) {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    lbImg.src            = galleryItems[currentIndex].src;
    lbImg.alt            = galleryItems[currentIndex].alt;
    lbCaption.textContent = galleryItems[currentIndex].alt;
    lb.classList.add("active");
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  }

  function closeLightbox() {
    lb.classList.remove("active");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  galleryItems.forEach((img, i) => {
    const item = img.closest(".gallery-item");
    item.style.cursor = "pointer";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Bild öffnen: ${img.alt}`);
    item.addEventListener("click", () => openLightbox(i));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
    });
  });

  lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lb.querySelector(".lb-prev").addEventListener("click", () => openLightbox(currentIndex - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => openLightbox(currentIndex + 1));
  lb.querySelector(".lb-backdrop").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("active")) return;
    if (e.key === "Escape")     closeLightbox();
    if (e.key === "ArrowLeft")  openLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") openLightbox(currentIndex + 1);
  });
}

// FIX: Video modal — thumbnail + play button → full-screen modal with HTML5 video
function initVideoModal() {
  const cards = [...document.querySelectorAll(".video-card--native")];
  if (!cards.length) return;

  const modal = document.createElement("div");
  modal.id = "video-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="vm-backdrop"></div>
    <div class="vm-inner">
      <button class="vm-close" aria-label="Video schliessen">&#x2715;</button>
      <video class="vm-video" controls playsinline></video>
    </div>
  `;
  document.body.appendChild(modal);

  const vmVideo = modal.querySelector(".vm-video");

  function openVideo(src, poster) {
    vmVideo.poster = poster || "";
    vmVideo.src    = src;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    vmVideo.play().catch(() => {});
  }

  function closeVideo() {
    modal.classList.remove("active");
    vmVideo.pause();
    vmVideo.removeAttribute("src");
    vmVideo.load();
    document.body.style.overflow = "";
  }

  cards.forEach((card) => {
    const videoEl  = card.querySelector("video");
    const sourceEl = videoEl ? videoEl.querySelector("source") : null;
    const src      = sourceEl ? sourceEl.getAttribute("src") : "";
    const poster   = videoEl  ? videoEl.getAttribute("poster") : "";
    const info     = card.querySelector(".video-info");

    // Rebuild card as thumbnail + play overlay (remove inline <video>)
    card.innerHTML = "";

    const thumb = document.createElement("div");
    thumb.className = "video-thumb";
    if (poster) {
      const img = document.createElement("img");
      img.src     = poster;
      img.alt     = "Video Vorschau";
      img.loading = "lazy";
      img.decoding = "async";
      thumb.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.className = "video-thumb-placeholder";
      thumb.appendChild(ph);
    }

    const playOverlay = document.createElement("div");
    playOverlay.className = "video-play-overlay";
    playOverlay.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="40" height="40" aria-hidden="true"><polygon points="6,3 20,12 6,21"/></svg>`;
    thumb.appendChild(playOverlay);
    card.appendChild(thumb);

    if (info) card.appendChild(info);

    card.style.cursor = "pointer";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.addEventListener("click", () => openVideo(src, poster));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openVideo(src, poster); }
    });
  });

  modal.querySelector(".vm-close").addEventListener("click", closeVideo);
  modal.querySelector(".vm-backdrop").addEventListener("click", closeVideo);
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;
    if (e.key === "Escape") closeVideo();
  });
}
