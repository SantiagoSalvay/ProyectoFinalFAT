import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import CookieBanner from './CookieBanner'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="pt-16 flex-1 bg-white dark:bg-gray-900">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
} 