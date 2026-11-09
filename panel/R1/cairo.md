# Cairo (Evidence), measurement seat, R1

Method: every number below was produced by a script run against the files as they stand (check_floor.py, measure.py, node+playwright, python). No site file was edited. Scratch scripts are in the session scratchpad.

## Measurements

| # | Check | Result | Verdict |
|---|---|---|---|
| 1 | Mobile Floor, 9 pages (index, topics, elements, balance, constants, about, dna, balancing-equations, light) at 360/390/430 | 12/12 hold on every page and width; PASS on all 9 | pass |
| 2 | measure.py --preset contrast at 390 and 1280, same 9 pages | n:0 failing rows on every page and width | pass |
| 3 | Contrast, own walk, light and dark, index/topics/constants/about/dna/balance (result and error states) | 0 pairs under 4.5:1. Minimum 5.37 light, 6.45 dark | pass |
| 4 | Contrast, elements, all 11 tinted categories, symbol / number, light | symbol 12.26-14.08, number 7.79-8.95 | pass |
| 5 | Contrast, elements, dark | symbol 7.80-9.97, number 5.71-7.30 (lowest: nonmetal 5.71, alkaline-earth 5.99). All 11 above 4.5 | pass |
| 6 | Selected cell (.cell.sel), settled | light 6.18, dark 9.07. (A first reading of 1.0 in dark was a mid-`transition: all` frame, not a defect) | pass |
| 7 | Dimmed cells (opacity .28, filter non-matches) | text 1.53-1.76 light, 1.73-2.13 dark; 23 pairs light, 23 dark under 4.5 | fail, by design (F5) |
| 8 | Metalloid hatch overlay, worst case | no row under 4.5 | pass |
| 9 | Printed counts vs data: 118 elements, 94/6/18, 15 superheavy, 37 no stable isotope (35 of Z 84-118 plus Tc, Pm), 23 topics, 7/7/6/3, 17 constants, "All 118", chips "Metals 94 / Metalloids 6 / Nonmetals 18 / No stable isotope (37)" | all equal data; `build.py --check` says "ok" | pass |
| 10 | Home SVG: rect.c = 118 (94 c-metal, 6 c-metalloid, 18 c-nonmetal, 15 sup). Raw `<rect>` count is 119: the 119th is the hatch-pattern tile `.hb` | classes exact. Each of 118 rects sits at its row/col with the right class and dash (0 mismatches) | pass (note the 119) |
| 11 | Balancer node run: 42 success-type inputs | 38 balanced. Independent recount from the printed string (own regex parser): atoms equal on both sides and gcd 1 for 38/38. 0 wrong answers, 0 crashes | pass |
| 12 | Balancer inputs: 10 with parentheses/brackets/braces/hydrates, 6 large (up to 3001 and 370369 O2, 10/122/299 K4[Fe(CN)6] case) | all verified as in row 11 | pass |
| 13 | Must-fail, 30 inputs | correctly refused or thrown: 25 (unbalanceable, 2 independent reactions, `Xx`, `Fe+3`, `Fe^3+`, empty sides, no arrow, 2 arrows, three bracket mismatches, `co`, `(l)`/`(aq)`, `2 + 3`). Wrongly ACCEPTED: 4 (F6) | partial |
| 14 | Leading coefficients typed by user: `2H2 + O2 -> 2H2O`, `3 H2 + N2 -> 2 NH3` | silently stripped; the solver's own coefficients are shown | see F7 |
| 15 | Balancer in the browser, 5 equations + chip + Enter | correct, check table rows match; error text rendered as text (`<b>x</b>` escaped); `role=status` live region | pass |
| 16 | Elements filters: Metals 94/94, Metalloids 6/6, Nonmetals 18/18 (lit sets equal data sets), No-stable 37/37, No-stable+Metal 35/35, count line text matches | | pass |
| 17 | Search: iron 1, `ium` 79, `zzz` 0, `  gold ` 1, `Au` 1. `o` lights 56 against 53 by name alone: Al, S, Cs match on the "(also …)" alternate spellings | | pass, see F9 |
| 18 | Detail card, 6 elements (H, Au, Og, Bi, Tc, Lu): name, category, period, group, stable text all equal data. Lu shows group "f-block row" (data group null) | | pass |
| 19 | Deep link fresh load: `#e-Au`, `#e-Lu`, `#e-Og` show the card and select the cell; `#e-Xx` / `#e-og` / `#E-Au` show nothing | | pass, see F8 |
| 20 | In-page hash change (`location.hash='#e-Fe'` after load) | card stays on Au (no hashchange handler) | fail, minor (F8) |
| 21 | Topics chips: All 23 links; physics 7, chemistry 7, biology 6, earth 3 | equal data | pass |
| 22 | JavaScript off, 8 pages (index, topics, elements, balance, constants, about, dna, balancing-equations) | content complete: 118 cells, 118 list rows, 23 topic links, nothing hidden. Dead controls: balance.html shows 1 form, 1 input, 1 submit button and 5 example chips that do nothing | fail on balance (F2) |
| 23 | Horizontal overflow, 29 pages x (360, 390, 430, 1280) = 116 loads | 0 pages overflow. Table box at 390: scrollWidth 883 inside clientWidth 355, page scrollWidth 390 = clientWidth | pass |
| 24 | Heading outline, 29 pages | one h1 each, no skipped level. index 1-2-2-3-3-3-3-3-3-3-3, elements 1-2-2 | pass |
| 25 | Link crawl: 728 href/src, 29 files, anchors `about.html#marks`, `#corrections`, `#main`, all `#e-*` | 0 broken, 0 orphan pages (fewest inbound: electricity 2). One external href: github issues/new | pass |
| 26 | Network requests, index/topics/elements/balance and 25 topic pages at 390 and 1280 | external requests: 0. Requests are the page, styles.css, js files only | pass |
| 27 | Weight (html + css + js + favicon): index 31.7 KB, topics 30.1, elements 80.5 (html 58.3), balance 34.7, constants 24.6, about 20.9, dna 19.9 | all under 100 KB | pass |
| 28 | Constants marks: 12 exact, 1 measured, 4 rounded; all 17 values equal the SI 2019 / CODATA figures (G 6.674 30(15), me 9.109, mp 1.673, mn 1.675 rounded correctly) | | pass |

