// Progressive enhancement. Every page works without this file; it adds filters, the element detail card and the balancer.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- topics: filter by field --------------------------------------------------------------------------------
  var fc = $("#field-chips");
  if (fc) {
    fc.hidden = false;
    var groups = $$(".fgroup");
    fc.addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      var v = b.getAttribute("data-field");
      $$("button", fc).forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      groups.forEach(function (g) { g.hidden = !!v && g.getAttribute("data-field") !== v; });
    });
  }

  // ---- elements: filter, search, detail card ------------------------------------------------------------------
  var tools = $("#pt-tools");
  if (tools) {
    tools.hidden = false;
    var cells = $$(".cell"), rows = {}, detail = $("#detail"), count = $("#count"), klass = "", q = "", ns = false;
    $$(".etable tbody tr").forEach(function (r) { rows[r.getAttribute("data-z")] = r; });
    var cls = function (z) { return rows[z].getAttribute("data-class"); };
    var stab = function (z) { return rows[z].getAttribute("data-stable"); };
    var nm = function (z) { return rows[z].querySelector("th").textContent.toLowerCase(); };
    var apply = function () {
      var n = 0;
      cells.forEach(function (c) {
        var z = c.getAttribute("data-z");
        var shown = (!klass || cls(z) === klass) && (!ns || stab(z) === "none") && (!q || nm(z).indexOf(q) > -1);
        c.classList.toggle("dim", !shown); if (shown) n++;
      });
      count.textContent = (klass || ns || q) ? "Highlighting " + n + " of " + cells.length + " elements." : "Showing all " + cells.length + " elements. Select one for details.";
    };
    $("#class-chips").addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      klass = b.getAttribute("data-class") || "";
      $$("#class-chips button").forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      apply();
    });
    $("#nostable").addEventListener("change", function (ev) { ns = ev.target.checked; apply(); });
    $("#q").addEventListener("input", function (ev) { q = ev.target.value.trim().toLowerCase(); apply(); });
    var showEl = function (z, push) {
      var r = rows[z]; if (!r) return;
      var th = r.querySelector("th"), tds = r.querySelectorAll("td");
      var sym = th.querySelector(".sym").textContent;
      var stableText = { stable: "Yes", none: "None, all isotopes are radioactive", bismuth: "Effectively stable (half-life far longer than the age of the universe)" }[stab(z)];
      detail.hidden = false;
      detail.innerHTML = '<div><div class="big">' + sym + '</div><div>' + th.textContent.replace(sym, "").trim() + '</div></div>' +
        '<dl><dt>Atomic number</dt><dd>' + z + '</dd><dt>Kind</dt><dd>' + cls(z) + '</dd><dt>Category</dt><dd>' + tds[1].textContent + '</dd><dt>Period</dt><dd>' + tds[2].textContent + '</dd><dt>Group</dt><dd>' + tds[3].textContent + '</dd><dt>Stable isotope</dt><dd>' + stableText + '</dd></dl>';
      cells.forEach(function (c) { c.classList.toggle("sel", c.getAttribute("data-z") === String(z)); });
      if (push) { try { history.replaceState(null, "", "#e-" + sym); } catch (e) { /* ignore */ } }
    };
    $(".pt").addEventListener("click", function (ev) {
      var c = ev.target.closest(".cell"); if (!c) return; ev.preventDefault(); showEl(c.getAttribute("data-z"), true);
    });
    var h = location.hash.match(/^#e-([A-Za-z]{1,2})$/);
    if (h) { var tr = document.getElementById("e-" + h[1]); if (tr) showEl(tr.getAttribute("data-z"), false); }
    apply();
  }

  // ---- balancer -----------------------------------------------------------------------------------------------
  var form = $("#balance-form");
  if (form && window.Balancer) {
    var known = JSON.parse($("#known-elements").textContent), out = $("#result"), input = $("#eq");
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var run = function (text) {
      out.innerHTML = "";
      try {
        var res = window.Balancer.balance(text, known);
        if (!res.ok) { out.innerHTML = '<div class="err"><p><strong>Cannot balance.</strong> ' + esc(res.message) + '</p></div>'; return; }
        var eq = res.eq, co = res.coefficients, els = {};
        eq.counts.forEach(function (c) { Object.keys(c).forEach(function (k) { els[k] = 1; }); });
        var rowsHtml = Object.keys(els).map(function (k) {
          var l = 0, r = 0;
          eq.counts.forEach(function (c, i) { var n = (c[k] || 0) * Number(co[i]); if (i < eq.left.length) l += n; else r += n; });
          return '<tr><th scope="row">' + esc(k) + '</th><td>' + l + '</td><td>' + r + '</td></tr>';
        }).join("");
        out.innerHTML = '<div class="ok"><p class="eq">' + esc(window.Balancer.format(res)) + '</p><p class="check-line">Atoms on each side, counted again from the answer:</p>' +
          '<table><thead><tr><th scope="col">Element</th><th scope="col">Left</th><th scope="col">Right</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';
      } catch (e) { out.innerHTML = '<div class="err"><p><strong>Cannot read that.</strong> ' + esc(e.message) + '</p></div>'; }
    };
    form.addEventListener("submit", function (ev) { ev.preventDefault(); run(input.value); });
    $$(".chip.ex").forEach(function (b) { b.addEventListener("click", function () { input.value = b.getAttribute("data-eq"); run(input.value); input.focus(); }); });
  }
})();
