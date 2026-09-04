/**
 * challengeService.ts — Supabase Bugged Code Challenge Subsystem
 *
 * Implements:
 * 1. 10 Prebuilt bugged coding challenges across Java, Python, and C.
 * 2. Host Settings language & difficulty filtering with Supabase query & safe fallback.
 * 3. Random selection of ONE shared codebase for the match.
 * 4. Random assignment of UNIQUE bug objectives across developers and the 6 rooms.
 * 5. Strict player isolation & server-side authorization (zero leakage of solutions or other players' objectives).
 * 6. Deterministic validation for each bug fix.
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

// ── 10 PREBUILT CODING CHALLENGES ──────────────────────────────────────────

export const PREBUILT_CHALLENGES: CodingChallenge[] = [
  // ── 1. JAVA / EASY: Array Operations & Second Largest ────────────────────
  {
    id: 'challenge-java-001',
    title: 'Array Processor & Second Largest',
    description: 'Process telemetry arrays, calculate bounds, and find the second largest telemetry value.',
    language: 'JAVA',
    difficulty: 'EASY',
    code: `public class ArrayProcessor {
    public static int findSecondLargest(int[] arr) {
        if (arr == null || arr.length < 2) return -1;
        int first = Integer.MIN_VALUE;
        int second = Integer.MIN_VALUE;
        // BUG-1: Loop terminates 1 element early (i < arr.length - 1)
        for (int i = 0; i < arr.length - 1; i++) {
            if (arr[i] > first) {
                // BUG-2: Overwrites first without updating second
                first = arr[i];
            } else if (arr[i] > second && arr[i] != first) {
                second = arr[i];
            }
        }
        return second;
    }

    public static int calculateAverage(int[] arr) {
        if (arr == null || arr.length == 0) return 0;
        int sum = 0;
        // BUG-3: Starts from index 1 instead of 0
        for (int i = 1; i < arr.length; i++) {
            sum += arr[i];
        }
        // BUG-4: Integer division truncation error
        return sum / arr.length;
    }

    public static boolean containsDuplicates(int[] arr) {
        if (arr == null) return false;
        // BUG-5: Compares i with i instead of i+1
        for (int i = 0; i < arr.length; i++) {
            for (int j = i; j < arr.length; j++) {
                if (arr[i] == arr[j]) return true;
            }
        }
        // BUG-6: Inverted return value
        return true;
    }
}`,
    bugs: [
      {
        bugId: 'java-easy-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Array Loop Boundary',
        objective: 'Fix the loop boundary in findSecondLargest so all array elements including the last element are processed.',
        hint: 'Change "i < arr.length - 1" to "i < arr.length".',
        expectedFix: 'i < arr.length',
        testKey: 'test-java-easy-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i < arr.length;') || cleanCode.includes('i < arr.length ;');
          return [{ testId: 't-1', taskId: 'java-easy-bug-1', fileId: 'ArrayProcessor.java', name: 'Boundary Check', passed, message: passed ? 'Loop processes all elements.' : 'Loop still misses the last element.' }];
        },
      },
      {
        bugId: 'java-easy-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Preserve Second Largest Value',
        objective: 'Update second = first before assigning a new maximum to first in findSecondLargest.',
        hint: 'Add "second = first;" inside the "arr[i] > first" branch.',
        expectedFix: 'second = first; first = arr[i];',
        testKey: 'test-java-easy-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('second = first;') && cleanCode.includes('first = arr[i];');
          return [{ testId: 't-2', taskId: 'java-easy-bug-2', fileId: 'ArrayProcessor.java', name: 'Second Largest Shift', passed, message: passed ? 'Second largest properly preserved.' : 'First value updated without shifting to second.' }];
        },
      },
      {
        bugId: 'java-easy-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Include Initial Array Element in Sum',
        objective: 'Fix calculateAverage loop to begin accumulation from index 0.',
        hint: 'Change "int i = 1" to "int i = 0".',
        expectedFix: 'int i = 0',
        testKey: 'test-java-easy-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('int i = 0;') || cleanCode.includes('int i = 0 ;');
          return [{ testId: 't-3', taskId: 'java-easy-bug-3', fileId: 'ArrayProcessor.java', name: 'Zero Index Accumulation', passed, message: passed ? 'Sum accumulates all indices from 0.' : 'Index 0 is skipped in sum loop.' }];
        },
      },
      {
        bugId: 'java-easy-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Correct Average Floating Conversion',
        objective: 'Ensure calculateAverage handles non-zero sum correctly without returning zero prematurely.',
        hint: 'Ensure sum / arr.length is computed accurately.',
        expectedFix: 'return sum / arr.length;',
        testKey: 'test-java-easy-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('sum / arr.length') || cleanCode.includes('sum / (double)');
          return [{ testId: 't-4', taskId: 'java-easy-bug-4', fileId: 'ArrayProcessor.java', name: 'Average Computation', passed, message: passed ? 'Average calculation valid.' : 'Average calculation incorrect.' }];
        },
      },
      {
        bugId: 'java-easy-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Duplicate Nested Loop Comparison',
        objective: 'In containsDuplicates, start the inner loop at j = i + 1 to avoid self-comparison.',
        hint: 'Change "int j = i;" to "int j = i + 1;".',
        expectedFix: 'int j = i + 1',
        testKey: 'test-java-easy-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('j = i + 1') || cleanCode.includes('j = i+1');
          return [{ testId: 't-5', taskId: 'java-easy-bug-5', fileId: 'ArrayProcessor.java', name: 'Non-Self Comparison', passed, message: passed ? 'Inner loop compares unique pairs.' : 'Inner loop compares element with itself.' }];
        },
      },
      {
        bugId: 'java-easy-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Duplicate Default Return',
        objective: 'In containsDuplicates, return false if no duplicates are detected after checking all pairs.',
        hint: 'Change final "return true;" to "return false;".',
        expectedFix: 'return false;',
        testKey: 'test-java-easy-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.trim().endsWith('return false;\n}') || cleanCode.includes('return false;\n    }');
          return [{ testId: 't-6', taskId: 'java-easy-bug-6', fileId: 'ArrayProcessor.java', name: 'Default Non-Duplicate Return', passed, message: passed ? 'Returns false when no duplicates found.' : 'Always returns true regardless of input.' }];
        },
      },
    ],
    test_cases: [
      { input: '[3, 7, 2, 9, 5]', expectedOutput: '7' },
      { input: '[10, 10, 10]', expectedOutput: '-1' },
    ],
    is_active: true,
  },

  // ── 2. JAVA / MEDIUM: Banking Transaction Ledger ─────────────────────────
  {
    id: 'challenge-java-002',
    title: 'Banking Transaction Ledger & Account Balancer',
    description: 'Manage credit deposits, debit transfers, balance verification, and transaction rollback history.',
    language: 'JAVA',
    difficulty: 'MEDIUM',
    code: `import java.util.*;

public class AccountLedger {
    private double balance = 0.0;
    private final List<Double> history = new ArrayList<>();

    public boolean deposit(double amount) {
        // BUG-1: Accepts negative or zero deposits
        if (amount < 0) return false;
        balance += amount;
        history.add(amount);
        return true;
    }

    public boolean withdraw(double amount) {
        // BUG-2: Allows overdraft when amount > balance
        if (amount <= 0 || amount > balance * 2) return false;
        // BUG-3: Adds amount instead of subtracting
        balance += amount;
        history.add(-amount);
        return true;
    }

    public double getBalance() {
        // BUG-4: Returns hardcoded 0.0 instead of actual balance
        return 0.0;
    }

    public boolean rollbackLastTransaction() {
        if (history.isEmpty()) return false;
        // BUG-5: Removes index 0 instead of last index
        double last = history.remove(0);
        balance -= last;
        return true;
    }

    public double calculateTotalDeposits() {
        double total = 0.0;
        for (double t : history) {
            // BUG-6: Accumulates all transactions including negative withdrawals
            total += t;
        }
        return total;
    }
}`,
    bugs: [
      {
        bugId: 'java-med-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Validate Positive Deposit Amount',
        objective: 'Reject zero and negative deposits in deposit() method.',
        hint: 'Change "amount < 0" to "amount <= 0".',
        expectedFix: 'if (amount <= 0) return false;',
        testKey: 'test-java-med-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('amount <= 0');
          return [{ testId: 't-1', taskId: 'java-med-bug-1', fileId: 'AccountLedger.java', name: 'Positive Deposit Validation', passed, message: passed ? 'Zero and negative deposits blocked.' : 'Zero deposit is accepted.' }];
        },
      },
      {
        bugId: 'java-med-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Enforce Strict Balance Limit on Withdrawals',
        objective: 'Prevent withdrawals that exceed current balance in withdraw().',
        hint: 'Change "amount > balance * 2" to "amount > balance".',
        expectedFix: 'amount > balance',
        testKey: 'test-java-med-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('amount > balance') && !cleanCode.includes('balance * 2');
          return [{ testId: 't-2', taskId: 'java-med-bug-2', fileId: 'AccountLedger.java', name: 'Overdraft Protection', passed, message: passed ? 'Withdrawal strictly capped at balance.' : 'Overdraft allowed.' }];
        },
      },
      {
        bugId: 'java-med-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Deduct Withdrawal Amount from Balance',
        objective: 'Subtract the withdrawn amount from balance instead of adding it.',
        hint: 'Change "balance += amount;" to "balance -= amount;".',
        expectedFix: 'balance -= amount;',
        testKey: 'test-java-med-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('balance -= amount;');
          return [{ testId: 't-3', taskId: 'java-med-bug-3', fileId: 'AccountLedger.java', name: 'Balance Deduction', passed, message: passed ? 'Balance correctly reduced upon withdrawal.' : 'Balance erroneously increased.' }];
        },
      },
      {
        bugId: 'java-med-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Return Authoritative Balance',
        objective: 'In getBalance(), return the actual balance field.',
        hint: 'Change "return 0.0;" to "return balance;" or "return this.balance;".',
        expectedFix: 'return balance;',
        testKey: 'test-java-med-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return balance;') || cleanCode.includes('return this.balance;');
          return [{ testId: 't-4', taskId: 'java-med-bug-4', fileId: 'AccountLedger.java', name: 'Get Balance Output', passed, message: passed ? 'Returns actual account balance.' : 'Returns hardcoded 0.0.' }];
        },
      },
      {
        bugId: 'java-med-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Rollback Most Recent Transaction',
        objective: 'Remove the last item in history (history.size() - 1) instead of index 0 during rollback.',
        hint: 'Use "history.remove(history.size() - 1)".',
        expectedFix: 'history.remove(history.size() - 1)',
        testKey: 'test-java-med-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('history.remove(history.size() - 1)') || cleanCode.includes('history.remove(history.size()-1)');
          return [{ testId: 't-5', taskId: 'java-med-bug-5', fileId: 'AccountLedger.java', name: 'Last Element Rollback', passed, message: passed ? 'Rollback targets latest transaction.' : 'Rollback incorrectly removes oldest transaction.' }];
        },
      },
      {
        bugId: 'java-med-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Filter Positive Deposits Only',
        objective: 'In calculateTotalDeposits, filter "if (t > 0)" before adding to total.',
        hint: 'Add "if (t > 0) total += t;".',
        expectedFix: 'if (t > 0) total += t;',
        testKey: 'test-java-med-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('t > 0') || cleanCode.includes('t > 0.0');
          return [{ testId: 't-6', taskId: 'java-med-bug-6', fileId: 'AccountLedger.java', name: 'Deposit Filtering', passed, message: passed ? 'Only positive deposits accumulated.' : 'Withdrawals subtracted from total deposits.' }];
        },
      },
    ],
    test_cases: [
      { input: 'deposit(100), withdraw(30)', expectedOutput: 'balance: 70.0' },
      { input: 'deposit(50), rollback()', expectedOutput: 'balance: 0.0' },
    ],
    is_active: true,
  },

  // ── 3. JAVA / HARD: Binary Search Tree Balancing & Traversal ────────────
  {
    id: 'challenge-java-003',
    title: 'Binary Search Tree Balancing & Range Query',
    description: 'Maintain an ordered binary search tree, insert nodes, search keys, and compute subtree depths.',
    language: 'JAVA',
    difficulty: 'HARD',
    code: `class Node {
    int val;
    Node left, right;
    Node(int val) { this.val = val; }
}

public class BinarySearchTree {
    private Node root;

    public void insert(int val) {
        root = insertRec(root, val);
    }

    private Node insertRec(Node current, int val) {
        if (current == null) return new Node(val);
        // BUG-1: Compares with > instead of < for left subtree
        if (val > current.val) {
            current.left = insertRec(current.left, val);
        } else if (val > current.val) {
            // BUG-2: Duplicate condition prevents right insertion
            current.right = insertRec(current.right, val);
        }
        return current;
    }

    public boolean search(int key) {
        return searchRec(root, key);
    }

    private boolean searchRec(Node current, int key) {
        // BUG-3: Returns true when current is null (NPE or false positive)
        if (current == null) return true;
        if (current.val == key) return true;
        // BUG-4: Inverted search direction branch
        if (key > current.val) {
            return searchRec(current.left, key);
        }
        return searchRec(current.right, key);
    }

    public int maxDepth(Node node) {
        if (node == null) return 0;
        // BUG-5: Uses Math.min instead of Math.max
        int left = maxDepth(node.left);
        int right = maxDepth(node.right);
        return Math.min(left, right) + 1;
    }

    public int findMin() {
        if (root == null) return -1;
        Node curr = root;
        // BUG-6: Traverses right instead of left to find minimum
        while (curr.right != null) {
            curr = curr.right;
        }
        return curr.val;
    }
}`,
    bugs: [
      {
        bugId: 'java-hard-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Correct Left Subtree Insertion Condition',
        objective: 'In insertRec, insert into current.left when val < current.val.',
        hint: 'Change "val > current.val" to "val < current.val".',
        expectedFix: 'if (val < current.val)',
        testKey: 'test-java-hard-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('val < current.val');
          return [{ testId: 't-1', taskId: 'java-hard-bug-1', fileId: 'BinarySearchTree.java', name: 'Left Subtree Insertion', passed, message: passed ? 'Lesser values correctly routed left.' : 'Lesser values routed incorrectly.' }];
        },
      },
      {
        bugId: 'java-hard-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Enable Right Subtree Insertion Branch',
        objective: 'In insertRec, route greater values to current.right.',
        hint: 'Use "else if (val > current.val) current.right = insertRec(current.right, val);".',
        expectedFix: 'current.right = insertRec(current.right, val);',
        testKey: 'test-java-hard-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('val < current.val') && cleanCode.includes('current.right = insertRec');
          return [{ testId: 't-2', taskId: 'java-hard-bug-2', fileId: 'BinarySearchTree.java', name: 'Right Subtree Insertion', passed, message: passed ? 'Greater values correctly routed right.' : 'Right subtree insertion blocked.' }];
        },
      },
      {
        bugId: 'java-hard-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Null Node Search Base Case',
        objective: 'In searchRec, return false when current == null.',
        hint: 'Change "if (current == null) return true;" to "if (current == null) return false;".',
        expectedFix: 'if (current == null) return false;',
        testKey: 'test-java-hard-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (current == null) return false;') || cleanCode.includes('if(current == null) return false;');
          return [{ testId: 't-3', taskId: 'java-hard-bug-3', fileId: 'BinarySearchTree.java', name: 'Null Search Base Case', passed, message: passed ? 'Null base case returns false.' : 'Null base case returns true.' }];
        },
      },
      {
        bugId: 'java-hard-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Fix Search Traversal Direction',
        objective: 'In searchRec, traverse left when key < current.val and right when key > current.val.',
        hint: 'Change "if (key > current.val) return searchRec(current.left, key);" to "if (key < current.val)...".',
        expectedFix: 'if (key < current.val) return searchRec(current.left, key);',
        testKey: 'test-java-hard-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('key < current.val') && cleanCode.includes('current.left');
          return [{ testId: 't-4', taskId: 'java-hard-bug-4', fileId: 'BinarySearchTree.java', name: 'Search Traversal Route', passed, message: passed ? 'Search directions properly aligned.' : 'Search directions inverted.' }];
        },
      },
      {
        bugId: 'java-hard-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Compute Maximum Tree Depth',
        objective: 'In maxDepth, return Math.max(left, right) + 1 to find the maximum height.',
        hint: 'Change Math.min to Math.max.',
        expectedFix: 'Math.max(left, right) + 1',
        testKey: 'test-java-hard-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('Math.max(left, right)');
          return [{ testId: 't-5', taskId: 'java-hard-bug-5', fileId: 'BinarySearchTree.java', name: 'Max Depth Calculation', passed, message: passed ? 'Calculates maximum height.' : 'Uses minimum height.' }];
        },
      },
      {
        bugId: 'java-hard-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Traverse Left for Minimum Value',
        objective: 'In findMin, traverse curr.left until left child is null.',
        hint: 'Change "curr.right" to "curr.left".',
        expectedFix: 'curr = curr.left;',
        testKey: 'test-java-hard-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('curr.left != null') && cleanCode.includes('curr = curr.left;');
          return [{ testId: 't-6', taskId: 'java-hard-bug-6', fileId: 'BinarySearchTree.java', name: 'Minimum Traversal Path', passed, message: passed ? 'Finds leftmost minimum node.' : 'Incorrectly searches right.' }];
        },
      },
    ],
    test_cases: [
      { input: 'insert(5, 3, 7, 2, 4)', expectedOutput: 'min: 2, depth: 3' },
    ],
    is_active: true,
  },

  // ── 4. PYTHON / EASY: Two Sum & Frequency Counter ────────────────────────
  {
    id: 'challenge-py-001',
    title: 'Two Sum & Word Frequency Counter',
    description: 'Find pairs that sum to a target value and compute word frequencies in telemetry packets.',
    language: 'PYTHON',
    difficulty: 'EASY',
    code: `def two_sum(nums, target):
    seen = {}
    # BUG-1: Iterates values instead of (index, num)
    for num in nums:
        complement = target - num
        # BUG-2: Checks complement in nums instead of seen dictionary
        if complement in nums:
            return [seen.get(complement, 0), num]
        seen[num] = num
    return []

def count_word_frequencies(words):
    freq = {}
    for word in words:
        # BUG-3: Overwrites count with 1 every time
        freq[word] = 1
    return freq

def find_most_frequent(freq_map):
    if not freq_map:
        return None
    max_key = None
    # BUG-4: Initializes max_count to infinity
    max_count = float('inf')
    for k, v in freq_map.items():
        if v > max_count:
            max_count = v
            max_key = k
    return max_key

def filter_above_threshold(nums, threshold):
    # BUG-5: Excludes elements equal to threshold
    return [x for x in nums if x < threshold]

def calculate_checksum(nums):
    # BUG-6: Uses bitwise OR instead of addition/XOR
    total = 0
    for x in nums:
        total = total | x
    return total
`,
    bugs: [
      {
        bugId: 'py-easy-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Enumerate Array Indices in two_sum',
        objective: 'Use enumerate(nums) in two_sum so index i is tracked.',
        hint: 'Change "for num in nums:" to "for i, num in enumerate(nums):".',
        expectedFix: 'for i, num in enumerate(nums):',
        testKey: 'test-py-easy-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('enumerate(nums)');
          return [{ testId: 't-1', taskId: 'py-easy-bug-1', fileId: 'solution.py', name: 'Index Enumeration', passed, message: passed ? 'Indices enumerated correctly.' : 'Indices not captured.' }];
        },
      },
      {
        bugId: 'py-easy-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Check Complement in Hash Map',
        objective: 'Check if complement is in seen dictionary, and return [seen[complement], i].',
        hint: 'Use "if complement in seen: return [seen[complement], i]".',
        expectedFix: 'if complement in seen:',
        testKey: 'test-py-easy-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('complement in seen');
          return [{ testId: 't-2', taskId: 'py-easy-bug-2', fileId: 'solution.py', name: 'Hash Table Lookup', passed, message: passed ? 'Complement looked up in hash map in O(1).' : 'O(N) search on list used.' }];
        },
      },
      {
        bugId: 'py-easy-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Increment Word Frequency Count',
        objective: 'In count_word_frequencies, increment existing count: freq[word] = freq.get(word, 0) + 1.',
        hint: 'Use "freq[word] = freq.get(word, 0) + 1".',
        expectedFix: 'freq[word] = freq.get(word, 0) + 1',
        testKey: 'test-py-easy-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('freq.get(word, 0) + 1') || cleanCode.includes('freq.get(word,0)+1') || cleanCode.includes('+= 1');
          return [{ testId: 't-3', taskId: 'py-easy-bug-3', fileId: 'solution.py', name: 'Frequency Accumulation', passed, message: passed ? 'Frequencies accumulated accurately.' : 'Frequencies reset to 1.' }];
        },
      },
      {
        bugId: 'py-easy-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Initialize Maximum Count to Zero',
        objective: 'In find_most_frequent, initialize max_count to -1 or 0 instead of infinity.',
        hint: 'Change "max_count = float(\'inf\')" to "max_count = -1".',
        expectedFix: 'max_count = -1',
        testKey: 'test-py-easy-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = !cleanCode.includes("float('inf')") && (cleanCode.includes('max_count = -1') || cleanCode.includes('max_count = 0'));
          return [{ testId: 't-4', taskId: 'py-easy-bug-4', fileId: 'solution.py', name: 'Max Baseline Initialization', passed, message: passed ? 'Max count initialized to lowest baseline.' : 'Max count set to infinity.' }];
        },
      },
      {
        bugId: 'py-easy-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Fix Threshold Filtering Condition',
        objective: 'Filter elements strictly greater than or equal to threshold.',
        hint: 'Change "x < threshold" to "x >= threshold".',
        expectedFix: 'x >= threshold',
        testKey: 'test-py-easy-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('x >= threshold') || cleanCode.includes('x > threshold');
          return [{ testId: 't-5', taskId: 'py-easy-bug-5', fileId: 'solution.py', name: 'Upper Threshold Filtering', passed, message: passed ? 'Elements above threshold retained.' : 'Inverted filtering used.' }];
        },
      },
      {
        bugId: 'py-easy-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Checksum Accumulation',
        objective: 'Sum values in calculate_checksum: total += x.',
        hint: 'Change "total = total | x" to "total += x".',
        expectedFix: 'total += x',
        testKey: 'test-py-easy-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('total += x') || cleanCode.includes('total = total + x');
          return [{ testId: 't-6', taskId: 'py-easy-bug-6', fileId: 'solution.py', name: 'Summation Checksum', passed, message: passed ? 'Checksum calculates arithmetic sum.' : 'Bitwise OR used.' }];
        },
      },
    ],
    test_cases: [
      { input: 'two_sum([2, 7, 11, 15], 9)', expectedOutput: '[0, 1]' },
      { input: 'count_word_frequencies(["a", "b", "a"])', expectedOutput: '{"a": 2, "b": 1}' },
    ],
    is_active: true,
  },

  // ── 5. PYTHON / MEDIUM: User Authentication & Session Token Manager ──────
  {
    id: 'challenge-py-002',
    title: 'User Authentication & Session Token Manager',
    description: 'Validate passwords, hash tokens, expire sessions, and manage role-based permissions.',
    language: 'PYTHON',
    difficulty: 'MEDIUM',
    code: `import time
import hashlib

class SessionManager:
    def __init__(self, session_ttl=3600):
        self.sessions = {}
        self.ttl = session_ttl

    def create_session(self, user_id, role="DEVELOPER"):
        # BUG-1: Token does not include timestamp or user_id entropy
        token = "fixed_token_constant"
        # BUG-2: Expiry timestamp set in the past (- self.ttl)
        expires_at = time.time() - self.ttl
        self.sessions[token] = {
            "user_id": user_id,
            "role": role,
            "expires_at": expires_at
        }
        return token

    def validate_session(self, token):
        # BUG-3: Returns True for non-existent token
        if token not in self.sessions:
            return True
        session = self.sessions[token]
        # BUG-4: Validates if time.time() > expires_at (treats expired as valid)
        if time.time() > session["expires_at"]:
            return True
        return False

    def revoke_session(self, token):
        # BUG-5: Ignores missing token instead of returning False
        if token in self.sessions:
            del self.sessions[token]
            return True
        return True

    def check_permission(self, token, required_role):
        if not self.validate_session(token):
            return False
        # BUG-6: Compares with != instead of ==
        return self.sessions[token]["role"] != required_role
`,
    bugs: [
      {
        bugId: 'py-med-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Generate Dynamic Session Token',
        objective: 'Generate a dynamic token using hashlib or unique entropy containing user_id and time.',
        hint: 'Use hashlib.sha256(f"{user_id}:{time.time()}".encode()).hexdigest().',
        expectedFix: 'hashlib.sha256',
        testKey: 'test-py-med-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = !cleanCode.includes('"fixed_token_constant"') && (cleanCode.includes('hashlib.') || cleanCode.includes('token = f"'));
          return [{ testId: 't-1', taskId: 'py-med-bug-1', fileId: 'SessionManager.py', name: 'Dynamic Token Creation', passed, message: passed ? 'Tokens generated with dynamic entropy.' : 'Static constant token used.' }];
        },
      },
      {
        bugId: 'py-med-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Set Future Expiration Timestamp',
        objective: 'In create_session, set expires_at = time.time() + self.ttl.',
        hint: 'Change "time.time() - self.ttl" to "time.time() + self.ttl".',
        expectedFix: 'expires_at = time.time() + self.ttl',
        testKey: 'test-py-med-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('time.time() + self.ttl') || cleanCode.includes('time.time()+self.ttl');
          return [{ testId: 't-2', taskId: 'py-med-bug-2', fileId: 'SessionManager.py', name: 'Future Expiration', passed, message: passed ? 'Session expiration set to future.' : 'Session created already expired.' }];
        },
      },
      {
        bugId: 'py-med-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Reject Non-Existent Session Tokens',
        objective: 'In validate_session, return False if token is not in self.sessions.',
        hint: 'Change "if token not in self.sessions: return True" to "return False".',
        expectedFix: 'if token not in self.sessions: return False',
        testKey: 'test-py-med-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if token not in self.sessions:\n            return False') || cleanCode.includes('if token not in self.sessions: return False');
          return [{ testId: 't-3', taskId: 'py-med-bug-3', fileId: 'SessionManager.py', name: 'Unknown Token Rejection', passed, message: passed ? 'Invalid tokens rejected.' : 'Invalid tokens accepted.' }];
        },
      },
      {
        bugId: 'py-med-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Validate Active Expiry Window',
        objective: 'In validate_session, return True only if time.time() <= session["expires_at"].',
        hint: 'Change "if time.time() > session[\'expires_at\']: return True" to "return time.time() <= session[\'expires_at\']".',
        expectedFix: 'time.time() <= session["expires_at"]',
        testKey: 'test-py-med-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('time.time() <= session["expires_at"]') || cleanCode.includes('time.time() < session["expires_at"]');
          return [{ testId: 't-4', taskId: 'py-med-bug-4', fileId: 'SessionManager.py', name: 'Session TTL Validation', passed, message: passed ? 'Active sessions validated correctly.' : 'Expired sessions accepted.' }];
        },
      },
      {
        bugId: 'py-med-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Return False on Revoking Missing Token',
        objective: 'In revoke_session, return False when token is not present.',
        hint: 'Change the fallback "return True" to "return False".',
        expectedFix: 'return False',
        testKey: 'test-py-med-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('del self.sessions[token]\n            return True\n        return False') || cleanCode.includes('return False');
          return [{ testId: 't-5', taskId: 'py-med-bug-5', fileId: 'SessionManager.py', name: 'Revocation Status', passed, message: passed ? 'Returns False on missing session.' : 'Returns True regardless.' }];
        },
      },
      {
        bugId: 'py-med-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Check Exact Role Match for Permission',
        objective: 'In check_permission, check session["role"] == required_role.',
        hint: 'Change "!=" to "==".',
        expectedFix: 'return self.sessions[token]["role"] == required_role',
        testKey: 'test-py-med-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('["role"] == required_role');
          return [{ testId: 't-6', taskId: 'py-med-bug-6', fileId: 'SessionManager.py', name: 'Role Match Check', passed, message: passed ? 'Exact role required.' : 'Inverted role check used.' }];
        },
      },
    ],
    test_cases: [
      { input: 'create_session("admin", "ADMIN"), validate()', expectedOutput: 'True' },
    ],
    is_active: true,
  },

  // ── 6. PYTHON / HARD: Priority Task Scheduler & DAG ──────────────────────
  {
    id: 'challenge-py-003',
    title: 'Priority Task Scheduler & DAG Dependency Resolver',
    description: 'Schedule asynchronous tasks according to priority queues, dependencies, and execution retries.',
    language: 'PYTHON',
    difficulty: 'HARD',
    code: `import heapq

class TaskScheduler:
    def __init__(self):
        self.queue = []
        self.dependencies = {}
        self.completed = set()

    def add_task(self, task_id, priority, deps=None):
        # BUG-1: Pushes tuple without inverting priority for min-heap
        heapq.heappush(self.queue, (priority, task_id))
        self.dependencies[task_id] = set(deps) if deps else set()

    def can_run(self, task_id):
        # BUG-2: Returns True if dependencies is non-empty instead of issubset
        if task_id not in self.dependencies:
            return True
        return len(self.dependencies[task_id]) > 0

    def get_next_task(self):
        if not self.queue:
            return None
        # BUG-3: Pops from index 0 directly instead of heapq.heappop
        priority, task_id = self.queue.pop(0)
        if self.can_run(task_id):
            return task_id
        # BUG-4: Discards unrunnable task instead of pushing back
        return None

    def mark_completed(self, task_id):
        # BUG-5: Removes from completed set instead of adding
        if task_id in self.completed:
            self.completed.remove(task_id)

    def is_all_completed(self):
        # BUG-6: Checks if queue is non-empty
        return len(self.queue) > 0
`,
    bugs: [
      {
        bugId: 'py-hard-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Invert Priority for Max-Priority Queue',
        objective: 'In add_task, store (-priority, task_id) so highest priority runs first.',
        hint: 'Use "heapq.heappush(self.queue, (-priority, task_id))".',
        expectedFix: 'heapq.heappush(self.queue, (-priority, task_id))',
        testKey: 'test-py-hard-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('-priority');
          return [{ testId: 't-1', taskId: 'py-hard-bug-1', fileId: 'TaskScheduler.py', name: 'Max Priority Heap', passed, message: passed ? 'High priority tasks ordered first.' : 'Lowest priority runs first.' }];
        },
      },
      {
        bugId: 'py-hard-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Verify All Dependencies are Completed',
        objective: 'In can_run, return self.dependencies[task_id].issubset(self.completed).',
        hint: 'Use "return self.dependencies[task_id].issubset(self.completed)".',
        expectedFix: 'return self.dependencies[task_id].issubset(self.completed)',
        testKey: 'test-py-hard-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('.issubset(self.completed)');
          return [{ testId: 't-2', taskId: 'py-hard-bug-2', fileId: 'TaskScheduler.py', name: 'Dependency Resolution', passed, message: passed ? 'Runs only when dependencies are fulfilled.' : 'Runs before dependencies complete.' }];
        },
      },
      {
        bugId: 'py-hard-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Use Heap Pop for Priority Retrieval',
        objective: 'In get_next_task, retrieve tasks using heapq.heappop(self.queue).',
        hint: 'Change "self.queue.pop(0)" to "heapq.heappop(self.queue)".',
        expectedFix: 'heapq.heappop(self.queue)',
        testKey: 'test-py-hard-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('heapq.heappop(self.queue)');
          return [{ testId: 't-3', taskId: 'py-hard-bug-3', fileId: 'TaskScheduler.py', name: 'Heap Ordering Pop', passed, message: passed ? 'Pops highest priority node.' : 'Linear array pop used.' }];
        },
      },
      {
        bugId: 'py-hard-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Requeue Blocked Tasks',
        objective: 'In get_next_task, requeue blocked tasks with heapq.heappush(self.queue, (priority, task_id)).',
        hint: 'Re-push unrunnable task back into queue before returning None.',
        expectedFix: 'heapq.heappush(self.queue, (priority, task_id))',
        testKey: 'test-py-hard-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('heapq.heappush(self.queue, (priority, task_id))') || cleanCode.includes('heappush');
          return [{ testId: 't-4', taskId: 'py-hard-bug-4', fileId: 'TaskScheduler.py', name: 'Blocked Task Requeue', passed, message: passed ? 'Blocked tasks kept in queue.' : 'Blocked tasks lost.' }];
        },
      },
      {
        bugId: 'py-hard-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Add Task to Completed Set',
        objective: 'In mark_completed, add task_id to self.completed.',
        hint: 'Use "self.completed.add(task_id)".',
        expectedFix: 'self.completed.add(task_id)',
        testKey: 'test-py-hard-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('self.completed.add(task_id)');
          return [{ testId: 't-5', taskId: 'py-hard-bug-5', fileId: 'TaskScheduler.py', name: 'Completion Recording', passed, message: passed ? 'Task recorded in completed set.' : 'Task removed from completed set.' }];
        },
      },
      {
        bugId: 'py-hard-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Check Zero Remaining Tasks',
        objective: 'In is_all_completed, return len(self.queue) == 0.',
        hint: 'Change "len(self.queue) > 0" to "len(self.queue) == 0".',
        expectedFix: 'return len(self.queue) == 0',
        testKey: 'test-py-hard-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('len(self.queue) == 0');
          return [{ testId: 't-6', taskId: 'py-hard-bug-6', fileId: 'TaskScheduler.py', name: 'Completion Status', passed, message: passed ? 'Reports completed when queue is empty.' : 'Reports inverted state.' }];
        },
      },
    ],
    test_cases: [
      { input: 'add_task("A", 10), add_task("B", 20)', expectedOutput: 'next: "B"' },
    ],
    is_active: true,
  },

  // ── 7. C / EASY: String Tokenizer & Memory Buffer Reversal ───────────────
  {
    id: 'challenge-c-001',
    title: 'String Tokenizer & Buffer Reversal',
    description: 'Parse command line tokens, reverse memory buffers, and count delimiter occurrences.',
    language: 'C',
    difficulty: 'EASY',
    code: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int count_tokens(const char* str, char delim) {
    if (str == NULL) return 0;
    int count = 0;
    // BUG-1: Loop does not check for null terminator '\\0'
    for (int i = 0; str[i] != '\\n'; i++) {
        // BUG-2: Compares with delim + 1
        if (str[i] == delim + 1) {
            count++;
        }
    }
    return count + 1;
}

void reverse_buffer(char* buf, int len) {
    if (buf == NULL || len <= 0) return;
    int left = 0;
    // BUG-3: Right pointer starts at len instead of len - 1 (out of bounds)
    int right = len;
    while (left < right) {
        // BUG-4: Overwrites left without saving temp
        buf[left] = buf[right];
        buf[right] = buf[left];
        left++;
        right--;
    }
}

int is_palindrome(const char* str, int len) {
    if (str == NULL || len == 0) return 1;
    // BUG-5: Compares up to len instead of len / 2
    for (int i = 0; i < len; i++) {
        // BUG-6: Indexing error: len - i instead of len - 1 - i
        if (str[i] != str[len - i]) {
            return 0;
        }
    }
    return 1;
}
`,
    bugs: [
      {
        bugId: 'c-easy-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Check String Null Terminator',
        objective: 'In count_tokens, loop until str[i] != \'\\0\'.',
        hint: 'Change "str[i] != \'\\n\'" to "str[i] != \'\\0\'".',
        expectedFix: 'str[i] != \'\\0\'',
        testKey: 'test-c-easy-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes("str[i] != '\\0'") || cleanCode.includes('str[i] != 0');
          return [{ testId: 't-1', taskId: 'c-easy-bug-1', fileId: 'tokenizer.c', name: 'Null Terminator Boundary', passed, message: passed ? 'Terminates cleanly at null character.' : 'Loops past end of string.' }];
        },
      },
      {
        bugId: 'c-easy-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Compare with Exact Delimiter',
        objective: 'In count_tokens, check if str[i] == delim.',
        hint: 'Change "delim + 1" to "delim".',
        expectedFix: 'str[i] == delim',
        testKey: 'test-c-easy-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('str[i] == delim') && !cleanCode.includes('delim + 1');
          return [{ testId: 't-2', taskId: 'c-easy-bug-2', fileId: 'tokenizer.c', name: 'Delimiter Comparison', passed, message: passed ? 'Matches exact delimiter.' : 'Matches offset delimiter.' }];
        },
      },
      {
        bugId: 'c-easy-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Right Buffer Index',
        objective: 'In reverse_buffer, initialize int right = len - 1.',
        hint: 'Change "int right = len;" to "int right = len - 1;".',
        expectedFix: 'int right = len - 1;',
        testKey: 'test-c-easy-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('right = len - 1') || cleanCode.includes('right = len-1');
          return [{ testId: 't-3', taskId: 'c-easy-bug-3', fileId: 'tokenizer.c', name: 'Right Boundary Pointer', passed, message: passed ? 'Points to valid last character.' : 'Points out of bounds to null terminator.' }];
        },
      },
      {
        bugId: 'c-easy-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Swap Memory Characters Using Temp Variable',
        objective: 'In reverse_buffer, swap using a temporary character: char tmp = buf[left]; buf[left] = buf[right]; buf[right] = tmp;.',
        hint: 'Save buf[left] in char tmp before assigning buf[right].',
        expectedFix: 'char tmp = buf[left]; buf[left] = buf[right]; buf[right] = tmp;',
        testKey: 'test-c-easy-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('char tmp = buf[left]') || cleanCode.includes('char t = buf[left]') || cleanCode.includes('tmp = buf[left]');
          return [{ testId: 't-4', taskId: 'c-easy-bug-4', fileId: 'tokenizer.c', name: 'Character Swap Logic', passed, message: passed ? 'Swaps characters safely.' : 'Overwrites value without saving.' }];
        },
      },
      {
        bugId: 'c-easy-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Optimize Palindrome Scan Range',
        objective: 'In is_palindrome, iterate i < len / 2.',
        hint: 'Change "i < len" to "i < len / 2".',
        expectedFix: 'i < len / 2',
        testKey: 'test-c-easy-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('i < len / 2') || cleanCode.includes('i < len/2');
          return [{ testId: 't-5', taskId: 'c-easy-bug-5', fileId: 'tokenizer.c', name: 'Half-Length Loop', passed, message: passed ? 'Checks up to half length.' : 'Redundant full length loop.' }];
        },
      },
      {
        bugId: 'c-easy-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Mirror Index in Palindrome Check',
        objective: 'In is_palindrome, compare str[i] with str[len - 1 - i].',
        hint: 'Change "str[len - i]" to "str[len - 1 - i]".',
        expectedFix: 'str[len - 1 - i]',
        testKey: 'test-c-easy-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('str[len - 1 - i]') || cleanCode.includes('str[len-1-i]');
          return [{ testId: 't-6', taskId: 'c-easy-bug-6', fileId: 'tokenizer.c', name: 'Mirror Index Calculation', passed, message: passed ? 'Mirror character indexed correctly.' : 'Out of bounds index.' }];
        },
      },
    ],
    test_cases: [
      { input: 'count_tokens("a,b,c", \',\')', expectedOutput: '3' },
      { input: 'is_palindrome("racecar", 7)', expectedOutput: '1' },
    ],
    is_active: true,
  },

  // ── 8. C / MEDIUM: Thread-Safe Linked List Queue & Memory Deallocator ────
  {
    id: 'challenge-c-002',
    title: 'Linked List Queue & Memory Deallocator',
    description: 'Implement a FIFO queue node allocator, enqueue/dequeue items, and prevent memory leaks.',
    language: 'C',
    difficulty: 'MEDIUM',
    code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct Queue {
    Node* front;
    Node* rear;
    int size;
} Queue;

Queue* create_queue() {
    Queue* q = (Queue*)malloc(sizeof(Queue));
    // BUG-1: Does not initialize front/rear pointers to NULL
    q->size = 0;
    return q;
}

void enqueue(Queue* q, int value) {
    if (q == NULL) return;
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = value;
    newNode->next = NULL;

    // BUG-2: Checks if front != NULL instead of rear == NULL
    if (q->front != NULL) {
        q->rear->next = newNode;
        q->rear = newNode;
    } else {
        q->front = newNode;
        q->rear = newNode;
    }
    // BUG-3: Decrements size instead of incrementing
    q->size--;
}

int dequeue(Queue* q) {
    if (q == NULL || q->front == NULL) return -1;
    Node* temp = q->front;
    int data = temp->data;
    // BUG-4: Does not advance front pointer (q->front = q->front->next)
    // BUG-5: Memory leak: does not call free(temp)
    if (q->front == NULL) {
        q->rear = NULL;
    }
    q->size--;
    return data;
}

void destroy_queue(Queue* q) {
    if (q == NULL) return;
    // BUG-6: Frees queue header before freeing nodes in the list
    free(q);
}
`,
    bugs: [
      {
        bugId: 'c-med-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Initialize Queue Pointers to NULL',
        objective: 'In create_queue, initialize q->front = NULL and q->rear = NULL.',
        hint: 'Set q->front = NULL; q->rear = NULL;.',
        expectedFix: 'q->front = NULL; q->rear = NULL;',
        testKey: 'test-c-med-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('q->front = NULL') && cleanCode.includes('q->rear = NULL');
          return [{ testId: 't-1', taskId: 'c-med-bug-1', fileId: 'queue.c', name: 'Pointer Initialization', passed, message: passed ? 'Front and rear pointers safely nullified.' : 'Wild pointers left uninitialized.' }];
        },
      },
      {
        bugId: 'c-med-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Check Empty Queue Condition on Enqueue',
        objective: 'In enqueue, check if q->rear != NULL before linking rear->next.',
        hint: 'Change "if (q->front != NULL)" or check "if (q->rear == NULL)".',
        expectedFix: 'if (q->rear == NULL)',
        testKey: 'test-c-med-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('q->rear == NULL') || cleanCode.includes('q->front == NULL');
          return [{ testId: 't-2', taskId: 'c-med-bug-2', fileId: 'queue.c', name: 'Enqueue Empty Check', passed, message: passed ? 'Empty queue linked properly.' : 'Null pointer dereference on rear.' }];
        },
      },
      {
        bugId: 'c-med-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Increment Queue Size on Enqueue',
        objective: 'In enqueue, increment q->size++.',
        hint: 'Change "q->size--;" to "q->size++;".',
        expectedFix: 'q->size++',
        testKey: 'test-c-med-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('q->size++;') || cleanCode.includes('q->size += 1;');
          return [{ testId: 't-3', taskId: 'c-med-bug-3', fileId: 'queue.c', name: 'Size Increment', passed, message: passed ? 'Queue size increases on enqueue.' : 'Queue size decreases.' }];
        },
      },
      {
        bugId: 'c-med-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Advance Front Pointer on Dequeue',
        objective: 'In dequeue, advance q->front = q->front->next.',
        hint: 'Add "q->front = q->front->next;" before freeing temp.',
        expectedFix: 'q->front = q->front->next;',
        testKey: 'test-c-med-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('q->front = q->front->next') || cleanCode.includes('q->front = temp->next');
          return [{ testId: 't-4', taskId: 'c-med-bug-4', fileId: 'queue.c', name: 'Front Pointer Advance', passed, message: passed ? 'Front pointer advances to next node.' : 'Front pointer never advances.' }];
        },
      },
      {
        bugId: 'c-med-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Deallocate Dequeued Node Memory',
        objective: 'In dequeue, call free(temp) to prevent memory leaks.',
        hint: 'Add "free(temp);".',
        expectedFix: 'free(temp);',
        testKey: 'test-c-med-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('free(temp);');
          return [{ testId: 't-5', taskId: 'c-med-bug-5', fileId: 'queue.c', name: 'Node Deallocation', passed, message: passed ? 'Dequeued node deallocated.' : 'Memory leaked.' }];
        },
      },
      {
        bugId: 'c-med-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Free All Nodes in destroy_queue',
        objective: 'In destroy_queue, loop while q->front != NULL, free each node, then free(q).',
        hint: 'Loop through q->front, freeing nodes before freeing q.',
        expectedFix: 'while (q->front != NULL) { Node* t = q->front; q->front = q->front->next; free(t); } free(q);',
        testKey: 'test-c-med-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('while') && cleanCode.includes('free');
          return [{ testId: 't-6', taskId: 'c-med-bug-6', fileId: 'queue.c', name: 'Cascade Cleanup', passed, message: passed ? 'All queue nodes and struct freed.' : 'Nodes orphaned in memory.' }];
        },
      },
    ],
    test_cases: [
      { input: 'enqueue(10), enqueue(20), dequeue()', expectedOutput: '10' },
    ],
    is_active: true,
  },

  // ── 9. C / HARD: Dynamic Hash Table with Collision Handling ─────────────
  {
    id: 'challenge-c-003',
    title: 'Dynamic Hash Table with Chaining & Rehash',
    description: 'Implement a hash map table with djb2 hashing, separate chaining collision resolution, and dynamic resizing.',
    language: 'C',
    difficulty: 'HARD',
    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 16

typedef struct Entry {
    char* key;
    int value;
    struct Entry* next;
} Entry;

typedef struct HashTable {
    Entry* buckets[TABLE_SIZE];
    int count;
} HashTable;

unsigned int hash(const char* str) {
    unsigned long hash = 5381;
    int c;
    // BUG-1: Uses + instead of << 5 + hash
    while ((c = *str++)) {
        hash = hash + c;
    }
    return hash % TABLE_SIZE;
}

HashTable* create_table() {
    HashTable* table = (HashTable*)malloc(sizeof(HashTable));
    table->count = 0;
    // BUG-2: Does not initialize bucket pointers to NULL
    return table;
}

void put(HashTable* table, const char* key, int value) {
    if (table == NULL || key == NULL) return;
    unsigned int idx = hash(key);
    Entry* curr = table->buckets[idx];

    while (curr != NULL) {
        // BUG-3: Uses != 0 for string equality instead of == 0
        if (strcmp(curr->key, key) != 0) {
            curr->value = value;
            return;
        }
        curr = curr->next;
    }

    Entry* newEntry = (Entry*)malloc(sizeof(Entry));
    // BUG-4: Assigns pointer directly without strdup/allocation
    newEntry->key = (char*)key;
    newEntry->value = value;
    // BUG-5: Overwrites head without linking to existing chain
    newEntry->next = NULL;
    table->buckets[idx] = newEntry;
    table->count++;
}

int get(HashTable* table, const char* key) {
    if (table == NULL || key == NULL) return -1;
    unsigned int idx = hash(key);
    Entry* curr = table->buckets[idx];
    while (curr != NULL) {
        // BUG-6: Inverted strcmp match condition
        if (strcmp(curr->key, key) != 0) {
            return curr->value;
        }
        curr = curr->next;
    }
    return -1;
}
`,
    bugs: [
      {
        bugId: 'c-hard-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Implement djb2 Hash Algorithm',
        objective: 'In hash function, implement standard djb2: hash = ((hash << 5) + hash) + c.',
        hint: 'Use "hash = ((hash << 5) + hash) + c;".',
        expectedFix: '((hash << 5) + hash) + c',
        testKey: 'test-c-hard-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('hash << 5') || cleanCode.includes('hash * 33');
          return [{ testId: 't-1', taskId: 'c-hard-bug-1', fileId: 'hashtable.c', name: 'djb2 Hash Function', passed, message: passed ? 'Hash distributes keys uniformly.' : 'Weak additive hash causes high collisions.' }];
        },
      },
      {
        bugId: 'c-hard-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Zero Initialize Hash Table Buckets',
        objective: 'In create_table, zero initialize table->buckets using memset or for loop.',
        hint: 'Use "memset(table->buckets, 0, sizeof(table->buckets));" or initialize each bucket to NULL.',
        expectedFix: 'memset(table->buckets, 0, sizeof(table->buckets));',
        testKey: 'test-c-hard-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('memset') || cleanCode.includes('table->buckets[i] = NULL');
          return [{ testId: 't-2', taskId: 'c-hard-bug-2', fileId: 'hashtable.c', name: 'Bucket Array Initialization', passed, message: passed ? 'Buckets initialized to NULL.' : 'Garbage pointers in bucket array.' }];
        },
      },
      {
        bugId: 'c-hard-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Fix Key Match Comparison on Update',
        objective: 'In put, check strcmp(curr->key, key) == 0 to update existing key.',
        hint: 'Change "!= 0" to "== 0".',
        expectedFix: 'if (strcmp(curr->key, key) == 0)',
        testKey: 'test-c-hard-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('strcmp(curr->key, key) == 0');
          return [{ testId: 't-3', taskId: 'c-hard-bug-3', fileId: 'hashtable.c', name: 'Existing Key Update', passed, message: passed ? 'Updates value on matching key.' : 'Overwrites value on non-matching key.' }];
        },
      },
      {
        bugId: 'c-hard-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Duplicate String Key Safely',
        objective: 'In put, duplicate key with strdup(key) to avoid dangling pointer issues.',
        hint: 'Use "newEntry->key = strdup(key);".',
        expectedFix: 'newEntry->key = strdup(key);',
        testKey: 'test-c-hard-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('strdup(key)');
          return [{ testId: 't-4', taskId: 'c-hard-bug-4', fileId: 'hashtable.c', name: 'Key String Duplication', passed, message: passed ? 'Key string safely duplicated in heap.' : 'Shallow pointer stored.' }];
        },
      },
      {
        bugId: 'c-hard-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Link New Entry to Chaining Bucket',
        objective: 'In put, link newEntry->next = table->buckets[idx] before updating bucket head.',
        hint: 'Set "newEntry->next = table->buckets[idx];".',
        expectedFix: 'newEntry->next = table->buckets[idx];',
        testKey: 'test-c-hard-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('newEntry->next = table->buckets[idx]');
          return [{ testId: 't-5', taskId: 'c-hard-bug-5', fileId: 'hashtable.c', name: 'Collision Chaining Link', passed, message: passed ? 'New node linked into bucket chain.' : 'Existing chain severed upon insert.' }];
        },
      },
      {
        bugId: 'c-hard-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Fix Lookup Match in get Function',
        objective: 'In get, return curr->value when strcmp(curr->key, key) == 0.',
        hint: 'Change "!= 0" to "== 0".',
        expectedFix: 'if (strcmp(curr->key, key) == 0) return curr->value;',
        testKey: 'test-c-hard-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('if (strcmp(curr->key, key) == 0)\n            return curr->value') || cleanCode.includes('strcmp(curr->key, key) == 0');
          return [{ testId: 't-6', taskId: 'c-hard-bug-6', fileId: 'hashtable.c', name: 'Lookup Key Equality', passed, message: passed ? 'Retrieves value for exact key match.' : 'Returns value of wrong key.' }];
        },
      },
    ],
    test_cases: [
      { input: 'put("station", 42), get("station")', expectedOutput: '42' },
    ],
    is_active: true,
  },

  // ── 10. JAVA / MEDIUM: Space Station Telemetry & Life Support Dispatcher ──
  {
    id: 'challenge-java-004',
    title: 'Orbital Telemetry & Life Support Dispatcher',
    description: 'Monitor oxygen sensors, thermal dissipation valves, radiation shielding, and emergency alert relays.',
    language: 'JAVA',
    difficulty: 'MEDIUM',
    code: `public class LifeSupportDispatcher {
    private double oxygenLevel = 100.0;
    private double pressureKPa = 101.3;
    private boolean emergencyAlarm = false;

    public void updateOxygen(double consumptionRate, double supplyRate) {
        // BUG-1: Adds consumption and subtracts supply
        oxygenLevel += consumptionRate;
        oxygenLevel -= supplyRate;
        if (oxygenLevel < 0.0) oxygenLevel = 0.0;
    }

    public boolean isHazardous() {
        // BUG-2: Uses AND instead of OR for critical failure trigger
        return oxygenLevel < 19.5 && pressureKPa < 80.0;
    }

    public void triggerEmergency(String alertCode) {
        // BUG-3: Only triggers if alertCode is null (ignores valid alerts)
        if (alertCode == null) {
            this.emergencyAlarm = true;
        }
    }

    public double calculatePowerRequirement(int activeCrew) {
        if (activeCrew <= 0) return 0.0;
        // BUG-4: Multiplies by negative factor
        double basePower = 1500.0;
        return basePower + (activeCrew * -50.0);
    }

    public boolean stabilizePressure(double targetKPa) {
        if (targetKPa <= 0.0) return false;
        // BUG-5: Sets pressure to zero instead of target
        this.pressureKPa = 0.0;
        return true;
    }

    public boolean getAlarmStatus() {
        // BUG-6: Inverts alarm status
        return !emergencyAlarm;
    }
}`,
    bugs: [
      {
        bugId: 'java-telemetry-bug-1',
        roomIndex: 1,
        roomId: 'library',
        roomLabel: 'LIBRARY & ARCHIVES',
        title: 'Fix Oxygen Balance Equation',
        objective: 'Subtract consumptionRate and add supplyRate to oxygenLevel.',
        hint: 'Use "oxygenLevel -= consumptionRate; oxygenLevel += supplyRate;".',
        expectedFix: 'oxygenLevel -= consumptionRate; oxygenLevel += supplyRate;',
        testKey: 'test-java-tele-1',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('oxygenLevel -= consumptionRate') && cleanCode.includes('oxygenLevel += supplyRate');
          return [{ testId: 't-1', taskId: 'java-telemetry-bug-1', fileId: 'LifeSupportDispatcher.java', name: 'Oxygen Balance Flow', passed, message: passed ? 'Oxygen consumption and supply correctly applied.' : 'Oxygen level inverted.' }];
        },
      },
      {
        bugId: 'java-telemetry-bug-2',
        roomIndex: 2,
        roomId: 'medbay',
        roomLabel: 'MEDICAL BAY',
        title: 'Trigger Hazard on Either Low Oxygen OR Low Pressure',
        objective: 'In isHazardous, return true if oxygenLevel < 19.5 || pressureKPa < 80.0.',
        hint: 'Change "&&" to "||".',
        expectedFix: 'oxygenLevel < 19.5 || pressureKPa < 80.0',
        testKey: 'test-java-tele-2',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('oxygenLevel < 19.5 || pressureKPa < 80.0') || cleanCode.includes('||');
          return [{ testId: 't-2', taskId: 'java-telemetry-bug-2', fileId: 'LifeSupportDispatcher.java', name: 'Hazard Condition Disjunction', passed, message: passed ? 'Triggers if either oxygen or pressure fails.' : 'Both must fail simultaneously.' }];
        },
      },
      {
        bugId: 'java-telemetry-bug-3',
        roomIndex: 3,
        roomId: 'storage',
        roomLabel: 'STORAGE & CARGO',
        title: 'Activate Emergency Alarm on Valid Alert Code',
        objective: 'In triggerEmergency, activate alarm if alertCode != null.',
        hint: 'Change "alertCode == null" to "alertCode != null".',
        expectedFix: 'if (alertCode != null)',
        testKey: 'test-java-tele-3',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('alertCode != null');
          return [{ testId: 't-3', taskId: 'java-telemetry-bug-3', fileId: 'LifeSupportDispatcher.java', name: 'Emergency Alarm Activation', passed, message: passed ? 'Alarm activated on valid alert code.' : 'Alert code ignored.' }];
        },
      },
      {
        bugId: 'java-telemetry-bug-4',
        roomIndex: 4,
        roomId: 'dev_lab',
        roomLabel: 'DEV WORKSTATIONS',
        title: 'Scale Power Requirement Positively per Crew',
        objective: 'In calculatePowerRequirement, add (activeCrew * 50.0).',
        hint: 'Change "-50.0" to "+ 50.0".',
        expectedFix: 'activeCrew * 50.0',
        testKey: 'test-java-tele-4',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('activeCrew * 50.0') || cleanCode.includes('activeCrew * 50');
          return [{ testId: 't-4', taskId: 'java-telemetry-bug-4', fileId: 'LifeSupportDispatcher.java', name: 'Positive Power Scaling', passed, message: passed ? 'Power scales with crew count.' : 'Power decreases with crew count.' }];
        },
      },
      {
        bugId: 'java-telemetry-bug-5',
        roomIndex: 5,
        roomId: 'command',
        roomLabel: 'COMMAND & TECH',
        title: 'Apply Target Pressure Stabilization',
        objective: 'In stabilizePressure, set this.pressureKPa = targetKPa.',
        hint: 'Change "this.pressureKPa = 0.0;" to "this.pressureKPa = targetKPa;".',
        expectedFix: 'this.pressureKPa = targetKPa;',
        testKey: 'test-java-tele-5',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('this.pressureKPa = targetKPa;') || cleanCode.includes('pressureKPa = targetKPa;');
          return [{ testId: 't-5', taskId: 'java-telemetry-bug-5', fileId: 'LifeSupportDispatcher.java', name: 'Target Pressure Set', passed, message: passed ? 'Pressure stabilized to target.' : 'Pressure dropped to zero.' }];
        },
      },
      {
        bugId: 'java-telemetry-bug-6',
        roomIndex: 6,
        roomId: 'mafia_lair',
        roomLabel: 'DARK LAIR',
        title: 'Return Accurate Alarm Status',
        objective: 'In getAlarmStatus, return this.emergencyAlarm.',
        hint: 'Change "return !emergencyAlarm;" to "return emergencyAlarm;".',
        expectedFix: 'return emergencyAlarm;',
        testKey: 'test-java-tele-6',
        isActive: true,
        validator: (code) => {
          const { cleanCode } = sanitizeSource(code);
          const passed = cleanCode.includes('return emergencyAlarm;') || cleanCode.includes('return this.emergencyAlarm;');
          return [{ testId: 't-6', taskId: 'java-telemetry-bug-6', fileId: 'LifeSupportDispatcher.java', name: 'Alarm Status Flag', passed, message: passed ? 'Returns actual alarm state.' : 'Inverted alarm status returned.' }];
        },
      },
    ],
    test_cases: [
      { input: 'updateOxygen(5.0, 10.0)', expectedOutput: 'oxygen: 105.0' },
    ],
    is_active: true,
  },
];

// ── CHALLENGE SELECTION & SEEDING ──────────────────────────────────────────

export function normalizeDifficulty(diff?: string): 'EASY' | 'MEDIUM' | 'HARD' {
  if (!diff) return 'MEDIUM';
  const u = diff.toUpperCase();
  if (u === 'SMALL' || u === 'EASY') return 'EASY';
  if (u === 'DIFFICULT' || u === 'HARD') return 'HARD';
  return 'MEDIUM';
}

export function normalizeLanguage(lang?: string): ChallengeLanguage | null {
  if (!lang) return 'JAVA';
  const u = lang.toUpperCase();
  if (u === 'JAVA') return 'JAVA';
  if (u === 'PYTHON' || u === 'PY') return 'PYTHON';
  if (u === 'C') return 'C';
  return null;
}

/**
 * Query eligible challenges from Supabase with fallback to prebuilt catalog.
 */
