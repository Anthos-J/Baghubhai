/**
 * problemBuilders.ts
 *
 * Dedicated builders for problems 2 to 10 from Code_Mafia_10_Problems_9_Bugs_Each.md.
 * Each problem provides 9 isolated single-bug Java code snippets and deterministic validators.
 */

import { sanitizeSource, TestResult } from './testRunner';
import { JavaBugDefinition } from './problemDataset';

export function makeResult(taskId: string, testId: string, name: string, passed: boolean, message: string): TestResult[] {
  return [{
    testId,
    taskId,
    fileId: 'Main.java',
    name,
    passed,
    message,
  }];
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. EVEN OR ODD
// ─────────────────────────────────────────────────────────────────────────────
export const EVEN_OR_ODD_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n % 2 == 0) System.out.println("Even");
        else System.out.println("Odd");
        sc.close();
    }
}`;

export function buildEvenOrOddBugs(): JavaBugDefinition[] {
  const pId = 'even-or-odd';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Modulo Remainder Test',
      description: 'The condition tests "remainder == 1" but outputs "Even".',
      hint: 'Check "remainder == 0" for Even or invert the logic.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int remainder = n % 2;

        // BUG 1: reversed test
        if (remainder == 1) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('remainder == 1') && cleanCode.includes('"Even"')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Correct modulo test', false, 'FAILED: remainder == 1 should classify as Odd, not Even.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Correct modulo test', true, 'PASSED: Even/Odd classification logic aligned.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Inverted Output Strings',
      description: 'Prints "Odd" when n % 2 == 0 and "Even" otherwise.',
      hint: 'Swap "Even" and "Odd" output strings.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 2: swapped strings
        if (n % 2 == 0) {
            System.out.println("Odd");
        } else {
            System.out.println("Even");
        }
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n % 2 == 0') && cleanCode.includes('println("Odd")')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Output string mapping', false, 'FAILED: n % 2 == 0 must output "Even".');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Output string mapping', true, 'PASSED: Output strings correctly mapped.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Odd Branch Condition',
      description: 'The branch for remainder 0 outputs "Odd".',
      hint: 'Ensure remainder == 0 outputs "Even".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int rem = n % 2;

        if (rem == 0) {
            // BUG 3: reversed output
            System.out.println("Odd");
        } else {
            System.out.println("Even");
        }
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('rem == 0') && cleanCode.includes('println("Odd")')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Branch output', false, 'FAILED: rem == 0 must print Even.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Branch output', true, 'PASSED: Branch output correctly fixed.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Remove Negative Even Special Case',
      description: 'Prints "Negative Even" instead of standard "Even" for negative even numbers.',
      hint: 'Remove the special branch printing "Negative Even".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 4: unexpected special case
        if (n % 2 == 0 && n < 0) {
            System.out.println("Negative Even");
        } else if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('"Negative Even"')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Standard output check', false, 'FAILED: Output must strictly be "Even" or "Odd".');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Standard output check', true, 'PASSED: Special case eliminated.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Fix Output String Format',
      description: 'Outputs in lowercase ("even") instead of Title Case ("Even").',
      hint: 'Change "even" to "Even".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 5: wrong case output
        if (n % 2 == 0) System.out.println("even");
        else System.out.println("odd");
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('"even"') || cleanCode.includes('"odd"')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Title case check', false, 'FAILED: Use Title Case "Even" and "Odd".');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Title case check', true, 'PASSED: Proper title case restored.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Remove Hardcoded Special Case for 1',
      description: 'A faulty special case classifies n == 1 as "Even".',
      hint: 'Remove the "if (n == 1)" branch.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 6: bad special case
        if (n == 1) {
            System.out.println("Even");
        } else if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n == 1') && cleanCode.includes('println("Even")')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Remove n == 1 special case', false, 'FAILED: 1 is Odd, not Even. Remove the erroneous check.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Remove n == 1 special case', true, 'PASSED: Faulty special case removed.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Bitwise Parity Operator',
      description: 'The bitwise check uses OR (|) instead of AND (&).',
      hint: 'Change "(n | 1)" to "(n & 1)".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 7: wrong bitwise operator
        if ((n | 1) == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n | 1')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Bitwise check', false, 'FAILED: Use & for bitwise parity or % for modulo.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Bitwise check', true, 'PASSED: Parity check fixed.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Eliminate Irrelevant Integer Division',
      description: 'An unnecessary calculation "int check = n / 2" overrides the output.',
      hint: 'Remove the division check.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 8: irrelevant calculation overriding logic
        int check = n / 2;
        if (check == 0) {
            System.out.println("Odd");
            sc.close();
            return;
        }

        if (n % 2 == 0) System.out.println("Even");
        else System.out.println("Odd");
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n / 2')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Remove irrelevant division', false, 'FAILED: Remove division check n / 2.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Remove irrelevant division', true, 'PASSED: Irrelevant division removed.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Zero Classification',
      description: 'Zero is mistakenly classified as "Odd".',
      hint: 'Ensure 0 is classified as "Even" (0 % 2 == 0).',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 9: zero classified as Odd
        if (n == 0) {
            System.out.println("Odd");
            sc.close();
            return;
        }

        if (n % 2 == 0) System.out.println("Even");
        else System.out.println("Odd");
        sc.close();
    }
}`,
      solutionCode: EVEN_OR_ODD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n == 0') && cleanCode.includes('println("Odd")')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Zero classification', false, 'FAILED: Zero is Even, not Odd.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Zero classification', true, 'PASSED: Zero correctly classified.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LARGEST OF THREE NUMBERS
