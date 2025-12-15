'use client'

import { useEffect, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import { useParams } from 'next/navigation'

interface Product {
    id: number
    name: string
    description: string
    price: number
    image: string
    category: string
    stock: number
    images: { id: number; url: string }[]
}

export default function ProductDetailPage() {
    const params = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchProduct(params.id as string)
        }
    }, [params.id])

    const fetchProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/products/${id}`)
            if (res.ok) {
                const data = await res.json()
                setProduct(data)
                if (data.image) setSelectedImage(data.image)
                if (data.images && data.images.length > 0) setSelectedImage(data.images[0].url)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8">載入中...</div>
    if (!product) return <div className="p-8">找不到商品</div>

    return (
        <div className="bg-white">
            <div className="pt-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                        {/* Image gallery */}
                        <div className="flex flex-col-reverse">
                            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                                <div className="grid grid-cols-4 gap-6" aria-orientation="horizontal" role="tablist">
                                    {product.images && product.images.length > 0 ? (
                                        product.images.map((img) => (
                                            <button
                                                key={img.id}
                                                className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                                                onClick={() => setSelectedImage(img.url)}
                                            >
                                                <span className="absolute inset-0 overflow-hidden rounded-md">
                                                    <img src={img.url} alt="" className="h-full w-full object-cover object-center" />
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        product.image && (
                                            <button
                                                className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                                                onClick={() => setSelectedImage(product.image)}
                                            >
                                                <span className="absolute inset-0 overflow-hidden rounded-md">
                                                    <img src={product.image} alt="" className="h-full w-full object-cover object-center" />
                                                </span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="aspect-h-1 aspect-w-1 w-full">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center sm:rounded-lg"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gray-200 text-gray-500">
                                        無圖片
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product info */}
                        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

                            <div className="mt-3">
                                <h2 className="sr-only">Product information</h2>
                                <p className="text-3xl tracking-tight text-gray-900">${product.price}</p>
                            </div>

                            <div className="mt-6">
                                <h3 className="sr-only">Description</h3>
                                <div className="space-y-6 text-base text-gray-700">
                                    <p>{product.description}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center">
                                    <h3 className="text-sm font-medium text-gray-900">分類:</h3>
                                    <p className="ml-2 text-sm text-gray-500">{product.category || '未分類'}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center">
                                    <h3 className="text-sm font-medium text-gray-900">庫存:</h3>
                                    <p className="ml-2 text-sm text-gray-500">{product.stock}</p>
                                </div>
                            </div>

                            <div className="mt-10 flex">
                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
