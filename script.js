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
    "Bangladesh motovlogger, Yamaha V4 BS7 vlogs, motorcycle travel Bangladesh, Dhaka motovlog, couple bike travel vlog Bangladesh"
};

const VIDEO_FALLBACK_DESC = "Bangladesh motovlog from Dhaka on a Yamaha V4 BS7 with couple travel highlights.";

// API (exact base provided)
const API_BASE = "https://api.thewolfrider.me";

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
  if (meta) meta.setAttribute("content", theme === "light" ? "#ffffff" : "#0b1220");

  const btn = document.querySelector(".theme-switch");
  const icon = document.querySelector(".theme-switch-icon");
  if (btn) {
    const isLight = theme === "light";
    btn.setAttribute("aria-checked", String(isLight));
    btn.setAttribute("aria-label", isLight ? "Light mode (switch to dark)" : "Dark mode (switch to light)");
  }
  if (icon) icon.textContent = theme === "light" ? "SUN" : "MOON";
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

function renderVideoGrid(mountId, videos, options = {}) {
  const grid = document.getElementById(mountId);
  if (!grid) return;

  const urlFor = options.kind === "shorts" ? youtubeShortUrl : youtubeWatchUrl;
  const label = options.kind === "shorts" ? "Watch short" : "Watch video";

  grid.innerHTML = videos
    .map((v) => {
      const title = cleanText(v.title) || "The Wolf Rider";
      const descSource = cleanText(v.desc);
      const desc = descSource ? truncateText(descSource, 160) : VIDEO_FALLBACK_DESC;
      const watch = safeText(v.url) || urlFor(v.id);
      const thumb = safeText(v.thumbnail) || youtubeThumb(v.id);
      const publishedText = formatPublished(v.published);
      const publishedAttr = formatPublishedAttr(v.published);

      return `
        <article class="video-card">
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
              ${publishedText ? `<time datetime="${publishedAttr}">${publishedText}</time> | ` : ""}${BRAND.location} | Yamaha V4 BS7
            </p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGridEmpty(mountId, message) {
  const grid = document.getElementById(mountId);
  if (!grid) return;
  grid.innerHTML = `
    <article class="video-card video-card--empty">
      <div class="video-meta">
        <p class="video-desc">${safeText(message)}</p>
      </div>
    </article>
  `;
}

async function fetchJson(pathWithQuery) {
  const url = new URL(pathWithQuery, API_BASE);
  // `no-store` so you see updates quickly after deploy.
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function normalizeVideoItems(payload) {
  const root = payload?.data ?? payload;
  const items =
    (Array.isArray(root) && root) ||
    (Array.isArray(root?.items) && root.items) ||
    (Array.isArray(root?.videos) && root.videos) ||
    (Array.isArray(root?.results) && root.results) ||
    [];

  return items
    .map((item) => {
      const id =
        (typeof item?.id === "string" && item.id) ||
        (typeof item?.videoId === "string" && item.videoId) ||
        (typeof item?.video_id === "string" && item.video_id) ||
        (typeof item?.youtubeId === "string" && item.youtubeId) ||
        (typeof item?.snippet?.resourceId?.videoId === "string" && item.snippet.resourceId.videoId) ||
        (typeof item?.snippet?.videoId === "string" && item.snippet.videoId) ||
        "";

      const title = item?.title ?? item?.snippet?.title ?? "";
      const published = item?.published ?? item?.publishedAt ?? item?.published_at ?? item?.snippet?.publishedAt ?? "";
      const desc = item?.desc ?? item?.description ?? item?.snippet?.description ?? "";
      const url = item?.url ?? item?.watchUrl ?? item?.watch_url ?? "";
      const thumbnail = item?.thumbnail ?? item?.thumb ?? item?.thumbUrl ?? item?.thumb_url ?? "";

      return {
        id: String(id).trim(),
        title: cleanText(title),
        published: cleanText(published),
        desc: cleanText(desc),
        url: cleanText(url),
        thumbnail: cleanText(thumbnail)
      };
    })
    .filter((v) => v.id);
}

async function loadSubscribers() {
  try {
    // Exact URL provided:
    // https://api.thewolfrider.me/api/subscribers
    const payload = await fetchJson("/api/subscribers");
    const value =
      payload?.subscriberCount ??
      payload?.subscribers ??
      payload?.count ??
      payload?.data?.subscriberCount ??
      payload?.data?.subscribers ??
      payload?.data?.count;
    const num = Number(value);
    if (!Number.isFinite(num)) return;

    const formatted = num.toLocaleString();
    const heroMount = document.getElementById("subscribers-count");
    if (heroMount) heroMount.textContent = formatted;
  } catch {
    const heroMount = document.getElementById("subscribers-count");
    if (heroMount && heroMount.textContent.trim() === "--") heroMount.textContent = "Unavailable";
  }
}

async function loadLatest(type, limit) {
  // Exact URL provided:
  // https://api.thewolfrider.me/api/latest?type=videos&limit=9
  // https://api.thewolfrider.me/api/latest?type=shorts&limit=9
  const qs = new URLSearchParams({ type: String(type), limit: String(limit) });
  const payload = await fetchJson(`/api/latest?${qs.toString()}`);
  return normalizeVideoItems(payload);
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

// Repo JSON loaders removed (now using API_BASE endpoints).

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

  loadSubscribers();
  // "Real-time" refresh (lightweight polling)
  let subTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") loadSubscribers();
  }, 5000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadSubscribers();
  });

  let latestVideos = [];
  let latestShorts = [];

  try {
    latestVideos = await loadLatest("videos", 3);
    if (latestVideos.length) {
      renderVideoGrid("videos-grid", latestVideos);
    } else {
      renderGridEmpty("videos-grid", "No videos found yet.");
    }
  } catch {
    renderGridEmpty("videos-grid", "Could not load videos right now.");
  }

  try {
    latestShorts = await loadLatest("shorts", 3);
    if (latestShorts.length) {
      renderVideoGrid("shorts-grid", latestShorts, { kind: "shorts" });
    } else {
      renderGridEmpty("shorts-grid", "No shorts found yet.");
    }
  } catch {
    renderGridEmpty("shorts-grid", "Could not load shorts right now.");
  }

  updateVideoSchema(latestVideos, latestShorts);
}

document.addEventListener("DOMContentLoaded", init);
