# GitHub Pages Deployment Setup

Follow these steps to deploy your site to GitHub Pages with a custom domain.

## 1. Update Astro Configuration

Edit `astro.config.mjs` and replace the site URL with your custom domain:

```javascript
export default defineConfig({
  site: 'https://yourdomain.com',  // Replace with your actual domain
  integrations: [tailwind(), sitemap()],
});
```

## 2. Configure GitHub Repository

### Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**

### Add Cloudinary Secret
1. In your repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `PUBLIC_CLOUDINARY_CLOUD_NAME`
4. Value: Your Cloudinary cloud name (from `.env` file)
5. Click **Add secret**

## 3. Set Up Custom Domain

### Option A: Apex Domain (e.g., yourdomain.com)

1. In GitHub repo **Settings** → **Pages** → **Custom domain**:
   - Enter: `yourdomain.com`
   - Click **Save**

2. In your DNS provider, add these **A records**:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

3. (Optional) Add **AAAA records** for IPv6:
   ```
   2606:50c0:8000::153
   2606:50c0:8001::153
   2606:50c0:8002::153
   2606:50c0:8003::153
   ```

### Option B: Subdomain (e.g., www.yourdomain.com or blog.yourdomain.com)

1. In GitHub repo **Settings** → **Pages** → **Custom domain**:
   - Enter: `www.yourdomain.com` (or your subdomain)
   - Click **Save**

2. In your DNS provider, add a **CNAME record**:
   ```
   www  →  yourusername.github.io
   ```

### Enable HTTPS
- Check **Enforce HTTPS** in GitHub Pages settings (after DNS propagates)
- GitHub provides free SSL certificates via Let's Encrypt

## 4. Create CNAME File (Important!)

Create a file `public/CNAME` with your domain:

```bash
echo "yourdomain.com" > public/CNAME
```

This ensures your custom domain persists after each deployment.

## 5. Deploy

### Push to GitHub
```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
1. Install dependencies
2. Build your Astro site
3. Deploy to GitHub Pages

### Monitor Deployment
- Go to **Actions** tab in your repo
- Watch the "Deploy to GitHub Pages" workflow
- Takes ~2-5 minutes

## 6. Verify

1. **Check deployment status** in Actions tab (should be green ✓)
2. **Test GitHub Pages URL**: `https://yourusername.github.io/`
3. **Wait for DNS** (can take 5 minutes to 24 hours)
4. **Visit your custom domain**: `https://yourdomain.com`

## Troubleshooting

### DNS not resolving
- Use `dig yourdomain.com` to check DNS records
- Wait up to 24 hours for propagation
- Verify DNS records are correct in your provider

### Build failing
- Check Actions tab for error logs
- Verify `PUBLIC_CLOUDINARY_CLOUD_NAME` secret is set
- Ensure all dependencies are in `package.json`

### Custom domain not working
- Verify `CNAME` file exists in `public/` folder
- Check GitHub Pages settings show your domain
- Ensure DNS records point to GitHub's IPs
- Try clearing your browser cache

### HTTPS not available
- Wait 24 hours after DNS propagation
- Uncheck and recheck "Enforce HTTPS" in settings

## Common DNS Providers

- **Cloudflare**: DNS → Records → Add Record
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: DNS Management → Records
- **Google Domains**: DNS → Custom Records

## Future Deployments

After initial setup, every push to `main` automatically deploys:

```bash
git add .
git commit -m "Update content"
git push
```

View deployment status in the **Actions** tab.
