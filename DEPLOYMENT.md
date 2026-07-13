# Deployment Guide

## Prerequisites

- Node.js >= 22.12.0
- npm
- Netlify account
- Sanity account

---

## 1. Sanity Studio Deployment

The Sanity studio is located in `studio-nordic-kiila-website/`.

### First-time setup

```bash
cd studio-nordic-kiila-website
npm install
```

### Deploy schema changes

After modifying any schema file (e.g. adding the `contact` type):

```bash
cd studio-nordic-kiila-website
npx sanity deploy
```

This deploys the studio to `https://nordic-kiila-website.sanity.studio/` (or your configured project URL).

### Add content

1. Open the deployed Sanity Studio URL
2. Create **Yhteyshenkilö** (contact) documents with name, jobtitle, email, phone, and optionally an image
3. Make sure `isHidden` is **unchecked** for contacts that should appear on the site
4. Publish the documents

---

## 2. Astro Site Deployment to Netlify

### Option A: Git-based deploy (recommended)

1. Push the repo to GitHub/GitLab
2. In Netlify, click **Add new site → Import an existing project**
3. Select the repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy**

Netlify will auto-deploy on every push to the main branch.

### Option B: Manual deploy

```bash
npm run build
```

Then drag the `dist/` folder to Netlify's deploy UI, or use the Netlify CLI:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 3. Netlify Forms Setup

The contact form is already configured with Netlify Forms attributes. Here's what's in place:

### What's already configured in the code

| Attribute | Purpose |
|---|---|
| `data-netlify="true"` | Tells Netlify to detect and handle this form |
| `netlify-honeypot="company_id"` | Spam protection — hidden field that bots fill in |
| `name="contact"` | Form identifier in Netlify dashboard |
| `<input type="hidden" name="form-name" value="contact" />` | Required for AJAX submission |

### How form submission works

The form uses **AJAX submission** (JavaScript `fetch`). On successful submit, the form is replaced with a thank-you banner — no page redirect.

### Verify forms are detected

1. Deploy the site to Netlify (forms are only detected on deployed sites, **not** in local dev)
2. Go to your Netlify site dashboard
3. Navigate to **Forms** in the top menu
4. You should see the `contact` form listed

If the form doesn't appear:
- Make sure the deployed HTML contains the `<form data-netlify="true">` tag
- Check that the build output in `dist/` includes the form (run `npm run build` and inspect `dist/yhteystiedot/index.html`)
- Redeploy — Netlify scans for forms at build time

### Configure form notifications

1. In Netlify dashboard, go to **Forms → Forms → contact → Settings & usage**
2. Under **Form notifications**, click **Add notification**
3. Choose your preferred method:
   - **Email notification** — sends an email to specified addresses on each submission
   - **Slack notification** — posts to a Slack channel
   - **Webhook** — sends POST request to a custom URL

### View form submissions

1. Go to **Forms → Forms → contact**
2. Click on individual submissions to see all field values
3. The `products` field contains the selected products in format: `Category: Product 1, Product 2`

### Spam protection

The form has two layers of spam protection:

1. **Honeypot field** (`company_id`) — hidden from users, bots fill it in, Netlify rejects submissions where it has a value
2. **Netlify's built-in spam shield** — enable it in:
   - **Forms → Forms → contact → Settings & usage → Form recognition**
   - Toggle **Enable spam filter**

For additional protection, consider adding reCAPTCHA:
1. Get keys from [Google reCAPTCHA](https://www.google.com/recaptcha/)
2. Add `data-netlify-recaptcha="true"` to the `<form>` tag
3. Add a `<div data-netlify-recaptcha="true"></div>` inside the form
4. Enable reCAPTCHA in Netlify form settings

---

## 4. Environment Variables

The current setup uses hardcoded Sanity credentials (`projectId: 'lgimtaiv'`, `dataset: 'production'`). If you need to change these, add environment variables in Netlify:

1. Go to **Site settings → Environment variables**
2. Add:
   - `SANITY_PROJECT_ID` — your Sanity project ID
   - `SANITY_DATASET` — your Sanity dataset name
3. Update `src/lib/sanity.ts` to read from `import.meta.env`

---

## 5. Custom Domain

1. Go to **Domain management → Add custom domain**
2. Enter your domain (e.g. `nordic-kiila.fi`)
3. Update DNS records as instructed by Netlify
4. Enable HTTPS (automatic via Let's Encrypt)

---

## 6. Testing Checklist

After deployment, verify:

- [ ] Sanity Studio is accessible and you can edit content
- [ ] Contact persons appear on the `/yhteystiedot` page
- [ ] Form appears in Netlify **Forms** dashboard
- [ ] Submit the form — thank-you banner appears
- [ ] Check that the submission appears in Netlify Forms dashboard
- [ ] Honeypot field is not visible to users
- [ ] Product selection from URL params works (navigate from a product page)
- [ ] Phone number link works (`tel:` link)
- [ ] Contact card email/phone links work

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Form not detected by Netlify | Redeploy. Ensure `data-netlify="true"` is in the built HTML. |
| Form submissions not received | Check **Forms → Notifications** are configured. |
| Thank-you banner not showing | Check browser console for JS errors. AJAX submission requires the site to be on Netlify. |
| Contact cards not showing | Ensure contacts are published in Sanity with `isHidden` unchecked. |
| Product checkboxes not pre-selected | Verify URL format: `/yhteystiedot?categorySlug=productSlug` |
| Sanity content not updating | The site uses `useCdn: true` — CDN cache may take up to ~60 seconds. Rebuild the site to force fresh data. |
