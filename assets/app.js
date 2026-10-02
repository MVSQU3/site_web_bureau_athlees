(() => {
  const S = window.SITE, $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const d = (iso) => new Date(iso + "T00:00:00");
  const fmt = (iso) => d(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Textes généraux
  $("#brand-name").textContent = S.nom;
  $("#hero-sub").textContent = `${S.nom} · ${S.sousTitre}`;
  $("#foot-txt").textContent = `© ${today.getFullYear()} ${S.nom} — ${S.sousTitre}`;
  $("#contact-info").innerHTML = `${esc(S.email)}<br>${esc(S.telephone)}<br>${esc(S.adresse)}`;

  // Accueil
  $("#stats").innerHTML = S.chiffres.map((c) => `<div class="stat"><b>${esc(c.valeur)}</b><span>${esc(c.label)}</span></div>`).join("");
  const news = [...S.actualites].sort((a, b) => b.date.localeCompare(a.date));
  const newsCard = (n) => `<a class="card" href="#actualites"><p class="date">${fmt(n.date)}</p><h3>${esc(n.titre)}</h3><p>${esc(n.texte)}</p></a>`;
  $("#home-news").innerHTML = news.slice(0, 3).map(newsCard).join("");
  const cal = [...S.calendrier].sort((a, b) => a.date.localeCompare(b.date));
  const calItem = (e) => {
    const dt = d(e.date);
    return `<div class="card item hover ${dt < today ? "past" : ""}"><div class="cal-d"><b>${dt.getDate()}</b><span>${dt.toLocaleDateString("fr-FR", { month: "short" })} ${dt.getFullYear()}</span></div><div><h3>${esc(e.titre)}</h3><p>${esc(e.lieu)}</p></div></div>`;
  };
  const next = cal.find((e) => d(e.date) >= today);
  $("#home-next").innerHTML = next ? calItem(next) : `<p class="empty">Aucune compétition programmée.</p>`;

  // Événement mis en avant
  const E = S.evenement;
  let eventHtml = "";
  if (E) {
    const open = d(E.limite) >= today;
    eventHtml = `<article class="event">
      <a class="event-img" href="${esc(E.affiche)}" target="_blank" rel="noopener"><img src="${esc(E.affiche)}" alt="Affiche : ${esc(E.titre)}" loading="lazy"></a>
      <div class="event-body">
        <p class="eyebrow">Événement</p>
        <h2>${esc(E.titre)}</h2>
        <p>${esc(E.accroche)}</p>
        <ul class="event-facts"><li><b>Dates</b>${esc(E.dates)}</li><li><b>Lieu</b>${esc(E.lieu)}</li><li><b>Inscriptions</b>jusqu'au ${fmt(E.limite)}</li><li><b>Infoline</b><a href="tel:${esc(E.infoline.replace(/\s/g, ""))}">${esc(E.infoline)}</a></li></ul>
        <div class="event-prog">${E.programme.map((p) => `<div><span class="date">${esc(p.jour)}</span><h3>${esc(p.discipline)}</h3><p>${p.tableaux.map(esc).join(" · ")}</p></div>`).join("")}</div>
        <div class="btns left">${open ? `<a class="btn primary" href="#inscription">S'inscrire ›</a>` : `<span class="tag">Inscriptions closes</span>`}</div>
      </div>
    </article>`;
  }
  $("#home-event").innerHTML = eventHtml;

  // À propos
  $("#valeurs").innerHTML = S.valeurs.map((v) => `<div class="card"><h3>${esc(v.titre)}</h3><p>${esc(v.texte)}</p></div>`).join("");
  $("#bureau").innerHTML = S.bureau.map((m) => `<div class="card"><div class="avatar">${initials(m.nom)}</div><h3>${esc(m.nom)}</h3><p>${esc(m.role)}</p></div>`).join("");

  // Athlètes (recherche + filtre)
  let genre = "all";
  const renderAthletes = () => {
    const q = $("#search").value.trim().toLowerCase();
    const list = S.athletes.filter((a) => (genre === "all" || a.genre === genre) && (a.nom + " " + a.club + " " + a.categorie).toLowerCase().includes(q));
    $("#athletes-list").innerHTML = list.map((a) => `<div class="card hover"><span class="rank">#${a.classement}</span><div class="avatar">${initials(a.nom)}</div><h3>${esc(a.nom)}</h3><p>${esc(a.club)}</p><span class="tag">${esc(a.categorie)}</span></div>`).join("");
    $("#athletes-empty").hidden = list.length > 0;
  };
  $("#search").addEventListener("input", renderAthletes);
  $("#seg").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    genre = b.dataset.g;
    $("#seg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    renderAthletes();
  });
  renderAthletes();

  // Actualités & calendrier
  $("#news-list").innerHTML = eventHtml + news.map((n) => `<article class="card"><p class="date">${fmt(n.date)}</p><h3>${esc(n.titre)}</h3><p>${esc(n.texte)}</p></article>`).join("");
  $("#cal-list").innerHTML = cal.map(calItem).join("");

  // Formulaire : enregistrement en base via /api/contact (repli : messagerie)
  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = $("#form-msg"), btn = f.querySelector("button");
    if (!f.checkValidity()) { msg.className = "msg err"; msg.textContent = "Merci de remplir tous les champs avec un e-mail valide."; return; }
    const data = Object.fromEntries(new FormData(f));
    btn.disabled = true; msg.className = "msg"; msg.textContent = "Envoi…";
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(r.status);
      msg.className = "msg ok"; msg.textContent = "Merci ! Votre message a bien été envoyé.";
      f.reset();
    } catch {
      const body = `${data.message}\n\n— ${data.nom} (${data.email})`;
      window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(data.objet)}&body=${encodeURIComponent(body)}`;
      msg.className = "msg ok"; msg.textContent = "Votre messagerie s'ouvre pour finaliser l'envoi.";
    } finally { btn.disabled = false; }
  });

  // Inscription à l'événement
  if (E) {
    const open = d(E.limite) >= today;
    $("#insc-titre").textContent = E.titre;
    $("#insc-info").textContent = open ? `${E.dates} · ${E.lieu}. Inscriptions jusqu'au ${fmt(E.limite)}.` : "Les inscriptions sont closes.";
    $("#insc-form").hidden = !open;
    const f = $("#insc-form"), msg = $("#insc-msg");
    const checked = (n) => [...f.querySelectorAll(`[name=${n}]:checked`)].map((c) => c.value);
    const sync = () => {
      const comps = checked("competitions");
      f.querySelectorAll("[data-comp]").forEach((fs) => { fs.hidden = !comps.includes(fs.dataset.comp); });
      f.sexe_autre.disabled = checked("sexe")[0] !== "Autre";
    };
    f.addEventListener("change", sync);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const comps = checked("competitions");
      const data = {
        ...Object.fromEntries(new FormData(f)), competitions: comps,
        badminton: comps.includes("BADMINTON") ? checked("badminton")[0] || "" : "",
        parabadminton: comps.includes("PARABADMINTON") ? checked("parabadminton")[0] || "" : "",
        airbadminton: comps.includes("AIRBADMINTON") ? checked("airbadminton") : [],
      };
      if (!comps.includes("AIRBADMINTON")) data.partenaire = "";
      if (data.sexe === "Autre") data.sexe = `Autre : ${(data.sexe_autre || "").trim()}`;
      delete data.sexe_autre;
      const manque = !f.checkValidity() || !comps.length
        || (comps.includes("BADMINTON") && !data.badminton)
        || (comps.includes("PARABADMINTON") && !data.parabadminton)
        || (comps.includes("AIRBADMINTON") && !data.airbadminton.length)
        || data.sexe === "Autre : ";
      if (manque) { msg.className = "msg err"; msg.textContent = "Merci de répondre à toutes les questions obligatoires (*)."; return; }
      const btn = f.querySelector("button"); btn.disabled = true; msg.className = "msg"; msg.textContent = "Envoi…";
      try {
        const r = await fetch("/api/inscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Erreur");
        msg.className = "msg ok"; msg.textContent = `Merci ! Ton inscription est enregistrée. Infoline : ${E.infoline}.`;
        f.reset(); sync();
      } catch (err) {
        msg.className = "msg err"; msg.textContent = `Échec de l'envoi (${err.message}). Réessaie ou appelle l'Infoline : ${E.infoline}.`;
      } finally { btn.disabled = false; }
    });
  }

  // Thème clair / sombre
  const sun = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const root = document.documentElement, themeBtn = $("#theme");
  const paintTheme = () => { themeBtn.innerHTML = root.dataset.theme === "light" ? moon : sun; };
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  // Navigation par onglets (hash)
  const pages = ["accueil", "apropos", "athletes", "actualites", "calendrier", "contact", "inscription"];
  const burger = $(".burger"), links = $(".links");
  const route = () => {
    const p = pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : "accueil";
    document.querySelectorAll(".page").forEach((s) => s.classList.toggle("show", s.id === "page-" + p));
    links.querySelectorAll("a").forEach((a) => a.classList.toggle("act", a.hash === "#" + p));
    links.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
  };
  burger.addEventListener("click", () => {
    const o = links.classList.toggle("open"); burger.setAttribute("aria-expanded", String(o));
  });
  window.addEventListener("hashchange", route);
  route();
})();
