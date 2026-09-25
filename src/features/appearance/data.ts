import { SettingsDocument } from "./schema";

/**
 * Built-in SVG data URIs as foolproof default meme assets.
 * These ensure zero broken links out-of-the-box before custom video/image assets are uploaded.
 */
export const defaultMemeSVGs = {
  waiting: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="16" fill="#111827"/>
      <!-- Comic Character Waiting (Mr. Bean Impatience energy) -->
      <circle cx="100" cy="80" r="36" fill="#fde047" stroke="#eab308" stroke-width="3"/>
      <!-- Eyes looking at watch -->
      <ellipse cx="88" cy="74" rx="5" ry="7" fill="#000"/>
      <ellipse cx="112" cy="74" rx="5" ry="7" fill="#000"/>
      <circle cx="89" cy="76" r="2" fill="#fff"/>
      <circle cx="113" cy="76" r="2" fill="#fff"/>
      <!-- Slightly bored straight mouth -->
      <path d="M 85 96 Q 100 94 115 96" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Arm holding up watch -->
      <path d="M 70 120 Q 50 140 80 150" stroke="#fde047" stroke-width="8" stroke-linecap="round" fill="none"/>
      <!-- Wristwatch -->
      <circle cx="80" cy="150" r="14" fill="#3b82f6" stroke="#1d4ed8" stroke-width="2"/>
      <line x1="80" y1="150" x2="80" y2="142" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <line x1="80" y1="150" x2="88" y2="150" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
      <text x="100" y="184" text-anchor="middle" fill="#9ca3af" font-family="monospace" font-size="11" font-weight="bold">WAITING ON YOU...</text>
    </svg>
  `)}`,

  sending: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="16" fill="#111827"/>
      <!-- Speed lines -->
      <line x1="30" y1="90" x2="70" y2="90" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 6"/>
      <line x1="20" y1="110" x2="60" y2="110" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 6"/>
      <!-- Origami Rocket / Paper Plane in high velocity -->
      <path d="M 170 50 L 50 110 L 95 125 L 140 80 L 105 135 L 130 155 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="3" stroke-linejoin="round"/>
      <!-- Flame / Thruster exhaust -->
      <circle cx="55" cy="115" r="8" fill="#f97316"/>
      <circle cx="45" cy="120" r="5" fill="#facc15"/>
      <text x="100" y="184" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">DISPATCHING 🚀</text>
    </svg>
  `)}`,

  success: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="16" fill="#111827"/>
      <!-- Confetti burst -->
      <circle cx="45" cy="50" r="4" fill="#ec4899"/>
      <circle cx="155" cy="45" r="5" fill="#eab308"/>
      <circle cx="165" cy="120" r="4" fill="#a855f7"/>
      <circle cx="35" cy="130" r="4" fill="#06b6d4"/>
      <!-- Cheerful Face / Chef's Kiss -->
      <circle cx="100" cy="85" r="38" fill="#22c55e" stroke="#16a34a" stroke-width="3"/>
      <!-- Star Eyes -->
      <path d="M 85 75 L 87 81 L 93 81 L 88 85 L 90 91 L 85 87 L 80 91 L 82 85 L 77 81 L 83 81 Z" fill="#fff"/>
      <path d="M 115 75 L 117 81 L 123 81 L 118 85 L 120 91 L 115 87 L 110 91 L 112 85 L 107 81 L 113 81 Z" fill="#fff"/>
      <!-- Big Happy Smile -->
      <path d="M 82 98 Q 100 115 118 98" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- Thumbs up badge -->
      <circle cx="140" cy="120" r="18" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
      <text x="140" y="126" text-anchor="middle" font-size="16">👍</text>
      <text x="100" y="184" text-anchor="middle" fill="#22c55e" font-family="monospace" font-size="11" font-weight="bold">DELIVERED CLEAN!</text>
    </svg>
  `)}`,

  error: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="16" fill="#111827"/>
      <!-- Dramatic Glitch / Comic Facepalm -->
      <circle cx="100" cy="85" r="38" fill="#ef4444" stroke="#dc2626" stroke-width="3"/>
      <!-- X X Eyes -->
      <line x1="80" y1="75" x2="92" y2="87" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <line x1="92" y1="75" x2="80" y2="87" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <line x1="108" y1="75" x2="120" y2="87" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <line x1="120" y1="75" x2="108" y2="87" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <!-- Wavy mouth -->
      <path d="M 82 105 Q 90 98 100 105 Q 110 112 118 105" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>
      <!-- Comic sweat drop -->
      <path d="M 140 60 C 140 70 148 75 148 80 C 148 85 143 89 138 89 C 133 89 128 85 128 80 C 128 75 136 70 140 60 Z" fill="#38bdf8"/>
      <text x="100" y="184" text-anchor="middle" fill="#ef4444" font-family="monospace" font-size="11" font-weight="bold">SOMETHING GOOFED</text>
    </svg>
  `)}`,

  notFound: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="16" fill="#111827"/>
      <!-- Comic Detective looking around confused -->
      <circle cx="100" cy="80" r="36" fill="#a855f7" stroke="#9333ea" stroke-width="3"/>
      <!-- Confused eyes looking left and right -->
      <circle cx="85" cy="74" r="7" fill="#fff"/>
      <circle cx="82" cy="74" r="3" fill="#000"/>
      <circle cx="115" cy="74" r="7" fill="#fff"/>
      <circle cx="118" cy="74" r="3" fill="#000"/>
      <!-- Tiny confused 'o' mouth -->
      <circle cx="100" cy="95" r="4" fill="#fff"/>
      <!-- Big Magnifying Glass -->
      <circle cx="130" cy="110" r="24" fill="rgba(255,255,255,0.15)" stroke="#fbbf24" stroke-width="4"/>
      <line x1="148" y1="128" x2="170" y2="150" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
      <text x="100" y="184" text-anchor="middle" fill="#c084fc" font-family="monospace" font-size="11" font-weight="bold">404: LOST IN SPACE</text>
    </svg>
  `)}`,

  loading: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="16" fill="#111827"/>
      <!-- Hourglass / Rotating gears -->
      <g transform="translate(100, 85)">
        <circle cx="0" cy="0" r="35" fill="none" stroke="#334155" stroke-width="6"/>
        <path d="M 0 -35 A 35 35 0 0 1 35 0" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
        <!-- Inner comic coffee cup -->
        <path d="M -12 -5 L -8 15 Q 0 20 8 15 L 12 -5 Z" fill="#f59e0b"/>
        <!-- Steam -->
        <path d="M -4 -16 Q -8 -22 -4 -28" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M 4 -16 Q 8 -22 4 -28" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" fill="none"/>
      </g>
      <text x="100" y="184" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">BREWING PIXELS...</text>
    </svg>
  `)}`,
};

export const staticSettings: SettingsDocument = {
  defaultTheme: "day-shift",
  memes: {
    waiting: {
      type: "image",
      publicId: defaultMemeSVGs.waiting,
      alt: "Character tapping foot and checking wristwatch impatiently while waiting",
    },
    sending: {
      type: "image",
      publicId: defaultMemeSVGs.sending,
      alt: "Origami rocket blasting off at top speed",
    },
    success: {
      type: "image",
      publicId: defaultMemeSVGs.success,
      alt: "Cheerful character giving thumbs up with celebratory confetti",
    },
    error: {
      type: "image",
      publicId: defaultMemeSVGs.error,
      alt: "Comic facepalm character with dizzy eyes indicating an error",
    },
    notFound: {
      type: "image",
      publicId: defaultMemeSVGs.notFound,
      alt: "Confused detective searching around with a giant magnifying glass",
    },
    loading: {
      type: "image",
      publicId: defaultMemeSVGs.loading,
      alt: "Coffee cup with brewing steam and rotating progress indicator",
    },
  },
  updatedAt: "2026-09-25T00:00:00.000Z",
};
