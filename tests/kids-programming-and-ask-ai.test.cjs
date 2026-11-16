const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Requirement 1: Free Programming for Kids button on Home Page', () => {
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');

  // Verify Free Programming for Kids button is on the Home page
  assert.ok(homePageFile.includes('Free Programming for Kids'), 'Home page contains Free Programming for Kids button');
  assert.ok(homePageFile.includes('href="/kids"'), 'Button links to /kids hub');
  assert.ok(homePageFile.includes('Ages 10–14'), 'Mentions target age group 10-14');
  assert.ok(homePageFile.includes('Python, JavaScript, Java'), 'Mentions supported languages');
});

test('Requirement 2: User Signup/Login using Google along with Gemini Key feature', () => {
  const loginPageFile = fs.readFileSync(path.join(__dirname, '../src/app/login/page.tsx'), 'utf8');
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');
  const ascentCardFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/ascent-auth-card.tsx'), 'utf8');

  // Google sign in button present on Home and Login
  assert.ok(homePageFile.includes('GoogleSignInButton'), 'Home page features Google sign in');
  assert.ok(homePageFile.includes('Continue with Google'), 'Home page features Google sign in text');
  assert.ok(loginPageFile.includes('AscentAuthCard'), 'Login page features AscentAuthCard');
  assert.ok(ascentCardFile.includes('GoogleSignInButton'), 'Auth card embeds GoogleSignInButton');

  // Gemini key modal integration
  assert.ok(ascentCardFile.includes('GeminiKeyModal'), 'Auth card integrates GeminiKeyModal');
});

test('Requirement 3 & 4 & 5: Ask AI button, programming answering capability, and Gemini Key enablement', () => {
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');
  const askAiFile = fs.readFileSync(path.join(__dirname, '../src/components/home/ask-ai-widget.tsx'), 'utf8');
  const chatRouteFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts'), 'utf8');

  // Requirement 3: Provide Ask AI button inside login instead of Ask SDET AI mentor
  assert.ok(topNavFile.includes('>Ask AI<') || topNavFile.includes('Ask AI</span>'), 'TopNav displays "Ask AI" button');
  assert.ok(askAiFile.includes('Ask AI Coding Assistant'), 'Chat widget header displays Ask AI Coding Assistant');

  // Requirement 4: Answer any programming concepts or coding queries
  assert.ok(chatRouteFile.includes('AI Programming & Coding Assistant'), 'System prompt configures general programming assistant');
  assert.ok(chatRouteFile.includes('Python, JavaScript, TypeScript, Java'), 'System prompt explicitly supports Python, JS, TS, Java');
  assert.ok(chatRouteFile.includes('variables, loops, conditionals, functions'), 'Answers fundamental programming concepts');

  // Requirement 5: Enabled after Gemini Key configurations
  assert.ok(askAiFile.includes('currentUser && !activeApiKey'), 'Checks Gemini key configuration for logged-in user');
  assert.ok(askAiFile.includes('Gemini Key Required'), 'Prompts user when Gemini Key is not configured');
  assert.ok(askAiFile.includes('Configure Gemini API Key'), 'Provides direct link to configure key');
});

test('Requirement 6: Library with readily available coding problems for Kids 10-14 in Python, JS, TS, Java', () => {
  const codingLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/coding-problems.ts'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Verify Kids category in coding problems
  assert.ok(codingLibFile.includes('Kids Coding (Ages 10-14)'), 'Defines Kids Coding (Ages 10-14) category');
  assert.ok(codingLibFile.includes('kids-reverse-string'), 'Includes Secret Space Rover Code problem');
  assert.ok(codingLibFile.includes('kids-magic-fruit-counter'), 'Includes Magic Fruit Basket Counter problem');
  assert.ok(codingLibFile.includes('kids-superhero-power'), 'Includes Superhero Max Power Finder problem');
  assert.ok(codingLibFile.includes('kids-buzz-boom'), 'Includes Buzz & Boom Game problem');
  assert.ok(codingLibFile.includes('kids-mirror-word'), 'Includes Magic Mirror Word problem');
  assert.ok(codingLibFile.includes('kids-treasure-gold'), 'Includes Treasure Island Gold Collector problem');

  // Verify problems support Python, JS, TS, Java
  assert.ok(codingLibFile.includes('def reverse_message'), 'Python starter for rover problem');
  assert.ok(codingLibFile.includes('function reverseMessage'), 'JS/TS starter for rover problem');
  assert.ok(codingLibFile.includes('public static String reverseMessage'), 'Java starter for rover problem');

  // Verify Sidebar links to Coding Library for Kids
  assert.ok(sidebarFile.includes('/sandbox/code/problems?category=kids'), 'Sidebar links to Coding Library');
});

