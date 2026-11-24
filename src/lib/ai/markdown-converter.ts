/**
 * Converts Markdown / Structured AI text into valid HTML
 * compatible with Tiptap editor schema (StarterKit, CodeBlockLowlight, Tables, Callouts)
 */

export function markdownToTiptapHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // 1. Process fenced code blocks with language: ```typescript ... ```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const cleanLang = lang?.trim() || 'typescript';
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code class="language-${cleanLang}">${escapedCode}</code></pre>`;
  });

  // 2. Process callout quotes (GitHub style > [!TIP], > [!NOTE], > [!WARNING], > [!IMPORTANT], > [!BEST-PRACTICE])
  html = html.replace(/^>\s*\[!(NOTE|INFO|TIP|WARNING|IMPORTANT|CAUTION|BEST-PRACTICE)\]\s*\n((?:>.*(?:\n|$))*)/gim, (_match, type, content) => {
    const cleanType = type.toLowerCase() === 'note' ? 'info' : 
                      type.toLowerCase() === 'caution' ? 'warning' :
                      type.toLowerCase();
    const cleanContent = content.replace(/^>\s?/gm, '').trim();
    return `<div data-type="callout" data-callout-type="${cleanType}"><p>${cleanContent}</p></div>`;
  });

  // 3. Process headings: ####, ###, ##, #
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // 4. Process bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. Process inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 6. Process unordered lists
  html = html.replace(/(?:^[ \t]*[-*] .*(?:\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^[ \t]*[-*] /, '').trim()}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  // 7. Process ordered lists
  html = html.replace(/(?:^[ \t]*\d+\. .*(?:\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^[ \t]*\d+\. /, '').trim()}</li>`)
      .join('');
    return `<ol>${items}</ol>`;
  });

  // 8. Process Markdown tables
  html = html.replace(/(?:^\|.*\|\n?)+/gm, (tableMatch) => {
    const lines = tableMatch.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return tableMatch;

    let tableHtml = '<table><tbody>';
    lines.forEach((line, index) => {
      // Skip separator row (|---|---|)
      if (line.match(/^\|[\s-:]+\|$/)) return;
      if (line.includes('---')) return;

      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      tableHtml += '<tr>';
      cells.forEach(cell => {
        const tag = index === 0 ? 'th' : 'td';
        tableHtml += `<${tag}>${cell}</${tag}>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // 9. Wrap remaining plain text paragraphs (lines not already wrapped in tags)
  const lines = html.split('\n');
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') || trimmed.startsWith('<h4') ||
        trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<li') ||
        trimmed.startsWith('<pre') || trimmed.startsWith('<div') || trimmed.startsWith('<table') ||
        trimmed.startsWith('</') || trimmed.endsWith('</pre>') || trimmed.endsWith('</div>') || trimmed.endsWith('</table>')) {
      return line;
    }
    return `<p>${trimmed}</p>`;
  });

  return formattedLines.filter(Boolean).join('\n');
}
