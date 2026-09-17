# DESIGN.md: GP Explorer (gp-explorer.fr)

## Source
- URL: https://gp-explorer.fr/
- Capture date: 2026-09-17
- Evidence:
  - Firecrawl `branding` + `images` extraction (`.firecrawl/gp-explorer-branding.json`)
  - Firecrawl `html` (cleaned) + `rawHtml` extraction (`.firecrawl/gp-explorer.html`, `.firecrawl/gp-explorer-raw.html`)
  - Full-page screenshot (`.firecrawl/gp-explorer-screenshot.png`)
  - Theme's compiled stylesheet fetched directly: `https://gp-explorer.fr/wp-content/themes/nc25/dist/css/styles.css` → saved as `.firecrawl/nc-styles.css`
- Stack detected: WordPress 6.8.3, custom theme "nc25", utility-CSS framework compiled with a **custom Tailwind-like config** (non-default color/breakpoint names — see below).

## Reference Screenshot
![Full-page screenshot of GP Explorer](./.firecrawl/gp-explorer-screenshot.png)

Use this screenshot as the visual source of truth for layout, density, hierarchy and overall feel. Tokens below describe the same page in machine-readable form.

## Design Summary
GP Explorer is a **bold, high-energy, brutalist/motorsport** design language: near-black ink text on light gray backgrounds, huge italic condensed display type, **zero border-radius everywhere** (hard, angular edges — cards, buttons, images), a saturated red as the single dominant accent, diagonal skew-wipe hover effects, and full-bleed video/photo hero sections. It reads as a sports/esports broadcast graphics package rather than a typical corporate site.

## Design Tokens

### Colors

| Role | Value | Source |
|---|---|---|
| Ink / primary text | `#222222` (`gray-900`) | branding + CSS (`.text-gray-900`, `.bg-gray-900`) |
| Background (page) | `#E1E1E1` | branding (observed light gray canvas) |
| Surface white | `#FFFFFF` | CSS (`.bg-white`, nav bar, secondary buttons) |
| **Primary red (brand)** | `#E50914` → `#B20710` (45° gradient) | inline style on driver avatar frames: `linear-gradient(45deg, #b20710 0%, #e50914 100%)` |
| Flat red (utility) | `#DD2B03` (`red-400`) | CSS (`.bg-red-400` footer social band, icon hover fills) |
| Blue accent (icon hover only) | `#0004F4` (`blue-400`) | CSS (`.fill-blue-400`, form-select caret) |
| Gray / muted | `#9B9A9A` (`gray-400`) | CSS (placeholder text, muted icon fill) |
| Yellow (theme-defined, **not used on homepage**) | `#FACC15` (`yellow-400`, Tailwind default) | CSS class exists but unreferenced in homepage markup — treat as available, not primary |
| Branding-tool secondary/accent (inferred) | `#F9E547`, `#FFD500` | Firecrawl branding heuristic — **not directly observed** on this page; likely picked up from another page/theme default. Use `#E50914`/`#DD2B03` as the reliable accent instead. |

All colors use Tailwind's `rgb(r g b / var(--tw-*-opacity))` opacity pattern — no custom `--color-*` CSS variables are declared anywhere in the stylesheet (confirmed: zero `:root { --color-* }` blocks exist; only Tailwind's internal `--tw-*` utility vars and WordPress Gutenberg's unrelated `--wp--preset--*` defaults, which the theme doesn't actually draw its palette from).

### Typography

| Token | Value |
|---|---|
| Display / heading / body font | `LateralVariable, sans-serif` — custom condensed variable font, weights 400/700/800 (`Lateral-StandardRegular`, `Lateral-UltraCompressedBlack`, `Lateral-ExtendedBlack`) |
| Numeric / stat font | `Blutter, sans-serif` (`.font-number`) — used for scores/numbers |
| h1 | 3xl mobile → **12rem–12.5rem** at `l:`/`xl:` (huge hero display size), line-height 1 |
| h2 | up to **8.75rem** at `l:`, line-height 1.05 |
| h3 | up to 5rem at `l:` |
| h4 | 1.25rem → 1.5rem, weight 800 |
| h5 | 0.875rem, weight 800, uppercase |
| Body | 16px baseline |
| Buttons | 1.5rem → 2.5rem at `l:`, weight 700, **italic**, uppercase, tight line-height |

Voice: display headings are set **huge, italic-leaning, uppercase, and tightly tracked** — very broadcast/motorsport-poster in feel.

### Spacing, Layout & Radius

