export interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: {
    background: string
    surface: string
    surfaceAlt: string
    primary: string
    accent: string
    text: string
    textSecondary: string
    border: string
    cardBg: string
    headerBg: string
    tickerBg: string
    tickerText: string
    urgentBg: string
    importantBg: string
  }
  cardRadius: string
  fontScale: number
}

export const themes: Record<string, ThemeConfig> = {
  resmi: {
    id: "resmi",
    name: "Resmi",
    description: "Premium lacivert signage, sakin ve kurumsal",
    colors: {
      background: "#0f1b2d",
      surface: "rgba(20, 35, 62, 0.6)",
      surfaceAlt: "rgba(25, 42, 72, 0.5)",
      primary: "#162138",
      accent: "#c9a84c",
      text: "#e8edf5",
      textSecondary: "#7b90ae",
      border: "rgba(255, 255, 255, 0.08)",
      cardBg: "rgba(18, 30, 52, 0.65)",
      headerBg: "rgba(12, 20, 36, 0.95)",
      tickerBg: "rgba(10, 16, 30, 0.95)",
      tickerText: "#d0d8e4",
      urgentBg: "#b91c1c",
      importantBg: "#d97706",
    },
    cardRadius: "10px",
    fontScale: 100,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Koyu ton, zarif detaylar, profesyonel hissiyat",
    colors: {
      background: "#101420",
      surface: "rgba(25, 32, 50, 0.7)",
      surfaceAlt: "rgba(32, 40, 62, 0.5)",
      primary: "#4a5a82",
      accent: "#5b9bd5",
      text: "#e8edf3",
      textSecondary: "#8a9ab5",
      border: "rgba(255, 255, 255, 0.07)",
      cardBg: "rgba(22, 28, 45, 0.65)",
      headerBg: "rgba(12, 16, 28, 0.95)",
      tickerBg: "rgba(18, 24, 40, 0.95)",
      tickerText: "#c8d0dc",
      urgentBg: "#b53535",
      importantBg: "#b8892a",
    },
    cardRadius: "10px",
    fontScale: 100,
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Açık tema, temiz çizgiler, maksimum okunabilirlik",
    colors: {
      background: "#f1f5f9",
      surface: "#ffffff",
      surfaceAlt: "#f8fafc",
      primary: "#1e40af",
      accent: "#0891b2",
      text: "#1e293b",
      textSecondary: "#64748b",
      border: "rgba(0, 0, 0, 0.08)",
      cardBg: "#ffffff",
      headerBg: "#1e3a5f",
      tickerBg: "#1e40af",
      tickerText: "#ffffff",
      urgentBg: "#dc2626",
      importantBg: "#d97706",
    },
    cardRadius: "10px",
    fontScale: 100,
  },
}

export function getTheme(themeId: string): ThemeConfig {
  return themes[themeId] || themes.resmi
}

export function getThemeCSS(theme: ThemeConfig): Record<string, string> {
  return {
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-surface-alt": theme.colors.surfaceAlt,
    "--color-primary": theme.colors.primary,
    "--color-accent": theme.colors.accent,
    "--color-text": theme.colors.text,
    "--color-text-secondary": theme.colors.textSecondary,
    "--color-border": theme.colors.border,
    "--color-card-bg": theme.colors.cardBg,
    "--color-header-bg": theme.colors.headerBg,
    "--color-ticker-bg": theme.colors.tickerBg,
    "--color-ticker-text": theme.colors.tickerText,
    "--color-urgent-bg": theme.colors.urgentBg,
    "--color-important-bg": theme.colors.importantBg,
    "--card-radius": theme.cardRadius,
    "--font-scale": `${theme.fontScale}%`,
  }
}
