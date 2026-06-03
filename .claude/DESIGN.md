---
name: SaaS Admin Core
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424754'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#00685d'
  on-tertiary: '#ffffff'
  tertiary-container: '#008376'
  on-tertiary-container: '#f4fffb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is engineered for high-density information environments where clarity, speed, and professional rigor are paramount. It targets enterprise-level administrators and data analysts who require a tool that feels sophisticated yet unobtrusive.

The aesthetic follows a **Modern Corporate** direction infused with **Glassmorphism**. It prioritizes a sense of "digital air"—generous whitespace, translucent layering, and a restrained color palette that allows data visualizations to take center stage. The emotional response is one of calm control and technical precision. Surface treatments use subtle backdrop blurs to establish a clear spatial hierarchy without the visual clutter of heavy borders.

## Colors

The palette is anchored by a triad of cool-toned vibrants: **Blue** (Primary) for actions, **Indigo** (Secondary) for brand moments and data series, and **Teal** (Tertiary) for success states and accents. 

The background architecture utilizes a layered "Off-White" strategy. The base canvas is `Slate-100` (#F1F5F9), while interactive surfaces use a semi-transparent white with a background blur to achieve the glass effect. Status colors follow a standardized semantic pattern:
- **Success:** Teal-500 (#14B8A6)
- **Warning:** Amber-500 (#F59E0B)
- **Error:** Rose-500 (#F43F5E)
- **Info:** Blue-500 (#3B82F6)

## Typography

The design system utilizes **Inter** for its exceptional legibility in data-heavy interfaces. The typographic scale is built on a tight ratio to maintain a professional, compact feel.

Tracking is increased slightly for labels and small body text to enhance scannability. Headers use a tighter negative letter-spacing to appear more "locked-in" and authoritative. Hierarchy is established primarily through weight shifts (Medium to Bold) rather than drastic size changes, ensuring that dashboards remain dense but readable.

## Layout & Spacing

This design system employs a **12-column fluid grid** for the main content area, paired with a fixed-width sidebar (280px). 

The spacing rhythm is strictly based on a **4px baseline grid**. 
- **Margins:** Desktop views use 32px outer margins; Tablet uses 24px; Mobile uses 16px.
- **Gutters:** Standardized at 24px to provide clear separation between data cards.
- **Internal Padding:** Cards and Modals use a generous 24px (lg) internal padding to offset the technical density of the content.

## Elevation & Depth

Depth is communicated through three specific layers of elevation:

1.  **Level 0 (Canvas):** The base background (#F1F5F9). No shadows.
2.  **Level 1 (Cards/Panels):** Surface-white with a 1px border (#E2E8F0) and a very soft, diffused shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05)`.
3.  **Level 2 (Glass Overlays/Dropdowns):** Semi-transparent white (`rgba(255, 255, 255, 0.7)`) with a `backdrop-filter: blur(12px)`. This level uses a more pronounced shadow to indicate interactivity: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`.

Shadows are never pure black; they are tinted with the Primary Blue to maintain the clean SaaS aesthetic.

## Shapes

The design system adopts a highly approachable, rounded geometry. 
- **Standard Radius:** 12px for buttons, input fields, and small UI elements.
- **Large Radius (rounded-lg):** 16px for cards, panels, and modals.
- **Extra Large (rounded-xl):** 24px for top-level layout containers or featured hero sections.

This consistent use of soft corners balances the "coldness" of data-heavy tables and charts, making the professional environment feel more modern and user-friendly.

## Components

### Buttons & Inputs
- **Primary Buttons:** Use a subtle vertical gradient from Indigo to Blue. On hover, the brightness increases by 5%. 
- **Focus States:** A 3px ring using the primary color at 30% opacity, with a 2px offset.
- **Inputs:** Clean white backgrounds with 1px border. On focus, the border transitions to Primary Blue.

### Data Tables
- **Rows:** Zebra-striped using the Neutral background color on even rows. 
- **Hover:** Rows should highlight with a 50% transparent version of the Primary Blue.
- **Header:** Sticky headers with a semi-transparent glass effect and a bottom border.

### Badges
- **Status Pills:** Fully rounded (pill) with a 10% opacity background of the semantic color and a 100% opacity text color (e.g., Paid = Teal text on light teal background).

### Cards
- **Structure:** 16px border-radius, subtle 1px border, and "Level 1" shadows.
- **Header:** Separated by a thin horizontal divider with the title in `label-md` style.

### Navigation
- **Sidebar:** Dark mode variant available. Icons use thin strokes (1.5px) and are paired with `body-md` text. Active states use a "pill" background and a 4px left-hand vertical accent bar.