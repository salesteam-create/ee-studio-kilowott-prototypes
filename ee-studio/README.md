# EE Studio website prototype

Static, multi-page prototype for Elisabet Edvardsen's studio (design + photography).
Plain HTML/CSS/JS, GSAP + ScrollTrigger and Lenis (vendored in `assets/vendor`).

## Run
```
python3 build.py              # assembles src/pages/* with shared header/footer into the root
python3 -m http.server 8765   # then open http://localhost:8765
```

## Structure
- `src/pages/*.html` page bodies (edit these, then run `build.py`)
- `src/partials/` shared header and footer
- `assets/css/main.css` design system: palette tokens, two "worlds" (design / foto), components
- `assets/js/data.js` portfolio projects (add real images and copy here)
- `assets/js/main.js` interactions (hero teasers, drop section, horizontal rail, filters, transitions)

## Not in git (public repo)
Licensed fonts (Acumin Pro, Romance Eighties) and client photos are git-ignored.
Get them from the shared Drive folder and place them in `assets/fonts/` and `assets/img/`.
Both fonts need a web licence before launch.
