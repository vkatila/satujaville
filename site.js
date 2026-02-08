/* ========= site.js =========
   Shared JS for wedding pages:
   - fade-in container
   - card filtering (supports optional "area" scope, e.g. Oulu vs Hailuoto)
   - availability modal
*/

(function () {
  "use strict";

  // ---------- Helpers ----------
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

   function setSubnavHeightVar(){
  const subnav = document.querySelector(".subnav");
  if(!subnav) return;

  const h = Math.ceil(subnav.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--subnav-height", `${h}px`);
}


  // ---------- Fade-in ----------
  function initFadeInContainer() {
    const c = document.querySelector(".container");
    if (c) c.classList.add("is-visible");
  }

  // ---------- Filtering ----------
  function initCardFilters() {
    const buttons = document.querySelectorAll(".filter-btn[data-city]");
    if (!buttons.length) return;

    const state = {}; // state[city] = { type: "all", area: "all" }

    function ensureCityState(city) {
      if (!state[city]) state[city] = { type: "all", area: "all" };
      return state[city];
    }

    function setPressed(groupButtons, activeBtn) {
      groupButtons.forEach((b) =>
        b.setAttribute("aria-pressed", String(b === activeBtn))
      );
    }

    function applyFilter(city) {
      const grid = document.querySelector(`[data-city-grid="${city}"]`);
      if (!grid) return;

      const s = ensureCityState(city);
      const cards = Array.from(grid.querySelectorAll(".card"));

      cards.forEach((card) => {
        const type = card.getAttribute("data-type") || "all";
        const area = card.getAttribute("data-area") || "all";

        const typeOk = s.type === "all" || type === s.type;
        const areaOk = s.area === "all" || area === s.area;

        card.style.display = typeOk && areaOk ? "" : "none";
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const city = btn.getAttribute("data-city");
        const filter = btn.getAttribute("data-filter") || "all";
        const scope = btn.getAttribute("data-scope") || "type"; // "type" or "area"

        const s = ensureCityState(city);
        if (scope === "area") s.area = filter;
        else s.type = filter;

        // Update pressed state (only within the same city + scope group)
        if (scope === "area") {
          const group = Array.from(
            document.querySelectorAll(
              `.filter-btn[data-city="${city}"][data-scope="area"]`
            )
          );
          setPressed(group, btn);
        } else {
          // type buttons have no data-scope in your markup
          const group = Array.from(
            document.querySelectorAll(`.filter-btn[data-city="${city}"]:not([data-scope])`)
          );
          setPressed(group, btn);
        }

        applyFilter(city);
      });
    });
  }

  // ---------- Availability modal ----------
  function initAvailabilityModal() {
    const openBtn = document.getElementById("openAvailability");
    const modal = document.getElementById("availabilityModal");
    const closeBtn = document.getElementById("closeAvailability");

    if (!openBtn || !modal) return;

    function onKeydown(e) {
      if (e.key === "Escape") close();
    }

    function open() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      if (closeBtn) closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      openBtn.focus();
      document.removeEventListener("keydown", onKeydown);
    }

    openBtn.addEventListener("click", open);

    if (closeBtn) closeBtn.addEventListener("click", close);

    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute("data-close") === "1") {
        close();
      }
    });
  }

  // ---------- Boot ----------
  onReady(() => {
  setSubnavHeightVar();
  window.addEventListener("resize", setSubnavHeightVar);

  initFadeInContainer();
  initCardFilters();
  initAvailabilityModal();
});


  // ---------- Optional: expose globally if you want ----------
  // You can call these from other pages manually if needed:
  window.WeddingSite = window.WeddingSite || {};
  window.WeddingSite.initFadeInContainer = initFadeInContainer;
  window.WeddingSite.initCardFilters = initCardFilters;
  window.WeddingSite.initAvailabilityModal = initAvailabilityModal;
})();
