---
name: Toriniku Orange
colors:
  surface: "#f8f9fa"
  surface-dim: "#d9dadb"
  surface-bright: "#f8f9fa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f4f5"
  surface-container: "#edeeef"
  surface-container-high: "#e7e8e9"
  surface-container-highest: "#e1e3e4"
  on-surface: "#191c1d"
  on-surface-variant: "#475569"
  inverse-surface: "#2e3132"
  inverse-on-surface: "#f0f1f2"
  outline: "#94a3b8"
  outline-variant: "#e2e8f0"
  surface-tint: "#f97316"
  primary: "#f97316"
  on-primary: "#ffffff"
  primary-container: "#fb923c"
  on-primary-container: "#351000"
  inverse-primary: "#ffb693"
  secondary: "#535f71"
  on-secondary: "#ffffff"
  secondary-container: "#d7e3f9"
  on-secondary-container: "#596577"
  tertiary: "#006e2f"
  on-tertiary: "#ffffff"
  tertiary-container: "#00b050"
  on-tertiary-container: "#003a15"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdbcc"
  primary-fixed-dim: "#ffb693"
  on-primary-fixed: "#351000"
  on-primary-fixed-variant: "#7a3000"
  secondary-fixed: "#d7e3f9"
  secondary-fixed-dim: "#bbc7dc"
  on-secondary-fixed: "#101c2c"
  on-secondary-fixed-variant: "#3c4859"
  tertiary-fixed: "#6bff8f"
  tertiary-fixed-dim: "#4ae176"
  on-tertiary-fixed: "#002109"
  on-tertiary-fixed-variant: "#005321"
  background: "#f8f9fa"
  on-background: "#191c1d"
  surface-variant: "#e1e3e4"
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "500"
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is tailored for high-efficiency food service environments, specifically optimized for point-of-sale (POS) and inventory management. The brand personality is **energetic, efficient, and accessible**, designed to reduce cognitive load for staff while maintaining a vibrant, appetizing aesthetic.

The visual style is **Corporate / Modern** with a focus on high-readability and tactile feedback. It utilizes a soft-edged geometric language that balances professional utility with a friendly, service-oriented feel. The hallmark of the design is the use of high-saturation brand accents against clean, spacious neutral backgrounds to direct attention to primary actions and status updates.

## Colors

The palette is anchored by a "Signature Orange" that drives action and identifies the brand. It is supported by a functional range of neutrals and semantic colors for operational clarity.

- **Primary (Orange):** Used for headers, primary action buttons, and active navigation states. It represents the "heat" and energy of the kitchen.
- **Secondary (Deep Charcoal):** Used for primary text and high-contrast iconography to ensure maximum legibility under various lighting conditions.
- **Semantic Success (Green):** Specifically used for "Ready" or "Selesai" statuses, indicating completed tasks.
- **Backgrounds:** A tiered system of light grays (#F9FAFB for main backgrounds and white #FFFFFF for interactive cards) creates clear separation between the workspace and the content.

## Typography

This design system uses **Plus Jakarta Sans** across all levels to maintain a modern, friendly, and highly legible interface. The type hierarchy is intentionally "heavy" at the top to ensure that screen titles and primary totals (like "Rp 77.000") are immediately visible at a glance from a distance.

- **Headlines:** Use Bold (700) weights for screen titles and financial summaries.
- **Body:** Uses Medium (500) for item names and Regular (400) for descriptions to create clear information density.
- **Labels:** Use Semi-Bold (600) for status tags and button text to provide a clear sense of "interactability."

## Layout & Spacing

The layout follows a **Fluid Grid** model designed to maximize the workspace on tablets while remaining functional on mobile.

- **Desktop/Tablet:** A sidebar navigation (240px) remains fixed, while the main content area uses a fluid 12-column grid. Headers occupy the top section with a high-saturation background to anchor the view.
- **Mobile:** Transition to a bottom-tab navigation for thumb-reachability. Margins reduce to 16px.
- **Spacing Rhythm:** Based on an 8px base unit. Component internal padding should default to 16px (2 units) or 20px for larger cards to maintain a "breathable" feel despite high data density.

## Elevation & Depth

Visual hierarchy is established through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Surface Tiers:** The lowest layer is the light gray background (#F9FAFB). Interactive elements like cards and buttons sit on the second tier (White #FFFFFF).
- **Shadows:** Use extremely soft, diffused shadows (0px 4px 20px rgba(0, 0, 0, 0.05)) to lift cards off the background without creating visual clutter.
- **Active State:** Primary action buttons use a stronger shadow depth (0px 8px 16px rgba(255, 107, 0, 0.2)) to provide a tactile "pressable" appearance.

## Shapes

The design system utilizes a **Rounded** (0.5rem / 8px) base language to communicate friendliness and safety.

- **Standard Elements:** Buttons, input fields, and small chips use 8px corners.
- **Container Elements:** Large dashboard cards and "Pesanan" list items use **rounded-lg** (1rem / 16px) to create a soft, modern container feel.
- **Navigation:** Active state indicators in the sidebar or bottom bar use pill-shapes (full round) to clearly distinguish them from content cards.

## Components

### Buttons

- **Primary:** Solid orange background with white text. High-contrast, 16px vertical padding.
- **Secondary/Ghost:** Transparent background with orange border or gray text for destructive/neutral actions.
- **Floating Action Button (FAB):** Used in mobile views for "Add Pesanan," utilizing the primary orange and a high-elevation shadow.

### Cards

- **Order Cards:** White background, 16px border-radius, soft ambient shadow. Features a top-right slot for semantic status chips.
- **Summary Cards:** Used in the dashboard with slight background tints (e.g., light orange or light green) to categorize business metrics.

### Status Chips

- Small, rounded containers with 4px border-radius.
- **Ready/Selesai:** Light green background (#DCFCE7) with dark green text (#15803D).
- **Process/Baru:** Light gray background with charcoal text.

### Input Fields

- Underlined or softly bordered with 8px radius. Active states must highlight the border in the primary orange.

### Navigation

- **Sidebar:** Vertical stack with icon + label. Active state features a light orange background tint and an orange indicator dot.
- **Bottom Bar:** Used for mobile, prioritizing icons with clear text labels for rapid switching.
