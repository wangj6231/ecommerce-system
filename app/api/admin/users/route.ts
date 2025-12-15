import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        }
    })

    return NextResponse.json(users)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ message: "ID required" }, { status: 400 })
    }

    try {
        await prisma.user.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: "User deleted" })
    } catch (error) {
        return NextResponse.json({ message: "Error deleting user" }, { status: 500 })
    }
}
