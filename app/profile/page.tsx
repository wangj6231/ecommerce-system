'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchProfile()
        }
    }, [status, router])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                setFormData(prev => ({
                    ...prev,
                    username: data.username || '',
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || ''
                }))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage('密碼不一致')
            return
        }

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    password: formData.password || undefined
                })
            })
            if (res.ok) {
                setMessage('資料更新成功')
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
                router.refresh()
            } else {
                setMessage('更新失敗')
            }
        } catch (error) {
            setMessage('發生錯誤')
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('確定要刪除帳號嗎？此動作無法復原。')) return
        try {
            const res = await fetch('/api/user/profile', { method: 'DELETE' })
            if (res.ok) {
                await signOut({ callbackUrl: '/' })
            } else {
                alert('刪除失敗')
            }
        } catch (error) {
            alert('發生錯誤')
        }
    }

    if (loading) return <div className="p-8">載入中...</div>

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-6">會員資料修改</h1>

            {message && (
                <div className={`p-4 mb-4 rounded-md ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">會員帳號 (不可修改)</label>
                    <input
                        type="text"
                        disabled
                        value={formData.username}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">會員姓名</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">會員連絡電話</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">會員地址</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div className="border-t pt-4">
                    <h3 className="tex-lg font-medium mb-2">修改密碼 (留空則不修改)</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">新密碼</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">確認新密碼</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                        儲存變更
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        刪除帳號
                    </button>
                </div>
            </form>
        </div>
    )
}
