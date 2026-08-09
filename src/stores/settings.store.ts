import { writable } from 'svelte/store'
import { browser } from '$app/environment'

interface Settings {
  optimizeSvgs: boolean
}

const localStorageKey = 'auto_svg_crop_settings'
const defaultSettings: Settings = {
  optimizeSvgs: true,
}

function getInitialSettings(): Settings {
  if (browser) {
    try {
      const stored = localStorage.getItem(localStorageKey)
      if (stored) {
        const parsedSettings = JSON.parse(stored) as Partial<Settings>
        return {
          optimizeSvgs:
            typeof parsedSettings.optimizeSvgs === 'boolean'
              ? parsedSettings.optimizeSvgs
              : defaultSettings.optimizeSvgs,
        }
      }
    } catch {
      return defaultSettings
    }
  }
  return defaultSettings
}

export const settings = writable<Settings>(getInitialSettings())

if (browser) {
  settings.subscribe((value) => {
    localStorage.setItem(localStorageKey, JSON.stringify(value))
  })
}
