# Deployment Guide

## Overview

The Test Prioritisation Scoring Tool is a client-side React application that can be deployed to any static hosting service. This guide covers deployment to popular platforms.

## Prerequisites

- Node.js 20.19+ or 22.12+ (for building)
- npm or yarn package manager
- Git (for version control)

## Building for Production

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Production Build

```bash
npm run build
```

This command:
- Compiles TypeScript to JavaScript
- Bundles all assets using Vite
- Optimizes and minifies code
- Outputs to the `dist/` directory

### 3. Verify Build Output

The `dist/` directory should contain:
- `index.html` - Main HTML file
- `assets/` - Bundled CSS and JavaScript files
- `vite.svg` - Favicon

**Expected Bundle Sizes:**
- CSS: ~36 KB (~7 KB gzipped)
- JavaScript: ~341 KB (~98 KB gzipped)

### 4. Test Locally

```bash
npm run preview
```

This starts a local server to test the production build before deployment.

## Deployment Options

### Option 1: Netlify (Recommended)

Netlify provides automatic deployments from Git repositories with zero configuration.

#### Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

#### Deploy via Netlify UI

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect your Git repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click "Deploy site"

**Netlify Configuration File** (optional):

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 2: GitHub Pages

GitHub Pages provides free hosting for static sites directly from your repository.

#### Using GitHub Actions (Automated)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

2. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

3. Push to main branch to trigger deployment

#### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Install gh-pages:
```bash
npm install -D gh-pages
```

3. Add deploy script to `package.json`:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

### Option 3: Vercel

Vercel offers seamless deployment with automatic HTTPS and global CDN.

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to configure your project

**Vercel Configuration File** (optional):

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Option 4: AWS S3 + CloudFront

For enterprise deployments requiring AWS infrastructure.

1. Build the project:
```bash
npm run build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://test-prioritization-tool
```

3. Configure bucket for static website hosting:
```bash
aws s3 website s3://test-prioritization-tool --index-document index.html
```

4. Upload files:
```bash
aws s3 sync dist/ s3://test-prioritization-tool --delete
```

5. Set up CloudFront distribution (optional, for HTTPS and CDN)

## Environment Configuration

The application runs entirely client-side with no backend dependencies. All configuration is embedded in the build.

### Custom Configuration

To customize the application:

1. Update `src/types/models.ts` for data model changes
2. Modify `src/services/ScoreCalculator.ts` for scoring logic
3. Adjust `tailwind.config.js` for styling changes

## Post-Deployment Verification

After deployment, verify the following:

### Functionality Checklist

- [ ] Application loads without errors
- [ ] Can add new test case rows
- [ ] Score calculations work correctly
- [ ] Can upload JSON files (both formats)
- [ ] Can download/export JSON
- [ ] localStorage persistence works
- [ ] State diagram import and diff display correctly
- [ ] Filters and sorting work
- [ ] Responsive design works on mobile/tablet
- [ ] Help modal displays correctly
- [ ] All tooltips appear on hover

### Browser Testing

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Performance Testing

- [ ] Initial page load < 3 seconds
- [ ] Score recalculation feels instant
- [ ] Table with 100 rows renders smoothly
- [ ] No console errors or warnings

## Troubleshooting

### Build Fails

**Issue:** TypeScript compilation errors

**Solution:** Run `npm run lint` to identify issues, fix errors, then rebuild

**Issue:** Out of memory during build

**Solution:** Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Deployment Issues

**Issue:** 404 errors on page refresh

**Solution:** Configure your hosting provider to redirect all routes to `index.html` (SPA routing)

**Issue:** Assets not loading (CORS errors)

**Solution:** Ensure your hosting provider serves files with correct MIME types

### Runtime Issues

**Issue:** localStorage not working

**Solution:** Check browser privacy settings; localStorage may be disabled in private/incognito mode

**Issue:** File upload not working

**Solution:** Verify the hosting provider allows file input elements and FileReader API

## Monitoring and Maintenance

### Analytics (Optional)

To add analytics, integrate a service like Google Analytics or Plausible:

1. Add tracking script to `index.html`
2. Rebuild and redeploy

### Updates

To deploy updates:

1. Make changes to the codebase
2. Test locally: `npm run dev`
3. Run tests: `npm test`
4. Build: `npm run build`
5. Deploy using your chosen method

### Rollback

If issues occur after deployment:

**Netlify:** Use the Netlify UI to rollback to a previous deployment

**GitHub Pages:** Revert the commit and push

**Vercel:** Use Vercel dashboard to rollback

## Security Considerations

- The application stores data in browser localStorage only
- No sensitive data is transmitted to external servers
- All processing happens client-side
- HTTPS is recommended for production deployments
- Consider implementing Content Security Policy (CSP) headers

## Support

For issues or questions:
- Check the [User Guide](USER_GUIDE.md)
- Review the [Developer Guide](DEVELOPER_GUIDE.md)
- Open an issue on the project repository
