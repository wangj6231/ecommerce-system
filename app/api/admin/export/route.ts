import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany()

    const csvHeader = "id,email,name,role,createdAt\n"
    const csvRows = users.map(user =>
        `${user.id},${user.email},${user.name || ''},${user.role},${user.createdAt.toISOString()}`
    ).join("\n")

    const csv = csvHeader + csvRows

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=users.csv"
        }
    })
}
