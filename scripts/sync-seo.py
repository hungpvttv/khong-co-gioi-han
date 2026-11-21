#!/usr/bin/env python3
"""Generate crawler-readable SEO/social metadata from Pages CMS data/site.json."""
import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
site = json.loads((ROOT / "data/site.json").read_text(encoding="utf-8"))
base = (site.get("site_url") or "").strip()
if not base.startswith(("https://", "http://")):
    raise SystemExit("site_url in data/site.json must be an absolute http(s) URL")
base = base.rstrip("/") + "/"

def absolute(path):
    path = (path or "").strip()
    if not path:
        return ""
    if path.startswith(("https://", "http://")):
        return path
    return urljoin(base, path.lstrip("/"))

def plain_text(value):
    value = re.sub(r"<[^>]+>", " ", value or "")
    return html.unescape(re.sub(r"\s+", " ", value)).strip()

def build_block(page, rel):
    is_home = rel == "index.html"
    title_match = re.search(r"<title[^>]*>(.*?)</title>", page, flags=re.I | re.S)
    page_title = plain_text(title_match.group(1)) if title_match else (site.get("name") or "")
    title = (site.get("seo_title") or page_title) if is_home else page_title
    description = site.get("seo_description") if is_home else ""
    if not description:
        lead = re.search(r'<p[^>]*class=[^>]*article-lead[^>]*>(.*?)</p>', page, flags=re.I | re.S)
        description = plain_text(lead.group(1)) if lead else (site.get("description") or "")
    image = absolute(site.get("social_image") or "/assets/images/hero-banner-1.webp")
    image_alt = site.get("social_image_alt") or site.get("name") or ""
    canonical = urljoin(base, rel.replace("index.html", ""))
    favicon = absolute(site.get("favicon") or site.get("logo") or "/assets/images/logo.svg")
    esc = lambda value: html.escape(str(value or ""), quote=True)
    tags = [
        '<!-- SEO-SOCIAL:START -->',
        f'<meta name="description" content="{esc(description)}">',
        f'<link rel="canonical" href="{esc(canonical)}">',
        f'<link rel="icon" href="{esc(favicon)}">',
        '<meta property="og:locale" content="vi_VN">',
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{esc(site.get("name"))}">',
        f'<meta property="og:title" content="{esc(title)}">',
        f'<meta property="og:description" content="{esc(description)}">',
        f'<meta property="og:url" content="{esc(canonical)}">',
        f'<meta property="og:image" content="{esc(image)}">',
        f'<meta property="og:image:alt" content="{esc(image_alt)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{esc(title)}">',
        f'<meta name="twitter:description" content="{esc(description)}">',
        f'<meta name="twitter:image" content="{esc(image)}">',
        '<!-- SEO-SOCIAL:END -->'
    ]
    return "\n".join(tags)

for file in sorted(ROOT.rglob("index.html")):
    if any(part.startswith(".") for part in file.relative_to(ROOT).parts):
        continue
    rel = file.relative_to(ROOT).as_posix()
    page = file.read_text(encoding="utf-8")
    title_match = re.search(r"<title[^>]*>.*?</title>", page, flags=re.I | re.S)
    title = site.get("seo_title") if rel == "index.html" else (plain_text(title_match.group(0)[7:-8]) if title_match else site.get("name"))
    if title_match:
        page = page[:title_match.start()] + f"<title>{html.escape(title)}</title>" + page[title_match.end():]
    else:
        page = re.sub(r"</head>", f"<title>{html.escape(title)}</title>\n</head>", page, count=1, flags=re.I)
    block = build_block(page, rel)
    marker = re.compile(r"\s*<!-- SEO-SOCIAL:START -->.*?<!-- SEO-SOCIAL:END -->\s*", re.I | re.S)
    if marker.search(page):
        page = marker.sub("\n" + block + "\n", page)
    else:
        page = re.sub(r"</head>", "\n" + block + "\n</head>", page, count=1, flags=re.I)
    file.write_text(page, encoding="utf-8")

pages = []
for file in sorted(ROOT.rglob("index.html")):
    rel = file.relative_to(ROOT).as_posix()
    pages.append(urljoin(base, rel.replace("index.html", "")))
sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in pages:
    sitemap.append(f"  <url><loc>{html.escape(url)}</loc></url>")
sitemap.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {urljoin(base, 'sitemap.xml')}\n", encoding="utf-8")
print(f"Generated SEO metadata for {len(pages)} pages.")
