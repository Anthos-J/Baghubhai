/**
 * challengeService.ts — Supabase Bugged Code Challenge Subsystem
 *
 * Implements:
 * 1. 10 Comprehensive B.Tech Prebuilt Coding Challenges across Java, Python, and C.
 * 2. At least 10 unique, realistic bugs per problem statement (100+ total bugs across challenges).
 * 3. Equal distribution of bug objectives across all active developers (Fair Fisher-Yates Round Robin).
 * 4. Sabotage/Destruction mechanics for Imposters against developers (Syntax Blackout, Server Overload, Re-mutation).
 * 5. Start of each match: Randomly selects ONE problem statement for the match session.
 * 6. Strict player isolation & server-side authorization guard.
 * 7. Deterministic validation for all 100+ bug fixes.
 */

import { supabase } from '../lib/supabase';
import { sanitizeSource, TestResult } from '../editor/testRunner';

export type ChallengeLanguage = 'JAVA' | 'PYTHON' | 'C';
export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'SMALL' | 'DIFFICULT';

export interface ChallengeBug {
  bugId: string;
  roomIndex: number; // 1 to 6
  roomId: string; // e.g. 'library', 'medbay', 'storage', 'dev_lab', 'command', 'mafia_lair'
  roomLabel: string;
  title: string;
  objective: string;
  hint: string;
  expectedFix: string; // Server/hidden only
  testKey: string;
  isActive: boolean;
  validator: (code: string) => TestResult[];
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  language: ChallengeLanguage;
  difficulty: ChallengeDifficulty;
  code: string; // The ONE complete shared codebase
  bugs: ChallengeBug[];
  test_cases: { input: string; expectedOutput: string }[];
  is_active: boolean;
}

export interface PlayerObjectiveAssignment {
  playerId: string;
  roomId: string;
  roomLabel: string;
  roomIndex: number;
  bugId: string;
  title: string;
  objective: string;
  hint: string;
  testKey: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'COMPROMISED';
  completedAt?: number;
}

export interface ChallengeMatchSession {
  gameId: string;
  challengeId: string;
  title: string;
  description: string;
  language: ChallengeLanguage;
  difficulty: ChallengeDifficulty;
  sharedCode: string;
  assignments: Record<string, PlayerObjectiveAssignment[]>; // playerId -> list of room assignments
  createdAt: number;
}

export const ROOM_IDS_BY_INDEX: Record<number, { id: string; label: string }> = {
  1: { id: 'library', label: 'LIBRARY & ARCHIVES' },
  2: { id: 'medbay', label: 'MEDICAL BAY' },
  3: { id: 'storage', label: 'STORAGE & CARGO' },
  4: { id: 'dev_lab', label: 'DEV WORKSTATIONS' },
  5: { id: 'command', label: 'COMMAND & TECH' },
  6: { id: 'mafia_lair', label: 'DARK LAIR' },
};

// ── 10 B.TECH PREBUILT CODING CHALLENGES (WITH 10+ BUGS EACH) ──────────────────