// ─────────────────────────────────────────────────────────────────────────────
export const LARGEST_OF_THREE_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        if (b > largest) largest = b;
        if (c > largest) largest = c;

        System.out.println(largest);
        sc.close();
    }
}`;

export function buildLargestOfThreeBugs(): JavaBugDefinition[] {
  const pId = 'largest-of-three';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Initial Largest Value',
      description: 'Initializes "largest" to b without properly checking a.',
      hint: 'Initialize largest to a, then compare with b and c.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        // BUG 1: wrong initial assumption
        int largest = b;
        if (c > largest) largest = c;

        System.out.println(largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (!cleanCode.includes('largest = a') && !cleanCode.includes('a > b')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initial value', false, 'FAILED: Must consider variable "a" when determining largest.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initial value', true, 'PASSED: Initialization includes variable a.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Comparison Direction',
      description: 'Uses less-than (<) instead of greater-than (>).',
      hint: 'Change "a < largest" to "b > largest" or check with greater-than.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        // BUG 2: inverted comparison
        if (b < largest) {
            largest = b;
        }
        if (c > largest) largest = c;

        System.out.println(largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('b < largest')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Comparison direction', false, 'FAILED: Use greater-than (b > largest) to find the maximum.');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Comparison direction', true, 'PASSED: Comparison operator oriented correctly.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Target Variable in Assignment',
      description: 'When c > largest, it assigns b instead of c.',
      hint: 'Change "largest = b" to "largest = c".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        if (b > largest) largest = b;
        // BUG 3: wrong assignment
        if (c > largest) largest = b;

        System.out.println(largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('c > largest') && cleanCode.includes('largest = b')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Correct assignment', false, 'FAILED: When c > largest, set largest = c.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Correct assignment', true, 'PASSED: Variable assignment correctly targets c.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Remove Equality Distortion',
      description: 'An erroneous "if (a == c) largest = a + 1" distorts the result.',
      hint: 'Remove the equality modification check.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        if (b > largest) largest = b;
        if (c > largest) largest = c;

        // BUG 4: equality distortion
        if (a == c) {
            largest = a + 1;
        }

        System.out.println(largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('a == c')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Equality distortion', false, 'FAILED: Remove the (a == c) modification block.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Equality distortion', true, 'PASSED: Equality distortion removed.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Fix Math.min Usage',
      description: 'Uses Math.min instead of Math.max when comparing values.',
      hint: 'Replace Math.min with Math.max or simple if-statements.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        // BUG 5: used min instead of max
        int check = Math.min(a, b);
        int largest = Math.max(check, c);

        System.out.println(largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('Math.min')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Math helper', false, 'FAILED: Do not use Math.min when finding the largest number.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Math helper', true, 'PASSED: Correct comparison function used.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Remove Final Decrement',
      description: 'Code contains "largest = largest - 1" before outputting.',
      hint: 'Delete "largest = largest - 1".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        if (b > largest) largest = b;
        if (c > largest) largest = c;

        // BUG 6: spurious decrement
        largest = largest - 1;

        System.out.println(largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('largest - 1') || cleanCode.includes('largest -= 1') || cleanCode.includes('largest--')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Remove decrement', false, 'FAILED: Remove decrement on largest.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Remove decrement', true, 'PASSED: Spurious decrement removed.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Simplify Output Expression',
      description: 'Output multiplies largest by -1, yielding negative values.',
      hint: 'Print largest directly without multiplying by -1.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        if (b > largest) largest = b;
        if (c > largest) largest = c;

        // BUG 7: inverted sign in output
        System.out.println(largest * -1);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('largest * -1') || cleanCode.includes('-largest')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Sign check', false, 'FAILED: Print largest with its correct sign.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Sign check', true, 'PASSED: Output sign corrected.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Ensure Strict Comparison For Maximum',
      description: 'Third check uses "<" which causes c to never become largest.',
      hint: 'Change "c < largest" to "c > largest".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        if (b > largest) largest = b;
        // BUG 8: inverted comparison for c
        if (c < largest) largest = c;

        System.out.println(largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('c < largest') && cleanCode.includes('largest = c')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Check c condition', false, 'FAILED: Must check if c > largest.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Check c condition', true, 'PASSED: Third number comparison direction fixed.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Single Number Output Format',
      description: 'Prints extra prefix text instead of single largest integer.',
      hint: 'Print only largest on its own line.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();

        int largest = a;
        if (b > largest) largest = b;
        if (c > largest) largest = c;

        // BUG 9: prints extra text
        System.out.println("Largest: " + largest);
        sc.close();
    }
}`,
      solutionCode: LARGEST_OF_THREE_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('"Largest: "') || cleanCode.includes('"Largest:"')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Clean integer output', false, 'FAILED: Print only the integer value.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Clean integer output', true, 'PASSED: Clean integer output verified.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REVERSE A NUMBER
