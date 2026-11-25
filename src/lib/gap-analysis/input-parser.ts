/**
 * Agent 07: Multi-Format Input Parser
 * Parses Requirements and Test Cases from Excel (.xlsx, .xls), Markdown (.md), JSON (.json), and Pasted Text.
 */

import { NormalizedRequirement, NormalizedTestCase, ParsedInputItem } from '@/types/coverage-gap';

// ============================================================================
// ZIP EXTRACTION UTILITIES (Browser + Node.js Compatible)
// ============================================================================

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

async function decompressDeflate(compressedData: Uint8Array): Promise<Uint8Array> {
  // 1. Try DecompressionStream (Browser & modern Node)
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(compressedData as any);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          total += value.length;
        }
      }
      const result = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      return result;
    } catch {
      // Fall through to node zlib
    }
  }

  // 2. Try Node zlib if in Node environment
  try {
    const zlib = await import('zlib');
    if (zlib && (zlib.inflateRawSync || zlib.default?.inflateRawSync)) {
      const fn = zlib.inflateRawSync || zlib.default.inflateRawSync;
      const res = fn(compressedData);
      return new Uint8Array(res.buffer, res.byteOffset, res.byteLength);
    }
  } catch {
    // No zlib
  }

  return compressedData;
}

async function extractAllZipEntries(buffer: ArrayBuffer): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const bytes = new Uint8Array(buffer);
  let offset = 0;
  const decoder = new TextDecoder('utf-8', { fatal: false });

  while (offset < bytes.length - 30) {
    // Local file header signature: PK\x03\x04
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
      const uncompSize =
        bytes[offset + 22] |
        (bytes[offset + 23] << 8) |
        (bytes[offset + 24] << 16) |
        (bytes[offset + 25] << 24);
      const nameLen = bytes[offset + 26] | (bytes[offset + 27] << 8);
      const extraLen = bytes[offset + 28] | (bytes[offset + 29] << 8);

      const nameBytes = bytes.slice(offset + 30, offset + 30 + nameLen);
      const fileName = decoder.decode(nameBytes);

      const dataStart = offset + 30 + nameLen + extraLen;
      const dataEnd = dataStart + compSize;

      if (dataEnd <= bytes.length) {
        const compData = bytes.slice(dataStart, dataEnd);
        if (method === 0) {
          map.set(fileName, decoder.decode(compData));
        } else if (method === 8) {
          try {
            const decomp = await decompressDeflate(compData);
            map.set(fileName, decoder.decode(decomp));
          } catch {
            // failed decompression
          }
        }
      }

      offset = dataEnd;
    } else {
      offset++;
    }
  }

  return map;
}

// ============================================================================
// EXCEL PARSING (ALL WORKSHEETS SUPPORTED)
// ============================================================================

interface ParsedSheetRow {
  sheetName: string;
  rowNumber: number;
  cells: string[];
}

