#!/usr/bin/env python3
"""
Generates a comprehensive fidelity test DOCX file containing all 12 mandatory elements
stipulated in Phase 4 Requirement 8:
1. Multiple heading levels
2. Normal paragraphs
3. Nested bullet lists
4. Numbered lists
5. A table with multiple rows and columns
6. Two or more images
7. Java code
8. TypeScript code
9. Hyperlinks
10. Bold and italic text
11. Special characters
12. A page break
"""

import os
import zipfile
import zlib
import struct

def make_png(width=120, height=80, color=(16, 185, 129)):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    raw_row = b'\x00' + bytes(color) * width
    raw_data = raw_row * height
    idat = zlib.compress(raw_data)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')

def generate_fidelity_test_docx(dest_path):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    png1 = make_png(160, 90, (16, 185, 129)) # Emerald
    png2 = make_png(180, 100, (59, 130, 246)) # Blue

    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>'''

    root_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

    doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
  <Relationship Id="rIdImg2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image2.png"/>
  <Relationship Id="rIdLink1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://playwright.dev" TargetMode="External"/>
  <Relationship Id="rIdLink2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://www.selenium.dev" TargetMode="External"/>
</Relationships>'''

    document_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    <!-- 1. MULTIPLE HEADING LEVELS -->
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>Heading 1: Autonomous Quality Engineering Architecture</w:t></w:r>
    </w:p>
    
    <w:p>
      <w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
      <w:r><w:t>Heading 2: Core Transformer Pipeline</w:t></w:r>
    </w:p>

    <w:p>
      <w:pPr><w:pStyle w:val="Heading3"/></w:pPr>
      <w:r><w:t>Heading 3: Subsystem Components and Ingestion Stages</w:t></w:r>
    </w:p>

    <!-- 2. NORMAL PARAGRAPHS -->
    <w:p>
      <w:r><w:t>This technical specification document verifies that Microsoft Word OpenXML (.docx) files are processed, rendered, and preserved with zero manual HTML authoring. Every paragraph, heading, list hierarchy, table, code block, and binary asset must survive transformation intact.</w:t></w:r>
    </w:p>

    <!-- 10. BOLD, ITALIC, UNDERLINE TEXT & 11. SPECIAL CHARACTERS -->
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Bold Text Example</w:t></w:r>
      <w:r><w:t>, </w:t></w:r>
      <w:r><w:rPr><w:i/></w:rPr><w:t>Italic Text Example</w:t></w:r>
      <w:r><w:t>, and </w:t></w:r>
      <w:r><w:rPr><w:b/><w:i/><w:u/></w:rPr><w:t>Bold-Italic-Underlined Text</w:t></w:r>
      <w:r><w:t>. Special characters testing: &amp;amp; symbols (&lt;tag&gt;, "quotes", © 2026, ® registered, ™ trademark, λ lambda, → arrow, and ✓ checkmark).</w:t></w:r>
    </w:p>

    <!-- 9. HYPERLINKS -->
    <w:p>
      <w:r><w:t>For more technical documentation, visit </w:t></w:r>
      <w:hyperlink r:id="rIdLink1">
        <w:r><w:rPr><w:color w:val="10B981"/><w:u/></w:rPr><w:t>Playwright Official Documentation</w:t></w:r>
      </w:hyperlink>
      <w:r><w:t> or review enterprise practices on </w:t></w:r>
      <w:hyperlink r:id="rIdLink2">
        <w:r><w:rPr><w:color w:val="10B981"/><w:u/></w:rPr><w:t>Selenium WebDriver Official Portal</w:t></w:r>
      </w:hyperlink>
      <w:r><w:t>.</w:t></w:r>
    </w:p>

    <!-- 3. NESTED BULLET LISTS -->
    <w:p>
      <w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>
      <w:r><w:t>Root Bullet Item: Quality Engineering Foundations</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr></w:pPr>
      <w:r><w:t>Nested Bullet Level 1: Deterministic Element Locators</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr></w:pPr>
      <w:r><w:t>Nested Bullet Level 1: Auto-Waiting Actionability Matrix</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>
      <w:r><w:t>Root Bullet Item: Agentic Execution Loops</w:t></w:r>
    </w:p>

    <!-- 4. NUMBERED LISTS -->
    <w:p>
      <w:r><w:t>1. Initialize Test Driver and Browser Context</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>2. Execute Autonomous Test Step with Multi-Attribute Self-Healing</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>3. Capture Trace Artifacts, Console Logs, and Har Payloads</w:t></w:r>
    </w:p>

    <!-- 5. TABLE WITH MULTIPLE ROWS AND COLUMNS -->
    <w:tbl>
      <w:tr>
        <w:trPr><w:tblHeader/></w:trPr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Capability</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Specification</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Fidelity Level</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Headings &amp; Structure</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>H1, H2, H3 with anchor IDs</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>100% Semantic Match</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Embedded Images</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Lossless extraction to persistent disk</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Preserved Native Resolution</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Code Snippets</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Syntax block with language badge &amp; copy button</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Preserved Indentation</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>

    <!-- 6. TWO EMBEDDED IMAGES -->
    <w:p>
      <w:r><w:t>Figure 1: Quality Engineering Architecture Diagram</w:t></w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline>
            <wp:docPr id="1" name="Figure 1" title="QE Architecture Diagram" descr="Agentic Quality Architecture"/>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:blipFill>
                    <a:blip r:embed="rIdImg1"/>
                  </pic:blipFill>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>

    <!-- 12. A PAGE BREAK -->
    <w:p>
      <w:r><w:br w:type="page"/></w:r>
    </w:p>

    <!-- 6b. SECOND EMBEDDED IMAGE (AFTER PAGE BREAK) -->
    <w:p>
      <w:r><w:t>Figure 2: Pipeline Orchestration &amp; Reporting</w:t></w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline>
            <wp:docPr id="2" name="Figure 2" title="Pipeline Orchestration" descr="CI/CD Pipeline Flow"/>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:blipFill>
                    <a:blip r:embed="rIdImg2"/>
                  </pic:blipFill>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>

    <!-- 7. JAVA CODE -->
    <w:p>
      <w:pPr><w:pStyle w:val="Heading3"/></w:pPr>
      <w:r><w:t>Java Selenium Enterprise Implementation</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:pStyle w:val="Code"/></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Consolas"/></w:rPr><w:t>package com.intelligentqa.tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.Test;

