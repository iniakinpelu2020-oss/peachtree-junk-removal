/* Peachtree Junk Removal — load meter */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + n; };

  var PHONE = "+14047913528";
  var TZ = "America/New_York";
  var DEBRIS = 175;

  var TIERS = {
    single: { label: "Single Item", price: 89, fill: 14 },
    quarter: { label: "Quarter Truck", price: 165, fill: 25 },
    half: { label: "Half Truck", price: 285, fill: 50 },
    full: { label: "Full 16-Yd Truck", price: 495, fill: 100 }
  };

  var state = { tier: "half", debris: false };

  /* ---------- boot failsafe ---------- */
  var boot = $("#boot");
  if (boot) {
    window.setTimeout(function () {
      if (boot && boot.parentNode) { boot.parentNode.removeChild(boot); }
    }, 2600);
  }

  /* ---------- today in Atlanta ---------- */
  (function today() {
    var rows = $$(".hours__table tr[data-day]");
    if (!rows.length) { return; }
    var label;
    try {
      label = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: TZ }).format(new Date());
    } catch (err) {
      label = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
    }
    rows.forEach(function (row) {
      if (row.getAttribute("data-day") === label) {
        row.classList.add("is-today");
        var cell = $(".hours__now", row);
        if (cell) { cell.textContent = "Today"; }
      }
    });
  })();

  /* ---------- elements ---------- */
  var heroTotal = $("#heroTotal");
  var heroPct = $("#heroPct");
  var heroLoad = $("#heroLoad");
  var heroFill = $("#heroFill");

  var buildTotal = $("#buildTotal");
  var buildSub = $("#buildSub");
  var buildList = $("#buildList");
  var buildText = $("#buildText");
  var buildCall = $("#buildCall");
  var truckFill = $("#truckFill");
  var fillPct = $("#fillPct");

  var drawerNum = $("#drawerTotal");
  var drawerSub = $("#drawerSub");
  var drawerList = $("#drawerList");
  var drawerText = $("#drawerText");
  var drawerCall = $("#drawerCall");

  var barTotal = $("#barTotal");

  function tier() { return TIERS[state.tier]; }
  function total() { return tier().price + (state.debris ? DEBRIS : 0); }
  function pct() {
    var p = tier().fill + (state.debris ? 12 : 0);
    return p > 100 ? 100 : p;
  }

  function subText() {
    if (!state.debris) { return tier().label; }
    return tier().label + " + yard debris";
  }

  function message() {
    var parts = [tier().label + " " + money(tier().price)];
    if (state.debris) { parts.push("Yard Debris Haul " + money(DEBRIS)); }
    return "Hi Peachtree Junk Removal — load meter estimate: " + parts.join(" + ") +
      " = " + money(total()) + " (starting). Atlanta. Can you confirm a pickup window?";
  }

  function rowsHtml() {
    var out = '<li><span>' + tier().label + "</span><span>" + money(tier().price) + "</span></li>";
    if (state.debris) {
      out += '<li class="is-add"><span>Yard Debris Haul</span><span>' + money(DEBRIS) + "</span></li>";
    }
    return out;
  }

  function render(pop) {
    var t = total();
    var p = pct();
    var href = "sms:" + PHONE + "?&body=" + encodeURIComponent(message());
    var rows = rowsHtml();

    if (heroTotal) { heroTotal.textContent = money(t); }
    if (heroPct) { heroPct.textContent = String(p); }
    if (heroLoad) { heroLoad.textContent = tier().label; }
    if (heroFill) { heroFill.style.transform = "scaleY(" + (p / 100) + ")"; }

    if (buildTotal) {
      buildTotal.textContent = money(t);
      if (pop) {
        buildTotal.classList.add("pop");
        window.setTimeout(function () { buildTotal.classList.remove("pop"); }, 220);
      }
    }
    if (buildSub) { buildSub.textContent = subText(); }
    if (buildList) { buildList.innerHTML = rows; }
    if (buildText) { buildText.href = href; }
    if (buildCall) { buildCall.href = "tel:" + PHONE; }
    if (truckFill) { truckFill.style.transform = "scaleX(" + (p / 100) + ")"; }
    if (fillPct) { fillPct.textContent = p + "%"; }

    if (drawerNum) { drawerNum.textContent = money(t); }
    if (drawerSub) { drawerSub.textContent = subText(); }
    if (drawerList) { drawerList.innerHTML = rows; }
    if (drawerText) { drawerText.href = href; }
    if (drawerCall) { drawerCall.href = "tel:" + PHONE; }
    if (barTotal) { barTotal.textContent = money(t); }

    $$(".tier[data-tier]").forEach(function (b) {
      var on = b.getAttribute("data-tier") === state.tier;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    $$(".card[data-tier]").forEach(function (card) {
      var on = card.getAttribute("data-tier") === state.tier;
      card.classList.toggle("is-on", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
      var pick = $("[data-pick]", card);
      if (pick) { pick.textContent = on ? "Loaded" : "Select"; }
    });

    $$("[data-add]").forEach(function (el) {
      var on = !!state.debris;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
      var pick = $("[data-pick]", el);
      if (pick) { pick.textContent = on ? "Added" : "Add"; }
    });
  }

  function setTier(key) {
    if (!TIERS[key]) { return; }
    state.tier = key;
    render(true);
  }

  /* ---------- events ---------- */
  $$(".tier[data-tier]").forEach(function (b) {
    b.addEventListener("click", function () { setTier(b.getAttribute("data-tier")); });
  });

  $$(".card[data-tier]").forEach(function (card) {
    card.addEventListener("click", function () {
      var key = card.getAttribute("data-tier");
      setTier(key);
      var target = $("#load");
      if (target && window.matchMedia("(max-width:1024px)").matches) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  $$("[data-add]").forEach(function (el) {
    el.addEventListener("click", function () {
      state.debris = !state.debris;
      render(true);
    });
  });

  /* ---------- filters ---------- */
  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".filter").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var f = btn.getAttribute("data-filter");
      $$(".card").forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.hidden = !show;
      });
    });
  });

  /* ---------- card tilt ---------- */
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fine && !calm) {
    $$(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" +
          (x * 6).toFixed(2) + "deg) translateZ(24px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
      card.addEventListener("blur", function () { card.style.transform = ""; });
    });
  }

  render(false);

  /* ---------- drawer ---------- */
  var drawer = $("#drawer");
  var scrim = $("#scrim");
  var drawerClose = $("#drawerClose");
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) { return; }
    lastFocus = document.activeElement;
    render(false);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (scrim) {
      scrim.hidden = false;
      window.requestAnimationFrame(function () { scrim.classList.add("is-open"); });
    }
    document.body.style.overflow = "hidden";
    if (drawerClose) { drawerClose.focus(); }
  }

  function closeDrawer() {
    if (!drawer) { return; }
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (scrim) {
      scrim.classList.remove("is-open");
      window.setTimeout(function () {
        if (!drawer.classList.contains("is-open")) { scrim.hidden = true; }
      }, 400);
    }
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  $$("[data-open-estimate]").forEach(function (b) { b.addEventListener("click", openDrawer); });
  if (drawerClose) { drawerClose.addEventListener("click", closeDrawer); }
  if (scrim) { scrim.addEventListener("click", closeDrawer); }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) { closeDrawer(); }
  });
})();
