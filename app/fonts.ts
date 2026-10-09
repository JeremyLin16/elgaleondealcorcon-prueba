import { EB_Garamond, Jost } from "next/font/google";
import localFont from "next/font/local";

// next/font downloads the files at build time and serves them from this
// site: no request from the visitor's browser to Google (privacy policy: no
// third parties, no cookies) and no extra DNS/TLS round trip.
// Only the weights the design uses: each one is a file to download.

/**
 * Display serif: headings, quote, captions. Cormorant Garamond from local
 * files because the upright "á" is patched (its accent sat over the previous
 * letter in "Milán", "Página"): see scripts/fonts/patch-cormorant.py.
 */
export const display = localFont({
  src: [
    { path: "./_fonts/cormorant-garamond-500.woff2", weight: "500", style: "normal" },
    { path: "./_fonts/cormorant-garamond-500-italic.woff2", weight: "500", style: "italic" },
  ],
  display: "swap",
  variable: "--font-display",
  adjustFontFallback: "Times New Roman",
});

/** Text serif: body copy. */
export const text = EB_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-text",
});

/** Small tracked capitals: labels, navigation, buttons. */
export const label = Jost({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-label",
});

export const fontVariables = `${display.variable} ${text.variable} ${label.variable}`;
