'use client'

import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { WeatherAdvisory } from '@/components/home/WeatherAdvisory'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { FeaturedServices } from '@/components/home/FeaturedServices'
import { PersonalizedFeed } from '@/components/home/PersonalizedFeed'
import type { UserProfile } from '@/lib/api'

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    function checkAuth() {
      try {
        const raw = localStorage.getItem('dishari_user')
        const loggedFlag = localStorage.getItem('dishari_logged_in')
        if (raw && (loggedFlag === 'true' || loggedFlag === null)) {
          const parsed = JSON.parse(raw)
          if (parsed && (parsed.full_name || parsed.citizen_id || parsed.id)) {
            setUser(parsed)
            setIsLoggedIn(true)
            return
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err)
      }
      setUser(null)
      setIsLoggedIn(false)
    }

    checkAuth()
    setMounted(true)

    // Listen for storage events across tabs or window events
    window.addEventListener('storage', checkAuth)
    window.addEventListener('dishari_auth_change', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('dishari_auth_change', checkAuth)
    }
  }, [])

  return (
    <>
      {/* ── Top Sections (Common to All Users) ────────────────────────────── */}
      <HeroSection />
      <StatsSection />
      <WeatherAdvisory />

      {/* ── Dynamic Section: Starts after "Weather & Rural Civic Advisory" ── */}
      {mounted && isLoggedIn && user ? (
        <PersonalizedFeed user={user} />
      ) : (
        <>
          <CategoryGrid />
          <HowItWorks />
          <FeaturedServices />
        </>
      )}
    </>
  )
}