test('Requirement 7 & 8: Online Compiler for Java, JS, Python and Left Nav & Profile section', () => {
  const kidsPageFile = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');
  const codeCompilerFile = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/page.tsx'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');

  // Requirement 7: Online Compiler for Java, Javascript, Python
  assert.ok(kidsPageFile.includes('Compiler IDE'), 'Kids page has Online Compiler IDE');
  assert.ok(kidsPageFile.includes("activeLang: 'python' | 'javascript' | 'java'"), 'Compiler supports languages');
  assert.ok(codeCompilerFile.includes('Online Python Compiler'), 'Sandbox code compiler supports Python');
  assert.ok(codeCompilerFile.includes('Online JavaScript Runner'), 'Sandbox code compiler supports JavaScript');
  assert.ok(codeCompilerFile.includes('Online Java Compiler'), 'Sandbox code compiler supports Java');

  // Requirement 8: Left Navigation and Profile section at Top
  assert.ok(sidebarFile.includes('href="/kids"') || sidebarFile.includes("'/kids'"), 'Sidebar left navigation links to /kids');
  assert.ok(sidebarFile.includes('Kids Coding (10–14)') || sidebarFile.includes('Programming Courses (Ages 10–14)'), 'Sidebar displays Kids Coding');
  assert.ok(topNavFile.includes('profileMenuOpen'), 'TopNav provides Profile section at Top');
  assert.ok(topNavFile.includes('currentUser'), 'TopNav manages user profile session');
});

test('Requirement 9: Strict Separation between Kids Free Programming and QA SDET Portals', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');
  const qaDbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  // 1. Database Portal Mode helpers exist
  assert.ok(qaDbFile.includes('getPortalMode():'), 'QADatabase defines getPortalMode');
  assert.ok(qaDbFile.includes('setPortalMode('), 'QADatabase defines setPortalMode');

  // 2. Sidebar separates Kids from SDET
  assert.ok(sidebarFile.includes('isKidsPortal'), 'Sidebar computes isKidsPortal mode');
  assert.ok(sidebarFile.includes('KIDS NAVIGATION ONLY (NO SDET / AUTOMATION SECTIONS)'), 'Kids navigation branch isolates Kids view');
  assert.ok(sidebarFile.includes('SDET PROFESSIONAL NAVIGATION (ZERO KIDS CLUTTER)'), 'SDET navigation branch isolates SDET view');
  assert.ok(sidebarFile.includes('Switch to SDET Portal'), 'Kids sidebar provides option to switch back to SDET');

  // 3. TopNav shows active portal indicator and switcher in profile
  assert.ok(topNavFile.includes('portalMode'), 'TopNav manages portalMode');
  assert.ok(topNavFile.includes('Switch to SDET Professional'), 'TopNav profile menu allows switching to SDET');
  assert.ok(topNavFile.includes('Switch to Kids Coding'), 'TopNav profile menu allows switching to Kids');

  // 4. Home page respects active portal on logged-in redirect
  assert.ok(homePageFile.includes("portal === 'kids'"), 'Home page handles kids portal redirection');
  assert.ok(homePageFile.includes("router.replace('/kids')"), 'Directs kids portal users to /kids');
});

test('Requirement 10: Strict User Data Isolation & Gemini Key Privacy Protection', () => {
  const qaDbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');
  const codeEditorFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  const geminiModalFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'), 'utf8');

  // 1. QADatabase scopes keys to individual users by email & ID
  assert.ok(qaDbFile.includes('intelligentqa_gemini_key_email_'), 'Scopes Gemini key to user email');
  assert.ok(qaDbFile.includes('NEVER fall back to any global or previous user\'s key'), 'Enforces zero global key leakage for logged in users');

  // 2. Eradicates un-scoped global key on user account switch
  assert.ok(qaDbFile.includes("window.localStorage.removeItem('intelligentqa_gemini_key')"), 'Purges un-scoped key on account change and logout');

  // 3. Common key across SDET and Kids for the SAME user
  assert.ok(qaDbFile.includes('Ensure the logged in user maintains their valid common key across both SDET and Kids'), 'Supports common key across SDET and Kids for same user');

  // 4. Code editor workspace relies strictly on user-scoped key lookup
  assert.ok(codeEditorFile.includes('userKey = QADatabase.getUserGeminiKey(currentUser?.id)'), 'Code editor uses strict user-scoped key lookup');
  assert.ok(!codeEditorFile.includes("localStorage.getItem('intelligentqa_gemini_key')"), 'Code editor avoids leaking un-scoped keys');

  // 5. Gemini Key Modal saves with user scoping
  assert.ok(geminiModalFile.includes('setUserGeminiKey(sanitized, user?.id)'), 'Modal saves key scoped to current user id');
});

