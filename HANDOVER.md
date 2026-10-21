# Fiber Forms — project handover

Internal tool for T-Fiber installation technicians. Replaces filling two paper
forms by hand, photographing them, and uploading everything by hand.

- Live: `https://zagorton.github.io/fiber-forms/`
- Source: GitHub repo `zagorton/fiber-forms`, served by GitHub Pages
- Current version: **v66** (the number lives in `sw.js`)
- Author of the code: built conversationally with Claude, owned by Iurii Zag

---

## 1. What problem it solves

Before, one job meant: fill the T-Fiber checklist on paper, fill the Fiber City
FCS2 form on paper, get the customer to sign, photograph both forms, take
install photos with a separate stamping app, create a folder on the shared
Google Drive, upload everything, then write notes into Skedulo and keep a
private record for the weekly pay sheet.

Now it is one app: shoot photos, fill the two forms once, take the signature on
screen, and one button puts everything into a Drive folder named after the
address. The customer gets a PDF by email. The weekly pay sheet exports itself.

---

## 2. How it is built

One file, `index.html`, about 820 KB. Roughly 790 KB of that is the two blank
forms stored as base64 JPEGs inside the file; the actual program is ~110 KB
(2000 lines of JS, 185 of CSS, 280 of HTML).

Nothing is loaded from the internet at runtime except Google's own scripts when
uploading to Drive. No frameworks, no build step, no npm. Editing means opening
`index.html` and changing it.

**Why a web app and not a real Android/iOS app:** no developer accounts, no app
store review, no separate iPhone and Android versions, and updating everybody
means uploading one file. The cost is that it runs inside the phone's browser
and is limited by what browsers allow — see *Known limits*.

### Files in the repo

| File | Purpose |
|---|---|
| `index.html` | the whole application |
| `sw.js` | service worker: offline cache + version number |
| `manifest.json` | name, colours, icons for "Add to Home Screen" |
| `icon-192/512.png` | icons, artwork fills the tile |
| `maskable-192/512.png` | icons with padding, for Android's circle/squircle crop |
| `apple-touch-icon.png` | iPhone icon, opaque, 180×180 |
| `privacy.html` | required by Google to publish the OAuth app |
| `.nojekyll` | stops GitHub post-processing the files |
| `*.txt` | setup notes for GitHub Pages and Google Cloud |

### How the two blank forms work

The original PDFs were rendered to images once and embedded. Every field
position was measured from the real documents — for the T-Fiber checklist the
coordinates were read straight out of the PDF's own AcroForm widgets, so the
text lands exactly inside the blue boxes. The app draws the blank form onto a
canvas, writes the values on top, and exports a JPEG or a PDF.

The checklist PDF keeps the original Apple and Android app-store hyperlinks,
extracted from the source PDF and rebuilt as PDF link annotations.

---

## 3. The tabs

There are no top tabs any more. **Today** is the home screen (bottom bar Today | Week, gear for Settings). A job is three steps — **Checklist**, **Customer signs** (the FCS2 form), **Close the job** — and every step screen has a strip at the top to jump straight to any of them. Photos and pay are not separate screens: both live on Close the job (photo grid with Add photos, Work done, 2nd visit, total, notes, upload). See section 11.

### Photos
Shoots install photos and stamps them with date, time, street, city, county and
state — the same look as the Timestamp Camera app the crew used before.

The address comes from the Checklist tab, **not from GPS**, because GPS
reverse-geocoding often names the neighbouring house on new builds, and because
it must work with no signal.

Photos are stamped at save/upload time, not at capture, so shooting can start
the second you arrive and the address can be typed hours later. Each photo
carries its own capture time from the file, so the stamp stays truthful.

### Checklist (T-Fiber Home Internet Installation Checklist)
Produces the PDF for the customer and a JPG for the office.

- Paste a whole address into one field and it splits into street / city / state
  / zip. Handles full state names, ZIP+4, trailing "USA", multi-line pastes.
- Speed test shorthand: type `920`, press space → `920mb / `.
- Remembered between jobs: technician name, router model (Nokia), router
  placement (Table/Surface), county, and three of the five Yes/No answers.