export async function parseExcelBuffer(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ParsedSheetRow[]> {
  const result: ParsedSheetRow[] = [];
  const entries = await extractAllZipEntries(buffer);

  if (entries.size === 0) {
    // If not a valid zip (e.g. .xls legacy binary or XML spreadsheet or text)
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(buffer);
    return parseTextFallbackToRows(text, fileName);
  }

  // 1. Shared Strings
  const sharedStringsXml = entries.get('xl/sharedStrings.xml') || '';
  const sharedStrings: string[] = [];
  if (sharedStringsXml) {
    const siMatches = sharedStringsXml.match(/<si[\s>][\s\S]*?<\/si>/g);
    if (siMatches) {
      for (const si of siMatches) {
        const tMatches = si.match(/<t[^>]*>([\s\S]*?)<\/t>/g);
        if (tMatches) {
          sharedStrings.push(
            tMatches
              .map((t) => t.replace(/<[^>]+>/g, ''))
              .join('')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
          );
        } else {
          sharedStrings.push('');
        }
      }
    }
  }

  // 2. Discover all sheets from workbook.xml
  const workbookXml = entries.get('xl/workbook.xml') || '';
  const sheetMeta: { name: string; rId: string; sheetId: string }[] = [];
  const sheetTagMatches =
    workbookXml.match(/<sheet[^>]*\/>/g) || workbookXml.match(/<sheet[^>]*>[\s\S]*?<\/sheet>/g);
  if (sheetTagMatches) {
    for (const tag of sheetTagMatches) {
      const nameMatch = tag.match(/name="([^"]+)"/i);
      const sheetIdMatch = tag.match(/sheetId="([^"]+)"/i);
      const rIdMatch = tag.match(/r:id="([^"]+)"/i);
      if (nameMatch) {
        sheetMeta.push({
          name: nameMatch[1],
          sheetId: sheetIdMatch ? sheetIdMatch[1] : '1',
          rId: rIdMatch ? rIdMatch[1] : 'rId1',
        });
      }
    }
  }

  // Map sheet files
  const sheetFiles: { name: string; path: string }[] = [];
  if (sheetMeta.length > 0) {
    for (let i = 0; i < sheetMeta.length; i++) {
      const s = sheetMeta[i];
      // Check standard path patterns
      const p1 = `xl/worksheets/sheet${i + 1}.xml`;
      const p2 = `xl/worksheets/sheet${s.sheetId}.xml`;
      if (entries.has(p1)) {
        sheetFiles.push({ name: s.name, path: p1 });
      } else if (entries.has(p2)) {
        sheetFiles.push({ name: s.name, path: p2 });
      }
    }
  }

  // Fallback: search for any sheet*.xml in entries
  if (sheetFiles.length === 0) {
    for (const key of entries.keys()) {
      if (key.startsWith('xl/worksheets/sheet') && key.endsWith('.xml')) {
        const num = key.replace('xl/worksheets/sheet', '').replace('.xml', '');
        sheetFiles.push({ name: `Sheet${num}`, path: key });
      }
    }
  }

  // 3. Process each sheet
  for (const sheet of sheetFiles) {
    const sheetXml = entries.get(sheet.path);
    if (!sheetXml) continue;

    const rowMatches = sheetXml.match(/<row[^>]*r="(\d+)"[\s\S]*?<\/row>/g);
    if (!rowMatches) continue;

    for (const rowXml of rowMatches) {
      const rMatch = rowXml.match(/<row[^>]*r="(\d+)"/);
      const rowNumber = rMatch ? parseInt(rMatch[1], 10) : 1;

      const cellMatches = rowXml.match(/<c[^>]*>[\s\S]*?<\/c>/g);
      if (!cellMatches) continue;

      const cellMap = new Map<number, string>();
      let maxCol = 0;

      for (const cellXml of cellMatches) {
        const rAttr = cellXml.match(/r="([A-Z]+)(\d+)"/i);
        const colLetter = rAttr ? rAttr[1] : 'A';
        const colIdx = columnLetterToIndex(colLetter);
        maxCol = Math.max(maxCol, colIdx);

        const isSharedString = /t="s"/i.test(cellXml);
        const valMatch = cellXml.match(/<v>([^<]+)<\/v>/);
        let cellText = '';

        if (valMatch) {
          const rawVal = valMatch[1];
          if (isSharedString) {
            const idx = parseInt(rawVal, 10);
            if (!isNaN(idx) && sharedStrings[idx] !== undefined) {
              cellText = sharedStrings[idx];
            }
          } else {
            cellText = rawVal;
          }
        } else {
          const inlineMatch = cellXml.match(/<is><t[^>]*>([\s\S]*?)<\/t><\/is>/);
          if (inlineMatch) {
            cellText = inlineMatch[1].replace(/<[^>]+>/g, '');
          }
        }

        cellText = cellText
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim();

        if (cellText) {
          cellMap.set(colIdx, cellText);
        }
      }

      if (cellMap.size > 0) {
        const rowCells: string[] = [];
        for (let c = 0; c <= maxCol; c++) {
          rowCells.push(cellMap.get(c) || '');
        }
        result.push({
          sheetName: sheet.name,
          rowNumber,
          cells: rowCells,
        });
      }
    }
  }

  return result;
}

function columnLetterToIndex(letters: string): number {
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return Math.max(0, col - 1);
}

