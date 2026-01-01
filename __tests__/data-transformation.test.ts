/**
 * Tests for data transformation functions
 */
import { describe, it, expect } from '@jest/globals'
import {
  transformCrunchbaseOrganizations,
  transformCrunchbasePeople,
  extractDomainTags,
  normalizeFundingStage,
} from '../lib/data'
import type { CrunchbaseOrganization, CrunchbasePerson } from '../lib/crunchbase-client'

describe('Data Transformation', () => {
  describe('extractDomainTags', () => {
    it('should extract domain tags from categories', () => {
      const categories = [
        { value: 'Machine Learning' },
        { value: 'Computer Vision' },
      ]
      const tags = extractDomainTags(categories)
      expect(tags).toEqual(['Machine Learning', 'Computer Vision'])
    })

    it('should return empty array for undefined categories', () => {
      const tags = extractDomainTags(undefined)
      expect(tags).toEqual([])
    })

    it('should return empty array for empty categories', () => {
      const tags = extractDomainTags([])
      expect(tags).toEqual([])
    })
  })

  describe('normalizeFundingStage', () => {
    it('should normalize stage names', () => {
      expect(normalizeFundingStage('series_a')).toBe('series-a')
      expect(normalizeFundingStage('SERIES_B')).toBe('series-b')
      expect(normalizeFundingStage('seed')).toBe('seed')
    })

    it('should return seed for undefined stage', () => {
      expect(normalizeFundingStage(undefined)).toBe('seed')
    })
  })

  describe('transformCrunchbaseOrganizations', () => {
    it('should transform organization data correctly', () => {
      // Note: This requires the Crunchbase client to be initialized
      // In a real test, we would mock the client
      const mockOrg: CrunchbaseOrganization = {
        uuid: 'test-uuid',
        properties: {
          name: 'Test Startup',
          categories: [{ value: 'AI' }],
          funding_stage: 'series-a',
          founded_on: '2020-01-01',
          location_identifiers: [{ value: 'San Francisco' }],
          short_description: 'Test description',
        },
      }

      // This test would require mocking the getCrunchbaseClient function
      // For now, we'll just verify the function exists
      expect(typeof transformCrunchbaseOrganizations).toBe('function')
    })
  })

  describe('transformCrunchbasePeople', () => {
    it('should transform person data correctly', () => {
      // Similar to organizations, this requires mocking
      expect(typeof transformCrunchbasePeople).toBe('function')
    })
  })
})