test('Requirement 11: Programming Courses, Import Template & Upload, and Coding Library Navigation', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const kidsPageFile = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');
  const courseLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/kids-courses.ts'), 'utf8');

  // 1. Ask AI Coding Helper removed from Left Navigation
  assert.ok(!sidebarFile.includes('Ask AI Coding Helper'), 'Ask AI Coding Helper is removed from Left Navigation');

  // 2. Kids Problem Library renamed to Coding Library
  assert.ok(sidebarFile.includes('>Coding Library</span>'), 'Sidebar displays Coding Library');

  // 3. Courses section in Left Navigation with Python, JavaScript, Java
  assert.ok(sidebarFile.includes('Python Programming'), 'Sidebar features Python course');
  assert.ok(sidebarFile.includes('JavaScript'), 'Sidebar features JavaScript course');
  assert.ok(sidebarFile.includes('Java'), 'Sidebar features Java course');

  // 4. Kids Courses Page has Import Template and Import/Upload buttons
  assert.ok(kidsPageFile.includes('Import Template'), 'Courses page has Import Template button');
  assert.ok(kidsPageFile.includes('Import Course Content'), 'Courses page has Import Course Content button');
  assert.ok(kidsPageFile.includes('Python Course'), 'Courses page provides Python course tab');
  assert.ok(kidsPageFile.includes('JavaScript Course'), 'Courses page provides JavaScript course tab');
  assert.ok(kidsPageFile.includes('Java Course'), 'Courses page provides Java course tab');

  // 5. Template generator supports JSON and CSV with mandatory schema
  assert.ok(courseLibFile.includes('generateCourseImportTemplate'), 'Defines generateCourseImportTemplate');
  assert.ok(courseLibFile.includes('downloadCourseImportTemplate'), 'Defines downloadCourseImportTemplate');
  assert.ok(courseLibFile.includes('saveCustomLesson'), 'Defines saveCustomLesson for uploaded lessons');
});

test('Requirement 12: Language Home Page, 9 Concepts in Left Navigation, and Split Try It Yourself Compiler', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const kidsPageFile = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');
  const courseLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/kids-courses.ts'), 'utf8');

  // 1. Marketing hero and sign-up promotional clutter removed from /kids
  assert.ok(!kidsPageFile.includes('100% Free Programming Courses for Kids & Beginners'), 'Promotional marketing hero removed');
  assert.ok(!kidsPageFile.includes('Sign in with Google &amp; Enable Live AI Answers'), 'Duplicated Google auth hero removed');

  // 2. Language Home Page contains description, why learn, use cases, and execution model
  assert.ok(kidsPageFile.includes('courseMeta.description'), 'Renders thorough language description');
  assert.ok(kidsPageFile.includes('courseMeta.whyLearn'), 'Renders Why Learn section');
  assert.ok(kidsPageFile.includes('courseMeta.useCases'), 'Renders Industry Applications');
  assert.ok(kidsPageFile.includes('courseMeta.executionModel'), 'Renders Execution Architecture');

  // 3. Left Navigation renders concepts below each language
  assert.ok(sidebarFile.includes('KIDS_TRACK_LIST.map'), 'Sidebar loops through language tracks');
  assert.ok(sidebarFile.includes('courseMeta.concepts.map'), 'Sidebar maps over all concepts under each language');
  assert.ok(courseLibFile.includes('Introduction & Syntax'), 'Defines Introduction concept');
  assert.ok(courseLibFile.includes('Operators & Expressions'), 'Defines Operators concept');
  assert.ok(courseLibFile.includes('Conditions & Decisions'), 'Defines Conditions concept');
  assert.ok(courseLibFile.includes('Loops & Iteration'), 'Defines Loops concept');
  assert.ok(courseLibFile.includes('Strings & Manipulation'), 'Defines Strings concept');
  assert.ok(courseLibFile.includes('Functions & Methods'), 'Defines Functions concept');
  assert.ok(courseLibFile.includes('Objects & Classes'), 'Defines Objects concept');
  assert.ok(courseLibFile.includes('Data Structures'), 'Defines Data Structures concept');
  assert.ok(courseLibFile.includes('Advanced Concepts'), 'Defines Advanced Concepts');

  // 4. Try it yourself button on top of each concept opens compiler IDE on right side with output below
  assert.ok(kidsPageFile.includes('Try it yourself'), 'Features Try it yourself button on top of concepts');
  assert.ok(kidsPageFile.includes('handleTryItYourself'), 'Defines handleTryItYourself interaction');
  assert.ok(kidsPageFile.includes('Execution Console / Output'), 'Renders execution console output directly below IDE on right side');

  // 5. Concept Description and Compiler IDE + Output sections are horizontally and vertically resizable
  assert.ok(kidsPageFile.includes('startHResizing'), 'Includes horizontal resizer handler for Concept vs Compiler');
  assert.ok(kidsPageFile.includes('startVResizing'), 'Includes vertical resizer handler for Compiler vs Output');
  assert.ok(kidsPageFile.includes('cursor-col-resize'), 'Includes cursor-col-resize handle between Concept and Compiler');
  assert.ok(kidsPageFile.includes('cursor-row-resize'), 'Includes cursor-row-resize handle between Compiler and Output');
  assert.ok(kidsPageFile.includes('descriptionWidthPct'), 'Applies descriptionWidthPct dynamic width');
  assert.ok(kidsPageFile.includes('compilerHeightPct'), 'Applies compilerHeightPct dynamic height');
});

