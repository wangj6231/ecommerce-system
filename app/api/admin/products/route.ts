import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const name = formData.get('name') as string
        const description = formData.get('description') as string
        const price = parseFloat(formData.get('price') as string)
        const stock = parseInt(formData.get('stock') as string)
        const category = formData.get('category') as string
        const files = formData.getAll('images') as File[]

        let imageUrl = ''
        const imageUrls: string[] = []

        // Configure Cloudinary
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (files.length > 0) {
            if (!cloudName || !apiKey || !apiSecret) {
                console.error("Cloudinary keys are missing.")
                return NextResponse.json({ message: '系統錯誤：未設定圖片上傳服務 (Cloudinary KEYS MISSING)' }, { status: 500 })
            }

            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret
            });

            for (const file of files) {
                if (file instanceof File) {
                    try {
                        const bytes = await file.arrayBuffer()
                        const buffer = Buffer.from(bytes)

                        // Upload to Cloudinary
                        const result = await new Promise<any>((resolve, reject) => {
                            const uploadStream = cloudinary.uploader.upload_stream(
                                { folder: 'ecommerce-products' },
                                (error, result) => {
                                    if (error) reject(error)
                                    else resolve(result)
                                }
                            )
                            uploadStream.end(buffer)
                        })

                        if (result?.secure_url) {
                            imageUrls.push(result.secure_url)
                        }
                    } catch (uploadError) {
                        console.error("Image upload failed:", uploadError)
                        return NextResponse.json({ message: '圖片上傳失敗' }, { status: 500 })
                    }
                }
            }
        }

        // Use the first image as the main image for backward compatibility
        if (imageUrls.length > 0) {
            imageUrl = imageUrls[0]
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                category,
                image: imageUrl,
                images: {
                    create: imageUrls.map(url => ({ url }))
                }
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json({ message: 'Error creating product' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { images: true }
    })

    return NextResponse.json(products)
}
