// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { writeFile } from "node:fs/promises";
import { createClient } from "@sanity/client";

import sitemap from "@astrojs/sitemap";

// Redirects are managed in Sanity (document type "redirect") and written to
// Netlify's _redirects file at build time. useCdn is false so that the build
// always uses the latest published redirects.
const redirectClient = createClient({
  projectId: "lgimtaiv",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

function sanityRedirects() {
  return {
    name: "sanity-redirects",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        // If Sanity is unreachable this throws and the build fails, so a
        // deploy can never silently drop existing redirects.
        const rows = await redirectClient.fetch(
          `*[_type == "redirect" && defined(from) && defined(to) && from != to]{from, to, permanent}`,
        );

        const lines = rows.map(
          (r) => `${r.from} ${r.to} ${r.permanent === false ? 302 : 301}`,
        );

        await writeFile(new URL("_redirects", dir), lines.join("\n") + (lines.length ? "\n" : ""));
        console.log(`[sanity-redirects] wrote ${lines.length} redirect(s) to _redirects`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://nordickiila.fi",

  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap(), sanityRedirects()],
});
