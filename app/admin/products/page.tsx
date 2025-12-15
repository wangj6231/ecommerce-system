'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
    id: number
    name: string
    price: number
    stock: number
    createdAt: string
}

export default function ProductsAdmin() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            if (session?.user.role !== 'ADMIN') {
                router.push('/')
            } else {
                fetchProducts()
            }
        }
    }, [status, session, router])

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('確定要刪除嗎？')) return
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
        if (res.ok) {
            setProducts(products.filter(p => p.id !== id))
        } else {
            alert('刪除失敗')
        }
    }

    if (status === 'loading' || loading) return <div className="p-8">載入中...</div>

    if (!session || session.user.role !== 'ADMIN') return null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">商品管理</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        管理所有商品列表。
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/admin/products/new"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        新增商品
                    </Link>
                </div>
            </div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">名稱</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">價格</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">庫存</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">建立時間</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">操作</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{product.name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${product.price}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.stock}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(product.createdAt).toLocaleDateString()}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">刪除</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
