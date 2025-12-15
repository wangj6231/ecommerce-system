import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            cart: {
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let cart = user.cart

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId: user.id
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })
    }

    return NextResponse.json(cart)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { cart: true }
    })

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let cart = user.cart

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId: user.id
            }
        })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId: parseInt(productId)
        }
    })

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + (quantity || 1) }
        })
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: parseInt(productId),
                quantity: quantity || 1
            }
        })
    }

    return NextResponse.json({ success: true })
}
