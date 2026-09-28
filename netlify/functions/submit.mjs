import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, BUCKET, KEY_PREFIX } from "./lib/r2.mjs";

const MAX_ATTACHMENTS = 5;
const MAX_TOTAL_BYTES = 7.5 * 1024 * 1024;
const LINK_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 vrk

const FIELDS = [
  ["firstname", "Etunimi"],
  ["lastname", "Sukunimi"],
  ["company", "Yritysnimi"],
  ["phone", "Puhelin"],
  ["email", "Sähköposti"],
  ["products", "Kiinnostuksen kohteet"],
  ["message", "Viesti"],
];

function clean(value) {
  return String(value ?? "").trim().slice(0, 5000);
}

function sanitizeFilename(name) {
  return String(name || "liite")
    .replace(/[^\w.\-äöåÄÖÅ ]/g, "_")
    .slice(0, 100);
}

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) {
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: jos täytetty, kyseessä on botti -> hylätään hiljaa.
  if (clean(data?.company_id)) {
    return Response.json({ ok: true });
  }

  // Pakolliset kentät
  const required = ["firstname", "lastname", "phone", "email", "message"];
  for (const field of required) {
    if (!clean(data?.[field])) {
      return Response.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const attachments = Array.isArray(data?.attachments) ? data.attachments.slice(0, MAX_ATTACHMENTS) : [];
  let totalBytes = 0;
  for (const a of attachments) {
    totalBytes += Number(a.size) || 0;
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    return Response.json({ error: "Total size too large" }, { status: 413 });
  }

  // Ladataan liitteet muistiin sähköpostin liitteiksi + luodaan 7 vrk:n linkit.
  const emailAttachments = [];
  const linkLines = [];
  const client = BUCKET ? getR2Client() : null;

  for (const a of attachments) {
    const key = String(a.key || "");
    if (!key.startsWith(KEY_PREFIX)) continue;
    const filename = sanitizeFilename(a.name);
    try {
      if (client) {
        const signed = await getSignedUrl(
          client,
          new GetObjectCommand({ Bucket: BUCKET, Key: key }),
          { expiresIn: LINK_TTL_SECONDS },
        );
        linkLines.push(`${filename}: ${signed}`);

        const obj = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const bytes = Buffer.from(await obj.Body.transformToByteArray());
        emailAttachments.push({ filename, content: bytes.toString("base64") });
      }
    } catch {
      // Jos tiedoston haku epäonnistuu, lähetetään sähköposti silti.
    }
  }

  const bodyLines = [];
  for (const [field, label] of FIELDS) {
    const value = clean(data?.[field]);
    if (value) bodyLines.push(`${label}:\n${value}`);
  }

  let text = `Uusi yhteydenotto nordickiila.fi-sivuston lomakkeen kautta.\n\n${bodyLines.join("\n\n")}`;

  if (linkLines.length > 0) {
    text += `\n\nLiitteet (linkit toimivat 7 vuorokautta):\n${linkLines.join("\n")}`;
  }

  const subject = `Uusi yhteydenotto: ${clean(data.firstname)} ${clean(data.lastname)}`.slice(0, 150);
  const from = process.env.FROM_EMAIL || "lomake@nordickiila.fi";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Nordic Kiila -sivusto <${from}>`,
      to: [process.env.NOTIFY_EMAIL],
      reply_to: clean(data.email),
      subject,
      text,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend error", res.status, detail);
    return Response.json({ error: "Email sending failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
};
