
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            role: true
        }
    })

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { username, name, phone, address, password } = body

    const updateData: any = {
        username,
        name,
        phone,
        address
    }

    if (password) {
        updateData.password = await bcrypt.hash(password, 10)
    }

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        })
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ message: "Error updating user" }, { status: 500 })
    }
}