- Wi-Fi name and password default to `N/A (Customer Managed WiFi)` every job.
- **Work done** card: feet of line extension, chamber number, splices,
  extenders, second-visit and no-extender flags. Generates the Skedulo note
  text and calculates the pay.
- **Service status** card: changes only the wording of the customer email.

### FCS2 (Fiber City Stage 2 Completion Form)
Customer name, ONT serial, router circled, signature captured on screen.

Values flow from the checklist: customer name → customer name and resident
name, router serial → ONT serial #, router MAC → ONT MAC address, ONT optical
power → GPON at ONT, and the word "Nokia" in Router Model circles Nokia Beacon.

---

## 4. Pay rules

Confirmed against the real `Week7_Sep8-12.xlsx` — all 16 rows matched.

| Item | Rate |
|---|---|
| Install | $85 |
| Line extension | $20 per 30 ft, **always rounded up**; 0 ft = $0 |
| Splice | $10 each |
| Wi-Fi / router extender | $10 each |
| Second visit | $50 instead of the install; splices, line extension and extenders still count |

Rounding examples: 5 ft → $20 · 30 ft → $20 · 31 ft → $40 · 90 ft → $60 ·
91 ft → $80 · 120 ft → $80.

**History & pay** lists the week's jobs with totals and exports a real `.xlsx`
in the same eight-column layout the boss already receives. The spreadsheet is
written by hand in JavaScript — a ZIP of XML parts — because no library was
allowed. It was verified by generating a file and opening it with a real Excel
library.

---

## 5. Google Drive

One button creates `<shared folder> / <address> /` and uploads the stamped
photos plus both forms as JPG. Running it twice on the same address reuses the
folder instead of duplicating it.

**Permission model.** The app asks for one scope,
`https://www.googleapis.com/auth/drive.file`. That is per-file access: it can
only see and change files it created itself, plus the one folder the technician
hands it through Google's own folder picker. It cannot read, list or delete
anything else in the account. This scope is non-sensitive, so the app could be
published without Google verification.

**Setup, once per company:** a Google Cloud project with Drive API and Picker
API enabled, an OAuth consent screen published to production (a home page and a
privacy policy URL are required for that), one OAuth Client ID restricted to
`https://zagorton.github.io`, and one API key restricted to the same origin and
the Picker API. Both values are pasted into each phone once. They are not
secrets — origin restriction is what protects them.

**Setup, once per phone:** paste the two values, pick the shared folder. Each
technician signs in with their own Google account and uploads under their own
name.

---

## 6. Customer email

`Create PDF for customer` → Share → Gmail. The subject and body are generated;
the PDF is attached. The recipient cannot be filled in programmatically —
browsers block that — so the address from the *Customer email* field is copied
to the clipboard and pasted into the To field.

The body changes with **Service status**:

- **Working now** — tested and live.
- **Activating** — provisioned remotely; watch for the solid green PON light;
  usually minutes, sometimes hours; Wi-Fi may appear and drop or say "no
  internet" during activation; leave everything powered on.
- **Waiting on fiber** — the line still has to be connected at the street by
  another crew; PON stays red or off; nothing is needed from the customer.

Every version ends by sending the customer to T-Mobile Fiber support at
844-783-4237 (option 2), explaining that support can check the line remotely.
That paragraph exists for one reason: to stop customers calling the technician
days later about activation delays that are not his to fix.

---

## 7. Where the data lives

Nothing goes to any server except Google Drive, and only when the button is
pressed. There is no backend.

| Data | Storage | Cleared by |
|---|---|---|
| Photos (2048 px JPEG + thumbnail) | IndexedDB `photos` | Clear photos / Start next job |
| Job history for pay | IndexedDB `jobs` | Delete in History |
| Current form values, checkboxes, signature | localStorage, autosaved | the Clear buttons |
| Technician name, router model, county, keys, folder | localStorage | only by clearing site data |
| Telegram bot token, group id, two toggles, unsent messages | localStorage (`tg_*`) | only by clearing site data |
| Arrival time (`arrived`) | localStorage | Start next job |

The app calls `navigator.storage.persist()` at startup. Without it Android
deletes site storage when the phone runs low, which is what kept wiping the
Drive keys and folder.

---

## 8. Bugs that were found and what actually caused them

Worth keeping — the causes are not obvious and could come back.

