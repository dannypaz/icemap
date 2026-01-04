'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { patternIdToKey, patternKeyToId, getPatternKeys } from '../components/PatternOverlay'

const MAX_LIST_SIZE = 10

export interface ScrapeEntry {
  patternKey: string
  angleOn: boolean
  inside: boolean
}

function normalizeAngleFlag(value: string | undefined): boolean {
  if (value === undefined) return false
  if (value === '1') return true
  if (value === '0') return false
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return false
  return Math.abs(parsed) >= 1
}

export function usePatternState() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parse scrape list from URL (ordered, allows duplicates, can be empty)
  const scrapeList = useMemo(() => {
    const listParam = searchParams.get('list')
    if (!listParam) {
      return []
    }

    const items = listParam.split(',').filter(Boolean)
    const patterns = items
      .map(item => {
        const [id, anglePart, insidePart] = item.split('~')
        const key = patternIdToKey(id)
        if (!key) return null
        const angleOn = normalizeAngleFlag(anglePart)
        const inside = insidePart ? normalizeAngleFlag(insidePart) : false
        return { patternKey: key, angleOn, inside }
      })
      .filter((entry): entry is ScrapeEntry => entry !== null)

    return patterns.slice(0, MAX_LIST_SIZE)
  }, [searchParams])

  // Update URL with new state
  const updateUrl = useCallback((list: ScrapeEntry[]) => {
    const params = new URLSearchParams()

    // Add list param if not empty
    if (list.length > 0) {
      const ids = list
        .map(entry => {
          const id = patternKeyToId(entry.patternKey)
          if (!id) return null
          const angleFlag = entry.angleOn ? 1 : 0
          const insideFlag = entry.inside ? 1 : 0
          return `${id}~${angleFlag}~${insideFlag}`
        })
        .filter((id): id is string => id !== null)
      if (ids.length > 0) {
        params.set('list', ids.join(','))
      }
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [pathname, router])

  // Add a pattern to the list
  const addPattern = useCallback((patternKey: string, angleOn = false, inside = false) => {
    const validKeys = getPatternKeys()
    if (!validKeys.includes(patternKey)) return
    if (scrapeList.length >= MAX_LIST_SIZE) return

    const newList = [...scrapeList, { patternKey, angleOn, inside }]
    updateUrl(newList)
  }, [scrapeList, updateUrl])

  // Remove a pattern at specific index
  const removePattern = useCallback((index: number) => {
    if (index < 0 || index >= scrapeList.length) return

    const newList = scrapeList.filter((_, i) => i !== index)
    updateUrl(newList)
  }, [scrapeList, updateUrl])

  const updateAngle = useCallback((index: number, angleOn: boolean) => {
    if (index < 0 || index >= scrapeList.length) return

    const newList = scrapeList.map((entry, i) => {
      if (i !== index) return entry
      return {
        ...entry,
        angleOn,
      }
    })
    updateUrl(newList)
  }, [scrapeList, updateUrl])

  const updateInside = useCallback((index: number, inside: boolean) => {
    if (index < 0 || index >= scrapeList.length) return

    const newList = scrapeList.map((entry, i) => {
      if (i !== index) return entry
      return {
        ...entry,
        inside,
      }
    })
    updateUrl(newList)
  }, [scrapeList, updateUrl])

  // Clear all patterns
  const clearAll = useCallback(() => {
    updateUrl([])
  }, [updateUrl])

  // Check if we can add more patterns
  const canAddMore = scrapeList.length < MAX_LIST_SIZE

  return {
    scrapeList,
    addPattern,
    removePattern,
    updateAngle,
    updateInside,
    clearAll,
    canAddMore,
    maxListSize: MAX_LIST_SIZE,
  }
}
