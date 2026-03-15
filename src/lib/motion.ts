/**
 * OkulPano Display — Merkezi Motion Config
 * 
 * Tüm animasyon süreleri, easing fonksiyonları ve interval değerleri
 * bu dosyada toplanır. Display ekranının "kurumsal okul bilgi ekranı"
 * hissi vermesi için tasarlanmıştır.
 */

export const motion = {
  // ===== EASING =====
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",   // ease-in-out (smooth)
    fadeIn:  "cubic-bezier(0.0, 0, 0.2, 1)",    // ease-out (decelerate)
    fadeOut: "cubic-bezier(0.4, 0, 1, 1)",       // ease-in (accelerate)
    subtle:  "cubic-bezier(0.25, 0.1, 0.25, 1)", // very smooth
  },

  // ===== DURATION (ms) =====
  duration: {
    fade:       800,    // Fade in/out for media, panels
    mediaFade:  900,    // Media slide crossfade
    panelSwap:  500,    // Panel content transitions (duty list, announcements)
    ticker:     0.12,   // Ticker speed factor (seconds per character)
    clock:      300,    // Clock digit transition
    statusDot:  3000,   // Connection status dot pulse cycle
  },

  // ===== INTERVALS (ms) =====
  interval: {
    dutyRotation:         3000,   // Duty teacher single-line rotation
    mediaSlide:           6000,   // Default media slide (overridden by durationSeconds)
    announcementRotation: 8000,   // Announcement card rotation
    clock:                1000,   // Clock update
  },

  // ===== MEDIA TRANSITION =====
  media: {
    fadeMs:    900,      // Crossfade duration
    scaleFrom: 1.02,    // Very subtle scale-in start
    scaleTo:   1.0,     // Scale-in end
  },

  // ===== DUTY PANEL =====
  duty: {
    visibleCount: 5,     // Max visible duty teachers before rotation starts
    rotateOneByOne: true, // Rotate single items instead of pages
  },

  // ===== ANNOUNCEMENT PANEL =====
  announcement: {
    visibleCount: 4,      // Max visible announcements before rotation starts
  },

  // ===== CSS CUSTOM PROPERTIES =====
  // These get injected as inline CSS vars for use in globals.css
  toCSSVars(): Record<string, string> {
    return {
      "--motion-fade":        `${this.duration.fade}ms`,
      "--motion-media-fade":  `${this.duration.mediaFade}ms`,
      "--motion-panel-swap":  `${this.duration.panelSwap}ms`,
      "--motion-easing":      this.easing.default,
      "--motion-easing-fade": this.easing.fadeIn,
      "--motion-easing-subtle": this.easing.subtle,
    }
  },
} as const
