#!/usr/bin/env python3
"""
High-Fidelity Word Document (.docx) Parsing, Rendering & Format Preservation Engine
Extracts text, headings, lists, tables, embedded images, hyperlinks, code snippets,
formatting, page breaks, and generates sanitized Web HTML and printable PDF/HTML.
"""

import os
import sys
import json
import html
import re
import zipfile
import xml.etree.ElementTree as ET

# WordprocessingML Namespaces
NS = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
}

def detect_code_language(code_text):
    """Detect language of code block for syntax badge."""
    if not code_text or len(code_text.strip()) < 5:
        return 'text'
    
    # Java indicators
    if re.search(r'\b(public\s+class|public\s+void|private\s+|WebDriver|@Test|System\.out\.println)\b', code_text):
        return 'java'
    # TypeScript / JavaScript indicators
    if re.search(r'\b(interface\s+[A-Z]|type\s+[A-Z]|const\s+|let\s+|async\s+function|export\s+|Promise<|=>)\b', code_text):
        return 'typescript'
    # Python indicators
    if re.search(r'\b(def\s+\w+\(|class\s+\w+:|import\s+\w+|from\s+\w+\s+import|self\.)\b', code_text):
        return 'python'
    # JSON indicators
    trimmed = code_text.strip()
    if (trimmed.startswith('{') and trimmed.endswith('}')) or (trimmed.startswith('[') and trimmed.endswith(']')):
        if re.search(r'"[^"]+"\s*:\s*', code_text):
            return 'json'
    # Shell indicators
    if re.search(r'\b(npm\s+|npx\s+|curl\s+|docker\s+|git\s+|pip\s+|chmod\s+)\b', code_text):
        return 'bash'
    
    return 'code'

def sanitize_html(html_str):
    """Strip malicious tags, attributes and protocols."""
    if not html_str:
        return ""
    # Remove script, iframe, object, embed, form tags
    html_str = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>', '', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>', '', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>', '', html_str, flags=re.IGNORECASE)
    
    # Remove inline event handlers (onclick, onerror, onload, etc.)
    html_str = re.sub(r'\s+on[a-zA-Z]+\s*=\s*(?:\"[^\"]*\"|\'[^\']*\'|[^\s>]+)', '', html_str, flags=re.IGNORECASE)
    
    # Remove javascript: and data:text/html URIs in href and src
    html_str = re.sub(r'href\s*=\s*[\"\']\s*(?:javascript|data):[^\"]*[\"\']', 'href="#"', html_str, flags=re.IGNORECASE)
    html_str = re.sub(r'src\s*=\s*[\"\']\s*(?:javascript|data:text/html):[^\"]*[\"\']', 'src=""', html_str, flags=re.IGNORECASE)
    
    return html_str

