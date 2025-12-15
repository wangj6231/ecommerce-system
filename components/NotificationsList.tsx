'use client'

import { useEffect, useState } from 'react'

interface Notification {
    id: number
    message: string
    isRead: boolean
    createdAt: string
}

export default function NotificationsList() {
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/admin/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (notifications.length === 0) {
        return <li className="px-4 py-4 sm:px-6 text-gray-500 text-sm">暫無通知</li>
    }

    return (
        <>
            {notifications.map((notification) => (
                <li key={notification.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                            {notification.message}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {new Date(notification.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </li>
            ))}
        </>
    )
}
