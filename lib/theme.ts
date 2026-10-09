// Colour palette: the brand green (#00371a) and gold (#cfb485) on a
// green-black night. Used by Tailwind (tailwind.config.ts), the browser theme
// colour (app/[locale]/layout.tsx) and the web manifest, so the three always
// match.
//
// Kept warm on purpose: it is a casa de comidas open from 08:00, not a night
// club. Hence a green rather than black night, warm ivory text, a visible
// green glow, and lit mats and walls around the photos.
//
// Contrast (WCAG) of each text colour on the lightest background it is used
// on, measured: ivory 9.9:1 (glow), ivory-2 7.8:1 (glow), gold 6.0:1 (glow),
// mute 5.9:1 (glow), on-green 10.3:1 (green), night on a gold button 8.4:1.
// Keep any new text colour at 4.5:1 or more on its background.
export const THEME = {
  /** Page background: the brand green pushed toward black, still clearly green. */
  night: "#082215",
  /** The house's green glow, radial, at the top of every page and behind the quote. */
  glow: "#0f3f28",
  /** Kitchen gallery wall. */
  wall: "#0a2f1e",
  /** Mat around framed photos: lighter than the wall, so each photo sits in light. */
  mat: "#0e3524",
  /** Brand primary: invitation band. */
  green: "#00371a",
  /** Brand secondary: labels, buttons, hairlines. */
  gold: "#cfb485",
  /** Headings, key data. */
  ivory: "#f1ead9",
  /** Body text. */
  "ivory-2": "#d9d1be",
  /** Secondary text. */
  mute: "#bdb6a2",
  /** Body text on the brand-green invitation band. */
  "on-green": "#dfe3d6",
} as const;
