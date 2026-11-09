#!/usr/bin/env node
// Re-runnable check of the equation balancer: known textbook answers must come out exactly, bad input must be refused,
// and every success is recounted independently from the printed output. Run: node scripts/check-balancer.js
const fs = require("fs"), path = require("path");
const B = require(path.join(__dirname, "..", "js", "balance-core.js"));
const els = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "elements.json"), "utf8")).elements;
const known = {}; els.forEach(e => { known[e.symbol] = 1; });

const answers = [
  ["H2 + O2 -> H2O", "2 H2 + O2 → 2 H2O"],
  ["Fe + O2 -> Fe2O3", "4 Fe + 3 O2 → 2 Fe2O3"],
  ["C6H12O6 + O2 -> CO2 + H2O", "C6H12O6 + 6 O2 → 6 CO2 + 6 H2O"],
  ["Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O", "3 Ca(OH)2 + 2 H3PO4 → Ca3(PO4)2 + 6 H2O"],
  ["KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O", "2 KMnO4 + 16 HCl → 2 KCl + 2 MnCl2 + 5 Cl2 + 8 H2O"],
  ["Al + O2 = Al2O3", "4 Al + 3 O2 → 2 Al2O3"],
  ["C3H8 + O2 → CO2 + H2O", "C3H8 + 5 O2 → 3 CO2 + 4 H2O"],
  ["CuSO4·5H2O -> CuSO4 + H2O", "CuSO4·5H2O → CuSO4 + 5 H2O"],
  ["Fe2(SO4)3 + KOH -> K2SO4 + Fe(OH)3", "Fe2(SO4)3 + 6 KOH → 3 K2SO4 + 2 Fe(OH)3"],
  ["NH3 + O2 -> NO + H2O", "4 NH3 + 5 O2 → 4 NO + 6 H2O"],
  ["Na + Cl2 -> NaCl", "2 Na + Cl2 → 2 NaCl"],
  ["K4[Fe(CN)6] + H2SO4 + H2O -> K2SO4 + FeSO4 + (NH4)2SO4 + CO", "K4[Fe(CN)6] + 6 H2SO4 + 6 H2O → 2 K2SO4 + FeSO4 + 3 (NH4)2SO4 + 6 CO"],
  ["2H2 + O2 -> 2H2O", "2 H2 + O2 → 2 H2O"],
  ["H2(g) + O2(g) -> H2O(l)", "2 H2 + O2 → 2 H2O"],
];
const refused = ["H2 -> O2", "Co + O2 -> CO2x", "Xx + O2 -> XxO", "H2 + O2 -> H2O + H2O2", "H2 + O2", "Fe+ + O2 -> Fe2O3",
  "H2O -> H2 + O2 + N2", "Ca(OH + H2 -> x", "CuSO4·0H2O -> CuSO4 + H2O", "H2 + O2 + -> H2O", "H2 + + O2 -> H2O", "+ H2 + O2 -> H2O",
  "H2O -> H2O", "h2 + o2 -> h2o", "H2 + O2 -> H2O + ", "H100000000000000000000 + O2 -> H2O", "-> H2O", "H2 + O2 ->"];

function recount(out) { // independent atom count from the printed string
  const [l, r] = out.split(" → ");
  const side = s => { const t = {}; s.split(" + ").forEach(term => {
    const m = term.match(/^(\d+) (.*)$/); const k = m ? +m[1] : 1; const f = m ? m[2] : term;
    const c = B.parseFormula(f, known); Object.keys(c).forEach(e => t[e] = (t[e] || 0) + c[e] * k); }); return t; };
  const a = side(l), b = side(r), ks = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...ks].every(e => a[e] === b[e]);
}
let bad = 0;
answers.forEach(([inp, want]) => {
  let got; try { const r = B.balance(inp, known); got = r.ok ? B.format(r) : "ERR " + r.reason; } catch (e) { got = "THROW " + e.message; }
  const ok = got === want && recount(got); if (!ok) { bad++; console.log("FAIL answer:", inp, "=>", got); }
});
refused.forEach(inp => {
  let refusedOk = false; try { refusedOk = !B.balance(inp, known).ok; } catch (e) { refusedOk = true; }
  if (!refusedOk) { bad++; console.log("FAIL should refuse:", inp); }
});
const typed = B.balance("2H2 + O2 -> 2H2O", known);
if (!((typed.eq && typed.eq.notes) || []).some(n => /ignored/.test(n))) { bad++; console.log("FAIL: typed coefficients are not reported as ignored"); }
console.log(bad ? `${bad} FAILURE(S)` : `ok: ${answers.length} known answers recounted, ${refused.length} bad inputs refused, typed-coefficient notice present`);
process.exit(bad ? 1 : 0);
