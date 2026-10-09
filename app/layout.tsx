// The real root layout (with <html lang>) is app/[locale]/layout.tsx. This
// pass-through only exists because app/not-found.tsx needs a root layout.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