**Signature disappeared after reopening.** Autosave listened for typing. A
signature is drawn on a canvas, so no input event fires and it was never saved
unless something else was typed afterwards. Fixed by saving explicitly when
Done is tapped.

**Photos vanished when shooting fast.** Two separate causes. First, each
shutter press started its own processing chain, so several 12 MP images decoded
at once and the phone dropped some — fixed with one shared queue. Second, and
the real one: the file input is cleared immediately so the camera can reopen,
and Android then revokes the underlying file. Anything still waiting in the
queue decoded to nothing. Fixed by copying the bytes out before clearing.

**"Unable to complete previous operation due to low memory."** Three layers.
Grid thumbnails were the full-resolution originals — five of them meant 240 MB
of decoded pixels. Both blank forms were held decoded for the whole session —
another 30 MB resident. And each photo was fully decoded before being shrunk.
Now: 300 px thumbnails, forms decoded only while drawing, and the JPEG header
is parsed so the browser decodes straight to the final size. Peak went from
about 66 MB to about 9 MB per photo.

**Google Drive kept asking to reconnect.** Not a bug in the Drive code —
Android was evicting localStorage under memory pressure, taking the keys and
folder with it. Addressed by requesting persistent storage.

**Button icons disappeared after one press.** The busy-state helper saved and
restored `textContent`, which silently deleted the inline SVG.

**Previews drawn without the form behind them.** On a cold start the blank form
images had not decoded yet. Now anything that draws a form waits for it.

**iPhone appeared broken.** iOS will not open a local `.html` file properly —
the Files app only offers Quick Look, which does not run the app. This is an
Apple restriction, not a bug. The app must be opened from the web link.

---

## 9. Known limits

- **It is a browser app.** It will never be as bulletproof as a native app.
  Memory is the ceiling, and heavy phones with little free RAM are the risk.
- **The recipient of an email cannot be pre-filled** by any web app.
- **Files cannot be written to a chosen phone folder.** Downloads only. The
  directory picker exists in Chrome for Android since v132 but is unreliable,
  and Safari does not support it at all.
- **Home-screen icons are baked in when added.** Changing the icon means
  deleting the shortcut and adding it again.
- **The repo is public**, because GitHub Pages needs it on the free plan. It
  contains blank company forms — no customer data ever — but that is worth
  being aware of.
- **Updating** means uploading `index.html` and `sw.js` and bumping the version
  in `sw.js`, otherwise phones keep the cached copy. Phones pick up the new
  version on the second open.

---

## 10. Where this could go next

Ordered by value for effort, honestly assessed.

**Worth doing**

1. *Job history is already stored* — the next easy step is reopening a past job
   to re-send a PDF or re-upload files.
2. *Barcode scanning for serial numbers.* `ALCLFDFFF123` typed by hand is the
   most error-prone field in the whole app, and a wrong character means a wrong
   work order. The camera can read the ONT label.
3. *Upload retry* — done in v56 (see section 11). Still manual: the technician taps Upload again.
4. *Second-visit link.* A second visit is currently a flag; linking it to the
   original job would make the pay sheet self-explanatory.

**Probably not worth it**

5. *Rebuilding Skedulo.* The schedule, customers and job numbers live in the
   company's system. Getting at them needs API access that an employer grants,
   not a technician. Re-typing the day's jobs into a second app is work, not
   savings. If Skedulo ever syncs jobs into Google Calendar, reading that
   calendar becomes easy — the Google sign-in already exists — but that has to
   be checked first.
6. *A native app.* Would solve the memory ceiling and allow proper background
   uploads, but means two codebases, two developer accounts and store reviews.
   Only worth it if the crew grows well beyond a handful of technicians.

**Housekeeping**

- Keep `Fiber_Forms_site.zip` somewhere outside GitHub as a backup.
- If more technicians join, the two Google values and the link are all they
  need; nothing in Google Cloud has to be repeated.

---

## 11. Changes after v39 (up to v66)

