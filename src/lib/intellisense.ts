/**
 * Intelligent Code IntelliSense Engine for In-Browser Compilers
 * Supports: Java, Python, TypeScript, JavaScript, and C#
 * Features:
 * - Keyword, Type, Standard Library & Method Autocompletion
 * - Context-aware Dot completions (e.g. System.out.println, Math.max, console.log)
 * - User-defined variable, function, and class extraction from document
 * - IDE Snippet expansions (sout, psvm, fori, def, clog, cw, etc.)
 * - Caret pixel coordinate calculation for floating dropdown positioning
 * - Auto-closing brackets and smart indentation
 */

export type IntelliSenseKind =
  | 'keyword'
  | 'function'
  | 'method'
  | 'variable'
  | 'class'
  | 'snippet'
  | 'property';

export interface CompletionItem {
  label: string;
  insertText: string;
  kind: IntelliSenseKind;
  detail?: string;
  documentation?: string;
  cursorOffset?: number; // Cursor offset from insertion start, or placeholder indicator
}

export type SupportedLang =
  | 'java'
  | 'python'
  | 'typescript'
  | 'javascript'
  | 'csharp';

// -------------------------------------------------------------
// 1. LANGUAGE SPECIFIC STANDARD DICTIONARIES
// -------------------------------------------------------------

// --- JAVA COMPLETIONS ---
const JAVA_KEYWORDS: CompletionItem[] = [
  { label: 'public', insertText: 'public ', kind: 'keyword', detail: 'access modifier' },
  { label: 'private', insertText: 'private ', kind: 'keyword', detail: 'access modifier' },
  { label: 'protected', insertText: 'protected ', kind: 'keyword', detail: 'access modifier' },
  { label: 'static', insertText: 'static ', kind: 'keyword', detail: 'modifier' },
  { label: 'final', insertText: 'final ', kind: 'keyword', detail: 'modifier' },
  { label: 'class', insertText: 'class ', kind: 'keyword', detail: 'class declaration' },
  { label: 'interface', insertText: 'interface ', kind: 'keyword', detail: 'interface declaration' },
  { label: 'extends', insertText: 'extends ', kind: 'keyword', detail: 'inheritance' },
  { label: 'implements', insertText: 'implements ', kind: 'keyword', detail: 'interface implementation' },
  { label: 'new', insertText: 'new ', kind: 'keyword', detail: 'object instantiation' },
  { label: 'return', insertText: 'return ', kind: 'keyword', detail: 'return statement' },
  { label: 'void', insertText: 'void ', kind: 'keyword', detail: 'return type' },
  { label: 'int', insertText: 'int ', kind: 'keyword', detail: 'primitive type (32-bit signed int)' },
  { label: 'double', insertText: 'double ', kind: 'keyword', detail: 'primitive type (64-bit float)' },
  { label: 'boolean', insertText: 'boolean ', kind: 'keyword', detail: 'primitive type (true/false)' },
  { label: 'char', insertText: 'char ', kind: 'keyword', detail: 'primitive type (16-bit Unicode char)' },
  { label: 'float', insertText: 'float ', kind: 'keyword', detail: 'primitive type (32-bit float)' },
  { label: 'long', insertText: 'long ', kind: 'keyword', detail: 'primitive type (64-bit int)' },
  { label: 'byte', insertText: 'byte ', kind: 'keyword', detail: 'primitive type (8-bit int)' },
  { label: 'short', insertText: 'short ', kind: 'keyword', detail: 'primitive type (16-bit int)' },
  { label: 'if', insertText: 'if ()', kind: 'keyword', detail: 'conditional statement', cursorOffset: 4 },
  { label: 'else', insertText: 'else ', kind: 'keyword', detail: 'conditional statement' },
  { label: 'for', insertText: 'for ()', kind: 'keyword', detail: 'loop statement', cursorOffset: 5 },
  { label: 'while', insertText: 'while ()', kind: 'keyword', detail: 'loop statement', cursorOffset: 7 },
  { label: 'do', insertText: 'do {\n    \n} while ();', kind: 'keyword', detail: 'do-while loop' },
  { label: 'switch', insertText: 'switch ()', kind: 'keyword', detail: 'switch statement', cursorOffset: 8 },
  { label: 'case', insertText: 'case :', kind: 'keyword', detail: 'case label', cursorOffset: 5 },
  { label: 'break', insertText: 'break;', kind: 'keyword', detail: 'break statement' },
  { label: 'continue', insertText: 'continue;', kind: 'keyword', detail: 'continue statement' },
  { label: 'try', insertText: 'try {\n    \n} catch (Exception e) {\n    \n}', kind: 'keyword', detail: 'exception handling' },
  { label: 'catch', insertText: 'catch (Exception e) {\n    \n}', kind: 'keyword', detail: 'catch block' },
  { label: 'finally', insertText: 'finally {\n    \n}', kind: 'keyword', detail: 'finally block' },
  { label: 'throw', insertText: 'throw ', kind: 'keyword', detail: 'throw exception' },
  { label: 'throws', insertText: 'throws ', kind: 'keyword', detail: 'declare exception' },
  { label: 'import', insertText: 'import ', kind: 'keyword', detail: 'import package' },
  { label: 'package', insertText: 'package ', kind: 'keyword', detail: 'package declaration' },
  { label: 'this', insertText: 'this', kind: 'keyword', detail: 'current instance reference' },
  { label: 'super', insertText: 'super', kind: 'keyword', detail: 'superclass reference' },
  { label: 'instanceof', insertText: 'instanceof ', kind: 'keyword', detail: 'type comparison operator' },
  { label: 'var', insertText: 'var ', kind: 'keyword', detail: 'local variable type inference' },
  { label: 'null', insertText: 'null', kind: 'keyword', detail: 'null literal' },
  { label: 'true', insertText: 'true', kind: 'keyword', detail: 'boolean literal' },
  { label: 'false', insertText: 'false', kind: 'keyword', detail: 'boolean literal' },
];

const JAVA_CLASSES: CompletionItem[] = [
  { label: 'System', insertText: 'System', kind: 'class', detail: 'java.lang.System', documentation: 'Standard system utilities, standard in/out/err streams.' },
  { label: 'String', insertText: 'String ', kind: 'class', detail: 'java.lang.String', documentation: 'Immutable character sequence.' },
  { label: 'Integer', insertText: 'Integer', kind: 'class', detail: 'java.lang.Integer', documentation: 'Wrapper class for primitive int.' },
  { label: 'Double', insertText: 'Double', kind: 'class', detail: 'java.lang.Double', documentation: 'Wrapper class for primitive double.' },
  { label: 'Boolean', insertText: 'Boolean', kind: 'class', detail: 'java.lang.Boolean', documentation: 'Wrapper class for primitive boolean.' },
  { label: 'Math', insertText: 'Math', kind: 'class', detail: 'java.lang.Math', documentation: 'Mathematical constants and methods (abs, max, min, sqrt, pow, etc.).' },
  { label: 'Scanner', insertText: 'Scanner', kind: 'class', detail: 'java.util.Scanner', documentation: 'Simple text scanner which can parse primitive types and strings.' },
  { label: 'StringBuilder', insertText: 'StringBuilder', kind: 'class', detail: 'java.lang.StringBuilder', documentation: 'Mutable sequence of characters for efficient string manipulation.' },
  { label: 'ArrayList', insertText: 'ArrayList<>', kind: 'class', detail: 'java.util.ArrayList', documentation: 'Resizable-array implementation of the List interface.', cursorOffset: 10 },
  { label: 'LinkedList', insertText: 'LinkedList<>', kind: 'class', detail: 'java.util.LinkedList', documentation: 'Doubly-linked list implementation of List and Deque.', cursorOffset: 11 },
  { label: 'HashMap', insertText: 'HashMap<, >', kind: 'class', detail: 'java.util.HashMap', documentation: 'Hash table based implementation of the Map interface.', cursorOffset: 8 },
  { label: 'HashSet', insertText: 'HashSet<>', kind: 'class', detail: 'java.util.HashSet', documentation: 'Hash table based implementation of the Set interface.', cursorOffset: 8 },
  { label: 'TreeMap', insertText: 'TreeMap<, >', kind: 'class', detail: 'java.util.TreeMap', documentation: 'Red-Black tree based NavigableMap implementation.', cursorOffset: 8 },
  { label: 'TreeSet', insertText: 'TreeSet<>', kind: 'class', detail: 'java.util.TreeSet', documentation: 'NavigableSet implementation based on a TreeMap.', cursorOffset: 8 },
  { label: 'Arrays', insertText: 'Arrays', kind: 'class', detail: 'java.util.Arrays', documentation: 'Utility methods for manipulating arrays (sorting, searching, filling).' },
  { label: 'Collections', insertText: 'Collections', kind: 'class', detail: 'java.util.Collections', documentation: 'Polymorphic algorithms that operate on or return collections.' },
  { label: 'List', insertText: 'List<>', kind: 'class', detail: 'java.util.List', documentation: 'Ordered collection (sequence).', cursorOffset: 5 },
  { label: 'Map', insertText: 'Map<, >', kind: 'class', detail: 'java.util.Map', documentation: 'Object that maps keys to values.', cursorOffset: 4 },
  { label: 'Set', insertText: 'Set<>', kind: 'class', detail: 'java.util.Set', documentation: 'Collection that contains no duplicate elements.', cursorOffset: 4 },
  { label: 'Queue', insertText: 'Queue<>', kind: 'class', detail: 'java.util.Queue', documentation: 'Collection designed for holding elements prior to processing.', cursorOffset: 6 },
  { label: 'Stack', insertText: 'Stack<>', kind: 'class', detail: 'java.util.Stack', documentation: 'Last-in-first-out (LIFO) stack of objects.', cursorOffset: 6 },
  { label: 'PriorityQueue', insertText: 'PriorityQueue<>', kind: 'class', detail: 'java.util.PriorityQueue', documentation: 'Unbounded priority queue based on a priority heap.', cursorOffset: 14 },
  { label: 'Exception', insertText: 'Exception', kind: 'class', detail: 'java.lang.Exception', documentation: 'Base class for checked exceptions.' },
  { label: 'Override', insertText: '@Override', kind: 'snippet', detail: 'annotation', documentation: 'Indicates that a method declaration is intended to override a declaration in a supertype.' },
];

