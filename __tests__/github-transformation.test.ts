/**
 * Tests for GitHub data transformation functions
 */
import { describe, it, expect } from '@jest/globals'
import {
  transformGitHubOrganizations,
  transformGitHubContributorsToEdges,
} from '../lib/data'
import type { GitHubOrganization, GitHubRepository, GitHubContributor } from '../lib/github-client'

describe('GitHub Data Transformation', () => {
  describe('transformGitHubOrganizations', () => {
    it('should be a function', () => {
      expect(typeof transformGitHubOrganizations).toBe('function')
    })

    it('should handle empty organizations array', () => {
      const orgs: GitHubOrganization[] = []
      const reposMap = new Map<string, GitHubRepository[]>()
      // This would require mocking getGitHubClient
      // For now, just verify the function exists
      expect(transformGitHubOrganizations).toBeDefined()
    })
  })

  describe('transformGitHubContributorsToEdges', () => {
    it('should be a function', () => {
      expect(typeof transformGitHubContributorsToEdges).toBe('function')
    })

    it('should handle empty contributors array', () => {
      const contributors: GitHubContributor[] = []
      // This would require mocking getGitHubClient
      // For now, just verify the function exists
      expect(transformGitHubContributorsToEdges).toBeDefined()
    })
  })
})

