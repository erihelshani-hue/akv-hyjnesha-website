// Single-locale (de) re-exports: keeps existing `@/i18n/navigation` imports
// working after the locale-routing removal. Map directly to Next built-ins.
export { usePathname, useRouter, redirect } from "next/navigation";
export { default as Link } from "next/link";
