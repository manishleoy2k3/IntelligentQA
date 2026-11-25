/**
 * IntelligentQA File Parser
 * Extracts text from requirements files: Word (.docx), Excel (.xlsx, .xls, .csv), PDF (.pdf), and Text (.txt, .md)
 * Runs client-side in the browser without external heavy dependencies.
 */

export interface ParsedRequirementFile {
  fileName: string;
  fileSize: number;
  fileType: string;
  extractedText: string;
  summary: string;
  itemCount: number;
}

/**
 * Main parser dispatcher based on file extension and MIME type
 */
export async function parseRequirementsFile(file: File): Promise<ParsedRequirementFile> {
  const fileName = file.name;
  const fileSize = file.size;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let extractedText = '';

  try {
    if (ext === 'txt' || ext === 'md' || ext === 'json' || ext === 'csv') {
      extractedText = await parseTextFile(file);
    } else if (ext === 'docx') {
      extractedText = await parseDocxFile(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      extractedText = await parseExcelFile(file);
    } else if (ext === 'pptx' || ext === 'ppt') {
      extractedText = await parsePptxFile(file);
    } else if (ext === 'pdf') {
      extractedText = await parsePdfFile(file);
    } else {
      // General binary / text fallback
      extractedText = await parseTextFile(file);
    }
  } catch (err) {
    console.warn(`Direct parser failed for ${fileName}, applying fallback extractor:`, err);
    extractedText = await parseRawFallback(file);
  }

  // Clean and sanitize the extracted text
  const cleanedText = sanitizeExtractedText(extractedText);
  const lines = cleanedText.split('\n').filter((l) => l.trim().length > 0);
  const itemCount = Math.max(
    1,
    lines.filter((l) => l.match(/^[-*#0-9]/) || l.includes(':')).length
  );

  return {
    fileName,
    fileSize,
    fileType: ext.toUpperCase(),
    extractedText: cleanedText,
    summary: `Extracted ${lines.length} lines (~${itemCount} requirement items) from ${fileName}`,
    itemCount,
  };
}

/**
 * Plain text / Markdown / CSV parser
 */
async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Word .docx parser
 * DOCX is a zip archive containing word/document.xml with <w:p> and <w:t> tags
 * Extracts text with structured paragraph, heading, and table references.
 */
async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const textFromZip = await extractTextFromZip(arrayBuffer, ['word/document.xml']);

  if (textFromZip) {
    return extractStructuredDocxText(textFromZip);
  }

  // Fallback: scan printable text and w:t tags from raw binary buffer
  return extractDocxRegexFallback(arrayBuffer);
}

/**
 * Parses Word document.xml into structured text with paragraph and heading references
 */
function extractStructuredDocxText(xml: string): string {
  const outputLines: string[] = [];
  let paragraphCount = 0;
  let tableCount = 0;

  // Split by tables and paragraphs
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  const pMatches = xml.match(pRegex);

  if (pMatches && pMatches.length > 0) {
    for (const pXml of pMatches) {
      // Extract text content inside <w:t> tags
      const tMatches = pXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g);
      if (!tMatches || tMatches.length === 0) continue;

      const pText = tMatches
        .map((m) => m.replace(/<[^>]+>/g, ''))
        .join('')
        .trim();

      if (!pText) continue;

      paragraphCount++;

      // Check if this paragraph is a heading
      const headingMatch = pXml.match(/<w:pStyle[^>]*w:val="Heading(\d+)"/i);
      const isHeading = !!headingMatch || (/<w:b\/>/i.test(pXml) && pText.length < 80);

      if (headingMatch) {
        outputLines.push(`[Heading ${headingMatch[1]}: ${pText}]`);
      } else if (isHeading && paragraphCount <= 3) {
        outputLines.push(`[Heading: ${pText}]`);
      } else {
        outputLines.push(`[Paragraph ${paragraphCount}] ${pText}`);
      }
    }
  }

  if (outputLines.length > 0) {
    return outputLines.join('\n\n');
  }

  return extractXmlText(xml);
}

/**
 * Excel .xlsx / .xls parser
 * XLSX is a zip containing xl/sharedStrings.xml and xl/worksheets/sheet1.xml
 * Extracts rows tagged with sheet name and row numbers for precise source tracing.
 */
async function parseExcelFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') {
    const raw = await parseTextFile(file);
    const csvLines = raw.split('\n').filter((l) => l.trim().length > 0);
    return csvLines
      .map((line, idx) => `[Sheet: Sheet1, Row: ${idx + 1}] ${line.trim()}`)
      .join('\n');
  }

  const arrayBuffer = await file.arrayBuffer();

  // Try reading workbook.xml for sheet names
  const workbookXml = await extractTextFromZip(arrayBuffer, ['xl/workbook.xml']);
  let sheetName = 'Sheet1';
  if (workbookXml) {
    const sheetNameMatch = workbookXml.match(/<sheet[^>]*name="([^"]+)"/i);
    if (sheetNameMatch && sheetNameMatch[1]) {
      sheetName = sheetNameMatch[1];
    }
  }

  // Extract shared strings
  const sharedStringsXml = await extractTextFromZip(arrayBuffer, ['xl/sharedStrings.xml']);
  const sharedStrings: string[] = [];
  if (sharedStringsXml) {
    const siMatches = sharedStringsXml.match(/<si[\s>][\s\S]*?<\/si>/g);
    if (siMatches) {
      for (const si of siMatches) {
        const tMatches = si.match(/<t[^>]*>([\s\S]*?)<\/t>/g);
        if (tMatches) {
          sharedStrings.push(tMatches.map((t) => t.replace(/<[^>]+>/g, '')).join(''));
        } else {
          sharedStrings.push('');
        }
      }
    }
  }

  // Extract worksheet XML (try sheet1.xml)
  const sheetXml = await extractTextFromZip(arrayBuffer, ['xl/worksheets/sheet1.xml']);
  if (sheetXml) {
    const rowMatches = sheetXml.match(/<row[^>]*r="(\d+)"[\s\S]*?<\/row>/g);
    if (rowMatches && rowMatches.length > 0) {
      const formattedRows: string[] = [];
      for (const rowXml of rowMatches) {
        const rowNumMatch = rowXml.match(/<row[^>]*r="(\d+)"/);
        const rowNum = rowNumMatch ? rowNumMatch[1] : '';

        // Extract cells in this row
        const cellMatches = rowXml.match(/<c[^>]*>[\s\S]*?<\/c>/g);
        if (!cellMatches) continue;

        const cellValues: string[] = [];
        for (const cellXml of cellMatches) {
          const isSharedString = /t="s"/i.test(cellXml);
          const valMatch = cellXml.match(/<v>([^<]+)<\/v>/);
          if (valMatch) {
            const rawVal = valMatch[1];
            if (isSharedString) {
              const idx = parseInt(rawVal, 10);
              if (!isNaN(idx) && sharedStrings[idx] !== undefined) {
                cellValues.push(sharedStrings[idx].trim());
              }
            } else {
              cellValues.push(rawVal.trim());
            }
          } else {
            const inlineMatch = cellXml.match(/<is><t[^>]*>([^<]+)<\/t><\/is>/);
            if (inlineMatch) {
              cellValues.push(inlineMatch[1].trim());
            }
          }
        }

        const rowText = cellValues.filter(Boolean).join(' | ');
        if (rowText) {
          formattedRows.push(`[Sheet: ${sheetName}, Row: ${rowNum}] ${rowText}`);
        }
      }

      if (formattedRows.length > 0) {
        return formattedRows.join('\n');
      }
    }
  }

  // Fallback to shared strings if row parsing was empty
  if (sharedStrings.length > 0) {
    return sharedStrings
      .filter((s) => s.trim().length > 0)
      .map((s, idx) => `[Sheet: ${sheetName}, Row: ${idx + 1}] ${s.trim()}`)
      .join('\n');
  }

  // Binary Fallback
  const fallback = extractExcelRegexFallback(arrayBuffer);
  return fallback || (await parseTextFile(file));
}