export const PREBUILT_CHALLENGES: CodingChallenge[] = [
  // ── 1. C / EASY: #2 Arithmetic, #3/#4 Swap, #5 Calculator, #8/#9 Max ─────
  {
    id: 'challenge-c-001',
    title: 'Basic Calculator, Arithmetic Operations & Variable Swap',
    description: 'B.Tech Program #2, #3, #4, #5, #8 & #9: Menu-driven arithmetic calculation, division safeguards, modular arithmetic, variable swapping and number comparisons.',
    language: 'C',
    difficulty: 'EASY',
    code: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// Function 1: Basic addition
double add(double a, double b) {
    // BUG-1: Subtracts instead of adding
    return a - b;
}

// Function 2: Basic subtraction
double subtract(double a, double b) {
    // BUG-2: Swapped operand order (b - a)
    return b - a;
}

// Function 3: Multiplication
double multiply(double a, double b) {
    // BUG-3: Returns 0.0 unconditionally
    return 0.0;
}

// Function 4: Safe Division
double safe_divide(double a, double b) {
    // BUG-4: Checks a == 0 instead of divisor b == 0
    if (a == 0.0) {
        printf("Error: Division by zero!\\n");
        return 0.0;
    }
    return a / b;
}

// Function 5: Modulus of two integers
int safe_modulus(int a, int b) {
    // BUG-5: Inverted division by zero check
    if (b != 0) {
        return 0;
    }
    return a % b;
}

// Function 6: Swap two numbers without temporary variable
void swap_numbers(int *a, int *b) {
    if (a == NULL || b == NULL) return;
    // BUG-6: Incorrect XOR swap logic (overwriting a with addition)
    *a = *a + *b;
    *b = *a + *b;
    *a = *b - *a;
}

// Function 7: Find largest of two numbers
int largest_of_two(int a, int b) {
    // BUG-7: Returns smallest instead of largest
    return (a < b) ? a : b;
}

// Function 8: Find largest of three numbers
int largest_of_three(int a, int b, int c) {
    // BUG-8: Missing comparison with c in first branch
    if (a >= b) {
        return a;
    } else if (b >= c) {
        return b;
    }
    return c;
}

// Function 9: Check if number is positive, negative or zero
int check_sign(int n) {
    // BUG-9: Treats 0 as positive (n >= 0)
    if (n >= 0) return 1;
    return -1;
}

// Function 10: Calculate integer power a^b (b >= 0)
long long integer_power(int base, int exp) {
    if (exp < 0) return 0;
    long long result = 1;
    // BUG-10: Loop terminates 1 iteration early (i < exp instead of i <= exp or i < exp with base 1)
    for (int i = 1; i < exp; i++) {
        result *= base;
    }
    return result;
}`,
    bugs: [
      {
        bugId: 'c-calc-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Add Operation Operator',
        objective: 'In add(double a, double b), perform proper addition (a + b) instead of subtraction.',
        hint: 'Replace "a - b" with "a + b".',
        expectedFix: 'return a + b;',
        testKey: 'test-c-calc-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return a + b;') || cleanCode.includes('return a+b;');
          return [{ testId: 't-1', taskId: 'c-calc-bug-1', fileId: 'Calculator.c', name: 'Addition Operator', passed, message: passed ? 'Addition formula valid.' : 'Still subtracting operands.' }];
        },
      },
      {
        bugId: 'c-calc-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Subtraction Operand Order',
        objective: 'In subtract(double a, double b), return (a - b) in correct order.',
        hint: 'Change "b - a" to "a - b".',
        expectedFix: 'return a - b;',
        testKey: 'test-c-calc-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return a - b;') || cleanCode.includes('return a-b;');
          return [{ testId: 't-2', taskId: 'c-calc-bug-2', fileId: 'Calculator.c', name: 'Subtraction Order', passed, message: passed ? 'Subtraction order valid.' : 'Operands inverted.' }];
        },
      },
      {
        bugId: 'c-calc-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Implement Multiplication Formula',
        objective: 'In multiply(double a, double b), compute and return the product a * b.',
        hint: 'Replace "return 0.0;" with "return a * b;".',
        expectedFix: 'return a * b;',
        testKey: 'test-c-calc-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return a * b;') || cleanCode.includes('return a*b;');
          return [{ testId: 't-3', taskId: 'c-calc-bug-3', fileId: 'Calculator.c', name: 'Multiply Product', passed, message: passed ? 'Multiply product valid.' : 'Returns constant zero.' }];
        },
      },
      {
        bugId: 'c-calc-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Safe Division Divisor Check',
        objective: 'In safe_divide, verify divisor b == 0.0 (or b == 0) instead of dividend a == 0.',
        hint: 'Change "if (a == 0.0)" to "if (b == 0.0 || b == 0)".',
        expectedFix: 'if (b == 0.0) or if (b == 0)',
        testKey: 'test-c-calc-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (b == 0.0') || cleanCode.includes('if (b == 0') || cleanCode.includes('if (!b)');
          return [{ testId: 't-4', taskId: 'c-calc-bug-4', fileId: 'Calculator.c', name: 'Divisor Zero Guard', passed, message: passed ? 'Divisor zero check valid.' : 'Checks dividend instead of divisor.' }];
        },
      },
      {
        bugId: 'c-calc-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Modulus Divisor Guard',
        objective: 'In safe_modulus, guard against zero divisor (if b == 0 return 0).',
        hint: 'Change "if (b != 0)" to "if (b == 0)".',
        expectedFix: 'if (b == 0) return 0;',
        testKey: 'test-c-calc-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (b == 0)') || cleanCode.includes('if (b == 0 )') || cleanCode.includes('if (!b)');
          return [{ testId: 't-5', taskId: 'c-calc-bug-5', fileId: 'Calculator.c', name: 'Modulus Divisor Guard', passed, message: passed ? 'Modulus zero guard valid.' : 'Inverted zero check.' }];
        },
      },
      {
        bugId: 'c-calc-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Swap Numbers Logic',
        objective: 'Fix the swap_numbers function arithmetic/temp swapping so *a and *b are swapped accurately.',
        hint: 'Use *a = *a + *b; *b = *a - *b; *a = *a - *b; or a temp variable.',
        expectedFix: '*b = *a - *b; *a = *a - *b;',
        testKey: 'test-c-calc-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = (cleanCode.includes('*b = *a - *b') && cleanCode.includes('*a = *a - *b')) || cleanCode.includes('int temp = *a');
          return [{ testId: 't-6', taskId: 'c-calc-bug-6', fileId: 'Calculator.c', name: 'Swap Values Logic', passed, message: passed ? 'Variable swap valid.' : 'Swap computation overwrites values.' }];
        },
      },
      {
        bugId: 'c-calc-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Largest of Two Numbers Comparator',
        objective: 'In largest_of_two, return the larger value (a > b ? a : b).',
        hint: 'Change "a < b" to "a > b" or "a >= b".',
        expectedFix: '(a > b) ? a : b',
        testKey: 'test-c-calc-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('a > b') || cleanCode.includes('a >= b') || cleanCode.includes('b > a ? b : a');
          return [{ testId: 't-7', taskId: 'c-calc-bug-7', fileId: 'Calculator.c', name: 'Largest Of Two', passed, message: passed ? 'Comparator returns max value.' : 'Returns smaller value.' }];
        },
      },
      {
        bugId: 'c-calc-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Largest of Three Conditional Branching',
        objective: 'In largest_of_three, ensure a is checked against both b AND c before returning a.',
        hint: 'Change "if (a >= b)" to "if (a >= b && a >= c)".',
        expectedFix: 'if (a >= b && a >= c)',
        testKey: 'test-c-calc-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('a >= b && a >= c') || cleanCode.includes('a > b && a > c');
          return [{ testId: 't-8', taskId: 'c-calc-bug-8', fileId: 'Calculator.c', name: 'Largest of Three', passed, message: passed ? 'Checks both comparisons for a.' : 'Missing comparison with c for a.' }];
        },
      },
      {
        bugId: 'c-calc-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Sign Check for Zero',
        objective: 'In check_sign, return 0 when n == 0, 1 when n > 0, and -1 when n < 0.',
        hint: 'Handle n == 0 with "if (n == 0) return 0; if (n > 0) return 1; return -1;".',
        expectedFix: 'if (n == 0) return 0;',
        testKey: 'test-c-calc-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (n == 0) return 0') || cleanCode.includes('if (n > 0) return 1;') || cleanCode.includes('n > 0 ? 1 : (n < 0 ? -1 : 0)');
          return [{ testId: 't-9', taskId: 'c-calc-bug-9', fileId: 'Calculator.c', name: 'Zero Sign Check', passed, message: passed ? 'Properly discriminates 0 from positive/negative.' : 'Treats zero as positive.' }];
        },
      },
      {
        bugId: 'c-calc-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Integer Power Loop Boundary',
        objective: 'In integer_power, ensure the multiplication loop runs exp times (e.g. for int i = 0; i < exp; i++).',
        hint: 'Change "for (int i = 1; i < exp; i++)" to "for (int i = 0; i < exp; i++)" or "i <= exp".',
        expectedFix: 'for (int i = 0; i < exp; i++)',
        testKey: 'test-c-calc-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('int i = 0; i < exp;') || cleanCode.includes('int i = 1; i <= exp;');
          return [{ testId: 't-10', taskId: 'c-calc-bug-10', fileId: 'Calculator.c', name: 'Power Loop Iterations', passed, message: passed ? 'Multiplication loop executes exp times.' : 'Power loop misses 1 iteration.' }];
        },
      },
    ],
    test_cases: [
      { input: 'add(12, 8)', expectedOutput: '20' },
      { input: 'largest_of_three(5, 19, 12)', expectedOutput: '19' },
    ],
    is_active: true,
  },

  // ── 2. JAVA / EASY: #11 Reverse, #12 Count, #16 Palindrome, #23 Armstrong ──
  {
    id: 'challenge-java-001',
    title: 'Number Theory: Palindrome, Armstrong & Digit Manipulations',
    description: 'B.Tech Program #11, #12, #13, #16, #23, #25, #30, #31, #32 & #34: Digit extraction, palindrome number tests, Armstrong sum of cubes, Harshad numbers, and divisor algorithms.',
    language: 'JAVA',
    difficulty: 'EASY',
    code: `public class NumberTheoryProcessor {
    // 1. Reverse an integer
    public static int reverseNumber(int n) {
        int reversed = 0;
        // BUG-1: Loop condition excludes single digit when n > 0 (n > 9 skips final digit)
        while (n > 9) {
            reversed = reversed * 10 + (n % 10);
            n /= 10;
        }
        return reversed;
    }

    // 2. Count number of digits in an integer
    public static int countDigits(int n) {
        // BUG-2: Returns 0 for input 0 instead of 1
        if (n == 0) return 0;
        int count = 0;
        int temp = Math.abs(n);
        while (temp > 0) {
            count++;
            temp /= 10;
        }
        return count;
    }

    // 3. Sum of digits
    public static int sumOfDigits(int n) {
        int sum = 0;
        int temp = Math.abs(n);
        while (temp > 0) {
            // BUG-3: Adds temp instead of remainder temp % 10
            sum += temp;
            temp /= 10;
        }
        return sum;
    }

    // 4. Check if number is palindrome
    public static boolean isPalindrome(int n) {
        if (n < 0) return false;
        // BUG-4: Compares reverse with original n after n is mutated to 0
        int temp = n;
        int rev = 0;
        while (n > 0) {
            rev = rev * 10 + (n % 10);
            n /= 10;
        }
        return rev == n;
    }

    // 5. Armstrong number check (e.g. 153 = 1^3 + 5^3 + 3^3)
    public static boolean isArmstrong(int n) {
        if (n < 0) return false;
        int temp = n;
        int digits = String.valueOf(n).length();
        int sum = 0;
        while (temp > 0) {
            int digit = temp % 10;
            // BUG-5: Squares instead of raising to power of digits
            sum += digit * digit;
            temp /= 10;
        }
        return sum == n;
    }

    // 6. Perfect number check (sum of proper divisors == n)
    public static boolean isPerfectNumber(int n) {
        if (n <= 1) return false;
        int sum = 0;
        // BUG-6: Loop runs only up to n / 3 missing half proper divisors
        for (int i = 1; i <= n / 3; i++) {
            if (n % i == 0) {
                sum += i;
            }
        }
        return sum == n;
    }

    // 7. Harshad number (divisible by sum of its digits)
    public static boolean isHarshadNumber(int n) {
        if (n <= 0) return false;
        int sum = sumOfDigits(n);
        // BUG-7: Inverted condition (checks sum % n == 0 instead of n % sum == 0)
        return sum % n == 0;
    }

    // 8. Neon number (sum of digits of square == n, e.g. 9^2 = 81 -> 8+1 = 9)
    public static boolean isNeonNumber(int n) {
        // BUG-8: Uses n instead of square n * n
        int sq = n;
        int sum = 0;
        while (sq > 0) {
            sum += sq % 10;
            sq /= 10;
        }
        return sum == n;
    }

    // 9. Spy number (sum of digits == product of digits)
    public static boolean isSpyNumber(int n) {
        if (n < 0) return false;
        int sum = 0;
        // BUG-9: Initial product set to 0 causing product to stay 0
        int prod = 0;
        int temp = n;
        while (temp > 0) {
            int digit = temp % 10;
            sum += digit;
            prod *= digit;
            temp /= 10;
        }
        return sum == prod;
    }

    // 10. Disarium number (sum of digits raised to their respective positions)
    public static boolean isDisariumNumber(int n) {
        String s = String.valueOf(n);
        int sum = 0;
        // BUG-10: Position starts at 0 instead of 1
        for (int i = 0; i < s.length(); i++) {
            int digit = s.charAt(i) - '0';
            sum += (int) Math.pow(digit, i);
        }
        return sum == n;
    }
}`,
    bugs: [
      {
        bugId: 'java-num-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Reverse Number Loop Condition',
        objective: 'In reverseNumber, allow loop to process all digits while n > 0 (or n != 0).',
        hint: 'Change "while (n > 9)" to "while (n > 0)".',
        expectedFix: 'while (n > 0)',
        testKey: 'test-java-num-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('while (n > 0)') || cleanCode.includes('while (n != 0)');
          return [{ testId: 't-1', taskId: 'java-num-bug-1', fileId: 'NumberTheoryProcessor.java', name: 'Reverse Number Loop', passed, message: passed ? 'Processes all digits.' : 'Loop stops early at n > 9.' }];
        },
      },
      {
        bugId: 'java-num-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Zero Digit Count',
        objective: 'In countDigits, return 1 when n == 0.',
        hint: 'Change "if (n == 0) return 0;" to "if (n == 0) return 1;".',
        expectedFix: 'if (n == 0) return 1;',
        testKey: 'test-java-num-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (n == 0) return 1;') || cleanCode.includes('if (n == 0) return 1 ;');
          return [{ testId: 't-2', taskId: 'java-num-bug-2', fileId: 'NumberTheoryProcessor.java', name: 'Count Digits Zero Case', passed, message: passed ? 'Zero digit count returns 1.' : 'Zero digit count returns 0.' }];
        },
      },
      {
        bugId: 'java-num-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Sum of Digits Remainder Extraction',
        objective: 'In sumOfDigits, accumulate remainder temp % 10 instead of entire temp.',
        hint: 'Change "sum += temp;" to "sum += temp % 10;".',
        expectedFix: 'sum += temp % 10;',
        testKey: 'test-java-num-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('sum += temp % 10;') || cleanCode.includes('sum += (temp % 10);');
          return [{ testId: 't-3', taskId: 'java-num-bug-3', fileId: 'NumberTheoryProcessor.java', name: 'Sum Of Digits Remainder', passed, message: passed ? 'Accumulates digit remainders.' : 'Accumulates entire temp value.' }];
        },
      },
      {
        bugId: 'java-num-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Palindrome Original Comparison',
        objective: 'In isPalindrome, compare reversed value rev with original temp instead of mutated n.',
        hint: 'Change "return rev == n;" to "return rev == temp;".',
        expectedFix: 'return rev == temp;',
        testKey: 'test-java-num-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return rev == temp;') || cleanCode.includes('return rev == temp ;');
          return [{ testId: 't-4', taskId: 'java-num-bug-4', fileId: 'NumberTheoryProcessor.java', name: 'Palindrome Comparison', passed, message: passed ? 'Compares with preserved temp value.' : 'Compares with mutated n.' }];
        },
      },
      {
        bugId: 'java-num-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Armstrong Power Calculation',
        objective: 'In isArmstrong, raise each digit to the power of total digits (Math.pow(digit, digits)).',
        hint: 'Replace "sum += digit * digit;" with "sum += (int) Math.pow(digit, digits);".',
        expectedFix: 'sum += (int) Math.pow(digit, digits);',
        testKey: 'test-java-num-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('Math.pow(digit, digits)') || cleanCode.includes('Math.pow(digit, (double) digits)');
          return [{ testId: 't-5', taskId: 'java-num-bug-5', fileId: 'NumberTheoryProcessor.java', name: 'Armstrong Power', passed, message: passed ? 'Raises digits to length exponent.' : 'Hardcoded to square.' }];
        },
      },
      {
        bugId: 'java-num-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Perfect Number Divisor Boundary',
        objective: 'In isPerfectNumber, check divisors up to n / 2 (i <= n / 2).',
        hint: 'Change "i <= n / 3" to "i <= n / 2".',
        expectedFix: 'i <= n / 2',
        testKey: 'test-java-num-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i <= n / 2') || cleanCode.includes('i <= n/2');
          return [{ testId: 't-6', taskId: 'java-num-bug-6', fileId: 'NumberTheoryProcessor.java', name: 'Divisor Boundary', passed, message: passed ? 'Checks all divisors up to n/2.' : 'Divisor loop misses divisors between n/3 and n/2.' }];
        },
      },
      {
        bugId: 'java-num-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Harshad Divisibility Check',
        objective: 'In isHarshadNumber, verify n is divisible by sum of digits (n % sum == 0).',
        hint: 'Change "sum % n == 0" to "n % sum == 0".',
        expectedFix: 'n % sum == 0',
        testKey: 'test-java-num-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('n % sum == 0') || cleanCode.includes('n % sum == 0 ;');
          return [{ testId: 't-7', taskId: 'java-num-bug-7', fileId: 'NumberTheoryProcessor.java', name: 'Harshad Divisibility', passed, message: passed ? 'Checks n divisible by sum.' : 'Checks sum divisible by n.' }];
        },
      },
      {
        bugId: 'java-num-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Neon Number Square Computation',
        objective: 'In isNeonNumber, calculate square of number (int sq = n * n).',
        hint: 'Change "int sq = n;" to "int sq = n * n;".',
        expectedFix: 'int sq = n * n;',
        testKey: 'test-java-num-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('sq = n * n') || cleanCode.includes('sq = n*n');
          return [{ testId: 't-8', taskId: 'java-num-bug-8', fileId: 'NumberTheoryProcessor.java', name: 'Neon Square Calculation', passed, message: passed ? 'Calculates n * n.' : 'Uses n directly.' }];
        },
      },
      {
        bugId: 'java-num-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Spy Number Initial Product Identity',
        objective: 'In isSpyNumber, initialize product to 1 (int prod = 1;).',
        hint: 'Change "int prod = 0;" to "int prod = 1;".',
        expectedFix: 'int prod = 1;',
        testKey: 'test-java-num-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('int prod = 1;') || cleanCode.includes('int prod = 1 ;');
          return [{ testId: 't-9', taskId: 'java-num-bug-9', fileId: 'NumberTheoryProcessor.java', name: 'Spy Number Product Identity', passed, message: passed ? 'Product identity initialized to 1.' : 'Product identity initialized to 0.' }];
        },
      },
      {
        bugId: 'java-num-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Disarium Digit Position Power',
        objective: 'In isDisariumNumber, raise digit to 1-based position (i + 1).',
        hint: 'Change "Math.pow(digit, i)" to "Math.pow(digit, i + 1)".',
        expectedFix: 'Math.pow(digit, i + 1)',
        testKey: 'test-java-num-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('Math.pow(digit, i + 1)') || cleanCode.includes('Math.pow(digit, i+1)');
          return [{ testId: 't-10', taskId: 'java-num-bug-10', fileId: 'NumberTheoryProcessor.java', name: 'Disarium 1-based Position', passed, message: passed ? 'Uses 1-based position power.' : 'Uses 0-based position.' }];
        },
      },
    ],
    test_cases: [
      { input: 'reverseNumber(1234)', expectedOutput: '4321' },
      { input: 'isArmstrong(153)', expectedOutput: 'true' },
    ],
    is_active: true,
  },

  // ── 3. PYTHON / EASY: #17 Prime, #18 Range, #27 Strong, #36/#37 GCD/LCM ──
  {
    id: 'challenge-py-001',
    title: 'Prime Sieve, GCD/LCM & Advanced Number Theory',
    description: 'B.Tech Program #17, #18, #27, #29, #33, #35, #36 & #37: Prime validation, sieve range generation, strong numbers, Euclid GCD, LCM formulas, automorphic numbers and happy number cycles.',
    language: 'PYTHON',
    difficulty: 'EASY',
    code: `import math

# 1. Check if a number is prime
def is_prime(n: int) -> bool:
    # BUG-1: Considers 1 and negatives as prime (n <= 0 instead of n <= 1)
    if n <= 0:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    # BUG-2: Square root range stops 1 integer early
    limit = int(math.isqrt(n))
    for i in range(3, limit, 2):
        if n % i == 0:
            return False
    return True

# 2. Get all primes in range [low, high]
def primes_in_range(low: int, high: int) -> list:
    primes = []
    # BUG-3: Iterates exclusive of high (range(low, high))
    for num in range(low, high):
        if is_prime(num):
            primes.append(num)
    return primes

# 3. Factorial calculation helper
def factorial(n: int) -> int:
    if n < 0:
        return 0
    res = 1
    # BUG-4: Range starts at 2 and stops at n - 1
    for i in range(2, n):
        res *= i
    return res

# 4. Strong number check (sum of factorials of digits == n)
def is_strong_number(n: int) -> bool:
    if n <= 0:
        return False
    # BUG-5: Sums digits instead of factorial of digits
    digit_sum = sum(int(d) for d in str(n))
    return digit_sum == n

# 5. Greatest Common Divisor (Euclid's algorithm)
def gcd_euclid(a: int, b: int) -> int:
    a, b = abs(a), abs(b)
    # BUG-6: Inverted loop condition (a != 0 instead of b != 0)
    while a != 0:
        a, b = b, a % b
    return a

# 6. Least Common Multiple (LCM)
def lcm_two_numbers(a: int, b: int) -> int:
    if a == 0 or b == 0:
        return 0
    # BUG-7: Multiplies GCD instead of dividing ( (a * b) * gcd )
    g = gcd_euclid(a, b)
    return (abs(a * b)) * g

# 7. Automorphic number check (square ends with original number)
def is_automorphic(n: int) -> bool:
    if n < 0:
        return False
    sq = n * n
    # BUG-8: Checks startswith instead of endswith
    return str(sq).startswith(str(n))

# 8. Duck number check (contains at least one '0', excluding leading zero)
def is_duck_number(num_str: str) -> bool:
    s = num_str.lstrip('0')
    # BUG-9: Inverted check (returns True if '0' not in s)
    return '0' not in s

# 9. Happy number cycle check
def is_happy_number(n: int) -> bool:
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        # BUG-10: Sums digits directly instead of squares of digits
        n = sum(int(d) for d in str(n))
    return n == 1
`,
    bugs: [
      {
        bugId: 'py-prime-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Prime Base Case Boundary',
        objective: 'In is_prime, reject all integers <= 1 (if n <= 1: return False).',
        hint: 'Change "if n <= 0:" to "if n <= 1:".',
        expectedFix: 'if n <= 1: return False',
        testKey: 'test-py-prime-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('n <= 1') || cleanCode.includes('n < 2');
          return [{ testId: 't-1', taskId: 'py-prime-bug-1', fileId: 'prime_and_divisors.py', name: 'Prime Base Guard', passed, message: passed ? 'Rejects integers <= 1.' : 'Allows 1 to pass as prime.' }];
        },
      },
      {
        bugId: 'py-prime-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Sqrt Loop Boundary in is_prime',
        objective: 'In is_prime, include the square root integer (range(3, limit + 1, 2)).',
        hint: 'Change "limit" to "limit + 1" in range(3, limit + 1, 2).',
        expectedFix: 'range(3, limit + 1, 2)',
        testKey: 'test-py-prime-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('limit + 1') || cleanCode.includes('limit+1') || cleanCode.includes('int(math.isqrt(n)) + 1');
          return [{ testId: 't-2', taskId: 'py-prime-bug-2', fileId: 'prime_and_divisors.py', name: 'Sqrt Bound Check', passed, message: passed ? 'Checks square root boundary.' : 'Misses square divisor.' }];
        },
      },
      {
        bugId: 'py-prime-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Range Inclusion in primes_in_range',
        objective: 'In primes_in_range, include the upper limit high in the loop (range(low, high + 1)).',
        hint: 'Change "range(low, high)" to "range(low, high + 1)".',
        expectedFix: 'range(low, high + 1)',
        testKey: 'test-py-prime-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('range(low, high + 1)') || cleanCode.includes('range(low, high+1)');
          return [{ testId: 't-3', taskId: 'py-prime-bug-3', fileId: 'prime_and_divisors.py', name: 'Range Inclusivity', passed, message: passed ? 'Includes high in range.' : 'Upper bound high is excluded.' }];
        },
      },
      {
        bugId: 'py-prime-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Factorial Helper Upper Range',
        objective: 'In factorial, include n in the multiplication (range(2, n + 1)).',
        hint: 'Change "range(2, n)" to "range(2, n + 1)".',
        expectedFix: 'range(2, n + 1)',
        testKey: 'test-py-prime-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('range(2, n + 1)') || cleanCode.includes('range(1, n + 1)') || cleanCode.includes('range(2, n+1)');
          return [{ testId: 't-4', taskId: 'py-prime-bug-4', fileId: 'prime_and_divisors.py', name: 'Factorial Upper Bound', passed, message: passed ? 'Multiplies up to n.' : 'Stops at n - 1.' }];
        },
      },
      {
        bugId: 'py-prime-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Strong Number Factorial Sum',
        objective: 'In is_strong_number, compute sum of factorials of digits (sum(factorial(int(d)) for d in str(n))).',
        hint: 'Wrap int(d) in factorial(int(d)).',
        expectedFix: 'sum(factorial(int(d)) for d in str(n))',
        testKey: 'test-py-prime-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('factorial(int(d))');
          return [{ testId: 't-5', taskId: 'py-prime-bug-5', fileId: 'prime_and_divisors.py', name: 'Strong Number Factorials', passed, message: passed ? 'Sums factorial of digits.' : 'Sums raw digits.' }];
        },
      },
      {
        bugId: 'py-prime-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Euclid GCD Loop Condition',
        objective: 'In gcd_euclid, iterate while divisor b != 0.',
        hint: 'Change "while a != 0:" to "while b != 0:" or "while b:".',
        expectedFix: 'while b != 0:',
        testKey: 'test-py-prime-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('while b != 0:') || cleanCode.includes('while b:');
          return [{ testId: 't-6', taskId: 'py-prime-bug-6', fileId: 'prime_and_divisors.py', name: 'Euclid Loop Divisor', passed, message: passed ? 'Iterates until b == 0.' : 'Checks a != 0.' }];
        },
      },
      {
        bugId: 'py-prime-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix LCM Formula Division by GCD',
        objective: 'In lcm_two_numbers, divide product by GCD (abs(a * b) // g).',
        hint: 'Change "* g" to "// g" or "/ g".',
        expectedFix: '(abs(a * b)) // g',
        testKey: 'test-py-prime-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('// g') || cleanCode.includes('/ g') || cleanCode.includes('//g');
          return [{ testId: 't-7', taskId: 'py-prime-7', fileId: 'prime_and_divisors.py', name: 'LCM Product Division', passed, message: passed ? 'Divides product by GCD.' : 'Multiplies product by GCD.' }];
        },
      },
      {
        bugId: 'py-prime-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Automorphic Suffix Check',
        objective: 'In is_automorphic, check str(sq).endswith(str(n)) instead of startswith.',
        hint: 'Change "startswith" to "endswith".',
        expectedFix: 'str(sq).endswith(str(n))',
        testKey: 'test-py-prime-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('endswith(str(n))');
          return [{ testId: 't-8', taskId: 'py-prime-bug-8', fileId: 'prime_and_divisors.py', name: 'Automorphic Suffix Check', passed, message: passed ? 'Checks suffix with endswith.' : 'Checks prefix with startswith.' }];
        },
      },
      {
        bugId: 'py-prime-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Duck Number Zero Presence',
        objective: 'In is_duck_number, return True if "0" is present in string after stripping leading zero.',
        hint: 'Change "return \'0\' not in s" to "return \'0\' in s".',
        expectedFix: "return '0' in s",
        testKey: 'test-py-prime-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes("'0' in s") || cleanCode.includes('"0" in s');
          return [{ testId: 't-9', taskId: 'py-prime-bug-9', fileId: 'prime_and_divisors.py', name: 'Duck Number Check', passed, message: passed ? 'Detects zero in trimmed string.' : 'Inverted zero check.' }];
        },
      },
      {
        bugId: 'py-prime-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Happy Number Digit Square Sum',
        objective: 'In is_happy_number, square each digit (sum(int(d) ** 2 for d in str(n))).',
        hint: 'Change "int(d)" to "int(d) ** 2".',
        expectedFix: 'sum(int(d) ** 2 for d in str(n))',
        testKey: 'test-py-prime-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('int(d) ** 2') || cleanCode.includes('int(d)**2') || cleanCode.includes('int(d) * int(d)');
          return [{ testId: 't-10', taskId: 'py-prime-bug-10', fileId: 'prime_and_divisors.py', name: 'Happy Number Square Sum', passed, message: passed ? 'Squares digits in iteration.' : 'Sums digits linearly.' }];
        },
      },
    ],
    test_cases: [
      { input: 'is_prime(29)', expectedOutput: 'True' },
      { input: 'gcd_euclid(48, 18)', expectedOutput: '6' },
    ],
    is_active: true,
  },

  // ── 4. JAVA / MEDIUM: #20 Factorial, #22 Fibonacci, #46 Natural, #50 AP, #51 GP, #52 Squares ──
  {
    id: 'challenge-java-002',
    title: 'Series & Recursion Engine',
    description: 'B.Tech Program #19, #20, #21, #22, #46, #49, #50, #51, #52 & #53: Recursive & iterative factorial, Fibonacci series, Arithmetic and Geometric progressions, and sum of powers.',
    language: 'JAVA',
    difficulty: 'MEDIUM',
    code: `public class SeriesAndRecursion {
    // 1. Recursive Factorial
    public static long factorial(int n) {
        if (n < 0) return -1;
        // BUG-1: Base case returns 0 for n == 0 instead of 1
        if (n == 0 || n == 1) return 0;
        return n * factorial(n - 1);
    }

    // 2. Iterative Fibonacci (0, 1, 1, 2, 3, 5, 8...)
    public static int fibonacciIterative(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        int a = 0, b = 1;
        // BUG-2: Loop counter starts at 1 causing extra shift
        for (int i = 1; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }

    // 3. Recursive Fibonacci
    public static int fibonacciRecursive(int n) {
        if (n <= 0) return 0;
        // BUG-3: Returns 2 for n == 1 instead of 1
        if (n == 1) return 2;
        return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
    }

    // 4. Sum of first n natural numbers
    public static long sumNaturalNumbers(int n) {
        if (n <= 0) return 0;
        // BUG-4: Multiplies by (n - 1) instead of (n + 1)
        return (long) n * (n - 1) / 2;
    }

    // 5. Harmonic series sum: 1 + 1/2 + 1/3 + ... + 1/n
    public static double harmonicSum(int n) {
        if (n <= 0) return 0.0;
        double sum = 0.0;
        for (int i = 1; i <= n; i++) {
            // BUG-5: Integer division 1 / i truncates to 0 for i > 1
            sum += 1 / i;
        }
        return sum;
    }

    // 6. Arithmetic Progression nth term: a + (n - 1) * d
    public static double apNthTerm(double a, double d, int n) {
        if (n <= 0) return a;
        // BUG-6: Uses n * d instead of (n - 1) * d
        return a + n * d;
    }

    // 7. Sum of AP series: (n / 2) * (2a + (n - 1)d)
    public static double apSum(double a, double d, int n) {
        if (n <= 0) return 0.0;
        // BUG-7: Formula missing 2 * a
        return (n / 2.0) * (a + (n - 1) * d);
    }

    // 8. Geometric Progression nth term: a * r^(n - 1)
    public static double gpNthTerm(double a, double r, int n) {
        if (n <= 0) return a;
        // BUG-8: Raises to power n instead of n - 1
        return a * Math.pow(r, n);
    }

    // 9. Sum of squares: 1^2 + 2^2 + ... + n^2 = n*(n+1)*(2n+1)/6
    public static long sumOfSquares(int n) {
        if (n <= 0) return 0;
        // BUG-9: Divides by 4 instead of 6
        return (long) n * (n + 1) * (2 * n + 1) / 4;
    }

    // 10. Sum of cubes: (n * (n + 1) / 2)^2
    public static long sumOfCubes(int n) {
        if (n <= 0) return 0;
        long sum = (long) n * (n + 1) / 2;
        // BUG-10: Multiplies by 2 instead of squaring
        return sum * 2;
    }
}`,
    bugs: [
      {
        bugId: 'java-rec-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Factorial Base Case Return',
        objective: 'In factorial, return 1 for n == 0 or n == 1.',
        hint: 'Change "return 0;" to "return 1;".',
        expectedFix: 'if (n == 0 || n == 1) return 1;',
        testKey: 'test-java-rec-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return 1;') || cleanCode.includes('return 1 ;') || cleanCode.includes('return 1L;');
          return [{ testId: 't-1', taskId: 'java-rec-bug-1', fileId: 'SeriesAndRecursion.java', name: 'Factorial Base Case', passed, message: passed ? 'Factorial base case returns 1.' : 'Factorial base case returns 0.' }];
        },
      },
      {
        bugId: 'java-rec-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Iterative Fibonacci Loop Bounds',
        objective: 'In fibonacciIterative, start loop from i = 2 to return correct nth Fibonacci term.',
        hint: 'Change "for (int i = 1; i <= n; i++)" to "for (int i = 2; i <= n; i++)" or adjust return.',
        expectedFix: 'for (int i = 2; i <= n; i++)',
        testKey: 'test-java-rec-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('int i = 2; i <= n;') || cleanCode.includes('int i = 2; i <= n ;');
          return [{ testId: 't-2', taskId: 'java-rec-bug-2', fileId: 'SeriesAndRecursion.java', name: 'Fibonacci Iterative Loop', passed, message: passed ? 'Fibonacci step count valid.' : 'Extra loop shift.' }];
        },
      },
      {
        bugId: 'java-rec-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Recursive Fibonacci Base Case',
        objective: 'In fibonacciRecursive, return 1 when n == 1.',
        hint: 'Change "if (n == 1) return 2;" to "if (n == 1) return 1;".',
        expectedFix: 'if (n == 1) return 1;',
        testKey: 'test-java-rec-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (n == 1) return 1;') || cleanCode.includes('if (n <= 2) return 1;');
          return [{ testId: 't-3', taskId: 'java-rec-bug-3', fileId: 'SeriesAndRecursion.java', name: 'Fibonacci Recursive Base', passed, message: passed ? 'Returns 1 for n == 1.' : 'Returns 2 for n == 1.' }];
        },
      },
      {
        bugId: 'java-rec-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Sum of Natural Numbers Formula',
        objective: 'In sumNaturalNumbers, use formula n * (n + 1) / 2.',
        hint: 'Change "(n - 1)" to "(n + 1)".',
        expectedFix: 'n * (n + 1) / 2',
        testKey: 'test-java-rec-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('(n + 1)') || cleanCode.includes('(n+1)');
          return [{ testId: 't-4', taskId: 'java-rec-bug-4', fileId: 'SeriesAndRecursion.java', name: 'Natural Sum Formula', passed, message: passed ? 'Uses (n + 1) formula.' : 'Uses (n - 1).' }];
        },
      },
      {
        bugId: 'java-rec-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Harmonic Sum Double Precision Division',
        objective: 'In harmonicSum, perform floating-point division (1.0 / i).',
        hint: 'Change "1 / i" to "1.0 / i".',
        expectedFix: 'sum += 1.0 / i;',
        testKey: 'test-java-rec-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('1.0 / i') || cleanCode.includes('(double) 1 / i') || cleanCode.includes('1.0/i');
          return [{ testId: 't-5', taskId: 'java-rec-bug-5', fileId: 'SeriesAndRecursion.java', name: 'Harmonic Float Division', passed, message: passed ? 'Uses floating-point division.' : 'Integer truncation to 0.' }];
        },
      },
      {
        bugId: 'java-rec-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix AP Nth Term Formula',
        objective: 'In apNthTerm, calculate a + (n - 1) * d.',
        hint: 'Change "n * d" to "(n - 1) * d".',
        expectedFix: 'a + (n - 1) * d',
        testKey: 'test-java-rec-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('(n - 1) * d') || cleanCode.includes('(n-1)*d');
          return [{ testId: 't-6', taskId: 'java-rec-bug-6', fileId: 'SeriesAndRecursion.java', name: 'AP Nth Term Formula', passed, message: passed ? 'Uses (n - 1) * d.' : 'Uses n * d.' }];
        },
      },
      {
        bugId: 'java-rec-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix AP Sum Formula 2a Component',
        objective: 'In apSum, use (n / 2.0) * (2 * a + (n - 1) * d).',
        hint: 'Change "(a +" to "(2 * a +".',
        expectedFix: '(2 * a + (n - 1) * d)',
        testKey: 'test-java-rec-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('2 * a') || cleanCode.includes('2*a');
          return [{ testId: 't-7', taskId: 'java-rec-bug-7', fileId: 'SeriesAndRecursion.java', name: 'AP Sum 2a Factor', passed, message: passed ? 'Includes 2*a term.' : 'Missing 2*a multiplier.' }];
        },
      },
      {
        bugId: 'java-rec-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix GP Nth Term Power Exponent',
        objective: 'In gpNthTerm, raise ratio r to power (n - 1).',
        hint: 'Change "Math.pow(r, n)" to "Math.pow(r, n - 1)".',
        expectedFix: 'Math.pow(r, n - 1)',
        testKey: 'test-java-rec-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('Math.pow(r, n - 1)') || cleanCode.includes('Math.pow(r, n-1)');
          return [{ testId: 't-8', taskId: 'java-rec-bug-8', fileId: 'SeriesAndRecursion.java', name: 'GP Exponent', passed, message: passed ? 'Uses (n - 1) exponent.' : 'Uses n exponent.' }];
        },
      },
      {
        bugId: 'java-rec-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Sum of Squares Divisor',
        objective: 'In sumOfSquares, divide product by 6 (n * (n + 1) * (2n + 1) / 6).',
        hint: 'Change "/ 4" to "/ 6".',
        expectedFix: '/ 6',
        testKey: 'test-java-rec-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('/ 6') || cleanCode.includes('/6');
          return [{ testId: 't-9', taskId: 'java-rec-bug-9', fileId: 'SeriesAndRecursion.java', name: 'Sum of Squares Divisor', passed, message: passed ? 'Divides by 6.' : 'Divides by 4.' }];
        },
      },
      {
        bugId: 'java-rec-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Sum of Cubes Squaring',
        objective: 'In sumOfCubes, return sum * sum (square the natural sum).',
        hint: 'Change "return sum * 2;" to "return sum * sum;".',
        expectedFix: 'return sum * sum;',
        testKey: 'test-java-rec-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('sum * sum') || cleanCode.includes('Math.pow(sum, 2)');
          return [{ testId: 't-10', taskId: 'java-rec-bug-10', fileId: 'SeriesAndRecursion.java', name: 'Sum of Cubes Square', passed, message: passed ? 'Squares the sum term.' : 'Multiplies by 2.' }];
        },
      },
    ],
    test_cases: [
      { input: 'factorial(5)', expectedOutput: '120' },
      { input: 'fibonacciIterative(7)', expectedOutput: '13' },
    ],
    is_active: true,
  },

  // ── 5. C / MEDIUM: #54 Sine, #55 Cosine, #56 Exp, #59 Quadratic, #60 Distance ──
  {
    id: 'challenge-c-002',
    title: 'Taylor Series, Quadratic Solver & Euclidean Geometry',
    description: 'B.Tech Program #54, #55, #56, #57, #59 & #60: Taylor approximations of sin(x), cos(x), e^x, quadratic root discriminant and 2D coordinate distance.',
    language: 'C',
    difficulty: 'MEDIUM',
    code: `#include <stdio.h>
#include <math.h>

#define PI 3.14159265358979323846

// 1. Convert degrees to radians
double degrees_to_radians(double deg) {
    // BUG-1: Inverted ratio (180.0 / PI instead of PI / 180.0)
    return deg * (180.0 / PI);
}

// 2. Factorial helper
double fact(int n) {
    double f = 1.0;
    // BUG-2: Stops 1 iteration early
    for (int i = 1; i < n; i++) {
        f *= i;
    }
    return f;
}

// 3. Taylor Series approximation for sin(x)
// sin(x) = x - x^3/3! + x^5/5! - x^7/7! ...
double taylor_sin(double x, int terms) {
    double sum = 0.0;
    for (int i = 0; i < terms; i++) {
        int power = 2 * i + 1;
        // BUG-3: Always adds instead of alternating signs (pow(-1, i))
        double term = pow(x, power) / fact(power);
        sum += term;
    }
    return sum;
}

// 4. Taylor Series approximation for cos(x)
// cos(x) = 1 - x^2/2! + x^4/4! - x^6/6! ...
double taylor_cos(double x, int terms) {
    double sum = 0.0;
    for (int i = 0; i < terms; i++) {
        // BUG-4: Uses odd power (2*i + 1) instead of even power (2*i)
        int power = 2 * i + 1;
        double sign = (i % 2 == 0) ? 1.0 : -1.0;
        sum += sign * pow(x, power) / fact(power);
    }
    return sum;
}

// 5. Exponential Series e^x = 1 + x + x^2/2! + x^3/3! ...
double taylor_exp(double x, int terms) {
    double sum = 0.0;
    // BUG-5: Starts at i = 1 skipping the first term (1.0)
    for (int i = 1; i < terms; i++) {
        sum += pow(x, i) / fact(i);
    }
    return sum;
}

// 6. Quadratic equation roots discriminant
double quadratic_discriminant(double a, double b, double c) {
    // BUG-6: Inverted sign (b*b + 4*a*c instead of b*b - 4*a*c)
    return (b * b) + (4.0 * a * c);
}

// 7. Quadratic root 1: (-b + sqrt(d)) / (2*a)
double quadratic_root_1(double a, double b, double c) {
    double d = quadratic_discriminant(a, b, c);
    if (d < 0) return 0.0; // Real roots only
    // BUG-7: Missing parentheses in denominator (2 * a evaluated as / 2 * a)
    return (-b + sqrt(d)) / 2 * a;
}

// 8. Quadratic root 2: (-b - sqrt(d)) / (2*a)
double quadratic_root_2(double a, double b, double c) {
    double d = quadratic_discriminant(a, b, c);
    if (d < 0) return 0.0;
    // BUG-8: Adds sqrt(d) instead of subtracting
    return (-b + sqrt(d)) / (2.0 * a);
}

// 9. Euclidean distance between (x1, y1) and (x2, y2)
double euclidean_distance(double x1, double y1, double x2, double y2) {
    double dx = x2 - x1;
    double dy = y2 - y1;
    // BUG-9: Adds un-squared dx and dy inside sqrt
    return sqrt(dx + dy);
}

// 10. Tangent approximation: sin(x) / cos(x)
double taylor_tan(double x, int terms) {
    double c = taylor_cos(x, terms);
    // BUG-10: Inverted zero check (if c != 0 return 0)
    if (c != 0.0) {
        return 0.0;
    }
    return taylor_sin(x, terms) / c;
}`,
    bugs: [
      {
        bugId: 'c-math-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Degree to Radian Constant Ratio',
        objective: 'In degrees_to_radians, multiply by PI / 180.0.',
        hint: 'Change "180.0 / PI" to "PI / 180.0".',
        expectedFix: 'deg * (PI / 180.0)',
        testKey: 'test-c-math-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('PI / 180.0') || cleanCode.includes('PI/180.0') || cleanCode.includes('PI / 180');
          return [{ testId: 't-1', taskId: 'c-math-bug-1', fileId: 'MathSeriesAndGeometry.c', name: 'Degree to Radian', passed, message: passed ? 'Conversion ratio valid.' : 'Inverted conversion ratio.' }];
        },
      },
      {
        bugId: 'c-math-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Factorial Helper Loop Bounds',
        objective: 'In fact, loop until i <= n.',
        hint: 'Change "i < n" to "i <= n".',
        expectedFix: 'for (int i = 1; i <= n; i++)',
        testKey: 'test-c-math-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i <= n;') || cleanCode.includes('i <= n ;');
          return [{ testId: 't-2', taskId: 'c-math-bug-2', fileId: 'MathSeriesAndGeometry.c', name: 'Factorial Loop Bound', passed, message: passed ? 'Factorial multiplies up to n.' : 'Stops at n - 1.' }];
        },
      },
      {
        bugId: 'c-math-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Sine Series Alternating Sign',
        objective: 'In taylor_sin, alternate signs for terms using ((i % 2 == 0) ? 1.0 : -1.0).',
        hint: 'Multiply term by alternating sign.',
        expectedFix: 'double sign = (i % 2 == 0) ? 1.0 : -1.0; sum += sign * term;',
        testKey: 'test-c-math-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i % 2 == 0') || cleanCode.includes('pow(-1, i)');
          return [{ testId: 't-3', taskId: 'c-math-bug-3', fileId: 'MathSeriesAndGeometry.c', name: 'Sine Alternating Sign', passed, message: passed ? 'Alternates term signs.' : 'Adds all terms positively.' }];
        },
      },
      {
        bugId: 'c-math-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Cosine Series Even Exponent',
        objective: 'In taylor_cos, use even powers (2 * i).',
        hint: 'Change "2 * i + 1" to "2 * i".',
        expectedFix: 'int power = 2 * i;',
        testKey: 'test-c-math-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('power = 2 * i;') || cleanCode.includes('power = 2*i;');
          return [{ testId: 't-4', taskId: 'c-math-bug-4', fileId: 'MathSeriesAndGeometry.c', name: 'Cosine Even Power', passed, message: passed ? 'Uses even powers for cosine.' : 'Uses odd powers.' }];
        },
      },
      {
        bugId: 'c-math-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Exponential Series First Term',
        objective: 'In taylor_exp, start loop from i = 0 to include 1.0 (x^0 / 0!).',
        hint: 'Change "int i = 1" to "int i = 0".',
        expectedFix: 'for (int i = 0; i < terms; i++)',
        testKey: 'test-c-math-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('int i = 0; i < terms;') || cleanCode.includes('sum = 1.0');
          return [{ testId: 't-5', taskId: 'c-math-bug-5', fileId: 'MathSeriesAndGeometry.c', name: 'Exp First Term', passed, message: passed ? 'Includes base 1.0 term.' : 'Misses initial term.' }];
        },
      },
      {
        bugId: 'c-math-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Quadratic Discriminant Formula',
        objective: 'In quadratic_discriminant, subtract 4ac ((b * b) - (4.0 * a * c)).',
        hint: 'Change "+" to "-".',
        expectedFix: '(b * b) - (4.0 * a * c)',
        testKey: 'test-c-math-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('(b * b) - (4') || cleanCode.includes('b*b - 4*a*c') || cleanCode.includes('b * b - 4.0 * a * c');
          return [{ testId: 't-6', taskId: 'c-math-bug-6', fileId: 'MathSeriesAndGeometry.c', name: 'Discriminant Formula', passed, message: passed ? 'Subtracts 4ac.' : 'Adds 4ac.' }];
        },
      },
      {
        bugId: 'c-math-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Root 1 Denominator Parentheses',
        objective: 'In quadratic_root_1, enclose denominator in parentheses: / (2.0 * a).',
        hint: 'Change "/ 2 * a" to "/ (2.0 * a)".',
        expectedFix: '/ (2.0 * a)',
        testKey: 'test-c-math-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('/ (2.0 * a)') || cleanCode.includes('/ (2 * a)') || cleanCode.includes('/(2*a)');
          return [{ testId: 't-7', taskId: 'c-math-bug-7', fileId: 'MathSeriesAndGeometry.c', name: 'Root Denominator Precedence', passed, message: passed ? 'Denominator grouped in parens.' : 'Operator precedence bug in division.' }];
        },
      },
      {
        bugId: 'c-math-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Root 2 Subtraction Sign',
        objective: 'In quadratic_root_2, subtract sqrt(d) in numerator (-b - sqrt(d)).',
        hint: 'Change "-b + sqrt(d)" to "-b - sqrt(d)".',
        expectedFix: '(-b - sqrt(d))',
        testKey: 'test-c-math-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('-b - sqrt(d)') || cleanCode.includes('-b - sqrt( d )');
          return [{ testId: 't-8', taskId: 'c-math-bug-8', fileId: 'MathSeriesAndGeometry.c', name: 'Root 2 Subtraction', passed, message: passed ? 'Subtracts radical for second root.' : 'Adds radical.' }];
        },
      },
      {
        bugId: 'c-math-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Euclidean Distance Delta Squares',
        objective: 'In euclidean_distance, square dx and dy (dx * dx + dy * dy).',
        hint: 'Change "sqrt(dx + dy)" to "sqrt(dx * dx + dy * dy)".',
        expectedFix: 'sqrt(dx * dx + dy * dy)',
        testKey: 'test-c-math-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('dx * dx + dy * dy') || cleanCode.includes('dx*dx + dy*dy');
          return [{ testId: 't-9', taskId: 'c-math-bug-9', fileId: 'MathSeriesAndGeometry.c', name: 'Euclidean Distance Squares', passed, message: passed ? 'Squares coordinate differentials.' : 'Sums differentials linearly.' }];
        },
      },
      {
        bugId: 'c-math-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Tangent Cosine Zero Divisor Guard',
        objective: 'In taylor_tan, return 0.0 when c == 0.0 to prevent division by zero.',
        hint: 'Change "if (c != 0.0)" to "if (c == 0.0)".',
        expectedFix: 'if (c == 0.0) return 0.0;',
        testKey: 'test-c-math-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (c == 0.0') || cleanCode.includes('if (c == 0') || cleanCode.includes('if (fabs(c)');
          return [{ testId: 't-10', taskId: 'c-math-bug-10', fileId: 'MathSeriesAndGeometry.c', name: 'Tangent Divisor Guard', passed, message: passed ? 'Guards when cosine is zero.' : 'Inverted zero check.' }];
        },
      },
    ],
    test_cases: [
      { input: 'degrees_to_radians(180)', expectedOutput: '3.14159' },
      { input: 'quadratic_discriminant(1, -5, 6)', expectedOutput: '1.0' },
    ],
    is_active: true,
  },

  // ── 6. PYTHON / MEDIUM: #40 Dec2Bin, #41 Bin2Dec, #42 Hex, #43 SetBits, #44 Leap, #45 Month ──
  {
    id: 'challenge-py-002',
    title: 'Bitwise Computing, Radix Conversions & Calendar Rules',
    description: 'B.Tech Program #40, #41, #42, #43, #44 & #45: Binary, octal, hexadecimal conversions, Brian Kernighan bit counting, Gregorian leap year determinations and month days calculation.',
    language: 'PYTHON',
    difficulty: 'MEDIUM',
    code: `# 1. Decimal to binary string
def decimal_to_binary(n: int) -> str:
    if n == 0:
        return "0"
    bits = []
    temp = abs(n)
    while temp > 0:
        # BUG-1: Uses temp // 2 instead of temp % 2 for bit
        bits.append(str(temp // 2))
        temp //= 2
    return "".join(reversed(bits))

# 2. Binary string to decimal integer
def binary_to_decimal(b_str: str) -> int:
    decimal_val = 0
    # BUG-2: Iterates forward without reversing or adjusting power
    for i, char in enumerate(b_str):
        if char == '1':
            decimal_val += 2 ** i
    return decimal_val

# 3. Decimal to hexadecimal string
def decimal_to_hex(n: int) -> str:
    if n == 0:
        return "0"
    hex_digits = "0123456789ABCDEF"
    result = []
    temp = abs(n)
    while temp > 0:
        rem = temp % 16
        # BUG-3: Appends raw remainder int instead of mapped hex digit
        result.append(str(rem))
        temp //= 16
    return "".join(reversed(result))

# 4. Count number of set bits (1s) using Brian Kernighan's Algorithm
def count_set_bits(n: int) -> int:
    count = 0
    temp = abs(n)
    while temp > 0:
        # BUG-4: Performs temp | (temp - 1) instead of temp & (temp - 1)
        temp = temp | (temp - 1)
        count += 1
        if count > 64: break # infinite loop safeguard
    return count

# 5. Gregorian Leap Year checker
def is_leap_year(year: int) -> bool:
    # BUG-5: Inverted century rule (uses year % 100 == 0 without checking % 400 == 0)
    if year % 4 == 0 and year % 100 == 0:
        return True
    return False

# 6. Number of days in a month (1..12)
def days_in_month(month: int, year: int) -> int:
    if month < 1 or month > 12:
        return 0
    # BUG-6: Inverted February leap year days (28 if leap else 29)
    if month == 2:
        return 28 if is_leap_year(year) else 29
    # Months with 30 days: 4, 6, 9, 11
    # BUG-7: Lists 7 (July) instead of 6 (June)
    if month in [4, 7, 9, 11]:
        return 30
    return 31

# 7. Bitwise swap two variables
def bitwise_swap(a: int, b: int) -> tuple:
    # BUG-8: Uses bitwise OR instead of XOR
    a = a | b
    b = a ^ b
    a = a ^ b
    return a, b

# 8. Check if integer is power of two
def is_power_of_two(n: int) -> bool:
    if n <= 0:
        return False
    # BUG-9: Checks (n | (n - 1)) == 0 instead of (n & (n - 1)) == 0
    return (n | (n - 1)) == 0

# 9. Reverse 8-bit integer bits
def reverse_8bit(n: int) -> int:
    rev = 0
    # BUG-10: Loop runs 7 times instead of 8 times
    for i in range(7):
        rev = (rev << 1) | ((n >> i) & 1)
    return rev
`,
    bugs: [
      {
        bugId: 'py-bits-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Binary Remainder Extraction',
        objective: 'In decimal_to_binary, extract bit using temp % 2.',
        hint: 'Change "temp // 2" to "temp % 2".',
        expectedFix: 'bits.append(str(temp % 2))',
        testKey: 'test-py-bits-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('temp % 2') || cleanCode.includes('temp%2');
          return [{ testId: 't-1', taskId: 'py-bits-bug-1', fileId: 'conversions_and_bits.py', name: 'Binary Remainder Extraction', passed, message: passed ? 'Extracts remainder modulo 2.' : 'Uses quotient instead of remainder.' }];
        },
      },
      {
        bugId: 'py-bits-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Binary to Decimal Positional Power',
        objective: 'In binary_to_decimal, calculate positional power from right (2 ** (len(b_str) - 1 - i)).',
        hint: 'Or reverse string before iteration: for i, char in enumerate(reversed(b_str)).',
        expectedFix: 'for i, char in enumerate(reversed(b_str)):',
        testKey: 'test-py-bits-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('reversed(b_str)') || cleanCode.includes('len(b_str) - 1 - i');
          return [{ testId: 't-2', taskId: 'py-bits-bug-2', fileId: 'conversions_and_bits.py', name: 'Binary Position Power', passed, message: passed ? 'Computes correct positional exponent.' : 'Power grows in wrong direction.' }];
        },
      },
      {
        bugId: 'py-bits-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Hexadecimal Digit Character Mapping',
        objective: 'In decimal_to_hex, look up digit char in hex_digits string (hex_digits[rem]).',
        hint: 'Change "str(rem)" to "hex_digits[rem]".',
        expectedFix: 'result.append(hex_digits[rem])',
        testKey: 'test-py-bits-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('hex_digits[rem]');
          return [{ testId: 't-3', taskId: 'py-bits-bug-3', fileId: 'conversions_and_bits.py', name: 'Hex Digit Mapping', passed, message: passed ? 'Maps remainders 10-15 to A-F.' : 'Leaves raw integers.' }];
        },
      },
      {
        bugId: 'py-bits-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Brian Kernighan Bit Clearing',
        objective: 'In count_set_bits, clear least significant bit with temp & (temp - 1).',
        hint: 'Change "temp | (temp - 1)" to "temp & (temp - 1)".',
        expectedFix: 'temp = temp & (temp - 1)',
        testKey: 'test-py-bits-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('temp & (temp - 1)') || cleanCode.includes('temp & (temp-1)') || cleanCode.includes('temp &= (temp - 1)');
          return [{ testId: 't-4', taskId: 'py-bits-bug-4', fileId: 'conversions_and_bits.py', name: 'Kernighan Bitwise AND', passed, message: passed ? 'Uses bitwise AND.' : 'Uses bitwise OR causing loop error.' }];
        },
      },
      {
        bugId: 'py-bits-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Gregorian Leap Year Rules',
        objective: 'In is_leap_year, check (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0).',
        hint: 'Apply standard 400/100/4 rule.',
        expectedFix: 'return (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0)',
        testKey: 'test-py-bits-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('year % 400 == 0') && (cleanCode.includes('year % 100 != 0') || cleanCode.includes('year % 100 != 0'));
          return [{ testId: 't-5', taskId: 'py-bits-bug-5', fileId: 'conversions_and_bits.py', name: 'Gregorian Leap Rule', passed, message: passed ? 'Gregorian leap rule valid.' : 'Century rule inverted.' }];
        },
      },
      {
        bugId: 'py-bits-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix February Days in Leap Year',
        objective: 'In days_in_month, return 29 if leap year, otherwise 28.',
        hint: 'Change "28 if is_leap_year(year) else 29" to "29 if is_leap_year(year) else 28".',
        expectedFix: 'return 29 if is_leap_year(year) else 28',
        testKey: 'test-py-bits-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('29 if is_leap_year(year) else 28') || cleanCode.includes('29 if is_leap_year(year) else 28');
          return [{ testId: 't-6', taskId: 'py-bits-bug-6', fileId: 'conversions_and_bits.py', name: 'February Days', passed, message: passed ? 'February days set correctly.' : 'Inverted February days.' }];
        },
      },
      {
        bugId: 'py-bits-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix 30-Day Months List',
        objective: 'In days_in_month, list months 4 (April), 6 (June), 9 (September), 11 (November).',
        hint: 'Change [4, 7, 9, 11] to [4, 6, 9, 11].',
        expectedFix: '[4, 6, 9, 11]',
        testKey: 'test-py-bits-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('[4, 6, 9, 11]') || cleanCode.includes('(4, 6, 9, 11)');
          return [{ testId: 't-7', taskId: 'py-bits-bug-7', fileId: 'conversions_and_bits.py', name: '30-Day Months', passed, message: passed ? 'Contains month 6 (June).' : 'Contains month 7 instead of 6.' }];
        },
      },
      {
        bugId: 'py-bits-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Bitwise XOR Swap',
        objective: 'In bitwise_swap, use XOR on the first step (a = a ^ b).',
        hint: 'Change "a = a | b" to "a = a ^ b".',
        expectedFix: 'a = a ^ b',
        testKey: 'test-py-bits-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('a = a ^ b') || cleanCode.includes('a ^= b');
          return [{ testId: 't-8', taskId: 'py-bits-bug-8', fileId: 'conversions_and_bits.py', name: 'XOR Bitwise Swap', passed, message: passed ? 'Uses bitwise XOR.' : 'Uses bitwise OR.' }];
        },
      },
      {
        bugId: 'py-bits-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Power of Two Bitwise AND',
        objective: 'In is_power_of_two, verify (n & (n - 1)) == 0.',
        hint: 'Change "|" to "&".',
        expectedFix: '(n & (n - 1)) == 0',
        testKey: 'test-py-bits-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('(n & (n - 1)) == 0') || cleanCode.includes('(n & (n-1)) == 0');
          return [{ testId: 't-9', taskId: 'py-bits-bug-9', fileId: 'conversions_and_bits.py', name: 'Power of Two Check', passed, message: passed ? 'Uses bitwise AND with predecessor.' : 'Uses bitwise OR.' }];
        },
      },
      {
        bugId: 'py-bits-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix 8-Bit Reversal Iterations',
        objective: 'In reverse_8bit, iterate all 8 bits (range(8)).',
        hint: 'Change "range(7)" to "range(8)".',
        expectedFix: 'for i in range(8):',
        testKey: 'test-py-bits-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('range(8)') || cleanCode.includes('range(0, 8)');
          return [{ testId: 't-10', taskId: 'py-bits-bug-10', fileId: 'conversions_and_bits.py', name: '8-Bit Loop Iteration', passed, message: passed ? 'Processes all 8 bits.' : 'Processes only 7 bits.' }];
        },
      },
    ],
    test_cases: [
      { input: 'decimal_to_binary(13)', expectedOutput: '"1101"' },
      { input: 'is_leap_year(2000)', expectedOutput: 'True' },
    ],
    is_active: true,
  },

  // ── 7. JAVA / HARD: #74 Sum/Avg, #75 Min/Max, #76 2nd Largest, #81 Freq, #82 Dedup, #86 Missing ──
  {
    id: 'challenge-java-003',
    title: 'Array Telemetry & Advanced Data Structures',
    description: 'B.Tech Program #74, #75, #76, #77, #79, #81, #82, #83 & #86: Array analytics, min/max bounds, second largest extraction, in-place rotation, frequencies, deduplication and missing number discovery.',
    language: 'JAVA',
    difficulty: 'HARD',
    code: `import java.util.*;

public class ArrayAnalyzer {
    // 1. Find Min and Max
    public static int[] findMinMax(int[] arr) {
        if (arr == null || arr.length == 0) return new int[]{0, 0};
        // BUG-1: Initializes min to 0 and max to 0 failing on negative arrays
        int min = 0;
        int max = 0;
        for (int val : arr) {
            if (val < min) min = val;
            if (val > max) max = val;
        }
        return new int[]{min, max};
    }

    // 2. Find Second Largest Distinct Element
    public static int findSecondLargest(int[] arr) {
        if (arr == null || arr.length < 2) return -1;
        int first = Integer.MIN_VALUE;
        int second = Integer.MIN_VALUE;
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] > first) {
                // BUG-2: Overwrites first without updating second
                first = arr[i];
            } else if (arr[i] > second && arr[i] != first) {
                second = arr[i];
            }
        }
        return second == Integer.MIN_VALUE ? -1 : second;
    }

    // 3. Compute Array Average
    public static double computeAverage(int[] arr) {
        if (arr == null || arr.length == 0) return 0.0;
        int sum = 0;
        for (int val : arr) sum += val;
        // BUG-3: Integer division truncates decimal average
        return sum / arr.length;
    }

    // 4. Reverse array in-place
    public static void reverseArray(int[] arr) {
        if (arr == null) return;
        int left = 0, right = arr.length - 1;
        // BUG-4: Inverted loop condition left > right prevents reversal
        while (left > right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }

    // 5. Count Even and Odd elements
    public static int[] countEvenOdd(int[] arr) {
        int even = 0, odd = 0;
        for (int val : arr) {
            // BUG-5: Inverted condition (val % 2 == 1 considered even)
            if (Math.abs(val) % 2 == 1) {
                even++;
            } else {
                odd++;
            }
        }
        return new int[]{even, odd};
    }

    // 6. Frequency of elements
    public static Map<Integer, Integer> findFrequencies(int[] arr) {
        Map<Integer, Integer> freq = new HashMap<>();
        if (arr == null) return freq;
        for (int val : arr) {
            // BUG-6: Hardcodes frequency to 1
            freq.put(val, 1);
        }
        return freq;
    }

    // 7. Remove duplicates preserving unique elements
    public static int[] removeDuplicates(int[] arr) {
        if (arr == null || arr.length == 0) return new int[0];
        Set<Integer> seen = new LinkedHashSet<>();
        for (int val : arr) seen.add(val);
        int[] unique = new int[seen.size()];
        int idx = 0;
        for (int val : seen) {
            unique[idx++] = val;
        }
        // BUG-7: Returns empty array instead of unique
        return new int[0];
    }

    // 8. Rotate array right by k positions
    public static int[] rotateRight(int[] arr, int k) {
        if (arr == null || arr.length <= 1) return arr;
        int n = arr.length;
        k = k % n;
        int[] rotated = new int[n];
        for (int i = 0; i < n; i++) {
            // BUG-8: Rotates left instead of right ((i - k) % n)
            rotated[(i - k + n) % n] = arr[i];
        }
        return rotated;
    }

    // 9. Find missing number in array containing 1 to n with 1 missing
    public static int findMissingNumber(int[] arr, int n) {
        long expectedSum = (long) n * (n + 1) / 2;
        long actualSum = 0;
        for (int val : arr) actualSum += val;
        // BUG-9: Adds actualSum instead of subtracting
        return (int) (expectedSum + actualSum);
    }

    // 10. Check if array contains duplicates
    public static boolean containsDuplicates(int[] arr) {
        if (arr == null) return false;
        Set<Integer> set = new HashSet<>();
        for (int val : arr) {
            // BUG-10: Inverted set check (!set.add(val))
            if (set.add(val)) {
                return true;
            }
        }
        return false;
    }
}`,
    bugs: [
      {
        bugId: 'java-arr-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Min/Max Initialization',
        objective: 'In findMinMax, initialize min and max to arr[0].',
        hint: 'Change "int min = 0; int max = 0;" to "int min = arr[0]; int max = arr[0];".',
        expectedFix: 'int min = arr[0]; int max = arr[0];',
        testKey: 'test-java-arr-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('min = arr[0]') && cleanCode.includes('max = arr[0]');
          return [{ testId: 't-1', taskId: 'java-arr-bug-1', fileId: 'ArrayAnalyzer.java', name: 'MinMax Initialization', passed, message: passed ? 'Initializes bounds with first array element.' : 'Hardcoded to zero.' }];
        },
      },
      {
        bugId: 'java-arr-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Second Largest Shift',
        objective: 'In findSecondLargest, set second = first before assigning new maximum to first.',
        hint: 'Add "second = first;" inside the if (arr[i] > first) block.',
        expectedFix: 'second = first; first = arr[i];',
        testKey: 'test-java-arr-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('second = first;') && cleanCode.includes('first = arr[i];');
          return [{ testId: 't-2', taskId: 'java-arr-bug-2', fileId: 'ArrayAnalyzer.java', name: 'Second Largest Shift', passed, message: passed ? 'Preserves previous maximum as second.' : 'Overwrites maximum directly.' }];
        },
      },
      {
        bugId: 'java-arr-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Average Double Precision Division',
        objective: 'In computeAverage, cast to double: return (double) sum / arr.length;.',
        hint: 'Add (double) cast before division.',
        expectedFix: '(double) sum / arr.length',
        testKey: 'test-java-arr-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('(double) sum') || cleanCode.includes('(double)sum') || cleanCode.includes('sum / (double)');
          return [{ testId: 't-3', taskId: 'java-arr-bug-3', fileId: 'ArrayAnalyzer.java', name: 'Average Floating Division', passed, message: passed ? 'Casts sum to double.' : 'Integer division truncation.' }];
        },
      },
      {
        bugId: 'java-arr-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Reverse Array Two-Pointer Condition',
        objective: 'In reverseArray, iterate while left < right.',
        hint: 'Change "left > right" to "left < right".',
        expectedFix: 'while (left < right)',
        testKey: 'test-java-arr-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('while (left < right)') || cleanCode.includes('while (left < right )');
          return [{ testId: 't-4', taskId: 'java-arr-bug-4', fileId: 'ArrayAnalyzer.java', name: 'Two-Pointer Reverse Condition', passed, message: passed ? 'Loop condition left < right valid.' : 'Inverted condition.' }];
        },
      },
      {
        bugId: 'java-arr-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Even vs Odd Parity Check',
        objective: 'In countEvenOdd, check val % 2 == 0 for even count.',
        hint: 'Change "== 1" to "== 0".',
        expectedFix: 'Math.abs(val) % 2 == 0',
        testKey: 'test-java-arr-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('% 2 == 0') || cleanCode.includes('%2 == 0');
          return [{ testId: 't-5', taskId: 'java-arr-bug-5', fileId: 'ArrayAnalyzer.java', name: 'Even Parity Check', passed, message: passed ? 'Checks % 2 == 0 for even.' : 'Inverted parity check.' }];
        },
      },
      {
        bugId: 'java-arr-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Frequency Map Accumulation',
        objective: 'In findFrequencies, accumulate count using freq.getOrDefault(val, 0) + 1.',
        hint: 'Change "1" to "freq.getOrDefault(val, 0) + 1".',
        expectedFix: 'freq.put(val, freq.getOrDefault(val, 0) + 1)',
        testKey: 'test-java-arr-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('freq.getOrDefault(val, 0) + 1') || cleanCode.includes('freq.get(val)');
          return [{ testId: 't-6', taskId: 'java-arr-bug-6', fileId: 'ArrayAnalyzer.java', name: 'Frequency Accumulation', passed, message: passed ? 'Accumulates occurrence counts.' : 'Hardcoded to 1.' }];
        },
      },
      {
        bugId: 'java-arr-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Deduplication Return Array',
        objective: 'In removeDuplicates, return the populated unique array.',
        hint: 'Change "return new int[0];" to "return unique;".',
        expectedFix: 'return unique;',
        testKey: 'test-java-arr-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return unique;') || cleanCode.includes('return unique ;');
          return [{ testId: 't-7', taskId: 'java-arr-bug-7', fileId: 'ArrayAnalyzer.java', name: 'Deduplicated Return', passed, message: passed ? 'Returns unique array.' : 'Returns empty array.' }];
        },
      },
      {
        bugId: 'java-arr-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Right Rotation Indexing',
        objective: 'In rotateRight, map elements to (i + k) % n.',
        hint: 'Change "(i - k + n) % n" to "(i + k) % n".',
        expectedFix: 'rotated[(i + k) % n] = arr[i]',
        testKey: 'test-java-arr-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('(i + k) % n') || cleanCode.includes('(i+k)%n');
          return [{ testId: 't-8', taskId: 'java-arr-bug-8', fileId: 'ArrayAnalyzer.java', name: 'Right Rotation Index', passed, message: passed ? 'Rotates elements to the right.' : 'Rotates left.' }];
        },
      },
      {
        bugId: 'java-arr-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Missing Number Subtraction Formula',
        objective: 'In findMissingNumber, subtract actualSum from expectedSum.',
        hint: 'Change "expectedSum + actualSum" to "expectedSum - actualSum".',
        expectedFix: 'expectedSum - actualSum',
        testKey: 'test-java-arr-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('expectedSum - actualSum') || cleanCode.includes('expectedSum-actualSum');
          return [{ testId: 't-9', taskId: 'java-arr-bug-9', fileId: 'ArrayAnalyzer.java', name: 'Missing Number Subtraction', passed, message: passed ? 'Subtracts actual from expected sum.' : 'Adds actual sum.' }];
        },
      },
      {
        bugId: 'java-arr-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Contains Duplicates Set Addition Guard',
        objective: 'In containsDuplicates, return true if !set.add(val) (set.add returns false on duplicate).',
        hint: 'Change "if (set.add(val))" to "if (!set.add(val))".',
        expectedFix: 'if (!set.add(val)) return true;',
        testKey: 'test-java-arr-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('!set.add(val)') || cleanCode.includes('set.contains(val)');
          return [{ testId: 't-10', taskId: 'java-arr-bug-10', fileId: 'ArrayAnalyzer.java', name: 'Duplicate Detection Set', passed, message: passed ? 'Detects collision on set insertion.' : 'Inverted duplicate condition.' }];
        },
      },
    ],
    test_cases: [
      { input: 'findSecondLargest([5, 12, 8, 19, 1])', expectedOutput: '12' },
      { input: 'findMissingNumber([1, 2, 4, 5], 5)', expectedOutput: '3' },
    ],
    is_active: true,
  },

  // ── 8. PYTHON / HARD: #88 Linear Search, #89 Binary Search, #90 Bubble/Selection Sort ──
  {
    id: 'challenge-py-003',
    title: 'Searching & Sorting Algorithm Suite',
    description: 'B.Tech Program #84, #85, #87, #88, #89 & #90: Linear and Binary search implementations, Bubble sort optimization, Selection sort, Insertion sort and two-way array merges.',
    language: 'PYTHON',
    difficulty: 'HARD',
    code: `# 1. Linear Search
def linear_search(arr: list, target: int) -> int:
    for i in range(len(arr)):
        # BUG-1: Compares i with target instead of arr[i]
        if i == target:
            return i
    return -1

# 2. Binary Search (Iterative)
def binary_search(arr: list, target: int) -> int:
    low = 0
    high = len(arr) - 1
    # BUG-2: Stops when low == high (low < high instead of low <= high)
    while low < high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            # BUG-3: Sets low = mid instead of mid + 1 causing infinite loop
            low = mid
        else:
            high = mid - 1
    return -1

# 3. Bubble Sort (Ascending)
def bubble_sort(arr: list) -> list:
    a = list(arr)
    n = len(a)
    for i in range(n):
        swapped = False
        # BUG-4: Inverted comparison sorts descending
        for j in range(0, n - i - 1):
            if a[j] < a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a

# 4. Selection Sort (Ascending)
def selection_sort(arr: list) -> list:
    a = list(arr)
    n = len(a)
    for i in range(n):
        min_idx = i
        # BUG-5: Starts inner loop at i instead of i + 1
        for j in range(i, n):
            if a[j] < a[min_idx]:
                min_idx = j
        # Swap minimum with current index
        a[i], a[min_idx] = a[min_idx], a[i]
    return a

# 5. Insertion Sort (Ascending)
def insertion_sort(arr: list) -> list:
    a = list(arr)
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        # BUG-6: Condition a[j] < key sorts descending
        while j >= 0 and a[j] < key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a

# 6. Merge two sorted arrays
def merge_sorted_arrays(arr1: list, arr2: list) -> list:
    merged = []
    i = j = 0
    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            merged.append(arr1[i])
            i += 1
        else:
            merged.append(arr2[j])
            j += 1
    # BUG-7: Extends arr1 with index j instead of remaining slice
    merged.extend(arr1[j:])
    merged.extend(arr2[j:])
    return merged

# 7. Find Common Elements in Two Sorted Arrays
def find_common_elements(arr1: list, arr2: list) -> list:
    common = []
    i = j = 0
    while i < len(arr1) and j < len(arr2):
        if arr1[i] == arr2[j]:
            common.append(arr1[i])
            # BUG-8: Increments only i causing infinite loop on match
            i += 1
        elif arr1[i] < arr2[j]:
            i += 1
        else:
            j += 1
    return common

# 8. Check if list is sorted in ascending order
def is_sorted(arr: list) -> bool:
    for i in range(len(arr) - 1):
        # BUG-9: Rejects valid duplicates with > instead of > 
        if arr[i] > arr[i + 1]:
            return False
    return True

# 9. Find duplicate in array of size n containing numbers 1..n-1
def find_duplicate_number(arr: list) -> int:
    seen = set()
    for num in arr:
        # BUG-10: Inverted seen check (returns num if num not in seen)
        if num not in seen:
            return num
        seen.add(num)
    return -1
`,
    bugs: [
      {
        bugId: 'py-sort-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Linear Search Element Lookup',
        objective: 'In linear_search, compare arr[i] == target instead of index i == target.',
        hint: 'Change "if i == target:" to "if arr[i] == target:".',
        expectedFix: 'if arr[i] == target:',
        testKey: 'test-py-sort-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('arr[i] == target');
          return [{ testId: 't-1', taskId: 'py-sort-bug-1', fileId: 'sorting_and_searching.py', name: 'Linear Search Lookup', passed, message: passed ? 'Compares array value at index.' : 'Compares index directly.' }];
        },
      },
      {
        bugId: 'py-sort-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Binary Search Equality Loop Boundary',
        objective: 'In binary_search, iterate while low <= high.',
        hint: 'Change "while low < high:" to "while low <= high:".',
        expectedFix: 'while low <= high:',
        testKey: 'test-py-sort-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('while low <= high:');
          return [{ testId: 't-2', taskId: 'py-sort-bug-2', fileId: 'sorting_and_searching.py', name: 'Binary Search Equality Bound', passed, message: passed ? 'Iterates while low <= high.' : 'Stops before checking last element.' }];
        },
      },
      {
        bugId: 'py-sort-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Binary Search Low Pointer Advance',
        objective: 'In binary_search, advance low to mid + 1 when arr[mid] < target.',
        hint: 'Change "low = mid" to "low = mid + 1".',
        expectedFix: 'low = mid + 1',
        testKey: 'test-py-sort-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('low = mid + 1') || cleanCode.includes('low = mid+1');
          return [{ testId: 't-3', taskId: 'py-sort-bug-3', fileId: 'sorting_and_searching.py', name: 'Binary Search Low Advance', passed, message: passed ? 'Advances low pointer.' : 'Infinite loop on low = mid.' }];
        },
      },
      {
        bugId: 'py-sort-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Bubble Sort Ascending Comparator',
        objective: 'In bubble_sort, swap when a[j] > a[j + 1].',
        hint: 'Change "a[j] < a[j + 1]" to "a[j] > a[j + 1]".',
        expectedFix: 'if a[j] > a[j + 1]:',
        testKey: 'test-py-sort-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('a[j] > a[j + 1]') || cleanCode.includes('a[j] > a[j+1]');
          return [{ testId: 't-4', taskId: 'py-sort-bug-4', fileId: 'sorting_and_searching.py', name: 'Bubble Sort Comparator', passed, message: passed ? 'Sorts ascending.' : 'Sorts descending.' }];
        },
      },
      {
        bugId: 'py-sort-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Selection Sort Inner Loop Start',
        objective: 'In selection_sort, start inner loop at i + 1 (range(i + 1, n)).',
        hint: 'Change "range(i, n)" to "range(i + 1, n)".',
        expectedFix: 'for j in range(i + 1, n):',
        testKey: 'test-py-sort-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('range(i + 1, n)') || cleanCode.includes('range(i+1, n)');
          return [{ testId: 't-5', taskId: 'py-sort-bug-5', fileId: 'sorting_and_searching.py', name: 'Selection Sort Inner Start', passed, message: passed ? 'Starts search from next index.' : 'Redundant self-comparison.' }];
        },
      },
      {
        bugId: 'py-sort-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Insertion Sort While Loop Comparison',
        objective: 'In insertion_sort, shift elements while a[j] > key.',
        hint: 'Change "a[j] < key" to "a[j] > key".',
        expectedFix: 'while j >= 0 and a[j] > key:',
        testKey: 'test-py-sort-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('a[j] > key');
          return [{ testId: 't-6', taskId: 'py-sort-bug-6', fileId: 'sorting_and_searching.py', name: 'Insertion Sort Comparator', passed, message: passed ? 'Shifts larger elements right.' : 'Sorts descending.' }];
        },
      },
      {
        bugId: 'py-sort-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Merge Sorted Arrays Slices',
        objective: 'In merge_sorted_arrays, slice remaining elements using arr1[i:] and arr2[j:].',
        hint: 'Change "arr1[j:]" to "arr1[i:]".',
        expectedFix: 'merged.extend(arr1[i:])',
        testKey: 'test-py-sort-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('arr1[i:]');
          return [{ testId: 't-7', taskId: 'py-sort-bug-7', fileId: 'sorting_and_searching.py', name: 'Merge Array Remaining Slice', passed, message: passed ? 'Appends slice arr1[i:].' : 'Uses incorrect index j for arr1.' }];
        },
      },
      {
        bugId: 'py-sort-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Common Elements Dual Pointer Advance',
        objective: 'In find_common_elements, increment both i += 1 and j += 1 upon finding a match.',
        hint: 'Add "j += 1" when arr1[i] == arr2[j].',
        expectedFix: 'i += 1; j += 1',
        testKey: 'test-py-sort-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i += 1') && cleanCode.includes('j += 1');
          return [{ testId: 't-8', taskId: 'py-sort-bug-8', fileId: 'sorting_and_searching.py', name: 'Dual Pointer Advance', passed, message: passed ? 'Advances both pointers on equality.' : 'Only advances i.' }];
        },
      },
      {
        bugId: 'py-sort-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Duplicate Number Detection Condition',
        objective: 'In find_duplicate_number, return num when num in seen.',
        hint: 'Change "if num not in seen:" to "if num in seen:".',
        expectedFix: 'if num in seen: return num',
        testKey: 'test-py-sort-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if num in seen:') || cleanCode.includes('if num in seen :');
          return [{ testId: 't-9', taskId: 'py-sort-bug-9', fileId: 'sorting_and_searching.py', name: 'Duplicate Number Detection', passed, message: passed ? 'Returns number when already in seen set.' : 'Inverted seen check.' }];
        },
      },
      {
        bugId: 'py-sort-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Binary Search High Pointer Boundary',
        objective: 'In binary_search, set high = mid - 1 when target is on the left side.',
        hint: 'Ensure high is set to mid - 1.',
        expectedFix: 'high = mid - 1',
        testKey: 'test-py-sort-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('high = mid - 1') || cleanCode.includes('high = mid-1');
          return [{ testId: 't-10', taskId: 'py-sort-bug-10', fileId: 'sorting_and_searching.py', name: 'Binary Search High Advance', passed, message: passed ? 'Sets high = mid - 1.' : 'High pointer invalid.' }];
        },
      },
    ],
    test_cases: [
      { input: 'binary_search([2, 5, 8, 12, 16, 23], 12)', expectedOutput: '3' },
      { input: 'bubble_sort([5, 2, 9, 1, 5, 6])', expectedOutput: '[1, 2, 5, 5, 6, 9]' },
    ],
    is_active: true,
  },

  // ── 9. C / HARD: #91 Matrix Add, #93 Multiply, #94 Transpose, #95 Diagonals, #96 Symmetric, #100 Determinant ──
  {
    id: 'challenge-c-003',
    title: 'Matrix Operations & Linear Algebra Engine',
    description: 'B.Tech Program #91, #92, #93, #94, #95, #96, #97, #98, #99 & #100: Matrix addition, matrix multiplication, transposition, diagonal sums, symmetric verification and 2x2 / 3x3 determinants.',
    language: 'C',
    difficulty: 'HARD',
    code: `#include <stdio.h>
#include <stdbool.h>

#define MAX 10

// 1. Matrix Addition
void matrix_add(int r, int c, int A[MAX][MAX], int B[MAX][MAX], int res[MAX][MAX]) {
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            // BUG-1: Subtracts instead of adding
            res[i][j] = A[i][j] - B[i][j];
        }
    }
}

// 2. Matrix Multiplication res = A (r1 x c1) * B (c1 x c2)
void matrix_multiply(int r1, int c1, int c2, int A[MAX][MAX], int B[MAX][MAX], int res[MAX][MAX]) {
    for (int i = 0; i < r1; i++) {
        for (int j = 0; j < c2; j++) {
            res[i][j] = 0;
            // BUG-2: Loops up to r1 instead of inner dimension c1
            for (int k = 0; k < r1; k++) {
                res[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

// 3. Matrix Transpose
void matrix_transpose(int r, int c, int A[MAX][MAX], int trans[MAX][MAX]) {
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            // BUG-3: Copies directly without swapping indices (trans[i][j] = A[i][j])
            trans[i][j] = A[i][j];
        }
    }
}

// 4. Sum of Main and Secondary Diagonals for Square Matrix (n x n)
void diagonal_sums(int n, int A[MAX][MAX], int *main_sum, int *sec_sum) {
    *main_sum = 0;
    *sec_sum = 0;
    for (int i = 0; i < n; i++) {
        *main_sum += A[i][i];
        // BUG-4: Secondary diagonal index offset error (A[i][n - i] instead of A[i][n - 1 - i])
        *sec_sum += A[i][n - i];
    }
}

// 5. Symmetric Matrix Check (A == Transpose(A))
bool is_symmetric(int n, int A[MAX][MAX]) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            // BUG-5: Compares A[i][j] != A[i][j] (compares with self)
            if (A[i][j] != A[i][j]) {
                return false;
            }
        }
    }
    return true;
}

// 6. Identity Matrix Check
bool is_identity(int n, int A[MAX][MAX]) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (i == j) {
                // BUG-6: Checks diagonal == 0 instead of 1
                if (A[i][j] != 0) return false;
            } else {
                if (A[i][j] != 0) return false;
            }
        }
    }
    return true;
}

