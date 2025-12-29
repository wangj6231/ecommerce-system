'use client'

import { useEffect, useRef, useCallback } from 'react'
import { signOut, useSession } from 'next-auth/react'

const IDLE_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds

export function AutoLogout() {
    const { data: session } = useSession()
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const logout = useCallback(() => {
        if (session) {
            console.log('User inactive for too long, signing out...')
            signOut({ callbackUrl: '/login' })
        }
    }, [session])

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        if (session) {
            timerRef.current = setTimeout(logout, IDLE_TIMEOUT)
        }
    }, [logout, session])

    useEffect(() => {
        if (!session) return

        // Initial timer start
        resetTimer()

        // Events to monitor
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ]

        // Throttle the event listener to avoid performance issues
        let lastReset = Date.now()
        const handleActivity = () => {
            const now = Date.now()
            // Only reset if more than 1 second has passed to prevent thrashing
            if (now - lastReset > 1000) {
                resetTimer()
                lastReset = now
            }
        }

        events.forEach((event) => {
            window.addEventListener(event, handleActivity)
        })

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [resetTimer, session])

    return null
}
