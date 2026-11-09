# DESIGN-LOG: Science Encyclopedia (redesign)

**Run.** DADA, Adaptive mode, Full run type (the previous site was a one-page shell with nothing to preserve), **bounded to one panel round**. Look: the new design pack `lab-notebook` (SolutionsAsService/dada-changes, `skills/dada/designpacks/`). The pages are generated from `data/*.json` by `scripts/build.py`; every count printed on a page is read from those files. The previous version is kept on the branch `legacy/pre-redesign`.

## R0. The inherited site, measured and read
A single `index.html` with a hero, two sections and a form. `script.js` was referenced and did not exist, so the equation balancer did nothing; the nav linked to `#physics` and `#biology`, which had no sections; a fixed header covered the content; fonts loaded from Google Fonts; there was no icon, no metadata, no content. The "site" was a plan for a site. The Frontier: (1) a real body of content, (2) the one thing it already promised (balancing equations) made real, (3) an idea that distinguishes it from every other science reference, (4) the Mobile Floor.

## Decisions
**D1 The mark on every number.** A science reference's quiet failure is printing a defined constant and a measured one in the same typeface with the same confidence. Each number in a topic or the constants table carries a mark: solid rule and the word *Exact* (by definition or convention), dashed *Measured*, dotted *Rounded*. The marks describe the kind of number, not a ranking of trust (panel F2). D2 **The table is the page.** The home hero is the periodic table drawn as 118 squares: pattern for kind (solid metals, hatched metalloids, outlined nonmetals, dotted unconfirmed, dashed edge for superheavy), generated from the same data as the table page. D3 **Graph paper, ink, one teal accent**, system fonts only, one breakpoint, nothing loaded from another domain. D4 **A working balancer** that solves each element as a linear equation in exact fractions, refuses ambiguous or impossible input with a plain message, and says what it ignored. D5 **Everything is data**: elements, topics, constants live in JSON; pages are generated; a count in a sentence cannot disagree with the drawing beside it. D6 **Honest scope:** the footer and About say the text was written from general knowledge and has not been checked line by line against IUPAC, CODATA or NIST.

## Panel R1 (3 seats, one agent per reference; verdicts in `panel/R1/`)
Krug (usability), Debord (claims check, science accuracy from knowledge, no web access), Cairo (measurement). Not seated, for the bound: an inclusion seat (Mace or Holmes).

