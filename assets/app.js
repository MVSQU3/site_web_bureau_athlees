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
  $("#news-list").innerHTML = news.map((n) => `<article class="card"><p class="date">${fmt(n.date)}</p><h3>${esc(n.titre)}</h3><p>${esc(n.texte)}</p></article>`).join("");
  $("#cal-list").innerHTML = cal.map(calItem).join("");

  // Formulaire : validation puis ouverture du client mail
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, msg = $("#form-msg");
    if (!f.checkValidity()) { msg.className = "msg err"; msg.textContent = "Merci de remplir tous les champs avec un e-mail valide."; return; }
    const body = `${f.message.value}\n\n— ${f.nom.value} (${f.email.value})`;
    window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(f.objet.value)}&body=${encodeURIComponent(body)}`;
    msg.className = "msg ok"; msg.textContent = "Merci ! Votre messagerie s'ouvre pour finaliser l'envoi.";
    f.reset();
  });

  // Navigation par onglets (hash)
  const pages = ["accueil", "apropos", "athletes", "actualites", "calendrier", "contact"];
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
