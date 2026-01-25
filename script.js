// Site config
const state = {
  youtubeUrl: "https://www.youtube.com/@thewolfriderbd",
  facebookUrl: "https://www.facebook.com/thewolfriderbd",
  instagramUrl: "https://www.instagram.com/thewolfriderbd/"
};

const BRAND = {
  name: "The Wolf Rider",
  url: "https://thewolfrider.me/",
  logo: "https://thewolfrider.me/assets/Profile%20Logo.png",
  location: "Dhaka, Bangladesh",
  keywords:
    "Bangladesh motovlogger, Yamaha R15M BS7 vlogs, motorcycle travel Bangladesh, Dhaka moto vlog, couple bike travel vlog Bangladesh"
};

const VIDEO_FALLBACK_DESC = "Bangladesh motovlog from Dhaka on a Yamaha R15M BS7 with couple travel highlights.";

// API (exact base provided)
const API_BASE = "https://api.thewolfrider.me";

// API endpoint served from your VPS (update if needed)
const YOUTUBE_API_ENDPOINT = `${API_BASE}/api/youtube`;

// Top slideshow images (static sites can't list directories at runtime).
// Requested: first image must be /assets/IMG_1074.jpg
const TOP_SLIDESHOW_IMAGES = [
  "assets/IMG_1074.jpg",
  "assets/IMG_1669.jpg",
  "assets/IMG_2346.jpg",
  "assets/IMG_3117.jpg",
  "assets/IMG_3161.jpg",
  "assets/IMG_3247.jpg",
  "assets/IMG_4496.jpg",
  "assets/IMG_4655.jpg",
  "assets/IMG_5941.jpg",
  "assets/IMG_6996.jpg",
  "assets/IMG_7237.jpg",
  "assets/IMG_8293.jpg",
  "assets/IMG_8924.jpg",
  "assets/IMG_9328.jpg",
  "assets/dji_mimo.JPG"
];

// Optional: per-image desktop crop/focus (object-position). Leave most empty since your images are cropped.
const TOP_SLIDESHOW_DESKTOP_OBJECT_POSITION = {
  "assets/IMG_1074.jpg": "50% 28%"
};

const THEME_KEY = "theme";

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  // Default to dark theme unless the user explicitly chose light.
  return "dark";
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "light" ? "#f8f4ee" : "#0b0f14");
  }

  const btn = document.querySelector(".theme-switch");
  const icon = document.querySelector(".theme-switch-icon");
  if (btn) {
    const isLight = theme === "light";
    btn.setAttribute("aria-checked", String(isLight));
    btn.setAttribute("aria-label", isLight ? "Light mode (switch to dark)" : "Dark mode (switch to light)");
  }
  if (icon) {
    // Animate emoji switch
    icon.classList.add('switching');
    setTimeout(() => {
      icon.textContent = theme === "light" ? "☀️" : "🌙";
      icon.classList.remove('switching');
    }, 150);
  }
}

