export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  constraints?: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterTemplates: {
    java: string;
    python: string;
    typescript: string;
    javascript: string;
    csharp: string;
  };
  isCustom?: boolean;
}

export const DEFAULT_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'two-sum',
    title: '1. Two Sum (Find Indices of Target Sum)',
    difficulty: 'Easy',
    category: 'Arrays & HashMaps',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

In test automation, this pattern is frequently used to match paired test data records (e.g., matching debit and credit transactions that reconcile to a net zero balance).

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] == 6, so indices are [1, 2].',
      },
    ],
    starterTemplates: {
      java: `import java.util.*;

public class Main {
    // Problem: Two Sum
    // Return indices of the two numbers that add up to target
    public static int[] twoSum(int[] nums, int target) {
        // Tip: Use a HashMap<Integer, Integer> for O(n) single-pass lookup
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Result: [" + result[0] + ", " + result[1] + "]");
        // Expected: [0, 1]
    }
}
`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Problem: Two Sum
    Return indices of the two numbers that add up to target.
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Result: {result}")
    # Expected: [0, 1]
`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log("Result:", twoSum(nums, target));
// Expected: [0, 1]
`,
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log("Result:", twoSum(nums, target));
// Expected: [0, 1]
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static int[] TwoSum(int[] nums, int target) {
        Dictionary<int, int> map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int complement = target - nums[i];
            if (map.ContainsKey(complement)) {
                return new int[] { map[complement], i };
            }
            if (!map.ContainsKey(nums[i])) {
                map.Add(nums[i], i);
            }
        }
        return new int[] {};
    }

    static void Main(string[] args) {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = TwoSum(nums, target);
        Console.WriteLine($"Result: [{result[0]}, {result[1]}]");
        // Expected: [0, 1]
    }
}
`,
    },
  },
  {
    id: 'valid-palindrome',
    title: '2. Valid Palindrome & String Sanitization',
    difficulty: 'Easy',
    category: 'Strings & Two Pointers',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

SDETs frequently use string sanitization when verifying dynamic web table text, normalized search inputs, and localized UI labels.`,
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.',
    ],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Valid Palindrome
    public static boolean isPalindrome(String s) {
        // Sanitize: keep only alphanumeric and convert to lowercase
        String clean = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        int left = 0, right = clean.length() - 1;
        while (left < right) {
            if (clean.charAt(left) != clean.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        String test1 = "A man, a plan, a canal: Panama";
        String test2 = "race a car";
        System.out.println("Test 1 is Palindrome: " + isPalindrome(test1)); // true
        System.out.println("Test 2 is Palindrome: " + isPalindrome(test2)); // false
    }
}
`,
      python: `import re

def is_palindrome(s: str) -> bool:
    clean = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    return clean == clean[::-1]

if __name__ == "__main__":
    test1 = "A man, a plan, a canal: Panama"
    test2 = "race a car"
    print("Test 1 is Palindrome:", is_palindrome(test1)) # True
    print("Test 2 is Palindrome:", is_palindrome(test2)) # False
`,
      typescript: `function isPalindrome(s: string): boolean {
  const clean = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return clean === clean.split('').reverse().join('');
}

console.log("Test 1:", isPalindrome("A man, a plan, a canal: Panama")); // true
console.log("Test 2:", isPalindrome("race a car")); // false
`,
      javascript: `function isPalindrome(s) {
  const clean = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return clean === clean.split('').reverse().join('');
}

console.log("Test 1:", isPalindrome("A man, a plan, a canal: Panama")); // true
console.log("Test 2:", isPalindrome("race a car")); // false
`,
      csharp: `using System;
using System.Text.RegularExpressions;

class Program {
    public static bool IsPalindrome(string s) {
        string clean = Regex.Replace(s, "[^a-zA-Z0-9]", "").ToLower();
        int left = 0, right = clean.Length - 1;
        while (left < right) {
            if (clean[left] != clean[right]) return false;
            left++;
            right--;
        }
        return true;
    }

    static void Main(string[] args) {
        Console.WriteLine("Test 1: " + IsPalindrome("A man, a plan, a canal: Panama")); // True
        Console.WriteLine("Test 2: " + IsPalindrome("race a car")); // False
    }
}
`,
    },
  },
  {
    id: 'find-duplicates',
    title: '3. Find Duplicate Elements in Array',
    difficulty: 'Easy',
    category: 'Arrays & Sets',
    description: `Given an integer array nums, return all elements that appear more than once in the array.

In API and database testing, checking for unexpected duplicates is a critical validation step for user registrations, order tracking numbers, and product SKUs.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
    ],
    examples: [
      {
        input: 'nums = [4, 3, 2, 7, 8, 2, 3, 1]',
        output: '[2, 3]',
        explanation: 'Numbers 2 and 3 appear twice.',
      },
      {
        input: 'nums = [1, 1, 2]',
        output: '[1]',
        explanation: '1 appears twice.',
      },
    ],
    starterTemplates: {
      java: `import java.util.*;

public class Main {
    // Problem: Find Duplicates in Array
    public static List<Integer> findDuplicates(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        Set<Integer> duplicates = new TreeSet<>();
        for (int num : nums) {
            if (!seen.add(num)) {
                duplicates.add(num);
            }
        }
        return new ArrayList<>(duplicates);
    }

    public static void main(String[] args) {
        int[] nums = {4, 3, 2, 7, 8, 2, 3, 1};
        System.out.println("Duplicates found: " + findDuplicates(nums));
        // Expected: [2, 3]
    }
}
`,
      python: `def find_duplicates(nums: list[int]) -> list[int]:
    seen = set()
    duplicates = set()
    for num in nums:
        if num in seen:
            duplicates.add(num)
        else:
            seen.add(num)
    return sorted(list(duplicates))

if __name__ == "__main__":
    nums = [4, 3, 2, 7, 8, 2, 3, 1]
    print("Duplicates:", find_duplicates(nums)) # [2, 3]
`,
      typescript: `function findDuplicates(nums: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const n of nums) {
    if (seen.has(n)) {
      duplicates.add(n);
    } else {
      seen.add(n);
    }
  }
  return Array.from(duplicates).sort((a, b) => a - b);
}

console.log("Duplicates:", findDuplicates([4, 3, 2, 7, 8, 2, 3, 1])); // [2, 3]
`,
      javascript: `function findDuplicates(nums) {
  const seen = new Set();
  const duplicates = new Set();
  for (const n of nums) {
    if (seen.has(n)) {
      duplicates.add(n);
    } else {
      seen.add(n);
    }
  }
  return Array.from(duplicates).sort((a, b) => a - b);
}

console.log("Duplicates:", findDuplicates([4, 3, 2, 7, 8, 2, 3, 1])); // [2, 3]
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static List<int> FindDuplicates(int[] nums) {
        HashSet<int> seen = new HashSet<int>();
        SortedSet<int> duplicates = new SortedSet<int>();
        foreach (int num in nums) {
            if (!seen.Add(num)) {
                duplicates.Add(num);
            }
        }
        return new List<int>(duplicates);
    }

    static void Main(string[] args) {
        int[] nums = { 4, 3, 2, 7, 8, 2, 3, 1 };
        Console.WriteLine("Duplicates: [" + string.Join(", ", FindDuplicates(nums)) + "]");
        // Expected: [2, 3]
    }
}
`,
    },
  },
  {
    id: 'valid-parentheses',
    title: '4. Valid Parentheses & Bracket Matching',
    difficulty: 'Easy',
    category: 'Stacks & Syntax Validation',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

In QA automation, this algorithm is widely used to validate JSON syntax, HTML/XML tag nesting, and mathematical formula inputs.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only "()[]{}".',
    ],
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
      {
        input: 's = "([{}])"',
        output: 'true',
      },
    ],
    starterTemplates: {
      java: `import java.util.Stack;

public class Main {
    // Problem: Valid Parentheses using Stack
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) {
                return false;
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println("Test '()[]{}': " + isValid("()[]{}")); // true
        System.out.println("Test '(]': " + isValid("(]"));         // false
        System.out.println("Test '([{}])': " + isValid("([{}])")); // true
    }
}
`,
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return len(stack) == 0

if __name__ == "__main__":
    print("Test '()[]{}':", is_valid("()[]{}")) # True
    print("Test '(]':", is_valid("(]"))         # False
    print("Test '([{}])':", is_valid("([{}])")) # True
`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (map[c]) {
      const top = stack.pop() || '#';
      if (map[c] !== top) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}

console.log("Test '()[]{}':", isValid("()[]{}")); // true
console.log("Test '(]':", isValid("(]")); // false
`,
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (map[c]) {
      const top = stack.pop() || '#';
      if (map[c] !== top) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}

console.log("Test '()[]{}':", isValid("()[]{}")); // true
console.log("Test '(]':", isValid("(]")); // false
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static bool IsValid(string s) {
        Stack<char> stack = new Stack<char>();
        foreach (char c in s) {
            if (c == '(') stack.Push(')');
            else if (c == '{') stack.Push('}');
            else if (c == '[') stack.Push(']');
            else if (stack.Count == 0 || stack.Pop() != c) return false;
        }
        return stack.Count == 0;
    }

    static void Main(string[] args) {
        Console.WriteLine("Test '()[]{}': " + IsValid("()[]{}")); // True
        Console.WriteLine("Test '(]': " + IsValid("(]"));         // False
    }
}
`,
    },
  },
  {
    id: 'first-unique-character',
    title: '5. First Non-Repeating Character in a String',
    difficulty: 'Easy',
    category: 'Strings & HashMaps',
    description: `Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.

This problem evaluates character frequency counting and order preservation (e.g. testing unique OTP codes, token generation, or stream logs).`,
    constraints: [
      '1 <= s.length <= 10^5',
      's consists of only lowercase English letters.',
    ],
    examples: [
      {
        input: 's = "leetcode"',
        output: '0',
        explanation: 'The character "l" at index 0 is the first non-repeating character.',
      },
      {
        input: 's = "loveleetcode"',
        output: '2',
        explanation: 'Character "v" at index 2 is the first unique character.',
      },
      {
        input: 's = "aabb"',
        output: '-1',
      },
    ],
    starterTemplates: {
      java: `import java.util.HashMap;
import java.util.Map;

