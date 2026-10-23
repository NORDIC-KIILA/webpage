import { client } from "./sanity";

export type PageSeo = {
  title?: string;
  description?: string;
  imageUrl?: string;
  noIndex?: boolean;
};

const PAGE_SEO_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  "title": seo.title,
  "description": seo.description,
  "imageUrl": seo.image.asset->url,
  "noIndex": seo.noIndex
}`;

/**
 * Fetches the SEO settings for a static page from the Sanity "page" collection.
 * Returns null when no matching page document exists, so pages can fall back
 * to their hardcoded defaults.
 */
export async function getPageSeo(slug: string): Promise<PageSeo | null> {
  // useCdn: false so a freshly published SEO change is used by the next build.
  return client.withConfig({ useCdn: false }).fetch(PAGE_SEO_QUERY, { slug });
}