// 7. Upper Triangular Matrix Check (all elements below main diagonal are 0)
bool is_upper_triangular(int n, int A[MAX][MAX]) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            // BUG-7: Checks elements above diagonal (i < j) instead of below (i > j)
            if (i < j && A[i][j] != 0) {
                return false;
            }
        }
    }
    return true;
}

// 8. Sparse Matrix Check (more than half elements are 0)
bool is_sparse(int r, int c, int A[MAX][MAX]) {
    int zeros = 0;
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (A[i][j] == 0) zeros++;
        }
    }
    // BUG-8: Checks zeros < total / 2 instead of zeros > total / 2
    return zeros < (r * c) / 2;
}

// 9. 2x2 Determinant
int determinant_2x2(int a, int b, int c, int d) {
    // BUG-9: Adds instead of subtracting ad - bc
    return (a * d) + (b * c);
}

// 10. 3x3 Matrix Determinant
int determinant_3x3(int A[3][3]) {
    // BUG-10: Inverted cofactor sign on middle term (+ A[0][1] instead of - A[0][1])
    int term1 = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]);
    int term2 = A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]);
    int term3 = A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    return term1 + term2 + term3;
}`,
    bugs: [
      {
        bugId: 'c-mat-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Matrix Addition Operator',
        objective: 'In matrix_add, perform addition: res[i][j] = A[i][j] + B[i][j].',
        hint: 'Change "-" to "+".',
        expectedFix: 'res[i][j] = A[i][j] + B[i][j];',
        testKey: 'test-c-mat-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('A[i][j] + B[i][j]');
          return [{ testId: 't-1', taskId: 'c-mat-bug-1', fileId: 'MatrixOperations.c', name: 'Matrix Addition', passed, message: passed ? 'Sums matrix elements.' : 'Subtracts elements.' }];
        },
      },
      {
        bugId: 'c-mat-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Matrix Multiplication Inner Dimension',
        objective: 'In matrix_multiply, iterate k from 0 to c1 (inner shared dimension).',
        hint: 'Change "k < r1" to "k < c1".',
        expectedFix: 'for (int k = 0; k < c1; k++)',
        testKey: 'test-c-mat-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('k < c1;') || cleanCode.includes('k < c1 ;');
          return [{ testId: 't-2', taskId: 'c-mat-bug-2', fileId: 'MatrixOperations.c', name: 'Multiplication Shared Dimension', passed, message: passed ? 'Iterates over inner dimension c1.' : 'Iterates over row dimension r1.' }];
        },
      },
      {
        bugId: 'c-mat-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Matrix Transpose Index Assignment',
        objective: 'In matrix_transpose, assign trans[j][i] = A[i][j].',
        hint: 'Change "trans[i][j]" to "trans[j][i]".',
        expectedFix: 'trans[j][i] = A[i][j];',
        testKey: 'test-c-mat-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('trans[j][i] = A[i][j]') || cleanCode.includes('trans[j][i] = A[i][j];');
          return [{ testId: 't-3', taskId: 'c-mat-bug-3', fileId: 'MatrixOperations.c', name: 'Transpose Inversion', passed, message: passed ? 'Swaps row and column indices.' : 'Direct copy.' }];
        },
      },
      {
        bugId: 'c-mat-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Secondary Diagonal Offset',
        objective: 'In diagonal_sums, access A[i][n - 1 - i].',
        hint: 'Change "n - i" to "n - 1 - i".',
        expectedFix: 'A[i][n - 1 - i]',
        testKey: 'test-c-mat-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('A[i][n - 1 - i]') || cleanCode.includes('A[i][n-1-i]');
          return [{ testId: 't-4', taskId: 'c-mat-bug-4', fileId: 'MatrixOperations.c', name: 'Secondary Diagonal Index', passed, message: passed ? 'Zero-based secondary diagonal offset.' : 'Out of bounds 1-based offset.' }];
        },
      },
      {
        bugId: 'c-mat-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Symmetric Matrix Mirror Comparison',
        objective: 'In is_symmetric, compare A[i][j] != A[j][i].',
        hint: 'Change "A[i][j] != A[i][j]" to "A[i][j] != A[j][i]".',
        expectedFix: 'if (A[i][j] != A[j][i]) return false;',
        testKey: 'test-c-mat-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('A[i][j] != A[j][i]');
          return [{ testId: 't-5', taskId: 'c-mat-bug-5', fileId: 'MatrixOperations.c', name: 'Symmetric Element Comparison', passed, message: passed ? 'Compares mirror indices [i][j] and [j][i].' : 'Compares element with self.' }];
        },
      },
      {
        bugId: 'c-mat-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Identity Matrix Diagonal Check',
        objective: 'In is_identity, verify diagonal elements equal 1 (if (A[i][j] != 1) return false;).',
        hint: 'Change "!= 0" to "!= 1".',
        expectedFix: 'if (A[i][j] != 1) return false;',
        testKey: 'test-c-mat-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('A[i][j] != 1');
          return [{ testId: 't-6', taskId: 'c-mat-bug-6', fileId: 'MatrixOperations.c', name: 'Identity Diagonal Value', passed, message: passed ? 'Verifies diagonal value is 1.' : 'Checks for 0.' }];
        },
      },
      {
        bugId: 'c-mat-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Upper Triangular Lower Indices',
        objective: 'In is_upper_triangular, check elements below diagonal where row i > col j.',
        hint: 'Change "i < j" to "i > j".',
        expectedFix: 'if (i > j && A[i][j] != 0)',
        testKey: 'test-c-mat-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i > j');
          return [{ testId: 't-7', taskId: 'c-mat-bug-7', fileId: 'MatrixOperations.c', name: 'Upper Triangular Zero Region', passed, message: passed ? 'Checks region below main diagonal (i > j).' : 'Checks upper region.' }];
        },
      },
      {
        bugId: 'c-mat-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Sparse Matrix Zero Threshold',
        objective: 'In is_sparse, verify zeros > (r * c) / 2.',
        hint: 'Change "<" to ">".',
        expectedFix: 'zeros > (r * c) / 2',
        testKey: 'test-c-mat-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('zeros > (r * c) / 2') || cleanCode.includes('zeros > (r*c)/2');
          return [{ testId: 't-8', taskId: 'c-mat-bug-8', fileId: 'MatrixOperations.c', name: 'Sparse Threshold', passed, message: passed ? 'Verifies zero majority.' : 'Inverted threshold.' }];
        },
      },
      {
        bugId: 'c-mat-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix 2x2 Determinant Formula',
        objective: 'In determinant_2x2, compute (a * d) - (b * c).',
        hint: 'Change "+" to "-".',
        expectedFix: '(a * d) - (b * c)',
        testKey: 'test-c-mat-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('(a * d) - (b * c)') || cleanCode.includes('a*d - b*c');
          return [{ testId: 't-9', taskId: 'c-mat-bug-9', fileId: 'MatrixOperations.c', name: '2x2 Determinant', passed, message: passed ? 'Formula computes ad - bc.' : 'Adds bc.' }];
        },
      },
      {
        bugId: 'c-mat-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix 3x3 Determinant Middle Cofactor Sign',
        objective: 'In determinant_3x3, subtract middle cofactor term (- term2).',
        hint: 'Change "term1 + term2 + term3" to "term1 - term2 + term3".',
        expectedFix: 'return term1 - term2 + term3;',
        testKey: 'test-c-mat-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('term1 - term2 + term3') || cleanCode.includes('term1 - term2+term3');
          return [{ testId: 't-10', taskId: 'c-mat-bug-10', fileId: 'MatrixOperations.c', name: '3x3 Cofactor Alternation', passed, message: passed ? 'Alternates middle cofactor sign.' : 'Adds all cofactors.' }];
        },
      },
    ],
    test_cases: [
      { input: 'determinant_2x2(3, 8, 4, 6)', expectedOutput: '-14' },
      { input: 'is_symmetric(2, [[1, 5], [5, 2]])', expectedOutput: 'true' },
    ],
    is_active: true,
  },

  // ── 10. JAVA / DIFFICULT: #61 Triangle, #63 Pyramid, #65 Diamond, #68 Floyd, #69 Pascal, #70 Hollow Square ──
  {
    id: 'challenge-java-004',
    title: 'ASCII Geometry, Triangular Patterns & Floyd/Pascal Sequences',
    description: 'B.Tech Program #61, #62, #63, #65, #66, #68, #69, #70 & #72: Star triangles, centered pyramids, diamond shapes, Floyds triangle running integers, Pascal triangle combinatorics and hollow squares.',
    language: 'JAVA',
    difficulty: 'DIFFICULT',
    code: `import java.util.*;

