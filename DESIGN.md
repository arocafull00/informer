---
name: Clinical Clarity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#42474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#73777d'
  outline-variant: '#c3c7cd'
  surface-tint: '#43617c'
  primary: '#26445d'
  on-primary: '#ffffff'
  primary-container: '#3e5c76'
  on-primary-container: '#b5d4f2'
  inverse-primary: '#abcae8'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e1e3e4'
  on-secondary-container: '#626566'
  tertiary: '#42423a'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a5951'
  on-tertiary-container: '#d2d0c6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#abcae8'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#2b4963'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#454748'
  tertiary-fixed: '#e5e3d8'
  tertiary-fixed-dim: '#c9c7bc'
  on-tertiary-fixed: '#1c1c16'
  on-tertiary-fixed-variant: '#48473f'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  mono-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-page: 2rem
  gutter-grid: 1.5rem
  stack-section: 2.5rem
  stack-component: 1rem
  input-padding: 0.75rem
---

## Brand & Style

This design system is engineered for **Informer**, a clinical tool designed to streamline the complex process of autism assessment reporting. The brand personality is rooted in **precision, empathy, and institutional trust**. It prioritizes the mental state of the clinician, aiming to reduce the "form fatigue" associated with ADI-R and ADOS-2 diagnostic workflows.

The visual style is **Clinical Minimalism**. It moves away from the coldness of traditional medical software by introducing soft tonal shifts and intentional whitespace. The primary objective is cognitive offloading: information is presented in a structured, hierarchical manner that guides the eye naturally through input tasks to the final document generation. 

**Key Principles:**
- **Quiet Interface:** High-chroma colors are reserved strictly for functional feedback (actions, progress, errors).
- **Material Distinction:** Distinct visual "surfaces" separate the active workspace from the passive document preview.
- **Systematic Order:** Rigorous alignment and consistent spacing to instill confidence in the data integrity.

## Colors

The palette is anchored by **Slate Indigo**, a professional and grounded primary shade that denotes authority without aggression. 

- **Primary:** Used for primary actions, active states in segmented controls, and progress indicators.
- **Surface (Neutral):** A range of cool grays (#F8F9FA to #E2E8F0) forms the base of the input workspace, providing a clean, distraction-free environment.
- **Document Surface (Tertiary):** A specialized 'Paper' tint (#FEFBF0) is used exclusively for the Live Preview panel. This subtle shift in temperature signals to the user that they are viewing an output rather than an input.
- **Functional Semantics:** Success Green (#2D6A4F) is used for completed assessment modules, while Warning Orange (#D97706) highlights mandatory fields or incomplete sections that require clinician attention.

## Typography

The design system utilizes **Inter** for its exceptional legibility and neutral character. It performs reliably at small sizes, which is critical for dense clinical forms.

- **Scale:** A compact scale is used to maximize information density while maintaining readability.
- **Contrast:** Section headers (Headline-LG) use a semi-bold weight and tighter tracking to create clear separation between assessment blocks.
- **Labels:** Question labels and descriptors use a medium weight to differentiate them from the clinician's input text.
- **Preview Typography:** Within the document preview panel, typography should mirror the final printed report, utilizing slightly more generous line heights (1.6x) to facilitate proofreading.

## Layout & Spacing

This design system uses a **Split-Pane Fixed Grid** model optimized for wide-screen clinical environments (Desktop).

- **The Workspace (Left/Center):** Occupies 65% of the viewport. Content is centered within a 960px max-width container to prevent line-lengths from becoming unreadable.
- **The Live Preview (Right):** A fixed sidebar occupying 35% of the viewport. This panel persists as the clinician scrolls through the input form, providing immediate feedback.
- **Rhythm:** A strict 8px base grid ensures vertical rhythm. Components like question cards use `stack-component` (16px) spacing, while major assessment sections use `stack-section` (40px) to provide visual breathing room.
- **Responsiveness:** On Tablet, the Preview panel collapses into a floating action button (FAB) or a toggleable bottom sheet to maintain focus on the input fields.

## Elevation & Depth

To maintain a clinical and clean appearance, depth is communicated through **tonal layering and low-contrast outlines** rather than heavy shadows.

- **Level 0 (Background):** The base canvas is #F8F9FA.
- **Level 1 (Cards/Inputs):** Question cards are pure White (#FFFFFF) with a 1px border (#E2E8F0). A very soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.04)) is applied to active or hovered items to indicate focus.
- **Level 2 (Modals/Popovers):** Higher elevation elements use a more pronounced but still subtle shadow (0px 10px 15px -3px rgba(0,0,0,0.1)).
- **Interactions:** Selected states in segmented controls or multi-select chips use a slight inner shadow to create a "pressed" tactile feel, reducing the ambiguity of the selection.

## Shapes

The design system adopts a **Soft (4px - 12px)** roundedness philosophy. This "Soft" approach balances the professionalism of sharp corners with the approachability of rounded ones.

- **Small Components:** Checkboxes, radio buttons, and input fields use a 4px (0.25rem) radius.
- **Standard Components:** Question cards and buttons use an 8px (0.5rem) radius.
- **Large Components:** The main Document Preview container uses a 12px (0.75rem) radius to soften the large vertical edge.

## Components

### Segmented Controls
Used for high-level navigation between ADI-R and ADOS-2. These should have a subtle background track and a high-contrast sliding indicator for the active state.

### Question Cards
Individual assessment items are housed in cards. Each card includes a numerical index, the question text, and a horizontal button group for the 0-3 scoring system. Use a "ghost" state for unanswered questions and a "filled" state for answered ones.

### Progress Indicator
A slim, horizontal bar at the top of the workspace. Use a dual-color track: the background shows the total assessment length, and the fill shows completed items in Success Green.

### Input Fields
Clinical notes require text areas with clear character counters. Use a focus ring of Primary Blue (2px) to clearly indicate where the clinician is typing.

### Live Preview Panel
This panel mimics a sheet of paper. It should include a "Copy to Clipboard" utility button at the top right, styled as a subtle text+icon button to avoid distracting from the document content.

### Scoring Buttons (0-3)
These are circular or slightly rounded square buttons. When selected, the primary color fills the background and the text turns white. Use a distinct hover state to ensure the clinician knows exactly which value they are about to select.