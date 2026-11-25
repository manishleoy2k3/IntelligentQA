/**
 * IntelligentQA Excel & CSV Export Utility
 * Converts generated QA artifacts (Requirements, Test Matrices) into structured Excel spreadsheets.
 */

export interface RequirementRow {
  id: string;
  category: string;
  title: string;
  given: string;
  when: string;
  then: string;
  notes: string;
}

export interface TestCaseRow {
  id: string;
  category: string;
  scenario: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
  priority: string;
}

/**
 * Parses markdown requirements output into structured tabular rows
 */
export function parseRequirementsToRows(markdown: string): RequirementRow[] {
  const rows: RequirementRow[] = [];
  if (!markdown) return rows;

  const lines = markdown.split('\n');
  let currentScenario = '';
  let currentCategory = 'General Acceptance Criteria';
  let given = '';
  let when = '';
  let then = '';
  let notes = '';
  let reqCount = 1;

  // Extract identified ambiguities / edge cases for notes context
  const ambiguityLines: string[] = [];
  let inAmbiguitySection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (
      trimmed.toLowerCase().includes('ambiguity') ||
      trimmed.toLowerCase().includes('edge-case') ||
      trimmed.toLowerCase().includes('edge case')
    ) {
      inAmbiguitySection = true;
      continue;
    }
    if (trimmed.startsWith('#') && inAmbiguitySection) {
      inAmbiguitySection = false;
    }
    if (inAmbiguitySection && (trimmed.startsWith('-') || trimmed.startsWith('*'))) {
      ambiguityLines.push(trimmed.replace(/^[-*]\s*/, '').replace(/\*\*/g, ''));
    }

    // Gherkin Scenario detection
    const scenarioMatch = trimmed.match(/^Scenario:\s*(.+)$/i);
    if (scenarioMatch) {
      // Save previous scenario if exists
      if (currentScenario) {
        rows.push({
          id: `REQ-${String(reqCount++).padStart(3, '0')}`,
          category: currentCategory,
          title: currentScenario,
          given: given || 'User is authenticated and navigates to the feature',
          when: when || 'User executes the required workflow',
          then: then || 'System executes successfully with confirmation',
          notes:
            notes || (ambiguityLines.length > 0 ? ambiguityLines[0] : 'Standard verification rule'),
        });
        given = '';
        when = '';
        then = '';
        notes = '';
      }

      const rawTitle = scenarioMatch[1].trim();
      currentScenario = rawTitle;
      if (
        rawTitle.toLowerCase().includes('negative') ||
        rawTitle.toLowerCase().includes('error') ||
        rawTitle.toLowerCase().includes('invalid')
      ) {
        currentCategory = 'Negative Path';
      } else if (
        rawTitle.toLowerCase().includes('edge') ||
        rawTitle.toLowerCase().includes('special') ||
        rawTitle.toLowerCase().includes('boundary')
      ) {
        currentCategory = 'Edge Case';
      } else if (
        rawTitle.toLowerCase().includes('security') ||
        rawTitle.toLowerCase().includes('auth') ||
        rawTitle.toLowerCase().includes('2fa')
      ) {
        currentCategory = 'Security & Auth';
      } else {
        currentCategory = 'Happy Path';
      }
      continue;
    }

    // Step detection
    if (trimmed.startsWith('Given ') || trimmed.startsWith('And given ')) {
      given = (given ? given + '; ' : '') + trimmed.replace(/^(Given|And given)\s+/i, '');
    } else if (trimmed.startsWith('When ') || trimmed.startsWith('And when ')) {
      when = (when ? when + '; ' : '') + trimmed.replace(/^(When|And when)\s+/i, '');
    } else if (trimmed.startsWith('Then ') || trimmed.startsWith('And then ')) {
      then = (then ? then + '; ' : '') + trimmed.replace(/^(Then|And then)\s+/i, '');
    }
  }

  // Push final scenario
  if (currentScenario) {
    rows.push({
      id: `REQ-${String(reqCount++).padStart(3, '0')}`,
      category: currentCategory,
      title: currentScenario,
      given: given || 'User is authenticated and navigates to the feature',
      when: when || 'User executes the required workflow',
      then: then || 'System executes successfully with confirmation',
      notes:
        notes || (ambiguityLines.length > 0 ? ambiguityLines[0] : 'Standard verification rule'),
    });
  }

  // Fallback if no Gherkin scenarios were found (e.g. bulleted list of requirements)
  if (rows.length === 0) {
    let fallbackCount = 1;
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        (trimmed.startsWith('- [ ]') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) &&
        trimmed.length > 5
      ) {
        const text = trimmed.replace(/^[-*]\s*(\[[ x]\])?\s*/i, '').replace(/\*\*/g, '');
        rows.push({
          id: `REQ-${String(fallbackCount++).padStart(3, '0')}`,
          category: 'Functional Requirement',
          title: text,
          given: 'Precondition established',
          when: 'Action triggered',
          then: 'Criteria fulfilled',
          notes: 'Derived from specification list',
        });
      }
    }
  }

  // If still empty, create at least 1 row from the raw text
  if (rows.length === 0) {
    rows.push({
      id: 'REQ-001',
      category: 'Core Requirement',
      title: markdown.slice(0, 120).replace(/\n/g, ' '),
      given: 'Standard system baseline',
      when: 'Feature is engaged',
      then: 'Behavior adheres to acceptance criteria',
      notes: 'Generated via IntelligentQA Requirement Generator',
    });
  }

  return rows;
}

/**
 * Generates an Excel-compatible XML SpreadsheetML workbook (.xls)
 * Compatible with Microsoft Excel 2003+, Microsoft Excel 365, Google Sheets, LibreOffice.
 */