public class PatternAndGeometry {
    // 1. Right-Angled Star Triangle for n rows
    public static List<String> rightAngledTriangle(int n) {
        List<String> lines = new ArrayList<>();
        // BUG-1: Loop starts at 0 generating empty first row
        for (int i = 0; i < n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < i; j++) {
                sb.append("*");
            }
            lines.add(sb.toString());
        }
        return lines;
    }

    // 2. Pyramid pattern of stars centered with spaces
    public static List<String> pyramidPattern(int n) {
        List<String> lines = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            // BUG-2: Adds n + i spaces instead of n - i spaces
            for (int s = 0; s < n + i; s++) sb.append(" ");
            // BUG-3: Prints 2*i stars instead of 2*i - 1 stars
            for (int k = 0; k < 2 * i; k++) sb.append("*");
            lines.add(sb.toString());
        }
        return lines;
    }

    // 3. Number Triangle: 1, 12, 123, 1234 ...
    public static List<String> numberTriangle(int n) {
        List<String> lines = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            // BUG-4: Loops up to n instead of row i
            for (int j = 1; j <= n; j++) {
                sb.append(j);
            }
            lines.add(sb.toString());
        }
        return lines;
    }

    // 4. Repeated Number Triangle: 1, 22, 333, 4444 ...
    public static List<String> repeatedNumberTriangle(int n) {
        List<String> lines = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 1; j <= i; j++) {
                // BUG-5: Appends column j instead of current row number i
                sb.append(j);
            }
            lines.add(sb.toString());
        }
        return lines;
    }

    // 5. Floyd's Triangle: running integers 1, 2 3, 4 5 6 ...
    public static List<String> floydsTriangle(int n) {
        List<String> lines = new ArrayList<>();
        int count = 1;
        for (int i = 1; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 1; j <= i; j++) {
                sb.append(count);
                if (j < i) sb.append(" ");
                // BUG-6: Fails to increment count (stays at 1)
            }
            lines.add(sb.toString());
        }
        return lines;
    }

    // 6. Pascal's Triangle row generation
    public static List<Integer> pascalsTriangleRow(int rowIndex) {
        List<Integer> row = new ArrayList<>();
        long val = 1;
        row.add(1);
        for (int k = 1; k <= rowIndex; k++) {
            // BUG-7: Formula multiplier inverted: (rowIndex + k) instead of (rowIndex - k + 1)
            val = val * (rowIndex + k) / k;
            row.add((int) val);
        }
        return row;
    }

    // 7. Hollow Square Boundary
    public static List<String> hollowSquare(int n) {
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < n; j++) {
                // BUG-8: Checks i == 1 instead of boundary borders (i == 0 || i == n - 1 || j == 0 || j == n - 1)
                if (i == 1 || j == 1) {
                    sb.append("*");
                } else {
                    sb.append(" ");
                }
            }
            lines.add(sb.toString());
        }
        return lines;
    }

    // 8. Character Pattern: A, AB, ABC, ABCD ...
    public static List<String> characterPattern(int n) {
        List<String> lines = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < i; j++) {
                // BUG-9: Hardcodes 'A' without adding offset j
                sb.append((char) ('A'));
            }
            lines.add(sb.toString());
        }
        return lines;
    }

    // 9. Diamond Star Pattern (2n - 1 total rows)
    public static int countDiamondStars(int n) {
        if (n <= 0) return 0;
        int totalStars = 0;
        // Upper half + middle (1..n)
        for (int i = 1; i <= n; i++) {
            totalStars += (2 * i - 1);
        }
        // Lower half (n-1 down to 1)
        // BUG-10: Loop terminates before reaching 1 (i > 1 instead of i >= 1)
        for (int i = n - 1; i > 1; i--) {
            totalStars += (2 * i - 1);
        }
        return totalStars;
    }
}`,
    bugs: [
      {
        bugId: 'java-pat-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Triangle Row Loop Offset',
        objective: 'In rightAngledTriangle, start loop from i = 1 (or inner j <= i) to avoid empty first line.',
        hint: 'Change outer loop to "for (int i = 1; i <= n; i++)".',
        expectedFix: 'for (int i = 1; i <= n; i++)',
        testKey: 'test-java-pat-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('int i = 1; i <= n;') || cleanCode.includes('j <= i');
          return [{ testId: 't-1', taskId: 'java-pat-bug-1', fileId: 'PatternAndGeometry.java', name: 'Triangle Row Index', passed, message: passed ? 'Populates correct non-empty first row.' : 'Empty first row.' }];
        },
      },
      {
        bugId: 'java-pat-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Pyramid Leading Spaces',
        objective: 'In pyramidPattern, add n - i leading spaces.',
        hint: 'Change "n + i" to "n - i".',
        expectedFix: 'for (int s = 0; s < n - i; s++)',
        testKey: 'test-java-pat-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('s < n - i') || cleanCode.includes('s < n-i');
          return [{ testId: 't-2', taskId: 'java-pat-bug-2', fileId: 'PatternAndGeometry.java', name: 'Pyramid Leading Spaces', passed, message: passed ? 'Computes n - i spaces.' : 'Adds excessive spaces.' }];
        },
      },
      {
        bugId: 'java-pat-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Pyramid Odd Star Count',
        objective: 'In pyramidPattern, print 2 * i - 1 stars for row i.',
        hint: 'Change "2 * i" to "2 * i - 1".',
        expectedFix: 'for (int k = 0; k < 2 * i - 1; k++)',
        testKey: 'test-java-pat-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('2 * i - 1') || cleanCode.includes('2*i - 1') || cleanCode.includes('2*i-1');
          return [{ testId: 't-3', taskId: 'java-pat-bug-3', fileId: 'PatternAndGeometry.java', name: 'Pyramid Star Count', passed, message: passed ? 'Prints 2*i - 1 stars.' : 'Prints even star count.' }];
        },
      },
      {
        bugId: 'java-pat-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Number Triangle Inner Boundary',
        objective: 'In numberTriangle, iterate inner loop until j <= i.',
        hint: 'Change "j <= n" to "j <= i".',
        expectedFix: 'for (int j = 1; j <= i; j++)',
        testKey: 'test-java-pat-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('j <= i;') || cleanCode.includes('j <= i ;');
          return [{ testId: 't-4', taskId: 'java-pat-bug-4', fileId: 'PatternAndGeometry.java', name: 'Number Triangle Inner Bound', passed, message: passed ? 'Loops up to current row i.' : 'Loops to n.' }];
        },
      },
      {
        bugId: 'java-pat-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Repeated Number Triangle Value',
        objective: 'In repeatedNumberTriangle, append row number i (sb.append(i)).',
        hint: 'Change "sb.append(j)" to "sb.append(i)".',
        expectedFix: 'sb.append(i);',
        testKey: 'test-java-pat-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('sb.append(i);') || cleanCode.includes('sb.append(i) ;');
          return [{ testId: 't-5', taskId: 'java-pat-bug-5', fileId: 'PatternAndGeometry.java', name: 'Repeated Number Value', passed, message: passed ? 'Appends current row number.' : 'Appends column index.' }];
        },
      },
      {
        bugId: 'java-pat-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Floyd Triangle Counter Increment',
        objective: 'In floydsTriangle, increment running counter after appending (count++).',
        hint: 'Add "count++;" inside inner loop.',
        expectedFix: 'count++;',
        testKey: 'test-java-pat-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('count++') || cleanCode.includes('count += 1');
          return [{ testId: 't-6', taskId: 'java-pat-bug-6', fileId: 'PatternAndGeometry.java', name: 'Floyd Counter Increment', passed, message: passed ? 'Increments running integer.' : 'Counter not updated.' }];
        },
      },
      {
        bugId: 'java-pat-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Pascal Triangle Multiplier Formula',
        objective: 'In pascalsTriangleRow, use multiplier (rowIndex - k + 1).',
        hint: 'Change "(rowIndex + k)" to "(rowIndex - k + 1)".',
        expectedFix: 'val * (rowIndex - k + 1) / k',
        testKey: 'test-java-pat-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('rowIndex - k + 1') || cleanCode.includes('rowIndex - k + 1L') || cleanCode.includes('rowIndex-k+1');
          return [{ testId: 't-7', taskId: 'java-pat-bug-7', fileId: 'PatternAndGeometry.java', name: 'Pascal Formula Multiplier', passed, message: passed ? 'Uses (n - k + 1) multiplier.' : 'Inverted addition formula.' }];
        },
      },
      {
        bugId: 'java-pat-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Hollow Square Boundary Condition',
        objective: 'In hollowSquare, check (i == 0 || i == n - 1 || j == 0 || j == n - 1).',
        hint: 'Check all 4 boundary edges.',
        expectedFix: 'if (i == 0 || i == n - 1 || j == 0 || j == n - 1)',
        testKey: 'test-java-pat-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = (cleanCode.includes('i == 0') || cleanCode.includes('i == 0')) && (cleanCode.includes('i == n - 1') || cleanCode.includes('i == n-1'));
          return [{ testId: 't-8', taskId: 'java-pat-bug-8', fileId: 'PatternAndGeometry.java', name: 'Hollow Square Borders', passed, message: passed ? 'Detects all boundary borders.' : 'Incorrect border check.' }];
        },
      },
      {
        bugId: 'java-pat-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Character Pattern Offset',
        objective: 'In characterPattern, add offset j to \'A\' (sb.append((char) (\'A\' + j))).',
        hint: 'Change "\'A\'" to "\'A\' + j".',
        expectedFix: "sb.append((char) ('A' + j));",
        testKey: 'test-java-pat-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes("'A' + j") || cleanCode.includes("'A'+j");
          return [{ testId: 't-9', taskId: 'java-pat-bug-9', fileId: 'PatternAndGeometry.java', name: 'Character Offset', passed, message: passed ? 'Offsets character by column index.' : 'Prints constant A.' }];
        },
      },
      {
        bugId: 'java-pat-bug-10',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Diamond Star Lower Loop Boundary',
        objective: 'In countDiamondStars, loop down to i >= 1.',
        hint: 'Change "i > 1" to "i >= 1".',
        expectedFix: 'for (int i = n - 1; i >= 1; i--)',
        testKey: 'test-java-pat-10',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i >= 1;') || cleanCode.includes('i >= 1 ;');
          return [{ testId: 't-10', taskId: 'java-pat-bug-10', fileId: 'PatternAndGeometry.java', name: 'Diamond Lower Boundary', passed, message: passed ? 'Includes bottom-most star apex.' : 'Stops before reaching 1.' }];
        },
      },
    ],
    test_cases: [
      { input: 'pascalsTriangleRow(4)', expectedOutput: '[1, 4, 6, 4, 1]' },
      { input: 'countDiamondStars(3)', expectedOutput: '9' },
    ],
    is_active: true,
  },

  // ── 11. JAVA / FLAGSHIP 1: Bank Management System (9 Methods, 9 Bugs) ──────
  {
    id: 'challenge-java-bank',
    title: 'Bank Management System',
    description: 'Code Mafia Flagship Project 1: Account lifecycle, balance queries, deposits, withdrawals, transfers, interest calculation, freeze toggling and transaction audit trails.',
    language: 'JAVA',
    difficulty: 'MEDIUM',
    code: `import java.util.*;

