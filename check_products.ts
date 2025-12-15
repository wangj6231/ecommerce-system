import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany({
        select: { id: true, name: true }
    })
    console.log('Products:', JSON.stringify(products, null, 2))
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
