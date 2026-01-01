/**
 * Tests for data cache
 */
import { describe, it, expect, beforeEach } from '@jest/globals'
import { dataCache } from '../lib/cache'
import type { SeedData } from '../lib/types'

describe('Data Cache', () => {
  beforeEach(() => {
    dataCache.clear()
  })

  it('should store and retrieve data', () => {
    const testData: SeedData = {
      startups: [],
      people: [],
      edges: [],
    }

    dataCache.set('test-key', testData, 1000)
    const retrieved = dataCache.get('test-key')

    expect(retrieved).toEqual(testData)
  })

  it('should return null for non-existent key', () => {
    const retrieved = dataCache.get('non-existent')
    expect(retrieved).toBeNull()
  })

  it('should return null for expired entries', () => {
    const testData: SeedData = {
      startups: [],
      people: [],
      edges: [],
    }

    // Set with very short TTL
    dataCache.set('expired-key', testData, 1)

    // Wait for expiration
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const retrieved = dataCache.get('expired-key')
        expect(retrieved).toBeNull()
        resolve()
      }, 10)
    })
  })

  it('should invalidate specific keys', () => {
    const testData: SeedData = {
      startups: [],
      people: [],
      edges: [],
    }

    dataCache.set('key1', testData, 1000)
    dataCache.set('key2', testData, 1000)

    dataCache.invalidate('key1')

    expect(dataCache.get('key1')).toBeNull()
    expect(dataCache.get('key2')).toEqual(testData)
  })

  it('should clear all entries', () => {
    const testData: SeedData = {
      startups: [],
      people: [],
      edges: [],
    }

    dataCache.set('key1', testData, 1000)
    dataCache.set('key2', testData, 1000)

    dataCache.clear()

    expect(dataCache.get('key1')).toBeNull()
    expect(dataCache.get('key2')).toBeNull()
  })

  it('should return cache statistics', () => {
    const testData: SeedData = {
      startups: [],
      people: [],
      edges: [],
    }

    dataCache.set('key1', testData, 1000)
    dataCache.set('key2', testData, 1000)

    const stats = dataCache.getStats()

    expect(stats.size).toBe(2)
    expect(stats.keys).toContain('key1')
    expect(stats.keys).toContain('key2')
  })

  it('should correctly identify expired entries', () => {
    const testData: SeedData = {
      startups: [],
      people: [],
      edges: [],
    }

    dataCache.set('expired-key', testData, 1)

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(dataCache.isExpired('expired-key')).toBe(true)
        resolve()
      }, 10)
    })
  })

  it('should correctly identify non-expired entries', () => {
    const testData: SeedData = {
      startups: [],
      people: [],
      edges: [],
    }

    dataCache.set('valid-key', testData, 10000)
    expect(dataCache.isExpired('valid-key')).toBe(false)
  })
})