public class Main {
    // Problem: First Non-Repeating Character
    public static int firstUniqChar(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        for (int i = 0; i < s.length(); i++) {
            if (counts.get(s.charAt(i)) == 1) {
                return i;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        System.out.println("Index in 'leetcode': " + firstUniqChar("leetcode"));         // 0
        System.out.println("Index in 'loveleetcode': " + firstUniqChar("loveleetcode")); // 2
        System.out.println("Index in 'aabb': " + firstUniqChar("aabb"));                 // -1
    }
}
`,
      python: `from collections import Counter

def first_uniq_char(s: str) -> int:
    counts = Counter(s)
    for i, char in enumerate(s):
        if counts[char] == 1:
            return i
    return -1

if __name__ == "__main__":
    print("leetcode:", first_uniq_char("leetcode"))         # 0
    print("loveleetcode:", first_uniq_char("loveleetcode")) # 2
    print("aabb:", first_uniq_char("aabb"))                 # -1
`,
      typescript: `function firstUniqChar(s: string): number {
  const map = new Map<string, number>();
  for (const c of s) {
    map.set(c, (map.get(c) || 0) + 1);
  }
  for (let i = 0; i < s.length; i++) {
    if (map.get(s[i]) === 1) return i;
  }
  return -1;
}

console.log("leetcode:", firstUniqChar("leetcode")); // 0
console.log("loveleetcode:", firstUniqChar("loveleetcode")); // 2
`,
      javascript: `function firstUniqChar(s) {
  const map = new Map();
  for (const c of s) {
    map.set(c, (map.get(c) || 0) + 1);
  }
  for (let i = 0; i < s.length; i++) {
    if (map.get(s[i]) === 1) return i;
  }
  return -1;
}

console.log("leetcode:", firstUniqChar("leetcode")); // 0
console.log("loveleetcode:", firstUniqChar("loveleetcode")); // 2
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static int FirstUniqChar(string s) {
        Dictionary<char, int> counts = new Dictionary<char, int>();
        foreach (char c in s) {
            counts[c] = counts.ContainsKey(c) ? counts[c] + 1 : 1;
        }
        for (int i = 0; i < s.Length; i++) {
            if (counts[s[i]] == 1) return i;
        }
        return -1;
    }

    static void Main(string[] args) {
        Console.WriteLine("leetcode: " + FirstUniqChar("leetcode")); // 0
    }
}
`,
    },
  },
  {
    id: 'email-regex-validator',
    title: '6. RegEx Email & Format Validator',
    difficulty: 'Medium',
    category: 'RegEx & Data Sanitization',
    description: `Implement a robust email address format validator using Regular Expressions (RegEx).

A valid email satisfies:
1. Username contains letters, numbers, dots, underscores, or dashes (cannot start with special character).
2. Followed by '@'.
3. Domain name contains letters and dashes.
4. Top-level domain (TLD) has at least 2 characters (e.g. .com, .io, .org).

In QA automation, validating user input constraints on forms and API payloads is a daily SDET responsibility.`,
    constraints: [
      'Email string length between 3 and 254 characters.',
      'Must reject double dots (..), missing @, and missing TLD.',
    ],
    examples: [
      {
        input: 'valid.sdet_pro@intelligentqa.io',
        output: 'true',
      },
      {
        input: 'invalid..user@qa..com',
        output: 'false',
      },
      {
        input: 'missing-at-sign.com',
        output: 'false',
      },
    ],
    starterTemplates: {
      java: `import java.util.regex.Pattern;

public class Main {
    // Problem: Email Format Validator using RegEx
    private static final String EMAIL_REGEX = "^[a-zA-Z0-9_+&*-]+(?:\\\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\\\.)+[a-zA-Z]{2,7}$";
    private static final Pattern PATTERN = Pattern.compile(EMAIL_REGEX);

    public static boolean isValidEmail(String email) {
        if (email == null) return false;
        return PATTERN.matcher(email).matches();
    }

    public static void main(String[] args) {
        String[] testEmails = {
            "valid.sdet_pro@intelligentqa.io",
            "invalid..user@qa..com",
            "missing-at-sign.com",
            "tester@domain.co.uk"
        };
        for (String email : testEmails) {
            System.out.println(email + " -> " + isValidEmail(email));
        }
    }
}
`,
      python: `import re

EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def is_valid_email(email: str) -> bool:
    if not email or ".." in email:
        return False
    return bool(EMAIL_PATTERN.match(email))

if __name__ == "__main__":
    emails = [
        "valid.sdet_pro@intelligentqa.io",
        "invalid..user@qa..com",
        "missing-at-sign.com",
        "tester@domain.co.uk"
    ]
    for email in emails:
        print(f"{email} -> {is_valid_email(email)}")
`,
      typescript: `function isValidEmail(email: string): boolean {
  if (!email || email.includes('..')) return false;
  const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return regex.test(email);
}

const tests = [
  "valid.sdet_pro@intelligentqa.io",
  "invalid..user@qa..com",
  "missing-at-sign.com"
];
tests.forEach(e => console.log(e, "->", isValidEmail(e)));
`,
      javascript: `function isValidEmail(email) {
  if (!email || email.includes('..')) return false;
  const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return regex.test(email);
}

const tests = [
  "valid.sdet_pro@intelligentqa.io",
  "invalid..user@qa..com",
  "missing-at-sign.com"
];
tests.forEach(e => console.log(e, "->", isValidEmail(e)));
`,
      csharp: `using System;
using System.Text.RegularExpressions;

class Program {
    static readonly Regex EmailRegex = new Regex(@"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", RegexOptions.Compiled);

    public static bool IsValidEmail(string email) {
        if (string.IsNullOrEmpty(email) || email.Contains("..")) return false;
        return EmailRegex.IsMatch(email);
    }

    static void Main(string[] args) {
        Console.WriteLine("valid.sdet_pro@intelligentqa.io: " + IsValidEmail("valid.sdet_pro@intelligentqa.io"));
        Console.WriteLine("invalid..user@qa..com: " + IsValidEmail("invalid..user@qa..com"));
    }
}
`,
    },
  },
  {
    id: 'merge-sorted-arrays',
    title: '7. Merge Two Sorted Arrays',
    difficulty: 'Easy',
    category: 'Arrays & Two Pointers',
    description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums1 and nums2 into a single sorted array.

In automation testing, merging sorted lists is a standard routine when aggregating paginated API responses or verifying sorted UI table columns across multi-page grids.`,
    constraints: [
      'nums1 and nums2 are sorted in ascending order.',
      '0 <= nums1.length, nums2.length <= 10^4',
    ],
    examples: [
      {
        input: 'nums1 = [1, 2, 4], nums2 = [1, 3, 4]',
        output: '[1, 1, 2, 3, 4, 4]',
      },
    ],
    starterTemplates: {
      java: `import java.util.Arrays;

public class Main {
    // Problem: Merge Two Sorted Arrays
    public static int[] mergeSorted(int[] nums1, int[] nums2) {
        int[] merged = new int[nums1.length + nums2.length];
        int i = 0, j = 0, k = 0;
        while (i < nums1.length && j < nums2.length) {
            if (nums1[i] <= nums2[j]) {
                merged[k++] = nums1[i++];
            } else {
                merged[k++] = nums2[j++];
            }
        }
        while (i < nums1.length) merged[k++] = nums1[i++];
        while (j < nums2.length) merged[k++] = nums2[j++];
        return merged;
    }

    public static void main(String[] args) {
        int[] nums1 = {1, 2, 4};
        int[] nums2 = {1, 3, 4};
        int[] result = mergeSorted(nums1, nums2);
        System.out.println("Merged: " + Arrays.toString(result));
        // Expected: [1, 1, 2, 3, 4, 4]
    }
}
`,
      python: `def merge_sorted(nums1: list[int], nums2: list[int]) -> list[int]:
    merged = []
    i, j = 0, 0
    while i < len(nums1) and j < len(nums2):
        if nums1[i] <= nums2[j]:
            merged.append(nums1[i])
            i += 1
        else:
            merged.append(nums2[j])
            j += 1
    merged.extend(nums1[i:])
    merged.extend(nums2[j:])
    return merged

if __name__ == "__main__":
    nums1 = [1, 2, 4]
    nums2 = [1, 3, 4]
    print("Merged:", merge_sorted(nums1, nums2))
    # Expected: [1, 1, 2, 3, 4, 4]
`,
      typescript: `function mergeSorted(nums1: number[], nums2: number[]): number[] {
  const merged: number[] = [];
  let i = 0, j = 0;
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) merged.push(nums1[i++]);
    else merged.push(nums2[j++]);
  }
  return [...merged, ...nums1.slice(i), ...nums2.slice(j)];
}

console.log("Merged:", mergeSorted([1, 2, 4], [1, 3, 4]));
`,
      javascript: `function mergeSorted(nums1, nums2) {
  const merged = [];
  let i = 0, j = 0;
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) merged.push(nums1[i++]);
    else merged.push(nums2[j++]);
  }
  return [...merged, ...nums1.slice(i), ...nums2.slice(j)];
}

console.log("Merged:", mergeSorted([1, 2, 4], [1, 3, 4]));
`,
      csharp: `using System;

class Program {
    public static int[] MergeSorted(int[] nums1, int[] nums2) {
        int[] merged = new int[nums1.Length + nums2.Length];
        int i = 0, j = 0, k = 0;
        while (i < nums1.Length && j < nums2.Length) {
            if (nums1[i] <= nums2[j]) merged[k++] = nums1[i++];
            else merged[k++] = nums2[j++];
        }
        while (i < nums1.Length) merged[k++] = nums1[i++];
        while (j < nums2.Length) merged[k++] = nums2[j++];
        return merged;
    }

    static void Main(string[] args) {
        int[] res = MergeSorted(new int[]{1, 2, 4}, new int[]{1, 3, 4});
        Console.WriteLine("Merged: [" + string.Join(", ", res) + "]");
    }
}
`,
    },
  },
  {
    id: 'group-anagrams',
    title: '8. Group Anagrams',
    difficulty: 'Medium',
    category: 'Strings & HashMaps',
    description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.',
    ],
    examples: [
      {
        input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
        output: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]',
      },
    ],
    starterTemplates: {
      java: `import java.util.*;

public class Main {
    // Problem: Group Anagrams
    public static List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String sortedKey = new String(chars);
            map.computeIfAbsent(sortedKey, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }

    public static void main(String[] args) {
        String[] strs = {"eat", "tea", "tan", "ate", "nat", "bat"};
        System.out.println("Grouped Anagrams: " + groupAnagrams(strs));
    }
}
`,
      python: `from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for s in strs:
        sorted_key = "".join(sorted(s))
        groups[sorted_key].append(s)
    return list(groups.values())

if __name__ == "__main__":
    strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
    print("Grouped Anagrams:", group_anagrams(strs))
`,
      typescript: `function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
`,
      javascript: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return Array.from(map.values());
}

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static List<List<string>> GroupAnagrams(string[] strs) {
        Dictionary<string, List<string>> map = new Dictionary<string, List<string>>();
        foreach (string s in strs) {
            char[] arr = s.ToCharArray();
            Array.Sort(arr);
            string key = new string(arr);
            if (!map.ContainsKey(key)) map[key] = new List<string>();
            map[key].Add(s);
        }
        return new List<List<string>>(map.Values);
    }

    static void Main(string[] args) {
        var res = GroupAnagrams(new string[] { "eat", "tea", "tan", "ate", "nat", "bat" });
        foreach (var group in res) {
            Console.WriteLine("[" + string.Join(", ", group) + "]");
        }
    }
}
`,
    },
  },
  {
    id: 'extract-numbers-and-sum',
    title: '9. Extract Numbers from String & Sum Them',
    difficulty: 'Easy',
    category: 'RegEx & String Parsing',
    description: `Given a dirty string containing mixed text, currency symbols, and numbers (e.g. "Total: $12.50 discount: $2.50 and fee: $5.00"), extract all floating-point numbers and return their sum.

In automated web and e-commerce checkout testing, extracting and calculating monetary values from cart tables and billing summaries is an everyday requirement.`,
    constraints: [
      'String contains zero or more positive numeric values (integers or decimals).',
    ],
    examples: [
      {
        input: 'text = "Cart: $10.50, Shipping: $20.25, Tax: $1.25"',
        output: '32.0',
        explanation: '10.50 + 20.25 + 1.25 = 32.0',
      },
    ],
    starterTemplates: {
      java: `import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    // Problem: Extract Numbers & Sum Them
    public static double sumAmounts(String text) {
        Pattern pattern = Pattern.compile("\\\\d+(?:\\\\.\\\\d+)?");
        Matcher matcher = pattern.matcher(text);
        double total = 0.0;
        while (matcher.find()) {
            total += Double.parseDouble(matcher.group());
        }
        return total;
    }

    public static void main(String[] args) {
        String receipt = "Item 1: $10.50, Item 2: $20.25, Tax: $1.25";
        System.out.println("Total calculated sum: $" + sumAmounts(receipt));
        // Expected: 32.0
    }
}
`,
      python: `import re

def sum_amounts(text: str) -> float:
    numbers = re.findall(r'\\d+(?:\\.\\d+)?', text)
    return sum(float(n) for n in numbers)

if __name__ == "__main__":
    receipt = "Cart: $10.50, Shipping: $20.25, Tax: $1.25"
    print("Total calculated: " + str(sum_amounts(receipt))) # 32.00
`,
      typescript: `function sumAmounts(text: string): number {
  const matches = text.match(/\\d+(?:\\.\\d+)?/g);
  if (!matches) return 0;
  return matches.reduce((acc, curr) => acc + parseFloat(curr), 0);
}

