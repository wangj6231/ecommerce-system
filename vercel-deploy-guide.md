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
In Vercel Project Settings -> Environment Variables, add the following:

### Database & Auth
- `DATABASE_URL`: Your PostgreSQL connection string.
- `NEXTAUTH_SECRET`: A random string for authentication security (generate with `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-project.vercel.app`).

### Image Storage (Cloudinary)
This project uses Cloudinary for storing product images. You must set these variables:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
- `CLOUDINARY_API_KEY`: Your Cloudinary API Key.
- `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret.

*(If you don't have these, sign up for a free account at cloudinary.com)*

## 3. Deployment Steps
1. Push your code to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Vercel will detect Next.js.
4. **Build Config**:
   - Framework Preset: Next.js
   - Build Command: `next build` (default) or `npx prisma generate && next build` if you face issues.
   - Install Command: `npm install` (default)
5. **Database Migration**:
   - Vercel deployments usually reset the environment. To sync the database schema, it is recommended to add a build step or run manually.
   - **Recommended**: Connect to your production DB locally (update .env locally to point to prod DB temporarily) and run:
     ```bash
     npx prisma db push
     ```
   - Alternatively, override the Build Command in Vercel settings to:
     ```bash
     npx prisma db push && next build
     ```
     *(Note: `db push` might result in data loss if there are breaking schema changes, but for this project it's the simplest way to ensure schema sync).*

## 4. Post-Deployment Setup
### Initialize Admin & Member Data
After deployment, you need to seed the database with the default admin and member data.
1. Ensure your local `.env` is pointing to the **Production Database** (the one used by Vercel).
2. Run the seed script locally:
   ```bash
   npx tsx seed_members.ts
   ```
3. This will create:
   - **Admin Account**: `admin` / `admin`
   - **10 Default Members**: (e.g., `linyu_0823`)

## 5. Troubleshooting
- **Images not uploading?** Check your Cloudinary environment variables.
- **Login failing?** Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`. Also ensure the database is seeded.
- **Build failing?** Check logs. If related to types, ensure `npx prisma generate` runs before build.
