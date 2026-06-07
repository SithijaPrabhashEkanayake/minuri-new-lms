# Design System — DESIGN.MD
## ICT Academy LMS · "Liquid Glass" (iOS 26) Theme

**Design lead:** Minuri Alaharuwan
**Version:** 1.0 · 28 May 2026
**Visual language:** Apple iOS 26 *Liquid Glass* — frosted translucency, soft pastel gradients, generous rounded corners, and **pillar-shaped (fully rounded "pill") buttons**, derived directly from the supplied reference mockup.

---

## 1. Design principles

1. **Glass over solid.** Surfaces are translucent frosted panels floating over a soft, luminous gradient backdrop. Depth comes from blur, layered transparency and diffuse shadows — never hard borders.
2. **Soft, optimistic colour.** A dreamy pastel palette (rose, periwinkle, mint, peach) reads friendly and age-appropriate for teen learners, with one confident blue as the action colour.
3. **Rounded everything.** Cards use large radii; buttons are **full pills** ("pillar-shaped"); inputs and toggles are capsule-shaped. No sharp 90° corners in the UI chrome.
4. **Calm hierarchy.** Heavy display headings in near-black, quiet muted body text, lots of negative space. Content sits on glass; the glass sits on light.
5. **Motion that breathes.** Gentle, spring-like transitions; light catches and refracts on hover. Nothing abrupt.
6. **Accessible by default.** WCAG 2.1 AA contrast on all text, visible focus rings, keyboard paths, reduced-motion support.

---

## 2. Colour palette

Sampled and harmonised from the reference mockup (sage→cream backdrop, frosted white panels, pink/lavender/blue/teal gradients, vivid-blue primary pill, peach secondary pill).

### 2.1 Backdrop
| Token | Value | Use |
|-------|-------|-----|
| `--bg-sage` | `#dce8dd` | top-left ambient wash |
| `--bg-cream` | `#f5f0e6` | warm light pooling (right side) |
| `--bg-mist` | `#e9e6f2` | lavender mist (lower area) |
| `--bg-base` | gradient of the three above + a diagonal light beam | page background |

### 2.2 Glass surfaces
| Token | Value | Use |
|-------|-------|-----|
| `--glass-fill` | `rgba(255,255,255,0.55)` | primary frosted panel |
| `--glass-fill-strong` | `rgba(255,255,255,0.72)` | cards needing more legibility |
| `--glass-fill-faint` | `rgba(255,255,255,0.35)` | nav bar, overlays |
| `--glass-border` | `rgba(255,255,255,0.65)` | 1px inner highlight edge |
| `--glass-blur` | `blur(28px) saturate(150%)` | backdrop-filter |
| `--glass-shadow` | `0 20px 60px rgba(60,70,120,0.18)` | float shadow |

### 2.3 Brand gradients (the "liquid" colour fields)
| Token | Stops | Use |
|-------|-------|-----|
| `--grad-hero` | `#f7b9d2 → #c3b6f2 → #a8c4f5 → #9fe4d4` | hero panel, large feature art |
| `--grad-lavender` | `#b9c0f7 → #8b9af0` | product card A |
| `--grad-mint` | `#bdeede → #7dd3c0` | product card B |
| `--grad-rose` | `#f9c6d8 → #f4a6c0` | product card C / accents |

### 2.4 Accents & actions
| Token | Value | Use |
|-------|-------|-----|
| `--blue-500` | `#4f7cff` | **primary pill button**, links, active states |
| `--blue-600` | `#3b6cf6` | primary hover / gradient end |
| `--peach-400` | `#f5c98a` | **secondary pill button** |
| `--rose-400` | `#ec84ad` | tertiary accent, sphere, highlights |
| `--mint-400` | `#5ec8b5` | success / progress |

### 2.5 Text & semantic
| Token | Value | Use |
|-------|-------|-----|
| `--ink-900` | `#1c1c2b` | display headings (near-black) |
| `--ink-700` | `#3a3a4d` | body strong |
| `--ink-500` | `#6b6b80` | muted body / captions |
| `--ink-300` | `#9a9aad` | placeholder |
| `--ok` | `#34b88a` · `--warn` `#e0a93a` · `--danger` `#e2607a` | semantic states |

---

## 3. Typography

| Role | Font | Weight / size | Notes |
|------|------|---------------|-------|
| Display / H1 | **Bricolage Grotesque** | 700–800, 40–64px, tight `-0.02em` | bold, characterful headlines like the mockup's "Product Design / Apple Vision Pro" |
| H2 / section | Bricolage Grotesque | 700, 28–34px | |
| H3 / card title | Plus Jakarta Sans | 600, 18–22px | |
| Body | **Plus Jakarta Sans** | 400–500, 15–17px, line-height 1.6 | refined, clean, Apple-adjacent |
| Caption / label | Plus Jakarta Sans | 500, 12–13px, `+0.02em`, often uppercase | nav, tags, metadata |
| Mono (code) | JetBrains Mono | 400, 13–14px | code in lessons/quizzes |

Both display and body are distinctive yet quiet — avoiding generic system fonts while keeping the calm iOS feel.

---

## 4. Shape, radius & spacing

- **Radii:** cards `--r-card: 28px`; large feature panels `--r-xl: 36px`; inputs `--r-input: 16px`; **buttons & toggles: `--r-pill: 999px` (full pillar shape).**
- **Spacing scale (8pt):** 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Containers:** max content width 1200px; section vertical rhythm 96px; card padding 24–32px.
- **Grid:** 12-column fluid; product/feature grids collapse 3→2→1 across breakpoints.

