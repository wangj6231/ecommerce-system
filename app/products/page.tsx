'use client'

import { useEffect, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'
import Link from 'next/link'

interface Product {
    id: number
    name: string
    description: string
    price: number
    image: string
    category: string
    stock: number
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('All')

    useEffect(() => {
        fetchProducts()
    }, [])

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredProducts(products)
        } else {
            setFilteredProducts(products.filter(p => p.category === selectedCategory))
        }
    }, [selectedCategory, products])

    const fetchProducts = async () => {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)

        const cats = Array.from(new Set(data.map((p: Product) => p.category).filter(Boolean))) as string[]
        setCategories(['All', ...cats])
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">精選商品</h2>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                        >
                            {category === 'All' ? '全部' : category}
                        </button>
                    ))}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group relative flex flex-col">
                            <Link href={`/products/${product.id}`}>
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 transition-opacity duration-300">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-500">
                                            無圖片
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700">
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">${product.price}</p>
                                </div>
                            </Link>
                            <div className="mt-2 z-10">
                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
