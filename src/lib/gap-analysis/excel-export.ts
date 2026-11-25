/**
 * Agent 07: Enterprise Multi-Sheet Excel (.xlsx) Export Utility
 * Generates genuine, 100% compliant binary OpenXML (.xlsx) workbooks containing:
 * - Sheet 1: Executive Summary
 * - Sheet 2: Detailed Coverage Report
 * - Sheet 3: Test Case Traceability
 * - Sheet 4: Orphan Test Cases
 * - Sheet 5: Scenario Gap Analysis
 *
 * Implements frozen header rows, AutoFilter, column widths, text wrapping,
 * conditional status styling (Strong/Weak/None), and formula injection protection.
 */

import { CoverageGapAnalysisResult } from '@/types/coverage-gap';
import { createZip } from '@/lib/office-documents';

function escapeXml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Formula Injection Prevention: Prepend single quote if cell starts with dangerous formula prefixes
function sanitizeCellValue(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return escapeXml(str);
}

function colToLetter(colIndex: number): string {
  let temp = colIndex + 1;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

export function generateCoverageGapExcelWorkbook(result: CoverageGapAnalysisResult): Uint8Array {
  const { summary, requirementCoverage, orphanTestCases, scenarioGaps } = result;

  // 1. Content Types XML
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet5.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  // 2. Root Relationships
  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // 3. Workbook Relationships
  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet5.xml"/>
  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // 4. Workbook XML
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Executive Summary" sheetId="1" r:id="rId1"/>
    <sheet name="Detailed Coverage Report" sheetId="2" r:id="rId2"/>
    <sheet name="Test Case Traceability" sheetId="3" r:id="rId3"/>
    <sheet name="Orphan Test Cases" sheetId="4" r:id="rId4"/>
    <sheet name="Scenario Gap Analysis" sheetId="5" r:id="rId5"/>
  </sheets>
</workbook>`;

  // 5. Styles XML (Fonts, Fills, Borders, Cell Formats)
  // Font 0: regular, Font 1: white bold header, Font 2: title, Font 3: green, Font 4: amber, Font 5: red
  // Fill 2: dark header (slate/indigo #1E293B), Fill 3: light green #D1FAE5, Fill 4: light amber #FEF3C7, Fill 5: light red #FEE2E2
  // Style 0: Normal, Style 1: Header, Style 2: Bold Text, Style 3: Strong Badge, Style 4: Weak Badge, Style 5: None Badge
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="7">
    <font><sz val="10"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="14"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF065F46"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF92400E"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF991B1B"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><name val="Calibri"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E293B"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD1FAE5"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="7">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;

  // --------------------------------------------------------------------------
  // SHEET 1: Executive Summary
  // --------------------------------------------------------------------------
  const summaryRows = [
    ['Metric', 'Value', 'Formula / Description'],
    [
      'Total Requirements',
      summary.totalRequirements,
      'Count of unique valid requirement records analyzed',
    ],
    [
      'Total Test Cases',
      summary.totalTestCases,
      'Count of unique valid test case records analyzed',
    ],
    [
      'Coverage %',
      `${summary.coveragePercentage}%`,
      '(Requirements with at least 1 Weak or Strong test case / Total valid requirements) * 100',
    ],
    [
      'Requirement-to-Test Traceability %',
      `${summary.requirementToTestTraceability}%`,
      '(Requirements having Confirmed or clearly evidenced Probable test case mapping / Total requirements) * 100',
    ],
    [
      'Test-to-Requirements Traceability %',
      `${summary.testToRequirementTraceability}%`,
      '(Test cases mapped to at least 1 requirement with Confirmed or Probable relationship / Total test cases) * 100',
    ],
    [
      'Strong Coverage Count',
      summary.strongCount,
      `${summary.strongPercentage}% of total requirements - Comprehensive validation`,
    ],
    [
      'Weak Coverage Count',
      summary.weakCount,
      `${summary.weakPercentage}% of total requirements - Partial validation / gaps exist`,
    ],
    [
      'None (Uncovered) Count',
      summary.noneCount,
      `${summary.nonePercentage}% of total requirements - Zero covering test cases`,
    ],
    [
      'Orphan Test Cases Count',
      summary.orphanTestCaseCount,
      'Test cases not mapped to any requirement',
    ],
    [
      'Probable / Uncertain Mappings',
      summary.probableOrUncertainMappingCount,
      'Mappings requiring manual reviewer verification',
    ],
    [
      'Requirements Requiring Clarification',
      summary.clarificationNeededCount,
      'Requirements with subjective or undefined criteria',
    ],
    [
      'Potential Duplicate Test Cases',
      summary.potentialDuplicateTestCasesCount,
      'Test cases sharing identical descriptions or scope',
    ],
    ['Analysis Timestamp', summary.analysisTimestamp, 'ISO UTC execution timestamp'],
  ];

  const sheet1Cols = `<cols>
    <col min="1" max="1" width="34" customWidth="1"/>
    <col min="2" max="2" width="22" customWidth="1"/>
    <col min="3" max="3" width="75" customWidth="1"/>
  </cols>`;

  let sheet1RowsXml = '';
  for (let rIdx = 0; rIdx < summaryRows.length; rIdx++) {
    const rowNum = rIdx + 1;
    const rowData = summaryRows[rIdx];
    const isHeader = rIdx === 0;
    const cellsXml = rowData
      .map((val, cIdx) => {
        const ref = `${colToLetter(cIdx)}${rowNum}`;
        const s = isHeader ? 1 : cIdx === 0 ? 6 : 0;
        return `<c r="${ref}" s="${s}" t="inlineStr"><is><t>${sanitizeCellValue(val)}</t></is></c>`;
      })
      .join('');
    sheet1RowsXml += `<row r="${rowNum}" ${isHeader ? 'ht="24" customHeight="1"' : 'ht="20" customHeight="1"'}>${cellsXml}</row>`;
  }

  const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  ${sheet1Cols}
  <sheetData>${sheet1RowsXml}</sheetData>
  <autoFilter ref="A1:C${summaryRows.length}"/>
</worksheet>`;

  // --------------------------------------------------------------------------
  // SHEET 2: Detailed Coverage Report
  // Columns:
  // - Requirement ID
  // - Requirements
  // - Coverage Level
  // - Covering Test Case IDs
  // - Covering Test Case Descriptions
  // - Mapping Confidence
  // - Coverage Evidence
  // - Missing Scenarios
  // - Improvement Recommendations
  // - Source Reference
  // --------------------------------------------------------------------------
  const sheet2Headers = [
    'Requirement ID',
    'Requirements',
    'Coverage Level',
    'Covering Test Case IDs',
    'Covering Test Case Descriptions',
    'Mapping Confidence',
    'Coverage Evidence',
    'Missing Scenarios',
    'Improvement Recommendations',
    'Source Reference',
  ];

  const sheet2Cols = `<cols>
    <col min="1" max="1" width="16" customWidth="1"/>
    <col min="2" max="2" width="45" customWidth="1"/>
    <col min="3" max="3" width="18" customWidth="1"/>
    <col min="4" max="4" width="24" customWidth="1"/>
    <col min="5" max="5" width="45" customWidth="1"/>
    <col min="6" max="6" width="20" customWidth="1"/>
    <col min="7" max="7" width="50" customWidth="1"/>
    <col min="8" max="8" width="30" customWidth="1"/>
    <col min="9" max="9" width="55" customWidth="1"/>
    <col min="10" max="10" width="35" customWidth="1"/>
  </cols>`;

  let sheet2RowsXml = `<row r="1" ht="26" customHeight="1">${sheet2Headers
    .map(
      (h, i) => `<c r="${colToLetter(i)}1" s="1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`
    )
    .join('')}</row>`;

  for (let idx = 0; idx < requirementCoverage.length; idx++) {
    const rowNum = idx + 2;
    const req = requirementCoverage[idx];

    const coveringIds =
      req.coveringTestCases.map((c) => c.testCaseId).join(', ') || 'No covering test case found.';
    const coveringDescs =
      req.coveringTestCases.map((c) => `[${c.testCaseId}] ${c.testCaseDescription}`).join('; ') ||
      'None';
    const confidences =
      req.coveringTestCases.map((c) => `${c.testCaseId}: ${c.mappingConfidence}`).join(', ') ||
      'N/A';
    const missing = req.missingScenarios.join(', ') || 'None';
    const recs =
      req.improvementRecommendations.join('; ') ||
      'Coverage appears adequate based on the supplied requirements and test cases.';

    let levelStyle = 0;
    if (req.coverageLevel === 'Strong') levelStyle = 3;
    else if (req.coverageLevel === 'Weak') levelStyle = 4;
    else if (req.coverageLevel === 'None') levelStyle = 5;

    const rowCells = [
      `<c r="A${rowNum}" s="6" t="inlineStr"><is><t>${sanitizeCellValue(req.requirementId)}</t></is></c>`,
      `<c r="B${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(req.requirementDescription)}</t></is></c>`,
      `<c r="C${rowNum}" s="${levelStyle}" t="inlineStr"><is><t>${sanitizeCellValue(req.coverageLevel)}</t></is></c>`,
      `<c r="D${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(coveringIds)}</t></is></c>`,
      `<c r="E${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(coveringDescs)}</t></is></c>`,
      `<c r="F${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(confidences)}</t></is></c>`,
      `<c r="G${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(req.coverageEvidence || '')}</t></is></c>`,
      `<c r="H${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(missing)}</t></is></c>`,
      `<c r="I${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(recs)}</t></is></c>`,
      `<c r="J${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(req.sourceReference)}</t></is></c>`,
    ].join('');

    sheet2RowsXml += `<row r="${rowNum}" ht="28" customHeight="1">${rowCells}</row>`;
  }

  const sheet2Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  ${sheet2Cols}
  <sheetData>${sheet2RowsXml}</sheetData>
  <autoFilter ref="A1:J${Math.max(2, requirementCoverage.length + 1)}"/>
