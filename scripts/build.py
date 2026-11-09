#!/usr/bin/env python3
"""Generate the Science Encyclopedia from data/*.json. Standard library only.

    python3 scripts/build.py           write every page
    python3 scripts/build.py --check   exit 1 if a generated file is stale

Every number printed on a page (element counts, class counts, topic counts) is computed here from the data, so the
periodic-table drawing and the text beside it cannot disagree. Facts live in data/; wording of the marks lives in
data/topics.json.
"""
import html
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
e = lambda s: html.escape(str(s), quote=True)
EL = json.loads((ROOT / "data" / "elements.json").read_text(encoding="utf-8"))
TP = json.loads((ROOT / "data" / "topics.json").read_text(encoding="utf-8"))
CN = json.loads((ROOT / "data" / "constants.json").read_text(encoding="utf-8"))
elements, topics, fields, marks = EL["elements"], TP["topics"], {f["id"]: f for f in TP["fields"]}, {m["id"]: m for m in TP["marks"]}
by_slug = {t["slug"]: t for t in topics}
REPO = "https://github.com/SolutionsAsService/ScienceEncyclopedia"
NCLASS = Counter(x["class"] for x in elements)
NCAT = Counter(x["category"] for x in elements)
NNOSTABLE = sum(1 for x in elements if x["stable"] == "none")
CLASS_NAME = {"metal": "Metals", "metalloid": "Metalloids", "nonmetal": "Nonmetals"}
NAV = [("topics.html", "Topics"), ("elements.html", "Elements"), ("balance.html", "Balance"), ("constants.html", "Constants"), ("about.html", "About")]

for t in topics:  # every related link must resolve; a broken one stops the build
    for r in t["related"]:
        assert r in by_slug, f"{t['slug']} relates to unknown topic {r}"
    assert t["field"] in fields


def mark(mid, short=False):
    m = marks[mid]
    return f'<span class="mk mk-{mid}"><i aria-hidden="true"></i>{e(m["name"])}</span>'


def head(title, desc, page, pre=""):
    nav = "".join(f'<a href="{pre}{h}"' + (' aria-current="page"' if h == page else "") + f">{t}</a>" for h, t in NAV)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="website">
<link rel="icon" href="{pre}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="{pre}styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to the content</a>
<header class="mast">
  <a class="brand" href="{pre}index.html"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><rect x="2" y="2" width="9" height="9" rx="1.5"/><rect x="13" y="2" width="9" height="9" rx="1.5" class="o"/><rect x="2" y="13" width="9" height="9" rx="1.5" class="o"/><rect x="13" y="13" width="9" height="9" rx="1.5"/></svg>Science Encyclopedia</a>
  <nav aria-label="Pages">{nav}</nav>
</header>
<main id="main">
'''


def foot(pre="", scripts=()):
    s = "".join(f'<script src="{pre}js/{x}"></script>' for x in scripts)
    return f'''</main>
<footer class="foot">
  <nav class="footnav" aria-label="Pages"><a href="{pre}index.html">Home</a>{"".join(f'<a href="{pre}{h}">{t}</a>' for h, t in NAV)}</nav>
  <p><strong>A small, readable reference, not a peer-reviewed one.</strong> Written from general knowledge and not yet checked line by line against primary sources. For work that matters, use IUPAC, CODATA and NIST. Found a mistake? <a href="{pre}about.html#corrections">Tell us</a>.</p>
  <p class="small">Code and text are MIT-licensed. Nothing on this site loads from another domain.</p>
</footer>
{s}
</body>
</html>
'''


def tbl_sil():
    """The periodic table as a drawing: one square per element, pattern by class, dashed edge for superheavy."""
    cs, g = 30, 4
    W = 18 * (cs + g) + 2
    rows = 9
    H = rows * (cs + g) + 12
    out = [f'<svg class="sil" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="hb"/><line x1="0" y1="0" x2="0" y2="6" class="hl" stroke-width="3"/></pattern></defs>']
    for x in elements:
        px = 1 + (x["col"] - 1) * (cs + g)
        py = 1 + (x["row"] - 1) * (cs + g) + (12 if x["row"] > 7 else 0)
        sup = " sup" if x["category"] == "superheavy" else ""
        out.append(f'<rect x="{px}" y="{py}" width="{cs}" height="{cs}" rx="3" class="c c-{x["class"]}{sup}"/>')
    out.append("</svg>")
    return "".join(out)


def index():
    nm, nl, nn = NCLASS["metal"], NCLASS["metalloid"], NCLASS["nonmetal"]
    sup = NCAT["superheavy"]
    def col(f):
        items = "".join(f'<li><a href="topics/{t["slug"]}.html">{e(t["title"])}</a></li>' for t in topics if t["field"] == f["id"])
        return f'<div><h3>{e(f["name"])}</h3><ul class="links">{items}</ul></div>'
    topic_cols = "".join(col(f) for f in TP["fields"])
    demo = [("Speed of light in a vacuum", "299 792 458 m/s", "exact"), ("Gravitational constant, G", "6.674 30(15) × 10⁻¹¹ m³ kg⁻¹ s⁻²", "measured"), ("GPS clock offset from relativity", "about 38 µs per day", "rounded")]
    demo_html = "".join(f'<li class="num n-{m}"><span class="lab">{e(l)}</span><span class="val">{e(v)}</span>{mark(m)}</li>' for l, v, m in demo)
    return head("Science Encyclopedia: every number says how well it is known", "A small encyclopedia of physics, chemistry, biology and Earth science where every number is marked exact, measured or rounded, with a full periodic table and a working equation balancer.", "index.html") + f'''
