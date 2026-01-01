/**
 * In-memory cache implementation with TTL support
 */
import type { SeedData } from './types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class DataCache {
  private cache: Map<string, CacheEntry<SeedData>>

  constructor() {
    this.cache = new Map()
  }

  /**
   * Get cached data if not expired
   */
  get(key: string): SeedData | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (this.isExpired(key)) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set data in cache with TTL
   */
  set(key: string, data: SeedData, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Check if a cache entry is expired
   */
  isExpired(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return true
    }

    const age = Date.now() - entry.timestamp
    return age > entry.ttl
  }

  /**
   * Invalidate a specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * Get timestamp for a cache entry
   */
  getTimestamp(key: string): number | null {
    const entry = this.cache.get(key)
    return entry ? entry.timestamp : null
  }
}

// Singleton instance
export const dataCache = new DataCache()

