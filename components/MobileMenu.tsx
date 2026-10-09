"use client";

import { useRef } from "react";

// The mobile menu is a <details> element, so it opens and closes without
// JavaScript. This wrapper only adds what <details> cannot do on its own:
// close after a link is tapped (in-page anchors would otherwise leave it
// covering the section), close with Escape, and close when keyboard focus
// leaves it (tabbing past the last item would otherwise focus links hidden
// under the open panel, with no visible focus at all).
export default function MobileMenu({
  summary,
  className,
  children,
}: {
  summary: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute("open");

  return (
    <details
      ref={ref}
      className={className}
      onClick={(event) => {
        if ((event.target as Element).closest("a")) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && ref.current?.open) {
          close();
          ref.current.querySelector("summary")?.focus();
        }
      }}
      onBlur={(event) => {
        // relatedTarget is null when a tap lands on plain text in the panel:
        // that must not close it.
        const next = event.relatedTarget as Node | null;
        if (ref.current?.open && next && !ref.current.contains(next)) close();
      }}
    >
      {summary}
      {children}
    </details>
  );
}
