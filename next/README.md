# Bureau des Athlètes — site Next.js + back office

Nouveau site (en parallèle du site statique à la racine du dépôt).

- **Site public** : accueil, à propos, athlètes, actualités, calendrier, contact, pages d'événements avec formulaire d'inscription.
- **Back office** (`/admin`) : événements + constructeur de formulaires, inscriptions (statuts, paiements, pièces jointes, export CSV), actualités, calendrier, athlètes, bureau, messages, utilisateurs, réglages.
- **Stack** : Next.js (App Router), Tailwind CSS 4 + daisyUI 5 (thèmes `fibad-dark` et `fibad-light`), icônes lucide-react, PostgreSQL (`pg`), sessions signées (`jose`), mots de passe hachés (`bcryptjs`).

## Déploiement sur Vercel

1. Vercel → **Add New → Project** → importer ce dépôt → **Root Directory : `next`**.
2. **Storage → Create Database → Neon** (nouvelle base) → la connecter à ce projet (crée `DATABASE_URL`).
3. **Settings → Environment Variables** :
   - `AUTH_SECRET` : une longue chaîne aléatoire (32 caractères ou plus) ;
   - `ADMIN_EMAIL` et `ADMIN_PASSWORD` : le premier compte administrateur, créé automatiquement au premier démarrage si aucun compte n'existe (mot de passe : 8 caractères minimum).
4. Déployer. Au premier accès, les tables sont créées et le contenu de départ (bureau, 3 événements et leurs formulaires…) est ajouté.
5. Se connecter sur `/admin/login`, puis créer les autres comptes dans **Utilisateurs**.

## Rôles

- **Administrateur** : tout, y compris inscriptions (données personnelles et médicales), messages, utilisateurs, réglages.
- **Éditeur** : événements, actualités, calendrier, athlètes, bureau. Pas d'accès aux inscriptions ni aux messages.

## Développement local

```bash
cd next
npm install
DATABASE_URL=postgres://… AUTH_SECRET=… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run dev
```

## Notes

- Les affiches des événements de départ sont dans `public/posters/`. Les images téléversées depuis le back office sont stockées dans la base (limite 3 Mo, réduites automatiquement).
- Les pièces jointes des inscriptions (ex. preuve de paiement) sont **privées** : visibles uniquement par les administrateurs connectés.
- Limite de tentatives de connexion : 6 par 10 minutes (par instance serveur).
