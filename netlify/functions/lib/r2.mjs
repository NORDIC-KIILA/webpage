import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET = process.env.R2_BUCKET_NAME;
export const KEY_PREFIX = "yhteydenotot/";

let client;

// Poistetaan endpointista mahdollinen polku (dashboardista kopioitu arvo
// sisältää usein bucketin nimen perässä). Pelkkä origin kelpaa.
//
// Oletus on R2:n globaali endpoint (bucket luotu ilman jurisdictionia).
// Huom: EU-jurisdictionin bucket tarvitsee eksplisiittisen EU-endpointin
// osoitteessa R2_S3_ENDPOINT (https://<account>.eu.r2.cloudflarestorage.com),
// muuten presigned-URLit osoittavat väärään endpointiin (PUT -> NoSuchBucket).
function sanitizeEndpoint(raw, accountId) {
  const fallback = `https://${accountId}.r2.cloudflarestorage.com`;
  if (!raw) return fallback;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}

export function getR2Client() {
  if (!client) {
    const endpoint = sanitizeEndpoint(
      process.env.R2_S3_ENDPOINT,
      process.env.R2_ACCOUNT_ID,
    );
    client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      // Tärkeä: estetään SDK:n oletus-CRC32-tarkistussumma, joka rikkoisi
      // selaimen/cURL:in tekemät PUT-lataukset presigned-URL:eilla (403).
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

// Kevyt suojaus: sallitaan tuotantodomainit, Netlify-osoitteet (myös deploy
// previewt ja branch deployt) sekä paikallinen kehitys.
// Huom: ei estä palvelimeen kohdistuvia suoria kutsuja (esim. curl),
// joten kokorajoitukset ja tiedostotyyppien tarkistus ovat tärkeämpiä.
const CUSTOM_HOSTS = [
  "localhost:4321",
  "localhost:8888",
  "nordic-kiila.fi",
  "www.nordic-kiila.fi",
  "nordickiila.fi",
  "www.nordickiila.fi",
];
const SITE_SLUGS = ["nordic-kiila", "nordickiila"];

export function originAllowed(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  let host;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }

  const allowed = new Set(CUSTOM_HOSTS);
  for (const value of [
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.DEPLOY_URL,
  ]) {
    if (!value) continue;
    try {
      allowed.add(new URL(value).host);
    } catch {
      // ohitetaan virheellinen arvo
    }
  }
  if (allowed.has(host)) return true;

  // <site>.netlify.app ja <branch>--<site>.netlify.app (deploy previewt)
  for (const slug of SITE_SLUGS) {
    if (host === `${slug}.netlify.app`) return true;
    if (host.endsWith(`--${slug}.netlify.app`)) return true;
  }
  return false;
}
