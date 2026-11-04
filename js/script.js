/**
 * GCP Campaign Landing Page — nav, offerings tabs, wow-style reveals.
 */
(function () {
  var header = document.getElementById("site-header");
  var toggle = header.querySelector(".header__toggle");
  var navLinks = Array.from(header.querySelectorAll(".header__link"));
  var sections = ["hero", "challenges", "offerings", "resources"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function headerOffset() {
    return header.offsetHeight || 0;
  }

  function closeMenu() {
    header.classList.remove("header--open");
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  function openMenu() {
    header.classList.add("header--open");
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  }

  toggle.addEventListener("click", function () {
    header.classList.contains("header--open") ? closeMenu() : openMenu();
  });

  var backdrop = header.querySelector(".header__backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  document.addEventListener("click", function (e) {
    if (!header.classList.contains("header--open")) return;
    if (!header.contains(e.target)) closeMenu();
  });

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("header__link--active", link.getAttribute("href") === "#" + id);
    });
  }

  var holdId = "";
  var holdTimer = 0;

  function scrollToTarget(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  }

  document.querySelectorAll("[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;
      e.preventDefault();
      closeMenu();
      holdId = href.slice(1);
      setActive(holdId);
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(function () {
        holdId = "";
        updateActiveFromScroll();
      }, 1200);
      scrollToTarget(href);
      if (history.replaceState) history.replaceState(null, "", href);
    });
  });

  function visibleSlice(el, topClamp) {
    var r = el.getBoundingClientRect();
    return Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, topClamp));
  }

  function updateActiveFromScroll() {
    if (holdId) {
      setActive(holdId);
      return;
    }
    if (!sections.length) return;
    var headerH = headerOffset();
    var resources = document.getElementById("resources");
    if (resources && visibleSlice(resources, headerH) > 80) {
      setActive("resources");
      return;
    }
    var probe = headerH + 48;
    var current = sections[0].id;
    sections.forEach(function (section) {
      if (section.id === "resources") return;
      if (section.getBoundingClientRect().top <= probe) current = section.id;
    });
    setActive(current);
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateActiveFromScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", function () {
    if (window.innerWidth > 899) closeMenu();
    updateActiveFromScroll();
  });
  updateActiveFromScroll();

  function revealEl(el) {
    if (!el || el.classList.contains("is-in")) return;
    el.classList.add("is-in");
  }

  function playWow(root) {
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll(".reveal"), revealEl);
  }

  document.querySelectorAll("[data-wow]").forEach(function (section) {
    section.addEventListener("mouseenter", function () {
      playWow(section);
    });
  });

  var revealNodes = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach(revealEl);
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          revealEl(entry.target);
          if (entry.target.classList.contains("perk-card")) {
            document.querySelectorAll(".perk-card.reveal").forEach(revealEl);
          }
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    revealNodes.forEach(function (node) {
      revealObserver.observe(node);
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function countUp(el, to, duration) {
    if (reduceMotion) {
      el.textContent = String(to);
      return;
    }
    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / duration);
      el.textContent = String(Math.round(to * easeOutCubic(p)));
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function playCounters(root) {
    if (!root || root.getAttribute("data-counted") === "1") return;
    root.setAttribute("data-counted", "1");
    var nums = root.querySelectorAll("[data-count]");
    Array.prototype.forEach.call(nums, function (el, i) {
      var to = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(to)) return;
      var duration = Math.max(900, Math.min(1600, 800 + to * 1.5));
      window.setTimeout(function () {
        countUp(el, to, duration);
      }, i * 90);
    });
  }

  var perkGrid = document.querySelector(".perk-grid");
  var perkDotsWrap = document.querySelector(".perk-dots");
  var perkDots = perkDotsWrap ? perkDotsWrap.querySelectorAll(".perk-dots__dot") : [];
  var perkCards = perkGrid ? Array.from(perkGrid.querySelectorAll(".perk-card")) : [];
  var perkMq = window.matchMedia("(max-width: 899px)");

  function perkGap() {
    if (!perkGrid) return 0;
    var style = window.getComputedStyle(perkGrid);
    return parseFloat(style.columnGap || style.gap) || 0;
  }

  function perkIndex() {
    if (!perkGrid || !perkCards.length) return 0;
    var slide = perkCards[0].offsetWidth + perkGap();
    if (slide <= 0) return 0;
    return Math.max(0, Math.min(perkCards.length - 1, Math.round(perkGrid.scrollLeft / slide)));
  }

  function setPerkDot(index) {
    perkDots.forEach(function (dot, i) {
      var on = i === index;
      dot.classList.toggle("is-active", on);
      if (on) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function scrollPerkTo(index) {
    if (!perkGrid || !perkCards[index]) return;
    var left = perkCards[index].offsetLeft - perkCards[0].offsetLeft;
    perkGrid.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });
    setPerkDot(index);
  }

  if (perkGrid && perkCards.length && perkDotsWrap && perkDots.length) {
    perkGrid.addEventListener(
      "scroll",
      function () {
        if (!perkMq.matches) return;
        setPerkDot(perkIndex());
      },
      { passive: true }
    );

    perkDotsWrap.addEventListener(
      "click",
      function (e) {
        var dot = e.target.closest(".perk-dots__dot");
        if (!dot || !perkMq.matches) return;
        var index = Array.prototype.indexOf.call(perkDotsWrap.children, dot);
        if (index < 0) return;
        e.preventDefault();
        scrollPerkTo(index);
      },
      true
    );

    function resetPerkCarousel() {
      if (perkMq.matches) {
        setPerkDot(perkIndex());
        return;
      }
      perkGrid.scrollLeft = 0;
      setPerkDot(0);
    }

    if (perkMq.addEventListener) perkMq.addEventListener("change", resetPerkCarousel);
    else perkMq.addListener(resetPerkCarousel);
  }

  var why = document.getElementById("why");
  if (why) {
    var statNums = why.querySelectorAll("[data-count]");
    if (!reduceMotion) {
      Array.prototype.forEach.call(statNums, function (el) {
        el.textContent = "0";
      });
    }
    why.addEventListener("mouseenter", function () {
      playCounters(why);
    });
    if (reduceMotion) {
      playCounters(why);
    } else if ("IntersectionObserver" in window) {
      var statGrid = why.querySelector(".stat-grid");
      if (statGrid) {
        var countObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              playCounters(why);
              countObserver.unobserve(entry.target);
            });
          },
          { threshold: 0.4 }
        );
        countObserver.observe(statGrid);
      }
    }
  }

})();
