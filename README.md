# Vzdelávacia Portál — Návod na používanie

Tento portál je miesto, kde sa študenti prihlasujú svojím nickom a majú prístup k rôznym predmetom. Každý predmet ich presmeruje na samostatnú aplikáciu.

---

## Ako začať (prvé spustenie)

1. Otvor portál — uvidíš prihlasovaciu obrazovku.
2. Klikni na **Registrácia** a vytvor si účet:
   - **Nick** — tvoja prezývka, ktorou ťa budú ostatní vidieť.
   - **Meno a priezvisko** — tvoje skutočné meno (voliteľné, ale odporúčané).
   - **Email a heslo** — na prihlásenie.
3. Po registrácii ťa to prihlási a uvidíš zoznam predmetov.

---

## Ako sa stať adminom

Keď sa prihlásiš ako prvý používateľ a ešte neexistuje žiadny admin:

1. Otvor URL `/admin` (napr. `https://tvojportal.sk/admin`).
2. Uvidíš obrazovku **"Žiadny admin neexistuje"** s tlačidlom **Prevziať admina**.
3. Klikni na tlačidlo — staneš sa adminom.

Ak už admin existuje, môže ťa povýšiť cez Admin Panel → záložku **Admins**.

---

## Ako pridať nový predmet (ako admin)

1. Prihlás sa a choď na **Admin Panel** (tlačidlo v hornej lište alebo URL `/admin`).
2. Otvor záložku **Predmety**.
3. Klikni **Pridať predmet**.
4. Vyplň formulár:
   - **Názov** — názov predmetu (napr. "Matematika").
   - **Slug** — URL identifikátor (napr. "matematika"). Ak necháš prázdne, vygeneruje sa automaticky z názvu.
   - **Popis** — krátky popis, ktorý sa zobrazí na karte.
   - **URL** — odkaz na aplikáciu pre daný predmet (napr. `https://github.com/mojprojekt`).
   - **Ikona** — vyber ikonu zo zoznamu (Leaf, BookOpen, ShoppingBag, atď.).
   - **Poradie** — číslo, ktoré určuje poradie kariet (nižšie = skôr).
5. Klikni **Vytvoriť**.

### Ako upraviť alebo zmazať predmet

- **Upraviť**: Klikni na ikonu pera vedľa predmetu.
- **Skryť/Zobraziť**: Klikni na ikonu štítu — predmet sa skryje z portálu, ale zostane v databáze.
- **Zmazať**: Klikni na ikonu koša — predmet sa trvalo odstráni.

---

## Ako nastaviť Discord notifikácie

1. V Discorde vytvor webhook pre kanál, kam chceš dostávať notifikácie:
   - Nastavenia kanálu → **Integrácie** → **Webhooky** → **Nový webhook**.
   - Skopíruj URL web hooku (vyzerá ako `https://discord.com/api/webhooks/...`).
2. V Admin Paneli otvor záložku **Nastavenia**.
3. Vlož URL do poľa **Discord Webhook URL**.
4. Klikni **Uložiť**.

Od teraz ti na Discord budú chodiť notifikácie:
- **Keď sa niekto prihlási** — nick, meno a email.
- **Keď niekto pošle správu cez kontaktný formulár** — nick, meno, správa, predmet a navrhovaná cena.

---

## Kontaktný formulár

Na stránke `/contact` môže ktokoľvek (aj bez prihlásenia) poslať správu adminovi.

Vyplní:
- **Nick** — svoju prezývku.
- **Meno a priezvisko** — skutočné meno.
- **Predmet** (voliteľné) — ku ktorému predmetu sa správa vzťahuje.
- **Správa** — text správy.
- **Navrhovaná cena** (voliteľné) — ak chce navrhnúť cenu.

Správy si admin môže prečítať v Admin Paneli → záložka **Správy**. Neprečítané správy sú zvýraznené.

---

## Správa adminov

V Admin Paneli → záložka **Admins** vidíš zoznam všetkých registrovaných používateľov.

- Klikni na ikonu **štítu** vedľa používateľa pre pridanie alebo odobranie admin práv.
- Môžeš odobrať aj svoje vlastné admin práva (s potvrdením).

---

## Štruktúra portálu

| Stránka | URL | Kto ju vidí |
|---|---|---|
| Prihlásenie/Registrácia | `/login` | Neprihlásení |
| Portál (zoznam predmetov) | `/` | Prihlásení |
| Kontakt | `/contact` | Všetci |
| Admin Panel | `/admin` | Prihlásení (admin po prvom nárokovaní) |

---

## Aktuálne predmety

| Predmet | URL |
|---|---|
| Biológia | https://github.com/usbkluc/handy-quiz-coach |
| Angličtina | https://github.com/tobssssssssss/english |
| Pod sem | https://github.com/alvero725/obchod |
