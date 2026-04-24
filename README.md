# Kolbotn Tennisklubb – Demo (PWA)

Mobil-vennlig demo av KTK-appen. Kan legges til på iPhone/Android hjem-skjerm
("Add to Home Screen") og oppfører seg som en ekte app.

## Filer

- `index.html` — selve appen
- `sw.js` — service worker (gjør appen offline-klar etter første besøk)
- `manifest.json` — PWA-konfig (navn, farger, ikoner)
- `icon-192.png`, `icon-512.png` — app-ikoner

---

## Slik publiserer du på Vercel (gratis, permanent URL)

### Steg 1 — Lag GitHub-repo

1. Gå til https://github.com/new
2. Repository name: `ktk-demo`
3. Visibility: **Public** (Vercel kan også deploye private, men public er enklest)
4. IKKE huk av "Add a README" (vi har allerede en)
5. Klikk **Create repository**

### Steg 2 — Last opp filene

På den nye repo-siden, klikk **uploading an existing file** (eller dra-og-slipp).

Last opp ALLE 5 filene fra denne mappen:
- `index.html`
- `sw.js`
- `manifest.json`
- `icon-192.png`
- `icon-512.png`
- (denne README-en, valgfritt)

Klikk **Commit changes**.

### Steg 3 — Koble til Vercel

1. Gå til https://vercel.com/signup og logg inn med GitHub-kontoen din
2. Klikk **Add New… → Project**
3. Finn `ktk-demo` i listen, klikk **Import**
4. La alt stå på standard, klikk **Deploy**
5. Vent ~30 sekunder

Vercel gir deg en URL som `https://ktk-demo.vercel.app` (eller `ktk-demo-xyz.vercel.app`).

### Steg 4 — Legg til på iPhone hjem-skjerm

1. Åpne URL-en i **Safari** på iPhone (må være Safari, ikke Chrome)
2. Trykk del-knappen (firkant med pil opp) nederst
3. Scroll ned og trykk **Legg til på Hjem-skjerm**
4. Navn: `KTK` (kommer automatisk)
5. Trykk **Legg til**

Nå har du KTK-appen som et ikon på telefonen — åpnes uten Safari-grensesnitt,
som en ekte app.

### Steg 5 — Android

På Android: åpne URL i Chrome → menyen (3 prikker) → **Legg til på startsiden**.

---

## Oppdateringer

Hvis du endrer noe i `index.html`:
1. Last opp ny versjon til GitHub (samme repo, "Add file → Upload")
2. Vercel deployer automatisk på under 1 minutt
3. Refresh appen på telefonen

---

## Egen URL (valgfritt)

Hvis du eier `kolbotntennis.no` (eller annet domene):
- I Vercel-prosjektet: **Settings → Domains → Add**
- Vercel viser DNS-instruksjoner du legger inn hos domeneleverandøren

---

Org.nr: 871 257 922 — Kolbotn Tennisklubb
