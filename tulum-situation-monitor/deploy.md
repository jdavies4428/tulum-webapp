# Deploy to GitHub Pages

1. Create a GitHub repo named "tulum-situation-monitor"
2. Run these commands in this folder:

```bash
git init
git add index.html
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/jdavies4428/tulum-situation-monitor.git
git push -u origin main
```

3. On GitHub, go to Settings → Pages → Source → Deploy from main branch
4. Site will be live at: https://jdavies4428.github.io/tulum-situation-monitor/

## Auto-Deploy Script

Create `.github/workflows/deploy.yml` for automatic deploys on every push.