const JAVA_SNIPPETS: CompletionItem[] = [
  {
    label: 'sout',
    insertText: 'System.out.println();',
    kind: 'snippet',
    detail: 'Print line to stdout',
    documentation: 'System.out.println(...);',
    cursorOffset: 19,
  },
  {
    label: 'souf',
    insertText: 'System.out.printf("", );',
    kind: 'snippet',
    detail: 'Print formatted line',
    documentation: 'System.out.printf("format", args);',
    cursorOffset: 19,
  },
  {
    label: 'psvm',
    insertText: 'public static void main(String[] args) {\n    \n}',
    kind: 'snippet',
    detail: 'Main method declaration',
    documentation: 'Standard Java entry point method.',
    cursorOffset: 45,
  },
  {
    label: 'main',
    insertText: 'public static void main(String[] args) {\n    \n}',
    kind: 'snippet',
    detail: 'Main method declaration',
    documentation: 'Standard Java entry point method.',
    cursorOffset: 45,
  },
  {
    label: 'fori',
    insertText: 'for (int i = 0; i < n; i++) {\n    \n}',
    kind: 'snippet',
    detail: 'Indexed for loop',
    documentation: 'Standard counting for loop.',
    cursorOffset: 20,
  },
  {
    label: 'fore',
    insertText: 'for (var item : list) {\n    \n}',
    kind: 'snippet',
    detail: 'Enhanced for-each loop',
    documentation: 'Iterate over elements in an Iterable or array.',
    cursorOffset: 16,
  },
  {
    label: 'trycatch',
    insertText: 'try {\n    \n} catch (Exception e) {\n    e.printStackTrace();\n}',
    kind: 'snippet',
    detail: 'Try-catch block',
    documentation: 'Exception handling block with printStackTrace.',
    cursorOffset: 10,
  },
  {
    label: 'scanner',
    insertText: 'Scanner sc = new Scanner(System.in);',
    kind: 'snippet',
    detail: 'Initialize standard input scanner',
    documentation: 'Creates Scanner instance connected to System.in.',
  },
];

const JAVA_DOT_COMPLETIONS: Record<string, CompletionItem[]> = {
  'System.': [
    { label: 'out', insertText: 'out', kind: 'property', detail: 'PrintStream', documentation: 'Standard output stream.' },
    { label: 'err', insertText: 'err', kind: 'property', detail: 'PrintStream', documentation: 'Standard error stream.' },
    { label: 'in', insertText: 'in', kind: 'property', detail: 'InputStream', documentation: 'Standard input stream.' },
    { label: 'currentTimeMillis()', insertText: 'currentTimeMillis()', kind: 'method', detail: 'long', documentation: 'Returns the current time in milliseconds since Unix epoch.' },
    { label: 'nanoTime()', insertText: 'nanoTime()', kind: 'method', detail: 'long', documentation: 'Returns the current value of the running Java Virtual Machine high-resolution time source.' },
    { label: 'exit(int status)', insertText: 'exit(0);', kind: 'method', detail: 'void', documentation: 'Terminates currently running JVM.' },
    { label: 'gc()', insertText: 'gc()', kind: 'method', detail: 'void', documentation: 'Runs the garbage collector.' },
    { label: 'arraycopy(...)', insertText: 'arraycopy(src, srcPos, dest, destPos, length);', kind: 'method', detail: 'void', documentation: 'Copies an array from the specified source array.' },
    { label: 'lineSeparator()', insertText: 'lineSeparator()', kind: 'method', detail: 'String', documentation: 'Returns the system-dependent line-separator string.' },
  ],
  'System.out.': [
    { label: 'println()', insertText: 'println();', kind: 'method', detail: 'void', documentation: 'Prints an argument and terminates the line.', cursorOffset: 8 },
    { label: 'print()', insertText: 'print();', kind: 'method', detail: 'void', documentation: 'Prints an argument.', cursorOffset: 6 },
    { label: 'printf()', insertText: 'printf("", );', kind: 'method', detail: 'PrintStream', documentation: 'A convenience method to write a formatted string.', cursorOffset: 8 },
    { label: 'format()', insertText: 'format("", );', kind: 'method', detail: 'PrintStream', documentation: 'Writes a formatted string using the specified format string and arguments.', cursorOffset: 8 },
    { label: 'flush()', insertText: 'flush();', kind: 'method', detail: 'void', documentation: 'Flushes the stream.' },
  ],
  'System.err.': [
    { label: 'println()', insertText: 'println();', kind: 'method', detail: 'void', documentation: 'Prints to stderr and terminates line.', cursorOffset: 8 },
    { label: 'print()', insertText: 'print();', kind: 'method', detail: 'void', documentation: 'Prints to stderr.', cursorOffset: 6 },
  ],
  'Math.': [
    { label: 'max(a, b)', insertText: 'max(, )', kind: 'method', detail: 'T', documentation: 'Returns the greater of two values.', cursorOffset: 4 },
    { label: 'min(a, b)', insertText: 'min(, )', kind: 'method', detail: 'T', documentation: 'Returns the smaller of two values.', cursorOffset: 4 },
    { label: 'abs(x)', insertText: 'abs()', kind: 'method', detail: 'T', documentation: 'Returns the absolute value of an argument.', cursorOffset: 4 },
    { label: 'sqrt(x)', insertText: 'sqrt()', kind: 'method', detail: 'double', documentation: 'Returns the correctly rounded positive square root.', cursorOffset: 5 },
    { label: 'pow(a, b)', insertText: 'pow(, )', kind: 'method', detail: 'double', documentation: 'Returns the value of the first argument raised to the power of the second.', cursorOffset: 4 },
    { label: 'round(x)', insertText: 'round()', kind: 'method', detail: 'long', documentation: 'Returns the closest long to the argument.', cursorOffset: 6 },
    { label: 'floor(x)', insertText: 'floor()', kind: 'method', detail: 'double', documentation: 'Returns the largest double value that is less than or equal to argument.', cursorOffset: 6 },
    { label: 'ceil(x)', insertText: 'ceil()', kind: 'method', detail: 'double', documentation: 'Returns the smallest double value that is greater than or equal to argument.', cursorOffset: 5 },
    { label: 'random()', insertText: 'random()', kind: 'method', detail: 'double', documentation: 'Returns a pseudorandom double greater than or equal to 0.0 and less than 1.0.' },
    { label: 'PI', insertText: 'PI', kind: 'property', detail: 'double', documentation: 'The double value that is closer than any other to pi.' },
    { label: 'E', insertText: 'E', kind: 'property', detail: 'double', documentation: 'The double value that is closer than any other to e.' },
  ],
  'Arrays.': [
    { label: 'sort(arr)', insertText: 'sort();', kind: 'method', detail: 'void', documentation: 'Sorts the specified array into ascending numerical order.', cursorOffset: 5 },
    { label: 'toString(arr)', insertText: 'toString()', kind: 'method', detail: 'String', documentation: 'Returns a string representation of the contents of the specified array.', cursorOffset: 9 },
    { label: 'binarySearch(arr, key)', insertText: 'binarySearch(, )', kind: 'method', detail: 'int', documentation: 'Searches the specified array using binary search.', cursorOffset: 13 },
    { label: 'equals(a, b)', insertText: 'equals(, )', kind: 'method', detail: 'boolean', documentation: 'Returns true if the two specified arrays are equal to one another.', cursorOffset: 7 },
    { label: 'fill(arr, val)', insertText: 'fill(, )', kind: 'method', detail: 'void', documentation: 'Assigns the specified value to each element of the array.', cursorOffset: 5 },
    { label: 'copyOf(arr, newLength)', insertText: 'copyOf(, )', kind: 'method', detail: 'T[]', documentation: 'Copies the specified array, truncating or padding with zeros.', cursorOffset: 7 },
    { label: 'asList(elements)', insertText: 'asList()', kind: 'method', detail: 'List<T>', documentation: 'Returns a fixed-size list backed by the specified array.', cursorOffset: 7 },
  ],
  'Collections.': [
    { label: 'sort(list)', insertText: 'sort();', kind: 'method', detail: 'void', documentation: 'Sorts the specified list into ascending order.', cursorOffset: 5 },
    { label: 'reverse(list)', insertText: 'reverse();', kind: 'method', detail: 'void', documentation: 'Reverses the order of the elements in the specified list.', cursorOffset: 8 },
    { label: 'max(coll)', insertText: 'max()', kind: 'method', detail: 'T', documentation: 'Returns the maximum element of the given collection.', cursorOffset: 4 },
    { label: 'min(coll)', insertText: 'min()', kind: 'method', detail: 'T', documentation: 'Returns the minimum element of the given collection.', cursorOffset: 4 },
    { label: 'shuffle(list)', insertText: 'shuffle();', kind: 'method', detail: 'void', documentation: 'Randomly permutes the specified list using a default source of randomness.', cursorOffset: 8 },
    { label: 'frequency(coll, o)', insertText: 'frequency(, )', kind: 'method', detail: 'int', documentation: 'Returns the number of elements in the collection equal to the specified object.', cursorOffset: 10 },
    { label: 'swap(list, i, j)', insertText: 'swap(, , );', kind: 'method', detail: 'void', documentation: 'Swaps the elements at the specified positions in the specified list.', cursorOffset: 5 },
  ],
};