| Seat(s): finding | Resolution |
|---|---|
| Debord F1: "every number says how well it is known" is false (running text and dates are unmarked) | ADAPT: title, lede and band now say "the key figures", and name what is and is not marked |
| Debord F2: the three marks read as one trust scale; α (rounded) is better known than G (measured) | ADAPT: the Rounded blurb now says rounded does not mean poorly known; About says the marks describe the kind of number, not a ranking. Not adopted: splitting dotted into Rounded and Typical (DEFERRED) |
| Debord F3: "Known elements 118" marked Exact | ADAPT: moved out of the marked numbers into prose; Exact now reads "by definition or by agreed convention" |
| Debord F4: "94 metals" includes superheavy elements whose kind is only predicted; panel said "metal" for Ts and Og | ADAPT: a fourth class, *unconfirmed*, for 113 to 118 (88 metals, 6 metalloids, 18 nonmetals, 6 unconfirmed); dotted outline; panel says "kind predicted, not measured" |
| Debord F5: au "defined from the average distance" next to its exact IAU figure | ADAPT: reworded as originally based on, now defined as exactly 149 597 870 700 m |
| Debord F6: "balancer checked against known answers" had no record | ADAPT: wording softened; `scripts/check-balancer.js` added (14 known answers recounted, 18 bad inputs refused) and the hexacyanoferrate case added as an example chip |
| Debord F7: "most reliable parts" ranks the unverified | ADAPT: reworded to "most easily checked against a single published table" |
| Debord F8: bismuth silently excluded from the 37 | ADAPT: note under the table gives the count as 38 if Bi is counted radioactive |
| Debord F9: "closed system" | ADAPT: "isolated system" |
| Debord F10, F11, F12: GPS label, "photosynthesis in reverse", cell walls, DNA strand units, orbitals, genome 3.1 to 3.2 billion, IUPAC 2021 group 3 | ADAPT: all reworded as proposed |
| Debord F13: unsupported claim about other textbooks | ADAPT: replaced by the defined-versus-measured contrast, without the claim about others |
| Debord F14 / Cairo M1: "a few measured ones" (the data has 1 measured, 4 rounded, 12 exact) | ADAPT: card and constants lede now say seven defining constants, five exact conventions, five measured |
| Cairo M2: with JavaScript off the balancer showed a dead form and chips | ADAPT: the form and examples are `hidden` and revealed by script; verified no dead controls without JS |
| Cairo: balancer wrongly accepted `CuSO4·0H2O`, doubled or trailing `+`, `H2O -> H2O`; silently dropped typed coefficients; a 10²⁰ subscript lost precision | ADAPT: all refused or reported (`H2O` on both sides, zero subscripts, bounded to 9999, state symbols and typed coefficients ignored with a notice) |
| Cairo: no hashchange handler; search matched alternate spellings | ADAPT: handler added; search matches name and symbol only |
| Cairo: dimmed cells 1.5 to 2.1:1 | ADAPT: dim opacity raised to .45; they are a filter state, not content |
| Krug (elements, phone): about 700px of intro and filters before the first cell; the detail card above the table showed nothing in view on a tap | ADAPT: filters collapse into one "Filter or find" control on phone; first cell now at 540px; the detail card is a compact sticky card at the bottom (13% of the screen, with a close button); a fade on the table's right edge cues the sideways scroll |
| Krug (balancer, phone): result landed at the bottom edge, off screen | ADAPT: result sits directly under the form, examples below it, and the result scrolls into view |
| Krug: lowercase `h2` and `(g)` gave a bare "unexpected character" | ADAPT: plain messages; state symbols stripped with a notice |
| Krug: nav wraps and orphans "About"; footer duplicates the nav | ADAPT: About moved to the footer, four items fit on one line |
| Krug: breadcrumb field not a link; tool cards show no link signal | ADAPT: field links to its group on the topics page; card titles underlined |
| Krug: hero drawing has no "click me" signal; caption long | PARTLY ADAPTED: caption shortened; the drawing is not itself a link, the "Explore the table" link sits under it |
| Krug: repeated legends | DEFERRED |

## Measured
Mobile Floor 12 of 12 at 360, 390 and 430px on all pages tested (home, topics, elements, balance, constants, about, a topic page), re-run after each change set. Cairo measured: 0 horizontal overflow across 116 page loads, 0 broken links of 728, one h1 per page with no skipped levels, 0 external requests, every page under 100 KB, all printed counts equal to the data, home SVG 118 squares in the right classes, light and dark contrast clean (the 11 category tints: symbol 7.8 to 10:1 in dark). Balancer: 38 of 38 successful answers recounted independently with gcd 1; the UI path verified in a real browser. After fixes, in a real browser: first element cell at 540px on a 390px phone; element card stays in view at 13% of the height; deep link and hashchange load the right element; no JavaScript leaves every page complete with no dead control.

## Stop test
S1 not met (no R2). S2 not met (round 1's changes were judged by measurement and a real-browser check, not by the panel). S4 not run. **Reported as incomplete under the one-round bound.**

## Open
- All text and values were written from general knowledge. The element names, symbols and numbers and the SI constants passed Debord's check from memory; they have **not** been checked against IUPAC, CODATA or NIST. A primary-source pass is the largest remaining task.
- No inclusion seat. Not shown on a real phone: the sideways swipe versus the browser's back-swipe, thumb accuracy at the screen edge, the on-screen keyboard over the balancer result, iOS input zoom.
- The Rounded mark still mixes "shown to fewer digits" and "a typical value that varies".
- Balancer does not support ions and charges, or isotopes.
- Repeated legends (marks explained on four pages).
- Topic prose is short; no figures or diagrams beyond the table and the marks.
