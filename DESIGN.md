---
name: Axel CRM
description: Dark-first multi-tenant ops console — charcoal surfaces, warm cream ink, flame-orange action.
colors:
  primary: "#FC6E20"
  primary-hover: "#e85d10"
  primary-light: "rgba(252, 110, 32, 0.12)"
  primary-light-on-paper: "rgba(252, 110, 32, 0.08)"
  bg-dark: "#1B1B1B"
  bg-elevated: "#323232"
  card-bg: "#2a2a2a"
  surface: "#323232"
  ink: "#FFE7D0"
  body: "#d4c5b4"
  muted: "#9e8f80"
  hairline: "rgba(255, 231, 208, 0.1)"
  hairline-strong: "rgba(255, 231, 208, 0.15)"
  paper-bg: "#f4f4f5"
  paper-surface: "#FFFFFF"
  paper-ink: "#1B1B1B"
  paper-body: "#3f3f46"
  paper-muted: "#71717a"
  paper-hairline: "rgba(0, 0, 0, 0.06)"
  semantic-blue: "#3b82f6"
  semantic-teal: "#14b8a6"
  semantic-green: "#10b981"
  semantic-amber: "#f59e0b"
  semantic-cyan: "#06b6d4"
  semantic-red: "#ef4444"
  on-primary: "#ffffff"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "1.5px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  nav-item: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  page: "24px"
  grid-gap: "20px"
  bento-gap: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-ghost:
    textColor: "{colors.body}"
    rounded: "{rounded.sm}"
  input-outlined:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  card-surface:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.lg}"
  nav-item-active:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav-item}"
  dialog:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
---

# Design System: Axel CRM

## Overview

**Creative North Star: "The Warm Forge Console"**

Axel CRM is a dark-first operational console: charcoal metal, warm cream ink, and a single ember of flame orange for action. It should feel like industrial tooling built for long shifts — precise, durable, and quietly heated — not a pastel SaaS brochure or a cold bank-blue back office.

Density is comfortable-to-dense: operators scan tables, KPIs, and nav for hours. Hierarchy is typographic (Outfit for structure, Inter for data) and structural (left rail, sticky frosted toolbar, content on charcoal). The brand accent is scarce and purposeful; semantic chart colors carry meaning without competing with primary actions.

Default theme is dark (`:root`). Light theme (`[data-theme="light"]`) flips surfaces to warm paper while keeping the same flame primary and type pairing.

**Key Characteristics:**
- Dark charcoal canvas with warm cream ink (not pure white-on-black)
- Flame orange (`#FC6E20`) as the only brand action color
- Outfit + IBM Plex Sans pairing; Material Icons Round
- Soft lift elevation: hairlines + ambient shadows; hover lift on primary controls and KPI cards
- Shared list-page + form-dialog patterns across 20+ modules

**Visual anti-references (confirmed):** Do not drift back to institutional blue `#123499` / `#0a2472` (stale `frontend/DESIGN.md`), and do not adopt generic purple-gradient “AI dashboard” aesthetics.

## Colors

A warm monochrome charcoal system with a single high-chroma forge accent. Semantic colors are reserved for charts, KPI left borders, and status — never as a second brand.

### Primary
- **Forge Ember** (`#FC6E20`): Primary actions, active nav border, focus rings, logo glow, links. Gradient partner **Ember Deep** (`#e85d10`) on primary buttons.
- **Ember Wash** (`rgba(252, 110, 32, 0.12)` dark / `0.08` light): Nav hover/active fills, icon-button hover, selected options.

### Neutral (dark default)
- **Charcoal Floor** (`#1B1B1B`): App background, sidenav, content canvas.
- **Iron Plate** (`#323232`): Elevated panels, menus, snackbars, form field chrome.
- **Slate Card** (`#2a2a2a`): Cards and dialog surfaces.
- **Warm Cream Ink** (`#FFE7D0`): Primary text and headings on dark.
- **Parchment Body** (`#d4c5b4`): Secondary body text, default icon buttons.
- **Ash Muted** (`#9e8f80`): Labels, placeholders, section captions, disabled.
- **Cream Hairline** (`rgba(255, 231, 208, 0.1)` / strong `0.15`): Borders on dark surfaces.

