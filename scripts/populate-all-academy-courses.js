const fs = require('fs');
const path = require('path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(__dirname, '../src'),
  },
});

const { QA_TRACKS } = jiti('../src/lib/qa-curriculum.ts');

const DATA_FILE = path.join(__dirname, '../src/lib/curriculum-data-store.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

function generateHtmlFromLegacyLesson(lesson, courseTitle) {
  const manual = lesson.manualContext || {};
  const auto = lesson.automationContext || {};
  const ai = lesson.aiAugmentation || {};
  const challenge = lesson.challenge || {};

  return `
    <div class="space-y-6 text-slate-800 dark:text-neutral-200">
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
        <h2 class="text-xl font-bold mb-2 text-slate-900 dark:text-white">${lesson.title}</h2>
        <p class="text-sm text-slate-600 dark:text-neutral-400">${lesson.description || ''}</p>
      </div>

      ${manual.title ? `
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <h3 class="text-sm font-bold text-amber-500 mb-2">Manual Testing Context: ${manual.title}</h3>
          <ul class="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-neutral-300">
            ${(manual.steps || []).map(s => `<li>${s}</li>`).join('')}
          </ul>
          ${manual.painPoints && manual.painPoints.length > 0 ? `
            <div class="mt-2 pt-2 border-t border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
              <strong>Pain Points:</strong> ${manual.painPoints.join(' ')}
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${auto.explanation ? `
        <div class="space-y-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Automation Architecture</h3>
          <p class="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">${auto.explanation}</p>
        </div>
      ` : ''}

      ${auto.seleniumJava ? `
        <div class="space-y-2">
          <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">Java Production Implementation</h4>
          <pre class="p-4 rounded-xl bg-[#161616] text-[#81FF89] text-xs font-mono overflow-x-auto border border-[#2D2D2D]"><code>${escapeHtml(auto.seleniumJava)}</code></pre>
        </div>
      ` : ''}

      ${auto.playwrightTs ? `
        <div class="space-y-2">
          <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">TypeScript / Playwright Implementation</h4>
          <pre class="p-4 rounded-xl bg-[#161616] text-[#80FFF9] text-xs font-mono overflow-x-auto border border-[#2D2D2D]"><code>${escapeHtml(auto.playwrightTs)}</code></pre>
        </div>
      ` : ''}

      ${auto.bestPractices && auto.bestPractices.length > 0 ? `
        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <h4 class="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">Enterprise Best Practices</h4>
          <ul class="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-neutral-300">
            ${auto.bestPractices.map(bp => `<li>${bp}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${auto.antiPatterns && auto.antiPatterns.length > 0 ? `
        <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <h4 class="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Anti-Patterns to Avoid</h4>
          <ul class="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-neutral-300">
            ${auto.antiPatterns.map(ap => `<li>${ap}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${ai.promptExample ? `
        <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
          <h4 class="text-xs font-bold text-purple-400 uppercase tracking-wider">AI SDET Co-Pilot Prompts</h4>
          <p class="text-xs text-slate-700 dark:text-neutral-300 font-mono bg-[#181818] p-2.5 rounded-lg border border-purple-500/30">
            "${ai.promptExample}"
          </p>
          ${ai.agenticWorkflow ? `<p class="text-[11px] text-zinc-400">${ai.agenticWorkflow}</p>` : ''}
        </div>
      ` : ''}

      ${challenge.instruction ? `
        <div class="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-2">
          <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">Hands-On Practice Challenge</h4>
          <p class="text-xs text-slate-700 dark:text-neutral-300">${challenge.instruction}</p>
          ${challenge.solutionCode && challenge.solutionCode.java ? `
            <details class="text-xs mt-2">
              <summary class="cursor-pointer text-sky-400 font-semibold hover:underline">View Verified Solution</summary>
              <pre class="p-3 mt-2 rounded-lg bg-[#181818] text-[#81FF89] font-mono overflow-x-auto"><code>${escapeHtml(challenge.solutionCode.java)}</code></pre>
            </details>
          ` : ''}
          ${challenge.solutionCode && challenge.solutionCode.typescript ? `
            <details class="text-xs mt-2">
              <summary class="cursor-pointer text-emerald-400 font-semibold hover:underline">View TypeScript Solution</summary>
              <pre class="p-3 mt-2 rounded-lg bg-[#181818] text-[#80FFF9] font-mono overflow-x-auto"><code>${escapeHtml(challenge.solutionCode.typescript)}</code></pre>
            </details>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function makeSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 1. Process Selenium (Java) Course
const selTrack = QA_TRACKS.find(t => t.id === 'selenium-java');
if (selTrack) {
  const selCourse = data.academyCourses.find(c => c.id === 'course-selenium-mastery');
  if (selCourse) {
    selCourse.title = 'Selenium WebDriver 4 Enterprise Framework Architecture';
    selCourse.status = 'published';
    const lessons = selTrack.modules.flatMap(m => m.lessons);

    const moduleDefs = [
      { id: 'mod-sel-1', title: 'Module 1: Core Java OOPs for Automation', slice: [0, 3] },
      { id: 'mod-sel-2', title: 'Module 2: Selenium 4 WebDriver Setup & Locators', slice: [3, 6] },
      { id: 'mod-sel-3', title: 'Module 3: Dynamic Waits, Synchronization & Frames', slice: [6, 9] },
      { id: 'mod-sel-4', title: 'Module 4: Enterprise Page Object Model & Grids', slice: [9, 13] },
    ];

    selCourse.modules = moduleDefs.map((mDef, mIdx) => {
      const modLessons = lessons.slice(mDef.slice[0], mDef.slice[1]);
      return {
        id: mDef.id,
        courseId: selCourse.id,
        slug: makeSlug(mDef.title),
        title: mDef.title,
        description: `Enterprise automation practices for ${mDef.title}.`,
        sortOrder: mIdx + 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: modLessons.map((l, lIdx) => ({
          id: `les-sel-${l.id}`,
          moduleId: mDef.id,
          courseId: selCourse.id,
          slug: l.id,
          title: l.title,
          summary: l.description,
          shortDescription: l.description,
          contentType: 'docx',
          contentHtml: generateHtmlFromLegacyLesson(l, selCourse.title),
          originalDocxPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
          originalDocumentPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
          pdfPath: `/uploads/learning/docs/ai_academy_what-is-artificial-intelligence_print.html`,
          estimatedReadingTime: Math.max(5, Math.round(l.durationMinutes / 15)),
          estimatedReadTime: Math.max(5, Math.round(l.durationMinutes / 15)),
          wordCount: 850,
          sortOrder: lIdx + 1,
          status: 'published',
          createdAt: '2026-11-23T00:00:00.000Z',
          updatedAt: '2026-11-23T00:00:00.000Z',
          publishedAt: '2026-11-23T00:00:00.000Z',
        })),
      };
    });
    console.log(`Populated Selenium Course with ${selCourse.modules.length} modules, ${lessons.length} lessons.`);
  }
}

// 2. Process Playwright (TypeScript) Course
const pwTrack = QA_TRACKS.find(t => t.id === 'playwright-ts');
if (pwTrack) {
  const pwCourse = data.academyCourses.find(c => c.id === 'course-playwright-mastery');
  if (pwCourse) {
    pwCourse.title = 'Playwright Automation with TypeScript';
    pwCourse.status = 'published';
    const lessons = pwTrack.modules.flatMap(m => m.lessons);

    const moduleDefs = [
      { id: 'mod-pw-1', title: 'Module 1: Modern Web Automation Fundamentals', slice: [0, 4] },
      { id: 'mod-pw-2', title: 'Module 2: Auto-Waiting, Network Interception & Mocking', slice: [4, 8] },
      { id: 'mod-pw-3', title: 'Module 3: Advanced Contexts, Multi-Tab & Storage State', slice: [8, 12] },
      { id: 'mod-pw-4', title: 'Module 4: Scalable Page Object Model & CI Sharding', slice: [12, 16] },
    ];

    pwCourse.modules = moduleDefs.map((mDef, mIdx) => {
      const modLessons = lessons.slice(mDef.slice[0], mDef.slice[1]);
      return {
        id: mDef.id,
        courseId: pwCourse.id,
        slug: makeSlug(mDef.title),
        title: mDef.title,
        description: `Modern end-to-end testing with ${mDef.title}.`,
        sortOrder: mIdx + 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: modLessons.map((l, lIdx) => ({
          id: `les-pw-${l.id}`,
          moduleId: mDef.id,
          courseId: pwCourse.id,
          slug: l.id,
          title: l.title,
          summary: l.description,
          shortDescription: l.description,
          contentType: 'docx',
          contentHtml: generateHtmlFromLegacyLesson(l, pwCourse.title),
          originalDocxPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
          originalDocumentPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
          pdfPath: `/uploads/learning/docs/ai_academy_what-is-artificial-intelligence_print.html`,
          estimatedReadingTime: Math.max(5, Math.round(l.durationMinutes / 15)),
          estimatedReadTime: Math.max(5, Math.round(l.durationMinutes / 15)),
          wordCount: 850,
          sortOrder: lIdx + 1,
          status: 'published',
          createdAt: '2026-11-23T00:00:00.000Z',
          updatedAt: '2026-11-23T00:00:00.000Z',
          publishedAt: '2026-11-23T00:00:00.000Z',
        })),
      };
    });
    console.log(`Populated Playwright Course with ${pwCourse.modules.length} modules, ${lessons.length} lessons.`);
  }
}

// 3. Process REST Assured Course
const apiTrack = QA_TRACKS.find(t => t.id === 'api-testing');
if (apiTrack) {
  const raCourse = data.academyCourses.find(c => c.id === 'course-rest-assured');
  if (raCourse) {
    raCourse.title = 'REST Assured: Enterprise API Automation with Java';
    raCourse.status = 'published';
    const lessons = apiTrack.modules.flatMap(m => m.lessons);

    const moduleDefs = [
      { id: 'mod-ra-1', title: 'Module 1: HTTP Protocols & REST Assured Fundamentals', slice: [0, 3] },
      { id: 'mod-ra-2', title: 'Module 2: Authentication, OAuth2 & Specifications', slice: [3, 6] },
      { id: 'mod-ra-3', title: 'Module 3: JSON Schema, POJO Serialization & Framework Design', slice: [6, 11] },
    ];

    raCourse.modules = moduleDefs.map((mDef, mIdx) => {
      const modLessons = lessons.slice(mDef.slice[0], mDef.slice[1]);
      return {
        id: mDef.id,
        courseId: raCourse.id,
        slug: makeSlug(mDef.title),
        title: mDef.title,
        description: `API test automation with ${mDef.title}.`,
        sortOrder: mIdx + 1,
        status: 'published',
        createdAt: '2026-11-23T00:00:00.000Z',
        updatedAt: '2026-11-23T00:00:00.000Z',
        lessons: modLessons.map((l, lIdx) => ({
          id: `les-ra-${l.id}`,
          moduleId: mDef.id,
          courseId: raCourse.id,
          slug: l.id,
          title: l.title,
          summary: l.description,
          shortDescription: l.description,
          contentType: 'docx',
          contentHtml: generateHtmlFromLegacyLesson(l, raCourse.title),
          originalDocxPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
          originalDocumentPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
          pdfPath: `/uploads/learning/docs/ai_academy_what-is-artificial-intelligence_print.html`,
          estimatedReadingTime: Math.max(5, Math.round(l.durationMinutes / 15)),
          estimatedReadTime: Math.max(5, Math.round(l.durationMinutes / 15)),
          wordCount: 850,
          sortOrder: lIdx + 1,
          status: 'published',
          createdAt: '2026-11-23T00:00:00.000Z',
          updatedAt: '2026-11-23T00:00:00.000Z',
          publishedAt: '2026-11-23T00:00:00.000Z',
        })),
      };
    });
    console.log(`Populated REST Assured Course with ${raCourse.modules.length} modules, ${lessons.length} lessons.`);
  }
}

// 4. Helper to generate standard rich lessons for new tracks
function makeRichTechnicalLesson(courseId, modId, slug, title, summary, topic, codeLang, codeSnippet) {
  const contentHtml = `
    <div class="space-y-6 text-slate-800 dark:text-neutral-200">
      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-2">
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">${topic}</span>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">${title}</h2>
        <p class="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">${summary}</p>
      </div>

      <div class="space-y-3">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">1. Architectural Foundations</h3>
        <p class="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
          Production automation requires reliable, deterministic execution across environments. Understanding ${title.toLowerCase()} eliminates flaky builds, accelerates feedback loops, and provides enterprise-grade observability for test suites.
        </p>
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Production Implementation Code</h4>
        <pre class="p-4 rounded-xl bg-[#161616] text-[#81FF89] text-xs font-mono overflow-x-auto border border-[#2D2D2D]"><code>${escapeHtml(codeSnippet)}</code></pre>
      </div>

      <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Enterprise Best Practices</h4>
        <ul class="list-disc list-inside space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
          <li><strong>Fail-Fast Execution:</strong> Abort immediately when preconditions fail to preserve CI agent compute minutes.</li>
          <li><strong>Idempotent Operations:</strong> Ensure tests can be executed repeatedly in parallel without state pollution.</li>
          <li><strong>Zero Hardcoded Credentials:</strong> Always inject API tokens, secrets, and environment URLs through secure credential vaults.</li>
        </ul>
      </div>

      <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
        <h4 class="text-xs font-bold text-purple-400 uppercase tracking-wider">Top Interview Question &amp; Solution</h4>
        <p class="text-xs font-bold text-white">Q: How do you design an enterprise-grade framework around ${title}?</p>
        <p class="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
          A: Separate concerns into Driver Lifecycle, Object Repository, Dynamic Test Data Providers, and Centralized Reporting. Abstract the underlying technology behind reusable interfaces so tests remain resilient to low-level API changes.
        </p>
      </div>
    </div>
  `;

  return {
    id: `les-${slug}`,
    moduleId: modId,
    courseId,
    slug,
    title,
    summary,
    shortDescription: summary,
    contentType: 'docx',
    contentHtml,
    originalDocxPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
    originalDocumentPath: `/uploads/learning/docs/sample_what_is_an_llm.docx`,
    pdfPath: `/uploads/learning/docs/ai_academy_what-is-artificial-intelligence_print.html`,
    estimatedReadingTime: 8,
    estimatedReadTime: 8,
    wordCount: 950,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-11-23T00:00:00.000Z',
    updatedAt: '2026-11-23T00:00:00.000Z',
    publishedAt: '2026-11-23T00:00:00.000Z',
  };
}

// 5. Populate Appium 2.0 Course
const appiumCourse = data.academyCourses.find(c => c.id === 'course-appium');
if (appiumCourse) {
  appiumCourse.status = 'published';
  appiumCourse.modules = [
    {
      id: 'mod-app-1',
      courseId: appiumCourse.id,
      slug: 'appium-2-modular-ecosystem',
      title: 'Module 1: Appium 2.0 Architecture & Driver Setup',
      description: 'Master decoupled Appium 2.0 CLI drivers, UiAutomator2, and XCUITest engines.',
      sortOrder: 1,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          appiumCourse.id,
          'mod-app-1',
          'appium-2-modular-ecosystem',
          '1.1 Appium 2.0 Modular Drivers & Plugins',
          'Understand independent driver lifecycle, CLI management, and plugin architecture.',
          'Mobile Automation',
          'bash',
          'npm i -g appium@next\nappium driver install uiautomator2\nappium driver install xcuitest\nappium plugin install images\nappium --use-plugins=images'
        ),
        makeRichTechnicalLesson(
          appiumCourse.id,
          'mod-app-1',
          'android-ios-driver-capabilities',
          '1.2 UiAutomator2 & XCUITest Capabilities Matrix',
          'Configure W3C compliant capabilities for real devices, emulators, and cloud farms.',
          'Device Management',
          'java',
          'UiAutomator2Options options = new UiAutomator2Options()\n    .setDeviceName("Pixel_7_API_33")\n    .setApp("/apps/production-release.apk")\n    .setAutoGrantPermissions(true);\nAndroidDriver driver = new AndroidDriver(new URL("http://127.0.0.1:4723"), options);'
        )
      ]
    },
    {
      id: 'mod-app-2',
      courseId: appiumCourse.id,
      slug: 'mobile-gestures-and-pom',
      title: 'Module 2: W3C Mobile Gestures & Framework Design',
      description: 'Master pointer action swipes, pinch-to-zoom, and Page Object Models for native apps.',
      sortOrder: 2,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          appiumCourse.id,
          'mod-app-2',
          'w3c-mobile-actions-gestures',
          '2.1 W3C Pointer Actions & Smooth Scrolling',
          'Zero-flake mobile gesture automation without brittle absolute coordinate taps.',
          'W3C Pointer Actions',
          'java',
          'PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");\nSequence scroll = new Sequence(finger, 1);\nscroll.addAction(finger.createPointerMove(Duration.ZERO, Origin.viewport(), startX, startY));\nscroll.addAction(finger.createPointerDown(MouseButton.LEFT.asArg()));\nscroll.addAction(finger.createPointerMove(Duration.ofMillis(600), Origin.viewport(), startX, endY));\nscroll.addAction(finger.createPointerUp(MouseButton.LEFT.asArg()));\ndriver.perform(Arrays.asList(scroll));'
        ),
        makeRichTechnicalLesson(
          appiumCourse.id,
          'mod-app-2',
          'mobile-page-object-model',
          '2.2 Mobile Page Object Model & Cloud Execution',
          'Structure scalable cross-platform Android/iOS tests running on BrowserStack and Sauce Labs.',
          'Framework Design',
          'java',
          'public class LoginScreen extends BaseMobileScreen {\n    @AndroidFindBy(accessibility = "username_input")\n    @iOSXCUITFindBy(accessibility = "username_field")\n    private WebElement usernameInput;\n\n    public HomeScreen login(String user, String pwd) {\n        usernameInput.sendKeys(user);\n        return new HomeScreen(driver);\n    }\n}'
        )
      ]
    }
  ];
  console.log(`Populated Appium Course with ${appiumCourse.modules.length} modules, 4 lessons.`);
}

// 6. Populate GitHub Actions Course
const ghaCourse = data.academyCourses.find(c => c.id === 'course-github-actions');
if (ghaCourse) {
  ghaCourse.status = 'published';
  ghaCourse.modules = [
    {
      id: 'mod-gha-1',
      courseId: ghaCourse.id,
      slug: 'github-actions-workflows-triggers',
      title: 'Module 1: Workflow Triggers & Parallel Execution',
      description: 'Build enterprise CI pipelines that trigger on PRs and run tests concurrently.',
      sortOrder: 1,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          ghaCourse.id,
          'mod-gha-1',
          'pr-test-gate-workflow',
          '1.1 Building a PR Quality Gate Workflow',
          'Trigger fast smoke tests on PRs to block broken merges before they hit main.',
          'CI/CD Pipelines',
          'yaml',
          'name: QA Quality Gate\non:\n  pull_request:\n    branches: [ main ]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n      - run: npm ci\n      - run: npx playwright test --project=chromium'
        ),
        makeRichTechnicalLesson(
          ghaCourse.id,
          'mod-gha-1',
          'matrix-sharding-execution',
          '1.2 Matrix Builds & Playwright Sharding',
          'Slash regression test time from 45 minutes to 5 minutes using 8-way matrix shards.',
          'Parallel Execution',
          'yaml',
          'strategy:\n  fail-fast: false\n  matrix:\n    shardIndex: [1, 2, 3, 4]\n    shardTotal: [4]\nsteps:\n  - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}'
        )
      ]
    },
    {
      id: 'mod-gha-2',
      courseId: ghaCourse.id,
      slug: 'secrets-artifacts-reporting',
      title: 'Module 2: Secrets, Artifacts & Test Reporting',
      description: 'Secure credentials, publish JUnit reports, and deploy interactive Allure test dashboards.',
      sortOrder: 2,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          ghaCourse.id,
          'mod-gha-2',
          'github-secrets-env-management',
          '2.1 Secrets Management & Dynamic Environment Variables',
          'Inject staging passwords and API keys without leaking plain-text credentials in logs.',
          'Security in CI',
          'yaml',
          'env:\n  API_SECRET_KEY: ${{ secrets.QA_PROD_BEARER_TOKEN }}\n  BASE_URL: ${{ vars.STAGING_ENDPOINT }}\nsteps:\n  - run: mvn test -Dsuite=api-regression'
        ),
        makeRichTechnicalLesson(
          ghaCourse.id,
          'mod-gha-2',
          'test-artifacts-allure-deployments',
          '2.2 Test Artifacts & Allure Report Deployments',
          'Archive failure screenshots, video recordings, and auto-deploy HTML test reports to GitHub Pages.',
          'Test Reporting',
          'yaml',
          '- uses: actions/upload-artifact@v4\n  if: always()\n  with:\n    name: playwright-report\n    path: playwright-report/\n    retention-days: 14'
        )
      ]
    }
  ];
  console.log(`Populated GitHub Actions Course with ${ghaCourse.modules.length} modules, 4 lessons.`);
}

// 7. Populate Jenkins Course
const jenkinsCourse = data.academyCourses.find(c => c.id === 'course-jenkins');
if (jenkinsCourse) {
  jenkinsCourse.status = 'published';
  jenkinsCourse.modules = [
    {
      id: 'mod-jen-1',
      courseId: jenkinsCourse.id,
      slug: 'declarative-jenkinsfile-structure',
      title: 'Module 1: Declarative Jenkinsfile Structure',
      description: 'Master Declarative pipeline syntax, agent stages, and parameterized builds.',
      sortOrder: 1,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          jenkinsCourse.id,
          'mod-jen-1',
          'declarative-syntax-essentials',
          '1.1 Declarative Jenkinsfile Structure for QA',
          'Structure enterprise Jenkins pipelines with clean stages, parameters, and post-actions.',
          'Jenkins CI',
          'groovy',
          'pipeline {\n    agent any\n    parameters {\n        choice(name: "ENVIRONMENT", choices: ["QA", "STAGING"], description: "Target Cluster")\n    }\n    stages {\n        stage("Execute Tests") {\n            steps {\n                sh "mvn test -Denv=${params.ENVIRONMENT}"\n            }\n        }\n    }\n}'
        ),
        makeRichTechnicalLesson(
          jenkinsCourse.id,
          'mod-jen-1',
          'multibranch-webhook-triggers',
          '1.2 Multi-Branch Pipelines & Webhook Triggers',
          'Automatically scan Git branches, trigger PR verification builds, and post commit statuses.',
          'Branch CI',
          'groovy',
          'stage("Git Checkout") {\n    steps {\n        checkout scmGit(branches: [[name: "*/${BRANCH_NAME}"]], userRemoteConfigs: [[url: "git@github.com:org/repo.git"]])\n    }\n}'
        )
      ]
    },
    {
      id: 'mod-jen-2',
      courseId: jenkinsCourse.id,
      slug: 'parallel-stages-and-reporting',
      title: 'Module 2: Parallel Stages & Slack Notifications',
      description: 'Scale tests across multiple Docker nodes and broadcast test summaries to Slack.',
      sortOrder: 2,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          jenkinsCourse.id,
          'mod-jen-2',
          'parallel-stages-docker-agents',
          '2.1 Parallel Test Execution on Docker Agents',
          'Run UI tests and API tests concurrently on isolated containerized nodes.',
          'Parallel Stages',
          'groovy',
          'stage("Parallel Regression") {\n    parallel {\n        stage("UI Suite") { steps { sh "npm run test:ui" } }\n        stage("API Suite") { steps { sh "npm run test:api" } }\n    }\n}'
        ),
        makeRichTechnicalLesson(
          jenkinsCourse.id,
          'mod-jen-2',
          'jenkins-html-reporting-slack',
          '2.2 Automated HTML Reports & Slack Notifications',
          'Publish HTML test reports and send formatted Slack alerts with pass/fail counts.',
          'Observability',
          'groovy',
          'post {\n    always {\n        publishHTML(target: [reportDir: "target/surefire-reports", reportFiles: "index.html", reportName: "QA Report"])\n        slackSend(channel: "#qa-alerts", color: currentBuild.currentResult == "SUCCESS" ? "good" : "danger", message: "Build ${env.BUILD_NUMBER} Finished: ${currentBuild.currentResult}")\n    }\n}'
        )
      ]
    }
  ];
  console.log(`Populated Jenkins Course with ${jenkinsCourse.modules.length} modules, 4 lessons.`);
}

// 8. Populate Azure DevOps Course
const adoCourse = data.academyCourses.find(c => c.id === 'course-azure-devops');
if (adoCourse) {
  adoCourse.status = 'published';
  adoCourse.modules = [
    {
      id: 'mod-ado-1',
      courseId: adoCourse.id,
      slug: 'multi-stage-ado-yaml',
      title: 'Module 1: Multi-Stage YAML Pipelines & Publishing',
      description: 'Create multi-stage Azure DevOps YAML pipelines with PublishTestResults tasks.',
      sortOrder: 1,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          adoCourse.id,
          'mod-ado-1',
          'publishing-test-results-in-ado',
          '1.1 PublishTestResults@2 Task & Reporting',
          'Ingest JUnit XML results directly into Azure DevOps Analytics and track flaky test metrics.',
          'Azure DevOps',
          'yaml',
          '- task: PublishTestResults@2\n  inputs:\n    testResultsFormat: "JUnit"\n    testResultsFiles: "**/surefire-reports/TEST-*.xml"\n    mergeTestResults: true\n    failTaskOnFailedTests: true\n  condition: always()'
        ),
        makeRichTechnicalLesson(
          adoCourse.id,
          'mod-ado-1',
          'azure-pipelines-agent-pools',
          '1.2 Self-Hosted vs Microsoft-Hosted Build Agents',
          'Optimize execution costs and hardware performance by configuring self-hosted Linux agents.',
          'Agent Pools',
          'yaml',
          'pool:\n  name: Enterprise-QA-Pool\n  demands:\n    - Agent.OS -equals Linux\n    - Docker'
        )
      ]
    },
    {
      id: 'mod-ado-2',
      courseId: adoCourse.id,
      slug: 'ado-test-plans-and-gates',
      title: 'Module 2: Azure Test Plans & Quality Release Gates',
      description: 'Link automated tests to Azure Test Cases and enforce pre-deployment quality gates.',
      sortOrder: 2,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          adoCourse.id,
          'mod-ado-2',
          'azure-test-plans-automation-link',
          '2.1 Azure Test Plans Automated Test Association',
          'Associate automated test methods with Manual Test Case IDs for real-time requirement traceability.',
          'Test Plans',
          'csharp',
          '[TestMethod]\n[TestProperty("TestCaseId", "10492")]\npublic void VerifyCheckoutTotalTaxCalculation() {\n    // Automated verification\n}'
        ),
        makeRichTechnicalLesson(
          adoCourse.id,
          'mod-ado-2',
          'ado-release-pipeline-gates',
          '2.2 Automated Release Gates & Quality Metrics',
          'Halt CD deployments to production when automated regression pass rates drop below 98%.',
          'Release Gates',
          'yaml',
          'stages:\n  - stage: DeployProd\n    condition: and(succeeded(), eq(dependencies.QA.result, "Succeeded"))\n    jobs:\n      - deployment: ProdGate'
        )
      ]
    }
  ];
  console.log(`Populated Azure DevOps Course with ${adoCourse.modules.length} modules, 4 lessons.`);
}

// 9. Populate Full-Stack API Testing Course
const apiFullCourse = data.academyCourses.find(c => c.id === 'course-api-testing');
if (apiFullCourse) {
  apiFullCourse.status = 'published';
  apiFullCourse.modules = [
    {
      id: 'mod-apifull-1',
      courseId: apiFullCourse.id,
      slug: 'contract-testing-principles',
      title: 'Module 1: Consumer-Driven Contracts with Pact',
      description: 'Prevent microservice integration breaking changes using Pact contract definitions.',
      sortOrder: 1,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          apiFullCourse.id,
          'mod-apifull-1',
          'consumer-driven-contracts-with-pact',
          '1.1 Consumer-Driven Contracts with Pact',
          'Write consumer expectations in code and generate contract JSON files for provider verification.',
          'Contract Testing',
          'java',
          '@Pact(consumer = "OrderClient", provider = "PaymentService")\npublic RequestResponsePact createPact(PactDslWithProvider builder) {\n    return builder.given("order exists")\n        .uponReceiving("charge request")\n        .path("/v1/charge")\n        .method("POST")\n        .willRespondWith().status(200).toPact();\n}'
        ),
        makeRichTechnicalLesson(
          apiFullCourse.id,
          'mod-apifull-1',
          'pact-provider-verification-contracts',
          '1.2 Provider Verification & Breaking Changes',
          'Run automated provider verification in CI pipelines against published Pact contracts.',
          'Provider Verification',
          'java',
          '@Provider("PaymentService")\n@PactFolder("target/pacts")\npublic class PaymentProviderTest {\n    @TestTemplate\n    @ExtendWith(PactVerificationInvocationContextProvider.class)\n    void testTemplate(PactVerificationContext context) { context.verifyInteraction(); }\n}'
        )
      ]
    },
    {
      id: 'mod-apifull-2',
      courseId: apiFullCourse.id,
      slug: 'wiremock-and-k6-performance',
      title: 'Module 2: WireMock Stubs & k6 Performance Benchmarking',
      description: 'Isolate upstream dependencies with WireMock stubs and enforce SLOs with k6 scripts.',
      sortOrder: 2,
      status: 'published',
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
      lessons: [
        makeRichTechnicalLesson(
          apiFullCourse.id,
          'mod-apifull-2',
          'wiremock-api-mocking-stubs',
          '2.1 WireMock Dynamic Stubs & Fault Injection',
          'Simulate slow network latency, 503 gateway outages, and dynamic responses.',
          'Mock Servers',
          'java',
          'stubFor(post(urlEqualTo("/api/v1/auth"))\n    .willReturn(aResponse()\n        .withStatus(200)\n        .withFixedDelay(500)\n        .withBody("{\\"token\\": \\"jwt-mock-123\\"}")));'
        ),
        makeRichTechnicalLesson(
          apiFullCourse.id,
          'mod-apifull-2',
          'k6-api-performance-benchmarks',
          '2.2 k6 Performance Benchmarking & Error Budgets',
          'Validate p95 latency thresholds and error rates under concurrent virtual user load.',
          'Performance Testing',
          'javascript',
          'import http from "k6/http";\nimport { check } from "k6";\nexport const options = { vus: 50, duration: "30s" };\nexport default function() {\n    const res = http.get("https://api.staging.io/health");\n    check(res, { "status is 200": (r) => r.status === 200 });\n}'
        )
      ]
    }
  ];
  console.log(`Populated Full-Stack API Testing Course with ${apiFullCourse.modules.length} modules, 4 lessons.`);
}

// Clean up temporary fidelity test courses if any
data.academyCourses = data.academyCourses.filter(c => !c.id.includes('fidelity-course'));

fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log('Successfully saved all populated courses to curriculum-data-store.json!');
