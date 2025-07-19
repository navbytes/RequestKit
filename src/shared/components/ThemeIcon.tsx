import { useState, useEffect } from 'preact/hooks';

import { useTheme } from '@/shared/utils/theme';

interface ThemeIconProps {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  className?: string;
  size?: number;
}

export function ThemeIcon({
  lightSrc,
  darkSrc,
  alt,
  className = '',
  size,
}: ThemeIconProps) {
  const themeManager = useTheme();
  const [isDark, setIsDark] = useState(themeManager.isDarkMode());

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(themeManager.isDarkMode());
    };

    // Check theme on mount
    checkTheme();

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    // Also listen for manual theme changes
    const interval = setInterval(checkTheme, 1000);

    return () => {
      mediaQuery.removeEventListener('change', checkTheme);
      clearInterval(interval);
    };
  }, [themeManager]);

  const iconSrc = isDark ? darkSrc : lightSrc;
  const sizeProps = size ? { width: size, height: size } : {};

  return <img src={iconSrc} alt={alt} className={className} {...sizeProps} />;
}
