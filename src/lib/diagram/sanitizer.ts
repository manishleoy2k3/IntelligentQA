/**
 * SVG Sanitizer for Architecture and Infographic Diagrams
 * Ensures diagrams contain no malicious script injections, dangerous events or external entity references.
 */

const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'meta',
  'link',
  'foreignobject',
  'style', // Stripping arbitrary external style blocks if unsanitized
];

const DANGEROUS_ATTRIBUTES = [
  /^on[a-z]+/i, // onclick, onload, onerror, etc.
  /^xlink:href$/i, // when pointing to javascript:
];

export function sanitizeSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    return '';
  }

  let clean = svgContent;

  // 1. Remove dangerous XML declarations or doctypes that allow XXE
  clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '');
  clean = clean.replace(/<!ENTITY[^>]*>/gi, '');

  // 2. Remove script and dangerous tags (case-insensitive, greedy)
  DANGEROUS_TAGS.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    clean = clean.replace(regex, '');
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    clean = clean.replace(selfClosing, '');
  });

  // 3. Remove javascript: or vbscript: or data:text/html references
  clean = clean.replace(/href\s*=\s*["']\s*(javascript|vbscript|data:text\/html):[^"']*["']/gi, 'href="#"');
  clean = clean.replace(/xlink:href\s*=\s*["']\s*(javascript|vbscript|data:text\/html):[^"']*["']/gi, 'xlink:href="#"');

  // 4. Remove all on* event handlers (e.g. onload, onerror, onclick)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s+on[a-z]+\s*=\s*[^>\s]+/gi, '');

  // 5. Ensure valid SVG wrapper
  clean = clean.trim();
  if (!clean.startsWith('<svg')) {
    // If wrapped in markdown ```xml or ```svg, extract it
    const match = clean.match(/<svg[\s\S]*<\/svg>/i);
    if (match) {
      clean = match[0];
    }
  }

  return clean;
}