</worksheet>`;

  // --------------------------------------------------------------------------
  // SHEET 3: Test Case Traceability
  // Columns:
  // - Test Case ID
  // - Test Case Description
  // - Mapped Requirement IDs
  // - Mapping Confidence
  // - Traceability Status
  // - Source Reference
  // --------------------------------------------------------------------------
  const sheet3Headers = [
    'Test Case ID',
    'Test Case Description',
    'Mapped Requirement IDs',
    'Mapping Confidence',
    'Traceability Status',
    'Source Reference',
  ];

  const sheet3Cols = `<cols>
    <col min="1" max="1" width="18" customWidth="1"/>
    <col min="2" max="2" width="50" customWidth="1"/>
    <col min="3" max="3" width="28" customWidth="1"/>
    <col min="4" max="4" width="22" customWidth="1"/>
    <col min="5" max="5" width="22" customWidth="1"/>
    <col min="6" max="6" width="35" customWidth="1"/>
  </cols>`;

  // Aggregate all unique test cases
  const allTcsMap = new Map<
    string,
    {
      desc: string;
      reqIds: string[];
      confidences: string[];
      source: string;
    }
  >();

  for (const r of requirementCoverage) {
    for (const c of r.coveringTestCases) {
      if (!allTcsMap.has(c.testCaseId)) {
        allTcsMap.set(c.testCaseId, {
          desc: c.testCaseDescription,
          reqIds: [],
          confidences: [],
          source: c.sourceReference || '',
        });
      }
      const entry = allTcsMap.get(c.testCaseId)!;
      if (!entry.reqIds.includes(r.requirementId)) {
        entry.reqIds.push(r.requirementId);
        entry.confidences.push(c.mappingConfidence);
      }
    }
  }

  for (const o of orphanTestCases) {
    if (!allTcsMap.has(o.testCaseId)) {
      allTcsMap.set(o.testCaseId, {
        desc: o.testCaseDescription,
        reqIds: [],
        confidences: [],
        source: o.sourceReference,
      });
    }
  }

  let sheet3RowsXml = `<row r="1" ht="26" customHeight="1">${sheet3Headers
    .map(
      (h, i) => `<c r="${colToLetter(i)}1" s="1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`
    )
    .join('')}</row>`;

  let tcRowIdx = 2;
  for (const [tcId, tcData] of allTcsMap.entries()) {
    const isOrphan = tcData.reqIds.length === 0;
    const reqIdsStr = isOrphan ? 'None (Orphan)' : tcData.reqIds.join(', ');
    const confStr = isOrphan ? 'N/A' : Array.from(new Set(tcData.confidences)).join(', ');
    const status = isOrphan ? 'Orphan / Unmapped' : 'Traceable';
    const statusStyle = isOrphan ? 5 : 3;

    const rowCells = [
      `<c r="A${tcRowIdx}" s="6" t="inlineStr"><is><t>${sanitizeCellValue(tcId)}</t></is></c>`,
      `<c r="B${tcRowIdx}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(tcData.desc)}</t></is></c>`,
      `<c r="C${tcRowIdx}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(reqIdsStr)}</t></is></c>`,
      `<c r="D${tcRowIdx}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(confStr)}</t></is></c>`,
      `<c r="E${tcRowIdx}" s="${statusStyle}" t="inlineStr"><is><t>${sanitizeCellValue(status)}</t></is></c>`,
      `<c r="F${tcRowIdx}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(tcData.source)}</t></is></c>`,
    ].join('');

    sheet3RowsXml += `<row r="${tcRowIdx}" ht="24" customHeight="1">${rowCells}</row>`;
    tcRowIdx++;
  }

  const sheet3Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  ${sheet3Cols}
  <sheetData>${sheet3RowsXml}</sheetData>
  <autoFilter ref="A1:F${Math.max(2, tcRowIdx - 1)}"/>
