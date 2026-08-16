# Verkkosivujen käyttöönotto-ohje (Netlify + Sanity)

Näillä ohjeilla saadaan otettua sivusto käyttöön.

Sivusto koostuu kahdesta osasta:

1. Varsinainen sivusto (Astro) | **Netlify hosting**
2. Sisällönhallinta (Sanity Studio) | **Sanityn oma hosting** (`https://nordickiila.sanity.studio/`)

Sivuston sisältöä muokataan Sanity Studiossa, kirjaudu sinne projektin Github tunnuksilla. Kun Sanity:ssa julkaistaan sisältöä, Netlify rakentaa sivuston uudelleen automaattisesti.

---

## 1. Repon muuttaminen julkiseksi (mikäli se ei sitä vielä ole)

Nykyinen repo on **private**. Netlifyn ilmainen Starter Plan sallii vain yhden Git-käyttäjän yksityisille repoille. Jotta muut voi puskea (push) koodia ja Netlify julkaista muutokset automaattisesti, repo pitää muuttaa julkiseksi.

> Jos repo halutaan ehdottomasti pitää yksityisenä, ainoa vaihtoehto on päivittää Netlify Pro -suunnitelmaan (~$19/kk), joka sallii rajattomasti käyttäjiä. Simppelissä markkinointisivustossa yksityinen repo harvemmin on välttämätöntä, joten julkinen repo on helpoin ja halvin tapa.

**Muuta repositorio julkiseksi:**

