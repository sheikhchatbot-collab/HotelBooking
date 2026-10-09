/* StayEase – front-end logic (no backend; data kept in localStorage) */
(function () {
  "use strict";

  // ---------- helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + n.toFixed(2).replace(/\.00$/, "");
  const DAY = 86400000;

  function toISO(d) {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
  }
  function parseISO(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function nightsBetween(a, b) {
    return Math.round((parseISO(b) - parseISO(a)) / DAY);
  }
  function fmtDate(s) {
    return parseISO(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
  }
  function gradient(h) {
    return `linear-gradient(135deg, hsl(${h} 60% 32%), hsl(${(h + 40) % 360} 65% 52%))`;
  }

  // ---------- state ----------
  const state = {
    search: { dest: "", checkin: "", checkout: "", guests: 2 },
    filters: { maxPrice: 350, minRating: 0, types: [], amenities: [] },
    sort: "recommended",
    favorites: load("stayease_favs", []),
    bookings: load("stayease_bookings", []),
    view: "home",
    lastFocus: null
  };

  // ---------- toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ---------- views ----------
  function showView(name) {
    state.view = name;
    $$(".view").forEach((v) => (v.hidden = v.id !== "view-" + name));
    $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    if (name === "saved") renderSaved();
    if (name === "bookings") renderBookings();
    window.scrollTo({ top: 0 });
  }

  function updateBadges() {
    const s = $("#saved-count"), b = $("#bookings-count");
    s.textContent = state.favorites.length || "";
    b.textContent = state.bookings.filter((x) => x.status === "confirmed").length || "";
  }

  // ---------- filtering ----------
  function getResults() {
    const { dest } = state.search;
    const { guests } = state.search;
    const f = state.filters;
    const q = dest.trim().toLowerCase();

    let list = HOTELS.filter((h) => {
      if (q && !(h.city.toLowerCase().includes(q) || h.name.toLowerCase().includes(q) || h.country.toLowerCase().includes(q))) return false;
      if (h.price > f.maxPrice) return false;
      if (h.rating < f.minRating) return false;
      if (f.types.length && !f.types.includes(h.type)) return false;
      if (f.amenities.length && !f.amenities.every((a) => h.amenities.includes(a))) return false;
      if (!h.rooms.some((r) => r.capacity >= guests)) return false;
      return true;
    });

    switch (state.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews); break;
      default: list.sort((a, b) => b.rating * Math.log(b.reviews + 1) - a.rating * Math.log(a.reviews + 1));
    }
    return list;
  }

  // ---------- rendering: cards ----------
  function cardHTML(h) {
    const fav = state.favorites.includes(h.id);
    return `
      <article class="card" data-id="${h.id}">
        <div class="card-img" style="background:${h.image ? `url('${h.image}') center/cover no-repeat` : gradient(h.hue)}">
          <span class="type-tag">${esc(h.type)}</span>
          <button class="fav ${fav ? "on" : ""}" data-fav="${h.id}" aria-label="${fav ? "Remove from saved" : "Save hotel"}" aria-pressed="${fav}">${fav ? "♥" : "♡"}</button>
          ${esc(h.city)}
        </div>
        <div class="card-body">
          <h3>${esc(h.name)}</h3>
          <p class="loc">${esc(h.city)}, ${esc(h.country)}</p>
          <div class="rating"><b>${h.rating.toFixed(1)}</b> <span>${h.reviews.toLocaleString()} reviews</span></div>
          <div class="tags">${h.amenities.slice(0, 4).map((a) => `<span class="tag">${esc(a)}</span>`).join("")}</div>
          <div class="card-foot">
            <div class="price">${money(h.price)} <small>/ night</small></div>
            <button class="btn btn-brand" data-details="${h.id}">View</button>
          </div>
        </div>
      </article>`;
  }

  function renderResults() {
    const list = getResults();
    $("#hotel-grid").innerHTML = list.map(cardHTML).join("");
    $("#empty-state").hidden = list.length > 0;
    const where = state.search.dest.trim();
    $("#results-count").textContent = `${list.length} stay${list.length === 1 ? "" : "s"} found${where ? ` for "${where}"` : ""}`;
  }

  function renderSaved() {
    const list = HOTELS.filter((h) => state.favorites.includes(h.id));
    $("#saved-grid").innerHTML = list.map(cardHTML).join("");
    $("#saved-empty").hidden = list.length > 0;
  }

  // ---------- rendering: bookings ----------
  function renderBookings() {
    const list = [...state.bookings].sort((a, b) => b.createdAt - a.createdAt);
    $("#bookings-empty").hidden = list.length > 0;
    $("#bookings-list").innerHTML = list.map((b) => {
      const h = HOTELS.find((x) => x.id === b.hotelId);
      const hue = h ? h.hue : 200;
      const cancelled = b.status === "cancelled";
      return `
        <article class="booking ${cancelled ? "is-cancelled" : ""}">
          <div class="thumb" style="background:${gradient(hue)}"></div>
          <div>
            <h3>${esc(b.hotelName)} <span class="status ${b.status}">${cancelled ? "Cancelled" : "Confirmed"}</span></h3>
            <p>${esc(b.roomName)} · ${b.guests} guest${b.guests > 1 ? "s" : ""}</p>
            <p>${fmtDate(b.checkin)} → ${fmtDate(b.checkout)} (${b.nights} night${b.nights > 1 ? "s" : ""})</p>
            <p>Ref: <strong>${esc(b.ref)}</strong> · Guest: ${esc(b.name)}</p>
          </div>
          <div class="booking-side">
            <strong>${money(b.total)}</strong>
            ${cancelled ? "" : `<button class="btn btn-danger" data-cancel="${esc(b.ref)}">Cancel booking</button>`}
          </div>
        </article>`;
    }).join("");
  }

  // ---------- modals ----------
  function openModal(id) {
    state.lastFocus = document.activeElement;
    const m = $(id);
    m.hidden = false;
    document.body.style.overflow = "hidden";
    const focusable = $("button, input, textarea", m.querySelector(".modal-card"));
    if (focusable) focusable.focus();
  }
  function closeModal(m) {
    m.hidden = true;
    if ($$(".modal").every((x) => x.hidden)) document.body.style.overflow = "";
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }
  function closeAllModals() { $$(".modal").forEach((m) => (m.hidden = true)); document.body.style.overflow = ""; }

  function openHotel(id) {
    const h = HOTELS.find((x) => x.id === id);
    if (!h) return;
    const { checkin, checkout, guests } = state.search;
    const nights = nightsBetween(checkin, checkout);
    const fav = state.favorites.includes(h.id);

    $("#hotel-detail").innerHTML = `
      <div class="detail-hero" style="background:${gradient(h.hue)}"><h2 id="hotel-title">${esc(h.name)}</h2></div>
      <div class="detail-body">
        <div class="detail-meta">
          <span>${esc(h.city)}, ${esc(h.country)}</span>
          <span class="rating"><b>${h.rating.toFixed(1)}</b> ${h.reviews.toLocaleString()} reviews</span>
          <span class="tag">${esc(h.type)}</span>
          <button class="btn btn-outline" data-fav="${h.id}" data-in-modal="1">${fav ? "♥ Saved" : "♡ Save"}</button>
        </div>
        <p>${esc(h.description)}</p>
        <div class="tags">${h.amenities.map((a) => `<span class="tag">${esc(a)}</span>`).join("")}</div>
        <div class="stay-info">
          <span><strong>Check-in:</strong> ${fmtDate(checkin)}</span>
          <span><strong>Check-out:</strong> ${fmtDate(checkout)}</span>
          <span><strong>Nights:</strong> ${nights}</span>
          <span><strong>Guests:</strong> ${guests}</span>
        </div>
        <h3>Choose a room</h3>
        ${h.rooms.map((r) => {
          const small = r.capacity < guests;
          return `
          <div class="room ${small ? "too-small" : ""}">
            <div>
              <h4>${esc(r.name)}</h4>
              <p>${esc(r.beds)} · Sleeps ${r.capacity}</p>
              ${small ? `<span class="note-warn">Too small for ${guests} guests</span>` : ""}
            </div>
            <div class="room-right">
              <div class="price">${money(r.price)} <small>/ night</small><br><small>${money(r.price * nights)} for ${nights} night${nights > 1 ? "s" : ""}</small></div>
              <button class="btn btn-primary" data-book="${h.id}|${r.id}" ${small ? "disabled" : ""}>Book</button>
            </div>
          </div>`;
        }).join("")}
      </div>`;
    openModal("#modal-hotel");
  }

  function openBooking(hotelId, roomId) {
    const h = HOTELS.find((x) => x.id === hotelId);
    const r = h && h.rooms.find((x) => x.id === roomId);
    if (!r) return;
    const { checkin, checkout, guests } = state.search;
    const nights = nightsBetween(checkin, checkout);
    const sub = r.price * nights;
    const tax = sub * TAX_RATE;
    const total = sub + tax;

    $("#book-content").innerHTML = `
      <h2 id="book-title">Complete your booking</h2>
      <p><strong>${esc(h.name)}</strong> · ${esc(r.name)}</p>
      <div class="summary">
        <div class="row"><span>${fmtDate(checkin)} → ${fmtDate(checkout)}</span><span>${nights} night${nights > 1 ? "s" : ""}</span></div>
        <div class="row"><span>${money(r.price)} × ${nights} night${nights > 1 ? "s" : ""}</span><span>${money(sub)}</span></div>
        <div class="row"><span>Taxes &amp; fees (${Math.round(TAX_RATE * 100)}%)</span><span>${money(tax)}</span></div>
        <div class="row total"><span>Total</span><span>${money(total)}</span></div>
      </div>
      <form id="book-form" novalidate>
        <div class="field" data-f="name"><label for="b-name">Full name</label><input id="b-name" type="text" autocomplete="name"><span class="err"></span></div>
        <div class="field" data-f="email"><label for="b-email">Email</label><input id="b-email" type="email" autocomplete="email"><span class="err"></span></div>
        <div class="field" data-f="phone"><label for="b-phone">Phone</label><input id="b-phone" type="tel" autocomplete="tel" placeholder="+92 300 1234567"><span class="err"></span></div>
        <div class="field" data-f="notes"><label for="b-notes">Special requests (optional)</label><textarea id="b-notes" rows="2"></textarea></div>
        <div class="actions">
          <button type="button" class="btn btn-outline" data-close>Cancel</button>
          <button type="submit" class="btn btn-brand">Confirm booking</button>
        </div>
      </form>`;

    closeAllModals();
    openModal("#modal-book");

    $("#book-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = {
        name: $("#b-name").value.trim(),
        email: $("#b-email").value.trim(),
        phone: $("#b-phone").value.trim(),
        notes: $("#b-notes").value.trim()
      };
      const errors = {};
      if (v.name.length < 2) errors.name = "Please enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "Enter a valid email address.";
      if (!/^[+\d][\d\s\-()]{6,}$/.test(v.phone)) errors.phone = "Enter a valid phone number.";

      $$(".field", e.target).forEach((f) => {
        const key = f.dataset.f;
        f.classList.toggle("invalid", !!errors[key]);
        const err = $(".err", f);
        if (err) err.textContent = errors[key] || "";
      });
      if (Object.keys(errors).length) return;

      const booking = {
        ref: "SE" + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2, 4).toUpperCase(),
        hotelId: h.id, hotelName: h.name, roomId: r.id, roomName: r.name,
        checkin, checkout, nights, guests,
        name: v.name, email: v.email, phone: v.phone, notes: v.notes,
        subtotal: sub, tax, total,
        status: "confirmed", createdAt: Date.now()
      };
      state.bookings.push(booking);
      save("stayease_bookings", state.bookings);
      updateBadges();
      showConfirmation(booking);
    });
  }

  function showConfirmation(b) {
    $("#book-content").innerHTML = `
      <div class="confirm">
        <div class="check">✓</div>
        <h2 id="book-title">Booking confirmed!</h2>
        <p>Thanks, ${esc(b.name)}. A confirmation would be sent to <strong>${esc(b.email)}</strong>.</p>
        <div class="ref">${esc(b.ref)}</div>
        <p>${esc(b.hotelName)} · ${esc(b.roomName)}<br>${fmtDate(b.checkin)} → ${fmtDate(b.checkout)} · ${money(b.total)}</p>
        <div class="actions" style="justify-content:center">
          <button class="btn btn-outline" data-close>Close</button>
          <button class="btn btn-brand" data-goto-bookings>View my bookings</button>
        </div>
      </div>`;
  }

  // ---------- actions ----------
  function toggleFav(id) {
    const i = state.favorites.indexOf(id);
    if (i >= 0) { state.favorites.splice(i, 1); toast("Removed from saved"); }
    else { state.favorites.push(id); toast("Saved to your list"); }
    save("stayease_favs", state.favorites);
    updateBadges();
    if (state.view === "saved") renderSaved(); else renderResults();
  }

  function cancelBooking(ref) {
    const b = state.bookings.find((x) => x.ref === ref);
    if (!b) return;
    if (!confirm(`Cancel your booking at ${b.hotelName}?`)) return;
    b.status = "cancelled";
    save("stayease_bookings", state.bookings);
    updateBadges();
    renderBookings();
    toast("Booking cancelled");
  }

  // ---------- search form ----------
  function setupDates() {
    const today = new Date();
    const min = toISO(today);
    const ci = $("#s-checkin"), co = $("#s-checkout");
    ci.min = min;
    ci.value = toISO(new Date(today.getTime() + DAY));
    co.value = toISO(new Date(today.getTime() + 3 * DAY));
    co.min = toISO(new Date(today.getTime() + DAY * 2));
    state.search.checkin = ci.value;
    state.search.checkout = co.value;

    ci.addEventListener("change", () => {
      if (!ci.value) return;
      const next = toISO(new Date(parseISO(ci.value).getTime() + DAY));
      co.min = next;
      if (!co.value || co.value < next) co.value = next;
    });
  }

  function submitSearch(e) {
    e.preventDefault();
    const err = $("#search-error");
    const ci = $("#s-checkin").value, co = $("#s-checkout").value;
    const guests = parseInt($("#s-guests").value, 10);
    err.textContent = "";

    if (!ci || !co) { err.textContent = "Please choose check-in and check-out dates."; return; }
    if (ci < toISO(new Date())) { err.textContent = "Check-in can't be in the past."; return; }
    if (co <= ci) { err.textContent = "Check-out must be after check-in."; return; }
    if (!guests || guests < 1 || guests > 10) { err.textContent = "Guests must be between 1 and 10."; return; }

    state.search = { dest: $("#s-dest").value, checkin: ci, checkout: co, guests };
    renderResults();
    $(".results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- filters ----------
  function buildFilters() {
    $("#f-types").innerHTML = ALL_TYPES.map((t) => `<label><input type="checkbox" value="${t}" data-ftype> ${t}</label>`).join("");
    $("#f-amenities").innerHTML = ALL_AMENITIES.map((a) => `<label><input type="checkbox" value="${a}" data-famenity> ${a}</label>`).join("");
    const cities = [...new Set(HOTELS.map((h) => h.city))].sort();
    $("#city-list").innerHTML = cities.map((c) => `<option value="${esc(c)}">`).join("");
  }

  function readFilters() {
    state.filters.maxPrice = Number($("#f-price").value);
    state.filters.minRating = Number($("#f-rating").value);
    state.filters.types = $$("[data-ftype]:checked").map((i) => i.value);
    state.filters.amenities = $$("[data-famenity]:checked").map((i) => i.value);
    $("#f-price-val").textContent = "$" + state.filters.maxPrice;
    renderResults();
  }

  function resetFilters() {
    $("#f-price").value = 350;
    $("#f-rating").value = 0;
    $$("[data-ftype], [data-famenity]").forEach((i) => (i.checked = false));
    $("#s-dest").value = "";
    state.search.dest = "";
    readFilters();
  }

  // ---------- events ----------
  function bindEvents() {
    $("#search-form").addEventListener("submit", submitSearch);
    $("#f-price").addEventListener("input", readFilters);
    $("#f-rating").addEventListener("change", readFilters);
    $("#f-types").addEventListener("change", readFilters);
    $("#f-amenities").addEventListener("change", readFilters);
    $("#reset-filters").addEventListener("click", resetFilters);
    $("#empty-reset").addEventListener("click", resetFilters);
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderResults(); });
    $("#logo-link").addEventListener("click", (e) => { e.preventDefault(); showView("home"); });

    // Delegated clicks
    document.addEventListener("click", (e) => {
      const t = e.target;

      const nav = t.closest("[data-view]");
      if (nav) { closeAllModals(); showView(nav.dataset.view); return; }

      const fav = t.closest("[data-fav]");
      if (fav) {
        e.stopPropagation();
        const id = Number(fav.dataset.fav);
        toggleFav(id);
        if (fav.dataset.inModal) {
          const on = state.favorites.includes(id);
          fav.textContent = on ? "♥ Saved" : "♡ Save";
        }
        return;
      }

      const det = t.closest("[data-details]");
      if (det) { openHotel(Number(det.dataset.details)); return; }

      const card = t.closest(".card");
      if (card && !t.closest("button")) { openHotel(Number(card.dataset.id)); return; }

      const book = t.closest("[data-book]");
      if (book) {
        const [hid, rid] = book.dataset.book.split("|");
        openBooking(Number(hid), rid);
        return;
      }

      const cancel = t.closest("[data-cancel]");
      if (cancel) { cancelBooking(cancel.dataset.cancel); return; }

      if (t.closest("[data-goto-bookings]")) { closeAllModals(); showView("bookings"); return; }

      if (t.closest("[data-close]")) {
        const m = t.closest(".modal");
        if (m) closeModal(m);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const open = $$(".modal").filter((m) => !m.hidden).pop();
        if (open) closeModal(open);
      }
    });
  }

  // ---------- init ----------
  function init() {
    $("#year").textContent = new Date().getFullYear();
    buildFilters();
    setupDates();
    bindEvents();
    updateBadges();
    renderResults();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
