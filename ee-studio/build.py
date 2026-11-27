#!/usr/bin/env python3
"""Assemble the static pages in Norwegian (root) and English (/en/).

Source files in src/pages/ start with a front-matter comment, fields separated by " | ":
    <!-- key: arbeid | title: Arbeid~Work | theme: dark | desc: Norsk~English -->
(title and desc use "~" between Norwegian and English.)
Anywhere in pages and partials, write bilingual text as [[Norsk tekst||English text]].
The script wraps each page in the shared head, header and footer and writes
index.html, design.html, ... (NO) and en/index.html, en/design.html, ... (EN).
CSS/JS links get a content hash (?v=...) so a deploy never serves stale assets.
Run:  python3 build.py
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
header = (SRC / "partials/header.html").read_text(encoding="utf-8")
footer = (SRC / "partials/footer.html").read_text(encoding="utf-8")

BI = re.compile(r"\[\[(.*?)\|\|(.*?)\]\]", re.S)
PARENT = {"prosjekt": "arbeid.html"}  # where "Back" goes when there is no history

HEAD = """<!doctype html>
<html lang="{lang}" data-base="{base}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="{color}">
<link rel="alternate" hreflang="nb" href="{href_no}">
<link rel="alternate" hreflang="en" href="{href_en}">
<link rel="icon" href="assets/img/eemark.png" type="image/png">
<link rel="preload" href="assets/fonts/anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body data-page="{key}" data-theme="{theme}" class="is-loading">
"""


def stamp(html):
    def rep(m):
        f = ROOT / m.group(3)
        v = hashlib.md5(f.read_bytes()).hexdigest()[:8] if f.exists() else "0"
        return f'{m.group(1)}"{m.group(2)}{m.group(3)}?v={v}"'
    return re.sub(r'((?:href|src)=)"((?:\.\./)?)(assets/(?:css|js|vendor)/[^"?]+)"', rep, html)


(ROOT / "en").mkdir(exist_ok=True)
for page in sorted((SRC / "pages").glob("*.html")):
    raw = page.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(.*?)-->", raw, re.S)
    meta = {}
    for part in m.group(1).split(" | "):
        if ":" in part:
            k, v = part.split(":", 1)
            meta[k.strip()] = v.strip()
    body = raw[m.end():].strip()
    theme = meta.get("theme", "light")
    for i, lang in enumerate(("nb", "en")):
        en = i == 1

        def tx(v):
            parts = v.split("~")
            return parts[i] if len(parts) > 1 else parts[0]

        title = tx(meta.get("title", "EE Studio"))
        title = "EE Studio" if title == "EE Studio" else f"{title} | EE Studio"
        hdr = header.replace(f'data-nav="{meta["key"]}"', f'data-nav="{meta["key"]}" aria-current="page"')
        hdr = hdr.replace("{{lang_href}}", ("../" if en else "en/") + page.name)
        hdr = hdr.replace("{{back_href}}", PARENT.get(meta["key"], "index.html"))
        html = (
            HEAD.format(lang=lang, base="../" if en else "", title=title, desc=tx(meta.get("desc", "")),
                        key=meta["key"], theme=theme, color="#171112" if theme == "dark" else "#FAF8F5",
                        href_no=("../" if en else "") + page.name, href_en=("" if en else "en/") + page.name)
            + hdr + '\n<main id="main">\n' + body + "\n</main>\n\n" + footer + "</body>\n</html>\n"
        )
        html = BI.sub(lambda mm: mm.group(1 + i), html)
        if en:
            html = re.sub(r'((?:src|href)=")assets/', r"\1../assets/", html)
        html = stamp(html)
        (ROOT / "en" / page.name if en else ROOT / page.name).write_text(html, encoding="utf-8")
    print("built", page.name, "(nb + en)")