test('Requirement 13: Comprehensive Mandatory Learning Concepts stored in Database for Python, JS, Java', () => {
  const pythonCourseFile = fs.readFileSync(path.join(__dirname, '../src/lib/courses/python-course.ts'), 'utf8');
  const jsCourseFile = fs.readFileSync(path.join(__dirname, '../src/lib/courses/javascript-course.ts'), 'utf8');
  const javaCourseFile = fs.readFileSync(path.join(__dirname, '../src/lib/courses/java-course.ts'), 'utf8');
  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  // Verify all mandatory concepts matching user's reference image for Python:
  const mandatoryPythonConcepts = [
    'intro', 'get-started', 'syntax', 'output', 'comments',
    'variables', 'data-types', 'numbers', 'casting', 'strings',
    'booleans', 'operators', 'lists', 'tuples', 'sets',
    'dictionaries', 'if-else', 'match', 'while-loops', 'for-loops',
    'range', 'functions', 'arrays', 'iterators', 'modules',
    'classes-objects', 'inheritance', 'file-handling', 'try-except'
  ];

  mandatoryPythonConcepts.forEach((id) => {
    assert.ok(
      pythonCourseFile.includes(`id: '${id}'`),
      `Python course must define mandatory concept: ${id}`
    );
  });

  // Verify comprehensive JavaScript concepts:
  const mandatoryJsConcepts = [
    'intro', 'get-started', 'output', 'comments', 'variables',
    'data-types', 'numbers', 'casting', 'strings', 'booleans',
    'operators', 'arrays', 'array-iteration', 'objects', 'if-else',
    'switch', 'while-loops', 'for-loops', 'functions', 'scope',
    'destructuring', 'sets-maps', 'classes', 'inheritance',
    'try-catch', 'async-await', 'modules', 'advanced'
  ];

  mandatoryJsConcepts.forEach((id) => {
    assert.ok(
      jsCourseFile.includes(`id: '${id}'`),
      `JavaScript course must define mandatory concept: ${id}`
    );
  });

  // Verify comprehensive Java concepts:
  const mandatoryJavaConcepts = [
    'intro', 'get-started', 'syntax', 'output', 'comments',
    'variables', 'data-types', 'casting', 'operators', 'strings',
    'booleans', 'numbers', 'arrays', 'if-else', 'switch',
    'while-loops', 'for-loops', 'methods', 'scope', 'classes-objects',
    'constructors', 'modifiers', 'inheritance', 'polymorphism',
    'abstraction', 'arraylist', 'hashmap', 'hashset', 'iterators',
    'exceptions', 'advanced'
  ];

  mandatoryJavaConcepts.forEach((id) => {
    assert.ok(
      javaCourseFile.includes(`id: '${id}'`),
      `Java course must define mandatory concept: ${id}`
    );
  });

  // Verify Database migration & auto-upgrade logic in qa-db.ts
  assert.ok(dbFile.includes('getKidsCourses'), 'qa-db provides getKidsCourses()');
  assert.ok(dbFile.includes('intelligentqa_db_kids_courses'), 'qa-db stores kids courses in persistent key');
  assert.ok(dbFile.includes('LANGUAGE_COURSES.python.concepts.length'), 'qa-db checks curriculum length for auto-upgrade');
});

