'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { patternIdToKey, patternKeyToId, getPatternKeys } from '../components/PatternOverlay'

const MAX_LIST_SIZE = 10

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

    const ids = listParam.split(',').filter(Boolean)
    const patterns = ids
      .map(id => patternIdToKey(id))
      .filter((key): key is string => key !== undefined)

    return patterns.slice(0, MAX_LIST_SIZE)
  }, [searchParams])

  // Update URL with new state
  const updateUrl = useCallback((list: string[]) => {
    const params = new URLSearchParams()

    // Add list param if not empty
    if (list.length > 0) {
      const ids = list
        .map(key => patternKeyToId(key))
        .filter((id): id is string => id !== undefined)
      if (ids.length > 0) {
        params.set('list', ids.join(','))
      }
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [pathname, router])

  // Add a pattern to the list
  const addPattern = useCallback((patternKey: string) => {
    const validKeys = getPatternKeys()
    if (!validKeys.includes(patternKey)) return
    if (scrapeList.length >= MAX_LIST_SIZE) return

    const newList = [...scrapeList, patternKey]
    updateUrl(newList)
  }, [scrapeList, updateUrl])

  // Remove a pattern at specific index
  const removePattern = useCallback((index: number) => {
    if (index < 0 || index >= scrapeList.length) return

    const newList = scrapeList.filter((_, i) => i !== index)
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
    clearAll,
    canAddMore,
    maxListSize: MAX_LIST_SIZE,
  }
}