function parseTextFallbackToRows(text: string, fileName: string): ParsedSheetRow[] {
  const rows: ParsedSheetRow[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  lines.forEach((line, idx) => {
    const cells = line.split(/[,\t|]/).map((c) => c.trim());
    if (cells.some(Boolean)) {
      rows.push({
        sheetName: 'Sheet1',
        rowNumber: idx + 1,
        cells,
      });
    }
  });
  return rows;
}

// ============================================================================
// DATASET EXTRACTION FROM EXCEL ROWS
// ============================================================================

export function extractRequirementsFromExcelRows(
  rows: ParsedSheetRow[],
  fileName: string
): NormalizedRequirement[] {
  const requirements: NormalizedRequirement[] = [];
  if (rows.length === 0) return requirements;

  // Group rows by sheet
  const sheetsMap = new Map<string, ParsedSheetRow[]>();
  for (const r of rows) {
    if (!sheetsMap.has(r.sheetName)) sheetsMap.set(r.sheetName, []);
    sheetsMap.get(r.sheetName)!.push(r);
  }

  let autoIdCount = 1;

  for (const [sheetName, sheetRows] of sheetsMap.entries()) {
    if (sheetRows.length === 0) continue;

    // Detect header row in first 5 rows
    let headerIdx = -1;
    let colId = -1;
    let colDesc = -1;
    let colType = -1;
    let colPriority = -1;

    for (let i = 0; i < Math.min(sheetRows.length, 5); i++) {
      const cells = sheetRows[i].cells.map((c) => c.toLowerCase().trim());
      const idIndex = cells.findIndex(
        (c) =>
          c.includes('req id') ||
          c.includes('requirement id') ||
          c.includes('story id') ||
          c.includes('jira') ||
          c === 'id' ||
          c === 'req_id' ||
          c === 'key'
      );
      const descIndex = cells.findIndex(
        (c) =>
          c.includes('requirement') ||
          c.includes('description') ||
          c.includes('acceptance criteria') ||
          c.includes('details') ||
          c.includes('story') ||
          c === 'title' ||
          c === 'summary'
      );

      if (idIndex !== -1 || descIndex !== -1) {
        headerIdx = i;
        colId = idIndex;
        colDesc = descIndex !== -1 ? descIndex : idIndex === 0 ? 1 : 0;
        colType = cells.findIndex((c) => c.includes('type') || c.includes('category'));
        colPriority = cells.findIndex((c) => c.includes('priority') || c.includes('severity'));
        break;
      }
    }

    const dataStartIdx = headerIdx !== -1 ? headerIdx + 1 : 0;

    for (let r = dataStartIdx; r < sheetRows.length; r++) {
      const row = sheetRows[r];
      const cells = row.cells;
      const rawText = cells.filter(Boolean).join(' | ');
      if (!rawText.trim()) continue;

      let reqId = '';
      let isGenerated = false;
      let desc = '';
      let reqType = 'Functional';
      let priority = 'Medium';

      if (colDesc !== -1 && cells[colDesc]) {
        desc = cells[colDesc].trim();
        if (colId !== -1 && cells[colId]) {
          reqId = cells[colId].trim();
        }
      } else {
        // Fallback: look for cell that looks like an ID
        const possibleIdCell = cells.find((c) =>
          /^(REQ|US|BR|FEAT|FR|NFR|TASK)[-_ ]?\d+/i.test(c.trim())
        );
        if (possibleIdCell) {
          reqId = possibleIdCell.trim();
          desc = cells.filter((c) => c !== possibleIdCell && c.trim().length > 0).join(' - ');
        } else {
          desc = cells.filter(Boolean).join(' - ');
        }
      }

      if (!desc || desc.length < 3) continue;

      // Extract ID from description if available
      if (!reqId) {
        const match = desc.match(/\b(REQ[-_ ]?\d+|US[-_ ]?\d+|BR[-_ ]?\d+)\b/i);
        if (match) {
          reqId = match[1].replace(/ /g, '_').toUpperCase();
        } else {
          reqId = `REQ_${String(autoIdCount).padStart(3, '0')}`;
          isGenerated = true;
          autoIdCount++;
        }
      }

      if (colType !== -1 && cells[colType]) reqType = cells[colType].trim();
      if (colPriority !== -1 && cells[colPriority]) priority = cells[colPriority].trim();

      requirements.push({
        requirementId: reqId,
        isGeneratedId: isGenerated,
        requirementDescription: desc,
        requirementType: reqType,
        priority,
        sourceFile: fileName,
        sourceWorksheet: sheetName,
        sourceRow: row.rowNumber,
        originalSourceText: rawText,
      });
    }
  }

  return requirements;
}

export function extractTestCasesFromExcelRows(
  rows: ParsedSheetRow[],
  fileName: string
): NormalizedTestCase[] {
  const testCases: NormalizedTestCase[] = [];
  if (rows.length === 0) return testCases;

  const sheetsMap = new Map<string, ParsedSheetRow[]>();
  for (const r of rows) {
    if (!sheetsMap.has(r.sheetName)) sheetsMap.set(r.sheetName, []);
    sheetsMap.get(r.sheetName)!.push(r);
  }

  let autoIdCount = 1;

  for (const [sheetName, sheetRows] of sheetsMap.entries()) {
    if (sheetRows.length === 0) continue;

    // Detect header row in first 5 rows
    let headerIdx = -1;
    let colId = -1;
    let colDesc = -1;
    let colPre = -1;
    let colRisk = -1;
    let colSteps = -1;
    let colData = -1;
    let colExpected = -1;

    for (let i = 0; i < Math.min(sheetRows.length, 5); i++) {
      const cells = sheetRows[i].cells.map((c) => c.toLowerCase().trim());
      const idIdx = cells.findIndex(
        (c) =>
          c.includes('tc id') ||
          c.includes('test case id') ||
          c.includes('testcase id') ||
          c.includes('tc_id') ||
          c.includes('test case no') ||
          c.includes('tc #') ||
          c.includes('tc#') ||
          c === 'id'
      );
      const descIdx = cells.findIndex(
        (c) =>
          c.includes('test case description') ||
          c.includes('description') ||
          c.includes('test scenario') ||
          c.includes('scenario') ||
          c === 'title' ||
          c === 'summary'
      );

      if (idIdx !== -1 || descIdx !== -1) {
        headerIdx = i;
        colId = idIdx;
        colDesc = descIdx !== -1 ? descIdx : idIdx === 0 ? 1 : 0;
        colPre = cells.findIndex((c) => c.includes('precondition') || c.includes('prerequisite'));
        colRisk = cells.findIndex(
          (c) => c.includes('risk') || c.includes('priority') || c.includes('severity')
        );
        colSteps = cells.findIndex(
          (c) => c.includes('step') || c.includes('action') || c.includes('procedure')
        );
        colData = cells.findIndex(
          (c) => c.includes('test data') || c.includes('input') || c.includes('data')
        );
        colExpected = cells.findIndex(
          (c) =>
            c.includes('expected') ||
            c.includes('expected result') ||
            c.includes('expected outcome')
        );
        break;
      }
    }

    const dataStartIdx = headerIdx !== -1 ? headerIdx + 1 : 0;

    for (let r = dataStartIdx; r < sheetRows.length; r++) {
      const row = sheetRows[r];
      const cells = row.cells;
      const rawText = cells.filter(Boolean).join(' | ');
      if (!rawText.trim()) continue;

      let tcId = '';
      let isGenerated = false;
      let desc = '';
      let pre = '';
      let risk = 'Medium';
      let steps = '';
      let testData = '';
      let expected = '';

      if (colDesc !== -1 && cells[colDesc]) {
        desc = cells[colDesc].trim();
        if (colId !== -1 && cells[colId]) tcId = cells[colId].trim();
        if (colPre !== -1 && cells[colPre]) pre = cells[colPre].trim();
        if (colRisk !== -1 && cells[colRisk]) risk = cells[colRisk].trim();
        if (colSteps !== -1 && cells[colSteps]) steps = cells[colSteps].trim();
        if (colData !== -1 && cells[colData]) testData = cells[colData].trim();
        if (colExpected !== -1 && cells[colExpected]) expected = cells[colExpected].trim();
      } else {
        const possibleIdCell = cells.find((c) => /^(TC|TEST|CASE|TST)[-_ ]?\d+/i.test(c.trim()));
        if (possibleIdCell) {
          tcId = possibleIdCell.trim();
          desc = cells.filter((c) => c !== possibleIdCell && c.trim().length > 0).join(' - ');
        } else {
          desc = cells.filter(Boolean).join(' - ');
        }
      }

      if (!desc || desc.length < 3) continue;

      if (!tcId) {
        const match = desc.match(/\b(TC[-_ ]?\d+|TEST[-_ ]?\d+|CASE[-_ ]?\d+)\b/i);
        if (match) {
          tcId = match[1].replace(/ /g, '_').toUpperCase();
        } else {
          tcId = `TC_${String(autoIdCount).padStart(3, '0')}`;
          isGenerated = true;
          autoIdCount++;
        }
      }

      testCases.push({
        testCaseId: tcId,
        isGeneratedId: isGenerated,
        testCaseDescription: desc,
        preconditions: pre,
        risk,
        testSteps: steps,
        inputTestData: testData,
        expectedResults: expected,
        sourceFile: fileName,
        sourceWorksheet: sheetName,
        sourceRow: row.rowNumber,
        originalSourceText: rawText,
      });
    }
  }

  return testCases;
}

// ============================================================================
// MARKDOWN PARSER (.md)
// ============================================================================

export function parseMarkdownToRequirements(
  markdown: string,
  fileName: string
): NormalizedRequirement[] {
  const requirements: NormalizedRequirement[] = [];
  const lines = markdown.split(/\r?\n/);
  let currentSection = 'General';
  let autoIdCount = 1;

  let inTable = false;
  let tableHeaders: string[] = [];
  let colId = -1;
  let colDesc = -1;
  let colType = -1;
  let colPriority = -1;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line) {
      inTable = false;
      continue;
    }

    if (line.startsWith('#')) {
      currentSection = line.replace(/^#+\s*/, '').trim();
      inTable = false;
      continue;
    }

    // Check for markdown table row
    if (line.startsWith('|') && line.endsWith('|')) {
      const parts = line
        .slice(1, -1)
        .split('|')
        .map((p) => p.trim());

      // If separator line like |---|---|
      if (parts.every((p) => /^:?-+:?$/.test(p))) {
        inTable = true;
        continue;
      }

      if (!inTable) {
        // This is a header row
        tableHeaders = parts.map((p) => p.toLowerCase());
        colId = tableHeaders.findIndex(
          (h) => h.includes('id') || h.includes('req') || h.includes('key')
        );
        colDesc = tableHeaders.findIndex(
          (h) =>
            h.includes('desc') ||
            h.includes('requirement') ||
            h.includes('acceptance') ||
            h.includes('title') ||
            h.includes('summary')
        );
        colType = tableHeaders.findIndex((h) => h.includes('type') || h.includes('category'));
        colPriority = tableHeaders.findIndex(
          (h) => h.includes('priority') || h.includes('severity')
        );
        continue;
      }

      // We are in data rows
      let reqId = '';
      let isGenerated = false;
      let desc = '';
      let reqType = 'Functional';
      let priority = 'Medium';

      if (colDesc !== -1 && parts[colDesc]) {
        desc = parts[colDesc];
        if (colId !== -1 && parts[colId]) reqId = parts[colId];
        if (colType !== -1 && parts[colType]) reqType = parts[colType];
        if (colPriority !== -1 && parts[colPriority]) priority = parts[colPriority];
      } else {
        desc = parts.filter(Boolean).join(' - ');
      }

      if (!desc || desc.length < 3) continue;

      if (!reqId) {
        const idMatch = desc.match(/\b(REQ[-_ ]?\d+|US[-_ ]?\d+|BR[-_ ]?\d+)\b/i);
        if (idMatch) {
          reqId = idMatch[1].replace(/ /g, '_').toUpperCase();
        } else {
          reqId = `REQ_${String(autoIdCount).padStart(3, '0')}`;
          isGenerated = true;
          autoIdCount++;
        }
      }

      requirements.push({
        requirementId: reqId,
        isGeneratedId: isGenerated,
        requirementDescription: desc,
        requirementType: reqType,
        priority,
        sourceFile: fileName,
        sourceSection: currentSection,
        sourceRow: idx + 1,
        originalSourceText: line,
      });
      continue;
    }

    // Check for list item / bullet item
    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const cleanLine = line.replace(/^[-*]|\d+\.\s*/, '').trim();
      if (cleanLine.length < 4) continue;

      let reqId = '';
      let isGenerated = false;
      const idMatch = cleanLine.match(/^(REQ[-_ ]?\d+|US[-_ ]?\d+|BR[-_ ]?\d+)[:\s-]+/i);
      if (idMatch) {
        reqId = idMatch[1].replace(/ /g, '_').toUpperCase();
      } else {
        reqId = `REQ_${String(autoIdCount).padStart(3, '0')}`;
        isGenerated = true;
        autoIdCount++;
      }

      requirements.push({
        requirementId: reqId,
        isGeneratedId: isGenerated,
        requirementDescription: cleanLine,
        requirementType: 'Functional',
        priority: 'Medium',
        sourceFile: fileName,
        sourceSection: currentSection,
        sourceRow: idx + 1,
        originalSourceText: line,
      });
    }
  }

  return requirements;
}

