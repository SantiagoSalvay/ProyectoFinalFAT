import { useState, useEffect } from 'react'

export interface CookieConsent {
  accepted: boolean
  timestamp: number
}

const DEFAULT_ACCEPTED = false

const COOKIE_CONSENT_KEY = 'demos_cookie_consent'
const COOKIE_PREFERENCES_KEY = 'demos_preferences'
const COOKIE_ANALYTICS_KEY = 'demos_analytics'

export function useCookies() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [accepted, setAccepted] = useState<boolean>(DEFAULT_ACCEPTED)
  const [showBanner, setShowBanner] = useState(false)

  // Load cookie consent on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)

    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent)
        setConsent(parsedConsent)
        setAccepted(parsedConsent.accepted)
        
        // Check if consent is older than 1 year
        const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000)
        if (parsedConsent.timestamp < oneYearAgo) {
          setShowBanner(true)
        }
      } catch (error) {
        console.error('Error parsing cookie consent:', error)
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }
  }, [])

  // Save consent to localStorage and set cookies
  const saveConsent = (accepted: boolean) => {
    const consentData: CookieConsent = {
      accepted,
      timestamp: Date.now()
    }

    // Save to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData))

    // Set cookies based on consent
    setCookie(COOKIE_CONSENT_KEY, JSON.stringify(consentData), 365)
    
    if (accepted) {
      // Set all cookies if accepted
      setCookie(COOKIE_PREFERENCES_KEY, 'enabled', 365)
      setCookie(COOKIE_ANALYTICS_KEY, 'enabled', 730)
    } else {
      // Only keep essential cookies
      deleteCookie(COOKIE_PREFERENCES_KEY)
      deleteCookie(COOKIE_ANALYTICS_KEY)
    }

    setConsent(consentData)
    setAccepted(accepted)
    setShowBanner(false)
  }

  // Accept all cookies
  const acceptAll = () => {
    saveConsent(true)
  }

  // Reject all non-essential cookies
  const rejectAll = () => {
    saveConsent(false)
  }

  // Check if cookies are accepted
  const isAccepted = (): boolean => {
    return accepted
  }

  // Get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  // Set cookie
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }

  // Delete cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }

  // Clear all cookies
  const clearAllCookies = () => {
    // Clear localStorage
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    localStorage.removeItem(COOKIE_PREFERENCES_KEY)
    localStorage.removeItem(COOKIE_ANALYTICS_KEY)

    // Clear cookies
    deleteCookie(COOKIE_CONSENT_KEY)
    deleteCookie(COOKIE_PREFERENCES_KEY)
    deleteCookie(COOKIE_ANALYTICS_KEY)

    // Reset state
    setConsent(null)
    setAccepted(DEFAULT_ACCEPTED)
    setShowBanner(true)
  }

  // Show banner again
  const showBannerAgain = () => {
    setShowBanner(true)
  }

  return {
    consent,
    accepted,
    showBanner,
    acceptAll,
    rejectAll,
    isAccepted,
    getCookie,
    setCookie,
    deleteCookie,
    clearAllCookies,
    showBannerAgain
  }
}

// Utility functions for cookie management
export const cookieUtils = {
  set: (name: string, value: string, days: number = 365) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  },

  get: (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  },

  delete: (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  },

  exists: (name: string): boolean => {
    return cookieUtils.get(name) !== null
  }
}
