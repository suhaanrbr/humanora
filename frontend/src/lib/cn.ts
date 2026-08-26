/**
 * Tiny classname combinator. Filters falsy values and joins the rest.
 * Kept dependency-free on purpose (no clsx/tailwind-merge) since our
 * class lists are short and non-conflicting.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
