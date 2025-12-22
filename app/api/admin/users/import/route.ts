
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
        const users = await req.json()

        if (!Array.isArray(users)) {
            return NextResponse.json({ message: "Invalid data format" }, { status: 400 })
        }

        let successCount = 0
        let tempPasswordHash = await bcrypt.hash('123456', 10) // default password if missing

        for (const user of users) {
            // Map fields from Excel (assuming headers match or we normalize them)
            // Expected headers: '會員帳號', '會員姓名', etc or map English keys
            // I'll assume the frontend maps them to: username, name, password, phone, address

            if (!user.username) continue

            const password = user.password ? await bcrypt.hash(String(user.password), 10) : tempPasswordHash

            await prisma.user.upsert({
                where: { username: String(user.username) },
                update: {
                    name: user.name,
                    phone: user.phone ? String(user.phone) : undefined,
                    address: user.address,
                    // valid logic for password update? maybe only if provided
                },
                create: {
                    username: String(user.username),
                    password: password,
                    name: user.name,
                    phone: user.phone ? String(user.phone) : undefined,
                    address: user.address,
                    role: 'USER'
                }
            })
            successCount++
        }

        return NextResponse.json({ message: `Imported ${successCount} users successfully` })
    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json({ message: "Error importing users" }, { status: 500 })
    }
}
