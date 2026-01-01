import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Startup Ecosystem Graph',
  description: 'Visualize relationships between AI startups and their cofounders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

