import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    console.log("Authorize: Missing credentials")
                    return null
                }

                console.log(`Authorize: Attempting login for user: ${credentials.username}`)

                try {
                    const user = await prisma.user.findUnique({
                        where: { username: credentials.username }
                    })

                    console.log(`Authorize: User lookup result for ${credentials.username}:`, user ? "Found" : "Not Found")

                    if (!user) {
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                    console.log(`Authorize: Password validation for ${credentials.username}:`, isPasswordValid ? "Valid" : "Invalid")

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        username: user.username,
                    }
                } catch (error) {
                    console.error("Authorize: Error during login:", error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role
                token.id = user.id
                token.username = user.username
            }
            return token
        },
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.role = token.role
                session.user.id = token.id
                session.user.username = token.username
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey",
}
