# thewolfrider.me

Static website for GitHub Pages.

## Customize (2 minutes)

1) Update your links in [script.js](script.js):
- `state.youtubeUrl`
- `state.facebookUrl`
- `state.instagramUrl`

2) The homepage loads YouTube data from the API configured in [script.js](script.js):
- `API_BASE` (currently `https://api.thewolfrider.me`)
- Subscribers endpoint: `/api/subscribers`
- Latest videos endpoint: `/api/latest?type=videos&limit=3`
- Latest shorts endpoint: `/api/latest?type=shorts&limit=3`

3) Update your contact email in [index.html](index.html) (search for `mailto:`).

## Preview locally

Option A (VS Code): install the **Live Server** extension and open `index.html`.

Option B (PowerShell):
- `python -m http.server 5500`
- Open `http://localhost:5500`