// ─────────────────────────────────────────────────────────────────────────────
export const REVERSE_NUMBER_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            int digit = temp % 10;
            reverse = reverse * 10 + digit;
            temp /= 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`;

export function buildReverseNumberBugs(): JavaBugDefinition[] {
  const pId = 'reverse-a-number';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Initial Reverse Value',
      description: 'Initializes "reverse = 1" instead of 0, resulting in an inflated leading digit.',
      hint: 'Initialize "int reverse = 0;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        // BUG 1: initial value is 1
        int reverse = 1;

        while (temp != 0) {
            int digit = temp % 10;
            reverse = reverse * 10 + digit;
            temp /= 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('reverse = 1;')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initial reverse', false, 'FAILED: reverse accumulator must initialize to 0.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initial reverse', true, 'PASSED: Initial reverse value initialized to 0.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Digit Extraction Operator',
      description: 'Uses division (/) instead of modulo (%) to extract the last digit.',
      hint: 'Change "temp / 10" to "temp % 10".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            // BUG 2: division instead of modulo
            int digit = temp / 10;
            reverse = reverse * 10 + digit;
            temp /= 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('digit = temp / 10') || cleanCode.includes('digit = n / 10')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Modulo operator', false, 'FAILED: Use modulo (% 10) to extract the last digit.');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Modulo operator', true, 'PASSED: Modulo operator used for digit extraction.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Reverse Accumulation Operator',
      description: 'Subtracts the digit instead of adding it (reverse * 10 - digit).',
      hint: 'Change "- digit" to "+ digit".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            int digit = temp % 10;
            // BUG 3: subtraction instead of addition
            reverse = reverse * 10 - digit;
            temp /= 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('reverse * 10 - digit')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Accumulation operator', false, 'FAILED: Accumulate digits using addition (+ digit).');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Accumulation operator', true, 'PASSED: Digit accumulation uses addition.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Fix Temp Reduction Step',
      description: 'Uses modulo (temp % 10) to update temp, causing an infinite loop.',
      hint: 'Change "temp = temp % 10" to "temp /= 10".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            int digit = temp % 10;
            reverse = reverse * 10 + digit;
            // BUG 4: modulo instead of division
            temp = temp % 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('temp = temp % 10')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Loop reduction', false, 'FAILED: Update temp using division (temp /= 10).');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Loop reduction', true, 'PASSED: Temp reduction correctly uses division.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Remove Erroneous Zero-Digit Increment',
      description: 'Increments reverse whenever a zero digit is encountered.',
      hint: 'Remove the "if (digit == 0) reverse = reverse + 1;" check.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            int digit = temp % 10;
            reverse = reverse * 10 + digit;
            // BUG 5: corrupts zero digits
            if (digit == 0) {
                reverse = reverse + 1;
            }
            temp /= 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('digit == 0')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Zero digit handling', false, 'FAILED: Do not distort reverse when digit is 0.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Zero digit handling', true, 'PASSED: Zero digit corruption removed.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Fix Post-Loop Addition',
      description: 'Adds 10 to reverse after the loop completes.',
      hint: 'Remove "reverse = reverse + 10;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            int digit = temp % 10;
            reverse = reverse * 10 + digit;
            temp /= 10;
        }

        // BUG 6: adds 10 to result
        reverse = reverse + 10;

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('reverse + 10') || cleanCode.includes('reverse += 10')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Post-loop distortion', false, 'FAILED: Remove the +10 addition to reverse.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Post-loop distortion', true, 'PASSED: Post-loop distortion removed.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Inverted Output Sign',
      description: 'Multiplies reverse by -1 at output time.',
      hint: 'Print reverse directly.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            int digit = temp % 10;
            reverse = reverse * 10 + digit;
            temp /= 10;
        }

        // BUG 7: output multiplied by -1
        System.out.println(reverse * -1);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('reverse * -1') || cleanCode.includes('-reverse')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Output sign', false, 'FAILED: Do not invert sign in output.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Output sign', true, 'PASSED: Output sign corrected.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix Loop Termination Condition',
      description: 'Loop checks "temp > 0" which fails for negative numbers.',
      hint: 'Use "while (temp != 0)".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        // BUG 8: fails for negative numbers
        while (temp > 0) {
            int digit = temp % 10;
            reverse = reverse * 10 + digit;
            temp /= 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('temp > 0')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Termination condition', false, 'FAILED: Use temp != 0 to handle negative inputs.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Termination condition', true, 'PASSED: Termination condition supports all non-zero values.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Multiplier in Accumulator',
      description: 'Multiplies reverse by 100 instead of 10, causing extra zeroes.',
      hint: 'Change "reverse * 100" to "reverse * 10".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int temp = n;
        int reverse = 0;

        while (temp != 0) {
            int digit = temp % 10;
            // BUG 9: wrong multiplier
            reverse = reverse * 100 + digit;
            temp /= 10;
        }

        System.out.println(reverse);
        sc.close();
    }
}`,
      solutionCode: REVERSE_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('reverse * 100')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Multiplier', false, 'FAILED: Shift base 10 using reverse * 10.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Multiplier', true, 'PASSED: Base 10 positional shift restored.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PALINDROME NUMBER
