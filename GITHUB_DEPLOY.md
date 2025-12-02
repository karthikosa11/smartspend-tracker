# Deploy to GitHub - Quick Guide

## ✅ Your project is ready!

All files have been committed to git. Now follow these steps to push to GitHub:

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `smartspend-tracker` (or any name you prefer)
4. Description: "Expense tracking application with MySQL database"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 2: Connect and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/smartspend-tracker.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

1. Go to your repository on GitHub
2. You should see all your files
3. The README.md will display automatically

## Next Steps: Deploy to Hosting

After pushing to GitHub, you can deploy to:

### Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add MySQL service
5. Set environment variables
6. Deploy!

### Render
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repository
4. Set build/start commands
5. Add MySQL database
6. Deploy!

## Environment Variables to Set

When deploying, make sure to set these in your hosting platform:

```env
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=smartspend
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_key
VITE_API_URL=https://your-backend-url.com/api
```

## Important Notes

- ✅ `.env` file is already in `.gitignore` (won't be pushed)
- ✅ `node_modules/` is ignored (will be installed on deployment)
- ✅ Build folders are ignored
- ✅ All sensitive data is protected

Your code is ready to deploy! 🚀