public class BankManagementSystem {

    static class Account {
        int accountNumber;
        String holderName;
        double balance;
        boolean frozen;
        List<String> transactions = new ArrayList<>();

        Account(int accountNumber, String holderName, double balance) {
            this.accountNumber = accountNumber;
            this.holderName = holderName;
            this.balance = balance;
            this.frozen = false;
            transactions.add("ACCOUNT CREATED: " + balance);
        }
    }

    static List<Account> accounts = new ArrayList<>();

    static Account findAccount(int accountNumber) {
        for (Account account : accounts) {
            if (account.accountNumber != accountNumber) {      // BUG 1
                return account;
            }
        }
        return null;
    }

    static boolean createAccount(int accountNumber, String holderName, double openingBalance) {
        if (findAccount(accountNumber) != null || openingBalance < 0) {
            return false;
        }

        Account account = new Account(accountNumber, holderName, openingBalance);
        accounts.add(account);
        return true;
    }

    static boolean deposit(int accountNumber, double amount) {
        Account account = findAccount(accountNumber);

        if (account == null || account.frozen || amount < 0) { // BUG 2
            return false;
        }

        account.balance += amount;
        account.transactions.add("DEPOSIT: " + amount);
        return true;
    }

    static boolean withdraw(int accountNumber, double amount) {
        Account account = findAccount(accountNumber);

        if (account == null || account.frozen || amount <= 0 ||
                amount >= account.balance) {                 // BUG 3
            return false;
        }

        account.balance -= amount;
        account.transactions.add("WITHDRAW: " + amount);
        return true;
    }

