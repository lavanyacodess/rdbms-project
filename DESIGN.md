---
name: CampusConnect
description: "Campus Field Notebook — a shared field notebook for campus life."
colors:
  ink: "#17211c"
  ink-soft: "#4e5a52"
  ink-faint: "#646f66"
  cool-paper: "#eef0e9"
  paper-raised: "#f8f9f3"
  paper-deep: "#e2e5db"
  margin-red: "#b83c2e"
  highlighter-amber: "#e8b84a"
  approved-green: "#2e6b57"
  pending-amber: "#8a5a12"
  danger-red: "#a33127"
  rule: "#c9cec2"
  rule-strong: "#9aa298"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(3rem, 7.4vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(1.65rem, 3vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.038em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0em"
  label:
    fontFamily: "Spline Sans Mono, monospace"
    fontSize: "0.7rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1em"
  meta:
    fontFamily: "Spline Sans Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  none: "0"
  sm: "1px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "72px"
  gutter: "60px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.68rem 0.95rem"
  button-primary-hover:
    backgroundColor: "#29362e"
    textColor: "{colors.paper-raised}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.68rem 0.95rem"
  input-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.62rem 0.08rem"
  chip:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.38rem 0.6rem"
  file-tab:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.3rem 0.55rem"
  paper-slip:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "1.1rem"
  stamp-approved:
    backgroundColor: "transparent"
    textColor: "{colors.approved-green}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.16rem 0.45rem"
  ledger-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.85rem 0"
---

# Design System: CampusConnect

## Overview

**Creative North Star: "The Campus Field Notebook"**

CampusConnect should feel like a shared notebook someone actually uses: a cool paper page, a red margin, index tabs, taped-in slips, stamped statuses, ledger rows, and highlighter marks. The interface is editorial rather than dashboard-generic. It is built for students between classes and club admins keeping a club running, so the notebook has to be legible and quick before it is expressive.

The system works in two registers. Persuade surfaces, led by the landing page, can be more expansive: display type, a marked headline, a taped "Today on campus" slip, and a ruled term rail. Operate surfaces — directories, event and club detail, announcements, dashboards, admin forms — use the same paper world but let scanability, familiar controls, and task completion lead. The world is carried by structure and material, not by decoration on top of a generic layout.

**Key Characteristics:**
- Cool paper field with a red margin and one-pixel rules.
- Archivo for display and body; Spline Sans Mono for dates, counts, labels, field notes, and table numerals.
- Squared geometry, taped paper slips, rectangular stamps, file tabs, ledger tables, square ID marks.
- Highlighter amber for emphasis and selection; margin red for the page edge, errors, and destructive actions.
- Flat by default; soft ambient shadows only on lifted paper and hover.
- WCAG 2.1 AA focus, contrast, reduced motion, and responsive tables.

## Colors

The palette is a cool paper field with ink, one red margin accent, and a highlighter amber. Color is structural: it tells you where the page edge is, what is selected, and what state something is in.

### Primary
- **Field Ink** (#17211c): Display and body text, primary buttons, table rules, active focus outlines, and the ink cover of the auth spread. It owns large surfaces and all primary type.
- **Cool Paper** (#eef0e9): The full-bleed page field. It is the notebook page, not a neutral gray backdrop.
- **Paper White** (#f8f9f3): Raised slips, cards, forms, table cells, and the active navigation tab.
- **Paper Deep** (#e2e5db): Table headers, count pills, pressed surfaces, and skeleton states.
- **Margin Red** (#b83c2e): The page margin line, destructive actions, errors, and small ID/date marks. It is a margin and status accent, not a fill color.
- **Highlighter Amber** (#e8b84a): The hero highlight, selected filter tabs, hover fills, focus/selection tint, and small emphasis marks.
- **Approved Green** (#2e6b57): Approved and registered stamps, success states, and membership confirmation.
- **Pending Amber** (#8a5a12): Pending stamps and waiting states.
- **Danger Red** (#a33127): Destructive hover and error emphasis.
- **Rule** (#c9cec2): One-pixel dividers, table row rules, and quiet borders.
- **Rule Strong** (#9aa298): Card borders, input underlines, and the heavier structural rules.
- **Ink Soft** (#4e5a52): Secondary prose and descriptions.
- **Ink Faint** (#646f66): Metadata, hints, and placeholders; it still meets AA on paper.

### Named Rules
**The Red Margin Rule.** Red belongs to the page margin, errors, and destructive actions. It is not a decorative fill and it never becomes a card side stripe.

**The One Highlighter Rule.** Amber marks attention or selection. A screen can have several amber details, but the large highlighter field is reserved for the one phrase or filter that needs emphasis.

**The Cool Paper Rule.** The ground stays cool green-gray. Do not drift toward warm cream, pure white, or blue-black slate; those are different worlds.

## Typography

**Display Font:** Archivo (self-hosted, 100–900)
**Body Font:** Archivo
**Label/Mono Font:** Spline Sans Mono (self-hosted, 300–700)

**Character:** Archivo gives the notebook a sturdy contemporary editorial voice; Spline Sans Mono supplies the measured label and data layer. The pairing is functional, not costume. Mono is reserved for dates, counts, labels, field notes, and table numerals.

### Hierarchy
- **Display** (800, `clamp(3rem, 7.4vw, 5.75rem)`, 0.92, -0.055em): The landing hero only. Keep it tight, but give the highlighted line its own block spacing so descenders never collide with the mark.
- **Headline** (800, `clamp(2.1rem, 4.6vw, 3.5rem)`, 0.98, -0.045em): Page titles.
- **Title** (700, `clamp(1.65rem, 3vw, 2.4rem)`, 1.04, -0.038em): Section headings.
- **Body** (400, 1rem, 1.7): Prose and descriptions, capped at 65–75ch.
- **Label** (600, 0.7rem, 1.4, 0.1em, uppercase): Form labels, buttons, tabs, table headers, and stamps.
- **Meta** (500, 0.75rem, 1.5): Dates, counts, hints, table numerals, and field notes.

### Named Rules
**The Mono Is Data Rule.** Spline Sans Mono is for dates, counts, labels, field notes, and table numerals. Never set body paragraphs in it.

**The Tight Display Rule.** Display type can run at 0.92 line-height with -0.055em tracking at hero scale. Page titles and section headings keep enough leading to stay readable when they wrap.

## Layout

The page is a single reading spine with a visible red margin. The container is `84rem` wide with responsive gutters: `1.35rem` on mobile, `2.5rem` at 768px, and `3.75rem` at 1024px. Sections use `3rem` top and `4.5rem` bottom padding, with the red margin line running through the page section at the left.

Persuade layouts can use a two-column notebook spread: a wide reading column and a narrower slip or sidebar column. Operate layouts use the same spine with one or two content columns, ledger rows, and tables. Directories can use responsive card grids, but the landing page refuses the equal-card row; the landing is a working spread with a slip and a term rail, not a row of feature cards.

At mobile widths, the margin labels collapse and the content becomes a single column. The mobile menu is a paper slip; page titles keep their scale; secondary table columns hide while the primary identity and action columns remain. The event registration panel moves above the event article, and the duplicate event-details sidebar hides. Tables stay keyboard-scrollable rather than forcing page-level horizontal overflow.

Spacing follows a 4/8/16/24/32/48/72 rhythm. Tight groups sit close; section breaks are generous. More space sits above a heading than below it.

## Elevation & Depth

The system is flat by default. Depth comes from paper layering: taped slips sit slightly above the page, hover lifts a slip by 2px, and the auth cover is a flat ink sheet rather than a shadowed card. The only shadows are soft ambient shadows with an offset and blur; hard offset shadows and zero-offset colored halos are not part of this world.

### Shadow Vocabulary
- **Lifted paper** (`box-shadow: 0 1px 0 rgba(23, 33, 28, 0.05), 0 24px 42px -34px rgba(23, 33, 28, 0.5)`): Large slips, the landing note, and auth paper.
- **Hover lift** (`box-shadow: 0 18px 28px -28px rgba(23, 33, 28, 0.55)`): Club and event cards on hover, paired with a 2px translate.
- **Quiet note** (`box-shadow: 0 18px 40px -36px rgba(23, 33, 28, 0.55)`): The taped margin note.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow appears only when paper is physically lifted or hovered.

**The No-Hard-Offset Rule.** No `4px 4px 0` shadows. The notebook is tactile through paper layering and tape, not through a neobrutalist block shadow.

## Shapes

The form language is squared and ruled. Corners are `1px` at most; tables and ledger rows are square. Cards, slips, buttons, chips, inputs, and stamps use one-pixel borders. The red margin is a one-pixel page-level line, and small ID/date marks may carry a red inset edge; neither becomes a thick colored side stripe on a card.

Tape is a translucent amber rectangle rotated a few degrees. Stamps are rectangular bordered labels, often with a mono uppercase word. Avatars and club marks are square ID-photo blocks with initials, not circles. Underline inputs and ruled textareas are the default form geometry; rounded pills, glass panels, and nested cards are outside the world.

## Components

### Buttons
- **Shape:** 1px radius, 1px ink border, mono uppercase label.
- **Primary:** Ink fill with paper-white text, `0.68rem 0.95rem` padding, subtle inset light edge. Hover darkens to `#29362e` and lifts 1px.
- **Secondary:** Transparent with ink border and ink text. Hover fills highlighter amber.
- **Ghost:** Transparent with an underline; hover uses a translucent amber wash.
- **Danger:** Margin red fill with paper-white text; hover moves to danger red.
- **Focus / Disabled:** 2px ink outline at 3px offset; disabled drops to 0.48 opacity and loses the lift.

### Chips
- **Style:** Paper white, 1px rule border, 1px radius, mono 0.7rem label, count pill in paper deep.
- **Selected:** Highlighter amber fill, ink border, inset bottom rule. The count pill flips to paper white.
- **Layout:** Announcement filters use an equal-width responsive grid so labels and counts align; padding stays at least 8px beside the text.

### Cards / Slips
- **Corner Style:** 1px radius.
- **Background:** Paper white on cool paper.
- **Border:** 1px rule strong; no nested card inside another card.
- **Shadow:** Lifted paper or hover lift only; see Elevation & Depth.
- **Padding:** 1.05–1.1rem for content cards; 1.25–1.75rem for detail panels.
- **Signature:** Taped slips use a rotated amber tape strip and a soft ambient shadow. The landing "Today on campus" slip is the reference.

### Inputs / Fields
- **Style:** Transparent background, 1.5px rule-strong underline, no radius, 0.95rem text. Labels are mono 0.7rem uppercase.
- **Focus:** Underline shifts to ink with a faint highlighter tint. Textareas keep a 1px border and a ruled SVG line texture.
- **Error / Disabled:** Error underline and field text use margin red with a faint red wash; disabled fields drop to 0.6 opacity.

### Navigation
- **Style:** Paper field header with a one-pixel rule. Nav links are mono uppercase; the active tab becomes paper white with an amber inset top rule, sitting on the header edge like a file tab.
- **Mobile:** The menu is a paper slip with stacked links and full-width sign-in/create-account actions. The summary control is a square bordered button with an open/close label for screen readers.
- **State:** `aria-current` marks the active route; focus uses the same 2px ink outline.

### Tables / Ledgers
- **Style:** 2px ink header rule, mono 0.7rem uppercase headers, 1px row rules, paper-white cells on paper deep headers. Numbers use tabular numerals.
- **Mobile:** Secondary columns hide; the primary identity and action columns remain. The table shell is keyboard-scrollable with a screen-reader caption, and the last action column can stick while scrolling.
- **Use:** Pending requests, approved members, event participants, past events, and dashboard ledgers.

### Signature Components
- **File tab:** A small paper tab with mono uppercase label, used as a margin label beside page titles, not as a kicker above them.
- **Stamp:** A rectangular bordered status label in approved green, pending amber, margin red, or ink. Stamps read as marks on the page, not pills.
- **Highlighter mark:** Flat amber behind the landing phrase, with block spacing so the marked line never touches the descenders above it. No shadow, no gradient.
- **Ledger row:** A ruled row with a date or ID block, a content column, and a right-aligned action. It is the preferred Operate pattern when a card grid would become an orphan row.

## Do's and Don'ts

### Do:
- **Do** keep the cool paper field, red margin, one-pixel rules, and squared geometry as the base of every screen.
- **Do** use Archivo for display and body and Spline Sans Mono for dates, counts, labels, field notes, and table numerals.
- **Do** use highlighter amber for selection and emphasis, and margin red for the page edge, errors, and destructive actions.
- **Do** use taped slips, rectangular stamps, file tabs, ledger rows, and square ID marks when a surface needs a notebook device.
- **Do** keep focus rings at 2px ink with a 3px offset, preserve reduced-motion behavior, and keep tables usable at mobile widths.
- **Do** give the landing highlighted phrase its own block spacing so descenders stay clear of the amber field.
- **Do** use an equal-width grid for the announcement club filters so the labels and counts line up.

### Don't:
- **Don't** use gradients, glass, pill badges, nested cards, or decorative blur.
- **Don't** put a kicker or eyebrow above a heading. Use a margin file tab beside the heading or let the heading speak.
- **Don't** use hard offset shadows or zero-offset colored halos; only soft ambient shadows on lifted paper.
- **Don't** put colored side stripes above 1px on cards, list items, callouts, or alerts. The red margin is a page-level mark.
- **Don't** set body copy in mono, or use mono as a generic "technical" costume.
- **Don't** reintroduce a page-wide grid background. The paper field, red margin, and ruled textures carry the notebook without it.
- **Don't** invent testimonials, partner logos, usage benchmarks, or claims that are not in the seeded product data.
