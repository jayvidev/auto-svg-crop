import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export type PreviewBackground = 'checker' | 'light' | 'dark'
export type ResultTab = 'compare' | 'code'

interface Settings {
  optimizeSvgs: boolean
  showCropArea: boolean
  previewBackground: PreviewBackground
  activeTab: ResultTab
  padding: number
  lastEntryId: string | null
}

const localStorageKey = 'auto_svg_crop_settings'

const defaultSettings: Settings = {
  optimizeSvgs: true,
  showCropArea: true,
  previewBackground: 'checker',
  activeTab: 'compare',
  padding: 0,
  lastEntryId: null,
}

const backgrounds: PreviewBackground[] = ['checker', 'light', 'dark']
const tabs: ResultTab[] = ['compare', 'code']

function getInitialSettings(): Settings {
  if (!browser) return defaultSettings

  try {
    const stored = localStorage.getItem(localStorageKey)
    if (!stored) return defaultSettings

    const parsed = JSON.parse(stored) as Partial<Settings>

    return {
      optimizeSvgs:
        typeof parsed.optimizeSvgs === 'boolean'
          ? parsed.optimizeSvgs
          : defaultSettings.optimizeSvgs,
      showCropArea:
        typeof parsed.showCropArea === 'boolean'
          ? parsed.showCropArea
          : defaultSettings.showCropArea,
      previewBackground: backgrounds.includes(parsed.previewBackground as PreviewBackground)
        ? (parsed.previewBackground as PreviewBackground)
        : defaultSettings.previewBackground,
      activeTab: tabs.includes(parsed.activeTab as ResultTab)
        ? (parsed.activeTab as ResultTab)
        : defaultSettings.activeTab,
      padding:
        typeof parsed.padding === 'number' && parsed.padding >= 0 && parsed.padding <= 25
          ? parsed.padding
          : defaultSettings.padding,
      lastEntryId: typeof parsed.lastEntryId === 'string' ? parsed.lastEntryId : null,
    }
  } catch {
    return defaultSettings
  }
}

export const settings = writable<Settings>(getInitialSettings())

if (browser) {
  settings.subscribe((value) => {
    localStorage.setItem(localStorageKey, JSON.stringify(value))
  })
}
