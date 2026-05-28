# Design

## Theme

Light mode primary. Cool neutral surfaces for long clinical sessions under normal office lighting.

## Color strategy

Restrained. Tinted cool neutrals plus one desaturated blue-gray accent under 10% of visible area.

| Token | Light value (OKLCH intent) |
|-------|----------------------------|
| background | oklch(0.99 0.003 260) canvas |
| foreground | oklch(0.22 0.01 260) text |
| sidebar | oklch(0.975 0.004 260) panel |
| muted | oklch(0.96 0.005 260) |
| muted-foreground | oklch(0.52 0.01 260) |
| border | oklch(0.91 0.006 260) |
| primary | oklch(0.45 0.06 250) accent |
| primary-foreground | oklch(0.99 0 0) |
| ring | oklch(0.45 0.06 250) |

No pure black or white. No purple hue.

## Typography

- Sans: Geist Sans (existing)
- Mono: Geist Mono for dates and metadata
- Scale: xs 0.75rem labels, sm 0.875rem body, base 1rem section titles
- Section titles: font-medium, tracking tight
- History dates: tabular-nums

## Spacing and layout

- Shell: sidebar 240px, preview 380px, min-height 100dvh
- Content padding: 24px (p-6)
- Section gap: 32px between question groups
- Row padding: 12px vertical (py-3)

## Radius

--radius: 0.5rem (8px). Buttons and inputs use md derived radius.

## Components

- Tabs: line variant in topbar (Linear style)
- Score: horizontal segment control, shared border, selected cell elevated
- Question sections: flat lists with divide-y, no nested cards
- History: row hover, ghost actions
- Preview: document panel, subtle muted background, light border

## Motion

150-200ms transitions on interactive elements. No page-load choreography.