// ─────────────────────────────────────────────────────────────────────────────
export const PALINDROME_NUMBER_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            n /= 10;
        }

        if (original == reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");

        sc.close();
    }
}`;

export function buildPalindromeNumberBugs(): JavaBugDefinition[] {
  const pId = 'palindrome-number';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Reverse Initialization',
      description: 'Initializes reverse to 1, causing palindrome comparison to always fail.',
      hint: 'Initialize "int reverse = 0;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        // BUG 1: starts at 1
        int reverse = 1;

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            n /= 10;
        }

        if (original == reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('reverse = 1;')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initialize reverse', false, 'FAILED: reverse must start at 0.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initialize reverse', true, 'PASSED: Reverse initialized to 0.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Digit Extraction in Palindrome',
      description: 'Extracts digits using division instead of modulo.',
      hint: 'Change "n / 10" to "n % 10".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            // BUG 2: division instead of modulo
            int digit = n / 10;
            reverse = reverse * 10 + digit;
            n /= 10;
        }

        if (original == reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('digit = n / 10')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Modulo extraction', false, 'FAILED: Use n % 10 to extract digit.');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Modulo extraction', true, 'PASSED: Digit extraction corrected.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Inverted Output Labels',
      description: 'Prints "Palindrome" when original != reverse and "Not Palindrome" when equal.',
      hint: 'Print "Palindrome" when original == reverse.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            n /= 10;
        }

        // BUG 3: inverted condition
        if (original != reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('original != reverse') && cleanCode.includes('"Palindrome"')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Palindrome condition', false, 'FAILED: Check original == reverse for Palindrome.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Palindrome condition', true, 'PASSED: Palindrome condition correctly verified.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Fix Palindrome Output Strings',
      description: 'Outputs lowercase "palindrome" instead of "Palindrome".',
      hint: 'Use capitalized "Palindrome" and "Not Palindrome".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            n /= 10;
        }

        // BUG 4: lowercase strings
        if (original == reverse) System.out.println("palindrome");
        else System.out.println("not palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('"palindrome"') || cleanCode.includes('"not palindrome"')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Output casing', false, 'FAILED: Use "Palindrome" and "Not Palindrome".');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Output casing', true, 'PASSED: Output casing matches specification.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Fix Negative Number Palindrome Rule',
      description: 'Erroneously forces negative numbers to be classified as "Palindrome".',
      hint: 'Remove special handling that marks negative numbers as Palindrome.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        // BUG 5: negative numbers classified as Palindrome
        if (original < 0) {
            System.out.println("Palindrome");
            sc.close();
            return;
        }

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            n /= 10;
        }

        if (original == reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('original < 0') && cleanCode.includes('"Palindrome"')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Negative numbers', false, 'FAILED: Negative numbers are not palindromes due to minus sign.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Negative numbers', true, 'PASSED: Negative number rule corrected.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Fix Modulo in Update Step',
      description: 'Updates n using modulo (n = n % 10) instead of integer division (n /= 10).',
      hint: 'Change "n = n % 10" to "n /= 10".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            // BUG 6: modulo instead of division
            n = n % 10;
        }

        if (original == reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n = n % 10')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Divisional reduction', false, 'FAILED: Reduce n using division (n /= 10).');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Divisional reduction', true, 'PASSED: Value reduction correctly uses division.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Remove Extra Digit Corruption',
      description: 'Increments reverse whenever a zero digit is encountered in the number.',
      hint: 'Remove the "if (digit == 0) reverse++;" block.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            // BUG 7: corrupts zero digits
            if (digit == 0) reverse++;
            n /= 10;
        }

        if (original == reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('digit == 0') && cleanCode.includes('reverse++')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Zero corruption', false, 'FAILED: Remove zero digit increment.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Zero corruption', true, 'PASSED: Zero digit corruption removed.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix Subtraction Accumulator',
      description: 'Uses subtraction (reverse * 10 - digit) which inverts all digits.',
      hint: 'Change "- digit" to "+ digit".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            int digit = n % 10;
            // BUG 8: subtraction
            reverse = reverse * 10 - digit;
            n /= 10;
        }

        if (original == reverse) System.out.println("Palindrome");
        else System.out.println("Not Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('reverse * 10 - digit')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Accumulation operator', false, 'FAILED: Add digits using (+ digit).');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Accumulation operator', true, 'PASSED: Accumulator addition restored.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Swapped Output Strings In Ternary',
      description: 'Ternary expression prints "Not Palindrome" when true and "Palindrome" when false.',
      hint: 'Change "original == reverse ? \\"Not Palindrome\\" : \\"Palindrome\\"" to the correct order.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int reverse = 0;

        while (n != 0) {
            int digit = n % 10;
            reverse = reverse * 10 + digit;
            n /= 10;
        }

        // BUG 9: swapped ternary branches
        System.out.println(original == reverse ? "Not Palindrome" : "Palindrome");
        sc.close();
    }
}`,
      solutionCode: PALINDROME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('== reverse ? "Not Palindrome"')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Ternary branches', false, 'FAILED: When original == reverse, output "Palindrome".');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Ternary branches', true, 'PASSED: Ternary branches correctly ordered.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PRIME NUMBER