// --- PYTHON COMPLETIONS ---
const PYTHON_KEYWORDS: CompletionItem[] = [
  { label: 'def', insertText: 'def ():', kind: 'keyword', detail: 'function definition', cursorOffset: 4 },
  { label: 'class', insertText: 'class :', kind: 'keyword', detail: 'class definition', cursorOffset: 6 },
  { label: 'return', insertText: 'return ', kind: 'keyword', detail: 'return statement' },
  { label: 'yield', insertText: 'yield ', kind: 'keyword', detail: 'generator yield' },
  { label: 'import', insertText: 'import ', kind: 'keyword', detail: 'import module' },
  { label: 'from', insertText: 'from ', kind: 'keyword', detail: 'from module import' },
  { label: 'if', insertText: 'if :', kind: 'keyword', detail: 'conditional statement', cursorOffset: 3 },
  { label: 'elif', insertText: 'elif :', kind: 'keyword', detail: 'else-if statement', cursorOffset: 5 },
  { label: 'else', insertText: 'else:\n    ', kind: 'keyword', detail: 'else statement' },
  { label: 'for', insertText: 'for  in :', kind: 'keyword', detail: 'for loop', cursorOffset: 4 },
  { label: 'while', insertText: 'while :', kind: 'keyword', detail: 'while loop', cursorOffset: 6 },
  { label: 'break', insertText: 'break', kind: 'keyword', detail: 'break loop' },
  { label: 'continue', insertText: 'continue', kind: 'keyword', detail: 'continue loop' },
  { label: 'try', insertText: 'try:\n    \nexcept Exception as e:\n    ', kind: 'keyword', detail: 'exception handling' },
  { label: 'except', insertText: 'except Exception as e:\n    ', kind: 'keyword', detail: 'except block' },
  { label: 'finally', insertText: 'finally:\n    ', kind: 'keyword', detail: 'finally block' },
  { label: 'raise', insertText: 'raise ', kind: 'keyword', detail: 'raise exception' },
  { label: 'with', insertText: 'with  as :', kind: 'keyword', detail: 'context manager', cursorOffset: 5 },
  { label: 'as', insertText: 'as ', kind: 'keyword', detail: 'alias/bind' },
  { label: 'lambda', insertText: 'lambda :', kind: 'keyword', detail: 'anonymous function', cursorOffset: 7 },
  { label: 'pass', insertText: 'pass', kind: 'keyword', detail: 'null operation placeholder' },
  { label: 'in', insertText: 'in ', kind: 'keyword', detail: 'membership operator' },
  { label: 'is', insertText: 'is ', kind: 'keyword', detail: 'identity operator' },
  { label: 'not', insertText: 'not ', kind: 'keyword', detail: 'logical NOT' },
  { label: 'and', insertText: 'and ', kind: 'keyword', detail: 'logical AND' },
  { label: 'or', insertText: 'or ', kind: 'keyword', detail: 'logical OR' },
  { label: 'True', insertText: 'True', kind: 'keyword', detail: 'boolean True' },
  { label: 'False', insertText: 'False', kind: 'keyword', detail: 'boolean False' },
  { label: 'None', insertText: 'None', kind: 'keyword', detail: 'None singleton' },
  { label: 'global', insertText: 'global ', kind: 'keyword', detail: 'global variable statement' },
  { label: 'nonlocal', insertText: 'nonlocal ', kind: 'keyword', detail: 'nonlocal statement' },
  { label: 'assert', insertText: 'assert ', kind: 'keyword', detail: 'assert statement' },
];

const PYTHON_BUILTINS: CompletionItem[] = [
  { label: 'print()', insertText: 'print()', kind: 'function', detail: 'print(*values, sep=" ", end="\\n")', documentation: 'Prints values to a stream, or to sys.stdout by default.', cursorOffset: 6 },
  { label: 'len()', insertText: 'len()', kind: 'function', detail: 'len(s) -> int', documentation: 'Return the number of items in a container.', cursorOffset: 4 },
  { label: 'range()', insertText: 'range()', kind: 'function', detail: 'range(stop) or range(start, stop[, step])', documentation: 'Returns an immutable sequence of numbers.', cursorOffset: 6 },
  { label: 'enumerate()', insertText: 'enumerate()', kind: 'function', detail: 'enumerate(iterable, start=0)', documentation: 'Return an enumerate object yielding (index, value) pairs.', cursorOffset: 10 },
  { label: 'zip()', insertText: 'zip()', kind: 'function', detail: 'zip(*iterables)', documentation: 'Returns an iterator of tuples, where the i-th tuple contains the i-th element from each arg.', cursorOffset: 4 },
  { label: 'sorted()', insertText: 'sorted()', kind: 'function', detail: 'sorted(iterable, key=None, reverse=False)', documentation: 'Return a new list containing all items from the iterable in ascending order.', cursorOffset: 7 },
  { label: 'min()', insertText: 'min()', kind: 'function', detail: 'min(arg1, arg2, *args)', documentation: 'Return the smallest item in an iterable or between arguments.', cursorOffset: 4 },
  { label: 'max()', insertText: 'max()', kind: 'function', detail: 'max(arg1, arg2, *args)', documentation: 'Return the largest item in an iterable or between arguments.', cursorOffset: 4 },
  { label: 'sum()', insertText: 'sum()', kind: 'function', detail: 'sum(iterable, /, start=0)', documentation: 'Return the sum of a ' + 'start' + ' value plus an iterable of numbers.', cursorOffset: 4 },
  { label: 'abs()', insertText: 'abs()', kind: 'function', detail: 'abs(x)', documentation: 'Return the absolute value of the argument.', cursorOffset: 4 },
  { label: 'round()', insertText: 'round()', kind: 'function', detail: 'round(number, ndigits=None)', documentation: 'Round a number to a given precision in decimal digits.', cursorOffset: 6 },
  { label: 'map()', insertText: 'map()', kind: 'function', detail: 'map(function, iterable)', documentation: 'Make an iterator that computes the function using arguments from each of the iterables.', cursorOffset: 4 },
  { label: 'filter()', insertText: 'filter()', kind: 'function', detail: 'filter(function, iterable)', documentation: 'Construct an iterator from elements of iterable for which function returns true.', cursorOffset: 7 },
  { label: 'all()', insertText: 'all()', kind: 'function', detail: 'all(iterable)', documentation: 'Return True if bool(x) is True for all values x in the iterable.', cursorOffset: 4 },
  { label: 'any()', insertText: 'any()', kind: 'function', detail: 'any(iterable)', documentation: 'Return True if bool(x) is True for any x in the iterable.', cursorOffset: 4 },
  { label: 'isinstance()', insertText: 'isinstance(, )', kind: 'function', detail: 'isinstance(object, classinfo)', documentation: 'Return whether an object is an instance of a class or of a subclass thereof.', cursorOffset: 11 },
  { label: 'type()', insertText: 'type()', kind: 'function', detail: 'type(object)', documentation: 'Returns the object' + "'s type.", cursorOffset: 5 },
  { label: 'open()', insertText: 'open("", "r")', kind: 'function', detail: 'open(file, mode="r")', documentation: 'Open file and return a stream.', cursorOffset: 5 },
  { label: 'input()', insertText: 'input()', kind: 'function', detail: 'input(prompt="")', documentation: 'Read a string from standard input.', cursorOffset: 6 },
  { label: 'str()', insertText: 'str()', kind: 'class', detail: 'str(object="")', documentation: 'Create a new string object from the given object.', cursorOffset: 4 },
  { label: 'int()', insertText: 'int()', kind: 'class', detail: 'int(x=0)', documentation: 'Convert a number or string to an integer.', cursorOffset: 4 },
  { label: 'float()', insertText: 'float()', kind: 'class', detail: 'float(x=0.0)', documentation: 'Convert a string or number to a floating point number.', cursorOffset: 6 },
  { label: 'bool()', insertText: 'bool()', kind: 'class', detail: 'bool(x=False)', documentation: 'Returns True when the argument x is true, False otherwise.', cursorOffset: 5 },
  { label: 'list()', insertText: 'list()', kind: 'class', detail: 'list(iterable=())', documentation: 'Built-in mutable sequence.', cursorOffset: 5 },
  { label: 'dict()', insertText: 'dict()', kind: 'class', detail: 'dict(**kwargs)', documentation: 'Built-in key-value mapping container.', cursorOffset: 5 },
  { label: 'set()', insertText: 'set()', kind: 'class', detail: 'set(iterable=())', documentation: 'Built-in unordered collection of unique elements.', cursorOffset: 4 },
  { label: 'tuple()', insertText: 'tuple()', kind: 'class', detail: 'tuple(iterable=())', documentation: 'Built-in immutable sequence.', cursorOffset: 6 },
];