public class SeleniumEnterpriseTest {
    @Test
    public void verifyAutonomousHealthCheck() {
        WebDriver driver = new ChromeDriver();
        driver.get("https://intelligentqa.com/dashboard");
        System.out.println("Page Title: " + driver.getTitle());
        driver.quit();
    }
}</w:t></w:r>
    </w:p>

    <!-- 8. TYPESCRIPT CODE -->
    <w:p>
      <w:pPr><w:pStyle w:val="Heading3"/></w:pPr>
      <w:r><w:t>TypeScript Playwright Modern Framework</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:pStyle w:val="Code"/></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Consolas"/></w:rPr><w:t>import { test, expect } from '@playwright/test';

interface AssessmentPayload {
  candidateId: string;
  role: 'SDET' | 'QA_Architect';
  score: number;
}

test('verify Playwright auto-waiting actionability matrix', async ({ page }) => {
  await page.goto('/learning');
  const card = page.getByRole('heading', { name: 'What is an LLM?' });
  await expect(card).toBeVisible();
});</w:t></w:r>
    </w:p>
  </w:body>
</w:document>'''

    with zipfile.ZipFile(dest_path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', root_rels)
        z.writestr('word/_rels/document.xml.rels', doc_rels)
        z.writestr('word/document.xml', document_xml)
        z.writestr('word/media/image1.png', png1)
        z.writestr('word/media/image2.png', png2)

    print(f"Created comprehensive fidelity test DOCX at: {dest_path} (Size: {os.path.getsize(dest_path)} bytes)")

if __name__ == '__main__':
    target = os.path.join(os.getcwd(), 'public/uploads/learning/docs/fidelity_test_suite_v4.docx')
    generate_fidelity_test_docx(target)
