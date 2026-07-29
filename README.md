# Guest House Visitor Management + Admin Dashboard

A Next.js app for guest-house visitor check-in, token-based punch-out, and a live
admin dashboard. **Google Sheets is the database** — every record lives in one
spreadsheet you own.

## What it does

- **Public form** (`/`) — two tabs, no login:
  - **Check In:** visitor fills their details → gets a short **token** (`GH-042`) to
    copy or screenshot. Records the punch-in time automatically.
  - **Punch Out:** visitor enters their token → the actual departure time is saved.
- **Admin dashboard** (`/admin`) — email + password login, restricted to a fixed
  list of admin accounts (no third-party sign-in):
  - Live stat cards: rooms occupied now, currently in-house, check-ins today,
    punch-outs today, total visitors.
  - Searchable / filterable table of all visitors.
  - Add a visitor, edit any field, or punch anyone out on their behalf.

All timestamps are in **IST (Asia/Kolkata)**.

## Google Sheet columns

`Token · Visitor Name · Company · Room No · Designation · Mobile · Arrival ·
Expected Departure · Purpose · Reference · Punch-In · Punch-Out · Status ·
Entered By · Created At`

`Status` is `Checked-In` until Punch-Out is filled, then `Checked-Out`.

---

## One-time setup

### 1. Create the Google Sheet
Create a blank spreadsheet. Copy its ID from the URL:
`docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`. The app creates the
`Visitors` tab and header row for you on first init (step 5).

### 2. Service account (lets the app read/write the sheet)
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → Enable APIs** → enable **Google Sheets API**.
3. **APIs & Services → Credentials → Create credentials → Service account**.
4. Open the service account → **Keys → Add key → JSON**. Download it.
5. **Share the spreadsheet** with the service account's email (the
   `client_email` in the JSON) as **Editor**. *This step is essential.*

### 3. Admin login accounts
There is no third-party sign-in. Admins are defined by the `ADMIN_USERS` env var as
`email:password` pairs. Only these accounts can open `/admin`:

```
ADMIN_USERS=ratnesh.yadav@nuvoco.com:StrongPass1,scp.guesthouse@nuvoco.com:StrongPass2
```

Choose strong passwords. Passwords must not contain a comma (the pair separator).
To add/remove an admin later, just edit this variable (and redeploy on Vercel).

### 4. Environment variables
Copy `.env.local.example` → `.env.local` and fill every value. `GOOGLE_PRIVATE_KEY`
comes from the service-account JSON — keep the surrounding quotes and the `\n`
sequences. Generate `AUTH_SECRET` (used to sign the session cookie) with
`openssl rand -base64 32`. Set `ADMIN_USERS` as described above.

### 5. Install & run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`. Sign in at `/admin` with an allowlisted account, then
initialize the sheet header once:
```bash
# while signed in as admin, from the browser console on /admin, or via curl with a
# session cookie — easiest is to just trigger it once:
curl -X POST http://localhost:3000/api/init --cookie "<your-session-cookie>"
```
Or simply submit one check-in from `/` — the append also works once the tab exists.
The `/api/init` route (admin-only) creates the `Visitors` tab + headers if missing.

---

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add every variable from `.env.local` to **Vercel → Project → Settings →
   Environment Variables**.
3. Deploy, then repeat the check-in → punch-out → admin flow on the live URL.

---

## Notes & limitations

- **Token concurrency:** tokens are sequential (`GH-042`) derived from the current
  max in the sheet. Two *simultaneous* check-ins could theoretically collide. Guest
  house volume makes this negligible; revisit if you expect bursts.
- **Auth model:** anyone with the link can check in / punch out (by design — visitors
  aren't asked to log in). Only the `ADMIN_USERS` accounts reach `/admin`, guarded by
  a signed, httpOnly session cookie (12-hour expiry).
- **Arrival field** stores the value the visitor picked (planned/expected). The
  punch-in and punch-out columns hold the real system-recorded times.

## Project structure

```
app/
  page.tsx                       Public check-in / punch-out
  admin/login/                   Email + password sign-in
  admin/(protected)/             Guarded dashboard shell + page
  api/visitors, punch-out,       Route handlers (create/list/edit/punch/stats/init)
      visitors/[token], stats, init, login, logout
lib/     sheets.ts · token.ts · time.ts · auth.ts · session.ts · validation.ts
components/ VisitorForm · TokenCard · PunchOutForm · StatCards · VisitorTable
middleware.ts                    Protects /admin + admin APIs
```