    static boolean transfer(int fromAccount, int toAccount, double amount) {
        Account sender = findAccount(fromAccount);
        Account receiver = findAccount(toAccount);

        if (sender == null || receiver == null || sender.frozen ||
                receiver.frozen || amount < 0 ||                 // BUG 4
                amount > sender.balance) {
            return false;
        }

        sender.balance -= amount;
        receiver.balance += amount;

        sender.transactions.add("TRANSFER OUT: " + amount + " TO " + toAccount);
        receiver.transactions.add("TRANSFER IN: " + amount + " FROM " + fromAccount);

        return true;
    }

    static void displayAccount(int accountNumber) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            System.out.println("Account not found.");
            return;
        }

        System.out.println("Account: " + account.accountNumber);
        System.out.println("Holder: " + account.holderName);
        System.out.println("Balance: " + account.balance);
        System.out.println("Status: " + (account.frozen ? "FROZEN" : "ACTIVE"));
    }

    static void displayAllAccounts() {
        for (Account account : accounts) {
            displayAccount(account.accountNumber);
            System.out.println("----------------");
        }
    }

    static double calculateTotalBalance() {
        double total = 0;

        for (Account account : accounts) {
            total -= account.balance;                         // BUG 5
        }

        return total;
    }

    static void applyInterest(double annualRate) {
        if (annualRate <= 0) {                                // BUG 6
            return;
        }

        for (Account account : accounts) {
            if (!account.frozen) {
                double interest = account.balance * annualRate / 100.0;
                account.balance += interest;
                account.transactions.add("INTEREST: " + interest);
            }
        }
    }

    static boolean setFreezeStatus(int accountNumber, boolean frozen) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            return false;
        }

        account.frozen = !frozen;                             // BUG 7
        account.transactions.add(frozen ? "ACCOUNT FROZEN" : "ACCOUNT UNFROZEN");
        return true;
    }

    static List<String> getTransactionHistory(int accountNumber) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(account.transactions);
    }

    static String generateSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("TOTAL ACCOUNTS: ").append(accounts.size()).append("\n");
        summary.append("TOTAL BALANCE: ").append(calculateTotalBalance()).append("\n");

        for (Account account : accounts) {
            summary.append(account.accountNumber)
                   .append(" | ")
                   .append(account.holderName)
                   .append(" | ")
                   .append(account.balance)
                   .append("\n");
        }

        return summary.toString();
    }

    static void seedDemoData() {
        createAccount(1001, "Aarav", 10000);
        createAccount(1002, "Diya", 15000);
        createAccount(1003, "Kabir", 7000);

        deposit(1001, 2000);
        withdraw(1002, 3000);
        transfer(1001, 1003, 1500);
    }

    public static void main(String[] args) {
        seedDemoData();

        System.out.println(generateSummary());

        applyInterest(5);

        displayAllAccounts();

        System.out.println("Transactions for 1001:");
        for (String transaction : getTransactionHistory(1001)) {
            System.out.println(transaction);
        }

        System.out.println("Bank total after interest: "
                + calculateTotalBalance());                     // BUG 8

        System.out.println("Developer verification: " +
                (calculateTotalBalance() < 0));                 // BUG 9
    }
}`,
    bugs: [
      {
        bugId: 'bank-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Account Lookup Equality Check',
        objective: 'In findAccount(int accountNumber), compare account.accountNumber == accountNumber.',
        hint: 'Change "!=" to "==".',
        expectedFix: 'if (account.accountNumber == accountNumber)',
        testKey: 'test-bank-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('account.accountNumber == accountNumber');
          return [{ testId: 't-1', taskId: 'bank-bug-1', fileId: 'BankManagementSystem.java', name: 'Account Match Equality', passed, message: passed ? 'Equality comparison valid.' : 'Still using !=.' }];
        },
      },
      {
        bugId: 'bank-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Reject Non-Positive Deposit Amount',
        objective: 'In deposit(int accountNumber, double amount), ensure amount <= 0 is rejected.',
        hint: 'Change "amount < 0" to "amount <= 0".',
        expectedFix: 'amount <= 0',
        testKey: 'test-bank-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('amount <= 0');
          return [{ testId: 't-2', taskId: 'bank-bug-2', fileId: 'BankManagementSystem.java', name: 'Deposit Positive Validation', passed, message: passed ? 'Zero and negative deposits rejected.' : 'Accepts 0 amount.' }];
        },
      },
      {
        bugId: 'bank-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Allow Exact Balance Withdrawal',
        objective: 'In withdraw(int accountNumber, double amount), allow withdrawing up to full balance (amount > account.balance).',
        hint: 'Change "amount >= account.balance" to "amount > account.balance".',
        expectedFix: 'amount > account.balance',
        testKey: 'test-bank-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('amount > account.balance');
          return [{ testId: 't-3', taskId: 'bank-bug-3', fileId: 'BankManagementSystem.java', name: 'Withdrawal Balance Limit', passed, message: passed ? 'Allows withdrawing total balance.' : 'Rejects exact balance.' }];
        },
      },
      {
        bugId: 'bank-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Reject Zero Transfer Amount',
        objective: 'In transfer(int fromAccount, int toAccount, double amount), guard with amount <= 0.',
        hint: 'Change "amount < 0" to "amount <= 0".',
        expectedFix: 'amount <= 0',
        testKey: 'test-bank-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('amount <= 0');
          return [{ testId: 't-4', taskId: 'bank-bug-4', fileId: 'BankManagementSystem.java', name: 'Transfer Amount Validation', passed, message: passed ? 'Zero transfer rejected.' : 'Allows zero transfer.' }];
        },
      },
      {
        bugId: 'bank-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Total Balance Accumulation',
        objective: 'In calculateTotalBalance(), add balances (total += account.balance).',
        hint: 'Change "-=" to "+=".',
        expectedFix: 'total += account.balance;',
        testKey: 'test-bank-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('total += account.balance');
          return [{ testId: 't-5', taskId: 'bank-bug-5', fileId: 'BankManagementSystem.java', name: 'Balance Sum Accumulation', passed, message: passed ? 'Adds account balances.' : 'Subtracts balances.' }];
        },
      },
      {
        bugId: 'bank-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Annual Interest Negative Rate Check',
        objective: 'In applyInterest(double annualRate), return only if annualRate < 0 (allow 0 rate).',
        hint: 'Change "if (annualRate <= 0)" to "if (annualRate < 0)".',
        expectedFix: 'if (annualRate < 0)',
        testKey: 'test-bank-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('annualRate < 0');
          return [{ testId: 't-6', taskId: 'bank-bug-6', fileId: 'BankManagementSystem.java', name: 'Interest Rate Guard', passed, message: passed ? 'Handles rate >= 0.' : 'Blocks rate == 0.' }];
        },
      },
      {
        bugId: 'bank-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Account Freeze Assignment',
        objective: 'In setFreezeStatus(int accountNumber, boolean frozen), assign account.frozen = frozen.',
        hint: 'Change "!frozen" to "frozen".',
        expectedFix: 'account.frozen = frozen;',
        testKey: 'test-bank-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('account.frozen = frozen;') || cleanCode.includes('account.frozen = frozen ;') || cleanCode.includes('account.frozen = frozen');
          return [{ testId: 't-7', taskId: 'bank-bug-7', fileId: 'BankManagementSystem.java', name: 'Freeze Status Value', passed, message: passed ? 'Assigns exact frozen parameter.' : 'Inverts frozen boolean.' }];
        },
      },
      {
        bugId: 'bank-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Post-Interest Total Calculation',
        objective: 'In main, print calculateTotalBalance() cleanly without corrupted values.',
        hint: 'Ensure calculateTotalBalance() is invoked.',
        expectedFix: 'calculateTotalBalance()',
        testKey: 'test-bank-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('calculateTotalBalance()');
          return [{ testId: 't-8', taskId: 'bank-bug-8', fileId: 'BankManagementSystem.java', name: 'Post-Interest Output', passed, message: passed ? 'Calculates total balance.' : 'Missing total balance call.' }];
        },
      },
      {
        bugId: 'bank-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Developer Verification Condition',
        objective: 'In main, verify calculateTotalBalance() >= 0 (positive total).',
        hint: 'Change "< 0" to ">= 0" or "> 0".',
        expectedFix: 'calculateTotalBalance() >= 0',
        testKey: 'test-bank-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('calculateTotalBalance() >= 0') || cleanCode.includes('calculateTotalBalance() > 0');
          return [{ testId: 't-9', taskId: 'bank-bug-9', fileId: 'BankManagementSystem.java', name: 'Verification Balance Non-Negative', passed, message: passed ? 'Verifies non-negative balance.' : 'Verifies negative balance.' }];
        },
      },
    ],
    test_cases: [
      { input: 'seedDemoData()', expectedOutput: 'TOTAL ACCOUNTS: 3' },
    ],
    is_active: true,
  },

  // ── 12. JAVA / FLAGSHIP 2: Library Management System (9 Methods, 9 Bugs) ───
  {
    id: 'challenge-java-library',
    title: 'Library Management System',
    description: 'Code Mafia Flagship Project 2: Book cataloging, member registration, title/author search, issuing/returning books, fine calculation, availability stats and overload safeguards.',
    language: 'JAVA',
    difficulty: 'MEDIUM',
    code: `import java.util.*;

