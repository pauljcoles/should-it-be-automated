# Deployment Checklist

Use this checklist to ensure a successful deployment of the Test Prioritisation Tool.

## Pre-Deployment

### Code Quality
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No console errors in development mode
- [ ] Code reviewed and approved

### Testing
- [ ] Manual testing completed on localhost
- [ ] All core features work:
  - [ ] Add/edit/delete test cases
  - [ ] Score calculations are correct
  - [ ] Filters and sorting work
  - [ ] JSON import/export works
  - [ ] State diagram import works
  - [ ] localStorage persistence works
  - [ ] Scenario tool integration works
- [ ] Tested on multiple browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Responsive design tested on:
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)

### Documentation
- [ ] README.md is up to date
- [ ] USER_GUIDE.md is complete
- [ ] DEVELOPER_GUIDE.md is complete
- [ ] DEPLOYMENT.md has correct instructions
- [ ] All inline code comments are accurate

### Build Verification
- [ ] Production build completes successfully
- [ ] Bundle sizes are reasonable:
  - [ ] CSS < 50 KB (gzipped < 10 KB)
  - [ ] JS < 400 KB (gzipped < 120 KB)
- [ ] No build warnings
- [ ] Preview build works locally: `npm run preview`

## Deployment Steps

### Option A: Netlify

#### Via Netlify UI
- [ ] Push code to Git repository (GitHub/GitLab/Bitbucket)
- [ ] Log in to [netlify.com](https://netlify.com)
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect Git repository
- [ ] Verify build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Node version: 20
- [ ] Click "Deploy site"
- [ ] Wait for deployment to complete
- [ ] Note the deployment URL

#### Via Netlify CLI
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Initialize: `netlify init`
- [ ] Deploy: `netlify deploy --prod`
- [ ] Note the deployment URL

### Option B: GitHub Pages

#### Automated via GitHub Actions
- [ ] Ensure `.github/workflows/deploy.yml` exists
- [ ] Push code to GitHub repository
- [ ] Go to repository Settings → Pages
- [ ] Set Source to "GitHub Actions"
- [ ] Push to main branch to trigger deployment
- [ ] Check Actions tab for deployment status
- [ ] Note the GitHub Pages URL

#### Manual Deployment
- [ ] Install gh-pages: `npm install -D gh-pages`
- [ ] Add deploy script to package.json:
  ```json
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
  ```
- [ ] Build: `npm run build`
- [ ] Deploy: `npm run deploy`
- [ ] Enable GitHub Pages in repository settings
- [ ] Note the GitHub Pages URL

### Option C: Vercel

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `vercel --prod`
- [ ] Follow prompts to configure
- [ ] Note the Vercel URL

## Post-Deployment

### Verification
- [ ] Visit the deployed URL
- [ ] Application loads without errors
- [ ] Check browser console for errors
- [ ] Test all core features:
  - [ ] Add test case
  - [ ] Edit test case
  - [ ] Delete test case
  - [ ] Duplicate test case
  - [ ] Upload JSON file
  - [ ] Download JSON file
  - [ ] Import state diagram
  - [ ] View state diagram diff
  - [ ] Paste scenario
  - [ ] Copy decision
  - [ ] Apply filters
  - [ ] Sort columns
  - [ ] View help modal
  - [ ] Add existing functionality
- [ ] Test localStorage:
  - [ ] Add data
  - [ ] Refresh page
  - [ ] Verify data persists
- [ ] Test on multiple browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Test responsive design:
  - [ ] Desktop view
  - [ ] Tablet view
  - [ ] Mobile view

### Performance
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No layout shifts
- [ ] Smooth scrolling with 100 rows
- [ ] Score calculations feel instant

### Security
- [ ] HTTPS is enabled
- [ ] Security headers are set:
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] X-XSS-Protection
- [ ] No sensitive data in localStorage
- [ ] No API keys or secrets in code

### Monitoring
- [ ] Set up error tracking (optional):
  - [ ] Sentry
  - [ ] LogRocket
  - [ ] Rollbar
- [ ] Set up analytics (optional):
  - [ ] Google Analytics
  - [ ] Plausible
  - [ ] Fathom

### Documentation
- [ ] Update README with deployment URL
- [ ] Share URL with team
- [ ] Document any deployment-specific configuration
- [ ] Create user onboarding materials

## Rollback Plan

If issues are discovered after deployment:

### Netlify
- [ ] Go to Netlify dashboard
- [ ] Navigate to Deploys
- [ ] Find previous working deployment
- [ ] Click "Publish deploy"

### GitHub Pages
- [ ] Revert the problematic commit
- [ ] Push to main branch
- [ ] Wait for redeployment

### Vercel
- [ ] Go to Vercel dashboard
- [ ] Navigate to Deployments
- [ ] Find previous working deployment
- [ ] Click "Promote to Production"

## Maintenance

### Regular Tasks
- [ ] Monitor deployment status
- [ ] Check for security updates: `npm audit`
- [ ] Update dependencies monthly
- [ ] Review and respond to user feedback
- [ ] Monitor bundle size growth
- [ ] Review error logs (if monitoring enabled)

### Updates
When deploying updates:
- [ ] Follow pre-deployment checklist
- [ ] Test in staging environment (if available)
- [ ] Deploy during low-traffic period
- [ ] Monitor for errors after deployment
- [ ] Have rollback plan ready

## Troubleshooting

### Build Fails
- Check Node version (requires 20.19+ or 22.12+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`
- Review build logs for specific errors

### Deployment Fails
- Verify build command is correct
- Verify publish directory is correct
- Check deployment logs
- Ensure all environment variables are set (if any)

### Application Not Loading
- Check browser console for errors
- Verify all assets are loading (Network tab)
- Check for CORS issues
- Verify routing configuration for SPA

### Features Not Working
- Test localStorage availability
- Check for JavaScript errors
- Verify API compatibility (FileReader, Clipboard API)
- Test in different browsers

## Sign-Off

Deployment completed by: ___________________

Date: ___________________

Deployment URL: ___________________

Platform: [ ] Netlify [ ] GitHub Pages [ ] Vercel [ ] Other: ___________

Notes:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

All checklist items verified: [ ] Yes [ ] No

Issues encountered:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________