const PYTHON_SNIPPETS: CompletionItem[] = [
  {
    label: 'main',
    insertText: 'if __name__ == "__main__":\n    main()',
    kind: 'snippet',
    detail: 'Standard Python main boilerplate',
    documentation: 'Runs main() when executed as script.',
    cursorOffset: 35,
  },
  {
    label: 'def',
    insertText: 'def function_name(args):\n    """Docstring"""\n    pass',
    kind: 'snippet',
    detail: 'Function definition',
    documentation: 'Template for defining a new Python function.',
    cursorOffset: 4,
  },
  {
    label: 'fori',
    insertText: 'for i in range(n):\n    pass',
    kind: 'snippet',
    detail: 'Indexed for loop with range()',
    documentation: 'Loops i from 0 up to n.',
    cursorOffset: 15,
  },
  {
    label: 'fore',
    insertText: 'for item in items:\n    pass',
    kind: 'snippet',
    detail: 'For-in collection loop',
    documentation: 'Iterates through an iterable container.',
    cursorOffset: 12,
  },
  {
    label: 'tryexp',
    insertText: 'try:\n    pass\nexcept Exception as e:\n    print(f"Error: {e}")',
    kind: 'snippet',
    detail: 'Try-except block with formatted print',
    documentation: 'Handles exceptions and logs error message.',
    cursorOffset: 9,
  },
  {
    label: 'cl',
    insertText: 'class ClassName:\n    def __init__(self):\n        pass',
    kind: 'snippet',
    detail: 'Class template with __init__',
    documentation: 'Standard OOP class definition template.',
    cursorOffset: 6,
  },
  {
    label: 'lc',
    insertText: '[x for x in items]',
    kind: 'snippet',
    detail: 'List comprehension',
    documentation: 'Quick inline list construction syntax.',
    cursorOffset: 1,
  },
];

const PYTHON_DOT_COMPLETIONS: Record<string, CompletionItem[]> = {
  'math.': [
    { label: 'sqrt(x)', insertText: 'sqrt()', kind: 'method', detail: 'float', documentation: 'Return the square root of x.', cursorOffset: 5 },
    { label: 'pow(x, y)', insertText: 'pow(, )', kind: 'method', detail: 'float', documentation: 'Return x**y (x to the power of y).', cursorOffset: 4 },
    { label: 'floor(x)', insertText: 'floor()', kind: 'method', detail: 'int', documentation: 'Return the floor of x as an Integral.', cursorOffset: 6 },
    { label: 'ceil(x)', insertText: 'ceil()', kind: 'method', detail: 'int', documentation: 'Return the ceiling of x as an Integral.', cursorOffset: 5 },
    { label: 'fabs(x)', insertText: 'fabs()', kind: 'method', detail: 'float', documentation: 'Return the absolute value of the float x.', cursorOffset: 5 },
    { label: 'factorial(x)', insertText: 'factorial()', kind: 'method', detail: 'int', documentation: 'Find x!.', cursorOffset: 10 },
    { label: 'gcd(a, b)', insertText: 'gcd(, )', kind: 'method', detail: 'int', documentation: 'Greatest Common Divisor of a and b.', cursorOffset: 4 },
    { label: 'pi', insertText: 'pi', kind: 'property', detail: 'float', documentation: 'The mathematical constant π = 3.141592...' },
    { label: 'e', insertText: 'e', kind: 'property', detail: 'float', documentation: 'The mathematical constant e = 2.718281...' },
  ],
  'random.': [
    { label: 'randint(a, b)', insertText: 'randint(, )', kind: 'method', detail: 'int', documentation: 'Return random integer in range [a, b], including both end points.', cursorOffset: 8 },
    { label: 'random()', insertText: 'random()', kind: 'method', detail: 'float', documentation: 'Return the next random floating point number in the range 0.0 <= X < 1.0.' },
    { label: 'choice(seq)', insertText: 'choice()', kind: 'method', detail: 'T', documentation: 'Choose a random element from a non-empty sequence.', cursorOffset: 7 },
    { label: 'shuffle(x)', insertText: 'shuffle()', kind: 'method', detail: 'None', documentation: 'Shuffle list x in place, and return None.', cursorOffset: 8 },
    { label: 'sample(population, k)', insertText: 'sample(, )', kind: 'method', detail: 'list', documentation: 'Chooses k unique random elements from a population sequence.', cursorOffset: 7 },
  ],
  'json.': [
    { label: 'dumps(obj)', insertText: 'dumps()', kind: 'method', detail: 'str', documentation: 'Serialize obj to a JSON formatted str.', cursorOffset: 6 },
    { label: 'loads(s)', insertText: 'loads()', kind: 'method', detail: 'Any', documentation: 'Deserialize s (a str, bytes or bytearray instance containing a JSON document) to a Python object.', cursorOffset: 6 },
  ],
};

