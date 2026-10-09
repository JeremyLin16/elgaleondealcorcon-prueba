/* eslint-disable @next/next/no-img-element -- next/image cannot output our
   own srcset when images.unoptimized is on (Cloudflare Workers, see
   next.config.ts), so photos use a plain <img> with the pre-built widths. */
import { preload } from "react-dom";
import { photo, type PhotoName } from "@/lib/images";

interface PhotoProps {
  name: PhotoName;
  /** Descriptive text, from messages (home.photos.<name>.alt). "" if decorative. */
  alt: string;
  /** Displayed width per breakpoint, e.g. "(max-width: 640px) 100vw, 420px". */
  sizes: string;
  /** The main above-the-fold image (one per page): loaded first, never lazily. */
  priority?: boolean;
  className?: string;
}

// Every photo of the site goes through here: intrinsic width/height (no
// layout shift), srcset from lib/images.json, lazy loading except for the
// one priority image, which is also preloaded from <head>.
export default function Photo({ name, alt, sizes, priority = false, className }: PhotoProps) {
  const { src, srcSet, width, height } = photo(name);
  if (priority) {
    preload(src, { as: "image", imageSrcSet: srcSet, imageSizes: srcSet ? sizes : undefined, fetchPriority: "high" });
  }
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? undefined : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={className}
    />
  );
}
