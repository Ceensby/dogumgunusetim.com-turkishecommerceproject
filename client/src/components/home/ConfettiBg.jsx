import { Box } from '@mui/material';

export default function ConfettiBg() {
  return (
    <Box
      aria-hidden
      sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice">
        <circle cx="80" cy="70" r="18" fill="#FF4D8D" opacity="0.18" />
        <circle cx="720" cy="90" r="28" fill="#7C4DFF" opacity="0.16" />
        <circle cx="160" cy="380" r="22" fill="#FFC93C" opacity="0.2" />
        <circle cx="640" cy="360" r="16" fill="#FF80AE" opacity="0.2" />
        <rect x="240" y="40" width="12" height="22" rx="4" fill="#C77DFF" opacity="0.25" transform="rotate(18 246 51)" />
        <rect x="500" y="420" width="14" height="24" rx="4" fill="#2DBE8F" opacity="0.2" transform="rotate(-22 507 432)" />
        <ellipse cx="400" cy="120" rx="36" ry="22" fill="#A47BFF" opacity="0.12" />
        <ellipse cx="120" cy="220" rx="20" ry="28" fill="#FF80AE" opacity="0.15" />
      </svg>
    </Box>
  );
}