// --- JAVASCRIPT / TYPESCRIPT COMPLETIONS ---
const JS_TS_KEYWORDS: CompletionItem[] = [
  { label: 'const', insertText: 'const ', kind: 'keyword', detail: 'constant declaration' },
  { label: 'let', insertText: 'let ', kind: 'keyword', detail: 'block-scoped variable' },
  { label: 'var', insertText: 'var ', kind: 'keyword', detail: 'function-scoped variable' },
  { label: 'function', insertText: 'function () {\n    \n}', kind: 'keyword', detail: 'function declaration', cursorOffset: 9 },
  { label: 'return', insertText: 'return ', kind: 'keyword', detail: 'return statement' },
  { label: 'if', insertText: 'if () {\n    \n}', kind: 'keyword', detail: 'conditional statement', cursorOffset: 4 },
  { label: 'else', insertText: 'else {\n    \n}', kind: 'keyword', detail: 'else statement' },
  { label: 'for', insertText: 'for (let i = 0; i < length; i++) {\n    \n}', kind: 'keyword', detail: 'for loop', cursorOffset: 20 },
  { label: 'while', insertText: 'while () {\n    \n}', kind: 'keyword', detail: 'while loop', cursorOffset: 7 },
  { label: 'switch', insertText: 'switch () {\n    case :\n        break;\n    default:\n}', kind: 'keyword', detail: 'switch statement', cursorOffset: 8 },
  { label: 'case', insertText: 'case :', kind: 'keyword', detail: 'switch case label', cursorOffset: 5 },
  { label: 'break', insertText: 'break;', kind: 'keyword', detail: 'break statement' },
  { label: 'continue', insertText: 'continue;', kind: 'keyword', detail: 'continue statement' },
  { label: 'try', insertText: 'try {\n    \n} catch (error) {\n    console.error(error);\n}', kind: 'keyword', detail: 'exception handling' },
  { label: 'catch', insertText: 'catch (error) {\n    \n}', kind: 'keyword', detail: 'catch block' },
  { label: 'finally', insertText: 'finally {\n    \n}', kind: 'keyword', detail: 'finally block' },
  { label: 'throw', insertText: 'throw new Error();', kind: 'keyword', detail: 'throw exception', cursorOffset: 16 },
  { label: 'async', insertText: 'async ', kind: 'keyword', detail: 'async function modifier' },
  { label: 'await', insertText: 'await ', kind: 'keyword', detail: 'await promise resolution' },
  { label: 'import', insertText: 'import  from "";', kind: 'keyword', detail: 'import module', cursorOffset: 7 },
  { label: 'export', insertText: 'export ', kind: 'keyword', detail: 'export declaration' },
  { label: 'class', insertText: 'class  {\n    constructor() {\n        \n    }\n}', kind: 'keyword', detail: 'class declaration', cursorOffset: 6 },
  { label: 'extends', insertText: 'extends ', kind: 'keyword', detail: 'class inheritance' },
  { label: 'new', insertText: 'new ', kind: 'keyword', detail: 'create instance' },
  { label: 'typeof', insertText: 'typeof ', kind: 'keyword', detail: 'type checking operator' },
  { label: 'instanceof', insertText: 'instanceof ', kind: 'keyword', detail: 'instance check operator' },
  { label: 'this', insertText: 'this', kind: 'keyword', detail: 'current execution context' },
  { label: 'true', insertText: 'true', kind: 'keyword', detail: 'boolean literal' },
  { label: 'false', insertText: 'false', kind: 'keyword', detail: 'boolean literal' },
  { label: 'null', insertText: 'null', kind: 'keyword', detail: 'null literal' },
  { label: 'undefined', insertText: 'undefined', kind: 'keyword', detail: 'undefined primitive' },
  { label: 'interface', insertText: 'interface  {\n    \n}', kind: 'keyword', detail: 'TypeScript interface', cursorOffset: 10 },
  { label: 'type', insertText: 'type  = ;', kind: 'keyword', detail: 'TypeScript type alias', cursorOffset: 5 },
];

const JS_TS_GLOBALS: CompletionItem[] = [
  { label: 'console', insertText: 'console', kind: 'class', detail: 'Console', documentation: 'Provides access to the browser or Node.js debugging console.' },
  { label: 'Math', insertText: 'Math', kind: 'class', detail: 'Math', documentation: 'An intrinsic object that provides basic mathematics functionality and constants.' },
  { label: 'JSON', insertText: 'JSON', kind: 'class', detail: 'JSON', documentation: 'An intrinsic object that provides functions to convert JavaScript values to and from the JSON format.' },
  { label: 'Object', insertText: 'Object', kind: 'class', detail: 'ObjectConstructor', documentation: 'Provides functionality common to all JavaScript objects.' },
  { label: 'Array', insertText: 'Array', kind: 'class', detail: 'ArrayConstructor', documentation: 'Global object used in the construction of arrays.' },
  { label: 'Promise', insertText: 'Promise', kind: 'class', detail: 'PromiseConstructor', documentation: 'Represents the eventual completion (or failure) of an asynchronous operation.' },
  { label: 'String', insertText: 'String', kind: 'class', detail: 'StringConstructor', documentation: 'Allows manipulating and representing a sequence of characters.' },
  { label: 'Number', insertText: 'Number', kind: 'class', detail: 'NumberConstructor', documentation: 'An object that represents a number of any kind.' },
  { label: 'Boolean', insertText: 'Boolean', kind: 'class', detail: 'BooleanConstructor', documentation: 'An object that represents a boolean value.' },
  { label: 'Map', insertText: 'new Map()', kind: 'class', detail: 'Map<K, V>', documentation: 'Key-value pair collection with order preservation.' },
  { label: 'Set', insertText: 'new Set()', kind: 'class', detail: 'Set<T>', documentation: 'Collection of unique values.' },
  { label: 'Date', insertText: 'new Date()', kind: 'class', detail: 'Date', documentation: 'Enables basic storage and retrieval of dates and times.' },
  { label: 'Error', insertText: 'new Error("")', kind: 'class', detail: 'Error', documentation: 'Represents an error when that occurs.' },
  { label: 'setTimeout()', insertText: 'setTimeout(() => {\n    \n}, 1000);', kind: 'function', detail: 'setTimeout(callback, ms)', documentation: 'Calls a function after a specified number of milliseconds.' },
  { label: 'setInterval()', insertText: 'setInterval(() => {\n    \n}, 1000);', kind: 'function', detail: 'setInterval(callback, ms)', documentation: 'Repeatedly calls a function with a fixed time delay between each call.' },
  { label: 'parseInt()', insertText: 'parseInt(, 10)', kind: 'function', detail: 'parseInt(string, radix)', documentation: 'Converts a string to an integer.', cursorOffset: 9 },
  { label: 'parseFloat()', insertText: 'parseFloat()', kind: 'function', detail: 'parseFloat(string)', documentation: 'Converts a string to a floating-point number.', cursorOffset: 11 },
];

const JS_TS_SNIPPETS: CompletionItem[] = [
  {
    label: 'clog',
    insertText: 'console.log();',
    kind: 'snippet',
    detail: 'console.log output',
    documentation: 'Logs output message to browser/node console.',
    cursorOffset: 12,
  },
  {
    label: 'log',
    insertText: 'console.log();',
    kind: 'snippet',
    detail: 'console.log output',
    documentation: 'Logs output message to browser/node console.',
    cursorOffset: 12,
  },
  {
    label: 'afn',
    insertText: 'const name = () => {\n    \n};',
    kind: 'snippet',
    detail: 'Arrow function expression',
    documentation: 'Creates an ES6 arrow function.',
    cursorOffset: 6,
  },
  {
    label: 'fori',
    insertText: 'for (let i = 0; i < n; i++) {\n    \n}',
    kind: 'snippet',
    detail: 'Standard for loop',
    documentation: 'Indexed loop from 0 to n.',
    cursorOffset: 20,
  },
  {
    label: 'forof',
    insertText: 'for (const item of items) {\n    \n}',
    kind: 'snippet',
    detail: 'For...of iterable loop',
    documentation: 'Iterate over values of an iterable object (Arrays, Sets).',
    cursorOffset: 17,
  },
  {
    label: 'trycatch',
    insertText: 'try {\n    \n} catch (error) {\n    console.error(error);\n}',
    kind: 'snippet',
    detail: 'Try-catch block',
    documentation: 'Catches and logs errors with console.error.',
    cursorOffset: 10,
  },
  {
    label: 'prom',
    insertText: 'new Promise((resolve, reject) => {\n    \n});',
    kind: 'snippet',
    detail: 'New Promise constructor',
    documentation: 'Creates a new Promise instance.',
    cursorOffset: 40,
  },
];