// ─────────────────────────────────────────────────────────────────────────────
export const PRIME_NUMBER_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        for (int i = 2; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`;

export function buildPrimeNumberBugs(): JavaBugDefinition[] {
  const pId = 'prime-number';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Initial Prime Threshold',
      description: 'Initializes prime to "n > 2", treating 2 as not prime.',
      hint: 'Change "n > 2" to "n >= 2".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // BUG 1: excludes 2
        boolean prime = n > 2;

        for (int i = 2; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('prime = n > 2')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Prime threshold', false, 'FAILED: 2 is the smallest prime number (n >= 2).');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Prime threshold', true, 'PASSED: Prime threshold includes 2.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Remove False Override For 2',
      description: 'A faulty condition explicitly sets prime = false for n == 2.',
      hint: 'Remove "if (n == 2) prime = false;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        // BUG 2: 2 is prime
        if (n == 2) prime = false;

        for (int i = 2; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n == 2') && cleanCode.includes('prime = false')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Number 2 prime check', false, 'FAILED: 2 is prime, do not set prime to false.');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Number 2 prime check', true, 'PASSED: 2 recognized as prime.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Loop Upper Bound',
      description: 'Loop uses "i * i < n" instead of "<=", missing perfect square divisors.',
      hint: 'Change "i * i < n" to "i * i <= n".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        // BUG 3: missed square root divisor
        for (int i = 2; i * i < n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('i * i < n')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Square bound', false, 'FAILED: Check up to and including sqrt(n) (i * i <= n).');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Square bound', true, 'PASSED: Loop bound includes square roots.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Fix Divisibility Test',
      description: 'Checks "n % i != 0" to declare not prime, inverting divisibility.',
      hint: 'Change "!=" to "==".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        for (int i = 2; i * i <= n && prime; i++) {
            // BUG 4: inverted divisibility
            if (n % i != 0) {
                prime = false;
            }
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n % i != 0') && cleanCode.includes('prime = false')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Divisibility check', false, 'FAILED: A number is composite if n % i == 0.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Divisibility check', true, 'PASSED: Divisibility check correctly verifies zero remainder.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Remove Even Composite Override',
      description: 'Sets prime = true for even numbers other than 2.',
      hint: 'Remove the "if (n % 2 == 0 && n != 2) prime = true;" block.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        for (int i = 2; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        // BUG 5: even composites marked prime
        if (n % 2 == 0 && n != 2) {
            prime = true;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n % 2 == 0 && n != 2')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Even composites', false, 'FAILED: Even numbers greater than 2 are not prime.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Even composites', true, 'PASSED: Even composite override eliminated.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Fix Classification of 1',
      description: 'Explicitly classifies 1 as prime.',
      hint: 'Remove the check marking 1 as prime (1 is not prime).',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        for (int i = 2; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        // BUG 6: 1 is not prime
        if (n == 1) {
            prime = true;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n == 1') && cleanCode.includes('prime = true')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Number 1 check', false, 'FAILED: 1 is not a prime number.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Number 1 check', true, 'PASSED: 1 correctly classified as not prime.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Inverted Output Ternary',
      description: 'Prints "Not Prime" when prime is true and "Prime" when false.',
      hint: 'Change "prime ? \\"Not Prime\\" : \\"Prime\\"" to "prime ? \\"Prime\\" : \\"Not Prime\\"".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        for (int i = 2; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        // BUG 7: inverted output
        System.out.println(prime ? "Not Prime" : "Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('prime ? "Not Prime" : "Prime"')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Ternary order', false, 'FAILED: Output "Prime" when prime is true.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Ternary order', true, 'PASSED: Output ternary correctly prints Prime when true.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix Loop Start Value',
      description: 'Starts checking divisors from i = 1, marking every number as composite.',
      hint: 'Start the loop from i = 2.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean prime = n >= 2;

        // BUG 8: starts at 1, every number divisible by 1
        for (int i = 1; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('int i = 1; i * i <= n')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Divisor loop start', false, 'FAILED: Divisor search must start at 2, not 1.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Divisor loop start', true, 'PASSED: Divisor loop starts at 2.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Negative Number Prime Handling',
      description: 'Allows negative numbers to be evaluated without checking n >= 2.',
      hint: 'Ensure numbers less than 2 are not prime.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // BUG 9: marks negative numbers as prime
        boolean prime = true;

        for (int i = 2; i * i <= n && prime; i++) {
            if (n % i == 0) prime = false;
        }

        System.out.println(prime ? "Prime" : "Not Prime");
        sc.close();
    }
}`,
      solutionCode: PRIME_NUMBER_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('boolean prime = true;')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Non-positive check', false, 'FAILED: Initialize prime with n >= 2.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Non-positive check', true, 'PASSED: Numbers below 2 correctly excluded.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. FACTORIAL OF A NUMBER
// ─────────────────────────────────────────────────────────────────────────────
export const FACTORIAL_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        for (int i = 2; i <= n; i++) {
            factorial *= i;
        }

        System.out.println(factorial);
        sc.close();
    }
}`;

export function buildFactorialBugs(): JavaBugDefinition[] {
  const pId = 'factorial-of-a-number';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Factorial Initialization',
      description: 'Initializes factorial to 0, multiplying everything to zero.',
      hint: 'Initialize "long factorial = 1;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // BUG 1: initialized to 0
        long factorial = 0;

        for (int i = 2; i <= n; i++) {
            factorial *= i;
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('factorial = 0')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initialize factorial', false, 'FAILED: factorial accumulator must initialize to 1.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initialize factorial', true, 'PASSED: Factorial initialized to 1.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Loop Termination Bound',
      description: 'Loop checks "i < n" instead of "i <= n", missing the final multiplier.',
      hint: 'Change "i < n" to "i <= n".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        // BUG 2: missing <= n
        for (int i = 2; i < n; i++) {
            factorial *= i;
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('i < n;')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Loop bound', false, 'FAILED: Loop must run up to and including n (i <= n).');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Loop bound', true, 'PASSED: Loop bound includes n.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Accumulator Operator',
      description: 'Uses addition (+=) instead of multiplication (*=).',
      hint: 'Change "factorial += i" to "factorial *= i".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        for (int i = 2; i <= n; i++) {
            // BUG 3: addition instead of multiplication
            factorial += i;
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('factorial += i') || cleanCode.includes('factorial = factorial + i')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Multiplication operator', false, 'FAILED: Factorial accumulates by multiplication (*= i).');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Multiplication operator', true, 'PASSED: Multiplication operator restored.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Fix Zero Factorial Base Case',
      description: 'Sets factorial = 0 for n == 0 (0! should be 1).',
      hint: '0! equals 1. Remove or fix the check setting factorial to 0.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        for (int i = 2; i <= n; i++) {
            factorial *= i;
        }

        // BUG 4: 0! is 1, not 0
        if (n == 0) {
            factorial = 0;
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n == 0') && cleanCode.includes('factorial = 0')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Zero factorial', false, 'FAILED: 0! is 1, not 0.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Zero factorial', true, 'PASSED: 0! correctly evaluates to 1.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Fix 1! Distortion Factor',
      description: 'Multiplies factorial by 2 when n == 1.',
      hint: 'Remove "if (n == 1) factorial *= 2;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        for (int i = 2; i <= n; i++) {
            factorial *= i;
        }

        // BUG 5: 1! is 1
        if (n == 1) {
            factorial *= 2;
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n == 1') && cleanCode.includes('factorial *= 2')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'One factorial', false, 'FAILED: 1! is 1, do not multiply by 2.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'One factorial', true, 'PASSED: 1! distortion removed.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Remove Extra Factor Multiplication',
      description: 'Multiplies factorial by (n - 1) an extra time after the loop.',
      hint: 'Remove "int extra = n - 1; factorial *= extra;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        for (int i = 2; i <= n; i++) {
            factorial *= i;
        }

        // BUG 6: redundant extra multiplication
        int extra = n - 1;
        if (extra > 1) {
            factorial *= extra;
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('factorial *= extra')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Extra factor', false, 'FAILED: Remove the redundant multiplication by extra.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Extra factor', true, 'PASSED: Redundant factor multiplication removed.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Off-By-One In Output',
      description: 'Prints "factorial + 1" instead of the calculated factorial.',
      hint: 'Change "System.out.println(factorial + 1);" to "System.out.println(factorial);".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        for (int i = 2; i <= n; i++) {
            factorial *= i;
        }

        // BUG 7: off-by-one in output
        System.out.println(factorial + 1);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('factorial + 1')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Output off-by-one', false, 'FAILED: Print factorial without adding 1.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Output off-by-one', true, 'PASSED: Off-by-one removed from print statement.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix Data Type Overflow Limit',
      description: 'Uses byte or short for factorial, overflowing rapidly.',
      hint: 'Use long for the factorial variable.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // BUG 8: byte overflow
        byte factorial = 1;

        for (int i = 2; i <= n; i++) {
            factorial = (byte)(factorial * i);
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('byte factorial') || cleanCode.includes('short factorial')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Type capacity', false, 'FAILED: Declare factorial as long to avoid overflow.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Type capacity', true, 'PASSED: Type capacity supports factorial values.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Initial Loop Variable',
      description: 'Starts loop at i = 0, which multiplies factorial by 0 on the first iteration.',
      hint: 'Start the loop at i = 2 (or i = 1).',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;

        // BUG 9: multiplies by 0
        for (int i = 0; i <= n; i++) {
            factorial *= i;
        }

        System.out.println(factorial);
        sc.close();
    }
}`,
      solutionCode: FACTORIAL_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('int i = 0; i <= n')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Loop initialization', false, 'FAILED: Do not multiply by 0; start loop at 1 or 2.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Loop initialization', true, 'PASSED: Loop starts with positive factors.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. FIBONACCI SERIES
