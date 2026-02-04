# VerbVault Style Guide

## Brand Philosophy

VerbVault sits at the intersection of **Anthropic's warm, thoughtful design language** and **retro computing nostalgia**. We're moving away from the oversaturated "AI purple" that dominates the space toward something distinctive: the warm glow of a phosphor terminal, the confidence of professional tooling, and the charm of computing's golden era.

Think: **A modern developer tool that remembers where it came from.**

---

## Color System

### Primary Palette

Our colors draw from two sources:
1. **Anthropic's warm terracotta/coral** - sophisticated, human, approachable
2. **Classic terminal phosphors** - amber CRTs, green screens, the glow of late-night coding

#### Core Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | `#D97757` | `#E8886A` | Primary actions, brand accent |
| `--primary-foreground` | `#FFFFFF` | `#1A1A1A` | Text on primary |
| `--secondary` | `#F5F0EB` | `#2A2520` | Secondary surfaces |
| `--secondary-foreground` | `#3D3530` | `#E8E0D8` | Text on secondary |
| `--accent` | `#C96442` | `#F09070` | Hover states, emphasis |
| `--muted` | `#E8E0D8` | `#3D3530` | Disabled, subtle backgrounds |
| `--muted-foreground` | `#8C7F72` | `#A89888` | Placeholder text, captions |

#### Terminal Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--terminal-green` | `#39FF14` | Success states, "active" indicators |
| `--terminal-green-dim` | `#2A8C10` | Subtle green accents |
| `--terminal-amber` | `#FFB000` | Warnings, highlights |
| `--terminal-amber-dim` | `#CC8C00` | Subtle amber accents |
| `--terminal-glow` | `rgba(57, 255, 20, 0.15)` | Glow effects |

#### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--destructive` | `#DC2626` | `#EF4444` | Errors, delete actions |
| `--success` | `#16A34A` | `#22C55E` | Success messages |
| `--warning` | `#D97706` | `#F59E0B` | Warnings |
| `--info` | `#0284C7` | `#38BDF8` | Informational |

#### Background & Surface

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#FDFBF9` | `#151310` | Page background |
| `--foreground` | `#1A1715` | `#F5F0EB` | Primary text |
| `--card` | `#FFFFFF` | `#1E1A17` | Card backgrounds |
| `--card-foreground` | `#1A1715` | `#F5F0EB` | Card text |
| `--popover` | `#FFFFFF` | `#252119` | Dropdowns, tooltips |
| `--popover-foreground` | `#1A1715` | `#F5F0EB` | Popover text |
| `--border` | `#E8DFD5` | `#3D352D` | Borders, dividers |
| `--input` | `#E8DFD5` | `#2A2520` | Input backgrounds |
| `--ring` | `#D97757` | `#E8886A` | Focus rings |

### Color Usage Guidelines

