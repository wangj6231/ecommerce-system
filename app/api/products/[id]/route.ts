import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: idParam } = await params
    try {
        const id = parseInt(idParam)
        if (isNaN(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true }
        })

        if (!product) {
            console.log('Product not found for ID:', id)
            return NextResponse.json({ message: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json({ message: 'Error fetching product' }, { status: 500 })
    }
}
