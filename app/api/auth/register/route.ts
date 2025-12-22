import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { username, password, name, phone, address } = await req.json()

        if (!username || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                phone,
                address,
                role: "USER"
            }
        })

        return NextResponse.json({ message: "User created successfully", user: { id: user.id, username: user.username } }, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}