1. **Primary coral/terracotta** - Use sparingly for CTAs, active states, and brand moments
2. **Terminal green** - Reserved for "running" spinners, success, and active connections
3. **Terminal amber** - Warnings and secondary highlights
4. **Warm neutrals** - The backbone; most UI should be these tones
5. **Never use pure black or white** - Always use the warm-tinted variants

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
--font-display: 'Space Grotesk', 'Inter', sans-serif; /* Optional: for hero text */
```

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `display` | 3rem (48px) | 1.1 | 700 | Hero headlines |
| `h1` | 2.25rem (36px) | 1.2 | 600 | Page titles |
| `h2` | 1.875rem (30px) | 1.25 | 600 | Section headers |
| `h3` | 1.5rem (24px) | 1.3 | 600 | Card titles |
| `h4` | 1.25rem (20px) | 1.4 | 500 | Subsections |
| `body` | 1rem (16px) | 1.5 | 400 | Default text |
| `body-sm` | 0.875rem (14px) | 1.5 | 400 | Secondary text |
| `caption` | 0.75rem (12px) | 1.4 | 400 | Labels, metadata |
| `code` | 0.875rem (14px) | 1.6 | 400 | Code snippets |

### Typography Guidelines

1. **Monospace for terminal feel** - Use `font-mono` for:
   - Spinner verb previews
   - Code snippets
   - CLI commands
   - Theme IDs and slugs
   - Stats/numbers that update

2. **Sans-serif for readability** - Use `font-sans` for:
   - Body copy
   - Navigation
   - Form labels
   - Buttons

3. **Letter spacing** - Monospace text can use `tracking-tight` (-0.025em) for a denser, terminal-like appearance

4. **Text rendering** - Enable font smoothing for a cleaner look:
   ```css
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
   ```

---

## Spacing System

We use an 8px base grid for consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | Reset |
| `space-1` | 0.25rem (4px) | Tight internal spacing |
| `space-2` | 0.5rem (8px) | Icon gaps, small padding |
| `space-3` | 0.75rem (12px) | Input padding, list gaps |
| `space-4` | 1rem (16px) | Card padding, section gaps |
| `space-5` | 1.25rem (20px) | Component spacing |
| `space-6` | 1.5rem (24px) | Section padding |
| `space-8` | 2rem (32px) | Large gaps |
| `space-10` | 2.5rem (40px) | Section separation |
| `space-12` | 3rem (48px) | Page sections |
| `space-16` | 4rem (64px) | Hero spacing |
| `space-20` | 5rem (80px) | Major section breaks |

### Spacing Guidelines

1. **Consistent rhythm** - Stack elements in 8px increments
2. **Breathing room** - Cards and sections need generous padding (16-24px)
3. **Dense data** - Tables and lists can use tighter spacing (8-12px)
4. **Mobile reduction** - Reduce horizontal padding by 25% on mobile

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | Sharp edges (terminal aesthetic) |
| `radius-sm` | 0.25rem (4px) | Badges, small chips |
| `radius-md` | 0.5rem (8px) | Buttons, inputs |
| `radius-lg` | 0.75rem (12px) | Cards, dialogs |
| `radius-xl` | 1rem (16px) | Feature cards |
| `radius-full` | 9999px | Avatars, pills |

### Radius Guidelines

1. **Cards** - Use `radius-lg` for a modern but not overly soft look
2. **Buttons** - Use `radius-md` for a balanced feel
3. **Terminal elements** - Consider `radius-none` or `radius-sm` for code blocks and terminal previews to maintain that CRT edge
4. **Consistency** - Don't mix too many radius values in close proximity

---

## Shadows & Elevation

### Shadow Scale (Dark Mode Friendly)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
```

### Glow Effects (Terminal Style)

```css
--glow-green: 0 0 10px rgba(57, 255, 20, 0.3), 0 0 20px rgba(57, 255, 20, 0.15);
--glow-amber: 0 0 10px rgba(255, 176, 0, 0.3), 0 0 20px rgba(255, 176, 0, 0.15);
--glow-primary: 0 0 10px rgba(217, 119, 87, 0.3), 0 0 20px rgba(217, 119, 87, 0.15);
```

### Usage

1. **Cards at rest** - `shadow-sm` or no shadow in dark mode
2. **Cards on hover** - `shadow-md` with subtle lift
3. **Modals/dialogs** - `shadow-xl`
4. **Active spinners** - Use `glow-green` for running state
5. **Primary buttons on hover** - Subtle `glow-primary`

---

## Effects & Animations

### Terminal Effects

#### Scanlines (Optional, Subtle)

```css
.terminal-scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
}
```

#### CRT Flicker (Use Very Sparingly)

```css
@keyframes flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
}
```

#### Text Glow

```css
.terminal-glow {
  text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
}
```

### Transition Timings

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `fast` | 100ms | ease-out | Hover states, toggles |
| `normal` | 200ms | ease-in-out | Most transitions |
| `slow` | 300ms | ease-in-out | Page transitions, modals |
| `spring` | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful interactions |

