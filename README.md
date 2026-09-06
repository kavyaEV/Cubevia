# Cubevia website

Plain HTML, CSS and JavaScript. No page builder, no subscription, no framework, no build step.
You own every file. **Hosting costs £0.**

Built for **Cubevia Ltd**, company number 17352353, registered office 66 Paul Street, London,
EC2A 4NA.

---

## What is already done

- Domain set to `cubevia.com` throughout
- Company registration details in the footer of every page (legally required for a UK limited
  company on its website)
- `privacy.html`, a UK GDPR privacy notice with your real company details, linked from the
  footer and from under the enquiry form
- Enquiry form wired to deliver to **contact@cubevia.com**
- Fonts self-hosted, no third-party requests, no cookies, no trackers

## What is left for you

Two edits, then email, then deploy. Details below.

| # | What | Where |
|---|---|---|
| 1 | Paste your Web3Forms access key | `index.html`, around line 324 |
| 2 | Confirm the price is £699 and not £799 | `index.html` lines 8, 41, 238 |

Optional: the site says the founder is **Kavi Lakshmi** (from your brief). Your Companies House
record says Kavyalakshmi Erode Vivekanandhan. If you want the site to match the register, edit
`index.html` lines 42 and 281.

---

## 1. Run it locally

Double-click `index.html`. It opens and works.

The one thing that will not work from disk is **submitting the form**, because browsers block
cross-origin requests from local files. Test the form on the live site, or run a local server:

```bash
python3 -m http.server 8000      # Mac / Linux
npx serve                         # Windows, or if you have Node
```

Then open http://localhost:8000.

---

## 2. Set up contact@cubevia.com

The form delivers to this address, so **it has to exist before the form works**. You have two
routes.

### Fastest and free: Cloudflare Email Routing
Forwards `contact@cubevia.com` straight to your personal Gmail. You receive enquiries, but you
cannot easily *send* from that address. Set-up is in step 4 below, after your domain is on
Cloudflare. Good enough to launch.

### Before you start cold emailing: a real mailbox
Cold outreach to US contractors from a brand-new domain needs a proper mailbox with SPF, DKIM
and DMARC configured, or your emails land in spam. Forwarding alone will not do this.

- **Zoho Mail** has a free tier for one domain, which gives you a real sendable mailbox
- **Google Workspace** or **Microsoft 365** are around £5 to £6 per user per month and are the
  usual choice once outreach is the main channel

Set up forwarding now to launch; move to a real mailbox before your first campaign.

---

## 3. Connect the form

1. Go to **web3forms.com**
2. Enter **contact@cubevia.com** and press create. They email you an access key.
   Submissions go to whichever address you use here, so use the right one.
3. Open `index.html`, find this line (around line 324):

   ```html
   <input type="hidden" name="access_key" value="PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE">
   ```

4. Replace `PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE` with your key. Keep the quotes.

That is the whole job. The form already sets a useful subject line, marks the sender as
"Cubevia website", and carries two spam honeypot fields. Until you paste the key, the form tells
visitors it is not connected instead of failing silently.

Free tier is 250 submissions per month, well beyond what you will see at launch.

---

## 4. Put both domains on Cloudflare

You own `cubevia.com` and `cubevia.co.uk`. Keep them registered at GoDaddy but move their **DNS**
to Cloudflare. That single move gives you free hosting, free email forwarding and a free
redirect, all in one dashboard.

1. Sign up at **dash.cloudflare.com**
2. **Add a site** → `cubevia.com` → choose the **Free** plan
3. Cloudflare scans your existing DNS records. **Check the list before continuing.** If you
   already have email or verification records on the domain, make sure they came across.
4. Cloudflare gives you two nameservers, something like `ana.ns.cloudflare.com`
5. In **GoDaddy**: My Products → `cubevia.com` → **DNS** → **Nameservers** → **Change** →
   **I'll use my own nameservers** → paste both Cloudflare ones → save
6. Repeat steps 2 to 5 for `cubevia.co.uk`

Nameserver changes usually take 10 minutes to a few hours. Cloudflare emails you when the domain
is active.

### Then turn on email forwarding
In Cloudflare, with `cubevia.com` selected: **Email** → **Email Routing** → follow the setup. Add
a custom address `contact@cubevia.com` forwarding to your personal Gmail, and verify that Gmail
address when prompted. Cloudflare adds the MX records for you.

---

## 5. Deploy

1. Push the site to your GitHub repo:

   ```bash
   git add .
   git commit -m "Cubevia website"
   git push
   ```

2. In Cloudflare: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Authorise GitHub, pick your repo
4. **Framework preset: None. Build command: leave empty. Output directory: `/`**
5. **Save and Deploy**

You get a live URL like `cubevia-site.pages.dev` in about a minute. Open it and check the site
works. Every `git push` from now on redeploys automatically.

### Attach your domain
In the Pages project: **Custom domains** → **Set up a domain** → enter `cubevia.com` → add.
Then do the same for `www.cubevia.com`. Because DNS is already on Cloudflare, the records are
created for you and HTTPS is issued automatically within a few minutes.

### Point .co.uk at .com
Do not attach `cubevia.co.uk` to the Pages project, or you will have two live copies of the site
competing in search results. Redirect it instead:

1. Select `cubevia.co.uk` in Cloudflare
2. **Rules** → **Redirect Rules** → **Create rule**
3. Condition: hostname contains `cubevia.co.uk`
4. Action: **Dynamic redirect**, status **301**, expression:
   `concat("https://cubevia.com", http.request.uri.path)`
5. Deploy

Anyone typing the .co.uk address lands on the .com site, and Google credits everything to one
domain.

---

## 6. Test on the live site

- Submit the form properly and confirm the email arrives at contact@cubevia.com
- Reply to that email and check the reply reaches your own inbox
- Open the site on your phone
- Paste the link into WhatsApp and check the logo preview appears
- Visit `cubevia.co.uk` and confirm it redirects
- Visit a made-up URL like `cubevia.com/nothing` and confirm the 404 page appears

**Only once all of that passes, cancel Aero.**

---

## 7. Editing the site later

Everything visible is in `index.html`, in page order, with comments marking each section.
Change the text, save, push.

Brand colours are the token block at the top of `assets/css/styles.css`. Change `--gold` once
and it updates everywhere.

The placeholder graphics in `assets/img/` (`hero.svg`, `about.svg`, `contact.svg`) are branded
blueprint drawings. Real photography will do more for credibility when you have it. Save new
files into that folder and update the three `<img src=...>` lines in `index.html`. Keep each
image under 300KB.

---

## 8. What this costs

| | |
|---|---|
| Cloudflare Pages hosting | £0 |
| Cloudflare DNS and redirect rules | £0 |
| Cloudflare Email Routing (forwarding) | £0 |
| HTTPS certificate | £0, automatic |
| Web3Forms, 250 submissions/month | £0 |
| Fonts (Lora, Outfit, SIL Open Font License) | £0 |
| Domains | what you already pay GoDaddy |
| A real sendable mailbox, when you start outreach | £0 on Zoho free, or about £5/month |