### Neutral (light theme)
- **Stone Floor** (`#f4f4f5`): Page background (neutral zinc — avoids AI-cream beige).
- **White Plate** (`#FFFFFF`): Cards and elevated surfaces.
- **Night Ink** (`#1B1B1B`): Primary text on paper.
- **Zinc Body** (`#3f3f46`): Secondary text.
- **Zinc Muted** (`#71717a`): Labels.
- **Ink Hairline** (`rgba(0, 0, 0, 0.06)` / strong `0.1`): Borders on paper.

### Semantic (data only)
- Clients / info: `#3b82f6` · Leads / system: `#14b8a6` (teal — never purple/violet) · Revenue / won: `#10b981` · Pipeline / caution: `#f59e0b` · Secondary metric: `#06b6d4` · Expense / lost / error: `#ef4444`

### Named Rules
**The One Ember Rule.** Brand orange appears on primary CTAs, focus, active nav, and sparse accents. It does not fill large backgrounds or entire cards.

**The Warm Ink Rule.** On dark, text is cream/parchment — never pure `#ffffff` for body copy. On light, ink is near-black charcoal, not cool slate-blue grays from the old system.

**The Blue Is Dead Rule.** `#123499` and blue sidenav fills are retired. New work must not reintroduce them.

## Typography

**Display Font:** Outfit (sans-serif fallback)
**Body Font:** IBM Plex Sans (system-ui fallback)
**Icons:** Material Icons Round (fallback Material Icons)

**Character:** Outfit carries structure — bold, slightly tight tracking, industrial-clean. IBM Plex Sans carries dense operational data — engineered, readable at 13–14px in tables and forms (not Inter).

### Hierarchy
- **Display / page title** (Outfit 700–800, 28px → 22px mobile, letter-spacing -0.02em / -0.5px): List and dashboard page titles.
- **Headline** (Outfit 700, ~22px): KPI values, strong secondary headings.
- **Title** (Outfit 600–700, 16–20px): Card titles, logo wordmark (20px / 800), dialog titles.
- **Body** (IBM Plex Sans 400–500, 14px): Default UI copy, table cells, form values.
- **Body small** (IBM Plex Sans 400–500, 13–13.5px): Nav items, compact lists.
- **Label / section** (Outfit 700, 10px, uppercase, 1.5px tracking): Sidenav section labels (CRM, Operações, etc.).
- **Caption** (Inter 500–600, 11–12px): KPI labels, metadata, breadcrumbs.

### Named Rules
**The Two-Face Rule.** Structure (titles, nav, KPIs) is Outfit. Data density (tables, fields, long copy) is IBM Plex Sans. Do not invent a third family or reintroduce Inter.

## Layout

App shell is the spatial law: fixed left sidenav (~265px) + sticky frosted top toolbar + content padding 24px (12px on mobile). Content often max-widths around 1200–1400px centered.

- **Sidenav:** Dark floor, hairline right border, header band with logo. Nav items 44px tall, 10–12px horizontal inset, 10px radius. Section labels with generous top padding.
- **Toolbar:** Sticky, `backdrop-filter: blur(16px)`, semi-transparent charcoal, hairline bottom. Icons muted until hover.
- **List pages:** Header row title left / primary “Novo” action right; optional KPI strip; table + paginator.
- **Dashboard:** KPI auto-fill grid (`minmax(220px, 1fr)`, gap 20px); bento grid 3 columns → 2 at 1024px → 1 at 768px, gap 24px.
- **Breakpoints:** Mobile treatment at 768px (overlay sidenav, tighter padding); dense KPI at 480px (2 columns).
- **Rhythm:** 4 / 8 / 12 / 16 / 20 / 24px scale; page padding 24px.

### Named Rules
**The Shell Is Sacred.** New authenticated screens live inside the shell content region with breadcrumbs — they do not invent alternate app chrome.

## Elevation & Depth

Hybrid: tonal charcoal layers + soft ambient shadows. Surfaces rest on hairlines; interactive pieces lift slightly.

### Shadow Vocabulary
- **Card rest** (`0 4px 18px rgba(0, 0, 0, 0.15)` / list KPI `0 4px 20px rgba(0, 0, 0, 0.1)`): Cards and KPI tiles.
- **Card hover** (`0 12px 30px rgba(0, 0, 0, 0.25)` / lighter list variant): KPI/card hover with `translateY(-2px…-4px)`.
- **Dialog** (`0 20px 50px rgba(0, 0, 0, 0.4)`): Modal depth.
- **Menu** (`0 10px 25px rgba(0, 0, 0, 0.3)`): Dropdowns and notification panels.
- **Primary button** (`0 4px 12px rgba(252, 110, 32, 0.2)` → hover `0 6px 16px rgba(252, 110, 32, 0.35)`): Ember glow under CTAs.
- **Login card** (`0 8px 32px rgba(0, 0, 0, 0.4)`): Auth stack.