<section class="hero" aria-labelledby="h1">
  <div class="hero-copy">
    <p class="kicker">Physics · Chemistry · Biology · Earth</p>
    <h1 id="h1">Science Encyclopedia</h1>
    <p class="lede">A small reference where every number tells you how well it is known: exact by definition, measured, or rounded.</p>
    <p class="cta"><a class="btn" href="elements.html">Open the periodic table</a><a class="btn ghost" href="balance.html">Balance an equation</a></p>
  </div>
  <figure class="silwrap">
    {tbl_sil()}
    <figcaption>One square per element, {len(elements)} in all, placed by period (row) and group (column). Solid: {nm} metals. Hatched: {nl} metalloids. Outlined: {nn} nonmetals. Dashed edge: the {sup} superheavy elements, whose chemistry is mostly predicted, not measured. <a class="more" href="elements.html">Explore the table</a></figcaption>
  </figure>
</section>

<section class="band" aria-labelledby="h-marks">
  <h2 id="h-marks" class="sech">How sure is that number?</h2>
  <p class="lede2">Textbooks print 299,792,458 and 6.674 with the same confidence, although one is a definition and the other is a measurement. Here every number carries a mark.</p>
  <ul class="nums">{demo_html}</ul>
  <p><a class="more" href="about.html#marks">What the three marks mean</a></p>
</section>

<section aria-labelledby="h-tools">
  <h2 id="h-tools" class="sech">Start with a tool</h2>
  <ul class="cards">
    <li class="card"><h3><a href="elements.html">The periodic table</a></h3><p>All {len(elements)} elements, filterable, with period, group and which have no stable isotope ({NNOSTABLE} of them).</p></li>
    <li class="card"><h3><a href="balance.html">Equation balancer</a></h3><p>Type an unbalanced reaction and get the smallest whole-number coefficients, solved exactly.</p></li>
    <li class="card"><h3><a href="constants.html">Constants</a></h3><p>The defining constants of the SI and a few measured ones, each marked.</p></li>
  </ul>
</section>

<section aria-labelledby="h-topics">
  <h2 id="h-topics" class="sech">{len(topics)} topics in four fields</h2>
  <div class="cols">{topic_cols}</div>
  <p><a class="more" href="topics.html">See all topics</a></p>
</section>
''' + foot()


def topics_page():
    chips = '<button type="button" class="chip on" data-field="">All</button>' + "".join(
        f'<button type="button" class="chip" data-field="{f["id"]}">{e(f["name"])} ({sum(1 for t in topics if t["field"] == f["id"])})</button>' for f in TP["fields"])
    groups = "".join(
        f'<section class="fgroup" data-field="{f["id"]}" aria-labelledby="f-{f["id"]}"><h2 id="f-{f["id"]}" class="sech">{e(f["name"])}</h2><ul class="tlist">'
        + "".join(f'<li><a href="topics/{t["slug"]}.html"><span class="tt">{e(t["title"])}</span><span class="ts">{e(t["summary"])}</span></a></li>' for t in topics if t["field"] == f["id"])
        + "</ul></section>" for f in TP["fields"])
    return head("Topics: Science Encyclopedia", f"{len(topics)} short entries in physics, chemistry, biology and Earth science.", "topics.html") + f'''
