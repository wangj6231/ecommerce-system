'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Product {
    id: number
    name: string
    price: number
    image?: string
}

export default function AddToCartButton({ product }: { product: Product }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [added, setAdded] = useState(false)

    const addToCart = async () => {
        if (!session) {
            router.push('/login')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity: 1 }),
            })

            if (res.ok) {
                setAdded(true)
                setTimeout(() => setAdded(false), 2000)
                router.refresh()
            } else {
                alert('加入購物車失敗')
            }
        } catch (error) {
            console.error(error)
            alert('發生錯誤')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={addToCart}
            disabled={loading}
            className={`w-full flex items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white transition-all duration-300 ${added
                    ? 'bg-green-600 hover:bg-green-700 scale-105'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
            {loading ? '處理中...' : added ? '已加入！' : '加入購物車'}
        </button>
    )
}