### Animation Guidelines

1. **Subtle is key** - Animations should enhance, not distract
2. **Respect motion preferences** - Honor `prefers-reduced-motion`
3. **Terminal character** - Spinner previews can use typewriter effects
4. **Loading states** - Use the actual spinner verbs being previewed!

---

## Component Patterns

### Buttons

#### Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| `primary` | `--primary` | `--primary-foreground` | none | Main CTAs |
| `secondary` | `--secondary` | `--secondary-foreground` | none | Secondary actions |
| `outline` | transparent | `--foreground` | `--border` | Tertiary actions |
| `ghost` | transparent | `--foreground` | none | Subtle actions |
| `destructive` | `--destructive` | white | none | Delete, danger |
| `terminal` | `--background` | `--terminal-green` | `--terminal-green-dim` | CLI/terminal context |

#### States

- **Hover**: Slight brightness increase, subtle glow for primary
- **Active**: Scale down slightly (0.98)
- **Disabled**: 50% opacity, no pointer events
- **Focus**: 2px ring with `--ring` color, 2px offset

### Cards

```
┌─────────────────────────────────────┐
│  [optional badge]                   │
│                                     │
│  Title (h3, font-semibold)          │
│  Subtitle (body-sm, muted)          │
│                                     │
│  Content area                       │
│                                     │
│  ─────────────────────────────────  │
│  Footer (optional)     [Actions]    │
└─────────────────────────────────────┘
```

- **Background**: `--card`
- **Border**: 1px `--border`
- **Radius**: `radius-lg`
- **Padding**: `space-4` to `space-6`
- **Hover**: Subtle border color shift, optional shadow lift

### Inputs

- **Height**: 40px (2.5rem) default, 36px compact
- **Padding**: `space-3` horizontal
- **Border**: 1px `--border`, 2px `--primary` on focus
- **Radius**: `radius-md`
- **Background**: `--input`
- **Monospace option**: For theme IDs, slugs, code

### Terminal Preview Box

A special component for showing spinner verbs in action:

```
┌─────────────────────────────────────┐
│ ● ● ●                        [─][□] │
├─────────────────────────────────────┤
│                                     │
│  ⠋ Contemplating the cosmos...      │  <- font-mono, terminal-green
│                                     │
│                                     │
└─────────────────────────────────────┘
```

- **Background**: Near-black (`#0D0D0D` or `#151310`)
- **Border**: 1px `--terminal-green-dim` with subtle glow
- **Text**: `--terminal-green` or `--terminal-amber`
- **Font**: `font-mono`, slightly larger (1rem or 1.125rem)
- **Optional**: Scanlines overlay, subtle CRT curve via CSS

---

## Iconography

### Style

- **Library**: Lucide React (current) - clean, consistent
- **Stroke width**: 1.5px default, 2px for emphasis
- **Size scale**: 16px (sm), 20px (md), 24px (lg)

### Terminal-Specific Icons

Consider custom or modified icons for:
- `>_` Terminal/CLI indicator
- `█` Cursor block
- `⠋⠙⠹⠸` Spinner states (Braille pattern)

### Color Usage

- **Default**: `--muted-foreground`
- **Interactive**: `--foreground`, `--primary` on hover
- **Success**: `--terminal-green`
- **Warning**: `--terminal-amber`

---

## Responsive Design

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Large phones landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large monitors |

### Mobile Guidelines

1. **Touch targets**: Minimum 44x44px for interactive elements
2. **Padding**: Increase vertical padding, reduce horizontal on mobile
3. **Typography**: Consider bumping body to 17px on mobile for readability
4. **Cards**: Full-width on mobile, stack vertically
5. **Navigation**: Hamburger menu below `md` breakpoint
6. **Terminal previews**: Ensure text doesn't overflow, allow horizontal scroll if needed

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

Center content with `max-width` and auto margins. Prefer `container-lg` (1024px) for content-heavy pages.

