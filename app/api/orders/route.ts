import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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

    if (!user || !user.cart || user.cart.items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const { recipientName, recipientPhone, recipientAddress, paymentMethod, shippingMethod } = await request.json()

    const total = user.cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    // Create Order
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            total,
            status: 'COMPLETED', // Simplified for demo
            paymentMethod,
            shippingMethod,
            recipientName,
            recipientPhone,
            recipientAddress,
            items: {
                create: user.cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price
                }))
            }
        }
    })

    // Create Notification for Admin
    await prisma.notification.create({
        data: {
            message: `新訂單 #${order.id} 已建立，請盡快出貨。收件人: ${recipientName}`
        }
    })

    // Clear Cart
    await prisma.cartItem.deleteMany({
        where: { cartId: user.cart.id }
    })

    return NextResponse.json({ success: true, orderId: order.id })
}
