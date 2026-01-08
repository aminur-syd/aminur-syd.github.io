# thewolfrider.me

Static website for GitHub Pages.

## Customize (2 minutes)

1) Update your links and videos in [script.js](script.js):
- `state.youtubeUrl`
- `state.facebookUrl`
- `state.videos[]` (replace `id` with your real YouTube video IDs)

2) Update your contact email in [index.html](index.html) (search for `mailto:`).

## Auto-show latest YouTube upload (recommended)

This repo includes a GitHub Action that periodically fetches your channel’s newest upload and writes it to [data/latest.json](data/latest.json). The homepage reads that file and shows it as the featured video.

To enable it:
- Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Variables**
- Add ONE of these variables:
	- `CHANNEL_URL` (example: `https://www.youtube.com/@thewolfriderbd`)
	- OR `CHANNEL_ID` (example: `UCxxxxxxxxxxxxxxxxxxxxxx`)
- Then run the workflow: **Actions** → **Update latest YouTube video** → **Run workflow**

This also updates the homepage “Featured videos” grid via [data/videos.json](data/videos.json) (default: 6 latest uploads).

## Preview locally

Option A (VS Code): install the **Live Server** extension and open `index.html`.

Option B (PowerShell):
- `python -m http.server 5500`
- Open `http://localhost:5500`