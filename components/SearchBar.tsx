'use client'

import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearchChange: (searchTerm: string) => void
  debounceMs?: number
}

export default function SearchBar({ onSearchChange, debounceMs = 300 }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs, onSearchChange])

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search startups or people..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}