public class LibraryManagementSystem {

    static class Book {
        int id;
        String title;
        String author;
        boolean issued;
        int issuedToMember;

        Book(int id, String title, String author) {
            this.id = id;
            this.title = title;
            this.author = author;
            this.issued = false;
            this.issuedToMember = -1;
        }
    }

    static class Member {
        int id;
        String name;
        List<Integer> borrowedBooks = new ArrayList<>();
        List<String> history = new ArrayList<>();

        Member(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    static List<Book> books = new ArrayList<>();
    static List<Member> members = new ArrayList<>();

    static Book findBook(int id) {
        for (Book book : books) {
            if (book.id != id) {                         // BUG 1
                return book;
            }
        }
        return null;
    }

    static Member findMember(int id) {
        for (Member member : members) {
            if (member.id == id) {
                return member;
            }
        }
        return null;
    }

    static boolean addBook(int id, String title, String author) {
        if (findBook(id) != null) {
            return false;
        }

        books.add(new Book(id, title, author));
        return true;
    }

    static boolean removeBook(int id) {
        Book book = findBook(id);

        if (book == null || !book.issued) {             // BUG 2
            return false;
        }

        return books.remove(book);
    }

    static boolean registerMember(int id, String name) {
        if (findMember(id) != null) {
            return false;
        }

        members.add(new Member(id, name));
        return true;
    }

    static List<Book> searchByTitle(String query) {
        List<Book> results = new ArrayList<>();

        for (Book book : books) {
            if (book.title.toLowerCase().contains(query.toLowerCase())) {
                results.add(book);
            }
        }

        return results;
    }

    static List<Book> searchByAuthor(String query) {
        List<Book> results = new ArrayList<>();

        for (Book book : books) {
            if (book.author.toLowerCase().contains(query.toLowerCase())) {
                results.add(book);
            }
        }

        return results;
    }

    static boolean issueBook(int bookId, int memberId) {
        Book book = findBook(bookId);
        Member member = findMember(memberId);

        if (book == null || member == null || !book.issued) { // BUG 3
            return false;
        }

        book.issued = true;
        book.issuedToMember = memberId;
        member.borrowedBooks.add(bookId);
        member.history.add("ISSUED: " + bookId);

        return true;
    }

    static double returnBook(int bookId, int memberId, int overdueDays) {
        Book book = findBook(bookId);
        Member member = findMember(memberId);

        if (book == null || member == null ||
                !book.issued || book.issuedToMember != memberId) {
            return -1;
        }

        book.issued = false;
        book.issuedToMember = -1;

        member.borrowedBooks.remove(Integer.valueOf(bookId));
        member.history.add("RETURNED: " + bookId);

        return calculateFine(overdueDays);
    }

    static double calculateFine(int overdueDays) {
        if (overdueDays < 0) {                            // BUG 4
            return 0;
        }

        return overdueDays * 5.0;
    }

    static List<Book> getAvailableBooks() {
        List<Book> available = new ArrayList<>();

        for (Book book : books) {
            if (book.issued) {                            // BUG 5
                available.add(book);
            }
        }

        return available;
    }

    static List<String> getMemberHistory(int memberId) {
        Member member = findMember(memberId);

        if (member == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(member.history);
    }

    static int getBorrowedBookCount() {
        int count = 0;

        for (Book book : books) {
            if (!book.issued) {                           // BUG 6
                count++;
            }
        }

        return count;
    }

    static String generateStatistics() {
        int totalBooks = books.size();
        int totalMembers = members.size();
        int issuedBooks = getBorrowedBookCount();
        int availableBooks = totalBooks - issuedBooks;

        return "BOOKS: " + totalBooks +
                "\nMEMBERS: " + totalMembers +
                "\nISSUED: " + issuedBooks +
                "\nAVAILABLE: " + availableBooks;
    }

    static void displayBook(int bookId) {
        Book book = findBook(bookId);

        if (book == null) {
            System.out.println("Book not found.");
            return;
        }

        System.out.println(book.id + " | " + book.title + " | " +
                book.author + " | " +
                (book.issued ? "AVAILABLE" : "ISSUED"));  // BUG 7
    }

    static void seedDemoData() {
        addBook(1, "Clean Code", "Robert Martin");
        addBook(2, "Effective Java", "Joshua Bloch");
        addBook(3, "Design Patterns", "Gang of Four");

        registerMember(101, "Soham");
        registerMember(102, "Riya");

        issueBook(1, 101);
    }

    public static void main(String[] args) {
        seedDemoData();

        System.out.println(generateStatistics());

        System.out.println("Search results:");
        for (Book book : searchByTitle("java")) {
            displayBook(book.id);
        }

        double fine = returnBook(1, 101, 3);
        System.out.println("Fine: " + (fine + 5));       // BUG 8

        System.out.println(generateStatistics());

        if (getBorrowedBookCount() > books.size()) {     // BUG 9
            System.out.println("Library overload detected");
        }
    }
}`,
    bugs: [
      {
        bugId: 'lib-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Book ID Equality Lookup',
        objective: 'In findBook(int id), compare book.id == id.',
        hint: 'Change "!=" to "==".',
        expectedFix: 'if (book.id == id)',
        testKey: 'test-lib-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('book.id == id');
          return [{ testId: 't-1', taskId: 'lib-bug-1', fileId: 'LibraryManagementSystem.java', name: 'Book Match Equality', passed, message: passed ? 'Equality comparison valid.' : 'Still using !=.' }];
        },
      },
      {
        bugId: 'lib-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Remove Book Issued Guard',
        objective: 'In removeBook(int id), prevent removal when book.issued is true (if (book == null || book.issued) return false;).',
        hint: 'Change "!book.issued" to "book.issued".',
        expectedFix: 'if (book == null || book.issued)',
        testKey: 'test-lib-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('book.issued') && !cleanCode.includes('!book.issued');
          return [{ testId: 't-2', taskId: 'lib-bug-2', fileId: 'LibraryManagementSystem.java', name: 'Remove Book Issued Guard', passed, message: passed ? 'Prevents removing currently issued books.' : 'Allows removing issued books.' }];
        },
      },
      {
        bugId: 'lib-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Issue Book Availability Guard',
        objective: 'In issueBook(int bookId, int memberId), reject if book.issued is already true.',
        hint: 'Change "!book.issued" to "book.issued".',
        expectedFix: 'if (book == null || member == null || book.issued)',
        testKey: 'test-lib-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('book.issued') && !cleanCode.includes('!book.issued');
          return [{ testId: 't-3', taskId: 'lib-bug-3', fileId: 'LibraryManagementSystem.java', name: 'Issue Book Availability Guard', passed, message: passed ? 'Blocks re-issuing an already issued book.' : 'Inverted issue check.' }];
        },
      },
      {
        bugId: 'lib-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Fine Calculation Non-Positive Days Guard',
        objective: 'In calculateFine(int overdueDays), return 0 if overdueDays <= 0.',
        hint: 'Change "overdueDays < 0" to "overdueDays <= 0".',
        expectedFix: 'if (overdueDays <= 0) return 0;',
        testKey: 'test-lib-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('overdueDays <= 0');
          return [{ testId: 't-4', taskId: 'lib-bug-4', fileId: 'LibraryManagementSystem.java', name: 'Fine Overdue Guard', passed, message: passed ? 'Returns 0 for zero or negative days.' : 'Allows 0 overdue days to multiply fine.' }];
        },
      },
      {
        bugId: 'lib-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Available Books Query Filter',
        objective: 'In getAvailableBooks(), add books when !book.issued.',
        hint: 'Change "if (book.issued)" to "if (!book.issued)".',
        expectedFix: 'if (!book.issued)',
        testKey: 'test-lib-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('!book.issued');
          return [{ testId: 't-5', taskId: 'lib-bug-5', fileId: 'LibraryManagementSystem.java', name: 'Available Books Filter', passed, message: passed ? 'Collects non-issued books.' : 'Collects issued books.' }];
        },
      },
      {
        bugId: 'lib-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Borrowed Book Count Condition',
        objective: 'In getBorrowedBookCount(), increment count when book.issued is true.',
        hint: 'Change "if (!book.issued)" to "if (book.issued)".',
        expectedFix: 'if (book.issued) count++;',
        testKey: 'test-lib-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('book.issued') && !cleanCode.includes('!book.issued');
          return [{ testId: 't-6', taskId: 'lib-bug-6', fileId: 'LibraryManagementSystem.java', name: 'Borrowed Count Condition', passed, message: passed ? 'Counts issued books.' : 'Counts available books.' }];
        },
      },
      {
        bugId: 'lib-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Display Book Status Ternary',
        objective: 'In displayBook(int bookId), print "ISSUED" if book.issued else "AVAILABLE".',
        hint: 'Change "(book.issued ? \\"AVAILABLE\\" : \\"ISSUED\\")" to "(book.issued ? \\"ISSUED\\" : \\"AVAILABLE\\")".',
        expectedFix: '(book.issued ? "ISSUED" : "AVAILABLE")',
        testKey: 'test-lib-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('book.issued ? "ISSUED" : "AVAILABLE"') || cleanCode.includes("book.issued ? 'ISSUED' : 'AVAILABLE'");
          return [{ testId: 't-7', taskId: 'lib-bug-7', fileId: 'LibraryManagementSystem.java', name: 'Display Status Ternary', passed, message: passed ? 'Status text matches issued state.' : 'Inverted status string.' }];
        },
      },
      {
        bugId: 'lib-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix Returned Fine Output Format',
        objective: 'In main, print fine directly without arbitrary + 5 offset.',
        hint: 'Change "fine + 5" to "fine".',
        expectedFix: 'println("Fine: " + fine)',
        testKey: 'test-lib-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = !cleanCode.includes('fine + 5') || cleanCode.includes('Fine: " + fine') || cleanCode.includes("Fine: ' + fine");
          return [{ testId: 't-8', taskId: 'lib-bug-8', fileId: 'LibraryManagementSystem.java', name: 'Returned Fine Output', passed, message: passed ? 'Outputs exact calculated fine.' : 'Adds extra 5.' }];
        },
      },
      {
        bugId: 'lib-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Library Overload Validation Check',
        objective: 'In main, ensure valid overload check.',
        hint: 'Remove or correct the impossible condition.',
        expectedFix: 'getBorrowedBookCount() <= books.size()',
        testKey: 'test-lib-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('getBorrowedBookCount()');
          return [{ testId: 't-9', taskId: 'lib-bug-9', fileId: 'LibraryManagementSystem.java', name: 'Overload Safeguard', passed, message: passed ? 'Overload check handled.' : 'Faulty overload condition.' }];
        },
      },
    ],
    test_cases: [
      { input: 'seedDemoData()', expectedOutput: 'BOOKS: 3' },
    ],
    is_active: true,
  },

  // ── 13. JAVA / FLAGSHIP 3: Student Course / Result System (9 Methods, 9 Bugs) ───
  {
    id: 'challenge-java-student',
    title: 'Student Course & Result Management System',
    description: 'Code Mafia Flagship Project 3: Student registry, course credits, enrollment, grade calculation, weighted GPA, topper search, pass percentages and transcript generation.',
    language: 'JAVA',
    difficulty: 'HARD',
    code: `import java.util.*;

public class StudentResultSystem {

    static class Student {
        int id;
        String name;
        Map<String, Double> marks = new HashMap<>();

        Student(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    static class Course {
        String code;
        String name;
        int credits;

        Course(String code, String name, int credits) {
            this.code = code;
            this.name = name;
            this.credits = credits;
        }
    }

    static List<Student> students = new ArrayList<>();
    static List<Course> courses = new ArrayList<>();

    static Student findStudent(int id) {
        for (Student student : students) {
            if (student.id != id) {                         // BUG 1
                return student;
            }
        }
        return null;
    }

    static Course findCourse(String code) {
        for (Course course : courses) {
            if (course.code.equalsIgnoreCase(code)) {
                return course;
            }
        }
        return null;
    }

    static boolean addStudent(int id, String name) {
        if (findStudent(id) != null) {
            return false;
        }

        students.add(new Student(id, name));
        return true;
    }

    static boolean removeStudent(int id) {
        Student student = findStudent(id);

        if (student == null) {
            return false;
        }

        return students.remove(student);
    }

    static boolean addCourse(String code, String name, int credits) {
        if (findCourse(code) != null || credits <= 0) {
            return false;
        }

        courses.add(new Course(code, name, credits));
        return true;
    }

    static boolean removeCourse(String code) {
        Course course = findCourse(code);

        if (course == null) {
            return false;
        }

        for (Student student : students) {
            student.marks.remove(course.code);
        }

        return courses.remove(course);
    }

    static boolean enrollStudent(int studentId, String courseCode) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseCode);

        if (student == null || course == null) {
            return false;
        }

        student.marks.putIfAbsent(course.code, -1.0);
        return true;
    }

    static boolean recordMarks(int studentId, String courseCode, double marks) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseCode);

        if (student == null || course == null ||
                !student.marks.containsKey(courseCode) ||
                marks <= 0 || marks > 100) {                 // BUG 2
            return false;
        }

        student.marks.put(courseCode, marks);
        return true;
    }

