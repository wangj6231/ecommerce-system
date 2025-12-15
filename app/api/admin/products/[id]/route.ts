import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)
        await prisma.product.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Product deleted' })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ message: 'Error deleting product' }, { status: 500 })
    }
}
