(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Header shadow on scroll
  --------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Mobile navigation toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("primaryNav");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     Dropdown submenus (Servicios / Productos)
  --------------------------------------------------------- */
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item"));
  var isTouch = window.matchMedia("(hover: none)").matches;

  navItems.forEach(function (item) {
    var trigger = item.querySelector(":scope > a");
    if (!trigger) return;

    if (isTouch || window.innerWidth <= 980) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        var willOpen = !item.classList.contains("is-open");
        navItems.forEach(function (other) { other.classList.remove("is-open"); });
        if (willOpen) item.classList.add("is-open");
      });
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item")) {
      navItems.forEach(function (item) { item.classList.remove("is-open"); });
    }
  });

  /* ---------------------------------------------------------
     Marca como activo el enlace del menú (nivel superior) que
     corresponde a la página actual, y corrige cualquier
     aria-current="page" mal puesto que haya quedado en el HTML
     (por ejemplo al copiar el header de una página a otra).
  --------------------------------------------------------- */
  var currentFile = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links > a, .nav-item > a").forEach(function (link) {
    var linkFile = link.getAttribute("href");
    if (!linkFile) return;
    if (linkFile === currentFile) {
      link.setAttribute("aria-current", "page");
    } else if (link.getAttribute("aria-current") === "page") {
      link.removeAttribute("aria-current");
    }
  });

  /* ---------------------------------------------------------
     Resalta en el submenú el ítem que corresponde a la página
     actual (ej. "CCTV corporativo" cuando estás en
     servicio-cctv.html), sin tener que tocar cada página a mano.
  --------------------------------------------------------- */
  document.querySelectorAll(".nav-dropdown a").forEach(function (link) {
    var linkFile = link.getAttribute("href");
    if (linkFile === currentFile) {
      link.classList.add("is-current");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------------------------------------------------------
     Page banner — tap-to-zoom on touch devices
  --------------------------------------------------------- */
  var zoomBanners = Array.prototype.slice.call(document.querySelectorAll(".page-banner"));
  zoomBanners.forEach(function (banner) {
    banner.addEventListener("click", function () {
      if (!isTouch) return;
      banner.classList.toggle("is-zoomed");
    });
  });

  /* ---------------------------------------------------------
     Full-width promo slider (auto, top of page)
  --------------------------------------------------------- */
  var promoBanner = document.getElementById("promoBanner");
  if (promoBanner) {
    var promoSlides = Array.prototype.slice.call(promoBanner.querySelectorAll(".promo-slide"));
    var promoDots = Array.prototype.slice.call(promoBanner.querySelectorAll(".promo-dot"));
    var promoPrevBtn = document.getElementById("promoPrev");
    var promoNextBtn = document.getElementById("promoNext");
    var promoCurrent = 0;
    var promoIntervalMs = 6000;
    var promoTimer = null;

    function promoGoTo(index) {
      promoSlides[promoCurrent].classList.remove("is-active");
      promoSlides[promoCurrent].setAttribute("aria-hidden", "true");
      promoDots[promoCurrent] && promoDots[promoCurrent].classList.remove("is-active");
      promoDots[promoCurrent] && promoDots[promoCurrent].setAttribute("aria-selected", "false");

      promoCurrent = (index + promoSlides.length) % promoSlides.length;

      promoSlides[promoCurrent].classList.add("is-active");
      promoSlides[promoCurrent].setAttribute("aria-hidden", "false");
      promoDots[promoCurrent] && promoDots[promoCurrent].classList.add("is-active");
      promoDots[promoCurrent] && promoDots[promoCurrent].setAttribute("aria-selected", "true");
    }

    function promoNext() { promoGoTo(promoCurrent + 1); }
    function promoPrev() { promoGoTo(promoCurrent - 1); }

    function promoStart() {
      if (prefersReducedMotion) return;
      promoStop();
      promoTimer = window.setInterval(promoNext, promoIntervalMs);
    }
    function promoStop() {
      if (promoTimer) { window.clearInterval(promoTimer); promoTimer = null; }
    }

    promoDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        promoGoTo(parseInt(dot.getAttribute("data-index"), 10) || 0);
        promoStart();
      });
    });

    if (promoNextBtn) {
      promoNextBtn.addEventListener("click", function () { promoNext(); promoStart(); });
    }
    if (promoPrevBtn) {
      promoPrevBtn.addEventListener("click", function () { promoPrev(); promoStart(); });
    }

    promoBanner.addEventListener("mouseenter", promoStop);
    promoBanner.addEventListener("mouseleave", promoStart);
    promoBanner.addEventListener("focusin", promoStop);
    promoBanner.addEventListener("focusout", promoStart);

    /* Swipe support for touch devices */
    var promoTouchStartX = 0;
    promoBanner.addEventListener("touchstart", function (e) {
      promoTouchStartX = e.changedTouches[0].screenX;
      promoStop();
    }, { passive: true });
    promoBanner.addEventListener("touchend", function (e) {
      var promoDelta = e.changedTouches[0].screenX - promoTouchStartX;
      if (Math.abs(promoDelta) > 40) {
        promoDelta < 0 ? promoNext() : promoPrev();
      }
      promoStart();
    }, { passive: true });

    promoStart();
  }

  /* ---------------------------------------------------------
     Hero automatic slider
  --------------------------------------------------------- */
  var slider = document.getElementById("heroSlider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".dot"));
    var current = 0;
    var intervalMs = 5000;
    var timer = null;

    function goTo(index) {
      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");
      dots[current] && dots[current].classList.remove("is-active");
      dots[current] && dots[current].setAttribute("aria-selected", "false");

      current = (index + slides.length) % slides.length;

      slides[current].classList.add("is-active");
      slides[current].setAttribute("aria-hidden", "false");
      dots[current] && dots[current].classList.add("is-active");
      dots[current] && dots[current].setAttribute("aria-selected", "true");
    }

    function next() { goTo(current + 1); }

    function start() {
      if (prefersReducedMotion) return;
      stop();
      timer = window.setInterval(next, intervalMs);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(parseInt(dot.getAttribute("data-index"), 10) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);

    /* Swipe support for touch devices */
    var touchStartX = 0;
    slider.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stop();
    }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      var delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 40) {
        delta < 0 ? next() : goTo(current - 1);
      }
      start();
    }, { passive: true });

    start();
  }

  /* ---------------------------------------------------------
     Scroll reveal (fade-in)
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     Contact form
  --------------------------------------------------------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var note = document.getElementById("formNote");

    function setError(fieldEl, hasError) {
      var wrapper = fieldEl.closest(".form-field");
      if (wrapper) wrapper.classList.toggle("has-error", hasError);
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    // Si el formulario vuelve con un error desde send-mail.php, se avisa aquí
    if (window.location.search.indexOf("error=1") !== -1) {
      note.style.color = "#d64545";
      note.textContent = "No pudimos enviar tu solicitud. Revisa los datos e inténtalo nuevamente, o escríbenos por WhatsApp.";
      if (window.history.replaceState) {
        var cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState(null, "", cleanUrl);
      }
    }

    form.addEventListener("submit", function (e) {
      var name = form.querySelector("#fName");
      var email = form.querySelector("#fEmail");
      var message = form.querySelector("#fMessage");

      var valid = true;

      if (!name.value.trim()) { setError(name, true); valid = false; } else { setError(name, false); }
      if (!email.value.trim() || !isValidEmail(email.value.trim())) { setError(email, true); valid = false; } else { setError(email, false); }
      if (!message.value.trim()) { setError(message, true); valid = false; } else { setError(message, false); }

      if (!valid) {
        e.preventDefault();
        note.textContent = "Revisa los campos marcados antes de continuar.";
        note.style.color = "#d64545";
        return;
      }

      // Si todo es válido, el formulario se envía de forma normal
      // (method="POST" action="send-mail.php") y ese script redirige a gracias.html.
      note.style.color = "var(--cyan-300)";
      note.textContent = "Enviando tu solicitud…";
    });
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
