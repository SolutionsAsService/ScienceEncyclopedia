// Chemical equation balancer: exact rational arithmetic on a nullspace. No dependencies.
// Each element is one linear equation (atoms on the left minus atoms on the right = 0); the coefficients are the
// nullspace vector scaled to the smallest positive whole numbers.
(function (root) {
  "use strict";

  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function Q(n, d) { if (d === undefined) d = 1n; if (d < 0n) { n = -n; d = -d; } var g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; }
  function sub(a, b) { return Q(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return Q(a.n * b.n, a.d * b.d); }
  function div(a, b) { return Q(a.n * b.d, a.d * b.n); }
  var isZero = function (a) { return a.n === 0n; };

  // Parse one formula such as Ca(OH)2, Fe2(SO4)3 or CuSO4·5H2O into {element: count}.
  function parseFormula(text, known) {
    var parts = text.replace(/\s+/g, "").split(/[·•*]/);
    var total = {};
    parts.forEach(function (part, idx) {
      var m = part.match(/^(\d+)(.*)$/);
      var mult = 1;
      if (m && idx > 0) {
        mult = parseInt(m[1], 10); part = m[2];
        if (mult < 1) throw new Error("A hydrate multiplier of zero in “" + text + "” is not allowed; leave that part out instead.");
        if (mult > 9999) throw new Error("A hydrate multiplier that large in “" + text + "” is not supported (the limit is 9999).");
      }
      var counts = parseGroup(part, known);
      Object.keys(counts).forEach(function (el) { total[el] = (total[el] || 0) + counts[el] * mult; });
    });
    return total;
  }
  function parseGroup(s, known) {
    var i = 0, stack = [{}];
    function num() {
      var j = i; while (i < s.length && /[0-9]/.test(s[i])) i++;
      if (i === j) return 1;
      var v = parseInt(s.slice(j, i), 10);
      if (v < 1) throw new Error("A subscript of zero in “" + s + "” is not allowed; leave the element out instead.");
      if (v > 9999) throw new Error("A subscript that large in “" + s + "” is not supported (the limit is 9999).");
      return v;
    }
    var closers = { ")": "(", "]": "[", "}": "{" };
    var openers = [];
    while (i < s.length) {
      var ch = s[i];
      if (ch === "(" || ch === "[" || ch === "{") { stack.push({}); openers.push(ch); i++; }
      else if (closers[ch]) {
        if (!openers.length || openers.pop() !== closers[ch]) throw new Error("Brackets do not match in “" + s + "”.");
        i++; var k = num(), top = stack.pop(), under = stack[stack.length - 1];
        Object.keys(top).forEach(function (el) { under[el] = (under[el] || 0) + top[el] * k; });
      } else if (/[A-Z]/.test(ch)) {
        var sym = ch; i++;
        if (i < s.length && /[a-z]/.test(s[i])) { sym += s[i]; i++; }
        if (known && !known[sym]) throw new Error("“" + sym + "” is not an element symbol (check the capital letters, for example Co is cobalt and CO is carbon monoxide).");
        var c = num(), cur = stack[stack.length - 1];
        cur[sym] = (cur[sym] || 0) + c;
      } else if (/[a-z]/.test(ch)) {
        throw new Error("Element symbols start with a capital letter, for example H2 and not h2. Check “" + s + "”.");
      } else if (/[0-9]/.test(ch)) {
        throw new Error("Unexpected number in “" + s + "”. Write formulas without coefficients, for example H2O.");
      } else if (ch === "+" || ch === "-" || ch === "^" || ch === "−") {
        throw new Error("Ions and charges are not supported yet; use neutral formulas.");
      } else { throw new Error("Unexpected character “" + ch + "” in “" + s + "”."); }
    }
    if (openers.length) throw new Error("Brackets do not match in “" + s + "”.");
    return stack[0];
  }

  function splitSide(side) {
    var t = side.trim();
    if (/^\+|\+$/.test(t) || /\+\s*\+/.test(t)) throw new Error("Check the plus signs: one is missing a substance next to it.");
    return splitRaw(side);
  }
  function splitRaw(side) { return side.split(/\s\+\s|\+(?=\s*[A-Z(\[{0-9])/).map(function (x) { return x.trim(); }).filter(Boolean); }

  function parseEquation(text, known) {
    var notes = [];
    var t = text.replace(/→|⟶|=>|-->|->|⇒|=/g, "→");
    if (/\((s|l|g|aq)\)/.test(t)) { t = t.replace(/\((s|l|g|aq)\)/g, ""); notes.push("State symbols such as (aq) were ignored."); }
    var halves = t.split("→");
    if (halves.length !== 2) throw new Error("Write one equation with an arrow, for example H2 + O2 -> H2O.");
    var L = splitSide(halves[0]), R = splitSide(halves[1]);
    if (!L.length || !R.length) throw new Error("Both sides need at least one substance.");
    var typed = false;
    var strip = function (f) { var g = f.replace(/^\d+\s*(?=[A-Z(\[{])/, ""); if (g !== f) typed = true; return g; };
    var names = L.concat(R).map(strip);
    if (typed) notes.push("Coefficients you typed were ignored; the balancer works them out.");
    var left = names.slice(0, L.length), right = names.slice(L.length);
    left.forEach(function (n) { if (right.indexOf(n) > -1) throw new Error("“" + n + "” appears on both sides. Remove a substance that does not change, or check the formulas."); });
    return { notes: notes, left: names.slice(0, L.length), right: names.slice(L.length), counts: names.map(function (f) { return parseFormula(f, known); }) };
  }

  function balance(text, known) {
    var eq = parseEquation(text, known);
    var n = eq.counts.length, els = [];
    eq.counts.forEach(function (c) { Object.keys(c).forEach(function (e) { if (els.indexOf(e) < 0) els.push(e); }); });
    var nl = eq.left.length;
    var M = els.map(function (e) { return eq.counts.map(function (c, j) { return Q(BigInt((c[e] || 0) * (j < nl ? 1 : -1))); }); });
    // reduced row echelon form
    var piv = [], r = 0;
    for (var c = 0; c < n && r < M.length; c++) {
      var p = -1; for (var i = r; i < M.length; i++) if (!isZero(M[i][c])) { p = i; break; }
      if (p < 0) continue;
      var tmp = M[r]; M[r] = M[p]; M[p] = tmp;
      var pv = M[r][c]; M[r] = M[r].map(function (x) { return div(x, pv); });
      for (var i2 = 0; i2 < M.length; i2++) if (i2 !== r && !isZero(M[i2][c])) { var f = M[i2][c]; M[i2] = M[i2].map(function (x, j) { return sub(x, mul(f, M[r][j])); }); }
      piv.push(c); r++;
    }
    var free = []; for (var j = 0; j < n; j++) if (piv.indexOf(j) < 0) free.push(j);
    if (free.length === 0) return { ok: false, reason: "none", message: "This cannot be balanced as written: the two sides do not contain the same elements in compatible amounts. Check the formulas.", eq: eq };
    if (free.length > 1) return { ok: false, reason: "ambiguous", message: "More than one independent way to balance this exists, so the reaction is ambiguous as written. It may be several reactions combined; try splitting it.", eq: eq };
    var fj = free[0], vec = new Array(n).fill(Q(0n)); vec[fj] = Q(1n);
    piv.forEach(function (pc, row) { vec[pc] = Q(-M[row][fj].n, M[row][fj].d); });
    var L2 = 1n; vec.forEach(function (x) { L2 = lcm(L2, x.d); });
    var ints = vec.map(function (x) { return x.n * (L2 / x.d); });
    var g = 0n; ints.forEach(function (x) { g = gcd(g, x); });
    ints = ints.map(function (x) { return x / g; });
    if (ints.every(function (x) { return x <= 0n; })) ints = ints.map(function (x) { return -x; });
    if (!ints.every(function (x) { return x > 0n; })) return { ok: false, reason: "sign", message: "The atoms balance only with a negative or zero coefficient, so this reaction cannot run as written. Check that the products are right.", eq: eq };
    return { ok: true, coefficients: ints.map(String), eq: eq };
  }

  function format(res) {
    var fmt = function (name, co) { return (co === "1" ? "" : co + " ") + name; };
    var l = res.eq.left.map(function (n, i) { return fmt(n, res.coefficients[i]); });
    var r = res.eq.right.map(function (n, i) { return fmt(n, res.coefficients[res.eq.left.length + i]); });
    return l.join(" + ") + " → " + r.join(" + ");
  }

  var api = { balance: balance, format: format, parseFormula: parseFormula };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Balancer = api;
})(typeof window !== "undefined" ? window : this);