// ─────────────────────────────────────────────────────────────────────────────
export const FIBONACCI_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        int b = 1;

        for (int i = 0; i < n; i++) {
            System.out.print(a);
            if (i < n - 1) System.out.print(" ");
            int next = a + b;
            a = b;
            b = next;
        }

        System.out.println();
        sc.close();
    }
}`;

export function buildFibonacciBugs(): JavaBugDefinition[] {
  const pId = 'fibonacci-series';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Initial Fibonacci Value "a"',
      description: 'Initializes first term a = 1 instead of 0.',
      hint: 'Initialize "int a = 0;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 1: first term is 0
        int a = 1;
        int b = 1;

        for (int i = 0; i < n; i++) {
            System.out.print(a + (i < n - 1 ? " " : ""));
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('int a = 1;')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initial term', false, 'FAILED: The Fibonacci series begins with 0 (a = 0).');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Initial term', true, 'PASSED: First term initialized to 0.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Next Term Addition Operator',
      description: 'Calculates next term using subtraction (a - b) instead of addition (a + b).',
      hint: 'Change "a - b" to "a + b".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        int b = 1;

        for (int i = 0; i < n; i++) {
            System.out.print(a + (i < n - 1 ? " " : ""));
            // BUG 2: subtraction instead of addition
            int next = a - b;
            a = b;
            b = next;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('next = a - b')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Next term operator', false, 'FAILED: Each Fibonacci term is the sum (a + b).');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Next term operator', true, 'PASSED: Next term computed using addition.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix State Update Swap Order',
      description: 'Sets a = next before b = next, causing b to become next + next.',
      hint: 'Preserve b: set a = b, then b = next.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        int b = 1;

        for (int i = 0; i < n; i++) {
            System.out.print(a + (i < n - 1 ? " " : ""));
            int next = a + b;
            // BUG 3: wrong order
            a = next;
            b = a + b;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('a = next;') && cleanCode.includes('b = a + b;')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'State transition', false, 'FAILED: Set a = b, then b = next.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'State transition', true, 'PASSED: State transition correctly shifts window.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Fix Loop Counter Start',
      description: 'Loop starts at i = 1 and runs to n, printing only n - 1 terms.',
      hint: 'Start loop at i = 0 (for (int i = 0; i < n; i++)).',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        int b = 1;

        // BUG 4: starts at 1, misses 1 term
        for (int i = 1; i < n; i++) {
            System.out.print(a + (i < n - 1 ? " " : ""));
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('int i = 1; i < n')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Term count', false, 'FAILED: Loop from i = 0 to print exactly n terms.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Term count', true, 'PASSED: Loop prints full count of n terms.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Remove Mid-Sequence Zero Reset',
      description: 'Resets b to 0 in the middle of generation (if (i == n / 2) b = 0;).',
      hint: 'Remove the mid-sequence reset condition.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        int b = 1;

        for (int i = 0; i < n; i++) {
            System.out.print(a + (i < n - 1 ? " " : ""));
            int next = a + b;
            a = b;
            b = next;
            // BUG 5: arbitrary reset
            if (i == n / 2) {
                b = 0;
            }
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('i == n / 2') && cleanCode.includes('b = 0')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Mid-sequence reset', false, 'FAILED: Remove the arbitrary reset of b.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Mid-sequence reset', true, 'PASSED: Mid-sequence reset removed.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Fix Special Case For n == 1',
      description: 'Prints "1" when n == 1, instead of the 0th term "0".',
      hint: 'The first term for n = 1 is "0".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        // BUG 6: wrong first term
        if (n == 1) {
            System.out.println("1");
            sc.close();
            return;
        }

        int a = 0;
        int b = 1;
        for (int i = 0; i < n; i++) {
            System.out.print(a + (i < n - 1 ? " " : ""));
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('n == 1') && cleanCode.includes('println("1")')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Single term output', false, 'FAILED: For n = 1, output must be "0".');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Single term output', true, 'PASSED: Single term output correctly set to 0.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Trailing Whitespace in Output',
      description: 'Prints an extra space at the end of the line on every iteration.',
      hint: 'Separate elements with space only between items (i < n - 1).',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        int b = 1;

        for (int i = 0; i < n; i++) {
            // BUG 7: unconstrained trailing space
            System.out.print(a + " ");
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('print(a + " ")') && !cleanCode.includes('i < n - 1')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Delimiter formatting', false, 'FAILED: Do not append trailing whitespace after last term.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Delimiter formatting', true, 'PASSED: Proper delimiter formatting restored.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix Initial Fibonacci Value "b"',
      description: 'Initializes second term b = 0 instead of 1, resulting in all zeroes.',
      hint: 'Initialize "int b = 1;".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        // BUG 8: b starts at 0
        int b = 0;

        for (int i = 0; i < n; i++) {
            System.out.print(a + (i < n - 1 ? " " : ""));
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('int b = 0;')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Second term initial', false, 'FAILED: Second term must initialize to 1 (b = 1).');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Second term initial', true, 'PASSED: Second term initialized to 1.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Comma vs Space Delimiter',
      description: 'Prints terms separated by commas instead of single spaces.',
      hint: 'Use space delimiter (" ") instead of comma (",").',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();

        int a = 0;
        int b = 1;

        for (int i = 0; i < n; i++) {
            // BUG 9: wrong delimiter
            System.out.print(a + (i < n - 1 ? "," : ""));
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: FIBONACCI_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('","')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Space delimiter', false, 'FAILED: Terms must be separated by spaces, not commas.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Space delimiter', true, 'PASSED: Space delimiter verified.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. GCD OF TWO NUMBERS
// ─────────────────────────────────────────────────────────────────────────────
export const GCD_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }

        System.out.println(a);
        sc.close();
    }
}`;

