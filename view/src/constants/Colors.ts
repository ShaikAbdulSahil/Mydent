/**
 * ─── MyDent Color Palette ──────────────────────────────────
 * Single source of truth for all UI colors.
 * Import: import { Colors } from '../constants/Colors';
 */

export const Colors = {
    // ─── Brand ──────────────────────────────────────────────
    primary: '#023c69',        // Dark blue — main buttons, headings, active states
    primaryLight: '#1e90ff',   // Dodger blue — links, accents, secondary actions
    primaryBg: '#E9F9FA',      // Light teal — app background, navbar, drawer header
    brandRed: '#E84850',       // MyDent red — CTA buttons, cart badge, brand icon

    // ─── Backgrounds ───────────────────────────────────────
    screenBg: '#f9fafe',       // Default screen background
    cardBg: '#ffffff',         // Card / surface background
    inputBg: '#ffffff',        // Input field background
    skeletonBg: '#f0f0f0',    // Skeleton / placeholder background
    overlayBg: 'rgba(0,0,0,0.5)', // Modal overlays

    // ─── Text ──────────────────────────────────────────────
    textPrimary: '#1a1a2e',   // Headings, titles
    textBody: '#333333',      // Body text
    textSecondary: '#666666', // Secondary / description text
    textMuted: '#999999',     // Placeholders, disabled text
    textOnPrimary: '#ffffff', // Text on primary / dark buttons
    textOnBrand: '#ffffff',   // Text on brand red buttons

    // ─── Status / Feedback ────────────────────────────────
    success: '#28a745',       // Success actions, positive state
    error: '#e74c3c',         // Error text, destructive actions
    errorBg: '#FFF5F5',       // Error background tint
    warning: '#FFC107',       // Warnings, pending states
    info: '#00AEEF',          // Info, timeline, progress

    // ─── Borders & Dividers ───────────────────────────────
    border: '#ddd',           // Default borders
    borderLight: '#eee',      // Light dividers, separators
    borderInput: '#ccc',      // Input borders

    // ─── Interactive ──────────────────────────────────────
    link: '#1e90ff',          // Inline links, "forgot password", "change email"
    tabActive: '#023c69',     // Active tab indicator + label
    tabInactive: '#888888',   // Inactive tab label
    checkboxActive: '#1e90ff',// Checkbox checked border & bg tint
    checkboxBg: '#e6f2ff',    // Checkbox checked fill

    // ─── Specific Components ──────────────────────────────
    favorite: '#e53935',      // Heart icon (filled)
    favoriteInactive: '#888', // Heart icon (outline)
    ratingBadge: '#FFD700',   // Star / rating gold
    discount: '#0a9f0a',      // Discount percentage green
    shadow: '#000000',        // Shadow color (use with opacity)
    categoryBg: '#f0f4ff',    // Category grid image wrapper
    sectionHeaderBg: '#f0f8ff',   // Accordion / collapsible header
    sectionHeaderActiveBg: '#dbeeff', // Active accordion header

    // ─── OTP Input ────────────────────────────────────────
    otpBorder: '#d0d5dd',     // OTP cell default border
    otpFilled: '#1e90ff',     // OTP cell filled border
    otpFilledBg: '#f0f7ff',   // OTP cell filled background
    otpText: '#023c69',       // OTP digit text

    // ─── Accent / Feature ───────────────────────────────
    teal: '#00788D',           // Teal headers, notification icons (ContactUs)
    successAlt: '#00A67E',     // Alternate green — join buttons, session text
    successDark: '#4CAF50',    // Darker green — completed states, ratings
    darkBg: '#111827',         // Dark theme container (SmilePreview)
    tealLight: '#0097a7',     // Teal accent — clinic visit CTA
    featuredBg: '#00A29B',    // Featured section bg strip

    // ─── Semantic Alert Backgrounds ───────────────────────
    successBg: '#d1e7dd',     // Success/upcoming badge bg
    successText: '#0f5132',   // Success badge text
    dangerBg: '#ffe5e5',      // Danger/warning card bg
    dangerText: '#7a0000',    // Danger card text
    noticeBg: '#e7f3ff',      // Info notice bg
    noticeText: '#003366',    // Info notice text

    // ─── Transparent ──────────────────────────────────────
    transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
