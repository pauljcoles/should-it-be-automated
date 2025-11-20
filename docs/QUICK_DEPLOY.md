# Quick Deployment Reference

## One-Command Deployments

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
```bash
# Push to GitHub, then enable GitHub Actions in Settings → Pages
git push origin main
```

### Using Deploy Script
```bash
./scripts/deploy.sh
```

## Pre-Deployment Quick Check

```bash
npm test && npm run lint && npm run build
```

## Post-Deployment Quick Test

Visit your deployment URL and verify:
- ✅ Application loads
- ✅ Can add test case
- ✅ Scores calculate correctly
- ✅ Can export JSON
- ✅ localStorage works (add data, refresh, data persists)

## Rollback

### Netlify
Dashboard → Deploys → Previous deploy → Publish

### Vercel
Dashboard → Deployments → Previous deploy → Promote to Production

### GitHub Pages
```bash
git revert <commit-hash>
git push origin main
```

## Support

- Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- User guide: [USER_GUIDE.md](USER_GUIDE.md)
