// Wristband Theme Configuration
// Extracted from wristband_logo.svg: #00AA81, #00CC9A, #00FFC1

export interface ThemeColors {
  primary: {
    dark: string;
    main: string;
    light: string;
  };
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

// Default Wristband Theme (Greens from logo)
export const wristbandTheme: ThemeColors = {
  primary: {
    dark: '#00AA81',   // From logo
    main: '#00CC9A',   // From logo  
    light: '#00FFC1',  // From logo
  },
  gradients: {
    primary: 'from-[#00AA81] to-[#00CC9A]',
    secondary: 'from-[#00CC9A] to-[#00FFC1]', 
    accent: 'from-[#00AA81] to-[#00FFC1]',
  },
  status: {
    success: '#00CC9A',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#00AA81',
  },
};

// Alternative themes for easy customization
export const blueTheme: ThemeColors = {
  primary: {
    dark: '#1e40af',
    main: '#3b82f6',
    light: '#60a5fa',
  },
  gradients: {
    primary: 'from-blue-600 to-blue-500',
    secondary: 'from-blue-500 to-blue-400',
    accent: 'from-blue-600 to-blue-400',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b', 
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const purpleTheme: ThemeColors = {
  primary: {
    dark: '#7c3aed',
    main: '#8b5cf6',
    light: '#a78bfa',
  },
  gradients: {
    primary: 'from-purple-600 to-purple-500',
    secondary: 'from-purple-500 to-purple-400',
    accent: 'from-purple-600 to-purple-400',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444', 
    info: '#8b5cf6',
  },
};

// Current active theme - developers can change this
export const currentTheme = wristbandTheme;

// Theme utility functions
export const getGradientClasses = (gradientName: keyof ThemeColors['gradients']) => {
  return `bg-gradient-to-r ${currentTheme.gradients[gradientName]}`;
};

export const getPrimaryColor = (shade: keyof ThemeColors['primary']) => {
  return currentTheme.primary[shade];
};

export const getStatusColor = (status: keyof ThemeColors['status']) => {
  return currentTheme.status[status];
}; 