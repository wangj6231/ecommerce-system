'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Link from 'next/link'

import NotificationsList from '@/components/NotificationsList'

interface User {
    id: number
    email: string
    name: string
    role: string
    createdAt: string
}

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            if (session?.user.role !== 'ADMIN') {
                router.push('/')
            } else {
                fetchUsers()
            }
        }
    }, [status, session, router])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('確定要刪除嗎？')) return
        const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
            setUsers(users.filter(u => u.id !== id))
        }
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)
                const res = await fetch('/api/admin/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(json),
                })
                const data = await res.json()
                alert(data.message)
                fetchUsers()
            } catch (error) {
                alert('無效的 JSON 檔案')
            }
        }
        reader.readAsText(file)
    }

    if (status === 'loading' || loading) return <div className="p-8">載入中...</div>

    if (!session || session.user.role !== 'ADMIN') return null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">後台管理</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        管理會員與商品。
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-2">
                    <Link
                        href="/admin/products"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        管理商品
                    </Link>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">系統通知</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                    <ul role="list" className="divide-y divide-gray-200">
                        <NotificationsList />
                    </ul>
                </div>

                <h2 className="text-xl font-bold mb-4">會員列表</h2>
                <div className="flex gap-2 mb-4">
                    <a
                        href="/api/admin/export"
                        className="block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        匯出 CSV
                    </a>
                    <label className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 cursor-pointer">
                        匯入 JSON
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                </div>

                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">姓名</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">電子郵件</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">角色</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">註冊時間</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">操作</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">刪除</button>
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
        </div>
    )
}
