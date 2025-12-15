import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const products = await prisma.product.findMany({
            include: { images: true }
        })
        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching products' }, { status: 500 })
    }
}