export function generateExcelWorkbookXml(
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
): string {
  const sanitizeXml = (str: any) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const headerCells = headers
    .map(
      (h) => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${sanitizeXml(h)}</Data></Cell>`
    )
    .join('');

  const rowNodes = rows
    .map((row) => {
      const cells = row
        .map(
          (cell) =>
            `<Cell ss:StyleID="RowStyle"><Data ss:Type="String">${sanitizeXml(cell)}</Data></Cell>`
        )
        .join('');
      return `<Row ss:AutoFitHeight="1">${cells}</Row>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Top"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#334155"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
   </Borders>
  </Style>
  <Style ss:ID="RowStyle">
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitizeXml(sheetName)}">
  <Table ss:DefaultColumnWidth="140" ss:DefaultRowHeight="24">
   <Column ss:Width="90"/>
   <Column ss:Width="120"/>
   <Column ss:Width="200"/>
   <Column ss:Width="180"/>
   <Column ss:Width="180"/>
   <Column ss:Width="220"/>
   <Column ss:Width="200"/>
   <Row ss:StyleID="HeaderStyle" ss:Height="28">
    ${headerCells}
   </Row>
   ${rowNodes}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
   <ActivePane>2</ActivePane>
   <Panes>
    <Pane>
     <Number>3</Number>
    </Pane>
    <Pane>
     <Number>2</Number>
     <ActiveRow>1</ActiveRow>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

/**
 * Parses markdown ambiguity analysis table into structured rows
 */
export function parseAmbiguityTableToRows(markdown: string): {
  serialNumber: string;
  title: string;
  ambiguity: string;
  type: string;
  priority: string;
  lineNumber: string;
  recommendation: string;
}[] {
  const rows: {
    serialNumber: string;
    title: string;
    ambiguity: string;
    type: string;
    priority: string;
    lineNumber: string;
    recommendation: string;
  }[] = [];

  if (!markdown) return rows;

  const lines = markdown.split('\n');
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && /serial number|ambiguity title/i.test(trimmed)) {
      inTable = true;
      continue;
    }
    if (inTable) {
      if (!trimmed.startsWith('|')) {
        inTable = false;
        continue;
      }
      // Skip separator row e.g. |:---|:---|
      if (/^\|[\s\-:]+\|/.test(trimmed)) {
        continue;
      }
      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      if (cells.length >= 7) {
        rows.push({
          serialNumber: cells[0] || String(rows.length + 1),
          title: cells[1] || '',
          ambiguity: cells[2] || '',
          type: cells[3] || '',
          priority: cells[4] || '',
          lineNumber: cells[5] || '',
          recommendation: cells[6] || '',
        });
      }
    }
  }

  return rows;
}

/**
 * Downloads generated requirements or ambiguity analysis as an Excel (.xls) file
 */
export function exportRequirementsToExcel(
  markdown: string,
  filenamePrefix = 'intelligentqa-requirements'
): void {
  // Check if this is an Ambiguity Analysis report
  const isAmbiguityReport =
    markdown.includes('Ambiguity Title') ||
    markdown.includes('Ambiguity Type') ||
    markdown.includes('Ambiguity Analysis');

  if (isAmbiguityReport) {
    const ambiguityRows = parseAmbiguityTableToRows(markdown);
    if (ambiguityRows.length > 0) {
      const headers = [
        'Serial Number',
        'Ambiguity Title',
        'Ambiguity',
        'Ambiguity Type',
        'Priority',
        'Line Number',
        'Recommendation',
      ];
      const dataRows = ambiguityRows.map((r) => [
        r.serialNumber,
        r.title,
        r.ambiguity,
        r.type,
        r.priority,
        r.lineNumber,
        r.recommendation,
      ]);

      const xmlContent = generateExcelWorkbookXml('Ambiguity Analysis', headers, dataRows);
      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `requirement-ambiguity-analysis-${Date.now()}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
  }

  const rows = parseRequirementsToRows(markdown);
  const headers = [
    'Requirement ID',
    'Category',
    'Title / Scenario',
    'Given (Precondition)',
    'When (Action)',
    'Then (Expected Result)',
    'Notes / Edge Cases',
  ];

  const dataRows = rows.map((r) => [r.id, r.category, r.title, r.given, r.when, r.then, r.notes]);

  const xmlContent = generateExcelWorkbookXml('QA Requirements', headers, dataRows);
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${Date.now()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads generated test matrix as an Excel (.xls) file
 */
export function exportTestMatrixToExcel(
  markdown: string,
  filenamePrefix = 'intelligentqa-test-matrix'
): void {
  const lines = markdown.split('\n');
  const headers = [
    'Test Case ID',
    'Category',
    'Scenario Description',
    'Preconditions',
    'Test Steps',
    'Expected Result',
    'Priority',
  ];
  const dataRows: string[][] = [];

  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) {
        inTable = true;
        continue;
      }
      if (inTable) {
        const parts = trimmed
          .split('|')
          .slice(1, -1)
          .map((p) => p.trim().replace(/\*\*/g, '').replace(/<br>/g, '\n'));
        if (parts.length >= 5) {
          dataRows.push([
            parts[0] || `TC-${dataRows.length + 1}`,
            parts[1] || 'Functional',
            parts[2] || '',
            parts[3] || 'Preconditions met',
            parts[4] || '',
            parts[5] || 'Pass criteria met',
            parts[6] || 'P1 (High)',
          ]);
        }
      }
    }
  }

  // Fallback if no table found
  if (dataRows.length === 0) {
    dataRows.push([
      'TC-001',
      'Positive',
      'Verify happy path workflow',
      'App running',
      '1. Execute flow',
      'Success toast displayed',
      'P0 (Critical)',
    ]);
  }

  const xmlContent = generateExcelWorkbookXml('Test Cases Matrix', headers, dataRows);
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${Date.now()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
