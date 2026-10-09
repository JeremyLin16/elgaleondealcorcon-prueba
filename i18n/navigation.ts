import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Always use these instead of next/link and next/navigation: they add the
// locale prefix when needed.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