const receipt = "Item 1: $10.50, Item 2: $20.25, Tax: $1.25";
console.log("Total:", sumAmounts(receipt)); // 32
`,
      javascript: `function sumAmounts(text) {
  const matches = text.match(/\\d+(?:\\.\\d+)?/g);
  if (!matches) return 0;
  return matches.reduce((acc, curr) => acc + parseFloat(curr), 0);
}

const receipt = "Item 1: $10.50, Item 2: $20.25, Tax: $1.25";
console.log("Total:", sumAmounts(receipt)); // 32
`,
      csharp: `using System;
using System.Text.RegularExpressions;

class Program {
    public static double SumAmounts(string text) {
        MatchCollection matches = Regex.Matches(text, @"\d+(?:\.\d+)?");
        double sum = 0.0;
        foreach (Match m in matches) {
            sum += double.Parse(m.Value);
        }
        return sum;
    }

    static void Main(string[] args) {
        string receipt = "Item 1: $10.50, Item 2: $20.25, Tax: $1.25";
        Console.WriteLine("Total: $" + SumAmounts(receipt));
    }
}
`,
    },
  },
  {
    id: 'longest-common-prefix',
    title: '10. Longest Common Prefix',
    difficulty: 'Easy',
    category: 'Strings & Algorithms',
    description: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".

In SDET test suites, this is used to identify common test class namespaces, REST endpoint route groups, and element ID prefixes.`,
    constraints: [
      '1 <= strs.length <= 200',
      '0 <= strs[i].length <= 200',
      'strs[i] consists of only lowercase English letters.',
    ],
    examples: [
      {
        input: 'strs = ["flower", "flow", "flight"]',
        output: '"fl"',
      },
      {
        input: 'strs = ["dog", "racecar", "car"]',
        output: '""',
        explanation: 'There is no common prefix among the input strings.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Longest Common Prefix
    public static String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) return "";
        String prefix = strs[0];
        for (int i = 1; i < strs.length; i++) {
            while (strs[i].indexOf(prefix) != 0) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) return "";
            }
        }
        return prefix;
    }

    public static void main(String[] args) {
        String[] test1 = {"flower", "flow", "flight"};
        String[] test2 = {"dog", "racecar", "car"};
        System.out.println("Common Prefix (Test 1): \"" + longestCommonPrefix(test1) + "\""); // "fl"
        System.out.println("Common Prefix (Test 2): \"" + longestCommonPrefix(test2) + "\""); // ""
    }
}
`,
      python: `def longest_common_prefix(strs: list[str]) -> str:
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix

if __name__ == "__main__":
    print('Test 1:', longest_common_prefix(["flower", "flow", "flight"])) # "fl"
    print('Test 2:', longest_common_prefix(["dog", "racecar", "car"]))     # ""
`,
      typescript: `function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