export function buildGcdBugs(): JavaBugDefinition[] {
  const pId = 'gcd-of-two-numbers';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Euclidean Loop Condition',
      description: 'Loop checks "while (a != 0)" instead of "while (b != 0)".',
      hint: 'Run Euclidean algorithm while b != 0.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        // BUG 1: wrong loop condition
        while (a != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }

        System.out.println(a);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('while (a != 0)')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Loop condition', false, 'FAILED: Loop must continue while divisor b != 0.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Loop condition', true, 'PASSED: Loop condition checks b != 0.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Swap Order in Euclidean Step',
      description: 'Assigns a = temp before b = a, overwriting both to temp.',
      hint: 'Save temp = a % b; a = b; b = temp;',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            int temp = a % b;
            // BUG 2: premature overwrite
            a = temp;
            b = a;
        }

        System.out.println(a);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('a = temp;') && cleanCode.includes('b = a;')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Euclidean swap', false, 'FAILED: Shift properly: a = b; b = temp;');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Euclidean swap', true, 'PASSED: Euclidean shift order correct.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Remove Spurious +1 On Result',
      description: 'Prints result + 1 at the end of execution.',
      hint: 'Print a directly without adding 1.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }

        // BUG 3: adds 1 to result
        System.out.println(a + 1);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('println(a + 1)')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Remove +1', false, 'FAILED: Output GCD without adding 1.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Remove +1', true, 'PASSED: Result output accurate.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Handle Negative Numbers Absolute Value',
      description: 'Omits Math.abs(), failing when negative integers are provided.',
      hint: 'Wrap inputs in Math.abs(sc.nextInt()).',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // BUG 4: negative numbers cause negative modulo
        int a = sc.nextInt();
        int b = sc.nextInt();

        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }

        System.out.println(a);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        const hasAbs = cleanCode.includes('Math.abs');
        if (!hasAbs) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Absolute value', false, 'FAILED: GCD must be positive; sanitize negative inputs with Math.abs.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Absolute value', true, 'PASSED: Absolute value handles negative integers.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Fix Remainder Operator Direction',
      description: 'Computes temp = b % a instead of a % b.',
      hint: 'Change "b % a" to "a % b".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            // BUG 5: inverted modulo
            int temp = b % a;
            a = b;
            b = temp;
        }

        System.out.println(a);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('temp = b % a')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Modulo operand order', false, 'FAILED: Remainder must be computed as a % b.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Modulo operand order', true, 'PASSED: Remainder order verified.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Fix Output Variable Target',
      description: 'Prints b instead of a after the loop finishes (b is 0 at loop end).',
      hint: 'Print a (the non-zero remainder), not b.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }

        // BUG 6: b is 0 at termination
        System.out.println(b);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('println(b)')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Output variable', false, 'FAILED: Print a; b is 0 upon loop termination.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Output variable', true, 'PASSED: Output correctly prints variable a.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Remove Math.min Result Override',
      description: 'Overrides final GCD with Math.min(a, b), which produces 0.',
      hint: 'Remove "int result = Math.min(a, b);".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }

        // BUG 7: Math.min with 0 yields 0
        int result = Math.min(a, b);

        System.out.println(result);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('Math.min(a, b)')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Remove Math.min', false, 'FAILED: Math.min with b yields 0; output a directly.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Remove Math.min', true, 'PASSED: Math.min override eliminated.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix Division Instead of Modulo',
      description: 'Uses division (temp = a / b) in Euclidean loop instead of modulo.',
      hint: 'Use modulo "%" operator in Euclidean algorithm.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            // BUG 8: division instead of modulo
            int temp = a / b;
            a = b;
            b = temp;
        }

        System.out.println(a);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('temp = a / b')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Modulo operator check', false, 'FAILED: Euclidean algorithm requires modulo (a % b).');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Modulo operator check', true, 'PASSED: Modulo operator in Euclidean loop verified.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Remove Inverted Sign At Exit',
      description: 'Negates result right before printing.',
      hint: 'Print positive GCD.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = Math.abs(sc.nextInt());
        int b = Math.abs(sc.nextInt());

        while (b != 0) {
            int temp = a % b;
            a = b;
            b = temp;
        }

        // BUG 9: negates result
        System.out.println(-a);
        sc.close();
    }
}`,
      solutionCode: GCD_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('println(-a)')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Positive output', false, 'FAILED: GCD must be strictly positive.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Positive output', true, 'PASSED: Positive GCD verified.');
      },
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. READ AND DISPLAY ARRAY
// ─────────────────────────────────────────────────────────────────────────────
export const ARRAY_DISPLAY_CORRECT = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i]);
            if (i < n - 1) System.out.print(" ");
        }

        System.out.println();
        sc.close();
    }
}`;

