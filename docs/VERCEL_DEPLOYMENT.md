# Vercel Deployment Guide — Dev Den Portfolio

This guide provides step-by-step instructions for deploying your **Dev Den** portfolio to [Vercel](https://vercel.com) with complete configuration for MongoDB Atlas, cryptographic session authentication, Google Gemini 2.5 Flash, and Cloudinary media assets.

---

## Prerequisites Checklist

Before beginning, ensure you have:
1. A **GitHub**, **GitLab**, or **Bitbucket** account with your Dev Den repository pushed to `main`.
2. A **Vercel** account ([https://vercel.com/signup](https://vercel.com/signup)).
3. A **MongoDB Atlas** database connection URI.
4. A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
5. (Optional) Cloudinary credentials for media uploads and Resend API key for contact notifications.

---

## Step 1: Generate Secrets Locally Before Deployment

Run these one-line commands in your local terminal to generate required cryptographic keys and password hashes:

### 1.1 Generate `AUTH_SECRET` (Cryptographic HMAC Key)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
*Save this 64-character hex string (e.g. `4b8c9d2f...`).*

### 1.2 Generate `IP_HASH_SALT` (Rate-Limiting Privacy Salt)
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
*Save this 32-character hex string.*

### 1.3 Generate `ADMIN_PASSWORD_HASH` (Bcrypt Hash for Your Admin Password)
Replace `YourSecretPassword123!` with your desired admin password:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourSecretPassword123!', 10))"
```
*Save the resulting hash (e.g. `$2b$10$abcdef...`).*

---

## Step 2: Obtain External Service Credentials

### 2.1 MongoDB Atlas Connection String
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Security** $\to$ **Network Access**, ensure IP `0.0.0.0/0` (Allow Access from Anywhere) is enabled so Vercel's serverless functions can connect.
3. In your cluster dashboard, click **Connect** $\to$ **Drivers** (Node.js).
4. Copy the connection string and insert your password and database name:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/devden?retryWrites=true&w=majority
   ```

### 2.2 Google Gemini API Key
1. Go to [Google AI Studio API Keys](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Select your Google Cloud project and copy the generated key (`AIzaSy...`).

---

## Step 3: Import Project into Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **"Add New..."** button in the upper right, then select **"Project"**.
3. Find your **Dev Den** repository from the list and click **"Import"**.
4. Configure the Project:
   - **Project Name**: `dev-den` (or your preferred domain handle).
   - **Framework Preset**: **Next.js** (detected automatically).
   - **Root Directory**: `./` (leave default).
   - **Build Command**: `pnpm build` (or `npm run build` if using npm).
   - **Install Command**: `pnpm install` (or `npm install`).

---

## Step 4: Configure Environment Variables in Vercel

Before clicking **Deploy**, expand the **"Environment Variables"** accordion section on the Vercel setup screen.

Add each variable below. Select all environments (**Production**, **Preview**, and **Development**):

| Key | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.../devden?...` | MongoDB Atlas cluster connection string |
| `MONGODB_DB` | `devden` | MongoDB database name |
| `AUTH_SECRET` | *Generated 64-character hex string from Step 1.1* | Cryptographic HMAC secret for admin cookies |
| `AUTH_URL` | `https://your-project.vercel.app` *(update after domain setup)* | Canonical base URL |
| `ADMIN_EMAIL` | `your-email@example.com` | Email address used to sign in to `/admin` |
| `ADMIN_PASSWORD_HASH` | *Generated bcrypt hash from Step 1.3* | Bcrypt hash verified during admin login |
| `IP_HASH_SALT` | *Generated 32-character hex string from Step 1.2* | Salt for GDPR-safe IP rate-limiting |
| `GEMINI_API_KEY` | `AIzaSy...` *(from Google AI Studio)* | Powers automated GitHub case study synthesis |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` | Canonical site URL for metadata and OpenGraph |

### Optional Media & Notification Services:

| Key | Value | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | `ghp_...` *(Personal Access Token)* | Increases GitHub API rate limits for sync (60 $\to$ 5,000 req/hr) |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary API Key for signed asset uploads |
| `CLOUDINARY_API_SECRET` | `abcdef...` | Cloudinary API Secret (Server-only) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Client-accessible cloud identifier |
| `RESEND_API_KEY` | `re_123456...` | Transactional email delivery for contact form |
| `RESEND_FROM` | `inquiries@yourdomain.com` | Verified sender domain in Resend |
| `CONTACT_TO_EMAIL` | `you@yourdomain.com` | Recipient inbox for contact inquiries |

> ⚠️ **Important Security Rule**:
> Never add `NEXT_PUBLIC_` to `GEMINI_API_KEY`, `AUTH_SECRET`, or `CLOUDINARY_API_SECRET`. These are server-only secrets.

---

## Step 5: Deploy & Seed the Database

1. Click **"Deploy"**. Vercel will build the project and assign a production URL (e.g. `https://dev-den.vercel.app`).
2. Once the build completes, seed your production MongoDB database with initial case studies, narrative profile, and skills:
   
   Run the idempotent seed script from your local machine targeting your production database:
   ```bash
   MONGODB_URI="mongodb+srv://user:pass@cluster0.../devden?retryWrites=true&w=majority" pnpm seed
   ```
   *(Or run `npm run seed`)*.

---

## Step 6: Custom Domain & Final URL Sync

1. In your Vercel Project Dashboard, navigate to **Settings** $\to$ **Domains**.
2. Add your custom apex or subdomain (e.g. `yourname.dev` or `portfolio.yourdomain.com`).
3. Add the DNS records (`CNAME` or `A` records) provided by Vercel to your DNS provider (Cloudflare, Namecheap, Google Domains, etc.).
4. Once verified, go to **Settings** $\to$ **Environment Variables**:
   - Update `NEXT_PUBLIC_SITE_URL` to `https://yourname.dev`.
   - Update `AUTH_URL` to `https://yourname.dev`.
5. Trigger a **Redeploy** from the **Deployments** tab so the new canonical URLs take effect.

---

## Step 7: Post-Deployment Smoke Test

Verify all key functional flows on your deployed Vercel URL:

1. **Public Site (`/`)**:
   - Verify hero typography, responsive layouts across 4 themes (Day Shift, Night Coder, Blueprint, Mono).
   - Check `/work` and click into a case study to verify D3.js interactive performance metrics and Lighthouse gauges.
2. **Admin Login (`/admin`)**:
   - Navigate to `/admin`. Verify automatic redirect to `/admin/login`.
   - Log in with your `ADMIN_EMAIL` and the plain-text password you hashed in Step 1.3.
3. **Automated GitHub Sync**:
   - In the Admin Dashboard overview, click **"Sync with GitHub"**.
   - Verify that Gemini 2.5 Flash inspects your GitHub repositories and successfully synchronizes metadata into your MongoDB Atlas database.
4. **Contact Form (`/contact`)**:
   - Submit a test inquiry. Verify success modal confirmation and toast notification appear. Check `/admin/messages` to verify the entry was saved to MongoDB.