console.log("Test 1:", longestCommonPrefix(["flower", "flow", "flight"])); // "fl"
`,
      javascript: `function longestCommonPrefix(strs) {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

console.log("Test 1:", longestCommonPrefix(["flower", "flow", "flight"])); // "fl"
`,
      csharp: `using System;

class Program {
    public static string LongestCommonPrefix(string[] strs) {
        if (strs == null || strs.Length == 0) return "";
        string prefix = strs[0];
        for (int i = 1; i < strs.Length; i++) {
            while (!strs[i].StartsWith(prefix)) {
                prefix = prefix.Substring(0, prefix.Length - 1);
                if (prefix == "") return "";
            }
        }
        return prefix;
    }

    static void Main(string[] args) {
        Console.WriteLine("Prefix: " + LongestCommonPrefix(new string[] { "flower", "flow", "flight" })); // "fl"
    }
}
`,
    },
  },

  // ==========================================
  // CODING TUTORIAL PROBLEMS
  // Python, JavaScript, TypeScript & Java
  // ==========================================
  {
    id: 'kids-reverse-string',
    title: '🚀 Secret Space Rover Code (Reverse a Word)',
    difficulty: 'Easy',
    category: 'Coding Tutorial',
    description: `A Mars space rover received a reversed secret message from Earth!
Write a program to reverse the word so the astronauts on Mars can read it clearly.

For example, if the rover receives "olleh", your program should output "hello".`,
    constraints: [
      '1 <= word.length <= 100',
      'Words consist of English letters',
    ],
    examples: [
      {
        input: 'word = "olleh"',
        output: '"hello"',
        explanation: 'Reversing "olleh" gives "hello".',
      },
      {
        input: 'word = "tacocat"',
        output: '"tacocat"',
        explanation: 'Reversing "tacocat" gives "tacocat".',
      },
    ],
    starterTemplates: {
      python: `# Coding Tutorial: Secret Space Rover Code
# Reverse the word so astronauts can read it!

def reverse_message(word: str) -> str:
    # Tip: In Python you can reverse using word[::-1] or a loop
    return word[::-1]

print("Mars Message:", reverse_message("olleh"))  # Expected: hello
print("Rocket Code:", reverse_message("tekcor"))  # Expected: rocket
`,
      javascript: `// Coding Tutorial: Secret Space Rover Code
// Reverse the word so astronauts can read it!

function reverseMessage(word) {
    return word.split('').reverse().join('');
}

console.log("Mars Message:", reverseMessage("olleh")); // Expected: hello
console.log("Rocket Code:", reverseMessage("tekcor")); // Expected: rocket
`,
      typescript: `// Coding Tutorial: Secret Space Rover Code
// Reverse the word so astronauts can read it!

function reverseMessage(word: string): string {
    return word.split('').reverse().join('');
}

console.log("Mars Message:", reverseMessage("olleh")); // Expected: hello
console.log("Rocket Code:", reverseMessage("tekcor")); // Expected: rocket
`,
      java: `public class Main {
    // Coding Tutorial: Secret Space Rover Code
    public static String reverseMessage(String word) {
        return new StringBuilder(word).reverse().toString();
    }

    public static void main(String[] args) {
        System.out.println("Mars Message: " + reverseMessage("olleh")); // Expected: hello
        System.out.println("Rocket Code: " + reverseMessage("tekcor")); // Expected: rocket
    }
}
`,
      csharp: `using System;

class Program {
    public static string ReverseMessage(string word) {
        char[] arr = word.ToCharArray();
        Array.Reverse(arr);
        return new string(arr);
    }

    static void Main(string[] args) {
        Console.WriteLine("Mars Message: " + ReverseMessage("olleh"));
    }
}
`,
    },
  },
  {
    id: 'kids-magic-fruit-counter',
    title: '🍎 Magic Fruit Basket Counter',
    difficulty: 'Easy',
    category: 'Coding Tutorial',
    description: `Help the friendly picnic robot count fruits in the basket!
Given a list of fruit names and a target fruit you are looking for, return the total count of how many times that fruit appears.`,
    constraints: [
      '1 <= fruits.length <= 100',
      'All fruit names are lowercase strings',
    ],
    examples: [
      {
        input: 'fruits = ["apple", "banana", "apple", "mango", "apple"], target = "apple"',
        output: '3',
        explanation: '"apple" appears 3 times in the basket.',
      },
      {
        input: 'fruits = ["banana", "orange", "grape"], target = "strawberry"',
        output: '0',
        explanation: '"strawberry" is not in the basket.',
      },
    ],
    starterTemplates: {
      python: `# Coding Tutorial: Magic Fruit Basket Counter
# Count how many target fruits are in the list!

def count_fruits(fruits: list, target: str) -> int:
    count = 0
    for fruit in fruits:
        if fruit == target:
            count += 1
    return count

basket = ["apple", "banana", "apple", "mango", "apple"]
print("Apple count:", count_fruits(basket, "apple"))  # Expected: 3
`,
      javascript: `// Coding Tutorial: Magic Fruit Basket Counter
// Count how many target fruits are in the array!

function countFruits(fruits, target) {
    let count = 0;
    for (const fruit of fruits) {
        if (fruit === target) {
            count++;
        }
    }
    return count;
}

const basket = ["apple", "banana", "apple", "mango", "apple"];
console.log("Apple count:", countFruits(basket, "apple")); // Expected: 3
`,
      typescript: `// Coding Tutorial: Magic Fruit Basket Counter
// Count how many target fruits are in the array!

function countFruits(fruits: string[], target: string): number {
    return fruits.filter(f => f === target).length;
}

const basket = ["apple", "banana", "apple", "mango", "apple"];
console.log("Apple count:", countFruits(basket, "apple")); // Expected: 3
`,
      java: `import java.util.*;

public class Main {
    // Coding Tutorial: Magic Fruit Basket Counter
    public static int countFruits(String[] fruits, String target) {
        int count = 0;
        for (String f : fruits) {
            if (f.equals(target)) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        String[] basket = {"apple", "banana", "apple", "mango", "apple"};
        System.out.println("Apple count: " + countFruits(basket, "apple")); // Expected: 3
    }
}
`,
      csharp: `using System;

class Program {
    public static int CountFruits(string[] fruits, string target) {
        int count = 0;
        foreach (var f in fruits) {
            if (f == target) count++;
        }
        return count;
    }

    static void Main(string[] args) {
        string[] basket = { "apple", "banana", "apple", "mango", "apple" };
        Console.WriteLine("Apple count: " + CountFruits(basket, "apple"));
    }
}
`,
    },
  },
  {
    id: 'kids-superhero-power',
    title: '⚡ Superhero Max Power Level Finder',
    difficulty: 'Easy',
    category: 'Coding Tutorial',
    description: `The Superhero Academy needs to find their strongest champion for the cosmic tournament!
Given an array of superhero power levels (positive numbers), find and return the maximum power on the team.`,
    constraints: [
      '1 <= powers.length <= 100',
      '1 <= powers[i] <= 1000',
    ],
    examples: [
      {
        input: 'powers = [45, 88, 99, 72, 105, 60]',
        output: '105',
        explanation: '105 is the highest power level on the team.',
      },
    ],
    starterTemplates: {
      python: `# Coding Tutorial: Superhero Max Power Finder
# Find the highest number in the list!

def find_highest_power(powers: list) -> int:
    highest = powers[0]
    for p in powers:
        if p > highest:
            highest = p
    return highest

team_powers = [45, 88, 99, 72, 105, 60]
print("Champion Power:", find_highest_power(team_powers))  # Expected: 105
`,
      javascript: `// Coding Tutorial: Superhero Max Power Finder
// Find the highest number in the array!

function findHighestPower(powers) {
    let highest = powers[0];
    for (const p of powers) {
        if (p > highest) {
            highest = p;
        }
    }
    return highest;
}

const teamPowers = [45, 88, 99, 72, 105, 60];
console.log("Champion Power:", findHighestPower(teamPowers)); // Expected: 105
`,
      typescript: `// Coding Tutorial: Superhero Max Power Finder
// Find the highest number in the array!

function findHighestPower(powers: number[]): number {
    return Math.max(...powers);
}

const teamPowers = [45, 88, 99, 72, 105, 60];
console.log("Champion Power:", findHighestPower(teamPowers)); // Expected: 105
`,
      java: `public class Main {
    // Coding Tutorial: Superhero Max Power Finder
    public static int findHighestPower(int[] powers) {
        int highest = powers[0];
        for (int p : powers) {
            if (p > highest) {
                highest = p;
            }
        }
        return highest;
    }

    public static void main(String[] args) {
        int[] teamPowers = {45, 88, 99, 72, 105, 60};
        System.out.println("Champion Power: " + findHighestPower(teamPowers)); // Expected: 105
    }
}
`,
      csharp: `using System;

class Program {
    public static int FindHighestPower(int[] powers) {
        int highest = powers[0];
        foreach (int p in powers) {
            if (p > highest) highest = p;
        }
        return highest;
    }

    static void Main(string[] args) {
        int[] teamPowers = { 45, 88, 99, 72, 105, 60 };
        Console.WriteLine("Champion Power: " + FindHighestPower(teamPowers));
    }
}
`,
    },
  },
  {
    id: 'kids-buzz-boom',
    title: '🐝 Buzz & Boom Game (Multiples of 3 and 5)',
    difficulty: 'Easy',
    category: 'Coding Tutorial',
    description: `Play the Buzz & Boom game from 1 to N!
For every number from 1 to N:
- If divisible by 3, output "Buzz"
- If divisible by 5, output "Boom"
- If divisible by both 3 and 5, output "BuzzBoom"
- Otherwise output the number as a string.`,
    constraints: [
      '1 <= n <= 50',
    ],
    examples: [
      {
        input: 'n = 5',
        output: '["1", "2", "Buzz", "4", "Boom"]',
        explanation: '3 is divisible by 3 (Buzz), 5 is divisible by 5 (Boom).',
      },
    ],
    starterTemplates: {
      python: `# Coding Tutorial: Buzz & Boom Game

def buzz_boom(n: int) -> list:
    result = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            result.append("BuzzBoom")
        elif i % 3 == 0:
            result.append("Buzz")
        elif i % 5 == 0:
            result.append("Boom")
        else:
            result.append(str(i))
    return result

print(buzz_boom(15))
`,
      javascript: `// Coding Tutorial: Buzz & Boom Game

function buzzBoom(n) {
    const result = [];
    for (let i = 1; i <= n; i++) {
        if (i % 3 === 0 && i % 5 === 0) {
            result.push("BuzzBoom");
        } else if (i % 3 === 0) {
            result.push("Buzz");
        } else if (i % 5 === 0) {
            result.push("Boom");
        } else {
            result.push(String(i));
        }
    }
    return result;
}

console.log(buzzBoom(15));
`,
      typescript: `// Coding Tutorial: Buzz & Boom Game

function buzzBoom(n: number): string[] {
    const result: string[] = [];
    for (let i = 1; i <= n; i++) {
        if (i % 3 === 0 && i % 5 === 0) {
            result.push("BuzzBoom");
        } else if (i % 3 === 0) {
            result.push("Buzz");
        } else if (i % 5 === 0) {
            result.push("Boom");
        } else {
            result.push(String(i));
        }
    }
    return result;
}

console.log(buzzBoom(15));
`,
      java: `import java.util.*;

public class Main {
    public static List<String> buzzBoom(int n) {
        List<String> result = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 3 == 0 && i % 5 == 0) {
                result.add("BuzzBoom");
            } else if (i % 3 == 0) {
                result.add("Buzz");
            } else if (i % 5 == 0) {
                result.add("Boom");
            } else {
                result.add(String.valueOf(i));
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(buzzBoom(15));
    }
}
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static List<string> BuzzBoom(int n) {
        List<string> result = new List<string>();
        for (int i = 1; i <= n; i++) {
            if (i % 3 == 0 && i % 5 == 0) result.Add("BuzzBoom");
            else if (i % 3 == 0) result.Add("Buzz");
            else if (i % 5 == 0) result.Add("Boom");
            else result.Add(i.ToString());
        }
        return result;
    }

    static void Main(string[] args) {
        Console.WriteLine(string.Join(", ", BuzzBoom(15)));
    }
}
`,
    },
  },
  {
    id: 'kids-mirror-word',
    title: '🪞 Magic Mirror Word Detective (Palindrome)',
    difficulty: 'Easy',
    category: 'Coding Tutorial',
    description: `A Magic Mirror word reads exactly the same forwards and backwards!
Words like "radar", "racecar", "level", and "mom" are Magic Mirror words.
Write a function that returns true if the word is a magic mirror word, else false.`,
    constraints: [
      '1 <= word.length <= 50',
      'Only lowercase letters',
    ],
    examples: [
      {
        input: 'word = "racecar"',
        output: 'true',
        explanation: '"racecar" reversed is still "racecar".',
      },
      {
        input: 'word = "robot"',
        output: 'false',
        explanation: '"robot" reversed is "tobor", not matching.',
      },
    ],
    starterTemplates: {
      python: `# Coding Tutorial: Magic Mirror Word Detective

def is_mirror_word(word: str) -> bool:
    return word == word[::-1]

print("racecar:", is_mirror_word("racecar"))  # True
print("robot:", is_mirror_word("robot"))      # False
`,
      javascript: `// Coding Tutorial: Magic Mirror Word Detective

function isMirrorWord(word) {
    const reversed = word.split('').reverse().join('');
    return word === reversed;
}

console.log("racecar:", isMirrorWord("racecar")); // true
console.log("robot:", isMirrorWord("robot"));     // false
`,
      typescript: `// Coding Tutorial: Magic Mirror Word Detective

function isMirrorWord(word: string): boolean {
    const reversed = word.split('').reverse().join('');
    return word === reversed;
}

console.log("racecar:", isMirrorWord("racecar")); // true
console.log("robot:", isMirrorWord("robot"));     // false
`,
      java: `public class Main {
    public static boolean isMirrorWord(String word) {
        String reversed = new StringBuilder(word).reverse().toString();
        return word.equals(reversed);
    }

    public static void main(String[] args) {
        System.out.println("racecar: " + isMirrorWord("racecar")); // true
        System.out.println("robot: " + isMirrorWord("robot"));     // false
    }
}
`,
      csharp: `using System;

class Program {
    public static bool IsMirrorWord(string word) {
        char[] arr = word.ToCharArray();
        Array.Reverse(arr);
        return word == new string(arr);
    }

    static void Main(string[] args) {
        Console.WriteLine("racecar: " + IsMirrorWord("racecar")); // true
    }
}
`,
    },
  },
  {
    id: 'kids-treasure-gold',
    title: '🪙 Treasure Island Gold Coin Collector',
    difficulty: 'Easy',
    category: 'Coding Tutorial',
    description: `A young pirate explorer is exploring a treasure map!
Along the path:
- Positive numbers represent gold coins collected.
- Negative numbers represent trap fees.
Write a function to sum up only the positive gold coins collected along the trail!`,
    constraints: [
      '1 <= coins.length <= 50',
      '-100 <= coins[i] <= 100',
    ],
    examples: [
      {
        input: 'coins = [10, -5, 20, -2, 5]',
        output: '35',
        explanation: 'Positive coins: 10 + 20 + 5 = 35.',
      },
    ],
    starterTemplates: {
      python: `# Coding Tutorial: Treasure Island Gold Coin Collector

def collect_gold(coins: list) -> int:
    total_gold = 0
    for coin in coins:
        if coin > 0:
            total_gold += coin
    return total_gold

chest = [10, -5, 20, -2, 5]
print("Total Gold Collected:", collect_gold(chest))  # Expected: 35
`,
      javascript: `// Coding Tutorial: Treasure Island Gold Coin Collector

function collectGold(coins) {
    let totalGold = 0;
    for (const coin of coins) {
        if (coin > 0) {
            totalGold += coin;
        }
    }
    return totalGold;
}

const chest = [10, -5, 20, -2, 5];
console.log("Total Gold Collected:", collectGold(chest)); // Expected: 35
`,
      typescript: `// Coding Tutorial: Treasure Island Gold Coin Collector

function collectGold(coins: number[]): number {
    return coins.filter(c => c > 0).reduce((sum, c) => sum + c, 0);
}

const chest = [10, -5, 20, -2, 5];
console.log("Total Gold Collected:", collectGold(chest)); // Expected: 35
`,
      java: `public class Main {
    public static int collectGold(int[] coins) {
        int totalGold = 0;
        for (int coin : coins) {
            if (coin > 0) {
                totalGold += coin;
            }
        }
        return totalGold;
    }

    public static void main(String[] args) {
        int[] chest = {10, -5, 20, -2, 5};
        System.out.println("Total Gold Collected: " + collectGold(chest)); // Expected: 35
    }
}
`,
      csharp: `using System;

class Program {
    public static int CollectGold(int[] coins) {
        int total = 0;
        foreach (int c in coins) {
            if (c > 0) total += c;
        }
        return total;
    }

    static void Main(string[] args) {
        int[] chest = { 10, -5, 20, -2, 5 };
        Console.WriteLine("Total Gold: " + CollectGold(chest));
    }
}
`,
    },
  },
  {
    id: 'trapping-rain-water',
    title: '19. Trapping Rain Water (Two Pointers)',
    difficulty: 'Hard',
    category: 'Arrays & Two Pointers',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\nIn SDET performance and telemetry systems, this two-pointer / histogram accumulation algorithm is used to measure queue bottleneck backpressure, data packet buffer pooling, and peak memory consumption under surge loads.',
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
    ],
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The elevation map traps 6 units of rain water.',
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
        explanation: 'The elevation map traps 9 units of rain water.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Trapping Rain Water (Hard)
    // O(n) time, O(1) space two-pointer approach
    public static int trap(int[] height) {
        if (height == null || height.length <= 2) return 0;
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int waterTrapped = 0;

        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    waterTrapped += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    waterTrapped += rightMax - height[right];
                }
                right--;
            }
        }
        return waterTrapped;
    }

    public static void main(String[] args) {
        int[] elevation1 = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
        System.out.println("Test Case 1 (Expected 6): " + trap(elevation1));

        int[] elevation2 = {4, 2, 0, 3, 2, 5};
        System.out.println("Test Case 2 (Expected 9): " + trap(elevation2));
    }
}`,
      python: `def trap(height: list[int]) -> int:
    if not height or len(height) <= 2:
        return 0
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0

    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    return water

elevation1 = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
print("Test Case 1 (Expected 6):", trap(elevation1))

elevation2 = [4, 2, 0, 3, 2, 5]
print("Test Case 2 (Expected 9):", trap(elevation2))`,
      typescript: `function trap(height: number[]): number {
    if (!height || height.length <= 2) return 0;
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0;
    let water = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    return water;
}

const elevation1 = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
console.log("Test Case 1 (Expected 6):", trap(elevation1));

const elevation2 = [4, 2, 0, 3, 2, 5];
console.log("Test Case 2 (Expected 9):", trap(elevation2));`,
      javascript: `function trap(height) {
    if (!height || height.length <= 2) return 0;
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0;
    let water = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    return water;
}

const elevation1 = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
console.log("Test Case 1 (Expected 6):", trap(elevation1));

const elevation2 = [4, 2, 0, 3, 2, 5];
console.log("Test Case 2 (Expected 9):", trap(elevation2));`,
      csharp: `using System;

class Program {
    public static int Trap(int[] height) {
        if (height == null || height.Length <= 2) return 0;
        int left = 0, right = height.Length - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;

        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }

    static void Main() {
        int[] elevation1 = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
        Console.WriteLine("Test Case 1 (Expected 6): " + Trap(elevation1));
    }
}`,
    },
  },
  {
    id: 'minimum-window-substring',
    title: '20. Minimum Window Substring (Sliding Window)',
    difficulty: 'Hard',
    category: 'Strings & Sliding Window',
    description: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".\n\nIn automation testing, sliding window string parsing is frequently required when isolating minimum log trace windows containing all requisite error codes, correlation tokens, and session identifiers.',
    constraints: [
      'm == s.length',
      'n == t.length',
      '1 <= m, n <= 10^5',
      's and t consist of uppercase and lowercase English letters.',
    ],
    examples: [
      {
        input: 's = "ADOBECODEBANC", t = "ABC"',
        output: '"BANC"',
        explanation: 'The minimum window substring "BANC" includes \'A\', \'B\', and \'C\' from string t.',
      },
      {
        input: 's = "a", t = "a"',
        output: '"a"',
      },
      {
        input: 's = "a", t = "aa"',
        output: '""',
      },
    ],
    starterTemplates: {
      java: `import java.util.*;

public class Main {
    // Problem: Minimum Window Substring (Hard)
    // O(m + n) time using sliding window & frequency map
    public static String minWindow(String s, String t) {
        if (s == null || t == null || s.length() < t.length()) return "";

        int[] map = new int[128];
        for (char c : t.toCharArray()) map[c]++;

        int count = t.length(), begin = 0, end = 0, head = 0, d = Integer.MAX_VALUE;

        while (end < s.length()) {
            if (map[s.charAt(end++)]-- > 0) count--;
            while (count == 0) {
                if (end - begin < d) {
                    d = end - (head = begin);
                }
                if (map[s.charAt(begin++)]++ == 0) count++;
            }
        }
        return d == Integer.MAX_VALUE ? "" : s.substring(head, head + d);
    }

    public static void main(String[] args) {
        String s = "ADOBECODEBANC";
        String t = "ABC";
        System.out.println("Result (Expected BANC): " + minWindow(s, t));
    }
}`,
      python: `from collections import Counter

def minWindow(s: str, t: str) -> str:
    if not s or not t or len(s) < len(t):
        return ""

    t_count = Counter(t)
    window = {}
    have, need = 0, len(t_count)
    res, res_len = [-1, -1], float("infinity")
    l = 0

    for r in range(len(s)):
        c = s[r]
        window[c] = window.get(c, 0) + 1

        if c in t_count and window[c] == t_count[c]:
            have += 1

        while have == need:
            if (r - l + 1) < res_len:
                res = [l, r]
                res_len = r - l + 1
            window[s[l]] -= 1
            if s[l] in t_count and window[s[l]] < t_count[s[l]]:
                have -= 1
            l += 1

    l, r = res
    return s[l:r + 1] if res_len != float("infinity") else ""

print("Result (Expected BANC):", minWindow("ADOBECODEBANC", "ABC"))`,
      typescript: `function minWindow(s: string, t: string): string {
    if (!s || !t || s.length < t.length) return "";

    const map = new Map<string, number>();
    for (const c of t) map.set(c, (map.get(c) || 0) + 1);

    let count = t.length;
    let begin = 0, end = 0, head = 0, len = Infinity;

    while (end < s.length) {
        const c = s[end++];
        const curr = map.get(c);
        if (curr !== undefined) {
            if (curr > 0) count--;
            map.set(c, curr - 1);
        }

        while (count === 0) {
            if (end - begin < len) {
                len = end - begin;
                head = begin;
            }
            const leftChar = s[begin++];
            const leftCount = map.get(leftChar);
            if (leftCount !== undefined) {
                if (leftCount === 0) count++;
                map.set(leftChar, leftCount + 1);
            }
        }
    }
    return len === Infinity ? "" : s.substring(head, head + len);
}

console.log("Result (Expected BANC):", minWindow("ADOBECODEBANC", "ABC"));`,
      javascript: `function minWindow(s, t) {
    if (!s || !t || s.length < t.length) return "";

    const map = {};
    for (const c of t) map[c] = (map[c] || 0) + 1;

    let count = t.length;
    let begin = 0, end = 0, head = 0, len = Infinity;

    while (end < s.length) {
        const c = s[end++];
        if (map[c] !== undefined) {
            if (map[c] > 0) count--;
            map[c]--;
        }

        while (count === 0) {
            if (end - begin < len) {
                len = end - begin;
                head = begin;
            }
            const leftChar = s[begin++];
            if (map[leftChar] !== undefined) {
                if (map[leftChar] === 0) count++;
                map[leftChar]++;
            }
        }
    }
    return len === Infinity ? "" : s.substring(head, head + len);
}

console.log("Result (Expected BANC):", minWindow("ADOBECODEBANC", "ABC"));`,
      csharp: `using System;

class Program {
    public static string MinWindow(string s, string t) {
        if (string.IsNullOrEmpty(s) || string.IsNullOrEmpty(t) || s.Length < t.Length) return "";
        int[] map = new int[128];
        foreach (char c in t) map[c]++;

        int count = t.Length, begin = 0, end = 0, head = 0, d = int.MaxValue;
        while (end < s.Length) {
            if (map[s[end++]]-- > 0) count--;
            while (count == 0) {
                if (end - begin < d) d = end - (head = begin);
                if (map[s[begin++]]++ == 0) count++;
            }
        }
        return d == int.MaxValue ? "" : s.Substring(head, d);
    }

    static void Main() {
        Console.WriteLine("Result (Expected BANC): " + MinWindow("ADOBECODEBANC", "ABC"));
    }
}`,
    },
  },
  {
    id: 'sliding-window-maximum',
    title: '21. Sliding Window Maximum (Monotonic Queue)',
    difficulty: 'Hard',
    category: 'Arrays & Monotonic Queue',
    description: 'You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position, return the max sliding window.\n\nIn high-frequency automated performance testing, monotonic deques process real-time p99 latency spikes and streaming metric maximums over fixed rolling time windows in optimal O(n) linear time.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      '1 <= k <= nums.length',
    ],
    examples: [
      {
        input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
        output: '[3,3,5,5,6,7]',
        explanation: 'Window [1, 3, -1] -> 3; [3, -1, -3] -> 3; [-1, -3, 5] -> 5; [-3, 5, 3] -> 5; [5, 3, 6] -> 6; [3, 6, 7] -> 7',
      },
      {
        input: 'nums = [1], k = 1',
        output: '[1]',
      },
    ],
    starterTemplates: {
      java: `import java.util.*;

public class Main {
    // Problem: Sliding Window Maximum (Hard)
    // O(n) time using ArrayDeque as a Monotonic Decreasing Queue
    public static int[] maxSlidingWindow(int[] nums, int k) {
        if (nums == null || nums.length == 0 || k <= 0) return new int[0];
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> deque = new ArrayDeque<>();

        for (int i = 0; i < n; i++) {
            while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
                deque.pollFirst();
            }
            while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);

            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        int k = 3;
        System.out.println("Result: " + Arrays.toString(maxSlidingWindow(nums, k)));
    }
}`,
      python: `from collections import deque

def maxSlidingWindow(nums: list[int], k: int) -> list[int]:
    output = []
    q = deque()
    l = r = 0

    while r < len(nums):
        while q and nums[q[-1]] < nums[r]:
            q.pop()
        q.append(r)

        if l > q[0]:
            q.popleft()

        if (r + 1) >= k:
            output.append(nums[q[0]])
            l += 1
        r += 1

    return output

nums = [1, 3, -1, -3, 5, 3, 6, 7]
print("Result:", maxSlidingWindow(nums, 3))`,
      typescript: `function maxSlidingWindow(nums: number[], k: number): number[] {
    const result: number[] = [];
    const deque: number[] = [];

    for (let i = 0; i < nums.length; i++) {
        while (deque.length > 0 && deque[0] < i - k + 1) {
            deque.shift();
        }
        while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
            deque.pop();
        }
        deque.push(i);

        if (i >= k - 1) {
            result.push(nums[deque[0]]);
        }
    }
    return result;
}

const nums = [1, 3, -1, -3, 5, 3, 6, 7];
console.log("Result:", maxSlidingWindow(nums, 3));`,
      javascript: `function maxSlidingWindow(nums, k) {
    const result = [];
    const deque = [];

    for (let i = 0; i < nums.length; i++) {
        while (deque.length > 0 && deque[0] < i - k + 1) {
            deque.shift();
        }
        while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
            deque.pop();
        }
        deque.push(i);

        if (i >= k - 1) {
            result.push(nums[deque[0]]);
        }
    }
    return result;
}

const nums = [1, 3, -1, -3, 5, 3, 6, 7];
console.log("Result:", maxSlidingWindow(nums, 3));`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static int[] MaxSlidingWindow(int[] nums, int k) {
        if (nums == null || nums.Length == 0) return new int[0];
        int n = nums.Length;
        int[] res = new int[n - k + 1];
        LinkedList<int> deque = new LinkedList<int>();

        for (int i = 0; i < n; i++) {
            while (deque.Count > 0 && deque.First.Value < i - k + 1) deque.RemoveFirst();
            while (deque.Count > 0 && nums[deque.Last.Value] < nums[i]) deque.RemoveLast();
            deque.AddLast(i);
            if (i >= k - 1) res[i - k + 1] = nums[deque.First.Value];
        }
        return res;
    }

    static void Main() {
        int[] nums = { 1, 3, -1, -3, 5, 3, 6, 7 };
        Console.WriteLine("Result: " + string.Join(", ", MaxSlidingWindow(nums, 3)));
    }
}`,
    },
  },
  {
    id: 'largest-rectangle-histogram',
    title: '22. Largest Rectangle in Histogram (Monotonic Stack)',
    difficulty: 'Hard',
    category: 'Stacks & Monotonic Stack',
    description: 'Given an array of integers heights representing the histogram\'s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.\n\nMonotonic stack algorithms are an indispensable SDET pattern for max-throughput bandwidth analysis, resource provisioning boundaries, and optimal continuous container sizing.',
    constraints: [
      '1 <= heights.length <= 10^5',
      '0 <= heights[i] <= 10^4',
    ],
    examples: [
      {
        input: 'heights = [2,1,5,6,2,3]',
        output: '10',
        explanation: 'The largest rectangle is formed by bars at indices 2 and 3 with area = 10 units.',
      },
      {
        input: 'heights = [2,4]',
        output: '4',
      },
    ],
    starterTemplates: {
      java: `import java.util.*;