</worksheet>`;

  // --------------------------------------------------------------------------
  // SHEET 4: Orphan Test Cases
  // Columns:
  // - Test Case ID
  // - Test Case Description
  // - Source Reference
  // - Reason
  // - Recommended Action
  // --------------------------------------------------------------------------
  const sheet4Headers = [
    'Test Case ID',
    'Test Case Description',
    'Source Reference',
    'Reason',
    'Recommended Action',
  ];

  const sheet4Cols = `<cols>
    <col min="1" max="1" width="18" customWidth="1"/>
    <col min="2" max="2" width="45" customWidth="1"/>
    <col min="3" max="3" width="30" customWidth="1"/>
    <col min="4" max="4" width="40" customWidth="1"/>
    <col min="5" max="5" width="55" customWidth="1"/>
  </cols>`;

  let sheet4RowsXml = `<row r="1" ht="26" customHeight="1">${sheet4Headers
    .map(
      (h, i) => `<c r="${colToLetter(i)}1" s="1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`
    )
    .join('')}</row>`;

  if (orphanTestCases.length === 0) {
    sheet4RowsXml += `<row r="2" ht="22" customHeight="1">
      <c r="A2" s="3" t="inlineStr"><is><t>None</t></is></c>
      <c r="B2" s="0" t="inlineStr"><is><t>All test cases successfully map to one or more requirements.</t></is></c>
      <c r="C2" s="0" t="inlineStr"><is><t>N/A</t></is></c>
      <c r="D2" s="0" t="inlineStr"><is><t>No orphan test cases detected.</t></is></c>
      <c r="E2" s="0" t="inlineStr"><is><t>No action required.</t></is></c>
    </row>`;
  } else {
    for (let idx = 0; idx < orphanTestCases.length; idx++) {
      const rowNum = idx + 2;
      const o = orphanTestCases[idx];
      const rowCells = [
        `<c r="A${rowNum}" s="6" t="inlineStr"><is><t>${sanitizeCellValue(o.testCaseId)}</t></is></c>`,
        `<c r="B${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(o.testCaseDescription)}</t></is></c>`,
        `<c r="C${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(o.sourceReference)}</t></is></c>`,
        `<c r="D${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(o.reason)}</t></is></c>`,
        `<c r="E${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(o.recommendedAction)}</t></is></c>`,
      ].join('');
      sheet4RowsXml += `<row r="${rowNum}" ht="24" customHeight="1">${rowCells}</row>`;
    }
  }

  const sheet4Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  ${sheet4Cols}
  <sheetData>${sheet4RowsXml}</sheetData>
  <autoFilter ref="A1:E${Math.max(2, orphanTestCases.length + 1)}"/>
