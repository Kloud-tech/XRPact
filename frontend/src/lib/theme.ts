/**
 * Theme Configuration - XRPL Impact Fund
 *
 * Color palette optimized for:
 * - Blockchain/crypto aesthetic
 * - Environmental/impact theme
 * - High contrast for demos
 * - Accessibility (WCAG AA)
 */

export const theme = {
  // Primary Colors - XRPL Blue + Impact Green
  colors: {
    primary: {
      50: '#E6F2FF',
      100: '#CCE5FF',
      200: '#99CBFF',
      300: '#66B0FF',
      400: '#3396FF',
      500: '#0066CC',  // Main XRPL Blue
      600: '#0052A3',
      700: '#003D7A',
      800: '#002952',
      900: '#001429',
    },

    secondary: {
      50: '#E6F9F0',
      100: '#CCF3E1',
      200: '#99E7C3',
      300: '#66DBA5',
      400: '#33CF87',
      500: '#10B981',  // Impact Green
      600: '#0D9468',
      700: '#0A6F4E',
      800: '#064A35',
      900: '#03251B',
    },

    // Climate Impact - Earthy tones
    climate: {
      primary: '#10B981',   // Green
      secondary: '#34D399', // Light green
      accent: '#059669',    // Dark green
    },

    // NFT Tiers
    nft: {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
    },

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Neutrals
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Background gradients
    gradients: {
      hero: 'linear-gradient(135deg, #0066CC 0%, #10B981 100%)',
      card: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      impact: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      nft: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    },
  },

  // Typography
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },

  // Spacing (4px base)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    neon: '0 0 20px rgba(0, 102, 204, 0.5)',
    impact: '0 0 30px rgba(16, 185, 129, 0.4)',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animations
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

// Utility functions
export const rgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default theme;