/**
 * PowerPoint .pptx / .ppt parser
 * PPTX is a zip containing ppt/slides/slide1.xml, slide2.xml, etc. with <a:t> text tags
 */
async function parsePptxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Target slide XMLs
  const slideTargets = [
    'ppt/slides/slide1.xml',
    'ppt/slides/slide2.xml',
    'ppt/slides/slide3.xml',
    'ppt/slides/slide4.xml',
    'ppt/slides/slide5.xml',
    'ppt/slides/slide6.xml',
    'ppt/slides/slide7.xml',
    'ppt/slides/slide8.xml',
    'ppt/slides/slide9.xml',
    'ppt/slides/slide10.xml',
    'ppt/slides/slide11.xml',
    'ppt/slides/slide12.xml',
  ];

  const texts: string[] = [];
  for (const target of slideTargets) {
    const textFromZip = await extractTextFromZip(arrayBuffer, [target]);
    if (textFromZip) {
      texts.push(extractXmlText(textFromZip));
    }
  }

  if (texts.length > 0) {
    return texts.join('\n\n--- Slide ---\n\n');
  }

  // Fallback: extract printable strings from raw buffer
  return extractDocxRegexFallback(arrayBuffer);
}

/**
 * PDF parser
 * Extracts text stream contents from standard PDF structure
 */
