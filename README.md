# Vzdelávací Portál

Portál kde sa prihlásiš iba nickom — žiadny email, žiadne heslo. Vidíš predmety, každý ťa presmeruje na externú stránku. Admin môže pridávať predmety, spravovať adminov a nastaviť Discord webhook.

---

## Hosting a doména

Projekt je hostovaný na **Bolt.new** — stačí ho publikovať priamo z Boltu (tlačidlo **Publish** hore). Bolt automaticky vytvorí `bolt.host` adresu (napr. `tvojprojekt.bolt.host`).

### Pripojenie vlastnej domény

Ak chceš použiť vlastnú doménu (napr. `portal.sk`), ktorú máš zakúpenú u iného poskytovateľa:

1. Najprv **publikuj projekt** v Bolt.new (tlačidlo Publish hore v strede obrazovky).
2. Klikni na **ikonku ozubeného kolieska** → **All project settings**.
3. Otvor **Domains & Hosting**.
4. Klikni **Connect domain** a zadaj svoju doménu.
5. Bolt ti ukáže DNS záznamy, ktoré treba nastaviť u poskytovateľa tvojej domény:
   - **A záznam** — ukazuje na Bolt IP adresu
   - **CNAME záznam** — pre `www` subdoménu
6. Nastav tieto DNS záznamy u poskytovateľa domény (kde si doménu kúpil).
7. Po nastavení DNS Bolt doménu automaticky overí a aktivuje (môže trvať pár minút až hodín).

> **Poznámka:** Vlastné domény sú dostupné len pre **Pro** plán. Na Free pláne ostávaš na `bolt.host` adrese.

### Environment variables

Bolt.new automaticky používa premenné z `.env` súboru v projekte — `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` sú už nastavené. Nič nemusíš pridávať.

### Edge function (Discord notifikácie)

Edge function `notify-discord` beží na Supabase serveri. Je už nasadená a jej secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) sú nastavené automaticky. S hostingom to nemá nič spoločné.

---

## Ako funguje prihlásenie

1. Otvor portál — vidíš jednoduché pole pre nick.
2. **Zadaj svoj nick** a klikni **Prihlásiť sa**.
3. Ak nick ešte neexistuje, klikni **Registrovať nový nick** — vytvorí sa a prihlási.
4. Nick si zapamätá prehliadač, takže nabudúce ťa prihlási automaticky.
5. **Odhlásiť** sa môžeš kedykoľvek — tlačidlom v hornej lište.

Prihlásenie funguje cez vlastné API — nick sa uloží do databázy (Supabase) a prehliadač si ho zapamätá. Žiadny externý poskytovateľ prihlásenia, žiadny email, žiadne heslo.

---

## Admin účet

Admin je už nastavený — nick **tobias kromka**. Stačí sa prihlásiť týmto nickom a máš prístup do Admin Panelu.

Ak chceš pridať ďalšieho admina: prihlás sa ako tobias kromka, choď do Admin Paneli → **Admins**, klikni na ikonu štítu vedľa nicku, ktorému chceš dať admin práva.

---

## Ako pridať novú stránku (predmet)

Predmety sa zobrazujú ako karty na portáli. Klik na kartu ťa presmeruje priamo na URL, ktorú zadalíš — otvorí sa v novej záložke.

### Krok za krokom

1. Prihlás sa ako admin (nick **tobias kromka**).
2. Klikni **Admin Panel** v hornej lište (alebo choď na `/admin`).
3. Otvor záložku **Predmety**.
4. Klikni **Pridať predmet**.
5. Vyplň formulár:
   - **Názov** — ako sa predmet volá (napr. "Matematika").
   - **Slug** — identifikátor do URL (napr. "matematika"). Ak necháš prázdne, vygeneruje sa automaticky z názvu.
   - **Popis** — krátky popis zobrazený na karte pod názvom.
   - **URL** — **odkaz, kam sa má používateľ presmerovať** pri kliknutí na kartu. Môže to byť hocičo:
     - GitHub repozitár: `https://github.com/tobssssssssss/english`
     - Web stránka: `https://mojastranka.sk`
     - Google Docs: `https://docs.google.com/...`
     - Akýkoľvek iný link
   - **Ikona** — vyber z ponuky (Leaf, BookOpen, ShoppingBag, Calculator, Globe, atď.).
   - **Poradie** — číslo pre zoradenie kariet (nižšie = skôr v zozname).
6. Klikni **Vytvoriť**.

Nová karta sa okamžite zobrazí na portáli. Klik na ňu otvorí zadanú URL v novej záložke prehliadača.

### Upraviť / Skryť / Zmazať predmet

- **Upraviť**: ikona pera vedľa predmetu — zmeníš názov, URL, popis, atď.
- **Skryť/Zobraziť**: ikona štítu — predmet zmizne z portálu ale ostane v databáze.
- **Zmazať**: ikona koša — trvalo odstráni.

---

## Admin meno — nastavenie

V Admin Paneli → **Nastavenia** → pole **Admin meno** môže admin nastaviť svoje celé meno. Toto meno sa zobrazuje v Discord notifikáciách pri prihlásení.

---

## Discord webhook — nastavenie

### Kde sa nastavuje

V Admin Paneli → **Nastavenia** → pole **Discord Webhook URL**.

### Čo zadať

Jednu jedinú hodnotu — **URL web hooku** z Discorda:

```
https://discord.com/api/webhooks/XXXXXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

### Ako získať webhook URL

1. Otvor Discord → kanál, kam chceš dostávať notifikácie.
2. Nastavenia kanálu → **Integrácie** → **Webhooky** → **Nový webhook**.
3. Skopíruj **URL web hooku**.
4. Vlož ho do Admin Paneli → Nastavenia → Uložiť webhook.

### Čo potom chodí na Discord

- **Prihlásenie**: nick a meno používateľa.

---

## Správa adminov

V Admin Paneli → **Admins** je zoznam všetkých nickov.

- Klikni na ikonu **štítu** vedľa nicku pre pridanie/odobranie admin práv.
- Môžeš odobrať aj svoje vlastné (s potvrdením).

---

## Prehľad stránok

| Stránka | URL | Kto ju vidí |
|---|---|---|
| Prihlásenie | `/login` | Neprihlásení |
| Portál (predmety) | `/` | Všetci (aj neprihlásení) |
| Admin Panel | `/admin` | Prihlásení admini |

---

## Aktuálne predmety

| Predmet | URL kam presmeruje |
|---|---|
| Angličtina | https://github.com/tobssssssssss/english |
| Pod sem | https://github.com/alvero725/obchod |