Toolbar and sidenav header use frosted glass (`backdrop-filter`) rather than heavy drop shadows.

### Named Rules
**The Soft Lift Rule.** Elevation responds to interaction: rest is flat-ish (hairline + low shadow); hover and modal states earn stronger shadows and slight Y translation. Avoid permanent heavy drop shadows on static layout chrome.

## Shapes

- **Controls** (buttons, inputs, snackbars): gently curved **8px**.
- **Menus / selects / smaller panels**: **12px**.
- **Dialogs, cards, login**: **16px**.
- **Dashboard KPI / bento emphasis**: **20px**.
- **Nav items**: **10px** (active item squares off the left edge against the 3px ember bar).
- Borders are cream/ink hairlines, not hard black rules. Icon wells often **12–14px** radius inside KPI cards.

### Named Rules
**The Consistent Corner Rule.** Prefer the radius scale above. Do not introduce pill-everything or sharp zero-radius Material defaults that fight the system.

## Components

### Buttons
- **Shape:** 8px radius; primary weight 600, slight letter-spacing.
- **Primary:** Gradient `135deg` forge ember → ember deep, white label, ember-tinted shadow; hover `translateY(-1px)` + stronger glow.
- **Text / ghost:** Body-colored label, 8px radius, weight 600.
- **Icon:** Muted body color; hover ember wash background + ember icon.
- **Focus:** Outlined fields and interactive chrome use ember outline/caret — match primary focus language.

### Cards / Containers
- **Corner:** 16–20px depending on prominence.
- **Background:** `var(--card-bg)` / surface tokens; hairline border.
- **KPI signature:** Left accent border 4–5px in a **semantic** color; 48–52px icon well; Outfit value + muted uppercase/small label.
- **Bento:** Larger padding (24px), optional double/full width spans on dashboard.

### Inputs / Fields
- **Style:** Outlined MDC fields on card background; hairline outline idle; ember on hover/focus; muted labels.
- **Readonly / disabled:** Elevated background, muted text, default cursor.
- **Dialog forms:** Dynamic `FieldDef` builder; Cancel (stroked) + Save (primary).

### Navigation
- **Sidenav:** Muted labels/icons at rest; hover brightens to ink + ember icon shift; active = left 3px ember bar + gradient ember wash.
- **Section labels:** 10px uppercase Outfit.
- **Mobile:** Overlay sidenav under 768px.
- **Toolbar:** Frosted, muted icon buttons, notification badge, user menu.

### Tables (list-page)
- Material table + sort + paginator (5/10/25/50).
- Row actions: view / edit / delete icon buttons following global icon-button states.
- Loading spinner, empty inbox state, error + retry — always present patterns.

### Auth (login/register)
- Centered card on charcoal gradient floor; 16px radius; forge icon; cream title; primary full-width submit ~48px tall.

### Charts
- Chart.js with semantic series colors (green vs red financial trend; multi-hue funnel). Not brand-orange dominated.

## Do's and Don'ts

### Do:
- **Do** use CSS variables (`--primary`, `--ink`, `--card-bg`, etc.) so dark/light themes stay in sync.
- **Do** keep primary CTAs on forge ember and data status on the semantic palette.
- **Do** reuse list-page + form-dialog patterns for new CRUD modules.
- **Do** set headings with Outfit 700 and body/data with IBM Plex Sans.
- **Do** treat dark as the default authority; light is the alternate theme, not a second brand.

### Don't:
- **Don't** reintroduce institutional blue `#123499` / `#0a2472` sidenavs or primary gradients.
- **Don't** use pure white body text on dark or cool gray Tailwind defaults that ignore cream ink.
- **Don't** flood screens with orange backgrounds — ember is the action accent, not a wash.
- **Don't** invent a third font family or reintroduce Inter / purple-violet accents.
- **Don't** copy generic purple SaaS dashboard tropes as brand identity.
- **Don't** invent testimonials, customer logos, or marketing chrome inside the ops shell.
