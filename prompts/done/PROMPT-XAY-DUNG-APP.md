▶ ĐÃ CHẠY: 2026-07-19 · kết quả: OK (có bổ sung tool import Excel ngoài prompt gốc) · output tại: `app/` (mã nguồn) + `ban-phat-hanh/` (bản dùng ngay)

# Prompt xây dựng App Lập Kế Hoạch Hàng Ngày/Tuần

🎯 Target: Claude Code

**Trước khi dùng:** đính kèm file `BRAND-CONFIG.md` (đã điền logo + màu) và ảnh chụp bảng kế hoạch tuần mẫu khi paste prompt dưới đây vào Claude Code.

---

```
<context>
Building a production-planning web app from scratch for a mattress manufacturing plant. No existing codebase. Single user, desktop-first, fully offline: all data persisted client-side (IndexedDB), no backend server, no auth, no API calls.

Reference material: a legacy Excel-based weekly plan (screenshot will be attached to this session) with this exact structure:
- Header rows: "Week: [number]", "Updated: [date]", "Revised: [count]"
- A color legend (top-right): green = Mattress Firm, yellow = Quilting, purple/pink = Priority, red = Put cover
- Main table columns: Product | Total | Last week | Monday | Tuesday | Wed'day | Thursday | PIC | Remark
- A totals row summing each day column and the grand total
- Individual product rows show a quantity under whichever day it's scheduled, with the cell background colored per the legend; some product names are rendered in colored text as a secondary highlight independent of cell background
- A BRAND-CONFIG.md file (attached) defines the brand's logo path, primary/secondary/accent hex colors, font, and the exact status colors — read it and theme the entire UI from it. Do not hardcode colors outside this system.
</context>

<task>
Scaffold a new Vite + React + TypeScript + Tailwind CSS app with IndexedDB persistence (use Dexie). Build exactly 5 deliverables, no more, no less:

0. HUONG_DAN_SU_DUNG.md at project root — a Vietnamese-language user guide covering every screen and workflow below, written for factory staff with no technical background. Numbered steps, plain language. Also render this content inside the app as a "Hướng dẫn sử dụng" nav item.

1. Dashboard screen — aggregates the current week's planning data (from screen 3): total planned units, per-day breakdown (chart), breakdown by status-color category (Mattress Firm / Quilting / Priority / Put cover) with item counts, week-over-week comparison against the "Last week" column, a list of items flagged Priority or Put cover that need attention, and the current Revised count. Must recompute live from screen 3's data — no manual re-entry.

2. Product Data screen — CRUD for product master data: Product Name, Size/Variant (Twin/Full/Queen/King/etc.), SKU/Code (unique, validated), Category/Line, default status-color tag, default PIC, notes. Table view with search + filter, add/edit via modal form, soft-delete (archive, not hard delete). This list is the source for the product picker in screen 3.

3. Weekly Planning screen (core screen — replicate the reference layout precisely):
   - Header bar: Week number, Updated date (auto-set on save, editable), Revised counter (auto-increments on edit, manual reset available)
   - Legend panel: 4 color swatches with editable labels, defaulting to the status colors from BRAND-CONFIG.md
   - Grid table with columns: Product | Total (auto-summed) | Last week (read-only, pulled from the prior saved week) | day columns (default Mon–Thu, must support extending to Mon–Sun) | PIC | Remark
   - Editable quantity per day cell; each cell's background settable to a legend color; product name text independently colorable
   - Totals row summing every day column plus the grand total
   - Add rows via searchable dropdown pulling from Product Data (screen 2), with inline quick-add for new products
   - "Finalize week" action that snapshots the current week immutably so it becomes next week's "Last week" reference; "duplicate previous week" to start a new week from the last one

4. Label Printing screen — prints physical labels at exactly 4in x 6in using CSS `@page { size: 4in 6in; margin: 0 }` and a matching print container, one label per page. Label fields: Product Name, Size/Variant, SKU, Quantity, Week/Date, PIC, and a colored corner banner matching the item's status tag. Batch mode: multi-select rows from the weekly plan and generate one label page per row, in order. Live print preview before triggering `window.print()`.

Settings screen: lets the user edit BRAND-CONFIG.md values (logo upload → saved to /public/brand/, colors, font) through a form that writes back to the config file/theme source — never hardcode brand values elsewhere in the codebase.
</task>

<scope>
Allowed actions:
- Scaffold a fresh Vite+React+TS project
- Install only: react, react-dom, tailwindcss, dexie, recharts, react-hook-form, zod — ask before adding anything else
- Create all files under /src, plus the two root-level files named above (HUONG_DAN_SU_DUNG.md, BRAND-CONFIG.md if not already present)

Forbidden actions:
- Do NOT add a backend, API calls, authentication, or multi-user features
- Do NOT add features not listed above (no cloud sync, no notifications, no roles)
- Do NOT hardcode any color that should come from BRAND-CONFIG.md
- Do NOT delete or overwrite BRAND-CONFIG.md if it already contains user-filled values — merge, don't replace

Stop and ask before:
- Choosing between two valid data-schema designs that would be hard to migrate later
- BRAND-CONFIG.md is missing required values and a real (non-placeholder) decision is needed
- Any action that would delete an existing file

Only make the changes directly requested above. Do not add extra abstractions, pages, or polish beyond what's specified.
</scope>

<checkpoints>
After each of the 5 deliverables is built, output: ✅ [what was completed]. At the end, output a full summary of every file created.
</checkpoints>
```

---

⚠️ **Lưu ý:** Prompt này dành cho công cụ agentic có quyền truy cập hệ thống thật (Claude Code). Kiểm tra kỹ phần `<scope>` (được làm gì / cấm làm gì) trước khi paste. Xác nhận đường dẫn thư mục dự án đúng với máy bạn trước khi chạy.
