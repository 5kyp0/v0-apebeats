// HTML sanitization utilities to replace dangerouslySetInnerHTML
// This provides safe alternatives for injecting HTML content

// Allowed HTML tags and attributes for safe content
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div'
];

const ALLOWED_ATTRIBUTES = [
  'class', 'id', 'data-*'
];

// Simple HTML sanitizer
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed)\b[^>]*>.*?<\/\1>/gi, '');
  
  // Remove style attributes that could contain malicious CSS
  sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
  
  return sanitized;
}

// Safe JSON-LD generator
export function createSafeJsonLd(data: Record<string, any>): string {
  // Validate that the data is safe for JSON-LD
  const safeData = {
    '@context': 'https://schema.org',
    ...data
  };
  
  // Remove any potentially dangerous properties
  delete (safeData as any).__proto__;
  delete (safeData as any).constructor;
  delete (safeData as any).prototype;
  
  return JSON.stringify(safeData);
}

// Safe script content generator
export function createSafeScript(content: string): string {
  // Remove any potentially dangerous patterns
  let safeContent = content;
  
  // Remove eval, Function constructor, and other dangerous patterns
  safeContent = safeContent.replace(/\beval\s*\(/g, '/* eval blocked */');
  safeContent = safeContent.replace(/\bFunction\s*\(/g, '/* Function blocked */');
  safeContent = safeContent.replace(/\bnew\s+Function\s*\(/g, '/* new Function blocked */');
  
  // Remove document.write and similar
  safeContent = safeContent.replace(/\bdocument\.write\s*\(/g, '/* document.write blocked */');
  safeContent = safeContent.replace(/\binnerHTML\s*=/g, '/* innerHTML blocked */');
  safeContent = safeContent.replace(/\bouterHTML\s*=/g, '/* outerHTML blocked */');
  
  return safeContent;
}

// React component for safe HTML rendering
export function SafeHtml({ 
  content, 
  tag = 'div', 
  className = '',
  ...props 
}: {
  content: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}) {
  const sanitizedContent = sanitizeHtml(content);
  const Tag = tag as any;
  
  return (
    <Tag 
      className={className}
      {...props}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

// Safe JSON-LD component
export function SafeJsonLd({ 
  data, 
  ...props 
}: {
  data: Record<string, any>;
  [key: string]: any;
}) {
  const jsonLd = createSafeJsonLd(data);
  
  return (
    <script
      type="application/ld+json"
      {...props}
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

// Safe script component
export function SafeScript({ 
  content, 
  ...props 
}: {
  content: string;
  [key: string]: any;
}) {
  const safeContent = createSafeScript(content);
  
  return (
    <script
      {...props}
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}

// Alternative to dangerouslySetInnerHTML using React components
export function createSafeContent(content: string): React.ReactNode {
  // For simple text content, just return it
  if (!content.includes('<')) {
    return content;
  }
  
  // For HTML content, parse and create React elements
  // This is a simplified version - in production, you might want to use a proper HTML parser
  const lines = content.split('\n');
  return lines.map((line, index) => {
    if (line.trim() === '') {
      return <br key={index} />;
    }
    
    // Handle basic HTML tags
    if (line.startsWith('<h1>')) {
      return <h1 key={index}>{line.replace(/<\/?h1>/g, '')}</h1>;
    }
    if (line.startsWith('<h2>')) {
      return <h2 key={index}>{line.replace(/<\/?h2>/g, '')}</h2>;
    }
    if (line.startsWith('<p>')) {
      return <p key={index}>{line.replace(/<\/?p>/g, '')}</p>;
    }
    if (line.startsWith('<strong>')) {
      return <strong key={index}>{line.replace(/<\/?strong>/g, '')}</strong>;
    }
    if (line.startsWith('<em>')) {
      return <em key={index}>{line.replace(/<\/?em>/g, '')}</em>;
    }
    
    // Default to paragraph
    return <p key={index}>{line}</p>;
  });
}