- **Border radius: `0px` across the entire UI** (buttons, cards, image frames, nav toggle). This is a defining, non-negotiable trait — nothing is rounded except one unused plugin default (`rounded-md`, not applied).
- Base spacing unit: 4px (Tailwind default scale, `0.25rem` steps).
- Grid system: custom `.container` / `.grid` / `.grid-row` / `.grid-col-N` (Bootstrap-like 12-col grid) layered **on top of** Tailwind utilities, gutters `0.5rem` (mobile) → `1rem` (`l:`+).
- Container max-widths: `480px → 768px → 1024px → 1280px → 1440px → 1920px` (fluid, grows with viewport up to 1920px; at `l:`+ it switches to a fixed `1640px` max width with `3rem` side padding instead).
- **Custom breakpoint scale (not default Tailwind names!):**

| Prefix | min-width | Tailwind default equivalent |
|---|---|---|
| *(none, mobile-first)* | 0 | `xs` |
| `s:` | 768px | `md` |
| `m:` | 1024px | `lg` |
| `l:` | 1280px | `xl` |
| `xl:` | 1440px | — |
| `xxl:` | 1920px | `2xl` |

This is important: `m:` here means "medium-large / desktop" (1024px), not "mobile" — do not assume default Tailwind prefix semantics when reading this codebase's classes.

- Custom z-index name: `z-goku` → `z-index: 9000` (header layer), `z-default`, `z-above` also used as semantic z-index tokens.
- Easing tokens: `ease-out-expo`, `ease-in-out-circ` (custom cubic-beziers, not Tailwind defaults) — used for all hover/reveal transitions.

## Components

### Navbar / Header
- `position: fixed`, transparent-over-hero on load, becomes a white bar at `m:` (1024px+, height `3rem`/`h-12`).
- Logo is an animated Lottie mark (light/dark variants swapped on scroll), not a static image.
- Burger toggle (`.toggle-menu`) visible below `m:`, hidden at `m:`+ in favor of a horizontal inline menu.
- Mobile nav is a full-screen fixed panel (`h-full`, white background) sliding in; desktop nav is inline with mega-menu **submenus** (`.submenu`) that drop down as a full-width dark panel (`bg-gray-900 text-white`) showing a grid of team/driver logos.
- CTA in nav: "Mon Compte" — dark pill-less rectangular button, uppercase, with a red diagonal-skew wipe (`skewX(-20deg)`) that sweeps in on hover.

```html
<header class="main-header fixed top-0 left-0 w-full pt-3 s:pt-10 z-goku">
  <div class="container">
    <div class="flex justify-between items-center">
      <a href="/" class="mr-6 s:mr-14"><!-- animated logo --></a>
      <a class="toggle-menu block m:hidden w-12 s:w-16 h-12 s:h-16 bg-gray-900"></a>
      <nav class="main-nav w-full flex flex-col m:flex-row m:bg-white m:h-12 fixed m:relative">
        <ul id="menu-principal" class="menu">
          <li class="menu-item has-children">
            <a href="/ecuries/">Écuries</a>
            <div class="submenu absolute top-full left-0 w-full hidden m:block">
              <div class="content bg-gray-900 text-white"> ... team grid ... </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</header>
```

### Buttons
Two flat variants, both **rectangular (0 radius), uppercase, italic, weight 700**, with an animated diagonal wipe fill on hover instead of a simple color transition:

```html
<a href="#" class="btn"><span>Découvrir les écuries</span></a>          <!-- dark: bg #222, text white -->
<a href="#" class="btn -white"><span>Voir les pilotes</span></a>         <!-- light: bg white, text #222 -->
```

```css
.btn{
  background-color:#222; color:#fff;
  display:inline-flex; cursor:pointer; overflow:hidden;
  font-size:1.5rem; font-weight:700; font-style:italic;
  line-height:1; text-transform:uppercase;
  padding:.625rem .875rem; /* grows to 2.5rem font-size / .75rem 1rem padding at l: */
}
.btn:before{ /* the hover wipe */
  content:""; position:absolute; inset:0;
  background:#fff; transform:skewX(-20deg) translate3d(-110%,0,0);
  transition: transform .7s cubic-bezier(ease-out-expo);
}
.btn:hover:before{ transform:none; }
```

### Cards (driver / team tiles)
- Driver portrait sits in a fixed-ratio `<figure>` with a **red diagonal gradient background** (`linear-gradient(45deg, #b20710 0%, #e50914 100%)`) shown while the photo loads/around the cutout.
- `.pilote` cards implement a **3D flip on hover**: `.pilote:hover .inner{ transform: rotateY(180deg); }`.
- List/row variant (used in footer "team" list): avatar + name + arrow icon, name underlines and arrow slides right on hover (`group-hover:translate-x-2`).