export function parseMarkdownToTestCases(markdown: string, fileName: string): NormalizedTestCase[] {
  const testCases: NormalizedTestCase[] = [];
  const lines = markdown.split(/\r?\n/);
  let currentSection = 'General';
  let autoIdCount = 1;

  let inTable = false;
  let tableHeaders: string[] = [];
  let colId = -1;
  let colDesc = -1;
  let colPre = -1;
  let colRisk = -1;
  let colSteps = -1;
  let colData = -1;
  let colExpected = -1;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line) {
      inTable = false;
      continue;
    }

    if (line.startsWith('#')) {
      currentSection = line.replace(/^#+\s*/, '').trim();
      inTable = false;
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      const parts = line
        .slice(1, -1)
        .split('|')
        .map((p) => p.trim());

      if (parts.every((p) => /^:?-+:?$/.test(p))) {
        inTable = true;
        continue;
      }

      if (!inTable) {
        tableHeaders = parts.map((p) => p.toLowerCase());
        colId = tableHeaders.findIndex(
          (h) =>
            h.includes('tc id') || h.includes('test case id') || h.includes('tc#') || h === 'id'
        );
        colDesc = tableHeaders.findIndex(
          (h) => h.includes('description') || h.includes('scenario') || h.includes('title')
        );
        colPre = tableHeaders.findIndex((h) => h.includes('precondition'));
        colRisk = tableHeaders.findIndex((h) => h.includes('risk') || h.includes('priority'));
        colSteps = tableHeaders.findIndex((h) => h.includes('step') || h.includes('action'));
        colData = tableHeaders.findIndex((h) => h.includes('data') || h.includes('input'));
        colExpected = tableHeaders.findIndex((h) => h.includes('expected'));
        continue;
      }

      let tcId = '';
      let isGenerated = false;
      let desc = '';
      let pre = '';
      let risk = 'Medium';
      let steps = '';
      let testData = '';
      let expected = '';

      if (colDesc !== -1 && parts[colDesc]) {
        desc = parts[colDesc];
        if (colId !== -1 && parts[colId]) tcId = parts[colId];
        if (colPre !== -1 && parts[colPre]) pre = parts[colPre];
        if (colRisk !== -1 && parts[colRisk]) risk = parts[colRisk];
        if (colSteps !== -1 && parts[colSteps]) steps = parts[colSteps];
        if (colData !== -1 && parts[colData]) testData = parts[colData];
        if (colExpected !== -1 && parts[colExpected]) expected = parts[colExpected];
      } else {
        desc = parts.filter(Boolean).join(' - ');
      }

      if (!desc || desc.length < 3) continue;

      if (!tcId) {
        const idMatch = desc.match(/\b(TC[-_ ]?\d+|TEST[-_ ]?\d+|CASE[-_ ]?\d+)\b/i);
        if (idMatch) {
          tcId = idMatch[1].replace(/ /g, '_').toUpperCase();
        } else {
          tcId = `TC_${String(autoIdCount).padStart(3, '0')}`;
          isGenerated = true;
          autoIdCount++;
        }
      }

      testCases.push({
        testCaseId: tcId,
        isGeneratedId: isGenerated,
        testCaseDescription: desc,
        preconditions: pre,
        risk,
        testSteps: steps,
        inputTestData: testData,
        expectedResults: expected,
        sourceFile: fileName,
        sourceSection: currentSection,
        sourceRow: idx + 1,
        originalSourceText: line,
      });
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const cleanLine = line.replace(/^[-*]|\d+\.\s*/, '').trim();
      if (cleanLine.length < 4) continue;

      let tcId = '';
      let isGenerated = false;
      const idMatch = cleanLine.match(/^(TC[-_ ]?\d+|TEST[-_ ]?\d+)[:\s-]+/i);
      if (idMatch) {
        tcId = idMatch[1].replace(/ /g, '_').toUpperCase();
      } else {
        tcId = `TC_${String(autoIdCount).padStart(3, '0')}`;
        isGenerated = true;
        autoIdCount++;
      }

      testCases.push({
        testCaseId: tcId,
        isGeneratedId: isGenerated,
        testCaseDescription: cleanLine,
        risk: 'Medium',
        sourceFile: fileName,
        sourceSection: currentSection,
        sourceRow: idx + 1,
        originalSourceText: line,
      });
    }
  }

  return testCases;
}

