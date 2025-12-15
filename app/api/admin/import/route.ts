import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const users = Array.isArray(body) ? body : [body]

        let count = 0
        for (const user of users) {
            if (!user.email || !user.password) continue

            const hashedPassword = await bcrypt.hash(user.password, 10)

            await prisma.user.upsert({
                where: { email: user.email },
                update: {
                    name: user.name,
                    role: user.role || "USER",
                },
                create: {
                    email: user.email,
                    password: hashedPassword,
                    name: user.name,
                    role: user.role || "USER",
                }
            })
            count++
        }

        return NextResponse.json({ message: `Imported ${count} users` })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Import failed" }, { status: 500 })
    }
}
