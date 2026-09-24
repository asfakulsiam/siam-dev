# Dev Den — Production Deployment & Operations Guide (A to Z)

This guide walks you through the entire lifecycle: local setup, third-party provider provisioning, database initialization, CI/CD configuration, deployment to Vercel/Cloud Run/Docker, and production maintenance.

---

## Table of Contents

1. [Prerequisites & Stack Overview](#1-prerequisites--stack-overview)
2. [Step 1: Local Development Setup](#step-1-local-development-setup)
3. [Step 2: External Services Provisioning](#step-2-external-services-provisioning)
   - [MongoDB Atlas (Database)](#a-mongodb-atlas-database)
   - [Cloudinary (Asset CDN & Optimization)](#b-cloudinary-asset-cdn--optimization)
   - [Resend (Transactional Contact Email)](#c-resend-transactional-contact-email)
4. [Step 3: Security & Credentials Generation](#step-3-security--credentials-generation)
   - [Admin Password Bcrypt Hash](#a-admin-password-bcrypt-hash)
   - [High-Entropy Secrets & Salts](#b-high-entropy-secrets--salts)
5. [Step 4: Environment Variables Matrix](#step-4-environment-variables-matrix)
6. [Step 5: Database Seeding & Verification](#step-5-database-seeding--verification)
7. [Step 6: Production Build & Quality Gates](#step-6-production-build--quality-gates)
8. [Step 7: Production Deployment Options](#step-7-production-deployment-options)
   - [Option A: Deploy to Vercel (Recommended)](#option-a-deploy-to-vercel-recommended)
   - [Option B: Deploy via Docker / Google Cloud Run](#option-b-deploy-via-docker--google-cloud-run)
9. [Step 8: Post-Deployment Verification Checklist](#step-8-post-deployment-verification-checklist)
10. [Step 9: Day-2 Operations & Maintenance](#step-9-day-2-operations--maintenance)

---

## 1. Prerequisites & Stack Overview

- **Node.js**: `v20.x` or `v22.x` (LTS)
- **Package Manager**: `npm` or `pnpm`
- **Framework**: Next.js 15+ (App Router)
- **Database**: MongoDB Atlas
- **Storage/CDN**: Cloudinary
- **Email**: Resend
- **Auth**: Built-in HMAC-SHA256 Token Session + Bcrypt validation

---

## Step 1: Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url> dev-den
   cd dev-den
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create local environment file**:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Step 2: External Services Provisioning

### A. MongoDB Atlas (Database)
1. Sign up / log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared M0 cluster (select a region close to your users, e.g., Singapore `sin1` or US East `iad1`).
3. Under **Database Access**, create a user with read/write permissions to the `devden` database.
4. Under **Network Access**, add `0.0.0.0/0` (or your static deployment IPs) to allow serverless connection.
5. In your cluster dashboard, click **Connect** $\to$ **Drivers** $\to$ copy the URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/devden?retryWrites=true&w=majority
   ```

### B. Cloudinary (Asset CDN & Optimization)
1. Sign up at [Cloudinary](https://cloudinary.com/).
2. On your Dashboard, find:
   - **Cloud Name** (e.g. `dxy7abcde`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `aBcDeFgHiJkLmNoPqRsTuVwXyZ`)
3. Under **Settings** $\to$ **Upload**:
   - Ensure unsigned uploads are disabled or restricted; Dev Den uses signed uploads via `/api/admin/cloudinary-sign`.

### C. Resend (Transactional Contact Email)
1. Sign up at [Resend](https://resend.com/).
2. Add and verify your custom domain (e.g. `yourdomain.com`) with DNS TXT/MX records.
3. Under **API Keys**, create an API key with sending permissions (starts with `re_`).

---

## Step 3: Security & Credentials Generation

### A. Admin Password Bcrypt Hash
To generate a secure bcrypt hash for your admin password:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_SUPER_STRONG_PASSWORD', 12));"
```
Copy the resulting string (e.g., `$2a$12$e80yvEa3Rk97...`) and set it as `ADMIN_PASSWORD_HASH`.

### B. High-Entropy Secrets & Salts
Generate 32-byte cryptographic random hex strings:
```bash
# Generate AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate IP_HASH_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Environment Variables Matrix

Configure the following variables in your hosting provider's dashboard or production `.env`:

| Variable | Description | Required in Prod? | Example / Format |
|---|---|:---:|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL | **Yes** | `https://yourdomain.com` |
| `MONGODB_URI` | MongoDB Atlas Connection String | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/devden` |
| `MONGODB_DB` | Database name | **Yes** | `devden` |
| `AUTH_SECRET` | HMAC session signing key (64 hex chars) | **Yes** | Generated via `crypto.randomBytes(32)` |
| `ADMIN_EMAIL` | Admin login email | **Yes** | `you@yourdomain.com` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | **Yes** | `$2a$12$...` |
| `IP_HASH_SALT` | Salt for rate-limiting IP hashes | **Yes** | Generated via `crypto.randomBytes(32)` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | **Yes** | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | **Yes** | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret (Server only) | **Yes** | `abcdef...` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier (Client) | **Yes** | `your_cloud_name` |
| `RESEND_API_KEY` | Resend API key | Optional | `re_123456789` |
| `RESEND_FROM` | Sender email address | Optional | `contact@yourdomain.com` |
| `CONTACT_TO_EMAIL` | Inbound notification recipient | Optional | `you@yourdomain.com` |

---

## Step 5: Database Seeding & Verification

Once `MONGODB_URI` is configured in your `.env.local`:

1. **Seed the database with baseline schema and content**:
   ```bash
   npm run seed
   ```
   This script creates MongoDB indexes (unique `slug`, query indexes) and idempotently upserts the initial projects, profile, experience milestones, and craft principles.

2. **Verify content export capability**:
   ```bash
   npm run export-content
   ```
   This generates a timestamped snapshot in `scripts/content-export.json`.

---

## Step 6: Production Build & Quality Gates

Run all quality checks locally before deploying:

```bash
# 1. ESLint verification
npm run lint

# 2. Strict TypeScript type check
npm run typecheck

# 3. Unit and integration tests (69 tests)
npm run test

# 4. Production compilation test
npm run build
```

---

## Step 7: Production Deployment Options

### Option A: Deploy to Vercel (Recommended)

1. Push your repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/) and click **New Project** $\to$ **Import Repository**.
3. Framework Preset: **Next.js** (automatically detected).
4. In the **Environment Variables** section, add all production variables listed in Step 4.
5. Click **Deploy**.
6. Under **Settings** $\to$ **Domains**, add your custom domain (e.g. `yourname.com`).
7. Update `NEXT_PUBLIC_SITE_URL` to match your production domain.

---

### Option B: Deploy via Docker / Google Cloud Run

1. **Build the Docker container**:
   ```dockerfile
   # Dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   ENV PORT=3000
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Deploy to Google Cloud Run**:
   ```bash
   gcloud run deploy dev-den \
     --source . \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --set-env-vars NEXT_PUBLIC_SITE_URL="https://yourdomain.com",MONGODB_DB="devden"
   ```

---

## Step 8: Post-Deployment Verification Checklist

- [ ] **Home Page (`/`)**: Hero animation, pinned project stack, scrubbed statement, and 4 themes render smoothly.
- [ ] **Work Page (`/work`)**: Category filter buttons work, case study links route properly.
- [ ] **Case Study (`/work/[slug]`)**: Dynamic metadata, OpenGraph images, and metrics cards load without layout shifts.
- [ ] **About Page (`/about`)**: Timeline scrub, toolbox cards, and resume link work.
- [ ] **Contact Form (`/contact`)**: Form validates inputs, announces live state, submits successfully to MongoDB.
- [ ] **SEO & Metadata**:
  - Visit `/sitemap.xml` $\to$ verify all published URLs are present.
  - Visit `/robots.txt` $\to$ verify `/admin/` and `/api/` are disallowed.
  - Visit `/llms.txt` $\to$ verify structured LLM context is returned.
- [ ] **Admin CMS (`/admin/login`)**:
  - Navigate to `/admin` $\to$ redirected to `/admin/login`.
  - Enter wrong password $\to$ receives generic error message.
  - Enter correct password $\to$ successfully enters dashboard.
  - Create/edit a case study $\to$ verify it immediately appears on `/work`.
  - Sign out $\to$ session cookie cleared and redirected to `/admin/login`.

---

## Step 9: Day-2 Operations & Maintenance

### 1. Database Backups
- In MongoDB Atlas, enable **Continuous Cloud Backups** (point-in-time recovery).
- Run `npm run export-content` weekly to keep off-site version-controlled content snapshots.

### 2. Password & Secret Rotation
- To rotate passwords: generate a new bcrypt hash (Step 3A) and update `ADMIN_PASSWORD_HASH`.
- To revoke all active sessions immediately: rotate `AUTH_SECRET` in environment variables and redeploy.

### 3. Rate Limit Management
- IP rate limits are stored in memory / MongoDB TTL documents. If a client is temporarily rate-limited, the window expires automatically after 15–60 minutes.