const JS_TS_DOT_COMPLETIONS: Record<string, CompletionItem[]> = {
  'console.': [
    { label: 'log(...data)', insertText: 'log();', kind: 'method', detail: 'void', documentation: 'Prints to stdout with newline.', cursorOffset: 4 },
    { label: 'error(...data)', insertText: 'error();', kind: 'method', detail: 'void', documentation: 'Prints to stderr with newline.', cursorOffset: 6 },
    { label: 'warn(...data)', insertText: 'warn();', kind: 'method', detail: 'void', documentation: 'Prints warning message.', cursorOffset: 5 },
    { label: 'info(...data)', insertText: 'info();', kind: 'method', detail: 'void', documentation: 'Prints informational message.', cursorOffset: 5 },
    { label: 'table(data)', insertText: 'table();', kind: 'method', detail: 'void', documentation: 'Displays tabular data as a table.', cursorOffset: 6 },
    { label: 'time(label)', insertText: 'time("");', kind: 'method', detail: 'void', documentation: 'Starts a timer you can use to track how long an operation takes.', cursorOffset: 6 },
    { label: 'timeEnd(label)', insertText: 'timeEnd("");', kind: 'method', detail: 'void', documentation: 'Stops a timer that was previously started by calling console.time().', cursorOffset: 9 },
    { label: 'clear()', insertText: 'clear();', kind: 'method', detail: 'void', documentation: 'Clears the console.' },
  ],
  'Math.': [
    { label: 'max(...values)', insertText: 'max(, )', kind: 'method', detail: 'number', documentation: 'Returns the largest of the given numbers.', cursorOffset: 4 },
    { label: 'min(...values)', insertText: 'min(, )', kind: 'method', detail: 'number', documentation: 'Returns the smallest of the given numbers.', cursorOffset: 4 },
    { label: 'abs(x)', insertText: 'abs()', kind: 'method', detail: 'number', documentation: 'Returns the absolute value of a number.', cursorOffset: 4 },
    { label: 'floor(x)', insertText: 'floor()', kind: 'method', detail: 'number', documentation: 'Returns the greatest integer less than or equal to its numeric argument.', cursorOffset: 6 },
    { label: 'ceil(x)', insertText: 'ceil()', kind: 'method', detail: 'number', documentation: 'Returns the smallest integer greater than or equal to its numeric argument.', cursorOffset: 5 },
    { label: 'round(x)', insertText: 'round()', kind: 'method', detail: 'number', documentation: 'Returns a supplied numeric expression rounded to the nearest integer.', cursorOffset: 6 },
    { label: 'sqrt(x)', insertText: 'sqrt()', kind: 'method', detail: 'number', documentation: 'Returns the square root of a number.', cursorOffset: 5 },
    { label: 'pow(x, y)', insertText: 'pow(, )', kind: 'method', detail: 'number', documentation: 'Returns the value of a base expression taken to a specified power.', cursorOffset: 4 },
    { label: 'random()', insertText: 'random()', kind: 'method', detail: 'number', documentation: 'Returns a pseudorandom number between 0 and 1.' },
    { label: 'PI', insertText: 'PI', kind: 'property', detail: 'number', documentation: 'Pi. This is the ratio of the circumference of a circle to its diameter.' },
    { label: 'E', insertText: 'E', kind: 'property', detail: 'number', documentation: 'Euler' + "'s constant and the base of natural logarithms, approximately 2.718." },
  ],
  'JSON.': [
    { label: 'stringify(value, replacer, space)', insertText: 'stringify()', kind: 'method', detail: 'string', documentation: 'Converts a JavaScript value to a JSON string.', cursorOffset: 10 },
    { label: 'parse(text, reviver)', insertText: 'parse()', kind: 'method', detail: 'any', documentation: 'Parses a JSON string, constructing the JavaScript value described by the string.', cursorOffset: 6 },
  ],
  'Object.': [
    { label: 'keys(obj)', insertText: 'keys()', kind: 'method', detail: 'string[]', documentation: 'Returns the names of the enumerable string properties and methods of an object.', cursorOffset: 5 },
    { label: 'values(obj)', insertText: 'values()', kind: 'method', detail: 'any[]', documentation: 'Returns an array of values of the enumerable properties of an object.', cursorOffset: 7 },
    { label: 'entries(obj)', insertText: 'entries()', kind: 'method', detail: '[string, any][]', documentation: 'Returns an array of key/values of the enumerable properties of an object.', cursorOffset: 8 },
    { label: 'assign(target, ...sources)', insertText: 'assign(, )', kind: 'method', detail: 'any', documentation: 'Copy the values of all of the enumerable own properties from one or more source objects.', cursorOffset: 7 },
    { label: 'fromEntries(iterable)', insertText: 'fromEntries()', kind: 'method', detail: 'any', documentation: 'Returns an object created by key-value entries for properties and methods.', cursorOffset: 12 },
    { label: 'hasOwn(obj, prop)', insertText: 'hasOwn(, "")', kind: 'method', detail: 'boolean', documentation: 'Determines whether an object has a property with the specified name.', cursorOffset: 7 },
  ],
  'Array.': [
    { label: 'isArray(arg)', insertText: 'isArray()', kind: 'method', detail: 'boolean', documentation: 'Returns true if an object is an array, false if it is not.', cursorOffset: 8 },
    { label: 'from(arrayLike)', insertText: 'from()', kind: 'method', detail: 'any[]', documentation: 'Creates an array from an iterable object.', cursorOffset: 5 },
    { label: 'of(...items)', insertText: 'of()', kind: 'method', detail: 'any[]', documentation: 'Returns a new array from a set of elements.', cursorOffset: 3 },
  ],
  'Promise.': [
    { label: 'all(iterable)', insertText: 'all([])', kind: 'method', detail: 'Promise<any[]>', documentation: 'Creates a Promise that is resolved with an array of results when all of the provided Promises resolve.', cursorOffset: 5 },
    { label: 'race(iterable)', insertText: 'race([])', kind: 'method', detail: 'Promise<any>', documentation: 'Creates a Promise that is resolved or rejected when any of the provided Promises are resolved or rejected.', cursorOffset: 6 },
    { label: 'resolve(value)', insertText: 'resolve()', kind: 'method', detail: 'Promise<any>', documentation: 'Creates a new resolved promise for the provided value.', cursorOffset: 8 },
    { label: 'reject(reason)', insertText: 'reject()', kind: 'method', detail: 'Promise<never>', documentation: 'Creates a new rejected promise for the provided reason.', cursorOffset: 7 },
  ],
};

// --- C# COMPLETIONS ---
const CSHARP_KEYWORDS: CompletionItem[] = [
  { label: 'using', insertText: 'using ;\n', kind: 'keyword', detail: 'using directive', cursorOffset: 6 },
  { label: 'namespace', insertText: 'namespace \n{\n    \n}', kind: 'keyword', detail: 'namespace declaration', cursorOffset: 10 },
  { label: 'class', insertText: 'class \n{\n    \n}', kind: 'keyword', detail: 'class declaration', cursorOffset: 6 },
  { label: 'public', insertText: 'public ', kind: 'keyword', detail: 'access modifier' },
  { label: 'private', insertText: 'private ', kind: 'keyword', detail: 'access modifier' },
  { label: 'protected', insertText: 'protected ', kind: 'keyword', detail: 'access modifier' },
  { label: 'static', insertText: 'static ', kind: 'keyword', detail: 'modifier' },
  { label: 'void', insertText: 'void ', kind: 'keyword', detail: 'return type' },
  { label: 'int', insertText: 'int ', kind: 'keyword', detail: 'type (32-bit int)' },
  { label: 'string', insertText: 'string ', kind: 'keyword', detail: 'type (System.String)' },
  { label: 'bool', insertText: 'bool ', kind: 'keyword', detail: 'type (boolean)' },
  { label: 'double', insertText: 'double ', kind: 'keyword', detail: 'type (64-bit float)' },
  { label: 'var', insertText: 'var ', kind: 'keyword', detail: 'implicitly typed local variable' },
  { label: 'new', insertText: 'new ', kind: 'keyword', detail: 'instantiation operator' },
  { label: 'return', insertText: 'return ', kind: 'keyword', detail: 'return statement' },
  { label: 'if', insertText: 'if ()\n{\n    \n}', kind: 'keyword', detail: 'conditional statement', cursorOffset: 4 },
  { label: 'else', insertText: 'else\n{\n    \n}', kind: 'keyword', detail: 'else statement' },
  { label: 'for', insertText: 'for (int i = 0; i < count; i++)\n{\n    \n}', kind: 'keyword', detail: 'for loop', cursorOffset: 20 },
  { label: 'foreach', insertText: 'foreach (var item in collection)\n{\n    \n}', kind: 'keyword', detail: 'foreach loop', cursorOffset: 21 },
  { label: 'while', insertText: 'while ()\n{\n    \n}', kind: 'keyword', detail: 'while loop', cursorOffset: 7 },
  { label: 'try', insertText: 'try\n{\n    \n}\ncatch (Exception ex)\n{\n    Console.WriteLine(ex.Message);\n}', kind: 'keyword', detail: 'exception handling' },
  { label: 'throw', insertText: 'throw new Exception();', kind: 'keyword', detail: 'throw exception', cursorOffset: 20 },
  { label: 'async', insertText: 'async ', kind: 'keyword', detail: 'async method modifier' },
  { label: 'await', insertText: 'await ', kind: 'keyword', detail: 'await task' },
];

const CSHARP_GLOBALS: CompletionItem[] = [
  { label: 'Console', insertText: 'Console', kind: 'class', detail: 'System.Console', documentation: 'Represents the standard input, output, and error streams for console applications.' },
  { label: 'Math', insertText: 'Math', kind: 'class', detail: 'System.Math', documentation: 'Provides constants and static methods for trigonometric, logarithmic, and other common mathematical functions.' },
  { label: 'Convert', insertText: 'Convert', kind: 'class', detail: 'System.Convert', documentation: 'Converts a base data type to another base data type.' },
  { label: 'List', insertText: 'List<>', kind: 'class', detail: 'System.Collections.Generic.List<T>', documentation: 'Represents a strongly typed list of objects that can be accessed by index.', cursorOffset: 5 },
  { label: 'Dictionary', insertText: 'Dictionary<, >', kind: 'class', detail: 'System.Collections.Generic.Dictionary<TKey, TValue>', documentation: 'Represents a collection of keys and values.', cursorOffset: 11 },
  { label: 'Task', insertText: 'Task', kind: 'class', detail: 'System.Threading.Tasks.Task', documentation: 'Represents an asynchronous operation.' },
];

