import fs from 'fs';
import path from 'path';
import {
  CMSArticle,
  CMSCategory,
  CMSTag,
  CMSMediaItem,
  CMSAuditLog,
  CMSStats,
  CMSRevision,
  EditorJSData,
  TableOfContentsItem,
} from '@/types/cms';

const DATA_FILE = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');

const { calculateReadingTime, generateTableOfContents } = require('./cms-engine.js');

export { calculateReadingTime, generateTableOfContents };

// Initial Default Seed Tutorial matching the reference website
export const SEED_SELENIUM_ARTICLE: CMSArticle = {
  id: 'art-selenium-java-001',
  title: 'Selenium with Java Tutorial: The Ultimate Guide for Beginners & SDETs',
  subtitle:
    'A complete, hands-on masterclass on automating web applications using Selenium WebDriver with Java. Learn architecture, setup, locators, dynamic synchronization, Page Object Model, and enterprise best practices.',
  slug: 'selenium-with-java-tutorial',
  shortDescription:
    'Comprehensive guide on Selenium with Java. Master WebDriver architecture, Maven project configuration, XPath locators, explicit waits, and Page Object Model for scalable test automation.',
  featuredImage: '/images/hero-preview.png',
  featuredImageCaption: 'Selenium WebDriver with Java Test Automation Architecture & Execution Workflow',
  category: 'UI Automation',
  tags: ['Selenium', 'Java', 'WebDriver', 'TestNG', 'Automation', 'SDET'],
  status: 'published',
  publishedDate: '2026-11-15T09:00:00.000Z',
  updatedDate: '2026-11-20T14:30:00.000Z',
  readingTimeMinutes: 14,
  viewCount: 1420,
  createdBy: {
    id: 'usr-admin-001',
    name: 'Course Administrator',
    avatarUrl: '/images/avatar-admin.png',
    role: 'Principal SDET & Architect',
    bio: 'Over 12 years of enterprise test automation and distributed test infrastructure experience.',
  },
  seoTitle: 'Selenium with Java Tutorial: Complete Guide for QA & SDETs | IntelligentQA',
  seoDescription:
    'Learn Selenium with Java from scratch. Step-by-step tutorial covering WebDriver architecture, Maven setup, locators, explicit waits, Page Object Model, and test automation best practices.',
  canonicalUrl: 'https://intelligentqa.io/blog/selenium-with-java-tutorial',
  content: {
    time: Date.now(),
    version: '2.28.0',
    blocks: [
      {
        id: 'blk-intro-1',
        type: 'paragraph',
        data: {
          text: 'In the fast-evolving landscape of modern software engineering, automated testing has transformed from an optional luxury into a mission-critical release gatekeeper. Among web automation frameworks, <strong>Selenium WebDriver paired with Java</strong> remains the undisputed industry titan, powering enterprise continuous delivery pipelines across Fortune 500 organizations.',
        },
      },
      {
        id: 'blk-callout-1',
        type: 'callout',
        data: {
          type: 'info',
          title: 'Why Selenium with Java is Essential for SDET Careers',
          message:
            'Over 70% of enterprise test automation roles explicitly list Java and Selenium as core prerequisites. Java’s strict type safety, robust multithreading, and extensive ecosystem (Maven, Gradle, TestNG, JUnit 5, Allure) make it the optimal language for scalable test architectures.',
        },
      },
      {
        id: 'blk-h2-1',
        type: 'header',
        data: {
          text: 'What is Selenium WebDriver?',
          level: 2,
          anchor: 'what-is-selenium-webdriver',
        },
      },
      {
        id: 'blk-p-2',
        type: 'paragraph',
        data: {
          text: 'Selenium is an open-source suite of automated web testing tools that allows engineers to script browser interactions across all major browser engines, including Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge. Unlike Selenium IDE (a browser record-and-playback extension), <strong>Selenium WebDriver</strong> provides a unified programmatic API that drives browser instances directly using native browser automation drivers.',
        },
      },
      {
        id: 'blk-h2-2',
        type: 'header',
        data: {
          text: 'Selenium Architecture: Under the Hood',
          level: 2,
          anchor: 'selenium-architecture-under-the-hood',
        },
      },
      {
        id: 'blk-p-3',
        type: 'paragraph',
        data: {
          text: 'To write bulletproof tests and diagnose flaky executions, an SDET must understand how command requests travel from Java code to the browser engine. The architecture consists of four distinct architectural tiers:',
        },
      },
      {
        id: 'blk-step-1',
        type: 'stepByStep',
        data: {
          title: '4-Tier Selenium WebDriver Architecture Flow',
          steps: [
            {
              stepNumber: 1,
              title: 'Selenium Client Library (Java Language Bindings)',
              badge: 'Tier 1 • Client',
              summary: 'Java code compiled with Selenium Client dependencies.',
              explanation:
                'Your Java tests use classes like WebDriver, WebElement, and By. When an action such as driver.findElement() is invoked, the client library serializes the method call into a standardized JSON payload.',
            },
            {
              stepNumber: 2,
              title: 'W3C WebDriver Standard Protocol',
              badge: 'Tier 2 • Protocol',
              summary: 'Direct RESTful JSON over HTTP communication conforming to W3C standards.',
              explanation:
                'In Selenium 4, the legacy JSON Wire Protocol was replaced by the official W3C WebDriver specification. Both client and browser drivers speak the identical dialect, eliminating encoding translation overhead.',
            },
            {
              stepNumber: 3,
              title: 'Native Browser Drivers (e.g. ChromeDriver, GeckoDriver)',
              badge: 'Tier 3 • Drivers',
              summary: 'Lightweight standalone HTTP servers maintained by browser vendors.',
              explanation:
                'ChromeDriver receives the HTTP request from Tier 1, validates the request, and executes the instructions directly against the Chrome browser rendering engine via Chrome DevTools Protocol (CDP) or native C++ hooks.',
            },
            {
              stepNumber: 4,
              title: 'Target Browser (Chromium, Firefox, Safari)',
              badge: 'Tier 4 • Browser',
              summary: 'The live browser rendering DOM elements and executing application JavaScript.',
              explanation:
                'The browser performs the requested action (click, sendKeys, navigate) and returns the HTTP status code and response payload back up the chain to your Java assertions.',
            },
          ],
        },
      },
      {
        id: 'blk-h2-3',
        type: 'header',
        data: {
          text: 'Selenium 3 vs Selenium 4: Key Differences',
          level: 2,
          anchor: 'selenium-3-vs-selenium-4-key-differences',
        },
      },
      {
        id: 'blk-comp-1',
        type: 'comparisonTable',
        data: {
          title: 'Selenium 3 vs Selenium 4 Architectural Comparison',
          columns: ['Feature / Capability', 'Selenium 3 (Legacy)', 'Selenium 4 (Modern W3C Standard)'],
          rows: [
            {
              feature: 'Communication Protocol',
              values: ['JSON Wire Protocol (requires translation encoding)', 'Native W3C Standard (direct protocol compliance)'],
            },
            {
              feature: 'Chrome DevTools Protocol (CDP)',
              values: ['Not supported natively without 3rd party wrappers', 'Full native support for Network capture, Console logs, Geolocation spoofing'],
            },
            {
              feature: 'Relative / Friendly Locators',
              values: ['Not available; requires complex XPath axes', 'Built-in: withTagName().above(), below(), toLeftOf(), toRightOf(), near()'],
            },
            {
              feature: 'Driver Binary Management',
              values: ['Manual System.setProperty() with chromedriver.exe', 'Automated Selenium Manager (zero binary downloads required)'],
            },
            {
              feature: 'Window & Tab Management',
              values: ['Requires driver.switchTo().window(handle) loops', 'Clean native API: driver.switchTo().newWindow(WindowType.TAB)'],
            },
          ],
        },
      },
      {
        id: 'blk-h2-4',
        type: 'header',
        data: {
          text: 'Setting Up a Selenium Java Project with Maven',
          level: 2,
          anchor: 'setting-up-a-selenium-java-project-with-maven',
        },
      },
      {
        id: 'blk-p-4',
        type: 'paragraph',
        data: {
          text: 'To construct an enterprise-grade test automation suite, start by generating a clean Apache Maven project. Below is the production-ready <code>pom.xml</code> declaring the latest Selenium 4 and TestNG dependencies:',
        },
      },
      {
        id: 'blk-code-1',
        type: 'code',
        data: {
          language: 'xml',
          caption: 'pom.xml - Enterprise Maven Dependencies for Selenium 4 and TestNG',
          code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>io.intelligentqa</groupId>
    <artifactId>selenium-java-framework</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <selenium.version>4.26.0</selenium.version>
        <testng.version>7.10.2</testng.version>
    </properties>

    <dependencies>
        <!-- Selenium Java Client Engine -->
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>\${selenium.version}</version>
        </dependency>

        <!-- TestNG Assertion & Execution Runner -->
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>\${testng.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`,
        },
      },
      {
        id: 'blk-terminal-1',
        type: 'terminal',
        data: {
          prompt: '$',
          caption: 'Compiling Maven dependencies and running test execution',
          code: 'mvn clean compile test -DsuiteXmlFile=testng.xml',
        },
      },
      {
        id: 'blk-h2-5',
        type: 'header',
        data: {
          text: 'Writing Your First Selenium Java Test',
          level: 2,
          anchor: 'writing-your-first-selenium-java-test',
        },
      },
      {
        id: 'blk-p-5',
        type: 'paragraph',
        data: {
          text: 'Notice how modern Selenium 4 automatically handles driver binary resolution via <strong>Selenium Manager</strong>. You do not need to manually download or set properties for <code>chromedriver.exe</code>.',
        },
      },
      {
        id: 'blk-code-2',
        type: 'code',
        data: {
          language: 'java',
          caption: 'FirstSeleniumTest.java - Clean WebDriver Launch & Assertion',
          code: `package io.intelligentqa.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class FirstSeleniumTest {
    private WebDriver driver;

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--disable-notifications");
        
        // Selenium Manager automatically resolves and initializes ChromeDriver
        driver = new ChromeDriver(options);
    }

    @Test
    public void testHomepageTitleAndNavigation() {
        driver.get("https://intelligentqa.io");

        // Verify page title
        String pageTitle = driver.getTitle();
        Assert.assertTrue(pageTitle.contains("IntelligentQA"), "Title did not match expected brand name!");

        // Locate CTA button by user-facing text and click
        WebElement coursesLink = driver.findElement(By.linkText("Courses"));
        coursesLink.click();

        // Verify current URL navigated
        Assert.assertTrue(driver.getCurrentUrl().contains("/tracks"), "Failed to navigate to courses catalog!");
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit(); // Releases OS processes and active sessions
        }
    }
}`,
        },
      },
      {
        id: 'blk-callout-2',
        type: 'callout',
        data: {
          type: 'warning',
          title: 'Crucial Practice: driver.quit() vs driver.close()',
          message:
            'Always invoke driver.quit() in your @AfterMethod teardown block. driver.close() merely shuts the currently active tab or window, leaving headless zombie ChromeDriver processes hanging in your OS memory. driver.quit() terminates all windows and gracefully kills the driver process.',
        },
      },
      {
        id: 'blk-h2-6',
        type: 'header',
        data: {
          text: 'Mastering Element Locators',
          level: 2,
          anchor: 'mastering-element-locators',
        },
      },
      {
        id: 'blk-p-6',
        type: 'paragraph',
        data: {
          text: 'The longevity of an automation test suite hinges on the resilience of its locators. Flaky tests occur when locators break upon minor CSS refactoring. Here is the priority hierarchy for locator selection:',
        },
      },
      {
        id: 'blk-tbl-1',
        type: 'table',
        data: {
          withHeadings: true,
          content: [
            ['Locator Strategy', 'Syntax Example', 'Stability Rating', 'SDET Recommendation'],
            ['ID (Unique identifier)', 'By.id("login-submit")', '⭐⭐⭐⭐⭐ High', 'Best choice if IDs are static and immutable.'],
            ['Data Test Attributes', 'By.cssSelector("[data-testid=\'user-email\']")'] ,
            ['Accessibility Name', 'By.name("searchQuery")', '⭐⭐⭐⭐ Good', 'Preferred for standard form input fields.'],
            ['Dynamic XPath with Axes', 'By.xpath("//tr[td[text()=\'Selenium\']]//button")', '⭐⭐⭐⭐ Strong', 'Essential for complex data tables.'],
            ['Full / Absolute XPath', 'By.xpath("/html/body/div[2]/div/span[1]")', '❌ Unstable', 'Strictly anti-pattern. Breaks on any DOM layout change.'],
          ],
        },
      },
      {
        id: 'blk-h2-7',
        type: 'header',
        data: {
          text: 'Handling Dynamic Synchronization: Explicit Waits',
          level: 2,
          anchor: 'handling-dynamic-synchronization-explicit-waits',
        },
      },
      {
        id: 'blk-p-7',
        type: 'paragraph',
        data: {
          text: 'Modern web applications make asynchronous AJAX requests and render DOM components dynamically. Never use <code>Thread.sleep()</code> because it halts thread execution unconditionally, inflating pipeline duration.',
        },
      },
      {
        id: 'blk-code-3',
        type: 'code',
        data: {
          language: 'java',
          caption: 'WebDriverWait & ExpectedConditions Production Pattern',
          code: `import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class DynamicSynchronizationHelper {
    public static WebElement waitForElementClickable(WebDriver driver, By locator, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        // Polls the DOM every 500ms and returns the WebElement as soon as it is clickable
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    public static boolean waitForUrlToContain(WebDriver driver, String fraction, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.urlContains(fraction));
    }
}`,
        },
      },
      {
        id: 'blk-h2-8',
        type: 'header',
        data: {
          text: 'Frequently Asked Questions (FAQ)',
          level: 2,
          anchor: 'frequently-asked-questions-faq',
        },
      },
      {
        id: 'blk-faq-1',
        type: 'faq',
        data: {
          title: 'Selenium with Java Masterclass FAQs',
          items: [
            {
              question: 'Is Selenium still relevant in 2026 with the rise of Playwright and Cypress?',
              answer:
                'Absolutely. While Playwright is popular for modern greenfield web applications, Selenium remains the cornerstone of enterprise banking, healthcare, and insurance organizations that require multi-browser legacy support, extensive grid clustering (Selenium Grid / Moon / Selenoid), and deep integration with existing Java ecosystems.',
            },
            {
              question: 'Do I still need WebDriverManager (by Boni Garcia) in Selenium 4?',
              answer:
                'No. Selenium 4 introduces built-in Selenium Manager, which natively downloads and manages browser driver binaries in the background without third-party dependencies or manual configuration.',
            },
            {
              question: 'What is the recommended Java version for modern Selenium test suites?',
              answer:
                'Java 17 LTS or Java 21 LTS is highly recommended. Modern Selenium 4 client libraries take advantage of Java 17 features including records, switch expressions, and enhanced garbage collection.',
            },
            {
              question: 'How do I run tests concurrently without session collision?',
              answer:
                'Use TestNG with parallel="methods" or parallel="tests" and wrap your WebDriver instance inside a ThreadLocal<WebDriver> container to ensure thread isolation per test.',
            },
          ],
        },
      },
    ],
  },
};

export const DEFAULT_CATEGORIES: CMSCategory[] = [
  { id: 'cat-1', name: 'UI Automation', slug: 'ui-automation', description: 'Web automation frameworks including Selenium, Playwright, and Cypress', color: '#10B981', count: 12 },
  { id: 'cat-2', name: 'API Testing', slug: 'api-testing', description: 'REST Assured, Postman, GraphQL, and microservice validation', color: '#0EA5E9', count: 8 },
  { id: 'cat-3', name: 'SDET Architecture', slug: 'sdet-architecture', description: 'Framework design patterns, Page Object Model, and test infrastructure', color: '#8B5CF6', count: 9 },
  { id: 'cat-4', name: 'CI/CD & DevOps', slug: 'cicd-devops', description: 'GitHub Actions, Jenkins, Docker, and Selenium Grid clustering', color: '#F59E0B', count: 6 },
  { id: 'cat-5', name: 'Performance & Security', slug: 'performance-security', description: 'k6, JMeter, load testing, and OWASP testing fundamentals', color: '#EC4899', count: 4 },
];

export const DEFAULT_TAGS: CMSTag[] = [
  { id: 'tag-1', name: 'Selenium', slug: 'selenium', count: 14 },
  { id: 'tag-2', name: 'Java', slug: 'java', count: 18 },
  { id: 'tag-3', name: 'Playwright', slug: 'playwright', count: 10 },
  { id: 'tag-4', name: 'TypeScript', slug: 'typescript', count: 11 },
  { id: 'tag-5', name: 'WebDriver', slug: 'webdriver', count: 12 },
  { id: 'tag-6', name: 'TestNG', slug: 'testng', count: 8 },
  { id: 'tag-7', name: 'Page Object Model', slug: 'page-object-model', count: 9 },
  { id: 'tag-8', name: 'Locators', slug: 'locators', count: 7 },
  { id: 'tag-9', name: 'Synchronization', slug: 'synchronization', count: 5 },
  { id: 'tag-10', name: 'SDET', slug: 'sdet', count: 20 },
];

export const DEFAULT_MEDIA: CMSMediaItem[] = [
  {
    id: 'med-hero-1',
    filename: 'hero-preview.png',
    originalName: 'selenium-webdriver-hero.png',
    url: '/images/hero-preview.png',
    mimeType: 'image/png',
    size: 245000,
    dimensions: { width: 1200, height: 630 },
    alt: 'Selenium WebDriver Architecture Diagram and Test Execution',
    caption: 'Selenium WebDriver Architecture Diagram',
    category: 'Architecture',
    uploadedAt: '2026-11-15T09:00:00.000Z',
    uploadedBy: 'Course Administrator',
  },
];

// In-Memory store for SSR and file persistence coordinator
class CMSDataStore {
  private articles: Map<string, CMSArticle> = new Map();
  private categories: Map<string, CMSCategory> = new Map();
  private tags: Map<string, CMSTag> = new Map();
  private media: Map<string, CMSMediaItem> = new Map();
  private auditLogs: CMSAuditLog[] = [];
  private isLoaded = false;

  constructor() {
    this.initDefaults();
    this.loadFromDisk();
  }

  private initDefaults() {
    this.articles.set(SEED_SELENIUM_ARTICLE.id, SEED_SELENIUM_ARTICLE);
    for (const cat of DEFAULT_CATEGORIES) {
      this.categories.set(cat.id, cat);
    }
    for (const tag of DEFAULT_TAGS) {
      this.tags.set(tag.id, tag);
    }
    for (const med of DEFAULT_MEDIA) {
      this.media.set(med.id, med);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.articles) && data.articles.length > 0) {
          this.articles.clear();
          for (const art of data.articles) {
            this.articles.set(art.id, art);
          }
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          this.categories.clear();
          for (const cat of data.categories) {
            this.categories.set(cat.id, cat);
          }
        }
        if (Array.isArray(data.tags) && data.tags.length > 0) {
          this.tags.clear();
          for (const tag of data.tags) {
            this.tags.set(tag.id, tag);
          }
        }
        if (Array.isArray(data.media) && data.media.length > 0) {
          this.media.clear();
          for (const med of data.media) {
            this.media.set(med.id, med);
          }
        }
        if (Array.isArray(data.cmsAuditLogs)) {
          this.auditLogs = data.cmsAuditLogs;
        }
      }
      this.isLoaded = true;
    } catch (e) {
      console.error('Failed to load CMS data from disk:', e);
    }
  }

  private saveToDisk() {
    try {
      let existingData: Record<string, any> = {};
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        existingData = JSON.parse(raw);
      }
      existingData.articles = Array.from(this.articles.values());
      existingData.categories = Array.from(this.categories.values());
      existingData.tags = Array.from(this.tags.values());
      existingData.media = Array.from(this.media.values());
      existingData.cmsAuditLogs = this.auditLogs.slice(-100); // keep recent 100

      fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist CMS data to disk:', e);
    }
  }

  // Articles
  public getArticles(filter?: {
    status?: string;
    category?: string;
    tag?: string;
    search?: string;
  }): CMSArticle[] {
    this.loadFromDisk();
    let list = Array.from(this.articles.values());

    if (filter?.status && filter.status !== 'all') {
      list = list.filter((a) => a.status === filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      list = list.filter((a) => a.category.toLowerCase() === filter.category?.toLowerCase());
    }
    if (filter?.tag && filter.tag !== 'all') {
      list = list.filter((a) => a.tags.some((t) => t.toLowerCase() === filter.tag?.toLowerCase()));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.shortDescription.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list.sort(
      (a, b) => new Date(b.updatedDate || b.publishedDate || 0).getTime() - new Date(a.updatedDate || a.publishedDate || 0).getTime()
    );
  }

  public getArticleById(id: string): CMSArticle | null {
    this.loadFromDisk();
    return this.articles.get(id) || null;
  }

  public getArticleBySlug(slug: string): CMSArticle | null {
    this.loadFromDisk();
    const clean = slug.trim().toLowerCase();
    for (const art of this.articles.values()) {
      if (art.slug.toLowerCase() === clean) {
        return art;
      }
    }
    return null;
  }

  public saveArticle(article: Partial<CMSArticle>, authorUser?: any): CMSArticle {
    this.loadFromDisk();
    const now = new Date().toISOString();
    const id = article.id || `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const existing = this.articles.get(id);

    // Compute reading time
    const readingTimeMinutes = article.content ? calculateReadingTime(article.content) : existing?.readingTimeMinutes || 5;

    // Create revision snapshot if updating existing
    const revisions: CMSRevision[] = existing?.revisions ? [...existing.revisions] : [];
    if (existing && existing.content) {
      revisions.unshift({
        id: `rev-${Date.now()}`,
        articleId: existing.id,
        title: existing.title,
        content: JSON.parse(JSON.stringify(existing.content)),
        createdAt: now,
        createdBy: authorUser?.displayName || authorUser?.email || 'Admin',
        summary: `Revision snapshot before update on ${new Date().toLocaleDateString()}`,
      });
      // Keep max 10 revisions
      if (revisions.length > 10) revisions.pop();
    }

    const saved: CMSArticle = {
      id,
      title: article.title || existing?.title || 'Untitled Tutorial',
      subtitle: article.subtitle ?? existing?.subtitle,
      slug: (article.slug || existing?.slug || article.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || id).toLowerCase(),
      shortDescription: article.shortDescription || existing?.shortDescription || '',
      featuredImage: article.featuredImage ?? existing?.featuredImage,
      featuredImageCaption: article.featuredImageCaption ?? existing?.featuredImageCaption,
      category: article.category || existing?.category || 'UI Automation',
      tags: Array.isArray(article.tags) ? article.tags : existing?.tags || ['Automation'],
      content: article.content || existing?.content || { time: Date.now(), blocks: [], version: '2.28.0' },
      seoTitle: article.seoTitle ?? existing?.seoTitle,
      seoDescription: article.seoDescription ?? existing?.seoDescription,
      canonicalUrl: article.canonicalUrl ?? existing?.canonicalUrl,
      status: article.status || existing?.status || 'draft',
      publishedDate: article.status === 'published' ? (existing?.publishedDate || now) : existing?.publishedDate,
      scheduledDate: article.scheduledDate ?? existing?.scheduledDate,
      updatedDate: now,
      readingTimeMinutes,
      viewCount: existing?.viewCount || 0,
      createdBy: existing?.createdBy || {
        id: authorUser?.id || 'usr-admin-001',
        name: authorUser?.displayName || 'Course Administrator',
        avatarUrl: authorUser?.avatarUrl || '/images/avatar-admin.png',
        role: authorUser?.targetRole || 'Principal SDET',
      },
      updatedBy: authorUser ? { id: authorUser.id, name: authorUser.displayName || authorUser.email } : undefined,
      courseId: article.courseId ?? existing?.courseId,
      moduleId: article.moduleId ?? existing?.moduleId,
      lessonId: article.lessonId ?? existing?.lessonId,
      revisions,
    };

    this.articles.set(id, saved);
    this.saveToDisk();

    this.logAudit({
      id: `log-${Date.now()}`,
      timestamp: now,
      user: { id: authorUser?.id || 'admin', name: authorUser?.displayName || 'Admin', email: authorUser?.email || 'admin@intelligentqa.io' },
      action: existing ? 'update' : 'create',
      entityType: 'article',
      entityId: id,
      entityTitle: saved.title,
      details: `Article "${saved.title}" (${saved.status}) saved`,
    });

    return saved;
  }

  public deleteArticle(id: string, user?: any): boolean {
    this.loadFromDisk();
    const existing = this.articles.get(id);
    if (!existing) return false;

    this.articles.delete(id);
    this.saveToDisk();

    this.logAudit({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: { id: user?.id || 'admin', name: user?.displayName || 'Admin', email: user?.email || 'admin@intelligentqa.io' },
      action: 'delete',
      entityType: 'article',
      entityId: id,
      entityTitle: existing.title,
      details: `Deleted article "${existing.title}"`,
    });

    return true;
  }

  public duplicateArticle(id: string, user?: any): CMSArticle | null {
    this.loadFromDisk();
    const original = this.articles.get(id);
    if (!original) return null;

    const newId = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const cloned: CMSArticle = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      publishedDate: undefined,
      updatedDate: new Date().toISOString(),
      viewCount: 0,
      revisions: [],
    };

    this.articles.set(newId, cloned);
    this.saveToDisk();
    return cloned;
  }

  public restoreRevision(articleId: string, revisionId: string, user?: any): CMSArticle | null {
    this.loadFromDisk();
    const article = this.articles.get(articleId);
    if (!article || !article.revisions) return null;

    const revision = article.revisions.find((r) => r.id === revisionId);
    if (!revision) return null;

    const restored = this.saveArticle(
      {
        ...article,
        content: JSON.parse(JSON.stringify(revision.content)),
      },
      user
    );

    return restored;
  }

  // Media Library
  public getMedia(search?: string, category?: string): CMSMediaItem[] {
    this.loadFromDisk();
    let list = Array.from(this.media.values());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.filename.toLowerCase().includes(q) || m.alt.toLowerCase().includes(q));
    }
    if (category && category !== 'all') {
      list = list.filter((m) => m.category?.toLowerCase() === category.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  public saveMediaItem(item: CMSMediaItem, user?: any): CMSMediaItem {
    this.loadFromDisk();
    this.media.set(item.id, item);
    this.saveToDisk();

    this.logAudit({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: { id: user?.id || 'admin', name: user?.displayName || 'Admin', email: user?.email || 'admin@intelligentqa.io' },
      action: 'upload_media',
      entityType: 'media',
      entityId: item.id,
      entityTitle: item.filename,
      details: `Uploaded media ${item.filename} (${item.mimeType})`,
    });

    return item;
  }

  public deleteMediaItem(id: string): { success: boolean; inUseCount?: number; message?: string } {
    this.loadFromDisk();
    const item = this.media.get(id);
    if (!item) return { success: false, message: 'Media not found' };

    // Reference check: check if media is in use across any article
    let inUseCount = 0;
    for (const art of this.articles.values()) {
      if (art.featuredImage === item.url) inUseCount++;
      if (art.content?.blocks) {
        for (const blk of art.content.blocks) {
          if (blk.type === 'image' && (blk.data as any).file?.url === item.url) {
            inUseCount++;
          }
        }
      }
    }

    if (inUseCount > 0) {
      return {
        success: false,
        inUseCount,
        message: `Cannot delete: media is currently referenced by ${inUseCount} article(s). Replace or remove references first.`,
      };
    }

    this.media.delete(id);
    this.saveToDisk();
    return { success: true };
  }

  // Categories & Tags
  public getCategories(): CMSCategory[] {
    this.loadFromDisk();
    return Array.from(this.categories.values());
  }

  public saveCategory(cat: Partial<CMSCategory>): CMSCategory {
    this.loadFromDisk();
    const id = cat.id || `cat-${Date.now()}`;
    const slug = (cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || id).toLowerCase();
    const saved: CMSCategory = {
      id,
      name: cat.name || 'General',
      slug,
      description: cat.description || '',
      color: cat.color || '#10B981',
      count: cat.count || 0,
    };
    this.categories.set(id, saved);
    this.saveToDisk();
    return saved;
  }

  public deleteCategory(id: string): boolean {
    this.loadFromDisk();
    const res = this.categories.delete(id);
    if (res) this.saveToDisk();
    return res;
  }

  public getTags(): CMSTag[] {
    this.loadFromDisk();
    return Array.from(this.tags.values());
  }

  public saveTag(tag: Partial<CMSTag>): CMSTag {
    this.loadFromDisk();
    const id = tag.id || `tag-${Date.now()}`;
    const slug = (tag.slug || tag.name?.toLowerCase().replace(/\s+/g, '-') || id).toLowerCase();
    const saved: CMSTag = {
      id,
      name: tag.name || 'Topic',
      slug,
      count: tag.count || 0,
    };
    this.tags.set(id, saved);
    this.saveToDisk();
    return saved;
  }

  public deleteTag(id: string): boolean {
    this.loadFromDisk();
    const res = this.tags.delete(id);
    if (res) this.saveToDisk();
    return res;
  }

  // Dashboard Stats
  public getCMSStats(): CMSStats {
    this.loadFromDisk();
    const allArticles = Array.from(this.articles.values());
    const published = allArticles.filter((a) => a.status === 'published');
    const drafts = allArticles.filter((a) => a.status === 'draft');
    const scheduled = allArticles.filter((a) => a.status === 'scheduled');
    const archived = allArticles.filter((a) => a.status === 'archived');

    // Load courses count from curriculum
    let totalCourses = 4;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.tracks)) {
          totalCourses = data.tracks.length;
        }
      }
    } catch {}

    const recentlyUpdated = [...allArticles]
      .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())
      .slice(0, 5);

    const recentlyPublished = [...published]
      .sort((a, b) => new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime())
      .slice(0, 5);

    return {
      totalCourses,
      totalArticles: allArticles.length,
      publishedArticles: published.length,
      draftArticles: drafts.length,
      scheduledArticles: scheduled.length,
      archivedArticles: archived.length,
      totalMediaItems: this.media.size,
      recentlyUpdated,
      recentlyPublished,
    };
  }

  // Audit Logs
  public getAuditLogs(): CMSAuditLog[] {
    this.loadFromDisk();
    return [...this.auditLogs].reverse();
  }

  public logAudit(log: CMSAuditLog) {
    this.auditLogs.push(log);
    if (this.auditLogs.length > 200) this.auditLogs.shift();
    this.saveToDisk();
  }
}

// Global Singleton
export const cmsStore = new CMSDataStore();