<section class="page-head"><p class="kicker">Topics</p><h1>{len(topics)} short entries</h1>
<p class="lede">Each entry is a page you can read in a few minutes, with its numbers marked.</p>
<div class="chips" id="field-chips" role="group" aria-label="Filter by field" hidden>{chips}</div></section>
{groups}
''' + foot("", ("script.js",))


def topic_page(t):
    f = fields[t["field"]]
    body = "".join(f"<p>{e(p)}</p>" for p in t["body"])
    nums = ""
    if t["numbers"]:
        nums = '<section aria-labelledby="h-n"><h2 id="h-n" class="sech">Numbers on this page</h2><ul class="nums">' + "".join(
            f'<li class="num n-{n["mark"]}"><span class="lab">{e(n["label"])}</span><span class="val">{e(n["value"])}</span>{mark(n["mark"])}' + (f'<span class="nn">{e(n["note"])}</span>' if n.get("note") else "") + "</li>" for n in t["numbers"]) + '</ul><p><a class="more" href="../about.html#marks">What the marks mean</a></p></section>'
    tool = f'<p><a class="btn" href="../{t["tool"]}">Try the balancer</a></p>' if t.get("tool") else ""
    rel = "".join(f'<li class="card"><p class="tag">{e(fields[by_slug[r]["field"]]["name"])}</p><h3><a href="{r}.html">{e(by_slug[r]["title"])}</a></h3><p>{e(by_slug[r]["summary"])}</p></li>' for r in t["related"])
    return head(f'{t["title"]}: Science Encyclopedia', t["summary"], "topics.html", "../") + f'''
<article>
<nav class="crumbs" aria-label="Breadcrumb"><a href="../topics.html">Topics</a> <span aria-hidden="true">/</span> <span>{e(f["name"])}</span></nav>
<header class="page-head"><p class="kicker">{e(f["name"])}</p><h1>{e(t["title"])}</h1><p class="lede">{e(t["summary"])}</p></header>
<section class="prose">{body}{tool}</section>
{nums}
<section aria-labelledby="h-r"><h2 id="h-r" class="sech">Related</h2><ul class="cards">{rel}</ul></section>
</article>
''' + foot("../")


def elements_page():
    cells, rows = [], []
    for x in elements:
        sup = " sup" if x["category"] == "superheavy" else ""
        cells.append(
            f'<li class="cell-li" style="grid-row:{x["row"] + (1 if x["row"] > 7 else 0)};grid-column:{x["col"]}"><a class="cell c-{x["class"]}{sup} cat-{x["category"].replace(" ", "-")}" href="#e-{x["symbol"]}" data-z="{x["z"]}" aria-label="{e(x["name"])}, element {x["z"]}"><span class="z">{x["z"]}</span><span class="s">{x["symbol"]}</span></a></li>')
        stable = {"stable": "Yes", "none": "None", "bismuth": "Effectively (half-life far longer than the age of the universe)"}[x["stable"]]
        grp = x["group"] if x["group"] else "f-block row"
        alt = f" <span class=\"muted\">(also {e(x['alt'])})</span>" if x.get("alt") else ""
        rows.append(f'<tr id="e-{x["symbol"]}" data-z="{x["z"]}" data-class="{x["class"]}" data-stable="{x["stable"]}"><td class="mono">{x["z"]}</td><th scope="row"><span class="sym">{x["symbol"]}</span> {e(x["name"])}{alt}</th><td>{e(x["category"])}</td><td class="mono">{x["period"]}</td><td class="mono">{grp}</td><td>{stable}</td></tr>')
    # direct labels in the two gap rows
    gap = '<li class="cell-li gap" style="grid-row:6;grid-column:3" aria-hidden="true"><span>57–71</span></li><li class="cell-li gap" style="grid-row:7;grid-column:3" aria-hidden="true"><span>89–103</span></li>'
    chips = ('<button type="button" class="chip on" data-class="">All ' + str(len(elements)) + '</button>'
             + "".join(f'<button type="button" class="chip" data-class="{k}"><svg class="gl gl-{k}" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="{'6' if k == 'nonmetal' else '2'}"/>{'<path d="M3 13 13 3M3 8 8 3M8 13 13 8" stroke="currentColor" stroke-width="1.5"/>' if k == 'metalloid' else ''}</svg>{CLASS_NAME[k]} {NCLASS[k]}</button>' for k in ("metal", "metalloid", "nonmetal")))
    return head("The periodic table: Science Encyclopedia", f"All {len(elements)} elements by period and group, filterable by metals, metalloids and nonmetals.", "elements.html") + f'''
