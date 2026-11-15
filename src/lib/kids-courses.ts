export interface CourseConcept {
  id: string;
  title: string;
  order: number;
  language: 'python' | 'javascript' | 'java';
  summary: string;
  overview: string;
  keyPoints: string[];
  starterCode: string;
  solutionCode?: string;
  bestPractices: string[];
}

export interface LanguageCourseMeta {
  id: 'python' | 'javascript' | 'java';
  name: string;
  version: string;
  tagline: string;
  badge: string;
  accentColor: string;
  badgeColor: string;
  description: string;
  whyLearn: string[];
  useCases: string[];
  executionModel: string;
  concepts: CourseConcept[];
}

export const LANGUAGE_COURSES: Record<'python' | 'javascript' | 'java', LanguageCourseMeta> = {
  python: {
    id: 'python',
    name: 'Python Programming',
    version: 'Python 3.12',
    tagline: 'Clean, elegant, and versatile programming from foundations to AI.',
    badge: 'Python 3',
    accentColor: 'text-amber-500',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    description: `Python is one of the world's most popular, readable, and widely-used programming languages. Created by Guido van Rossum with the guiding philosophy of code readability, Python uses clean indentation rather than brackets, allowing engineers to write clean algorithms with minimal boilerplate. It is the gold standard for Artificial Intelligence, Data Science, Web Backends, and Test Automation.`,
    whyLearn: [
      'Beginner-friendly syntax that reads like plain English',
      'The #1 language for Artificial Intelligence, Machine Learning, and Data Analytics',
      'Massive ecosystem with thousands of production libraries (NumPy, Pandas, FastAPI, PyTest)',
      'Versatile across Web Development, Cloud Automation, Scripting, and SDET Tooling',
    ],
    useCases: [
      'Artificial Intelligence & Deep Learning (PyTorch, TensorFlow)',
      'Data Engineering & Big Data Analytics (Pandas, Polars)',
      'Modern High-Performance Web APIs (FastAPI, Django)',
      'DevOps & Automation Scripting',
      'SDET Automation Frameworks (Selenium Python, Playwright Python, Robot Framework)',
    ],
    executionModel: 'Interpreted byte-code compiled to the CPython Virtual Machine with automatic memory management and garbage collection.',
    concepts: [
      {
        id: 'intro',
        title: '1. Introduction & Syntax',
        order: 1,
        language: 'python',
        summary: 'Variables, dynamic typing, print() function, comments, and fundamental data types.',
        overview: 'Python uses dynamic typing, meaning you do not declare variable types explicitly. The interpreter infers whether a value is an integer, float, string, or boolean automatically at runtime.',
        keyPoints: [
          'print() sends text and calculated values to standard output',
          'Comments start with # and are ignored by the Python interpreter',
          'Variable names are case-sensitive and should follow snake_case convention',
          'Primitive types include int, float, str, and bool',
        ],
        starterCode: `# 1. Python Introduction & Basic Syntax
language_name = "Python 3"
release_year = 1991
creator = "Guido van Rossum"
is_fun_to_learn = True

print(f"Welcome to {language_name}!")
print(f"Created in {release_year} by {creator}.")
print(f"Easy to learn: {is_fun_to_learn}")
`,
        bestPractices: [
          'Use meaningful variable names following snake_case (e.g. user_age, not u)',
          'Leverage modern f-strings (f"Hello {name}") instead of string concatenation',
        ],
      },
      {
        id: 'operators',
        title: '2. Operators & Expressions',
        order: 2,
        language: 'python',
        summary: 'Arithmetic, comparison, logical, and assignment operations in Python.',
        overview: 'Operators allow you to perform calculations, compare values, and evaluate complex logical assertions. Python includes standard arithmetic as well as integer division (//) and exponentiation (**).',
        keyPoints: [
          'Arithmetic: +, -, *, /, // (floor div), % (modulus), ** (power)',
          'Comparison: ==, !=, <, >, <=, >=',
          'Logical: and, or, not',
          'Python supports chained comparisons like 10 < x < 50',
        ],
        starterCode: `# 2. Python Operators & Math Expressions
a = 15
b = 4

print("Addition (15 + 4):", a + b)
print("True Division (15 / 4):", a / b)
print("Floor Division (15 // 4):", a // b)
print("Modulus / Remainder (15 % 4):", a % b)
print("Power (15 ** 4):", a ** b)

is_in_range = (a > 10) and (b < 10)
print(f"Is a > 10 and b < 10? {is_in_range}")
`,
        bestPractices: [
          'Use parentheses to make calculation precedence explicit in complex equations',
          'Use // when you specifically need an integer without decimal fractions',
        ],
      },
      {
        id: 'conditions',
        title: '3. Conditions & Decisions',
        order: 3,
        language: 'python',
        summary: 'Branching execution with if, elif, and else statements.',
        overview: 'Conditional statements direct program flow based on boolean expressions. Indentation (4 spaces) defines the code block that executes when a condition evaluates to True.',
        keyPoints: [
          'if statement initiates the condition test',
          'elif handles subsequent conditional branches',
          'else provides the default fallback branch',
          'Indentation is mandatory syntax in Python',
        ],
        starterCode: `# 3. Python Conditional Branching
score = 88

if score >= 90:
    grade = "A - Excellent"
elif score >= 80:
    grade = "B - Good Job"
elif score >= 70:
    grade = "C - Fair"
else:
    grade = "Needs Improvement"

print(f"Exam Score: {score}")
print(f"Result Grade: {grade}")
`,
        bestPractices: [
          'Order elif statements from most specific/highest threshold to lowest',
          'Avoid deeply nested if statements; prefer early returns',
        ],
      },
      {
        id: 'loops',
        title: '4. Loops & Iteration',
        order: 4,
        language: 'python',
        summary: 'Counting loops with for and range(), while loops, break, and continue.',
        overview: 'Loops repeat code blocks without duplicate code. for loops iterate over ranges or collections, while while loops repeat as long as a condition remains True.',
        keyPoints: [
          'range(start, stop, step) generates sequences of numbers',
          'while loops continue until their condition becomes False',
          'break exits the loop immediately',
          'continue skips the remainder of the current iteration',
        ],
        starterCode: `# 4. Python Iteration: for and while
print("--- Rocket Countdown (for loop) ---")
for seconds in range(5, 0, -1):
    print(f"T-minus {seconds}...")

print("🚀 Blast Off!")

print("\n--- While Loop Step Counter ---")
step = 1
while step <= 3:
    print(f"Simulating test step #{step}")
    step += 1
`,
        bestPractices: [
          'Ensure while loops have a deterministic increment to prevent infinite loops',
          'Prefer for item in iterable over manual indexing',
        ],
      },
      {
        id: 'strings',
        title: '5. Strings & Manipulation',
        order: 5,
        language: 'python',
        summary: 'String indexing, slicing, strip(), replace(), split(), and f-string formatting.',
        overview: 'Strings in Python are immutable sequences of Unicode characters. Slicing with [start:stop:step] provides an expressive way to extract sub-strings and reverse text.',
        keyPoints: [
          'Strings are indexed from 0; negative indices count from the end (-1 is last char)',
          'Slicing syntax: string[start:stop:step]',
          'Common methods: .strip(), .lower(), .upper(), .replace(), .split()',
          'Strings cannot be modified in place because they are immutable',
        ],
        starterCode: `# 5. Python Strings & Slicing
raw_text = "  Python Test Automation Framework  "
clean_text = raw_text.strip()

print("Original:", repr(raw_text))
print("Cleaned:", repr(clean_text))
print("Uppercase:", clean_text.upper())
print("First 6 characters:", clean_text[:6])
print("Reversed string:", clean_text[::-1])
print("Split into words:", clean_text.split(" "))
`,
        bestPractices: [
          'Use .strip() to clean unexpected whitespace from test inputs or user text',
          'Use "".join(list) rather than += in loops for fast string concatenation',
        ],
      },
      {
        id: 'functions',
        title: '6. Functions & Methods',
        order: 6,
        language: 'python',
        summary: 'Declaring functions with def, parameters, default values, and return values.',
        overview: 'Functions encapsulate reusable blocks of logic. They accept input parameters, execute instructions, and return computed results using the return statement.',
        keyPoints: [
          'def function_name(param1, param2): declares a function',
          'Parameters can specify default fallback values',
          'Functions return None if no return statement is specified',
          'Docstrings """documentation""" document function purpose',
        ],
        starterCode: `# 6. Python Functions
def calculate_metrics(test_count, passed_count, suite_name="Smoke Suite"):
    """Calculates pass rate percentage for a test suite."""
    pass_rate = (passed_count / test_count) * 100
    return {
        "suite": suite_name,
        "total": test_count,
        "passed": passed_count,
        "pass_rate": f"{pass_rate:.1f}%"
    }

results = calculate_metrics(50, 48)
print("Execution Report:")
for k, v in results.items():
    print(f"  {k}: {v}")
`,
        bestPractices: [
          'Keep functions focused on a single responsibility',
          'Use type hints (e.g. def add(x: int, y: int) -> int:) for clarity',
        ],
      },
      {
        id: 'objects',
        title: '7. Objects & Classes (OOP)',
        order: 7,
        language: 'python',
        summary: 'Object-oriented programming, class definitions, __init__ constructors, and methods.',
        overview: 'Classes serve as blueprints for creating objects. They combine state (attributes stored in self) and behavior (methods) into cohesive entities.',
        keyPoints: [
          'class ClassName: defines a class',
          '__init__(self, ...): is the constructor executed during object instantiation',
          'self references the current instance of the class',
          'Classes support inheritance, encapsulation, and polymorphism',
        ],
        starterCode: `# 7. Python Object-Oriented Programming (OOP)
class TestCase:
    def __init__(self, test_id, name, priority="Medium"):
        self.test_id = test_id
        self.name = name
        self.priority = priority
        self.status = "Pending"

    def execute(self, passed=True):
        self.status = "PASSED" if passed else "FAILED"
        print(f"[{self.test_id}] {self.name} -> {self.status}")

# Instantiate objects
tc1 = TestCase("TC-101", "Verify Google OAuth Login", "High")
tc2 = TestCase("TC-102", "Validate Cart Checkout Calculation")

tc1.execute(passed=True)
tc2.execute(passed=False)
`,
        bestPractices: [
          'Always use self as the first parameter of instance methods',
          'Follow PascalCase naming convention for classes (e.g. TestReport)',
        ],
      },
      {
        id: 'data-structures',
        title: '8. Data Structures',
        order: 8,
        language: 'python',
        summary: 'Lists (arrays), Dictionaries (key-value maps), Sets (unique), and Tuples (immutable).',
        overview: 'Python provides four built-in collection data structures, each optimized for different data access patterns and mutability requirements.',
        keyPoints: [
          'List []: Ordered, mutable sequence of items',
          'Dictionary {}: Key-value store with O(1) average lookup time',
          'Set {}: Unordered collection of unique items with set operations',
          'Tuple (): Immutable ordered sequence',
        ],
        starterCode: `# 8. Python Data Structures
# 1. Lists
browsers = ["Chrome", "Firefox", "WebKit"]
browsers.append("Edge")

# 2. Dictionaries (Key-Value)
capabilities = {
    "headless": True,
    "timeout": 30000,
    "viewport": {"width": 1920, "height": 1080}
}

# 3. Sets (Automatic deduplication)
status_codes = {200, 404, 200, 500, 404}

print("Browser List:", browsers)
print("Timeout setting:", capabilities["timeout"])
print("Unique status codes set:", status_codes)
`,
        bestPractices: [
          'Use dictionaries for fast O(1) key lookups instead of searching lists',
          'Use sets when you need to enforce uniqueness or test membership',
        ],
      },
      {
        id: 'advanced',
        title: '9. Advanced Concepts',
        order: 9,
        language: 'python',
        summary: 'Exception handling with try/except/finally, list comprehensions, and lambda expressions.',
        overview: 'Advanced Python idioms help you write robust, concise code. Exception handling prevents application crashes, while list comprehensions create transformed lists declaratively.',
        keyPoints: [
          'try / except / else / finally handles runtime errors gracefully',
          'List comprehensions [expression for item in iterable] replace verbose for-loops',
          'lambda arguments: expression creates anonymous inline functions',
          'with statement manages context resources (files, sessions) safely',
        ],
        starterCode: `# 9. Python Advanced Features
# 1. Exception Handling
def safe_divide(numerator, denominator):
    try:
        return numerator / denominator
    except ZeroDivisionError:
        return "Error: Division by zero caught gracefully!"
    finally:
        print("Division attempt completed.")

print(safe_divide(10, 2))
print(safe_divide(10, 0))

# 2. List Comprehension
raw_numbers = [1, 2, 3, 4, 5, 6]
even_squares = [n ** 2 for n in raw_numbers if n % 2 == 0]
print("\nSquares of even numbers:", even_squares)
`,
        bestPractices: [
          'Catch specific exceptions (e.g. ValueError) rather than a bare except:',
          'Use list comprehensions for concise transformations, but avoid over-complicating them',
        ],
      },
    ],
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript Programming',
    version: 'ECMAScript 2024',
    tagline: 'The universal language of modern interactive web, APIs, and cloud applications.',
    badge: 'ES6+ JS',
    accentColor: 'text-emerald-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    description: `JavaScript is the ubiquitous programming language of the modern web and fullstack application development. Running natively in every browser and across cloud runtimes via Node.js, JavaScript powers dynamic UIs, real-time communications, single-page applications, and test automation tools like Playwright and Cypress.`,
    whyLearn: [
      'The only language that runs natively in every modern web browser',
      'Fullstack versatility: write frontend with React/Next.js and backend with Node.js',
      'Event-driven, asynchronous concurrency model ideal for high-throughput I/O',
      'The foundation of modern end-to-end web testing (Playwright, Cypress, WebdriverIO)',
    ],
    useCases: [
      'Frontend Web Applications (React, Next.js, Vue, Angular)',
      'Backend Microservices & REST/GraphQL APIs (Node.js, Express, NestJS)',
      'Modern Test Automation (Playwright, Cypress, Jest, Vitest)',
      'Real-time Applications & WebSockets',
      'Serverless Cloud Functions (AWS Lambda, Cloudflare Workers)',
    ],
    executionModel: 'JIT-compiled, single-threaded event loop architecture with non-blocking asynchronous I/O and prototype-based object model.',
    concepts: [
      {
        id: 'intro',
        title: '1. Introduction & Setup',
        order: 1,
        language: 'javascript',
        summary: 'Variables with let and const, primitives, console.log, and script execution.',
        overview: 'Modern JavaScript uses let for mutable variables and const for block-scoped constants. Dynamic typing allows variables to hold values of any type at runtime.',
        keyPoints: [
          'const declares variables that cannot be reassigned',
          'let declares mutable block-scoped variables',
          'console.log() writes output to the browser or Node console',
          'Primitives: number, string, boolean, null, undefined, symbol, bigint',
        ],
        starterCode: `// 1. JavaScript Introduction & Variables
const language = "JavaScript";
const version = "ES2024";
let isRunning = true;
let totalTests = 42;

console.log("Welcome to " + language + " (" + version + ")!");
console.log(\`Execution Active: \${isRunning}\`);
console.log(\`Total Test Count: \${totalTests}\`);
`,
        bestPractices: [
          'Default to const; only use let when you explicitly reassign the variable',
          'Never use legacy var due to hoisting and scope bugs',
        ],
      },
      {
        id: 'operators',
        title: '2. Operators & Strict Equality',
        order: 2,
        language: 'javascript',
        summary: 'Arithmetic, logical operators, strict equality (===) vs loose equality (==).',
        overview: 'Always use strict equality === in JavaScript. Strict equality checks both value and type without performing implicit type coercion, avoiding subtle bugs.',
        keyPoints: [
          '=== (Strict equality) and !== (Strict inequality) prevent type coercion',
          'Logical operators: && (AND), || (OR), ! (NOT)',
          'Nullish coalescing operator ?? provides fallback for null/undefined',
          'Ternary operator: condition ? valIfTrue : valIfFalse',
        ],
        starterCode: `// 2. JavaScript Operators & Equality
const expected = 200;
const actual = "200";

console.log("Loose equality (==):", expected == actual);   // true (type coerced)
console.log("Strict equality (===):", expected === actual); // false (number !== string)

const timeout = null;
const effectiveTimeout = timeout ?? 5000;
console.log("Effective timeout:", effectiveTimeout);
`,
        bestPractices: [
          'Always use === instead of == to avoid type coercion pitfalls',
          'Use ?? instead of || when 0 or false are valid inputs',
        ],
      },
      {
        id: 'conditions',
        title: '3. Conditions & Control Flow',
        order: 3,
        language: 'javascript',
        summary: 'Branching execution with if/else, ternary operators, and switch statements.',
        overview: 'Control flow structures determine which block of instructions executes based on runtime condition evaluation.',
        keyPoints: [
          'if (condition) { ... } else if { ... } else { ... }',
          'Switch statements test multiple case values with break',
          'Truthy and falsy values: 0, "", null, undefined, NaN evaluate to false',
        ],
        starterCode: `// 3. JavaScript Conditions
const responseStatus = 404;
let message = "";

if (responseStatus >= 200 && responseStatus < 300) {
  message = "HTTP 2xx: Request Succeeded";
} else if (responseStatus === 404) {
  message = "HTTP 404: Resource Not Found";
} else {
  message = \`HTTP \${responseStatus}: Server or Client Error\`;
}

console.log("Status Check:", message);
`,
        bestPractices: [
          'Prefer early returns in functions to reduce nested if/else statements',
          'Remember that empty arrays [] and empty objects {} are truthy in JS',
        ],
      },
      {
        id: 'loops',
        title: '4. Loops & Iteration',
        order: 4,
        language: 'javascript',
        summary: 'Iterating with for, while, for..of, and for..in loops.',
        overview: 'Loops iterate through code blocks. for..of is the standard idiom for iterating through arrays, strings, and iterables in modern JavaScript.',
        keyPoints: [
          'for (let i = 0; i < n; i++) standard index loop',
          'for (const item of array) iterates directly over values',
          'while (condition) repeats while condition is truthy',
          'break terminates loop, continue advances to next cycle',
        ],
        starterCode: `// 4. JavaScript Iteration
const testSuites = ["Auth", "Checkout", "Billing", "Reports"];

console.log("--- for..of loop ---");
for (const suite of testSuites) {
  console.log("Executing suite:", suite);
}

console.log("\n--- Standard index loop ---");
for (let i = 0; i < testSuites.length; i++) {
  console.log(\`Suite #\${i + 1}: \${testSuites[i]}\`);
}
`,
        bestPractices: [
          'Prefer for..of for arrays; avoid for..in for arrays as it iterates prototype keys',
          'Use modern array methods (map, filter) for data transformations',
        ],
      },
      {
        id: 'strings',
        title: '5. Strings & Template Literals',
        order: 5,
        language: 'javascript',
        summary: 'Template literals with backticks, interpolation, includes(), and replace().',
        overview: 'Template literals (backticks \`\`) allow multi-line strings and expression interpolation via \${expression}.',
        keyPoints: [
          'Template literals support \${expression} inline interpolation',
          'String methods: .includes(), .startsWith(), .slice(), .trim(), .toLowerCase()',
          'Strings in JavaScript are immutable UTF-16 character sequences',
        ],
        starterCode: `// 5. JavaScript Strings
const url = "https://staging.intelligentqa.io/api/v1/users";
const endpoint = "users";

console.log("Full URL:", url);
console.log("Contains endpoint?", url.includes(endpoint));
console.log("Protocol:", url.slice(0, 5));
console.log("Uppercase:", endpoint.toUpperCase());
`,
        bestPractices: [
          'Use template literals instead of + for string interpolation',
          'Use .includes() instead of indexOf() !== -1 for boolean substring checks',
        ],
      },
      {
        id: 'functions',
        title: '6. Functions & Arrow Syntax',
        order: 6,
        language: 'javascript',
        summary: 'Function declarations, arrow functions (=>), default parameters, and scope.',
        overview: 'Arrow functions (param) => expression provide concise syntax and lexically bind the this keyword.',
        keyPoints: [
          'const add = (a, b) => a + b; concise arrow function',
          'Arrow functions do not bind their own this keyword',
          'Functions are first-class citizens: can be passed as arguments or returned',
        ],
        starterCode: `// 6. JavaScript Functions
// Standard function
function greet(user = "Student") {
  return \`Hello, \${user}!\`;
}

// Arrow function
const calculateDiscount = (price, percentage) => price - (price * (percentage / 100));

console.log(greet("Alex"));
console.log("Discounted price (100 with 15% off):", calculateDiscount(100, 15));
`,
        bestPractices: [
          'Use arrow functions for callbacks and concise utility functions',
          'Avoid mutating argument objects directly; prefer pure functions',
        ],
      },
      {
        id: 'objects',
        title: '7. Objects & Classes',
        order: 7,
        language: 'javascript',
        summary: 'Object literals, destructuring, class syntax, constructors, and methods.',
        overview: 'JavaScript objects store key-value properties. Modern ES6 classes provide clean syntax for object-oriented encapsulation and inheritance.',
        keyPoints: [
          'Object literal: const obj = { key: value }',
          'Destructuring: const { title, duration } = course;',
          'class ClassName { constructor() { ... } }',
        ],
        starterCode: `// 7. JavaScript Objects & Classes
class BrowserDriver {
  constructor(browserType) {
    this.browserType = browserType;
    this.sessionActive = false;
  }

  launch() {
    this.sessionActive = true;
    console.log(\`Launched \${this.browserType} session.\`);
  }
}

const driver = new BrowserDriver("Chromium");
driver.launch();

const config = { headless: true, port: 9222 };
const { headless, port } = config;
console.log(\`Config: Headless=\${headless}, Port=\${port}\`);
`,
        bestPractices: [
          'Use object destructuring to extract needed properties cleanly',
          'Use optional chaining (?.) to access deeply nested properties safely',
        ],
      },
      {
        id: 'data-structures',
        title: '8. Data Structures (Arrays & Maps)',
        order: 8,
        language: 'javascript',
        summary: 'Array methods (map, filter, reduce), Map for key-value, Set for uniqueness.',
        overview: 'Modern JavaScript features powerful higher-order functions on Arrays, alongside Map and Set for collections.',
        keyPoints: [
          'Array.map() transforms each element into a new array',
          'Array.filter() returns elements satisfying a predicate',
          'Map holds key-value pairs where keys can be any type',
          'Set holds unique values and deduplicates automatically',
        ],
        starterCode: `// 8. JavaScript Data Structures
const testResults = [
  { id: "TC1", passed: true, durationMs: 120 },
  { id: "TC2", passed: false, durationMs: 340 },
  { id: "TC3", passed: true, durationMs: 95 }
];

// Array filter & map
const passedTestIds = testResults
  .filter(t => t.passed)
  .map(t => t.id);

console.log("Passed Tests:", passedTestIds);

// Set for uniqueness
const tags = new Set(["smoke", "regression", "smoke"]);
console.log("Unique tags count:", tags.size);
`,
        bestPractices: [
          'Prefer array methods (map, filter) over manual loops for data transformation',
          'Use Set to quickly eliminate duplicate values from arrays (Array.from(new Set(arr)))',
        ],
      },
      {
        id: 'advanced',
        title: '9. Advanced (Async & Promises)',
        order: 9,
        language: 'javascript',
        summary: 'Asynchronous JavaScript with Promises, async/await, and try/catch.',
        overview: 'async/await allows asynchronous code that returns Promises to be written in a synchronous, readable style.',
        keyPoints: [
          'Promises represent values available now, later, or never',
          'async functions always return a Promise',
          'await pauses execution until the Promise settles',
          'Handle errors using try / catch blocks around await calls',
        ],
        starterCode: `// 9. JavaScript Async & Promises
const simulateApiCall = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runAutomation() {
  console.log("1. Navigating to Login Page...");
  await simulateApiCall(100);

  console.log("2. Submitting credentials...");
  await simulateApiCall(100);

  console.log("3. Login successful! Dashboard loaded.");
  return { status: "OK", timeMs: 200 };
}

runAutomation().then(res => console.log("Done:", res));
`,
        bestPractices: [
          'Always wrap await statements in try/catch to handle network/server errors',
          'Use Promise.all() when running multiple independent async tasks in parallel',
        ],
      },
    ],
  },
  java: {
    id: 'java',
    name: 'Java Programming',
    version: 'Java 21 LTS',
    tagline: 'Rock-solid, statically typed object-oriented software engineering for enterprise & Android.',
    badge: 'Java 21',
    accentColor: 'text-cyan-500',
    badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    description: `Java is a statically typed, class-based, object-oriented language engineered for high performance, portability, and enterprise-grade reliability. Powered by the Java Virtual Machine (JVM), Java is the industry standard for backend microservices (Spring Boot), Android development, and enterprise test automation frameworks (Selenium Java, Rest Assured, TestNG).`,
    whyLearn: [
      'The #1 enterprise backend language powering global banks, tech giants, and platforms',
      'The premier language for SDET test automation (Selenium WebDriver, Rest Assured, TestNG)',
      'Strict static typing catches bugs at compile time before deployment',
      'High-performance JVM with state-of-the-art garbage collectors (ZGC, G1GC)',
    ],
    useCases: [
      'Enterprise Backend Microservices (Spring Boot, Quarkus, Micronaut)',
      'Enterprise Test Automation Frameworks (Selenium WebDriver, Rest Assured)',
      'Android Mobile Application Development',
      'Distributed Systems & Big Data Platforms (Apache Spark, Kafka, Hadoop)',
      'High-Frequency Financial & Trading Engines',
    ],
    executionModel: 'Compiled to JVM byte-code (.class files) executed by the Java Virtual Machine with Just-In-Time (JIT) compilation to native machine code.',
    concepts: [
      {
        id: 'intro',
        title: '1. Introduction & Main Method',
        order: 1,
        language: 'java',
        summary: 'Java class structure, static void main entry point, and strongly typed variables.',
        overview: 'Every Java program consists of at least one class, with execution beginning inside the public static void main(String[] args) method. Java enforces strong static typing.',
        keyPoints: [
          'public static void main(String[] args) is the required entry point',
          'Primitive types: int, double, boolean, char, long, byte, short, float',
          'Reference types: String, arrays, objects',
          'Every statement must end with a semicolon ;',
        ],
        starterCode: `// 1. Java Introduction
public class Main {
    public static void main(String[] args) {
        String language = "Java 21";
        int releaseYear = 1995;
        double speedScore = 98.5;
        boolean isEnterpriseStandard = true;

        System.out.println("Welcome to " + language + "!");
        System.out.println("First released in: " + releaseYear);
        System.out.println("Performance Score: " + speedScore);
        System.out.println("Enterprise Standard: " + isEnterpriseStandard);
    }
}
`,
        bestPractices: [
          'Class names must start with an uppercase letter and use PascalCase (e.g. TestRunner)',
          'Choose appropriate primitive types (int vs long, double vs float) based on precision needs',
        ],
      },
      {
        id: 'operators',
        title: '2. Operators & Type Casting',
        order: 2,
        language: 'java',
        summary: 'Arithmetic, comparison, logical operators, and explicit type casting.',
        overview: 'Java arithmetic operations between integers produce integers. Explicit casting (e.g. (double) a) converts types safely.',
        keyPoints: [
          'Arithmetic: +, -, *, /, % (integer division truncates decimal)',
          'Comparison: ==, !=, <, >, <=, >=',
          'Logical: && (short-circuit AND), || (short-circuit OR), ! (NOT)',
          'Type casting: Widening (automatic) vs Narrowing (explicit (int) d)',
        ],
        starterCode: `// 2. Java Operators & Casting
public class Main {
    public static void main(String[] args) {
        int a = 15;
        int b = 4;

        System.out.println("Integer Division (15 / 4): " + (a / b));
        System.out.println("Floating Division ((double)15 / 4): " + ((double) a / b));
        System.out.println("Remainder (15 % 4): " + (a % b));

        boolean check = (a > 10) && (b < 10);
        System.out.println("Condition check: " + check);
    }
}
`,
        bestPractices: [
          'Cast operands to double or float before division if you need decimal precision',
          'Use parentheses to ensure operator precedence is unmistakable',
        ],
      },
      {
        id: 'conditions',
        title: '3. Conditions & Control Flow',
        order: 3,
        language: 'java',
        summary: 'if, else if, else branching, ternary operators, and modern switch statements.',
        overview: 'Java conditions require boolean expressions. Modern Java includes switch expressions with arrow syntax ->.',
        keyPoints: [
          'if (booleanCondition) { ... } else { ... }',
          'Conditions must evaluate strictly to boolean (int is not allowed in if())',
          'Switch expressions support clean -> arrow syntax',
        ],
        starterCode: `// 3. Java Conditions
public class Main {
    public static void main(String[] args) {
        int statusCode = 200;
        String statusDescription;

        if (statusCode == 200) {
            statusDescription = "OK - Success";
        } else if (statusCode == 404) {
            statusDescription = "Not Found";
        } else {
            statusDescription = "Unknown Status";
        }

        System.out.println("HTTP " + statusCode + " -> " + statusDescription);
    }
}
`,
        bestPractices: [
          'Use modern switch expressions for multi-branch value lookups',
          'Keep conditional blocks enclosed in curly braces {} even for single statements',
        ],
      },
      {
        id: 'loops',
        title: '4. Loops & Iteration',
        order: 4,
        language: 'java',
        summary: 'for loops, enhanced for-each loops, while, and do-while loops.',
        overview: 'Java provides standard counting loops, while loops, and the enhanced for-each loop for traversing arrays and collections.',
        keyPoints: [
          'for (int i = 0; i < n; i++) standard index loop',
          'for (Type item : collection) enhanced for-each loop',
          'while (condition) loop executes while condition is true',
          'break exits loop immediately, continue skips to next iteration',
        ],
        starterCode: `// 4. Java Iteration
public class Main {
    public static void main(String[] args) {
        String[] testTracks = {"Selenium", "Playwright", "API Testing", "AI QA"};

        System.out.println("--- Enhanced for-each Loop ---");
        for (String track : testTracks) {
            System.out.println("Active Track: " + track);
        }

        System.out.println("\n--- Standard Counting Loop ---");
        for (int i = 0; i < testTracks.length; i++) {
            System.out.println("Track #" + (i + 1) + ": " + testTracks[i]);
        }
    }
}
`,
        bestPractices: [
          'Use the enhanced for-each loop whenever you do not need the numeric index',
          'Ensure the loop termination condition is always reached to prevent infinite loops',
        ],
      },
      {
        id: 'strings',
        title: '5. Strings & Immutability',
        order: 5,
        language: 'java',
        summary: 'String pool, immutability, .equals() vs ==, and StringBuilder for concatenation.',
        overview: 'Strings in Java are immutable objects managed in the JVM String Pool. Always compare strings using .equals() rather than ==.',
        keyPoints: [
          'Always use str1.equals(str2) for string value comparison; == checks memory reference!',
          'Strings are immutable; operations return a new String instance',
          'StringBuilder is mutable and optimized for heavy string construction in loops',
        ],
        starterCode: `// 5. Java Strings
public class Main {
    public static void main(String[] args) {
        String s1 = "Automation";
        String s2 = new String("Automation");

        // Reference check vs Value check
        System.out.println("Reference comparison (s1 == s2): " + (s1 == s2));       // false
        System.out.println("Value comparison (s1.equals(s2)): " + s1.equals(s2)); // true

        // String methods
        System.out.println("Length: " + s1.length());
        System.out.println("Uppercase: " + s1.toUpperCase());
        System.out.println("Contains 'Auto': " + s1.contains("Auto"));
    }
}
`,
        bestPractices: [
          'Never use == to compare strings in Java; always use .equals() or .equalsIgnoreCase()',
          'Use StringBuilder when concatenating strings inside a loop to avoid memory overhead',
        ],
      },
      {
        id: 'functions',
        title: '6. Methods & Overloading',
        order: 6,
        language: 'java',
        summary: 'Declaring methods, return types, parameters, and method overloading.',
        overview: 'Methods in Java encapsulate operations. Method overloading allows multiple methods to share the same name with different parameter signatures.',
        keyPoints: [
          'public static returnType methodName(parameters) declares a method',
          'void indicates the method does not return a value',
          'Method overloading: same method name, different parameter types or counts',
        ],
        starterCode: `// 6. Java Methods
public class Main {
    // Method 1: two integer arguments
    public static int calculateScore(int base, int bonus) {
        return base + bonus;
    }

    // Overloaded Method 2: with double precision
    public static double calculateScore(double base, double bonus) {
        return base + bonus;
    }

    public static void main(String[] args) {
        System.out.println("Integer Score: " + calculateScore(100, 25));
        System.out.println("Double Score: " + calculateScore(98.5, 12.3));
    }
}
`,
        bestPractices: [
          'Methods should do one thing well and be named with a clear verb (e.g. calculateScore)',
          'Avoid having more than 3-4 parameters in a single method; encapsulate in an object if needed',
        ],
      },
      {
        id: 'objects',
        title: '7. Objects & Encapsulation (OOP)',
        order: 7,
        language: 'java',
        summary: 'Classes, constructors, private fields, public getters/setters, and inheritance.',
        overview: 'Encapsulation is a core OOP pillar: keep instance fields private and provide public getter/setter methods to regulate state access.',
        keyPoints: [
          'private fields prevent direct external modification',
          'Constructors initialize object state when using new',
          'public getters/setters enforce business validation rules',
          'extends keyword implements class inheritance',
        ],
        starterCode: `// 7. Java Object-Oriented Programming (OOP)
public class Main {
    public static class TestExecution {
        private String testName;
        private boolean passed;

        public TestExecution(String testName) {
            this.testName = testName;
            this.passed = false;
        }

        public void setPassed(boolean passed) {
            this.passed = passed;
        }

        public void printSummary() {
            System.out.println("Test: " + testName + " | Status: " + (passed ? "PASSED" : "FAILED"));
        }
    }

    public static void main(String[] args) {
        TestExecution test = new TestExecution("Login API Test");
        test.setPassed(true);
        test.printSummary();
    }
}
`,
        bestPractices: [
          'Always mark instance variables private and use getters/setters (encapsulation)',
          'Follow the Page Object Model (POM) architecture pattern in automation frameworks',
        ],
      },
      {
        id: 'data-structures',
        title: '8. Collections (ArrayList, HashMap)',
        order: 8,
        language: 'java',
        summary: 'Java Collections Framework: List/ArrayList, Map/HashMap, and Set/HashSet.',
        overview: 'Java Collections store groups of objects dynamically without fixed array length limits.',
        keyPoints: [
          'ArrayList<T>: Dynamic resizable array implementing List',
          'HashMap<K, V>: Fast O(1) key-value hash table implementing Map',
          'HashSet<T>: Collection enforcing unique elements implementing Set',
          'Collections store reference objects, not primitives (use Integer, Double)',
        ],
        starterCode: `// 8. Java Collections
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

public class Main {
    public static void main(String[] args) {
        // 1. Dynamic ArrayList
        ArrayList<String> suite = new ArrayList<>();
        suite.add("Smoke");
        suite.add("Regression");
        suite.add("Sanity");

        // 2. HashMap (Key-Value)
        HashMap<String, Integer> results = new HashMap<>();
        results.put("Passed", 45);
        results.put("Failed", 2);

        System.out.println("Suites: " + suite);
        System.out.println("Passed count: " + results.get("Passed"));
    }
}
`,
        bestPractices: [
          'Program to interfaces: List<String> list = new ArrayList<>(); rather than ArrayList directly',
          'Specify generics (<String>) to ensure compile-time type safety',
        ],
      },
      {
        id: 'advanced',
        title: '9. Advanced (Exceptions & Interfaces)',
        order: 9,
        language: 'java',
        summary: 'Exception handling (try-catch-finally), custom interfaces, and lambda expressions.',
        overview: 'Interfaces define contracts without implementation details. Exception handling ensures resilient error recovery in production systems.',
        keyPoints: [
          'try { ... } catch (Exception e) { ... } finally { ... }',
          'interface defines method signatures that implementing classes must satisfy',
          'Checked exceptions must be declared or caught; Unchecked (Runtime) exceptions are optional',
        ],
        starterCode: `// 9. Java Advanced Concepts
public class Main {
    public static void main(String[] args) {
        // Exception handling
        try {
            int result = 100 / 0;
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Caught exception gracefully: " + e.getMessage());
        } finally {
            System.out.println("Cleanup / Finally block executed.");
        }
    }
}
`,
        bestPractices: [
          'Never catch generic Throwable or swallow exceptions with an empty catch block',
          'Use try-with-resources for automatic closing of files, sockets, and streams',
        ],
      },
    ],
  },
};

