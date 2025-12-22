'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

interface User {
    id: number
    username: string
    email?: string
    name?: string
    role: string
    phone?: string
    address?: string
    createdAt: string
}

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

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

    const fetchUsers = async (query = '') => {
        try {
            const url = query ? `/api/admin/users?query=${encodeURIComponent(query)}` : '/api/admin/users'
            const res = await fetch(url)
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchUsers(searchQuery)
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
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws)

                // Map fields
                // Assuming Excel headers are Chinese or match somewhat
                const mappedData = data.map((row: any) => ({
                    username: row['會員帳號'] || row['username'],
                    name: row['會員姓名'] || row['name'],
                    password: row['帳號密碼'] || row['password'],
                    phone: row['會員連絡電話'] || row['phone'],
                    address: row['會員地址'] || row['address']
                }))

                const res = await fetch('/api/admin/users/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mappedData),
                })
                const resData = await res.json()
                alert(resData.message)
                fetchUsers()
            } catch (error) {
                console.error(error)
                alert('匯入失敗')
            }
        }
        reader.readAsBinaryString(file)
    }

    if (status === 'loading' || loading) return <div className="p-8">載入中...</div>

    if (!session || session.user.role !== 'ADMIN') return null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold leading-6 text-gray-900">後台管理系統</h3>
                    <div className="mt-2">
                        <nav className="-mb-px flex space-x-8">
                            <Link
                                href="/admin"
                                className="border-indigo-500 text-indigo-600 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium"
                                aria-current="page"
                            >
                                會員列表
                            </Link>
                            <Link
                                href="/admin/products"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium"
                            >
                                商品管理
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="mt-8 sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-6 text-gray-900">會員列表</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        管理系統會員資料。
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between items-center">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜尋關鍵字 (帳號/姓名)"
                            className="rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                            搜尋
                        </button>
                    </form>

                    <div className="flex gap-2">
                        <label className="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 cursor-pointer">
                            匯入 Excel
                            <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">會員帳號</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">姓名</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">電話</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">地址</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">角色</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">操作</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.username}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.phone}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.address}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <Link href={`/admin/users/${user.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">編輯</Link>
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
