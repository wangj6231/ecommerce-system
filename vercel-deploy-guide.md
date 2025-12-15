# Vercel Deployment Guide

## 1. Database Setup (PostgreSQL)
Since we switched from SQLite to PostgreSQL, you need a PostgreSQL database.
- You can use **Vercel Postgres** (recommended for Vercel) or any other provider (Supabase, Neon, AWS RDS).
- **Vercel Postgres**:
  1. Go to your Vercel Project Dashboard.
  2. Click "Storage" -> "Connect Store" -> "Create New" -> "Postgres".
  3. Follow the steps to create it.
  4. Vercel will automatically add the `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` environment variables.
  5. **Important**: You need to update your `prisma/schema.prisma` to use the correct env var if you use Vercel Postgres directly, or just map `DATABASE_URL` to one of them in Vercel Settings.
     - Usually, map `DATABASE_URL` to `POSTGRES_PRISMA_URL` in Vercel Environment Variables.

## 2. Environment Variables
In Vercel Project Settings -> Environment Variables, add:
- `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgres://user:password@host:port/db`).
- `NEXTAUTH_SECRET`: A random string for authentication security (you can generate one with `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-project.vercel.app`).

## 3. Deployment
1. Push your code to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Vercel will detect Next.js.
4. The `postinstall` script (`prisma generate`) will run automatically.
5. **Database Migration**:
   - You might need to run migrations manually or add a build command.
   - Recommended: Connect to your DB locally or via Vercel CLI and run `npx prisma db push` to sync the schema.
   - Or, override the Build Command in Vercel to: `npx prisma db push && next build`.

## 4. Important Note on File Uploads
**Warning**: This project currently uses local file system storage (`public/uploads`) for product images.
- **Vercel is serverless**, meaning the filesystem is **ephemeral** (temporary).
- Images uploaded to `public/uploads` **WILL BE LOST** after a new deployment or when the server restarts.
- **Solution**: For a production Vercel app, you must switch to an external file storage service like:
  - **Vercel Blob**
  - **AWS S3**
  - **Cloudinary**
- You will need to modify `app/api/admin/products/route.ts` to upload to one of these services instead of writing to disk.