class DocxConverter:
    def __init__(self, docx_path, lesson_id, output_images_dir, public_images_base_url):
        self.docx_path = docx_path
        self.lesson_id = lesson_id or 'unassigned'
        self.output_images_dir = output_images_dir
        self.public_images_base_url = public_images_base_url.rstrip('/')
        
        self.rels = {}  # rId -> target
        self.extracted_images = []
        self.metadata = {
            'headings_count': 0,
            'paragraphs_count': 0,
            'tables_count': 0,
            'images_count': 0,
            'code_blocks_count': 0,
            'lists_count': 0,
            'links_count': 0,
            'word_count': 0,
        }

    def parse(self):
        if not os.path.exists(self.docx_path):
            raise FileNotFoundError(f"File not found: {self.docx_path}")

        # Check zip magic bytes (PK\x03\x04)
        with open(self.docx_path, 'rb') as f:
            header = f.read(4)
            if header != b'PK\x03\x04':
                raise ValueError("Invalid document: Missing PK ZIP signature")

        with zipfile.ZipFile(self.docx_path, 'r') as z:
            namelist = z.namelist()
            if 'word/document.xml' not in namelist:
                raise ValueError("Corrupted DOCX: 'word/document.xml' missing")

            # 1. Parse relationships
            if 'word/_rels/document.xml.rels' in namelist:
                rels_xml = z.read('word/_rels/document.xml.rels')
                self._parse_rels(rels_xml)

            # 2. Extract embedded images
            self._extract_images(z)

            # 3. Parse main document XML
            doc_xml = z.read('word/document.xml')
            html_body = self._parse_document(doc_xml)

            # 4. Generate printable HTML wrapper
            print_html = self._generate_printable_html(html_body)

            return {
                'html': sanitize_html(html_body),
                'print_html': print_html,
                'extracted_images': self.extracted_images,
                'metadata': self.metadata,
            }

    def _parse_rels(self, rels_xml):
        try:
            root = ET.fromstring(rels_xml)
            for rel in root.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
                r_id = rel.get('Id')
                target = rel.get('Target')
                if r_id and target:
                    self.rels[r_id] = target
        except Exception as e:
            sys.stderr.write(f"Warning parsing rels: {e}\n")

    def _extract_images(self, z):
        os.makedirs(self.output_images_dir, exist_ok=True)
        for item in z.namelist():
            if item.startswith('word/media/'):
                filename = os.path.basename(item)
                safe_name = f"{self.lesson_id}_{filename}"
                dest_path = os.path.join(self.output_images_dir, safe_name)
                
                with open(dest_path, 'wb') as f_out:
                    f_out.write(z.read(item))
                
                public_url = f"{self.public_images_base_url}/{safe_name}"
                self.extracted_images.append({
                    'original': item,
                    'filename': filename,
                    'storage_path': dest_path,
                    'public_url': public_url,
                })
                self.metadata['images_count'] += 1

    def _get_image_url_for_rel(self, r_id):
        target = self.rels.get(r_id, '')
        if not target:
            return None
        target_fname = os.path.basename(target)
        for img in self.extracted_images:
            if img['filename'] == target_fname:
                return img['public_url']
        return None

    def _parse_document(self, doc_xml):
        root = ET.fromstring(doc_xml)
        body = root.find('w:body', NS)
        if body is None:
            return "<p>Empty document.</p>"

        output_fragments = []
        list_stack = [] # tracks active lists: list of dicts {'type': 'ul'|'ol', 'level': int}
        code_buffer = [] # collects consecutive monospace paragraphs

        def flush_code():
            nonlocal code_buffer
            if code_buffer:
                raw_code = '\n'.join(code_buffer)
                lang = detect_code_language(raw_code)
                self.metadata['code_blocks_count'] += 1
                escaped = html.escape(raw_code)
                code_html = f'''<div class="my-6 rounded-2xl overflow-hidden border border-neutral-700/80 bg-[#121316] shadow-xl group">
  <div class="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 text-xs font-mono text-neutral-400 select-none">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
      <span class="font-bold text-neutral-200 uppercase tracking-wider">{lang}</span>
    </div>
    <button type="button" onclick="navigator.clipboard.writeText(this.closest('.group').querySelector('code').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy Code', 2000)" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-[11px] font-sans">
      Copy Code
    </button>
  </div>
  <pre class="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-neutral-200 whitespace-pre"><code class="language-{lang}">{escaped}</code></pre>
</div>'''
                output_fragments.append(code_html)
                code_buffer = []

        def close_lists_to_level(target_level=0):
            nonlocal list_stack
            while len(list_stack) > target_level:
                top = list_stack.pop()
                output_fragments.append(f"</{top['type']}>")

        for elem in body:
            tag = elem.tag.split('}')[-1]

            # Paragraph or Heading or List item or Code block
            if tag == 'p':
                p_text, p_html, is_code, is_heading, h_level, is_list, list_type, list_level, has_page_break = self._parse_paragraph(elem)
                
                # Check for page break
                if has_page_break:
                    flush_code()
                    close_lists_to_level(0)
                    output_fragments.append('''<div class="my-8 flex items-center justify-center gap-4 text-neutral-500 docx-page-break select-none">
  <div class="h-px bg-neutral-800 flex-1"></div>
  <span class="text-[10px] font-mono tracking-widest uppercase bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-neutral-400">Page Break</span>
  <div class="h-px bg-neutral-800 flex-1"></div>
</div>''')

                # Accumulate or flush code
                if is_code and not is_heading:
                    close_lists_to_level(0)
                    code_buffer.append(p_text)
                    continue
                else:
                    flush_code()

                if is_heading:
                    close_lists_to_level(0)
                    self.metadata['headings_count'] += 1
                    h_tag = f"h{h_level}"
                    h_id = re.sub(r'[^a-z0-9]+', '-', p_text.lower()).strip('-') or f"section-{self.metadata['headings_count']}"
                    
                    classes = {
                        1: "text-2xl font-extrabold text-white mt-8 mb-4 tracking-tight border-b border-neutral-800 pb-2",
                        2: "text-xl font-bold text-white mt-6 mb-3 tracking-tight",
                        3: "text-lg font-semibold text-neutral-200 mt-5 mb-2",
                        4: "text-base font-semibold text-neutral-300 mt-4 mb-2",
                    }.get(h_level, "text-base font-semibold text-neutral-300 mt-4 mb-2")
                    
                    output_fragments.append(f'<{h_tag} id="{h_id}" class="{classes}">{p_html}</{h_tag}>')
                    continue

                if is_list:
                    # If switching list type (e.g. from bullet to numbered or vice versa), flush previous list
                    if list_stack and list_stack[-1]['type'] != list_type:
                        close_lists_to_level(list_level)

                    # Manage list nesting
                    while len(list_stack) < list_level + 1:
                        curr_lvl = len(list_stack)
                        list_stack.append({'type': list_type, 'level': curr_lvl})
                        cls = "list-disc pl-6 space-y-1 my-2 text-slate-300" if list_type == 'ul' else "list-decimal pl-6 space-y-1 my-2 text-slate-300"
                        output_fragments.append(f'<{list_type} class="{cls}">')
                    
                    while len(list_stack) > list_level + 1:
                        top = list_stack.pop()
                        output_fragments.append(f"</{top['type']}>")

                    self.metadata['lists_count'] += 1
                    output_fragments.append(f'<li class="leading-relaxed">{p_html}</li>')
                    continue
                else:
                    close_lists_to_level(0)

                # Normal Paragraph
                if p_html.strip():
                    self.metadata['paragraphs_count'] += 1
                    self.metadata['word_count'] += len(p_text.split())
                    output_fragments.append(f'<p class="my-3 leading-relaxed text-slate-300 dark:text-neutral-300">{p_html}</p>')

            # Table
            elif tag == 'tbl':
                flush_code()
                close_lists_to_level(0)
                table_html = self._parse_table(elem)
                output_fragments.append(table_html)

            # Fallback for unexpected direct tags (e.g. sdt, sectPr)
            else:
                pass

        flush_code()
        close_lists_to_level(0)

        return '\n'.join(output_fragments)

    def _parse_paragraph(self, p_elem):
        """Parse paragraph elements: runs, formatting, links, drawings, code detection."""
        p_text_parts = []
        p_html_parts = []
        
        is_code = False
        is_heading = False
        h_level = 2
        is_list = False
        list_type = 'ul'
        list_level = 0
        has_page_break = False

        # Inspect pPr (paragraph properties)
        pPr = p_elem.find('w:pPr', NS)
        align_class = ""
        
        if pPr is not None:
            # Check style (Heading1, Heading2, Code, etc.)
            pStyle = pPr.find('w:pStyle', NS)
            if pStyle is not None:
                style_val = pStyle.get(f'{{{NS["w"]}}}val', '') or ''
                style_lower = style_val.lower()
                if 'heading1' in style_lower or 'title' in style_lower:
                    is_heading = True
                    h_level = 1
                elif 'heading2' in style_lower:
                    is_heading = True
                    h_level = 2
                elif 'heading3' in style_lower:
                    is_heading = True
                    h_level = 3
                elif 'heading4' in style_lower:
                    is_heading = True
                    h_level = 4
                elif 'code' in style_lower or 'source' in style_lower or 'preformatted' in style_lower:
                    is_code = True

            # Check list numbering properties
            numPr = pPr.find('w:numPr', NS)
            if numPr is not None:
                is_list = True
                ilvl = numPr.find('w:ilvl', NS)
                if ilvl is not None:
                    try:
                        list_level = int(ilvl.get(f'{{{NS["w"]}}}val', '0'))
                    except ValueError:
                        list_level = 0
                numId = numPr.find('w:numId', NS)
                # By default treat as unordered unless indicated or we check definitions
                list_type = 'ul'

            # Check text alignment
            jc = pPr.find('w:jc', NS)
            if jc is not None:
                val = jc.get(f'{{{NS["w"]}}}val', '')
                if val == 'center':
                    align_class = "text-center"
                elif val == 'right':
                    align_class = "text-right"
                elif val in ('both', 'justify'):
                    align_class = "text-justify"

        # Check children of paragraph
        for child in p_elem:
            ctag = child.tag.split('}')[-1]

            # Direct page break in paragraph
            if ctag == 'r':
                for sub in child:
                    subtag = sub.tag.split('}')[-1]
                    if subtag == 'br':
                        br_type = sub.get(f'{{{NS["w"]}}}type', '')
                        if br_type == 'page':
                            has_page_break = True

            # Text Run
            if ctag == 'r':
                r_text, r_html, r_is_monospace = self._parse_run(child)
                p_text_parts.append(r_text)
                p_html_parts.append(r_html)
                if r_is_monospace:
                    is_code = True

            # Hyperlink
            elif ctag == 'hyperlink':
                r_id = child.get(f'{{{NS["r"]}}}id', '')
                url = self.rels.get(r_id, '#')
                link_text_parts = []
                for sub in child.findall('w:r', NS):
                    t, h, _ = self._parse_run(sub)
                    link_text_parts.append(h)
                
                link_content = ''.join(link_text_parts) or url
                p_text_parts.append(link_content)
                self.metadata['links_count'] += 1
                p_html_parts.append(f'<a href="{html.escape(url)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">{link_content}</a>')

            # Drawing (Embedded Image)
            elif ctag == 'drawing':
                img_html = self._parse_drawing(child)
                if img_html:
                    p_html_parts.append(img_html)

        full_text = ''.join(p_text_parts).strip()
        full_html = ''.join(p_html_parts)

        # Additional list heuristic: bullet points or numbered prefix
        if not is_list and not is_heading:
            if full_text.startswith(('• ', '- ', '* ', '– ')):
                is_list = True
                list_type = 'ul'
                full_html = re.sub(r'^(?:[•\-*–]\s+)+', '', full_html)
            elif re.match(r'^\d+[\.\)]\s+', full_text):
                is_list = True
                list_type = 'ol'
                full_html = re.sub(r'^\d+[\.\)]\s+', '', full_html)

        if align_class and full_html:
            full_html = f'<span class="{align_class} block">{full_html}</span>'

        return full_text, full_html, is_code, is_heading, h_level, is_list, list_type, list_level, has_page_break

    def _parse_run(self, r_elem):
        """Parse text run properties: bold, italic, underline, highlight, monospace."""
        rPr = r_elem.find('w:rPr', NS)
        is_bold = False
        is_italic = False
        is_underline = False
        is_strike = False
        is_highlight = False
        is_monospace = False
        color_val = None

        if rPr is not None:
            if rPr.find('w:b', NS) is not None:
                is_bold = True
            if rPr.find('w:i', NS) is not None:
                is_italic = True
            if rPr.find('w:u', NS) is not None:
                is_underline = True
            if rPr.find('w:strike', NS) is not None:
                is_strike = True
            if rPr.find('w:highlight', NS) is not None:
                is_highlight = True
            
            rFonts = rPr.find('w:rFonts', NS)
            if rFonts is not None:
                font = (rFonts.get(f'{{{NS["w"]}}}ascii', '') or rFonts.get(f'{{{NS["w"]}}}hAnsi', '')).lower()
                if any(mono in font for mono in ['courier', 'consolas', 'monaco', 'fira', 'menlo', 'source code']):
                    is_monospace = True

            color = rPr.find('w:color', NS)
            if color is not None:
                cval = color.get(f'{{{NS["w"]}}}val')
                if cval and cval.lower() != 'auto':
                    color_val = f"#{cval}"

        # Collect text fragments in this run
        texts = []
        for t in r_elem.findall('w:t', NS):
            texts.append(t.text or '')
        
        # Check for inline line break <w:br>
        for _ in r_elem.findall('w:br', NS):
            texts.append('\n')

        raw_text = ''.join(texts)
        if not raw_text:
            # Check for embedded drawing inside run
            drawing = r_elem.find('w:drawing', NS)
            if drawing is not None:
                return "", self._parse_drawing(drawing), False
            return "", "", False

        escaped = html.escape(raw_text)

        # Wrap with inline formatting
        formatted = escaped
        if is_monospace:
            formatted = f'<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-400 font-mono text-[11px] border border-neutral-700/60">{formatted}</code>'
        if is_bold:
            formatted = f'<strong>{formatted}</strong>'
        if is_italic:
            formatted = f'<em>{formatted}</em>'
        if is_underline:
            formatted = f'<u>{formatted}</u>'
        if is_strike:
            formatted = f'<s>{formatted}</s>'
        if is_highlight:
            formatted = f'<mark class="bg-amber-400/20 text-amber-300 px-1 py-0.5 rounded">{formatted}</mark>'
        if color_val and not is_monospace:
            formatted = f'<span style="color: {color_val};">{formatted}</span>'

        return raw_text, formatted, is_monospace

    def _parse_drawing(self, drawing_elem):
        """Extract image reference from drawing element."""
        # Find blip element
        blip = drawing_elem.find('.//a:blip', NS)
        if blip is None:
            return ""
        
        embed_id = blip.get(f'{{{NS["r"]}}}embed')
        if not embed_id:
            return ""

        img_url = self._get_image_url_for_rel(embed_id)
        if not img_url:
            return ""

        # Check for docPr description / caption
        docPr = drawing_elem.find('.//wp:docPr', NS)
        title = docPr.get('title', '') if docPr is not None else ''
        descr = docPr.get('descr', '') if docPr is not None else ''
        caption = title or descr or "Extracted Lesson Asset"

        return f'''<figure class="my-6 text-center select-none">
  <img src="{img_url}" alt="{html.escape(caption)}" class="rounded-xl shadow-xl max-w-full h-auto mx-auto border border-neutral-700/60 transition-transform hover:scale-[1.01]" loading="lazy" />
  <figcaption class="text-xs text-neutral-400 mt-2.5 font-medium italic">{html.escape(caption)}</figcaption>
</figure>'''

    def _parse_table(self, tbl_elem):
        """Parse Word table: rows, cells, headers, borders, and background shading."""
        self.metadata['tables_count'] += 1
        rows = tbl_elem.findall('w:tr', NS)
        if not rows:
            return ""

        table_rows_html = []
        is_first_row = True

        for row in rows:
            cells = row.findall('w:tc', NS)
            cell_tags = []
            
            # Check if this row is header
            is_header = is_first_row or (row.find('w:trPr/w:tblHeader', NS) is not None)

            for cell in cells:
                cell_text_parts = []
                for p in cell.findall('w:p', NS):
                    _, p_html, _, _, _, _, _, _, _ = self._parse_paragraph(p)
                    if p_html.strip():
                        cell_text_parts.append(p_html)
                
                content = '<br/>'.join(cell_text_parts) or '&nbsp;'
                
                # Check cell shading
                shd = cell.find('w:tcPr/w:shd', NS)
                bg_style = ""
                if shd is not None:
                    fill = shd.get(f'{{{NS["w"]}}}fill')
                    if fill and fill.lower() not in ('auto', 'none', 'ffffff'):
                        bg_style = f"background-color: #{fill};"

                tag = "th" if is_header else "td"
                cls = "px-4 py-3 border border-neutral-700 text-left font-bold text-white bg-neutral-900/80" if is_header else "px-4 py-3 border border-neutral-800 text-neutral-300 text-xs leading-relaxed"
                style_attr = f' style="{bg_style}"' if bg_style else ''

                cell_tags.append(f'<{tag} class="{cls}"{style_attr}>{content}</{tag}>')

            row_content = ''.join(cell_tags)
            table_rows_html.append(f'<tr>{row_content}</tr>')
            is_first_row = False

        return f'''<div class="overflow-x-auto my-6 rounded-2xl border border-neutral-700/80 shadow-lg">
  <table class="w-full text-left border-collapse text-xs bg-neutral-950/60">
    <tbody>
      {''.join(table_rows_html)}
    </tbody>
  </table>
</div>'''

    def _generate_printable_html(self, content_html):
        """Generate high-fidelity printable HTML with CSS paged media."""
        return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lesson Document Print Preview</title>
  <style>
    @page {{
      size: A4;
      margin: 20mm;
      @bottom-right {{
        content: counter(page);
      }}
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 20px;
    }}
    h1 {{ font-size: 20pt; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 6px; margin-top: 24px; }}
    h2 {{ font-size: 16pt; color: #0369a1; margin-top: 20px; }}
    h3 {{ font-size: 13pt; color: #334155; margin-top: 16px; }}
    p {{ margin: 8px 0; text-align: justify; }}
    table {{ width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }}
    th, td {{ border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }}
    th {{ background-color: #f1f5f9; font-weight: bold; }}
    pre {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 9pt; overflow-x: auto; }}
    img {{ max-width: 100%; height: auto; display: block; margin: 12px auto; }}
    .docx-page-break {{ page-break-after: always; height: 0; margin: 0; border: none; }}
    @media print {{
      body {{ padding: 0; }}
      button {{ display: none !important; }}
    }}
  </style>
</head>
<body>
  {content_html}
</body>
</html>'''

def main():
    if len(sys.argv) < 5:
        print(json.dumps({
            'success': False,
            'error': 'Usage: docx_engine.py <docx_path> <lesson_id> <output_images_dir> <public_images_base_url>'
        }))
        sys.exit(1)

    docx_path = sys.argv[1]
    lesson_id = sys.argv[2]
    output_images_dir = sys.argv[3]
    public_images_base_url = sys.argv[4]

    try:
        converter = DocxConverter(docx_path, lesson_id, output_images_dir, public_images_base_url)
        res = converter.parse()
        print(json.dumps({
            'success': True,
            'data': res
        }))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
