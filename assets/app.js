(() => {
  const S = window.SITE,
    $ = (s) => document.querySelector(s);
  const esc = (t) =>
    String(t).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const d = (iso) => new Date(iso + "T00:00:00");
  const fmt = (iso) =>
    d(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const initials = (n) =>
    n
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Textes généraux
  if ($("#brand-name")) $("#brand-name").textContent = S.nom; // facultatif (retiré de la nav)
  $("#hero-sub").textContent = `${S.nom} · ${S.sousTitre}`;
  $("#foot-txt").textContent =
    `© ${today.getFullYear()} ${S.nom} — ${S.sousTitre}`;
  $("#contact-info").innerHTML =
    `${esc(S.email)}<br><a href="tel:${esc(S.telephone.replace(/\s/g, ""))}">${esc(S.telephone)}</a>${S.telephone2 ? "<br>" + `<a href="tel:${esc(S.telephone2.replace(/\s/g, ""))}">${esc(S.telephone2)}</a>` : ""}<br>${esc(S.adresse)}`;

  // Accueil
  $("#stats").innerHTML = S.chiffres
    .map(
      (c) =>
        `<div class="stat"><b>${esc(c.valeur)}</b><span>${esc(c.label)}</span></div>`,
    )
    .join("");
  const news = [...S.actualites].sort((a, b) => b.date.localeCompare(a.date));
  const newsCard = (n) =>
    `<a class="card" href="#actualites"><p class="date">${fmt(n.date)}</p><h3>${esc(n.titre)}</h3><p>${esc(n.texte)}</p></a>`;
  $("#home-news").innerHTML = news.slice(0, 3).map(newsCard).join("");
  const cal = [...S.calendrier].sort((a, b) => a.date.localeCompare(b.date));
  const calItem = (e) => {
    const dt = d(e.date);
    return `<div class="card item hover ${dt < today ? "past" : ""}"><div class="cal-d"><b>${dt.getDate()}</b><span>${dt.toLocaleDateString("fr-FR", { month: "short" })} ${dt.getFullYear()}</span></div><div><h3>${esc(e.titre)}</h3><p>${esc(e.lieu)}</p></div></div>`;
  };
  const next = cal.find((e) => d(e.date) >= today);
  $("#home-next").innerHTML = next
    ? calItem(next)
    : `<p class="empty">Aucune compétition programmée.</p>`;

  // Événements mis en avant
  const EVTS = [...(S.evenements || [])].sort((x, y) => x.debut.localeCompare(y.debut));
  const evt = (id) => EVTS.find((x) => x.id === id);
  const eventCard = (E) => {
    const open = E.limite ? d(E.limite) >= today : true;
    const tel = E.infoline ? `<li><b>Infoline</b><a href="tel:${esc(E.infoline.replace(/\s/g, ""))}">${esc(E.infoline)}</a></li>` : "";
    const bouton = !open ? `<span class="tag">Inscriptions closes</span>` : E.href ? `<a class="btn primary" href="${esc(E.href)}">S'inscrire ›</a>` : `<span class="tag">Formulaire d'inscription bientôt disponible</span>`;
    return `<article class="event">
      <a class="event-img" href="${esc(E.affiche)}" target="_blank" rel="noopener"><img src="${esc(E.affiche)}" alt="Affiche : ${esc(E.titre)}" loading="lazy"></a>
      <div class="event-body">
        <p class="eyebrow">Événement</p>
        <h2>${esc(E.titre)}</h2>
        <p>${esc(E.accroche)}</p>
        <ul class="event-facts"><li><b>Dates</b>${esc(E.dates)}</li><li><b>Lieu</b>${esc(E.lieu)}</li>${(E.extra || []).map(([k, v]) => `<li><b>${esc(k)}</b>${esc(v)}</li>`).join("")}${E.tarif ? `<li><b>Participation</b>${esc(E.tarif)}</li>` : ""}${E.limite ? `<li><b>Inscriptions</b>jusqu'au ${fmt(E.limite)}</li>` : ""}${tel}</ul>
        <div class="event-prog">${E.programme.map((p) => `<div><span class="date">${esc(p.jour)}</span><h3>${esc(p.discipline)}</h3><p>${p.tableaux.map(esc).join(" · ")}</p></div>`).join("")}</div>
        <div class="btns left">${bouton}</div>
      </div>
    </article>`;
  };
  const eventHtml = EVTS.map(eventCard).join("");
  $("#home-event").innerHTML = eventHtml;

  // À propos
  $("#valeurs").innerHTML = S.valeurs
    .map(
      (v) =>
        `<div class="card"><h3>${esc(v.titre)}</h3><p>${esc(v.texte)}</p></div>`,
    )
    .join("");
  $("#bureau").innerHTML = S.bureau
    .map(
      (m) =>
        `<div class="card"><div class="avatar">${initials(m.nom)}</div><h3>${esc(m.nom)}</h3><p>${esc(m.role)}</p></div>`,
    )
    .join("");

  // Athlètes (recherche + filtre)
  let genre = "all";
  const renderAthletes = () => {
    const q = $("#search").value.trim().toLowerCase();
    const list = S.athletes.filter(
      (a) =>
        (genre === "all" || a.genre === genre) &&
        (a.nom + " " + a.club + " " + a.categorie).toLowerCase().includes(q),
    );
    $("#athletes-list").innerHTML = list
      .map(
        (a) =>
          `<div class="card hover"><span class="rank">#${a.classement}</span><div class="avatar">${initials(a.nom)}</div><h3>${esc(a.nom)}</h3><p>${esc(a.club)}</p><span class="tag">${esc(a.categorie)}</span></div>`,
      )
      .join("");
    $("#athletes-empty").hidden = list.length > 0;
  };
  $("#search").addEventListener("input", renderAthletes);
  $("#seg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    genre = b.dataset.g;
    $("#seg")
      .querySelectorAll("button")
      .forEach((x) => x.classList.toggle("on", x === b));
    renderAthletes();
  });
  renderAthletes();

  // Actualités & calendrier
  $("#news-list").innerHTML =
    eventHtml +
    news
      .map(
        (n) =>
          `<article class="card"><p class="date">${fmt(n.date)}</p><h3>${esc(n.titre)}</h3><p>${esc(n.texte)}</p></article>`,
      )
      .join("");
  $("#cal-list").innerHTML = cal.map(calItem).join("");

  // Formulaire : enregistrement en base via /api/contact (repli : messagerie)
  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target,
      msg = $("#form-msg"),
      btn = f.querySelector("button");
    if (!f.checkValidity()) {
      msg.className = "msg err";
      msg.textContent =
        "Merci de remplir tous les champs avec un e-mail valide.";
      return;
    }
    const data = Object.fromEntries(new FormData(f));
    btn.disabled = true;
    msg.className = "msg";
    msg.textContent = "Envoi…";
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(r.status);
      msg.className = "msg ok";
      msg.textContent = "Merci ! Votre message a bien été envoyé.";
      f.reset();
    } catch {
      const body = `${data.message}\n\n— ${data.nom} (${data.email})`;
      window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(data.objet)}&body=${encodeURIComponent(body)}`;
      msg.className = "msg ok";
      msg.textContent = "Votre messagerie s'ouvre pour finaliser l'envoi.";
    } finally {
      btn.disabled = false;
    }
  });

  // Inscription au Championnat
  const E = evt("championnat");
  if (E) {
    const open = d(E.limite) >= today;
    $("#insc-titre").textContent = E.titre;
    $("#insc-info").textContent = open
      ? `${E.dates} · ${E.lieu}. Inscriptions jusqu'au ${fmt(E.limite)}.`
      : "Les inscriptions sont closes.";
    $("#insc-form").hidden = !open;
    const f = $("#insc-form"),
      msg = $("#insc-msg");
    const checked = (n) =>
      [...f.querySelectorAll(`[name=${n}]:checked`)].map((c) => c.value);
    const sync = () => {
      const comps = checked("competitions");
      f.querySelectorAll("[data-comp]").forEach((fs) => {
        fs.hidden = !comps.includes(fs.dataset.comp);
      });
      f.sexe_autre.disabled = checked("sexe")[0] !== "Autre";
    };
    f.addEventListener("change", sync);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const comps = checked("competitions");
      const data = {
        ...Object.fromEntries(new FormData(f)),
        competitions: comps,
        badminton: comps.includes("BADMINTON")
          ? checked("badminton")[0] || ""
          : "",
        parabadminton: comps.includes("PARABADMINTON")
          ? checked("parabadminton")[0] || ""
          : "",
        airbadminton: comps.includes("AIRBADMINTON")
          ? checked("airbadminton")
          : [],
      };
      if (!comps.includes("AIRBADMINTON")) data.partenaire = "";
      if (data.sexe === "Autre")
        data.sexe = `Autre : ${(data.sexe_autre || "").trim()}`;
      delete data.sexe_autre;
      const manque =
        !f.checkValidity() ||
        !comps.length ||
        (comps.includes("BADMINTON") && !data.badminton) ||
        (comps.includes("PARABADMINTON") && !data.parabadminton) ||
        (comps.includes("AIRBADMINTON") && !data.airbadminton.length) ||
        data.sexe === "Autre : ";
      if (manque) {
        msg.className = "msg err";
        msg.textContent =
          "Merci de répondre à toutes les questions obligatoires (*).";
        return;
      }
      const btn = f.querySelector("button");
      btn.disabled = true;
      msg.className = "msg";
      msg.textContent = "Envoi…";
      try {
        const r = await fetch("/api/inscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Erreur");
        msg.className = "msg ok";
        msg.textContent = `Merci ! Ton inscription est enregistrée. Infoline : ${E.infoline}.`;
        f.reset();
        sync();
      } catch (err) {
        msg.className = "msg err";
        msg.textContent = `Échec de l'envoi (${err.message}). Réessaie ou appelle l'Infoline : ${E.infoline}.`;
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Inscription à l'Open de l'amitié (paire, paiement, preuve)
  const O = evt("open");
  if (O) {
    const ouvert = d(O.limite) >= today;
    $("#open-titre").textContent = O.titre;
    $("#open-tarif").textContent = O.tarif;
    $("#open-help").innerHTML = `Une question ? Appelle l'Infoline : <a href="tel:${esc(O.infoline.replace(/\s/g, ""))}">${esc(O.infoline)}</a>`;
    $("#open-info").textContent = ouvert
      ? `${O.dates} · ${O.lieu}. Inscriptions jusqu'au ${fmt(O.limite)}.`
      : "Les inscriptions sont closes.";
    const f = $("#open-form"), msg = $("#open-msg");
    f.hidden = !ouvert;
    const wave = () => f.paiement.value.startsWith("Mobile");
    f.addEventListener("change", () => { $("#open-preuve").hidden = !wave(); });
    // Image : réduite et compressée (JPEG) ; PDF : envoyé tel quel (2 Mo max)
    const lire = (file) => new Promise((ok, ko) => {
      const fr = new FileReader();
      fr.onerror = () => ko(new Error("Fichier illisible"));
      fr.onload = () => {
        if (file.type === "application/pdf") return file.size <= 2e6 ? ok(fr.result) : ko(new Error("PDF trop lourd (2 Mo max)"));
        const img = new Image();
        img.onerror = () => ko(new Error("Image illisible"));
        img.onload = () => {
          const k = Math.min(1, 1400 / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL("image/jpeg", 0.8));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fichier = f.preuve.files[0];
      if (!f.checkValidity() || (wave() && !fichier)) { msg.className = "msg err"; msg.textContent = "Merci de répondre à toutes les questions obligatoires (*)" + (wave() && !fichier ? ", dont la preuve de paiement." : "."); return; }
      const btn = f.querySelector("button[type=submit]"); btn.disabled = true; msg.className = "msg"; msg.textContent = "Envoi…";
      try {
        const data = Object.fromEntries(new FormData(f));
        delete data.preuve; data.accepte = f.accepte.checked;
        if (wave()) data.preuve = await lire(fichier);
        const r = await fetch("/api/open", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Erreur");
        msg.className = "msg ok"; msg.textContent = `Merci ! L'inscription de la paire est enregistrée. Infoline : ${O.infoline}.`;
        f.reset(); $("#open-preuve").hidden = true;
      } catch (err) {
        msg.className = "msg err"; msg.textContent = `Échec de l'envoi (${err.message}). Réessaie ou appelle l'Infoline : ${O.infoline}.`;
      } finally { btn.disabled = false; }
    });
  }

  // Inscription au Camp d'entraînement
  const C = evt("camp");
  if (C) {
    const f = $("#camp-form");
    $("#camp-titre").textContent = C.titre;
    $("#camp-info").textContent = `${C.dates} · ${C.lieu}. Ouvert aux enfants, jeunes et adultes à partir de 7 ans. Les 40 premiers inscrits ont leur transport pris en charge par la FIBAD.`;
    const L = {
      pratique: ["Non, je suis débutant(e)", "Oui, occasionnellement", "Oui, régulièrement", "Joueur/Joueuse confirmé(e)"],
      duree: ["Moins de 1 an", "1 à 2 ans", "3 à 5 ans", "Plus de 5 ans"],
      objectifs: ["Découvrir le badminton", "Apprendre les bases techniques", "Améliorer mon niveau", "Préparer des compétitions", "Améliorer ma condition physique", "Me perfectionner techniquement et tactiquement"],
    };
    const inp = (name, label, o = {}) => `<label>${label}${o.req ? " *" : ""}<input name="${name}" type="${o.type || "text"}" ${o.req ? "required" : ""} ${o.minor ? 'data-minor="1"' : ""} ${o.ac ? `autocomplete="${o.ac}"` : ""}></label>`;
    const grp = (title, body, o = {}) => `<fieldset class="tabl" ${o.id ? `id="${o.id}"` : ""} ${o.hidden ? "hidden" : ""}><legend>${title}</legend>${o.note ? `<p class="meta">${o.note}</p>` : ""}${body}</fieldset>`;
    const radios = (name, vals, req = true, extra = "") => `<div class="opts">${vals.map((v) => `<label class="chk"><input type="radio" name="${name}" value="${esc(v)}" ${req ? "required" : ""}> ${esc(v)}</label>`).join("")}${extra}</div>`;
    const autreRadio = (name, ph = "Préciser") => `<label class="chk"><input type="radio" name="${name}" value="Autre" required> Autre :</label><input name="${name}_autre" class="inline" aria-label="${ph}" disabled>`;
    const nonOui = (name, label) => grp(label, `<div class="opts"><label class="chk"><input type="radio" name="${name}" value="Non" required> Non</label><label class="chk"><input type="radio" name="${name}" value="Oui" required> Oui</label><input name="${name}_detail" class="inline" placeholder="Précisez" aria-label="Précisez" disabled></div>`);
    f.innerHTML = [
      `<h3 class="sub">1. Participant</h3>`,
      `<div class="row">${inp("nom", "Nom", { req: 1, ac: "family-name" })}${inp("prenoms", "Prénom(s)", { req: 1, ac: "given-name" })}</div>`,
      `<div class="row">${inp("naissance", "Date de naissance", { req: 1, type: "date" })}<label>Âge<input id="camp-age" readonly tabindex="-1" placeholder="calculé automatiquement"></label></div>`,
      grp("Sexe *", radios("sexe", ["Masculin", "Féminin"])),
      `<div class="row">${inp("telephone", "Téléphone du participant", { type: "tel" })}${inp("adresse", "Adresse / Commune", { req: 1 })}</div>`,
      grp("2. Parent / tuteur *", `<div class="form">${inp("parent_nom", "Nom et prénom du parent / tuteur", { minor: 1 })}
        <div class="opts">${["Père", "Mère", "Tuteur légal"].map((v) => `<label class="chk"><input type="radio" name="parent_lien" value="${v}" data-minor="1"> ${v}</label>`).join("")}<label class="chk"><input type="radio" name="parent_lien" value="Autre" data-minor="1"> Autre :</label><input name="parent_lien_autre" class="inline" aria-label="Lien" disabled></div>
        <div class="row">${inp("parent_tel", "Téléphone", { type: "tel", minor: 1 })}${inp("parent_whatsapp", "WhatsApp", { type: "tel" })}</div>${inp("parent_adresse", "Adresse", { minor: 1 })}</div>`, { id: "camp-parent", hidden: 1, note: "Obligatoire pour les participants de moins de 18 ans." }),
      `<h3 class="sub">2. Niveau de pratique</h3>`,
      grp("Avez-vous déjà pratiqué le badminton ? *", radios("pratique", L.pratique)),
      grp("Depuis combien de temps pratiquez-vous ? *", radios("duree", L.duree), { id: "camp-duree", hidden: 1 }),
      inp("club", "Club / structure actuelle (si applicable)"),
      `<h3 class="sub">3. Objectifs du camp</h3>`,
      grp("Pourquoi souhaitez-vous participer au camp ? *", `<div class="opts col">${L.objectifs.map((v) => `<label class="chk"><input type="checkbox" name="objectifs" value="${esc(v)}"> ${esc(v)}</label>`).join("")}<div class="opts"><label class="chk"><input type="checkbox" name="objectifs" value="Autre"> Autre :</label><input name="objectifs_autre" class="inline" aria-label="Autre objectif" disabled></div></div>`),
      `<h3 class="sub">4. Informations sportives</h3>`,
      grp("Avez-vous une expérience en compétition ? *", radios("competition", ["Oui", "Non"])),
      `<div id="camp-niveau" hidden>${inp("competition_niveau", "Si oui, précisez votre niveau")}</div>`,
      grp("Main dominante *", radios("main", ["Droite", "Gauche"])),
      inp("categorie", "Catégorie / niveau actuel (si connu)"),
      `<h3 class="sub">5. Informations médicales</h3><p class="meta">Ces informations sont communiquées de manière confidentielle à l'encadrement.</p>`,
      nonOui("medical", "Le participant présente-t-il une condition particulière dont les encadreurs doivent être informés ? *"),
      nonOui("allergies", "Allergies connues *"),
      nonOui("traitement", "Traitement médical particulier à signaler *"),
      `<h3 class="sub">6. Personne à contacter en cas d'urgence</h3>`,
      `<div class="row">${inp("urgence_nom", "Nom et prénom", { req: 1 })}${inp("urgence_lien", "Lien avec le participant", { req: 1 })}</div>`,
      `<div class="row">${inp("urgence_tel", "Téléphone principal", { req: 1, type: "tel" })}${inp("urgence_tel2", "Téléphone secondaire", { type: "tel" })}</div>`,
      grp("8. Autorisation parentale *", `<p class="meta" id="camp-autor-txt"></p>${radios("autorisation", ["J'accepte", "Je n'accepte pas"], false)}`, { id: "camp-autor", hidden: 1, note: "Obligatoire pour les participants mineurs." }),
      `<h3 class="sub">7. Droit à l'image</h3>`,
      grp("J'autorise l'utilisation de l'image du participant dans les supports de communication de l'organisation (photos et vidéos du camp) *", radios("image", ["Oui", "Non"])),
      `<label class="chk"><input type="checkbox" name="engagement" required> Je certifie que les informations fournies dans ce formulaire sont exactes et m'engage à respecter les règles et consignes de sécurité du camp. *</label>`,
      `<input name="site" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">`,
      `<p id="camp-help" class="meta"></p>`,
      `<button class="btn primary" type="submit">Valider l'inscription</button><p class="msg" id="camp-msg" role="status"></p>`,
    ].join("");
    const tel = C.infoline.replace(/\s/g, "");
    $("#camp-help").innerHTML = `Besoin d'aide ? Infoline / WhatsApp : <a href="tel:${esc(tel)}">${esc(C.infoline)}</a>`;
    const m = $("#camp-msg"), val = (n) => (f.querySelector(`[name=${n}]:checked`) || {}).value || "";
    let mineur = false, ageOk = false;
    const sync = () => {
      const v = f.naissance.value, n = v ? new Date(v + "T00:00:00") : null;
      const ref = d(C.debut), age = n ? ref.getFullYear() - n.getFullYear() - (ref < new Date(ref.getFullYear(), n.getMonth(), n.getDate()) ? 1 : 0) : null;
      ageOk = age !== null && age >= 7 && age <= 100; mineur = ageOk && age < 18;
      $("#camp-age").value = age === null ? "" : age < 7 ? `${age} ans (minimum 7 ans)` : `${age} ans`;
      [["#camp-parent", mineur], ["#camp-autor", mineur], ["#camp-duree", val("pratique") && val("pratique") !== L.pratique[0]], ["#camp-niveau", val("competition") === "Oui"]].forEach(([s, on]) => { $(s).hidden = !on; });
      f.querySelectorAll("[data-minor]").forEach((e) => { e.required = mineur && (e.type === "radio" || !e.name.endsWith("whatsapp")); });
      f.querySelectorAll("[name=autorisation]").forEach((e) => { e.required = mineur; });
      f.querySelectorAll("[name=duree]").forEach((e) => { e.required = !$("#camp-duree").hidden; });
      if (mineur) $("#camp-autor-txt").textContent = `Je soussigné(e) ${f.parent_nom.value || "…"}, parent / tuteur, autorise mon enfant ${[f.prenoms.value, f.nom.value].join(" ").trim() || "…"} à participer au Camp d'entraînement de badminton, et autorise l'équipe d'encadrement à prendre les dispositions nécessaires en cas d'urgence et à contacter la personne indiquée dans ce formulaire.`;
      [["parent_lien", "parent_lien_autre"], ["objectifs", "objectifs_autre"]].forEach(([g, a]) => { f[a].disabled = !f.querySelector(`[name=${g}][value=Autre]:checked`); if (f[a].disabled) f[a].value = ""; });
      ["medical", "allergies", "traitement"].forEach((g) => { const x = f[g + "_detail"]; x.disabled = val(g) !== "Oui"; if (x.disabled) x.value = ""; });
    };
    f.addEventListener("input", sync); f.addEventListener("change", sync); sync();
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      sync();
      const err = (t) => { m.className = "msg err"; m.textContent = t; m.scrollIntoView({ block: "center" }); };
      if (!ageOk) return err("Le camp est ouvert à partir de 7 ans : vérifie la date de naissance.");
      const obj = [...f.querySelectorAll("[name=objectifs]:checked")].map((c) => c.value === "Autre" ? `Autre : ${f.objectifs_autre.value.trim()}` : c.value);
      if (!f.checkValidity() || !obj.length || obj.includes("Autre : ") || (mineur && val("parent_lien") === "Autre" && !f.parent_lien_autre.value.trim()) || ["medical", "allergies", "traitement"].some((g) => val(g) === "Oui" && !f[g + "_detail"].value.trim())) return err("Merci de répondre à toutes les questions obligatoires (*).");
      if (mineur && val("autorisation") !== "J'accepte") return err("L'autorisation parentale est nécessaire pour inscrire un mineur.");
      const data = Object.fromEntries(new FormData(f));
      ["parent_lien_autre", "objectifs_autre", "medical_detail", "allergies_detail", "traitement_detail"].forEach((k) => delete data[k]);
      if (data.parent_lien === "Autre") data.parent_lien = `Autre : ${f.parent_lien_autre.value.trim()}`;
      ["medical", "allergies", "traitement"].forEach((g) => { if (data[g] === "Oui") data[g] = `Oui : ${f[g + "_detail"].value.trim()}`; });
      Object.assign(data, { objectifs: obj, engagement: true });
      const btn = f.querySelector("button[type=submit]"); btn.disabled = true; m.className = "msg"; m.textContent = "Envoi…";
      try {
        const r = await fetch("/api/camp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Erreur");
        m.className = "msg ok"; m.textContent = "Merci pour ton inscription ! Sport • Discipline • Performance • Plaisir.";
        f.reset(); sync(); m.scrollIntoView({ block: "center" });
      } catch (x) {
        err(`Échec de l'envoi (${x.message}). Réessaie ou appelle l'Infoline : ${C.infoline}.`);
      } finally { btn.disabled = false; }
    });
  }

  // Thème clair / sombre
  const sun =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const root = document.documentElement,
    themeBtn = $("#theme");
  const paintTheme = () => {
    themeBtn.innerHTML = root.dataset.theme === "light" ? moon : sun;
  };
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("theme", root.dataset.theme);
    } catch (e) {}
    paintTheme();
  });
  paintTheme();

  // Navigation par onglets (hash)
  const pages = [
    "accueil",
    "apropos",
    "athletes",
    "actualites",
    "calendrier",
    "contact",
    "inscription",
    "open",
    "camp",
  ];
  const burger = $(".burger"),
    links = $(".links");
  const route = () => {
    const p = pages.includes(location.hash.slice(1))
      ? location.hash.slice(1)
      : "accueil";
    document
      .querySelectorAll(".page")
      .forEach((s) => s.classList.toggle("show", s.id === "page-" + p));
    links
      .querySelectorAll("a")
      .forEach((a) => a.classList.toggle("act", a.hash === "#" + p));
    links.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
  };
  burger.addEventListener("click", () => {
    const o = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(o));
  });
  window.addEventListener("hashchange", route);
  route();
})();