**Pay tab and history**
- *Save to pay* stores a visit without photos or forms (second visits, quick jobs). Saving twice updates the same job, it never duplicates.
- *Edit job* sheet (tap a row in History): day, address, customer, feet, splices, extenders, chamber, 2nd visit, notes. *+ Add job* uses the same sheet for jobs entered by hand.
- Uploading to Drive now also writes the job to History straight away; Start next job closes it.
- Chamber # opens the numeric keypad.
- The "No extender in stock" switch was removed.
- *History* has Mon–Sat day bars: tap a day to see only that day. Totals and Excel always cover the whole week.

**Telegram group** (Settings → Telegram group)
- A bot posts the job report to a private group after a successful Drive upload, once per job: address, blank line, notes, blank line, ✅ or ❌ and the total. ❌ means *Waiting on fiber* is on (not activated), ✅ otherwise.
- *Export week to Excel* sends the file to the group; if Telegram fails it saves to the phone.
- Without signal the message waits in `tg_pending` and goes out later.
- Setup, once per phone: create a bot in @BotFather (the name it asks for is the *bot's* name), paste the token, add the bot to the group, write `/start@botusername` in the group, tap Find group, tap Test. The token is a secret, stored only on the phone.
- Requests are plain form posts to `api.telegram.org`, so no preflight is needed.

**Photos**
- *I arrived* stores the arrival time. *Add from gallery* then skips photos older than arrival (5 minute margin) and ones already added, so the whole gallery can be selected at once. Cleared by Start next job.

**Signing**
- The sign pad covers the whole screen on frosted glass, so the customer cannot read money behind it. Leaving it is Done (see v66).

**Today tab** (opens first)
- Total and job count for today (tap → History), the five steps of the current job with ticks (tap → that tab), and today's saved jobs (tap → Edit).

**Upload retry**
- If the signal drops mid-upload, the next tap on Upload sends only the files not yet sent for that address (key: folder + file name + size). A form that was changed meanwhile is sent again.

**Look (v57)** — a copy of the version before the redesign is in `backup_2026-10-18/index_v56_before_redesign.html`
- New palette (calmer greys, one pink action colour `--magenta`, blue only for links and selected chips), 18 px cards, flat white header with underline tabs, roomier fields and buttons. Everything is driven by the CSS variables at the top of `index.html` plus the "v57 look" block at the end of the stylesheet.
- Font is the phone's own (Roboto / system). A web font was left out on purpose: the app must work offline and load nothing from the internet.
- *Hide amounts* (Settings → Privacy, or the eye button on Today and Pay; on by default): money on Today, Pay, History and the Edit sheet is blurred. It changes only the screen, never the Telegram text or the Excel file. Stored in `localStorage` key `hm`.

**Navigation and Close the job (v58)** — the version before the new look and navigation is `backup_2026-10-18/index_v56_before_redesign.html`
- The old tab bar is still in the HTML (hidden with CSS) because some code toggles its dots; the real navigation is `setView()`, `NAV` and `navPaint()`.
- *Close the job* (`v-close`): photo count with Add from gallery, pay total with Edit, a preview of the Telegram message, the upload status and forms preview, and one button *Close job*. It saves the job to History, uploads to Drive, and the Telegram post follows the upload (`closeJob()` → `driveUpload()` → `tgAfterUpload()`).
- `saveJob` keeps a pending-add promise (`jobAddP`) so two saves in quick succession update one job instead of creating two.

**Screens added in v59** — previous version: `backup_2026-10-18/index_v58_before_screens.html`
- *Customer signs*: the top of the FCS2 screen is a review card (address, customer, router, ONT serial) with a Sign button that opens the sign pad.
- *Upload paused*: while uploading, the status shows "N of M files sent" with a progress bar. On a failure it shows what is waiting, plus **Try again** (sends only the rest) and **Send later** (back to Today; the job stays saved but not sent).
- *Job closed*: after a successful upload the Close the job screen turns into a confirmation (files on Drive, Telegram Posted / Waiting / Not set up, amount added to the week) with Back to Today, Open Drive folder and Edit and send again. State lives in `closedView`, cleared by Start next job.
- *Today*: an "In progress" card with a progress ring (steps done of 4) and "Next: …", the steps list, "Done today" with green ticks and send time, a **New job** button (asks before clearing a job in progress), gear for Settings.
- *Week*: History opens as a page with the bottom bar Today | Week still visible; the Excel button reads "Send week to group" when Telegram is set up.
- *Settings*: Connected / Not connected badges next to the Drive folder and Telegram group.

**Flow rework (v60)** — previous version: `backup_2026-10-18/index_v59_before_flow.html`
- The Photos screen and the Pay screen are gone as separate screens; `setView("photos")` and `setView("work")` are aliases for the Close the job screen. Photos are normally imported from the gallery in the car, so they belong at the end of the job.
- Work done inputs, 2nd visit, the total and the Skedulo notes are directly on Close the job (no Edit step). The History entry point `#openHistory` is a hidden button so the Week tab and the Today card can still click it. `#savePay` is hidden; **Close job** saves the job itself.
- Customer signs has one signature slot, inside the review card.
- Arrival time is automatic: **New job** (or tapping "No job open") stores it, and so does the first camera photo if none is set. "Arrived 2:14 PM · tap to reset" appears on Close the job; gallery imports skip photos older than that.
- Settings is reached only from the gear on Today.

**Tidy-up (v61)** — previous version: `backup_2026-10-18/index_v60_before_tidy.html`
- Today shows only the earnings card and the "in progress" card (tap = go to the next step). The steps list and the tappable earnings card were removed: Week in the bottom bar is the way to History.
- Text on screen can no longer be selected by a long press (only text fields). Set in the stylesheet: `body{user-select:none}`, `input,textarea{user-select:text}`.
- On Customer signs, the customer name and resident name fields are hidden. They still exist and follow the Checklist name while untouched (`paintReview()`), so the FCS2 image gets them as before.

**v62**
- "No job open" on Today is plain text now; the only way to start is the New job button.
- The Camera button and the "Arrived …" line on Close the job are gone (the camera input still exists for code that uses it). Arrival is still stored quietly by New job and used to skip older photos on gallery import.
- `freshStamp()`: whenever the job is empty (no customer, no street, no photos, no signature) the checklist Day & Time and the FCS2 date are set to now — at app start, on New job and when opening Checklist or Customer signs. Before this, the last job's stamp was restored and had to be cleared by hand. Photo stamps are unrelated: each photo keeps its own capture time from the file.

**v64–v65**
- Today earnings card shows the last working day before today (labelled "Yesterday", or the weekday name) with its total and job count and "Great work. Let's beat it today.", but only before the first job of the day: it fades away once a job is open or saved (`.tdy.gone`). Blurred by Hide amounts. Code in `paintToday()` (`jobsAll()`), elements `#tdYest`, `#tdYAmt`, `#tdYMsg`.
- "Done today" is capped so the route animation fits one screen: newest first, 2 rows while a job is open, 4 when not, then a "Show all N jobs" / "Show less" row (`tdAll`). `#v-today` has 100 px bottom padding so New job does not cover the last row.

**v66**
- Sign pad: the "Please sign below" heading, the hint line and the "Hold to go back" button are gone. The background is frosted glass (`backdrop-filter: blur(22px)` over a 42% dark layer; a nearly opaque fallback where the browser lacks backdrop-filter), so the screen behind is only a vague shape and amounts cannot be read. The only ways out are Done (also with an empty pad) and Clear.

**Not done**
- Auto email to the customer, Skedulo address import, serial barcode scan, work while the app is closed: skipped on purpose (cost vs value or browser limits).
- Telegram was tested with a mocked API only; real use confirmed by the owner.

A copy of the previous handover is in `backup_2026-10-18/HANDOVER_v39.md`.

### v63 — Today guides you
- Today now has three animated states instead of the old ring card: **route** (Checklist → Customer signs → Close the job on one line; the current step pulses, a slow dot (5 s) runs to it, tap a step to jump), **sending** (big ring "8 / 14 files sent" with Drive and Telegram rows, shown while the upload and the Telegram post run), **no signal** (orange banner plus a "waiting for signal" queue of what will go on its own; shown above the route while offline).
- Code: `sendSt`/`sendSet()` track the send phase (prep / up / tg), set in `driveUpload` and `tgAfterUpload`; `tdActiveHtml`, `tdRouteHtml`, `tdSendHtml`, `tdOfflineHtml` render; `online`/`offline` events repaint Today. CSS block "Today guidance (v63)". All animation stops with "reduce motion".
