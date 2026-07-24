# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 2 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/CBMC Africa Website.dc.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `CBMC Africa multi-page prototype` project files (HTML prototypes, assets, components)

## Implementation

The design above has been implemented as a real, working app in **PHP + MySQL** — chosen deliberately so it can run on ordinary cheap shared hosting (cPanel-style), including potentially the same hosting account CBMC Africa's current WordPress site already uses. Visual design was redone in an Apple-inspired style (system font stack, white/gray palette, blue accent, pill buttons, soft depth) per later direction from the client.

- `/public_html` — the entire web root. Upload this folder's *contents* to your host's `public_html` (or equivalent) directory.
  - `*.html`, `css/`, `js/` — the public site
  - `admin/` — the CMS dashboard (`admin/login.html`)
  - `api/` — PHP endpoints (public in `api/`, admin-only in `api/admin/`)
  - `setup/create-admin.php` — one-time admin account creator (**delete this file/folder after first use**)
  - `uploads/` — where the Media Library saves uploaded images
- `/database.sql` — MySQL schema + real CBMC Africa content seed. Import this once via phpMyAdmin (or `mysql -u USER -p DBNAME < database.sql`).

**To run it locally:**

```bash
# 1. Create a database and user in MySQL/MariaDB, then import the schema+seed:
mysql -u root -p -e "CREATE DATABASE cbmc_africa CHARACTER SET utf8mb4;"
mysql -u root -p cbmc_africa < database.sql

# 2. Configure the app:
cd public_html/api/includes
cp config.example.php config.php   # edit DB_HOST / DB_NAME / DB_USER / DB_PASS

# 3. Serve it (for local testing; on real hosting there's no server to start -
#    the host's Apache/PHP just runs the files directly):
cd ../..
php -S localhost:8080
```

Then visit `http://localhost:8080/setup/create-admin.php` **once** to create your admin login, delete that `setup` folder, and sign in at `http://localhost:8080/admin/login.html`.

**To deploy to real shared hosting:** upload the contents of `public_html/` to your host's web root, import `database.sql` via phpMyAdmin, create `api/includes/config.php` from the example with your host's DB credentials, visit `/setup/create-admin.php` once, then delete it.

The donate/"Give" links point out to CBMC Africa's real giving page (`https://cbmcafrica.org/donate/`) rather than an in-app checkout.