// ============================================================================
// JSON PARSER (.json)
// ============================================================================

export function parseJsonToRequirements(
  jsonString: string,
  fileName: string
): NormalizedRequirement[] {
  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch (err: any) {
    throw new Error(`Invalid JSON in ${fileName}: ${err?.message || 'Malformed syntax'}`);
  }

  let items: any[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'object' && data !== null) {
    // Check common container keys
    const arrayKey = Object.keys(data).find(
      (k) =>
        Array.isArray(data[k]) &&
        ['requirements', 'reqs', 'items', 'stories', 'features', 'data', 'specs'].includes(
          k.toLowerCase()
        )
    );
    if (arrayKey) {
      items = data[arrayKey];
    } else {
      // Check if top-level object itself is a requirement
      if (data.description || data.requirementId || data.reqId || data.title) {
        items = [data];
      } else {
        // Collect all array values or nested objects
        const firstArray = Object.values(data).find(Array.isArray);
        if (firstArray) items = firstArray as any[];
      }
    }
  }

  const requirements: NormalizedRequirement[] = [];
  let autoIdCount = 1;

  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx];
    if (!it) continue;

    let id =
      it.requirementId || it.requirement_id || it.reqId || it.req_id || it.id || it.key || it.code;
    let desc =
      it.description ||
      it.requirementDescription ||
      it.requirement_description ||
      it.desc ||
      it.title ||
      it.summary ||
      it.acceptanceCriteria ||
      it.text ||
      (typeof it === 'string' ? it : '');

    if (!desc && typeof it === 'object') {
      desc = JSON.stringify(it);
    }

    if (!desc || String(desc).trim().length < 2) continue;

    let isGenerated = false;
    if (!id) {
      const match = String(desc).match(/\b(REQ[-_ ]?\d+|US[-_ ]?\d+|BR[-_ ]?\d+)\b/i);
      if (match) {
        id = match[1].replace(/ /g, '_').toUpperCase();
      } else {
        id = `REQ_${String(autoIdCount).padStart(3, '0')}`;
        isGenerated = true;
        autoIdCount++;
      }
    }

    requirements.push({
      requirementId: String(id).trim(),
      isGeneratedId: isGenerated,
      requirementDescription: String(desc).trim(),
      requirementType: it.type || it.requirementType || 'Functional',
      priority: it.priority || it.criticality || 'Medium',
      sourceFile: fileName,
      sourceRow: idx + 1,
      sourceSection: it.section || it.module || 'JSON Data',
      originalSourceText: JSON.stringify(it),
    });
  }

  return requirements;
}

