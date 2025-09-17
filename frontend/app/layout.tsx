import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import LoginMenu from '@/components/auth/LoginMenu'
import AIChatWrapper from '@/components/AIChatWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Okapiq - Bloomberg for Small Businesses',
  description: 'Market intelligence platform for small business acquisitions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} bg-[#fcfbfa]`}>
        <Providers>
          {/* Global Navigation */}
          <div className="border-b bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <a href="/" className="font-semibold text-gray-800">Okapiq</a>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Dashboard</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-gray-700">
                <a href="/dashboard" className="hover:text-black">Dashboard</a>
                <a href="/oppy" className="hover:text-black">Market Scanner</a>
                <a href="/fragment-finder" className="hover:text-black">Fragment Finder</a>
                <a href="/crm" className="hover:text-black">CRM</a>
                <a href="/case-studies" className="hover:text-black">Case Studies</a>
                <a href="/pricing" className="hover:text-black">Pricing</a>
                <LoginMenu />
              </nav>
            </div>
          </div>
          {children}
          {/* AI Chat Assistant - appears on all pages */}
          <AIChatWrapper />
        </Providers>
      </body>
    </html>
  )
}
