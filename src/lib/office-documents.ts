// Pure TypeScript/JavaScript Office Open XML (.xlsx & .docx) Builder & Parser
// Generates genuine, 100% compliant binary .xlsx and .docx files without third-party dependencies

function crc32(buf: Uint8Array): number {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

export function createZip(files: { name: string; data: Uint8Array | string }[]): Uint8Array {
  const encoder = new TextEncoder();
  const entries: { nameBuf: Uint8Array; crc: number; size: number; offset: number; local: Uint8Array; dataBuf: Uint8Array }[] = [];
  let offset = 0;
  let totalLength = 0;

  for (const f of files) {
    const dataBuf = typeof f.data === 'string' ? encoder.encode(f.data) : f.data;
    const nameBuf = encoder.encode(f.name);
    const crc = crc32(dataBuf);
    const size = dataBuf.length;

    const local = new Uint8Array(30 + nameBuf.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true); // version needed 2.0
    view.setUint16(6, 0, true);  // flags
    view.setUint16(8, 0, true);  // method 0 = STORED (uncompressed)
    view.setUint16(10, 0, true); // time
    view.setUint16(12, 0, true); // date
    view.setUint32(14, crc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, nameBuf.length, true);
    view.setUint16(28, 0, true);
    local.set(nameBuf, 30);

    entries.push({ nameBuf, crc, size, offset, local, dataBuf });
    offset += local.length + size;
    totalLength += local.length + size;
  }

  const centralOffset = offset;
  let centralSize = 0;
  const centralHeaders: Uint8Array[] = [];

  for (const e of entries) {
    const cd = new Uint8Array(46 + e.nameBuf.length);
    const view = new DataView(cd.buffer);
    view.setUint32(0, 0x02014b50, true); // Central directory file header signature
    view.setUint16(4, 20, true);         // Version made by (2.0)
    view.setUint16(6, 20, true);         // Version needed to extract (2.0)
    view.setUint16(8, 0, true);          // General purpose bit flag
    view.setUint16(10, 0, true);         // Compression method (0 = STORED)
    view.setUint16(12, 0, true);         // File last mod time
    view.setUint16(14, 0, true);         // File last mod date (2 bytes)
    view.setUint32(16, e.crc, true);     // CRC-32 (4 bytes at offset 16)
    view.setUint32(20, e.size, true);    // Compressed size (4 bytes at offset 20)
    view.setUint32(24, e.size, true);    // Uncompressed size (4 bytes at offset 24)
    view.setUint16(28, e.nameBuf.length, true); // File name length (2 bytes at offset 28)
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // File comment length
    view.setUint16(34, 0, true);         // Disk number start
    view.setUint16(36, 0, true);         // Internal file attributes
    view.setUint32(38, 0, true);         // External file attributes
    view.setUint32(42, e.offset, true);   // Relative offset of local file header (4 bytes at offset 42)
    cd.set(e.nameBuf, 46);

    centralHeaders.push(cd);
    centralSize += cd.length;
    totalLength += cd.length;
  }

  const eocd = new Uint8Array(22);
  const viewEocd = new DataView(eocd.buffer);
  viewEocd.setUint32(0, 0x06054b50, true);
  viewEocd.setUint16(4, 0, true);
  viewEocd.setUint16(6, 0, true);
  viewEocd.setUint16(8, entries.length, true);
  viewEocd.setUint16(10, entries.length, true);
  viewEocd.setUint32(12, centralSize, true);
  viewEocd.setUint32(16, centralOffset, true);
  viewEocd.setUint16(20, 0, true);
  totalLength += 22;

  const result = new Uint8Array(totalLength);
  let cur = 0;
  for (const e of entries) {
    result.set(e.local, cur);
    cur += e.local.length;
    result.set(e.dataBuf, cur);
    cur += e.dataBuf.length;
  }
  for (const cd of centralHeaders) {
    result.set(cd, cur);
    cur += cd.length;
  }
  result.set(eocd, cur);

  return result;
}

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Convert column index (0-based) to Excel letters (0 -> A, 1 -> B, ..., 11 -> L)
function colToLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export interface SampleGuideData {
  title: string;
  category: string;
  level: string;
  summary: string;
  overview: string;
  architecture: string;
  language: string;
  caption: string;
  code: string;
  bestPractices: string[];
  antiPatterns: string[];
  interviewTips: string;
}

// Generate genuine Microsoft Excel (.xlsx) file
export function generateOfficeExcel(trackName: string, sample: SampleGuideData): Uint8Array {
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="SDET Guides Template" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><color rgb="FF1E3A8A"/><name val="Calibri"/></font>
    <font><i/><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF334155"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="5">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;

  const columns = [
    { title: "Title [MANDATORY]", width: 32, mandatory: true },
    { title: "Category [MANDATORY]", width: 26, mandatory: true },
    { title: "Level [MANDATORY]", width: 18, mandatory: true },
    { title: "Summary [MANDATORY]", width: 40, mandatory: true },
    { title: "Overview [MANDATORY]", width: 55, mandatory: true },
    { title: "ArchitectureOrMechanism [OPTIONAL]", width: 40, mandatory: false },
    { title: "CodeLanguage [MANDATORY]", width: 18, mandatory: true },
    { title: "CodeCaption [OPTIONAL]", width: 35, mandatory: false },
    { title: "CodeSnippet [MANDATORY]", width: 60, mandatory: true },
    { title: "BestPractices [OPTIONAL]", width: 45, mandatory: false },
    { title: "AntiPatterns [OPTIONAL]", width: 45, mandatory: false },
    { title: "InterviewTips [OPTIONAL]", width: 40, mandatory: false }
  ];

  const colsXml = columns
    .map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`)
    .join('');

  const row1Cells = columns
    .map((c, i) => {
      const cellRef = `${colToLetter(i)}2`;
      const styleId = c.mandatory ? 1 : 2;
      return `<c r="${cellRef}" s="${styleId}" t="inlineStr"><is><t>${escapeXml(c.title)}</t></is></c>`;
    })
    .join('');

  const sampleValues = [
    sample.title,
    sample.category,
    sample.level,
    sample.summary,
    sample.overview,
    sample.architecture,
    sample.language,
    sample.caption,
    sample.code,
    sample.bestPractices.join('; '),
    sample.antiPatterns.join('; '),
    sample.interviewTips
  ];

  const row2Cells = sampleValues
    .map((val, i) => {
      const cellRef = `${colToLetter(i)}3`;
      return `<c r="${cellRef}" s="0" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
    })
    .join('');

  const placeholderValues = [
    "[Enter Guide Title - MANDATORY]",
    "[Category / Domain - MANDATORY]",
    "Beginner | Intermediate | Advanced",
    "[Concise 1-2 sentence definition - MANDATORY]",
    "[Multi-paragraph architectural explanation & tradeoffs - MANDATORY]",
    "[Internal engine mechanics or diagram flow - OPTIONAL]",
    sample.language,
    "[Caption for snippet - OPTIONAL]",
    "// Paste runnable code implementation here - MANDATORY",
    "[Best practice 1; Best practice 2 - OPTIONAL]",
    "[Common pitfall 1; Anti-pattern 2 - OPTIONAL]",
    "[Key SDET interview talking points & watchouts - OPTIONAL]"
  ];

  const row3Cells = placeholderValues
    .map((val, i) => {
      const cellRef = `${colToLetter(i)}4`;
      return `<c r="${cellRef}" s="4" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
    })
    .join('');

  const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:L4"/>
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${colsXml}</cols>
  <sheetData>
    <row r="1" ht="28" customHeight="1">
      <c r="A1" s="3" t="inlineStr"><is><t>IntelligentQA - ${escapeXml(trackName)} Concept Guides Import Template (Blue = Mandatory | Gray = Optional)</t></is></c>
    </row>
    <row r="2" ht="26" customHeight="1">${row1Cells}</row>
    <row r="3" ht="95" customHeight="1">${row2Cells}</row>
    <row r="4" ht="65" customHeight="1">${row3Cells}</row>
  </sheetData>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;

  return createZip([
    { name: "[Content_Types].xml", data: contentTypesXml },
    { name: "_rels/.rels", data: relsXml },
    { name: "xl/_rels/workbook.xml.rels", data: workbookRelsXml },
    { name: "xl/workbook.xml", data: workbookXml },
    { name: "xl/styles.xml", data: stylesXml },
    { name: "xl/worksheets/sheet1.xml", data: sheet1Xml }
  ]);
}

// Generate genuine Microsoft Word (.docx) file
export function generateOfficeWord(trackName: string, sample: SampleGuideData): Uint8Array {
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`;

  // Helper to build a table row for Word
  const makeRow = (label: string, isMandatory: boolean, valueContent: string) => {
    const badgeText = isMandatory ? ' [MANDATORY]' : ' [OPTIONAL]';
    const fillHex = isMandatory ? 'EFF6FF' : 'F8FAFC';
    const labelColor = isMandatory ? '1E40AF' : '475569';

    // Break valueContent into paragraphs
    const paragraphs = valueContent.split('\n').filter(Boolean);
    const pXml = paragraphs.length > 0
      ? paragraphs.map(p => {
          const isHeading = p.startsWith('#');
          const cleanP = p.replace(/^#{1,4}\s*/, '');
          // Split by bold **bold**
          const parts = cleanP.split(/(\*\*[^*]+\*\*)/g);
          const rXml = parts.map(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(part.slice(2, -2))}</w:t></w:r>`;
            }
            return `<w:r>${isHeading ? '<w:rPr><w:b/><w:color w:val="1E3A8A"/></w:rPr>' : ''}<w:t xml:space="preserve">${escapeXml(part)}</w:t></w:r>`;
          }).join('');

          return `<w:p>${rXml}</w:p>`;
        }).join('')
      : `<w:p><w:r><w:t>${escapeXml(valueContent)}</w:t></w:r></w:p>`;

    return `
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="2800" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="${fillHex}"/>
        </w:tcPr>
        <w:p>
          <w:r>
            <w:rPr>
              <w:b/>
              <w:color w:val="${labelColor}"/>
            </w:rPr>
            <w:t>${escapeXml(label)}${badgeText}</w:t>
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="6800" w:type="dxa"/>
        </w:tcPr>
        ${pXml}
      </w:tc>
    </w:tr>`;
  };

  const table1Xml = `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9600" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
      </w:tblBorders>
    </w:tblPr>
    ${makeRow('Title', true, sample.title)}
    ${makeRow('Category', true, sample.category)}
    ${makeRow('Level', true, sample.level)}
    ${makeRow('Summary', true, sample.summary)}
    ${makeRow('Overview', true, sample.overview)}
    ${makeRow('Architecture / Mechanism', false, sample.architecture)}
    ${makeRow('Code Language', true, sample.language)}
    ${makeRow('Code Snippet Caption', false, sample.caption)}
    ${makeRow('Code Snippet', true, sample.code)}
    ${makeRow('Best Practices', false, sample.bestPractices.map(b => `• ${b}`).join('\n'))}
    ${makeRow('Anti-Patterns', false, sample.antiPatterns.map(a => `• ${a}`).join('\n'))}
    ${makeRow('Interview Tips', false, sample.interviewTips)}
  </w:tbl>`;

  const table2Xml = `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9600" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
      </w:tblBorders>
    </w:tblPr>
    ${makeRow('Title', true, '[Enter Guide Title]')}
    ${makeRow('Category', true, '[e.g., Synchronization, Framework Architecture, POM, API Testing]')}
    ${makeRow('Level', true, 'Beginner | Intermediate | Advanced')}
    ${makeRow('Summary', true, '[Concise 1-2 sentence definition explaining why this concept matters for SDETs]')}
    ${makeRow('Overview', true, '### Architectural Overview\n• Key architectural feature 1 (supports bullet points and **bold keywords**)\n• Key architectural feature 2\n\n1. Numbered sequence 1\n2. Numbered sequence 2\n\n[Detailed multi-paragraph explanation, architectural solution, and tradeoffs]')}
    ${makeRow('Architecture / Mechanism', false, '[Internal engine mechanics, polling lifecycle, or diagram flow]')}
    ${makeRow('Code Language', true, `${sample.language} (or java / typescript / python / csharp)`)}
    ${makeRow('Code Snippet Caption', false, '[e.g., Primary Implementation Snippet]')}
    ${makeRow('Code Snippet', true, '// Paste your complete, runnable code snippet here')}
    ${makeRow('Best Practices', false, '• Best practice recommendation 1\n• Best practice recommendation 2')}
    ${makeRow('Anti-Patterns', false, '• Common pitfall or anti-pattern to avoid 1\n• Common anti-pattern 2')}
    ${makeRow('Interview Tips', false, '[Key talking points, tricky interview questions, and architect-level watchouts]')}
  </w:tbl>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="1E3A8A"/>
        </w:rPr>
        <w:t>IntelligentQA - Concept Guides Submission Template (${escapeXml(trackName)})</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:i/><w:color w:val="475569"/><w:sz w:val="20"/></w:rPr>
        <w:t>Instructions: Blue rows are [MANDATORY]. Gray rows are [OPTIONAL]. Overview supports full rich formatting: bold text, bullet points (•), numbered lists (1.), headings (###), and code blocks. Fill out Table 2 with your concept details. Table 2 can be copied and pasted to add multiple guides in this document. When ready, upload this .docx file directly to IntelligentQA.</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="0F172A"/></w:rPr>
        <w:t>Table 1: Complete Production Sample Guide (All Mandatory &amp; Optional Fields)</w:t>
      </w:r>
    </w:p>
    ${table1Xml}
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="0F172A"/></w:rPr>
        <w:t>Table 2: Blank Guide Template (Fill In Your Details Here)</w:t>
      </w:r>
    </w:p>
    ${table2Xml}
    <w:p>
      <w:r>
        <w:rPr><w:i/><w:color w:val="64748B"/><w:sz w:val="18"/></w:rPr>
        <w:t>Tip: To submit multiple guides, copy Table 2 above and paste it below for each additional guide.</w:t>
      </w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  return createZip([
    { name: "[Content_Types].xml", data: contentTypesXml },
    { name: "_rels/.rels", data: relsXml },
    { name: "word/_rels/document.xml.rels", data: wordRelsXml },
    { name: "word/styles.xml", data: stylesXml },
    { name: "word/document.xml", data: documentXml }
  ]);
}

// Download function that saves genuine .xlsx or .docx
export function downloadOfficeTemplate(
  format: 'xlsx' | 'docx' | 'json' | 'csv',
  trackId: string,
  sample: SampleGuideData
): void {
  const normTrack = trackId === 'selenium-java' ? 'selenium' : trackId === 'playwright-ts' ? 'playwright' : trackId;
  const trackName = normTrack === 'selenium' ? 'Selenium (Java)' : normTrack === 'playwright' ? 'Playwright (TS)' : normTrack === 'api-testing' ? 'Rest Assured (API)' : 'AI Academy';

  let blob: Blob;
  let filename: string;

  if (format === 'xlsx') {
    const bytes = generateOfficeExcel(trackName, sample);
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    filename = `sdet_${normTrack}_guide_template.xlsx`;
  } else if (format === 'docx') {
    const bytes = generateOfficeWord(trackName, sample);
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    filename = `sdet_${normTrack}_guide_template.docx`;
  } else if (format === 'csv') {
    const csvContent = `Title,Category,Level,Summary,Overview,CodeLanguage,CodeSnippet,InterviewTips\n"${sample.title}","${sample.category}","${sample.level}","${sample.summary}","${sample.overview}","${sample.language}","${sample.code.replace(/"/g, '""')}","${sample.interviewTips}"`;
    blob = new Blob([csvContent], { type: 'text/csv' });
    filename = `sdet_${normTrack}_guide_template.csv`;
  } else {
    const jsonContent = JSON.stringify([sample], null, 2);
    blob = new Blob([jsonContent], { type: 'application/json' });
    filename = `sdet_${normTrack}_guide_template.json`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function extractFormattedWordParagraph(pXml: string): string {
  // Check if paragraph has numbering / bullet list property
  const isList = /<w:pPr[\s\S]*?<w:numPr/i.test(pXml);

  // Extract runs <w:r>
  const runs = pXml.match(/<w:r[\s\S]*?<\/w:r>/gi) || [];
  let pText = '';

  if (runs.length > 0) {
    for (const r of runs) {
      // Check for bold and italic properties in run
      const isBold =
        /<w:rPr[\s\S]*?<w:b(\s|\/|>)/i.test(r) &&
        !/<w:b\s+w:val="(0|false|none)"/i.test(r);
      const isItalic =
        /<w:rPr[\s\S]*?<w:i(\s|\/|>)/i.test(r) &&
        !/<w:i\s+w:val="(0|false|none)"/i.test(r);

      // Extract text content from w:t tags
      const tMatches = r.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) || [];
      let runText = tMatches.map(m => m.replace(/<[^>]*>/g, '')).join('');

      // Check for line breaks inside run
      const brCount = (r.match(/<w:br(\s|\/|>)/gi) || []).length;

      if (runText) {
        runText = runText
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");

        const trimmed = runText.trim();
        if (isBold && trimmed && !trimmed.startsWith('**')) {
          const leading = runText.match(/^\s*/)?.[0] || '';
          const trailing = runText.match(/\s*$/)?.[0] || '';
          runText = `${leading}**${trimmed}**${trailing}`;
        } else if (isItalic && trimmed && !trimmed.startsWith('*')) {
          const leading = runText.match(/^\s*/)?.[0] || '';
          const trailing = runText.match(/\s*$/)?.[0] || '';
          runText = `${leading}*${trimmed}*${trailing}`;
        }
      }

      if (brCount > 0) {
        runText += '\n'.repeat(brCount);
      }

      pText += runText;
    }
  } else {
    // If no runs detected, fallback to raw w:t tags
    const textMatches = pXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) || [];
    pText = textMatches.map(m => m.replace(/<[^>]*>/g, '')).join('');
  }

  pText = pText.trim();

  // If Word marked this as a list item and it does not already start with a bullet or number, add bullet
  if (
    isList &&
    pText &&
    !pText.startsWith('•') &&
    !pText.startsWith('-') &&
    !/^\d+[\.\)]/.test(pText)
  ) {
    pText = `• ${pText}`;
  }

  return pText;
}

function extractFormattedWordCell(cellXml: string): string {
  const paragraphs = cellXml.match(/<w:p[\s\S]*?<\/w:p>/gi) || [];
  if (paragraphs.length === 0) {
    const textMatches = cellXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) || [];
    return textMatches.map(m => m.replace(/<[^>]*>/g, '')).join(' ').trim();
  }

  const pTexts = paragraphs
    .map(p => extractFormattedWordParagraph(p))
    .filter(Boolean);

  // Join paragraphs with <br/> so cleanText in parseImportedGuides converts them to clean \n
  return pTexts.join('<br/>');
}

// Helper to decompress deflate-raw or deflate payloads
async function decompressDeflateStream(dataBytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(dataBytes as any);
      writer.close();
      return await new Response(ds.readable).text();
    } catch {
      try {
        const ds2 = new DecompressionStream('deflate');
        const writer2 = ds2.writable.getWriter();
        writer2.write(dataBytes as any);
        writer2.close();
        return await new Response(ds2.readable).text();
      } catch {
        // Stream decompression failed
      }
    }
  }
  return '';
}

// Unzip parser to extract text from uploaded .docx or .xlsx files
export async function extractTextFromOfficeZip(
  buffer: ArrayBuffer,
  fileType: 'docx' | 'xlsx'
): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const decoder = new TextDecoder();

  const targetFiles: Record<string, string> = {};

  const isTargetFile = (fileName: string): boolean => {
    const norm = fileName.replace(/\\/g, '/').toLowerCase();
    if (fileType === 'docx') {
      return norm.endsWith('word/document.xml');
    }
    if (fileType === 'xlsx') {
      return norm.endsWith('xl/worksheets/sheet1.xml') || norm.endsWith('xl/sharedstrings.xml');
    }
    return false;
  };

  const getTargetKey = (fileName: string): string => {
    const norm = fileName.replace(/\\/g, '/').toLowerCase();
    if (norm.endsWith('word/document.xml')) return 'word/document.xml';
    if (norm.endsWith('xl/worksheets/sheet1.xml')) return 'xl/worksheets/sheet1.xml';
    if (norm.endsWith('xl/sharedstrings.xml')) return 'xl/sharedStrings.xml';
    return fileName;
  };

  const decompressData = async (dataBytes: Uint8Array, method: number): Promise<string> => {
    if (method === 0) {
      return decoder.decode(dataBytes);
    }
    if (method === 8) {
      return await decompressDeflateStream(dataBytes);
    }
    return '';
  };

  // 1. First attempt: Read via Central Directory from End of Central Directory (EOCD).
  // This is required for streaming ZIPs (Google Docs, Google Drive, LibreOffice, modern zip engines)
  // where local file headers have compSize === 0.
  let parsedViaCD = false;
  const maxSearch = Math.min(bytes.length, 65557);
  let eocdOffset = -1;

  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - maxSearch); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset !== -1) {
    const totalEntries = view.getUint16(eocdOffset + 10, true);
    const cdOffset = view.getUint32(eocdOffset + 16, true);

    let cdPos = cdOffset;
    let entriesFound = 0;

    while (cdPos + 46 <= bytes.length && entriesFound < totalEntries) {
      const sig = view.getUint32(cdPos, true);
      if (sig !== 0x02014b50) break; // Central directory header signature

      const method = view.getUint16(cdPos + 10, true);
      const compSize = view.getUint32(cdPos + 20, true);
      const nameLen = view.getUint16(cdPos + 28, true);
      const extraLen = view.getUint16(cdPos + 30, true);
      const commentLen = view.getUint16(cdPos + 32, true);
      const localOffset = view.getUint32(cdPos + 42, true);

      const nameBytes = bytes.slice(cdPos + 46, cdPos + 46 + nameLen);
      const fileName = decoder.decode(nameBytes);

      if (isTargetFile(fileName) && localOffset + 30 <= bytes.length) {
        const localSig = view.getUint32(localOffset, true);
        if (localSig === 0x04034b50) {
          const localNameLen = view.getUint16(localOffset + 26, true);
          const localExtraLen = view.getUint16(localOffset + 28, true);
          const dataStart = localOffset + 30 + localNameLen + localExtraLen;
          const dataBytes = bytes.slice(dataStart, dataStart + compSize);

          const content = await decompressData(dataBytes, method);
          if (content) {
            targetFiles[getTargetKey(fileName)] = content;
          }
        }
      }

      cdPos += 46 + nameLen + extraLen + commentLen;
      entriesFound++;
      parsedViaCD = true;
    }
  }

  // 2. Fallback: Local file header sequential scan (if EOCD was missing or corrupted)
  if (!parsedViaCD || Object.keys(targetFiles).length === 0) {
    let offset = 0;
    while (offset + 30 <= bytes.length) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) break;

      const method = view.getUint16(offset + 8, true);
      const compSize = view.getUint32(offset + 18, true);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);

      const nameBytes = bytes.slice(offset + 30, offset + 30 + nameLen);
      const fileName = decoder.decode(nameBytes);
      const dataStart = offset + 30 + nameLen + extraLen;

      if (compSize === 0) {
        // Streaming zip without CD size cannot be sequentially skipped by compSize
        break;
      }

      const dataBytes = bytes.slice(dataStart, dataStart + compSize);

      if (isTargetFile(fileName)) {
        const content = await decompressData(dataBytes, method);
        if (content) {
          targetFiles[getTargetKey(fileName)] = content;
        }
      }

      offset = dataStart + compSize;
    }
  }

  // Parse DOCX document.xml
  if (fileType === 'docx' && targetFiles['word/document.xml']) {
    const xml = targetFiles['word/document.xml'];
    // Extract both paragraphs and tables in sequential document order to keep content flow intact
    const elemRegex = /<w:p[\s\S]*?<\/w:p>|<w:tbl[\s\S]*?<\/w:tbl>/gi;
    const elements = xml.match(elemRegex) || [];
    const docParts: string[] = [];

    for (const elem of elements) {
      if (elem.startsWith('<w:tbl') || elem.startsWith('<w:tbl ')) {
        const rows = elem.match(/<w:tr[\s\S]*?<\/w:tr>/gi) || [];
        let tableHtml = '\n<table>\n';
        for (const row of rows) {
          const cells = row.match(/<w:tc[\s\S]*?<\/w:tc>/gi) || [];
          tableHtml += '<tr>';
          for (const cell of cells) {
            const cellText = extractFormattedWordCell(cell);
            tableHtml += `<td>${cellText}</td>`;
          }
          tableHtml += '</tr>\n';
        }
        tableHtml += '</table>\n';
        docParts.push(tableHtml);
      } else {
        const pText = extractFormattedWordParagraph(elem);
        if (pText) {
          docParts.push(pText);
        }
      }
    }

    if (docParts.length > 0) {
      return docParts.join('\n\n');
    }

    // Fallback: extract paragraphs with formatting
    const paragraphs = xml.match(/<w:p[\s\S]*?<\/w:p>/gi) || [];
    return paragraphs
      .map(p => extractFormattedWordParagraph(p))
      .filter(Boolean)
      .join('\n\n');
  }

  // Parse XLSX sheet1.xml
  if (fileType === 'xlsx' && targetFiles['xl/worksheets/sheet1.xml']) {
    const sheetXml = targetFiles['xl/worksheets/sheet1.xml'];

    // Parse shared strings if present
    const sharedStrings: string[] = [];
    if (targetFiles['xl/sharedStrings.xml']) {
      const siMatches = targetFiles['xl/sharedStrings.xml'].match(/<si[\s\S]*?<\/si>/gi) || [];
      for (const si of siMatches) {
        const tMatches = si.match(/<t[^>]*>([\s\S]*?)<\/t>/gi) || [];
        sharedStrings.push(tMatches.map(m => m.replace(/<[^>]*>/g, '')).join(''));
      }
    }

    const rowMatches = sheetXml.match(/<row[\s\S]*?<\/row>/gi) || [];
    let tsv = '';

    for (const row of rowMatches) {
      const cellMatches = row.match(/<c[\s\S]*?<\/c>/gi) || [];
      const rowValues: string[] = [];

      for (const cell of cellMatches) {
        const isInline = cell.includes('t="inlineStr"');
        const isShared = cell.includes('t="s"');

        if (isInline) {
          const tMatches = cell.match(/<t[^>]*>([\s\S]*?)<\/t>/gi) || [];
          rowValues.push(tMatches.map(m => m.replace(/<[^>]*>/g, '')).join(' '));
        } else if (isShared) {
          const vMatch = cell.match(/<v>(\d+)<\/v>/);
          if (vMatch) {
            const idx = parseInt(vMatch[1], 10);
            rowValues.push(sharedStrings[idx] || '');
          } else {
            rowValues.push('');
          }
        } else {
          const vMatch = cell.match(/<v>([\s\S]*?)<\/v>/);
          rowValues.push(vMatch ? vMatch[1].replace(/<[^>]*>/g, '') : '');
        }
      }

      if (rowValues.length > 0) {
        tsv += rowValues.join('\t') + '\n';
      }
    }

    if (tsv) return tsv;
  }

  return '';
}
