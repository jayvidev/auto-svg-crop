import { writable } from 'svelte/store'
import { browser } from '$app/environment'

import type { Box } from '@/utils/cropSvg'

export interface HistoryEntry {
  id: string
  name: string
  code: string
  crop: Box
  width: number
  height: number
  createdAt: number
}

const localStorageKey = 'auto_svg_crop_history'

export const maxEntries = 8
export const maxEntryBytes = 256 * 1024

const byteSize = (content: string) => new TextEncoder().encode(content).length

function getInitialHistory(): HistoryEntry[] {
  if (!browser) return []

  try {
    const stored = localStorage.getItem(localStorageKey)
    if (!stored) return []

    const parsed = JSON.parse(stored) as HistoryEntry[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter((entry) => typeof entry?.code === 'string').slice(0, maxEntries)
  } catch {
    return []
  }
}

export const history = writable<HistoryEntry[]>(getInitialHistory())

if (browser) {
  history.subscribe((entries) => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(entries))
    } catch {
      localStorage.removeItem(localStorageKey)
    }
  })
}

export const addToHistory = (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => {
  if (byteSize(entry.code) > maxEntryBytes) return

  history.update((entries) => [
    { ...entry, id: crypto.randomUUID(), createdAt: Date.now() },
    ...entries.filter((existing) => existing.code !== entry.code),
  ])
  history.update((entries) => entries.slice(0, maxEntries))
}

export const removeFromHistory = (id: string) => {
  history.update((entries) => entries.filter((entry) => entry.id !== id))
}

export const clearHistory = () => history.set([])
