/**
 * Browser detection utility for providing browser-specific popup guidance
 */

export type BrowserType = 'chrome' | 'brave' | 'firefox' | 'safari' | 'edge' | 'unknown'

export function detectBrowser(): BrowserType {
  if (typeof window === 'undefined') {
    return 'unknown'
  }

  const userAgent = window.navigator.userAgent.toLowerCase()

  // Check for Brave (must be checked before Chrome as Brave includes Chrome in user agent)
  // Brave has a specific navigator.brave property and may not always include 'brave' in user agent
  if ((window.navigator as any).brave || userAgent.includes('brave')) {
    return 'brave'
  }

  // Check for Chrome
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'chrome'
  }

  // Check for Edge
  if (userAgent.includes('edg')) {
    return 'edge'
  }

  // Check for Firefox
  if (userAgent.includes('firefox')) {
    return 'firefox'
  }

  // Check for Safari
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'safari'
  }

  return 'unknown'
}

export function getBrowserDisplayName(browser: BrowserType): string {
  switch (browser) {
    case 'chrome':
      return 'Chrome'
    case 'brave':
      return 'Brave'
    case 'firefox':
      return 'Firefox'
    case 'safari':
      return 'Safari'
    case 'edge':
      return 'Edge'
    default:
      return 'Your Browser'
  }
}