export function buildArrayDisplayBugs(): JavaBugDefinition[] {
  const pId = 'read-and-display-array';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Array Allocation Size',
      description: 'Allocates "new int[n + 1]" creating an unused extra element.',
      hint: 'Allocate exact size "new int[n];".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // BUG 1: extra element
        int[] arr = new int[n + 1];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i < n - 1 ? " " : ""));
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('new int[n + 1]')) {
          return makeResult(`${pId}-bug-1`, 'bug1-01', 'Array size', false, 'FAILED: Array size must be exactly n.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1-01', 'Array size', true, 'PASSED: Array allocated with exact length n.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Fix Input Loop Bound',
      description: 'Input loop condition "i <= n" triggers ArrayIndexOutOfBoundsException.',
      hint: 'Change "i <= n" to "i < n".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        // BUG 2: <= causes OutOfBounds
        for (int i = 0; i <= n; i++) {
            arr[i] = sc.nextInt();
        }

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i < n - 1 ? " " : ""));
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('for (int i = 0; i <= n; i++)')) {
          return makeResult(`${pId}-bug-2`, 'bug2-01', 'Input loop bound', false, 'FAILED: Input loop must terminate before n (i < n).');
        }
        return makeResult(`${pId}-bug-2`, 'bug2-01', 'Input loop bound', true, 'PASSED: Input loop bound correctly set to i < n.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Output Loop Starting Index',
      description: 'Output loop starts from index 1, omitting the first array element.',
      hint: 'Start output loop from i = 0.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // BUG 3: starts at 1, skips arr[0]
        for (int i = 1; i < n; i++) {
            System.out.print(arr[i] + (i < n - 1 ? " " : ""));
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('for (int i = 1; i < n; i++)')) {
          return makeResult(`${pId}-bug-3`, 'bug3-01', 'Output start index', false, 'FAILED: Display loop must begin at index 0.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3-01', 'Output start index', true, 'PASSED: Output loop displays from index 0.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Remove Extra Trailing Element Print',
      description: 'Explicitly prints arr[n] out of bounds after displaying.',
      hint: 'Remove "System.out.print(arr[n]);".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i < n - 1 ? " " : ""));
        }

        // BUG 4: extra out of bounds element
        if (n > 0) {
            System.out.print(arr[n - 1]);
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('System.out.print(arr[n') && cleanCode.includes('if (n > 0)')) {
          return makeResult(`${pId}-bug-4`, 'bug4-01', 'Extra element print', false, 'FAILED: Remove duplicate trailing element print.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4-01', 'Extra element print', true, 'PASSED: Duplicate print removed.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Remove Irrelevant Negative Flag String',
      description: 'Prints "NEGATIVE" if the first element is negative.',
      hint: 'Remove the check printing "NEGATIVE".',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // BUG 5: unexpected string output
        if (arr.length > 0 && arr[0] < 0) {
            System.out.print("NEGATIVE");
        }

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i < n - 1 ? " " : ""));
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('"NEGATIVE"')) {
          return makeResult(`${pId}-bug-5`, 'bug5-01', 'Unrelated string', false, 'FAILED: Output only array elements.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5-01', 'Unrelated string', true, 'PASSED: Unrelated string output removed.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Fix Array Display Order',
      description: 'Displays the array in reverse order instead of original order.',
      hint: 'Iterate from i = 0 to n - 1 in forward order.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // BUG 6: displays backwards
        for (int i = n - 1; i >= 0; i--) {
            System.out.print(arr[i] + (i > 0 ? " " : ""));
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('int i = n - 1; i >= 0')) {
          return makeResult(`${pId}-bug-6`, 'bug6-01', 'Display direction', false, 'FAILED: Display elements in original forward order.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6-01', 'Display direction', true, 'PASSED: Forward display order verified.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Extra Trailing Space',
      description: 'Appends a space after every element including the last.',
      hint: 'Only print space between elements (i < n - 1 ? " " : "").',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        for (int i = 0; i < n; i++) {
            // BUG 7: unconstrained trailing space
            System.out.print(arr[i] + " ");
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('print(arr[i] + " ")') && !cleanCode.includes('i < n - 1')) {
          return makeResult(`${pId}-bug-7`, 'bug7-01', 'Trailing space', false, 'FAILED: Do not append space after the final element.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7-01', 'Trailing space', true, 'PASSED: Spacing between elements correctly formatted.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix Input Storage Index',
      description: 'Stores input into arr[i + 1], causing an index shift.',
      hint: 'Store into arr[i].',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            // BUG 8: shifted index
            if (i + 1 < n) arr[i + 1] = sc.nextInt();
            else sc.nextInt();
        }

        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i < n - 1 ? " " : ""));
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('arr[i + 1]')) {
          return makeResult(`${pId}-bug-8`, 'bug8-01', 'Store index', false, 'FAILED: Store input into arr[i].');
        }
        return makeResult(`${pId}-bug-8`, 'bug8-01', 'Store index', true, 'PASSED: Input stored into correct array index.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Array Element Mutation',
      description: 'Multiplies elements by 2 prior to displaying.',
      hint: 'Display original unchanged elements.',
      buggyCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        for (int i = 0; i < n; i++) {
            // BUG 9: element modification
            System.out.print((arr[i] * 2) + (i < n - 1 ? " " : ""));
        }
        System.out.println();
        sc.close();
    }
}`,
      solutionCode: ARRAY_DISPLAY_CORRECT,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('arr[i] * 2') || cleanCode.includes('2 * arr[i]')) {
          return makeResult(`${pId}-bug-9`, 'bug9-01', 'Element values', false, 'FAILED: Display original unchanged array elements.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9-01', 'Element values', true, 'PASSED: Original array values preserved.');
      },
    },
  ];
}
