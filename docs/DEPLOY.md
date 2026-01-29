# 🚀 Deploy TUSK to GitHub Pages

This guide walks you through deploying your TUSK todo app to GitHub Pages for free hosting.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deploy (Manual)](#quick-deploy-manual)
3. [Automated Deploy (GitHub Actions)](#automated-deploy-github-actions)
4. [Custom Domain](#custom-domain-optional)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A GitHub account
- Git installed locally
- Your TUSK project files (index.html, styles.css, app.js)

---

## Quick Deploy (Manual)

The fastest way to deploy - no CI/CD configuration needed.

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `tusk-todo` (or your preferred name)
3. Make it **Public** (required for free GitHub Pages)
4. Click **Create repository**

### Step 2: Push Your Code

```bash
# Navigate to your project folder
cd path/to/tusk-todo

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TUSK todo app"

# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/tusk-todo.git

# Push to main branch
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (tab at the top)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Click **Save**

### Step 4: Access Your Site

After 1-2 minutes, your site will be live at:

```
https://YOUR_USERNAME.github.io/tusk-todo/
```

You'll see the URL displayed in the Pages settings once it's ready.

---

## Automated Deploy (GitHub Actions)

For automatic deployments on every push to main.

### Step 1: Create Workflow File

Create the file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  # Runs on pushes to main branch
  push:
    branches: ["main"]
  
  # Allows manual trigger from Actions tab
  workflow_dispatch:

# Sets permissions for GITHUB_TOKEN
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one deployment at a time
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Upload entire repository
          path: '.'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 2: Enable Pages for Actions

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save changes

### Step 3: Push and Deploy

```bash
# Add the workflow file
git add .github/workflows/deploy.yml

# Commit
git commit -m "Add GitHub Actions deployment workflow"

# Push
git push origin main
```

### Step 4: Monitor Deployment

1. Go to the **Actions** tab in your repository
2. Click on the running workflow
3. Watch the deployment progress
4. Once complete, your site is live!

---

## Custom Domain (Optional)

Use your own domain instead of `github.io`.

### Step 1: Configure DNS

Add these DNS records at your domain registrar:

**For apex domain (example.com):**
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153
```

**For subdomain (www.example.com or app.example.com):**
```
Type: CNAME
Name: www (or your subdomain)
Value: YOUR_USERNAME.github.io
```

### Step 2: Add Custom Domain in GitHub

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Click **Save**
4. Wait for DNS check (may take up to 24 hours)

### Step 3: Enable HTTPS

1. Once DNS is verified, check **Enforce HTTPS**
2. GitHub will provision an SSL certificate automatically

### Step 4: Add CNAME File

Create a `CNAME` file in your repo root:

```
example.com
```

This ensures the custom domain persists across deployments.

---

## Troubleshooting

### Site shows 404

**Cause:** GitHub Pages hasn't finished building, or wrong branch/folder selected.

**Fix:**
1. Go to **Settings** → **Pages**
2. Verify source is set to `main` branch and `/` (root)
3. Wait 2-3 minutes and refresh
4. Check the **Actions** tab for build errors

### CSS/JS not loading

**Cause:** Paths are incorrect (especially if using subdirectory).

**Fix:**
- Use relative paths: `./styles.css` instead of `/styles.css`
- Or use full paths: `https://YOUR_USERNAME.github.io/tusk-todo/styles.css`

### Changes not appearing

**Cause:** Browser cache or deployment still in progress.

**Fix:**
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Check **Actions** tab to confirm deployment completed
3. Clear browser cache

### Actions workflow failing

**Cause:** Permissions or configuration issues.

**Fix:**
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Check workflow YAML syntax for errors

### Custom domain SSL issues

**Cause:** DNS not fully propagated or certificate not issued yet.

**Fix:**
1. Wait 24-48 hours for DNS propagation
2. Verify DNS records with `dig YOUR_DOMAIN`
3. Check certificate status in Pages settings
4. Try removing and re-adding the custom domain

---

## Project Structure for Deployment

Ensure your repository has this structure:

```
tusk-todo/
├── index.html          ← Entry point (must be at root)
├── styles.css
├── app.js
├── .gitignore
├── README.md
├── CNAME               ← Optional: for custom domain
├── docs/
│   └── ...
└── .github/
    └── workflows/
        └── deploy.yml  ← Optional: for Actions deployment
```

---

## Quick Reference

| Task | Command/Action |
|------|---------------|
| Push changes | `git add . && git commit -m "update" && git push` |
| Check deployment | GitHub repo → Actions tab |
| View live site | `https://USERNAME.github.io/REPO/` |
| Change source branch | Settings → Pages → Source |
| Add custom domain | Settings → Pages → Custom domain |

---

## Useful Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)
- [Troubleshooting Guide](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)

---

Happy deploying! 🐘🚀