const STORAGE_KEY_PREFIX = 'intelligentqa_kids_course_custom_';

// Stored Custom Lessons
export function getStoredCustomLessons(lang: 'python' | 'javascript' | 'java'): CourseConcept[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${lang}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomLesson(lesson: CourseConcept): void {
  if (typeof window === 'undefined') return;
  const existing = getStoredCustomLessons(lesson.language);
  const updated = [lesson, ...existing.filter(l => l.id !== lesson.id)];
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${lesson.language}`, JSON.stringify(updated));
}

export function deleteCustomLesson(id: string, lang: 'python' | 'javascript' | 'java'): void {
  if (typeof window === 'undefined') return;
  const existing = getStoredCustomLessons(lang);
  const updated = existing.filter(l => l.id !== id);
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${lang}`, JSON.stringify(updated));
}

// Generate Standardized Import Template with Mandatory Fields
export function generateCourseImportTemplate(format: 'json' | 'csv', language: 'python' | 'javascript' | 'java' = 'python'): string {
  if (format === 'csv') {
    return `Title,Language,Summary,Overview,StarterCode,SolutionCode
"Algorithm: Binary Search","${language}","Fast divide-and-conquer search on sorted collections.","Binary search divides the search space in half with every step, achieving O(log n) time complexity.","def binary_search(arr, target):\\n    left, right = 0, len(arr) - 1\\n    while left <= right:\\n        mid = (left + right) // 2\\n        if arr[mid] == target: return mid\\n        elif arr[mid] < target: left = mid + 1\\n        else: right = mid - 1\\n    return -1\\n\\nprint(binary_search([1, 3, 5, 7, 9], 7))","def binary_search(arr, target):\\n    return arr.index(target) if target in arr else -1"
"Algorithm: Bubble Sort","${language}","Classic comparison sorting algorithm for beginner computer science.","Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.","def bubble_sort(arr):\\n    n = len(arr)\\n    for i in range(n):\\n        for j in range(0, n-i-1):\\n            if arr[j] > arr[j+1]: arr[j], arr[j+1] = arr[j+1], arr[j]\\n    return arr\\n\\nprint(bubble_sort([64, 34, 25, 12, 22, 11, 90]))",""`;
  }

  const sampleTemplate: Partial<CourseConcept>[] = [
    {
      title: "Sample Concept Title (Mandatory)",
      language: language,
      summary: "Concise summary explaining what the student will learn in this concept.",
      overview: "Detailed walkthrough of the programming concept with clear examples.",
      starterCode: language === 'python'
        ? "# Starter Python Code\ndef calculate_score(points):\n    return points * 2\n\nprint(calculate_score(10))"
        : language === 'javascript'
        ? "// Starter JavaScript Code\nfunction calculateScore(points) {\n  return points * 2;\n}\nconsole.log(calculateScore(10));"
        : "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Java Concept Starter\");\n    }\n}",
      solutionCode: language === 'python'
        ? "def calculate_score(points):\n    return points * 2\n\nprint(calculate_score(25))"
        : language === 'javascript'
        ? "function calculateScore(points) {\n  return points * 2;\n}\nconsole.log(calculateScore(25));"
        : "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Java Concept Solution\");\n    }\n}",
      keyPoints: [
        "Key point 1 explaining the mechanism",
        "Key point 2 on runtime or syntax details"
      ],
      bestPractices: [
        "Best practice recommendation 1",
        "Best practice recommendation 2"
      ],
    },
  ];

  return JSON.stringify(sampleTemplate, null, 2);
}

// Download Course Import Template
export function downloadCourseImportTemplate(format: 'json' | 'csv', language: 'python' | 'javascript' | 'java' = 'python'): void {
  const content = generateCourseImportTemplate(format, language);
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const extension = format === 'json' ? 'json' : 'csv';
  const filename = `${language}_course_import_template.${extension}`;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