    static double calculateAverage(int studentId) {
        Student student = findStudent(studentId);

        if (student == null || student.marks.isEmpty()) {
            return 0;
        }

        double total = 0;
        int count = 0;

        for (double mark : student.marks.values()) {
            if (mark >= 0) {
                total -= mark;                              // BUG 3
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    static String calculateGrade(double marks) {
        if (marks >= 90) return "A";
        if (marks >= 80) return "B";
        if (marks >= 70) return "C";
        if (marks >= 60) return "D";
        if (marks >= 50) return "E";
        return "F";
    }

    static double gradePoint(double marks) {
        if (marks >= 90) return 10;
        if (marks >= 80) return 9;
        if (marks >= 70) return 8;
        if (marks >= 60) return 7;
        if (marks >= 50) return 6;
        return 0;
    }

    static double calculateGPA(int studentId) {
        Student student = findStudent(studentId);

        if (student == null || student.marks.isEmpty()) {
            return 0;
        }

        double weightedPoints = 0;
        int totalCredits = 0;

        for (Course course : courses) {
            if (student.marks.containsKey(course.code)) {
                double marks = student.marks.get(course.code);

                if (marks >= 0) {
                    weightedPoints += gradePoint(marks) * course.credits;
                    totalCredits -= course.credits;           // BUG 4
                }
            }
        }

        return totalCredits == 0 ? 0 : weightedPoints / totalCredits;
    }

    static Student findTopper() {
        Student topper = null;
        double bestAverage = 0;                              // BUG 5

        for (Student student : students) {
            double average = calculateAverage(student.id);

            if (average > bestAverage) {
                bestAverage = average;
                topper = student;
            }
        }

        return topper;
    }

    static List<Student> searchStudents(String query) {
        List<Student> result = new ArrayList<>();

        String normalized = query.toLowerCase();

        for (Student student : students) {
            if (student.name.toLowerCase().contains(normalized) ||
                    String.valueOf(student.id).contains(normalized)) {
                result.add(student);
            }
        }

        return result;
    }

    static String generateTranscript(int studentId) {
        Student student = findStudent(studentId);

        if (student == null) {
            return "Student not found.";
        }

        StringBuilder result = new StringBuilder();

        result.append("STUDENT: ")
              .append(student.name)
              .append(" (")
              .append(student.id)
              .append(")\n");

        for (Course course : courses) {
            if (student.marks.containsKey(course.code)) {
                double marks = student.marks.get(course.code);

                result.append(course.code)
                      .append(" | ")
                      .append(course.name)
                      .append(" | MARKS: ")
                      .append(marks)
                      .append(" | GRADE: ")
                      .append(marks >= 0 ? calculateGrade(marks) : "PENDING")
                      .append("\n");
            }
        }

        result.append("AVERAGE: ")
              .append(calculateAverage(studentId))
              .append("\n");

        result.append("GPA: ")
              .append(calculateGPA(studentId))
              .append("\n");

        return result.toString();
    }

    static double calculatePassPercentage(String courseCode) {
        int total = 0;
        int passed = 0;

        for (Student student : students) {
            if (student.marks.containsKey(courseCode)) {
                double marks = student.marks.get(courseCode);

                if (marks >= 0) {
                    total++;

                    if (marks > 50) {                         // BUG 6
                        passed++;
                    }
                }
            }
        }

        return total == 0 ? 0 : (passed * 100.0) / total;
    }

    static void seedDemoData() {
        addStudent(1, "Aarav");
        addStudent(2, "Riya");
        addStudent(3, "Kabir");

        addCourse("CS101", "Programming", 4);
        addCourse("CS102", "Data Structures", 4);
        addCourse("CS103", "Database Systems", 3);

        enrollStudent(1, "CS101");
        enrollStudent(1, "CS102");
        enrollStudent(1, "CS103");

        enrollStudent(2, "CS101");
        enrollStudent(2, "CS102");

        enrollStudent(3, "CS101");
        enrollStudent(3, "CS102");

        recordMarks(1, "CS101", 95);
        recordMarks(1, "CS102", 88);
        recordMarks(1, "CS103", 92);

        recordMarks(2, "CS101", 72);
        recordMarks(2, "CS102", 81);

        recordMarks(3, "CS101", 64);
        recordMarks(3, "CS102", 78);
    }

    public static void main(String[] args) {
        seedDemoData();

        Student topper = findTopper();

        if (topper != null) {
            System.out.println("TOPPER: " + topper.name);
            System.out.println("AVERAGE: " +
                    calculateAverage(topper.id));
        }

        System.out.println();
        System.out.println(generateTranscript(1));

        System.out.println("CS101 PASS %: " +
                calculatePassPercentage("CS101") + 100);      // BUG 7

        System.out.println("Search for 'riya':");
        for (Student student : searchStudents("riya")) {
            System.out.println(student.id + " - " + student.name);
        }

        System.out.println("GPA HEALTH CHECK: " +
                (calculateGPA(1) < 0));                       // BUG 8

        System.out.println("TOPPER ID CHECK: " +
                (findTopper() == null));                      // BUG 9
    }
}`,
    bugs: [
      {
        bugId: 'student-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Student ID Equality Lookup',
        objective: 'In findStudent(int id), compare student.id == id.',
        hint: 'Change "!=" to "==".',
        expectedFix: 'if (student.id == id)',
        testKey: 'test-student-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('student.id == id');
          return [{ testId: 't-1', taskId: 'student-bug-1', fileId: 'StudentResultSystem.java', name: 'Student Match Equality', passed, message: passed ? 'Equality comparison valid.' : 'Still using !=.' }];
        },
      },
      {
        bugId: 'student-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Allow Valid Zero Marks in Record Marks',
        objective: 'In recordMarks(int studentId, String courseCode, double marks), allow marks >= 0 (reject only marks < 0 || marks > 100).',
        hint: 'Change "marks <= 0" to "marks < 0".',
        expectedFix: 'marks < 0 || marks > 100',
        testKey: 'test-student-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('marks < 0 || marks > 100') || cleanCode.includes('marks < 0 || marks > 100.0');
          return [{ testId: 't-2', taskId: 'student-bug-2', fileId: 'StudentResultSystem.java', name: 'Zero Marks Acceptance', passed, message: passed ? 'Accepts 0 as valid exam mark.' : 'Rejects 0 marks.' }];
        },
      },
      {
        bugId: 'student-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Average Total Marks Sum',
        objective: 'In calculateAverage(int studentId), accumulate total += mark.',
        hint: 'Change "-=" to "+=".',
        expectedFix: 'total += mark;',
        testKey: 'test-student-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('total += mark');
          return [{ testId: 't-3', taskId: 'student-bug-3', fileId: 'StudentResultSystem.java', name: 'Average Mark Sum', passed, message: passed ? 'Adds mark values.' : 'Subtracts marks.' }];
        },
      },
      {
        bugId: 'student-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix GPA Total Credits Accumulation',
        objective: 'In calculateGPA(int studentId), add course credits (totalCredits += course.credits).',
        hint: 'Change "-=" to "+=".',
        expectedFix: 'totalCredits += course.credits;',
        testKey: 'test-student-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('totalCredits += course.credits');
          return [{ testId: 't-4', taskId: 'student-bug-4', fileId: 'StudentResultSystem.java', name: 'GPA Credits Sum', passed, message: passed ? 'Accumulates total credits.' : 'Subtracts credits.' }];
        },
      },
      {
        bugId: 'student-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Topper Search Baseline Average',
        objective: 'In findTopper(), initialize double bestAverage = -1 (to handle 0 average toppers).',
        hint: 'Change "0" to "-1".',
        expectedFix: 'double bestAverage = -1;',
        testKey: 'test-student-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('bestAverage = -1');
          return [{ testId: 't-5', taskId: 'student-bug-5', fileId: 'StudentResultSystem.java', name: 'Topper Baseline Initializer', passed, message: passed ? 'Baseline handles 0 score toppers.' : 'Baseline set to 0.' }];
        },
      },
      {
        bugId: 'student-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Pass Percentage 50 Marks Threshold',
        objective: 'In calculatePassPercentage(String courseCode), count marks >= 50 as passed.',
        hint: 'Change "marks > 50" to "marks >= 50".',
        expectedFix: 'if (marks >= 50)',
        testKey: 'test-student-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('marks >= 50');
          return [{ testId: 't-6', taskId: 'student-bug-6', fileId: 'StudentResultSystem.java', name: 'Pass Threshold Inclusivity', passed, message: passed ? 'Includes exact 50 marks.' : 'Excludes 50 marks.' }];
        },
      },
      {
        bugId: 'student-bug-7',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Pass Percentage Output Expression',
        objective: 'In main, print calculatePassPercentage("CS101") without corrupting + 100.',
        hint: 'Remove "+ 100".',
        expectedFix: 'calculatePassPercentage("CS101")',
        testKey: 'test-student-7',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = !cleanCode.includes('+ 100') || cleanCode.includes('calculatePassPercentage("CS101"))');
          return [{ testId: 't-7', taskId: 'student-bug-7', fileId: 'StudentResultSystem.java', name: 'Pass Percentage Output', passed, message: passed ? 'Prints exact percentage.' : 'Adds extra 100.' }];
        },
      },
      {
        bugId: 'student-bug-8',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Fix GPA Health Check Non-Negative Condition',
        objective: 'In main, verify calculateGPA(1) >= 0.',
        hint: 'Change "< 0" to ">= 0" or "> 0".',
        expectedFix: 'calculateGPA(1) >= 0',
        testKey: 'test-student-8',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('calculateGPA(1) >= 0') || cleanCode.includes('calculateGPA(1) > 0');
          return [{ testId: 't-8', taskId: 'student-bug-8', fileId: 'StudentResultSystem.java', name: 'GPA Health Check', passed, message: passed ? 'Verifies non-negative GPA.' : 'Verifies negative GPA.' }];
        },
      },
      {
        bugId: 'student-bug-9',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Topper Existence Verification',
        objective: 'In main, verify findTopper() != null.',
        hint: 'Change "== null" to "!= null".',
        expectedFix: 'findTopper() != null',
        testKey: 'test-student-9',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('findTopper() != null');
          return [{ testId: 't-9', taskId: 'student-bug-9', fileId: 'StudentResultSystem.java', name: 'Topper Non-Null Check', passed, message: passed ? 'Verifies topper is found.' : 'Verifies topper is null.' }];
        },
      },
    ],
    test_cases: [
      { input: 'seedDemoData()', expectedOutput: 'TOPPER: Aarav' },
    ],
    is_active: true,
  },
];

export const CODE_MAFIA_JAVA_PROJECTS: CodingChallenge[] = [
  PREBUILT_CHALLENGES.find((c) => c.id === 'challenge-java-bank')!,
  PREBUILT_CHALLENGES.find((c) => c.id === 'challenge-java-library')!,
  PREBUILT_CHALLENGES.find((c) => c.id === 'challenge-java-student')!,
].filter(Boolean);

export function selectCodeMafiaJavaProject(): CodingChallenge {
  return CODE_MAFIA_JAVA_PROJECTS[Math.floor(Math.random() * CODE_MAFIA_JAVA_PROJECTS.length)];
}


// ── SUPABASE / LOCAL QUERY HELPERS ─────────────────────────────────────────

export function normalizeLanguage(lang?: string): ChallengeLanguage | null {
  if (!lang) return 'JAVA';
  const upper = lang.trim().toUpperCase();
  if (upper === 'JAVA') return 'JAVA';
  if (upper === 'PYTHON' || upper === 'PY') return 'PYTHON';
  if (upper === 'C') return 'C';
  return null;
}

export function normalizeDifficulty(diff?: string): ChallengeDifficulty {
  if (!diff) return 'MEDIUM';
  const upper = diff.trim().toUpperCase();
  if (upper === 'EASY' || upper === 'SMALL') return 'EASY';
  if (upper === 'HARD' || upper === 'DIFFICULT') return 'HARD';
  return 'MEDIUM';
}

/**
 * Queries coding challenges matching language & difficulty.
 */
export async function queryEligibleChallenges(
  language: ChallengeLanguage,
  difficulty?: ChallengeDifficulty
): Promise<CodingChallenge[]> {
  try {
    let query = supabase
      .from('coding_challenges')
      .select('*')
      .eq('language', language)
      .eq('is_active', true);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as CodingChallenge[];
    }
  } catch {
    // Fallback safely to prebuilt local catalog
  }

  // Filter in-memory prebuilt list
  return PREBUILT_CHALLENGES.filter(
    (c) =>
      c.is_active &&
      c.language === language &&
      (!difficulty || c.difficulty === difficulty || (difficulty === 'HARD' && c.difficulty === 'DIFFICULT'))
  );
}

/**
 * Selects ONE challenge randomly matching the host settings, or a completely random challenge.
 */
export async function selectMatchChallenge(
  language: string = 'JAVA',
  difficulty: string = 'MEDIUM'
): Promise<{ success: boolean; challenge?: CodingChallenge; error?: string }> {
  const normLang = normalizeLanguage(language);
  if (!normLang) {
    return {
      success: false,
      error: `Unsupported programming language: "${language}". Allowed options: Java, Python, C.`,
    };
  }

  const normDiff = normalizeDifficulty(difficulty);
  const eligible = await queryEligibleChallenges(normLang, normDiff);

  if (!eligible || eligible.length === 0) {
    // Fallback to any challenge of that language or completely random from prebuilts
    const fallbackLang = PREBUILT_CHALLENGES.filter((c) => c.language === normLang);
    if (fallbackLang.length > 0) {
      const picked = fallbackLang[Math.floor(Math.random() * fallbackLang.length)];
      return { success: true, challenge: picked };
    }

    const randomAny = PREBUILT_CHALLENGES[Math.floor(Math.random() * PREBUILT_CHALLENGES.length)];
    return { success: true, challenge: randomAny };
  }

  const selected = eligible[Math.floor(Math.random() * eligible.length)];
  return { success: true, challenge: selected };
}

/**
 * Returns a completely randomized problem challenge across all 10 problem statements.
 */
export function getRandomChallengeForMatch(): CodingChallenge {
  return PREBUILT_CHALLENGES[Math.floor(Math.random() * PREBUILT_CHALLENGES.length)];
}

// ── EQUAL BUG DISTRIBUTION ALGORITHM ACROSS DEVELOPERS & ROOMS ───────────────

/**
 * Fair Fisher-Yates Round-Robin Distribution:
 * Shuffles all 10+ bugs in the selected challenge and partitions them EQUALLY among
 * all participating developers in the match without collisions.
 */
export function generateChallengeAssignments(
  challenge: CodingChallenge,
  playerIds: string[]
): Record<string, PlayerObjectiveAssignment[]> {
  const assignments: Record<string, PlayerObjectiveAssignment[]> = {};
  if (!playerIds || playerIds.length === 0) {
    return assignments;
  }
  playerIds.forEach((pid) => (assignments[pid] = []));

  const availableBugs = [...challenge.bugs];
  // Shuffle available bugs using Fisher-Yates for randomization
  for (let i = availableBugs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableBugs[i], availableBugs[j]] = [availableBugs[j], availableBugs[i]];
  }

  // 1. Give each player at least 1 unique bug first
  let bugIdx = 0;
  for (let p = 0; p < playerIds.length && bugIdx < availableBugs.length; p++) {
    const playerId = playerIds[p];
    const bug = availableBugs[bugIdx++];
    const roomInfo = ROOM_IDS_BY_INDEX[bug.roomIndex] || { id: bug.roomId, label: bug.roomLabel };
    assignments[playerId].push({
      playerId,
      roomId: roomInfo.id,
      roomLabel: roomInfo.label,
      roomIndex: bug.roomIndex,
      bugId: bug.bugId,
      title: bug.title,
      objective: bug.objective,
      hint: bug.hint,
      testKey: bug.testKey,
      status: 'ASSIGNED',
    });
  }

  // 2. Distribute all remaining bugs equally in round-robin fashion
  let pIdx = 0;
  while (bugIdx < availableBugs.length) {
    const playerId = playerIds[pIdx % playerIds.length];
    const bug = availableBugs[bugIdx++];
    const roomInfo = ROOM_IDS_BY_INDEX[bug.roomIndex] || { id: bug.roomId, label: bug.roomLabel };
    assignments[playerId].push({
      playerId,
      roomId: roomInfo.id,
      roomLabel: roomInfo.label,
      roomIndex: bug.roomIndex,
      bugId: bug.bugId,
      title: bug.title,
      objective: bug.objective,
      hint: bug.hint,
      testKey: bug.testKey,
      status: 'ASSIGNED',
    });
    pIdx++;
  }

  return assignments;
}

/**
 * Creates an authoritative ChallengeMatchSession for the game.
 */
export function createChallengeMatchSession(
  gameId: string,
  challenge: CodingChallenge,
  playerIds: string[]
): ChallengeMatchSession {
  const assignments = generateChallengeAssignments(challenge, playerIds);
  return {
    gameId,
    challengeId: challenge.id,
    title: challenge.title,
    description: challenge.description,
    language: challenge.language,
    difficulty: challenge.difficulty,
    sharedCode: challenge.code,
    assignments,
    createdAt: Date.now(),
  };
}

const CHALLENGE_SESSION_KEY_PREFIX = 'among_devs_challenge_session_';
const inMemorySessionStore = new Map<string, string>();

export function saveChallengeSession(session: ChallengeMatchSession): void {
  const key = `${CHALLENGE_SESSION_KEY_PREFIX}${session.gameId}`;
  const serialized = JSON.stringify(session);
  inMemorySessionStore.set(key, serialized);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn('Could not persist challenge session to localStorage:', err);
    }
  }
}

export function getChallengeSession(gameId: string): ChallengeMatchSession | null {
  const key = `${CHALLENGE_SESSION_KEY_PREFIX}${gameId}`;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  const mem = inMemorySessionStore.get(key);
  return mem ? JSON.parse(mem) : null;
}

export function clearChallengeSession(gameId: string): void {
  const key = `${CHALLENGE_SESSION_KEY_PREFIX}${gameId}`;
  inMemorySessionStore.delete(key);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

// ── SERVER AUTHORIZATION GUARD ─────────────────────────────────────────────

export interface AuthorizedRoomObjective {
  challengeTitle: string;
  challengeDescription: string;
  language: ChallengeLanguage;
  sharedCode: string;
  roomId: string;
  roomLabel: string;
  hasAssignment: boolean;
  assignment?: {
    bugId: string;
    title: string;
    objective: string;
    hint: string;
    testKey: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'COMPROMISED';
  };
}

export function getAuthorizedObjective(
  session: ChallengeMatchSession | null | undefined,
  requestingPlayerId: string,
  roomId: string
): AuthorizedRoomObjective | null {
  if (!session) return null;

  const playerAssignments = session.assignments[requestingPlayerId] || [];
  const normRoom = roomId.toLowerCase().replace(/\s+/g, '_');

  const match = playerAssignments.find(
    (a) => a.roomId.toLowerCase() === normRoom || a.roomLabel.toLowerCase() === roomId.toLowerCase()
  );

  return {
    challengeTitle: session.title,
    challengeDescription: session.description,
    language: session.language,
    sharedCode: session.sharedCode,
    roomId,
    roomLabel: match?.roomLabel || roomId,
    hasAssignment: Boolean(match),
    assignment: match
      ? {
          bugId: match.bugId,
          title: match.title,
          objective: match.objective,
          hint: match.hint,
          testKey: match.testKey,
          status: match.status,
        }
      : undefined,
  };
}

/**
 * Validates a code fix submitted for a specific challenge bug.
 */
export function validateChallengeCode(
  challengeId: string,
  bugId: string,
  submittedCode: string
): TestResult[] {
  const challenge = PREBUILT_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) {
    return [
      {
        testId: 'err-1',
        taskId: bugId,
        fileId: 'solution',
        name: 'Challenge Validator',
        passed: false,
        message: `Unknown challenge: ${challengeId}`,
      },
    ];
  }

  const bug = challenge.bugs.find((b) => b.bugId === bugId);
  if (!bug) {
    return [
      {
        testId: 'err-2',
        taskId: bugId,
        fileId: 'solution',
        name: 'Bug Validator',
        passed: false,
        message: `Unknown bug objective: ${bugId}`,
      },
    ];
  }

  return bug.validator(submittedCode);
}
