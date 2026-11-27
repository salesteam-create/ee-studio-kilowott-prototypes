#!/usr/bin/env python3
"""Assemble the static pages.

Each file in src/pages/ starts with a front-matter comment:
    <!-- key: arbeid | title: Arbeid | world: design | desc: ... -->
The script wraps it in the shared head, header and footer and writes
the result to the project root (index.html, design.html, ...).
Run:  python3 build.py
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
header = (SRC / "partials/header.html").read_text(encoding="utf-8")
footer = (SRC / "partials/footer.html").read_text(encoding="utf-8")

HEAD = """<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="{color}">
<link rel="icon" href="assets/img/eemark.png" type="image/png">
<link rel="preload" href="assets/fonts/anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body data-page="{key}" data-theme="{theme}" class="is-loading">
"""

for page in sorted((SRC / "pages").glob("*.html")):
    raw = page.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(.*?)-->", raw, re.S)
    meta = {}
    for part in m.group(1).split("|"):
        k, v = part.split(":", 1)
        meta[k.strip()] = v.strip()
    body = raw[m.end():]
    theme = meta.get("theme", "light")
    color = "#171112" if theme == "dark" else "#FAF8F5"
    title = meta.get("title", "EE Studio")
    title = "EE Studio" if title == "EE Studio" else f"{title} | EE Studio"
    hdr = header.replace(f'data-nav="{meta["key"]}"', f'data-nav="{meta["key"]}" aria-current="page"')
    html = (
        HEAD.format(title=title, desc=meta.get("desc", ""), key=meta["key"], theme=theme, color=color)
        + hdr
        + '\n<main id="main">\n'
        + body.strip()
        + "\n</main>\n\n"
        + footer
        + "</body>\n</html>\n"
    )
    # Cache-bust CSS/JS so a new deploy never pairs new HTML with stale assets.
    def stamp(m):
        f = ROOT / m.group(2)
        v = hashlib.md5(f.read_bytes()).hexdigest()[:8] if f.exists() else "0"
        return f'{m.group(1)}"{m.group(2)}?v={v}"'
    html = re.sub(r'((?:href|src)=)"(assets/(?:css|js|vendor)/[^"?]+)"', stamp, html)
    (ROOT / page.name).write_text(html, encoding="utf-8")
    print("built", page.name)