public class Main {
    // Problem: Largest Rectangle in Histogram (Hard)
    // O(n) time using a Monotonic Increasing Stack
    public static int largestRectangleArea(int[] heights) {
        if (heights == null || heights.length == 0) return 0;
        int n = heights.length;
        Stack<Integer> stack = new Stack<>();
        int maxArea = 0;

        for (int i = 0; i <= n; i++) {
            int currentHeight = (i == n) ? 0 : heights[i];
            while (!stack.isEmpty() && currentHeight < heights[stack.peek()]) {
                int h = heights[stack.pop()];
                int w = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, h * w);
            }
            stack.push(i);
        }
        return maxArea;
    }

    public static void main(String[] args) {
        int[] heights1 = {2, 1, 5, 6, 2, 3};
        System.out.println("Test Case 1 (Expected 10): " + largestRectangleArea(heights1));

        int[] heights2 = {2, 4};
        System.out.println("Test Case 2 (Expected 4): " + largestRectangleArea(heights2));
    }
}`,
      python: `def largestRectangleArea(heights: list[int]) -> int:
    max_area = 0
    stack = []

    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            index, height = stack.pop()
            max_area = max(max_area, height * (i - index))
            start = index
        stack.append((start, h))

    for i, h in stack:
        max_area = max(max_area, h * (len(heights) - i))
    return max_area

print("Test Case 1 (Expected 10):", largestRectangleArea([2, 1, 5, 6, 2, 3]))
print("Test Case 2 (Expected 4):", largestRectangleArea([2, 4]))`,
      typescript: `function largestRectangleArea(heights: number[]): number {
    let maxArea = 0;
    const stack: number[] = [];
    const n = heights.length;

    for (let i = 0; i <= n; i++) {
        const currentHeight = i === n ? 0 : heights[i];
        while (stack.length > 0 && currentHeight < heights[stack[stack.length - 1]]) {
            const h = heights[stack.pop()!];
            const w = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, h * w);
        }
        stack.push(i);
    }
    return maxArea;
}

console.log("Test Case 1 (Expected 10):", largestRectangleArea([2, 1, 5, 6, 2, 3]));
console.log("Test Case 2 (Expected 4):", largestRectangleArea([2, 4]));`,
      javascript: `function largestRectangleArea(heights) {
    let maxArea = 0;
    const stack = [];
    const n = heights.length;

    for (let i = 0; i <= n; i++) {
        const currentHeight = i === n ? 0 : heights[i];
        while (stack.length > 0 && currentHeight < heights[stack[stack.length - 1]]) {
            const h = heights[stack.pop()];
            const w = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, h * w);
        }
        stack.push(i);
    }
    return maxArea;
}