export function parseJsonToTestCases(jsonString: string, fileName: string): NormalizedTestCase[] {
  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch (err: any) {
    throw new Error(`Invalid JSON in ${fileName}: ${err?.message || 'Malformed syntax'}`);
  }

  let items: any[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (typeof data === 'object' && data !== null) {
    const arrayKey = Object.keys(data).find(
      (k) =>
        Array.isArray(data[k]) &&
        ['testcases', 'test_cases', 'tests', 'items', 'scenarios', 'cases', 'data'].includes(
          k.toLowerCase()
        )
    );
    if (arrayKey) {
      items = data[arrayKey];
    } else {
      if (data.testCaseId || data.test_case_id || data.tcId || data.description || data.scenario) {
        items = [data];
      } else {
        const firstArray = Object.values(data).find(Array.isArray);
        if (firstArray) items = firstArray as any[];
      }
    }
  }

  const testCases: NormalizedTestCase[] = [];
  let autoIdCount = 1;

  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx];
    if (!it) continue;

    let id =
      it.testCaseId || it.test_case_id || it.tcId || it.tc_id || it.id || it.testId || it.key;
    let desc =
      it.testCaseDescription ||
      it.test_case_description ||
      it.description ||
      it.title ||
      it.scenario ||
      it.summary ||
      (typeof it === 'string' ? it : '');

    let steps = it.steps || it.testSteps || it.test_steps || '';
    if (Array.isArray(steps)) {
      steps = steps
        .map((s, i) =>
          typeof s === 'string' ? `${i + 1}. ${s}` : `${i + 1}. ${JSON.stringify(s)}`
        )
        .join('\n');
    }

    let expected =
      it.expectedResult ||
      it.expectedResults ||
      it.expected_result ||
      it.expected_results ||
      it.expected ||
      '';

    if (!desc && typeof it === 'object') {
      desc = JSON.stringify(it);
    }

    if (!desc || String(desc).trim().length < 2) continue;

    let isGenerated = false;
    if (!id) {
      const match = String(desc).match(/\b(TC[-_ ]?\d+|TEST[-_ ]?\d+|CASE[-_ ]?\d+)\b/i);
      if (match) {
        id = match[1].replace(/ /g, '_').toUpperCase();
      } else {
        id = `TC_${String(autoIdCount).padStart(3, '0')}`;
        isGenerated = true;
        autoIdCount++;
      }
    }

    testCases.push({
      testCaseId: String(id).trim(),
      isGeneratedId: isGenerated,
      testCaseDescription: String(desc).trim(),
      preconditions: it.preconditions || it.precondition || '',
      risk: it.risk || it.priority || 'Medium',
      testSteps: typeof steps === 'string' ? steps : JSON.stringify(steps),
      inputTestData: it.inputTestData || it.testData || it.input_data || '',
      expectedResults: typeof expected === 'string' ? expected : JSON.stringify(expected),
      sourceFile: fileName,
      sourceRow: idx + 1,
      sourceSection: it.section || it.module || 'JSON Data',
      originalSourceText: JSON.stringify(it),
    });
  }

  return testCases;
}

