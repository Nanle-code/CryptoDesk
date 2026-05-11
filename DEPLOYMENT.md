# CryptoDesk Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: GitHub Pages (Recommended)

#### Automatic Deployment
1. **Push to GitHub**: The workflow automatically deploys on every push to `master`
2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - Save and wait for deployment

#### Manual Deployment
```bash
# Deploy to GitHub Pages manually
git subtree push --prefix cryptodesk origin gh-pages
```

#### Access URL
```
https://your-username.github.io/cryptodesk-project/cryptodesk/index.html
```

### Option 2: Netlify

#### Drag & Drop
1. **Compress**: Zip the `cryptodesk/` folder
2. **Upload**: Drag to [netlify.com](https://netlify.com)
3. **Deploy**: Instant deployment with random URL

#### Custom Domain
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd cryptodesk
netlify deploy --prod --dir .
```

### Option 3: Vercel

#### Quick Deploy
1. **Connect**: Import repository to [vercel.com](https://vercel.com)
2. **Configure**: Set root directory to `cryptodesk`
3. **Deploy**: Automatic deployment on every push

### Option 4: Static Hosting (AWS S3, Firebase, etc.)

#### AWS S3 + CloudFront
```bash
# Install AWS CLI
aws s3 sync cryptodesk/ s3://your-bucket-name --delete
# Configure CloudFront distribution
```

#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Deploy
firebase init hosting
firebase deploy
```

---

## ⚙️ Configuration

### Environment Variables (Optional)
For production deployments, you can set default API keys:
- `VITE_SOSO_API_KEY`: Your SoSoValue API key
- `VITE_GROK_API_KEY`: Your Grok API key

### Custom Domain Setup

#### GitHub Pages
1. **DNS Settings**: Add CNAME record pointing to `your-username.github.io`
2. **Repository Settings**: Add custom domain in Pages settings
3. **SSL Certificate**: Automatically provisioned by GitHub

#### Netlify
1. **Domain Management**: Add custom domain in Netlify dashboard
2. **DNS**: Follow Netlify's DNS instructions
3. **SSL**: Automatic SSL certificate

---

## 🔧 Pre-Deployment Checklist

### ✅ Security
- [ ] No hardcoded API keys in source code
- [ ] `.gitignore` properly configured
- [ ] Pre-commit hooks working
- [ ] Environment variables set (if needed)

### ✅ Performance
- [ ] Images optimized
- [ ] CSS/JS minified (if applicable)
- [ ] Caching headers configured
- [ ] CDN enabled (if using custom domain)

### ✅ SEO & Analytics
- [ ] Meta tags updated
- [ ] Open Graph tags set
- [ ] Analytics tracking added
- [ ] Sitemap generated (if needed)

---

## 📊 Monitoring & Analytics

### GitHub Pages Analytics
- Built-in traffic analytics
- Page views and visitor data
- Referrer information

### Third-party Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🚨 Troubleshooting

### Common Issues

#### 404 Errors
- **GitHub Pages**: Ensure `index.html` is in the correct path
- **Custom Domains**: Check DNS configuration
- **Routing**: Verify base URL in relative links

#### API Key Issues
- **CORS**: Ensure API keys are set correctly
- **Rate Limits**: Monitor API usage
- **Authentication**: Verify API key format

#### Performance Issues
- **Large Files**: Optimize images and assets
- **Caching**: Enable browser caching
- **CDN**: Use CDN for static assets

### Debug Mode
```javascript
// Add to index.html for debugging
window.DEBUG = true;
localStorage.setItem('debug', 'true');
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Recommended)
The included workflow automatically:
- Deploys on every push to `master`
- Runs security checks
- Validates HTML/CSS/JS
- Provides deployment status

### Manual Triggers
```bash
# Trigger deployment manually
git commit --allow-empty -m "Trigger deployment"
git push origin master
```

---

## 📱 Progressive Web App (PWA)

### Installation
Users can install CryptoDesk as a desktop app:
1. **Visit**: Open the deployed URL
2. **Install**: Click "Install" in browser menu
3. **Access**: Launch from desktop/start menu

### PWA Features
- **Offline Support**: Cached data for offline viewing
- **App-like Experience**: Fullscreen, no browser UI
- **Push Notifications**: Future feature for alerts
- **Auto-updates**: Automatic updates when deployed

---

## 📈 Performance Optimization

### Lighthouse Scores
Target scores for production:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+

### Optimization Tips
- **Images**: WebP format, lazy loading
- **CSS**: Minify, critical CSS inline
- **JavaScript**: Tree shaking, code splitting
- **Network**: HTTP/2, Brotli compression

---

## 🔐 Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://openapi.sosovalue.com https://api.x.ai;">
```

### HTTPS Enforcement
```javascript
// Force HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

---

## 📞 Support

### Deployment Issues
- **GitHub**: Check Actions tab for error logs
- **Netlify**: Review deploy logs in dashboard
- **Vercel**: Check function logs and build output

### Performance Issues
- **PageSpeed**: Use Google PageSpeed Insights
- **WebPageTest**: Detailed performance analysis
- **Lighthouse**: Built-in Chrome DevTools

---

*Last Updated: May 11, 2026*
