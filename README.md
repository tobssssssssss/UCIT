# Vzdelávací Portál

Portál kde sa prihlásiš iba nickom — žiadny email, žiadne heslo. Vidíš predmety, každý odkazuje na vlastnú stránku. Admin môže pridávať predmety, čítať správy a nastaviť Discord webhook.

---

## Ako funguje prihlásenie

1. Otvor portál — vidíš jednoduché pole pre nick.
2. **Zadaj svoj nick** a klikni **Prihlásiť sa**.
3. Ak nick ešte neexistuje, klikni **Registrovať nový nick** — vytvorí sa a prihlási.
4. Nick si zapamätá prehliadač, takže nabudúce ťa prihlási automaticky.
5. **Odhlásiť** sa môžeš kedykoľvek — tlačidlom v hornej lište.

---

## Ako sa stať adminom

1. Prihlás sa svojím nickom.
2. Otvor `/admin` v prehliadači.
3. Ak ešte nikto nie je admin, uvidíš tlačidlo **Prevziať admina**. Klikni.
4. Odteraz máš admin práva a vidíš Admin Panel.

Ak už admin existuje, môže ťa povýšiť v Admin Paneli → **Admins**.

---

## Ako pridať novú stránku (predmet)

1. Prihlás sa ako admin a choď na **Admin Panel** (tlačidlo v hornej lište alebo `/admin`).
2. Otvor záložku **Predmety**.
3. Klikni **Pridať predmet**.
4. Vyplň:
   - **Názov** — ako sa predmet volá (napr. "Matematika").
   - **Slug** — identifikátor do URL (napr. "matematika"). Ak necháš prázdne, vygeneruje sa automaticky.
   - **Popis** — krátky popis zobrazený na karte.
   - **URL** — odkaz na stránku predmetu (napr. `https://github.com/mojprojekt`).
   - **Ikona** — vyber z ponuky (Leaf, BookOpen, ShoppingBag, atď.).
   - **Poradie** — číslo pre zoradenie kariet (nižšie = skôr).
5. Klikni **Vytvoriť**.

### Upraviť / Skryť / Zmazať predmet

- **Upraviť**: ikona pera vedľa predmetu.
- **Skryť/Zobraziť**: ikona štítu — predmet zmizne z portálu ale ostane v databáze.
- **Zmazať**: ikona koša — trvalo odstráni.

---

## Discord webhook — aké premenné treba nastaviť

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
4. Vlož ho do Admin Paneli → Nastavenia → Uložiť.

### Čo potom chodí na Discord

- **Prihlásenie**: nick a meno používateľa.
- **Správa z kontaktu**: nick, meno, text správy, predmet (ak vybraný), navrhovaná cena (ak zadaná).

### Žiadne ďalšie premenné

Nepotrebuješ nastavovať žiadne environment variables ani secrets. Všetko funguje automaticky — Supabase URL a kľúče sú už nakonfigurované v projekte.

---

## Kontaktný formulár

Na `/contact` môže ktokoľvek poslať správu — nepotrebuje byť prihlásený.

Vyplní:
- **Nick** — svoju prezývku.
- **Predmet** (voliteľné) — ku ktorému predmetu sa správa vzťahuje.
- **Správa** — text.
- **Navrhovaná cena** (voliteľné) — ak chce navrhnúť cenu.

Správy si admin prečíta v Admin Paneli → **Správy**. Neprečítané sú zvýraznené.

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
| Portál (predmety) | `/` | Prihlásení |
| Kontakt | `/contact` | Všetci |
| Admin Panel | `/admin` | Prihlásení (admin po prevzatí) |

---

## Aktuálne predmety

| Predmet | URL |
|---|---|
| Biológia | https://github.com/usbkluc/handy-quiz-coach |
| Angličtina | https://github.com/tobssssssssss/english |
| Pod sem | https://github.com/alvero725/obchod |