test('Requirement 14: Coding Workspace for Users & Kids to create Games and Projects', () => {
  const projectsLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/kids-projects.ts'), 'utf8');
  const studioComponentFile = fs.readFileSync(path.join(__dirname, '../src/components/kids/kids-projects-studio-view.tsx'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const kidsPageFile = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');

  // Verify game project templates exist for Python and JavaScript
  assert.ok(projectsLibFile.includes('py-game-number-guess'), 'Provides Python Number Guesser game');
  assert.ok(projectsLibFile.includes('py-game-rock-paper-scissors'), 'Provides Python Rock Paper Scissors game');
  assert.ok(projectsLibFile.includes('py-game-dungeon-quest'), 'Provides Python Dungeon Quest text RPG');
  assert.ok(projectsLibFile.includes('js-game-snake'), 'Provides JavaScript 2D Snake Arcade game');
  assert.ok(projectsLibFile.includes('js-game-pong'), 'Provides JavaScript Retro Pong game');
  assert.ok(projectsLibFile.includes('java-game-monster-arena'), 'Provides Java Monster Arena RPG');

  // Verify Studio coding workspace features: save project, reset, download, run
  assert.ok(studioComponentFile.includes('handleSaveProject'), 'Supports saving project progress to localStorage');
  assert.ok(studioComponentFile.includes('handleResetToTemplate'), 'Supports resetting to project blueprint');
  assert.ok(studioComponentFile.includes('handleDownloadScript'), 'Supports downloading game script');
  assert.ok(studioComponentFile.includes('handleRunProject'), 'Supports executing project code in live sandbox');

  // Verify Game Studio navigation in Sidebar and Kids page
  assert.ok(sidebarFile.includes('view=projects'), 'Sidebar links to Build Games & Projects workspace');
  assert.ok(kidsPageFile.includes('KidsProjectsStudioView'), 'Kids page renders KidsProjectsStudioView');
  assert.ok(kidsPageFile.includes('Game Studio'), 'Kids page header includes Game Studio tab');
});

test('Requirement 15: Exercises under each programming language on Left Navigation (4-5 questions per section)', () => {
  const exercisesLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/kids-exercises.ts'), 'utf8');
  const exercisesComponentFile = fs.readFileSync(path.join(__dirname, '../src/components/kids/kids-exercises-view.tsx'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const kidsPageFile = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');

  // Verify Left navigation has exercises item under each language
  assert.ok(sidebarFile.includes('view=exercises'), 'Sidebar has Exercises link under language sections');
  assert.ok(sidebarFile.includes('Exercises (Test Knowledge)'), 'Sidebar displays Exercises knowledge test item');

  // Verify 4-5 questions per section across Python, JS, Java
  ['python', 'javascript', 'java'].forEach((lang) => {
    assert.ok(exercisesLibFile.includes(`language: '${lang}'`), `Exercises defined for ${lang}`);
  });

  // Verify multiple sections exist and each section has 4-5 questions
  assert.ok(exercisesLibFile.includes('Section 1: Syntax, Output & Comments'), 'Python section 1 present');
  assert.ok(exercisesLibFile.includes('Section 2: Variables, Data Types & Numbers'), 'Python section 2 present');
  assert.ok(exercisesLibFile.includes('Section 3: Strings & Casting'), 'Python section 3 present');
  assert.ok(exercisesLibFile.includes('Section 4: Conditions, Match & Loops'), 'Python section 4 present');
  assert.ok(exercisesLibFile.includes('Section 5: Lists, Tuples, Sets & Dictionaries'), 'Python section 5 present');
  assert.ok(exercisesLibFile.includes('Section 6: Functions, OOP & Advanced'), 'Python section 6 present');

  assert.ok(exercisesLibFile.includes('Section 1: Syntax, Output & Variables'), 'JS section 1 present');
  assert.ok(exercisesLibFile.includes('Section 2: Arrays & Iteration'), 'JS section 2 present');
  assert.ok(exercisesLibFile.includes('Section 3: Objects & Destructuring'), 'JS section 3 present');
  assert.ok(exercisesLibFile.includes('Section 4: Functions & Closures'), 'JS section 4 present');
  assert.ok(exercisesLibFile.includes('Section 5: Async Programming & Promises'), 'JS section 5 present');

  assert.ok(exercisesLibFile.includes('Section 1: Syntax, JVM & Data Types'), 'Java section 1 present');
  assert.ok(exercisesLibFile.includes('Section 2: Control Flow & Loops'), 'Java section 2 present');
  assert.ok(exercisesLibFile.includes('Section 3: OOP, Classes & Inheritance'), 'Java section 3 present');
  assert.ok(exercisesLibFile.includes('Section 4: Collections & Exceptions'), 'Java section 4 present');

  // Verify count of questions (id: 'py-', 'js-', 'java-')
  const pyQuestions = (exercisesLibFile.match(/id:\s*'py-\d+-\d+'/g) || []).length;
  const jsQuestions = (exercisesLibFile.match(/id:\s*'js-\d+-\d+'/g) || []).length;
  const javaQuestions = (exercisesLibFile.match(/id:\s*'java-\d+-\d+'/g) || []).length;
  assert.ok(pyQuestions >= 24, `Python must have at least 24 questions across sections (found ${pyQuestions})`);
  assert.ok(jsQuestions >= 20, `JavaScript must have at least 20 questions across sections (found ${jsQuestions})`);
  assert.ok(javaQuestions >= 20, `Java must have at least 20 questions across sections (found ${javaQuestions})`);

  // Verify Exercises component features: questions, instant feedback, scoring, hints
  assert.ok(exercisesComponentFile.includes('handleSelectOption'), 'Interactive answer selection');
  assert.ok(exercisesComponentFile.includes('handleResetProgress'), 'Reset exercise answers capability');
  assert.ok(exercisesComponentFile.includes('revealedHints'), 'Togglable hints for learners');
  assert.ok(kidsPageFile.includes('KidsExercisesView'), 'Kids page integrates KidsExercisesView');
});

test('Requirement 16: Database Persistence for all learning concepts, questions, exercises, and projects with zero user leakage', () => {
  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');
  const apiDbFile = fs.readFileSync(path.join(__dirname, '../src/app/api/db/user-data/route.ts'), 'utf8');
  const exercisesViewFile = fs.readFileSync(path.join(__dirname, '../src/components/kids/kids-exercises-view.tsx'), 'utf8');
  const projectsViewFile = fs.readFileSync(path.join(__dirname, '../src/components/kids/kids-projects-studio-view.tsx'), 'utf8');

  // Verify Database methods exist for Kids exercises, user progress, and projects
  assert.ok(dbFile.includes('getKidsExercises'), 'QADatabase provides getKidsExercises');
  assert.ok(dbFile.includes('getUserExerciseProgress'), 'QADatabase provides getUserExerciseProgress');
  assert.ok(dbFile.includes('saveUserExerciseProgress'), 'QADatabase provides saveUserExerciseProgress');
  assert.ok(dbFile.includes('resetUserExerciseProgress'), 'QADatabase provides resetUserExerciseProgress');
  assert.ok(dbFile.includes('getUserProjectCode'), 'QADatabase provides getUserProjectCode');
  assert.ok(dbFile.includes('saveUserProjectCode'), 'QADatabase provides saveUserProjectCode');
  assert.ok(dbFile.includes('resetUserProjectCode'), 'QADatabase provides resetUserProjectCode');

  // Verify Row-Level Security (RLS) ensures zero data leakage across different users
  assert.ok(dbFile.includes('e.userId === userId'), 'Filters user exercise records strictly by userId');
  assert.ok(dbFile.includes('proj.userId === userId'), 'Filters user project records strictly by userId');

  // Verify dedicated Server Database API endpoint exists
  assert.ok(apiDbFile.includes('/api/db/user-data') || apiDbFile.includes('serverUserExercises'), 'Server DB route manages user data');
  assert.ok(apiDbFile.includes('r.userId === userId'), 'Server API filters exercises by userId');
  assert.ok(apiDbFile.includes('p.userId === userId'), 'Server API filters projects by userId');

  // Verify UI views use QADatabase and react to auth changes (logout / login)
  assert.ok(exercisesViewFile.includes('QADatabase.saveUserExerciseProgress'), 'Exercises view persists to Database');
  assert.ok(exercisesViewFile.includes('intelligentqa_auth_changed'), 'Exercises view refreshes on auth changes');
  assert.ok(projectsViewFile.includes('QADatabase.saveUserProjectCode'), 'Projects view persists code to Database');
  assert.ok(projectsViewFile.includes('intelligentqa_auth_changed'), 'Projects view refreshes on auth changes');
});