const CSHARP_SNIPPETS: CompletionItem[] = [
  {
    label: 'cw',
    insertText: 'Console.WriteLine();',
    kind: 'snippet',
    detail: 'Console.WriteLine output',
    documentation: 'Writes the current line terminator to the standard output stream.',
    cursorOffset: 18,
  },
  {
    label: 'cr',
    insertText: 'Console.ReadLine();',
    kind: 'snippet',
    detail: 'Console.ReadLine input',
    documentation: 'Reads the next line of characters from the standard input stream.',
  },
  {
    label: 'main',
    insertText: 'static void Main(string[] args)\n{\n    \n}',
    kind: 'snippet',
    detail: 'Program entry point',
    documentation: 'The Main method is the entry point of a C# application.',
    cursorOffset: 38,
  },
  {
    label: 'fori',
    insertText: 'for (int i = 0; i < count; i++)\n{\n    \n}',
    kind: 'snippet',
    detail: 'For loop',
    documentation: 'Standard indexed for loop.',
    cursorOffset: 20,
  },
  {
    label: 'foreach',
    insertText: 'foreach (var item in collection)\n{\n    \n}',
    kind: 'snippet',
    detail: 'Foreach loop',
    documentation: 'Iterates through each element in a collection.',
    cursorOffset: 21,
  },
];

const CSHARP_DOT_COMPLETIONS: Record<string, CompletionItem[]> = {
  'Console.': [
    { label: 'WriteLine()', insertText: 'WriteLine();', kind: 'method', detail: 'void', documentation: 'Writes the specified data, followed by the current line terminator, to the standard output stream.', cursorOffset: 10 },
    { label: 'Write()', insertText: 'Write();', kind: 'method', detail: 'void', documentation: 'Writes the text representation of the specified value to the standard output stream.', cursorOffset: 6 },
    { label: 'ReadLine()', insertText: 'ReadLine()', kind: 'method', detail: 'string?', documentation: 'Reads the next line of characters from the standard input stream.' },
    { label: 'Clear()', insertText: 'Clear();', kind: 'method', detail: 'void', documentation: 'Clears the console buffer and corresponding console window of display information.' },
  ],
  'Math.': [
    { label: 'Max(val1, val2)', insertText: 'Max(, )', kind: 'method', detail: 'T', documentation: 'Returns the larger of two numbers.', cursorOffset: 4 },
    { label: 'Min(val1, val2)', insertText: 'Min(, )', kind: 'method', detail: 'T', documentation: 'Returns the smaller of two numbers.', cursorOffset: 4 },
    { label: 'Abs(value)', insertText: 'Abs()', kind: 'method', detail: 'T', documentation: 'Returns the absolute value of a specified number.', cursorOffset: 4 },
    { label: 'Sqrt(d)', insertText: 'Sqrt()', kind: 'method', detail: 'double', documentation: 'Returns the square root of a specified number.', cursorOffset: 5 },
    { label: 'Pow(x, y)', insertText: 'Pow(, )', kind: 'method', detail: 'double', documentation: 'Returns a specified number raised to the specified power.', cursorOffset: 4 },
    { label: 'Round(a)', insertText: 'Round()', kind: 'method', detail: 'double', documentation: 'Rounds a value to the nearest integer.', cursorOffset: 6 },
    { label: 'Floor(d)', insertText: 'Floor()', kind: 'method', detail: 'double', documentation: 'Returns the largest integral value less than or equal to the specified number.', cursorOffset: 6 },
    { label: 'Ceiling(a)', insertText: 'Ceiling()', kind: 'method', detail: 'double', documentation: 'Returns the smallest integral value greater than or equal to the specified number.', cursorOffset: 8 },
    { label: 'PI', insertText: 'PI', kind: 'property', detail: 'double', documentation: 'Represents the ratio of the circumference of a circle to its diameter.' },
    { label: 'E', insertText: 'E', kind: 'property', detail: 'double', documentation: 'Represents the natural logarithmic base.' },
  ],
};

// -------------------------------------------------------------
// 2. DOCUMENT SYMBOL EXTRACTOR (REAL-TIME IDENTIFIERS)
// -------------------------------------------------------------

/**
 * Parses user code in real-time to extract declared variables, methods, and classes
 * so user-defined names are immediately offered in IntelliSense!
 */
export function extractDocumentSymbols(code: string, lang: SupportedLang): CompletionItem[] {
  if (!code) return [];

  const symbols: Map<string, CompletionItem> = new Map();

  // 1. Universal identifier words (min length 3, starting with letter, excluding common noise)
  const lines = code.split('\n');

  // Language specific extraction
  if (lang === 'java' || lang === 'csharp') {
    // Variables: (type) (name) = or ;
    const varRegex = /(?:int|double|float|long|boolean|char|String|var|auto|[A-Z][a-zA-Z0-9_<>]+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|;|,|\))/g;
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && name.length > 1 && !symbols.has(name)) {
        symbols.set(name, {
          label: name,
          insertText: name,
          kind: 'variable',
          detail: 'Local variable / field',
          documentation: `User-defined identifier in current ${lang.toUpperCase()} source.`,
        });
      }
    }

    // Methods: (returnType) (methodName)(...) {
    const methodRegex = /(?:public|private|protected|static|void|int|double|String|[A-Z][a-zA-Z0-9_]*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g;
    while ((match = methodRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && name !== 'main' && !symbols.has(name)) {
        symbols.set(name, {
          label: `${name}()`,
          insertText: `${name}()`,
          kind: 'method',
          detail: 'User method',
          documentation: `Method declared in current ${lang.toUpperCase()} source.`,
          cursorOffset: name.length + 1,
        });
      }
    }

    // Classes: class (ClassName)
    const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    while ((match = classRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && !symbols.has(name)) {
        symbols.set(name, {
          label: name,
          insertText: name,
          kind: 'class',
          detail: 'User class',
          documentation: `Class declared in current source.`,
        });
      }
    }
  } else if (lang === 'python') {
    // Python def function_name(...)
    const defRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = defRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && !symbols.has(name)) {
        symbols.set(name, {
          label: `${name}()`,
          insertText: `${name}()`,
          kind: 'function',
          detail: 'def ' + name,
          documentation: `User function defined in Python source.`,
          cursorOffset: name.length + 1,
        });
      }
    }

    // Python class ClassName
    const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    while ((match = classRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && !symbols.has(name)) {
        symbols.set(name, {
          label: name,
          insertText: name,
          kind: 'class',
          detail: 'class ' + name,
          documentation: `User class defined in Python source.`,
        });
      }
    }

    // Python assignments: var = ...
    for (const line of lines) {
      const assignMatch = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
      if (assignMatch) {
        const name = assignMatch[1];
        if (name && !symbols.has(name) && !['if', 'elif', 'for', 'while'].includes(name)) {
          symbols.set(name, {
            label: name,
            insertText: name,
            kind: 'variable',
            detail: 'Variable',
            documentation: `Variable assigned in Python source.`,
          });
        }
      }
    }
  } else if (lang === 'javascript' || lang === 'typescript') {
    // const / let / var name =
    const varRegex = /(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && !symbols.has(name)) {
        symbols.set(name, {
          label: name,
          insertText: name,
          kind: 'variable',
          detail: 'Variable',
          documentation: `Variable declared in JS/TS source.`,
        });
      }
    }

    // function name(...)
    const fnRegex = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    while ((match = fnRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && !symbols.has(name)) {
        symbols.set(name, {
          label: `${name}()`,
          insertText: `${name}()`,
          kind: 'function',
          detail: 'Function',
          documentation: `Function declared in JS/TS source.`,
          cursorOffset: name.length + 1,
        });
      }
    }

    // class Name
    const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    while ((match = classRegex.exec(code)) !== null) {
      const name = match[1];
      if (name && !symbols.has(name)) {
        symbols.set(name, {
          label: name,
          insertText: name,
          kind: 'class',
          detail: 'Class',
          documentation: `Class declared in JS/TS source.`,
        });
      }
    }
  }

  return Array.from(symbols.values());
}

// -------------------------------------------------------------
// 3. INTELLISENSE COMPLETIONS RESOLVER
// -------------------------------------------------------------

export interface IntelliSenseContext {
  code: string;
  cursorPos: number;
  lang: SupportedLang;
}

export interface IntelliSenseResult {
  suggestions: CompletionItem[];
  replaceRange: { start: number; end: number };
  matchedPrefix: string;
  triggerContext: 'dot' | 'word' | 'manual';
}

