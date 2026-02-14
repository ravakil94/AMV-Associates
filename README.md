# AMV Associate — Website

Luxury architecture & interior design studio website for AMV Associate, Mumbai.

## Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, fluid typography, CSS-drawn textures
- **Vanilla JS** — Zero dependencies (runtime)
- **GSAP 3.12.5** + ScrollTrigger — Scroll-driven animations
- **Lenis 1.3.17** — Smooth scroll

## Setup

No build step required. Open `index.html` in a browser.

For development with live reload:
```bash
npx serve .
```

## File Structure

```
AMV-Associates/
├── index.html            # All 11 sections
├── css/
│   └── style.css         # Complete design system
├── js/
│   └── main.js           # Animations & interactions
├── assets/
│   └── images/
│       └── amv-logo.jpg  # Brand logo
└── README.md
```

## Brand

| Token | Value |
|-------|-------|
| Obsidian | `#0B0B0C` |
| Ivory | `#F5F2EC` |
| Metallic Gold | `#C6A46C` |
| Serif | Playfair Display |
| Sans | Inter |

## Performance

- Zero external images (all CSS-drawn placeholders)
- < 200KB total payload
- 60fps scroll animations
- Accessible (ARIA, keyboard, reduced-motion)

## License

Proprietary — AMV Associate. All rights reserved.