function setupThemeToggle() {
  const btn = document.querySelector(".theme-switch");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

function safeText(value) {
  return String(value ?? "");
}

function cleanText(value) {
  return safeText(value).replace(/\s+/g, " ").trim();
}

function truncateText(value, max) {
  const text = cleanText(value);
  if (!max || text.length <= max) return text;
  return `${text.slice(0, max - 3).trimEnd()}...`;
}

function formatPublished(iso) {
  const value = cleanText(iso);
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatPublishedAttr(iso) {
  const value = cleanText(iso);
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function youtubeThumb(videoId) {
  // `hqdefault.jpg` is broadly available without needing API keys
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

function youtubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function youtubeShortUrl(videoId) {
  return `https://www.youtube.com/shorts/${encodeURIComponent(videoId)}`;
}

const animationState = {
  observer: null,
  reducedMotion:
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

function revealOnScroll(root = document) {
  const items = root.querySelectorAll("[data-animate]");
  if (!items.length) return;

  if (animationState.reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!animationState.observer) {
    animationState.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
  }

  items.forEach((el) => animationState.observer.observe(el));
}

function setupScrollAnimations() {
  revealOnScroll(document);
}

function refreshScrollAnimations(root) {
  revealOnScroll(root || document);
}

function renderVideoGrid(mountId, videos, options = {}) {
  const grid = document.getElementById(mountId);
  if (!grid) return;

  const urlFor = options.kind === "shorts" ? youtubeShortUrl : youtubeWatchUrl;
  const label = options.kind === "shorts" ? "Watch short" : "Watch video";

  grid.innerHTML = videos
    .map((v, index) => {
      const title = cleanText(v.title) || "The Wolf Rider";
      const descSource = cleanText(v.desc);
      const desc = descSource ? truncateText(descSource, 160) : VIDEO_FALLBACK_DESC;
      const watch = safeText(v.url) || urlFor(v.id);
      const thumb = safeText(v.thumbnail) || youtubeThumb(v.id);
      const publishedText = formatPublished(v.published);
      const publishedAttr = formatPublishedAttr(v.published);
      const delay = index * 90;

      return `
        <article class="video-card" data-animate style="--delay: ${delay}ms">
          <a class="video-card-link" href="${watch}" target="_blank" rel="noreferrer" aria-label="${label}: ${title}">
            <div class="video-thumb">
              <img src="${thumb}" alt="${title}" loading="lazy" decoding="async" />
            </div>
          </a>
          <div class="video-meta">
            <h3 class="video-title">
              <a href="${watch}" target="_blank" rel="noreferrer">${title}</a>
            </h3>
            <p class="video-desc">${desc}</p>
            <p class="video-meta-line">
              ${publishedText ? `<time datetime="${publishedAttr}">${publishedText}</time> | ` : ""}${BRAND.location} | Yamaha R15M BS7
            </p>
          </div>
        </article>
      `;
    })
    .join("");

  refreshScrollAnimations(grid);
}

function renderGridEmpty(mountId, message) {
  const grid = document.getElementById(mountId);
  if (!grid) return;
  grid.innerHTML = `
    <article class="video-card video-card--empty" data-animate>
      <div class="video-meta">
        <p class="video-desc">${safeText(message)}</p>
      </div>
    </article>
  `;
  refreshScrollAnimations(grid);
}

function getYouTubeApiEndpoint() {
  return window.YOUTUBE_API_ENDPOINT || YOUTUBE_API_ENDPOINT;
}

async function fetchJson(url) {
  // `no-store` so you see updates quickly after deploy.
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function normalizeFeaturedItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const id = typeof item?.id === "string" ? item.id : "";
      return {
        id: String(id).trim(),
        title: safeText(item?.title ?? ""),
        published: safeText(item?.publishedAt ?? ""),
        desc: safeText(item?.description ?? item?.desc ?? ""),
        url: safeText(item?.url ?? ""),
        thumbnail: safeText(item?.thumbnail ?? "")
      };
    })
    .filter((v) => v.id);
}

async function fetchYouTubeData() {
  const endpoint = getYouTubeApiEndpoint();
  return fetchJson(endpoint);
}

function updateSubscriberCount(payload) {
  const count = Number(payload?.subscriberCount);
  if (!Number.isFinite(count)) return false;

  const heroMount = document.getElementById("subscribers-count");
  if (heroMount) heroMount.textContent = count.toLocaleString();
  return true;
}

function updateFeaturedGrids(payload) {
  const videos = normalizeFeaturedItems(payload?.featuredVideos);
  const shorts = normalizeFeaturedItems(payload?.featuredShorts);

  if (videos.length) {
    renderVideoGrid("videos-grid", videos);
  } else {
    renderGridEmpty("videos-grid", "No videos found yet.");
  }

  if (shorts.length) {
    renderVideoGrid("shorts-grid", shorts, { kind: "shorts" });
  } else {
    renderGridEmpty("shorts-grid", "No shorts found yet.");
  }

  return { videos, shorts };
}

function setupNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  // Close menu on navigation
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });
}

function setupTopSlideshow() {
  const img = document.getElementById("top-slideshow-image");
  const controls = document.getElementById("top-slideshow-controls");
  if (!img || !controls) return;

  const slides = TOP_SLIDESHOW_IMAGES.filter(Boolean);
  if (!slides.length) return;

  let currentIndex = 0;
  let timerId = null;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setActiveButton(index) {
    controls.querySelectorAll("button").forEach((btn) => {
      const btnIndex = Number(btn.dataset.index);
      btn.setAttribute("aria-current", btnIndex === index ? "true" : "false");
    });
  }

  function preloadNext(index) {
    const next = slides[(index + 1) % slides.length];
    const pre = new Image();
    pre.src = next;
  }

  function show(index) {
    const nextIndex = ((index % slides.length) + slides.length) % slides.length;
    const nextSrc = slides[nextIndex];

    // Apply desktop crop preference for this slide (mobile stays centered via CSS).
    const desktopPos = TOP_SLIDESHOW_DESKTOP_OBJECT_POSITION[nextSrc] || "50% 35%";
    img.style.setProperty("--top-slide-pos", desktopPos);

    // Fade out first, then swap image, then fade in.
    img.classList.add("is-fading");

    const pre = new Image();
    const swap = () => {
      window.setTimeout(() => {
        img.src = nextSrc;
        img.alt = `Photo ${nextIndex + 1}`;
        requestAnimationFrame(() => img.classList.remove("is-fading"));
      }, 180);
    };
    pre.onload = swap;
    pre.onerror = swap;
    pre.src = nextSrc;

    currentIndex = nextIndex;
    setActiveButton(currentIndex);
    preloadNext(currentIndex);
  }

  function scheduleNextTick() {
    if (prefersReducedMotion) return;
    if (timerId) window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      show(currentIndex + 1);
      scheduleNextTick();
    }, 5000);
  }

  // Build dot buttons (1..N)
  controls.innerHTML = slides
    .map((_, i) => {
      const current = i === 0 ? "true" : "false";
      return `
        <button class="top-slideshow-btn" type="button" data-index="${i}" aria-label="Show photo ${i + 1}" aria-current="${current}"></button>
      `;
    })
    .join("");

  controls.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      if (!Number.isFinite(index)) return;
      show(index);
      scheduleNextTick();
    });
  });

  // Ensure we start on IMG_1074.jpg (requested)
  const requestedFirst = "assets/IMG_1074.jpg";
  const requestedIndex = slides.indexOf(requestedFirst);
  if (requestedIndex > 0) {
    show(requestedIndex);
  } else {
    show(0);
  }

  scheduleNextTick();

  // Some browsers pause timers in background tabs; resume cleanly when visible.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleNextTick();
  });
}

