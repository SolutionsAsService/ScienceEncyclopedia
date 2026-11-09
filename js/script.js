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
    if (window.matchMedia("(min-width: 760px)").matches) tools.open = true;
    var cells = $$(".cell"), rows = {}, detail = $("#detail"), count = $("#count"), klass = "", q = "", ns = false;
    $$(".etable tbody tr").forEach(function (r) { rows[r.getAttribute("data-z")] = r; });
    var cls = function (z) { return rows[z].getAttribute("data-class"); };
    var stab = function (z) { return rows[z].getAttribute("data-stable"); };
    var nm = function (z) { var th = rows[z].querySelector("th"); return (th.querySelector(".sym").textContent + " " + th.firstChild.nextSibling.textContent).toLowerCase(); };
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
    $("#nostable").addEventListener("click", function (ev) {
      ns = !ns; ev.currentTarget.classList.toggle("on", ns); ev.currentTarget.setAttribute("aria-pressed", ns ? "true" : "false"); apply();
    });
    $("#q").addEventListener("input", function (ev) { q = ev.target.value.trim().toLowerCase(); apply(); });
    var showEl = function (z, push) {
      var r = rows[z]; if (!r) return;
      var th = r.querySelector("th"), tds = r.querySelectorAll("td");
      var sym = th.querySelector(".sym").textContent;
      var name = th.firstChild.nextSibling.textContent.trim();
      var kind = { metal: "metal", metalloid: "metalloid", nonmetal: "nonmetal", unconfirmed: "kind predicted, not measured" }[cls(z)];
      var stableText = { stable: "stable isotope: yes", none: "no stable isotope", bismuth: "effectively stable" }[stab(z)];
      detail.hidden = false;
      detail.innerHTML = '<button type="button" class="x" aria-label="Close details">\u00d7</button><div class="top"><span class="big">' + sym + '</span><span class="nm">' + name + '</span><span class="z2">No. ' + z + '</span></div>' +
        '<p class="meta">' + kind + ' \u00b7 ' + tds[1].textContent + ' \u00b7 period ' + tds[2].textContent + ' \u00b7 group ' + tds[3].textContent + ' \u00b7 ' + stableText + '</p>';
      cells.forEach(function (c) { c.classList.toggle("sel", c.getAttribute("data-z") === String(z)); });
      if (push) { try { history.replaceState(null, "", "#e-" + sym); } catch (e) { /* ignore */ } }
    };
    detail.addEventListener("click", function (ev) {
      if (ev.target.closest(".x")) { detail.hidden = true; cells.forEach(function (c) { c.classList.remove("sel"); }); }
    });
    var scroller = $(".ptscroll");
    var edge = function () { scroller.classList.toggle("at-end", scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4); };
    scroller.addEventListener("scroll", edge); edge();
    window.addEventListener("hashchange", function () {
      var m2 = location.hash.match(/^#e-([A-Za-z]{1,2})$/); if (!m2) return;
      var tr2 = document.getElementById("e-" + m2[1]); if (tr2) showEl(tr2.getAttribute("data-z"), false);
    });
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
    $$(".js-only").forEach(function (el) { el.hidden = false; });
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
        var notes = (eq.notes && eq.notes.length) ? '<p class="notes">' + esc(eq.notes.join(" ")) + '</p>' : "";
        out.innerHTML = '<div class="ok"><p class="eq">' + esc(window.Balancer.format(res)) + '</p><p class="check-line">Atoms on each side, counted again from the answer:</p>' +
          '<table><thead><tr><th scope="col">Element</th><th scope="col">Left</th><th scope="col">Right</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>' + notes + '</div>';
      } catch (e) { out.innerHTML = '<div class="err"><p><strong>Cannot read that.</strong> ' + esc(e.message) + '</p></div>'; }
    };
    var reveal = function () { try { out.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* ignore */ } };
    form.addEventListener("submit", function (ev) { ev.preventDefault(); run(input.value); reveal(); });
    $$(".chip.ex").forEach(function (b) { b.addEventListener("click", function () { input.value = b.getAttribute("data-eq"); run(input.value); reveal(); }); });
  }
})();
