// Cloudflare Pages Functions - Middleware for enhanced security and analytics
// This file adds server-side functionality to the static site

// Security headers middleware
export async function onRequest(context) {
  const { request, next, env } = context;
  
  // Get the response from the static asset or next function
  const response = await next();
  
  // Clone the response so we can modify headers
  const newResponse = new Response(response.body, response);
  
  // Add security headers
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy for enhanced security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  newResponse.headers.set('Content-Security-Policy', csp);
  
  // Add custom header to identify deployment
  newResponse.headers.set('X-Deployed-On', 'Cloudflare-Pages');
  newResponse.headers.set('X-Version', '2.0.0');
  
  // Performance headers
  if (request.url.includes('.css') || request.url.includes('.js')) {
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (request.url.includes('.html')) {
    newResponse.headers.set('Cache-Control', 'public, max-age=300');
  }
  
  return newResponse;
}

// Optional: Analytics function (uncomment if you want to track usage)
/*
export async function onRequestPost(context) {
  const { request, env } = context;
  
  if (request.url.includes('/api/analytics')) {
    try {
      const data = await request.json();
      
      // Log analytics data (could be saved to Cloudflare Analytics or KV)
      console.log('Analytics:', {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('User-Agent'),
        referer: request.headers.get('Referer'),
        data: data
      });
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response('Not Found', { status: 404 });
}
*/