function buildVideoSchemaItems(videos, options = {}) {
  const urlFor = options.kind === "shorts" ? youtubeShortUrl : youtubeWatchUrl;

  return videos.map((video) => {
    const watch = cleanText(video.url) || urlFor(video.id);
    const thumb = cleanText(video.thumbnail) || youtubeThumb(video.id);
    const uploadDate = formatPublishedAttr(video.published);
    const name = cleanText(video.title) || "The Wolf Rider video";
    const description = cleanText(video.desc) || VIDEO_FALLBACK_DESC;

    const schema = {
      "@type": "VideoObject",
      name,
      description,
      thumbnailUrl: [thumb],
      contentUrl: watch,
      embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(video.id)}`,
      author: {
        "@type": "Person",
        name: "Al-amin Khan"
      },
      publisher: {
        "@type": "Organization",
        name: BRAND.name,
        url: BRAND.url,
        logo: {
          "@type": "ImageObject",
          url: BRAND.logo
        }
      },
      contentLocation: {
        "@type": "Place",
        name: BRAND.location
      },
      keywords: BRAND.keywords,
      genre: "Motovlogging",
      inLanguage: "en"
    };

    if (uploadDate) schema.uploadDate = uploadDate;
    return schema;
  });
}

function updateVideoSchema(videos, shorts) {
  const script = document.getElementById("video-schema");
  if (!script) return;

  const items = [
    ...buildVideoSchemaItems(videos || []),
    ...buildVideoSchemaItems(shorts || [], { kind: "shorts" })
  ];

  if (!items.length) {
    script.textContent = "";
    return;
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": items
  };

  script.textContent = JSON.stringify(schema);
}

// Repo JSON loaders removed (now using the VPS YouTube endpoint).

async function init() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  applyTheme(getPreferredTheme());
  setupThemeToggle();

  const yt = document.getElementById("youtube-link");
  const fb = document.getElementById("facebook-link");
  const ig = document.getElementById("instagram-link");
  if (yt) yt.href = state.youtubeUrl;
  if (fb) fb.href = state.facebookUrl;
  if (ig) ig.href = state.instagramUrl;

  setupNavToggle();

  setupTopSlideshow();
  setupScrollAnimations();

  // If opened as a local file, browsers often block API calls.
  if (window.location.protocol === "file:") {
    renderGridEmpty(
      "videos-grid",
      "Preview via Live Server (or any local web server) to load videos from the API. Opening as a file (file://) can block network requests."
    );
    renderGridEmpty(
      "shorts-grid",
      "Preview via Live Server (or any local web server) to load shorts from the API. Opening as a file (file://) can block network requests."
    );
    return;
  }

  let hasLoadedOnce = false;

  async function refreshYouTube() {
    try {
      const payload = await fetchYouTubeData();
      updateSubscriberCount(payload);
      const { videos, shorts } = updateFeaturedGrids(payload);
      updateVideoSchema(videos, shorts);
      hasLoadedOnce = true;
    } catch {
      if (!hasLoadedOnce) {
        const heroMount = document.getElementById("subscribers-count");
        if (heroMount) {
          const current = heroMount.textContent.trim();
          if (current === "—" || current === "Loading") heroMount.textContent = "Unavailable";
        }
        renderGridEmpty("videos-grid", "Could not load videos right now.");
        renderGridEmpty("shorts-grid", "Could not load shorts right now.");
      }
    }
  }

  await refreshYouTube();

  // Lightweight polling for fresh numbers.
  window.setInterval(() => {
    if (document.visibilityState === "visible") refreshYouTube();
  }, 600000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshYouTube();
  });
}

document.addEventListener("DOMContentLoaded", init);