<section class="page-head"><p class="kicker">Elements</p><h1>The periodic table, {len(elements)} elements</h1>
<p class="lede">Select an element for its details. Solid squares are metals, hatched are metalloids, outlined are nonmetals; a dashed edge marks the {NCAT["superheavy"]} superheavy elements, whose chemistry is mostly predicted.</p></section>
<section aria-labelledby="h-grid" class="ptsec">
  <h2 id="h-grid" class="sr">The table</h2>
  <div class="tools" id="pt-tools" hidden>
    <div class="chips" id="class-chips" role="group" aria-label="Filter by kind">{chips}</div>
    <button type="button" class="chip" id="nostable" aria-pressed="false">No stable isotope ({NNOSTABLE})</button>
    <label class="f"><span class="label">Find</span><input id="q" type="search" placeholder="name or symbol" autocomplete="off"></label>
  </div>
  <p class="count" id="count" role="status" aria-live="polite"></p>
  <div class="detail" id="detail" aria-live="polite" hidden></div>
  <p class="small swipe">Swipe the table sideways to see all 18 groups.</p>
  <div class="ptscroll" tabindex="0" role="region" aria-label="Periodic table; scrolls sideways on a small screen"><ol class="pt">{gap}{"".join(cells)}</ol></div>
  <p class="small">{e(EL["note"])}</p>
</section>
<section aria-labelledby="h-list"><h2 id="h-list" class="sech">All {len(elements)} in a list</h2>
<div class="tablewrap"><table class="etable"><thead><tr><th scope="col">No.</th><th scope="col">Element</th><th scope="col">Category</th><th scope="col">Period</th><th scope="col">Group</th><th scope="col">Stable isotope</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div>
<p class="small">“None” means no stable isotope is known: all {NNOSTABLE} are radioactive. Technetium and promethium are the two lighter elements in that group.</p></section>
''' + foot("", ("script.js",))


def balance_page():
    known = json.dumps({x["symbol"]: 1 for x in elements}, separators=(",", ":"))
    ex = ["H2 + O2 -> H2O", "Fe + O2 -> Fe2O3", "C6H12O6 + O2 -> CO2 + H2O", "Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O", "KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O"]
    exb = "".join(f'<button type="button" class="chip ex" data-eq="{e(x)}">{e(x)}</button>' for x in ex)
    return head("Chemical equation balancer: Science Encyclopedia", "Type an unbalanced chemical equation and get the smallest whole-number coefficients, solved exactly in your browser.", "balance.html") + f'''
<section class="page-head"><p class="kicker">Tool</p><h1>Balance a chemical equation</h1>
<p class="lede">Atoms are conserved, so each element must appear equally on both sides. Type the substances with an arrow between the sides.</p></section>
<section aria-labelledby="h-form">
  <h2 id="h-form" class="sr">Balancer</h2>
  <form id="balance-form" class="bform" autocomplete="off">
    <label class="f" for="eq"><span class="label">Unbalanced equation</span></label>
    <div class="row"><input id="eq" name="eq" type="text" inputmode="text" spellcheck="false" autocapitalize="off" placeholder="H2 + O2 -> H2O" required><button class="btn" type="submit">Balance</button></div>
  </form>
  <p class="small">Try an example:</p>
  <div class="chips">{exb}</div>
  <div id="result" class="result" role="status" aria-live="polite"></div>
  <noscript><p class="note">This tool needs JavaScript, which runs it entirely in your browser. For why it works, see <a href="topics/balancing-equations.html">Balancing chemical equations</a>.</p></noscript>
  <script type="application/json" id="known-elements">{known}</script>
</section>
<section class="two" aria-labelledby="h-how">
  <div><h2 id="h-how" class="sech">How it works</h2>
  <p>Each element gives one linear equation: atoms on the left minus atoms on the right equals zero. The coefficients are the solution of that system, found with exact fractions (no rounding), scaled to the smallest whole numbers.</p>
  <p>If the system has no solution, or more than one independent solution, it says so instead of guessing.</p></div>
  <div><h2 class="sech">What it accepts</h2>
  <ul class="plain"><li>Formulas such as <code>Ca(OH)2</code>, <code>Fe2(SO4)3</code>, <code>K4[Fe(CN)6]</code> and hydrates like <code>CuSO4·5H2O</code>.</li><li>Arrows <code>-&gt;</code>, <code>=</code> or <code>→</code>.</li><li>Not yet: ions and charges, state symbols such as (aq), and isotopes.</li><li>Capital letters matter: <code>Co</code> is cobalt, <code>CO</code> is carbon monoxide.</li></ul></div>
</section>
''' + foot("", ("balance-core.js", "script.js"))


def constants_page():
    rows = "".join(
        f'<tr class="n-{c["mark"]}"><th scope="row">{e(c["name"])}<span class="sym2">{e(c["symbol"])}</span></th><td class="val">{e(c["value"])} <span class="unit">{e(c["unit"])}</span></td><td>{mark(c["mark"])}</td><td class="muted">{e(c["note"])}</td></tr>' for c in CN["constants"])
    legend = "".join(f'<li>{mark(m["id"])}<span>{e(m["blurb"])}</span></li>' for m in TP["marks"])
    return head("Constants: Science Encyclopedia", "The defining constants of the SI and a few measured constants, each marked exact, measured or rounded.", "constants.html") + f'''