console.log("Test Case 1 (Expected 10):", largestRectangleArea([2, 1, 5, 6, 2, 3]));
console.log("Test Case 2 (Expected 4):", largestRectangleArea([2, 4]));`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static int LargestRectangleArea(int[] heights) {
        int maxArea = 0;
        Stack<int> stack = new Stack<int>();
        int n = heights.Length;

        for (int i = 0; i <= n; i++) {
            int currentHeight = (i == n) ? 0 : heights[i];
            while (stack.Count > 0 && currentHeight < heights[stack.Peek()]) {
                int h = heights[stack.Pop()];
                int w = stack.Count == 0 ? i : i - stack.Peek() - 1;
                maxArea = Math.Max(maxArea, h * w);
            }
            stack.Push(i);
        }
        return maxArea;
    }

    static void Main() {
        int[] heights = { 2, 1, 5, 6, 2, 3 };
        Console.WriteLine("Test Case 1 (Expected 10): " + LargestRectangleArea(heights));
    }
}`,
    },
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: '11. Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Arrays & Dynamic Programming',
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.',
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        output: '0',
        explanation: 'In this case, no transactions are done and max profit = 0.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Best Time to Buy and Sell Stock
    public static int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }

    public static void main(String[] args) {
        int[] prices = {7, 1, 5, 3, 6, 4};
        System.out.println("Max Profit: " + maxProfit(prices)); // 5
    }
}
`,
      python: `def max_profit(prices: list[int]) -> int:
    min_price = float('inf')
    max_p = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_p:
            max_p = price - min_price
    return max_p

if __name__ == "__main__":
    prices = [7, 1, 5, 3, 6, 4]
    print("Max Profit:", max_profit(prices)) # 5
`,
      typescript: `function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}

console.log("Max Profit:", maxProfit([7, 1, 5, 3, 6, 4])); // 5
`,
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}

console.log("Max Profit:", maxProfit([7, 1, 5, 3, 6, 4])); // 5
`,
      csharp: `using System;

class Program {
    public static int MaxProfit(int[] prices) {
        int minPrice = int.MaxValue;
        int maxProfit = 0;
        foreach (int price in prices) {
            if (price < minPrice) minPrice = price;
            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
        }
        return maxProfit;
    }

    static void Main(string[] args) {
        int[] prices = {7, 1, 5, 3, 6, 4};
        Console.WriteLine("Max Profit: " + MaxProfit(prices)); // 5
    }
}
`,
    },
  },
  {
    id: 'binary-search',
    title: '12. Binary Search',
    difficulty: 'Easy',
    category: 'Arrays & Binary Search',
    description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.`,
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All integers in nums are unique and sorted in ascending order.',
    ],
    examples: [
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
        output: '4',
        explanation: '9 exists in nums and its index is 4.',
      },
      {
        input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Binary Search in O(log n)
    public static int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {-1, 0, 3, 5, 9, 12};
        System.out.println("Index of 9: " + search(nums, 9)); // 4
        System.out.println("Index of 2: " + search(nums, 2)); // -1
    }
}
`,
      python: `def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

if __name__ == "__main__":
    nums = [-1, 0, 3, 5, 9, 12]
    print("Index of 9:", search(nums, 9)) # 4
    print("Index of 2:", search(nums, 2)) # -1
`,
      typescript: `function search(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log("Index:", search([-1, 0, 3, 5, 9, 12], 9)); // 4
`,
      javascript: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log("Index:", search([-1, 0, 3, 5, 9, 12], 9)); // 4
`,
      csharp: `using System;

class Program {
    public static int Search(int[] nums, int target) {
        int left = 0, right = nums.Length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    static void Main(string[] args) {
        int[] nums = {-1, 0, 3, 5, 9, 12};
        Console.WriteLine("Index: " + Search(nums, 9)); // 4
    }
}
`,
    },
  },
  {
    id: 'maximum-subarray',
    title: "13. Maximum Subarray (Kadane's Algorithm)",
    difficulty: 'Medium',
    category: 'Arrays & Dynamic Programming',
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. An optimal solution runs in O(n) linear time using Kadane's algorithm.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      {
        input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.',
      },
      {
        input: 'nums = [5, 4, -1, 7, 8]',
        output: '23',
        explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Maximum Subarray using Kadane's Algorithm
    public static int maxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int currentMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentMax = Math.max(nums[i], currentMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currentMax);
        }
        return maxSoFar;
    }

    public static void main(String[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println("Maximum Subarray Sum: " + maxSubArray(nums)); // 6
    }
}
`,
      python: `def max_sub_array(nums: list[int]) -> int:
    max_so_far = nums[0]
    current_max = nums[0]
    for x in nums[1:]:
        current_max = max(x, current_max + x)
        max_so_far = max(max_so_far, current_max)
    return max_so_far

if __name__ == "__main__":
    nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    print("Maximum Subarray Sum:", max_sub_array(nums)) # 6
`,
      typescript: `function maxSubArray(nums: number[]): number {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}

console.log("Max Sum:", maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
`,
      javascript: `function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}

console.log("Max Sum:", maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
`,
      csharp: `using System;

class Program {
    public static int MaxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int currentMax = nums[0];
        for (int i = 1; i < nums.Length; i++) {
            currentMax = Math.Max(nums[i], currentMax + nums[i]);
            maxSoFar = Math.Max(maxSoFar, currentMax);
        }
        return maxSoFar;
    }

    static void Main(string[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        Console.WriteLine("Max Sum: " + MaxSubArray(nums)); // 6
    }
}
`,
    },
  },
  {
    id: 'product-of-array-except-self',
    title: '14. Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays & Prefix Sum',
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The algorithm must run in O(n) time without using the division operation.`,
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.',
    ],
    examples: [
      {
        input: 'nums = [1, 2, 3, 4]',
        output: '[24, 12, 8, 6]',
        explanation: 'Each element is the product of all others: 2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6.',
      },
      {
        input: 'nums = [-1, 1, 0, -3, 3]',
        output: '[0, 0, 9, 0, 0]',
        explanation: 'Product except element 0 is (-1)*1*(-3)*3 = 9.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Product of Array Except Self in O(n)
    public static int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        res[0] = 1;
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= right;
            right *= nums[i];
        }
        return res;
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4};
        System.out.println("Result: " + java.util.Arrays.toString(productExceptSelf(nums))); // [24, 12, 8, 6]
    }
}
`,
      python: `def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [1] * n
    for i in range(1, n):
        res[i] = res[i - 1] * nums[i - 1]
    right = 1
    for i in range(n - 1, -1, -1):
        res[i] *= right
        right *= nums[i]
    return res

if __name__ == "__main__":
    nums = [1, 2, 3, 4]
    print("Result:", product_except_self(nums)) # [24, 12, 8, 6]
`,
      typescript: `function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const res: number[] = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    res[i] = res[i - 1] * nums[i - 1];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= right;
    right *= nums[i];
  }
  return res;
}

console.log("Result:", productExceptSelf([1, 2, 3, 4])); // [24, 12, 8, 6]
`,
      javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const res = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    res[i] = res[i - 1] * nums[i - 1];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= right;
    right *= nums[i];
  }
  return res;
}

console.log("Result:", productExceptSelf([1, 2, 3, 4])); // [24, 12, 8, 6]
`,
      csharp: `using System;

class Program {
    public static int[] ProductExceptSelf(int[] nums) {
        int n = nums.Length;
        int[] res = new int[n];
        res[0] = 1;
        for (int i = 1; i < n; i++) res[i] = res[i - 1] * nums[i - 1];
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= right;
            right *= nums[i];
        }
        return res;
    }

    static void Main(string[] args) {
        int[] nums = {1, 2, 3, 4};
        Console.WriteLine("Result: [" + string.Join(", ", ProductExceptSelf(nums)) + "]");
    }
}
`,
    },
  },
  {
    id: 'longest-substring-without-repeating',
    title: '15. Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Strings & Sliding Window',
    description: `Given a string s, find the length of the longest substring without repeating characters.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Longest Substring Without Repeating Characters (Sliding Window)
    public static int lengthOfLongestSubstring(String s) {
        int[] lastIndex = new int[128];
        java.util.Arrays.fill(lastIndex, -1);
        int maxLen = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < 128 && lastIndex[c] >= start) {
                start = lastIndex[c] + 1;
            }
            if (c < 128) lastIndex[c] = i;
            maxLen = Math.max(maxLen, i - start + 1);
        }
        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println("Length for 'abcabcbb': " + lengthOfLongestSubstring("abcabcbb")); // 3
        System.out.println("Length for 'bbbbb': " + lengthOfLongestSubstring("bbbbb"));       // 1
        System.out.println("Length for 'pwwkew': " + lengthOfLongestSubstring("pwwkew"));     // 3
    }
}
`,
      python: `def length_of_longest_substring(s: str) -> int:
    char_map = {}
    max_len = 0
    start = 0
    for i, char in enumerate(s):
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        char_map[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len

if __name__ == "__main__":
    print("Length for 'abcabcbb':", length_of_longest_substring("abcabcbb")) # 3
    print("Length for 'bbbbb':", length_of_longest_substring("bbbbb"))       # 1
    print("Length for 'pwwkew':", length_of_longest_substring("pwwkew"))     # 3
`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let maxLen = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (map.has(char) && map.get(char)! >= start) {
      start = map.get(char)! + 1;
    }
    map.set(char, i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}

console.log("Length:", lengthOfLongestSubstring("abcabcbb")); // 3
`,
      javascript: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (map.has(char) && map.get(char) >= start) {
      start = map.get(char) + 1;
    }
    map.set(char, i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}

console.log("Length:", lengthOfLongestSubstring("abcabcbb")); // 3
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static int LengthOfLongestSubstring(string s) {
        Dictionary<char, int> map = new Dictionary<char, int>();
        int maxLen = 0, start = 0;
        for (int i = 0; i < s.Length; i++) {
            char c = s[i];
            if (map.ContainsKey(c) && map[c] >= start) start = map[c] + 1;
            map[c] = i;
            maxLen = Math.Max(maxLen, i - start + 1);
        }
        return maxLen;
    }

    static void Main(string[] args) {
        Console.WriteLine("Length: " + LengthOfLongestSubstring("abcabcbb")); // 3
    }
}
`,
    },
  },
  {
    id: 'three-sum',
    title: '16. 3Sum (Three Integer Target Sum)',
    difficulty: 'Medium',
    category: 'Arrays & Two Pointers',
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.`,
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5',
    ],
    examples: [
      {
        input: 'nums = [-1, 0, 1, 2, -1, -4]',
        output: '[[-1, -1, 2], [-1, 0, 1]]',
        explanation: 'Triplets summing to 0 are [-1, 0, 1] and [-1, -1, 2].',
      },
      {
        input: 'nums = [0, 0, 0]',
        output: '[[0, 0, 0]]',
        explanation: 'The only possible triplet sums to 0.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: 3Sum in O(n^2) time using Sorting & Two Pointers
    public static List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        java.util.Arrays.sort(nums);
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    res.add(java.util.Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return res;
    }

    public static void main(String[] args) {
        int[] nums = {-1, 0, 1, 2, -1, -4};
        System.out.println("Triplets: " + threeSum(nums)); // [[-1, -1, 2], [-1, 0, 1]]
    }
}
`,
      python: `def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                res.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return res

if __name__ == "__main__":
    nums = [-1, 0, 1, 2, -1, -4]
    print("Triplets:", three_sum(nums)) # [[-1, -1, 2], [-1, 0, 1]]
`,
      typescript: `function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const res: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        res.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return res;
}