1. Mene GitHubissa itse projektiin: [https://github.com/NORDIC-KIILA/webpage](https://github.com/NORDIC-KIILA/webpage)
2. **Settings** → **General** → rullaa sivun pohjalle kohtaan **Danger Zone**
3. **Change repository visibility** → **Make public**
4. Vahvista valinta

Tämän jälkeen Netlify hyväksyy collaborator:ien koodin puskemiset.

---

## 2. Netlify-tilin luominen

1. Mene osoitteeseen [https://app.netlify.com](https://app.netlify.com)
2. Valitse **Sign up** → **GitHub**
3. Hyväksy GitHub-kirjautuminen ja anna Netlifylle oikeus lukea projektin repoa
4. Valitse tarvittaessa **Start for free** -suunnitelma — se riittää tälle projektille

---

## 3. Projektin yhdistäminen Netlify:hin

1. Netlifyssä: **Add new site** → **Import an existing project**
2. Valitse **GitHub**
3. **GitHub App -asennus:** Netlify kysyy, mihin GitHub-tiliin **Netlify GitHub App** asennetaan. Valitse tilisi **NORDIC-KIILA** (se tili, joka omistaa repon).
   - Valitse **All repositories** (kaikki repot) tai **Only select repositories** ja valitse `webpage`
4. Valitse repo **NORDIC-KIILA/webpage**
5. Syötä asetukset:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - (Netlify saattaa tunnistaa Astron automaattisesti ja täyttää nämä valmiiksi — tarkista vain, että arvot ovat oikein.)
6. Paina **Deploy site**

Ensimmäinen build kestää muutaman minuutin. Tämän jälkeen Netlify julkaisee uuden version **automaattisesti aina, kun `main`-branchiin pusketaan (push) koodia**.

> Huom: Projektissa on `package.json`-tiedostossa `engines: node >= 22.12.0`. Netlify lukee tämän automaattisesti ja käyttää oikeaa Node-versiota — tähän ei tarvitse tehdä mitään.

---

## 4. (Tämä on jo tehty, tämän kohdan voi skipata) Kehittäjän lisääminen git-contributoriksi

Tämä tehdään **GitHubissa, ei Netlify:ssä**.

1. Mene GitHubissa repositorioon [https://github.com/NORDIC-KIILA/webpage](https://github.com/NORDIC-KIILA/webpage)
2. **Settings** → **Collaborators** (vasemmassa yläreunassa)
3. Paina **Add people** ja syötä kehittäjän GitHub-käyttäjätunnus
4. Kehittäjä saa kutsun sähköpostiinsa ja hyväksyy sen

Tämän jälkeen kehittäjä voi puskea koodimuutoksia, ja Netlify julkaisee ne automaattisesti.

---

## 5. Yhteydenottolomake (Netlify Forms)

Lomake on jo koodissa konfiguroitu Netlify Forms -yhteensopivaksi — Netlify:n pitäisi tunnistaa se automaattisesti ensimmäisen deploy:n jälkeen.

### Tarkista, että lomake tunnistettiin

1. Netlify:ssä valitse projektin valikosta **Forms**
2. Paina **Enable form dection** (jos sellainen on näkyvissä)
3. Listassa pitäisi näkyä lomake nimeltä **contact**

Jos lomaketta ei näy: tee sivustolle uusi deploy (**Deploys** → **Trigger deploy** → **Deploy site**). Netlify etsii lomakkeet buildin yhteydessä. Mikäli lomake ei vieläkään näy, kerro siitä kehittäjälle.

### Lomakeilmoitukset sähköpostiin

Oletuksena lomakelähetykset näkyvät vain Netlifyssä — sähköposti-ilmoitus pitää kytkeä päälle erikseen:

1. **Forms** → klikkaa lomaketta **contact**
2. **Settings & usage** → **Form notifications** → **Add notification**
3. Valitse **Email notification** ja syötä osoitteet, joihin lähetykset halutaan
4. Tallenna

### Roskapostisuodatus

Honeypot-kenttä on jo koodattuna. Kytke lisäksi Netlifyn oma suodatin päälle:

1. **Forms** → **contact** → **Settings & usage**
2. Laita **Spam filter** päälle

Lomakelähetyksiä voi tarkastella kohdassa **Forms** → **contact** → **Submissions**.

---

## 6. Ympäristömuuttujat (Environment variables)

**Tämä projekti ei tarvitse ympäristömuuttujia.**

Sanity-yhteys on julkista, avainta vaatimatonta lukuoikeutta varten, joten projektitunnus ja dataset on kovakoodattu. Mitään salaisuuksia ei ole eikä niitä pidä lisätä.

Jos tulevaisuudessa tulee tarve (esim. erillinen testiympäristö), muuttujat lisätään Netlifyssä: **Project configuration** → **Environment variables**.

---

## 7. Sanity Studio (sisällönhallinta)

Sanity Studio julkaistaan Sanityn omaan hostingiin ja studio avautuu osoitteesta `https://nordickiila.sanity.studio/`. Kirjaudu sinne projektin Github tunnuksilla.

---

## 8. Sivuston automaattinen uudelleenrakennus, kun sisältöä muokataan

Koska sivusto on staattinen, Sanityssa tehdyt sisältömuutokset näkyvät vasta, kun Netlify rakentaa sivuston uudelleen. Tätä varten Sanityssa on oma nappi, jolla manuaalisesti käynnistetään build.

### Vaihe A: Build hookin luominen Netlifyssä

1. Netlify:ssä: **Project configuration** → **Build & deploy**
2. Etsi kohta **Build hooks** → **Add build hook**
3. **Name:** esim. `Manual deploy`
4. **Branch to build:** `main`
5. Tallenna ja **kopioi generoitu URL** (muotoa `https://api.netlify.com/build_hooks/...`)

### Vaihe B: Deploy-painikkeen lisääminen Sanity Studioon

Sanity Studioon lisätään **Dashboard**-näkymä, jossa on **Deploy**-painike sivuston uudelleenrakentamista varten. Tätä varten tarvitaan kolme tietoa Netlifystä:

1. **Build hook ID:** vaiheessa A kopioimastasi osoitteesta — se on URL:n viimeinen osa (muotoa `https://api.netlify.com/build_hooks/<tämä-on-id>`)
2. **API ID:** Netlifyssä **Site configuration** → **General** → **Site details** → **Site information** → **API ID**
3. **Site name:** Netlifyssä **Site configuration** → **General** → **Site details** → **Site name**

Joko kehittäjä tai sinä itse voit lisätä ne projektiin. Jos hoidat tämän itse, lisää `studio-nordic-kiila-website/sanity.config.ts`-tiedostoon seuraavat rivit (korvaa `<...>`-kohdat Netlifystä saamillasi arvoilla):

```ts
import { dashboardTool } from "@sanity/dashboard";
import { netlifyWidget } from "sanity-plugin-dashboard-widget-netlify";

export default defineConfig({
  // ...muut asetukset ennallaan...
  plugins: [
    structureTool(),
    visionTool(),
    dashboardTool({
      widgets: [
        netlifyWidget({
          title: "Netlify deploys",
          sites: [
            {
              title: "Nordic Kiila Website",
              apiId: "<NETLIFY_API_ID>",
              buildHookId: "<BUILD_HOOK_ID>",
              name: "<NETLIFY_SITE_NAME>",
              url: "https://nordickiila.fi",
              branch: "main",
            },
          ],
        }),
      ],
    }),
  ],
});
```

Lopuksi julkaistaan päivitetty Studio:

```bash
cd studio-nordic-kiila-website
npm run deploy
```

Tämän jälkeen Sanity Studiossa näkyy **Dashboard**-näkymä, josta sivuston voi rakentaa uudelleen yhdellä painalluksella. Buildin tila näkyy widgetissä reaaliajassa.

---

## 9. Tarkistuslista käyttöönoton jälkeen

- [ ] Repo on julkinen (GitHub)
- [ ] Sivusto aukeaa Netlifyn antamasta osoitteesta (ja domainin liittämisen jälkeen osoitteesta nordickiila.fi)
- [ ] Kaikki sivut ja kuvat latautuvat oikein
- [ ] Sanity Studio aukeaa ja sinne voi kirjautua
- [ ] Lomake näkyy Netlifyn **Forms**-välilehdellä nimellä `contact`
- [ ] Lähetä testilomake — kiitosviesti ilmestyy sivulle ja lähetys näkyy Netlifyssä
- [ ] Sähköposti-ilmoitus tulee perille
- [ ] Testaa sisältömuutos Sanityssa → tarkista, että manuaalinen deploy Netlify:hin toimii.

---

## 10. Kun kaikki toimii, liitä oma domain (nordickiila.fi)

1. Netlifyssä: **Domain settings** → **Add a domain**
2. Syötä `nordickiila.fi` ja seuraa ohjeita
3. Netlify antaa DNS-merkinnät — lisää ne domainin DNS-hallintaan (sinne, mistä domain on ostettu)
4. Netlify varmistaa DNS:n ja luo HTTPS-varmenteen automaattisesti (voi kestää hetken)

> Sivuston sisäinen `site`-osoite on jo asetettu muotoon `https://nordickiila.fi` sivustogeneraattorin asetuksissa, joten muuta ei tarvita.
