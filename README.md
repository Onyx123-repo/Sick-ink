# Sick Ink

This copy uses a flat layout: every file sits in one folder (no css, js or assets subfolders), so it uploads to GitHub from a phone in one go. Where the notes below say `assets/`, `css/` or `js/`, read the file name only.

Static site: plain HTML, CSS and JavaScript. No build step, no backend.

## Folder

```
sick-ink/
├── index.html
├── css/style.css
├── js/script.js
├── assets/        <- logo and photos
└── README.md
```

## Placeholder content: replace before launch

All of this is invented so the site looks complete. Search `index.html` and replace it with the client's real details:

- Artist name: `Marco Vale`
- City and address: `Portland`, `123 Main Street, Suite 4`
- Hours, deposit and walk-in policy, pricing wording (FAQ and "The shop")
- Bio (artist section), the three styles (Styles section and the form's Style list)
- Selected work: `assets/work-01.webp` to `work-06.webp` are demo pictures found online, not the artist's own work. Replace them with the artist's own tattoo photos before launch. Don't publish other artists' work without permission.
- Business name: the site now says "Sick Ink". The sign in the shop photos reads "Sick Ink Studios", so confirm which one the client wants and use it everywhere.

## Before launch

1. **Email delivery.** Get a free access key at https://web3forms.com: enter Sickinkstudioss@gmail.com and the key arrives in that inbox. Paste it into `ACCESS_KEY` at the top of `js/script.js`. The key is meant to be public; it can only deliver to that one inbox. Until it is set, the form skips email and shows the Signal fallback instead.
2. **Signal link.** Set `SIGNAL_URL` at the top of `js/script.js`. Every "Message on Signal", "Send images on Signal" and "Open Signal" link uses it.
3. **Logo.** Save it as `assets/logo.jpg`, then swap the text brand in `index.html` for the commented `<img>` line.
4. **Tattoo photos.** Export as WebP, about 800 x 1000 px, under 150 KB each. Replace each `<div class="tile ph">` with the commented `<button class="tile">` example and write real alt text. Clicking a photo enlarges it.
5. **Shop photos.** The four in `assets/` are about 650 to 750 px wide. Swap in larger originals if available.
6. **Fonts.** Anton (headings) and Archivo (body) load from Google Fonts. Check them against the real logo.

## Known limits (version one)

- The form emails each request to the artist through Web3Forms (free plan, no backend, nothing stored on this site). Check the plan's monthly limit on their site if traffic grows.
- The contact field is required (email or phone), because that is how the artist replies. A real email address becomes the Reply-To of the notification, so the artist can answer from the inbox.
- If sending fails (no connection, service down, key not set), the customer sees an error and a Signal fallback: Copy inquiry, then Open Signal. Nothing is lost.
- A hidden field catches most spam bots. For heavier spam, turn on Web3Forms' captcha options.
- Reference images are sent in Signal, not through the form.

## Deploy to Vercel

1. Put the folder in a GitHub repo.
2. In Vercel choose Add New, then Project, import the repo and deploy. Framework preset: Other. No build command, no output directory.
3. Open the live URL on a phone and a desktop. Test the menu, gallery, form errors, the Signal link, and send one real test request: the confirmation should appear and the email should arrive (check spam the first time).