console.log("Triplets:", threeSum([-1, 0, 1, 2, -1, -4]));
`,
      javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        res.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return res;
}

console.log("Triplets:", threeSum([-1, 0, 1, 2, -1, -4]));
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static List<List<int>> ThreeSum(int[] nums) {
        Array.Sort(nums);
        List<List<int>> res = new List<List<int>>();
        for (int i = 0; i < nums.Length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = nums.Length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    res.Add(new List<int> { nums[i], nums[left], nums[right] });
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) left++;
                else right--;
            }
        }
        return res;
    }

    static void Main(string[] args) {
        int[] nums = {-1, 0, 1, 2, -1, -4};
        Console.WriteLine("Triplets count: " + ThreeSum(nums).Count);
    }
}
`,
    },
  },
  {
    id: 'container-with-most-water',
    title: '17. Container With Most Water',
    difficulty: 'Medium',
    category: 'Arrays & Two Pointers',
    description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.`,
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4',
    ],
    examples: [
      {
        input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
        output: '49',
        explanation: 'The max area is between index 1 and index 8: min(8, 7) * (8 - 1) = 7 * 7 = 49.',
      },
      {
        input: 'height = [1, 1]',
        output: '1',
        explanation: 'min(1, 1) * (1 - 0) = 1.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Container With Most Water in O(n) Two Pointers
    public static int maxArea(int[] height) {
        int maxWater = 0;
        int left = 0, right = height.length - 1;
        while (left < right) {
            int h = Math.min(height[left], height[right]);
            maxWater = Math.max(maxWater, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
    }

    public static void main(String[] args) {
        int[] height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
        System.out.println("Max Water: " + maxArea(height)); // 49
    }
}
`,
      python: `def max_area(height: list[int]) -> int:
    max_water = 0
    left, right = 0, len(height) - 1
    while left < right:
        h = min(height[left], height[right])
        max_water = max(max_water, h * (right - left))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water

if __name__ == "__main__":
    height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
    print("Max Water:", max_area(height)) # 49
`,
      typescript: `function maxArea(height: number[]): number {
  let maxWater = 0;
  let left = 0, right = height.length - 1;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}

console.log("Max Water:", maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
`,
      javascript: `function maxArea(height) {
  let maxWater = 0;
  let left = 0, right = height.length - 1;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxWater;
}

console.log("Max Water:", maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
`,
      csharp: `using System;

class Program {
    public static int MaxArea(int[] height) {
        int maxWater = 0;
        int left = 0, right = height.Length - 1;
        while (left < right) {
            int h = Math.Min(height[left], height[right]);
            maxWater = Math.Max(maxWater, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
    }

    static void Main(string[] args) {
        int[] height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
        Console.WriteLine("Max Water: " + MaxArea(height)); // 49
    }
}
`,
    },
  },
  {
    id: 'top-k-frequent-elements',
    title: '18. Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'HashMaps & Bucket Sort',
    description: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order. An optimal solution runs in O(n) time using Bucket Sort.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      'k is in the range [1, the number of unique elements in the array].',
      'It is guaranteed that the answer is unique.',
    ],
    examples: [
      {
        input: 'nums = [1, 1, 1, 2, 2, 3], k = 2',
        output: '[1, 2]',
        explanation: '1 occurs 3 times, 2 occurs 2 times, so top 2 are [1, 2].',
      },
      {
        input: 'nums = [1], k = 1',
        output: '[1]',
        explanation: 'The only element occurs 1 time.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Top K Frequent Elements using Bucket Sort in O(n)
    public static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> countMap = new HashMap<>();
        for (int n : nums) countMap.put(n, countMap.getOrDefault(n, 0) + 1);

        List<Integer>[] bucket = new List[nums.length + 1];
        for (int key : countMap.keySet()) {
            int freq = countMap.get(key);
            if (bucket[freq] == null) bucket[freq] = new ArrayList<>();
            bucket[freq].add(key);
        }

        int[] res = new int[k];
        int idx = 0;
        for (int pos = bucket.length - 1; pos >= 0 && idx < k; pos--) {
            if (bucket[pos] != null) {
                for (int num : bucket[pos]) {
                    res[idx++] = num;
                    if (idx == k) break;
                }
            }
        }
        return res;
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 1, 2, 2, 3};
        System.out.println("Top 2: " + java.util.Arrays.toString(topKFrequent(nums, 2))); // [1, 2]
    }
}
`,
      python: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    count = Counter(nums)
    return [item for item, _ in count.most_common(k)]

if __name__ == "__main__":
    nums = [1, 1, 1, 2, 2, 3]
    print("Top 2:", top_k_frequent(nums, 2)) # [1, 2]
`,
      typescript: `function topKFrequent(nums: number[], k: number): number[] {
  const map = new Map<number, number>();
  for (const n of nums) map.set(n, (map.get(n) || 0) + 1);
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(e => e[0]);
}

console.log("Top 2:", topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
`,
      javascript: `function topKFrequent(nums, k) {
  const map = new Map();
  for (const n of nums) map.set(n, (map.get(n) || 0) + 1);
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(e => e[0]);
}

console.log("Top 2:", topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    public static int[] TopKFrequent(int[] nums, int k) {
        var map = new Dictionary<int, int>();
        foreach (int n in nums) {
            if (!map.ContainsKey(n)) map[n] = 0;
            map[n]++;
        }
        return map.OrderByDescending(x => x.Value).Take(k).Select(x => x.Key).ToArray();
    }

    static void Main(string[] args) {
        int[] nums = {1, 1, 1, 2, 2, 3};
        Console.WriteLine("Top 2: [" + string.Join(", ", TopKFrequent(nums, 2)) + "]");
    }
}
`,
    },
  },
  {
    id: 'merge-k-sorted-lists',
    title: '23. Merge K Sorted Arrays',
    difficulty: 'Hard',
    category: 'Arrays & Min-Heap',
    description: `You are given an array of k sorted integer arrays lists. Merge all the arrays into one sorted array and return it. The optimal solution runs in O(N log k) time using a divide-and-conquer merge approach or a Min-Heap (PriorityQueue).`,
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4',
      'lists[i] is sorted in ascending order.',
    ],
    examples: [
      {
        input: 'lists = [[1, 4, 5], [1, 3, 4], [2, 6]]',
        output: '[1, 1, 2, 3, 4, 4, 5, 6]',
        explanation: 'All lists merged in ascending order.',
      },
      {
        input: 'lists = [[], [1]]',
        output: '[1]',
        explanation: 'Empty array merged with [1] gives [1].',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Merge K Sorted Arrays in O(N log k)
    public static int[] mergeKArrays(int[][] lists) {
        if (lists == null || lists.length == 0) return new int[0];
        return mergeRange(lists, 0, lists.length - 1);
    }

    private static int[] mergeRange(int[][] lists, int left, int right) {
        if (left == right) return lists[left];
        int mid = left + (right - left) / 2;
        int[] l1 = mergeRange(lists, left, mid);
        int[] l2 = mergeRange(lists, mid + 1, right);
        return mergeTwo(l1, l2);
    }

    private static int[] mergeTwo(int[] a, int[] b) {
        int[] res = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) {
            if (a[i] <= b[j]) res[k++] = a[i++];
            else res[k++] = b[j++];
        }
        while (i < a.length) res[k++] = a[i++];
        while (j < b.length) res[k++] = b[j++];
        return res;
    }

    public static void main(String[] args) {
        int[][] lists = {{1, 4, 5}, {1, 3, 4}, {2, 6}};
        System.out.println("Merged: " + java.util.Arrays.toString(mergeKArrays(lists))); // [1, 1, 2, 3, 4, 4, 5, 6]
    }
}
`,
      python: `def merge_k_arrays(lists: list[list[int]]) -> list[int]:
    if not lists:
        return []
    def merge_two(a, b):
        res = []
        i, j = 0, 0
        while i < len(a) and j < len(b):
            if a[i] <= b[j]:
                res.append(a[i])
                i += 1
            else:
                res.append(b[j])
                j += 1
        res.extend(a[i:])
        res.extend(b[j:])
        return res

    def merge_range(l, r):
        if l == r:
            return lists[l]
        mid = (l + r) // 2
        return merge_two(merge_range(l, mid), merge_range(mid + 1, r))

    return merge_range(0, len(lists) - 1)

if __name__ == "__main__":
    lists = [[1, 4, 5], [1, 3, 4], [2, 6]]
    print("Merged:", merge_k_arrays(lists)) # [1, 1, 2, 3, 4, 4, 5, 6]
`,
      typescript: `function mergeKArrays(lists: number[][]): number[] {
  if (!lists.length) return [];
  const mergeTwo = (a: number[], b: number[]): number[] => {
    const res: number[] = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] <= b[j]) res.push(a[i++]);
      else res.push(b[j++]);
    }
    return [...res, ...a.slice(i), ...b.slice(j)];
  };
  const mergeRange = (l: number, r: number): number[] => {
    if (l === r) return lists[l];
    const mid = Math.floor((l + r) / 2);
    return mergeTwo(mergeRange(l, mid), mergeRange(mid + 1, r));
  };
  return mergeRange(0, lists.length - 1);
}

console.log("Merged:", mergeKArrays([[1, 4, 5], [1, 3, 4], [2, 6]]));
`,
      javascript: `function mergeKArrays(lists) {
  if (!lists.length) return [];
  const mergeTwo = (a, b) => {
    const res = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] <= b[j]) res.push(a[i++]);
      else res.push(b[j++]);
    }
    return [...res, ...a.slice(i), ...b.slice(j)];
  };
  const mergeRange = (l, r) => {
    if (l === r) return lists[l];
    const mid = Math.floor((l + r) / 2);
    return mergeTwo(mergeRange(l, mid), mergeRange(mid + 1, r));
  };
  return mergeRange(0, lists.length - 1);
}

console.log("Merged:", mergeKArrays([[1, 4, 5], [1, 3, 4], [2, 6]]));
`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    public static int[] MergeKArrays(int[][] lists) {
        if (lists == null || lists.Length == 0) return new int[0];
        return MergeRange(lists, 0, lists.Length - 1);
    }

    private static int[] MergeRange(int[][] lists, int l, int r) {
        if (l == r) return lists[l];
        int mid = (l + r) / 2;
        return MergeTwo(MergeRange(lists, l, mid), MergeRange(lists, mid + 1, r));
    }

    private static int[] MergeTwo(int[] a, int[] b) {
        int[] res = new int[a.Length + b.Length];
        int i = 0, j = 0, k = 0;
        while (i < a.Length && j < b.Length) {
            if (a[i] <= b[j]) res[k++] = a[i++];
            else res[k++] = b[j++];
        }
        while (i < a.Length) res[k++] = a[i++];
        while (j < b.Length) res[k++] = b[j++];
        return res;
    }

    static void Main(string[] args) {
        int[][] lists = new int[][] { new int[]{1, 4, 5}, new int[]{1, 3, 4}, new int[]{2, 6} };
        Console.WriteLine("Merged: [" + string.Join(", ", MergeKArrays(lists)) + "]");
    }
}
`,
    },
  },
  {
    id: 'median-of-two-sorted-arrays',
    title: '24. Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'Arrays & Binary Search',
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).`,
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6',
    ],
    examples: [
      {
        input: 'nums1 = [1, 3], nums2 = [2]',
        output: '2.0',
        explanation: 'Merged array = [1, 2, 3] and median is 2.0.',
      },
      {
        input: 'nums1 = [1, 2], nums2 = [3, 4]',
        output: '2.5',
        explanation: 'Merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.',
      },
    ],
    starterTemplates: {
      java: `public class Main {
    // Problem: Median of Two Sorted Arrays in O(log(min(m, n)))
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }
        int m = nums1.length, n = nums2.length;
        int low = 0, high = m;

        while (low <= high) {
            int partitionX = (low + high) / 2;
            int partitionY = (m + n + 1) / 2 - partitionX;

            int maxX = (partitionX == 0) ? Integer.MIN_VALUE : nums1[partitionX - 1];
            int minX = (partitionX == m) ? Integer.MAX_VALUE : nums1[partitionX];

            int maxY = (partitionY == 0) ? Integer.MIN_VALUE : nums2[partitionY - 1];
            int minY = (partitionY == n) ? Integer.MAX_VALUE : nums2[partitionY];

            if (maxX <= minY && maxY <= minX) {
                if ((m + n) % 2 == 0) {
                    return ((double) Math.max(maxX, maxY) + Math.min(minX, minY)) / 2.0;
                } else {
                    return (double) Math.max(maxX, maxY);
                }
            } else if (maxX > minY) {
                high = partitionX - 1;
            } else {
                low = partitionX + 1;
            }
        }
        return 0.0;
    }

    public static void main(String[] args) {
        int[] nums1 = {1, 3};
        int[] nums2 = {2};
        System.out.println("Median: " + findMedianSortedArrays(nums1, nums2)); // 2.0
    }
}
`,
      python: `def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    m, n = len(nums1), len(nums2)
    low, high = 0, m

    while low <= high:
        part_x = (low + high) // 2
        part_y = (m + n + 1) // 2 - part_x

        max_x = float('-inf') if part_x == 0 else nums1[part_x - 1]
        min_x = float('inf') if part_x == m else nums1[part_x]

        max_y = float('-inf') if part_y == 0 else nums2[part_y - 1]
        min_y = float('inf') if part_y == n else nums2[part_y]

        if max_x <= min_y and max_y <= min_x:
            if (m + n) % 2 == 0:
                return (max(max_x, max_y) + min(min_x, min_y)) / 2.0
            else:
                return float(max(max_x, max_y))
        elif max_x > min_y:
            high = part_x - 1
        else:
            low = part_x + 1
    return 0.0

