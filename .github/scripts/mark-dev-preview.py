#!/usr/bin/env python3
"""Mark a built copy of the page as the dev preview.

The Pages workflow runs this against the /dev/ copy only, so `main` and `dev`
stay byte-identical and the preview cannot be mistaken for the live site. The
badge is a fixed pill in the bottom-left corner, well clear of the fixed
table of contents on the right, so it costs no layout.

Usage: mark-dev-preview.py <path/to/index.html>
"""

import sys
from pathlib import Path

MARKER = "dev-preview-badge"

BADGE = """\
<div id="dev-preview-badge" style="position:fixed;left:16px;bottom:16px;z-index:50;\
display:flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px;\
background:rgba(28,32,38,0.92);box-shadow:0 6px 18px rgba(0,0,0,0.24);\
color:#f4f1ea;font:600 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;\
letter-spacing:0.07em;text-transform:uppercase;">\
<span style="width:6px;height:6px;border-radius:50%;background:#e08a3c;"></span>\
Dev preview — branch <code style="font:inherit;color:#fff;">dev</code>\
<a href="/" style="color:#9ec8e8;text-decoration:none;border-bottom:1px solid currentColor;">Live page</a>\
</div>
"""


def main(argv):
    if len(argv) != 2:
        print("usage: mark-dev-preview.py <path/to/index.html>", file=sys.stderr)
        return 2

    page = Path(argv[1])
    html = page.read_text(encoding="utf-8")

    if MARKER in html:
        print("%s: already marked" % page)
        return 0

    anchor = "</body>"
    index = html.rfind(anchor)
    if index == -1:
        print("%s: no %s to insert before, refusing to guess" % (page, anchor), file=sys.stderr)
        return 1

    page.write_text(html[:index] + BADGE + html[index:], encoding="utf-8")
    print("%s: marked as dev preview" % page)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
