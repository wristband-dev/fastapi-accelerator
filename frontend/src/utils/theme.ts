// User-Customizable Theme Configuration
export interface UserTheme {
  primary: string;
  primaryLight: string;
}

// Default theme - users can easily modify these colors
export const userTheme: UserTheme = {
  primary: '#00AA81',      // Primary color
  primaryLight: '#00FFC1', // Primary light color
};

// Extended theme interface for internal use
export interface ExtendedTheme extends UserTheme {
  primaryDark: string;
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// Auto-generated extended theme based on user colors
export const getExtendedTheme = (theme: UserTheme): ExtendedTheme => {
  // Generate darker version of primary color
  const primaryDark = adjustBrightness(theme.primary, -0.2);
  
  return {
    ...theme,
    primaryDark,
    gradients: {
      primary: `from-[${primaryDark}] to-[${theme.primary}]`,
      secondary: `from-[${theme.primary}] to-[${theme.primaryLight}]`,
      accent: `from-[${primaryDark}] to-[${theme.primaryLight}]`,
    },
    status: {
      success: theme.primary,
      warning: '#f59e0b',
      error: '#ef4444',
      info: theme.primary,
    },
  };
};

// Utility function to adjust brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(G | (B << 8) | (R << 16)).toString(16).padStart(6, '0')}`;
}

// Current active theme
export const currentTheme = getExtendedTheme(userTheme);

// Theme utility functions
export const getGradientClasses = (gradientName: keyof ExtendedTheme['gradients']) => {
  return `bg-gradient-to-r ${currentTheme.gradients[gradientName]}`;
};

export const getPrimaryColor = () => {
  return currentTheme.primary;
};

export const getPrimaryLightColor = () => {
  return currentTheme.primaryLight;
};

export const getPrimaryDarkColor = () => {
  return currentTheme.primaryDark;
};

export const getStatusColor = (status: keyof ExtendedTheme['status']) => {
  return currentTheme.status[status];
}; 