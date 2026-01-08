const state = {
  // Replace these with your real links
  youtubeUrl: "https://www.youtube.com/@thewolfriderbd",
  facebookUrl: "https://www.facebook.com/thewolfriderbd",
  instagramUrl: "https://www.instagram.com/thewolfriderbd/",

  // Featured video shown in the hero card
  // - YouTube: { type: "youtube", id: "VIDEO_ID" }
  // - Facebook: { type: "facebook", url: "https://www.facebook.com/reel/884788363525165" }
  featured: {
    type: "youtube",
    id: "lsyJUAIFxqo"
  },

  // Replace these with real YouTube video IDs (the part after v= in a YouTube URL)
  // Optional manual fallback (leave empty if you only want your channel’s real videos)
  videos: []
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
  if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
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

function formatPublished(iso) {
  const value = String(iso || "").trim();
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function youtubeThumb(videoId) {
  // `hqdefault.jpg` is broadly available without needing API keys
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

function youtubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function youtubeEmbedUrl(videoId) {
  // modestbranding/autoplay are intentionally not forced; keep it clean.
  const base = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  const params = new URLSearchParams({
    rel: "0"
  });
  return `${base}?${params.toString()}`;
}

function youtubePosterUrl(videoId) {
  // Use maxres if available, fall back to hq via onerror in markup.
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/maxresdefault.jpg`;
}

function facebookEmbedUrl(videoUrl) {
  // Facebook provides an iframe-based embed via plugins.
  // The video must be public and allow embedding.
  const href = encodeURIComponent(String(videoUrl || "").trim());
  const params = new URLSearchParams({
    href,
    show_text: "false",
    width: "560"
  });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}

function renderFeaturedEmbed(featured) {
  const mount = document.getElementById("featured-embed");
  if (!mount) return;

  const type = featured?.type === "facebook" ? "facebook" : "youtube";

  if (type === "facebook") {
    const src = facebookEmbedUrl(featured?.url);
    mount.innerHTML = `
      <iframe
        src="${src}"
        title="Featured video"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;
    return;
  }

  const id = String(featured?.id || "").trim();
  if (!id) return;

  // Show a real thumbnail immediately (better UX than a blank/black iframe).
  mount.innerHTML = `
    <button class="yt-poster" type="button" aria-label="Play featured video">
      <img
        class="yt-poster-img"
        src="${youtubePosterUrl(id)}"
        alt="Featured video thumbnail"
        loading="lazy"
        onerror="this.onerror=null; this.src='https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg'"
      />
      <span class="yt-poster-play" aria-hidden="true">▶</span>
    </button>
  `;

  const btn = mount.querySelector(".yt-poster");
  btn?.addEventListener("click", () => {
    mount.innerHTML = `
      <iframe
        src="${youtubeEmbedUrl(id)}"
        title="Featured video"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;
  });
}

function renderVideoGrid(videos) {
  const grid = document.getElementById("videos-grid");
  if (!grid) return;

  grid.innerHTML = videos
    .map((v) => {
      const title = safeText(v.title) || "YouTube video";
      const desc = safeText(v.desc) || formatPublished(v.published);
      const watch = youtubeWatchUrl(v.id);
      const thumb = youtubeThumb(v.id);

      return `
        <a class="video-card" href="${watch}" target="_blank" rel="noreferrer" aria-label="Watch: ${title}">
          <div class="video-thumb">
            <img src="${thumb}" alt="${title}" loading="lazy" />
          </div>
          <div class="video-meta">
            <p class="video-title">${title}</p>
            <p class="video-desc">${desc}</p>
          </div>
        </a>
      `;
    })
    .join("");
}

function renderVideoGridEmpty() {
  const grid = document.getElementById("videos-grid");
  if (!grid) return;
  grid.innerHTML = `
    <div class="muted" style="padding: 12px;">
      Featured videos will appear after the GitHub Action updates <strong>data/videos.json</strong> for your channel.
    </div>
  `;
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

async function loadLatestFeaturedFromRepo() {
  try {
    // `no-store` so you see updates quickly after deploy.
    const url = new URL(`data/latest.json?ts=${Date.now()}`, window.location.href);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.type === "youtube" && typeof data.id === "string" && data.id.trim()) {
      return { type: "youtube", id: data.id.trim() };
    }
    return null;
  } catch {
    return null;
  }
}

async function loadFeaturedVideosFromRepo() {
  try {
    const url = new URL(`data/videos.json?ts=${Date.now()}`, window.location.href);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const videos = Array.isArray(data?.videos) ? data.videos : null;
    if (!videos || !videos.length) return null;
    return videos
      .filter((v) => v && typeof v.id === "string" && v.id.trim())
      .map((v) => ({ id: v.id.trim(), title: safeText(v.title), published: safeText(v.published), desc: safeText(v.desc) }));
  } catch {
    return null;
  }
}

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

  const latest = await loadLatestFeaturedFromRepo();
  if (latest) {
    renderFeaturedEmbed(latest);
  } else if (state.featured) {
    renderFeaturedEmbed(state.featured);
  } else if (state.videos?.length) {
    renderFeaturedEmbed({ type: "youtube", id: state.videos[0].id });
  }

  const featuredVideos = await loadFeaturedVideosFromRepo();
  if (Array.isArray(featuredVideos) && featuredVideos.length > 1) {
    // Show 2nd, 3rd, 4th videos in the grid (latest is already featured above)
    renderVideoGrid(featuredVideos.slice(1, 4));
  } else if (Array.isArray(featuredVideos) && featuredVideos.length === 1) {
    // Avoid duplicating the latest video in the grid.
    renderVideoGridEmpty();
  } else if (state.videos?.length > 1) {
    renderVideoGrid(state.videos.slice(1, 4));
  } else {
    renderVideoGridEmpty();
  }
}

document.addEventListener("DOMContentLoaded", init);
