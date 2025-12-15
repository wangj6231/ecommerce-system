import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const products = [
        {
            name: '經典手錶',
            description: '優雅設計，適合各種場合',
            price: 5999,
            stock: 10,
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80'
        },
        {
            name: '真皮皮夾',
            description: '頂級牛皮製作，耐用且時尚',
            price: 1299,
            stock: 20,
            image: 'https://images.unsplash.com/photo-1627123424574-183730f06067?auto=format&fit=crop&w=800&q=80'
        },
        {
            name: '設計師太陽眼鏡',
            description: '抗 UV400，保護您的眼睛',
            price: 3500,
            stock: 15,
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
        }
    ]

    for (const p of products) {
        await prisma.product.create({
            data: p
        })
    }

    console.log('Products seeded!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
