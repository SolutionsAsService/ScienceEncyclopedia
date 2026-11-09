# Critic: Usability (Krug), round 1

Anchor: Krug, Don't Make Me Think. Five-second test, trunk test, what is clickable, first action visible, needless words.

## Verdict

OBJECT, mildly. The home page passes the five-second test: the title, the sentence "every number tells you how well it is known" and two plain buttons ("Open the periodic table", "Balance an equation") are all above the fold on both widths. Topic pages are the best-behaved pages here: breadcrumb, a "Numbers on this page" block, a "Related" block. The balancer's error messages are mostly good. What hurts is on the phone. The elements page spends about 700px of the first 844px before any table cell is visible. The balancer's example buttons do their work off-screen. The nav wraps to two lines and orphans "About". The hero drawing, which is the point of the site, is a picture with no label saying "click me". None of this is fatal. All of it is fixable with small edits.

## Findings

1. MAJOR. Elements, phone 390x844: filters come before the table. Page 1 shows the heading, a 6-line intro paragraph, 4 wrapped filter chips on 3 rows, the Find box and a "Swipe the table sideways" hint. The first table cell appears at about y=840, so the first screen has no table in it. I loaded the page with a touch viewport and took a screenshot: nothing you can tap is a table cell. Change: cut the intro to one line (move the key to a legend under the table or to the home page). Make the chips one horizontally-scrolling row or a single select. Put the swipe hint directly above the table, and put the table above the fold.

2. MAJOR. Elements, phone: sideways scroll is announced only by a text line that is 150px above the table and is scrolled out of view by the time you swipe (".ptscroll" is 883px wide in a 355px box). Cells cut off at the right edge do hint at it, which is good, but there is no edge fade, no scrollbar and no "group 1 of 18" position. One-handed use works: cells are about 40px, about the minimum. Change: add a right-edge fade or shadow on the scroller, keep the hint inside the scroller (sticky at the top or bottom), and show a scrollbar.

3. MAJOR. Elements, phone: the detail card appears ABOVE the table (after tapping Fe, the card sat at y=230 and the table below it at y=550). The page happened to be scrolled so I saw both, but a tap on a cell in the lower rows (e.g. Pb, row 6) puts the card 600+px up and out of view, while the thumb is on the table. Nothing visible happens. Change: on phone, show the card as a bottom sheet fixed to the viewport with a Close button, or scroll the card into view on selection, and move focus there.

4. MAJOR. Balancer, phone: tapping an example fills the box and balances, but the result block starts at y=861 on an 844px viewport, and the page did not scroll (scrollY 0). The user taps and sees nothing change except the text in the box. Same for the Balance button after typing on a phone, as the keyboard covers more. Change: after a run, scroll the result into view (scrollIntoView, block "start") and move focus or announce it; or put the result directly under the Balance button and the examples below the result.

5. MINOR. Balancer errors, which I tried on 12 inputs. Good: "H2 + O2" gives "Cannot read that. Write one equation with an arrow, for example H2 + O2 -> H2O."; "Xx" explains Co vs CO; "Ca(OH2" says the brackets do not match; ambiguous reactions are named ("try splitting it"). Weak: (a) lowercase "h2 + o2 -> h2o" says only 'Unexpected character "h" in "h2"', with no hint that capitals matter (the hint is only in the page copy); (b) "Fe + O2(g) -> ..." says unexpected character "g", when the page says state symbols are unsupported; you could just strip them or say so; (c) "H2O -> H2O" is reported as balanced with no comment; (d) a second arrow gets the same "one arrow" message, fine. Change: map the "unexpected character" case to "Lower-case letters: element symbols start with a capital (Fe, not fe)"; recognise (s)(l)(g)(aq) and say "State symbols are not supported, remove (g)", or ignore them; and for identical sides say "Both sides are the same".

6. MINOR. Balancer, recovery: the input keeps its text after an error and an example button replaces it. That is good and recoverable. There is no Clear button and no way to see what was wrong in the box (no highlight of the bad token). Change: optional, add a "Clear" link; ok to skip.

7. MINOR. Nav, phone: brand plus five items wrap to two lines, with "About" alone on line two (~90px of header on every page). The current page is marked by an underline plus bold, which is fine. Change: either drop to four items by moving "About" into the footer only (it already is there; the footer repeats all six links), or allow the row to scroll horizontally, or reduce the text size to fit five.

8. MINOR. Do Constants and About earn their place? Constants: yes, it is where the marks are best shown, and the home page links to it; but it is the only page that is a bare table, so keep it as a nav item. About: it is the explanation of the three marks and the "not peer-reviewed" disclaimer, which matters, but the home page already links "What the three marks mean" and the footer has a disclaimer. Change: keep About, but rename to "About the marks" or put it only in the footer; do not spend a nav slot on it. Footer duplicates the whole nav (6 links) and is a second nav; fine as a dead-end catcher, keep.

9. MINOR. Home, desktop and phone: the hero periodic-table drawing is not clickable and has no caption saying so; the link "Explore the table" is a small text link under a long caption (the caption is the 6-line paragraph on phone). Users will click the drawing. Change: make the whole drawing a link to elements.html, or add "Tap a square" to the caption; shorten the caption to one sentence and move the key into the legend on the Elements page.

10. MINOR. Home, phone: three tool cards ("Start with a tool") are 3 big boxes with no visible link style (no underline, no arrow); I could not tell whether the whole card is a link. Change: add an arrow or underline on the title, and check that the whole card is the link target.

11. MINOR. Topic page (DNA, phone): the number mark is easy to find (heading "Numbers on this page", dotted rule plus the word ROUNDED) and "What the marks mean" is a link; Related are two cards; breadcrumb "Topics / Biology" is there, with "Biology" not a link (plain grey). Dead-end risk: the field name is not clickable, and there is no previous/next topic. Change: link "Biology" to topics.html#biology (or the field's section), and add "Back to all topics" at the end of Related. The numbers block sits at the end, so a reader of the intro paragraph does not know a number mark exists; add a one-line pointer near the top only if the entry has marked numbers.

12. MINOR (needless words). The elements intro repeats the legend; the home hero caption repeats the elements legend; the home footer repeats the disclaimer found on About. Cut one copy of each.

## What needs a real phone

- Whether the sideways swipe on the table fights the browser's back-swipe gesture at the left edge.
- Whether 40px cells hit reliably with a thumb on the edges of the screen (I used Playwright taps, which are exact).
- Whether the software keyboard hides the Balance button and the result (it will cover about half the screen); the font-size on the input must be 16px or iOS Safari zooms on focus (I did not check the computed size).
- Momentum scrolling and scroll position retention after tapping a cell.
- The legibility of hatched vs outlined cells in sunlight; the marks' dash patterns at small size.
- Hover is absent on a phone, so anything that relies on title tooltips is lost; I saw none, good.

Not edited: no site files. Scratch scripts are in the scratchpad only.