## Findings

BLOCKER: none.

MAJOR

1. [claim] Home page and constants card say "a few measured ones". The data holds 1 measured constant (G) of 17: 12 exact, 4 rounded. "A few" overstates by 3x. Fix: print "the defining constants of the SI, one measured constant and four rounded values", generated from the mark counts in build.py as the other counts are.

2. [defect] With JavaScript off, balance.html shows 7 interactive-looking controls (input, Balance button, 5 example chips) that do nothing, next to a noscript note saying it needs JavaScript. Fix: render the form `hidden` and unhide it from script.js (as #pt-tools and #field-chips already do), leaving only the noscript text and the link to the topic.

MINOR

3. [defect] Balancer: huge subscripts lose precision silently. `C99999999999999999999H2 + O2 -> CO2 + H2O` parses the subscript with parseInt as 1e20 and prints 200000000000000000001 O2, which balances the wrong molecule (true subscript is 1e20 - 1). The UI table also uses Number(co[i]). Fix: reject any subscript or multiplier over 9007199254740991 (or keep them as BigInt throughout), and cap formula length.

4. [defect] Balancer: no input-quality guard.
   - `CuSO4·0H2O -> CuSO4` is accepted (a zero hydrate multiplier is dropped).
   - Trailing or doubled plus (`... + H2O + `, `H2 + + O2`) is accepted silently.
   - `H2O -> H2O` is accepted as a "balanced" answer.
   - `Fe+3` reports "Unexpected number in “3”" instead of the charge message.
   - `H2O(aq)` reports "Unexpected character “a”", although the page says state symbols are "not yet" supported.
   Fix: reject a zero multiplier, empty items between plus signs, and identical left/right multisets; test for `+digit` and `(aq|s|l|g)` before the generic errors, and name the state symbol.

5. [premise] elements.html: the 11 dimmed-cell states measure 1.5-2.1:1 (rows 7). Dimming by opacity .28 is the intended filter cue and these cells are not the answer, but a reader who filters still needs to read the dimmed neighbours, and the same dim text also fails when the user searches for no match (all 118 dim). Fix: dim by desaturating the tint and keeping text at or above 4.5:1 (for example color-mix of ink at 70%, or a lighter border), or state in the count line that dimmed cells are deliberately low contrast.

6. [defect] Must-fail inputs accepted: `CuSO4·0H2O`, `... + H2O + `, `H2 + + O2`, `H2O -> H2O` (see 4; counted separately in row 13: 4 of 30).

7. [claim] The balancer silently drops user-typed leading coefficients: `2H2 + O2 -> 2H2O` returns the solver's own coefficients. If a user types `3 H2 + N2 -> 2 NH3` they never learn their numbers were ignored. Fix: when a leading coefficient was stripped, say so in the result ("Your coefficients were ignored; the smallest whole numbers are…").

8. [defect] elements.html: no hashchange handler. Pasting `#e-Fe` in an already-open page, or using the back button, keeps the card on the previous element (measured: Au stays after hash set to #e-Fe). Unknown or lower-case hashes (`#e-og`, `#E-Au`) show nothing and give no message. Fix: listen to `hashchange`, match case-insensitively on the symbol, and show "No element called …" when unmatched.

9. [claim] The search box placeholder says "name or symbol" but it matches substrings of the whole row label, including the "(also Aluminum)" alternates: `o` lights 56 where names alone give 53 (Al, S, Cs). Fix: either say "name, symbol or alternate spelling" or match name and symbol only.

10. [claim] about.html says the balancer "is checked against known answers", but no check ships in the repo for a reader to rerun. I ran 38 and all held, so the claim is true, but it is not reproducible from the page. Fix: add a one-line pointer to where the known answers are, or print the number checked.

11. [note] Home silhouette has 119 `<rect>` elements; the 119th is the hatch tile. The page prints 118, which is the count of `rect.c`. Fix: none needed; say "118 squares" in any later audit, not "118 rects".
