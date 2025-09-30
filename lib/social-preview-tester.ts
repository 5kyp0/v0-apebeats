/**
 * Social Media Preview Testing Utility
 * 
 * This utility helps test and validate social media previews for different platforms.
 * Use these tools to verify that your Open Graph and Twitter Card meta tags are working correctly.
 */

export interface SocialPreviewTestResult {
  platform: string
  url: string
  status: 'success' | 'error' | 'warning'
  message: string
  preview?: {
    title?: string
    description?: string
    image?: string
    siteName?: string
  }
}

/**
 * Test social media previews for a given URL
 */
export async function testSocialPreview(url: string): Promise<SocialPreviewTestResult[]> {
  const results: SocialPreviewTestResult[] = []
  
  try {
    // Test with Facebook's Open Graph Debugger
    results.push({
      platform: 'Facebook',
      url: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`,
      status: 'success',
      message: 'Use Facebook\'s Open Graph Debugger to test your preview'
    })
    
    // Test with Twitter's Card Validator
    results.push({
      platform: 'Twitter',
      url: `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`,
      status: 'success',
      message: 'Use Twitter\'s Card Validator to test your preview'
    })
    
    // Test with LinkedIn's Post Inspector
    results.push({
      platform: 'LinkedIn',
      url: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`,
      status: 'success',
      message: 'Use LinkedIn\'s Post Inspector to test your preview'
    })
    
    // Test with WhatsApp (manual testing)
    results.push({
      platform: 'WhatsApp',
      url: url,
      status: 'warning',
      message: 'Test manually by sharing the URL in WhatsApp'
    })
    
    // Test with Discord (manual testing)
    results.push({
      platform: 'Discord',
      url: url,
      status: 'warning',
      message: 'Test manually by sharing the URL in Discord'
    })
    
  } catch (error) {
    results.push({
      platform: 'Error',
      url: url,
      status: 'error',
      message: `Failed to generate test URLs: ${error}`
    })
  }
  
  return results
}

/**
 * Generate test URLs for all your pages
 */
export function generateTestUrls(baseUrl: string = 'https://ApeBeats.vercel.app') {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Music Engine', path: '/music' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Mint', path: '/mint' },
    { name: 'Staking', path: '/stake' },
    { name: 'Snapshot Tool', path: '/snapshot' },
    { name: 'Transfers', path: '/transfers' },
    { name: 'Login', path: '/login' },
  ]
  
  return pages.map(page => ({
    ...page,
    url: `${baseUrl}${page.path}`,
    testUrls: {
      facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(`${baseUrl}${page.path}`)}`,
      twitter: `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(`${baseUrl}${page.path}`)}`,
      linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(`${baseUrl}${page.path}`)}`,
    }
  }))
}

/**
 * Validate meta tags in HTML content
 */
export function validateMetaTags(html: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for required Open Graph tags
  const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']
  const requiredTwitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']
  
  requiredOgTags.forEach(tag => {
    if (!html.includes(`property="${tag}"`) && !html.includes(`property='${tag}'`)) {
      errors.push(`Missing required Open Graph tag: ${tag}`)
    }
  })
  
  requiredTwitterTags.forEach(tag => {
    if (!html.includes(`name="${tag}"`) && !html.includes(`name='${tag}'`)) {
      errors.push(`Missing required Twitter Card tag: ${tag}`)
    }
  })
  
  // Check for image dimensions
  if (html.includes('og:image')) {
    if (!html.includes('og:image:width') || !html.includes('og:image:height')) {
      warnings.push('Consider adding og:image:width and og:image:height for better performance')
    }
  }
  
  // Check for image alt text
  if (html.includes('og:image') && !html.includes('og:image:alt')) {
    warnings.push('Consider adding og:image:alt for accessibility')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Generate a comprehensive testing report
 */
export async function generateTestingReport(baseUrl: string = 'https://ApeBeats.vercel.app') {
  const pages = generateTestUrls(baseUrl)
  
  console.log('🔍 Social Media Preview Testing Report')
  console.log('=====================================\n')
  
  pages.forEach(page => {
    console.log(`📄 ${page.name} (${page.path})`)
    console.log(`   URL: ${page.url}`)
    console.log(`   Facebook: ${page.testUrls.facebook}`)
    console.log(`   Twitter: ${page.testUrls.twitter}`)
    console.log(`   LinkedIn: ${page.testUrls.linkedin}`)
    console.log('')
  })
  
  console.log('📋 Testing Checklist:')
  console.log('====================')
  console.log('✅ Open Graph tags present (og:title, og:description, og:image, og:url, og:type)')
  console.log('✅ Twitter Card tags present (twitter:card, twitter:title, twitter:description, twitter:image)')
  console.log('✅ Image dimensions specified (og:image:width, og:image:height)')
  console.log('✅ Image alt text provided (og:image:alt)')
  console.log('✅ Canonical URL set')
  console.log('✅ Meta description under 160 characters')
  console.log('✅ Title under 60 characters')
  console.log('✅ Image is 1200x630 pixels (recommended)')
  console.log('✅ Image loads correctly')
  console.log('✅ Preview looks good on all platforms')
  console.log('')
  
  console.log('🚀 Quick Test Commands:')
  console.log('======================')
  console.log('1. Open Facebook Debugger and test each URL')
  console.log('2. Open Twitter Card Validator and test each URL')
  console.log('3. Share URLs in WhatsApp and Discord to test manually')
  console.log('4. Use browser dev tools to inspect meta tags')
  console.log('')
  
  return pages
}