async function parsePdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const decoder = new TextDecoder('latin1');
  const raw = decoder.decode(arrayBuffer);

  const textChunks: string[] = [];

  // Match BT ... ET text blocks
  const btBlocks = raw.match(/BT[\s\S]*?ET/g);
  if (btBlocks && btBlocks.length > 0) {
    for (const block of btBlocks) {
      // Match (string) Tj or [(string)(string)] TJ
      const tjMatches = block.match(/\(([^)]+)\)\s*Tj/g);
      if (tjMatches) {
        for (const m of tjMatches) {
          const content = m.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
          textChunks.push(cleanPdfString(content));
        }
      }

      const tjArrayMatches = block.match(/\[([^\]]+)\]\s*TJ/g);
      if (tjArrayMatches) {
        for (const m of tjArrayMatches) {
          const innerMatches = m.match(/\(([^)]+)\)/g);
          if (innerMatches) {
            const combined = innerMatches.map((im) => im.slice(1, -1)).join('');
            textChunks.push(cleanPdfString(combined));
          }
        }
      }
    }
  }

  if (textChunks.length > 0) {
    return textChunks.join(' ').replace(/\s{2,}/g, '\n');
  }

  // Fallback: extract printable ASCII strings of 4+ characters
  return extractPrintableStrings(raw);
}

/**
 * Helper: Extract text from zip entry using DecompressionStream or raw scan
 */
async function extractTextFromZip(
  buffer: ArrayBuffer,
  targetNames: string[]
): Promise<string | null> {
  try {
    const bytes = new Uint8Array(buffer);
    let offset = 0;

    while (offset < bytes.length - 30) {
      // Check local file header signature: PK\x03\x04
      if (
        bytes[offset] === 0x50 &&
        bytes[offset + 1] === 0x4b &&
        bytes[offset + 2] === 0x03 &&
        bytes[offset + 3] === 0x04
      ) {
        const method = bytes[offset + 8] | (bytes[offset + 9] << 8);
        const compSize =
          bytes[offset + 18] |
          (bytes[offset + 19] << 8) |
          (bytes[offset + 20] << 16) |
          (bytes[offset + 21] << 24);
        const nameLen = bytes[offset + 26] | (bytes[offset + 27] << 8);
        const extraLen = bytes[offset + 28] | (bytes[offset + 29] << 8);

        const nameBytes = bytes.slice(offset + 30, offset + 30 + nameLen);
        const fileName = new TextDecoder().decode(nameBytes);

        const dataStart = offset + 30 + nameLen + extraLen;
        const dataEnd = dataStart + compSize;

        if (targetNames.some((t) => fileName.endsWith(t) || fileName === t)) {
          const compData = bytes.slice(dataStart, dataEnd);

          if (method === 0) {
            // Uncompressed
            return new TextDecoder().decode(compData);
          } else if (method === 8 && typeof DecompressionStream !== 'undefined') {
            // Deflate compression
            try {
              const ds = new DecompressionStream('deflate-raw');
              const writer = ds.writable.getWriter();
              writer.write(compData);
              writer.close();
              const response = new Response(ds.readable);
              const decompressed = await response.text();
              return decompressed;
            } catch (decompErr) {
              console.warn('DecompressionStream error:', decompErr);
            }
          }
        }

        offset = dataEnd;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.warn('Error reading zip archive:', err);
  }
  return null;
}

/**
 * Extracts text from XML document (extracts <w:t> or <t> nodes)
 */
function extractXmlText(xml: string): string {
  // Replace paragraph endings with newline
  const withLineBreaks = xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<\/w:tr>/g, '\n')
    .replace(/<\/row>/g, '\n');

  // Match all <w:t>, <t>, or <a:t> nodes
  const textMatches = withLineBreaks.match(/<(w:t|t|a:t)[^>]*>([\s\S]*?)<\/(w:t|t|a:t)>/g);
  if (textMatches) {
    return textMatches
      .map((m) => m.replace(/<[^>]+>/g, ''))
      .join(' ')
      .replace(/\s{2,}/g, '\n');
  }

  // General XML tag strip
  return withLineBreaks
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function extractDocxRegexFallback(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(buffer);
  const matches = raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (matches && matches.length > 0) {
    return matches
      .map((m) => m.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .join('\n');
  }
  return extractPrintableStrings(raw);
}

function extractExcelRegexFallback(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(buffer);
  const matches = raw.match(/<t[^>]*>([^<]+)<\/t>/g);
  if (matches && matches.length > 0) {
    return matches
      .map((m) => m.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .join('\n');
  }
  return extractPrintableStrings(raw);
}

function cleanPdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '\t');
}

function extractPrintableStrings(raw: string): string {
  const matches = raw.match(/[A-Za-z0-9 ,.;:!?'"()\-_\n\r]{12,}/g);
  if (matches) {
    return matches
      .map((m) => m.trim())
      .filter((m) => !m.includes('Font') && !m.includes('Type') && !m.includes('/'))
      .slice(0, 100)
      .join('\n');
  }
  return '';
}

async function parseRawFallback(file: File): Promise<string> {
  const text = await parseTextFile(file);
  return extractPrintableStrings(text);
}

function sanitizeExtractedText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ' ') // Strip unprintable control chars
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
