import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET = process.env.R2_BUCKET_NAME;
export const KEY_PREFIX = "yhteydenotot/";

let client;

// Poistetaan endpointista mahdollinen polku (dashboardista kopioitu arvo
// sisältää usein bucketin nimen perässä). Pelkkä origin kelpaa.
function sanitizeEndpoint(raw, accountId) {
  const fallback = `https://${accountId}.eu.r2.cloudflarestorage.com`;
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

// Kevyt suojaus: sallitaan molemmat domainit (väliviivalla ja ilman) + www + paikallinen kehitys.
// Huom: ei estä palvelimeen kohdistuvia suoria kutsuja (esim. curl),
// joten kokorajoitukset ja tiedostotyyppien tarkistus ovat tärkeämpiä.
export function originAllowed(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    const allowed = [
      "localhost:4321",
      "localhost:8888",
      "nordic-kiila.fi",
      "www.nordic-kiila.fi",
      "nordickiila.fi",
      "www.nordickiila.fi",
    ];
    if (process.env.URL) allowed.push(new URL(process.env.URL).host);
    return allowed.includes(host);
  } catch {
    return false;
  }
}
