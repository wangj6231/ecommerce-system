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
            username: true,
            name: true,
            phone: true,
            address: true,
            email: true,
        }
    })

    return NextResponse.json(user)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, phone, address, password } = await req.json()

    const data: any = {
        name,
        phone,
        address,
    }

    if (password) {
        const bcrypt = require('bcryptjs')
        data.password = await bcrypt.hash(password, 10)
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(session.user.id) },
            data
        })
        return NextResponse.json(updatedUser)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating profile' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.user.delete({
            where: { id: parseInt(session.user.id) }
        })
        return NextResponse.json({ message: 'User deleted' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting account' }, { status: 500 })
    }
}
