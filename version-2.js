let currentLang = "sq";

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("akv-lang-v2", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll(".lang, .lang-block, .lang-line").forEach((el) => {
    el.classList.toggle("active", el.dataset.lang === lang);
  });

  document.querySelectorAll(".nav-lang button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
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
  const navLinks = document.querySelector(".nav-links");
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

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
    { threshold: 0.1 }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.opacity = 0;
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
    io.observe(el);
  });

  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      const original = btn.innerHTML;
      btn.innerHTML = currentLang === "sq" ? "Faleminderit" : currentLang === "en" ? "Thank you" : "Danke";
      btn.style.background = "var(--accent)";
      btn.style.color = "#1a1208";

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = "";
        btn.style.color = "";
        form.reset();
      }, 2600);
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
});