/**
 * Primary IntelliSense engine that computes suggestions given the current cursor position
 */
export function getCompletions(context: IntelliSenseContext): IntelliSenseResult | null {
  const { code, cursorPos, lang } = context;
  if (cursorPos < 0 || cursorPos > code.length) return null;

  const textBefore = code.substring(0, cursorPos);

  // Check for dot completion: e.g. "System.out." or "Math." or "console."
  const dotMatch = textBefore.match(/([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\.([a-zA-Z0-9_]*)$/);

  if (dotMatch) {
    const parentObject = dotMatch[1] + '.';
    const memberPrefix = dotMatch[2].toLowerCase();
    const replaceRange = {
      start: cursorPos - dotMatch[2].length,
      end: cursorPos,
    };

    let dotCompletions: CompletionItem[] = [];
    if (lang === 'java') {
      dotCompletions = JAVA_DOT_COMPLETIONS[parentObject] || [];
    } else if (lang === 'python') {
      dotCompletions = PYTHON_DOT_COMPLETIONS[parentObject] || [];
    } else if (lang === 'javascript' || lang === 'typescript') {
      dotCompletions = JS_TS_DOT_COMPLETIONS[parentObject] || [];
    } else if (lang === 'csharp') {
      dotCompletions = CSHARP_DOT_COMPLETIONS[parentObject] || [];
    }

    if (dotCompletions.length > 0) {
      const filtered = dotCompletions.filter((item) =>
        item.label.toLowerCase().startsWith(memberPrefix) ||
        item.insertText.toLowerCase().startsWith(memberPrefix)
      );
      if (filtered.length > 0) {
        return {
          suggestions: filtered,
          replaceRange,
          matchedPrefix: memberPrefix,
          triggerContext: 'dot',
        };
      }
    }
  }

  // Check for general word typing at cursor: e.g. "sys", "pri", "for"
  const wordMatch = textBefore.match(/([a-zA-Z0-9_]+)$/);
  const currentWord = wordMatch ? wordMatch[1] : '';

  // Only auto-trigger when word has at least 1 character or if called on non-empty word
  if (!currentWord && !dotMatch) {
    return null;
  }

  const lowerWord = currentWord.toLowerCase();
  const replaceRange = {
    start: cursorPos - currentWord.length,
    end: cursorPos,
  };

  // Assemble base pool for language
  let basePool: CompletionItem[] = [];
  if (lang === 'java') {
    basePool = [...JAVA_SNIPPETS, ...JAVA_CLASSES, ...JAVA_KEYWORDS];
  } else if (lang === 'python') {
    basePool = [...PYTHON_SNIPPETS, ...PYTHON_BUILTINS, ...PYTHON_KEYWORDS];
  } else if (lang === 'javascript' || lang === 'typescript') {
    basePool = [...JS_TS_SNIPPETS, ...JS_TS_GLOBALS, ...JS_TS_KEYWORDS];
  } else if (lang === 'csharp') {
    basePool = [...CSHARP_SNIPPETS, ...CSHARP_GLOBALS, ...CSHARP_KEYWORDS];
  }

  // Add dynamically extracted user symbols
  const userSymbols = extractDocumentSymbols(code, lang);
  const allCandidates = [...userSymbols, ...basePool];

  // Filter and score candidates
  const scored = allCandidates
    .map((item) => {
      const labelLower = item.label.toLowerCase();
      const insertLower = item.insertText.toLowerCase();

      let score = -1;
      if (labelLower === lowerWord || insertLower === lowerWord) {
        score = 100; // exact match
      } else if (labelLower.startsWith(lowerWord) || insertLower.startsWith(lowerWord)) {
        score = 80 - Math.min(labelLower.length, 30); // prefix match, shorter is better
      } else if (labelLower.includes(lowerWord) || insertLower.includes(lowerWord)) {
        score = 40; // substring match
      }

      // Boost snippets for exact shorthand matches (e.g. sout, psvm, cw, clog)
      if (item.kind === 'snippet' && item.label.startsWith(lowerWord)) {
        score += 25;
      }

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  // Deduplicate by label
  const seen = new Set<string>();
  const uniqueItems: CompletionItem[] = [];
  for (const { item } of scored) {
    if (!seen.has(item.label)) {
      seen.add(item.label);
      uniqueItems.push(item);
    }
  }

  if (uniqueItems.length === 0) return null;

  return {
    suggestions: uniqueItems.slice(0, 16), // Top 16 most relevant suggestions
    replaceRange,
    matchedPrefix: currentWord,
    triggerContext: 'word',
  };
}

// -------------------------------------------------------------
// 4. CARET COORDINATES CALCULATOR (PIXEL ACCURACY)
// -------------------------------------------------------------

/**
 * Calculates exact (top, left, height) pixel coordinates of the caret within a textarea
 * so the IntelliSense dropdown floats right below the cursor like in VS Code!
 */
export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number; height: number } {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { top: 0, left: 0, height: 20 };
  }

  const mirrorDivId = '__textarea_caret_mirror_div__';
  let div = document.getElementById(mirrorDivId) as HTMLDivElement | null;

  if (!div) {
    div = document.createElement('div');
    div.id = mirrorDivId;
    document.body.appendChild(div);
  }

  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.top = '0px';
  style.left = '-9999px';
  style.overflow = 'hidden';

  // Copy sizing and typography properties
  const properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
  ];

  for (const prop of properties) {
    (style as any)[prop] = (computed as any)[prop];
  }

  // Populate mirror text
  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth || '0', 10),
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || '0', 10),
    height: parseInt(computed.lineHeight || '20', 10) || 20,
  };

  return coordinates;
}

// -------------------------------------------------------------
// 5. AUTO-CLOSING PAIRS & INDENTATION HELPER
// -------------------------------------------------------------

export interface KeyPairResult {
  handled: boolean;
  newCode?: string;
  newCursorPos?: number;
}

/**
 * Handles auto-closing brackets, quotes, skip-over, and auto-indentation on Enter
 */
export function handleSmartEditorKeys(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  code: string,
  autoCloseBrackets: boolean = true
): KeyPairResult {
  const textarea = e.currentTarget;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // Auto-Closing Pairs
  if (autoCloseBrackets && start === end) {
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    // User types open bracket or quote
    if (pairs[e.key]) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = pairs[openChar];

      const newCode = code.substring(0, start) + openChar + closeChar + code.substring(end);
      return {
        handled: true,
        newCode,
        newCursorPos: start + 1,
      };
    }

    // Skip-over: if user types close character and next char matches, just step over it
    const closingChars = [')', ']', '}', '"', "'", '`'];
    if (closingChars.includes(e.key) && code[start] === e.key) {
      e.preventDefault();
      return {
        handled: true,
        newCursorPos: start + 1,
      };
    }

    // Backspace: if deleting between pair like (|), delete both characters
    if (e.key === 'Backspace' && start > 0) {
      const prevChar = code[start - 1];
      const nextChar = code[start];
      if (pairs[prevChar] && pairs[prevChar] === nextChar) {
        e.preventDefault();
        const newCode = code.substring(0, start - 1) + code.substring(start + 1);
        return {
          handled: true,
          newCode,
          newCursorPos: start - 1,
        };
      }
    }
  }

  // Auto-indent on Enter
  if (e.key === 'Enter') {
    const lineStart = code.lastIndexOf('\n', start - 1) + 1;
    const currentLine = code.substring(lineStart, start);
    const indentMatch = currentLine.match(/^\s*/);
    const currentIndent = indentMatch ? indentMatch[0] : '';

    const charBefore = code[start - 1];
    const charAfter = code[start];

    // If between { and }, expand with newline and 4 spaces indentation
    if (charBefore === '{' && charAfter === '}') {
      e.preventDefault();
      const extraIndent = '    ';
      const insert = `\n${currentIndent}${extraIndent}\n${currentIndent}`;
      const newCode = code.substring(0, start) + insert + code.substring(end);
      return {
        handled: true,
        newCode,
        newCursorPos: start + 1 + currentIndent.length + extraIndent.length,
      };
    }

    // If after { or : (Python / C style block start), increase indent by 4 spaces
    if (charBefore === '{' || charBefore === ':') {
      e.preventDefault();
      const insert = `\n${currentIndent}    `;
      const newCode = code.substring(0, start) + insert + code.substring(end);
      return {
        handled: true,
        newCode,
        newCursorPos: start + insert.length,
      };
    }

    // Normal Enter: preserve current indentation
    if (currentIndent.length > 0) {
      e.preventDefault();
      const insert = `\n${currentIndent}`;
      const newCode = code.substring(0, start) + insert + code.substring(end);
      return {
        handled: true,
        newCode,
        newCursorPos: start + insert.length,
      };
    }
  }

  return { handled: false };
}
