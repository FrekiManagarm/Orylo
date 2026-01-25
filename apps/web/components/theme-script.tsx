/**
 * ThemeScript Component
 * 
 * Story 2.12:
 * - AC1: Detect system preference using CSS prefers-color-scheme
 * - AC3: System preference only (no manual toggle)
 * 
 * This script runs before page render to prevent flash of incorrect theme.
 * It detects the system color scheme preference and applies the "dark" class
 * to the <html> element if dark mode is preferred.
 */
export function ThemeScript() {
  // Inline script to prevent FOUC (Flash of Unstyled Content)
  const themeScript = `
    (function() {
      // AC1: Detect system preference using prefers-color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // AC1: Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      // Run before React hydration to prevent flash
      suppressHydrationWarning
    />
  );
}