// ============================================================================
// PASTED TEXT PARSER (Plain text, tables, lists, Gherkin)
// ============================================================================

export function parsePastedRequirements(
  text: string,
  sourceName = 'Pasted Text'
): NormalizedRequirement[] {
  const clean = text.trim();
  if (!clean) return [];

  // 1. Try JSON
  if (
    (clean.startsWith('{') && clean.endsWith('}')) ||
    (clean.startsWith('[') && clean.endsWith(']'))
  ) {
    try {
      return parseJsonToRequirements(clean, sourceName);
    } catch {
      // not JSON, continue
    }
  }

  // 2. Try Markdown table or list
  if (clean.includes('|') || clean.includes('#') || clean.includes('- ')) {
    const mdResult = parseMarkdownToRequirements(clean, sourceName);
    if (mdResult.length > 0) return mdResult;
  }

  // 3. Fallback: Parse line-by-line / blocks
  const requirements: NormalizedRequirement[] = [];
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  let autoIdCount = 1;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (line.length < 3) continue;

    let reqId = '';
    let isGenerated = false;

    // Check for ID at start
    const match = line.match(/^([A-Za-z0-9_-]{2,12})[:.\-\s]+(.*)$/);
    if (match && /^(REQ|US|BR|FEAT|FR|NFR|ID)/i.test(match[1])) {
      reqId = match[1].toUpperCase();
    } else {
      reqId = `REQ_${String(autoIdCount).padStart(3, '0')}`;
      isGenerated = true;
      autoIdCount++;
    }

    requirements.push({
      requirementId: reqId,
      isGeneratedId: isGenerated,
      requirementDescription: line,
      requirementType: 'Functional',
      priority: 'Medium',
      sourceFile: sourceName,
      sourceRow: idx + 1,
      originalSourceText: line,
    });
  }

  return requirements;
}

