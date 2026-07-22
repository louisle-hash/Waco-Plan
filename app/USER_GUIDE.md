# User Guide — WACO Production Plan App

Written for shop-floor staff. No technical background needed.

---

## 0. Before you start

- The app needs **an internet connection** to run — data (products, weekly plans) lives on a shared
  server (Supabase), not separately on each machine anymore.
- **Open it on any machine and you see the same data** — when someone else edits the weekly plan,
  you see the update almost instantly, no need to reload the page.
- The first time you open the app (on each machine) you'll see a **Log in** screen — type the
  plant's shared password. Once logged in, that machine stays logged in until you click Log out.
- Because the data is shared, **anyone can edit it** — there is no per-user permission system in
  this version. Be careful when editing or deleting, especially on the Settings screen.

The sidebar on the left has: **Overview · Weekly Plan · Product Data · Labels · Settings · User
Guide · Log out**.

Use the **Collapse** button at the bottom of the sidebar to shrink it to icons only. This gives the weekly table more room, which helps when you show all seven day columns.

To switch language, use the **Language** buttons near the bottom of the sidebar. Your choice is remembered.

If you see a red banner saying **"Could not load the latest data — check your network
connection"** at the top of a page: the network has an issue and what's on screen may not be the
latest. Check your wifi and try again.

---

## 1. First step: load the product catalogue

You need products in the catalogue before you can build a weekly plan.

### Option A — Bulk import from Excel (recommended to get started)

1. Go to **Product Data**.
2. Click **Import from Excel**.
3. If you do not have a correctly formatted file yet: click **Download Excel template**, open the file, fill in your products, and save it.
4. Click the file box and choose your Excel file.
   - If the file has several sheets, pick the right one under **Sheet to import**.
5. **Step 2 — Map columns**: the app guesses which column is which. Check them:
   - Choose **— skip —** for anything your file does not have.
   - The two fields marked `*` (**SKU**, **Product name**) are required.
6. **Step 3 — Review**: read the preview table.
   - **Red** rows have an error (missing SKU or name) and will not be imported.
   - **Yellow** rows have a SKU that already exists in the app. Choose one:
     - *Skip, keep existing data* (default, safe)
     - *Overwrite with data from the file*
7. Click **Import … products** at the bottom right.

> You can fix the Excel file and import again — matching SKUs will not be duplicated.

### Option B — Create products one at a time

1. Go to **Product Data** → click **Add product**.
2. Fill in **SKU** (must be unique) and **Product name** (both required). Optionally: Size, Product line, PIC, default status colour, Remark.
3. Click **Save**.

### Editing, searching and archiving

- **Search**: type in the Search box (name, SKU or size), or filter by Product line.
- **Edit**: click **Edit** at the end of a row.
- **Stop using a product**: click **Archive**. It disappears from the picker but is **not lost**; tick "Show archived items" to see it again and click **Restore** when needed.

---

## 2. Building the weekly plan (main screen)

Go to **Weekly Plan**. This table mirrors the old Excel sheet.

### 2.1 The header block

- **Week**: week number. Editable, but two weeks cannot share a number.
- **Updated**: the update date. Filled in automatically; you can change it by hand.
- **Revised**: a counter of how many times the table has been edited. It **increases automatically**. Click **Reset** to set it back to 0.
- **Day columns**: choose Mon–Thu (default) or extend up to Mon–Sun.

### 2.2 Colour legend

The panel on the right shows the four agreed colours:

| Colour | Default meaning |
|--------|-----------------|
| Green | Mattress Firm |
| Yellow | Quilting |
| Purple | Priority |
| Red | Put cover |

Click **Edit labels** to change the wording. **The colours themselves are fixed** so that everyone on the floor reads them the same way.

### 2.3 Adding products to the table

1. Click **Add products to table** below the table.
2. Search, then tick the products you want (you can select several at once). Products already in the table are greyed out.
3. If a product is missing from the catalogue, use the **Quick-add a missing product** box at the bottom — enter SKU, Name, Size and click **Create & select**.
4. Click **Add … products**.

### 2.4 Entering quantities and colours

For each product row:

- **Enter a number**: click the cell under the right day and type the quantity.
- **Colour the cell background**: click the **small square** at the right edge of that cell. Each click moves to the next colour: no colour → green → yellow → purple → red → back to no colour.
- **Colour the product name**: click the **product name** in the first column. It cycles the same way.
  (Name colour and cell colour are independent, exactly like the old Excel sheet.)
- **PIC** and **Remark**: type straight into the cell.
- **Remove a row from the week**: click the bin icon at the end of the row. (This only removes it from this week; the product stays in the catalogue.)

These columns calculate themselves — do not type in them:

- **Total** = the sum of every day in that row.
- **Last week** = the total for that same product in the **previous finalized week**.
- The **TOTAL** row at the top sums each day and the grand total.

### 2.5 Printing the plan for the floor (A4 landscape)

Click **Print / PDF (A4 landscape)** at the top right.

