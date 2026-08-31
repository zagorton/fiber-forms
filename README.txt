T-FIBER INSTALL FORMS - two forms in one app
============================================

WHAT IT DOES
  Tab "T-Fiber Checklist" -> fills the T-Fiber Home Internet Installation
                        Checklist. Exports a PDF for the customer, plus a JPG
                        for the office app and Google Drive.
  Tab "Fiber City FCS2"   -> fills the Fiber City Stage 2 Completion Form,
                        captures the customer signature on screen, and
                        exports a JPG you upload to the office.

  Router placement defaults to Table/Surface and Router Model to Nokia; both
  are remembered. Fields the crew rarely fills - drop type, NID/ONT optical
  power, router MAC, hardwired speed test - sit under "More fields
  (optional)" so the everyday screen stays short.

  Fields that exist on both forms are typed once. Customer Name, ONT optical
  power, Router Serial # and Router MAC flow from the checklist into FCS2.
  Router Model containing "Nokia" circles Nokia Beacon on FCS2 automatically.
  Technician Name is remembered between jobs.

WHY IT HAS TO GO ONLINE
  iPhones cannot open a local .html file in Safari - the Files app only
  offers Quick Look, which does not run the app properly. Once it lives on a
  real web address it works the same on iPhone and Android, and it keeps
  working with no signal after the first load.

OPTION A - Netlify Drop (easiest, ~3 minutes, free)
  1. On a computer open:  https://app.netlify.com/drop
  2. Drag this whole FCS2_site FOLDER onto the page (the folder, not the zip).
  3. In about 20 seconds you get a link like:
        https://something-random-1234.netlify.app
  4. Send that link to every technician.

OPTION B - GitHub Pages
  1. Free GitHub account, new PUBLIC repository.
  2. Upload every file from this folder into it.
  3. Settings > Pages > Deploy from a branch > main > / (root) > Save.
  4. Your link: https://YOURNAME.github.io/REPONAME/

ON EACH PHONE (iPhone AND Android)
  1. Open the link - Safari on iPhone, Chrome on Android.
  2. Share button / three dots.
  3. "Add to Home Screen".
  4. Open it from the new icon. Full screen, and works offline after the
     first open.

DAILY USE
  1. Tab 1, fill the checklist, "Create PDF for customer", then "Share / Send"
     to text or email it to the customer.
  2. Tab 2, most fields are already filled. Add ONT Serial #, tap the
     signature box, hand the phone to the customer, tap Done.
  3. "Create JPG to upload", save it to the gallery, upload as usual.
  4. "Clear the checklist" / "Clear the FCS2 form" before the next job.

PRIVACY
  Nothing is uploaded anywhere. Names, serial numbers, Wi-Fi passwords and
  signatures never leave the phone - both documents are drawn on the device.
