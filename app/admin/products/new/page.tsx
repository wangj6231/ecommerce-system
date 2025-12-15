'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function NewProduct() {
    const router = useRouter()
    const { data: session } = useSession()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [stock, setStock] = useState('')
    const [category, setCategory] = useState('')
    const [images, setImages] = useState<FileList | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            formData.append('price', price)
            formData.append('stock', stock)
            formData.append('category', category)
            if (images) {
                for (let i = 0; i < images.length; i++) {
                    formData.append('images', images[i])
                }
            }

            const res = await fetch('/api/admin/products', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                router.push('/admin/products')
            } else {
                alert('新增失敗')
            }
        } catch (error) {
            console.error(error)
            alert('發生錯誤')
        } finally {
            setLoading(false)
        }
    }

    if (!session || session.user.role !== 'ADMIN') return null

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-6">新增商品</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">名稱</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">價格</label>
                        <input
                            type="number"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">庫存</label>
                        <input
                            type="number"
                            required
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">分類</label>
                    <input
                        type="text"
                        placeholder="例如：電子產品、服飾"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">圖片 (可多選)</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setImages(e.target.files)}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? '新增中...' : '新增'}
                </button>
            </form>
        </div>
    )
}
