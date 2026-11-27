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
- `assets/js/data.js` the 42 portfolio projects (titles, text, image list). Images live in `assets/work/`
  (`name.webp` full size, `name-s.webp` thumbnail), curated from the shared Drive folder.
- `assets/js/main.js` interactions (hero slideshow, stacked showcase, typographic index, photo albums, project pages)

Design pages use the light theme; Foto pages and photo projects use the dark theme (`theme: dark` in the page header comment).

## Fonts (public repo)
Licensed fonts (Acumin Pro, Romance Eighties) are git-ignored; the site falls back to free Archivo and Playfair Display.
Place the licensed files in `assets/fonts/` to use the real fonts.
Both fonts need a web licence before launch.
