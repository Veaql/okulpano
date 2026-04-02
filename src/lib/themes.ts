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

export interface ThemePalette {
  id: string
  name: string
  description: string
  primary: string
  accent: string
}

export interface BackgroundPattern {
  id: string
  name: string
  description: string
  preview: string
}

export interface DisplayFont {
  id: string
  name: string
  description: string
  stack: string
  preview: string
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
    description: "Koyu ton, zarif detaylar ve profesyonel his",
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
    description: "Açık tema, temiz çizgiler ve yüksek okunabilirlik",
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

export const colorPalettes: ThemePalette[] = [
  {
    id: "default-gold",
    name: "Resmi Altın",
    description: "Klasik lacivert zemin ve altın vurgu",
    primary: "#1e3a5f",
    accent: "#f59e0b",
  },
  {
    id: "ocean-blue",
    name: "Okyanus Mavi",
    description: "Daha serin ve modern mavi tonlar",
    primary: "#264c7a",
    accent: "#58a6d6",
  },
  {
    id: "emerald-brass",
    name: "Zümrüt Pirinç",
    description: "Resmi ama farklı bir yeşil-altın dengesi",
    primary: "#20453f",
    accent: "#d3a94f",
  },
  {
    id: "slate-copper",
    name: "Bakır Gri",
    description: "Daha ağır duran sıcak vurgu paleti",
    primary: "#343f52",
    accent: "#c98758",
  },
  {
    id: "plum-sand",
    name: "Mürdüm Kum",
    description: "Sofistike ve yumuşak kontrast",
    primary: "#433a57",
    accent: "#d6b27e",
  },
  {
    id: "forest-ice",
    name: "Orman Buz",
    description: "Koyu zemin üstünde serin ve net görünüm",
    primary: "#1f4d49",
    accent: "#73c0d8",
  },
]

export const backgroundPatterns: BackgroundPattern[] = [
  {
    id: "default-grid",
    name: "Kurumsal Çizgi",
    description: "Mevcut görünümü koruyan ince çapraz doku",
    preview:
      "repeating-linear-gradient(135deg, rgba(255,255,255,0.09) 0 10px, rgba(255,255,255,0.02) 10px 20px), linear-gradient(135deg, #10213b, #0b1730)",
  },
  {
    id: "diamond",
    name: "Elmas Ağ",
    description: "Belirgin ama sakin elmas örgü görünümü",
    preview:
      "linear-gradient(135deg, rgba(255,255,255,0.10) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(225deg, rgba(255,255,255,0.10) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(315deg, rgba(255,255,255,0.06) 25%, transparent 25%) 0 0/36px 36px, linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%) 0 0/36px 36px, linear-gradient(135deg, #10213b, #0b1730)",
  },
  {
    id: "blueprint",
    name: "Teknik Izgara",
    description: "Kurumsal pano hissini artıran teknik ızgara",
    preview:
      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(135deg, #11223c, #0a162b)",
  },
  {
    id: "soft-wave",
    name: "Yumuşak Dalga",
    description: "Daha premium ve akışkan yüzey",
    preview:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.05), transparent 30%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.04), transparent 35%), linear-gradient(160deg, #10213b, #0b1730)",
  },
  {
    id: "linen",
    name: "Keten Doku",
    description: "Sade ve ağır kumaş hissi",
    preview:
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 2px, transparent 2px 10px), repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 12px), linear-gradient(135deg, #11223c, #091426)",
  },
]

export const displayFonts: DisplayFont[] = [
  {
    id: "system",
    name: "Kurumsal Sans",
    description: "Mevcut temiz ve güvenli görünüm",
    stack: '"Segoe UI", Tahoma, Arial, sans-serif',
    preview: "Aa Bb Cc 123",
  },
  {
    id: "condensed",
    name: "Dar Başlık",
    description: "TV ekranında güçlü ve resmi başlık hissi",
    stack: '"Arial Narrow", "Roboto Condensed", "Bahnschrift SemiCondensed", Arial, sans-serif',
    preview: "DAR BASLIK 123",
  },
  {
    id: "grotesk",
    name: "Grotesk",
    description: "Biraz daha modern ama hâlâ kurumsal",
    stack: '"Franklin Gothic Medium", "Trebuchet MS", "Segoe UI", Arial, sans-serif',
    preview: "Kurumsal 2026",
  },
  {
    id: "classic",
    name: "Klasik Sans",
    description: "Daha geleneksel kamu kurumu havası",
    stack: 'Verdana, "Segoe UI", Tahoma, sans-serif',
    preview: "Okul Bilgi Ekrani",
  },
]

export function getTheme(themeId: string): ThemeConfig {
  return themes[themeId] || themes.resmi
}

export function getThemePalette(paletteId: string) {
  return colorPalettes.find((palette) => palette.id === paletteId) ?? colorPalettes[0]
}

export function getBackgroundPattern(patternId: string) {
  return backgroundPatterns.find((pattern) => pattern.id === patternId) ?? backgroundPatterns[0]
}

export function getDisplayFont(fontId: string) {
  return displayFonts.find((font) => font.id === fontId) ?? displayFonts[0]
}

export function getDisplayBackground(patternId: string, background: string, primary: string) {
  const overlays: Record<string, string> = {
    "default-grid": `repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 14px, rgba(255,255,255,0.01) 14px 28px), radial-gradient(circle at 50% 14%, rgba(18,42,84,0.34) 0%, rgba(12,24,45,0) 36%), radial-gradient(circle at 18% 24%, rgba(201,168,76,0.12) 0%, rgba(12,24,45,0) 28%)`,
    diamond: `linear-gradient(135deg, rgba(255,255,255,0.08) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(225deg, rgba(255,255,255,0.08) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(315deg, rgba(255,255,255,0.045) 25%, transparent 25%) 0 0/36px 36px, linear-gradient(45deg, rgba(255,255,255,0.045) 25%, transparent 25%) 0 0/36px 36px, radial-gradient(circle at 50% 18%, rgba(255,255,255,0.05), transparent 30%)`,
    blueprint: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px), radial-gradient(circle at 18% 18%, rgba(255,255,255,0.08), transparent 28%)`,
    "soft-wave": `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.07), transparent 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.05), transparent 30%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.04), transparent 35%)`,
    linen: `repeating-linear-gradient(0deg, rgba(255,255,255,0.024) 0 2px, transparent 2px 10px), repeating-linear-gradient(90deg, rgba(255,255,255,0.016) 0 2px, transparent 2px 12px)`,
  }

  return `${overlays[patternId] ?? overlays["default-grid"]}, linear-gradient(180deg, ${background} 0%, ${primary} 100%)`
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
