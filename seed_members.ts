
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Admin user
    const adminPassword = await bcrypt.hash('admin', 10)
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            name: 'Administrator',
            role: 'ADMIN',
            email: 'admin@example.com' // Optional but good to have
        }
    })
    console.log('Admin seeded:', admin.username)

    const members = [
        { username: 'linyu_0823', name: '林冠宇', passwordRaw: '3280_uynil', phone: '0912-345-678', address: '台北市中山區南京東路三段120號' },
        { username: 'yijun_chen', name: '陳怡君', passwordRaw: 'nehc_nujiy', phone: '0923-456-789', address: '新北市板橋區文化路一段88號' },
        { username: 'boxiang_w', name: '王柏翔', passwordRaw: 'w_gnaixob', phone: '0987-654-321', address: '桃園市中壢區中正路215號' },
        { username: 'yating_zhang', name: '張雅婷', passwordRaw: 'gnahz_gnitay', phone: '0905-321-456', address: '台中市西屯區福星路99號' },
        { username: 'hanli_0412', name: '李承翰', passwordRaw: '2140_ilnah', phone: '0918-222-333', address: '台南市東區崇善路168號' },
        { username: 'siying_h', name: '黃思穎', passwordRaw: 'h_gniyis', phone: '0976-888-999', address: '高雄市左營區博愛三路45號' },
        { username: 'junhao_wu', name: '吳俊豪', passwordRaw: 'uw_oahnuj', phone: '0933-777-555', address: '新竹市東區光復路二段101號' },
        { username: 'xinyu_zhao', name: '趙心妤', passwordRaw: 'oahz_uyinx', phone: '0909-111-222', address: '苗栗縣頭份市中華路50號' },
        { username: 'zonghan_tsai', name: '蔡宗翰', passwordRaw: 'iast_nahgnoz', phone: '0928-444-666', address: '彰化縣彰化市中山路二段300號' },
        { username: 'peishan_cheng', name: '鄭佩珊', passwordRaw: 'gnehc_nahsiep', phone: '0966-555-888', address: '嘉義市西區民生南路72號' }
    ]

    for (const member of members) {
        const passwordHash = await bcrypt.hash(member.passwordRaw, 10)
        await prisma.user.upsert({
            where: { username: member.username },
            update: {
                password: passwordHash,
                name: member.name,
                phone: member.phone,
                address: member.address,
                role: 'USER'
            },
            create: {
                username: member.username,
                password: passwordHash,
                name: member.name,
                phone: member.phone,
                address: member.address,
                role: 'USER'
            }
        })
    }

    console.log('Members seeded!')
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