<section class="page-head"><p class="kicker">Reference</p><h1>Constants, and how well each is known</h1>
<p class="lede">{e(CN["note"])}</p></section>
<section aria-labelledby="h-leg"><h2 id="h-leg" class="sech">The three marks</h2><ul class="legend">{legend}</ul></section>
<section aria-labelledby="h-c"><h2 id="h-c" class="sech">{len(CN["constants"])} constants</h2>
<div class="tablewrap"><table class="ctable"><thead><tr><th scope="col">Constant</th><th scope="col">Value</th><th scope="col">Mark</th><th scope="col">Note</th></tr></thead><tbody>{rows}</tbody></table></div></section>
''' + foot()


def about_page():
    legend = "".join(f'<li>{mark(m["id"])}<span>{e(m["blurb"])}</span></li>' for m in TP["marks"])
    return head("About and method: Science Encyclopedia", "How the Science Encyclopedia marks its numbers, where its facts come from, and how to report a mistake.", "about.html") + f'''
<section class="page-head"><p class="kicker">About</p><h1>How this works, and how far to trust it</h1>
<p class="lede">A small reference built to be read, with its confidence shown. It is not a substitute for a textbook or a standards body.</p></section>
<section id="marks" aria-labelledby="h-m"><h2 id="h-m" class="sech">The marks on numbers</h2><ul class="legend">{legend}</ul>
<p>Each mark is a rule style plus a word, never colour alone. Solid means exact, dashed measured, dotted rounded.</p></section>
<section aria-labelledby="h-s"><h2 id="h-s" class="sech">Where the facts come from</h2>
<ul class="plain">
<li>Every fact lives in a data file (<code>data/elements.json</code>, <code>topics.json</code>, <code>constants.json</code>) and the pages are generated from them, so a count printed in a sentence always matches the table or drawing beside it.</li>
<li>The text and values were written from general knowledge and have <strong>not yet been checked line by line</strong> against IUPAC, CODATA, NIST or textbooks. The exact SI constants and the element names and numbers are the most reliable parts; the topic prose is a short summary.</li>
<li>The periodic table uses one common layout and one common set of categories. Sources differ on, for example, where to put lanthanum and lutetium and which elements count as metalloids; the table page says which convention it follows.</li>
<li>The equation balancer is checked against known answers, including awkward ones such as the permanganate and hexacyanoferrate reactions.</li>
</ul></section>
<section id="corrections" aria-labelledby="h-c"><h2 id="h-c" class="sech">Report a mistake</h2>
<p>The most useful report names the page, quotes the sentence or value, and cites a source (a standards body, a textbook edition and page, or a paper).</p>
<p><a class="btn" href="{REPO}/issues/new">Open an issue on GitHub</a></p>
<p class="small">The previous version of this site, a one-page shell, is kept on the <code>legacy/pre-redesign</code> branch of the repository.</p></section>
''' + foot()


FAV = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0d1613"/><rect x="5" y="5" width="10" height="10" rx="2" fill="#4fd1b8"/><rect x="17" y="5" width="10" height="10" rx="2" fill="none" stroke="#4fd1b8" stroke-width="2"/><rect x="5" y="17" width="10" height="10" rx="2" fill="none" stroke="#4fd1b8" stroke-width="2"/><rect x="17" y="17" width="10" height="10" rx="2" fill="#4fd1b8"/></svg>'

OUT = {"index.html": index(), "topics.html": topics_page(), "elements.html": elements_page(), "balance.html": balance_page(),
       "constants.html": constants_page(), "about.html": about_page(), "favicon.svg": FAV}
for t in topics:
    OUT[f"topics/{t['slug']}.html"] = topic_page(t)


def main():
    check = "--check" in sys.argv
    stale = []
    for name, text in OUT.items():
        p = ROOT / name
        p.parent.mkdir(parents=True, exist_ok=True)
        if not p.exists() or p.read_text(encoding="utf-8") != text:
            stale.append(name)
            if not check:
                p.write_text(text, encoding="utf-8")
    if check and stale:
        print("stale:", ", ".join(stale))
        sys.exit(1)
    print("ok" if check else f"written {len(OUT)} files; {len(elements)} elements, {len(topics)} topics, {len(CN['constants'])} constants")


main()