---

## 5. Core components

### 5.1 Buttons (pillar-shaped, always)
- **Primary:** `--blue-500→--blue-600` gradient fill, white text, `--r-pill`, soft glow `0 8px 24px rgba(79,124,255,0.4)`. Hover: lift 2px + brighten.
- **Secondary:** `--peach-400` fill or frosted glass fill, ink text, pill.
- **Ghost / glass:** translucent white fill, `--glass-border`, ink text, pill.
- All buttons: 44px min height (touch target), `font-weight: 600`, `letter-spacing: 0.01em`, active scale `0.97`.

### 5.2 Glass card
`background: --glass-fill; backdrop-filter: --glass-blur; border: 1px solid --glass-border; border-radius: --r-card; box-shadow: --glass-shadow;` plus a 1px top inner highlight (`inset 0 1px 0 rgba(255,255,255,0.8)`) to mimic light catching the glass edge.

### 5.3 Capsule toggle / switch
Pill track (frosted), white knob with soft shadow — matching the small white "switch" pills in the mockup. Used for live-class on/off, notification channels, MFA toggle.

### 5.4 Inputs
Frosted capsule fields, 16px radius, inner soft shadow, `--blue-500` focus ring (2px), floating labels.

### 5.5 Navigation bar
Sticky top, `--glass-fill-faint` + heavy blur, pill-shaped CTA on the right ("Enter LMS"), text nav items with an animated pill highlight under the active item.

### 5.6 Progress & data viz
- Progress bars: capsule track, `--mint-400→--blue-500` fill, animated width.
- Badges: circular frosted medallions with gradient rims.
- Charts (Chart.js): pastel palette matching brand gradients; rounded bars; soft grid lines.

### 5.7 Tags / chips
Pill chips in faint tints of palette colours (grade tags, subject tags, status: Pending/Approved).

---

## 6. Page-by-page visual intent

### 6.1 Home
- **Hero** mirrors the mockup: left = bold display heading + muted paragraph + a frosted search/CTA row with **a blue primary pill and a peach secondary pill**; right = a large `--grad-hero` "liquid glass" feature panel with a soft refracted curve.
- **How it works** = three glass product cards (lavender, mint, rose gradients) with capsule toggles, echoing the mockup's "Product Section".
- **Featured modules**, **testimonials**, **CTA band** all on glass.

### 6.2 About Us
Mission statement over a soft gradient, instructor profile card (glass), pedagogy pillars as three gradient cards, and a PDPA/child-safety commitment panel.

### 6.3 Contact
Two-column: frosted contact form (pill inputs, primary pill submit) + an info card with email/WhatsApp pills and academy hours.

### 6.4 Blog
Magazine grid of glass article cards with gradient cover thumbnails, category chips, read-time captions; featured post spans two columns.

### 6.5 LMS gateway → Login
A centred glass "auth" card on the gradient backdrop offering **two large pillar buttons / tabs**:
- **"Student · Connect to Class"** (blue gradient pill)
- **"Admin / Teacher · Manage LMS"** (peach / glass pill)
Selecting a method reveals the matching login form (email, password, optional OTP/MFA) inside the same glass card.

### 6.6 Student dashboard
Left glass sidebar (icon + label nav), top glass bar with profile pill + notifications bell. Content: Library grid, Catalog, Live Classes schedule, Quizzes, Progress (bars + badges), AI Tutor chat panel. The video player is a dark-glass surface with capsule controls and a visible **view-count chip** + watermark.

### 6.7 Admin / Teacher dashboard
Same shell, role-aware nav. Admin: Pending Approvals queue (cards with Approve/Deny pills), Content upload, View-limit config (capsule steppers), Users table, AI sources, Reports (charts), and a **Website/Blog CMS** editor. Teacher: Streaming console (big pill Start/Stop), Quiz builder, Reports.

---

## 7. Motion

| Moment | Animation |
|--------|-----------|
| Page load | Staggered fade-up of glass cards (`60ms` step), 400ms ease |
| Hover (cards) | Lift 4px, shadow deepen, faint sheen sweep |
| Button press | Scale 0.97, spring back |
| Glass refraction | Slow-moving gradient highlight on hero panel |
| Progress fill | Width ease-out 800ms on mount |
| Modal / login reveal | Scale 0.96→1 + blur-in backdrop |

All motion respects `prefers-reduced-motion: reduce` (animations disabled, instant states).

---

## 8. Accessibility & responsive notes

- Text contrast verified ≥ 4.5:1 against the lightest glass; never place light text on light glass without a tint layer.
- Glass over busy gradients always gets a fill ≥ 0.55 opacity behind text.
- Focus rings: 2px `--blue-500` offset; never removed.
- Breakpoints: `≥1200` desktop, `768–1199` tablet (grids 3→2, sidebar collapses to top bar), `<768` mobile (single column, bottom pill tab-bar for LMS).
- Touch targets ≥ 44px; pill buttons keep min-width on mobile.

---

## 9. Asset & token delivery

All tokens ship as CSS custom properties on `:root` (see `index.html` prototype). Designers and engineers reference tokens, never raw hex. Icon set: a rounded, lightweight line set (e.g. Lucide) tinted with palette accents. Imagery: abstract gradient meshes only (no stock photos) to preserve the liquid-glass language.