if __name__ == "__main__":
    print("Median:", find_median_sorted_arrays([1, 3], [2])) # 2.0
    print("Median:", find_median_sorted_arrays([1, 2], [3, 4])) # 2.5
`,
      typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
  const m = nums1.length, n = nums2.length;
  let low = 0, high = m;
  while (low <= high) {
    const partX = Math.floor((low + high) / 2);
    const partY = Math.floor((m + n + 1) / 2) - partX;

    const maxX = partX === 0 ? -Infinity : nums1[partX - 1];
    const minX = partX === m ? Infinity : nums1[partX];

    const maxY = partY === 0 ? -Infinity : nums2[partY - 1];
    const minY = partY === n ? Infinity : nums2[partY];

    if (maxX <= minY && maxY <= minX) {
      if ((m + n) % 2 === 0) {
        return (Math.max(maxX, maxY) + Math.min(minX, minY)) / 2;
      } else {
        return Math.max(maxX, maxY);
      }
    } else if (maxX > minY) {
      high = partX - 1;
    } else {
      low = partX + 1;
    }
  }
  return 0;
}

console.log("Median:", findMedianSortedArrays([1, 3], [2])); // 2.0
`,
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
  const m = nums1.length, n = nums2.length;
  let low = 0, high = m;
  while (low <= high) {
    const partX = Math.floor((low + high) / 2);
    const partY = Math.floor((m + n + 1) / 2) - partX;

    const maxX = partX === 0 ? -Infinity : nums1[partX - 1];
    const minX = partX === m ? Infinity : nums1[partX];

    const maxY = partY === 0 ? -Infinity : nums2[partY - 1];
    const minY = partY === n ? Infinity : nums2[partY];

    if (maxX <= minY && maxY <= minX) {
      if ((m + n) % 2 === 0) {
        return (Math.max(maxX, maxY) + Math.min(minX, minY)) / 2;
      } else {
        return Math.max(maxX, maxY);
      }
    } else if (maxX > minY) {
      high = partX - 1;
    } else {
      low = partX + 1;
    }
  }
  return 0;
}

console.log("Median:", findMedianSortedArrays([1, 3], [2])); // 2.0
`,
      csharp: `using System;

class Program {
    public static double FindMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.Length > nums2.Length) return FindMedianSortedArrays(nums2, nums1);
        int m = nums1.Length, n = nums2.Length;
        int low = 0, high = m;

        while (low <= high) {
            int partX = (low + high) / 2;
            int partY = (m + n + 1) / 2 - partX;

            int maxX = (partX == 0) ? int.MinValue : nums1[partX - 1];
            int minX = (partX == m) ? int.MaxValue : nums1[partX];

            int maxY = (partY == 0) ? int.MinValue : nums2[partY - 1];
            int minY = (partY == n) ? int.MaxValue : nums2[partY];

            if (maxX <= minY && maxY <= minX) {
                if ((m + n) % 2 == 0) return ((double)Math.Max(maxX, maxY) + Math.Min(minX, minY)) / 2.0;
                else return (double)Math.Max(maxX, maxY);
            } else if (maxX > minY) high = partX - 1;
            else low = partX + 1;
        }
        return 0.0;
    }

    static void Main(string[] args) {
        int[] nums1 = {1, 3};
        int[] nums2 = {2};
        Console.WriteLine("Median: " + FindMedianSortedArrays(nums1, nums2)); // 2.0
    }
}
`,
    },
  },
];

const LOCAL_STORAGE_KEY = 'sdet_custom_coding_problems';

export function getStoredCustomProblems(): CodingProblem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse custom coding problems from localStorage', e);
    return [];
  }
}

const DELETED_PROBLEMS_KEY = 'intelligentqa_deleted_coding_problem_ids';

export function getDeletedProblemIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_PROBLEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomProblem(problem: Partial<CodingProblem> & { title: string; difficulty: 'Easy' | 'Medium' | 'Hard' }): CodingProblem {
  const existing = getStoredCustomProblems();
  const id = problem.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const idx = existing.findIndex(p => p.id === id);

  const newProblem: CodingProblem = {
    category: 'General',
    description: '',
    ...problem,
    id,
    isCustom: true,
  } as CodingProblem;

  let updated: CodingProblem[];
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = newProblem;
  } else {
    updated = [newProblem, ...existing];
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    // If it was in deleted list, remove it from deleted list
    const deleted = getDeletedProblemIds().filter(d => d !== id);
    localStorage.setItem(DELETED_PROBLEMS_KEY, JSON.stringify(deleted));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('intelligentqa_problems_changed', { detail: { problem: newProblem } }));
    }
  } catch (e) {
    console.error('Failed to save problem to localStorage', e);
  }
  return newProblem;
}

export function deleteCustomProblem(id: string): void {
  const existing = getStoredCustomProblems();
  const updated = existing.filter(p => p.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    // Also track in deleted IDs so default problems get removed as well
    const deleted = getDeletedProblemIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_PROBLEMS_KEY, JSON.stringify(deleted));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('intelligentqa_problems_changed', { detail: { id } }));
    }
  } catch (e) {
    console.error('Failed to delete problem from localStorage', e);
  }
}

export function getAllProblems(): CodingProblem[] {
  const deletedIds = new Set(getDeletedProblemIds());
  const custom = getStoredCustomProblems().filter(p => !deletedIds.has(p.id));
  const customIds = new Set(custom.map(p => p.id));
  const defaults = DEFAULT_CODING_PROBLEMS.filter(p => !deletedIds.has(p.id) && !customIds.has(p.id));
  return [...custom, ...defaults];
}

export function parseImportedProblems(content: string): { problems: CodingProblem[]; error?: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { problems: [], error: 'Input is empty.' };
  }

  // 1. Try JSON
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const valid: CodingProblem[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.title) continue;
        valid.push({
          id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          title: String(item.title),
          difficulty: (['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? item.difficulty : 'Medium') as any,
          category: item.category || 'General Coding',
          description: item.description || 'Problem statement not specified.',
          constraints: Array.isArray(item.constraints) ? item.constraints : [],
          examples: Array.isArray(item.examples) ? item.examples : [],
          starterTemplates: item.starterTemplates || {
            java: `public class Main {\n    public static void main(String[] args) {\n        // ${item.title}\n        System.out.println("Solve: ${item.title}");\n    }\n}`,
            python: `# ${item.title}\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    print("Solve: ${item.title}")`,
            typescript: `// ${item.title}\nconsole.log("Solve: ${item.title}");`,
            javascript: `// ${item.title}\nconsole.log("Solve: ${item.title}");`,
            csharp: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Solve: ${item.title}");\n    }\n}`,
          },
          isCustom: true,
        });
      }

      if (valid.length === 0) {
        return { problems: [], error: 'No valid questions found in JSON. Expected objects with "title" and "description".' };
      }

      // Save to localStorage
      const existing = getStoredCustomProblems();
      const updated = [...valid, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      return { problems: valid };
    } catch (err: any) {
      return { problems: [], error: `Invalid JSON syntax: ${err.message}` };
    }
  }

  // 2. Try CSV (Header: Title, Difficulty, Category, Description)
  try {
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { problems: [], error: 'CSV file is empty.' };

    const valid: CodingProblem[] = [];
    const startIndex = lines[0].toLowerCase().includes('title') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV split (handling commas within quotes or plain commas)
      const parts = line.split(',').map(s => s.replace(/^["']|["']$/g, '').trim());
      if (parts.length >= 1 && parts[0]) {
        const title = parts[0];
        const difficulty = (parts[1] && ['Easy', 'Medium', 'Hard'].includes(parts[1]) ? parts[1] : 'Easy') as any;
        const category = parts[2] || 'Imported';
        const description = parts[3] || title;

        valid.push({
          id: `imported-csv-${Date.now()}-${i}`,
          title,
          difficulty,
          category,
          description,
          examples: [],
          starterTemplates: {
            java: `public class Main {\n    public static void main(String[] args) {\n        // Problem: ${title}\n        System.out.println("Hello from ${title}");\n    }\n}`,
            python: `# Problem: ${title}\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    print("${title}")`,
            typescript: `// Problem: ${title}\nconsole.log("${title}");`,
            javascript: `// Problem: ${title}\nconsole.log("${title}");`,
            csharp: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("${title}");\n    }\n}`,
          },
          isCustom: true,
        });
      }
    }

    if (valid.length === 0) {
      return { problems: [], error: 'Could not extract valid questions from CSV.' };
    }

    const existing = getStoredCustomProblems();
    const updated = [...valid, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    return { problems: valid };
  } catch (e: any) {
    return { problems: [], error: `CSV parsing failed: ${e.message}` };
  }
}

// Generate standardized Coding Problem Import Template with mandatory fields
export function getCodingProblemImportTemplate(format: 'json' | 'csv'): string {
  if (format === 'csv') {
    return `Title,Difficulty,Category,Description,ExampleInput,ExampleOutput,Constraints
"Reverse Words in a String","Medium","Strings","Given an input string s, reverse the order of the words while trimming multiple spaces.","s = '  hello world  '","'world hello'","1 <= s.length <= 10^4"
"Validate IPv4 Address","Medium","RegEx & Strings","Write an algorithm to validate whether a given string is a valid IPv4 address in dot-decimal format.","ip = '192.168.1.1'","true","Address has 4 octets between 0 and 255"`;
  }

  const sampleTemplate = [
    {
      title: "Count Frequency of Log Words (Mandatory)",
      difficulty: "Easy",
      category: "Strings & HashMaps (Mandatory)",
      description: "Given a string of test log statements, return the occurrence count of each word. Commonly used in parsing execution failure logs.",
      constraints: [
        "1 <= text.length <= 10^5",
        "Words are space-separated alphanumeric tokens"
      ],
      examples: [
        {
          input: "text = 'Pass Fail Pass Skip Pass'",
          output: "{'Pass': 3, 'Fail': 1, 'Skip': 1}",
          explanation: "'Pass' occurs 3 times, 'Fail' occurs 1 time, 'Skip' occurs 1 time."
        }
      ],
      starterTemplates: {
        java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement your solution here\n        System.out.println(\"Solution Output\");\n    }\n}",
        python: "# Python 3 Solution\ndef count_words(text: str):\n    pass\n\nif __name__ == '__main__':\n    print('Solution Output')",
        typescript: "// TypeScript Solution\nfunction countWords(text: string) {\n    // Implement solution\n}\nconsole.log('Solution Output');",
        javascript: "// JavaScript Solution\nfunction countWords(text) {\n    // Implement solution\n}\nconsole.log('Solution Output');",
        csharp: "using System;\n\npublic class Program {\n    public static void Main() {\n        Console.WriteLine(\"Solution Output\");\n    }\n}"
      }
    }
  ];

  return JSON.stringify(sampleTemplate, null, 2);
}

// Download Coding Problem Template file
export function downloadCodingProblemTemplate(format: 'json' | 'csv'): void {
  const content = getCodingProblemImportTemplate(format);
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const extension = format === 'json' ? 'json' : 'csv';
  const filename = `sdet_coding_problem_template.${extension}`;

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
