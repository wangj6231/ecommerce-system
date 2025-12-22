
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const envCheck = {
            NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Defined' : 'Missing',
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Defined' : 'Missing',
            DATABASE_URL: process.env.DATABASE_URL ? 'Defined' : 'Missing',
            POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'Defined' : 'Missing',
        }

        let dbStatus = 'Unknown'
        let adminStatus = 'Unknown'
        let userCount = 0

        try {
            userCount = await prisma.user.count()
            dbStatus = 'Connected'

            const admin = await prisma.user.findUnique({
                where: { username: 'admin' }
            })

            if (admin) {
                adminStatus = `Found (Role: ${admin.role})`
            } else {
                adminStatus = 'Not Found'
            }
        } catch (dbError: any) {
            dbStatus = `Error: ${dbError.message}`
        }

        return NextResponse.json({
            environment: envCheck,
            database: {
                status: dbStatus,
                userCount,
                adminUser: adminStatus
            },
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
