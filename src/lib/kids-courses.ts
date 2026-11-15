export interface KidLesson {
  id: string;
  title: string;
  module: string;
  language: 'python' | 'javascript' | 'java';
  summary: string;
  overview?: string;
  starterCode: string;
  solutionCode?: string;
  exercise: string;
}

export interface KidCourseTrack {
  id: 'python' | 'javascript' | 'java';
  title: string;
  language: string;
  badge: string;
  accentColor: string;
  summary: string;
  lessons: KidLesson[];
}

export const DEFAULT_KIDS_COURSES: Record<'python' | 'javascript' | 'java', KidCourseTrack> = {
  python: {
    id: 'python',
    title: 'Python Programming',
    language: 'Python',
    badge: 'Python 3',
    accentColor: 'text-amber-500',
    summary: 'Master coding fundamentals with Python: variables, math, loops, functions, and fun mini-games.',
    lessons: [
      {
        id: 'py-01-hello',
        title: 'Mission 1: Hello Space Rover!',
        module: 'Basics & Output',
        language: 'python',
        summary: 'Learn how computers talk to us using the print() function.',
        overview: 'In Python, print() sends words and numbers directly to the screen. Every character inside quotes is displayed!',
        starterCode: `# 🚀 Print your first secret greeting
rover_name = "Perseverance"
print("Hello Mars Rover: " + rover_name)
print("Battery Level: 100%")
`,
        solutionCode: `rover_name = "Perseverance"
print("Hello Mars Rover: " + rover_name)
print("Battery Level: 100%")
print("Status: All systems operational!")
`,
        exercise: 'Add another print statement to display "Status: All systems operational!" and run your code.',
      },
      {
        id: 'py-02-variables',
        title: 'Mission 2: Superpower Variables & Numbers',
        module: 'Variables & Math',
        language: 'python',
        summary: 'Store energy points, player names, and calculate power levels.',
        overview: 'Variables are like labeled storage boxes in computer memory. You can store words, numbers, and update them anytime!',
        starterCode: `# Calculate total gold coins collected
island_gold = 150
cave_gold = 75
total_gold = island_gold + cave_gold

print(f"Total Gold Collected: {total_gold} coins!")
`,
        solutionCode: `island_gold = 150
cave_gold = 75
bonus_gold = 50
total_gold = island_gold + cave_gold + bonus_gold

print(f"Total Gold Collected: {total_gold} coins!")
`,
        exercise: 'Add a bonus_gold variable worth 50 coins and include it in total_gold calculation.',
      },
      {
        id: 'py-03-loops',
        title: 'Mission 3: Space Rocket Countdown Loops',
        module: 'Loops & Control Flow',
        language: 'python',
        summary: 'Automate repetitive actions using for loops and range().',
        overview: 'Instead of typing 10 print statements, a for loop repeats code as many times as you want!',
        starterCode: `# Countdown to rocket blast-off!
for seconds in range(5, 0, -1):
    print(f"T-minus {seconds} seconds...")

print("🚀 Blast Off into Orbit!")
`,
        solutionCode: `# Countdown to rocket blast-off from 10!
for seconds in range(10, 0, -1):
    print(f"T-minus {seconds} seconds...")

print("🚀 Blast Off into Orbit!")
`,
        exercise: 'Change the countdown range to start from 10 seconds down to 1.',
      },
    ],
  },
  javascript: {
    id: 'javascript',
    title: 'JavaScript Programming',
    language: 'JavaScript',
    badge: 'ES6+ JS',
    accentColor: 'text-emerald-500',
    summary: 'Build interactive logic, game conditions, and web scripts with modern JavaScript.',
    lessons: [
      {
        id: 'js-01-console',
        title: 'Mission 1: Web Console & Variables',
        module: 'JS Fundamentals',
        language: 'javascript',
        summary: 'Learn console.log, let, and const declarations.',
        overview: 'JavaScript is the programming language of the web. console.log() is how developers inspect output and test logic.',
        starterCode: `// ⚡ Log your superhero stats
const heroName = "Cyber Dash";
let speedLevel = 85;

console.log("Hero Name: " + heroName);
console.log("Speed Level: " + speedLevel + " km/h");
`,
        solutionCode: `const heroName = "Cyber Dash";
let speedLevel = 85;
speedLevel += 20;

console.log("Hero Name: " + heroName);
console.log("Speed Level: " + speedLevel + " km/h");
`,
        exercise: 'Increase speedLevel by 20 using speedLevel += 20 and log the new speed.',
      },
      {
        id: 'js-02-arrays',
        title: 'Mission 2: Inventory Arrays & Item Counters',
        module: 'Arrays & Lists',
        language: 'javascript',
        summary: 'Manage inventory items and iterate with for loops.',
        overview: 'Arrays hold collections of items in order. You can access them by index and loop through them!',
        starterCode: `const inventory = ["Laser Sword", "Shield", "Energy Potion", "Jetpack"];

console.log("Total items: " + inventory.length);
for (let i = 0; i < inventory.length; i++) {
  console.log("Item #" + (i + 1) + ": " + inventory[i]);
}
`,
        solutionCode: `const inventory = ["Laser Sword", "Shield", "Energy Potion", "Jetpack", "Grappling Hook"];

console.log("Total items: " + inventory.length);
for (let i = 0; i < inventory.length; i++) {
  console.log("Item #" + (i + 1) + ": " + inventory[i]);
}
`,
        exercise: 'Add "Grappling Hook" to the inventory array and run the program.',
      },
    ],
  },
  java: {
    id: 'java',
    title: 'Java Programming',
    language: 'Java',
    badge: 'Java 21',
    accentColor: 'text-cyan-500',
    summary: 'Learn rock-solid object-oriented programming with Java classes, methods, and types.',
    lessons: [
      {
        id: 'java-01-main',
        title: 'Mission 1: The Java Main Class',
        module: 'Java Structure',
        language: 'java',
        summary: 'Understand public static void main and System.out.println.',
        overview: 'Every Java application starts inside the main method. Java is strongly typed and powers everything from Minecraft to enterprise systems!',
        starterCode: `public class Main {
    public static void main(String[] args) {
        String studentName = "Alex";
        int score = 95;

        System.out.println("Welcome to Java, " + studentName + "!");
        System.out.println("Starting Score: " + score);
    }
}
`,
        solutionCode: `public class Main {
    public static void main(String[] args) {
        String studentName = "Alex";
        int score = 95;

        System.out.println("Welcome to Java, " + studentName + "!");
        System.out.println("Starting Score: " + score);
        System.out.println("Mission: Grade A Software Engineer!");
    }
}
`,
        exercise: 'Add a new System.out.println statement printing your mission objective.',
      },
    ],
  },
};

