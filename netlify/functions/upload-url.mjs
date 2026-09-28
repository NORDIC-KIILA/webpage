import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import { getR2Client, BUCKET, KEY_PREFIX, originAllowed } from "./lib/r2.mjs";

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 7.5 * 1024 * 1024; // sama kuin lomakkeella
const EXT_ALLOWLIST = /\.(pdf|dwg|dxf|doc|docx|xls|xlsx|png|jpe?g|webp|gif|heic|heif|bmp|tiff?|txt)$/i;

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (!originAllowed(req)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!BUCKET || !process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return Response.json({ error: "R2 not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const files = Array.isArray(body?.files) ? body.files : [];
  if (files.length === 0) {
    return Response.json({ uploads: [] });
  }
  if (files.length > MAX_FILES) {
    return Response.json({ error: "Too many files" }, { status: 400 });
  }

  const total = files.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
  if (total > MAX_TOTAL_BYTES) {
    return Response.json({ error: "Total size too large" }, { status: 413 });
  }
  for (const f of files) {
    if (!EXT_ALLOWLIST.test(String(f.name || ""))) {
      return Response.json({ error: "File type not allowed" }, { status: 400 });
    }
  }

  const id = crypto.randomUUID();
  const date = new Date().toISOString().slice(0, 10);
  const client = getR2Client();

  const uploads = await Promise.all(
    files.map(async (f, i) => {
      const safeName = String(f.name || `liite-${i + 1}`)
        .replace(/[^\w.\-äöåÄÖÅ ]/g, "_")
        .slice(0, 100);
      const key = `${KEY_PREFIX}${date}/${id}/${i + 1}-${safeName}`;
      const url = await getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          ContentType: String(f.type || "application/octet-stream"),
        }),
        { expiresIn: 900 }, // 15 min
      );
      return { key, url };
    }),
  );

  return Response.json({ uploads });
};
