'use client'

import { SessionProvider } from "next-auth/react"

import { AutoLogout } from "@/components/AutoLogout"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AutoLogout />
            {children}
        </SessionProvider>
    )
}