const STORAGE_KEY_PREFIX = 'intelligentqa_kids_course_custom_';

// Stored Custom Lessons
export function getStoredCustomLessons(lang: 'python' | 'javascript' | 'java'): KidLesson[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${lang}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomLesson(lesson: KidLesson): void {
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
    return `Title,Module,Language,Summary,Overview,StarterCode,SolutionCode,Exercise
"Magic Loop Counter","Loops & Logic","${language}","Learn how to count and repeat instructions efficiently.","Loops help computers do repeated calculations without repeating lines of code.","for i in range(1, 6):\\n    print(f'Count: {i}')","for i in range(1, 11):\\n    print(f'Count: {i}')","Update the loop to count from 1 to 10."
"Decision Maker: If Statements","Conditionals","${language}","Make your code choose different paths based on conditions.","If statements let programs react to user input, scores, and status flags.","score = 80\\nif score >= 70:\\n    print('You Passed!')","score = 95\\nif score >= 90:\\n    print('Grade A!')","Change score to 95 and test the condition."`;
  }

  const sampleTemplate: Partial<KidLesson>[] = [
    {
      title: "Sample Lesson Title (Mandatory)",
      module: "Course Module Name (Mandatory)",
      language: language,
      summary: "Concise summary explaining what the student will learn in this lesson.",
      overview: "Detailed educational walkthrough of the programming concept with easy-to-understand real world examples.",
      starterCode: language === 'python'
        ? "# Starter Python Code\ndef calculate_score(points):\n    return points * 2\n\nprint(calculate_score(10))"
        : language === 'javascript'
        ? "// Starter JavaScript Code\nfunction calculateScore(points) {\n  return points * 2;\n}\nconsole.log(calculateScore(10));"
        : "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Java Lesson Starter\");\n    }\n}",
      solutionCode: language === 'python'
        ? "def calculate_score(points):\n    return points * 2\n\nprint(calculate_score(25))"
        : language === 'javascript'
        ? "function calculateScore(points) {\n  return points * 2;\n}\nconsole.log(calculateScore(25));"
        : "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Java Lesson Solution\");\n    }\n}",
      exercise: "Description of the hands-on coding task for the student to solve in the browser compiler.",
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