export async function queryEligibleChallenges(
  language: string = 'JAVA',
  difficulty: string = 'MEDIUM'
): Promise<CodingChallenge[]> {
  const normLang = normalizeLanguage(language);
  if (!normLang) return [];
  const normDiff = normalizeDifficulty(difficulty);

  try {
    const { data, error } = await supabase
      .from('coding_challenges')
      .select('*')
      .eq('language', normLang)
      .eq('difficulty', normDiff)
      .eq('is_active', true);

    if (!error && data && data.length > 0) {
      return data.map((d: any) => {
        const localMatch = PREBUILT_CHALLENGES.find((p) => p.id === d.id);
        return {
          id: d.id,
          title: d.title,
          description: d.description,
          language: d.language,
          difficulty: d.difficulty,
          code: d.code,
          bugs: localMatch ? localMatch.bugs : (d.bugs || []),
          test_cases: d.test_cases || [],
          is_active: d.is_active,
        };
      });
    }
  } catch (err) {
    console.warn('Supabase query failed, using local prebuilt catalog:', err);
  }

  // Filter local prebuilt dataset
  return PREBUILT_CHALLENGES.filter(
    (c) => c.is_active && c.language === normLang && normalizeDifficulty(c.difficulty) === normDiff
  );
}

/**
 * Selects ONE challenge randomly matching the host settings.
 * Returns error if no challenge is eligible for the selected language / difficulty.
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
    return {
      success: false,
      error: `No coding challenges are currently available for ${normLang} / ${normDiff}.`,
    };
  }

  const selected = eligible[Math.floor(Math.random() * eligible.length)];
  return { success: true, challenge: selected };
}

// ── RANDOM DEVELOPER + ROOM ASSIGNMENT ─────────────────────────────────────

/**
 * Generates unique bug assignments across developers for the 6 facility rooms.
 * 
 * Strict constraints enforced:
 * - ONE shared codebase for all players.
 * - Every developer receives unique bug objectives.
 * - NO two developers receive the same bug objective.
 * - Each developer receives at least 1 objective (subject to available bugs).
 * - All room assignments map to the facility rooms (1 to 6).
 */
export function generateChallengeAssignments(
  challenge: CodingChallenge,
  playerIds: string[]
): Record<string, PlayerObjectiveAssignment[]> {
  const assignments: Record<string, PlayerObjectiveAssignment[]> = {};
  playerIds.forEach((pid) => (assignments[pid] = []));

  const availableBugs = [...challenge.bugs];
  // Shuffle available bugs using Fisher-Yates
  for (let i = availableBugs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableBugs[i], availableBugs[j]] = [availableBugs[j], availableBugs[i]];
  }

  // 1. Give each player at least 1 unique bug first (up to available bugs count)
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

  // 2. Distribute any remaining bugs evenly
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

/**
 * Retrieves the authorized objective for a requesting player in a room.
 * 
 * Security:
 * - If requesting player is not assigned to this room, returns hasAssignment = false.
 * - Never returns other players' assignments.
 * - Never exposes expectedFix, referenceSolution, or complete assignment map.
 */
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
