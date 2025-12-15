'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CartItem {
    id: number
    quantity: number
    product: {
        id: number
        name: string
        price: number
        image: string | null
    }
}

interface Cart {
    id: number
    items: CartItem[]
}

export default function CartPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [cart, setCart] = useState<Cart | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchCart()
        }
    }, [status, router])

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart')
            if (res.ok) {
                const data = await res.json()
                setCart(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const calculateTotal = () => {
        if (!cart) return 0
        return cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
    }

    if (loading) return <div className="p-8">載入中...</div>
    if (!session) return null

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">購物車</h1>
                <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                        <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                            {cart?.items.map((item) => (
                                <li key={item.id} className="flex py-6 sm:py-10">
                                    <div className="flex-shrink-0">
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                                            />
                                        ) : (
                                            <div className="h-24 w-24 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-sm">
                                                        <a href="#" className="font-medium text-gray-700 hover:text-gray-800">
                                                            {item.product.name}
                                                        </a>
                                                    </h3>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-gray-900">${item.product.price}</p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <label className="sr-only">Quantity, {item.product.name}</label>
                                                <span className="text-gray-500">數量: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {(!cart || cart.items.length === 0) && (
                                <li className="py-6 text-center text-gray-500">
                                    購物車是空的
                                </li>
                            )}
                        </ul>
                    </section>

                    {/* Order summary */}
                    <section
                        aria-labelledby="summary-heading"
                        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
                    >
                        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                            訂單摘要
                        </h2>

                        <dl className="mt-6 space-y-4">
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-medium text-gray-900">總計</dt>
                                <dd className="text-base font-medium text-gray-900">${calculateTotal()}</dd>
                            </div>
                        </dl>

                        <div className="mt-6">
                            <Link
                                href="/checkout"
                                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 block text-center"
                            >
                                前往結帳
                            </Link>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    )
}
