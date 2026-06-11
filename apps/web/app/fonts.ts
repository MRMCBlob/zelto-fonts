// Site UI fonts, dogfooded straight from our own registry output.
import localFont from "next/font/local";

export const geistSans = localFont({
  src: [
    { path: "../public/r/fonts/geist/GeistVariable.woff2", weight: "100 900", style: "normal" },
    { path: "../public/r/fonts/geist/GeistVariable-Italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

export const geistMono = localFont({
  src: [
    { path: "../public/r/fonts/geist-mono/GeistMonoVariable.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});