---

## Dark Mode

Dark mode is the **default and preferred** experience for VerbVault. The terminal aesthetic shines in dark mode.

### Implementation

- Use CSS custom properties for all colors
- Toggle via `class="dark"` on `<html>` element
- Persist preference in localStorage
- Respect `prefers-color-scheme` for initial load

### Dark Mode Adjustments

1. **Reduce contrast slightly** - Pure white text on black is harsh; use `#F5F0EB`
2. **Increase glow intensity** - Terminal glows pop more in dark mode
3. **Borders become subtle** - Less prominent, more integrated
4. **Shadows become glows** - In dark mode, uplift with subtle colored glows instead of drop shadows

---

## Accessibility

### Color Contrast

All text must meet WCAG 2.1 AA standards:
- **Normal text**: 4.5:1 minimum
- **Large text (18px+)**: 3:1 minimum
- **UI components**: 3:1 minimum

### Focus States

- All interactive elements must have visible focus indicators
- Use `--ring` color with 2px solid ring
- Don't rely solely on color to indicate state

### Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Readers

- Use semantic HTML
- Provide `aria-label` for icon-only buttons
- Announce dynamic content changes with `aria-live`

---

## Brand Applications

### Logo Treatment

The VerbVault logo should:
- Use `--primary` (coral) or white depending on background
- Have adequate clear space (minimum 1x logo height)
- Never be placed on busy backgrounds without a container

### Voice & Tone

- **Friendly but technical** - We're talking to developers
- **Playful with restraint** - The spinner verbs are fun; the UI supports that
- **Clear and direct** - No jargon, no fluff

### Copy Examples

| Instead of... | Use... |
|---------------|--------|
| "Leverage our platform to optimize your workflow" | "Install themes in one command" |
| "AI-powered generation capabilities" | "Generate verbs with AI" |
| "Robust community features" | "Share with other devs" |

---

## Implementation Checklist

When implementing this style guide:

- [ ] Update Tailwind config with new color tokens
- [ ] Replace CSS custom properties in `globals.css`
- [ ] Update component variants (Button, Card, Input, Badge)
- [ ] Add terminal-specific utility classes
- [ ] Update font configuration (add Space Grotesk if using)
- [ ] Test dark mode thoroughly
- [ ] Verify color contrast ratios
- [ ] Test responsive breakpoints
- [ ] Add reduced motion support
- [ ] Update any hard-coded colors in components

---

## Quick Reference: CSS Variables

```css
:root {
  /* Primary */
  --primary: 15 65% 60%;
  --primary-foreground: 0 0% 100%;

  /* Secondary */
  --secondary: 25 20% 94%;
  --secondary-foreground: 20 12% 22%;

  /* Accent */
  --accent: 15 60% 52%;

  /* Terminal */
  --terminal-green: 110 100% 55%;
  --terminal-amber: 40 100% 50%;

  /* Backgrounds */
  --background: 30 25% 98%;
  --foreground: 20 12% 10%;
  --card: 0 0% 100%;
  --card-foreground: 20 12% 10%;
  --muted: 25 15% 90%;
  --muted-foreground: 20 10% 50%;

  /* Borders */
  --border: 25 15% 88%;
  --input: 25 15% 88%;
  --ring: 15 65% 60%;

  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --primary: 15 70% 63%;
  --primary-foreground: 20 12% 10%;

  --secondary: 20 12% 15%;
  --secondary-foreground: 25 15% 90%;

  --background: 20 15% 7%;
  --foreground: 25 15% 95%;
  --card: 20 12% 10%;
  --card-foreground: 25 15% 95%;
  --muted: 20 10% 22%;
  --muted-foreground: 20 10% 60%;

  --border: 20 10% 20%;
  --input: 20 12% 15%;
  --ring: 15 70% 63%;
}
```

---

*This style guide is a living document. Update it as the design evolves.*