The printout is a clean table — no input boxes, no buttons — containing: the logo, the title
WEEKLY PRODUCTION SCHEDULE, the four-colour legend, the Week/Updated/Revised line, the whole plan
with its cell colours, and the TOTAL row.

In the print dialog, set:

- Paper size: **A4**
- Layout / Orientation: **Landscape**
- Scale: **100%** or *Default* — do not choose "Fit to page"
- Turn on **Background graphics** — without it the status colours print blank and lose all meaning

**To save a PDF instead of printing:** in the print dialog choose **Save as PDF** (macOS) or
**Microsoft Print to PDF** (Windows), then click Save.

> If the table runs past one page, the header row (PRODUCT / Total / Monday…) repeats at the top of
> every page, and no product is split across two pages.

> The printed column headings stay in English in both languages, because that is the form the
> factory already knows from the original Excel sheet.

### 2.6 Finalizing a week and starting the next

- **Finalize week**: use this once the plan is settled. The app asks you to confirm, then:
  - The table is **locked** and can no longer be edited (this prevents accidental changes to figures already issued to the floor).
  - This week's totals become the **Last week** column of the following week.
- **Duplicate this week**: creates a new week keeping the product list and PIC but **clearing all quantities**, ready for fresh input. This is the quick way to start each week.
- **New empty week**: creates a completely blank week.
- To look at an older week, pick it from the dropdown next to the title.

---

## 3. Reading the Overview

Go to **Overview**. This screen **recalculates itself** from the weekly plan — nothing to re-enter.

It shows:

- **Planned this week** and **Last week total**.
- **vs. last week**: the difference in units and percent (green = up, red = down).
- **Output by day**: a bar chart. Hover a bar to see the figure.
- **By status group**: how much output, how many cells and how many products sit under each colour.
- **Needs attention**: everything flagged **Priority** or **Put cover** — worth checking every morning.
- The week's **Revised** count.

---

## 4. Printing 4×2 inch labels (landscape)

Go to **Labels**.

1. Pick the week from the dropdown at the top right.
2. Tick the rows you want (or click **Select all**). Only rows that **already have a quantity** appear here.
3. Optional **One label per day**:
   - **Unticked**: one label per product, quantity = the whole week's total.
   - **Ticked**: a separate label for each product on each day.
4. Check the **Preview** panel on the right.
5. Click **Print …** → the browser print dialog opens.

**Important — print settings:**

- Paper size: **4 × 2 inch** (**Landscape** orientation)
- Margins: **None**
- Scale: **100%**, do NOT choose "Fit to page"
- Turn on **Background graphics** to print the coloured status band

Each label prints on exactly one page, in the same order as the rows in the plan.

The label is intentionally minimal: just the **status colour band + week number** at the top, then
the **product name and size in large text** — so workers can read it from a distance once it's
stuck on the mattress. No logo, SKU, quantity, PIC or remark.

> Long product names automatically shrink to fit the label without overflowing.

---

## 5. Settings

Go to **Settings** to change the brand identity:

- **Brand name** and **Logo** (PNG, max 1.5MB) — the logo appears in the sidebar and on printed labels.
- **Brand colours**: click a colour swatch, or type a hex code such as `#041E42`. The interface updates instantly so you can preview.
- **Fonts**.
- Click **Save settings** to keep your changes, or **Restore defaults** to return to the standard American Star colours.

> **The four production status colours cannot be changed here** — they are a shared shop-floor convention, deliberately locked so nobody alters them by accident.

The **Danger zone** at the bottom of the page erases all data (products plus every week). You must type `DELETE ALL` exactly before the button becomes active. **This cannot be undone.**

---

## 6. Common problems

| What you see | What to do |
|---|---|
| No data when opening the app | Check your network connection. If it's still empty, try logging out and back in. |
| Can't log in | Check the shared password is typed correctly (case-sensitive). Ask your admin if you forgot it. |
| Changes don't show up on another machine | Check the network on both machines. The app updates automatically once connected — no reload needed. |
| The "Last week" column is empty | That column only fills in once the previous week has been **finalized**. |
| Cannot edit the weekly plan | That week is finalized (it shows "FINALIZED — read only"). Use **Duplicate this week** to start a new one. |
| Labels print too small or misaligned | Recheck section 4: 4×2 inch paper (Landscape), margins None, scale 100%, no "Fit to page". |
| Labels print without the colour band | Turn on **Background graphics** in the print dialog. |
| The plan prints portrait and the right columns are cut off | Choose **Landscape** in the print dialog. |
| The plan prints without cell colours | Turn on **Background graphics** in the print dialog. |
| Excel import shows red rows | Those rows are missing a SKU or a product name. Fix them in the Excel file and import again. |
| Imported products do not appear | The SKUs probably already existed and you chose "Skip". Choose "Overwrite with data from the file" and import again. |

---

## 7. Recommended practice

- Finalize the week **as soon as the plan has been issued to the floor**, so last week's figures stay accurate.
- Check **Needs attention** on the Overview at the start of each shift.
- Since several machines can edit at once with no conflict warning, avoid two people editing
  **the same row** at the same time — whoever saves last overwrites the other.
