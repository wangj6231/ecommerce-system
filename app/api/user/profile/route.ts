import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: parseInt(session.user.id) },
        select: {
            name: true,
            email: true,
            phone: true,
            address: true,
        }
    })

    return NextResponse.json(user)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, phone, address } = await req.json()

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(session.user.id) },
            data: {
                name,
                phone,
                address,
            }
        })
        return NextResponse.json(updatedUser)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating profile' }, { status: 500 })
    }
}