export function parsePastedTestCases(
  text: string,
  sourceName = 'Pasted Text'
): NormalizedTestCase[] {
  const clean = text.trim();
  if (!clean) return [];

  if (
    (clean.startsWith('{') && clean.endsWith('}')) ||
    (clean.startsWith('[') && clean.endsWith(']'))
  ) {
    try {
      return parseJsonToTestCases(clean, sourceName);
    } catch {
      // not JSON, continue
    }
  }

  if (clean.includes('|') || clean.includes('#') || clean.includes('- ')) {
    const mdResult = parseMarkdownToTestCases(clean, sourceName);
    if (mdResult.length > 0) return mdResult;
  }

  // Check for multi-line block format:
  // TC-01: ... or Test Case ID: TC01 ...
  if (/(?:test case id|tc id|test case:|^tc[-_ ]?\d+[:\s-])/im.test(clean)) {
    const blocks = clean.split(/(?=(?:test case id|tc id|test case:|^tc[-_ ]?\d+[:\s-]))/im);
    const result: NormalizedTestCase[] = [];
    let autoCount = 1;

    for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
      const block = blocks[bIdx].trim();
      if (!block) continue;

      const tcIdMatch =
        block.match(/(?:test case id|tc id|test case:)\s*([A-Za-z0-9_-]+)/i) ||
        block.match(/^(?:TC[-_ ]?[A-Za-z0-9_]+)/i);
      const descMatch =
        block.match(/(?:description|scenario|title:)\s*([^\n\r]+)/i) ||
        block.match(/^(?:TC[-_ ]?[A-Za-z0-9_]+[:\s-]+)(.*)$/m);
      const stepsMatch = block.match(
        /(?:steps|test steps:)\s*([\s\S]*?)(?=(?:expected|precondition|$))/i
      );
      const expectedMatch = block.match(
        /(?:expected results?|expected:)\s*([\s\S]*?)(?=(?:test case id|^tc[-_ ]?\d+|$))/im
      );
      const preMatch = block.match(/(?:preconditions?|prerequisites?:)\s*([^\n\r]+)/i);

      let tcId = tcIdMatch ? tcIdMatch[1] || tcIdMatch[0] : '';
      let isGenerated = false;
      if (!tcId) {
        tcId = `TC_${String(autoCount).padStart(3, '0')}`;
        isGenerated = true;
        autoCount++;
      } else {
        tcId = tcId.trim().replace(/^tc[-_ ]/i, 'TC_');
      }

      const desc = descMatch ? (descMatch[1] || descMatch[0]).trim() : block.split('\n')[0].trim();
      result.push({
        testCaseId: tcId,
        isGeneratedId: isGenerated,
        testCaseDescription: desc,
        preconditions: preMatch ? preMatch[1].trim() : '',
        risk: 'Medium',
        testSteps: stepsMatch ? stepsMatch[1].trim() : '',
        expectedResults: expectedMatch ? expectedMatch[1].trim() : '',
        sourceFile: sourceName,
        sourceRow: bIdx + 1,
        originalSourceText: block,
      });
    }

    if (result.length > 0) return result;
  }

  // Fallback: line by line
  const testCases: NormalizedTestCase[] = [];
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  let autoIdCount = 1;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (line.length < 3) continue;

    let tcId = '';
    let isGenerated = false;

    const match = line.match(/^([A-Za-z0-9_-]{2,12})[:.\-\s]+(.*)$/);
    if (match && /^(TC|TEST|CASE|TST)/i.test(match[1])) {
      tcId = match[1].toUpperCase();
    } else {
      tcId = `TC_${String(autoIdCount).padStart(3, '0')}`;
      isGenerated = true;
      autoIdCount++;
    }

    testCases.push({
      testCaseId: tcId,
      isGeneratedId: isGenerated,
      testCaseDescription: line,
      risk: 'Medium',
      sourceFile: sourceName,
      sourceRow: idx + 1,
      originalSourceText: line,
    });
  }

  return testCases;
}

// ============================================================================
// COMBINED FILE INGESTION DISPATCHER
// ============================================================================

export async function parseFileForRequirements(
  file: File | { name: string; buffer: ArrayBuffer; text?: string }
): Promise<NormalizedRequirement[]> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'xlsx' || ext === 'xls') {
    const buf = 'buffer' in file ? file.buffer : await (file as File).arrayBuffer();
    const rows = await parseExcelBuffer(buf, fileName);
    return extractRequirementsFromExcelRows(rows, fileName);
  }

  let text = '';
  if ('text' in file && typeof file.text === 'string') {
    text = file.text;
  } else if ('buffer' in file) {
    text = new TextDecoder('utf-8', { fatal: false }).decode(file.buffer);
  } else {
    text = await (file as File).text();
  }

  if (ext === 'md') {
    return parseMarkdownToRequirements(text, fileName);
  } else if (ext === 'json') {
    return parseJsonToRequirements(text, fileName);
  } else {
    return parsePastedRequirements(text, fileName);
  }
}

export async function parseFileForTestCases(
  file: File | { name: string; buffer: ArrayBuffer; text?: string }
): Promise<NormalizedTestCase[]> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'xlsx' || ext === 'xls') {
    const buf = 'buffer' in file ? file.buffer : await (file as File).arrayBuffer();
    const rows = await parseExcelBuffer(buf, fileName);
    return extractTestCasesFromExcelRows(rows, fileName);
  }

  let text = '';
  if ('text' in file && typeof file.text === 'string') {
    text = file.text;
  } else if ('buffer' in file) {
    text = new TextDecoder('utf-8', { fatal: false }).decode(file.buffer);
  } else {
    text = await (file as File).text();
  }

  if (ext === 'md') {
    return parseMarkdownToTestCases(text, fileName);
  } else if (ext === 'json') {
    return parseJsonToTestCases(text, fileName);
  } else {
    return parsePastedTestCases(text, fileName);
  }
}
