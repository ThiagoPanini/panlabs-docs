// @ts-check

/**
 * The one call every sidebar file makes to get an icon: a slug from
 * lucide.dev in, a `className` out. It knows no icon itself and is never
 * edited — `src/plugins/sidebar-icons` resolves the slug against the
 * installed `lucide-static` package and fails the build if it doesn't
 * exist.
 *
 * @param {string} slug
 * @returns {{className: string}}
 */
export const icon = (slug) => ({className: `sidebar-icon sidebar-icon--${slug}`});
