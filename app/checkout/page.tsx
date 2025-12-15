'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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
    total: number
}

export default function CheckoutPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [cart, setCart] = useState<Cart | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form states
    const [recipientName, setRecipientName] = useState('')
    const [recipientPhone, setRecipientPhone] = useState('')
    const [recipientAddress, setRecipientAddress] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')
    const [shippingMethod, setShippingMethod] = useState('HOME_DELIVERY')
    const [storeId, setStoreId] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchCart()
            fetchProfile()
        }
    }, [status, router])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                setRecipientName(data.name || '')
                setRecipientPhone(data.phone || '')
                setRecipientAddress(data.address || '')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart')
            if (res.ok) {
                const data = await res.json()
                const calculatedTotal = data.items.reduce((total: number, item: CartItem) => total + item.product.price * item.quantity, 0);
                setCart({ ...data, total: calculatedTotal });
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method)
        if (method === 'COD') {
            setShippingMethod('SEVEN_ELEVEN')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!recipientName || !recipientPhone || !recipientAddress) {
            alert('請填寫完整收件資訊')
            return
        }

        setProcessing(true)

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethod,
                    shippingMethod,
                    recipientName,
                    recipientPhone,
                    recipientAddress,
                    storeId: shippingMethod === 'SEVEN_ELEVEN' ? storeId : undefined,
                }),
            })

            if (res.ok) {
                setSuccess(true)
                router.refresh()
            } else {
                alert('結帳失敗')
            }
        } catch (error) {
            console.error(error)
            alert('發生錯誤')
        } finally {
            setProcessing(false)
        }
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">結帳成功！</h1>
                <p className="text-gray-600 mb-8">感謝您的購買，我們會盡快為您出貨。</p>
                <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
                    回到首頁
                </Link>
            </div>
        )
    }

    if (loading) return <div className="p-8">載入中...</div>
    if (!cart || cart.items.length === 0) return <div className="p-8">購物車是空的</div>

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-6">結帳</h1>

            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="border-b pb-4">
                    <h2 className="text-lg font-medium mb-4">訂單摘要</h2>
                    {cart?.items.map((item) => (
                        <div key={item.id} className="flex justify-between py-2">
                            <span>{item.product.name} x {item.quantity}</span>
                            <span>${item.product.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold mt-2 border-t pt-2">
                        <span>總計</span>
                        <span>${cart?.total}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h2 className="text-lg font-medium mb-4">收件資訊</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">收件人姓名</label>
                                <input
                                    type="text"
                                    required
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">電話</label>
                                <input
                                    type="tel"
                                    required
                                    value={recipientPhone}
                                    onChange={(e) => setRecipientPhone(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">地址</label>
                                <input
                                    type="text"
                                    required
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">付款方式</label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="credit-card"
                                    name="payment-method"
                                    type="radio"
                                    checked={paymentMethod === 'CREDIT_CARD'}
                                    onChange={() => handlePaymentMethodChange('CREDIT_CARD')}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                                    信用卡
                                </label>
                            </div>

                            {paymentMethod === 'CREDIT_CARD' && (
                                <div className="ml-7 mt-2 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-500">卡號</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">到期日</label>
                                        <input type="text" placeholder="MM/YY" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">CVC</label>
                                        <input type="text" placeholder="123" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    id="cod"
                                    name="payment-method"
                                    type="radio"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => handlePaymentMethodChange('COD')}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                                    貨到付款 (僅限 7-11)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">運送方式</label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                                <input
                                    id="home-delivery"
                                    name="shipping-method"
                                    type="radio"
                                    disabled={paymentMethod === 'COD'}
                                    checked={shippingMethod === 'HOME_DELIVERY'}
                                    onChange={() => setShippingMethod('HOME_DELIVERY')}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                />
                                <label htmlFor="home-delivery" className={`ml-3 block text-sm font-medium ${paymentMethod === 'COD' ? 'text-gray-400' : 'text-gray-700'}`}>
                                    宅配
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="seven-eleven"
                                    name="shipping-method"
                                    type="radio"
                                    checked={shippingMethod === 'SEVEN_ELEVEN'}
                                    onChange={() => setShippingMethod('SEVEN_ELEVEN')}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="seven-eleven" className="ml-3 block text-sm font-medium text-gray-700">
                                    7-11 超商取貨
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {shippingMethod === 'SEVEN_ELEVEN' ? '門市名稱/代號' : '收件地址'}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                            {shippingMethod === 'SEVEN_ELEVEN' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const store = prompt('模擬 7-11 電子地圖：請輸入門市名稱 (例如：台北門市)', '台北門市')
                                        if (store) {
                                            setRecipientAddress(store)
                                            setStoreId(store)
                                        }
                                    }}
                                    className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    選擇門市
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing || !recipientName || !recipientPhone || !recipientAddress}
                        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-all duration-200 ${processing || !recipientName || !recipientPhone || !recipientAddress
                                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {processing ? '處理中...' : '確認付款'}
                    </button>
                </form>
            </div>
        </div>
    )
}