</worksheet>`;

  // --------------------------------------------------------------------------
  // SHEET 5: Scenario Gap Analysis
  // Columns:
  // - Requirement ID
  // - Requirement Description
  // - Scenario Type
  // - Coverage Status
  // - Existing Covering Test Cases
  // - Recommended Action
  // --------------------------------------------------------------------------
  const sheet5Headers = [
    'Requirement ID',
    'Requirement Description',
    'Scenario Type',
    'Coverage Status',
    'Existing Covering Test Cases',
    'Recommended Action',
  ];

  const sheet5Cols = `<cols>
    <col min="1" max="1" width="18" customWidth="1"/>
    <col min="2" max="2" width="45" customWidth="1"/>
    <col min="3" max="3" width="28" customWidth="1"/>
    <col min="4" max="4" width="20" customWidth="1"/>
    <col min="5" max="5" width="28" customWidth="1"/>
    <col min="6" max="6" width="55" customWidth="1"/>
  </cols>`;

  let sheet5RowsXml = `<row r="1" ht="26" customHeight="1">${sheet5Headers
    .map(
      (h, i) => `<c r="${colToLetter(i)}1" s="1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`
    )
    .join('')}</row>`;

  for (let idx = 0; idx < scenarioGaps.length; idx++) {
    const rowNum = idx + 2;
    const sg = scenarioGaps[idx];

    let statusStyle = 0;
    if (sg.coverageStatus === 'Covered') statusStyle = 3;
    else if (sg.coverageStatus === 'Weak / Partial') statusStyle = 4;
    else if (sg.coverageStatus === 'Missing') statusStyle = 5;

    const rowCells = [
      `<c r="A${rowNum}" s="6" t="inlineStr"><is><t>${sanitizeCellValue(sg.requirementId)}</t></is></c>`,
      `<c r="B${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(sg.requirementDescription)}</t></is></c>`,
      `<c r="C${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(sg.scenarioType)}</t></is></c>`,
      `<c r="D${rowNum}" s="${statusStyle}" t="inlineStr"><is><t>${sanitizeCellValue(sg.coverageStatus)}</t></is></c>`,
      `<c r="E${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(sg.existingCoveringTestCases)}</t></is></c>`,
      `<c r="F${rowNum}" s="0" t="inlineStr"><is><t>${sanitizeCellValue(sg.recommendedAction)}</t></is></c>`,
    ].join('');

    sheet5RowsXml += `<row r="${rowNum}" ht="24" customHeight="1">${rowCells}</row>`;
  }

  const sheet5Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  ${sheet5Cols}
  <sheetData>${sheet5RowsXml}</sheetData>
  <autoFilter ref="A1:F${Math.max(2, scenarioGaps.length + 1)}"/>
</worksheet>`;

  // 6. Assemble into OpenXML Zip
  const zipFiles = [
    { name: '[Content_Types].xml', data: contentTypesXml },
    { name: '_rels/.rels', data: relsXml },
    { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml },
    { name: 'xl/workbook.xml', data: workbookXml },
    { name: 'xl/styles.xml', data: stylesXml },
    { name: 'xl/worksheets/sheet1.xml', data: sheet1Xml },
    { name: 'xl/worksheets/sheet2.xml', data: sheet2Xml },
    { name: 'xl/worksheets/sheet3.xml', data: sheet3Xml },
    { name: 'xl/worksheets/sheet4.xml', data: sheet4Xml },
    { name: 'xl/worksheets/sheet5.xml', data: sheet5Xml },
  ];

  return createZip(zipFiles);
}
