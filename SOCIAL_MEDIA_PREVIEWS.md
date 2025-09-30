# Social Media Previews for ApeBeats

This document explains how social media previews work in the ApeBeats application and how to test them.

## 🎯 Overview

Social media previews allow your pages to display rich previews when shared on platforms like:
- **X (Twitter)** - Twitter Cards
- **Facebook** - Open Graph
- **LinkedIn** - Open Graph
- **WhatsApp** - Open Graph
- **Discord** - Open Graph
- **Telegram** - Open Graph

## 🏗️ Architecture

### Metadata System

The social media preview system is built around a centralized metadata utility:

- **`lib/metadata.ts`** - Core metadata generation utility
- **`lib/social-preview-tester.ts`** - Testing utilities
- **Individual page components** - Server components with metadata exports

### How It Works

1. **Server Components**: Each page is a server component that exports metadata
2. **Metadata Generation**: The `generateSocialMediaMetadata()` function creates comprehensive meta tags
3. **Page-Specific Content**: Each page has its own title, description, and image
4. **Fallback System**: Default values ensure consistency across all pages

## 📄 Page Coverage

All major pages have social media previews:

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Main landing page with Sonic Swamp Hub branding |
| Music Engine | `/music` | Generative music engine page |
| Dashboard | `/dashboard` | User dashboard and NFT collection |
| Mint | `/mint` | Genesis NFT minting page |
| Staking | `/stake` | APE token staking page |
| Snapshot Tool | `/snapshot` | Live music moment capture tool |
| Transfers | `/transfers` | Batch NFT transfer functionality |
| Login | `/login` | Wallet connection and authentication |
| 404 | `/404` | Custom not found page |

## 🏷️ Meta Tags Included

### Open Graph Tags
```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://ApeBeats.vercel.app/image.jpg" />
<meta property="og:url" content="https://ApeBeats.vercel.app/page" />
<meta property="og:site_name" content="ApeBeats - Sonic Swamp Hub" />
<meta property="og:locale" content="en_US" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Image description" />
```

### Twitter Card Tags
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@CarquetE" />
<meta name="twitter:creator" content="@CarquetE" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://ApeBeats.vercel.app/image.jpg" />
```

### Additional SEO Tags
```html
<meta name="description" content="Page description" />
<meta name="keywords" content="ApeBeats, NFT, Music, ApeChain" />
<meta name="author" content="ApeBeats Team" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://ApeBeats.vercel.app/page" />
```

## 🧪 Testing

### Automated Testing

Run the social media preview test script:

```bash
npm run test:social
```

This will generate test URLs for all platforms and pages.

### Manual Testing

1. **Open the test page**: Visit `/social-preview-test.html` in your browser
2. **Test each platform**:
   - **Facebook**: Use [Facebook's Open Graph Debugger](https://developers.facebook.com/tools/debug/)
   - **Twitter**: Use [Twitter's Card Validator](https://cards-dev.twitter.com/validator)
   - **LinkedIn**: Use [LinkedIn's Post Inspector](https://www.linkedin.com/post-inspector/)
   - **WhatsApp/Discord**: Share URLs manually in these apps

### Testing Checklist

- [ ] Title displays correctly (under 60 characters)
- [ ] Description displays correctly (under 160 characters)
- [ ] Image loads and displays properly (1200x630 pixels)
- [ ] No broken images or missing content
- [ ] Preview looks good on mobile and desktop
- [ ] Consistent branding across all platforms
- [ ] All meta tags are present in page source

## 🎨 Customization

### Adding New Pages

1. **Create the page component** as a server component
2. **Export metadata** using `getPageMetadata()`:

```typescript
import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = getPageMetadata("pageKey", {
  title: "Custom Page Title",
  description: "Custom page description",
  url: "/custom-page",
})
```

3. **Add to metadata utility** if needed:

```typescript
// In lib/metadata.ts
export const pageMetadata = {
  // ... existing pages
  customPage: {
    title: "Custom Page - ApeBeats",
    description: "Custom page description",
    url: "/custom-page",
    type: "website" as const,
  },
}
```

### Customizing Images

Each page can have its own social media image:

```typescript
export const metadata: Metadata = getPageMetadata("pageKey", {
  title: "Page Title",
  description: "Page description",
  image: "/custom-page-image.jpg", // Custom image
  imageAlt: "Custom image description",
})
```

### Customizing Content

Override any metadata field:

```typescript
export const metadata: Metadata = getPageMetadata("pageKey", {
  title: "Custom Title",
  description: "Custom description",
  keywords: ["custom", "keywords"],
  author: "Custom Author",
})
```

## 🔧 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check image URLs are accessible
   - Ensure images use HTTPS
   - Verify image dimensions (1200x630 recommended)

2. **Wrong title/description**
   - Check meta tags in page source
   - Verify metadata export in page component
   - Clear browser cache

3. **Caching issues**
   - Use platform debugger tools to refresh cache
   - Facebook: Use "Scrape Again" button
   - Twitter: Use "Validate & Apply" button

4. **Mixed content warnings**
   - Ensure all URLs use HTTPS
   - Check image URLs are secure

### Debug Tools

- **Browser DevTools**: Inspect meta tags in page source
- **Facebook Debugger**: Test Open Graph tags
- **Twitter Card Validator**: Test Twitter Cards
- **LinkedIn Post Inspector**: Test LinkedIn previews

## 📊 Performance Considerations

### Image Optimization

- **Format**: Use JPG for photos, PNG for graphics
- **Size**: Keep under 1MB for fast loading
- **Dimensions**: 1200x630 pixels for optimal display
- **Compression**: Optimize images for web

### Meta Tag Optimization

- **Title**: Keep under 60 characters
- **Description**: Keep under 160 characters
- **Keywords**: Use relevant, specific keywords
- **Canonical URLs**: Prevent duplicate content issues

## 🚀 Deployment

### Environment Variables

Set the base URL for your deployment:

```bash
NEXT_PUBLIC_BASE_URL=https://ApeBeats.vercel.app
```

### Build Process

The metadata is generated at build time, so ensure:

1. All images are accessible
2. All URLs are correct
3. All meta tags are valid
4. No broken links

### Post-Deployment Testing

After deployment:

1. Test all pages with platform debuggers
2. Share URLs in social media apps
3. Verify images load correctly
4. Check mobile and desktop previews

## 📈 Analytics

### Tracking Social Shares

Consider adding analytics to track social media shares:

```typescript
// Track social media clicks
const trackSocialShare = (platform: string, url: string) => {
  // Your analytics code here
}
```

### Monitoring

- Monitor social media engagement
- Track which pages are shared most
- Analyze preview performance
- Optimize based on data

## 🔄 Updates

### Regular Maintenance

- **Monthly**: Test all pages with platform debuggers
- **Quarterly**: Review and update meta descriptions
- **As needed**: Update images and branding
- **After changes**: Test affected pages

### Version Control

- Keep metadata changes in version control
- Document any customizations
- Test changes before deployment
- Maintain consistency across pages

## 📚 Resources

### Documentation

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Tools

- [Facebook Open Graph Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Open Graph Preview](https://www.opengraph.xyz/)

### Best Practices

- [Social Media Meta Tags Best Practices](https://developers.facebook.com/docs/sharing/webmasters)
- [Twitter Cards Best Practices](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [SEO Meta Tags Guide](https://moz.com/learn/seo/meta-description)

---

**Happy sharing! 🎉**

Your ApeBeats pages will now display beautiful, professional previews when shared on social media platforms.