```html
<a href="/pilotes/squeezie/" class="team--pilote group w-full flex items-center mb-3">
  <figure class="w-14 h-14" style="background: linear-gradient(45deg, #b20710 0%, #e50914 100%);">
    <img src="..." class="w-full h-full object-cover object-top" alt="">
  </figure>
  <div class="flex pl-4 l:pl-8 w-full">
    <div class="name text-sm font-extrabold uppercase border-b border-white border-opacity-30 py-3">
      <span class="group-hover:translate-x-2">Squeezie</span>
      <span class="group-hover:animate-move-out"><!-- arrow icon --></span>
    </div>
  </div>
</a>
```

### Forms
No live `<form>` markup is rendered on the homepage itself (Contact Form 7's CSS is enqueued site-wide but only used on inner pages). The theme's own form styling is still defined and should be reused:

```css
.form-item{ margin-bottom:1.5rem; } /* 2.25rem at s: */
.form-select:after{
  border-bottom:6px solid #0004f4; /* custom caret, blue-400 */
  border-left:6px solid transparent;
}
input::placeholder, textarea::placeholder{ color:#9b9a9a; } /* gray-400 */
```
Treat inputs as flat, 0-radius, bottom-border or filled fields consistent with the rest of the flat/sharp component language; no evidence of rounded or shadowed inputs anywhere in the CSS.

### Footer
Two-part footer: a full-width **flat red band** (`bg-red-400`, i.e. `#DD2B03`) of social icons (Instagram, TikTok, ...), white icon fill with a dark hover-fill swap, followed by a dark closure/legal bar with an inline link list.

```html
<footer class="main-footer -mt-[0.1em]">
  <div class="bg-red-400 py-6 s:py-8">
    <ul class="flex items-center">
      <li class="w-full flex items-center justify-center">
        <a href="https://www.instagram.com/gp_explorer/" target="_blank">
          <i class="icon icon--insta fill-white l:hover:fill-gray-900"><svg>...</svg></i>
        </a>
      </li>
      <!-- tiktok, etc. -->
    </ul>
  </div>
  <div class="closure"> <!-- legal links, columns --> </div>
</footer>
```

## Page Patterns
- Full-viewport (`h-screen`) autoplaying video/image **cover-slider** hero, dark overlay gradient for text legibility, driven by a `.cover-slider .item[data-delay]` carousel.
- Sponsor/partner logo strips and car-livery banner images between content sections.
- Section rhythm controlled by responsive `py-*`/`my-*` utility classes that scale up sharply at `s:`/`l:` (e.g. `py-20` → `14rem`/`18rem` top padding on large screens) — sections breathe a lot more on desktop than mobile.
- Reveal-on-scroll pattern via `.js-reveal` class (JS-driven opacity/transform entrance, not CSS-only).

## Content Style
- French copy, energetic and direct CTA wording: *"Découvrir les écuries"*, *"Voir les pilotes"*, *"Voir le replay"*, *"Voir les partenaires"* — verb + article + plural noun, always a call to explore.
- Headings are short, all-caps via CSS transform, big enough to function as poster typography rather than page titles.
- Arrow icon (`icon--arrow`) is the recurring affordance appended to nearly every link/button/card to signal "go further."

## Agent Build Instructions
For an agent recreating this look:
1. Load a condensed/compressed display sans (Lateral-style substitute if `LateralVariable` isn't licensed, e.g. a compressed grotesk) for headings; keep body copy on the same family for continuity. Reserve a separate tabular/mono-ish face for numeric stats.
2. Set **`border-radius: 0` globally** — buttons, cards, image frames, inputs. This is the single most identity-defining rule.
3. Palette: ink `#222`, background `#E1E1E1`/white, primary accent red `#E50914`→`#B20710` gradient for imagery/avatar frames, flat `#DD2B03` for large color blocks (footer band, hover fills). Keep blue (`#0004F4`) and yellow strictly as minor/utility accents, not primary brand colors.
4. Buttons: flat rectangle, uppercase, italic, bold, with a skewed color wipe on hover (not a plain background fade) — implement via a pseudo-element `transform: skewX(-20deg) translateX(-110%)` animated to `translateX(0)`.
5. Use a custom breakpoint scale (`s:768 / m:1024 / l:1280 / xl:1440 / xxl:1920`) if replicating class-for-class, or map to Tailwind's `md/lg/xl/2xl` if building fresh — just don't assume `m:` means "mobile."
6. Hero: full-bleed video or image cover slider with dark gradient overlay for text contrast.
7. Cards/avatars: diagonal red gradient frame behind photography, optional 3D `rotateY` hover flip for driver/team cards.
8. Motion: prefer `ease-out-expo` / `ease-in-out-circ` easing and scroll-triggered reveal (fade + slight transform) over instant state changes.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://gp-explorer.fr/
target_stack: (unspecified)
output: DESIGN.md
