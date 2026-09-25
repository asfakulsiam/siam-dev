# Dev Den — Production Deployment & Environment Guide

This guide provides step-by-step instructions for configuring environment variables and deploying the Dev Den portfolio to production platforms (Vercel, Railway, Render, Docker/VPS, Google Cloud Run).

---

## 1. Environment Variables Overview

All environment variables are validated at runtime via `src/lib/env.ts` using a strict Zod schema. If any mandatory variable is missing or malformed, the app provides explicit error logs.

### Required Environment Variables

| Variable | Description | Example / Generation Command |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster0.abc.mongodb.net/devden?retryWrites=true&w=majority` |
| `MONGODB_DB` | Database name | `devden` |
| `AUTH_SECRET` | 32+ char cryptographic session secret | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `AUTH_URL` | Canonical site base URL | `https://yourdomain.com` |
| `ADMIN_EMAIL` | Admin login account email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD_HASH` | Bcrypt password hash | `node -e "console.log(require('bcryptjs').hashSync('YourPassword', 10))"` |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL for SEO/OG | `https://yourdomain.com` |
| `IP_HASH_SALT` | Random salt for rate-limiting IP hashes | `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` |

### Optional Integrations

| Variable | Service | Description |
| :--- | :--- | :--- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | Cloud name for signed image uploads and duotone filters |
| `CLOUDINARY_API_KEY` | Cloudinary | API key for admin signature generation |
| `CLOUDINARY_API_SECRET` | Cloudinary | Server-only secret for secure uploads |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary | Client-side Cloudinary loader cloud name |
| `RESEND_API_KEY` | Resend | API key for contact form email dispatch |
| `RESEND_FROM` | Resend | Verified domain sender (`inquiries@yourdomain.com`) |
| `CONTACT_TO_EMAIL` | Resend | Destination inbox for inquiries |

---

## 2. Generating Secure Credentials

Before deploying, generate your production keys:

```bash
# 1. Generate AUTH_SECRET (32 bytes random hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Generate IP_HASH_SALT (16 bytes random hex)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# 3. Generate ADMIN_PASSWORD_HASH for your chosen password
node -e "console.log(require('bcryptjs').hashSync('YourSuperSecretPasswordHere', 10))"
```

---

## 3. Database Setup (MongoDB Atlas)

1. Create a free M0 cluster or Serverless instance on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write permissions to the `devden` database.
3. Configure Network Access: Add `0.0.0.0/0` (or your hosting provider's static IP range).
4. Copy the connection string into `MONGODB_URI`.
5. Run the idempotent seed script to populate baseline data and create database indexes:
   ```bash
   pnpm run seed
   # or
   npm run seed
   ```

---

## 4. Deployment Options

### Option A: Vercel (Recommended for Next.js App Router)

1. Push your repository to GitHub / GitLab.
2. In Vercel, click **Add New Project** and import the repository.
3. In **Settings > Environment Variables**, paste all keys from `.env.example`.
4. Deploy. Vercel automatically detects Next.js, optimizes edge caching, and provisions serverless functions for Server Actions and Dynamic OpenGraph image generation (`/api/og`).

### Option B: Railway / Render

1. Connect your Git repository.
2. Set Build Command: `npm run build`
3. Set Start Command: `npm run start`
4. Add all environment variables in the dashboard.
5. Deploy.

### Option C: Docker / Standalone Container

1. Build the Docker container:
   ```bash
   docker build -t devden-portfolio:latest .
   ```
2. Run with environment variables:
   ```bash
   docker run -d -p 3000:3000 \
     --env-file .env.production \
     --name devden \
     devden-portfolio:latest
   ```

---

## 5. Post-Deployment Verification Checklist

Once deployed, verify the system health:

- [ ] **Health Endpoint**: Visit `https://yourdomain.com/api/health` and ensure it returns `{"status":"healthy","database":"connected"}`.
- [ ] **Theme Persistence**: Test switching between Day Shift, Night Coder (Charcoal), Blueprint, and Mono in the header menu.
- [ ] **Admin Authentication**: Navigate to `/admin/login`, log in with your configured email & password, and verify access to the dashboard.
- [ ] **Contact Form**: Submit a test inquiry on `/contact` and verify that the success state displays with zero errors.
- [ ] **Dynamic SEO & OG Images**: Check `https://yourdomain.com/sitemap.xml` and test an OpenGraph card at `https://yourdomain.com/api/og?title=Test+Title`.
- [ ] **Lighthouse Performance**: Run Lighthouse mobile audit to verify Core Web Vitals (LCP $\le 2.0\text{s}$, CLS $\le 0.05$).
